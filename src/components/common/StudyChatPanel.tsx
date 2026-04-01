import React from "react";
import {
  ChatInputBar,
  ChatPanelBase,
  type ChatHistorySession as SharedChatHistorySession,
  type ChatMessage as SharedChatMessage,
} from "@/features/chat";

export type StudyChatMessage = SharedChatMessage;
export type ChatHistorySession = SharedChatHistorySession;

interface StudyChatPanelProps {
  messages: StudyChatMessage[];
  sessions: ChatHistorySession[];
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
  sendDisabled?: boolean;
  renderMessage?: (message: StudyChatMessage) => React.ReactNode;
}

export const StudyChatPanel = ({
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
  sendDisabled = false,
  renderMessage,
}: StudyChatPanelProps) => (
  <ChatPanelBase
    messages={messages}
    sessions={sessions}
    activeSessionId={activeSessionId}
    isFullscreen={isFullscreen}
    isMobileView={isMobileView}
    chatInput={chatInput}
    onInputChange={onInputChange}
    onSend={onSend}
    onSendWithMode={onSendWithMode}
    onStartNewChat={onStartNewChat}
    onSelectSession={onSelectSession}
    onToggleFullscreen={onToggleFullscreen}
    onClose={onClose}
    renderMessage={renderMessage}
    renderComposer={(composerProps) => (
      <ChatInputBar
        {...composerProps}
        sendDisabled={sendDisabled}
      />
    )}
  />
);
