import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Clock, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useCourseStore } from '../stores/courseStore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Button } from '../components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';

export function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { courses, progress, fetchCourses, fetchProgress, isLoading } = useCourseStore();

  useEffect(() => {
    fetchCourses();
    fetchProgress();
  }, [fetchCourses, fetchProgress]);

  const totalSections = courses.reduce(
    (acc, course) => acc + (course.sections?.length ?? 0),
    0,
  );
  const completedSections = progress.filter((p) => p.completed).length;
  const overallPct = totalSections > 0 ? Math.round((completedSections / totalSections) * 100) : 0;

  const tableRows = courses.flatMap((course) =>
    (course.sections ?? []).map((section) => {
      const sectionProgress = progress.find((p) => p.section_id === section.id);
      return {
        id: String(section.id),
        section: section.title,
        course: course.title,
        status: sectionProgress?.completed ? 'completed' : 'pending',
        score: sectionProgress?.score != null ? `${sectionProgress.score}%` : '—',
        sectionId: section.id,
      };
    }),
  );

  if (isLoading && courses.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold">Olá, {user?.full_name ?? 'Estudante'}</h1>
        <p className="mt-1 text-muted-foreground">
          Acompanhe seu progresso no curso de Semântica para Agentes de IA.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Overall progress */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Progresso geral
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-4xl font-bold">{overallPct}%</p>
            <Progress value={overallPct} />
          </CardContent>
        </Card>

        {/* Completed sections */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Seções concluídas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-4xl font-bold">{completedSections}</p>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <span>de {totalSections} no total</span>
            </div>
          </CardContent>
        </Card>

        {/* Active courses */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Cursos ativos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-4xl font-bold">{courses.filter((c) => c.is_published).length}</p>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{courses.reduce((acc, c) => acc + c.estimated_hours, 0)}h estimadas</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sections table */}
      <Card>
        <CardHeader>
          <CardTitle>Todas as seções</CardTitle>
          <p className="text-sm text-muted-foreground">Seu progresso em cada módulo do curso</p>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Seção</TableHead>
                <TableHead>Curso</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Pontuação</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableRows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium max-w-xs">
                    <span className="line-clamp-1">{row.section}</span>
                  </TableCell>
                  <TableCell className="text-muted-foreground max-w-xs">
                    <span className="line-clamp-1">{row.course}</span>
                  </TableCell>
                  <TableCell>
                    {row.status === 'completed' ? (
                      <Badge variant="success" className="gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Concluído
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Pendente</Badge>
                    )}
                  </TableCell>
                  <TableCell className="font-mono">{row.score}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/learn/${row.sectionId}`)}
                      className="gap-1"
                    >
                      {row.status === 'completed' ? 'Revisar' : 'Continuar'}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
