import { useEffect, useRef, useState } from "react";
import { TopTabs } from "./TopTabs";
import { PhonePlaceholder } from "./PhonePlaceholder";
import Version1Screen from "./v1/Version1Screen";
import Version2Screen from "./v2/Version2Screen";
import Version3Screen from "./v3/Version3Screen";

type ScreenComponent = React.ComponentType<{ noScroll?: boolean }>;
const SCREENS: Record<string, ScreenComponent> = {
  v1: Version1Screen,
  v2: Version2Screen,
  v3: Version3Screen,
};
import { NavButton } from "./NavButton";
import { VoteButtons } from "./VoteButtons";
import { SidePanel } from "./SidePanel";
import type { Version } from "../App";

type Props = {
  versions: Version[];
  view: "intro" | "version";
  activeId: string | null;
  projectTitle: string;
  setProjectTitle: (v: string) => void;
  selectIntro: () => void;
  selectVersion: (id: string) => void;
  addVersion: () => void;
  renameVersion: (id: string, label: string) => void;
  duplicateVersion: (id: string) => void;
  deleteVersion: (id: string) => void;
  updateVersion: (id: string, patch: Partial<Version>) => void;
  goPrev: () => void;
  goNext: () => void;
  canPrev: boolean;
  canNext: boolean;
};

const CANVAS_W = 1370;
const CANVAS_H = 997;
const TAB_H = 47;
const ARROW_SIZE = 88;
const EDGE_MARGIN = 24;
const ARROW_RESERVE = ARROW_SIZE + EDGE_MARGIN; // 112

export function DesktopWrapper(p: Props) {
  const active = p.versions.find((v) => v.id === p.activeId) ?? null;

  return (
    <div
      className="w-full h-full relative overflow-hidden"
      style={{ background: "#000", fontFamily: "Inter, sans-serif" }}
    >
      {/* Top tab row — flush top, full width */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0 }}>
        <TopTabs
          versions={p.versions}
          view={p.view}
          activeId={p.activeId}
          onSelectIntro={p.selectIntro}
          onSelectVersion={p.selectVersion}
          onAdd={p.addVersion}
          onRename={p.renameVersion}
        />
      </div>

      {/* Main content fills the area between tabs and bottom */}
      <main
        style={{
          position: "absolute",
          top: TAB_H,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      >
        {p.view === "intro" ? (
          <IntroLayer versions={p.versions} onPick={p.selectVersion} />
        ) : (
          active && (
            <VersionLayer
              versions={p.versions}
              activeId={active.id}
              version={active}
              projectTitle={p.projectTitle}
              setProjectTitle={p.setProjectTitle}
              updateVersion={(patch) => p.updateVersion(active.id, patch)}
            />
          )
        )}
      </main>

      {/* Top-corner arrows — anchored just below the tab row */}
      <div
        style={{
          position: "absolute",
          left: EDGE_MARGIN,
          top: TAB_H + EDGE_MARGIN,
          zIndex: 10,
        }}
      >
        <NavButton direction="prev" disabled={!p.canPrev} onClick={p.goPrev} />
      </div>
      <div
        style={{
          position: "absolute",
          right: EDGE_MARGIN,
          top: TAB_H + EDGE_MARGIN,
          zIndex: 10,
        }}
      >
        <NavButton direction="next" disabled={!p.canNext} onClick={p.goNext} />
      </div>
    </div>
  );
}

function IntroLayer({
  versions,
  onPick,
}: {
  versions: Version[];
  onPick: (id: string) => void;
}) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Intro text — fixed top padding, constant size */}
      <div
        style={{
          flex: "0 0 auto",
          paddingTop: 64,
          paddingBottom: 32,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 528,
            maxWidth: "90%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 28,
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 400,
              fontSize: 20,
              color: "#fff",
              lineHeight: "26px",
            }}
          >Three recommended layouts</div>
          <div
            style={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 400,
              fontSize: 14,
              color: "rgba(255,255,255,0.5)",
              lineHeight: "23.8px",
            }}
          >This is a remixable template for presenting recommendations three ways: one featured pick, a ranked list, or a single result with comparison. Skinned here as a travel app, but it works for any content you'd compare. Tab through and remix whichever fits.</div>
        </div>
      </div>

      {/* Phones row — fills remaining vertical space, scales to fit */}
      <div
        style={{
          flex: "1 1 0",
          minHeight: 0,
          paddingBottom: ARROW_RESERVE,
          paddingLeft: ARROW_RESERVE,
          paddingRight: ARROW_RESERVE,
        }}
      >
        <PhonesRow versions={versions} onPick={onPick} />
      </div>
    </div>
  );
}

function PhonesRow({
  versions,
  onPick,
}: {
  versions: Version[];
  onPick: (id: string) => void;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(0);
  const gap = 24;
  const labelH = 24; // reserved height for "Version N · Subtitle" label
  const labelGap = 10;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      const slotW = (w - gap * 2) / 3;
      const availH = h - labelH - labelGap;
      const s = Math.min(availH / 874, slotW / 402, 1);
      setScale(s > 0 ? s : 0);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  const phoneW = 402 * scale;
  const phoneH = 874 * scale;

  return (
    <div
      ref={ref}
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap,
      }}
    >
      {versions.slice(0, 3).map((v, i) => (
        <div
          key={v.id}
          role="button"
          tabIndex={0}
          onClick={() => onPick(v.id)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") onPick(v.id);
          }}
          style={{
            background: "transparent",
            border: "none",
            padding: 0,
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: labelGap,
          }}
        >
          <div
            style={{
              height: labelH,
              display: "flex",
              alignItems: "center",
              gap: 5,
              fontSize: 12,
              fontWeight: 500,
              fontFamily: "Inter, sans-serif",
              lineHeight: 1.2,
            }}
          >
            <span style={{ color: "rgba(255,255,255,0.4)" }}>
              Version {i + 1}
            </span>
            <span style={{ color: "#fff" }}>{v.subtitle || v.label}</span>
          </div>
          <div
            style={{
              width: phoneW,
              height: phoneH,
              position: "relative",
              overflow: "hidden",
              borderRadius: 25 * scale,
              background: "#fff",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: 402,
                height: 874,
                transform: `scale(${scale})`,
                transformOrigin: "top left",
              }}
            >
              {SCREENS[v.id] ? (
                (() => {
                  const Screen = SCREENS[v.id];
                  return <Screen noScroll />;
                })()
              ) : (
                <PhonePlaceholder label={v.label} size="full" />
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function VersionLayer({
  versions,
  activeId,
  version,
  projectTitle,
  setProjectTitle,
  updateVersion,
}: {
  versions: Version[];
  activeId: string;
  version: Version;
  projectTitle: string;
  setProjectTitle: (v: string) => void;
  updateVersion: (patch: Partial<Version>) => void;
}) {
  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {/* Side panel — left edge, vertically centered. z-index above PhoneStage so its EditableText buttons receive clicks. */}
      <div
        style={{
          position: "absolute",
          left: EDGE_MARGIN,
          top: "50%",
          transform: "translateY(-50%)",
          width: 287,
          zIndex: 5,
        }}
      >
        <SidePanel
          projectTitle={projectTitle}
          setProjectTitle={setProjectTitle}
          version={version}
          updateVersion={updateVersion}
        />
      </div>

      {/* Phone — centered */}
      <PhoneStage versions={versions} activeId={activeId} />

      {/* Vote stack — right edge, vertically centered */}
      <div
        style={{
          position: "absolute",
          right: EDGE_MARGIN,
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 5,
        }}
      >
        <VoteButtons
          vote={version.vote}
          up={version.up}
          down={version.down}
          onVote={(dir) => {
            const current = version.vote;
            let { up, down } = version;
            if (current === "up") up = Math.max(0, up - 1);
            if (current === "down") down = Math.max(0, down - 1);
            let next: "up" | "down" | null = dir;
            if (current === dir) {
              next = null;
            } else if (dir === "up") {
              up += 1;
            } else {
              down += 1;
            }
            updateVersion({ up, down, vote: next });
          }}
        />
      </div>
    </div>
  );
}

const SCREEN_W = 402;
const SCREEN_H = 874;
const SCREEN_RADIUS = 25;

function PhoneStage({
  versions,
  activeId,
}: {
  versions: Version[];
  activeId: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const h = el.clientHeight;
      const w = el.clientWidth;
      const s = Math.min(1, (h - 32) / SCREEN_H, (w - 32) / SCREEN_W);
      setScale(s > 0 ? s : 0);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div
      ref={ref}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
      }}
    >
      {versions.map((v) => {
        const Screen = SCREENS[v.id];
        return (
          <div
            key={v.id}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: SCREEN_W,
              height: SCREEN_H,
              transform: `translate(-50%, -50%) scale(${scale})`,
              transformOrigin: "center center",
              borderRadius: SCREEN_RADIUS,
              overflow: "hidden",
              background: "#fff",
              opacity: v.id === activeId ? 1 : 0,
              pointerEvents: v.id === activeId ? "auto" : "none",
              transition: "opacity 200ms",
            }}
          >
            {Screen ? <Screen /> : <PhonePlaceholder label={v.label} size="screen" />}
          </div>
        );
      })}
    </div>
  );
}
