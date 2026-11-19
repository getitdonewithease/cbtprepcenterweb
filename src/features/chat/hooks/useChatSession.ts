import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ChatMessage } from "../types/chatTypes";
import type { ChatSession, ChatSessionMetadata } from "../types/chatHistoryTypes";

interface UseChatSessionOptions<
  TMessage extends ChatMessage,
  TSession extends ChatSession<TMessage>,
> {
  createInitialSession: () => TSession;
  initialActiveSessionId?: string | null;
  initialSessions?: TSession[];
}

interface UseChatSessionReturn<
  TMessage extends ChatMessage,
  TSession extends ChatSession<TMessage>,
  TSessionMetadata extends ChatSessionMetadata,
> {
  activeSession: TSession | null;
  activeSessionId: string | null;
  appendMessage: (message: TMessage, sessionId?: string) => void;
  createSession: () => TSession;
  deleteSession: (sessionId: string) => void;
  hydrateSessions: (sessions: Array<TSession | TSessionMetadata>) => void;
  replaceMessages: (messages: TMessage[], sessionId?: string) => void;
  sessions: TSession[];
  switchSession: (sessionId: string) => void;
  updateMessage: (
    messageId: string,
    updater: (message: TMessage) => TMessage,
    sessionId?: string,
  ) => void;
  updateSession: (sessionId: string, updates: Partial<Omit<TSession, "id">>) => void;
}

const toSession = <
  TMessage extends ChatMessage,
  TSession extends ChatSession<TMessage>,
  TSessionMetadata extends ChatSessionMetadata,
>(
  session: TSession | TSessionMetadata,
): TSession => {
  if ("messages" in session) {
    return session;
  }

  return {
    ...session,
    messages: [],
  } as unknown as TSession;
};

const findMatchingSession = <
  TMessage extends ChatMessage,
  TSession extends ChatSession<TMessage>,
  TSessionMetadata extends ChatSessionMetadata,
>(
  sessions: TSession[],
  targetSession: TSession | TSessionMetadata,
) => {
  return sessions.find(
    (session) =>
      session.id === targetSession.id ||
      (session.conversationId !== null &&
        targetSession.conversationId !== null &&
        session.conversationId === targetSession.conversationId),
  );
};

export const useChatSession = <
  TMessage extends ChatMessage,
  TSession extends ChatSession<TMessage>,
  TSessionMetadata extends ChatSessionMetadata = ChatSessionMetadata,
>(
  options: UseChatSessionOptions<TMessage, TSession>,
): UseChatSessionReturn<TMessage, TSession, TSessionMetadata> => {
  const initialSessionsRef = useRef<TSession[]>(
    options.initialSessions && options.initialSessions.length > 0
      ? options.initialSessions
      : [options.createInitialSession()],
  );
  const [sessions, setSessions] = useState<TSession[]>(initialSessionsRef.current);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(
    options.initialActiveSessionId ?? initialSessionsRef.current[0]?.id ?? null,
  );
  const sessionsRef = useRef<TSession[]>(initialSessionsRef.current);
  const activeSessionIdRef = useRef<string | null>(
    options.initialActiveSessionId ?? initialSessionsRef.current[0]?.id ?? null,
  );

  useEffect(() => {
    sessionsRef.current = sessions;
  }, [sessions]);

  useEffect(() => {
    activeSessionIdRef.current = activeSessionId;
  }, [activeSessionId]);

  const ensureAtLeastOneSession = useCallback(
    (currentSessions: TSession[]) => {
      if (currentSessions.length > 0) {
        return currentSessions;
      }

      return [options.createInitialSession()];
    },
    [options],
  );

  const createSession = useCallback(() => {
    const nextSession = options.createInitialSession();
    setSessions((previous) => [nextSession, ...previous]);
    setActiveSessionId(nextSession.id);
    return nextSession;
  }, [options]);

  const updateSession = useCallback((sessionId: string, updates: Partial<Omit<TSession, "id">>) => {
    setSessions((previous) =>
      previous.map((session) =>
        session.id === sessionId
          ? {
              ...session,
              ...updates,
              updatedAt: updates.updatedAt ?? Date.now(),
            }
          : session,
      ),
    );
  }, []);

  const appendMessage = useCallback(
    (message: TMessage, sessionId?: string) => {
      const targetSessionId = sessionId ?? activeSessionId;
      if (!targetSessionId) {
        return;
      }

      setSessions((previous) =>
        previous.map((session) =>
          session.id === targetSessionId
            ? {
                ...session,
                updatedAt: Date.now(),
                messages: [...session.messages, message],
              }
            : session,
        ),
      );
    },
    [activeSessionId],
  );

  const replaceMessages = useCallback(
    (messages: TMessage[], sessionId?: string) => {
      const targetSessionId = sessionId ?? activeSessionId;
      if (!targetSessionId) {
        return;
      }

      setSessions((previous) =>
        previous.map((session) =>
          session.id === targetSessionId
            ? {
                ...session,
                updatedAt: Date.now(),
                messages,
              }
            : session,
        ),
      );
    },
    [activeSessionId],
  );

  const updateMessage = useCallback(
    (
      messageId: string,
      updater: (message: TMessage) => TMessage,
      sessionId?: string,
    ) => {
      const targetSessionId = sessionId ?? activeSessionId;
      if (!targetSessionId) {
        return;
      }

      setSessions((previous) =>
        previous.map((session) =>
          session.id === targetSessionId
            ? {
                ...session,
                updatedAt: Date.now(),
                messages: session.messages.map((message) =>
                  message.id === messageId ? updater(message) : message,
                ),
              }
            : session,
        ),
      );
    },
    [activeSessionId],
  );

  const switchSession = useCallback((sessionId: string) => {
    setActiveSessionId(sessionId);
  }, []);

  const deleteSession = useCallback(
    (sessionId: string) => {
      setSessions((previous) => {
        const remaining = previous.filter((session) => session.id !== sessionId);
        const nextSessions = ensureAtLeastOneSession(remaining);

        setActiveSessionId((currentActiveSessionId) => {
          if (currentActiveSessionId !== sessionId) {
            return currentActiveSessionId;
          }

          return nextSessions[0]?.id ?? null;
        });

        return nextSessions;
      });
    },
    [ensureAtLeastOneSession],
  );

  const hydrateSessions = useCallback(
    (nextSessions: Array<TSession | TSessionMetadata>) => {
      const previousSessions = sessionsRef.current;
      const hydratedSessions = nextSessions.map((session) => {
        const normalizedSession = toSession<TMessage, TSession, TSessionMetadata>(session);
        const existingSession = findMatchingSession<TMessage, TSession, TSessionMetadata>(
          previousSessions,
          normalizedSession,
        );

        return existingSession
          ? {
              ...existingSession,
              ...normalizedSession,
              id: existingSession.id,
              messages:
                normalizedSession.messages.length > 0
                  ? normalizedSession.messages
                  : existingSession.messages,
            }
          : normalizedSession;
      });

      const preservedLocalSessions = previousSessions.filter(
        (session) => !nextSessions.some((nextSession) =>
          findMatchingSession<TMessage, TSession, TSessionMetadata>([session], nextSession),
        ),
      );

      const mergedSessions = [...hydratedSessions, ...preservedLocalSessions];
      const nextMergedSessions =
        mergedSessions.length > 0 ? mergedSessions : ensureAtLeastOneSession(previousSessions);

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
          (session) => session.conversationId === currentSession.conversationId,
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
    },
    [ensureAtLeastOneSession],
  );

  const activeSession = useMemo(
    () => sessions.find((session) => session.id === activeSessionId) ?? sessions[0] ?? null,
    [activeSessionId, sessions],
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
