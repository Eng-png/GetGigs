import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  direction: "prev" | "next";
  disabled?: boolean;
  onClick?: () => void;
  size?: number;
};

export function NavButton({ direction, disabled, onClick, size = 88 }: Props) {
  const Icon = direction === "prev" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      aria-label={direction === "prev" ? "Previous" : "Next"}
      style={{
        width: size,
        height: size,
        background: "#DDE04A",
        borderRadius: 11,
        opacity: disabled ? 0.3 : 1,
        cursor: disabled ? "default" : "pointer",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
      className="flex items-center justify-center transition-opacity"
    >
      <Icon size={Math.round(size * 0.46)} color="#000" strokeWidth={2} />
    </button>
  );
}
