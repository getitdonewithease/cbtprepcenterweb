import { Link } from "react-router-dom";
import { cn } from "@/core/ui/cn";
import { FOCUS_RING, PRESSABLE, PRIMARY_ACTION, SECONDARY_ACTION } from "@/core/ui/styles";
import { FocusedFrame } from "../brief/briefParts";
import { BUTTON } from "./dialogs";

/** Loading, a failure to load, or nothing to answer: the same frame as the page before the test. */

export const TestScreenLoading = ({ label }: { label: string }) => (
  <FocusedFrame>
    <div aria-busy="true" className="max-w-3xl pb-12">
      <p role="status" className="sr-only">
        {label}
      </p>
      <span className="block h-11 w-full max-w-lg animate-pulse rounded-lg bg-muted motion-reduce:animate-none" />
      <span className="mt-8 block h-8 w-full animate-pulse rounded-lg bg-muted motion-reduce:animate-none" />
      {[0, 1, 2, 3].map((i) => (
        <span key={i} className="mt-3 block h-14 w-full animate-pulse rounded-lg bg-muted motion-reduce:animate-none" />
      ))}
    </div>
  </FocusedFrame>
);

interface TestScreenMessageProps {
  title: string;
  body: string;
  onRetry?: () => void;
}

export const TestScreenMessage = ({ title, body, onRetry }: TestScreenMessageProps) => (
  <FocusedFrame>
    <div role="alert" className="max-w-xl pb-12">
      <h1 className="text-balance text-3xl font-extrabold tracking-[-0.03em]">{title}</h1>
      <p className="mt-3 text-pretty text-muted-foreground">{body}</p>
      <div className="mt-6 flex flex-wrap gap-3">
        {onRetry && (
          <button type="button" onClick={onRetry} className={cn(BUTTON, PRESSABLE, PRIMARY_ACTION, FOCUS_RING)}>
            Try again
          </button>
        )}
        <Link to="/dashboard" className={cn(BUTTON, PRESSABLE, onRetry ? SECONDARY_ACTION : PRIMARY_ACTION, FOCUS_RING)}>
          Back to dashboard
        </Link>
      </div>
    </div>
  </FocusedFrame>
);
