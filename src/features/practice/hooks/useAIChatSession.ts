import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
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

const toSession = (session: AIChatSession | AIChatSessionMetadata): AIChatSession => (
  "messages" in session
    ? session
    : { ...session, messages: [] }
);

const findMatchingSession = (
  sessions: AIChatSession[],
  targetSession: AIChatSession | AIChatSessionMetadata,
) => sessions.find((session) => (
  session.id === targetSession.id
    || (
      session.conversationId !== null
      && targetSession.conversationId !== null
      && session.conversationId === targetSession.conversationId
    )
));

export const useAIChatSession = (options?: UseAIChatSessionOptions): UseAIChatSessionReturn => {
  const createInitialSession = options?.createInitialSession ?? createSessionFactory;
  const initialSessionsRef = useRef<AIChatSession[]>(
    options?.initialSessions && options.initialSessions.length > 0
      ? options.initialSessions
      : [createInitialSession()]
  );
  const [sessions, setSessions] = useState<AIChatSession[]>(initialSessionsRef.current);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(
    options?.initialActiveSessionId ?? initialSessionsRef.current[0]?.id ?? null
  );
  const sessionsRef = useRef<AIChatSession[]>(initialSessionsRef.current);
  const activeSessionIdRef = useRef<string | null>(
    options?.initialActiveSessionId ?? initialSessionsRef.current[0]?.id ?? null
  );

  useEffect(() => {
    sessionsRef.current = sessions;
  }, [sessions]);

  useEffect(() => {
    activeSessionIdRef.current = activeSessionId;
  }, [activeSessionId]);

  const ensureActiveSession = useCallback((currentSessions: AIChatSession[]) => {
    if (currentSessions.length > 0) {
      return currentSessions;
    }

    return [createInitialSession()];
  }, [createInitialSession]);

  const createSession = useCallback(() => {
    const newSession = createInitialSession();
    setSessions((previous) => [newSession, ...previous]);
    setActiveSessionId(newSession.id);
    return newSession;
  }, [createInitialSession]);

  const updateSession = useCallback((sessionId: string, updates: Partial<Omit<AIChatSession, "id">>) => {
    setSessions((previous) => previous.map((session) => (
      session.id === sessionId
        ? {
            ...session,
            ...updates,
            updatedAt: updates.updatedAt ?? Date.now(),
          }
        : session
    )));
  }, []);

  const appendMessage = useCallback((message: AIChatMessage, sessionId?: string) => {
    const targetSessionId = sessionId ?? activeSessionId;
    if (!targetSessionId) {
      return;
    }

    setSessions((previous) => previous.map((session) => (
      session.id === targetSessionId
        ? {
            ...session,
            updatedAt: Date.now(),
            messages: [...session.messages, message],
          }
        : session
    )));
  }, [activeSessionId]);

  const replaceMessages = useCallback((messages: AIChatMessage[], sessionId?: string) => {
    const targetSessionId = sessionId ?? activeSessionId;
    if (!targetSessionId) {
      return;
    }

    setSessions((previous) => previous.map((session) => (
      session.id === targetSessionId
        ? {
            ...session,
            updatedAt: Date.now(),
            messages,
          }
        : session
    )));
  }, [activeSessionId]);

  const updateMessage = useCallback((messageId: string, updater: (message: AIChatMessage) => AIChatMessage, sessionId?: string) => {
    const targetSessionId = sessionId ?? activeSessionId;
    if (!targetSessionId) {
      return;
    }

    setSessions((previous) => previous.map((session) => (
      session.id === targetSessionId
        ? {
            ...session,
            updatedAt: Date.now(),
            messages: session.messages.map((message) => message.id === messageId ? updater(message) : message),
          }
        : session
    )));
  }, [activeSessionId]);

  const switchSession = useCallback((sessionId: string) => {
    setActiveSessionId(sessionId);
  }, []);

  const deleteSession = useCallback((sessionId: string) => {
    setSessions((previous) => {
      const nextSessions = ensureActiveSession(previous.filter((session) => session.id !== sessionId));
      setActiveSessionId((currentActiveSessionId) => {
        if (currentActiveSessionId !== sessionId) {
          return currentActiveSessionId;
        }

        return nextSessions[0]?.id ?? null;
      });
      return nextSessions;
    });
  }, [ensureActiveSession]);

  const hydrateSessions = useCallback((nextSessions: Array<AIChatSession | AIChatSessionMetadata>) => {
    const previousSessions = sessionsRef.current;
    const hydratedSessions = nextSessions.map((session) => {
      const normalizedSession = toSession(session);
      const existingSession = findMatchingSession(previousSessions, normalizedSession);

      return existingSession
        ? {
            ...existingSession,
            ...normalizedSession,
            id: existingSession.id,
            messages: normalizedSession.messages.length > 0 ? normalizedSession.messages : existingSession.messages,
          }
        : normalizedSession;
    });

    const preservedLocalSessions = previousSessions.filter(
      (session) => !nextSessions.some((nextSession) => findMatchingSession([session], nextSession))
    );

    const mergedSessions = [...hydratedSessions, ...preservedLocalSessions];
    const nextMergedSessions = mergedSessions.length > 0 ? mergedSessions : ensureActiveSession(previousSessions);
    sessionsRef.current = nextMergedSessions;
    setSessions(nextMergedSessions);

    const currentId = activeSessionIdRef.current;
    if (!currentId) {
      const nextActiveSessionId = nextMergedSessions[0]?.id ?? null;
      activeSessionIdRef.current = nextActiveSessionId;
      setActiveSessionId(nextActiveSessionId);
      return;
    }

    if (nextMergedSessions.some((session) => session.id === currentId)) {
      setActiveSessionId(currentId);
      return;
    }

    const currentSession = previousSessions.find((session) => session.id === currentId);
    if (currentSession?.conversationId) {
      const matchingMergedSession = nextMergedSessions.find(
        (session) => session.conversationId === currentSession.conversationId
      );

      if (matchingMergedSession) {
        activeSessionIdRef.current = matchingMergedSession.id;
        setActiveSessionId(matchingMergedSession.id);
        return;
      }
    }

    const fallbackSessionId = nextMergedSessions[0]?.id ?? null;
    activeSessionIdRef.current = fallbackSessionId;
    setActiveSessionId(fallbackSessionId);
  }, [ensureActiveSession]);

  const activeSession = useMemo(
    () => sessions.find((session) => session.id === activeSessionId) ?? sessions[0] ?? null,
    [activeSessionId, sessions]
  );

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