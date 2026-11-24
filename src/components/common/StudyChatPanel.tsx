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
  /** While an answer streams the send button becomes Stop. */
  isStreaming?: boolean;
  onStop?: () => void;
  renderMessage?: (message: StudyChatMessage) => React.ReactNode;
  emptyState?: React.ReactNode;
  contextLine?: React.ReactNode;
  /** Stays at the top of the conversation (a review question the chat is about). */
  messageListHeader?: React.ReactNode;
  messageListFooter?: React.ReactNode;
  /** Placeholder for the message box. */
  composerPlaceholder?: string;
}

/** The AI tutor in the app frame: the shared chat panel with the frame's message box. */
export const StudyChatPanel = ({
  sendDisabled = false,
  isStreaming = false,
  onStop,
  composerPlaceholder,
  ...panelProps
}: StudyChatPanelProps) => (
  <ChatPanelBase
    {...panelProps}
    renderComposer={(composerProps) => (
      <ChatInputBar {...composerProps} placeholder={composerPlaceholder} sendDisabled={sendDisabled} isStreaming={isStreaming} onStop={onStop} />
    )}
  />
);
