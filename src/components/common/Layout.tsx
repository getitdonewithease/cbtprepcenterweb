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
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "../ui/resizable";
import type { ImperativePanelHandle } from "react-resizable-panels";
import { useUserContext, UserSubjectsWarning } from "@/features/dashboard";
import { useAuth } from "@/features/auth";
import { StudyChatPanel, type ChatHistorySession, type StudyChatMessage } from "./StudyChatPanel";

interface LayoutProps {
  title: string;
  children: React.ReactNode;
  headerActions?: React.ReactNode;
}

type ChatSession = ChatHistorySession & {
  messages: StudyChatMessage[];
};

const createDefaultAssistantMessage = (): StudyChatMessage => ({
  id: `welcome-${Date.now()}`,
  role: "assistant",
  content: "Hi! I can help with navigation and quick support while you study. What do you need?",
});

const createChatSession = (): ChatSession => {
  const now = Date.now();
  return {
    id: `session-${now}`,
    title: "New chat",
    updatedAt: now,
    messages: [createDefaultAssistantMessage()],
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

const Layout: React.FC<LayoutProps> = ({ title, children, headerActions }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isChatFullscreen, setIsChatFullscreen] = useState(false);
  const mainPanelRef = useRef<ImperativePanelHandle>(null);
  const chatPanelRef = useRef<ImperativePanelHandle>(null);
  const initialSessionRef = useRef<ChatSession>(createChatSession());
  const [chatPanelSize, setChatPanelSize] = useState(30);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([initialSessionRef.current]);
  const [activeChatSessionId, setActiveChatSessionId] = useState<string>(initialSessionRef.current.id);
  const [chatInput, setChatInput] = useState('');
  const location = useLocation();

  // Get user from context (shared across all pages)
  const { user, userLoading, userError } = useUserContext();
  const { signOut } = useAuth();

  const activeSession = chatSessions.find((session) => session.id === activeChatSessionId) ?? chatSessions[0];
  const activeSessionMessages = activeSession?.messages ?? [];

  const handleLogout = async () => {
    await signOut();
  };

  const handleSendChatMessage = () => {
    const nextMessage = chatInput.trim();
    if (!nextMessage || !activeSession) return;

    const now = Date.now();

    const userMessage = {
      id: `user-${now}`,
      role: 'user' as const,
      content: nextMessage,
    };

    const assistantMessage = {
      id: `assistant-${now + 1}`,
      role: 'assistant' as const,
      content: 'Thanks for your message. Full AI support will be connected here soon.',
    };

    setChatSessions((previousSessions) =>
      previousSessions.map((session) => {
        if (session.id !== activeSession.id) {
          return session;
        }

        const nextTitle = session.title === 'New chat' ? nextMessage.slice(0, 36) : session.title;

        return {
          ...session,
          title: nextTitle,
          updatedAt: now,
          messages: [...session.messages, userMessage, assistantMessage],
        };
      })
    );
    setChatInput('');
  };

  const handleStartNewChat = () => {
    const newSession = createChatSession();
    setChatSessions((previous) => [newSession, ...previous]);
    setActiveChatSessionId(newSession.id);
    setIsChatOpen(true);
    setIsChatFullscreen(false);
    setChatInput('');
  };

  const handleSelectChatSession = (sessionId: string) => {
    setActiveChatSessionId(sessionId);
  };

  const handleToggleChatFullscreen = () => {
    setIsChatOpen(true);
    setIsChatFullscreen((previous) => !previous);
  };

  const handleCloseChat = () => {
    setIsChatOpen(false);
    setIsChatFullscreen(false);
  };

  useEffect(() => {
    if (!isChatOpen) {
      chatPanelRef.current?.collapse();
      mainPanelRef.current?.resize(100);
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
  }, [isChatOpen, isChatFullscreen, chatPanelSize]);

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: <HomeIcon className="h-5 w-5" /> },
    { name: 'Resources', href: '/resources', icon: <BookText className="h-5 w-5" /> },
    // { name: 'Leaderboard', href: '/leaderboard', icon: <Users className="h-5 w-5" /> }, // Commented out Leaderboard
    { name: 'Test History', href: '/history', icon: <History className="h-5 w-5" /> },
    { name: 'Saved Items', href: '/saved-questions', icon: <Bookmark className="h-5 w-5" /> },
  ];

  return (
    <div className="h-screen overflow-hidden bg-background flex flex-col md:flex-row">
      {/* Sidebar: hidden on mobile, drawer or collapsible */}
      <aside className={`hidden md:flex ${sidebarOpen ? "w-64" : "w-16"} bg-card border-r border-border transition-all duration-300 ease-in-out flex-col h-screen sticky top-0`}>
        <div className={`h-16 flex items-center px-4 ${sidebarOpen ? "justify-between" : "justify-center"}`}>
          {sidebarOpen && <h1 className="text-2xl font-bold">UTME Prep</h1>}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle Sidebar"
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
                    className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted ${location.pathname === item.href ? 'bg-muted text-primary' : 'text-muted-foreground'}`}
                  >
                    {item.icon}
                    {sidebarOpen && item.name}
                  </Link>
                </TooltipTrigger>
                {!sidebarOpen && <TooltipContent side="right">{item.name}</TooltipContent>}
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
                <div className={`flex items-center gap-3 cursor-pointer hover:bg-muted rounded-md p-2 transition-colors ${!sidebarOpen && 'justify-center'}`}>
                  <Avatar>
                    <AvatarImage src={user.avatar || undefined} alt={user.firstName || user.email} />
                    <AvatarFallback>
                      {user.firstName && user.lastName
                        ? `${user.firstName[0]}${user.lastName[0]}`
                        : (user.email ? user.email[0] : "U")}
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
                  <p className="text-sm font-medium truncate text-destructive">{userError || "No user"}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </aside>
      {/* Mobile Drawer */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild className="md:hidden absolute top-4 left-4 z-20">
          <Button variant="ghost" size="icon" aria-label="Open navigation">
            <MenuIcon className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[250px] sm:w-[300px] flex flex-col">
          <div className="h-16 flex items-center px-4">
            <h1 className="text-2xl font-bold">UTME Prep</h1>
          </div>
          <nav className="flex-1 py-4 px-2 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted ${location.pathname === item.href ? 'bg-muted text-primary' : 'text-muted-foreground'}`}
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
                      <AvatarImage src={user.avatar || undefined} alt={user.firstName || user.email} />
                      <AvatarFallback>
                        {user.firstName && user.lastName
                          ? `${user.firstName[0]}${user.lastName[0]}`
                          : (user.email ? user.email[0] : "U")}
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
                  <p className="text-sm font-medium truncate text-destructive">{userError || "No user"}</p>
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
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight mb-2 sm:mb-0 flex-grow text-center sm:text-left">{title}</h1>
            
            <div className="flex flex-wrap gap-2 sm:gap-4 w-full sm:w-auto justify-center sm:justify-end">
              <Button
                variant="outline"
                size="icon"
                aria-label="Open chat"
                onClick={() => {
                  setIsChatFullscreen(false);
                  setIsChatOpen((previous) => !previous);
                }}
              >
                <MessageSquare className="h-4 w-4" />
              </Button>
              {!user?.isPremium && (
                <Button variant="outline" size="sm" className="hidden sm:flex">
                  <span className="mr-2">🌟</span> Go Premium
                </Button>
              )}
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
            <p className="text-xs sm:text-sm text-muted-foreground">© 2023 UTME Prep. All rights reserved.</p>
            <div className="flex flex-wrap gap-2 sm:gap-4">
              <Link to="/about" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground">About</Link>
              <Link to="/contact" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground">Contact</Link>
              <Link to="/privacy" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground">Privacy</Link>
              <Link to="/terms" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground">Terms</Link>
            </div>
          </div>
            </footer>
            </div>
          </ResizablePanel>

          <ResizableHandle
            withHandle
            className={isChatOpen ? "" : "pointer-events-none opacity-0"}
          />
          <ResizablePanel
            ref={chatPanelRef}
            defaultSize={0}
            collapsedSize={0}
            collapsible
            minSize={isChatFullscreen ? 100 : 22}
            maxSize={isChatFullscreen ? 100 : 45}
            onResize={(size) => {
              if (!isChatFullscreen && size > 0) {
                setChatPanelSize(size);
              }
            }}
            className="min-w-0"
          >
            <StudyChatPanel
              messages={activeSessionMessages}
              sessions={chatSessions}
              activeSessionId={activeSession?.id ?? ""}
              isFullscreen={isChatFullscreen}
              chatInput={chatInput}
              onInputChange={setChatInput}
              onSend={handleSendChatMessage}
              onStartNewChat={handleStartNewChat}
              onSelectSession={handleSelectChatSession}
              onToggleFullscreen={handleToggleChatFullscreen}
              onClose={handleCloseChat}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
};

export default Layout; 