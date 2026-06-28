"use client";

export type ChipColor = "rosa" | "azul" | "naranja" | "verde";

const COLORES: Record<ChipColor, { bg: string; border: string; text: string }> = {
  rosa: { bg: "#FF6B9D", border: "#FF6B9D", text: "#ffffff" },
  azul: { bg: "#00BBF9", border: "#00BBF9", text: "#ffffff" },
  naranja: { bg: "#FF6B35", border: "#FF6B35", text: "#ffffff" },
  verde: { bg: "#00F5D4", border: "#00F5D4", text: "#0c3b34" },
};

interface ChipProps {
  label: string;
  selected: boolean;
  color: ChipColor;
  onClick: () => void;
}

export default function Chip({ label, selected, color, onClick }: ChipProps) {
  const c = COLORES[color];
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className="rounded-[40px] border-2 px-4 py-2 text-sm font-bold transition-all active:scale-95"
      style={{
        borderColor: c.border,
        backgroundColor: selected ? c.bg : "#ffffff",
        color: selected ? c.text : c.border,
      }}
    >
      {label}
    </button>
  );
}
