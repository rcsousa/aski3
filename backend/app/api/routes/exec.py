"""
POST /exec  — sandboxed Python execution endpoint.

Security model
--------------
* Only `language == "python"` is accepted.
* A regex-based blocklist rejects code that imports or uses dangerous modules /
  built-ins before the subprocess is ever spawned.
* The code is written to a named temp file with a `.py` suffix and deleted
  immediately after execution — avoids shell-injection via the `-c` flag.
* Subprocess timeout is 10 seconds.
* stdout + stderr are each capped at 10 KB.
"""

from __future__ import annotations

import re
import subprocess
import tempfile
import time
from pathlib import Path

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, field_validator

router = APIRouter(prefix="/exec", tags=["exec"])

# ---------------------------------------------------------------------------
# Schema
# ---------------------------------------------------------------------------

MAX_OUTPUT_BYTES = 10 * 1024  # 10 KB
EXEC_TIMEOUT_S = 10


class ExecRequest(BaseModel):
    code: str
    language: str

    @field_validator("language")
    @classmethod
    def language_must_be_python(cls, v: str) -> str:
        if v.strip().lower() != "python":
            raise ValueError("Only 'python' is supported")
        return v.strip().lower()

    @field_validator("code")
    @classmethod
    def code_must_not_be_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("code must not be empty")
        return v


class ExecResponse(BaseModel):
    stdout: str
    stderr: str
    success: bool
    duration_ms: int


# ---------------------------------------------------------------------------
# Security: blocklist patterns
# ---------------------------------------------------------------------------

# These patterns are checked against the submitted code *before* execution.
# Any match causes an immediate 400 response.
_BLOCKED_PATTERNS: list[re.Pattern[str]] = [
    re.compile(r"\bimport\s+os\b"),
    re.compile(r"\bimport\s+sys\b"),
    re.compile(r"\bimport\s+subprocess\b"),
    re.compile(r"\bimport\s+socket\b"),
    re.compile(r"\bimport\s+requests\b"),
    re.compile(r"\bimport\s+shutil\b"),
    re.compile(r"\bimport\s+pathlib\b"),
    re.compile(r"\bimport\s+glob\b"),
    re.compile(r"\bimport\s+importlib\b"),
    re.compile(r"\bfrom\s+os\b"),
    re.compile(r"\bfrom\s+sys\b"),
    re.compile(r"\bfrom\s+subprocess\b"),
    re.compile(r"\bfrom\s+socket\b"),
    re.compile(r"\bfrom\s+requests\b"),
    re.compile(r"\bfrom\s+shutil\b"),
    re.compile(r"\bfrom\s+pathlib\b"),
    re.compile(r"\bopen\s*\("),
    re.compile(r"\b__import__\s*\("),
    re.compile(r"\beval\s*\("),
    re.compile(r"\bexec\s*\("),
    re.compile(r"\bcompile\s*\("),
    re.compile(r"\bos\."),
    re.compile(r"\bsys\."),
    re.compile(r"\bshutil\."),
    re.compile(r"\bgetattr\s*\("),
    re.compile(r"\bsetattr\s*\("),
    re.compile(r"\bdelattr\s*\("),
    re.compile(r"\b__builtins__\b"),
    re.compile(r"\b__class__\b"),
    re.compile(r"\b__subclasses__\s*\("),
    re.compile(r"\b__globals__\b"),
    re.compile(r"\b__code__\b"),
    re.compile(r"\bctypes\b"),
    re.compile(r"\bmultiprocessing\b"),
    re.compile(r"\bthreading\b"),
    re.compile(r"\basyncio\b"),
    re.compile(r"\bpickle\b"),
    re.compile(r"\bshelve\b"),
    re.compile(r"\bmarshal\b"),
    re.compile(r"\bpty\b"),
    re.compile(r"\bpty\."),
    re.compile(r"\bfcntl\b"),
    re.compile(r"\bsignal\b"),
    re.compile(r"\bresource\b"),
]


def _security_check(code: str) -> str | None:
    """
    Return the description of the first blocked pattern found, or None if
    the code passes all security checks.
    """
    for pattern in _BLOCKED_PATTERNS:
        if pattern.search(code):
            return f"Blocked pattern detected: `{pattern.pattern}`"
    return None


# ---------------------------------------------------------------------------
# Endpoint
# ---------------------------------------------------------------------------

@router.post("", response_model=ExecResponse)
async def execute_code(request: ExecRequest) -> ExecResponse:
    """
    Execute a Python snippet in a sandboxed subprocess.

    Allowed libraries: rdflib, owlready2, json, re, math, datetime,
    collections, itertools, functools, typing, and the Python standard library
    modules not on the blocklist.
    """
    violation = _security_check(request.code)
    if violation:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Security violation: {violation}",
        )

    tmp_path: Path | None = None
    try:
        # Write code to a temp file so we never pass user content through
        # shell argument quoting.
        with tempfile.NamedTemporaryFile(
            mode="w",
            suffix=".py",
            encoding="utf-8",
            delete=False,
        ) as tmp:
            tmp.write(request.code)
            tmp_path = Path(tmp.name)

        start_ns = time.perf_counter_ns()
        try:
            proc = subprocess.run(
                ["python3", str(tmp_path)],
                capture_output=True,
                text=True,
                timeout=EXEC_TIMEOUT_S,
                env={
                    "PATH": "/usr/local/bin:/usr/bin:/bin",
                    "HOME": "/tmp",
                    "PYTHONPATH": "",
                    "PYTHONDONTWRITEBYTECODE": "1",
                    "PYTHONIOENCODING": "utf-8",
                },
            )
            elapsed_ms = (time.perf_counter_ns() - start_ns) // 1_000_000

            stdout = proc.stdout[:MAX_OUTPUT_BYTES]
            stderr = proc.stderr[:MAX_OUTPUT_BYTES]

            if len(proc.stdout) > MAX_OUTPUT_BYTES:
                stdout += "\n[output truncated at 10 KB]"
            if len(proc.stderr) > MAX_OUTPUT_BYTES:
                stderr += "\n[stderr truncated at 10 KB]"

            return ExecResponse(
                stdout=stdout,
                stderr=stderr,
                success=(proc.returncode == 0),
                duration_ms=int(elapsed_ms),
            )

        except subprocess.TimeoutExpired:
            elapsed_ms = (time.perf_counter_ns() - start_ns) // 1_000_000
            return ExecResponse(
                stdout="",
                stderr=f"Execution timed out after {EXEC_TIMEOUT_S} seconds.",
                success=False,
                duration_ms=int(elapsed_ms),
            )

    finally:
        if tmp_path and tmp_path.exists():
            tmp_path.unlink(missing_ok=True)
