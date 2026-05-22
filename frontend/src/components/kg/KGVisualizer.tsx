import { useCallback, useEffect, useRef, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Badge } from '../ui/badge';

interface Triple {
  subject: string;
  predicate: string;
  object: string;
}

interface KGVisualizerProps {
  triples: Triple[];
  title?: string;
}

interface GraphNode {
  id: string;
  label: string;
  nodeType: 'uri' | 'literal' | 'blank';
}

interface GraphLink {
  source: string;
  target: string;
  label: string;
}

interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

const NODE_COLORS: Record<GraphNode['nodeType'], string> = {
  uri: '#6366f1',     // indigo-500
  literal: '#22c55e', // green-500
  blank: '#94a3b8',   // slate-400
};

function classifyNode(value: string): GraphNode['nodeType'] {
  if (value.startsWith('_:')) return 'blank';
  if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('<')) return 'uri';
  return 'literal';
}

function truncateLabel(value: string): string {
  const clean = value.replace(/^<|>$/g, '');

  if (clean.startsWith('http://') || clean.startsWith('https://')) {
    const hashIdx = clean.lastIndexOf('#');
    const slashIdx = clean.lastIndexOf('/');
    const splitIdx = Math.max(hashIdx, slashIdx);
    if (splitIdx > -1 && splitIdx < clean.length - 1) {
      return clean.substring(splitIdx + 1);
    }
    return clean.length > 20 ? '...' + clean.slice(-20) : clean;
  }

  const stripped = clean.replace(/^"|"$|^'|'$/g, '');
  return stripped.length > 30 ? stripped.substring(0, 27) + '...' : stripped;
}

function buildGraphData(triples: Triple[]): GraphData {
  const nodeMap = new Map<string, GraphNode>();
  const links: GraphLink[] = [];

  const ensureNode = (value: string) => {
    if (!nodeMap.has(value)) {
      nodeMap.set(value, {
        id: value,
        label: truncateLabel(value),
        nodeType: classifyNode(value),
      });
    }
  };

  for (const triple of triples) {
    ensureNode(triple.subject);
    ensureNode(triple.object);
    links.push({
      source: triple.subject,
      target: triple.object,
      label: truncateLabel(triple.predicate),
    });
  }

  return {
    nodes: Array.from(nodeMap.values()),
    links,
  };
}

export function KGVisualizer({ triples, title }: KGVisualizerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });
  const [showLabels, setShowLabels] = useState(true);
  const [linkDistance, setLinkDistance] = useState(80);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  const graphData = buildGraphData(triples);

  useEffect(() => {
    const measure = () => {
      if (containerRef.current) {
        const w = containerRef.current.clientWidth;
        setDimensions({ width: w, height: Math.min(500, Math.max(300, w * 0.55)) });
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const selectedTriples = selectedNode
    ? triples.filter(
        (t) => t.subject === selectedNode.id || t.object === selectedNode.id,
      )
    : [];

  const handleNodeClick = useCallback((node: object) => {
    const gNode = node as GraphNode;
    setSelectedNode((prev) => (prev?.id === gNode.id ? null : gNode));
  }, []);

  const nodeCanvasObject = useCallback(
    (node: object, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const gNode = node as GraphNode & { x?: number; y?: number };
      const x = gNode.x ?? 0;
      const y = gNode.y ?? 0;
      const radius = 6;
      const color = NODE_COLORS[gNode.nodeType];

      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.6)';
      ctx.lineWidth = 1.5 / globalScale;
      ctx.stroke();

      if (showLabels) {
        const fontSize = Math.max(10 / globalScale, 4);
        ctx.font = `${fontSize}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#1e293b';
        ctx.fillText(gNode.label, x, y + radius + fontSize);
      }
    },
    [showLabels],
  );

  const linkCanvasObject = useCallback(
    (link: object, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const gLink = link as GraphLink & {
        source: { x?: number; y?: number };
        target: { x?: number; y?: number };
      };

      const sx = gLink.source.x ?? 0;
      const sy = gLink.source.y ?? 0;
      const tx = gLink.target.x ?? 0;
      const ty = gLink.target.y ?? 0;

      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(tx, ty);
      ctx.strokeStyle = 'rgba(148,163,184,0.5)';
      ctx.lineWidth = 1 / globalScale;
      ctx.stroke();

      if (showLabels) {
        const mx = (sx + tx) / 2;
        const my = (sy + ty) / 2;
        const fontSize = Math.max(8 / globalScale, 3);
        ctx.font = `italic ${fontSize}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = 'rgba(100,116,139,0.85)';
        ctx.fillText(gLink.label, mx, my);
      }
    },
    [showLabels],
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        {title && (
          <div>
            <p className="font-semibold text-lg">{title}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {graphData.nodes.length} nós · {graphData.links.length} relações
            </p>
          </div>
        )}

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 mt-2">
          <span className="text-xs font-semibold text-muted-foreground">Legenda:</span>
          {(['uri', 'literal', 'blank'] as const).map((type) => (
            <div key={type} className="flex items-center gap-1.5">
              <span
                className="inline-block h-3 w-3 rounded-full"
                style={{ backgroundColor: NODE_COLORS[type] }}
              />
              <span className="text-xs text-muted-foreground capitalize">
                {type === 'uri' ? 'URI' : type === 'literal' ? 'Literal' : 'Blank Node'}
              </span>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-4 mt-3">
          <label className="flex items-center gap-2 cursor-pointer text-sm">
            <input
              type="checkbox"
              checked={showLabels}
              onChange={(e) => setShowLabels(e.target.checked)}
              className="accent-primary"
            />
            Exibir rótulos
          </label>

          <div className="flex items-center gap-2 text-sm">
            <label htmlFor="kg-link-distance" className="text-muted-foreground whitespace-nowrap">
              Distância:
            </label>
            <input
              id="kg-link-distance"
              type="range"
              min={30}
              max={200}
              step={10}
              value={linkDistance}
              onChange={(e) => setLinkDistance(Number(e.target.value))}
              className="w-28 accent-primary"
            />
            <span className="text-xs text-muted-foreground w-6">{linkDistance}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-0">
        {/* Graph canvas */}
        <div
          ref={containerRef}
          className="rounded-lg border overflow-hidden bg-slate-50 w-full"
        >
          {graphData.nodes.length === 0 ? (
            <div className="flex items-center justify-center h-72 text-muted-foreground text-sm">
              Nenhum dado de grafo disponível.
            </div>
          ) : (
            <ForceGraph2D
              graphData={graphData}
              width={dimensions.width}
              height={dimensions.height}
              nodeCanvasObject={nodeCanvasObject}
              nodeCanvasObjectMode={() => 'replace'}
              linkCanvasObject={linkCanvasObject}
              linkCanvasObjectMode={() => 'replace'}
              onNodeClick={handleNodeClick}
              d3VelocityDecay={0.3}
              cooldownTicks={100}
              nodePointerAreaPaint={(node: object, color: string, ctx: CanvasRenderingContext2D) => {
                const gNode = node as GraphNode & { x?: number; y?: number };
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(gNode.x ?? 0, gNode.y ?? 0, 8, 0, 2 * Math.PI);
                ctx.fill();
              }}
            />
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          Clique em um nó para ver seus detalhes. Arraste para mover. Scroll para zoom.
        </p>

        {/* Selected node detail panel */}
        {selectedNode && (
          <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-sm">Nó: {selectedNode.label}</p>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                fechar ×
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              <Badge
                variant={
                  selectedNode.nodeType === 'uri'
                    ? 'default'
                    : selectedNode.nodeType === 'literal'
                    ? 'success'
                    : 'secondary'
                }
              >
                {selectedNode.nodeType === 'uri' ? 'URI' : selectedNode.nodeType === 'literal' ? 'Literal' : 'Blank Node'}
              </Badge>
            </div>

            <div>
              <p className="text-xs text-muted-foreground font-semibold mb-1">Identificador completo</p>
              <code className="block bg-background border rounded p-2 text-xs break-all font-mono">
                {selectedNode.id}
              </code>
            </div>

            {selectedTriples.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground font-semibold mb-2">
                  Triplas relacionadas ({selectedTriples.length})
                </p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selectedTriples.map((triple, idx) => (
                    <div key={idx} className="bg-background border rounded p-2 text-xs font-mono space-y-0.5">
                      <div className="grid grid-cols-[1.5rem_1fr] gap-1">
                        <span className="text-muted-foreground font-semibold">S:</span>
                        <code
                          className="break-all"
                          style={{ color: triple.subject === selectedNode.id ? NODE_COLORS.uri : undefined }}
                        >
                          {truncateLabel(triple.subject)}
                        </code>
                        <span className="text-muted-foreground font-semibold">P:</span>
                        <code className="break-all text-amber-600">{truncateLabel(triple.predicate)}</code>
                        <span className="text-muted-foreground font-semibold">O:</span>
                        <code
                          className="break-all"
                          style={{ color: triple.object === selectedNode.id ? NODE_COLORS.uri : undefined }}
                        >
                          {truncateLabel(triple.object)}
                        </code>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
