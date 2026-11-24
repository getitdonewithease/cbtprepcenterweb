import { useCallback, useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { ArrowRight, ChevronDown, Maximize2, Minimize2, SquarePen, X } from "lucide-react";
import { Virtuoso } from "react-virtuoso";
import { cn } from "@/core/ui/cn";
import { FOCUS_RING, PRESSABLE } from "@/core/ui/styles";
import { ChatInputBar, type ChatInputBarProps } from "./ChatInputBar";
import type { ChatHistorySession, ChatMessage } from "../types/chatTypes";

/**
 * The AI tutor panel (design options chosen 2026-11-24: empty state A, conversation C,
 * history B). One surface on the design-system tokens, no card:
 * - Header: the chat's title opens your chats in place; New chat, Full page, Close.
 * - History: a plain list (title and date) that replaces the conversation; Esc or picking
 *   a chat returns to it.
 * - Empty: what the tutor can start with, the composer pinned to the bottom.
 * Boxes only where needed: the composer, and quiz cards inside answers.
 */

export interface ChatPanelBaseProps<
  TMessage extends ChatMessage = ChatMessage,
  TSession extends ChatHistorySession = ChatHistorySession,
> {
  messages: TMessage[];
  sessions: TSession[];
  activeSessionId: string;
  isFullscreen: boolean;
  isMobileView: boolean;
  chatInput: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onSendWithMode?: (mode: 0 | 1) => void;
  onStartNewChat: () => void;
  onSelectSession: (sessionId: string) => void;
  onToggleFullscreen: () => void;
  onClose: () => void;
  hasStartedChat?: boolean;
  emptyStateTitle?: ReactNode;
  emptyStateSubtitle?: ReactNode;
  /** Replaces the default empty state (e.g. suggestions built from the candidate's data). */
  emptyState?: ReactNode;
  /** A line under the header naming what is being studied. */
  contextLine?: ReactNode;
  /** Default suggestions are sent with this when given; otherwise they fill the input. */
  onSuggestion?: (prompt: string) => void;
  messageListHeader?: ReactNode;
  messageListFooter?: ReactNode;
  renderMessage?: (message: TMessage) => ReactNode;
  renderComposer?: (props: ChatInputBarProps) => ReactNode;
  renderSessionActions?: (session: TSession) => ReactNode;
}

const DEFAULT_SUGGESTIONS = [
  "Explain a topic I find hard",
  "Give me a practice question",
  "Quiz me on what I've studied",
];

const NEW_CHAT_TITLES = new Set(["new chat"]);

const isDraftSession = <TSession extends ChatHistorySession>(session: TSession): boolean => {
  if (!NEW_CHAT_TITLES.has(session.title.trim().toLowerCase())) return false;
  const messages = (session as TSession & { messages?: Array<{ role: string }> }).messages;
  return Array.isArray(messages) && messages.length === 0;
};

/** "Today", "Yesterday" or "21 Nov". */
const whenLabel = (timestamp: number) => {
  const date = new Date(timestamp);
  const today = new Date();
  const startOf = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const days = Math.round((startOf(today) - startOf(date)) / 86_400_000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  return date.toLocaleDateString("en-NG", { day: "numeric", month: "short" });
};

export const ICON_BUTTON = cn(
  "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground",
  PRESSABLE,
  FOCUS_RING,
);

/** Shown while the tutor works on an answer; still under reduced motion. */
export const TutorThinking = () => (
  <p className="flex items-center gap-2 py-1 text-sm text-muted-foreground" role="status">
    <span className="h-2 w-2 rounded-full bg-brand-orange motion-safe:animate-pulse" aria-hidden="true" />
    Thinking…
  </p>
);

const defaultRenderMessage = <TMessage extends ChatMessage>(message: TMessage): ReactNode => {
  if (message.role === "assistant" && !message.content) {
    return <TutorThinking key={message.id} />;
  }

  return message.role === "user" ? (
    <div key={message.id} className="flex justify-end">
      <p className="max-w-[85%] whitespace-pre-wrap break-words rounded-2xl rounded-br-md bg-muted px-4 py-2.5 text-[15px]">
        {message.content}
      </p>
    </div>
  ) : (
    <div key={message.id} className="min-w-0 text-[15px] leading-[1.7]">
      {message.content}
    </div>
  );
};

export const ChatPanelBase = <
  TMessage extends ChatMessage = ChatMessage,
  TSession extends ChatHistorySession = ChatHistorySession,
>({
  messages,
  sessions,
  activeSessionId,
  isFullscreen,
  isMobileView,
  chatInput,
  onInputChange,
  onSend,
  onSendWithMode,
  onStartNewChat,
  onSelectSession,
  onToggleFullscreen,
  onClose,
  hasStartedChat,
  emptyStateTitle = "What shall we work on?",
  emptyStateSubtitle,
  emptyState,
  contextLine,
  onSuggestion,
  messageListHeader,
  messageListFooter,
  renderMessage,
  renderComposer,
  renderSessionActions,
}: ChatPanelBaseProps<TMessage, TSession>) => {
  const [showHistory, setShowHistory] = useState(false);
  const historyId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  // The list replaces the conversation, so focus moves with it: into the list when it
  // opens (the current chat, else the first), back to the message box when it closes.
  // Without this, picking a chat dropped focus out of the panel and Esc stopped working.
  const hasToggledHistory = useRef(false);
  useEffect(() => {
    if (!hasToggledHistory.current) {
      hasToggledHistory.current = true;
      return;
    }
    const panel = panelRef.current;
    if (!panel) return;
    const target = showHistory
      ? panel.querySelector<HTMLElement>('nav [aria-current="true"]') ?? panel.querySelector<HTMLElement>("nav li button")
      : panel.querySelector<HTMLElement>("textarea");
    target?.focus({ preventScroll: true });
  }, [showHistory]);

  const orderedSessions = useMemo(
    () => [...sessions].filter((session) => !isDraftSession(session)).sort((a, b) => b.updatedAt - a.updatedAt),
    [sessions],
  );
  const activeSession = sessions.find((session) => session.id === activeSessionId);
  const activeTitle =
    activeSession && !NEW_CHAT_TITLES.has(activeSession.title.trim().toLowerCase()) ? activeSession.title : "AI Tutor";

  const resolvedHasStartedChat = hasStartedChat ?? messages.some((message) => message.role === "user");
  const shouldVirtualizeMessages = messages.length > 40;
  const renderedMessages = useMemo(
    () => messages.map((message) => (renderMessage ? renderMessage(message) : defaultRenderMessage(message))),
    [messages, renderMessage],
  );
  const renderVirtualizedMessage = useCallback(
    (index: number) => <div className="mx-auto w-full max-w-3xl pb-6">{renderedMessages[index] ?? null}</div>,
    [renderedMessages],
  );

  const composerProps: ChatInputBarProps = {
    value: chatInput,
    onInputChange,
    onSend,
    onSendWithMode,
    layout: "stacked",
    compact: true,
  };
  const composer = renderComposer ? renderComposer(composerProps) : <ChatInputBar {...composerProps} />;

  // Esc closes the chat list first, then the panel
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Escape" || event.defaultPrevented) return;
    event.preventDefault();
    if (showHistory) setShowHistory(false);
    else onClose();
  };

  const startNewChat = () => {
    setShowHistory(false);
    onStartNewChat();
  };

  const defaultEmptyState = (
    <div className="px-5 pb-4 pt-8 sm:px-6">
      <p className="text-balance text-2xl font-extrabold tracking-[-0.02em]">{emptyStateTitle}</p>
      {emptyStateSubtitle ? <p className="mt-2 text-pretty text-muted-foreground">{emptyStateSubtitle}</p> : null}
      <ul className="mt-6 border-t">
        {DEFAULT_SUGGESTIONS.map((prompt) => (
          <li key={prompt} className="border-b">
            <button
              type="button"
              onClick={() => (onSuggestion ? onSuggestion(prompt) : onInputChange(prompt))}
              className={cn("group flex min-h-14 w-full items-center gap-3 py-3 text-left font-semibold", FOCUS_RING)}
            >
              <span className="min-w-0 flex-1 group-hover:text-brand-text">{prompt}</span>
              <ArrowRight className="h-4 w-4 shrink-0 text-brand-text transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div
      ref={panelRef}
      onKeyDown={handleKeyDown}
      className="fasiti-theme relative flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden overscroll-none border-l bg-card text-foreground"
    >
      <header className="shrink-0 border-b">
        <div className="flex min-h-14 items-center gap-1 px-2">
          <button
            type="button"
            aria-expanded={showHistory}
            aria-controls={historyId}
            aria-label={`${activeTitle}. Show your chats`}
            onClick={() => setShowHistory((open) => !open)}
            className={cn("flex min-h-11 min-w-0 flex-1 items-center gap-1 rounded-xl px-2 text-left hover:bg-muted", FOCUS_RING)}
          >
            <span className="truncate text-base font-bold">{showHistory ? "Your chats" : activeTitle}</span>
            <ChevronDown
              className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform motion-reduce:transition-none", showHistory && "rotate-180")}
              aria-hidden="true"
            />
          </button>
          <button type="button" aria-label="New chat" title="New chat" onClick={startNewChat} className={ICON_BUTTON}>
            <SquarePen className="h-5 w-5" aria-hidden="true" />
          </button>
          {!isMobileView ? (
            <button
              type="button"
              aria-label={isFullscreen ? "Exit full page" : "Open full page"}
              title={isFullscreen ? "Exit full page" : "Open full page"}
              onClick={onToggleFullscreen}
              className={ICON_BUTTON}
            >
              {isFullscreen ? <Minimize2 className="h-[18px] w-[18px]" aria-hidden="true" /> : <Maximize2 className="h-[18px] w-[18px]" aria-hidden="true" />}
            </button>
          ) : null}
          <button type="button" aria-label="Close the AI Tutor" title="Close" onClick={onClose} className={ICON_BUTTON}>
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        {contextLine && !showHistory ? <div className="px-4 pb-2.5 text-sm">{contextLine}</div> : null}
      </header>

      {showHistory ? (
        <nav id={historyId} aria-label="Your chats" className="min-h-0 flex-1 overflow-y-auto px-4 py-2 sm:px-5">
          {orderedSessions.length === 0 ? (
            <p className="py-6 text-muted-foreground">Your chats with the tutor will be listed here.</p>
          ) : (
            <ul>
              {orderedSessions.map((session) => {
                const isActive = session.id === activeSessionId;
                return (
                  <li key={session.id} className="flex items-center gap-1 border-b last:border-b-0">
                    <button
                      type="button"
                      aria-current={isActive ? "true" : undefined}
                      onClick={() => {
                        onSelectSession(session.id);
                        setShowHistory(false);
                      }}
                      className={cn("flex min-h-14 min-w-0 flex-1 items-center gap-3 py-2 text-left", FOCUS_RING)}
                    >
                      <span className={cn("min-w-0 flex-1 truncate font-semibold", isActive && "text-brand-text")}>{session.title}</span>
                      <span className="shrink-0 text-xs text-muted-foreground">{whenLabel(session.updatedAt)}</span>
                    </button>
                    {renderSessionActions ? (
                      <div className="shrink-0" onClick={(event) => event.stopPropagation()}>
                        {renderSessionActions(session)}
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </nav>
      ) : resolvedHasStartedChat ? (
        <>
          <div className="min-h-0 flex-1 overflow-hidden overscroll-y-contain">
            {shouldVirtualizeMessages ? (
              <Virtuoso
                style={{ height: "100%" }}
                className="px-5 sm:px-6"
                totalCount={renderedMessages.length}
                overscan={240}
                itemContent={renderVirtualizedMessage}
                components={{
                  Header: () => <div className="mx-auto w-full max-w-3xl pt-6">{messageListHeader}</div>,
                  Footer: () => (
                    <div className="mx-auto w-full max-w-3xl">
                      {messageListFooter}
                      <div className="pb-4" />
                    </div>
                  ),
                }}
              />
            ) : (
              <div className="h-full overflow-y-auto px-5 sm:px-6" role="log" aria-label="Conversation with the AI Tutor">
                <div className="mx-auto w-full max-w-3xl space-y-6 pb-4 pt-6">
                  {messageListHeader}
                  {renderedMessages}
                  {messageListFooter}
                </div>
              </div>
            )}
          </div>
          <div className="shrink-0 px-4 pb-4 pt-2 sm:px-5">
            <div className="mx-auto w-full max-w-3xl">{composer}</div>
          </div>
        </>
      ) : (
        <>
          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-3xl">{emptyState ?? defaultEmptyState}</div>
          </div>
          <div className="shrink-0 px-4 pb-4 pt-2 sm:px-5">
            <div className="mx-auto w-full max-w-3xl">{composer}</div>
          </div>
        </>
      )}
    </div>
  );
};
