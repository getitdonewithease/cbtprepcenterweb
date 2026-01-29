import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { 
  Bot, 
  X, 
  Send, 
  RefreshCw,
  Loader2,
  ThumbsUp,
  ThumbsDown,
  Clock
} from 'lucide-react';
import { Plus } from 'lucide-react';
import { ReviewQuestion, AIExplanationResponse } from '../types/practiceTypes';
import { cn } from '@/lib/utils';
import { getAIExplanation, getChatHistory, getAllChats, getChatContents } from '../api/practiceApi';
import { v4 as uuidv4 } from 'uuid';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  explanation?: AIExplanationResponse;
  timestamp: Date;
}

interface ChatSession {
  id: string;
  title: string;
  createdAt: Date;
  messages: ChatMessage[];
  conversationId: string | null;
}

const makeGuid = () => uuidv4();

const createInitialChatSession = (): ChatSession => {
  const now = new Date();
  const guid = makeGuid();
  return {
    id: `chat-${guid}`,
    title: 'New chat',
    createdAt: now,
    messages: [],
    conversationId: guid,
  };
};

interface AIChatSidebarProps {
  open: boolean;
  onClose: () => void;
  question: ReviewQuestion | null;
  allQuestions?: ReviewQuestion[];
  explanation: AIExplanationResponse | null;
  loading: boolean;
  onGetExplanation: () => Promise<void>;
  onSendMessage?: (message: string) => Promise<void>;
  width?: number;
  onWidthChange?: (w: number) => void;
}

const AIChatSidebar: React.FC<AIChatSidebarProps> = ({
  open,
  onClose,
  question,
  allQuestions,
  explanation,
  loading,
  onGetExplanation,
  onSendMessage,
  width,
  onWidthChange,
}) => {
  const initialSessionRef = useRef<ChatSession | null>(null);
  if (!initialSessionRef.current) {
    initialSessionRef.current = createInitialChatSession();
  }

  // Multiple chat sessions (tabs)
  const [chatSessions, setChatSessions] = useState<ChatSession[]>(() => [initialSessionRef.current!]);
  const [activeChatId, setActiveChatId] = useState<string | null>(initialSessionRef.current?.id ?? null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(initialSessionRef.current?.conversationId ?? null);
  const [feedbackGiven, setFeedbackGiven] = useState<Record<string, 'helpful' | 'not-helpful' | null>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const previousQuestionIdRef = useRef<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const assistantMessageIdRef = useRef<string | null>(null);
  const [referencedIds, setReferencedIds] = useState<string[]>(() => (question?.id ? [question.id] : []));
  const [refPickerOpen, setRefPickerOpen] = useState(false);
  const [internalWidth, setInternalWidth] = useState<number>(() => {
    if (typeof window === 'undefined') return 420;
    const saved = window.localStorage.getItem('aiChatSidebarWidth');
    return saved ? Math.max(320, Math.min(700, parseInt(saved, 10))) : 420;
  });
  const sidebarWidth = typeof width === 'number' ? width : internalWidth;
  const [isDesktop, setIsDesktop] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(min-width: 1024px)').matches;
  });
  const [historyLoading, setHistoryLoading] = useState<boolean>(false);
  const [serverChatIds, setServerChatIds] = useState<string[]>([]);

  // Initialize with explanation when it's available
  useEffect(() => {
    if (explanation && question) {
      const explanationMessage: ChatMessage = {
        id: `explanation-${question.id}`,
        role: 'assistant',
        content: explanation.explanation || 'Here is the explanation for this question.',
        explanation,
        timestamp: new Date(),
      };
      
      // Only add if we don't already have this explanation
      setMessages(prev => {
        const exists = prev.some(m => m.id === explanationMessage.id);
        if (exists) return prev;
        return [...prev, explanationMessage];
      });
    }
  }, [explanation, question]);

  // Do not clear chat when question changes; chat persists across navigation
  useEffect(() => {
    if (question && previousQuestionIdRef.current !== question.id) {
      // Only update the tracker; references are handled separately below
      previousQuestionIdRef.current = question.id;
    }
  }, [question?.id]);

  // On question navigation, default references to the current question only.
  // The user can then manually add more references if they want.
  useEffect(() => {
    if (question?.id) {
      setReferencedIds([question.id]);
    } else {
      setReferencedIds([]);
    }
  }, [question?.id]);

  // Keep the active chat session snapshot in sync with messages/conversationId
  useEffect(() => {
    if (!activeChatId) return;
    setChatSessions(prev =>
      prev.map(session =>
        session.id === activeChatId
          ? { ...session, messages, conversationId }
          : session
      )
    );
  }, [messages, conversationId, activeChatId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when sidebar opens
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  // Load server chat sessions when the sidebar opens
  useEffect(() => {
    const loadChats = async () => {
      try {
        const chats = await getAllChats();
        // Sort newest first
        const sorted = chats.slice().sort((a, b) => (b.createdAt.getTime() - a.createdAt.getTime()));
        const mapped = sorted.map((c) => ({
          id: `chat-${c.id}`,
          title: c.title || 'New chat',
          createdAt: c.createdAt,
          messages: [],
          conversationId: c.id,
        } as ChatSession));

        setChatSessions((prev) => {
          const existing = new Set(prev.map((s) => s.conversationId || ''));
          const toAdd = mapped.filter((s) => s.conversationId && !existing.has(s.conversationId));
          return [...prev, ...toAdd];
        });

        setServerChatIds(mapped.map((s) => s.conversationId!).filter(Boolean));

        if (mapped.length > 0) {
          // Select latest server chat and load its content
          const latest = mapped[0];
          setActiveChatId(latest.id);
        }
      } catch (e) {
        console.error('Failed to load chats list:', e);
      }
    };
    if (open) loadChats();
  }, [open]);

  // Track breakpoint (desktop vs mobile) to control inline width styling
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mql = window.matchMedia('(min-width: 1024px)');
    const handler = (e: MediaQueryListEvent | MediaQueryList) => {
      // Both event and initial list have .matches
      // @ts-ignore
      setIsDesktop(!!e.matches);
    };
    // Initial
    handler(mql as any);
    // Listener
    if (mql.addEventListener) mql.addEventListener('change', handler as any);
    else mql.addListener(handler as any);
    return () => {
      if (mql.removeEventListener) mql.removeEventListener('change', handler as any);
      else mql.removeListener(handler as any);
    };
  }, []);

  // Abort any in-flight stream when sidebar closes or component unmounts
  useEffect(() => {
    if (!open) {
      abortControllerRef.current?.abort();
      abortControllerRef.current = null;
    }
    return () => {
      abortControllerRef.current?.abort();
      abortControllerRef.current = null;
    };
  }, [open]);

  const streamAssistantResponse = async (prompt: string) => {
    // Create placeholder assistant message
    const assistantMessageId = `assistant-${Date.now()}`;
    assistantMessageIdRef.current = assistantMessageId;
    setMessages(prev => [
      ...prev,
      {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      },
    ]);
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      let streamedContent = '';
      const result = await getAIExplanation(prompt, {
        conversationId: conversationId,
        // Mark as new conversation when no prior messages in this session
        isNewConversation: !conversationId || messages.length === 0,
        onToken: (chunk) => {
          streamedContent += chunk;
          const idToUpdate = assistantMessageIdRef.current;
          if (idToUpdate) {
            setMessages(prev =>
              prev.map(msg =>
                msg.id === idToUpdate ? { ...msg, content: streamedContent } : msg
              )
            );
          }
        },
        onComplete: (fullContent) => {
          // When streaming is done, ensure the final complete content
          // is what ReactMarkdown receives (for proper markdown + math).
          const idToUpdate = assistantMessageIdRef.current;
          if (idToUpdate) {
            setMessages(prev =>
              prev.map(msg =>
                msg.id === idToUpdate ? { ...msg, content: fullContent } : msg
              )
            );
          }
        },
        signal: controller.signal,
      });

      if (result.conversationId) {
        setConversationId(result.conversationId);
      }

      // After streaming completes, refresh this assistant message
      // from the server-side chat contents so that the text and
      // formatting exactly match what you see after a page reload.
      const chatIdForHistory = result.conversationId ?? conversationId;
      if (chatIdForHistory) {
        try {
          const history = await getChatContents(chatIdForHistory);
          const lastAssistant = [...history].reverse().find(m => m.role === 'assistant');
          if (lastAssistant) {
            const idToUpdate = assistantMessageIdRef.current;
            if (idToUpdate) {
              setMessages(prev =>
                prev.map(msg =>
                  msg.id === idToUpdate ? { ...msg, content: lastAssistant.content } : msg
                )
              );
            }
          }
        } catch (historyError) {
          console.error('Failed to refresh assistant message from history:', historyError);
        }
      }
    } catch (error: any) {
      if (error?.name === 'AbortError') {
        // Silently ignore user-initiated aborts
      } else {
        console.error('Failed to stream assistant response:', error);
        const idToUpdate = assistantMessageIdRef.current;
        if (idToUpdate) {
          setMessages(prev =>
            prev.map(msg =>
              msg.id === idToUpdate
                ? { ...msg, content: 'Sorry, I encountered an error while processing your request. Please try again.' }
                : msg
            )
          );
        }
      }
    } finally {
      setIsSending(false);
      abortControllerRef.current = null;
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isSending || !question) return;
    const refs = (referencedIds.length > 0 ? referencedIds : [question.id])
      .map((id) => (allQuestions || [question]).find((q) => q.id === id))
      .filter((q): q is ReviewQuestion => !!q);

    // Build a rich prefix that includes the full content
    // of each referenced question, not just a short snippet.
    const prefix = refs
      .map((rq, i) => {
        const cleanText = rq.text.replace(/<[^>]*>/g, '');

        const optionsBlock = rq.options && rq.options.length
          ? '\nOptions:\n' +
            rq.options
              .map((opt, idx) => `${String.fromCharCode(65 + idx)}. ${opt}`)
              .join('\n')
          : '';

        // Derive chosen and correct options (if available)
        const hasUserAnswer = typeof rq.userAnswer === 'number' && rq.userAnswer >= 0;
        const hasCorrectAnswer = typeof rq.correctAnswer === 'number' && rq.correctAnswer >= 0;

        const chosenLetter = hasUserAnswer ? String.fromCharCode(65 + (rq.userAnswer as number)) : null;
        const correctLetter = hasCorrectAnswer ? String.fromCharCode(65 + (rq.correctAnswer as number)) : null;

        const chosenText =
          hasUserAnswer && rq.options && rq.options[rq.userAnswer as number] !== undefined
            ? rq.options[rq.userAnswer as number]
            : null;
        const correctText =
          hasCorrectAnswer && rq.options && rq.options[rq.correctAnswer as number] !== undefined
            ? rq.options[rq.correctAnswer as number]
            : null;

        const chosenLine =
          chosenLetter && chosenText
            ? `\nStudent's chosen option: ${chosenLetter}. ${chosenText}`
            : '';
        const correctLine =
          correctLetter && correctText
            ? `\nCorrect option: ${correctLetter}. ${correctText}`
            : '';

        return `Question Reference ${i + 1} (ID: ${rq.id}):\nQuestion: ${cleanText}${optionsBlock}${chosenLine}${correctLine}`;
      })
      .join('\n\n');
    const composedPrompt = (prefix ? prefix + "\n\n" : "") + inputValue.trim();

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      // Only show the student's own text in the UI,
      // not the full system-enriched prompt.
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsSending(true);

    try {
      if (onSendMessage) {
        // If a custom handler is provided by parent, use it
        await onSendMessage(composedPrompt);
      } else {
        // Default: stream from AI API using the enriched prompt
        await streamAssistantResponse(composedPrompt);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsSending(false);
    }
  };

  const handleRegenerate = async () => {
    if (!question || loading) return;
    await onGetExplanation();
  };

  const handleFeedback = (messageId: string, helpful: boolean) => {
    setFeedbackGiven(prev => ({
      ...prev,
      [messageId]: helpful ? 'helpful' : 'not-helpful',
    }));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const addReference = (id: string) => {
    setReferencedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };
  const removeReference = (id: string) => {
    setReferencedIds((prev) => prev.filter((x) => x !== id));
  };

  const loadHistoryForSession = useCallback(
    async (session: ChatSession) => {
      if (!session.conversationId) return;
      try {
        setHistoryLoading(true);
        const history = await getChatContents(session.conversationId);
        setMessages(history);
        setConversationId(session.conversationId);
        setChatSessions(prev =>
          prev.map(s => (s.id === session.id ? { ...s, messages: history } : s))
        );
      } catch (err) {
        console.error('Failed to load chat history:', err);
      } finally {
        setHistoryLoading(false);
      }
    },
    []
  );

  // Whenever the active chat changes, fetch history if it has a conversationId
  useEffect(() => {
    if (!open || !activeChatId) return;
    const activeSession = chatSessions.find(s => s.id === activeChatId);
    if (!activeSession?.conversationId) return;
    // Only fetch content for chats that exist on the server
    if (!serverChatIds.includes(activeSession.conversationId)) return;
    // Avoid duplicate fetches once messages are loaded
    if (activeSession.messages && activeSession.messages.length > 0) return;
    if (historyLoading) return;
    loadHistoryForSession(activeSession);
  }, [open, activeChatId, chatSessions, serverChatIds, historyLoading, loadHistoryForSession]);

  // Chat session controls
  const handleNewChat = () => {
    const now = new Date();
    const guid = makeGuid();
    const newId = `chat-${guid}`;

    setChatSessions(prev => {
      const withCurrentSaved =
        activeChatId
          ? prev.map(session =>
              session.id === activeChatId
                ? { ...session, messages, conversationId }
                : session
            )
          : prev;

      const newSession: ChatSession = {
        id: newId,
        title: 'New chat',
        createdAt: now,
        messages: [],
        conversationId: guid,
      };

      return [...withCurrentSaved, newSession];
    });

    setActiveChatId(newId);
    setMessages([]);
    setConversationId(guid);
    setFeedbackGiven({});
  };

  const handleSwitchChat = (id: string) => {
    if (id === activeChatId) return;

    setChatSessions(prev =>
      activeChatId
        ? prev.map(session =>
            session.id === activeChatId
              ? { ...session, messages, conversationId }
              : session
          )
        : prev
    );

    const target = chatSessions.find(s => s.id === id);
    setActiveChatId(id);
    setMessages(target?.messages ?? []);
    setConversationId(target?.conversationId ?? null);
    setFeedbackGiven({});

  };

  // Resize handlers (desktop only)
  const MIN_W = 320;
  const MAX_W = 700;
  const startDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDesktop) return;
    e.preventDefault();
    const onMove = (ev: MouseEvent) => {
      const vw = window.innerWidth;
      const newW = Math.max(MIN_W, Math.min(MAX_W, vw - ev.clientX));
      if (typeof onWidthChange === 'function') onWidthChange(newW);
      else setInternalWidth(newW);
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      const finalW = typeof width === 'number' ? width : internalWidth;
      try {
        window.localStorage.setItem('aiChatSidebarWidth', String(finalW));
      } catch {}
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  return (
    <>
      {/* Backdrop overlay - only on mobile */}
      {open && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 lg:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div
        className={cn(
          "fixed right-0 top-0 h-full w-full lg:w-auto bg-background border-l shadow-xl z-50",
          "flex flex-col transition-transform duration-300 ease-in-out",
          open ? "translate-x-0" : "translate-x-full"
        )}
        style={isDesktop ? { width: sidebarWidth } : undefined}
      >
        {/* Drag handle (desktop only) */}
        <div
          className="absolute inset-y-0 left-0 w-1.5 cursor-col-resize select-none hidden lg:block group"
          onMouseDown={startDrag}
          role="separator"
          aria-orientation="vertical"
        >
          <div className="absolute inset-y-0 -left-[3px] w-[7px] bg-transparent group-hover:bg-border/60 transition-colors" />
        </div>
        {/* Header */}
        <div className="border-b">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">AI Assistant</h2>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Chat tabs + history */}
          <div className="flex items-center justify-between px-4 pb-2 gap-2 border-t bg-muted/40">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
              {chatSessions.map((session, index) => {
                const isActive = session.id === activeChatId;
                return (
                  <button
                    key={session.id}
                    type="button"
                    onClick={() => handleSwitchChat(session.id)}
                    className={cn(
                      "px-3 py-1 rounded-full text-xs whitespace-nowrap border",
                      isActive
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-muted-foreground hover:bg-muted"
                    )}
                  >
                    {session.title || `Chat ${index + 1}`}
                  </button>
                );
              })}
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0"
                onClick={handleNewChat}
                aria-label="New chat"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0"
                  aria-label="Chat history"
                >
                  <Clock className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-2 w-72" align="end">
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  Recent chats
                </p>
                {chatSessions.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No chats yet.</p>
                ) : (
                  <div className="space-y-1 max-h-64 overflow-y-auto">
                    {chatSessions
                      .slice()
                      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
                      .map((session, index) => {
                        const isActive = session.id === activeChatId;
                        return (
                          <button
                            key={session.id}
                            type="button"
                            onClick={() => handleSwitchChat(session.id)}
                            className={cn(
                              "w-full text-left px-2 py-1.5 rounded-md text-xs",
                              isActive
                                ? "bg-primary/10 text-foreground"
                                : "hover:bg-muted"
                            )}
                          >
                            <div className="flex justify-between items-center gap-2">
                              <span className="truncate">
                                {session.title || `Chat ${index + 1}`}
                              </span>
                              <span className="text-[10px] text-muted-foreground">
                                {session.createdAt.toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                  </div>
                )}
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Question Context (if available) */}
        {/* {question && (
          <div className="p-4 bg-muted/50 border-b">
            <p className="text-xs text-muted-foreground mb-1">Question {question.id}</p>
            <p className="text-sm font-medium line-clamp-2">
              {question.text.replace(/<[^>]*>/g, '').substring(0, 100)}...
            </p>
          </div>
        )} */}

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {historyLoading && (
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading chat...</span>
            </div>
          )}
          {messages.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
              <Bot className="h-12 w-12 mb-4 opacity-50" />
              <p className="text-sm">Ask me anything about this question!</p>
              <p className="text-xs mt-2">I can explain concepts, provide reasoning, and offer study tips.</p>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex flex-col gap-2",
                message.role === 'user' ? 'items-end' : 'items-start'
              )}
            >
              <div
                className={cn(
                  "rounded-lg px-4 py-3 max-w-[85%]",
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                )}
              >
                {message.role === 'assistant' && message.explanation ? (
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium mb-2">Explanation</p>
                      <p className="text-sm whitespace-pre-wrap">{message.explanation.explanation}</p>
                    </div>
                    {message.explanation.reasoning && (
                      <>
                        <Separator />
                        <div>
                          <p className="text-sm font-medium mb-2">Reasoning</p>
                          <p className="text-sm whitespace-pre-wrap">{message.explanation.reasoning}</p>
                        </div>
                      </>
                    )}
                    {message.explanation.tips && message.explanation.tips.length > 0 && (
                      <>
                        <Separator />
                        <div>
                          <p className="text-sm font-medium mb-2">Study Tips</p>
                          <ul className="text-sm space-y-1 list-disc list-inside">
                            {message.explanation.tips.map((tip, idx) => (
                              <li key={idx}>{tip}</li>
                            ))}
                          </ul>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="text-sm leading-relaxed">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm, remarkMath]}
                      rehypePlugins={[rehypeKatex]}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                )}
              </div>

              {/* Feedback buttons for assistant messages */}
              {message.role === 'assistant' && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "h-7 px-2 text-xs",
                      feedbackGiven[message.id] === 'helpful' && "bg-green-100 text-green-700"
                    )}
                    onClick={() => handleFeedback(message.id, true)}
                    disabled={feedbackGiven[message.id] !== null}
                  >
                    <ThumbsUp className="h-3 w-3 mr-1" />
                    Helpful
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "h-7 px-2 text-xs",
                      feedbackGiven[message.id] === 'not-helpful' && "bg-red-100 text-red-700"
                    )}
                    onClick={() => handleFeedback(message.id, false)}
                    disabled={feedbackGiven[message.id] !== null}
                  >
                    <ThumbsDown className="h-3 w-3 mr-1" />
                    Not helpful
                  </Button>
                </div>
              )}
            </div>
          ))}

          {(loading || isSending) && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">AI is thinking...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t space-y-2">
          {question && explanation && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRegenerate}
              disabled={loading || isSending}
              className="w-full"
            >
              <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
              Regenerate explanation
            </Button>
          )}
          {/* Composite input with inline references */}
          <div className="flex-1">
            <div className="rounded-md border bg-background focus-within:ring-1 focus-within:ring-ring">
              <div className="p-2">
                <div className="flex flex-wrap items-center gap-2">
                  {referencedIds.map((id) => {
                    const q = (allQuestions || []).find((x) => x.id === id) || (question && question.id === id ? question : null);
                    const label = q ? (q.text.replace(/<[^>]*>/g, '').substring(0, 40) + (q.text.replace(/<[^>]*>/g, '').length > 40 ? '…' : '')) : id;
                    return (
                      <Badge key={id} variant="secondary" className="pl-2 pr-1 py-1 text-xs">
                        <span className="mr-1"></span>
                        <span className="max-w-[200px] truncate">{label}</span>
                        <Button variant="ghost" size="icon" className="h-5 w-5 ml-1" onClick={() => removeReference(id)} aria-label={`Remove reference ${id}`}>
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    );
                  })}
                  <Popover open={refPickerOpen} onOpenChange={setRefPickerOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="h-7 px-2 text-xs">
                        <Plus className="h-3 w-3 mr-1" /> Add reference
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0 w-96" align="start">
                      <Command>
                        <CommandInput placeholder="Search questions..." />
                        <CommandEmpty>No questions found.</CommandEmpty>
                        <CommandList>
                          <CommandGroup heading="Questions">
                            {(allQuestions && allQuestions.length > 0 ? allQuestions : (question ? [question] : []))
                              .map((q, idx) => {
                                const clean = q.text.replace(/<[^>]*>/g, '');
                                const labelIdx = allQuestions ? idx : 0;
                                const label = `Q${labelIdx + 1}`;
                                const snippet = clean.substring(0, 80) + (clean.length > 80 ? '…' : '');
                                return (
                                  <CommandItem key={q.id} value={q.id} onSelect={(val) => { addReference(val); setRefPickerOpen(false); }}>
                                    {label}  {snippet}
                                  </CommandItem>
                                );
                              })}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div className="flex items-end gap-2 border-t p-2">
                <Textarea
                  ref={inputRef as any}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder='Ask a question...'
                  disabled={isSending || loading || !question}
                  className="flex-1 min-h-[96px]"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isSending || loading || !question}
                  size="icon"
                >
                  {isSending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AIChatSidebar;

