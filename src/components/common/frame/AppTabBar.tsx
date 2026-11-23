import type { Ref } from "react";
import { Link } from "react-router-dom";
import { Loader2, Plus, Sparkles } from "lucide-react";
import { cn } from "@/core/ui/cn";
import { FOCUS_RING, PRESSABLE, PRIMARY_ACTION } from "@/core/ui/styles";
import { NAV_ITEMS, isActive } from "./navItems";

/**
 * Phone navigation (below md): Home, History, Start test (raised, in thumb reach), Saved,
 * AI Tutor. Replaces the old drawer and the separate Start test bar.
 */

interface AppTabBarProps {
  pathname: string;
  isTutorOpen: boolean;
  onToggleTutor: () => void;
  tutorButtonRef?: Ref<HTMLButtonElement>;
  onStartTest: (opener: HTMLElement) => void;
  isPreparing: boolean;
  canStartTest: boolean;
  /** Id of the visible message explaining why a test can't be started. */
  startUnavailableReasonId?: string;
}

const TAB = "flex min-h-14 w-full flex-col items-center justify-center gap-0.5 text-xs font-semibold [@media(max-height:480px)]:min-h-12";
const LABEL = "[@media(max-height:480px)]:sr-only";

const AppTabBar = ({
  pathname,
  isTutorOpen,
  onToggleTutor,
  tutorButtonRef,
  onStartTest,
  isPreparing,
  canStartTest,
  startUnavailableReasonId,
}: AppTabBarProps) => {
  const [home, history, saved] = NAV_ITEMS;

  const tab = (item: typeof home) => {
    const Icon = item.icon;
    const active = isActive(item, pathname);
    return (
      <li>
        <Link
          to={item.href}
          aria-current={active ? "page" : undefined}
          aria-label={item.label}
          className={cn(TAB, active ? "text-brand-text" : "text-muted-foreground", FOCUS_RING)}
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
          <span className={LABEL} aria-hidden="true">
            {item.short}
          </span>
        </Link>
      </li>
    );
  };

  return (
    <nav
      aria-label="Main"
      data-tab-bar
      className="fasiti-theme shrink-0 border-t bg-card pb-[env(safe-area-inset-bottom)] text-foreground md:hidden"
    >
      <ul className="mx-auto grid max-w-md grid-cols-5 items-center">
        {tab(home)}
        {tab(history)}
        <li className="flex justify-center">
          <button
            type="button"
            aria-haspopup="dialog"
            aria-describedby={startUnavailableReasonId}
            disabled={isPreparing || !canStartTest}
            onClick={(event) => onStartTest(event.currentTarget)}
            className={cn(
              "flex h-12 w-14 flex-col items-center justify-center rounded-2xl text-[11px] font-bold leading-tight",
              PRESSABLE,
              PRIMARY_ACTION,
              FOCUS_RING,
              "disabled:pointer-events-none disabled:bg-muted disabled:text-muted-foreground",
            )}
          >
            {isPreparing ? (
              <Loader2 className="h-5 w-5 motion-safe:animate-spin" aria-hidden="true" />
            ) : (
              <Plus className="h-5 w-5" aria-hidden="true" />
            )}
            <span className="sr-only">{isPreparing ? "Preparing your test" : "Start test"}</span>
            <span aria-hidden="true" className={LABEL}>
              {isPreparing ? "Wait" : "Start"}
            </span>
          </button>
        </li>
        {tab(saved)}
        <li>
          <button
            ref={tutorButtonRef}
            type="button"
            aria-pressed={isTutorOpen}
            onClick={onToggleTutor}
            className={cn(TAB, isTutorOpen ? "text-brand-text" : "text-muted-foreground", FOCUS_RING)}
          >
            <Sparkles className="h-5 w-5" aria-hidden="true" />
            <span className={LABEL}>
              AI Tutor
            </span>
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default AppTabBar;
