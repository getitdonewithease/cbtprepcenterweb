import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getTestQuestions, submitTestResults, getCbtSessionConfiguration, getTestResults, getAIExplanation, saveQuestion, getSavedQuestions, removeSavedQuestion } from '../api/practiceApi';
import { Question, TestResult, LocationState, ExamConfig, PreparedQuestion, ReviewQuestion, AIExplanationResponse, TestResultsApiResponse, SubmissionQuestionResponse, SavedQuestionApiResponse, SavedQuestion } from '../types/practiceTypes';

export const usePractice = (cbtSessionIdParam?: string) => {
  const location = useLocation();
  const navigate = useNavigate();
  let cbtSessionId = cbtSessionIdParam;
  let duration: string = "02:00:00"; // default
  if (!cbtSessionIdParam) {
    const state: any = location.state || {};
    cbtSessionId = state.cbtSessionId;
    if (state.duration) {
      duration = state.duration;
    }
  } else {
    // If passed as param, we can't get duration from state
    duration = "02:00:00";
  }

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
  // Add a state to track if the page has ever been visible
  const [hasBeenVisible, setHasBeenVisible] = useState(false);
  
  const [endTime, setEndTime] = useState<number | null>(null);
  
  const parseDurationToMilliseconds = (duration: string) => {
    if (!duration) return 0;
    const [h, m, s] = duration.split(':').map(Number);
    return ((h * 60 + m) * 60 + s) * 1000;
  };

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
      setStartTime(Date.now());
      setEndTime(Date.now() + parseDurationToMilliseconds(duration));
      setTimeRemaining(parseDurationToMilliseconds(duration));
      document.documentElement.requestFullscreen().catch(console.error);
    } catch (err: any) {
      setError(err.message || 'Failed to start test');
    } finally {
      setLoading(false);
    }
  }, [cbtSessionId, duration]);

  const handleCountdownComplete = useCallback(() => {
    // This function is now empty as the backend handles scoring and results
  }, []);

  // Fullscreen and visibility change listeners
  useEffect(() => {
    const handleFullScreenChange = () => setIsFullScreen(Boolean(document.fullscreenElement));
    const handleVisibilityChange = () => {
      const now = new Date();
      if (document.hidden) {
        // Only show warning if the page has been visible before
        if (hasBeenVisible) {
          setTabSwitchCount(prev => prev + 1);
          setTabSwitchHistory(prev => [...prev, { timestamp: now, action: 'left' }]);
          setShowTabSwitchWarning(true);
        }
      } else {
        setTabSwitchHistory(prev => [...prev, { timestamp: now, action: 'returned' }]);
        // Mark that the page has been visible at least once
        if (!hasBeenVisible) setHasBeenVisible(true);
      }
    };

    document.addEventListener('fullscreenchange', handleFullScreenChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [hasBeenVisible]);

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
  
  // if (!cbtSessionId || !preparedQuestion || !examConfig) {
  //     // maybe use an effect to navigate away
  //     // useEffect(()=> {
  //     //     navigate('/dashboard');
  //     // },[navigate])
  // }

  return {
    cbtSessionId,
    preparedQuestion: undefined, // not used in this flow
    examConfig: { duration }, // only duration is needed
    testStatusRaw: undefined, // not used in this flow
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

export const useTestQuestions = (cbtSessionId: string) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      if (!cbtSessionId) return;
      
      setLoading(true);
      setError(null);
      try {
        const fetchedQuestions = await getTestQuestions(cbtSessionId);
        const mappedQuestions = fetchedQuestions.map((q: any, idx: number) => ({
          id: q.questionId,
          text: q.questionContent,
          options: q.optionCommandResponses.map((o: any) => o.optionContent),
          subject: q.subjectName,
          examType: q.examType,
          examYear: q.examYear,
          imageUrl: q.imageUrl,
          section: q.section ? `Section: ${q.section}` : undefined,
          optionAlphas: q.optionCommandResponses.map((o: any) => o.optionAlpha),
          optionImages: q.optionCommandResponses.map((o: any) => o.imageUrl),
          correctAnswer: undefined, // Not available from API
        }));
        setQuestions(mappedQuestions);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [cbtSessionId]);

  return { questions, loading, error };
};

export const useTestSubmission = () => {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitTest = async (
    sessionId: string,
    questionAnswers: Array<{ questionId: string; chosenOption: string }>,
    durationUsed: string
  ) => {
    setSubmitting(true);
    setError(null);
    try {
      const result = await submitTestResults(sessionId, questionAnswers, durationUsed);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  return { submitTest, submitting, error };
};

export const useCbtSessionConfiguration = (cbtSessionId: string) => {
  const [config, setConfig] = useState<ExamConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      if (!cbtSessionId) return;
      
      setLoading(true);
      setError(null);
      try {
        const fetchedConfig = await getCbtSessionConfiguration(cbtSessionId);
        setConfig(fetchedConfig);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, [cbtSessionId]);

  return { config, loading, error };
};

// New hooks for test review functionality
export const useTestReview = (sessionId: string) => {
  const [reviewData, setReviewData] = useState<
    | (ReturnType<typeof mapApiToReviewData>)
    | null
  >(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTestResults = async () => {
      if (!sessionId) return;
      setLoading(true);
      setError(null);
      try {
        const results: TestResultsApiResponse = await getTestResults(sessionId);
        setReviewData(mapApiToReviewData(results));
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTestResults();
  }, [sessionId]);

  return { reviewData, loading, error };
};

function mapApiToReviewData(results: TestResultsApiResponse) {
  // Map the API response to our ReviewQuestion format
  const mappedQuestions: ReviewQuestion[] = results.submissionQuestions.map((q: SubmissionQuestionResponse) => {
    // Find the correct answer index
    const correctAnswerIndex = q.optionCommandResponses.findIndex((opt) => opt.isCorrect);
    // Find the user's answer index
    const userAnswerIndex = q.optionCommandResponses.findIndex((opt) => opt.optionAlpha === q.chosenOption);
    return {
      id: q.questionId,
      text: q.questionContent,
      options: q.optionCommandResponses.map((o) => o.optionContent),
      correctAnswer: correctAnswerIndex,
      subject: q.subjectName,
      examType: q.examType,
      examYear: q.examYear,
      imageUrl: q.imageUrl || undefined,
      section: q.section || undefined,
      optionAlphas: q.optionCommandResponses.map((o) => o.optionAlpha),
      optionImages: q.optionCommandResponses.map((o) => o.imageUrl || undefined),
      userAnswer: userAnswerIndex >= 0 ? userAnswerIndex : undefined,
      isCorrect: q.isChosenOptionCorrect,
      isSaved: false, // Will be updated when we implement saved questions
    };
  });
  // Create user answers record
  const userAnswers: Record<string, number> = {};
  mappedQuestions.forEach(q => {
    if (q.userAnswer !== undefined) {
      userAnswers[q.id] = q.userAnswer;
    }
  });
  // Calculate accuracy
  const accuracy = results.numberOfQuestionAttempted > 0
    ? (results.numberOfCorrectAnswers / results.numberOfQuestionAttempted) * 100
    : 0;
  return {
    cbtSessionId: results.cbtSessionId,
    questions: mappedQuestions,
    userAnswers,
    score: results.score,
    totalQuestions: results.numberOfQuestion,
    timeSpent: results.durationUsed, // or results.duration if you want total allowed
    numberOfQuestionAttempted: results.numberOfQuestionAttempted,
    numberOfWrongAnswers: results.numberOfWrongAnswers,
    numberOfCorrectAnswers: results.numberOfCorrectAnswers,
    accuracy,
    duration: results.duration,
    durationUsed: results.durationUsed,
    averageSpeed: results.averageSpeed,
  };
}

export const useAIExplanation = () => {
  const [explanation, setExplanation] = useState<AIExplanationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getExplanation = async (request: {
    questionId: string;
    questionText: string;
    options: string[];
    correctAnswer: number;
    userAnswer?: number;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getAIExplanation(request);
      setExplanation(result);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearExplanation = () => {
    setExplanation(null);
    setError(null);
  };

  return { explanation, loading, error, getExplanation, clearExplanation };
};

export const useSaveQuestion = () => {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveQuestionHandler = async (sessionId: string, questionId: string) => {
    setSaving(true);
    setError(null);
    try {
      const result = await saveQuestion(sessionId, questionId);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setSaving(false);
    }
  };

  return { saveQuestion: saveQuestionHandler, saving, error };
}; 

export const useSavedQuestions = () => {
  const [savedQuestions, setSavedQuestions] = useState<SavedQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSavedQuestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const questions: SavedQuestionApiResponse[] = await getSavedQuestions();
      const mappedQuestions: SavedQuestion[] = questions.map((q) => {
        // Find the correct answer index
        const correctAnswerIndex = q.optionCommandResponses.findIndex((opt) => opt.isCorrect);
        // Find the user's answer index based on chosenOption
        const userAnswerIndex = q.optionCommandResponses.findIndex((opt) => opt.optionAlpha === q.chosenOption);
        
        return {
          id: q.questionId,
          text: q.questionContent,
          options: q.optionCommandResponses.map((o) => o.optionContent),
          correctAnswer: correctAnswerIndex,
          subject: q.subjectName,
          examType: q.examType,
          examYear: q.examYear,
          section: q.section || undefined,
          imageUrl: q.imageUrl || undefined,
          userAnswer: userAnswerIndex >= 0 ? userAnswerIndex : undefined,
          isCorrect: q.isChosenOptionCorrect,
          isSaved: true,
          solution: q.solution || undefined,
          optionAlphas: q.optionCommandResponses.map((o) => o.optionAlpha),
          optionImages: q.optionCommandResponses.map((o) => o.imageUrl),
          dateSaved: q.savedOn,
          // Note: difficulty is not provided by the API
          // You may want to add this field to the API response
        };
      });
      setSavedQuestions(mappedQuestions);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const removeQuestion = async (questionId: string) => {
    try {
      await removeSavedQuestion(questionId);
      setSavedQuestions(prev => prev.filter(q => q.id !== questionId));
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    fetchSavedQuestions();
  }, []);

  return {
    savedQuestions,
    loading,
    error,
    fetchSavedQuestions,
    removeQuestion
  };
}; 