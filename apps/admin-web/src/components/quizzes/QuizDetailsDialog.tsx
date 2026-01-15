import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Quiz, QuestionType, BannerTargetAudience } from '@grow-fitness/shared-types';
import { formatDate, formatBannerTargetAudience } from '@/lib/formatters';
import { useApiQuery } from '@/hooks/useApiQuery';
import { quizzesService } from '@/services/quizzes.service';
import { useModalParams } from '@/hooks/useModalParams';
import {
  CheckCircle2,
  XCircle,
  Calendar,
  Target,
  Users,
  FileQuestion,
  Award,
} from 'lucide-react';

interface QuizDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quiz?: Quiz;
}

export function QuizDetailsDialog({ open, onOpenChange, quiz: quizProp }: QuizDetailsDialogProps) {
  const { entityId, closeModal } = useModalParams('quizId');

  // Fetch quiz from URL if prop not provided
  const { data: quizFromUrl } = useApiQuery<Quiz>(
    ['quizzes', entityId || 'no-id'],
    () => {
      if (!entityId) {
        throw new Error('Quiz ID is required');
      }
      return quizzesService.getQuizById(entityId);
    },
    {
      enabled: open && !quizProp && !!entityId,
    }
  );

  const quiz = quizProp || quizFromUrl;

  // Handle close with URL params
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      closeModal();
    }
    onOpenChange(newOpen);
  };

  if (!quiz) {
    return null;
  }

  const getQuestionTypeLabel = (type: QuestionType) => {
    return type.toString().replace(/_/g, ' ');
  };

  const totalQuestions = quiz.questions.length;
  const totalPoints = quiz.questions.reduce((sum, q) => sum + (q.points || 0), 0);
  const multipleChoiceCount = quiz.questions.filter(q => q.type === QuestionType.MULTIPLE_CHOICE).length;
  const trueFalseCount = quiz.questions.filter(q => q.type === QuestionType.TRUE_FALSE).length;
  const shortAnswerCount = quiz.questions.filter(q => q.type === QuestionType.SHORT_ANSWER).length;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0 flex flex-col">
        <div className="flex flex-col flex-1 min-h-0">
          {/* Header */}
          <div className="px-6 py-4 border-b bg-muted/30 flex-shrink-0">
            <div className="flex items-center gap-4">
              <div>
                <h2 className="text-2xl font-semibold">{quiz.title}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-sm text-muted-foreground">
                    {quiz.description || 'No description provided'}
                  </p>
                  <Badge variant={quiz.isActive ? 'default' : 'secondary'}>
                    {quiz.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Created {formatDate(quiz.createdAt)}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-1 min-h-0 overflow-hidden">
            {/* Left Sidebar */}
            <div className="w-80 border-r bg-muted/20 p-6 overflow-y-auto min-h-0">
              {/* Quiz Info Section */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">Quiz Information</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Target Audience</p>
                    <Badge variant="secondary">{formatBannerTargetAudience(quiz.targetAudience)}</Badge>
                  </div>
                  {quiz.passingScore !== undefined && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Passing Score</p>
                      <p className="text-sm font-medium">{quiz.passingScore}%</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Status</p>
                    <Badge variant={quiz.isActive ? 'default' : 'secondary'}>
                      {quiz.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Highlights Section */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm">Highlights</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total Questions</span>
                    <span className="font-medium">{totalQuestions}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total Points</span>
                    <span className="font-medium">{totalPoints}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Multiple Choice</span>
                    <span className="font-medium">{multipleChoiceCount}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">True/False</span>
                    <span className="font-medium">{trueFalseCount}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Short Answer</span>
                    <span className="font-medium">{shortAnswerCount}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Main Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <Tabs defaultValue="overview" className="w-full">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="questions">
                    Questions {totalQuestions > 0 && `(${totalQuestions})`}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-6 space-y-6">
                  {/* About Section */}
                  <div>
                    <h3 className="font-semibold mb-3">About</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Title</h4>
                        <p className="text-sm">{quiz.title}</p>
                      </div>
                      {quiz.description && (
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">
                            Description
                          </h4>
                          <p className="text-sm">{quiz.description}</p>
                        </div>
                      )}
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">
                          Target Audience
                        </h4>
                        <Badge variant="secondary">{formatBannerTargetAudience(quiz.targetAudience)}</Badge>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Status</h4>
                        <Badge variant={quiz.isActive ? 'default' : 'secondary'}>
                          {quiz.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      {quiz.passingScore !== undefined && (
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">
                            Passing Score
                          </h4>
                          <p className="text-sm">{quiz.passingScore}%</p>
                        </div>
                      )}
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Created</h4>
                        <p className="text-sm">{formatDate(quiz.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="questions" className="mt-6">
                  {totalQuestions === 0 ? (
                    <div className="text-center py-12">
                      <FileQuestion className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-sm text-muted-foreground">No questions in this quiz</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {quiz.questions.map((question, index) => (
                        <Card key={index} className="overflow-hidden">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-lg flex items-center gap-2">
                                <FileQuestion className="h-4 w-4" />
                                Question {index + 1}
                              </CardTitle>
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary">{getQuestionTypeLabel(question.type)}</Badge>
                                {question.points && (
                                  <Badge variant="outline">
                                    <Award className="h-3 w-3 mr-1" />
                                    {question.points} pts
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div>
                              <p className="text-sm font-medium mb-3">{question.question}</p>
                            </div>

                            {question.type === QuestionType.MULTIPLE_CHOICE && question.options && (
                              <div className="space-y-2 pt-2 border-t">
                                <h4 className="text-xs font-medium text-muted-foreground mb-2">Options:</h4>
                                <div className="space-y-2">
                                  {question.options.map((option, optIndex) => (
                                    <div
                                      key={optIndex}
                                      className={`flex items-center gap-2 p-2 rounded-md text-sm ${
                                        option === question.correctAnswer
                                          ? 'bg-green-50 border border-green-200'
                                          : 'bg-muted/30'
                                      }`}
                                    >
                                      {option === question.correctAnswer ? (
                                        <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                                      ) : (
                                        <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30 flex-shrink-0" />
                                      )}
                                      <span
                                        className={
                                          option === question.correctAnswer
                                            ? 'text-green-700 font-medium'
                                            : 'text-foreground'
                                        }
                                      >
                                        {option}
                                      </span>
                                      {option === question.correctAnswer && (
                                        <Badge variant="outline" className="ml-auto text-xs">
                                          Correct
                                        </Badge>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {question.type === QuestionType.TRUE_FALSE && (
                              <div className="space-y-2 pt-2 border-t">
                                <h4 className="text-xs font-medium text-muted-foreground mb-2">
                                  Correct Answer:
                                </h4>
                                <div
                                  className={`flex items-center gap-2 p-2 rounded-md ${
                                    question.correctAnswer === 'True'
                                      ? 'bg-green-50 border border-green-200'
                                      : 'bg-red-50 border border-red-200'
                                  }`}
                                >
                                  {question.correctAnswer === 'True' ? (
                                    <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                                  ) : (
                                    <XCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                                  )}
                                  <span
                                    className={`font-medium ${
                                      question.correctAnswer === 'True'
                                        ? 'text-green-700'
                                        : 'text-red-700'
                                    }`}
                                  >
                                    {question.correctAnswer}
                                  </span>
                                </div>
                              </div>
                            )}

                            {question.type === QuestionType.SHORT_ANSWER && (
                              <div className="space-y-2 pt-2 border-t">
                                <h4 className="text-xs font-medium text-muted-foreground mb-2">
                                  Correct Answer:
                                </h4>
                                <div className="bg-muted p-3 rounded-md">
                                  <p className="text-sm font-mono">{question.correctAnswer}</p>
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
