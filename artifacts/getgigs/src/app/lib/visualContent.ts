import type { CSSProperties } from "react";

export type VisualPageKey = "welcome" | "explore" | "saved" | "community" | "messages";
export type VisualTextKey =
  | "welcome.title" | "welcome.description"
  | "explore.title" | "explore.description"
  | "saved.title" | "saved.description"
  | "community.title" | "community.description"
  | "messages.eyebrow" | "messages.title" | "messages.description";

export type VisualTextStyle = {
  fontFamily: string;
  fontSize: number;
  color: string;
  align: "left" | "center" | "right";
  position: "start" | "center" | "end";
  spaceBefore: number;
  spaceAfter: number;
};

type VisualEntryDefinition = { key: VisualTextKey; label: string; defaultText: string; defaultStyle: VisualTextStyle };
export type VisualPageDefinition = { key: VisualPageKey; label: string; entries: VisualEntryDefinition[] };

const style = (fontFamily: string, fontSize: number, color: string, spaceBefore: number, spaceAfter = 0, align: VisualTextStyle["align"] = "left", position: VisualTextStyle["position"] = "start"): VisualTextStyle => ({ fontFamily, fontSize, color, align, position, spaceBefore, spaceAfter });
const BESLEY = "'Besley', serif";
const INTER = "Inter, sans-serif";

export const VISUAL_PAGES: VisualPageDefinition[] = [
  { key: "welcome", label: "Welcome", entries: [
    { key: "welcome.title", label: "Title", defaultText: "Find the right stage—or the right sound.", defaultStyle: style(BESLEY,72,"#11100e",0) },
    { key: "welcome.description", label: "Description", defaultText: "Artists build one booking-ready profile and discover compatible rooms. Venues, promoters, and organizers discover artists ready to play.", defaultStyle: style(BESLEY,15,"#6c6b67",22,22) },
  ]},
  { key: "explore", label: "Explore", entries: [
    { key: "explore.title", label: "Title", defaultText: "4 curated opportunities", defaultStyle: style(INTER,14,"#000000",0,10,"center","center") },
    { key: "explore.description", label: "Description", defaultText: "Boston + Cambridge · Fall 2026", defaultStyle: style(INTER,14,"#999999",0,0,"center","center") },
  ]},
  { key: "saved", label: "Saved", entries: [
    { key: "saved.title", label: "Title", defaultText: "Your saved opportunities", defaultStyle: style(INTER,17,"#000000",0) },
    { key: "saved.description", label: "Description", defaultText: "Gigs and venues you want to revisit", defaultStyle: style(INTER,12,"#808080",5) },
  ]},
  { key: "community", label: "Community", entries: [
    { key: "community.title", label: "Title", defaultText: "Artist Network", defaultStyle: style("'Nyght Serif', serif",42,"#11100e",9) },
    { key: "community.description", label: "Description", defaultText: "Discover published artists, find your musical and schedule fit, and message when the vibe feels right.", defaultStyle: style(INTER,11,"#7b7a77",14) },
  ]},
  { key: "messages", label: "Messages", entries: [
    { key: "messages.eyebrow", label: "Eyebrow", defaultText: "Direct booking conversations", defaultStyle: style(INTER,18,"#a77929",0) },
    { key: "messages.title", label: "Title", defaultText: "Messages", defaultStyle: style(BESLEY,34,"#11100e",7) },
    { key: "messages.description", label: "Description", defaultText: "Your conversations with venues, promoters, and organizers appear here after the first message is sent.", defaultStyle: style(INTER,10,"#808080",9) },
  ]},
];

const DEFINITIONS = Object.fromEntries(VISUAL_PAGES.flatMap(page=>page.entries.map(entry=>[entry.key,entry]))) as Record<VisualTextKey,VisualEntryDefinition>;
export const VISUAL_TEXT_KEYS = Object.keys(DEFINITIONS) as VisualTextKey[];
export const VISUAL_STYLE_KEYS = Object.fromEntries(VISUAL_TEXT_KEYS.map(key=>[key,`style.${key}`])) as Record<VisualTextKey,string>;
export const DEFAULT_VISUAL_TEXT = Object.fromEntries(VISUAL_TEXT_KEYS.map(key=>[key,DEFINITIONS[key].defaultText])) as Record<VisualTextKey,string>;
export const DEFAULT_VISUAL_STYLES = Object.fromEntries(VISUAL_TEXT_KEYS.map(key=>[key,DEFINITIONS[key].defaultStyle])) as Record<VisualTextKey,VisualTextStyle>;

const FONT_OPTIONS = [BESLEY, INTER, "'Nyght Serif', serif", "system-ui, sans-serif"];
const ALIGN_OPTIONS = ["left", "center", "right"] as const;
const POSITION_OPTIONS = ["start", "center", "end"] as const;

export function parseVisualTextStyle(content: Record<string,string>, key: VisualTextKey): VisualTextStyle {
  const fallback=DEFAULT_VISUAL_STYLES[key];
  try {
    const value=JSON.parse(content[VISUAL_STYLE_KEYS[key]]||"{}") as Partial<VisualTextStyle>;
    return {fontFamily:FONT_OPTIONS.includes(String(value.fontFamily))?String(value.fontFamily):fallback.fontFamily,fontSize:clamp(Number(value.fontSize),8,96,fallback.fontSize),color:/^#[0-9a-f]{6}$/i.test(String(value.color))?String(value.color):fallback.color,align:ALIGN_OPTIONS.includes(value.align as VisualTextStyle["align"])?value.align as VisualTextStyle["align"]:fallback.align,position:POSITION_OPTIONS.includes(value.position as VisualTextStyle["position"])?value.position as VisualTextStyle["position"]:fallback.position,spaceBefore:clamp(Number(value.spaceBefore),0,64,fallback.spaceBefore),spaceAfter:clamp(Number(value.spaceAfter),0,64,fallback.spaceAfter)};
  } catch { return {...fallback}; }
}

export function visualText(content:Record<string,string>,key:VisualTextKey){return content[key]||DEFAULT_VISUAL_TEXT[key];}

export function visualTextCss(styleValue:VisualTextStyle,key:VisualTextKey):CSSProperties {
  const hero=key==="welcome.title";
  return {width:"fit-content",maxWidth:"100%",marginTop:styleValue.spaceBefore,marginBottom:styleValue.spaceAfter,marginLeft:styleValue.position==="start"?0:"auto",marginRight:styleValue.position==="end"?0:"auto",color:styleValue.color,fontFamily:styleValue.fontFamily,fontSize:hero?`clamp(${Math.min(42,styleValue.fontSize)}px,12vw,${styleValue.fontSize}px)`:styleValue.fontSize,textAlign:styleValue.align,overflowWrap:"anywhere"};
}

export function visualProps(content:Record<string,string>,key:VisualTextKey){return {text:visualText(content,key),style:visualTextCss(parseVisualTextStyle(content,key),key)};}

function clamp(value:number,min:number,max:number,fallback:number){return Number.isFinite(value)?Math.min(max,Math.max(min,value)):fallback;}
