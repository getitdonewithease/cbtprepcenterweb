import { useState, useEffect } from 'react';
import { getTestQuestions, submitTestResults, getTestResults, getAIExplanation, saveQuestion } from '../api/practiceApi';
import { Question, ReviewQuestion, AIExplanationResponse, TestResultsApiResponse, SubmissionQuestionResponse, PracticeQuestionResponse, PracticeQuestionOptionResponse } from '../types/practiceTypes';
import { getErrorMessage } from '@/core/errors';

const getPracticeOptionAlpha = (option: PracticeQuestionOptionResponse) => option.optionAlpha ?? option.label ?? "";
const getPracticeOptionContent = (option: PracticeQuestionOptionResponse) => option.optionContent ?? option.content ?? "";

const mapPracticeQuestionResponse = (question: PracticeQuestionResponse): Question => {
  const optionAlphas = question.optionCommandResponses.map(getPracticeOptionAlpha);

  return {
    id: question.questionId,
    text: question.questionContent,
    options: question.optionCommandResponses.map(getPracticeOptionContent),
    subject: question.subjectName,
    examType: question.examType,
    examYear: question.examYear,
    imageUrl: question.imageUrl || undefined,
    section: question.section || undefined,
    optionAlphas,
    optionImages: question.optionCommandResponses.map((option) => option.imageUrl || undefined),
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
        const mappedQuestions = fetchedQuestions.map((question) => ({
          ...mapPracticeQuestionResponse(question),
          section: question.section ? `Section: ${question.section}` : undefined,
          correctAnswer: undefined, // Not available from API
        }));
        setQuestions(mappedQuestions);
      } catch (error: unknown) {
        setError(getErrorMessage(error, 'Failed to fetch test questions'));
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
    } catch (error: unknown) {
      setError(getErrorMessage(error, 'Failed to submit test'));
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  return { submitTest, submitting, error };
};

// New hooks for test review functionality
/** enabled: false until the test is marked (the API has no review before that). */
export const useTestReview = (sessionId: string, enabled = true) => {
  const [reviewData, setReviewData] = useState<
    | (ReturnType<typeof mapApiToReviewData>)
    | null
  >(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTestResults = async () => {
      if (!sessionId || !enabled) return;
      setLoading(true);
      setError(null);
      try {
        const results: TestResultsApiResponse = await getTestResults(sessionId);
        setReviewData(mapApiToReviewData(results));
      } catch (error: unknown) {
        setError(getErrorMessage(error, 'Failed to fetch test results'));
      } finally {
        setLoading(false);
      }
    };
    fetchTestResults();
  }, [sessionId, enabled]);

  return { reviewData, loading, error };
};

function mapApiToReviewData(results: TestResultsApiResponse) {
  // Map the API response to our ReviewQuestion format
  const mappedQuestions: ReviewQuestion[] = results.submissionQuestions.map((q: SubmissionQuestionResponse) => {
    // Find the correct answer index
    const correctAnswerIndex = q.optionCommandResponses.findIndex((opt) => opt.isCorrect);
    // Find the user's answer index
    const userAnswerIndex = q.optionCommandResponses.findIndex((opt) => getPracticeOptionAlpha(opt) === q.chosenOption);
    return {
      id: q.questionId,
      text: q.questionContent,
      options: q.optionCommandResponses.map(getPracticeOptionContent),
      correctAnswer: correctAnswerIndex,
      subject: q.subjectName,
      examType: q.examType,
      examYear: q.examYear,
      imageUrl: q.imageUrl || undefined,
      section: q.section || undefined,
      optionAlphas: q.optionCommandResponses.map(getPracticeOptionAlpha),
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
    options?: {
      conversationId?: string | null;
      onToken?: (chunk: string) => void;
      onComplete?: (fullContent: string) => void;
      signal?: AbortSignal;
    }
  ) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getAIExplanation(prompt, options);
      setExplanation(result);
      return result;
    } catch (error: unknown) {
      setError(getErrorMessage(error, 'Failed to get AI explanation'));
      throw error;
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
    } catch (error: unknown) {
      setError(getErrorMessage(error, 'Failed to save question'));
      throw error;
    } finally {
      setSaving(false);
    }
  };

  return { saveQuestion: saveQuestionHandler, saving, error };
}; 

 
