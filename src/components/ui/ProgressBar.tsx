// src/components/ui/ProgressBar.tsx
interface ProgressBarProps {
  value: number;
  color?: string;
  height?: string;
}

export function ProgressBar({ value, color = "#6366f1", height = "h-2" }: ProgressBarProps) {
  return (
    <div className={`bg-white/[0.04] rounded-full ${height} overflow-hidden`}>
      <div
        className={`h-full rounded-full bg-gradient-to-r transition-all duration-1000`}
        style={{
          width: `${Math.min(value, 100)}%`,
          backgroundImage: `linear-gradient(to right, ${color}, ${color}cc)`,
        }}
      />
    </div>
  );
}