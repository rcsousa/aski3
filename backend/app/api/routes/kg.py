"""
Knowledge-graph inspection endpoints.

GET /kg/course  — course KG serialised as Turtle (text/plain)
GET /kg/stats   — { nodes, edges, classes, individuals }
"""

from __future__ import annotations

from fastapi import APIRouter
from fastapi.responses import PlainTextResponse
from rdflib.namespace import OWL, RDF

from app.services.course_kg import build_course_kg, get_course_kg_turtle

router = APIRouter(prefix="/kg", tags=["knowledge-graph"])


@router.get("/course", response_class=PlainTextResponse)
async def get_course_kg() -> str:
    """Return the course knowledge graph serialised as Turtle."""
    return get_course_kg_turtle()


@router.get("/stats")
async def get_kg_stats() -> dict:
    """
    Return high-level statistics about the course knowledge graph.

    * **nodes**       — unique subjects or objects that are URIs (named entities)
    * **edges**       — total number of triples
    * **classes**     — number of OWL classes declared in the graph
    * **individuals** — number of triples typed to a non-OWL, non-RDF class
                        (i.e. course-domain instances)
    """
    g = build_course_kg()

    # All named (URI) nodes appearing anywhere in the graph
    named_nodes: set = set()
    for s, _p, o in g:
        from rdflib import URIRef  # local import to avoid circular issues
        if isinstance(s, URIRef):
            named_nodes.add(s)
        if isinstance(o, URIRef):
            named_nodes.add(o)

    edges = len(g)

    # OWL classes
    classes = set(g.subjects(RDF.type, OWL.Class))

    # Individuals: subjects that have rdf:type pointing to something that is
    # not owl:Class, owl:ObjectProperty, rdf:Property — i.e. domain instances.
    skip_types = {OWL.Class, OWL.ObjectProperty, RDF.Property}
    individuals: set = set()
    for s, _p, o in g.triples((None, RDF.type, None)):
        if o not in skip_types and o != OWL.NamedIndividual:
            from rdflib import URIRef
            if isinstance(s, URIRef):
                individuals.add(s)

    return {
        "nodes": len(named_nodes),
        "edges": edges,
        "classes": len(classes),
        "individuals": len(individuals),
    }
