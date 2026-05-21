import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Grid,
  Column,
  Tabs,
  Tab,
  TabList,
  TabPanels,
  TabPanel,
  CodeSnippet,
  Button,
  RadioButtonGroup,
  RadioButton,
  Toggle,
  InlineNotification,
  Loading,
  ProgressIndicator,
  ProgressStep,
  Tag,
  Tile,
  Stack,
  Heading,
} from '@carbon/react';
import { ArrowLeft, ArrowRight, Checkmark } from '@carbon/icons-react';
import { useCourseStore } from '../stores/courseStore';
import { api } from '../stores/authStore';
import type { QuizResult, QuizAnswerDetail } from '../types';

export function LessonPage() {
  const { sectionId } = useParams<{ sectionId: string }>();
  const navigate = useNavigate();
  const {
    currentSection,
    currentCourse,
    fetchSection,
    markSectionComplete,
    progress,
  } = useCourseStore();

  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quizError, setQuizError] = useState<string | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);

  const numericSectionId = sectionId ? parseInt(sectionId, 10) : null;

  useEffect(() => {
    if (numericSectionId) {
      fetchSection(numericSectionId);
      setAnswers({});
      setQuizResult(null);
      setQuizError(null);
    }
  }, [numericSectionId, fetchSection]);

  const sections = currentCourse?.sections ?? [];
  const currentIndex = sections.findIndex((s) => s.id === numericSectionId);
  const prevSection = currentIndex > 0 ? sections[currentIndex - 1] : null;
  const nextSection = currentIndex < sections.length - 1 ? sections[currentIndex + 1] : null;

  const sectionProgress = progress.find((p) => p.section_id === numericSectionId);

  const handleAnswerChange = (questionId: number, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleQuizSubmit = async () => {
    if (!numericSectionId) return;

    const questions = currentSection?.quiz_questions ?? [];
    const unanswered = questions.filter((q) => !answers[q.id]);
    if (unanswered.length > 0) {
      setQuizError('Por favor, responda todas as perguntas antes de enviar.');
      return;
    }

    setIsSubmitting(true);
    setQuizError(null);

    try {
      const { data } = await api.post<QuizResult>(
        `/sections/${numericSectionId}/quiz`,
        { answers },
      );
      setQuizResult(data);

      if (data.passed) {
        await markSectionComplete(numericSectionId);
      }
    } catch {
      setQuizError('Erro ao enviar respostas. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkComplete = async () => {
    if (!numericSectionId) return;
    setIsCompleting(true);
    await markSectionComplete(numericSectionId);
    setIsCompleting(false);
  };

  if (!currentSection) {
    return (
      <Grid>
        <Column sm={4} md={8} lg={16}>
          <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--cds-spacing-10)' }}>
            <Loading description="Carregando lição..." withOverlay={false} />
          </div>
        </Column>
      </Grid>
    );
  }

  return (
    <Grid>
      <Column sm={4} md={8} lg={16}>
        <div className="page-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--cds-spacing-03)', marginBottom: 'var(--cds-spacing-03)' }}>
            {currentCourse && (
              <Tag type="blue" size="sm">
                {currentCourse.title}
              </Tag>
            )}
            <Tag type="warm-gray" size="sm">
              {currentSection.estimated_minutes} min
            </Tag>
            {sectionProgress?.completed && (
              <Tag type="green" size="sm">
                <Checkmark size={12} style={{ marginRight: '4px' }} />
                Concluído
              </Tag>
            )}
          </div>
          <Heading>{currentSection.title}</Heading>
        </div>
      </Column>

      {sections.length > 1 && (
        <Column sm={4} md={8} lg={16} style={{ marginBottom: 'var(--cds-spacing-06)' }}>
          <ProgressIndicator currentIndex={currentIndex} spaceEqually>
            {sections.map((section) => {
              const sectionProg = progress.find((p) => p.section_id === section.id);
              return (
                <ProgressStep
                  key={section.id}
                  label={section.title}
                  complete={sectionProg?.completed ?? false}
                  current={section.id === numericSectionId}
                />
              );
            })}
          </ProgressIndicator>
        </Column>
      )}

      <Column sm={4} md={8} lg={16}>
        <Tabs>
          <TabList aria-label="Conteúdo da lição">
            <Tab>Conteúdo</Tab>
            {currentSection.code_examples && currentSection.code_examples.length > 0 && (
              <Tab>Exemplos ({currentSection.code_examples.length})</Tab>
            )}
            {currentSection.quiz_questions && currentSection.quiz_questions.length > 0 && (
              <Tab>Quiz ({currentSection.quiz_questions.length})</Tab>
            )}
          </TabList>

          <TabPanels>
            <TabPanel>
              <div style={{ maxWidth: '800px' }}>
                {/* TODO: Replace with a proper Markdown renderer (e.g., react-markdown) */}
                <div
                  className="lesson-content"
                  dangerouslySetInnerHTML={{ __html: currentSection.content }}
                />

                {!sectionProgress?.completed && (
                  <div style={{ marginTop: 'var(--cds-spacing-07)' }}>
                    <Button
                      onClick={handleMarkComplete}
                      disabled={isCompleting}
                      renderIcon={Checkmark}
                      kind="primary"
                    >
                      {isCompleting ? 'Marcando...' : 'Marcar como concluído'}
                    </Button>
                  </div>
                )}
              </div>
            </TabPanel>

            {currentSection.code_examples && currentSection.code_examples.length > 0 && (
              <TabPanel>
                <Stack gap={6}>
                  {currentSection.code_examples.map((example) => (
                    <div key={example.id}>
                      <Tile>
                        <Stack gap={4}>
                          <div>
                            <p style={{ fontWeight: 600, fontSize: '1rem', marginBottom: 'var(--cds-spacing-02)' }}>
                              {example.title}
                            </p>
                            <Tag type="cool-gray" size="sm">
                              {example.language}
                            </Tag>
                          </div>

                          <CodeSnippet
                            type="multi"
                            feedback="Copiado!"
                            minCollapsedNumberOfRows={5}
                            maxCollapsedNumberOfRows={15}
                          >
                            {example.code}
                          </CodeSnippet>

                          {example.explanation && (
                            <p style={{ color: 'var(--cds-text-secondary)', fontSize: '0.875rem', lineHeight: 1.6 }}>
                              {example.explanation}
                            </p>
                          )}
                        </Stack>
                      </Tile>
                    </div>
                  ))}
                </Stack>
              </TabPanel>
            )}

            {currentSection.quiz_questions && currentSection.quiz_questions.length > 0 && (
              <TabPanel>
                <div style={{ maxWidth: '700px' }}>
                  <Stack gap={7}>
                    {currentSection.quiz_questions.map((question, index) => (
                      <Tile key={question.id}>
                        <Stack gap={4}>
                          <div style={{ display: 'flex', gap: 'var(--cds-spacing-03)', alignItems: 'flex-start' }}>
                            <Tag type="blue" size="sm">
                              {index + 1}
                            </Tag>
                            <p style={{ fontWeight: 500, fontSize: '0.9375rem', lineHeight: 1.5 }}>
                              {question.question}
                            </p>
                          </div>

                          {question.question_type === 'true_false' ? (
                            <div className="quiz-option">
                              <Toggle
                                id={`toggle-${question.id}`}
                                labelText="Verdadeiro / Falso"
                                labelA="Falso"
                                labelB="Verdadeiro"
                                toggled={answers[question.id] === 'true'}
                                onToggle={(checked: boolean) =>
                                  handleAnswerChange(question.id, checked ? 'true' : 'false')
                                }
                                disabled={!!quizResult}
                              />
                            </div>
                          ) : (
                            <RadioButtonGroup
                              name={`question-${question.id}`}
                              legendText="Selecione uma opção"
                              valueSelected={answers[question.id] ?? ''}
                              onChange={(value: string) => handleAnswerChange(question.id, value)}
                              disabled={!!quizResult}
                              orientation="vertical"
                            >
                              {question.options?.map((option, optIdx) => (
                                <RadioButton
                                  key={optIdx}
                                  id={`q${question.id}-opt${optIdx}`}
                                  labelText={option}
                                  value={option}
                                />
                              ))}
                            </RadioButtonGroup>
                          )}

                          {quizResult && (
                            <QuizAnswerFeedback
                              questionId={question.id}
                              details={quizResult.details}
                            />
                          )}
                        </Stack>
                      </Tile>
                    ))}

                    {quizError && (
                      <InlineNotification
                        kind="error"
                        title="Erro"
                        subtitle={quizError}
                        onCloseButtonClick={() => setQuizError(null)}
                      />
                    )}

                    {quizResult ? (
                      <div className="quiz-result">
                        <InlineNotification
                          kind={quizResult.passed ? 'success' : 'warning'}
                          title={quizResult.passed ? 'Parabéns!' : 'Continue praticando'}
                          subtitle={`Você acertou ${quizResult.score} de ${quizResult.total} questões (${quizResult.percentage}%).`}
                          hideCloseButton
                        />
                        <Button
                          kind="ghost"
                          style={{ marginTop: 'var(--cds-spacing-04)' }}
                          onClick={() => {
                            setQuizResult(null);
                            setAnswers({});
                          }}
                        >
                          Tentar novamente
                        </Button>
                      </div>
                    ) : (
                      <Button
                        onClick={handleQuizSubmit}
                        disabled={isSubmitting}
                        kind="primary"
                      >
                        {isSubmitting ? 'Enviando...' : 'Enviar respostas'}
                      </Button>
                    )}
                  </Stack>
                </div>
              </TabPanel>
            )}
          </TabPanels>
        </Tabs>
      </Column>

      <Column sm={4} md={8} lg={16}>
        <div className="nav-actions">
          <Button
            kind="ghost"
            renderIcon={ArrowLeft}
            disabled={!prevSection}
            onClick={() => prevSection && navigate(`/learn/${prevSection.id}`)}
          >
            {prevSection ? prevSection.title : 'Início'}
          </Button>

          <Button
            kind={nextSection ? 'primary' : 'ghost'}
            renderIcon={ArrowRight}
            disabled={!nextSection}
            onClick={() => nextSection && navigate(`/learn/${nextSection.id}`)}
          >
            {nextSection ? nextSection.title : 'Fim do módulo'}
          </Button>
        </div>
      </Column>
    </Grid>
  );
}

interface QuizAnswerFeedbackProps {
  questionId: number;
  details: QuizAnswerDetail[];
}

function QuizAnswerFeedback({ questionId, details }: QuizAnswerFeedbackProps) {
  const detail = details.find((d) => d.question_id === questionId);
  if (!detail) return null;

  return (
    <InlineNotification
      kind={detail.correct ? 'success' : 'error'}
      title={detail.correct ? 'Correto!' : 'Incorreto'}
      subtitle={
        detail.correct
          ? detail.explanation
          : `Resposta correta: ${detail.correct_answer}. ${detail.explanation}`
      }
      hideCloseButton
      style={{ marginTop: 'var(--cds-spacing-03)' }}
    />
  );
}
