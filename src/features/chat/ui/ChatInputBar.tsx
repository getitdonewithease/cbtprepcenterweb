import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { ArrowUp, ListOrdered } from "lucide-react";
import { cn } from "@/core/ui/cn";
import { FOCUS_RING, PRESSABLE, PRIMARY_ACTION } from "@/core/ui/styles";

/**
 * Where you type to the AI tutor: the one box the panel needs. A labelled textarea that
 * grows, a "Step-by-step" toggle for the backend's structured lesson mode (it was hidden
 * behind a "+" menu as "Study and learn"), and a 44px send that turns into Stop while an
 * answer is streaming. The old "Add photos & files" item did nothing and is gone.
 */

export type ChatInputLayout = "inline" | "stacked";

export interface ChatInputBarProps {
  value: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onSendWithMode?: (mode: 0 | 1) => void;
  /** @deprecated Attachments are not supported; kept so callers compile. */
  onAttachFiles?: () => void;
  onSelectStudyAndLearnMode?: () => void;
  layout?: ChatInputLayout;
  compact?: boolean;
  placeholder?: string;
  disabled?: boolean;
  sendDisabled?: boolean;
  /** While an answer streams, the send button becomes Stop and calls this. */
  isStreaming?: boolean;
  onStop?: () => void;
  headerSlot?: ReactNode;
  leadingAction?: ReactNode;
  leadingActionAddon?: ReactNode;
}

const MAX_HEIGHT = 160;

export const ChatInputBar = ({
  value,
  onInputChange,
  onSend,
  onSendWithMode,
  onSelectStudyAndLearnMode,
  layout = "inline",
  placeholder,
  disabled = false,
  sendDisabled = false,
  isStreaming = false,
  onStop,
  headerSlot,
  leadingAction,
  leadingActionAddon,
}: ChatInputBarProps) => {
  const [isStepByStep, setIsStepByStep] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const inputId = useId();

  const resizeTextarea = (el: HTMLTextAreaElement) => {
    // Empty, or measured while its panel has no width yet (the tutor opening on a phone):
    // keep the one-line height instead of growing to fit a placeholder wrapped per letter
    if (!el.value || el.clientWidth === 0) {
      el.style.height = "";
      el.style.overflowY = "hidden";
      return;
    }
    el.style.height = "0px";
    el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT)}px`;
    el.style.overflowY = el.scrollHeight > MAX_HEIGHT ? "auto" : "hidden";
  };

  useEffect(() => {
    if (textareaRef.current) resizeTextarea(textareaRef.current);
  }, [value]);

  // Nothing to send without words; a stream in progress is stopped, not re-sent
  const isEmpty = !value.trim();
  const canSend = !sendDisabled && !isEmpty && !disabled;
  const showStop = isStreaming && Boolean(onStop);

  const handleSend = () => {
    if (!canSend) return;
    if (onSendWithMode) onSendWithMode(isStepByStep ? 1 : 0);
    else onSend();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const modeToggle = onSendWithMode ? (
    <button
      type="button"
      aria-pressed={isStepByStep}
      title="Teach it step by step, as a short lesson"
      onClick={() => {
        setIsStepByStep((on) => !on);
        if (!isStepByStep) onSelectStudyAndLearnMode?.();
      }}
      className={cn(
        "inline-flex min-h-11 items-center gap-1.5 rounded-xl px-3 text-xs font-semibold",
        isStepByStep ? "bg-brand-orange/10 text-brand-text" : "text-muted-foreground hover:bg-muted hover:text-foreground",
        FOCUS_RING,
      )}
    >
      <ListOrdered className="h-4 w-4" aria-hidden="true" />
      Step-by-step
    </button>
  ) : null;

  const sendButton = showStop ? (
    <button
      type="button"
      aria-label="Stop the answer"
      title="Stop"
      onClick={onStop}
      className={cn("inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-foreground text-background", PRESSABLE, FOCUS_RING)}
    >
      <span className="h-3 w-3 rounded-[3px] bg-current" aria-hidden="true" />
    </button>
  ) : (
    <button
      type="button"
      aria-label="Send"
      title="Send"
      onClick={handleSend}
      disabled={!canSend}
      className={cn(
        "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
        PRESSABLE,
        PRIMARY_ACTION,
        FOCUS_RING,
        "disabled:pointer-events-none disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none",
      )}
    >
      <ArrowUp className="h-5 w-5" aria-hidden="true" />
    </button>
  );

  const textarea = (
    <>
      <label htmlFor={inputId} className="sr-only">
        Message the AI Tutor
      </label>
      <textarea
        id={inputId}
        ref={textareaRef}
        rows={1}
        value={value}
        disabled={disabled}
        placeholder={placeholder ?? "Ask the AI Tutor"}
        onChange={(event) => {
          onInputChange(event.target.value);
          resizeTextarea(event.currentTarget);
        }}
        onKeyDown={handleKeyDown}
        className="block min-h-11 w-full resize-none bg-transparent px-2 py-2.5 text-[15px] leading-6 placeholder:text-muted-foreground focus:outline-none disabled:opacity-60"
      />
    </>
  );

  const leading = leadingAction ?? (
    <div className="flex items-center gap-1">
      {modeToggle}
      {leadingActionAddon}
    </div>
  );

  if (layout === "stacked") {
    return (
      <div className="rounded-2xl border bg-card p-2 shadow-soft transition-colors focus-within:border-foreground/30">
        {headerSlot ? <div className="px-2 pb-2 pt-1">{headerSlot}</div> : null}
        {textarea}
        <div className="mt-1 flex items-center justify-between gap-2">
          {leading}
          {sendButton}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-end gap-2 rounded-2xl border bg-card p-2 shadow-soft transition-colors focus-within:border-foreground/30">
      {leading}
      <div className="min-w-0 flex-1">{textarea}</div>
      {sendButton}
    </div>
  );
};
