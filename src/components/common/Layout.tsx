import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  LayoutDashboard,
  BookText,
  History,
  Award,
  FileText,
  Settings,
  MenuIcon,
  HomeIcon,
  Lock,
  Bookmark,
  LogOut,
  Sparkles,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from "@/core/ui/cn";
import { CLOSE_TARGET, FOCUS_RING, OVERLAY_MOTION, PRESSABLE, SECONDARY_ACTION } from "@/core/ui/styles";
import { useMediaQuery } from "@/core/hooks/useMediaQuery";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "../ui/resizable";
import type { ImperativePanelHandle } from "react-resizable-panels";
import {
  StartTestButton,
  StartTestDialogs,
  UserSubjectsWarning,
  useStartTest,
  useUserContext,
} from "@/features/dashboard";
import { SectionAlertBanner } from "@/components/ui/section-alert-banner";
import { AppActionBar, AppTopNav, NAV_MENU_BUTTON_CLASS } from "./AppTopNav";
import { useAuth } from "@/features/auth";
import { StudyChatPanel, type ChatHistorySession, type StudyChatMessage } from "./StudyChatPanel";
import {
  ChatMarkdownContent,
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

const navigationItems = [
  {
    name: "Dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
    path: "/dashboard",
  },
  {
    name: "Subjects",
    icon: <BookText className="h-5 w-5" />,
    path: "/subjects",
  },
  {
    name: "Test History",
    icon: <History className="h-5 w-5" />,
    path: "/history",
  },
  {
    name: "Leaderboard",
    icon: <Award className="h-5 w-5" />,
    path: "/leaderboard",
  },
  {
    name: "Resources",
    icon: <FileText className="h-5 w-5" />,
    path: "/resources",
  },
  {
    name: "Chats",
    icon: <Sparkles className="h-5 w-5" />,
    path: "/chats",
  },
  {
    name: "Settings",
    icon: <Settings className="h-5 w-5" />,
    path: "/settings",
  },
];

const orange = "hsl(var(--brand-orange))";

const Layout: React.FC<LayoutProps> = ({ title, children, hasPrimaryAction = false, chatLaunchRequest }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
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
  const { prepareError, clearPrepareError } = useStartTest();
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

  const renderMessage = React.useCallback((message: StudyChatMessage) => {
    if (message.role === "assistant" && !message.content) {
      return (
        <div key={message.id} className="flex items-start gap-3 px-1 py-1">
          <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted">
            <Sparkles className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <div className="flex items-center gap-1.5 rounded-xl bg-muted/50 px-4 py-3.5">
            <span className="block h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:-0.3s]" />
            <span className="block h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:-0.15s]" />
            <span className="block h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50" />
          </div>
        </div>
      );
    }

    const submittedQuizAnswers =
      message.role === "assistant"
        ? findSubmittedQuizAnswersForStudyMessage(activeSessionMessages, message.id)
        : null;

    return (
      <div key={message.id} className={message.role === "user" ? "flex justify-end" : "flex items-start gap-3 px-1"}>
        {message.role === "assistant" ? (
          <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted">
            <Sparkles className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
        ) : null}
        <div
          className={message.role === "user"
            ? "max-w-[60%] rounded-xl bg-muted px-4 py-2.5 text-sm text-foreground"
            : "flex-1 text-base leading-7 text-foreground"
          }
        >
          {message.role === "assistant" ? (
            <ChatMarkdownContent
              content={message.content}
              quizKey={activeSession?.id ?? "study-chat"}
              initialSubmittedAnswers={submittedQuizAnswers}
              onSubmitQuiz={(submission) => {
                if (activeSession?.id) {
                  void sendPromptRef.current(submission.formattedPrompt, activeSession.id, 0);
                }
              }}
              isStreaming={message.id === streamingMessageId}
            />
          ) : (
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          )}
        </div>
      </div>
    );
  }, [activeSession?.id, activeSessionMessages, streamingMessageId]);

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
    tutorButtonRef.current?.focus();
  };

  const handleToggleTutor = () => {
    const willOpen = !isChatOpen;
    setIsChatOpen(willOpen);
    setIsChatFullscreen(willOpen && isMobileViewport);
    setIsSheetOpen(false);
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
    setIsSheetOpen(false);
    // sendPrompt looks the session up in state, which only has it after the next render
    setPendingLaunch({ sessionId: newSession.id, prompt });

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
  const isShortViewport = useMediaQuery("(max-height: 480px)");
  const hasActionBar = isMobileViewport && !isShortViewport;
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

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: <HomeIcon className="h-5 w-5" /> },
    { name: 'Resources', href: '/resources', icon: <BookText className="h-5 w-5" /> },
    // { name: 'Leaderboard', href: '/leaderboard', icon: <Users className="h-5 w-5" /> }, // Commented out Leaderboard
    { name: 'Test History', href: '/history', icon: <History className="h-5 w-5" /> },
    { name: 'Saved Items', href: '/saved-questions', icon: <Bookmark className="h-5 w-5" /> },
  ];

  const mobileNavigation = (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <SheetTrigger className={NAV_MENU_BUTTON_CLASS} aria-label="Open navigation">
        <MenuIcon className="h-[22px] w-[22px]" aria-hidden="true" />
      </SheetTrigger>
      <SheetContent
        side="left"
        className={cn("w-[250px] sm:w-[300px] flex flex-col overflow-y-auto", OVERLAY_MOTION, "data-[state=open]:duration-300 data-[state=closed]:duration-200")}
        closeClassName={CLOSE_TARGET}
      >
        <div className="h-16 flex items-center px-4">
          <p className="text-2xl font-bold">Exam Prep</p>
        </div>
        <nav className="flex-1 py-4 px-2 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center gap-3 py-2 text-sm transition-colors ${location.pathname === item.href ? 'font-medium' : 'font-normal text-muted-foreground hover:text-foreground'}`}
              style={location.pathname === item.href
                ? { borderLeft: `2px solid ${orange}`, paddingLeft: '10px', color: orange }
                : { paddingLeft: '12px' }}
              onClick={() => setIsSheetOpen(false)}
            >
              {item.icon}
              {item.name}
            </Link>
          ))}
          {user && !isPaidUser && (
            <div className="px-2 mt-4">
              <Link
                to="/upgrage"
                className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors"
                style={{ borderColor: "hsl(25 95% 53% / 0.35)", color: orange }}
                onClick={() => setIsSheetOpen(false)}
              >
                <Lock className="h-3.5 w-3.5" />
                Go Premium
              </Link>
            </div>
          )}
        </nav>
        {/* User Info / Logout for mobile drawer */}
        <div className="p-4 border-t border-border flex items-center gap-3">
          {userLoading ? (
            <div className="flex flex-col items-center w-full">
              <div className="w-10 h-10 rounded-full bg-muted animate-pulse mb-2" />
              <div className="flex-1 overflow-hidden w-full">
                <p className="text-sm font-medium truncate bg-muted h-4 w-24 mb-1 animate-pulse" />
                <p className="text-xs text-muted-foreground truncate bg-muted h-3 w-32 animate-pulse" />
              </div>
            </div>
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-3 cursor-pointer transition-colors w-full">
                  <div
                    className={cn(
                      "relative rounded-full transition-all shrink-0 flex items-center justify-center",
                      isPaidUser && "p-[2.5px] bg-gradient-to-tr from-[#06b6d4] via-[#3b82f6] to-[#a855f7] shadow-sm"
                    )}
                  >
                    <div className={cn("rounded-full flex items-center justify-center", isPaidUser && "p-[1.5px] bg-background")}>
                      <Avatar className={cn(isPaidUser ? "h-[34px] w-[34px]" : "h-10 w-10")}>
                        <AvatarImage src={user.avatar || undefined} alt={user.firstName || user.email} />
                        <AvatarFallback>
                          {user.firstName
                            ? user.firstName.trim()[0].toUpperCase()
                            : (user.email ? user.email[0].toUpperCase() : "U")}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-medium truncate">
                      {user.firstName?.trim().split(/\s+/)[0] || user.email}
                    </p>
                    <p
                      className={cn(
                        "text-xs truncate capitalize",
                        isPaidUser
                          ? "font-semibold text-sky-500 dark:text-sky-400"
                          : "text-muted-foreground"
                      )}
                    >
                      {user.planName || (user.isPremium ? "Premium" : "Free")}
                    </p>
                  </div>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="flex items-center" onClick={() => setIsSheetOpen(false)}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex flex-col items-center w-full">
              <div className="w-10 h-10 rounded-full bg-muted mb-2" />
              <div className="flex-1 overflow-hidden w-full">
                <p className="text-sm font-medium truncate text-destructive">{userError ? "Profile unavailable" : "No user"}</p>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background">
      <AppTopNav
        title={title}
        menu={mobileNavigation}
        primaryAction={hasActionBar ? null : <StartTestButton {...startTestProps} />}
        isTutorOpen={isChatOpen}
        onToggleTutor={handleToggleTutor}
        tutorButtonRef={tutorButtonRef}
      />
      <div className="flex min-h-0 flex-1">
      {/* Sidebar: hidden on mobile, drawer or collapsible */}
      <aside className={`hidden md:flex ${sidebarOpen ? "w-64" : "w-16"} relative overflow-hidden bg-background border-r border-border transition-all duration-300 ease-in-out flex-col h-full shrink-0`}>
        {/* Ambient brand glow */}
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
          style={{
            background: "radial-gradient(ellipse 120% 28% at 50% 0%, hsl(25,95%,53%), transparent)",
            opacity: 0.10,
          }}
        />
        <div className={cn("relative flex h-14 shrink-0 items-center px-2", sidebarOpen ? "justify-end" : "justify-center")}>
          <Button
            variant="ghost"
            size="icon"
            className="h-11 w-11"
            onClick={() => setSidebarOpen((open) => !open)}
            aria-label={sidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
            aria-expanded={sidebarOpen}
          >
            <MenuIcon className="h-6 w-6" />
          </Button>
        </div>
        <nav className="flex-1 py-4 px-2 space-y-1">
          {navItems.map((item) => (
            <TooltipProvider key={item.name}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    to={item.href}
                    className={`flex items-center gap-3 py-2 text-sm transition-colors ${location.pathname === item.href ? 'font-medium' : 'font-normal text-muted-foreground hover:text-foreground'}`}
                    style={location.pathname === item.href
                      ? { borderLeft: `2px solid ${orange}`, paddingLeft: '10px', color: orange }
                      : { paddingLeft: '12px' }}
                  >
                    {item.icon}
                    {sidebarOpen && item.name}
                  </Link>
                </TooltipTrigger>
                {!sidebarOpen && <TooltipContent side="right">{item.name}</TooltipContent>}
              </Tooltip>
            </TooltipProvider>
          ))}
          {user && !isPaidUser && sidebarOpen && (
            <div className="px-2 mt-4">
              <Link
                to="/upgrage"
                className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors"
                style={{ borderColor: "hsl(25 95% 53% / 0.35)", color: orange }}
              >
                <Lock className="h-3.5 w-3.5" />
                Go Premium
              </Link>
            </div>
          )}
        </nav>
        {/* User Info / Logout for desktop sidebar */}
        <div className={`p-4 border-t border-border flex items-center gap-3 ${!sidebarOpen && 'justify-center'}`}>
          {userLoading ? (
            <div className="flex flex-col items-center w-full">
              <div className="w-10 h-10 rounded-full bg-muted animate-pulse mb-2" />
              {sidebarOpen && (
                <div className="flex-1 overflow-hidden w-full">
                  <p className="text-sm font-medium truncate bg-muted h-4 w-24 mb-1 animate-pulse" />
                  <p className="text-xs text-muted-foreground truncate bg-muted h-3 w-32 animate-pulse" />
                </div>
              )}
            </div>
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className={`flex items-center gap-3 cursor-pointer transition-colors ${!sidebarOpen && 'justify-center'}`}>
                  <div
                    className={cn(
                      "relative rounded-full transition-all shrink-0 flex items-center justify-center",
                      isPaidUser && "p-[2.5px] bg-gradient-to-tr from-[#06b6d4] via-[#3b82f6] to-[#a855f7] shadow-sm"
                    )}
                  >
                    <div className={cn("rounded-full flex items-center justify-center", isPaidUser && "p-[1.5px] bg-background")}>
                      <Avatar className={cn(isPaidUser ? "h-[34px] w-[34px]" : "h-10 w-10")}>
                        <AvatarImage src={user.avatar || undefined} alt={user.firstName || user.email} />
                        <AvatarFallback>
                          {user.firstName
                            ? user.firstName.trim()[0].toUpperCase()
                            : (user.email ? user.email[0].toUpperCase() : "U")}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </div>
                  {sidebarOpen && (
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm font-medium truncate">
                        {user.firstName?.trim().split(/\s+/)[0] || user.email}
                      </p>
                      <p
                        className={cn(
                          "text-xs truncate capitalize",
                          isPaidUser
                            ? "font-semibold text-sky-500 dark:text-sky-400"
                            : "text-muted-foreground"
                        )}
                      >
                        {user.planName || (user.isPremium ? "Premium" : "Free")}
                      </p>
                    </div>
                  )}
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex flex-col items-center w-full">
              <div className="w-10 h-10 rounded-full bg-muted mb-2" />
              {sidebarOpen && (
                <div className="flex-1 overflow-hidden w-full">
                  <p className="text-sm font-medium truncate text-destructive">{userError ? "Profile unavailable" : "No user"}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </aside>
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
              {/* On phones the action bar takes this space */}
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
              renderMessage={renderMessage}
            />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
      </div>
      {hasActionBar && !isChatOpen && (
        <AppActionBar>
          <StartTestButton {...startTestProps} className="w-full" />
        </AppActionBar>
      )}
      <StartTestDialogs />
    </div>
  );
};

export default Layout;
