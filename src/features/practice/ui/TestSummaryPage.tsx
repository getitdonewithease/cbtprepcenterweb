import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowLeftRight,
  ArrowRight,
  Check,
  ClipboardList,
  type LucideIcon,
} from "lucide-react";

import { useCbtSessionConfiguration } from "../hooks/usePractice";
import type { ExamConfig, PreparedQuestion } from "../types/practiceTypes";

type CbtSessionSummaryConfig = ExamConfig & {
  preparedQuestion?: PreparedQuestion;
  examType?: string;
};

type SummaryRow = {
  label: string;
  description?: string;
  badge: string;
  variant?: "utme" | "neutral";
};

type InstructionGroup = {
  title: string;
  icon: LucideIcon;
  items: React.ReactNode[];
};

const orange = "hsl(var(--brand-orange))";
const orangeText = "hsl(25 85% 45%)";

const formatCount = (count: number, singular: string, plural: string) =>
  `${count} ${count === 1 ? singular : plural}`;

const getExamType = (config: CbtSessionSummaryConfig) =>
  config.examType?.trim() || "UTME";

const TestSummaryPage: React.FC = () => {
  const { cbtSessionId } = useParams<{ cbtSessionId: string }>();
  const navigate = useNavigate();
  const { config, loading, error } = useCbtSessionConfiguration(cbtSessionId || "");
  const [hasConfirmedInstructions, setHasConfirmedInstructions] = useState(false);

  const summaryConfig = config as CbtSessionSummaryConfig | null;

  const subjects = useMemo(
    () =>
      Object.entries(summaryConfig?.preparedQuestion ?? {}).map(([subjectName, questionCount]) => ({
        subjectName,
        questionCount,
      })),
    [summaryConfig?.preparedQuestion],
  );

  const examType = summaryConfig ? getExamType(summaryConfig) : "UTME";
  const totalQuestions = summaryConfig?.totalQuestionsCount ?? 0;
  const totalMarks = totalQuestions;

  const summaryRows: SummaryRow[] = summaryConfig
    ? [
        {
          label: "Exam type",
          description: "Nigerian Universities Matriculation Examination",
          badge: examType,
          variant: examType.toLowerCase() === "utme" ? "utme" : "neutral",
        },
        {
          label: "Duration",
          description: "Timer starts immediately",
          badge: summaryConfig.duration,
        },
        {
          label: "Total questions",
          badge: formatCount(totalQuestions, "question", "questions"),
        },
        {
          label: "Total marks",
          description: "1 mark per question",
          badge: formatCount(totalMarks, "mark", "marks"),
        },
      ]
    : [];

  const instructionGroups: InstructionGroup[] = [
    {
      title: "Scoring",
      icon: ClipboardList,
      items: [
        <>
          Each question carries <strong className="font-medium text-[#333]">1 mark</strong>.
        </>,
        <>
          <strong className="font-medium text-[#333]">No negative marking</strong> — wrong answers do not deduct marks.
        </>,
        <>
          Unattempted questions score <strong className="font-medium text-[#333]">0 marks</strong>.
        </>,
      ],
    },
    {
      title: "Navigation",
      icon: ArrowLeftRight,
      items: [
        <>
          Use <strong className="font-medium text-[#333]">Next / Previous</strong> buttons or the question navigator panel to jump between questions.
        </>,
        <>
          You can <strong className="font-medium text-[#333]">change your answer</strong> at any time before submitting.
        </>,
        <>
          You can <strong className="font-medium text-[#333]">flag questions</strong> for review using the flag icon on each question.
        </>,
      ],
    },
    {
      title: "Rules",
      icon: AlertTriangle,
      items: [
        <>
          The test will <strong className="font-medium text-[#333]">auto-submit</strong> when time expires.
        </>,
        <>
          Do not <strong className="font-medium text-[#333]">refresh or close the tab</strong> — your progress may be lost.
        </>,
        <>
          Use of calculators, external resources, or AI tools is <strong className="font-medium text-[#333]">strictly prohibited</strong>.
        </>,
      ],
    },
  ];

  const handleBeginTest = () => {
    if (!summaryConfig || !cbtSessionId || !hasConfirmedInstructions) return;

    navigate(`/practice/test/${cbtSessionId}`, { state: { duration: summaryConfig.duration } });
  };

  const cardClassName = "overflow-hidden rounded-[12px] border-[0.5px] border-[#e5e5e5] bg-white shadow-none";
  const sectionLabelClassName =
    "mb-[0.6rem] text-[11px] font-medium uppercase tracking-[0.08em] text-[#aaa]";

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f5f5f3] px-5">
        <div className="mx-auto max-w-[680px] pb-16 pt-10">
          <p className="text-[14px] text-[#777]">Loading test summary...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[#f5f5f3] px-5">
        <div className="mx-auto max-w-[680px] pb-16 pt-10">
          <h1 className="text-[22px] font-medium text-[#111]">Test Summary</h1>
          <p className="mt-2 text-[14px] text-red-600">{error}</p>
        </div>
      </main>
    );
  }

  if (!summaryConfig) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[#f5f5f3] px-5">
      <div className="mx-auto max-w-[680px] pb-16 pt-10">
        <header>
          <h1 className="text-[22px] font-medium leading-tight text-[#111]">Test Summary</h1>
          <p className="mt-1 text-[14px] leading-normal text-[#666]">
            Review your setup before beginning — you cannot change this once the timer starts.
          </p>
        </header>

        <section className="mt-7">
          <h2 className={sectionLabelClassName}>Exam details</h2>
          <div className={cardClassName}>
            {summaryRows.map((row, index) => (
              <div
                key={row.label}
                className="flex items-center justify-between gap-4 px-5 py-[0.875rem]"
                style={{
                  borderBottom:
                    index === summaryRows.length - 1 ? "none" : "0.5px solid #f0f0f0",
                }}
              >
                <div>
                  <p className="text-[14px] leading-tight text-[#333]">{row.label}</p>
                  {row.description ? (
                    <p className="mt-1 text-[12px] leading-tight text-[#aaa]">{row.description}</p>
                  ) : null}
                </div>
                <span
                  className="shrink-0 rounded-[6px] px-[10px] py-[3px] text-[12px] font-medium leading-none"
                  style={{
                    backgroundColor:
                      row.variant === "utme" ? "hsl(25 95% 53% / 0.1)" : "#f3f3f3",
                    color: row.variant === "utme" ? orangeText : "#555",
                  }}
                >
                  {row.badge}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6">
          <h2 className={sectionLabelClassName}>Subjects</h2>
          <div className={cardClassName}>
            <div className="flex flex-col gap-[0.4rem] px-5 py-[0.875rem]">
              {subjects.length > 0 ? (
                subjects.map(({ subjectName, questionCount }) => (
                  <div
                    key={subjectName}
                    className="flex items-center justify-between gap-4 rounded-[8px] border-[0.5px] border-[#eee] bg-[#fafafa] px-[0.875rem] py-[0.6rem]"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        className="h-[6px] w-[6px] shrink-0 rounded-full"
                        style={{ backgroundColor: orange }}
                      />
                      <span className="truncate text-[13px] text-[#444]">{subjectName}</span>
                    </div>
                    <span className="shrink-0 text-[13px] font-medium text-[#999]">
                      {formatCount(questionCount, "question", "questions")}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-[13px] text-[#999]">No subjects configured for this test.</p>
              )}
            </div>
          </div>
        </section>

        <section className="mt-6">
          <h2 className={sectionLabelClassName}>Instructions &amp; rules</h2>
          <div className={cardClassName}>
            <div className="p-5">
              {instructionGroups.map((group, index) => {
                const Icon = group.icon;

                return (
                  <React.Fragment key={group.title}>
                    {index > 0 ? <div className="my-4 border-t-[0.5px] border-[#f0f0f0]" /> : null}
                    <div>
                      <div className="mb-3 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.06em] text-[#bbb]">
                        <Icon className="h-[13px] w-[13px]" strokeWidth={1.75} />
                        <span>{group.title}</span>
                      </div>
                      <ul className="space-y-2">
                        {group.items.map((item, itemIndex) => (
                          <li
                            key={`${group.title}-${itemIndex}`}
                            className="flex gap-2 text-[13px] leading-[1.6] text-[#666]"
                          >
                            <span className="mt-[0.55rem] h-[3px] w-[3px] shrink-0 rounded-full bg-[#ccc]" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>

            <label className="flex cursor-pointer items-center gap-3 border-t-[0.5px] border-[#f0f0f0] px-5 py-[0.875rem]">
              <input
                type="checkbox"
                checked={hasConfirmedInstructions}
                onChange={(event) => setHasConfirmedInstructions(event.target.checked)}
                className="sr-only"
              />
              <span
                className="flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border-[1.5px]"
                style={{
                  borderColor: orange,
                  backgroundColor: hasConfirmedInstructions ? "hsl(25 95% 53% / 0.08)" : "white",
                }}
                aria-hidden="true"
              >
                {hasConfirmedInstructions ? (
                  <Check className="h-[11px] w-[11px]" style={{ color: orangeText }} strokeWidth={3} />
                ) : null}
              </span>
              <span className="text-[13px] leading-normal text-[#666]">
                I have read and understood the instructions above
              </span>
            </label>
          </div>
        </section>

        <footer className="mt-7 flex items-center justify-between gap-4 border-t-[0.5px] border-[#ebebeb] pt-5">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center gap-1.5 border-0 bg-transparent p-0 text-[13px] text-[#999] transition-colors hover:text-[#555]"
          >
            <ArrowLeft className="h-[13px] w-[13px]" strokeWidth={1.75} />
            <span>Back to dashboard</span>
          </button>
          <button
            type="button"
            onClick={handleBeginTest}
            disabled={!hasConfirmedInstructions || !cbtSessionId}
            className="inline-flex items-center gap-1.5 rounded-[8px] border-0 px-6 py-2.5 text-[14px] font-medium text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
            style={{ backgroundColor: orange }}
          >
            <span>Begin test</span>
            <ArrowRight className="h-[14px] w-[14px]" strokeWidth={1.75} />
          </button>
        </footer>
      </div>
    </main>
  );
};

export default TestSummaryPage;
