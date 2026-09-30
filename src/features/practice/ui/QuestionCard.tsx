import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { QuestionCardProps } from "../types/testRunnerTypes";
import MathContent from "./MathContent";

const orange = "hsl(var(--brand-orange))";
const cardClassName = "overflow-hidden rounded-[12px] border-[0.5px] border-[#e4e4e1] bg-white shadow-none";
const sectionLabelClassName = "mb-[0.65rem] text-[11px] font-medium uppercase tracking-[0.08em] text-[#aaa]";

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  currentIndex,
  totalQuestions,
  selectedOptionId,
  onSelectAnswer,
  onNextQuestion,
  onPrevQuestion,
  isFirstQuestion,
  isLastQuestion,
  actionButtonSlot,
  footerStatusSlot,
  className = "",
}) => {
  const imageUrl = question.imageUrl ?? "";
  const hasImage =
    typeof imageUrl === "string" &&
    imageUrl.trim() !== "" &&
    imageUrl.toLowerCase() !== "null" &&
    imageUrl.toLowerCase() !== "undefined";

  const isAnswered =
    selectedOptionId !== undefined &&
    selectedOptionId !== null &&
    selectedOptionId !== "";

  return (
    <section className={`min-w-0 flex-1 ${className}`}>
      <h2 className={sectionLabelClassName}>Current question</h2>
      <div className={cardClassName}>
        {/* Question Header */}
        <div className="flex flex-col gap-3 border-b-[0.5px] border-[#f0f0f0] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[14px] font-medium text-[#333]">
              Question {currentIndex + 1} of {totalQuestions}
            </p>
            <p className="mt-1 text-[12px] text-[#aaa]">
              {isAnswered ? "Answered" : "Not answered yet"}
            </p>
          </div>

          {question.tag && (
            <span className="w-fit rounded-[6px] border-[0.5px] border-[#e7e7e4] bg-[#fafafa] px-2.5 py-1 text-[12px] font-medium text-[#666]">
              {question.tag}
            </span>
          )}
        </div>

        {/* Question Content & Options */}
        <div className="px-5 py-5">
          <div className="space-y-6">
            {question.section && (
              <MathContent
                content={question.section}
                className="mb-4 text-[13px] font-medium leading-6 text-[#888]"
              />
            )}

            <MathContent
              content={question.content}
              className="text-[16px] leading-8 text-[#222]"
            />

            {hasImage && (
              <img
                src={imageUrl}
                alt={`Question illustration ${currentIndex + 1}`}
                className="my-4 h-auto max-w-full rounded-[10px] border-[0.5px] border-[#e8e8e5]"
              />
            )}

            <RadioGroup
              key={question.id}
              value={selectedOptionId ?? ""}
              onValueChange={(value) => onSelectAnswer(question.id, value)}
              className="space-y-3"
            >
              {question.options.map((option, optIdx) => {
                const isSelected = selectedOptionId === option.id;
                const optionKey = `${question.id}-${option.id || optIdx}`;

                const optImg = option.imageUrl ?? "";
                const hasOptionImage =
                  typeof optImg === "string" &&
                  optImg.trim() !== "" &&
                  optImg.toLowerCase() !== "null" &&
                  optImg.toLowerCase() !== "undefined";

                return (
                  <Label
                    key={optionKey}
                    htmlFor={`option-${optionKey}`}
                    className="flex cursor-pointer items-start gap-3 rounded-[10px] border-[0.5px] p-4 transition-colors"
                    style={{
                      borderColor: isSelected ? "hsl(25 95% 53% / 0.35)" : "#e8e8e5",
                      backgroundColor: isSelected ? "hsl(25 95% 53% / 0.08)" : "#fff",
                    }}
                  >
                    <RadioGroupItem
                      value={option.id}
                      id={`option-${optionKey}`}
                      className="mt-1"
                    />
                    <span className="min-w-0 flex-1 text-[14px] leading-7 text-[#444]">
                      {option.content && (
                        <MathContent content={option.content} inline />
                      )}
                      {hasOptionImage && (
                        <img
                          src={optImg}
                          alt={`Option ${option.label || optIdx + 1}`}
                          className="mt-2 max-h-40 rounded-md border-[0.5px] border-[#e8e8e5] object-contain"
                        />
                      )}
                    </span>
                  </Label>
                );
              })}
            </RadioGroup>
          </div>

          {/* Actions Footer */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t-[0.5px] border-[#f0f0f0] pt-4">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={onPrevQuestion}
                disabled={isFirstQuestion}
                className="rounded-[8px] border-[0.5px] border-[#e4e4e1] bg-white text-[13px] text-[#666] shadow-none hover:bg-[#fafafa]"
              >
                <ChevronLeft className="mr-1.5 h-[13px] w-[13px]" strokeWidth={1.75} /> Previous
              </Button>
              <Button
                onClick={onNextQuestion}
                disabled={isLastQuestion}
                className="rounded-[8px] border-0 text-[13px] font-medium text-white shadow-none hover:opacity-90"
                style={{ backgroundColor: orange }}
              >
                Next <ChevronRight className="ml-1.5 h-[13px] w-[13px]" strokeWidth={1.75} />
              </Button>
            </div>

            {actionButtonSlot && (
              <div className="flex min-w-0 flex-1 justify-end">
                {actionButtonSlot}
              </div>
            )}
          </div>

          {footerStatusSlot && (
            <div className="mt-4">
              {footerStatusSlot}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default QuestionCard;
