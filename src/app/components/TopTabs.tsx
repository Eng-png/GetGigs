import { Plus } from "lucide-react";
import { useState } from "react";
import type { Version } from "../App";

type Props = {
  versions: Version[];
  view: "intro" | "version";
  activeId: string | null;
  onSelectIntro: () => void;
  onSelectVersion: (id: string) => void;
  onAdd: () => void;
  onRename: (id: string, label: string) => void;
};

export function TopTabs({
  versions,
  view,
  activeId,
  onSelectIntro,
  onSelectVersion,
  onAdd,
  onRename,
}: Props) {
  const introActive = view === "intro";
  return (
    <div
      className="flex items-end gap-[10px] px-5 w-full"
      style={{ height: 47, fontFamily: "Inter, sans-serif" }}
    >
      <TabPill
        label="Intro"
        active={introActive}
        flex={334}
        onClick={onSelectIntro}
      />
      {versions.map((v) => (
        <VersionTab
          key={v.id}
          version={v}
          active={!introActive && activeId === v.id}
          onClick={() => onSelectVersion(v.id)}
          onRename={(l) => onRename(v.id, l)}
        />
      ))}
      <button
        type="button"
        onClick={onAdd}
        className="flex items-center justify-center"
        style={{
          height: 47,
          padding: "0 15px",
          borderRadius: "0 0 10px 10px",
          border: "1px solid rgba(255,255,255,0.1)",
          background: "transparent",
          cursor: "pointer",
        }}
        aria-label="Add version"
      >
        <Plus size={14} color="rgba(255,255,255,0.4)" strokeWidth={1.2} />
      </button>
    </div>
  );
}

function TabPill({
  label,
  active,
  flex,
  onClick,
}: {
  label: string;
  active: boolean;
  flex: number;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flex: `${flex} 0 0`,
        minWidth: 0,
        height: 47,
        background: active ? "#DDE04A" : "rgba(255,255,255,0.2)",
        opacity: active ? 1 : 0.5,
        color: active ? "#000" : "#fff",
        borderRadius: "0 0 10px 10px",
        border: "none",
        cursor: "pointer",
        fontSize: 14,
        fontWeight: 500,
        fontFamily: "Inter, sans-serif",
      }}
    >
      {label}
    </button>
  );
}

function VersionTab({
  version,
  active,
  onClick,
  onRename,
}: {
  version: Version;
  active: boolean;
  onClick: () => void;
  onRename: (l: string) => void;
}) {
  const [renaming, setRenaming] = useState(false);
  const [draft, setDraft] = useState(version.label);

  return (
    <div style={{ flex: "304 0 0", minWidth: 0, position: "relative" }}>
      <button
        type="button"
        onClick={onClick}
        onDoubleClick={() => {
          setDraft(version.label);
          setRenaming(true);
        }}
        style={{
          width: "100%",
          height: 47,
          background: active ? "#DDE04A" : "rgba(255,255,255,0.2)",
          opacity: active ? 1 : 0.5,
          color: active ? "#000" : "#fff",
          borderRadius: "0 0 10px 10px",
          border: "none",
          cursor: "pointer",
          fontSize: 14,
          fontWeight: 500,
          fontFamily: "Inter, sans-serif",
        }}
      >
        {renaming ? (
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={() => {
              if (draft.trim()) onRename(draft.trim());
              setRenaming(false);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                if (draft.trim()) onRename(draft.trim());
                setRenaming(false);
              }
              if (e.key === "Escape") setRenaming(false);
            }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "transparent",
              border: "none",
              outline: "none",
              color: "inherit",
              fontSize: 14,
              fontWeight: 500,
              textAlign: "center",
              width: "100%",
            }}
          />
        ) : (
          version.label
        )}
      </button>
    </div>
  );
}
