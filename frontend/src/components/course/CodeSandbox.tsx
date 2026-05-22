import { useState } from 'react';
import { Play, RotateCcw } from 'lucide-react';
import { api } from '../../stores/authStore';
import type { CodeExample } from '../../types';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';

interface ExecResponse {
  stdout: string;
  stderr: string;
  success: boolean;
}

interface CodeSandboxProps {
  example: CodeExample;
}

export function CodeSandbox({ example }: CodeSandboxProps) {
  const [output, setOutput] = useState<ExecResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExecute = async () => {
    setIsLoading(true);
    setError(null);
    setOutput(null);

    try {
      const { data } = await api.post<ExecResponse>('/exec', {
        code: example.code,
        language: example.language,
      });
      setOutput(data);
    } catch {
      setError('Falha ao executar o código. Verifique se o servidor está disponível.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setOutput(null);
    setError(null);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="font-semibold text-base">{example.title}</p>
            {example.explanation && (
              <p className="text-sm text-muted-foreground leading-relaxed">{example.explanation}</p>
            )}
          </div>
          <Badge variant="secondary" className="shrink-0">{example.language}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Code block */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
            Código
          </p>
          <pre className="rounded-lg bg-[hsl(220_15%_14%)] text-slate-200 p-4 overflow-x-auto text-sm leading-relaxed font-mono">
            <code>{example.code}</code>
          </pre>
        </div>

        {/* Expected output */}
        {example.expected_output && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="success">Saída Esperada</Badge>
            </div>
            <pre className="rounded-lg bg-muted p-4 overflow-x-auto text-sm leading-relaxed font-mono text-foreground">
              <code>{example.expected_output}</code>
            </pre>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-3">
          <Button
            onClick={handleExecute}
            disabled={isLoading}
            className="gap-2"
          >
            {isLoading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Executando...
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Executar
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={isLoading}
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Resetar
          </Button>
        </div>

        {/* Error */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Output */}
        {output && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Saída
              </p>
              <Badge variant={output.success ? 'success' : 'destructive'}>
                {output.success ? 'Sucesso' : 'Erro'}
              </Badge>
            </div>

            {output.stdout && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">stdout</p>
                <pre className="rounded-lg bg-muted p-3 overflow-x-auto text-sm font-mono">
                  <code>{output.stdout}</code>
                </pre>
              </div>
            )}

            {output.stderr && (
              <div>
                <p className="text-xs text-destructive mb-1">stderr</p>
                <pre className="rounded-lg bg-destructive/5 border border-destructive/20 p-3 overflow-x-auto text-sm font-mono text-destructive">
                  <code>{output.stderr}</code>
                </pre>
              </div>
            )}

            {!output.stdout && !output.stderr && (
              <p className="text-sm text-muted-foreground italic">Nenhuma saída produzida.</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
