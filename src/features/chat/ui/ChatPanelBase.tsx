import { useMemo, useState, type ReactNode } from "react";
import {
  Maximize2,
  MessageSquarePlus,
  Minimize2,
  PanelLeft,
  PanelRight,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatInputBar, type ChatInputBarProps } from "./ChatInputBar";
import type { ChatHistorySession, ChatMessage } from "../types/chatTypes";

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

const defaultRenderMessage = <TMessage extends ChatMessage>(message: TMessage) => (
  <div key={message.id} className={message.role === "user" ? "flex justify-end" : "flex justify-center"}>
    <div
      className={message.role === "user"
        ? "max-w-[60%] whitespace-pre-wrap break-words rounded-2xl bg-[#F7F7F7] px-4 py-2.5 text-sm text-foreground shadow-sm"
        : "w-full max-w-3xl px-1 text-base leading-7 text-foreground"
      }
    >
      {message.content}
    </div>
  </div>
);

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
    () => [...sessions].sort((a, b) => b.updatedAt - a.updatedAt),
    [sessions]
  );

  const resolvedHasStartedChat = hasStartedChat ?? messages.some((message) => message.role === "user");
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
      <div className="flex items-center justify-between border-b px-3 py-2">
        <p className="text-sm font-semibold text-foreground">Chats</p>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Close history sidebar"
          onClick={() => setShowHistorySidebar(false)}
        >
          <PanelRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 space-y-1 overflow-y-auto p-2">
        {orderedSessions.map((session) => {
          const isActive = session.id === activeSessionId;

          return (
            <div
              key={session.id}
              className={`group flex items-center gap-2 rounded-md transition-colors ${
                isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"
              }`}
            >
              <button
                type="button"
                onClick={() => {
                  onSelectSession(session.id);
                  setShowHistorySidebar(false);
                }}
                className="min-w-0 flex-1 rounded-md px-2 py-2 text-left text-sm"
              >
                <p className="truncate font-medium">{session.title}</p>
              </button>
              {renderSessionActions ? (
                <div
                  className={`pr-1 ${isActive ? "text-primary-foreground" : "text-muted-foreground"}`}
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

      <div className="flex items-center justify-between px-2 py-2">
        <div className="flex items-center">
          {!(shouldDockHistorySidebar && showHistorySidebar) ? (
            <Button
              variant="ghost"
              size="icon"
              aria-label="Toggle chat history"
              onClick={() => setShowHistorySidebar((previous) => !previous)}
            >
              <PanelLeft className="h-4 w-4" />
            </Button>
          ) : null}
        </div>

        <div className="flex items-center">
          <Button variant="ghost" size="icon" aria-label="Start new chat" onClick={onStartNewChat}>
            <MessageSquarePlus className="h-4 w-4" />
          </Button>
          {!isMobileView ? (
            <Button
              variant="ghost"
              size="icon"
              aria-label={isFullscreen ? "Exit full page chat" : "Open full page chat"}
              onClick={onToggleFullscreen}
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          ) : null}
          <Button variant="ghost" size="icon" aria-label="Close chat" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="relative flex min-h-0 flex-1">
        <div className="flex min-h-0 flex-1 flex-col">
          {resolvedHasStartedChat ? (
            <>
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain bg-muted/20 px-4 py-4">
                <div className="mx-auto w-full max-w-4xl space-y-12 pb-4">
                  {messageListHeader}
                  {messages.map((message) => renderMessage ? renderMessage(message) : defaultRenderMessage(message))}
                  {messageListFooter}
                </div>
              </div>

              <div className="z-10 mt-auto shrink-0  bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/85">
                <div className="mx-auto w-full max-w-3xl">
                  {renderComposer ? renderComposer(composerProps) : <ChatInputBar {...composerProps} />}
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center px-4 pb-12 sm:px-6">
              <div className="w-full max-w-3xl">
                <p className="mb-4 text-center text-2xl font-semibold text-foreground sm:text-3xl">
                  {emptyStateTitle}
                </p>
                {emptyStateSubtitle ? (
                  <p className="mb-6 text-center text-sm text-muted-foreground sm:text-base">{emptyStateSubtitle}</p>
                ) : null}
                {renderComposer ? renderComposer(composerProps) : <ChatInputBar {...composerProps} />}
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
          className={`absolute inset-y-0 left-0 z-30 w-64 border-r bg-background transition-transform duration-200 ease-out ${
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