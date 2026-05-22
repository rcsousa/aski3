import { useCallback, useEffect, useRef, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import {
  Tile,
  Modal,
  Toggle,
  Slider,
  Tag,
  Stack,
} from '@carbon/react';

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

// Color palette from IBM Carbon
const NODE_COLORS: Record<GraphNode['nodeType'], string> = {
  uri: '#0f62fe',     // Carbon Blue 60
  literal: '#24a148', // Carbon Green 40
  blank: '#8d8d8d',   // Carbon Gray 50
};

function classifyNode(value: string): GraphNode['nodeType'] {
  if (value.startsWith('_:')) return 'blank';
  if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('<')) return 'uri';
  return 'literal';
}

function truncateLabel(value: string): string {
  // Remove angle brackets from URIs
  const clean = value.replace(/^<|>$/g, '');

  // If it's a URI, get the local name
  if (clean.startsWith('http://') || clean.startsWith('https://')) {
    const hashIdx = clean.lastIndexOf('#');
    const slashIdx = clean.lastIndexOf('/');
    const splitIdx = Math.max(hashIdx, slashIdx);
    if (splitIdx > -1 && splitIdx < clean.length - 1) {
      return clean.substring(splitIdx + 1);
    }
    // Fallback: take last 20 chars
    return clean.length > 20 ? '...' + clean.slice(-20) : clean;
  }

  // Literals: trim quotes and truncate
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
  const [isModalOpen, setIsModalOpen] = useState(false);

  const graphData = buildGraphData(triples);

  // Measure container width responsively
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

  // Triples for the selected node panel
  const selectedTriples = selectedNode
    ? triples.filter(
        (t) => t.subject === selectedNode.id || t.object === selectedNode.id,
      )
    : [];

  const handleNodeClick = useCallback((node: object) => {
    const gNode = node as GraphNode;
    setSelectedNode(gNode);
    setIsModalOpen(true);
  }, []);

  const nodeCanvasObject = useCallback(
    (node: object, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const gNode = node as GraphNode & { x?: number; y?: number };
      const x = gNode.x ?? 0;
      const y = gNode.y ?? 0;
      const radius = 6;
      const color = NODE_COLORS[gNode.nodeType];

      // Draw node circle
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.6)';
      ctx.lineWidth = 1.5 / globalScale;
      ctx.stroke();

      // Draw label if enabled
      if (showLabels) {
        const fontSize = Math.max(10 / globalScale, 4);
        ctx.font = `${fontSize}px IBM Plex Mono, monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = 'var(--cds-text-primary, #161616)';
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

      // Draw edge line
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(tx, ty);
      ctx.strokeStyle = 'rgba(141,141,141,0.5)';
      ctx.lineWidth = 1 / globalScale;
      ctx.stroke();

      // Draw predicate label at midpoint
      if (showLabels) {
        const mx = (sx + tx) / 2;
        const my = (sy + ty) / 2;
        const fontSize = Math.max(8 / globalScale, 3);
        ctx.font = `italic ${fontSize}px IBM Plex Sans, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = 'rgba(82,82,82,0.85)';
        ctx.fillText(gLink.label, mx, my);
      }
    },
    [showLabels],
  );

  return (
    <Tile>
      <Stack gap={5}>
        {/* Header */}
        {title && (
          <div style={{ borderBottom: '1px solid var(--cds-border-subtle)', paddingBottom: 'var(--cds-spacing-04)' }}>
            <p style={{ fontWeight: 600, fontSize: '1.125rem', margin: 0 }}>{title}</p>
            <p style={{ color: 'var(--cds-text-secondary)', fontSize: '0.875rem', marginTop: 'var(--cds-spacing-02)', margin: 0 }}>
              {graphData.nodes.length} nós · {graphData.links.length} relações
            </p>
          </div>
        )}

        {/* Legend */}
        <div style={{ display: 'flex', gap: 'var(--cds-spacing-03)', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)', fontWeight: 600 }}>Legenda:</span>
          {(['uri', 'literal', 'blank'] as const).map((type) => (
            <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 'var(--cds-spacing-02)' }}>
              <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: '50%', backgroundColor: NODE_COLORS[type] }} />
              <span style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)', textTransform: 'capitalize' }}>
                {type === 'uri' ? 'URI' : type === 'literal' ? 'Literal' : 'Blank Node'}
              </span>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: 'var(--cds-spacing-07)', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <Toggle
            id="kg-show-labels"
            labelText="Rótulos"
            labelA="Ocultar"
            labelB="Exibir"
            toggled={showLabels}
            onToggle={(checked: boolean) => setShowLabels(checked)}
            size="sm"
          />
          <div style={{ minWidth: 200 }}>
            <Slider
              id="kg-link-distance"
              labelText="Distância dos links"
              min={30}
              max={200}
              step={10}
              value={linkDistance}
              onChange={({ value }: { value: number }) => setLinkDistance(value)}
            />
          </div>
        </div>

        {/* Graph Canvas */}
        <div
          ref={containerRef}
          style={{
            border: '1px solid var(--cds-border-subtle)',
            borderRadius: '4px',
            overflow: 'hidden',
            background: 'var(--cds-layer)',
            width: '100%',
          }}
        >
          {graphData.nodes.length === 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, color: 'var(--cds-text-secondary)' }}>
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

        <p style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)', margin: 0 }}>
          Clique em um nó para ver seus detalhes. Arraste para mover. Scroll para zoom.
        </p>
      </Stack>

      {/* Node Detail Modal */}
      <Modal
        open={isModalOpen}
        modalHeading={selectedNode ? `Nó: ${selectedNode.label}` : ''}
        passiveModal
        onRequestClose={() => setIsModalOpen(false)}
        size="md"
      >
        {selectedNode && (
          <Stack gap={4}>
            <div style={{ display: 'flex', gap: 'var(--cds-spacing-02)', flexWrap: 'wrap' }}>
              <Tag type={
                selectedNode.nodeType === 'uri' ? 'blue' :
                selectedNode.nodeType === 'literal' ? 'green' : 'gray'
              } size="sm">
                {selectedNode.nodeType === 'uri' ? 'URI' : selectedNode.nodeType === 'literal' ? 'Literal' : 'Blank Node'}
              </Tag>
            </div>

            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)', marginBottom: 'var(--cds-spacing-02)', fontWeight: 600 }}>
                Identificador completo
              </p>
              <code style={{
                display: 'block',
                padding: 'var(--cds-spacing-03)',
                background: 'var(--cds-layer-accent)',
                borderRadius: '4px',
                fontSize: '0.8125rem',
                wordBreak: 'break-all',
                fontFamily: 'IBM Plex Mono, monospace',
              }}>
                {selectedNode.id}
              </code>
            </div>

            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)', marginBottom: 'var(--cds-spacing-03)', fontWeight: 600 }}>
                Triplas relacionadas ({selectedTriples.length})
              </p>
              <Stack gap={3}>
                {selectedTriples.map((triple, idx) => (
                  <div key={idx} style={{
                    padding: 'var(--cds-spacing-03)',
                    background: 'var(--cds-layer)',
                    border: '1px solid var(--cds-border-subtle)',
                    borderRadius: '4px',
                    fontSize: '0.8125rem',
                  }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr', gap: 'var(--cds-spacing-02)', alignItems: 'baseline' }}>
                      <span style={{ color: 'var(--cds-text-secondary)', fontWeight: 600 }}>S:</span>
                      <code style={{ fontFamily: 'IBM Plex Mono, monospace', wordBreak: 'break-all', color: triple.subject === selectedNode.id ? NODE_COLORS.uri : 'inherit' }}>
                        {truncateLabel(triple.subject)}
                      </code>
                      <span style={{ color: 'var(--cds-text-secondary)', fontWeight: 600 }}>P:</span>
                      <code style={{ fontFamily: 'IBM Plex Mono, monospace', wordBreak: 'break-all', color: 'var(--cds-support-warning)' }}>
                        {truncateLabel(triple.predicate)}
                      </code>
                      <span style={{ color: 'var(--cds-text-secondary)', fontWeight: 600 }}>O:</span>
                      <code style={{ fontFamily: 'IBM Plex Mono, monospace', wordBreak: 'break-all', color: triple.object === selectedNode.id ? NODE_COLORS.uri : 'inherit' }}>
                        {truncateLabel(triple.object)}
                      </code>
                    </div>
                  </div>
                ))}
              </Stack>
            </div>
          </Stack>
        )}
      </Modal>
    </Tile>
  );
}
