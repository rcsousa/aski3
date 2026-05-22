import { useState } from 'react';
import { Play, Copy, Check } from 'lucide-react';
import { api } from '../../stores/authStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';

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
  const [copied, setCopied] = useState(false);

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
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>SPARQL Playground</CardTitle>
        <CardDescription>
          Escreva e execute queries SPARQL contra o grafo de conhecimento do curso.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Preset selector */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="sparql-preset">
            Queries de exemplo
          </label>
          <select
            id="sparql-preset"
            value={selectedPreset}
            onChange={handlePresetChange}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {PRESET_QUERIES.map((preset, idx) => (
              <option key={idx} value={String(idx)}>
                {preset.label}
              </option>
            ))}
            <option value="-1">— Query personalizada —</option>
          </select>
        </div>

        {/* Query editor */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium" htmlFor="sparql-query-textarea">
              Query SPARQL
            </label>
            <Button variant="ghost" size="sm" onClick={handleCopy} className="gap-1.5 h-7 text-xs">
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              {copied ? 'Copiado!' : 'Copiar'}
            </Button>
          </div>
          <textarea
            id="sparql-query-textarea"
            value={query}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
              setQuery(e.target.value);
              setSelectedPreset('-1');
            }}
            rows={8}
            placeholder="SELECT ?s ?p ?o WHERE { ?s ?p ?o } LIMIT 10"
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 font-mono resize-y"
          />
        </div>

        {/* Execute button */}
        <div>
          <Button onClick={handleExecute} disabled={isLoading} className="gap-2">
            {isLoading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Executando...
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Executar Query
              </>
            )}
          </Button>
        </div>

        {/* Error */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold">Resultados</p>
              <Badge variant="secondary">
                {result.rows.length} linha{result.rows.length !== 1 ? 's' : ''}
              </Badge>
            </div>

            {result.rows.length === 0 ? (
              <div className="rounded-md border bg-muted/30 p-8 text-center text-sm text-muted-foreground">
                Nenhum resultado encontrado para esta query.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {result.columns.map((col) => (
                        <TableHead key={col} className="font-semibold">{col}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {result.rows.map((row, idx) => (
                      <TableRow key={idx}>
                        {row.map((cell, colIdx) => (
                          <TableCell key={colIdx}>
                            <code className="text-xs font-mono break-all">{cell}</code>
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
