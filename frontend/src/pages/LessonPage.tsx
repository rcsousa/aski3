import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, CheckCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useCourseStore } from '../stores/courseStore';
import { api } from '../stores/authStore';
import type { QuizResult, QuizAnswerDetail } from '../types';
import { CodeSandbox } from '../components/course/CodeSandbox';
import { KGVisualizer } from '../components/kg/KGVisualizer';
import { SPARQLPlayground } from '../components/kg/SPARQLPlayground';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent } from '../components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Progress } from '../components/ui/progress';

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
        `/quiz/${numericSectionId}/submit`,
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
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Carregando lição...</p>
        </div>
      </div>
    );
  }

  // Compute tab value list
  const hasExamples = currentSection.code_examples && currentSection.code_examples.length > 0;
  const hasQuiz = currentSection.quiz_questions && currentSection.quiz_questions.length > 0;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Lesson header */}
      <div>
        <div className="flex flex-wrap items-center gap-2 mb-2">
          {currentCourse && (
            <Badge variant="default">{currentCourse.title}</Badge>
          )}
          <Badge variant="secondary">{currentSection.estimated_minutes} min</Badge>
          {sectionProgress?.completed && (
            <Badge variant="success" className="gap-1">
              <CheckCircle className="h-3 w-3" />
              Concluído
            </Badge>
          )}
        </div>
        <h1 className="text-2xl font-bold">{currentSection.title}</h1>
      </div>

      {/* Progress indicator */}
      {sections.length > 1 && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Seção {currentIndex + 1} de {sections.length}</span>
            <span>{Math.round(((currentIndex + 1) / sections.length) * 100)}% do curso</span>
          </div>
          <Progress value={((currentIndex + 1) / sections.length) * 100} />
        </div>
      )}

      {/* Content tabs */}
      <Tabs defaultValue="content">
        <TabsList>
          <TabsTrigger value="content">Conteúdo</TabsTrigger>
          {hasExamples && (
            <TabsTrigger value="exemplos">
              Exemplos ({currentSection.code_examples!.length})
            </TabsTrigger>
          )}
          {hasQuiz && (
            <TabsTrigger value="quiz">
              Quiz ({currentSection.quiz_questions!.length})
            </TabsTrigger>
          )}
          <TabsTrigger value="playground">Playground</TabsTrigger>
        </TabsList>

        {/* Content tab */}
        <TabsContent value="content">
          <div className="max-w-3xl">
            <ReactMarkdown remarkPlugins={[remarkGfm]} className="prose prose-slate max-w-none prose-img:rounded-xl prose-img:shadow-md prose-table:w-full prose-th:bg-muted prose-th:px-4 prose-th:py-2 prose-td:px-4 prose-td:py-2 prose-td:border prose-th:border">
              {currentSection.content}
            </ReactMarkdown>

            {!sectionProgress?.completed && (
              <div className="mt-8">
                <Button onClick={handleMarkComplete} disabled={isCompleting} className="gap-2">
                  {isCompleting ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Marcando...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Marcar como concluído
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Examples tab */}
        {hasExamples && (
          <TabsContent value="exemplos">
            <div className="space-y-6">
              {currentSection.code_examples!.map((example) => {
                const isKGExample =
                  example.code.includes('rdflib') || example.code.includes('Graph()');

                if (isKGExample) {
                  const demoTriples = extractDemoTriples(example.code);
                  return (
                    <div key={example.id} className="space-y-4">
                      {demoTriples.length > 0 && (
                        <KGVisualizer
                          triples={demoTriples}
                          title={`Grafo: ${example.title}`}
                        />
                      )}
                      <CodeSandbox example={example} />
                    </div>
                  );
                }

                return <CodeSandbox key={example.id} example={example} />;
              })}
            </div>
          </TabsContent>
        )}

        {/* Quiz tab */}
        {hasQuiz && (
          <TabsContent value="quiz">
            <div className="max-w-2xl space-y-6">
              {currentSection.quiz_questions!.map((question, index) => (
                <Card key={question.id}>
                  <CardContent className="pt-5 space-y-4">
                    <div className="flex gap-3 items-start">
                      <Badge variant="secondary" className="shrink-0 mt-0.5">{index + 1}</Badge>
                      <p className="font-medium leading-relaxed">{question.question}</p>
                    </div>

                    {question.question_type === 'true_false' ? (
                      <div className="flex items-center gap-4 pl-8">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name={`question-${question.id}`}
                            value="true"
                            checked={answers[question.id] === 'true'}
                            onChange={() => handleAnswerChange(question.id, 'true')}
                            disabled={!!quizResult}
                            className="accent-primary"
                          />
                          <span className="text-sm">Verdadeiro</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name={`question-${question.id}`}
                            value="false"
                            checked={answers[question.id] === 'false'}
                            onChange={() => handleAnswerChange(question.id, 'false')}
                            disabled={!!quizResult}
                            className="accent-primary"
                          />
                          <span className="text-sm">Falso</span>
                        </label>
                      </div>
                    ) : (
                      <div className="space-y-2 pl-8">
                        {question.options?.map((option, optIdx) => (
                          <label key={optIdx} className="flex items-start gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name={`question-${question.id}`}
                              value={option}
                              checked={answers[question.id] === option}
                              onChange={() => handleAnswerChange(question.id, option)}
                              disabled={!!quizResult}
                              className="mt-0.5 accent-primary"
                            />
                            <span className="text-sm leading-relaxed">{option}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {quizResult && (
                      <QuizAnswerFeedback
                        questionId={question.id}
                        details={quizResult.details}
                      />
                    )}
                  </CardContent>
                </Card>
              ))}

              {quizError && (
                <Alert variant="destructive">
                  <AlertDescription>{quizError}</AlertDescription>
                </Alert>
              )}

              {quizResult ? (
                <div className="space-y-3">
                  <Alert variant={quizResult.passed ? 'success' : 'default'}>
                    <AlertTitle>{quizResult.passed ? 'Parabéns!' : 'Continue praticando'}</AlertTitle>
                    <AlertDescription>
                      Você acertou {quizResult.score} de {quizResult.total} questões ({quizResult.percentage}%).
                    </AlertDescription>
                  </Alert>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setQuizResult(null);
                      setAnswers({});
                    }}
                  >
                    Tentar novamente
                  </Button>
                </div>
              ) : (
                <Button onClick={handleQuizSubmit} disabled={isSubmitting} className="gap-2">
                  {isSubmitting ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Enviando...
                    </>
                  ) : (
                    'Enviar respostas'
                  )}
                </Button>
              )}
            </div>
          </TabsContent>
        )}

        {/* Playground tab */}
        <TabsContent value="playground">
          <div className="max-w-4xl">
            <SPARQLPlayground
              defaultQuery="SELECT DISTINCT ?class WHERE { ?s a ?class } LIMIT 20"
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4 border-t">
        <Button
          variant="ghost"
          disabled={!prevSection}
          onClick={() => prevSection && navigate(`/learn/${prevSection.id}`)}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          {prevSection ? prevSection.title : 'Início'}
        </Button>

        <Button
          variant={nextSection ? 'default' : 'ghost'}
          disabled={!nextSection}
          onClick={() => nextSection && navigate(`/learn/${nextSection.id}`)}
          className="gap-2"
        >
          {nextSection ? nextSection.title : 'Fim do módulo'}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helper: extract a rough set of triples from rdflib-style Python code
// ---------------------------------------------------------------------------
interface DemoTriple {
  subject: string;
  predicate: string;
  object: string;
}

function extractDemoTriples(code: string): DemoTriple[] {
  const triples: DemoTriple[] = [];

  const addPattern =
    /g\.add\(\s*\(\s*(URIRef\(["']([^"']+)["']\)|Literal\(["']([^"']+)["']\)|BNode\(\))\s*,\s*(URIRef\(["']([^"']+)["']\)|Literal\(["']([^"']+)["']\))\s*,\s*(URIRef\(["']([^"']+)["']\)|Literal\(["']([^"']+)["']\)|BNode\(\))\s*\)\s*\)/g;

  let match: RegExpExecArray | null;
  while ((match = addPattern.exec(code)) !== null) {
    const resolveValue = (urirefPart: string, literalPart: string): string => {
      if (urirefPart) return urirefPart;
      if (literalPart) return `"${literalPart}"`;
      return '_:blank';
    };

    const subject = resolveValue(match[2], match[3]);
    const predicate = resolveValue(match[5], match[6]);
    const object = resolveValue(match[8], match[9]);

    if (subject && predicate && object) {
      triples.push({ subject, predicate, object });
    }
  }

  return triples;
}

interface QuizAnswerFeedbackProps {
  questionId: number;
  details: QuizAnswerDetail[];
}

function QuizAnswerFeedback({ questionId, details }: QuizAnswerFeedbackProps) {
  const detail = details.find((d) => d.question_id === questionId);
  if (!detail) return null;

  return (
    <Alert variant={detail.correct ? 'success' : 'destructive'} className="mt-2">
      <AlertTitle>{detail.correct ? 'Correto!' : 'Incorreto'}</AlertTitle>
      <AlertDescription>
        {detail.correct
          ? detail.explanation
          : `Resposta correta: ${detail.correct_answer}. ${detail.explanation}`}
      </AlertDescription>
    </Alert>
  );
}
