import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
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
  const { title, body, points, isLead, demo } = feature;
  return (
    <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-16">
      <div className={cn(isFlipped && "md:order-last")}>
        <h3
          className={cn(
            "mb-3 text-balance font-display font-extrabold tracking-[-0.02em]",
            isLead ? "text-3xl md:text-4xl" : "text-2xl md:text-3xl",
          )}
        >
          {title}
        </h3>
        <p className="mb-6 max-w-prose text-pretty text-muted-foreground">{body}</p>
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
        <h2 className="text-balance font-display text-3xl font-extrabold tracking-[-0.02em] md:text-4xl">
          From practice test to what to study next
        </h2>
        <p className="mt-4 text-pretty text-muted-foreground">
          Practise under exam conditions, learn from every mistake, and know what to work on
          next. The screens below show example data.
        </p>
      </div>

      <div className="space-y-16 md:space-y-20">
        {FEATURES.map((feature, i) => (
          <FeatureRow key={feature.id} feature={feature} isFlipped={i % 2 === 1} />
        ))}
      </div>

      {/* Close the tour with the one action it has been building towards */}
      <div className="mt-20 flex flex-col gap-6 border-t pt-12 md:flex-row md:items-center md:justify-between">
        <div className="max-w-xl">
          <h3 className="text-balance font-display text-2xl font-extrabold tracking-[-0.02em]">
            Start with a free timed mock
          </h3>
          <p className="mt-2 text-pretty text-muted-foreground">
            Pick your four subjects, sit a mock, and get your first explanations and study topics
            the same day.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            to="/signup"
            className="group inline-flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-primary px-6 text-base font-semibold text-primary-foreground shadow-soft transition-[transform,filter] duration-200 hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Start free practice
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
          <Link
            to="/signin"
            className="inline-flex h-12 items-center justify-center whitespace-nowrap rounded-xl px-4 text-base font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  </section>
);

export default FeaturesSection;
