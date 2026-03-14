import { useEffect, useRef, type KeyboardEvent, type ReactNode } from "react";
import { ArrowUp, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export type ChatInputLayout = "inline" | "stacked";

export interface ChatInputBarProps {
  value: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  layout?: ChatInputLayout;
  compact?: boolean;
  placeholder?: string;
  disabled?: boolean;
  sendDisabled?: boolean;
  headerSlot?: ReactNode;
  leadingAction?: ReactNode;
}

const defaultLeadingAction = (compact: boolean) => (
  <Button
    variant="ghost"
    size="icon"
    type="button"
    aria-label="Attach file"
    className={`shrink-0 text-muted-foreground hover:text-foreground ${compact ? "h-8 w-8" : "h-9 w-9"}`}
  >
    <Plus className={compact ? "h-4 w-4" : "h-5 w-5"} />
  </Button>
);

export const ChatInputBar = ({
  value,
  onInputChange,
  onSend,
  layout = "inline",
  compact = false,
  placeholder,
  disabled = false,
  sendDisabled = false,
  headerSlot,
  leadingAction,
}: ChatInputBarProps) => {
  const resolvedPlaceholder = placeholder ?? (layout === "stacked" ? "How can I help you today?" : "Type your message...");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const resizeTextarea = (textareaElement: HTMLTextAreaElement) => {
    textareaElement.style.height = "0px";
    const nextHeight = Math.min(textareaElement.scrollHeight, 160);
    textareaElement.style.height = `${nextHeight}px`;
    textareaElement.style.overflowY = textareaElement.scrollHeight > 160 ? "auto" : "hidden";
  };

  useEffect(() => {
    if (!textareaRef.current) {
      return;
    }

    resizeTextarea(textareaRef.current);
  }, [value, layout, compact]);

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey && !sendDisabled) {
      event.preventDefault();
      onSend();
    }
  };

  if (layout === "stacked") {
    return (
      <div className={`rounded-2xl border-2 border-input bg-background shadow-sm ${compact ? "px-3 py-2" : "px-4 py-3"}`}>
        {headerSlot ? <div className="mb-2">{headerSlot}</div> : null}
        <Textarea
          ref={textareaRef}
          rows={1}
          className={`max-h-40 min-h-0 resize-none border-0 bg-transparent px-1 py-2 leading-6 shadow-none placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 ${compact ? "text-base" : "text-lg"}`}
          placeholder={resolvedPlaceholder}
          value={value}
          disabled={disabled}
          onChange={(event) => {
            onInputChange(event.target.value);
            resizeTextarea(event.currentTarget);
          }}
          onKeyDown={handleKeyDown}
        />
        <div className="mt-2 flex items-center justify-between">
          {leadingAction ?? defaultLeadingAction(compact)}
          <Button
            size="icon"
            type="button"
            aria-label="Send message"
            className={`shrink-0 rounded-lg ${compact ? "h-8 w-8" : "h-9 w-9"}`}
            onClick={onSend}
            disabled={sendDisabled}
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-end gap-1 rounded-xl border-2 border-input bg-background px-2 py-1.5 shadow-sm">
      {leadingAction ?? defaultLeadingAction(true)}
      <Textarea
        ref={textareaRef}
        rows={1}
        className="max-h-32 min-h-0 flex-1 resize-none border-0 bg-transparent px-1 py-1.5 leading-5 shadow-none placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
        placeholder={resolvedPlaceholder}
        value={value}
        disabled={disabled}
        onChange={(event) => {
          onInputChange(event.target.value);
          resizeTextarea(event.currentTarget);
        }}
        onKeyDown={handleKeyDown}
      />
      <Button
        size="icon"
        type="button"
        aria-label="Send message"
        className="h-8 w-8 shrink-0 rounded-lg"
        onClick={onSend}
        disabled={sendDisabled}
      >
        <ArrowUp className="h-4 w-4" />
      </Button>
    </div>
  );
};