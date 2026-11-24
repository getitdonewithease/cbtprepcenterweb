import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/core/ui/cn";
import {
  CLOSE_TARGET,
  FOCUS_RING,
  OVERLAY_MOTION,
  PRESSABLE,
  PRIMARY_ACTION,
} from "@/core/ui/styles";
import { useStartTest } from "../contexts/StartTestContext";
import { useUserContext } from "../contexts/UserContext";
import NewTestDialog from "./NewTestDialog";

// Dialogs render in a portal, outside the nav, so they need the token wrapper themselves
const DIALOG_CLASS = cn(
  "fasiti-theme max-h-[calc(100dvh-1rem)] max-w-[min(24rem,calc(100%-2rem))] overflow-y-auto rounded-2xl bg-card text-center text-foreground sm:rounded-2xl",
  OVERLAY_MOTION,
);
const ACTION_CLASS = cn(
  "inline-flex min-h-11 w-full items-center justify-center rounded-xl px-4 text-sm font-semibold",
  PRESSABLE,
  FOCUS_RING,
);

const StartTestDialogs = () => {
  const { user } = useUserContext();
  const {
    preparing,
    showPreparedDialog,
    setShowPreparedDialog,
    handleGoToTest,
    isSetupOpen,
    setSetupOpen,
    isProgressOpen,
    setProgressOpen,
    startPreparing,
    returnFocus,
  } = useStartTest();

  const handleCloseAutoFocus = (event: Event) => {
    event.preventDefault();
    returnFocus();
  };

  return (
    <>
      <p role="status" className="sr-only">
        {preparing && !isProgressOpen ? "Preparing your test in the background" : ""}
      </p>

      <NewTestDialog
        open={isSetupOpen}
        onOpenChange={setSetupOpen}
        onCloseAutoFocus={handleCloseAutoFocus}
        onStart={startPreparing}
        subjects={user?.courses ?? []}
      />

      <Dialog open={preparing && isProgressOpen} onOpenChange={setProgressOpen}>
        <DialogContent
          className={DIALOG_CLASS}
          closeClassName={CLOSE_TARGET}
          onInteractOutside={(event) => event.preventDefault()}
          onCloseAutoFocus={handleCloseAutoFocus}
        >
          <Loader2
            className="mx-auto h-6 w-6 text-brand-text motion-safe:animate-spin"
            aria-hidden="true"
          />
          <DialogTitle>Preparing your test…</DialogTitle>
          <DialogDescription>This takes a few seconds.</DialogDescription>
          <button
            type="button"
            className={cn(ACTION_CLASS, "text-foreground hover:bg-muted active:bg-border")}
            onClick={() => setProgressOpen(false)}
          >
            Continue in background
          </button>
        </DialogContent>
      </Dialog>

      <Dialog open={showPreparedDialog} onOpenChange={setShowPreparedDialog}>
        <DialogContent className={DIALOG_CLASS} closeClassName={CLOSE_TARGET} onCloseAutoFocus={handleCloseAutoFocus}>
          <DialogTitle>Ready to go!</DialogTitle>
          <DialogDescription>Your questions are prepared.</DialogDescription>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              className={cn(ACTION_CLASS, PRIMARY_ACTION)}
              onClick={handleGoToTest}
            >
              Go to test
            </button>
            <button
              type="button"
              className={cn(ACTION_CLASS, "text-foreground hover:bg-muted active:bg-border")}
              onClick={() => setShowPreparedDialog(false)}
            >
              Not now
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default StartTestDialogs;
