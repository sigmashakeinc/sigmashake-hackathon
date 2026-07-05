interface ProgressWidgetProps {
  label: string;
  pct: number;
  sub: string;
  color: string;
  large?: boolean;
}

export function ProgressWidget({ label, pct, sub, color, large }: ProgressWidgetProps) {
  return (
    <div className={large ? "sm:col-span-3" : ""}>
      <div className="mb-xs flex justify-between font-mono text-[10px] text-on-surface-variant">
        <span>{label}</span><span>{sub}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-container-highest">
        <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
