import React, { useMemo } from "react";
import { BookOpen, CheckCircle, XCircle } from "lucide-react";
import { ReviewQuestionNavigatorProps } from "../types/testReviewTypes";
import { ReviewQuestion } from "../types/practiceTypes";

const orange = "hsl(var(--brand-orange))";
const orangeText = "hsl(25 85% 45%)";
const sectionLabelClassName = "mb-[0.65rem] text-[11px] font-medium uppercase tracking-[0.08em] text-[#aaa]";
const cardClassName = "overflow-hidden rounded-[12px] border-[0.5px] border-[#e4e4e1] bg-white shadow-none";

export const ReviewQuestionNavigator: React.FC<ReviewQuestionNavigatorProps> = ({
  questions,
  currentIndex,
  selectedSubject,
  onSelectSubject,
  onJumpToQuestion,
  className = "",
}) => {
  // Group questions by subject with original index
  const questionsBySubject = useMemo(() => {
    return questions.reduce((acc, question, index) => {
      const subject = question.subject || "General";
      if (!acc[subject]) {
        acc[subject] = [];
      }
      acc[subject].push({ ...question, index });
      return acc;
    }, {} as Record<string, Array<ReviewQuestion & { index: number }>>);
  }, [questions]);

  const subjects = useMemo(() => Object.keys(questionsBySubject), [questionsBySubject]);

  // Questions to display in the grid for currently selected subject
  const currentSubjectQuestions = useMemo(() => {
    if (selectedSubject && questionsBySubject[selectedSubject]) {
      return questionsBySubject[selectedSubject];
    }
    // Fallback: if selected subject not found or empty, return first subject or all
    if (subjects.length > 0 && questionsBySubject[subjects[0]]) {
      return questionsBySubject[subjects[0]];
    }
    return questions.map((q, index) => ({ ...q, index }));
  }, [selectedSubject, questionsBySubject, subjects, questions]);

  return (
    <aside className={`w-full flex-shrink-0 lg:sticky lg:top-8 lg:w-[360px] ${className}`}>
      <h2 className={sectionLabelClassName}>Questions</h2>
      <div className={cardClassName}>
        {/* Header */}
        <div className="flex items-center justify-between border-b-[0.5px] border-[#f0f0f0] px-5 py-[0.875rem]">
          <div className="flex items-center gap-2">
            <BookOpen className="h-[15px] w-[15px] text-[#999]" strokeWidth={1.75} />
            <span className="text-[14px] font-medium text-[#333]">Navigator</span>
          </div>
          <span className="text-[12px] text-[#aaa]">
            {currentIndex + 1} / {questions.length}
          </span>
        </div>

        {/* Subject Pills (shown when multiple subjects exist or at least one) */}
        {subjects.length > 0 && (
          <div className="border-b-[0.5px] border-[#f0f0f0] px-5 py-4">
            <div className="flex flex-wrap gap-1.5">
              {subjects.map((subject) => {
                const isSelected = selectedSubject === subject;

                return (
                  <button
                    key={subject}
                    type="button"
                    className="rounded-[7px] px-3 py-1.5 text-[12px] capitalize transition-colors"
                    style={{
                      backgroundColor: isSelected ? "hsl(25 95% 53% / 0.1)" : "#f7f7f5",
                      color: isSelected ? orangeText : "#777",
                    }}
                    onClick={() => onSelectSubject(subject)}
                  >
                    {subject}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Questions Grid */}
        <div className="px-5 py-4">
          <div className="grid grid-cols-6 gap-2">
            {currentSubjectQuestions.map(({ index, isCorrect, userAnswer }) => {
              const isCurrent = currentIndex === index;
              const wasAttempted = userAnswer !== undefined && userAnswer !== null;
              const statusColor = isCorrect ? "#287245" : wasAttempted ? "#b6423b" : "#aaa";

              return (
                <button
                  key={index}
                  type="button"
                  className="flex aspect-square h-10 w-full items-center justify-center rounded-[8px] border-[0.5px] text-[12px] font-medium transition-colors"
                  style={{
                    borderColor: isCurrent
                      ? orange
                      : isCorrect
                      ? "#cfe5d6"
                      : wasAttempted
                      ? "#ebd0cd"
                      : "#e8e8e5",
                    backgroundColor: isCurrent ? "hsl(25 95% 53% / 0.1)" : "#fff",
                    color: isCurrent ? orangeText : statusColor,
                  }}
                  onClick={() => onJumpToQuestion(index)}
                  aria-label={`Jump to question ${index + 1}`}
                >
                  {isCorrect ? (
                    <CheckCircle className="h-[15px] w-[15px]" strokeWidth={1.9} />
                  ) : wasAttempted ? (
                    <XCircle className="h-[15px] w-[15px]" strokeWidth={1.9} />
                  ) : (
                    index + 1
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-5 grid grid-cols-3 gap-2 border-t-[0.5px] border-[#f0f0f0] pt-4">
            <div className="flex items-center gap-1.5 text-[12px] text-[#777]">
              <CheckCircle className="h-[14px] w-[14px] text-[#287245]" strokeWidth={1.9} />
              <span>Correct</span>
            </div>
            <div className="flex items-center gap-1.5 text-[12px] text-[#777]">
              <XCircle className="h-[14px] w-[14px] text-[#b6423b]" strokeWidth={1.9} />
              <span>Wrong</span>
            </div>
            <div className="flex items-center gap-1.5 text-[12px] text-[#777]">
              <span className="h-[10px] w-[10px] rounded-[3px] border-[0.5px] border-[#ccc]" />
              <span>Skipped</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default ReviewQuestionNavigator;
