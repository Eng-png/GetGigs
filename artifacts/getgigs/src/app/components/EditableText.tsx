import { useEffect, useRef, useState } from "react";
import { Pencil } from "lucide-react";

type Props = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
  multiline?: boolean;
  showPencil?: boolean;
  pencilColor?: string;
};

export function EditableText({
  value,
  onChange,
  placeholder,
  className,
  style,
  multiline,
  showPencil,
  pencilColor = "#fff",
}: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (!editing) setDraft(value);
  }, [value, editing]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      if ("select" in inputRef.current) inputRef.current.select?.();
    }
  }, [editing]);

  const commit = () => {
    setEditing(false);
    onChange(draft);
  };

  if (editing) {
    const sharedProps = {
      ref: inputRef as any,
      value: draft,
      onChange: (e: any) => setDraft(e.target.value),
      onBlur: commit,
      onKeyDown: (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !multiline) {
          e.preventDefault();
          commit();
        }
        if (e.key === "Escape") {
          setDraft(value);
          setEditing(false);
        }
      },
      className: `bg-transparent outline-none border-0 p-0 m-0 w-full ${className ?? ""}`,
      style,
      placeholder,
    };
    return multiline ? (
      <textarea {...(sharedProps as any)} rows={3} />
    ) : (
      <input {...(sharedProps as any)} />
    );
  }

  const startEdit = () => setEditing(true);

  return (
    <button
      type="button"
      onClick={startEdit}
      onPointerUp={(e) => {
        if (e.pointerType === "touch") {
          e.preventDefault();
          startEdit();
        }
      }}
      className={`inline-flex items-center gap-2 ${className ?? ""}`}
      style={{
        background: "transparent",
        border: 0,
        padding: 0,
        margin: 0,
        font: "inherit",
        color: "inherit",
        textAlign: "left",
        cursor: "text",
        touchAction: "manipulation",
        WebkitTapHighlightColor: "transparent",
        width: "100%",
        ...style,
      }}
    >
      <span style={value ? undefined : { opacity: 0.4 }}>{value || placeholder}</span>
      {showPencil && <Pencil size={11} color={pencilColor} strokeWidth={1.5} />}
    </button>
  );
}
