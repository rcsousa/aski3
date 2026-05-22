import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  BookOpen,
  LayoutDashboard,
  LogOut,
  ChevronRight,
  GraduationCap,
  Menu,
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useCourseStore } from '../../stores/courseStore';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { courses, fetchCourses } = useCourseStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedCourses, setExpandedCourses] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname.startsWith(path);

  const toggleCourse = (courseId: number) => {
    setExpandedCourses((prev) => {
      const next = new Set(prev);
      if (next.has(courseId)) {
        next.delete(courseId);
      } else {
        next.add(courseId);
      }
      return next;
    });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          'flex flex-col bg-sidebar text-sidebar-foreground transition-all duration-200 ease-in-out shrink-0',
          sidebarOpen ? 'w-64' : 'w-0 overflow-hidden',
        )}
      >
        {/* Sidebar logo */}
        <div className="flex items-center gap-2 px-4 py-4 border-b border-white/10">
          <GraduationCap className="h-6 w-6 text-violet-300 shrink-0" />
          <span className="font-bold text-white text-sm truncate">Semântica IA</span>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          <button
            onClick={() => navigate('/dashboard')}
            className={cn(
              'flex items-center gap-3 w-full rounded-md px-3 py-2 text-sm transition-colors',
              location.pathname === '/dashboard'
                ? 'bg-white/15 text-white font-medium'
                : 'text-sidebar-foreground hover:bg-white/10',
            )}
          >
            <LayoutDashboard className="h-4 w-4 shrink-0" />
            Dashboard
          </button>

          <button
            onClick={() => navigate('/courses')}
            className={cn(
              'flex items-center gap-3 w-full rounded-md px-3 py-2 text-sm transition-colors',
              isActive('/courses') && !location.pathname.includes('/learn')
                ? 'bg-white/15 text-white font-medium'
                : 'text-sidebar-foreground hover:bg-white/10',
            )}
          >
            <BookOpen className="h-4 w-4 shrink-0" />
            Cursos
          </button>

          {/* Course modules */}
          <div className="pt-2">
            <p className="px-3 mb-1 text-xs font-semibold uppercase tracking-widest text-white/40">
              Módulos
            </p>
            {courses.map((course) => {
              const isExpanded = expandedCourses.has(course.id);
              return (
                <div key={course.id}>
                  <button
                    onClick={() => toggleCourse(course.id)}
                    className="flex items-center gap-2 w-full rounded-md px-3 py-2 text-sm text-sidebar-foreground hover:bg-white/10 transition-colors"
                  >
                    <ChevronRight
                      className={cn(
                        'h-3 w-3 shrink-0 transition-transform',
                        isExpanded && 'rotate-90',
                      )}
                    />
                    <span className="truncate text-left">{course.title}</span>
                  </button>

                  {isExpanded && (
                    <div className="ml-5 mt-0.5 space-y-0.5 border-l border-white/10 pl-3">
                      {course.sections?.map((section) => (
                        <button
                          key={section.id}
                          onClick={() => navigate(`/learn/${section.id}`)}
                          className={cn(
                            'flex items-center w-full rounded-md px-2 py-1.5 text-xs transition-colors',
                            location.pathname === `/learn/${section.id}`
                              ? 'bg-white/15 text-white font-medium'
                              : 'text-sidebar-foreground/70 hover:bg-white/10 hover:text-sidebar-foreground',
                          )}
                        >
                          <span className="truncate text-left">{section.title}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>

        {/* User footer */}
        <div className="border-t border-white/10 p-3">
          <div className="flex items-center gap-2 mb-2 px-1">
            <div className="h-8 w-8 rounded-full bg-violet-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {user?.full_name?.charAt(0)?.toUpperCase() ?? 'U'}
            </div>
            <span className="text-xs text-sidebar-foreground truncate">{user?.full_name ?? 'Usuário'}</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full rounded-md px-2 py-1.5 text-xs text-sidebar-foreground/70 hover:bg-white/10 hover:text-sidebar-foreground transition-colors"
          >
            <LogOut className="h-3 w-3 shrink-0" />
            Sair
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top header */}
        <header className="flex items-center gap-3 px-4 py-3 border-b bg-card shadow-sm shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <span
            className="font-bold text-foreground cursor-pointer"
            onClick={() => navigate('/courses')}
          >
            Semântica IA
          </span>

          <nav className="flex items-center gap-1 ml-4">
            <Button
              variant={isActive('/courses') && !location.pathname.includes('/learn') ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => navigate('/courses')}
            >
              <BookOpen className="h-4 w-4" />
              Cursos
            </Button>
            <Button
              variant={isActive('/dashboard') ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => navigate('/dashboard')}
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Button>
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {user?.full_name ?? ''}
            </span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sair</span>
            </Button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
