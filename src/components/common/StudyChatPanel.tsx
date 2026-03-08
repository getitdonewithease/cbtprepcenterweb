import { useMemo, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Maximize2,
  Menu,
  MessageSquarePlus,
  Minimize2,
  PanelLeftClose,
  Send,
  SidebarOpen,
  X,
} from "lucide-react";

export interface StudyChatMessage {
  id: string;
  role: "assistant" | "user";
  content: string;
}

export interface ChatHistorySession {
  id: string;
  title: string;
  updatedAt: number;
}

interface StudyChatPanelProps {
  messages: StudyChatMessage[];
  sessions: ChatHistorySession[];
  activeSessionId: string;
  isFullscreen: boolean;
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
  chatInput,
  onInputChange,
  onSend,
  onStartNewChat,
  onSelectSession,
  onToggleFullscreen,
  onClose,
}: StudyChatPanelProps) => {
  const [showHistorySidebar, setShowHistorySidebar] = useState(false);

  const orderedSessions = useMemo(
    () => [...sessions].sort((a, b) => b.updatedAt - a.updatedAt),
    [sessions]
  );

  return (
    <div className="h-full flex flex-col border-l bg-background relative overflow-hidden">
      <div className="px-2 py-2 border-b flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle chat history"
            onClick={() => setShowHistorySidebar((previous) => !previous)}
          >
            <SidebarOpen className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center">
          <Button variant="ghost" size="icon" aria-label="Start new chat" onClick={onStartNewChat}>
            <MessageSquarePlus className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={isFullscreen ? "Exit full page chat" : "Open full page chat"}
            onClick={onToggleFullscreen}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" aria-label="Close chat" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex relative">
        <div className="flex-1 min-h-0 flex flex-col">
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-muted/20">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                  message.role === "user"
                    ? "ml-auto bg-primary text-primary-foreground"
                    : "mr-auto bg-background border"
                }`}
              >
                {message.content}
              </div>
            ))}
          </div>

          <div className="border-t p-4">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Type your message..."
                value={chatInput}
                onChange={(event) => onInputChange(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    onSend();
                  }
                }}
              />
              <Button size="icon" onClick={onSend} aria-label="Send message">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

      </div>

      {showHistorySidebar && (
        <button
          type="button"
          className="absolute inset-0 z-20 bg-black/25"
          aria-label="Close chat history"
          onClick={() => setShowHistorySidebar(false)}
        />
      )}

      <aside
        className={`absolute inset-y-0 left-0 z-30 w-64 border-r bg-background transition-transform duration-200 ease-out ${
          showHistorySidebar ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-hidden={!showHistorySidebar}
      >
        <div className="h-full flex flex-col">
          <div className="px-2 py-2 border-b flex items-center justify-end">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Close history sidebar"
              onClick={() => setShowHistorySidebar(false)}
            >
              <PanelLeftClose className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {orderedSessions.map((session) => (
              <button
                key={session.id}
                type="button"
                onClick={() => {
                  onSelectSession(session.id);
                  setShowHistorySidebar(false);
                }}
                className={`w-full text-left rounded-md px-2 py-2 text-sm transition-colors ${
                  session.id === activeSessionId
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
              >
                <p className="truncate font-medium">{session.title}</p>
              </button>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
};
