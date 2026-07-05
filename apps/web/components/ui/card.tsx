import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  highlight?: "left" | "top" | "none";
}

export function Card({
  className,
  children,
  highlight = "none",
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "border-outline-variant/30 bg-surface-container relative rounded border",
        highlight === "left" && "border-l-primary border-l-2",
        highlight === "top" && "border-t-primary border-t-2",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "border-outline-variant/30 px-lg py-md flex items-center justify-between border-b",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("text-h2 text-on-surface font-semibold", className)}
      {...props}
    >
      {children}
    </h3>
  );
}

interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {
  padding?: "sm" | "md" | "lg";
}

export function CardBody({
  className,
  children,
  padding = "md",
  ...props
}: CardBodyProps) {
  const paddings = {
    sm: "p-sm",
    md: "p-md",
    lg: "p-lg",
  };

  return (
    <div className={cn(paddings[padding], className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "border-outline-variant/30 px-lg py-md border-t",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
