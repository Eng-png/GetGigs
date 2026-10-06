import type { Version } from "../App";

type Props = {
  versions: Version[];
  view: "intro" | "version";
  activeId: string | null;
  onSelectIntro: () => void;
  onSelectVersion: (id: string) => void;
  updateVersion: (id: string, patch: Partial<Version>) => void;
  onClose: () => void;
};

const CITRON = "#dde04a";

export function MobileMenuPanel({
  versions,
  view,
  activeId,
  onSelectIntro,
  onSelectVersion,
  onClose,
}: Props) {
  const introActive = view === "intro";

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center"
      style={{ background: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[402px] flex flex-col"
        style={{
          background: "#000",
          borderRadius: "0 0 20px 20px",
          padding: "20px 20px 24px",
          gap: 10,
          fontFamily: "Inter, sans-serif",
          boxShadow: "0 12px 24px rgba(0,0,0,0.35)",
        }}
      >
        <Row
          label="Intro"
          active={introActive}
          onClick={() => {
            onSelectIntro();
            onClose();
          }}
        />
        {versions.map((v) => (
          <Row
            key={v.id}
            label={v.label}
            sub={v.subtitle}
            active={!introActive && v.id === activeId}
            onClick={() => {
              onSelectVersion(v.id);
              onClose();
            }}
          />
        ))}
      </div>
    </div>
  );
}

function Row({
  label,
  sub,
  active,
  onClick,
}: {
  label: string;
  sub?: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: "100%",
        height: 47,
        background: active ? CITRON : "rgba(255,255,255,0.2)",
        opacity: active ? 1 : 0.5,
        border: "none",
        borderRadius: 10,
        padding: "0 15px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        cursor: "pointer",
        fontFamily: "Inter, sans-serif",
        fontWeight: 500,
        fontSize: 12.741,
        lineHeight: "16.722px",
        color: active ? "#000" : "#fff",
        whiteSpace: "nowrap",
      }}
    >
      <span>{label}</span>
      {sub && <span>{sub}</span>}
    </button>
  );
}
