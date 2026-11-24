import { useEffect, useState, type ReactNode } from "react";
import { Check } from "lucide-react";
import { cn } from "@/core/ui/cn";
import { FOCUS_RING, PRESSABLE, PRIMARY_ACTION, SECONDARY_ACTION } from "@/core/ui/styles";
import type { SaveStatus } from "../types/settingsTypes";

/** Shared pieces of the settings dialog (design approved 2026-11-24; MASTER.md tokens only). */

const BUTTON_BASE =
  "inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 text-sm font-semibold disabled:pointer-events-none disabled:opacity-50";
// Disabled reads as "nothing to save yet", not as a faded orange that looks broken
export const primaryButton = (extra?: string) =>
  cn(BUTTON_BASE, PRESSABLE, PRIMARY_ACTION, FOCUS_RING, "disabled:bg-muted disabled:text-muted-foreground disabled:opacity-100 disabled:shadow-none", extra);
export const secondaryButton = (extra?: string) => cn(BUTTON_BASE, PRESSABLE, SECONDARY_ACTION, FOCUS_RING, extra);
export const quietButton = (extra?: string) =>
  cn(BUTTON_BASE, "px-3 text-muted-foreground hover:bg-muted hover:text-foreground", PRESSABLE, FOCUS_RING, extra);

export const INPUT = cn("h-11 w-full rounded-xl border bg-card px-3 text-[15px] aria-[invalid=true]:border-destructive", FOCUS_RING);

/** A labelled setting: label beside the control on desktop, above it on a phone. */
export const Field = ({ label, hint, htmlFor, children }: { label: string; hint?: ReactNode; htmlFor?: string; children: ReactNode }) => (
  <div className="grid gap-2 border-b py-4 last:border-b-0 sm:grid-cols-[12rem_minmax(0,1fr)] sm:items-center sm:gap-6">
    <div>
      {htmlFor ? (
        <label htmlFor={htmlFor} className="text-sm font-semibold">
          {label}
        </label>
      ) : (
        <p className="text-sm font-semibold">{label}</p>
      )}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
    <div className="min-w-0">{children}</div>
  </div>
);

export const FieldError = ({ id, message }: { id: string; message: string | null }) =>
  message ? (
    <p id={id} className="mt-1.5 text-sm font-semibold text-destructive">
      {message}
    </p>
  ) : null;

/** One Save per section: ready once something changed; says when it's saved or why it isn't. */
export const SaveBar = ({
  dirty,
  status,
  error,
  onSave,
  label = "Save changes",
  asSubmit = false,
}: {
  dirty: boolean;
  status: SaveStatus;
  error: string | null;
  onSave: () => void;
  label?: string;
  /** Inside a form: the submit button, so Enter in a field saves. */
  asSubmit?: boolean;
}) => (
  <div className="pt-4">
    <div className="flex flex-wrap items-center gap-3">
      <button type={asSubmit ? "submit" : "button"} onClick={asSubmit ? undefined : onSave} disabled={!dirty || status === "saving"} className={primaryButton()}>
        {status === "saving" ? "Saving…" : label}
      </button>
      {status === "saved" && !dirty && (
        <span role="status" className="flex items-center gap-1 text-sm text-muted-foreground">
          <Check className="h-4 w-4 text-emerald-700 dark:text-emerald-400" aria-hidden="true" /> Saved
        </span>
      )}
    </div>
    {error && (
      <p role="alert" className="mt-2 text-sm font-semibold text-destructive">
        {error}
      </p>
    )}
  </div>
);

/**
 * A section's draft against what's saved: dirty when they differ, and it reports that up so
 * the dialog can ask before closing or switching section.
 */
export const useDraft = <T,>(saved: T, onDirtyChange: (dirty: boolean) => void) => {
  const [draft, setDraft] = useState(saved);
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);

  useEffect(() => {
    onDirtyChange(dirty);
  }, [dirty, onDirtyChange]);
  useEffect(() => () => onDirtyChange(false), [onDirtyChange]);

  const save = async (run: () => Promise<void>) => {
    setStatus("saving");
    setError(null);
    try {
      await run();
      setStatus("saved");
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "We couldn't save that.");
    }
  };

  return { draft, setDraft, dirty, status, error, save };
};
