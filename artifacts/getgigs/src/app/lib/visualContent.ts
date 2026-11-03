import type { CSSProperties } from "react";

export type VisualTextKey = "welcome.title" | "welcome.description";
export type VisualTextStyle = {
  fontFamily: string;
  fontSize: number;
  color: string;
  align: "left" | "center" | "right";
  position: "start" | "center" | "end";
  spaceBefore: number;
};

export const VISUAL_STYLE_KEYS: Record<VisualTextKey, string> = {
  "welcome.title": "style.welcome.title",
  "welcome.description": "style.welcome.description",
};

export const DEFAULT_VISUAL_TEXT: Record<VisualTextKey, string> = {
  "welcome.title": "Find the right stage—or the right sound.",
  "welcome.description": "Artists build one booking-ready profile and discover compatible rooms. Venues, promoters, and organizers discover artists ready to play.",
};

export const DEFAULT_VISUAL_STYLES: Record<VisualTextKey, VisualTextStyle> = {
  "welcome.title": { fontFamily: "'Besley', serif", fontSize: 72, color: "#11100e", align: "left", position: "start", spaceBefore: 0 },
  "welcome.description": { fontFamily: "'Besley', serif", fontSize: 15, color: "#6f6e6b", align: "left", position: "start", spaceBefore: 22 },
};

const FONT_OPTIONS = ["'Besley', serif", "Inter, sans-serif", "system-ui, sans-serif"];
const ALIGN_OPTIONS = ["left", "center", "right"] as const;
const POSITION_OPTIONS = ["start", "center", "end"] as const;

export function parseVisualTextStyle(content: Record<string, string>, key: VisualTextKey): VisualTextStyle {
  const fallback = DEFAULT_VISUAL_STYLES[key];
  try {
    const value = JSON.parse(content[VISUAL_STYLE_KEYS[key]] || "{}") as Partial<VisualTextStyle>;
    return {
      fontFamily: FONT_OPTIONS.includes(String(value.fontFamily)) ? String(value.fontFamily) : fallback.fontFamily,
      fontSize: clamp(Number(value.fontSize), key === "welcome.title" ? 28 : 12, key === "welcome.title" ? 96 : 32, fallback.fontSize),
      color: /^#[0-9a-f]{6}$/i.test(String(value.color)) ? String(value.color) : fallback.color,
      align: ALIGN_OPTIONS.includes(value.align as VisualTextStyle["align"]) ? value.align as VisualTextStyle["align"] : fallback.align,
      position: POSITION_OPTIONS.includes(value.position as VisualTextStyle["position"]) ? value.position as VisualTextStyle["position"] : fallback.position,
      spaceBefore: clamp(Number(value.spaceBefore), 0, 64, fallback.spaceBefore),
    };
  } catch {
    return { ...fallback };
  }
}

export function visualTextCss(style: VisualTextStyle, key: VisualTextKey): CSSProperties {
  const isTitle = key === "welcome.title";
  return {
    width: "fit-content",
    maxWidth: isTitle ? "100%" : "440px",
    marginTop: style.spaceBefore,
    marginBottom: isTitle ? 0 : 22,
    marginLeft: style.position === "start" ? 0 : "auto",
    marginRight: style.position === "end" ? 0 : "auto",
    color: style.color,
    fontFamily: style.fontFamily,
    fontSize: `clamp(${isTitle ? Math.min(42, style.fontSize) : Math.min(12, style.fontSize)}px, ${isTitle ? 12 : 4}vw, ${style.fontSize}px)`,
    textAlign: style.align,
  };
}

function clamp(value: number, min: number, max: number, fallback: number) {
  return Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback;
}
