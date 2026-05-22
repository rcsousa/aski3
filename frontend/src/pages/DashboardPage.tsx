import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Column,
  Tile,
  DataTable,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  Tag,
  ProgressBar,
  Button,
  Loading,
  Heading,
  Stack,
} from '@carbon/react';
import { ArrowRight, Checkmark, Time } from '@carbon/icons-react';
import { useAuthStore } from '../stores/authStore';
import { useCourseStore } from '../stores/courseStore';

const tableHeaders = [
  { key: 'section', header: 'Seção' },
  { key: 'course', header: 'Curso' },
  { key: 'status', header: 'Status' },
  { key: 'score', header: 'Pontuação' },
  { key: 'action', header: '' },
];

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
      <Grid>
        <Column sm={4} md={8} lg={16}>
          <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--cds-spacing-10)' }}>
            <Loading description="Carregando dashboard..." withOverlay={false} />
          </div>
        </Column>
      </Grid>
    );
  }

  return (
    <Grid>
      <Column sm={4} md={8} lg={16}>
        <div className="page-header">
          <Heading>Olá, {user?.full_name ?? 'Estudante'}</Heading>
          <p style={{ color: 'var(--cds-text-secondary)', marginTop: 'var(--cds-spacing-03)' }}>
            Acompanhe seu progresso no curso de Semântica para Agentes de IA.
          </p>
        </div>
      </Column>

      <Column sm={4} md={4} lg={4} style={{ marginBottom: 'var(--cds-spacing-05)' }}>
        <Tile>
          <Stack gap={3}>
            <p style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
              Progresso geral
            </p>
            <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--cds-text-primary)' }}>
              {overallPct}%
            </p>
            <ProgressBar value={overallPct} max={100} label="" hideLabel size="small" />
          </Stack>
        </Tile>
      </Column>

      <Column sm={4} md={2} lg={4} style={{ marginBottom: 'var(--cds-spacing-05)' }}>
        <Tile>
          <Stack gap={3}>
            <p style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
              Seções concluídas
            </p>
            <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--cds-text-primary)' }}>
              {completedSections}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--cds-spacing-02)', color: 'var(--cds-text-secondary)', fontSize: '0.875rem' }}>
              <Checkmark size={16} />
              <span>de {totalSections} no total</span>
            </div>
          </Stack>
        </Tile>
      </Column>

      <Column sm={4} md={2} lg={4} style={{ marginBottom: 'var(--cds-spacing-05)' }}>
        <Tile>
          <Stack gap={3}>
            <p style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
              Cursos ativos
            </p>
            <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--cds-text-primary)' }}>
              {courses.filter((c) => c.is_published).length}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--cds-spacing-02)', color: 'var(--cds-text-secondary)', fontSize: '0.875rem' }}>
              <Time size={16} />
              <span>
                {courses.reduce((acc, c) => acc + c.estimated_hours, 0)}h estimadas
              </span>
            </div>
          </Stack>
        </Tile>
      </Column>

      <Column sm={4} md={8} lg={16} style={{ marginTop: 'var(--cds-spacing-07)' }}>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <DataTable rows={tableRows as any[]} headers={tableHeaders as any[]} isSortable>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {(({ rows, headers, getTableProps, getHeaderProps, getRowProps }: any) => (
            <TableContainer title="Todas as seções" description="Seu progresso em cada módulo do curso">
              <Table {...getTableProps()}>
                <TableHead>
                  <TableRow>
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {headers.map((header: any) => (
                      <TableHeader
                        key={header.key}
                        {...getHeaderProps({ header })}
                      >
                        {header.header}
                      </TableHeader>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {rows.map((row: any) => (
                    <TableRow key={row.id} {...getRowProps({ row })}>
                      <TableCell>{row.section}</TableCell>
                      <TableCell>{row.course}</TableCell>
                      <TableCell>
                        {row.status === 'completed' ? (
                          <Tag type="green" size="sm">
                            <Checkmark size={12} style={{ marginRight: '4px' }} />
                            Concluído
                          </Tag>
                        ) : (
                          <Tag type="warm-gray" size="sm">
                            Pendente
                          </Tag>
                        )}
                      </TableCell>
                      <TableCell>{row.score}</TableCell>
                      <TableCell>
                        <Button
                          kind="ghost"
                          size="sm"
                          renderIcon={ArrowRight}
                          onClick={() => navigate(`/learn/${row.sectionId}`)}
                        >
                          {row.status === 'completed' ? 'Revisar' : 'Continuar'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )) as any}
        </DataTable>
      </Column>
    </Grid>
  );
}
