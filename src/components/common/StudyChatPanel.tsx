import { ChatPanelBase, type ChatHistorySession as SharedChatHistorySession, type ChatMessage as SharedChatMessage } from "@/features/chat";

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
  onStartNewChat: () => void;
  onSelectSession: (sessionId: string) => void;
  onToggleFullscreen: () => void;
  onClose: () => void;
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
  onStartNewChat,
  onSelectSession,
  onToggleFullscreen,
  onClose,
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
    onStartNewChat={onStartNewChat}
    onSelectSession={onSelectSession}
    onToggleFullscreen={onToggleFullscreen}
    onClose={onClose}
  />
);
