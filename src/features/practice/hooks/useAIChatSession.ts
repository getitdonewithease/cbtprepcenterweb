import { useMemo } from "react";
import { v4 as uuidv4 } from "uuid";
import { useChatSession } from "@/features/chat";
import type { AIChatMessage, AIChatSession, AIChatSessionMetadata } from "../types/aiChatTypes";

interface UseAIChatSessionOptions {
  createInitialSession?: () => AIChatSession;
  initialActiveSessionId?: string | null;
  initialSessions?: AIChatSession[];
}

interface UseAIChatSessionReturn {
  activeSession: AIChatSession | null;
  activeSessionId: string | null;
  appendMessage: (message: AIChatMessage, sessionId?: string) => void;
  createSession: () => AIChatSession;
  deleteSession: (sessionId: string) => void;
  hydrateSessions: (sessions: Array<AIChatSession | AIChatSessionMetadata>) => void;
  replaceMessages: (messages: AIChatMessage[], sessionId?: string) => void;
  sessions: AIChatSession[];
  switchSession: (sessionId: string) => void;
  updateMessage: (messageId: string, updater: (message: AIChatMessage) => AIChatMessage, sessionId?: string) => void;
  updateSession: (sessionId: string, updates: Partial<Omit<AIChatSession, "id">>) => void;
}

const createSessionFactory = (): AIChatSession => {
  const createdAt = new Date();
  const localSessionId = uuidv4();

  return {
    id: `chat-local-${localSessionId}`,
    title: "New chat",
    createdAt,
    updatedAt: createdAt.getTime(),
    conversationId: null,
    messages: [],
  };
};

export const useAIChatSession = (options?: UseAIChatSessionOptions): UseAIChatSessionReturn => {
  const createInitialSession = options?.createInitialSession ?? createSessionFactory;
  const chatSessionOptions = useMemo(
    () => ({
      createInitialSession,
      initialActiveSessionId: options?.initialActiveSessionId,
      initialSessions: options?.initialSessions,
    }),
    [createInitialSession, options?.initialActiveSessionId, options?.initialSessions],
  );
  const {
    activeSession,
    activeSessionId,
    appendMessage,
    createSession,
    deleteSession,
    hydrateSessions,
    replaceMessages,
    sessions,
    switchSession,
    updateMessage,
    updateSession,
  } = useChatSession<AIChatMessage, AIChatSession, AIChatSessionMetadata>(chatSessionOptions);

  return {
    activeSession,
    activeSessionId,
    appendMessage,
    createSession,
    deleteSession,
    hydrateSessions,
    replaceMessages,
    sessions,
    switchSession,
    updateMessage,
    updateSession,
  };
};