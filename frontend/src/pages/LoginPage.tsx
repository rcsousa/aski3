import { useState, type FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Form,
  TextInput,
  PasswordInput,
  Button,
  InlineNotification,
  Grid,
  Column,
  Tile,
  Stack,
  Heading,
} from '@carbon/react';
import { useAuthStore } from '../stores/authStore';

interface LocationState {
  from?: { pathname: string };
}

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, error } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const state = location.state as LocationState | null;
  const from = state?.from?.pathname ?? '/courses';

  const validate = (): boolean => {
    let valid = true;
    if (!email.trim()) {
      setEmailError('E-mail é obrigatório.');
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Informe um e-mail válido.');
      valid = false;
    } else {
      setEmailError('');
    }

    if (!password) {
      setPasswordError('Senha é obrigatória.');
      valid = false;
    } else {
      setPasswordError('');
    }

    return valid;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch {
      // Error is handled in the store
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        backgroundColor: 'var(--cds-background)',
        paddingTop: '3rem',
      }}
    >
      <Grid>
        <Column sm={4} md={{ span: 4, offset: 2 }} lg={{ span: 6, offset: 5 }}>
          <Tile style={{ padding: 'var(--cds-spacing-08)' }}>
            <Stack gap={6}>
              <div>
                <p
                  style={{
                    fontSize: '0.875rem',
                    color: 'var(--cds-text-secondary)',
                    marginBottom: 'var(--cds-spacing-02)',
                    fontWeight: 600,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                  }}
                >
                  Plataforma de Aprendizado
                </p>
                <Heading>Semântica para Agentes de IA</Heading>
              </div>

              {error && (
                <InlineNotification
                  kind="error"
                  title="Erro de autenticação"
                  subtitle={error}
                  hideCloseButton
                />
              )}

              <Form onSubmit={handleSubmit} noValidate>
                <Stack gap={5}>
                  <TextInput
                    id="email"
                    type="email"
                    labelText="E-mail"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    invalid={!!emailError}
                    invalidText={emailError}
                    autoComplete="email"
                    autoFocus
                  />

                  <PasswordInput
                    id="password"
                    labelText="Senha"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    invalid={!!passwordError}
                    invalidText={passwordError}
                    autoComplete="current-password"
                  />

                  <Button
                    type="submit"
                    disabled={isLoading}
                    style={{ width: '100%', maxWidth: '100%' }}
                  >
                    {isLoading ? 'Entrando...' : 'Entrar'}
                  </Button>
                </Stack>
              </Form>
            </Stack>
          </Tile>
        </Column>
      </Grid>
    </div>
  );
}
