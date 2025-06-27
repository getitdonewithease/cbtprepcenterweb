import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getTestQuestions, submitTestResults } from '../api/practiceApi';
import { Question, TestResult, LocationState } from '../types/practiceTypes';

export const usePractice = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cbtSessionId, preparedQuestion, examConfig, status: testStatusRaw } = (location.state as LocationState) || {};

  const [currentStep, setCurrentStep] = useState<'summary' | 'test' | 'results'>('summary');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [testCompleted, setTestCompleted] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Anti-cheat states
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [tabSwitchHistory, setTabSwitchHistory] = useState<Array<{ timestamp: Date, action: 'left' | 'returned' }>>([]);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showTabSwitchWarning, setShowTabSwitchWarning] = useState(false);
  
  const [endTime, setEndTime] = useState<number | null>(null);
  
  const parseDurationToMilliseconds = (duration: string) => {
    if (!duration) return 0;
    const [h, m, s] = duration.split(':').map(Number);
    return ((h * 60 + m) * 60 + s) * 1000;
  };

  useEffect(() => {
    if (examConfig?.time) {
      setTimeRemaining(parseDurationToMilliseconds(examConfig.time));
      setEndTime(Date.now() + parseDurationToMilliseconds(examConfig.time));
    }
  }, [examConfig]);

  const handleStartTest = useCallback(async () => {
    if (!cbtSessionId) return;
    setLoading(true);
    setError(null);
    try {
      const rawQuestions = await getTestQuestions(cbtSessionId);

      if (!rawQuestions || rawQuestions.length === 0) {
        throw new Error("No questions were found for this test session.");
      }
      
      const formattedQuestions: Question[] = rawQuestions.map((q: any) => ({
        id: q.questionId,
        text: q.questionContent,
        options: q.optionCommandResponses.map((opt: any) => opt.optionContent),
        subject: q.subjectName,
        examType: q.examType,
        examYear: q.examYear,
        imageUrl: q.imageUrl,
        section: q.section,
        optionAlphas: q.optionCommandResponses.map((opt: any) => opt.optionAlpha),
        optionImages: q.optionCommandResponses.map((opt: any) => opt.imageUrl),
        // TODO: The correct answer is not provided in the /questions/paid API endpoint.
        // The scoring logic in handleSubmitTest will not work correctly until this is resolved.
        // The original component had a bug where it scored against a different set of questions.
      }));

      setQuestions(formattedQuestions);
      setCurrentStep('test');
      setStartTime(Date.now());
      setEndTime(Date.now() + parseDurationToMilliseconds(examConfig.time));
      document.documentElement.requestFullscreen().catch(console.error);
    } catch (err: any) {
      setError(err.message || 'Failed to start test');
    } finally {
      setLoading(false);
    }
  }, [cbtSessionId, examConfig]);

  const handleCountdownComplete = useCallback(() => {
    // This function is now empty as the backend handles scoring and results
  }, []);

  // Fullscreen and visibility change listeners
  useEffect(() => {
    const handleFullScreenChange = () => setIsFullScreen(Boolean(document.fullscreenElement));
    const handleVisibilityChange = () => {
      if (currentStep === 'test') {
        const now = new Date();
        if (document.hidden) {
          setTabSwitchCount(prev => prev + 1);
          setTabSwitchHistory(prev => [...prev, { timestamp: now, action: 'left' }]);
          setShowTabSwitchWarning(true);
        } else {
          setTabSwitchHistory(prev => [...prev, { timestamp: now, action: 'returned' }]);
        }
      }
    };

    document.addEventListener('fullscreenchange', handleFullScreenChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [currentStep]);

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const jumpToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  const handleAnswerSelect = (questionId: string, optionIndex: number) => {
    setAnswers({ ...answers, [questionId]: optionIndex });
  };
  
  if (!cbtSessionId || !preparedQuestion || !examConfig) {
      // maybe use an effect to navigate away
      useEffect(()=> {
          navigate('/dashboard');
      },[navigate])
  }

  return {
    cbtSessionId,
    preparedQuestion,
    examConfig,
    testStatusRaw,
    currentStep,
    currentQuestionIndex,
    answers,
    timeRemaining,
    testCompleted,
    questions,
    loading,
    error,
    tabSwitchCount,
    isFullScreen,
    showTabSwitchWarning,
    setShowTabSwitchWarning,
    handleStartTest,
    handleCountdownComplete,
    nextQuestion,
    prevQuestion,
    jumpToQuestion,
    handleAnswerSelect,
    enterFullScreen: () => document.documentElement.requestFullscreen().catch(console.error),
    exitFullScreen: () => document.exitFullscreen && document.exitFullscreen(),
    endTime,
  };
}; 