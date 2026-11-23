import { Loader2, Plus } from "lucide-react";
import { cn } from "@/core/ui/cn";
import { FOCUS_RING, PRESSABLE, PRIMARY_ACTION, SECONDARY_ACTION } from "@/core/ui/styles";
import { useStartTest } from "../contexts/StartTestContext";
import { useUserContext } from "../contexts/UserContext";

interface StartTestButtonProps {
  /** "secondary" on pages that have their own primary action: one primary per view. */
  emphasis?: "primary" | "secondary";
  /** Id of the visible message explaining why a test can't be started. */
  unavailableReasonId?: string;
  className?: string;
}

/** Opens the start-test flow. Expects the design-system tokens from its container. */
const StartTestButton = ({
  emphasis = "primary",
  unavailableReasonId,
  className,
}: StartTestButtonProps) => {
  const { preparing, openSetup } = useStartTest();
  const { user } = useUserContext();
  const states = [
    { label: "Start test", Icon: Plus, isShown: !preparing, spins: false },
    { label: "Preparing…", Icon: Loader2, isShown: preparing, spins: true },
  ];

  return (
    <button
      type="button"
      aria-haspopup="dialog"
      aria-describedby={unavailableReasonId}
      // The setup dialog needs the student's subjects
      disabled={preparing || !user}
      onClick={(event) => openSetup(event.currentTarget)}
      className={cn(
        "inline-grid min-h-11 min-w-11 max-w-full place-items-center rounded-xl px-4 text-sm font-semibold",
        "[@media(max-height:480px)_and_(max-width:559px)]:px-2.5",
        PRESSABLE,
        emphasis === "primary" ? PRIMARY_ACTION : SECONDARY_ACTION,
        FOCUS_RING,
        "disabled:pointer-events-none disabled:bg-muted disabled:text-muted-foreground",
        className,
      )}
    >
      {/* Both states share one cell, so the bar doesn't move when the label changes */}
      {states.map(({ label, Icon, isShown, spins }) => (
        <span
          key={label}
          className={cn("col-start-1 row-start-1 inline-flex items-center gap-2", !isShown && "invisible")}
        >
          <Icon
            className={cn("h-[18px] w-[18px] shrink-0", isShown && spins && "motion-safe:animate-spin")}
            aria-hidden="true"
          />
          <span className="whitespace-nowrap [@media(max-height:480px)_and_(max-width:559px)]:sr-only">
            {label}
          </span>
        </span>
      ))}
    </button>
  );
};

export default StartTestButton;
