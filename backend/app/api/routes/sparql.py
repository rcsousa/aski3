"""
POST /sparql  — SPARQL SELECT query proxy over an rdflib in-memory graph.

* Accepts an optional `graph_ttl` (Turtle) to query against.
* Falls back to the course KG when `graph_ttl` is omitted.
* Malformed SPARQL or parsing errors return a 400 with { "error": "..." }.
* Queries are subject to a 5-second timeout enforced via threading.
"""

from __future__ import annotations

import concurrent.futures
import logging
from typing import Any

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from rdflib import Graph
from rdflib.exceptions import ParserError
from rdflib.plugins.sparql.parser import parseQuery
from rdflib.plugins.sparql.processor import SPARQLProcessor

from app.services.course_kg import build_course_kg

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/sparql", tags=["sparql"])

SPARQL_TIMEOUT_S = 5.0

# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------


class SparqlRequest(BaseModel):
    query: str
    graph_ttl: str | None = None


class SparqlResponse(BaseModel):
    columns: list[str]
    rows: list[list[str]]
    count: int


class SparqlErrorResponse(BaseModel):
    error: str


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _parse_graph(graph_ttl: str) -> Graph:
    """Parse Turtle text into an rdflib Graph; raise ValueError on failure."""
    g = Graph()
    try:
        g.parse(data=graph_ttl, format="turtle")
    except (ParserError, Exception) as exc:
        raise ValueError(f"Failed to parse Turtle graph: {exc}") from exc
    return g


def _run_sparql(g: Graph, sparql_query: str) -> dict[str, Any]:
    """
    Execute a SPARQL SELECT query against graph `g`.

    Returns {"columns": [...], "rows": [...], "count": int}.
    Raises ValueError for bad SPARQL.
    """
    # Validate query structure first (fast, no execution)
    try:
        parseQuery(sparql_query)
    except Exception as exc:
        raise ValueError(f"Invalid SPARQL query: {exc}") from exc

    try:
        results = g.query(sparql_query)
    except Exception as exc:
        raise ValueError(f"SPARQL execution error: {exc}") from exc

    if results.vars is None:
        raise ValueError("Only SELECT queries are supported")

    columns: list[str] = [str(v) for v in results.vars]
    rows: list[list[str]] = []

    for row in results:
        rows.append(
            [str(row[v]) if row[v] is not None else "" for v in results.vars]
        )

    return {"columns": columns, "rows": rows, "count": len(rows)}


# ---------------------------------------------------------------------------
# Endpoint
# ---------------------------------------------------------------------------


@router.post(
    "",
    responses={
        200: {"model": SparqlResponse},
        400: {"model": SparqlErrorResponse},
    },
)
async def run_sparql_query(request: SparqlRequest):
    """
    Execute a SPARQL SELECT query and return columns + rows.

    Supply `graph_ttl` to query an arbitrary Turtle graph, or omit it to
    query the course knowledge graph.
    """
    # Resolve graph
    if request.graph_ttl:
        try:
            g = _parse_graph(request.graph_ttl)
        except ValueError as exc:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"error": str(exc)},
            )
    else:
        g = build_course_kg()

    # Run with timeout using a thread-pool executor
    loop_executor = concurrent.futures.ThreadPoolExecutor(max_workers=1)
    future = loop_executor.submit(_run_sparql, g, request.query)

    try:
        result = future.result(timeout=SPARQL_TIMEOUT_S)
    except concurrent.futures.TimeoutError:
        future.cancel()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": f"SPARQL query timed out after {SPARQL_TIMEOUT_S}s"},
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": str(exc)},
        )
    except Exception as exc:
        logger.exception("Unexpected SPARQL error")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": f"Unexpected error: {exc}"},
        )
    finally:
        loop_executor.shutdown(wait=False)

    return SparqlResponse(**result)
