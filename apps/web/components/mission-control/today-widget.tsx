interface TodayWidgetProps {
  label: string;
  count: number;
  color?: string;
}

export function TodayWidget({ label, count, color }: TodayWidgetProps) {
  return (
    <div>
      <p className={`text-[24px] font-bold leading-none ${color ?? "text-on-surface"}`}>{count}</p>
      <p className="mt-xs font-mono text-[10px] text-on-surface-variant">{label}</p>
    </div>
  );
}
