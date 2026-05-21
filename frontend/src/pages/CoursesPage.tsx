import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Grid,
  Column,
  Tile,
  ClickableTile,
  Tag,
  ProgressBar,
  Loading,
  InlineNotification,
  Heading,
  Stack,
} from '@carbon/react';
import { Time, Education } from '@carbon/icons-react';
import { useCourseStore } from '../stores/courseStore';

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
      <Grid>
        <Column sm={4} md={8} lg={16}>
          <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--cds-spacing-10)' }}>
            <Loading description="Carregando cursos..." withOverlay={false} />
          </div>
        </Column>
      </Grid>
    );
  }

  if (slug && currentCourse) {
    return (
      <Grid>
        <Column sm={4} md={8} lg={16}>
          <div className="page-header">
            <Heading>{currentCourse.title}</Heading>
            <p style={{ color: 'var(--cds-text-secondary)', marginTop: 'var(--cds-spacing-03)' }}>
              {currentCourse.description}
            </p>
          </div>
        </Column>

        {currentCourse.sections?.map((section) => {
          const sectionProgress = progress.find((p) => p.section_id === section.id);
          return (
            <Column key={section.id} sm={4} md={4} lg={8} style={{ marginBottom: 'var(--cds-spacing-05)' }}>
              <ClickableTile
                className="course-tile"
                onClick={() => navigate(`/learn/${section.id}`)}
              >
                <Stack gap={3}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Tag type="blue" size="sm">
                      Módulo {section.order_index + 1}
                    </Tag>
                    {sectionProgress?.completed && (
                      <Tag type="green" size="sm">
                        Concluído
                      </Tag>
                    )}
                  </div>
                  <p style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--cds-text-primary)' }}>
                    {section.title}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--cds-spacing-02)', color: 'var(--cds-text-secondary)', fontSize: '0.875rem' }}>
                    <Time size={16} />
                    <span>{section.estimated_minutes} min</span>
                  </div>
                </Stack>
              </ClickableTile>
            </Column>
          );
        })}
      </Grid>
    );
  }

  return (
    <Grid>
      <Column sm={4} md={8} lg={16}>
        <div className="page-header">
          <Heading>Cursos Disponíveis</Heading>
          <p style={{ color: 'var(--cds-text-secondary)', marginTop: 'var(--cds-spacing-03)' }}>
            Explore os cursos e comece sua jornada de aprendizado.
          </p>
        </div>
      </Column>

      {error && (
        <Column sm={4} md={8} lg={16}>
          <InlineNotification
            kind="error"
            title="Erro"
            subtitle={error}
            hideCloseButton
          />
        </Column>
      )}

      {courses.map((course) => {
        const progressPct = getSectionProgress(course.id);
        return (
          <Column key={course.id} sm={4} md={4} lg={8} style={{ marginBottom: 'var(--cds-spacing-05)' }}>
            <ClickableTile
              className="course-tile"
              style={{ height: '100%' }}
              onClick={() => navigate(`/courses/${course.slug}`)}
            >
              <Stack gap={4}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Tag type="blue">
                    <Education size={12} style={{ marginRight: '4px' }} />
                    Curso
                  </Tag>
                  {!course.is_published && <Tag type="warm-gray">Rascunho</Tag>}
                </div>

                <div>
                  <p style={{ fontWeight: 600, fontSize: '1.125rem', marginBottom: 'var(--cds-spacing-02)', color: 'var(--cds-text-primary)' }}>
                    {course.title}
                  </p>
                  <p style={{ color: 'var(--cds-text-secondary)', fontSize: '0.875rem', lineHeight: 1.5 }}>
                    {course.description}
                  </p>
                </div>

                <Tile style={{ padding: 'var(--cds-spacing-04)', backgroundColor: 'var(--cds-layer-02)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--cds-spacing-03)' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)' }}>Progresso</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--cds-text-primary)' }}>
                      {progressPct}%
                    </span>
                  </div>
                  <ProgressBar
                    value={progressPct}
                    max={100}
                    label=""
                    hideLabel
                    size="small"
                  />
                </Tile>

                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--cds-spacing-02)', color: 'var(--cds-text-secondary)', fontSize: '0.875rem' }}>
                  <Time size={16} />
                  <span>{course.estimated_hours}h estimadas</span>
                </div>
              </Stack>
            </ClickableTile>
          </Column>
        );
      })}

      {!isLoading && courses.length === 0 && (
        <Column sm={4} md={8} lg={16}>
          <Tile>
            <p style={{ color: 'var(--cds-text-secondary)', textAlign: 'center', padding: 'var(--cds-spacing-07)' }}>
              Nenhum curso disponível no momento.
            </p>
          </Tile>
        </Column>
      )}
    </Grid>
  );
}
