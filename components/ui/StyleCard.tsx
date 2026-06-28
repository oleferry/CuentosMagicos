"use client";

interface StyleCardProps {
  emoji: string;
  nombre: string;
  descripcion: string;
  selected: boolean;
  onClick: () => void;
}

export default function StyleCard({
  emoji,
  nombre,
  descripcion,
  selected,
  onClick,
}: StyleCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className="flex flex-col items-start gap-1 rounded-2xl border-2 bg-white p-4 text-left transition-all"
      style={{
        borderColor: selected ? "#9B5DE5" : "#E8E0F0",
        transform: selected ? "translateY(-2px)" : "none",
        boxShadow: selected ? "0 6px 16px rgba(155,93,229,0.25)" : "none",
      }}
    >
      <span className="text-2xl">{emoji}</span>
      <span className="text-base font-extrabold text-[#3a2c4d]">{nombre}</span>
      <span className="text-xs leading-snug text-[#7a6b8a]">{descripcion}</span>
    </button>
  );
}
