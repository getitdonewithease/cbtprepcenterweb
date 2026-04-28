import { useCallback, useMemo, useState, type ReactNode } from "react";
import {
  Maximize2,
  MessageSquarePlus,
  Minimize2,
  PanelLeft,
  PanelRight,
  Plus,
  Sparkles,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatInputBar, type ChatInputBarProps } from "./ChatInputBar";
import type { ChatHistorySession, ChatMessage } from "../types/chatTypes";
import { Virtuoso } from "react-virtuoso";

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
  messageListHeader?: ReactNode;
  messageListFooter?: ReactNode;
  renderMessage?: (message: TMessage) => ReactNode;
  renderComposer?: (props: ChatInputBarProps) => ReactNode;
  renderSessionActions?: (session: TSession) => ReactNode;
}

const SUGGESTION_PROMPTS = [
  "Explain a concept to me",
  "Give me a practice question",
  "Quiz me on what I've studied",
];

const isDraftSession = <TSession extends ChatHistorySession>(session: TSession): boolean => {
  if (session.title !== "New chat") {
    return false;
  }

  if (!("messages" in session)) {
    return false;
  }

  const messages = (session as TSession & { messages?: Array<{ role: string }> }).messages;
  return Array.isArray(messages) && messages.length === 0;
};

const TypingIndicator = () => (
  <div className="flex items-center gap-1.5 rounded-xl bg-muted/50 px-4 py-3.5">
    <span className="block h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:-0.3s]" />
    <span className="block h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:-0.15s]" />
    <span className="block h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50" />
  </div>
);

const defaultRenderMessage = <TMessage extends ChatMessage>(message: TMessage): ReactNode => {
  if (message.role === "assistant" && !message.content) {
    return (
      <div key={message.id} className="flex items-start px-1 py-1">
        <TypingIndicator />
      </div>
    );
  }

  return (
    <div
      key={message.id}
      className={message.role === "user" ? "flex justify-end" : "flex items-start px-1"}
    >
      <div
        className={
          message.role === "user"
            ? "max-w-[60%] whitespace-pre-wrap break-words rounded-xl bg-muted px-4 py-2.5 text-sm text-foreground"
            : "flex-1 text-base leading-7 text-foreground"
        }
      >
        {message.content}
      </div>
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
  emptyStateTitle = "What do you want to learn today?",
  emptyStateSubtitle,
  messageListHeader,
  messageListFooter,
  renderMessage,
  renderComposer,
  renderSessionActions,
}: ChatPanelBaseProps<TMessage, TSession>) => {
  const [showHistorySidebar, setShowHistorySidebar] = useState(false);
  const shouldDockHistorySidebar = isFullscreen && !isMobileView;

  const orderedSessions = useMemo(
    () => [...sessions].filter((session) => !isDraftSession(session)).sort((a, b) => b.updatedAt - a.updatedAt),
    [sessions]
  );

  const resolvedHasStartedChat = hasStartedChat ?? messages.some((message) => message.role === "user");
  const shouldVirtualizeMessages = messages.length > 40;
  const renderedMessages = useMemo(
    () => messages.map((message) => (renderMessage ? renderMessage(message) : defaultRenderMessage(message))),
    [messages, renderMessage],
  );
  const renderVirtualizedMessage = useCallback(
    (index: number) => (
      <div className="mx-auto w-full max-w-4xl pb-6">
        {renderedMessages[index] ?? null}
      </div>
    ),
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

  const historySidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b px-3 py-2.5">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Conversations
        </p>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          aria-label="Close history sidebar"
          onClick={() => setShowHistorySidebar(false)}
        >
          <PanelRight className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        <button
          type="button"
          onClick={() => {
            onStartNewChat();
          }}
          className="mb-2 flex w-full items-center gap-2 rounded-lg border border-dashed border-border px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:border-foreground/25 hover:text-foreground"
        >
          <Plus className="h-4 w-4 shrink-0" />
          New chat
        </button>

        <div className="space-y-0.5">
          {orderedSessions.map((session) => {
            const isActive = session.id === activeSessionId;

            return (
              <div
                key={session.id}
                className={`group relative flex items-center gap-2 overflow-hidden rounded-lg transition-colors ${
                  isActive
                    ? "bg-muted/60 text-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {isActive ? (
                  <span className="absolute left-0 top-0 h-full w-0.5 rounded-r-full bg-[hsl(var(--brand-orange))]" />
                ) : null}
                <button
                  type="button"
                  onClick={() => {
                    onSelectSession(session.id);
                  }}
                  className="min-w-0 flex-1 px-3 py-2 text-left"
                >
                  <p className="truncate text-sm font-medium leading-tight text-foreground">
                    {session.title}
                  </p>
                </button>
                {renderSessionActions ? (
                  <div
                    className="pr-1"
                    onClick={(event) => event.stopPropagation()}
                  >
                    {renderSessionActions(session)}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div
      className={`relative flex h-full min-h-0 flex-1 flex-col overflow-hidden overscroll-none border-l bg-background transition-[padding] duration-200 ease-out ${
        shouldDockHistorySidebar && showHistorySidebar ? "pl-64" : ""
      }`}
    >
      {shouldDockHistorySidebar && showHistorySidebar ? (
        <aside className="absolute inset-y-0 left-0 z-10 w-64 border-r bg-background">
          {historySidebarContent}
        </aside>
      ) : null}

      {/* Panel header */}
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-border/50 px-2">
        <div className="flex items-center gap-1.5">
          {!(shouldDockHistorySidebar && showHistorySidebar) ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              aria-label="Toggle chat history"
              onClick={() => setShowHistorySidebar((previous) => !previous)}
            >
              <PanelLeft className="h-4 w-4" />
            </Button>
          ) : null}
          <Sparkles
            className="h-[18px] w-[18px]"
            style={{ color: "hsl(var(--brand-orange))" }}
          />
          <span className="text-sm font-semibold text-foreground">AI Tutor</span>
        </div>

        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            aria-label="Start new chat"
            onClick={onStartNewChat}
          >
            <MessageSquarePlus className="h-4 w-4" />
          </Button>
          {!isMobileView ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              aria-label={isFullscreen ? "Exit full page chat" : "Open full page chat"}
              onClick={onToggleFullscreen}
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          ) : null}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            aria-label="Close chat"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="relative flex min-h-0 flex-1">
        <div className="flex min-h-0 flex-1 flex-col">
          {resolvedHasStartedChat ? (
            <>
              <div className="min-h-0 flex-1 overflow-hidden overscroll-y-contain bg-muted/20 px-4 py-4">
                <div className="h-full w-full">
                  {shouldVirtualizeMessages ? (
                    <Virtuoso
                      style={{ height: "100%" }}
                      totalCount={renderedMessages.length}
                      overscan={240}
                      itemContent={renderVirtualizedMessage}
                      components={{
                        Header: () => (
                          <div className="mx-auto w-full max-w-4xl">
                            {messageListHeader}
                          </div>
                        ),
                        Footer: () => (
                          <div className="mx-auto w-full max-w-4xl">
                            {messageListFooter}
                            <div className="pb-4" />
                          </div>
                        ),
                      }}
                    />
                  ) : (
                    <div className="h-full overflow-y-auto">
                      <div className="mx-auto w-full max-w-4xl space-y-6 pb-4">
                        {messageListHeader}
                        {renderedMessages}
                        {messageListFooter}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="z-10 mt-auto shrink-0 bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/85">
                <div className="mx-auto w-full max-w-3xl">
                  {renderComposer ? renderComposer(composerProps) : <ChatInputBar {...composerProps} />}
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center px-4 pb-12 sm:px-6">
              <div className="w-full max-w-3xl">
                <div className="mb-5 flex justify-center">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
                    <Sparkles className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
                <p className="mb-2 text-center text-xl font-semibold text-foreground sm:text-2xl">
                  {emptyStateTitle}
                </p>
                {emptyStateSubtitle ? (
                  <p className="mb-5 text-center text-sm text-muted-foreground sm:text-base">
                    {emptyStateSubtitle}
                  </p>
                ) : (
                  <div className="mb-5" />
                )}
                {renderComposer ? renderComposer(composerProps) : <ChatInputBar {...composerProps} />}
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {SUGGESTION_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => onInputChange(prompt)}
                      className="rounded-full border border-border px-4 py-1.5 text-xs text-muted-foreground transition-colors hover:border-foreground/25 hover:text-foreground"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showHistorySidebar && !shouldDockHistorySidebar ? (
        <button
          type="button"
          className="absolute inset-0 z-20 bg-black/25"
          aria-label="Close chat history"
          onClick={() => setShowHistorySidebar(false)}
        />
      ) : null}

      {!shouldDockHistorySidebar ? (
        <aside
          className={`absolute inset-y-0 left-0 z-30 w-64 border-r bg-background shadow-lg transition-transform duration-200 ease-out ${
            showHistorySidebar ? "translate-x-0" : "-translate-x-full"
          }`}
          aria-hidden={!showHistorySidebar}
        >
          {historySidebarContent}
        </aside>
      ) : null}
    </div>
  );
};
