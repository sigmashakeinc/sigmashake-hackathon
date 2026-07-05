"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/packages/utils";

interface AccordionItem {
  value: string;
  title: string;
  content: ReactNode;
}

interface AccordionProps {
  items: AccordionItem[];
  className?: string;
  multiple?: boolean;
}

export function Accordion({
  items,
  className,
  multiple = false,
}: AccordionProps) {
  const [open, setOpen] = useState<string[]>([]);

  function toggle(value: string) {
    setOpen((prev) =>
      multiple
        ? prev.includes(value)
          ? prev.filter((v) => v !== value)
          : [...prev, value]
        : prev.includes(value)
          ? []
          : [value],
    );
  }

  return (
    <div className={cn("divide-outline-variant/30 divide-y", className)}>
      {items.map((item) => {
        const isOpen = open.includes(item.value);
        return (
          <div key={item.value}>
            <button
              onClick={() => toggle(item.value)}
              className="px-md py-sm text-body-sm text-on-surface hover:text-primary flex w-full items-center justify-between transition-colors"
              aria-expanded={isOpen}
            >
              <span className="font-medium">{item.title}</span>
              <svg
                className={cn(
                  "h-4 w-4 transition-transform duration-150",
                  isOpen && "rotate-180",
                )}
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M4 6l4 4 4-4" />
              </svg>
            </button>
            {isOpen && (
              <div className="px-md pb-sm text-body-sm text-on-surface-variant">
                {item.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
