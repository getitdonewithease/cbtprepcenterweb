import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";
import {
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  ThumbsDown,
  ThumbsUp,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChatInputBar, ChatPanelBase, type ChatInputBarProps } from "@/features/chat";
import { cn } from "@/core/ui/cn";
import { useAIChat } from "../hooks/useAIChat";
import { useAIChatHistory } from "../hooks/useAIChatHistory";
import { useAIQuestionReferences } from "../hooks/useAIQuestionReferences";
import { useAIChatSession } from "../hooks/useAIChatSession";
import type { AIChatMessage, AIChatSession } from "../types/aiChatTypes";
import type { AIExplanationResponse, ReviewQuestion } from "../types/practiceTypes";

const markdownRemarkPlugins = [remarkGfm, remarkMath];
const markdownRehypePlugins = [rehypeKatex];
const ACTIVE_CHAT_STORAGE_KEY = "practice-ai-chat-active-session";

type FeedbackValue = "helpful" | "not-helpful" | null;

interface AIChatPanelProps {
  allQuestions?: ReviewQuestion[];
  emptyStateSubtitle?: string;
  emptyStateTitle?: string;
  explanation?: AIExplanationResponse | null;
  isFullscreen: boolean;
  isMobileView: boolean;
  loading?: boolean;
  onClose: () => void;
  onFeedback?: (messageId: string, helpful: boolean) => void;
  onGetExplanation?: () => Promise<void>;
  onToggleFullscreen: () => void;
  question: ReviewQuestion | null;
  showReferences?: boolean;
}

const stripHtml = (value: string) => value.replace(/<[^>]*>/g, "");

const isServerSession = (session: AIChatSession, serverSessions: AIChatSession[]) => (
  serverSessions.some((serverSession) => serverSession.conversationId === session.conversationId)
);

const AIChatPanel: React.FC<AIChatPanelProps> = ({
  allQuestions,
  emptyStateSubtitle = "Ask me anything about this question. I can explain concepts, reasoning, and study tips.",
  emptyStateTitle = "What do you want to learn today?",
  explanation,
  isFullscreen,
  isMobileView,
  loading = false,
  onClose,
  onFeedback,
  onGetExplanation,
  onToggleFullscreen,
  question,
  showReferences = true,
}) => {
  const [chatInput, setChatInput] = useState("");
  const [feedbackGiven, setFeedbackGiven] = useState<Record<string, FeedbackValue>>({});
  const [refPickerOpen, setRefPickerOpen] = useState(false);
  const [historyContentLoading, setHistoryContentLoading] = useState(false);
  const [sessionMutationId, setSessionMutationId] = useState<string | null>(null);
  const [initialActiveSessionId] = useState<string | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }

    return window.localStorage.getItem(ACTIVE_CHAT_STORAGE_KEY);
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const activeSessionIdRef = useRef<string | null>(null);
  const loadingConversationIdRef = useRef<string | null>(null);

  const {
    sessions: serverSessionMetadata,
    loading: historyMetadataLoading,
    error: historyError,
    getSessionContent,
    invalidateSessionContent,
    refetchMetadata,
    deleteSession: deleteServerSession,
    renameSession,
  } = useAIChatHistory();
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
  } = useAIChatSession({ initialActiveSessionId });
  const {
    addReference,
    buildPromptPrefix,
    referencedIds,
    removeReference,
    replaceReferences,
  } = useAIQuestionReferences(question, { resetOnQuestionChange: showReferences });

  const serverSessions = useMemo(
    () => serverSessionMetadata.map((session) => ({ ...session, messages: [] })),
    [serverSessionMetadata]
  );
  const sidebarSessions = useMemo(
    () => sessions.filter((session) => !(session.title === "New chat" && session.messages.length === 0)),
    [sessions]
  );

  const questionsForReference = useMemo(
    () => allQuestions && allQuestions.length > 0 ? allQuestions : (question ? [question] : []),
    [allQuestions, question]
  );
  const questionById = useMemo(() => {
    const entries = questionsForReference.map((entry) => [entry.id, entry] as const);
    return new Map<string, ReviewQuestion>(entries);
  }, [questionsForReference]);
  const referenceBadges = useMemo(
    () => referencedIds.map((id) => {
      const referencedQuestion = questionById.get(id) ?? null;
      const label = referencedQuestion
        ? `${referencedQuestion.subject}: ${stripHtml(referencedQuestion.text).slice(0, 40)}${stripHtml(referencedQuestion.text).length > 40 ? "..." : ""}`
        : id;

      return { id, label };
    }),
    [questionById, referencedIds]
  );
  const referenceOptions = useMemo(
    () => questionsForReference.map((entry, index) => ({
      id: entry.id,
      label: `Q${index + 1}`,
      snippet: stripHtml(entry.text).slice(0, 90),
    })),
    [questionsForReference]
  );
  const isActiveServerSession = useMemo(
    () => Boolean(activeSessionId && serverSessionMetadata.some((session) => session.id === activeSessionId)),
    [activeSessionId, serverSessionMetadata]
  );

  useEffect(() => {
    activeSessionIdRef.current = activeSessionId;
  }, [activeSessionId]);

  useEffect(() => {
    if (typeof window === "undefined" || !activeSessionId) {
      return;
    }

    window.localStorage.setItem(ACTIVE_CHAT_STORAGE_KEY, activeSessionId);
  }, [activeSessionId]);

  useEffect(() => {
    if (serverSessionMetadata.length === 0) {
      return;
    }

    hydrateSessions(serverSessionMetadata);
  }, [hydrateSessions, serverSessionMetadata]);

  const loadSessionContent = useCallback(async (session: AIChatSession, sessionId: string) => {
    if (!session.conversationId || session.messages.length > 0) {
      return;
    }

    if (!isServerSession(session, serverSessions)) {
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
    } catch {
      // Error state is already captured in the history hook.
    } finally {
      if (loadingConversationIdRef.current === session.conversationId) {
        loadingConversationIdRef.current = null;
      }
      setHistoryContentLoading(false);
    }
  }, [getSessionContent, replaceMessages, serverSessions]);

  useEffect(() => {
    if (!question || !explanation || !activeSessionIdRef.current) {
      return;
    }

    const explanationMessageId = `explanation-${question.id}`;
    const currentMessages = activeSession?.messages ?? [];
    if (currentMessages.some((message) => message.id === explanationMessageId)) {
      return;
    }

    appendMessage({
      id: explanationMessageId,
      role: "assistant",
      content: explanation.explanation || "Here is the explanation for this question.",
      explanation,
      timestamp: new Date(),
    }, activeSessionIdRef.current);
  }, [activeSession?.messages, appendMessage, explanation, question]);

  const { streamMessage, isStreaming, error: streamError } = useAIChat({
    conversationId: activeSession?.conversationId ?? null,
    onConversationReady: (conversationId) => {
      const targetSessionId = activeSessionIdRef.current;
      if (!targetSessionId) {
        return;
      }

      updateSession(targetSessionId, { conversationId });
    },
    onAssistantMessageStart: (message) => {
      const targetSessionId = activeSessionIdRef.current;
      if (!targetSessionId) {
        return;
      }

      appendMessage(message, targetSessionId);
    },
    onAssistantMessageToken: (messageId, nextContent) => {
      const targetSessionId = activeSessionIdRef.current;
      if (!targetSessionId) {
        return;
      }

      updateMessage(messageId, (message) => ({ ...message, content: nextContent }), targetSessionId);
    },
    onAssistantMessageComplete: (messageId, response) => {
      const targetSessionId = activeSessionIdRef.current;
      if (!targetSessionId) {
        return;
      }

      updateMessage(
        messageId,
        (message) => ({
          ...message,
          content: response.explanation,
          explanation: {
            explanation: response.explanation,
            reasoning: response.reasoning,
            tips: response.tips,
          },
        }),
        targetSessionId
      );

      if (response.conversationId) {
        updateSession(targetSessionId, { conversationId: response.conversationId });
      }
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: isStreaming ? "auto" : "smooth", block: "end" });
  }, [activeSession?.messages, isStreaming]);

  const handleFeedback = (messageId: string, helpful: boolean) => {
    setFeedbackGiven((previous) => ({
      ...previous,
      [messageId]: helpful ? "helpful" : "not-helpful",
    }));
    onFeedback?.(messageId, helpful);
  };

  const handleStartNewChat = () => {
    createSession();
    setChatInput("");
    setFeedbackGiven({});
    if (showReferences) {
      replaceReferences(question?.id ? [question.id] : []);
    }
  };

  const handleSelectSession = async (sessionId: string) => {
    switchSession(sessionId);
  };

  useEffect(() => {
    if (!activeSession || !activeSessionId) {
      return;
    }

    void loadSessionContent(activeSession, activeSessionId);
  }, [activeSession, activeSessionId, loadSessionContent]);

  const handleSend = async () => {
    const nextMessage = chatInput.trim();
    if (!nextMessage || !activeSession) {
      return;
    }

    const activeSessionSnapshot = activeSession;
    const userMessage: AIChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: nextMessage,
      timestamp: new Date(),
    };
    const promptPrefix = showReferences ? buildPromptPrefix(questionsForReference) : "";
    const composedPrompt = promptPrefix ? `${promptPrefix}\n\n${nextMessage}` : nextMessage;

    appendMessage(userMessage, activeSessionSnapshot.id);

    if (activeSessionSnapshot.title === "New chat") {
      updateSession(activeSessionSnapshot.id, {
        title: nextMessage.slice(0, 36),
      });
    }

    setChatInput("");

    try {
      const response = await streamMessage(composedPrompt);

      const resolvedConversationId = response.conversationId ?? activeSessionSnapshot.conversationId;
      if (resolvedConversationId) {
        invalidateSessionContent(resolvedConversationId);
        try {
          const refreshedMessages = await getSessionContent(resolvedConversationId, { force: true });
          replaceMessages(refreshedMessages, activeSessionSnapshot.id);
        } catch {
          // Keep optimistic streamed state if the refresh fails.
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
        timestamp: new Date(),
      }, activeSessionSnapshot.id);
    }
  };

  const handleRenameSession = async (session: AIChatSession) => {
    const initialTitle = session.title === "New chat" ? "" : session.title;
    const nextTitle = window.prompt("Rename chat", initialTitle)?.trim();

    if (!nextTitle || nextTitle === session.title) {
      return;
    }

    setSessionMutationId(`rename-${session.id}`);
    updateSession(session.id, { title: nextTitle });

    if (!session.conversationId || !isServerSession(session, serverSessions)) {
      setSessionMutationId(null);
      return;
    }

    try {
      await renameSession(session.conversationId, nextTitle);
    } catch {
      // Keep the optimistic local rename until the real backend endpoint is available.
    } finally {
      setSessionMutationId(null);
    }
  };

  const handleDeleteSession = async (session: AIChatSession) => {
    const confirmed = window.confirm(`Delete \"${session.title}\"?`);
    if (!confirmed) {
      return;
    }

    setSessionMutationId(`delete-${session.id}`);
    deleteSession(session.id);

    if (!session.conversationId || !isServerSession(session, serverSessions)) {
      setSessionMutationId(null);
      return;
    }

    try {
      await deleteServerSession(session.conversationId);
    } catch {
      // Preserve the optimistic local deletion until the real backend endpoint is available.
    } finally {
      setSessionMutationId(null);
    }
  };

  const renderMessage = (message: AIChatMessage) => (
    <div
      key={message.id}
      className={cn(
        "flex flex-col gap-2",
        message.role === "user" ? "items-end" : "items-start"
      )}
    >
      <div
        className={cn(
          "overflow-hidden break-words rounded-2xl px-4 py-3",
          message.role === "assistant" ? "w-full max-w-3xl bg-background/70" : "max-w-[60%] bg-primary text-primary-foreground shadow-sm"
        )}
      >
        {message.role === "assistant" && message.explanation ? (
          <div className="space-y-4 text-sm leading-7 text-foreground">
            <div className="break-words [&_p]:break-words [&_li]:break-words [&_code]:break-all [&_pre]:max-w-full [&_pre]:overflow-x-auto [&_pre]:overflow-y-hidden [&_pre]:whitespace-pre-wrap [&_.katex-display]:max-w-full [&_.katex-display]:overflow-x-auto [&_.katex-display]:overflow-y-hidden [&_.katex-display]:whitespace-normal [&_.katex-display_.katex]:whitespace-normal">
              <ReactMarkdown remarkPlugins={markdownRemarkPlugins} rehypePlugins={markdownRehypePlugins}>
                {message.explanation.explanation}
              </ReactMarkdown>
            </div>
            {message.explanation.reasoning ? (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Reasoning</p>
                <p className="whitespace-pre-wrap break-words text-sm leading-7 text-foreground">{message.explanation.reasoning}</p>
              </div>
            ) : null}
            {message.explanation.tips.length > 0 ? (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Study Tips</p>
                <ul className="list-disc space-y-1 pl-5 text-sm leading-7 text-foreground">
                  {message.explanation.tips.map((tip, index) => (
                    <li key={`${message.id}-tip-${index}`}>{tip}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : (
          <div className={cn(
            "break-words text-sm leading-7 [&_p]:break-words [&_li]:break-words [&_code]:break-all [&_pre]:max-w-full [&_pre]:overflow-x-auto [&_pre]:overflow-y-hidden [&_pre]:whitespace-pre-wrap [&_.katex-display]:max-w-full [&_.katex-display]:overflow-x-auto [&_.katex-display]:overflow-y-hidden [&_.katex-display]:whitespace-normal [&_.katex-display_.katex]:whitespace-normal",
            message.role === "assistant" ? "text-foreground" : "text-primary-foreground"
          )}>
            <ReactMarkdown remarkPlugins={markdownRemarkPlugins} rehypePlugins={markdownRehypePlugins}>
              {message.content}
            </ReactMarkdown>
          </div>
        )}
      </div>

      {message.role === "assistant" ? (
        <div className="flex items-center gap-2 px-1">
          <Button
            variant="ghost"
            size="sm"
            className={cn("h-7 px-2 text-xs", feedbackGiven[message.id] === "helpful" && "bg-green-100 text-green-700")}
            onClick={() => handleFeedback(message.id, true)}
            disabled={feedbackGiven[message.id] !== undefined && feedbackGiven[message.id] !== null}
          >
            <ThumbsUp className="mr-1 h-3 w-3" />
            Helpful
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn("h-7 px-2 text-xs", feedbackGiven[message.id] === "not-helpful" && "bg-red-100 text-red-700")}
            onClick={() => handleFeedback(message.id, false)}
            disabled={feedbackGiven[message.id] !== undefined && feedbackGiven[message.id] !== null}
          >
            <ThumbsDown className="mr-1 h-3 w-3" />
            Not helpful
          </Button>
        </div>
      ) : null}
    </div>
  );

  const renderComposer = (composerProps: ChatInputBarProps) => {
    const composerHeader = (
      <div className="space-y-2">
        {showReferences ? (
          <div className="flex flex-wrap items-center gap-2">
            {referenceBadges.map(({ id, label }) => (
              <Badge key={id} variant="secondary" className="gap-1 rounded-full px-2 py-1 text-xs">
                <span className="max-w-[200px] truncate">{label}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 rounded-full"
                  onClick={() => removeReference(id)}
                  aria-label={`Remove reference ${id}`}
                >
                  <span className="text-[10px]">x</span>
                </Button>
              </Badge>
            ))}
          </div>
        ) : null}

        {explanation && onGetExplanation ? (
          <Button
            variant="outline"
            size="sm"
            className="w-full sm:w-auto"
            onClick={() => void onGetExplanation()}
            disabled={loading || isStreaming || !question}
          >
            <RefreshCw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />
            Regenerate explanation
          </Button>
        ) : null}
      </div>
    );

    const referenceTrigger = showReferences ? (
      <Popover open={refPickerOpen} onOpenChange={setRefPickerOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            type="button"
            aria-label="Add question reference"
            className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-96 p-0" align="start">
          <Command>
            <CommandInput placeholder="Search questions..." />
            <CommandEmpty>No questions found.</CommandEmpty>
            <CommandList>
              <CommandGroup heading="Questions">
                {referenceOptions.map((option) => (
                  <CommandItem
                    key={option.id}
                    value={`${option.label} ${option.snippet}`}
                    onSelect={() => {
                      addReference(option.id);
                      setRefPickerOpen(false);
                    }}
                  >
                    <div className="flex min-w-0 flex-col gap-1">
                      <span className="text-xs font-medium text-foreground">{option.label}</span>
                      <span className="truncate text-xs text-muted-foreground">{option.snippet}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    ) : undefined;

    return (
      <ChatInputBar
        {...composerProps}
        value={chatInput}
        onInputChange={setChatInput}
        onSend={handleSend}
        placeholder={question ? "Ask about this question..." : "How can I help you today?"}
        disabled={loading || isStreaming}
        sendDisabled={!chatInput.trim() || loading || isStreaming || (showReferences && !question)}
        headerSlot={composerHeader}
        leadingAction={referenceTrigger}
      />
    );
  };

  const renderSessionActions = (session: AIChatSession) => {
    const isDeleting = sessionMutationId === `delete-${session.id}`;
    const isRenaming = sessionMutationId === `rename-${session.id}`;

    return (
      <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => void handleRenameSession(session)}
          disabled={isDeleting || isRenaming}
          aria-label="Rename chat"
        >
          {isRenaming ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Pencil className="h-3.5 w-3.5" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => void handleDeleteSession(session)}
          disabled={isDeleting || isRenaming}
          aria-label="Delete chat"
        >
          {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
        </Button>
      </div>
    );
  };

  const messageListHeader = historyContentLoading || historyMetadataLoading || historyError || streamError ? (
    <div className="space-y-3">
      {historyContentLoading || historyMetadataLoading ? (
        <div className="flex items-center gap-2 rounded-xl border border-dashed border-border bg-background/80 px-3 py-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading chat history...</span>
        </div>
      ) : null}
      {historyError ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {historyError.message}
        </div>
      ) : null}
      {streamError ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {streamError.message}
        </div>
      ) : null}
    </div>
  ) : null;

  return (
    <ChatPanelBase
      messages={activeSession?.messages ?? []}
      sessions={sidebarSessions}
      activeSessionId={activeSessionId ?? ""}
      isFullscreen={isFullscreen}
      isMobileView={isMobileView}
      chatInput={chatInput}
      onInputChange={setChatInput}
      onSend={handleSend}
      onStartNewChat={handleStartNewChat}
      onSelectSession={(sessionId) => {
        void handleSelectSession(sessionId);
      }}
      onToggleFullscreen={onToggleFullscreen}
      onClose={onClose}
      hasStartedChat={
        Boolean(activeSession?.conversationId)
        || Boolean(activeSession?.messages.length)
        || isActiveServerSession
        || historyContentLoading
      }
      emptyStateTitle={emptyStateTitle}
      emptyStateSubtitle={emptyStateSubtitle}
      messageListHeader={messageListHeader}
      messageListFooter={<div ref={messagesEndRef} />}
      renderMessage={renderMessage}
      renderComposer={renderComposer}
      renderSessionActions={renderSessionActions}
    />
  );
};

export default AIChatPanel;