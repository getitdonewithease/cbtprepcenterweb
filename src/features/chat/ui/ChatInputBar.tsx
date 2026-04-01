import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { ArrowUp, BookOpen, Paperclip, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";

export type ChatInputLayout = "inline" | "stacked";

export interface ChatInputBarProps {
  value: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onSendWithMode?: (mode: 0 | 1) => void;
  onAttachFiles?: () => void;
  onSelectStudyAndLearnMode?: () => void;
  layout?: ChatInputLayout;
  compact?: boolean;
  placeholder?: string;
  disabled?: boolean;
  sendDisabled?: boolean;
  headerSlot?: ReactNode;
  leadingAction?: ReactNode;
  leadingActionAddon?: ReactNode;
}

type SelectedMode = "study-and-learn" | null;

export const ChatInputBar = ({
  value,
  onInputChange,
  onSend,
  onSendWithMode,
  onAttachFiles,
  onSelectStudyAndLearnMode,
  layout = "inline",
  compact = false,
  placeholder,
  disabled = false,
  sendDisabled = false,
  headerSlot,
  leadingAction,
  leadingActionAddon,
}: ChatInputBarProps) => {
  const [selectedMode, setSelectedMode] = useState<SelectedMode>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const resolvedPlaceholder = placeholder ?? (layout === "stacked" ? "How can I help you today?" : "Type your message...");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const maxTextareaHeight = layout === "stacked" ? (compact ? 96 : 112) : 96;

  const resizeTextarea = (textareaElement: HTMLTextAreaElement) => {
    textareaElement.style.height = "0px";
    const nextHeight = Math.min(textareaElement.scrollHeight, maxTextareaHeight);
    textareaElement.style.height = `${nextHeight}px`;
    textareaElement.style.overflowY = textareaElement.scrollHeight > maxTextareaHeight ? "auto" : "hidden";
  };

  useEffect(() => {
    if (!textareaRef.current) {
      return;
    }

    resizeTextarea(textareaRef.current);
  }, [value, layout, compact, maxTextareaHeight]);

  const handleSend = () => {
    if (onSendWithMode) {
      const mode = selectedMode === "study-and-learn" ? 1 : 0;
      onSendWithMode(mode);
    } else {
      onSend();
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey && !sendDisabled) {
      event.preventDefault();
      handleSend();
    }
  };

  const defaultLeadingAction = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          type="button"
          aria-label="Open chat actions"
          className={`shrink-0 text-muted-foreground hover:text-foreground ${compact ? "h-[30px] w-[30px]" : "h-[34px] w-[34px]"}`}
        >
          <Plus className={compact ? "h-[14px] w-[14px]" : "h-[18px] w-[18px]"} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" side="top" className="w-56">
        <DropdownMenuItem
          className="gap-2"
          onClick={() => {
            fileInputRef.current?.click();
          }}
        >
          <Paperclip className="h-4 w-4 text-muted-foreground" />
          <span>Add photos & files</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="gap-2"
          onClick={() => {
            setSelectedMode("study-and-learn");
            onSelectStudyAndLearnMode?.();
          }}
        >
          <BookOpen className="h-4 w-4 text-muted-foreground" />
          <span>Study and learn</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const resolvedLeadingAction = leadingAction ?? (
    <div className="flex items-center gap-1">
      {defaultLeadingAction}
      {leadingActionAddon}
    </div>
  );

  if (layout === "stacked") {
    const modeConfig = {
      "study-and-learn": { label: "Study and learn", icon: BookOpen },
    };

    const currentModeConfig = selectedMode ? modeConfig[selectedMode] : null;
    const ModeIcon = currentModeConfig?.icon;

    return (
      <div className={`rounded-2xl border-2 border-input bg-background shadow-sm ${compact ? "px-3 pt-[4px] pb-[8px]" : "px-4 pt-[6px] pb-[10px]"}`}>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(event) => {
            const files = event.currentTarget.files;
            if (files && onAttachFiles) {
              onAttachFiles();
            }
            event.currentTarget.value = "";
          }}
        />
        {headerSlot ? <div className="mb-2">{headerSlot}</div> : null}
        {selectedMode && currentModeConfig ? (
          <div className="mb-2 flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-sm">
              {ModeIcon && <ModeIcon className="h-4 w-4" />}
              <span className="text-foreground">{currentModeConfig.label}</span>
              <button
                type="button"
                aria-label="Clear mode"
                onClick={() => setSelectedMode(null)}
                className="ml-1 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ) : null}
        <Textarea
          ref={textareaRef}
          rows={1}
          className={`max-h-[112px] min-h-0 resize-none border-0 bg-transparent px-[4px] py-[2px] leading-5 shadow-none placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 ${compact ? "text-base" : "text-lg"}`}
          placeholder={resolvedPlaceholder}
          value={value}
          disabled={disabled}
          onChange={(event) => {
            onInputChange(event.target.value);
            resizeTextarea(event.currentTarget);
          }}
          onKeyDown={handleKeyDown}
        />
        <div className="mt-[8px] flex items-center justify-between">
          {resolvedLeadingAction}
          <Button
            size="icon"
            type="button"
            aria-label="Send message"
            className={`shrink-0 rounded-lg ${compact ? "h-[30px] w-[30px]" : "h-[34px] w-[34px]"}`}
            onClick={handleSend}
            disabled={sendDisabled}
          >
            <ArrowUp className="h-[14px] w-[14px]" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-end gap-1 rounded-xl border-2 border-input bg-background px-2 py-[2px] shadow-sm">
      {resolvedLeadingAction}
      <Textarea
        ref={textareaRef}
        rows={1}
        className="max-h-[96px] min-h-0 flex-1 resize-none border-0 bg-transparent px-[4px] py-[1px] leading-5 shadow-none placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
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
        className="h-[30px] w-[30px] shrink-0 rounded-lg"
        onClick={handleSend}
        disabled={sendDisabled}
      >
        <ArrowUp className="h-[14px] w-[14px]" />
      </Button>
    </div>
  );
};