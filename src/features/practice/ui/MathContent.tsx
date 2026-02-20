import React from "react";
import ReactMarkdown, { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { cn } from "@/lib/utils";

interface MathContentProps {
  content?: string | null;
  className?: string;
  inline?: boolean;
}

const MathContent: React.FC<MathContentProps> = ({ content, className, inline }) => {
  if (!content) {
    return null;
  }

  const components: Components = inline
    ? {
        p: ({ children }) => <span>{children}</span>,
      }
    : {};

  return (
    <div className={cn("prose max-w-none", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        skipHtml={true}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MathContent;
