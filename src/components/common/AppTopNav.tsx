import type { ReactNode, Ref } from "react";
import { Sparkles } from "lucide-react";
import { cn } from "@/core/ui/cn";
import { FOCUS_RING, PRESSABLE, SECONDARY_ACTION } from "@/core/ui/styles";

/**
 * The bar over the page content (the sidebar carries the brand). Desktop: page title,
 * AI Tutor and the start action. Phones: page title and the account menu; the tutor and
 * Start test live in the tab bar, within thumb reach.
 *
 * 64px at normal text size. It wraps and grows rather than clipping when text is
 * enlarged, so nothing in here may take a fixed height or a zero flex basis.
 */

interface AppTopNavProps {
  title: string;
  /** The page's start action (desktop). */
  primaryAction?: ReactNode;
  /** The account menu (phones; the sidebar holds it on desktop). */
  account?: ReactNode;
  isTutorOpen: boolean;
  onToggleTutor: () => void;
  tutorButtonRef?: Ref<HTMLButtonElement>;
}

export const AppTopNav = ({ title, primaryAction, account, isTutorOpen, onToggleTutor, tutorButtonRef }: AppTopNavProps) => (
  <header
    className={cn(
      "fasiti-theme relative z-20 flex min-h-16 shrink-0 flex-wrap items-center gap-x-3 gap-y-2 border-b bg-card py-2 pl-4 pr-3 text-foreground",
      "md:px-8 [@media(max-height:480px)]:min-h-14 [@media(max-height:480px)]:py-1.5",
    )}
  >
    <a
      href="#main-content"
      className={cn(
        "pointer-events-none absolute left-4 top-1.5 z-30 inline-flex min-h-11 items-center rounded-xl bg-foreground px-4 text-sm font-semibold text-background opacity-0 focus:pointer-events-auto focus:opacity-100",
        FOCUS_RING,
      )}
    >
      Skip to content
    </a>

    <h1 className="min-w-0 flex-1 text-balance break-words text-lg font-extrabold leading-6 tracking-[-0.01em] md:text-xl">
      {title}
    </h1>

    <div className="ml-auto hidden flex-wrap items-center justify-end gap-3 md:flex">
      <button
        ref={tutorButtonRef}
        type="button"
        aria-pressed={isTutorOpen}
        onClick={onToggleTutor}
        className={cn(
          "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold",
          PRESSABLE,
          SECONDARY_ACTION,
          isTutorOpen && "border-brand-orange bg-brand-orange/10 text-brand-text hover:bg-brand-orange/15",
          FOCUS_RING,
        )}
      >
        <Sparkles className="h-[18px] w-[18px] shrink-0 text-brand-text" aria-hidden="true" />
        <span className="whitespace-nowrap">AI Tutor</span>
      </button>
      {primaryAction}
    </div>

    {account && <div className="ml-auto md:hidden">{account}</div>}
  </header>
);
