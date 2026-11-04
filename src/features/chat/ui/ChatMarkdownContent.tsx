import React, { useMemo, useRef } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { cn } from "@/core/ui/cn";
import type {
  ChatQuizSelectedAnswers,
  ChatQuizSubmission,
} from "../types/chatQuizTypes";
import {
  hasUnclosedQuizFence,
  normalizeQuizBlocksInMarkdown,
  parseChatQuizBlock,
} from "../utils/chatQuizParser";
import { ChatQuizCard, ChatQuizLoadingCard } from "./ChatQuizCard";

const defaultRemarkPlugins = [remarkGfm, remarkMath];
const defaultRehypePlugins = [rehypeKatex];

const QUIZ_LANGUAGE_REGEX = /\blanguage-(?:quiz|question)\b/i;

export interface ChatMarkdownContentProps {
  content: string;
  className?: string;
  quizKey?: string;
  initialSubmittedAnswers?: ChatQuizSelectedAnswers | null;
  onSubmitQuiz?: (submission: ChatQuizSubmission) => void;
  isStreaming?: boolean;
}

export const ChatMarkdownContent: React.FC<ChatMarkdownContentProps> = ({
  content,
  className,
  quizKey,
  initialSubmittedAnswers,
  onSubmitQuiz,
  isStreaming = false,
}) => {
  // Track if this message was actively streamed during the current session view.
  // Live-streamed quizzes stay expanded; quizzes loaded from history/reload start collapsed.
  const wasStreamedInCurrentViewRef = useRef(isStreaming);
  if (isStreaming) {
    wasStreamedInCurrentViewRef.current = true;
  }

  const latestPropsRef = useRef({
    content,
    quizKey,
    initialSubmittedAnswers,
    onSubmitQuiz,
    isStreaming,
  });
  latestPropsRef.current = {
    content,
    quizKey,
    initialSubmittedAnswers,
    onSubmitQuiz,
    isStreaming,
  };

  const normalizedContent = useMemo(
    () => (isStreaming ? content : normalizeQuizBlocksInMarkdown(content)),
    [content, isStreaming],
  );

  // Empty dependency array guarantees stable component references across renders,
  // preventing React from unmounting/remounting ChatQuizCard on hover or state updates.
  const markdownComponents = useMemo<Components>(
    () => ({
      pre: ({ node, children, ...props }) => {
        const childArray = React.Children.toArray(children);
        const firstChild = childArray[0];

        const childClassName =
          React.isValidElement<{ className?: string }>(firstChild) &&
          typeof firstChild.props?.className === "string"
            ? firstChild.props.className
            : "";

        const hastFirstChild = node?.children?.[0];
        const hastClassNames =
          hastFirstChild &&
          "properties" in hastFirstChild &&
          Array.isArray(hastFirstChild.properties?.className)
            ? hastFirstChild.properties.className.join(" ")
            : "";

        if (
          QUIZ_LANGUAGE_REGEX.test(childClassName) ||
          QUIZ_LANGUAGE_REGEX.test(hastClassNames)
        ) {
          return <>{children}</>;
        }

        return <pre {...props}>{children}</pre>;
      },
      code: ({ className: codeClassName, children, ...props }) => {
        if (
          typeof codeClassName === "string" &&
          QUIZ_LANGUAGE_REGEX.test(codeClassName)
        ) {
          const {
            content: rawMessageContent,
            isStreaming: streamActive,
            quizKey: activeQuizKey,
            initialSubmittedAnswers: submittedAnswers,
            onSubmitQuiz: handleQuizSubmit,
          } = latestPropsRef.current;

          if (streamActive || hasUnclosedQuizFence(rawMessageContent)) {
            return <ChatQuizLoadingCard />;
          }

          const rawQuizText = String(children ?? "").replace(/\n$/, "");
          const questions = parseChatQuizBlock(rawQuizText);

          if (questions.length === 0) {
            return null;
          }

          const shouldDefaultCollapse = !wasStreamedInCurrentViewRef.current;

          return (
            <ChatQuizCard
              questions={questions}
              quizKey={activeQuizKey}
              defaultCollapsed={shouldDefaultCollapse}
              initialSubmittedAnswers={submittedAnswers}
              onSubmitQuiz={(submission) => {
                handleQuizSubmit?.(submission);
              }}
            />
          );
        }

        return (
          <code className={codeClassName} {...props}>
            {children}
          </code>
        );
      },
    }),
    [],
  );

  return (
    <div
      className={cn(
        "break-words text-base leading-7 [&_p]:break-words [&_li]:break-words [&_code]:break-all [&_pre]:max-w-full [&_pre]:overflow-x-auto [&_pre]:overflow-y-hidden [&_pre]:whitespace-pre-wrap [&_.katex-display]:max-w-full [&_.katex-display]:overflow-x-auto [&_.katex-display]:overflow-y-hidden [&_.katex-display]:whitespace-normal [&_.katex-display_.katex]:whitespace-normal",
        className,
      )}
    >
      <ReactMarkdown
        remarkPlugins={defaultRemarkPlugins}
        rehypePlugins={defaultRehypePlugins}
        components={markdownComponents}
      >
        {normalizedContent}
      </ReactMarkdown>
    </div>
  );
};
