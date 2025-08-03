import { useState, useEffect } from 'react';
import { getSavedQuestions, removeSavedQuestion } from '../api/savedQuestionsApi';
import { SavedQuestion, SavedQuestionApiResponse } from '../types/savedQuestionsTypes';

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
          note: q.note || undefined,
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