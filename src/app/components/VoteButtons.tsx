import { ThumbsUp, ThumbsDown } from "lucide-react";

type Props = {
  vote: "up" | "down" | null;
  up: number;
  down: number;
  onVote: (v: "up" | "down") => void;
  vertical?: boolean;
};

export function VoteButtons({ vote, up, down, onVote, vertical }: Props) {
  const upActive = vote === "up";
  const downActive = vote === "down";

  const SIZE = 106;

  const buttonStyle = (active: boolean) => ({
    width: SIZE,
    height: SIZE,
    borderRadius: 9999,
    background: active ? "#DDE04A" : "transparent",
    border: "0.796px solid rgba(255,255,255,0.16)",
    color: active ? "#000" : "#fff",
    cursor: "pointer",
  });

  return (
    <div
      className={`flex ${vertical ? "flex-col" : "flex-row"} items-center justify-center`}
      style={{ gap: 12.741 }}
    >
      <button
        onClick={() => onVote("down")}
        style={buttonStyle(downActive)}
        className="flex items-center justify-center gap-1"
        aria-label="Thumbs down"
      >
        <ThumbsDown
          size={28}
          color={downActive ? "#000" : "#fff"}
          strokeWidth={1.5}
          fill={downActive ? "#000" : "none"}
        />
        {down > 0 && (
          <span style={{ fontFamily: "Inter", fontSize: 16, color: downActive ? "#000" : "#fff" }}>
            {down}
          </span>
        )}
      </button>
      <button
        onClick={() => onVote("up")}
        style={buttonStyle(upActive)}
        className="flex items-center justify-center gap-1"
        aria-label="Thumbs up"
      >
        <ThumbsUp
          size={28}
          color={upActive ? "#000" : "#fff"}
          strokeWidth={1.5}
          fill={upActive ? "#000" : "none"}
        />
        {up > 0 && (
          <span style={{ fontFamily: "Inter", fontSize: 16, color: upActive ? "#000" : "#fff" }}>
            {up}
          </span>
        )}
      </button>
    </div>
  );
}
