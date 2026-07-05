interface BlockerWidgetProps {
  label: string;
  count: number;
}

export function BlockerWidget({ label, count }: BlockerWidgetProps) {
  return (
    <div>
      <p className="text-[24px] font-bold leading-none text-error">{count}</p>
      <p className="mt-xs font-mono text-[10px] text-on-surface-variant">{label}</p>
    </div>
  );
}
