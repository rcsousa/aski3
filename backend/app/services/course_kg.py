"""
Service that builds a knowledge graph of the course content from JSON fixtures.

The KG represents modules, sections, semantic concepts and prerequisite chains
using the namespace https://semantica.curso/ontology#
"""

from __future__ import annotations

import json
import logging
import re
from pathlib import Path

from rdflib import Graph, Literal, Namespace, URIRef
from rdflib.namespace import RDF, RDFS, OWL

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Namespace & paths
# ---------------------------------------------------------------------------

ONTO = Namespace("https://semantica.curso/ontology#")
CONTENT_DIR = Path("/home/user/aski3/backend/content/modules")

# Module-level cache: None means "not yet built", str = Turtle serialisation
_cached_ttl: str | None = None
_cached_graph: Graph | None = None


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

_STOP_WORDS: frozenset[str] = frozenset(
    {
        "e", "de", "do", "da", "dos", "das", "em", "a", "o", "os", "as",
        "para", "por", "com", "vs", "que", "se", "na", "no", "um", "uma",
        "por", "mas", "ou",
    }
)

_CONCEPT_WORD_RE = re.compile(r"[A-Za-zÀ-ÖØ-öø-ÿ]{4,}")
# Matches digit sequences so we can preserve numbers in IDs
_DIGIT_RE = re.compile(r"\d+")


def _safe_id(text: str) -> str:
    """
    Turn arbitrary text into a URI-safe identifier.

    Preserves embedded digit sequences so that "module-01" and "module-02"
    yield distinct identifiers ("Module01" vs "Module02").
    """
    # Replace separators with spaces, then split into tokens
    normalised = re.sub(r"[-_/\\.]", " ", text)
    tokens = normalised.split()
    parts: list[str] = []
    for token in tokens:
        # Check if the token is purely numeric — keep it as-is
        if token.isdigit():
            parts.append(token)
            continue
        # Extract alphabetic words from the token
        words = _CONCEPT_WORD_RE.findall(token)
        for w in words:
            if w.lower() not in _STOP_WORDS:
                parts.append(w.capitalize())
        # If the token contained digits mixed with letters, extract them too
        for d in _DIGIT_RE.findall(token):
            parts.append(d)
    return "".join(parts) or "Unknown"


def _extract_concepts(title: str) -> list[str]:
    """Return a list of concept labels inferred from section title keywords."""
    words = _CONCEPT_WORD_RE.findall(title)
    return [w for w in words if w.lower() not in _STOP_WORDS and len(w) >= 4]


# ---------------------------------------------------------------------------
# Builder
# ---------------------------------------------------------------------------

def build_course_kg() -> Graph:
    """
    Build (or return cached) an rdflib Graph populated from all module_XX/content.json
    files under CONTENT_DIR.

    Structure added per module:
      :ModuleX  rdf:type         :CourseModule
      :ModuleX  rdfs:label       "title"
      :ModuleX  :hasSection      :SectionY

    Per section:
      :SectionY rdf:type         :CourseSection
      :SectionY rdfs:label       "title"
      :SectionY :teaches         :Concept
      :SectionY :prerequisite    :PreviousSection   (ordered chain within module)

    Per concept:
      :Concept  rdf:type         :SemanticConcept
      :Concept  rdfs:label       "word"
    """
    global _cached_graph, _cached_ttl

    if _cached_graph is not None:
        return _cached_graph

    g = Graph()
    g.bind("onto", ONTO)
    g.bind("rdf", RDF)
    g.bind("rdfs", RDFS)
    g.bind("owl", OWL)

    # Declare top-level classes
    for cls_name in ("CourseModule", "CourseSection", "SemanticConcept"):
        cls_uri = ONTO[cls_name]
        g.add((cls_uri, RDF.type, OWL.Class))
        g.add((cls_uri, RDFS.label, Literal(cls_name)))

    # Declare properties
    for prop_name in ("hasSection", "teaches", "prerequisite"):
        prop_uri = ONTO[prop_name]
        g.add((prop_uri, RDF.type, OWL.ObjectProperty))

    if not CONTENT_DIR.exists():
        logger.warning("Content directory %s does not exist; returning empty KG", CONTENT_DIR)
        _cached_graph = g
        _cached_ttl = g.serialize(format="turtle")
        return g

    module_dirs = sorted(CONTENT_DIR.glob("module_*/"))
    known_concepts: dict[str, URIRef] = {}  # label -> URI, de-duplication

    for module_dir in module_dirs:
        content_file = module_dir / "content.json"
        if not content_file.exists():
            continue

        try:
            data = json.loads(content_file.read_text(encoding="utf-8"))
        except Exception:
            logger.exception("Failed to parse %s", content_file)
            continue

        # Module node
        module_id_raw = data.get("id", module_dir.name)  # e.g. "module-01"
        module_label = data.get("title", module_id_raw)
        module_uri = ONTO[_safe_id(module_id_raw)]

        g.add((module_uri, RDF.type, ONTO.CourseModule))
        g.add((module_uri, RDFS.label, Literal(module_label, lang="pt")))

        # Sections
        sections = data.get("sections", [])
        prev_section_uri: URIRef | None = None

        for section_data in sections:
            sec_id_raw = section_data.get("id", f"{module_id_raw}-sec")
            sec_title = section_data.get("title", sec_id_raw)
            section_uri = ONTO[_safe_id(sec_id_raw)]

            g.add((section_uri, RDF.type, ONTO.CourseSection))
            g.add((section_uri, RDFS.label, Literal(sec_title, lang="pt")))

            # Link module -> section
            g.add((module_uri, ONTO.hasSection, section_uri))

            # Ordered prerequisite chain within the module
            if prev_section_uri is not None:
                g.add((section_uri, ONTO.prerequisite, prev_section_uri))
            prev_section_uri = section_uri

            # Concepts from title keywords
            for word in _extract_concepts(sec_title):
                word_cap = word.capitalize()
                if word_cap not in known_concepts:
                    concept_uri = ONTO[f"Concept{_safe_id(word)}"]
                    known_concepts[word_cap] = concept_uri
                    g.add((concept_uri, RDF.type, ONTO.SemanticConcept))
                    g.add((concept_uri, RDFS.label, Literal(word_cap)))
                g.add((section_uri, ONTO.teaches, known_concepts[word_cap]))

    _cached_graph = g
    _cached_ttl = g.serialize(format="turtle")
    logger.info("Course KG built: %d triples", len(g))
    return g


def get_course_kg_turtle() -> str:
    """Return the course KG serialised as Turtle (cached)."""
    global _cached_ttl
    if _cached_ttl is None:
        build_course_kg()
    return _cached_ttl  # type: ignore[return-value]
