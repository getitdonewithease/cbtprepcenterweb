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
        // Answers set as study material: paragraph rhythm, real list markers, headings with
        // weight, display maths given room instead of a box (design option C, approved)
        "break-words text-[15px] leading-[1.7] text-foreground",
        "[&_p]:my-3 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0 [&_p]:break-words",
        "[&_h1]:mb-2 [&_h1]:mt-6 [&_h1]:text-lg [&_h1]:font-bold [&_h2]:mb-2 [&_h2]:mt-6 [&_h2]:text-lg [&_h2]:font-bold",
        "[&_h3]:mb-2 [&_h3]:mt-6 [&_h3]:text-base [&_h3]:font-bold [&_h3]:tracking-[-0.01em] [&_h4]:mt-4 [&_h4]:font-bold",
        "[&_ol]:my-3 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-5 [&_ul]:my-3 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5",
        "[&_li]:break-words [&_li]:pl-1 [&_li::marker]:font-semibold [&_li::marker]:text-brand-text",
        "[&_strong]:font-bold [&_a]:font-semibold [&_a]:text-brand-text [&_a]:underline [&_a]:underline-offset-4",
        "[&_hr]:my-5 [&_hr]:border-border [&_blockquote]:my-3 [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:text-muted-foreground",
        "[&_code]:break-all [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[0.9em]",
        "[&_pre]:my-3 [&_pre]:max-w-full [&_pre]:overflow-x-auto [&_pre]:overflow-y-hidden [&_pre]:whitespace-pre-wrap [&_pre]:rounded-xl [&_pre]:bg-muted [&_pre]:p-3",
        "[&_table]:my-3 [&_table]:w-full [&_table]:text-sm [&_th]:border-b [&_th]:py-2 [&_th]:text-left [&_td]:border-b [&_td]:py-2",
        "[&_.katex-display]:my-2 [&_.katex-display]:max-w-full [&_.katex-display]:overflow-x-auto [&_.katex-display]:overflow-y-hidden [&_.katex-display]:py-1 [&_.katex-display]:whitespace-normal [&_.katex-display_.katex]:whitespace-normal",
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
