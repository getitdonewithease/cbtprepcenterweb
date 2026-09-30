import React from "react";
import { Target } from "lucide-react";
import { ReviewPerformanceCardProps } from "../types/testReviewTypes";

const orange = "hsl(var(--brand-orange))";
const sectionLabelClassName = "mb-[0.65rem] text-[11px] font-medium uppercase tracking-[0.08em] text-[#aaa]";
const cardClassName = "overflow-hidden rounded-[12px] border-[0.5px] border-[#e4e4e1] bg-white shadow-none";

export const ReviewPerformanceCard: React.FC<ReviewPerformanceCardProps> = ({
  performance,
  className = "",
}) => {
  const {
    accuracy,
    totalQuestions,
    correctAnswers,
    wrongAnswers,
    unattemptedAnswers = 0,
    scorePercent = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0,
    customMetrics,
  } = performance;

  const defaultMetrics = [
    { label: "Correct", value: correctAnswers, color: "#287245" },
    { label: "Wrong", value: wrongAnswers, color: "#b6423b" },
    { label: "Skipped", value: unattemptedAnswers, color: "#aaa" },
  ];

  const metricsToDisplay = customMetrics && customMetrics.length > 0 ? customMetrics : defaultMetrics;
  const colCountClass = metricsToDisplay.length === 3 ? "md:grid-cols-4" : metricsToDisplay.length === 4 ? "md:grid-cols-5" : "md:grid-cols-4";

  return (
    <section className={`mb-7 ${className}`}>
      <h2 className={sectionLabelClassName}>Performance overview</h2>
      <div className={cardClassName}>
        <div className={`grid grid-cols-2 border-b-[0.5px] border-[#f0f0f0] ${colCountClass}`}>
          {/* Accuracy Tile */}
          <div className="col-span-2 border-b-[0.5px] border-[#f0f0f0] px-5 py-5 md:col-span-1 md:border-b-0 md:border-r-[0.5px]">
            <div className="mb-1 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.06em] text-[#aaa]">
              <Target className="h-[13px] w-[13px]" strokeWidth={1.75} />
              <span>Accuracy</span>
            </div>
            <div className="text-[30px] font-medium leading-none text-[#111]">
              {Math.round(accuracy)}%
            </div>
            <p className="mt-2 text-[12px] leading-normal text-[#999]">
              {correctAnswers} correct out of {totalQuestions}
            </p>
          </div>

          {/* Metric Tiles */}
          {metricsToDisplay.map((item, index) => (
            <div
              key={item.label}
              className="px-5 py-5"
              style={{
                borderRight:
                  index === metricsToDisplay.length - 1 ? "none" : "0.5px solid #f0f0f0",
              }}
            >
              <p className="text-[12px] text-[#aaa]">{item.label}</p>
              <p className="mt-1 text-[24px] font-medium leading-none" style={{ color: item.color }}>
                {item.value}
              </p>
            </div>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="px-5 py-4">
          <div className="h-[7px] overflow-hidden rounded-full bg-[#eee]">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, scorePercent))}%`, backgroundColor: orange }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-[12px] text-[#aaa]">
            <span>Correct answers</span>
            <span>{Math.round(scorePercent)}%</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReviewPerformanceCard;
