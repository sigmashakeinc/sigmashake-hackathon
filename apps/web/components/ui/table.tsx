import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TableProps extends HTMLAttributes<HTMLTableElement> {
  children: ReactNode;
}

export function Table({ className, children, ...props }: TableProps) {
  return (
    <div className="w-full overflow-auto">
      <table className={cn("w-full border-collapse", className)} {...props}>
        {children}
      </table>
    </div>
  );
}

export function TableHeader({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      className={cn("border-surface-variant border-b", className)}
      {...props}
    >
      {children}
    </thead>
  );
}

export function TableBody({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody className={cn("", className)} {...props}>
      {children}
    </tbody>
  );
}

export function TableRow({
  className,
  children,
  selected,
  ...props
}: HTMLAttributes<HTMLTableRowElement> & { selected?: boolean }) {
  return (
    <tr
      className={cn(
        "border-surface-container-low border-b transition-colors duration-150",
        "hover:bg-surface-container-low",
        selected && "border-l-primary bg-surface-container-high border-l-2",
        className,
      )}
      {...props}
    >
      {children}
    </tr>
  );
}

export function TableHead({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        "px-md py-sm text-on-surface-variant text-left font-mono text-[10px] font-medium tracking-wider uppercase",
        className,
      )}
      {...props}
    >
      {children}
    </th>
  );
}

export function TableCell({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={cn("px-md py-md text-body-sm text-on-surface", className)}
      {...props}
    >
      {children}
    </td>
  );
}
