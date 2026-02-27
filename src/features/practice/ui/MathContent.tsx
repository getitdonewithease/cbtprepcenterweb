import React from "react";
import ReactMarkdown, { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import DOMPurify from "dompurify";
import "katex/dist/katex.min.css";
import { cn } from "@/core/ui/cn";

interface MathContentProps {
  content?: string | null;
  className?: string;
  inline?: boolean;
}

const MATH_SEGMENT_REGEX = /(\$\$[\s\S]*?\$\$|\$[^$\n]+\$|\\\([\s\S]*?\\\)|\\\[[\s\S]*?\\\])/g;

const decodeHtmlEntities = (value: string): string => {
  if (typeof window === "undefined") {
    return value;
  }

  const textarea = window.document.createElement("textarea");
  textarea.innerHTML = value;
  return textarea.value;
};

const sanitizePreservingMath = (value: string): string => {
  const segments = value.split(MATH_SEGMENT_REGEX);

  return segments
    .map((segment, index) => {
      const isMathSegment = index % 2 === 1;

      if (isMathSegment) {
        return decodeHtmlEntities(segment);
      }

      return DOMPurify.sanitize(segment, {
        USE_PROFILES: { html: true },
      });
    })
    .join("");
};

const MathContent: React.FC<MathContentProps> = ({ content, className, inline }) => {
  if (!content) {
    return null;
  }

  const sanitizedContent = sanitizePreservingMath(content);

  const components: Components = inline
    ? {
        p: ({ children }) => <span>{children}</span>,
      }
    : {};

  return (
    <div className={cn("prose max-w-none", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeRaw, rehypeKatex]}
        skipHtml={false}
        components={components}
      >
        {sanitizedContent}
      </ReactMarkdown>
    </div>
  );
};

export default MathContent;
