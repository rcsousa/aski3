import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Clock, BookOpen, CheckCircle2 } from 'lucide-react';
import { useCourseStore } from '../stores/courseStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Alert, AlertDescription } from '../components/ui/alert';

export function CoursesPage() {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const { courses, currentCourse, fetchCourses, fetchCourse, progress, fetchProgress, isLoading, error } =
    useCourseStore();

  useEffect(() => {
    fetchCourses();
    fetchProgress();
  }, [fetchCourses, fetchProgress]);

  useEffect(() => {
    if (slug) {
      fetchCourse(slug);
    }
  }, [slug, fetchCourse]);

  const getSectionProgress = (courseId: number): number => {
    const course = courses.find((c) => c.id === courseId);
    if (!course?.sections?.length) return 0;
    const completed = progress.filter(
      (p) => p.completed && course.sections?.some((s) => s.id === p.section_id),
    ).length;
    return Math.round((completed / course.sections.length) * 100);
  };

  if (isLoading && courses.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Carregando cursos...</p>
        </div>
      </div>
    );
  }

  // Course detail view (slug selected)
  if (slug && currentCourse) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{currentCourse.title}</h1>
          <p className="mt-1 text-muted-foreground">{currentCourse.description}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {currentCourse.sections?.map((section) => {
            const sectionProgress = progress.find((p) => p.section_id === section.id);
            return (
              <Card
                key={section.id}
                className="cursor-pointer hover:shadow-md hover:border-primary/30 transition-all"
                onClick={() => navigate(`/learn/${section.id}`)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <Badge variant="secondary">Módulo {section.order_index + 1}</Badge>
                    {sectionProgress?.completed && (
                      <Badge variant="success" className="flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Concluído
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-base mt-2">{section.title}</CardTitle>
                </CardHeader>
                <CardFooter className="pt-0">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{section.estimated_minutes} min</span>
                  </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  // Courses list view
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Cursos Disponíveis</h1>
        <p className="mt-1 text-muted-foreground">Explore os cursos e comece sua jornada de aprendizado.</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {courses.map((course) => {
          const progressPct = getSectionProgress(course.id);
          return (
            <Card
              key={course.id}
              className="cursor-pointer hover:shadow-md hover:border-primary/30 transition-all flex flex-col"
              onClick={() => navigate(`/courses/${course.slug}`)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Badge variant="default" className="flex items-center gap-1">
                    <BookOpen className="h-3 w-3" />
                    Curso
                  </Badge>
                  {!course.is_published && <Badge variant="secondary">Rascunho</Badge>}
                </div>
                <CardTitle className="text-lg mt-2">{course.title}</CardTitle>
                <CardDescription className="line-clamp-2">{course.description}</CardDescription>
              </CardHeader>

              <CardContent className="flex-1">
                <div className="rounded-md bg-muted/50 p-3 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground font-medium">Progresso</span>
                    <span className="font-semibold">{progressPct}%</span>
                  </div>
                  <Progress value={progressPct} className="h-2" />
                </div>
              </CardContent>

              <CardFooter className="pt-0">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{course.estimated_hours}h estimadas</span>
                  <span className="mx-1 text-border">·</span>
                  <span>{course.sections?.length ?? 0} seções</span>
                </div>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {!isLoading && courses.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Nenhum curso disponível no momento.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
