import React, { useMemo } from "react";
import { CheckCircle, Circle } from "lucide-react";
import { QuestionNavigatorProps, TestRunnerQuestion } from "../types/testRunnerTypes";

const orange = "hsl(var(--brand-orange))";
const orangeText = "hsl(25 85% 45%)";
const cardClassName = "overflow-hidden rounded-[12px] border-[0.5px] border-[#e4e4e1] bg-white shadow-none";
const sectionLabelClassName = "mb-[0.65rem] text-[11px] font-medium uppercase tracking-[0.08em] text-[#aaa]";

export const QuestionNavigator: React.FC<QuestionNavigatorProps> = ({
  questions,
  currentIndex,
  answers,
  selectedSubject,
  onSelectSubject,
  onJumpToQuestion,
  className = "",
}) => {
  // Group questions by subject
  const questionsBySubject = useMemo(() => {
    return questions.reduce((acc, question, index) => {
      const subject = question.subject?.trim() || "General";
      if (!acc[subject]) {
        acc[subject] = [];
      }
      acc[subject].push({ ...question, index });
      return acc;
    }, {} as Record<string, Array<TestRunnerQuestion & { index: number }>>);
  }, [questions]);

  const subjects = useMemo(() => Object.keys(questionsBySubject), [questionsBySubject]);

  const handleSubjectClick = (subject: string) => {
    onSelectSubject(subject);
    const subjectQuestions = questionsBySubject[subject];
    if (subjectQuestions && subjectQuestions.length > 0) {
      onJumpToQuestion(subjectQuestions[0].index);
    }
  };

  const activeSubject = selectedSubject || subjects[0] || "";
  const currentSubjectQuestions = questionsBySubject[activeSubject] || [];

  return (
    <aside className={`w-full flex-shrink-0 lg:sticky lg:top-8 lg:w-[360px] ${className}`}>
      <h2 className={sectionLabelClassName}>Questions</h2>
      <div className={cardClassName}>
        {/* Header */}
        <div className="flex items-center justify-between border-b-[0.5px] border-[#f0f0f0] px-5 py-[0.875rem]">
          <span className="text-[14px] font-medium text-[#333]">Navigator</span>
          <span className="text-[12px] text-[#aaa]">
            {questions.length > 0 ? `${currentIndex + 1} / ${questions.length}` : "0 / 0"}
          </span>
        </div>

        {/* Subject tabs */}
        {subjects.length > 1 && (
          <div className="border-b-[0.5px] border-[#f0f0f0] px-5 py-4">
            <div className="flex flex-wrap gap-1.5">
              {subjects.map((subject) => {
                const isSelected = activeSubject.toLowerCase() === subject.toLowerCase();

                return (
                  <button
                    key={subject}
                    type="button"
                    className="rounded-[7px] px-3 py-1.5 text-[12px] capitalize transition-colors"
                    style={{
                      backgroundColor: isSelected ? "hsl(25 95% 53% / 0.1)" : "#f7f7f5",
                      color: isSelected ? orangeText : "#777",
                    }}
                    onClick={() => handleSubjectClick(subject)}
                  >
                    {subject}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Question grid */}
        <div className="px-5 py-4">
          <div className="grid grid-cols-6 gap-2">
            {currentSubjectQuestions.map(({ index, id }, subjectIdx) => {
              const isCurrent = currentIndex === index;
              const answerVal = answers[id];
              const isAnswered = answerVal !== undefined && answerVal !== null && answerVal !== "";

              return (
                <button
                  key={id || index}
                  type="button"
                  className="flex aspect-square h-10 w-full items-center justify-center rounded-[8px] border-[0.5px] text-[12px] font-medium transition-colors"
                  style={{
                    borderColor: isCurrent ? orange : isAnswered ? "#cfe5d6" : "#e8e8e5",
                    backgroundColor: isCurrent ? "hsl(25 95% 53% / 0.1)" : "#fff",
                    color: isCurrent ? orangeText : isAnswered ? "#287245" : "#999",
                  }}
                  onClick={() => onJumpToQuestion(index)}
                  aria-label={`Question ${subjectIdx + 1} (${isAnswered ? "Answered" : "Unanswered"})`}
                >
                  {isAnswered ? (
                    <CheckCircle className="h-[15px] w-[15px]" strokeWidth={1.9} />
                  ) : (
                    subjectIdx + 1
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-5 grid grid-cols-2 gap-2 border-t-[0.5px] border-[#f0f0f0] pt-4">
            <div className="flex items-center gap-1.5 text-[12px] text-[#777]">
              <CheckCircle className="h-[14px] w-[14px] text-[#287245]" strokeWidth={1.9} />
              <span>Answered</span>
            </div>
            <div className="flex items-center gap-1.5 text-[12px] text-[#777]">
              <Circle className="h-[14px] w-[14px] text-[#aaa]" strokeWidth={1.9} />
              <span>Unanswered</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default QuestionNavigator;
