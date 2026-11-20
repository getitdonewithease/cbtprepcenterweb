import type { LucideIcon } from "lucide-react";
import { Brain, Lightbulb, MonitorCheck, Trophy } from "lucide-react";
import { cn } from "@/core/ui/cn";
import {
  AiExplanationDemo,
  CbtDemo,
  DemoWrapper,
  LeaderboardDemo,
  RecommendationsMockup,
} from "./FeatureDemos";

/**
 * Features in the order a candidate uses them: practise, learn from mistakes, know what
 * to study next, see your rank. CBT practice is a core feature but not a differentiator
 * (PRODUCT.md), so the AI tutor alone gets the larger "lead" heading.
 */

interface Feature {
  id: string;
  icon: LucideIcon;
  title: string;
  body: string;
  points: string[];
  /** The lead feature gets a larger heading */
  isLead?: boolean;
  demo: JSX.Element;
}

const FEATURES: Feature[] = [
  {
    id: "cbt-practice",
    icon: MonitorCheck,
    title: "Timed CBT practice",
    body: "Take timed UTME mocks with a countdown, a question navigator and subject tabs, so the format feels familiar on exam day.",
    points: [
      "Four subjects per mock, as in the UTME",
      "A countdown timer on every test",
      "Pick your own four-subject combination",
    ],
    // swap in src="/demos/cbt.mp4" when the recording is ready
    demo: (
      <DemoWrapper>
        <CbtDemo />
      </DemoWrapper>
    ),
  },
  {
    id: "ai-tutor",
    icon: Brain,
    title: "AI explanations for every wrong answer",
    body: "Get a question wrong and the AI tutor walks you through it step by step. Ask follow-up questions until it makes sense, at any hour.",
    points: [
      "Step-by-step working, not just the answer",
      "Ask follow-up questions in a chat",
      "Available any time, even the night before",
    ],
    isLead: true,
    // swap in src="/demos/ai-explanation.mp4" when the recording is ready
    demo: (
      <DemoWrapper>
        <AiExplanationDemo />
      </DemoWrapper>
    ),
  },
  {
    id: "study-plan",
    icon: Lightbulb,
    title: "Know what to study next",
    body: "After each test, Fasiti shows how your score and accuracy are moving, finds the topics where your proficiency is lowest, and points you to resources for each one.",
    points: [
      "Score trend across your recent tests",
      "Weak topics found from your test results",
      "Study resources for each topic",
    ],
    // swap in src="/screenshots/recommendations.png" when ready
    demo: (
      <DemoWrapper>
        <RecommendationsMockup />
      </DemoWrapper>
    ),
  },
  {
    id: "leaderboard",
    icon: Trophy,
    title: "National Leaderboard",
    body: "See how your scores rank against other Fasiti candidates across Nigeria, and watch your place change as you improve.",
    points: [
      "Rankings for each subject",
      "View this week, this month, this year or all time",
      "Ranked by score, accuracy and speed",
    ],
    // swap in src="/demos/leaderboard.mp4" when the recording is ready
    demo: (
      <DemoWrapper>
        <LeaderboardDemo />
      </DemoWrapper>
    ),
  },
];

interface FeatureRowProps {
  feature: Feature;
  /** Puts the demo on the left at md+; text always comes first on phones */
  isFlipped: boolean;
}

const FeatureRow = ({ feature, isFlipped }: FeatureRowProps) => {
  const { icon: Icon, title, body, points, isLead, demo } = feature;
  return (
    <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-2 md:gap-16">
      <div className={cn(isFlipped && "md:order-last")}>
        <div className="mb-5 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-orange/[0.12]">
          <Icon className="h-5 w-5 text-brand-orange" aria-hidden="true" />
        </div>
        <h3
          className={cn(
            "mb-3 font-black",
            isLead ? "text-3xl md:text-4xl" : "text-2xl md:text-3xl",
          )}
        >
          {title}
        </h3>
        <p className="mb-6 max-w-prose text-muted-foreground">{body}</p>
        <ul className="space-y-3">
          {points.map((point) => (
            <li key={point} className="flex items-center gap-2.5 text-sm text-muted-foreground">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-orange" aria-hidden="true" />
              {point}
            </li>
          ))}
        </ul>
      </div>
      <div>{demo}</div>
    </div>
  );
};

const FeaturesSection = () => (
  <section id="features" className="py-24">
    <div className="container">
      <div className="mb-16 max-w-2xl">
        <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-brand-orange">
          Features
        </p>
        <h2 className="text-3xl font-black md:text-4xl">From practice test to what to study next</h2>
        <p className="mt-4 text-muted-foreground">
          Practise under exam conditions, learn from every mistake, and know what to work on
          next. The screens below show example data.
        </p>
      </div>

      <div className="space-y-24">
        {FEATURES.map((feature, i) => (
          <FeatureRow key={feature.id} feature={feature} isFlipped={i % 2 === 1} />
        ))}
      </div>
    </div>
  </section>
);

export default FeaturesSection;
