import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { cn } from "@/core/ui/cn";
import { FOCUS_RING, PRESSABLE, SECONDARY_ACTION } from "@/core/ui/styles";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "../ui/resizable";
import type { ImperativePanelHandle } from "react-resizable-panels";
import {
  StartTestButton,
  StartTestDialogs,
  UserSubjectsWarning,
  useStartTest,
  useTutorSuggestions,
  useUserContext,
} from "@/features/dashboard";
import { TutorAnswer, TutorEmptyState, TutorNoAnswer, TutorThinking, UserMessage, WhereNext } from "./frame/TutorMessages";
import { SectionAlertBanner } from "@/components/ui/section-alert-banner";
import { AppTopNav } from "./AppTopNav";
import AppSidebar from "./frame/AppSidebar";
import AppTabBar from "./frame/AppTabBar";
import AccountMenu from "./frame/AccountMenu";
import { useAuth } from "@/features/auth";
import { StudyChatPanel, type ChatHistorySession, type StudyChatMessage } from "./StudyChatPanel";
import {
  createBackendChatSession,
  getBackendChatContents,
  getBackendChats,
  parseSubmittedQuizResults,
  streamBackendChatMessage,
  useChatHistory,
  useChatSession,
  useChatStreaming,
  type ChatSessionMetadata,
} from "@/features/chat";

interface LayoutProps {
  title: string;
  children: React.ReactNode;
  /** The page has its own primary action, so Start test steps back to secondary. */
  hasPrimaryAction?: boolean;
  chatLaunchRequest?: {
    /** What is being studied, shown under the tutor's header (e.g. "Physics · Projectile motion"). */
    context?: string;
    id: number;
    message: string;
  };
}

type ChatSession = ChatHistorySession & {
  conversationId: string | null;
  createdAt?: Date;
  messages: StudyChatMessage[];
};

const EMPTY_STUDY_MESSAGES: StudyChatMessage[] = [];

const createChatSession = (): ChatSession => {
  const now = Date.now();
  return {
    id: `chat-local-${now}`,
    title: "New chat",
    updatedAt: now,
    createdAt: new Date(now),
    conversationId: null,
    messages: [],
  };
};

const findSubmittedQuizAnswersForStudyMessage = (
  messages: StudyChatMessage[],
  assistantMessageId: string,
) => {
  const messageIndex = messages.findIndex((entry) => entry.id === assistantMessageId);
  if (messageIndex < 0) {
    return null;
  }

  for (let i = messageIndex + 1; i < messages.length; i += 1) {
    const candidate = messages[i];
    if (candidate.role === "assistant") {
      break;
    }
    if (candidate.role === "user") {
      const parsed = parseSubmittedQuizResults(candidate.content);
      if (parsed) {
        return parsed;
      }
    }
  }

  return null;
};

const SIDEBAR_KEY = "fasiti-sidebar";

/** The saved choice, else collapsed on tablets, where the tutor panel needs the room. */
const readSidebarCollapsed = (): boolean => {
  try {
    const saved = window.localStorage.getItem(SIDEBAR_KEY);
    if (saved) return saved === "collapsed";
  } catch {
    // Storage can be blocked; fall back to the width rule
  }
  return typeof window !== "undefined" && window.matchMedia("(max-width: 1023px)").matches;
};

const writeSidebarCollapsed = (collapsed: boolean) => {
  try {
    window.localStorage.setItem(SIDEBAR_KEY, collapsed ? "collapsed" : "open");
  } catch {
    // Not saved; the choice still holds for this page
  }
};

const Layout: React.FC<LayoutProps> = ({ title, children, hasPrimaryAction = false, chatLaunchRequest }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(readSidebarCollapsed);
  const toggleSidebar = () =>
    setIsSidebarCollapsed((collapsed) => {
      writeSidebarCollapsed(!collapsed);
      return !collapsed;
    });
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isChatFullscreen, setIsChatFullscreen] = useState(false);
  const mainPanelRef = useRef<ImperativePanelHandle>(null);
  const chatPanelRef = useRef<ImperativePanelHandle>(null);
  const activeSessionIdRef = useRef<string | null>(null);
  const loadingConversationIdRef = useRef<string | null>(null);
  // Tracks conversations whose content has been loaded, including empty ones,
  // so an empty transcript cannot trigger a fetch/replace loop.
  const loadedConversationIdsRef = useRef<Set<string>>(new Set());
  // Prevents re-hydrating the same metadata array on every render.
  const hydratedMetadataRef = useRef<ChatSessionMetadata[] | null>(null);
  const streamTargetSessionIdRef = useRef<string | null>(null);
  const streamFlushRafRef = useRef<number | null>(null);
  const pendingStreamUpdateRef = useRef<{
    messageId: string;
    content: string;
    sessionId: string;
  } | null>(null);
  const [chatPanelSize, setChatPanelSize] = useState(30);
  const [chatInput, setChatInput] = useState('');
  const [historyContentLoading, setHistoryContentLoading] = useState(false);
  const [consumedRequestId, setConsumedRequestId] = useState<number | null>(null);
  /** A launched prompt waiting for its new chat session to reach state. */
  const [pendingLaunch, setPendingLaunch] = useState<{ sessionId: string; prompt: string } | null>(null);
  /** What a launched chat is about, for the tutor's context line. */
  const [launchContext, setLaunchContext] = useState<{ sessionId: string; label: string } | null>(null);
  const [isMobileViewport, setIsMobileViewport] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }

    return window.matchMedia('(max-width: 767px)').matches;
  });
  const location = useLocation();

  // Get user from context (shared across all pages)
  const { user, userLoading, userError } = useUserContext();
  const { signOut } = useAuth();
  const { prepareError, clearPrepareError, preparing, openSetup } = useStartTest();
  const tutorSuggestions = useTutorSuggestions(user?.courses ?? [], isChatOpen);
  const tutorButtonRef = useRef<HTMLButtonElement>(null);
  const mainColumnRef = useRef<HTMLDivElement>(null);
  const chatColumnRef = useRef<HTMLDivElement>(null);

  const isPaidUser = Boolean(
    user && (
      user.isPremium ||
      (user.planName && user.planName.trim().toLowerCase() !== "free")
    )
  );

  const historyAdapter = React.useMemo(() => ({
    fetchSessions: async (): Promise<ChatSessionMetadata[]> => {
      const chats = await getBackendChats();
      return chats.map((chat) => ({
        id: `chat-${chat.id}`,
        title: chat.title,
        createdAt: chat.createdAt,
        updatedAt: chat.createdAt.getTime(),
        conversationId: chat.id,
      }));
    },
    fetchSessionContent: async (conversationId: string) => getBackendChatContents(conversationId),
  }), []);

  const {
    sessions: serverSessionMetadata,
    getSessionContent,
    invalidateSessionContent,
    refetchMetadata,
  } = useChatHistory<StudyChatMessage, ChatSessionMetadata>(historyAdapter);

  const chatSessionOptions = React.useMemo(
    () => ({ createInitialSession: createChatSession }),
    [],
  );

  const {
    activeSession,
    activeSessionId,
    appendMessage,
    createSession,
    hydrateSessions,
    replaceMessages,
    sessions: chatSessions,
    switchSession,
    updateMessage,
    updateSession,
  } = useChatSession<StudyChatMessage, ChatSession, ChatSessionMetadata>(chatSessionOptions);

  const activeSessionMessages = activeSession?.messages ?? EMPTY_STUDY_MESSAGES;

  const resolveTargetSessionId = () => streamTargetSessionIdRef.current ?? activeSessionIdRef.current;

  const flushPendingStreamUpdate = React.useCallback(() => {
    const pendingUpdate = pendingStreamUpdateRef.current;
    if (!pendingUpdate) {
      return;
    }

    updateMessage(
      pendingUpdate.messageId,
      (message) => ({
        ...message,
        content: pendingUpdate.content,
      }),
      pendingUpdate.sessionId,
    );

    pendingStreamUpdateRef.current = null;
  }, [updateMessage]);

  const scheduleStreamUpdateFlush = React.useCallback(() => {
    if (streamFlushRafRef.current !== null) {
      return;
    }

    streamFlushRafRef.current = window.requestAnimationFrame(() => {
      streamFlushRafRef.current = null;
      flushPendingStreamUpdate();
    });
  }, [flushPendingStreamUpdate]);

  const { streamMessage, isStreaming, streamingMessageId, abortStream } = useChatStreaming<{ explanation: string }>({
    conversationId: activeSession?.conversationId ?? null,
    createConversation: createBackendChatSession,
    stream: async (prompt, options) => {
      const streamed = await streamBackendChatMessage(prompt, options.conversationId, {
        signal: options.signal,
        mode: options.mode,
        onToken: options.onToken,
        onComplete: options.onComplete,
      });

      return {
        explanation: streamed.content,
      };
    },
    onConversationReady: (conversationId) => {
      const targetSessionId = resolveTargetSessionId();
      if (!targetSessionId) {
        return;
      }

      updateSession(targetSessionId, { conversationId });
    },
    onStreamStart: (messageId) => {
      const targetSessionId = resolveTargetSessionId();
      if (!targetSessionId) {
        return;
      }

      appendMessage({
        id: messageId,
        role: "assistant",
        content: "",
      }, targetSessionId);
    },
    onStreamToken: (messageId, nextContent) => {
      const targetSessionId = resolveTargetSessionId();
      if (!targetSessionId) {
        return;
      }

      pendingStreamUpdateRef.current = {
        messageId,
        content: nextContent,
        sessionId: targetSessionId,
      };
      scheduleStreamUpdateFlush();
    },
    onStreamComplete: (messageId, response) => {
      const targetSessionId = resolveTargetSessionId();
      if (!targetSessionId) {
        return;
      }

      if (streamFlushRafRef.current !== null) {
        window.cancelAnimationFrame(streamFlushRafRef.current);
        streamFlushRafRef.current = null;
      }

      flushPendingStreamUpdate();

      updateMessage(messageId, (message) => ({
        ...message,
        content: response.explanation,
      }), targetSessionId);
    },
  });

  useEffect(() => {
    return () => {
      if (streamFlushRafRef.current !== null) {
        window.cancelAnimationFrame(streamFlushRafRef.current);
      }
      streamFlushRafRef.current = null;
      pendingStreamUpdateRef.current = null;
    };
  }, []);

  useEffect(() => {
    activeSessionIdRef.current = activeSessionId;
  }, [activeSessionId]);

  useEffect(() => {
    if (serverSessionMetadata.length === 0) {
      return;
    }

    if (hydratedMetadataRef.current === serverSessionMetadata) {
      return;
    }

    hydratedMetadataRef.current = serverSessionMetadata;
    hydrateSessions(serverSessionMetadata);
  }, [hydrateSessions, serverSessionMetadata]);

  const loadSessionContent = React.useCallback(async (session: ChatSession, sessionId: string) => {
    const conversationId = session.conversationId;
    if (!conversationId || session.messages.length > 0) {
      return;
    }

    if (
      loadedConversationIdsRef.current.has(conversationId) ||
      loadingConversationIdRef.current === conversationId
    ) {
      return;
    }

    try {
      loadingConversationIdRef.current = conversationId;
      setHistoryContentLoading(true);
      const historyMessages = await getSessionContent(conversationId);
      loadedConversationIdsRef.current.add(conversationId);
      replaceMessages(historyMessages, sessionId);
    } catch {
      // Error state is already captured in the history hook.
    } finally {
      if (loadingConversationIdRef.current === conversationId) {
        loadingConversationIdRef.current = null;
      }
      setHistoryContentLoading(false);
    }
  }, [getSessionContent, replaceMessages]);

  useEffect(() => {
    if (!activeSession || !activeSessionId) {
      return;
    }

    void loadSessionContent(activeSession, activeSessionId);
  }, [activeSession, activeSessionId, loadSessionContent]);

  const handleLogout = async () => {
    await signOut();
  };

  const sendPrompt = React.useCallback(async (prompt: string, sessionId: string, mode: 0 | 1 = 0) => {
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) {
      return;
    }

    const targetSession = chatSessions.find((session) => session.id === sessionId);
    if (!targetSession) {
      return;
    }

    appendMessage({
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmedPrompt,
    }, sessionId);

    const shouldPromoteDraftTitle = targetSession.title === "New chat";

    streamTargetSessionIdRef.current = sessionId;

    try {
      const response = await streamMessage(trimmedPrompt, mode);
      const resolvedConversationId = response.conversationId;

      if (shouldPromoteDraftTitle) {
        updateSession(sessionId, { title: trimmedPrompt.slice(0, 36) });
      }

      if (resolvedConversationId) {
        updateSession(sessionId, { conversationId: resolvedConversationId });
        invalidateSessionContent(resolvedConversationId);

        try {
          const refreshedMessages = await getSessionContent(resolvedConversationId, { force: true });
          replaceMessages(refreshedMessages, sessionId);
        } catch {
          // Keep optimistic streamed content if server refresh fails.
        }
      }

      await refetchMetadata().catch(() => undefined);
    } catch (caughtError) {
      if (caughtError instanceof Error && caughtError.name === "AbortError") {
        return;
      }

      appendMessage({
        id: `error-${Date.now()}`,
        role: "assistant",
        content: "Sorry, I encountered an error while processing your request. Please try again.",
      }, sessionId);
    } finally {
      streamTargetSessionIdRef.current = null;
    }
  }, [appendMessage, chatSessions, getSessionContent, invalidateSessionContent, refetchMetadata, replaceMessages, streamMessage, updateSession]);

  const sendPromptRef = React.useRef(sendPrompt);
  React.useEffect(() => {
    sendPromptRef.current = sendPrompt;
  }, [sendPrompt]);

  /** Send again the candidate's message that came before an answer that never arrived. */
  const retryBefore = React.useCallback((messageId: string) => {
    if (!activeSession?.id || isStreaming) return;
    const index = activeSessionMessages.findIndex((m) => m.id === messageId);
    const previousUser = [...activeSessionMessages.slice(0, index)].reverse().find((m) => m.role === "user");
    if (previousUser) void sendPromptRef.current(previousUser.content, activeSession.id, 0);
  }, [activeSession?.id, activeSessionMessages, isStreaming]);

  const lastMessageId = activeSessionMessages[activeSessionMessages.length - 1]?.id;

  const renderMessage = React.useCallback((message: StudyChatMessage) => {
    if (message.role === "user") {
      return <UserMessage key={message.id} content={message.content} />;
    }

    // A failed send used to show up as a fake tutor reply; it is an error with a retry now
    if (message.id.startsWith("error-")) {
      return <TutorNoAnswer key={message.id} isError onRetry={() => retryBefore(message.id)} />;
    }

    if (!message.content) {
      const isWorking = isStreaming && message.id === lastMessageId;
      return isWorking ? (
        <TutorThinking key={message.id} />
      ) : (
        <TutorNoAnswer key={message.id} isError={false} onRetry={() => retryBefore(message.id)} />
      );
    }

    return (
      <TutorAnswer
        key={message.id}
        content={message.content}
        isStreaming={message.id === streamingMessageId}
        quizKey={activeSession?.id ?? "study-chat"}
        submittedAnswers={findSubmittedQuizAnswersForStudyMessage(activeSessionMessages, message.id)}
        onSubmitQuiz={(submission) => {
          if (activeSession?.id) {
            void sendPromptRef.current(submission.formattedPrompt, activeSession.id, 0);
          }
        }}
      />
    );
  }, [activeSession?.id, activeSessionMessages, isStreaming, lastMessageId, retryBefore, streamingMessageId]);

  /** Suggestions and follow-ups go straight to the tutor, like a typed message. */
  const askTutor = (prompt: string) => {
    if (!activeSession || isStreaming) return;
    setChatInput("");
    void sendPrompt(prompt, activeSession.id, 0);
  };

  const lastMessage = activeSessionMessages[activeSessionMessages.length - 1];
  const showWhereNext =
    !isStreaming && lastMessage?.role === "assistant" && Boolean(lastMessage.content) && !lastMessage.id.startsWith("error-");

  const handleSendChatMessage = async (mode: 0 | 1 = 0) => {
    const nextMessage = chatInput.trim();
    if (!nextMessage || !activeSession || isStreaming) {
      return;
    }

    setChatInput("");
    await sendPrompt(nextMessage, activeSession.id, mode);
  };

  const handleStartNewChat = () => {
    const hasEmptyDraftSession =
      activeSession?.title === "New chat" &&
      activeSession.messages.length === 0;

    if (!hasEmptyDraftSession) {
      createSession();
    }

    setIsChatOpen(true);
    if (isMobileViewport) {
      setIsChatFullscreen(true);
    }
    setChatInput('');
  };

  const handleSelectChatSession = (sessionId: string) => {
    if (isStreaming) {
      abortStream();
    }
    switchSession(sessionId);
  };

  const handleToggleChatFullscreen = () => {
    if (isMobileViewport) {
      setIsChatOpen(true);
      setIsChatFullscreen(true);
      return;
    }

    setIsChatOpen(true);
    setIsChatFullscreen((previous) => !previous);
  };

  const handleCloseChat = () => {
    if (isStreaming) {
      abortStream();
    }
    setIsChatOpen(false);
    setIsChatFullscreen(false);
    // On phones the tab bar (and its tutor button) only returns after this render
    window.requestAnimationFrame(() => tutorButtonRef.current?.focus());
  };

  const handleToggleTutor = () => {
    const willOpen = !isChatOpen;
    setIsChatOpen(willOpen);
    setIsChatFullscreen(willOpen && isMobileViewport);
  };

  const memoizedCreateSession = React.useCallback(() => {
    return createSession();
  }, [createSession]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const mediaQuery = window.matchMedia('(max-width: 767px)');
    const handleViewportChange = (event: MediaQueryListEvent) => {
      setIsMobileViewport(event.matches);
      if (event.matches && isChatOpen) {
        setIsChatFullscreen(true);
      }
    };

    setIsMobileViewport(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleViewportChange);

    return () => {
      mediaQuery.removeEventListener('change', handleViewportChange);
    };
  }, [isChatOpen]);

  useEffect(() => {
    if (!isChatOpen) {
      chatPanelRef.current?.collapse();
      mainPanelRef.current?.resize(100);
      return;
    }

    if (isMobileViewport) {
      mainPanelRef.current?.collapse();
      chatPanelRef.current?.resize(100);
      return;
    }

    if (isChatFullscreen) {
      mainPanelRef.current?.collapse();
      chatPanelRef.current?.resize(100);
      return;
    }

    mainPanelRef.current?.resize(100 - chatPanelSize);
    if (chatPanelSize > 0) {
      chatPanelRef.current?.resize(chatPanelSize);
    }
  }, [isChatOpen, isChatFullscreen, chatPanelSize, isMobileViewport]);

  useEffect(() => {
    if (!chatLaunchRequest) {
      return;
    }

    // Skip if we've already processed this request (prevents reprocessing on re-renders)
    if (chatLaunchRequest.id === consumedRequestId) {
      return;
    }

    const prompt = chatLaunchRequest.message.trim();
    if (!prompt) {
      return;
    }

    const newSession = createSession();
    setIsChatOpen(true);
    setIsChatFullscreen(true);
    // sendPrompt looks the session up in state, which only has it after the next render
    setPendingLaunch({ sessionId: newSession.id, prompt });
    setLaunchContext(chatLaunchRequest.context ? { sessionId: newSession.id, label: chatLaunchRequest.context } : null);

    // Mark this request as consumed to prevent reprocessing
    setConsumedRequestId(chatLaunchRequest.id);
  }, [chatLaunchRequest, createSession, consumedRequestId]);

  useEffect(() => {
    if (!pendingLaunch || !chatSessions.some((session) => session.id === pendingLaunch.sessionId)) {
      return;
    }
    setPendingLaunch(null);
    void sendPrompt(pendingLaunch.prompt, pendingLaunch.sessionId);
  }, [pendingLaunch, chatSessions, sendPrompt]);

  // A second bar would take over a quarter of a landscape phone
  const hasProfileError = Boolean(userError) && !userLoading;
  const startTestProps = {
    emphasis: hasPrimaryAction ? ("secondary" as const) : ("primary" as const),
    unavailableReasonId: hasProfileError ? "profile-error" : undefined,
  };

  const isMainCollapsed = isChatOpen && (isMobileViewport || isChatFullscreen);

  // A collapsed panel has no width but its controls can still take focus.
  // React 18 has no typed `inert` prop, so the attribute is set on the element.
  useEffect(() => {
    chatColumnRef.current?.toggleAttribute("inert", !isChatOpen);
    mainColumnRef.current?.toggleAttribute("inert", isMainCollapsed);
  }, [isChatOpen, isMainCollapsed]);

  useEffect(() => {
    if (!isChatOpen) return;
    // Wait a frame for the panel to take its width
    const frame = window.requestAnimationFrame(() => {
      chatColumnRef.current?.querySelector("textarea")?.focus({ preventScroll: true });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [isChatOpen]);

  const accountMenu = (variant: "full" | "avatar", side: "top" | "bottom" | "right") => (
    <AccountMenu
      user={user}
      isLoading={userLoading}
      hasError={Boolean(userError)}
      isPaid={isPaidUser}
      onSignOut={() => void handleLogout()}
      variant={variant}
      side={side}
    />
  );

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      <AppSidebar
        pathname={location.pathname}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapsed={toggleSidebar}
        showUpgrade={Boolean(user) && !isPaidUser}
        account={accountMenu(isSidebarCollapsed ? "avatar" : "full", isSidebarCollapsed ? "right" : "top")}
      />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <AppTopNav
        title={title}
        primaryAction={<StartTestButton {...startTestProps} />}
        account={accountMenu("avatar", "bottom")}
        isTutorOpen={isChatOpen}
        onToggleTutor={handleToggleTutor}
        tutorButtonRef={isMobileViewport ? undefined : tutorButtonRef}
      />
      <div className="flex min-h-0 flex-1">
      {/* Main Content + Docked Chat Panel */}
      <div className="h-full min-w-0 flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          <ResizablePanel
            ref={mainPanelRef}
            defaultSize={100}
            minSize={0}
            collapsible
            collapsedSize={0}
          >
            <div ref={mainColumnRef} className="h-full flex flex-col min-h-0 min-w-0">
              {/* Above the scroll area, so it is seen however far down the page is */}
              {(hasProfileError || prepareError) && (
                <div className="fasiti-theme shrink-0 space-y-2 bg-card px-2 py-2 sm:px-4 md:px-8">
                  {hasProfileError && (
                    <SectionAlertBanner
                      id="profile-error"
                      className="mb-0 rounded-xl"
                      description="We couldn't load your profile, so you can't start a test yet."
                      action={
                        <button
                          type="button"
                          // Several hooks load the profile separately; a reload recovers all of them
                          onClick={() => window.location.reload()}
                          className={cn("-my-1 inline-flex min-h-11 shrink-0 items-center self-center rounded-xl px-3 font-semibold", PRESSABLE, SECONDARY_ACTION, FOCUS_RING)}
                        >
                          Try again
                        </button>
                      }
                    />
                  )}
                  {prepareError && (
                    <SectionAlertBanner
                      className="mb-0 rounded-xl"
                      title="Unable to prepare test"
                      description={prepareError}
                      onDismiss={clearPrepareError}
                    />
                  )}
                </div>
              )}
              <main
                id="main-content"
                tabIndex={-1}
                className="flex-1 overflow-auto w-full px-2 sm:px-4 md:px-8 py-4 sm:py-8 focus:outline-none"
              >
                <UserSubjectsWarning className="mb-4" />
                {children}
              </main>
              {/* On phones the tab bar takes this space */}
              <footer className="hidden w-full border-t border-border/50 px-8 py-3 md:block [@media(max-height:480px)]:hidden">
                <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Fasiti</p>
              </footer>
            </div>
          </ResizablePanel>

          <ResizableHandle
            withHandle
            disabled={!isChatOpen || isMobileViewport}
            tabIndex={isChatOpen && !isMobileViewport ? 0 : -1}
            className={isChatOpen && !isMobileViewport ? '' : 'pointer-events-none opacity-0'}
          />
          <ResizablePanel
            ref={chatPanelRef}
            defaultSize={0}
            collapsedSize={0}
            collapsible
            minSize={isMobileViewport || isChatFullscreen ? 100 : 22}
            maxSize={isMobileViewport || isChatFullscreen ? 100 : 45}
            onResize={(size) => {
              if (!isMobileViewport && !isChatFullscreen && size > 0) {
                setChatPanelSize(size);
              }
            }}
            className="min-w-0"
          >
            <div ref={chatColumnRef} className="flex h-full min-h-0 flex-col">
            <StudyChatPanel
              messages={activeSessionMessages}
              sessions={chatSessions}
              activeSessionId={activeSession?.id ?? ""}
              isFullscreen={isMobileViewport || isChatFullscreen}
              isMobileView={isMobileViewport}
              chatInput={chatInput}
              onInputChange={setChatInput}
              onSend={handleSendChatMessage}
              onSendWithMode={handleSendChatMessage}
              onStartNewChat={handleStartNewChat}
              onSelectSession={handleSelectChatSession}
              onToggleFullscreen={handleToggleChatFullscreen}
              onClose={handleCloseChat}
              sendDisabled={isStreaming || historyContentLoading}
              isStreaming={isStreaming}
              onStop={abortStream}
              renderMessage={renderMessage}
              emptyState={
                <TutorEmptyState
                  firstName={user?.firstName?.trim().split(/s+/)[0]}
                  suggestions={tutorSuggestions}
                  onPick={(suggestion) => (suggestion.fillOnly ? setChatInput(suggestion.prompt) : askTutor(suggestion.prompt))}
                />
              }
              contextLine={
                launchContext && launchContext.sessionId === activeSession?.id ? (
                  <span className="text-muted-foreground">
                    Studying <span className="font-semibold text-foreground">{launchContext.label}</span>
                  </span>
                ) : undefined
              }
              messageListFooter={showWhereNext ? <WhereNext onAsk={askTutor} /> : undefined}
            />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
      </div>
      {/* Phones: the tab bar; hidden while the tutor fills the screen */}
      {!isChatOpen && (
        <AppTabBar
          pathname={location.pathname}
          isTutorOpen={isChatOpen}
          onToggleTutor={handleToggleTutor}
          tutorButtonRef={isMobileViewport ? tutorButtonRef : undefined}
          onStartTest={openSetup}
          isPreparing={preparing}
          canStartTest={Boolean(user)}
          startUnavailableReasonId={startTestProps.unavailableReasonId}
        />
      )}
      </div>
      <StartTestDialogs />
    </div>
  );
};

export default Layout;
