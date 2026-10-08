import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { PhonePlaceholder } from "./PhonePlaceholder";
import { MobileMenuPanel } from "./MobileMenuPanel";
import Version1Screen from "./v1/Version1Screen";
import Version2Screen from "./v2/Version2Screen";
import Version3Screen from "./v3/Version3Screen";

type ScreenComponent = React.ComponentType<{ noScroll?: boolean }>;
const SCREENS: Record<string, ScreenComponent> = {
  v1: Version1Screen,
  v2: Version2Screen,
  v3: Version3Screen,
};
import type { Version } from "../App";

type Props = {
  versions: Version[];
  view: "intro" | "version";
  activeId: string | null;
  selectIntro: () => void;
  selectVersion: (id: string) => void;
  updateVersion: (id: string, patch: Partial<Version>) => void;
  goPrev: () => void;
  goNext: () => void;
  canPrev: boolean;
  canNext: boolean;
};

export function MobileWrapper(p: Props) {
  const active =
    p.versions.find((v) => v.id === p.activeId) ?? p.versions[0] ?? null;
  const introRef = useRef<HTMLDivElement | null>(null);
  const [pastIntro, setPastIntro] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const el = introRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setPastIntro(!entry.isIntersecting),
      { threshold: 0.05 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      className="w-full h-screen overflow-y-auto bg-black"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      {/* Section A — Intro (full viewport) */}
      <section
        ref={introRef}
        className="w-full flex flex-col items-center justify-between text-white px-6"
        style={{ height: "100vh", paddingTop: 80, paddingBottom: 40 }}
      >
        <div />
        <div
          className="flex flex-col items-center text-center"
          style={{ gap: 24, maxWidth: 360 }}
        >
          <h1
            style={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 400,
              fontSize: 22,
              color: "#fff",
              lineHeight: 1.25,
              margin: 0,
            }}
          >
            Three recommendation layouts
          </h1>
          <p
            style={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 400,
              fontSize: 14,
              color: "rgba(255,255,255,0.5)",
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            A remixable template for presenting recommendations three ways: one
            featured pick, a ranked list, or a single result with comparison.
            Skinned here as a travel app, but it works for any content you'd
            compare. Tab through and remix whichever fits.
          </p>
        </div>
        <div
          className="flex flex-col items-center"
          style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, gap: 6 }}
        >
          <span>Scroll to explore</span>
          <ChevronDown size={16} />
        </div>
      </section>

      {/* Section B — Version view (full viewport) */}
      <section
        className="w-full flex items-center justify-center bg-black"
        style={{ height: "100vh", padding: "70px 12px 24px" }}
      >
        {active && <MobilePhone versions={p.versions} activeId={active.id} />}
      </section>

      {/* Fixed top pill bar — only after intro leaves viewport */}
      {pastIntro && active && (
        <div
          className="fixed top-0 left-0 right-0 z-40 flex justify-center px-3 pt-3"
          style={{ pointerEvents: "none" }}
        >
          <div
            className="flex items-center justify-between w-full max-w-[402px] px-3 py-3"
            style={{
              background: "#000",
              borderRadius: "0 0 20px 20px",
              pointerEvents: "auto",
            }}
          >
            <PillNav
              direction="prev"
              disabled={!p.canPrev}
              onClick={p.goPrev}
            />
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              style={{
                background: "transparent",
                border: "none",
                color: "#fff",
                opacity: 0.7,
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              {active.label}
            </button>
            <PillNav
              direction="next"
              disabled={!p.canNext}
              onClick={p.goNext}
            />
          </div>
        </div>
      )}

      {menuOpen && (
        <MobileMenuPanel
          versions={p.versions}
          view={p.view}
          activeId={p.activeId}
          onSelectIntro={p.selectIntro}
          onSelectVersion={p.selectVersion}
          updateVersion={p.updateVersion}
          onClose={() => setMenuOpen(false)}
        />
      )}
    </div>
  );
}

function MobilePhone({
  versions,
  activeId,
}: {
  versions: Version[];
  activeId: string;
}) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const update = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      setScale(Math.min(1, w / 402, h / 874));
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
      ref={wrapRef}
      className="w-full h-full flex items-center justify-center"
    >
      <div
        style={{
          width: 402,
          height: 874,
          transform: `scale(${scale})`,
          transformOrigin: "center center",
          position: "relative",
        }}
      >
        {versions.map((v) => {
          const Screen = SCREENS[v.id];
          return (
            <div
              key={v.id}
              className="absolute inset-0 transition-opacity duration-200"
              style={{
                opacity: v.id === activeId ? 1 : 0,
                pointerEvents: v.id === activeId ? "auto" : "none",
              }}
            >
              <div
                style={{
                  width: 402,
                  height: 874,
                  borderRadius: 25,
                  overflow: "hidden",
                  background: "#fff",
                }}
              >
                {Screen ? <Screen /> : <PhonePlaceholder label={v.label} size="full" />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PillNav({
  direction,
  disabled,
  onClick,
}: {
  direction: "prev" | "next";
  disabled?: boolean;
  onClick?: () => void;
}) {
  const Icon = direction === "prev" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      style={{
        width: 50,
        height: 50,
        background: "#DDE04A",
        borderRadius: 6,
        opacity: disabled ? 0.3 : 1,
        cursor: disabled ? "default" : "pointer",
        border: "1px solid rgba(0,0,0,0.08)",
      }}
      className="flex items-center justify-center"
    >
      <Icon size={22} color="#000" strokeWidth={1.5} />
    </button>
  );
}
