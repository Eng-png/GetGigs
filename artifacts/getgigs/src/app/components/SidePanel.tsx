import { EditableText } from "./EditableText";
import type { Version } from "../App";

type Props = {
  projectTitle: string;
  setProjectTitle: (v: string) => void;
  version: Version;
  updateVersion: (patch: Partial<Version>) => void;
};

export function SidePanel({ projectTitle, setProjectTitle, version, updateVersion }: Props) {
  return (
    <div className="flex flex-col gap-3 w-[280px]" style={{ fontFamily: "Inter, sans-serif" }}>
      <div className="px-2 py-3">
        <EditableText
          value={projectTitle}
          onChange={setProjectTitle}
          showPencil
          pencilColor="#fff"
          style={{ color: "#fff", fontSize: 13, fontWeight: 500 }}
        />
      </div>

      <div
        className="rounded-[11px] p-3 flex flex-col gap-2"
        style={{ border: "1px solid rgba(255,255,255,0.08)" }}
      >
        <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: 500 }}>
          {version.label}
        </div>
        <div style={{ height: 1, background: "rgba(255,255,255,0.1)" }} />
        <EditableText
          value={version.subtitle}
          onChange={(v) => updateVersion({ subtitle: v })}
          showPencil
          pencilColor="#808080"
          style={{ color: "#fff", fontSize: 13, fontWeight: 500 }}
        />
        <EditableText
          value={version.copy}
          onChange={(v) => updateVersion({ copy: v })}
          multiline
          placeholder="Add description…"
          style={{
            color: "rgba(255,255,255,0.6)",
            fontSize: 10.5,
            fontWeight: 400,
            lineHeight: 1.5,
          }}
        />
      </div>

      <div
        className="rounded-[11px] p-3 flex flex-col gap-2"
        style={{ border: "1px solid rgba(255,255,255,0.1)" }}
      >
        <div style={{ color: "#808080", fontSize: 9, fontWeight: 400 }}>Notes</div>
        <EditableText
          value={version.notes}
          onChange={(v) => updateVersion({ notes: v })}
          multiline
          showPencil
          pencilColor="#808080"
          placeholder="Add review notes for this version…"
          style={{
            color: version.notes ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.55)",
            fontSize: 10.5,
            fontWeight: 400,
            lineHeight: 1.5,
            minHeight: 62,
          }}
        />
      </div>
    </div>
  );
}
