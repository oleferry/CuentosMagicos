"use client";

interface ProgressBarProps {
  total: number;
  actual: number; // índice del paso activo (0-based)
}

export default function ProgressBar({ total, actual }: ProgressBarProps) {
  return (
    <div className="flex w-full gap-1.5" role="progressbar" aria-valuenow={actual + 1} aria-valuemin={1} aria-valuemax={total}>
      {Array.from({ length: total }).map((_, i) => {
        let color = "#E8E0F0"; // pendiente
        if (i < actual) color = "#9B5DE5"; // completado
        else if (i === actual) color = "#FF6B35"; // activo
        return (
          <div
            key={i}
            className="h-2 flex-1 rounded-full transition-colors duration-300"
            style={{ backgroundColor: color }}
          />
        );
      })}
    </div>
  );
}
