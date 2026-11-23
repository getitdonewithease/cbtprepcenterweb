import type { ReactNode, Ref } from "react";
import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { cn } from "@/core/ui/cn";
import { FOCUS_RING, PRESSABLE, SECONDARY_ACTION } from "@/core/ui/styles";
import BrandMark from "@/components/LandingPage/BrandMark";

// A plain surface on the design-system tokens; it follows the page theme, never forced dark
const NAV_SURFACE = "fasiti-theme bg-card text-foreground";

/** For the control that opens the mobile navigation. */
export const NAV_MENU_BUTTON_CLASS = cn(
  "-ml-2 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl hover:bg-muted active:bg-border md:hidden",
  PRESSABLE,
  FOCUS_RING,
);

interface AppTopNavProps {
  title: string;
  /** The mobile navigation and its trigger. */
  menu: ReactNode;
  /** The page's start action, unless `AppActionBar` is holding it. */
  primaryAction?: ReactNode;
  isTutorOpen: boolean;
  onToggleTutor: () => void;
  tutorButtonRef?: Ref<HTMLButtonElement>;
}

/**
 * 64px at normal text size, 56px on short screens. It wraps and grows rather than clipping
 * when text is enlarged, so nothing in here may take a fixed height or a zero flex basis.
 */
export const AppTopNav = ({
  title,
  menu,
  primaryAction,
  isTutorOpen,
  onToggleTutor,
  tutorButtonRef,
}: AppTopNavProps) => (
  <header
    className={cn(
      NAV_SURFACE,
      "relative z-20 flex min-h-16 shrink-0 flex-wrap items-center gap-x-1.5 gap-y-2 overflow-hidden border-b py-2 pl-4 pr-3",
      "md:gap-x-3 md:pl-0 md:pr-5 [@media(max-height:480px)]:min-h-14 [@media(max-height:480px)]:py-1.5",
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

    <div className="flex min-w-0 max-w-full flex-[1_1_auto] items-center gap-1.5 md:gap-3">
      {menu}

      {/* As wide as the open sidebar, so the title lines up with the page content */}
      <div className="hidden w-64 max-w-[34vw] shrink-0 px-5 md:block">
        <Link
          to="/dashboard"
          aria-label="Fasiti dashboard"
          className={cn("inline-flex min-h-11 items-center rounded-xl", FOCUS_RING)}
        >
          <BrandMark />
        </Link>
      </div>

      <h1 className="min-w-0 text-balance break-words text-base font-bold leading-5 md:pl-5">
        {title}
      </h1>
    </div>

    <div className="ml-auto flex max-w-full flex-wrap items-center justify-end gap-2 md:gap-3">
      <button
        ref={tutorButtonRef}
        type="button"
        aria-pressed={isTutorOpen}
        onClick={onToggleTutor}
        className={cn(
          "inline-flex min-h-11 min-w-11 max-w-full items-center justify-center gap-2 rounded-xl px-3 text-sm font-semibold md:px-4",
          "[@media(max-height:480px)_and_(max-width:559px)]:px-2.5",
          PRESSABLE,
          SECONDARY_ACTION,
          isTutorOpen &&
            "border-brand-orange bg-brand-orange/10 text-brand-text hover:bg-brand-orange/15",
          FOCUS_RING,
        )}
      >
        <Sparkles className="h-[18px] w-[18px] shrink-0 text-brand-text" aria-hidden="true" />
        <span className="whitespace-nowrap [@media(max-height:480px)_and_(max-width:559px)]:sr-only">
          AI Tutor
        </span>
      </button>

      {primaryAction}
    </div>
  </header>
);

/** Upright phones only: keeps the start action within thumb reach. */
export const AppActionBar = ({ children }: { children: ReactNode }) => (
  <div
    data-action-bar
    className={cn(
      NAV_SURFACE,
      "shrink-0 border-t px-4 pb-[max(0.625rem,env(safe-area-inset-bottom))] pt-2.5 md:hidden",
    )}
  >
    {children}
  </div>
);
