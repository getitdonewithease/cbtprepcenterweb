import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  Clock, 
  BookOpen,
  Trophy,
  Target,
  AlertTriangle
} from 'lucide-react';
import { useTestReview, useAIExplanation, useSaveQuestion } from '../hooks/usePractice';
import { useToast } from '@/components/ui/use-toast';
import { ReviewQuestion } from '../types/practiceTypes';
import QuestionReviewCard from './QuestionReviewCard';
import AIExplanationDialog from './AIExplanationDialog';

const TestReviewPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showAIExplanation, setShowAIExplanation] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<ReviewQuestion | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [userSelectedSubject, setUserSelectedSubject] = useState(false);

  const { reviewData, loading, error } = useTestReview(sessionId || '');
  const { explanation, loading: aiLoading, getExplanation, clearExplanation } = useAIExplanation();
  const { saveQuestion, saving } = useSaveQuestion();
  const { toast } = useToast();

  // Group questions by subject - moved before conditional returns
  const questionsBySubject = React.useMemo(() => {
    if (!reviewData?.questions) return {};
    
    return reviewData.questions.reduce((acc, question, index) => {
      const subject = question.subject;
      if (!acc[subject]) {
        acc[subject] = [];
      }
      acc[subject].push({ ...question, index });
      return acc;
    }, {} as Record<string, Array<ReviewQuestion & { index: number }>>);
  }, [reviewData?.questions]);

  // Effect to sync selected subject with current question or initialize it
  React.useEffect(() => {
    const subjects = Object.keys(questionsBySubject);
    if (reviewData?.questions && reviewData.questions.length > 0) {
      const currentQuestion = reviewData.questions[currentQuestionIndex];
      // Only auto-set selected subject if user hasn't manually selected one
      if (!userSelectedSubject && subjects.length > 0) {
        if (currentQuestion) {
          setSelectedSubject(currentQuestion.subject);
        } else {
          setSelectedSubject(subjects[0]);
        }
      }
    }
  }, [reviewData?.questions, currentQuestionIndex, questionsBySubject, userSelectedSubject]);

  if (!sessionId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Alert variant="destructive" className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>Invalid session ID. Please try again.</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading test review...</p>
        </div>
      </div>
    );
  }

  if (error || !reviewData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Alert variant="destructive" className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {error || 'Failed to load test review data. Please try again.'}
          </AlertDescription>
        </Alert>
        <Button 
          onClick={() => navigate(-1)} 
          className="mt-4"
          variant="outline"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  const { questions, score, totalQuestions, timeSpent, numberOfCorrectAnswers, numberOfWrongAnswers, numberOfQuestionAttempted, accuracy, durationUsed } = reviewData;
  const currentQuestion = questions[currentQuestionIndex];

  const handleQuestionNavigation = (index: number) => {
    setCurrentQuestionIndex(index);
    // Reset user selection flag when navigating to a question from a different subject
    if (reviewData?.questions && reviewData.questions[index]) {
      const targetQuestion = reviewData.questions[index];
      if (targetQuestion.subject !== selectedSubject) {
        setUserSelectedSubject(false);
      }
    }
  };

  const handleSaveQuestion = async (questionId: string) => {
    try {
      const response = await saveQuestion(sessionId!, questionId);
      toast({
        title: 'Question Saved',
        description: response.message,
        duration: 5000,
        variant: 'success',
      });
    } catch (error) {
      console.error('Failed to save question:', error);
    }
  };

  const handleAIExplanation = async (question: ReviewQuestion) => {
    console.log('AI Help clicked for question:', question.id);
    setSelectedQuestion(question);
    setShowAIExplanation(true); // Open dialog immediately
    
    // Temporarily skip API call to test if dialog opens
    console.log('Dialog should be open now');
    
    // Uncomment this when API is ready
    /*
    try {
      console.log('Making AI explanation request...');
      const result = await getExplanation({
        questionId: question.id,
        questionText: question.text,
        options: question.options,
        correctAnswer: question.correctAnswer || 0,
        userAnswer: question.userAnswer,
      });
      console.log('AI explanation result:', result);
    } catch (error) {
      console.error('Failed to get AI explanation:', error);
    }
    */
  };

  const formatTime = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      {/* Header */}
      <div className="mb-6">
        <Button 
          onClick={() => navigate(-1)} 
          variant="ghost" 
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Test Review</h1>
            <p className="text-muted-foreground">Session ID: {sessionId}</p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Trophy className="h-3 w-3" />
              Score: {score}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Time: {durationUsed}
            </Badge>
          </div>
        </div>
      </div>

      {/* Performance Overview */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Performance Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{numberOfQuestionAttempted}</div>
              <div className="text-sm text-muted-foreground">Attempted</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{numberOfCorrectAnswers}</div>
              <div className="text-sm text-muted-foreground">Correct</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{numberOfWrongAnswers}</div>
              <div className="text-sm text-muted-foreground">Incorrect</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(accuracy)}%
              </div>
              <div className="text-sm text-muted-foreground">Accuracy</div>
            </div>
          </div>
          <Progress value={(numberOfCorrectAnswers / totalQuestions) * 100} className="h-2" />
        </CardContent>
      </Card>

      {/* Main Content: Sidebar + Question */}
      <div className="flex w-full gap-8 flex-col lg:flex-row">
        {/* Sidebar: Question Navigation */}
        <aside className="w-full lg:w-96 flex-shrink-0 mb-8 lg:mb-0">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Questions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Subject Tabs */}
              <div className="flex gap-2 mb-4 border-b pb-2 overflow-x-auto whitespace-nowrap">
                {Object.keys(questionsBySubject).map((subject) => (
                  <Button
                    key={subject}
                    variant={selectedSubject === subject ? "secondary" : "ghost"}
                    size="sm"
                    className="capitalize"
                    onClick={() => {
                      setSelectedSubject(subject);
                      setUserSelectedSubject(true);
                    }}
                  >
                    {subject}
                  </Button>
                ))}
              </div>
              {/* Question Buttons */}
              <div className="flex flex-wrap gap-2">
                {selectedSubject &&
                  questionsBySubject[selectedSubject]?.map(({ index, id, isCorrect, userAnswer }) => (
                    <Button
                      key={index}
                      variant={currentQuestionIndex === index ? "default" : "outline"}
                      className={`h-10 w-10 p-0 mb-2 ${
                        isCorrect 
                          ? 'border-green-500 text-green-600' 
                          : userAnswer !== undefined 
                          ? 'border-red-500 text-red-600'
                          : 'border-gray-300'
                      }`}
                      onClick={() => handleQuestionNavigation(index)}
                    >
                      {isCorrect ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : userAnswer !== undefined ? (
                        <XCircle className="h-4 w-4" />
                      ) : (
                        index + 1
                      )}
                    </Button>
                  ))}
              </div>
              {/* Legend */}
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Correct</span>
                </div>
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm">Incorrect</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border rounded-sm"></div>
                  <span className="text-sm">Unattempted</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </aside>

        {/* Main Question Area */}
        <section className="flex-1 w-full">
          {currentQuestion && (
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between">
                  <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
                  <div className="flex items-center gap-4">
                    <Badge variant="outline" className="text-lg font-medium">{currentQuestion.subject}</Badge>
                    {currentQuestion.examType && currentQuestion.examYear && (
                      <Badge variant="outline">
                        {currentQuestion.examType.toUpperCase()} {currentQuestion.examYear}
                      </Badge>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <QuestionReviewCard
                  question={currentQuestion}
                  questionNumber={currentQuestionIndex + 1}
                  totalQuestions={questions.length}
                  onSave={() => handleSaveQuestion(currentQuestion.id)}
                  onAIExplanation={() => handleAIExplanation(currentQuestion)}
                  saving={saving}
                />
              </CardContent>
            </Card>
          )}
        </section>
      </div>

      {/* AI Explanation Dialog */}
      {selectedQuestion && (
        <AIExplanationDialog
          open={showAIExplanation}
          onOpenChange={setShowAIExplanation}
          question={selectedQuestion}
          explanation={explanation}
          loading={aiLoading}
          onClose={() => {
            setShowAIExplanation(false);
            clearExplanation();
            setSelectedQuestion(null);
          }}
        />
      )}
    </div>
  );
};

export default TestReviewPage; 