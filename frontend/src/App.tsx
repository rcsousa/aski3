import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import { AppShell } from './components/layout/AppShell';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { CoursesPage } from './pages/CoursesPage';
import { LessonPage } from './pages/LessonPage';
import { DashboardPage } from './pages/DashboardPage';

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const { loadUser, token } = useAuthStore();

  useEffect(() => {
    if (token) {
      loadUser();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthInitializer>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/courses"
            element={
              <ProtectedRoute>
                <AppShell>
                  <CoursesPage />
                </AppShell>
              </ProtectedRoute>
            }
          />

          <Route
            path="/courses/:slug"
            element={
              <ProtectedRoute>
                <AppShell>
                  <CoursesPage />
                </AppShell>
              </ProtectedRoute>
            }
          />

          <Route
            path="/learn/:sectionId"
            element={
              <ProtectedRoute>
                <AppShell>
                  <LessonPage />
                </AppShell>
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <AppShell>
                  <DashboardPage />
                </AppShell>
              </ProtectedRoute>
            }
          />

          <Route path="/" element={<Navigate to="/courses" replace />} />
          <Route path="*" element={<Navigate to="/courses" replace />} />
        </Routes>
      </AuthInitializer>
    </BrowserRouter>
  );
}
