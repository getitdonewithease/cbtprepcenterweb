import React, { useState, useEffect } from "react";
import { TestRunnerViewProps } from "../types/testRunnerTypes";
import QuestionNavigator from "./QuestionNavigator";
import QuestionCard from "./QuestionCard";

const pageShellClassName = "min-h-screen bg-[#f5f5f3] px-4 py-5 text-[#222] md:px-8 md:py-8";

export const TestRunnerView = <TRaw,>({
  questions,
  currentIndex,
  answers,
  onSelectAnswer,
  onNextQuestion,
  onPrevQuestion,
  onJumpToQuestion,
  headerSlot,
  alertsSlot,
  actionButtonSlot,
  footerStatusSlot,
  containerClassName = "",
}: TestRunnerViewProps<TRaw>) => {
  const currentQuestion = questions[currentIndex];

  const [selectedSubject, setSelectedSubject] = useState<string>("");

  // Automatically sync selectedSubject with currentQuestion's subject
  useEffect(() => {
    if (currentQuestion?.subject) {
      setSelectedSubject(currentQuestion.subject);
    } else if (questions.length > 0 && !selectedSubject) {
      setSelectedSubject(questions[0].subject);
    }
  }, [currentQuestion?.subject, questions]);

  if (!questions || questions.length === 0 || !currentQuestion) {
    return null;
  }

  const selectedOptionId = answers[currentQuestion.id]?.toString();

  return (
    <div className={`${pageShellClassName} ${containerClassName}`}>
      <div className="mx-auto max-w-[1180px]">
        {/* Header Slot (Timer, Back Button, Status Badges) */}
        {headerSlot && <div className="mb-7">{headerSlot}</div>}

        {/* Alerts Slot (Fullscreen Warning, Anti-Cheat Notices) */}
        {alertsSlot && <div className="mb-7">{alertsSlot}</div>}

        {/* Responsive Two-Column Layout */}
        <div className="flex w-full flex-col gap-7 lg:flex-row lg:items-start">
          <QuestionNavigator
            questions={questions}
            currentIndex={currentIndex}
            answers={answers}
            selectedSubject={selectedSubject}
            onSelectSubject={setSelectedSubject}
            onJumpToQuestion={onJumpToQuestion}
          />

          <QuestionCard
            question={currentQuestion}
            currentIndex={currentIndex}
            totalQuestions={questions.length}
            selectedOptionId={selectedOptionId}
            onSelectAnswer={onSelectAnswer}
            onNextQuestion={onNextQuestion}
            onPrevQuestion={onPrevQuestion}
            isFirstQuestion={currentIndex === 0}
            isLastQuestion={currentIndex === questions.length - 1}
            actionButtonSlot={actionButtonSlot}
            footerStatusSlot={footerStatusSlot}
          />
        </div>
      </div>
    </div>
  );
};

export default TestRunnerView;
