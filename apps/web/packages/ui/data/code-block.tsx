"use client";

import { cn } from "@/packages/utils";

interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
  showLineNumbers?: boolean;
  className?: string;
}

export function CodeBlock({
  code,
  language = "ts",
  title,
  showLineNumbers = false,
  className,
}: CodeBlockProps) {
  const lines = code.split("\n");

  return (
    <div
      className={cn(
        "border-outline-variant/30 overflow-hidden rounded border bg-black",
        className,
      )}
    >
      {title && (
        <div className="border-outline-variant/30 px-md py-xs flex items-center justify-between border-b">
          <span className="text-on-surface-variant font-mono text-[10px]">
            {title}
          </span>
          {language && (
            <span className="text-on-surface-variant font-mono text-[10px]">
              {language}
            </span>
          )}
        </div>
      )}
      <pre className="p-md scrollbar-thin overflow-x-auto">
        <code className="text-tertiary-fixed font-mono text-[11px] leading-relaxed">
          {lines.map((line, i) => (
            <span key={i} className="block">
              {showLineNumbers && (
                <span className="mr-lg text-on-surface-variant/40 inline-block w-8 text-right select-none">
                  {i + 1}
                </span>
              )}
              {line || " "}
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}
