import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getTestQuestions, submitTestResults, getCbtSessionConfiguration, getTestResults, getAIExplanation, saveQuestion, saveTestProgress } from '../api/practiceApi';
import { Question, TestResult, LocationState, ExamConfig, PreparedQuestion, ReviewQuestion, AIExplanationResponse, TestResultsApiResponse, SubmissionQuestionResponse, TestProgress, TEST_STATUS } from '../types/practiceTypes';
import { isDesktop, isFullscreenSupported } from '../utils/deviceDetection';

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
  
  // Device detection - only enforce fullscreen on desktop
  const [isDesktopDevice, setIsDesktopDevice] = useState(isDesktop());
  
  const [endTime, setEndTime] = useState<number | null>(null);
  const [isAutoSubmitting, setIsAutoSubmitting] = useState<boolean>(false);
  
  // Progress tracking state
  const [lastSaved, setLastSaved] = useState<number>(0);
  const [questionsSinceLastSave, setQuestionsSinceLastSave] = useState<number>(0);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const periodicSaveRef = useRef<NodeJS.Timeout>();
  
  const parseDurationToMilliseconds = (duration: string) => {
    if (!duration) return 0;
    const [h, m, s] = duration.split(':').map(Number);
    return ((h * 60 + m) * 60 + s) * 1000;
  };

  // Helpers to compute remaining time from endTime on demand
  const getMsRemaining = useCallback((end?: number | null) => {
    if (!end) return 0;
    return Math.max(0, end - Date.now());
  }, []);

  // Helper function to calculate remaining time in HH:MM:SS format from endTime
  const calculateRemainingTime = useCallback(() => {
    if (!endTime) return "00:00:00";
    const remainingSeconds = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
    const hours = Math.floor(remainingSeconds / 3600);
    const minutes = Math.floor((remainingSeconds % 3600) / 60);
    const seconds = remainingSeconds % 60;
    console.log(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }, [endTime]);

  // Debounced save function
  const debouncedSave = useCallback(async (newAnswers: Record<string, number>) => {
    if (!cbtSessionId || questions.length === 0) return;

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout for debounced save
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const questionAnswers = Object.entries(newAnswers).map(([questionId, answerIndex]) => {
          const q = questions.find((qq) => qq.id === questionId);
          const alpha = typeof answerIndex === "number"
            ? (q?.optionAlphas && q.optionAlphas[answerIndex] ? q.optionAlphas[answerIndex] : String.fromCharCode(65 + answerIndex))
            : 'X';
          return { questionId, chosenOption: alpha };
        });

        const progress: TestProgress = {
          sessionId: cbtSessionId,
          currentQuestionIndex,
          answers: newAnswers,
          questionAnswers,
          timeRemaining: getMsRemaining(endTime),
          remainingTime: calculateRemainingTime(),
          lastSaved: Date.now(),
          tabSwitchCount,
          tabSwitchHistory,
          isProgressSave: true
        };

        await saveTestProgress(progress, { isDebounced: true });
        setLastSaved(Date.now());
        console.log('Debounced save completed');
      } catch (error) {
        console.error('Debounced save failed:', error);
      }
    }, 60000); // 1-minute debounce
  }, [cbtSessionId, questions.length, currentQuestionIndex, endTime, calculateRemainingTime, tabSwitchCount, tabSwitchHistory, getMsRemaining]);

  // Immediate save function for 5-question threshold
  const saveFiveQuestionProgress = useCallback(async (newAnswers: Record<string, number>) => {
    if (!cbtSessionId || questions.length === 0) return;

    try {
      const questionAnswers = Object.entries(newAnswers).map(([questionId, answerIndex]) => {
        const q = questions.find((qq) => qq.id === questionId);
        const alpha = typeof answerIndex === "number"
          ? (q?.optionAlphas && q.optionAlphas[answerIndex] ? q.optionAlphas[answerIndex] : String.fromCharCode(65 + answerIndex))
          : 'X';
        return { questionId, chosenOption: alpha };
      });

      const progress: TestProgress = {
        sessionId: cbtSessionId,
        currentQuestionIndex,
        answers: newAnswers,
        questionAnswers,
        timeRemaining: getMsRemaining(endTime),
        remainingTime: calculateRemainingTime(),
        lastSaved: Date.now(),
        tabSwitchCount,
        tabSwitchHistory,
        isProgressSave: true
      };

      await saveTestProgress(progress, { isFiveQuestionTrigger: true });
      setLastSaved(Date.now());
      console.log('Progress saved after 5 questions answered/updated');
    } catch (error) {
      console.error('5-question save failed:', error);
    }
  }, [cbtSessionId, questions.length, currentQuestionIndex, endTime, calculateRemainingTime, tabSwitchCount, tabSwitchHistory, getMsRemaining]);

  const handleStartTest = useCallback(async () => {
    if (!cbtSessionId) return;
    setLoading(true);
    setError(null);
    try {
      const rawQuestions = await getTestQuestions(cbtSessionId);

      if (!rawQuestions || rawQuestions.length === 0) {
        throw new Error("No questions were found for this test session.");
      }
      
      // Extract progress and format questions in one pass
      const savedAnswers: Record<string, number> = {};
      let lastAnsweredIndex = 0;
      let hasProgress = false;
      
      // Helper to convert letter back to index (A=0, B=1, C=2, D=3, etc.)
      const letterToIndex = (letter: string) => letter.charCodeAt(0) - 65;
      
      const formattedQuestions: Question[] = rawQuestions.map((q: any, index: number) => {
        // Extract saved progress from chosenOption
        if (q.chosenOption && q.chosenOption !== null) {
          savedAnswers[q.questionId] = letterToIndex(q.chosenOption);
          lastAnsweredIndex = Math.max(lastAnsweredIndex, index + 1);
          hasProgress = true;
        }
        
        return {
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
        };
      });

      setQuestions(formattedQuestions);

      // Fetch server-side configuration to get accurate remaining time
      let remainingMsFromServer: number | null = null;
      try {
        const cfg: ExamConfig = await getCbtSessionConfiguration(cbtSessionId);
        if (cfg && typeof cfg.timeRemaining === 'string') {
          remainingMsFromServer = parseDurationToMilliseconds(cfg.timeRemaining);
        }
      } catch (_) {
        // If config fetch fails, fall back to local duration
        remainingMsFromServer = null;
      }
      
      // Resume from saved progress if available
      if (hasProgress) {
        setAnswers(savedAnswers);
        setCurrentQuestionIndex(Math.min(lastAnsweredIndex, formattedQuestions.length - 1));
        
        // Use server-reported remaining time if available; otherwise, fall back to full duration
        const remainingMs = typeof remainingMsFromServer === 'number' && remainingMsFromServer >= 0
          ? remainingMsFromServer
          : parseDurationToMilliseconds(duration);
        setTimeRemaining(remainingMs);
        setStartTime(Date.now());
        setEndTime(Date.now() + remainingMs);
        
        console.log(`Resumed test with ${Object.keys(savedAnswers).length} answered questions`);
        // Reset question counter when resuming
        setQuestionsSinceLastSave(0);
      } else {
        // Fresh start - honor server remaining time if provided
        const remainingMs = typeof remainingMsFromServer === 'number' && remainingMsFromServer >= 0
          ? remainingMsFromServer
          : parseDurationToMilliseconds(duration);
        setStartTime(Date.now());
        setEndTime(Date.now() + remainingMs);
        setTimeRemaining(remainingMs);
      }
      
      // Only request fullscreen on desktop devices
      if (isDesktopDevice && isFullscreenSupported()) {
        document.documentElement.requestFullscreen().catch(console.error);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to start test');
    } finally {
      setLoading(false);
    }
  }, [cbtSessionId, duration]);

  const handleCountdownComplete = useCallback(async () => {
    if (!cbtSessionId || isAutoSubmitting) return;
    setIsAutoSubmitting(true);
    try {
      // Helper to convert answer index to letter (A, B, C, ...)
      const indexToLetter = (index: number) => String.fromCharCode(65 + index);

      const questionAnswers = questions.map((q) => {
        const idx = answers[q.id];
        const alpha = typeof idx === 'number'
          ? (q.optionAlphas && q.optionAlphas[idx] ? q.optionAlphas[idx] : indexToLetter(idx))
          : 'X';
        return { questionId: q.id, chosenOption: alpha };
      });

      // When countdown completes, remaining time is 00:00:00
      const remainingTime = '00:00:00';

      const res = await submitTestResults(cbtSessionId, questionAnswers, remainingTime);
      if (res?.isSuccess) {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
        navigate(`/submission-success/${cbtSessionId}`);
      } else {
        // If submission fails, still navigate to summary page to avoid user being stuck
        navigate(`/submission-success/${cbtSessionId}`);
      }
    } catch (_) {
      // Swallow errors to prevent repeated submissions; navigation will still occur
      navigate(`/submission-success/${cbtSessionId}`);
    }
  }, [cbtSessionId, isAutoSubmitting, questions, answers, startTime, navigate]);

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

  // Periodic save every 2 minutes
  useEffect(() => {
    if (!cbtSessionId || questions.length === 0) return;

    periodicSaveRef.current = setInterval(async () => {
      try {
        const qa = Object.entries(answers).map(([questionId, answerIndex]) => {
          const q = questions.find((qq) => qq.id === questionId);
          const alpha = typeof answerIndex === "number"
            ? (q?.optionAlphas && q.optionAlphas[answerIndex] ? q.optionAlphas[answerIndex] : String.fromCharCode(65 + answerIndex))
            : 'X';
          return { questionId, chosenOption: alpha };
        });

        const progress: TestProgress = {
          sessionId: cbtSessionId,
          currentQuestionIndex,
          answers,
          questionAnswers: qa,
          timeRemaining: getMsRemaining(endTime),
          remainingTime: calculateRemainingTime(),
          lastSaved: Date.now(),
          tabSwitchCount,
          tabSwitchHistory,
          isProgressSave: true
        };

        await saveTestProgress(progress, { isPeriodic: true });
        // Reset question counter after periodic save
        setQuestionsSinceLastSave(0);
        setLastSaved(Date.now());
        console.log('Periodic save completed');
      } catch (error) {
        console.error('Periodic save failed:', error);
      }
    }, 120000); // 2 minutes

    return () => {
      if (periodicSaveRef.current) {
        clearInterval(periodicSaveRef.current);
      }
    };
  }, [cbtSessionId, questions.length, currentQuestionIndex, answers, endTime, calculateRemainingTime, tabSwitchCount, tabSwitchHistory, getMsRemaining]);

  // beforeunload handler for saving on page close/refresh
  useEffect(() => {
    if (!cbtSessionId || questions.length === 0) return;

    const handleBeforeUnload = async (event: BeforeUnloadEvent) => {
      // Try to save progress before the page unloads
      const progress: TestProgress = {
        sessionId: cbtSessionId,
        currentQuestionIndex,
        answers,
        timeRemaining: getMsRemaining(endTime),
        remainingTime: calculateRemainingTime(),
        lastSaved: Date.now(),
        tabSwitchCount,
        tabSwitchHistory,
        isProgressSave: true
      };

      // Use sendBeacon for reliability during page unload
      try {
        // Convert answers to the expected format for the API using server-provided optionAlpha
        const questionAnswers = Object.entries(answers).map(([questionId, answerIndex]) => {
          const q = questions.find((qq) => qq.id === questionId);
          const alpha = typeof answerIndex === "number"
            ? (q?.optionAlphas && q.optionAlphas[answerIndex] ? q.optionAlphas[answerIndex] : String.fromCharCode(65 + answerIndex))
            : 'X';
          return { questionId, chosenOption: alpha };
        });
        
        const apiPayload = {
          questionAnswers,
          remainingTime: calculateRemainingTime()
        };
        
        const progressData = JSON.stringify(apiPayload);
        
        // Try sendBeacon first, fallback to sync request if not supported
        if (navigator.sendBeacon) {
          const token = localStorage.getItem("token");
          const blob = new Blob([progressData], { type: 'application/json' });
          // Status: In-Progress for progress saves during active test
          navigator.sendBeacon(`/api/v1/submissions/${cbtSessionId}?status=${TEST_STATUS.IN_PROGRESS}`, blob);
        } else {
          // Fallback: synchronous save (not recommended but better than nothing)
          saveTestProgress(progress, { isBeforeUnload: true });
          console.log('Before unload save completed');
        }
      } catch (error) {
        console.error('Before unload save failed:', error);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [cbtSessionId, questions.length, currentQuestionIndex, answers, endTime, calculateRemainingTime, tabSwitchCount, tabSwitchHistory, getMsRemaining]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      if (periodicSaveRef.current) {
        clearInterval(periodicSaveRef.current);
      }
    };
  }, []);

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
    const newAnswers = { ...answers, [questionId]: optionIndex };
    const wasNewAnswer = !(questionId in answers); // Check if this is a new answer vs updating existing
    setAnswers(newAnswers);
    
    // Update question count for 5-question trigger
    const newQuestionCount = questionsSinceLastSave + (wasNewAnswer ? 1 : 0);
    setQuestionsSinceLastSave(newQuestionCount);
    
    // Check if we need to save due to 5-question threshold
    if (newQuestionCount >= 5) {
      // Immediate save for 5-question threshold
      saveFiveQuestionProgress(newAnswers);
      setQuestionsSinceLastSave(0); // Reset counter
    } else {
      // Trigger debounced save for regular answer changes
      debouncedSave(newAnswers);
    }
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
    enterFullScreen: () => {
      if (isDesktopDevice && isFullscreenSupported()) {
        document.documentElement.requestFullscreen().catch(console.error);
      }
    },
    exitFullScreen: () => document.exitFullscreen && document.exitFullscreen(),
    endTime,
    startTime,
    lastSaved, // Expose last saved timestamp for potential UI feedback
    isDesktopDevice, // Expose desktop detection state to UI
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
    remainingTime: string
  ) => {
    setSubmitting(true);
    setError(null);
    try {
      const result = await submitTestResults(sessionId, questionAnswers, remainingTime);
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
      solution: q.solution,
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

  const getExplanation = async (
    prompt: string,
    options?: { conversationId?: string | null; onToken?: (chunk: string) => void; signal?: AbortSignal }
  ) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getAIExplanation(prompt, options);
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

 