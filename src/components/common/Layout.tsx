import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import brainLogo from "/FasitiLogo-bg.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Brain,
  LayoutDashboard,
  BookText,
  History,
  Award,
  FileText,
  MessageSquare,
  Settings,
  Menu,
  ChevronRight,
  MenuIcon,
  HomeIcon,
  BarChart3,
  Users,
  Lock,
  Bookmark,
  LogOut,
  BookOpen,
  ClipboardList,
  FolderOpen,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable";
import type { ImperativePanelHandle } from "react-resizable-panels";
import { useUserContext, UserSubjectsWarning } from "@/features/dashboard";
import { useAuth } from "@/features/auth";
import {
  StudyChatPanel,
  type ChatHistorySession,
  type StudyChatMessage,
} from "./StudyChatPanel";
import {
  createBackendChatSession,
  getBackendChatContents,
  getBackendChats,
  streamBackendChatMessage,
  useChatHistory,
  useChatSession,
  useChatStreaming,
  type ChatSessionMetadata,
} from "@/features/chat";

interface LayoutProps {
  title: string;
  children: React.ReactNode;
  headerActions?: React.ReactNode;
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
    icon: <MessageSquare className="h-5 w-5" />,
    path: "/chats",
  },
  {
    name: "Settings",
    icon: <Settings className="h-5 w-5" />,
    path: "/settings",
  },
];

const markdownRemarkPlugins = [remarkGfm, remarkMath];
const markdownRehypePlugins = [rehypeKatex];

const Layout: React.FC<LayoutProps> = ({
  title,
  children,
  headerActions,
  chatLaunchRequest,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isChatFullscreen, setIsChatFullscreen] = useState(false);
  const mainPanelRef = useRef<ImperativePanelHandle>(null);
  const chatPanelRef = useRef<ImperativePanelHandle>(null);
  const activeSessionIdRef = useRef<string | null>(null);
  const loadingConversationIdRef = useRef<string | null>(null);
  const streamTargetSessionIdRef = useRef<string | null>(null);
  const [chatPanelSize, setChatPanelSize] = useState(30);
  const [chatInput, setChatInput] = useState("");
  const [historyContentLoading, setHistoryContentLoading] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return window.matchMedia("(max-width: 767px)").matches;
  });
  const location = useLocation();

  // Get user from context (shared across all pages)
  const { user, userLoading, userError } = useUserContext();
  const { signOut } = useAuth();

  const renderMessage = (message: StudyChatMessage) => (
    <div
      key={message.id}
      className={
        message.role === "user" ? "flex justify-end" : "flex justify-center"
      }
    >
      <div
        className={
          message.role === "user"
            ? "max-w-[60%] rounded-lg bg-[#F7F7F7] px-4 py-2.5 text-sm text-foreground shadow-sm"
            : "w-full max-w-3xl px-1 text-base leading-7 text-foreground"
        }
      >
        {message.role === "assistant" ? (
          <ReactMarkdown
            remarkPlugins={markdownRemarkPlugins}
            rehypePlugins={markdownRehypePlugins}
          >
            {message.content}
          </ReactMarkdown>
        ) : (
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        )}
      </div>
    </div>
  );

  const historyAdapter = React.useMemo(
    () => ({
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
      fetchSessionContent: async (conversationId: string) =>
        getBackendChatContents(conversationId),
    }),
    [],
  );

  const {
    sessions: serverSessionMetadata,
    getSessionContent,
    invalidateSessionContent,
    refetchMetadata,
  } = useChatHistory<StudyChatMessage, ChatSessionMetadata>(historyAdapter);

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
  } = useChatSession<StudyChatMessage, ChatSession, ChatSessionMetadata>({
    createInitialSession: createChatSession,
  });

  const activeSessionMessages = activeSession?.messages ?? [];

  const resolveTargetSessionId = () =>
    streamTargetSessionIdRef.current ?? activeSessionIdRef.current;

  const { streamMessage, isStreaming, abortStream } = useChatStreaming<{
    explanation: string;
  }>({
    conversationId: activeSession?.conversationId ?? null,
    createConversation: createBackendChatSession,
    stream: async (prompt, options) => {
      const streamed = await streamBackendChatMessage(
        prompt,
        options.conversationId,
        {
          signal: options.signal,
          mode: options.mode,
          onToken: options.onToken,
          onComplete: options.onComplete,
        },
      );

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

      appendMessage(
        {
          id: messageId,
          role: "assistant",
          content: "",
        },
        targetSessionId,
      );
    },
    onStreamToken: (messageId, nextContent) => {
      const targetSessionId = resolveTargetSessionId();
      if (!targetSessionId) {
        return;
      }

      updateMessage(
        messageId,
        (message) => ({
          ...message,
          content: nextContent,
        }),
        targetSessionId,
      );
    },
    onStreamComplete: (messageId, response) => {
      const targetSessionId = resolveTargetSessionId();
      if (!targetSessionId) {
        return;
      }

      updateMessage(
        messageId,
        (message) => ({
          ...message,
          content: response.explanation,
        }),
        targetSessionId,
      );
    },
  });

  useEffect(() => {
    activeSessionIdRef.current = activeSessionId;
  }, [activeSessionId]);

  useEffect(() => {
    if (serverSessionMetadata.length === 0) {
      return;
    }

    hydrateSessions(serverSessionMetadata);
  }, [hydrateSessions, serverSessionMetadata]);

  const loadSessionContent = React.useCallback(
    async (session: ChatSession, sessionId: string) => {
      if (!session.conversationId || session.messages.length > 0) {
        return;
      }

      if (loadingConversationIdRef.current === session.conversationId) {
        return;
      }

      try {
        loadingConversationIdRef.current = session.conversationId;
        setHistoryContentLoading(true);
        const historyMessages = await getSessionContent(session.conversationId);
        replaceMessages(historyMessages, sessionId);
      } finally {
        if (loadingConversationIdRef.current === session.conversationId) {
          loadingConversationIdRef.current = null;
        }
        setHistoryContentLoading(false);
      }
    },
    [getSessionContent, replaceMessages],
  );

  useEffect(() => {
    if (!activeSession || !activeSessionId) {
      return;
    }

    void loadSessionContent(activeSession, activeSessionId);
  }, [activeSession, activeSessionId, loadSessionContent]);

  const handleLogout = async () => {
    await signOut();
  };

  const sendPrompt = React.useCallback(
    async (prompt: string, sessionId: string, mode: 0 | 1 = 0) => {
      const trimmedPrompt = prompt.trim();
      if (!trimmedPrompt) {
        return;
      }

      const targetSession = chatSessions.find(
        (session) => session.id === sessionId,
      );
      if (!targetSession) {
        return;
      }

      appendMessage(
        {
          id: `user-${Date.now()}`,
          role: "user",
          content: trimmedPrompt,
        },
        sessionId,
      );

      if (targetSession.title === "New chat") {
        updateSession(sessionId, { title: trimmedPrompt.slice(0, 36) });
      }

      streamTargetSessionIdRef.current = sessionId;

      try {
        const response = await streamMessage(trimmedPrompt, mode);
        const resolvedConversationId = response.conversationId;

        if (resolvedConversationId) {
          updateSession(sessionId, { conversationId: resolvedConversationId });
          invalidateSessionContent(resolvedConversationId);

          try {
            const refreshedMessages = await getSessionContent(
              resolvedConversationId,
              { force: true },
            );
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

        appendMessage(
          {
            id: `error-${Date.now()}`,
            role: "assistant",
            content:
              "Sorry, I encountered an error while processing your request. Please try again.",
          },
          sessionId,
        );
      } finally {
        streamTargetSessionIdRef.current = null;
      }
    },
    [
      appendMessage,
      chatSessions,
      getSessionContent,
      invalidateSessionContent,
      refetchMetadata,
      replaceMessages,
      streamMessage,
      updateSession,
    ],
  );

  const handleSendChatMessage = async (mode: 0 | 1 = 0) => {
    const nextMessage = chatInput.trim();
    if (!nextMessage || !activeSession || isStreaming) {
      return;
    }

    setChatInput("");
    await sendPrompt(nextMessage, activeSession.id, mode);
  };

  const handleStartNewChat = () => {
    createSession();
    setIsChatOpen(true);
    setIsChatFullscreen(isMobileViewport);
    setChatInput("");
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
  };

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const handleViewportChange = (event: MediaQueryListEvent) => {
      setIsMobileViewport(event.matches);
      if (event.matches && isChatOpen) {
        setIsChatFullscreen(true);
      }
    };

    setIsMobileViewport(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleViewportChange);

    return () => {
      mediaQuery.removeEventListener("change", handleViewportChange);
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

    const prompt = chatLaunchRequest.message.trim();
    if (!prompt) {
      return;
    }

    const newSession = createSession();
    setIsChatOpen(true);
    setIsChatFullscreen(true);
    setIsSheetOpen(false);
    void sendPrompt(prompt, newSession.id);
  }, [chatLaunchRequest, createSession, sendPrompt]);

  let mockAdminUser = {
    organizationId: "1",
    organizationRole: "org_admin",
  };
  let mockStudentUser = {
    organizationId: "1",
    organizationRole: "student",
  };
  // let mockUser = mockStudentUser;
  let mockUser = mockAdminUser;

  const activeNavItems = (() => {
    if (mockUser?.organizationRole === "org_admin") {
      return [
        {
          name: "Dashboard",
          href: "/dashboard",
          icon: <HomeIcon className="h-5 w-5" />,
        },
        {
          name: "Students",
          href: "/students",
          icon: <Users className="h-5 w-5" />,
        },
        {
          name: "Courses",
          href: "/courses",
          icon: <BookOpen className="h-5 w-5" />,
        },
        {
          name: "Assessments",
          href: "/assessments",
          icon: <ClipboardList className="h-5 w-5" />,
        },
        {
          name: "Resources",
          href: "/resources",
          icon: <FolderOpen className="h-5 w-5" />,
        },
      ];
    } else {
      // students may not belong to organizations at first
      // @todo: check if user is student, then show this nav
      return [
        {
          name: "Dashboard",
          href: "/dashboard",
          icon: <HomeIcon className="h-5 w-5" />,
        },
        {
          name: "Courses",
          href: "/courses",
          icon: <BookOpen className="h-5 w-5" />,
        },
        {
          name: "Assessments",
          href: "/assessments",
          icon: <ClipboardList className="h-5 w-5" />,
        },
        {
          name: "Resources",
          href: "/resources",
          icon: <FolderOpen className="h-5 w-5" />,
        },
      ];
    }
    return [
      {
        name: "Dashboard",
        href: "/dashboard",
        icon: <HomeIcon className="h-5 w-5" />,
      },
      {
        name: "Resources",
        href: "/resources",
        icon: <BookText className="h-5 w-5" />,
      },
      {
        name: "Test History",
        href: "/history",
        icon: <History className="h-5 w-5" />,
      },
      {
        name: "Saved Items",
        href: "/saved-questions",
        icon: <Bookmark className="h-5 w-5" />,
      },
    ];
  })();

  return (
    <div className="h-screen overflow-hidden bg-background flex flex-col md:flex-row">
      {/* Sidebar: hidden on mobile, drawer or collapsible */}
      <aside
        className={`hidden md:flex ${sidebarOpen ? "w-64" : "w-16"} bg-card border-r border-border transition-all duration-300 ease-in-out flex-col h-screen sticky top-0`}
      >
        <div
          className={`h-16 flex items-center px-4 ${sidebarOpen ? "justify-between" : "justify-center"}`}
        >
          {sidebarOpen ? (
            <>
              <img
                src={brainLogo}
                alt="Fasiti logo"
                className="shrink-0"
                style={{ height: 30, width: 25 }}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(false)}
                aria-label="Collapse Sidebar"
              >
                <MenuIcon className="h-6 w-6" />
              </Button>
            </>
          ) : (
            <div className="group relative">
              <img
                src={brainLogo}
                alt="Fasiti logo"
                className="shrink-0 transition-opacity duration-150 group-hover:opacity-0"
                style={{ height: 30, width: 25 }}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(true)}
                aria-label="Expand Sidebar"
                className="absolute inset-0 h-full w-full opacity-0 transition-opacity duration-150 group-hover:opacity-100"
              >
                <MenuIcon className="h-6 w-6" />
              </Button>
            </div>
          )}
        </div>
        <nav className="flex-1 py-4 px-2 space-y-1">
          {activeNavItems.map((item) => (
            <TooltipProvider key={item.name}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    to={item.href}
                    className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted ${location.pathname === item.href ? "bg-muted text-primary" : "text-muted-foreground"}`}
                  >
                    {item.icon}
                    {sidebarOpen && item.name}
                  </Link>
                </TooltipTrigger>
                {!sidebarOpen && (
                  <TooltipContent side="right">{item.name}</TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          ))}
          {user && !user.isPremium && sidebarOpen && (
            <Link
              to="/premium"
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors bg-gradient-to-r from-yellow-400 to-orange-500 text-white mt-4 hover:opacity-90"
            >
              <Lock className="h-5 w-5" />
              Go Premium
            </Link>
          )}
        </nav>
        {/* User Info / Logout for desktop sidebar */}
        <div
          className={`p-4 border-t border-border flex items-center gap-3 ${!sidebarOpen && "justify-center"}`}
        >
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
                <div
                  className={`flex items-center gap-3 cursor-pointer hover:bg-muted rounded-md p-2 transition-colors ${!sidebarOpen && "justify-center"}`}
                >
                  <Avatar>
                    <AvatarImage
                      src={user.avatar || undefined}
                      alt={user.firstName || user.email}
                    />
                    <AvatarFallback>
                      {user.firstName && user.lastName
                        ? `${user.firstName[0]}${user.lastName[0]}`
                        : user.email
                          ? user.email[0]
                          : "U"}
                    </AvatarFallback>
                  </Avatar>
                  {sidebarOpen && (
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm font-medium truncate">
                        {user.firstName && user.lastName
                          ? `${user.firstName} ${user.lastName}`
                          : user.email}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user.email}
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
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-600"
                >
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
                  <p className="text-sm font-medium truncate text-destructive">
                    {userError || "No user"}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </aside>
      {/* Mobile Drawer */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger
          asChild
          className={`md:hidden absolute top-4 left-4 z-20 ${isChatOpen && isMobileViewport ? "hidden" : ""}`}
        >
          <Button variant="ghost" size="icon" aria-label="Open navigation">
            <MenuIcon className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="w-[250px] sm:w-[300px] flex flex-col"
        >
          <div className="h-16 flex items-center px-4">
            <h1 className="text-2xl font-bold">UTME Prep</h1>
          </div>
          <nav className="flex-1 py-4 px-2 space-y-1">
            {activeNavItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted ${location.pathname === item.href ? "bg-muted text-primary" : "text-muted-foreground"}`}
                onClick={() => setIsSheetOpen(false)}
              >
                {item.icon}
                {item.name}
              </Link>
            ))}
            {/* {!user.isPremium && ( */}
            <Link
              to="/premium"
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors bg-gradient-to-r from-yellow-400 to-orange-500 text-white mt-4 hover:opacity-90"
              onClick={() => setIsSheetOpen(false)}
            >
              <Lock className="h-5 w-5" />
              Go Premium
            </Link>
            {/* )} */}
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
                  <div className="flex items-center gap-3 cursor-pointer hover:bg-muted rounded-md p-2 transition-colors w-full">
                    <Avatar>
                      <AvatarImage
                        src={user.avatar || undefined}
                        alt={user.firstName || user.email}
                      />
                      <AvatarFallback>
                        {user.firstName && user.lastName
                          ? `${user.firstName[0]}${user.lastName[0]}`
                          : user.email
                            ? user.email[0]
                            : "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm font-medium truncate">
                        {user.firstName && user.lastName
                          ? `${user.firstName} ${user.lastName}`
                          : user.email}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link
                      to="/settings"
                      className="flex items-center"
                      onClick={() => setIsSheetOpen(false)}
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-600"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex flex-col items-center w-full">
                <div className="w-10 h-10 rounded-full bg-muted mb-2" />
                <div className="flex-1 overflow-hidden w-full">
                  <p className="text-sm font-medium truncate text-destructive">
                    {userError || "No user"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
      {/* Main Content + Docked Chat Panel */}
      <div className="flex-1 h-screen w-full overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          <ResizablePanel
            ref={mainPanelRef}
            defaultSize={100}
            minSize={0}
            collapsible
            collapsedSize={0}
          >
            <div className="h-full flex flex-col min-h-0 min-w-0">
              {/* Header */}
              <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10 w-full px-4 sm:px-6 md:px-8">
                <div className="flex flex-col sm:flex-row h-auto sm:h-16 items-center justify-between py-2 sm:py-0 w-full">
                  {/* Title */}
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight mb-2 sm:mb-0 flex-grow text-center sm:text-left">
                    {title}
                  </h1>

                  <div className="flex flex-wrap gap-2 sm:gap-4 w-full sm:w-auto justify-center sm:justify-end">
                    {!user?.isPremium && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="hidden sm:flex"
                      >
                        <span className="mr-2">🌟</span> Go Premium
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="icon"
                      aria-label="Open chat"
                      onClick={() => {
                        if (isMobileViewport) {
                          setIsSheetOpen(false);
                          setIsChatOpen(true);
                          setIsChatFullscreen(true);
                          return;
                        }

                        setIsChatFullscreen(false);
                        setIsChatOpen((previous) => !previous);
                      }}
                    >
                      <MessageSquare className="h-4 w-4" />
                    </Button>

                    {headerActions}
                  </div>
                </div>
              </header>

              <main className="flex-1 overflow-auto w-full px-2 sm:px-4 md:px-8 py-4 sm:py-8">
                <UserSubjectsWarning className="mb-4" />
                {children}
              </main>
              {/* Footer */}
              <footer className="w-full px-2 sm:px-4 md:px-8 py-4 bg-background border-t mt-auto">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    © 2023 UTME Prep. All rights reserved.
                  </p>
                  <div className="flex flex-wrap gap-2 sm:gap-4">
                    <Link
                      to="/about"
                      className="text-xs sm:text-sm text-muted-foreground hover:text-foreground"
                    >
                      About
                    </Link>
                    <Link
                      to="/contact"
                      className="text-xs sm:text-sm text-muted-foreground hover:text-foreground"
                    >
                      Contact
                    </Link>
                    <Link
                      to="/privacy"
                      className="text-xs sm:text-sm text-muted-foreground hover:text-foreground"
                    >
                      Privacy
                    </Link>
                    <Link
                      to="/terms"
                      className="text-xs sm:text-sm text-muted-foreground hover:text-foreground"
                    >
                      Terms
                    </Link>
                  </div>
                </div>
              </footer>
            </div>
          </ResizablePanel>

          <ResizableHandle
            withHandle
            className={
              isChatOpen && !isMobileViewport
                ? ""
                : "pointer-events-none opacity-0"
            }
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
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
};

export default Layout;
