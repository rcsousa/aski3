import { useState } from 'react';
import {
  Button,
  CodeSnippet,
  InlineLoading,
  InlineNotification,
  Tag,
  Tile,
  Stack,
} from '@carbon/react';
import { Play, Reset } from '@carbon/icons-react';
import { api } from '../../stores/authStore';
import type { CodeExample } from '../../types';

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
    <Tile>
      <Stack gap={5}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--cds-spacing-03)', flexWrap: 'wrap' }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 600, fontSize: '1rem', margin: 0, marginBottom: 'var(--cds-spacing-02)' }}>
              {example.title}
            </p>
            <Tag type="cool-gray" size="sm">
              {example.language}
            </Tag>
          </div>
        </div>

        {/* Description */}
        {example.explanation && (
          <p style={{ color: 'var(--cds-text-secondary)', fontSize: '0.875rem', lineHeight: 1.6, margin: 0 }}>
            {example.explanation}
          </p>
        )}

        {/* Code Display */}
        <div>
          <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--cds-text-secondary)', marginBottom: 'var(--cds-spacing-02)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Código
          </p>
          <CodeSnippet
            type="multi"
            feedback="Copiado!"
            minCollapsedNumberOfRows={5}
            maxCollapsedNumberOfRows={20}
          >
            {example.code}
          </CodeSnippet>
        </div>

        {/* Expected Output */}
        {example.expected_output && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--cds-spacing-02)', marginBottom: 'var(--cds-spacing-02)' }}>
              <Tag type="green" size="sm">Saída Esperada</Tag>
            </div>
            <CodeSnippet type="multi" feedback="Copiado!" hideCopyButton>
              {example.expected_output}
            </CodeSnippet>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 'var(--cds-spacing-03)', alignItems: 'center', flexWrap: 'wrap' }}>
          {isLoading ? (
            <InlineLoading description="Executando..." status="active" />
          ) : (
            <Button
              kind="primary"
              renderIcon={Play}
              onClick={handleExecute}
              size="md"
            >
              Executar
            </Button>
          )}
          <Button
            kind="ghost"
            renderIcon={Reset}
            onClick={handleReset}
            disabled={isLoading}
            size="md"
          >
            Resetar
          </Button>
        </div>

        {/* Error */}
        {error && (
          <InlineNotification
            kind="error"
            title="Erro de execução"
            subtitle={error}
            onCloseButtonClick={() => setError(null)}
          />
        )}

        {/* Output */}
        {output && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--cds-spacing-03)', marginBottom: 'var(--cds-spacing-03)' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--cds-text-secondary)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Saída
              </p>
              <Tag type={output.success ? 'green' : 'red'} size="sm">
                {output.success ? 'Sucesso' : 'Erro'}
              </Tag>
            </div>

            {output.stdout && (
              <div style={{ marginBottom: 'var(--cds-spacing-03)' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)', marginBottom: 'var(--cds-spacing-02)' }}>
                  stdout
                </p>
                <CodeSnippet type="multi" feedback="Copiado!" hideCopyButton>
                  {output.stdout}
                </CodeSnippet>
              </div>
            )}

            {output.stderr && (
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--cds-support-error)', marginBottom: 'var(--cds-spacing-02)' }}>
                  stderr
                </p>
                <div style={{ border: '1px solid var(--cds-support-error)', borderRadius: '4px' }}>
                  <CodeSnippet type="multi" feedback="Copiado!" hideCopyButton>
                    {output.stderr}
                  </CodeSnippet>
                </div>
              </div>
            )}

            {!output.stdout && !output.stderr && (
              <p style={{ color: 'var(--cds-text-secondary)', fontSize: '0.875rem', fontStyle: 'italic' }}>
                Nenhuma saída produzida.
              </p>
            )}
          </div>
        )}
      </Stack>
    </Tile>
  );
}
