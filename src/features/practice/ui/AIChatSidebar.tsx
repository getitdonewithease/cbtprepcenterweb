import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { 
  Bot, 
  X, 
  Send, 
  RefreshCw,
  Loader2,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { ReviewQuestion, AIExplanationResponse } from '../types/practiceTypes';
import { cn } from '@/lib/utils';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  explanation?: AIExplanationResponse;
  timestamp: Date;
}

interface AIChatSidebarProps {
  open: boolean;
  onClose: () => void;
  question: ReviewQuestion | null;
  explanation: AIExplanationResponse | null;
  loading: boolean;
  onGetExplanation: () => Promise<void>;
  onSendMessage?: (message: string) => Promise<void>;
}

const AIChatSidebar: React.FC<AIChatSidebarProps> = ({
  open,
  onClose,
  question,
  explanation,
  loading,
  onGetExplanation,
  onSendMessage,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState<Record<string, 'helpful' | 'not-helpful' | null>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const previousQuestionIdRef = useRef<string | null>(null);

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

  // Clear messages when question changes
  useEffect(() => {
    if (question && previousQuestionIdRef.current !== question.id) {
      if (previousQuestionIdRef.current !== null) {
        // Only clear if we're switching to a different question
        setMessages([]);
        setFeedbackGiven({});
      }
      previousQuestionIdRef.current = question.id;
    }
  }, [question?.id]);

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

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isSending || !question) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsSending(true);

    try {
      if (onSendMessage) {
        await onSendMessage(userMessage.content);
      } else {
        // Fallback: trigger explanation if no custom handler
        await onGetExplanation();
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

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
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
          "fixed right-0 top-0 h-full w-full sm:w-[420px] bg-background border-l shadow-xl z-50",
          "flex flex-col transition-transform duration-300 ease-in-out",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
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

        {/* Question Context (if available) */}
        {question && (
          <div className="p-4 bg-muted/50 border-b">
            <p className="text-xs text-muted-foreground mb-1">Question {question.id}</p>
            <p className="text-sm font-medium line-clamp-2">
              {question.text.replace(/<[^>]*>/g, '').substring(0, 100)}...
            </p>
          </div>
        )}

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
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

          {loading && (
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
              disabled={loading}
              className="w-full"
            >
              <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
              Regenerate explanation
            </Button>
          )}
          
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask a question..."
              disabled={isSending || loading || !question}
              className="flex-1"
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
    </>
  );
};

export default AIChatSidebar;

