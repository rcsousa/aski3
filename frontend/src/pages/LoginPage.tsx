import { useState, type FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-600 p-4">
      <div className="w-full max-w-md">
        {/* Brand header above card */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-white/20 backdrop-blur-sm mb-4">
            <GraduationCap className="h-9 w-9 text-white" />
          </div>
          <p className="text-white/70 text-sm font-semibold tracking-widest uppercase mb-1">
            Plataforma de Aprendizado
          </p>
          <h1 className="text-white text-2xl font-bold">Semântica para Agentes de IA</h1>
        </div>

        <Card className="shadow-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">Entrar na plataforma</CardTitle>
            <CardDescription>Acesse seu painel de aprendizado</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>
                  <strong>Erro de autenticação:</strong> {error}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  autoFocus
                  className={emailError ? 'border-destructive focus-visible:ring-destructive' : ''}
                />
                {emailError && (
                  <p className="text-xs text-destructive mt-1">{emailError}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className={passwordError ? 'border-destructive focus-visible:ring-destructive' : ''}
                />
                {passwordError && (
                  <p className="text-xs text-destructive mt-1">{passwordError}</p>
                )}
              </div>

              <Button type="submit" disabled={isLoading} className="w-full mt-2" size="lg">
                {isLoading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Entrando...
                  </>
                ) : (
                  'Entrar'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
