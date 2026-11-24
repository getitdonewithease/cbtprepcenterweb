import type { ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/core/ui/cn";
import { FOCUS_RING, PRESSABLE, PRIMARY_ACTION, SECONDARY_ACTION } from "@/core/ui/styles";
import type { FinishState, SubjectBlock } from "../../types/testScreenTypes";

/** The test screen's dialogs: a bottom sheet on phones, centred on a computer. */

export const BUTTON = "inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl px-4 text-sm font-semibold disabled:pointer-events-none disabled:opacity-50";
export const ICON_BUTTON = cn(
  "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground",
  FOCUS_RING,
);

const PANEL =
  "fasiti-theme fixed inset-x-0 bottom-0 z-50 max-h-[90dvh] overflow-y-auto rounded-t-2xl bg-card p-5 text-foreground shadow-soft outline-none sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl sm:border sm:p-7 data-[state=open]:animate-in data-[state=open]:fade-in-0 motion-reduce:animate-none";

export const Sheet = ({ open, onOpenChange, title, children }: { open: boolean; onOpenChange: (o: boolean) => void; title: string; children: ReactNode }) => (
  <Dialog.Root open={open} onOpenChange={onOpenChange}>
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
      <Dialog.Content aria-describedby={undefined} className={cn(PANEL, "sm:w-[min(36rem,94vw)]")}>
        <div className="mb-4 flex items-center justify-between">
          <Dialog.Title className="text-lg font-bold">{title}</Dialog.Title>
          <Dialog.Close aria-label="Close" className={ICON_BUTTON}>
            <X className="h-5 w-5" aria-hidden="true" />
          </Dialog.Close>
        </div>
        {children}
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
);

interface FinishDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  verb: "Submit" | "Finish";
  state: FinishState;
  /** Why the last try failed, in plain words. */
  error?: string | null;
  /** The clock ran out: the answers can't change, only be sent. */
  timeUp: boolean;
  subjects: SubjectBlock[];
  answeredIn: (subject: SubjectBlock) => number;
  firstBlankIn: (subject: SubjectBlock) => number | null;
  onGo: (index: number) => void;
  onConfirm: () => void;
}

/**
 * Before sending: how each subject stands, with the way to its first blank (design approved
 * 2026-11-24). It stays open while sending and says so; a failure says what happened and
 * offers to try again. Nothing is sent twice.
 */
export const FinishDialog = ({ open, onOpenChange, verb, state, error, timeUp, subjects, answeredIn, firstBlankIn, onGo, onConfirm }: FinishDialogProps) => {
  const blank = subjects.reduce((n, s) => n + s.count - answeredIn(s), 0);
  const sending = state === "submitting";
  const locked = sending || timeUp;
  const title = timeUp
    ? state === "failed"
      ? "Your time is up, but your answers didn't send"
      : "Time is up"
    : state === "failed"
      ? "Your answers didn't send"
      : blank === 0
        ? `${verb} your answers?`
        : `${blank} ${blank === 1 ? "question is" : "questions are"} still blank`;
  const body = state === "failed" ? error : timeUp ? "Sending your answers now." : blank === 0 ? "Every question is answered. You can't change anything after this." : "A guess can only gain marks. You can't change anything after this.";

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !locked && onOpenChange(o)}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <Dialog.Content
          onEscapeKeyDown={(e) => locked && e.preventDefault()}
          onInteractOutside={(e) => locked && e.preventDefault()}
          className={cn(PANEL, "sm:w-[min(32rem,94vw)]")}
        >
          <Dialog.Title className="text-xl font-extrabold tracking-[-0.02em]">{title}</Dialog.Title>
          <Dialog.Description className="mt-2 text-pretty text-muted-foreground" role={state === "failed" ? "alert" : undefined}>
            {body}
          </Dialog.Description>
          {!timeUp && state !== "failed" && subjects.length > 1 && (
            <ul className="mt-5 divide-y border-y">
              {subjects.map((s) => {
                const first = firstBlankIn(s);
                return (
                  <li key={s.name} className="flex min-h-14 items-center justify-between gap-3 py-2">
                    <span>
                      <span className="block font-semibold">{s.name}</span>
                      <span className="text-sm text-muted-foreground tabular-nums">
                        {answeredIn(s)} of {s.count} answered
                      </span>
                    </span>
                    {first !== null ? (
                      <button type="button" disabled={sending} onClick={() => onGo(first)} className={cn(BUTTON, "px-3 text-brand-text hover:bg-muted", FOCUS_RING)}>
                        Go to first blank
                      </button>
                    ) : (
                      <span className="text-sm font-semibold text-muted-foreground">All answered</span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            {!locked && (
              <Dialog.Close className={cn(BUTTON, PRESSABLE, SECONDARY_ACTION, FOCUS_RING)}>{state === "failed" ? "Back to the test" : "Keep going"}</Dialog.Close>
            )}
            <button type="button" onClick={onConfirm} disabled={sending} aria-busy={sending} className={cn(BUTTON, PRESSABLE, PRIMARY_ACTION, FOCUS_RING)}>
              {sending ? "Sending your answers…" : state === "failed" ? "Try again" : `${verb} now`}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

interface LeaveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  body: string;
  leaving: boolean;
  onLeave: () => void;
}

export const LeaveDialog = ({ open, onOpenChange, body, leaving, onLeave }: LeaveDialogProps) => (
  <Dialog.Root open={open} onOpenChange={(o) => !leaving && onOpenChange(o)}>
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
      <Dialog.Content className={cn(PANEL, "sm:w-[min(28rem,94vw)]")}>
        <Dialog.Title className="text-xl font-extrabold tracking-[-0.02em]">Leave for now?</Dialog.Title>
        <Dialog.Description className="mt-2 text-pretty text-muted-foreground">{body}</Dialog.Description>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Dialog.Close disabled={leaving} className={cn(BUTTON, PRESSABLE, PRIMARY_ACTION, FOCUS_RING)}>
            Stay
          </Dialog.Close>
          <button type="button" onClick={onLeave} disabled={leaving} className={cn(BUTTON, PRESSABLE, SECONDARY_ACTION, FOCUS_RING)}>
            {leaving ? "Saving…" : "Leave"}
          </button>
        </div>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
);
