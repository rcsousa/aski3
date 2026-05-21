import { useState } from 'react';
import {
  Button,
  TextArea,
  Select,
  SelectItem,
  InlineLoading,
  InlineNotification,
  DataTable,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  Tile,
  Stack,
  CopyButton,
} from '@carbon/react';
import { Play } from '@carbon/icons-react';
import { api } from '../../stores/authStore';

interface SPARQLResult {
  columns: string[];
  rows: string[][];
}

interface PresetQuery {
  label: string;
  query: string;
}

const PRESET_QUERIES: PresetQuery[] = [
  {
    label: 'Todas as classes',
    query: 'SELECT DISTINCT ?class WHERE { ?s a ?class } LIMIT 20',
  },
  {
    label: 'Todos os indivíduos',
    query: 'SELECT ?s ?type WHERE { ?s a ?type . FILTER(!isBlank(?s)) } LIMIT 20',
  },
  {
    label: 'Propriedades usadas',
    query:
      'SELECT DISTINCT ?p (COUNT(?s) as ?count) WHERE { ?s ?p ?o } GROUP BY ?p ORDER BY DESC(?count) LIMIT 20',
  },
];

interface SPARQLPlaygroundProps {
  defaultQuery?: string;
  endpoint?: string;
}

export function SPARQLPlayground({ defaultQuery, endpoint: _endpoint }: SPARQLPlaygroundProps) {
  const [query, setQuery] = useState<string>(defaultQuery ?? PRESET_QUERIES[0].query);
  const [result, setResult] = useState<SPARQLResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<string>('0');
  const [copyFeedback, setCopyFeedback] = useState(false);

  const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const idx = parseInt(e.target.value, 10);
    setSelectedPreset(e.target.value);
    if (!isNaN(idx) && idx >= 0 && idx < PRESET_QUERIES.length) {
      setQuery(PRESET_QUERIES[idx].query);
      setResult(null);
      setError(null);
    }
  };

  const handleExecute = async () => {
    if (!query.trim()) {
      setError('Por favor, insira uma query SPARQL antes de executar.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const { data } = await api.post<SPARQLResult>('/sparql', { query });
      setResult(data);
    } catch {
      setError('Falha ao executar a query SPARQL. Verifique a sintaxe e tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(query).then(() => {
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    });
  };

  // Build DataTable rows from result
  const tableHeaders = result
    ? result.columns.map((col) => ({ key: col, header: col }))
    : [];

  const tableRows = result
    ? result.rows.map((row, idx) => {
        const rowObj: Record<string, string> = { id: String(idx) };
        result.columns.forEach((col, colIdx) => {
          rowObj[col] = row[colIdx] ?? '';
        });
        return rowObj;
      })
    : [];

  return (
    <Tile>
      <Stack gap={6}>
        {/* Header */}
        <div>
          <p style={{ fontWeight: 700, fontSize: '1.125rem', margin: 0, marginBottom: 'var(--cds-spacing-02)' }}>
            SPARQL Playground
          </p>
          <p style={{ color: 'var(--cds-text-secondary)', fontSize: '0.875rem', margin: 0 }}>
            Escreva e execute queries SPARQL contra o grafo de conhecimento do curso.
          </p>
        </div>

        {/* Preset Query Selector */}
        <Select
          id="sparql-preset"
          labelText="Queries de exemplo"
          value={selectedPreset}
          onChange={handlePresetChange}
        >
          {PRESET_QUERIES.map((preset, idx) => (
            <SelectItem key={idx} value={String(idx)} text={preset.label} />
          ))}
          <SelectItem value="-1" text="— Query personalizada —" />
        </Select>

        {/* Query Editor */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--cds-spacing-02)' }}>
            <label
              htmlFor="sparql-query-textarea"
              style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--cds-text-primary)' }}
            >
              Query SPARQL
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--cds-spacing-02)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)' }}>
                {copyFeedback ? 'Copiado!' : 'Copiar query'}
              </span>
              <CopyButton
                onClick={handleCopy}
                feedback="Copiado!"
                feedbackTimeout={2000}
              />
            </div>
          </div>
          <TextArea
            id="sparql-query-textarea"
            labelText=""
            value={query}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
              setQuery(e.target.value);
              setSelectedPreset('-1');
            }}
            rows={8}
            style={{ fontFamily: 'IBM Plex Mono, "Courier New", monospace', fontSize: '0.875rem' }}
            placeholder="SELECT ?s ?p ?o WHERE { ?s ?p ?o } LIMIT 10"
          />
        </div>

        {/* Execute Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--cds-spacing-04)' }}>
          {isLoading ? (
            <InlineLoading description="Executando query..." status="active" />
          ) : (
            <Button
              kind="primary"
              renderIcon={Play}
              onClick={handleExecute}
              size="md"
            >
              Executar Query
            </Button>
          )}
        </div>

        {/* Error */}
        {error && (
          <InlineNotification
            kind="error"
            title="Erro na query"
            subtitle={error}
            onCloseButtonClick={() => setError(null)}
          />
        )}

        {/* Results Table */}
        {result && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--cds-spacing-03)', marginBottom: 'var(--cds-spacing-04)' }}>
              <p style={{ fontWeight: 600, fontSize: '0.875rem', margin: 0 }}>Resultados</p>
              <span style={{
                background: 'var(--cds-layer-accent)',
                color: 'var(--cds-text-secondary)',
                borderRadius: '10px',
                padding: '2px 10px',
                fontSize: '0.75rem',
                fontWeight: 600,
              }}>
                {result.rows.length} linha{result.rows.length !== 1 ? 's' : ''}
              </span>
            </div>

            {result.rows.length === 0 ? (
              <div style={{
                padding: 'var(--cds-spacing-07)',
                textAlign: 'center',
                color: 'var(--cds-text-secondary)',
                background: 'var(--cds-layer)',
                border: '1px solid var(--cds-border-subtle)',
                borderRadius: '4px',
              }}>
                Nenhum resultado encontrado para esta query.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <DataTable rows={tableRows} headers={tableHeaders}>
                  {({
                    rows,
                    headers,
                    getTableProps,
                    getHeaderProps,
                    getRowProps,
                  }: {
                    rows: Array<{ id: string; cells: Array<{ id: string; value: string }> }>;
                    headers: Array<{ key: string; header: string }>;
                    getTableProps: () => Record<string, unknown>;
                    getHeaderProps: (args: { header: { key: string; header: string } }) => Record<string, unknown>;
                    getRowProps: (args: { row: { id: string; cells: Array<{ id: string; value: string }> } }) => Record<string, unknown>;
                  }) => (
                    <TableContainer>
                      <Table {...getTableProps()} size="sm">
                        <TableHead>
                          <TableRow>
                            {headers.map((header) => (
                              <TableHeader key={header.key} {...getHeaderProps({ header })}>
                                {header.header}
                              </TableHeader>
                            ))}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {rows.map((row) => (
                            <TableRow key={row.id} {...getRowProps({ row })}>
                              {row.cells.map((cell) => (
                                <TableCell key={cell.id}>
                                  <code style={{
                                    fontFamily: 'IBM Plex Mono, monospace',
                                    fontSize: '0.8125rem',
                                    wordBreak: 'break-all',
                                  }}>
                                    {cell.value}
                                  </code>
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </DataTable>
              </div>
            )}
          </div>
        )}
      </Stack>
    </Tile>
  );
}
