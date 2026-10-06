import { createContext, useContext, useEffect, useRef, useState } from "react";
import {
  motion,
  useAnimationControls,
  useMotionValue,
  animate,
  type PanInfo,
  type Transition,
} from "motion/react";

const AnimCtx = createContext<{ instant: boolean }>({ instant: false });

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const h = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener?.("change", h);
    return () => mq.removeEventListener?.("change", h);
  }, []);
  return reduced;
}

function Rise({
  children,
  delay = 0,
  duration = 0.3,
  y = 12,
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  y?: number;
  style?: React.CSSProperties;
}) {
  const { instant } = useContext(AnimCtx);
  if (instant) {
    return <div style={style}>{children}</div>;
  }
  return (
    <motion.div
      style={style}
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration, ease: "easeOut", delay }}
    >
      {children}
    </motion.div>
  );
}

import filterSvgPaths from "../../../imports/FilterChip/svg-xz86t6phaz";
import saveSvgPaths from "../../../imports/SaveFunction/svg-s7ogyp1o73";
import screenSvgPaths from "../../../imports/ScreenBList/svg-u8gmrf747r";
import monogramSvgPaths from "../../../imports/Monogram/svg-5lv41bs5eu";
import listingsSvgPaths from "../../../imports/Listings/svg-g888rd46xa";

import { LISTINGS, type Listing, type PropertyType } from "./listings";

const FONT_STACK = "'Google Sans Flex', 'Google Sans', Inter, sans-serif";
const MENU_HEIGHT = 78;
const OLIVE = "#857e38";
const OLIVE_FAINT = "rgba(133,126,56,0.1)";
const CITRON = "#ddd864";
const CARD_BG = "#fdfaf6";

type FilterKey =
  | "all"
  | "Hotel"
  | "Villa"
  | "Resort"
  | "Camping"
  | "Cabin"
  | "House"
  | "Budget";

export default function Version2Screen({ noScroll = false }: { noScroll?: boolean } = {}) {
  const [filter, setFilter] = useState<FilterKey>("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const reduced = useReducedMotion();
  const instant = noScroll || reduced;

  const filtered = LISTINGS.filter((l) => {
    if (filter === "all") return true;
    if (filter === "Budget") return l.price === "$";
    return l.type === (filter as PropertyType);
  });

  const onSave = (id: string) => {
    setSavedIds((s) => new Set(s).add(id));
    setOpenId(null);
  };

  return (
    <AnimCtx.Provider value={{ instant }}>
      <div
        style={{
          width: 402,
          height: "100%",
          background: CARD_BG,
          position: "relative",
          overflow: "hidden",
          fontFamily: FONT_STACK,
        }}
      >
        <style>{`.yondr-scroll-v2::-webkit-scrollbar{display:none}.yondr-chip-scroll::-webkit-scrollbar{display:none}`}</style>

        <div
          className="yondr-scroll-v2"
          style={{
            position: "absolute",
            inset: 0,
            overflowY: noScroll ? "hidden" : "auto",
            overflowX: "hidden",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            paddingBottom: MENU_HEIGHT + 24,
          }}
          onClick={() => openId !== null && setOpenId(null)}
        >
          <StatusBar />
          <TopBar />
          <Header />
          <div style={{ height: 20 }} />
          <Rise delay={0.28} duration={0.3}>
            <FilterChipRow selected={filter} onSelect={setFilter} />
          </Rise>
          <div style={{ height: 16 }} />

          <div>
            {filtered.map((l, i) => (
              <Rise key={l.id} delay={0.36 + i * 0.05} duration={0.28}>
                <SwipeRow
                  listing={l}
                  open={openId === l.id}
                  onOpen={() => setOpenId(l.id)}
                  onClose={() => setOpenId((cur) => (cur === l.id ? null : cur))}
                  onSave={() => onSave(l.id)}
                  saved={savedIds.has(l.id)}
                />
                {i < filtered.length - 1 && (
                  <div
                    style={{
                      height: 1,
                      background: "rgba(0,0,0,0.06)",
                      margin: "0 20px",
                    }}
                  />
                )}
              </Rise>
            ))}
          </div>
        </div>

        <BottomMenu />
      </div>
    </AnimCtx.Provider>
  );
}

function StatusBar() {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 20,
      }}
    >
      <span style={{ fontFamily: FONT_STACK, fontSize: 11, color: "#000", letterSpacing: 0.05 }}>
        9:41
      </span>
      <div
        style={{
          width: 20,
          height: 12.5,
          border: "1.25px solid #000",
          borderRadius: 7.5,
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 10,
            height: 5,
            background: "#000",
            borderRadius: 7.5,
          }}
        />
      </div>
    </div>
  );
}

function TopBar() {
  return (
    <div
      style={{
        position: "absolute",
        top: 77,
        left: 20,
        width: 362,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        color: "#000",
      }}
    >
      <span
        style={{
          fontFamily: "'Outfit', sans-serif",
          fontWeight: 500,
          fontSize: 14,
          letterSpacing: "-1.26px",
        }}
      >
        ←
      </span>
      <div
        style={{
          fontFamily: "'Besley', serif",
          fontSize: 19.17,
          letterSpacing: "-1.15px",
        }}
      >
        <span style={{ letterSpacing: "-1.92px" }}>Y</span>
        <span>on</span>
        <span style={{ letterSpacing: "-0.48px" }}>d</span>
        <span>r</span>
      </div>
    </div>
  );
}

function YMark() {
  // Exact monogram artwork from /src/imports/Monogram — native 23 × 30.307
  return (
    <div
      style={{
        width: 23,
        height: 30.307,
        border: "1.198px solid rgba(0,0,0,0.5)",
        borderRadius: 17.969,
        boxSizing: "border-box",
        overflow: "hidden",
        position: "relative",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "31.62%",
          right: "24.11%",
          bottom: "31.63%",
          left: "24.1%",
          transform: "rotate(180deg)",
        }}
      >
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 11.912 11.1363"
          preserveAspectRatio="xMidYMid meet"
          fill="none"
        >
          <path d={monogramSvgPaths.p1ac2f840} fill="#000" fillOpacity={0.5} />
        </svg>
      </div>
    </div>
  );
}

function Header() {
  return (
    <div
      style={{
        marginTop: 133,
        padding: "0 20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 10,
        color: "#000",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <YMark />
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Rise delay={0.1} duration={0.3}>
            <p
              style={{
                margin: 0,
                fontFamily: FONT_STACK,
                fontWeight: 400,
                fontSize: 16,
                lineHeight: 1.2,
                color: "#000",
              }}
            >
              Your <span style={{ color: "rgba(0,0,0,0.4)" }}>twelve</span> curated picks
            </p>
          </Rise>
          <Rise delay={0.16} duration={0.3}>
            <p
              style={{
                margin: 0,
                fontFamily: FONT_STACK,
                fontWeight: 300,
                fontSize: 13,
                lineHeight: 1.2,
                color: "rgba(0,0,0,0.6)",
              }}
            >
              Based on your trip preferences
            </p>
          </Rise>
        </div>
      </div>
      <Rise delay={0.22} duration={0.3}>
        <p
          style={{
            margin: 0,
            fontFamily: FONT_STACK,
            fontWeight: 300,
            fontSize: 12,
            color: "rgba(0,0,0,0.4)",
            lineHeight: 1.2,
          }}
        >
          Barcelona · Jun 15-22 · 2 guests
        </p>
      </Rise>
    </div>
  );
}

/* ---------------- FILTER CHIP ROW ---------------- */

type ChipDef = {
  key: FilterKey;
  label: string;
  icon: (color: string) => React.ReactNode;
  smaller?: boolean;
};

const CHIPS: ChipDef[] = [
  {
    key: "all",
    label: "All options",
    icon: (color) => (
      <div style={{ position: "relative", width: 9.7, height: 9.7 }}>
        {[
          [0, 0],
          [0, 5.31],
          [5.31, 0],
          [5.31, 5.31],
        ].map(([l, t], i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: l,
              top: t,
              width: 4.687,
              height: 4.687,
              borderRadius: 0.528,
              background: color,
            }}
          />
        ))}
      </div>
    ),
  },
  {
    key: "Hotel",
    label: "Hotel",
    icon: (color) => (
      <svg width={9.047} height={10} viewBox="0 0 9.04688 10">
        <path d={filterSvgPaths.p3b464800} fill={color} />
      </svg>
    ),
  },
  {
    key: "Villa",
    label: "Villa",
    icon: (color) => (
      <svg width={11.992} height={10} viewBox="0 0 11.9915 10">
        <g>
          <rect fill={color} height="1.26349" rx="0.631745" width="9.68547" x="1.1557" y="8.73651" />
          <rect fill={color} height="1.207" rx="0.603502" transform="rotate(90 3.38165 2.41731)" width="7.04179" x="3.38165" y="2.41731" />
          <rect fill={color} height="1.207" rx="0.603502" transform="rotate(90 6.60156 2.41731)" width="7.04179" x="6.60156" y="2.41731" />
          <rect fill={color} height="1.207" rx="0.603502" transform="rotate(90 9.8172 2.41731)" width="7.04179" x="9.8172" y="2.41731" />
          <path d={filterSvgPaths.p1b279500} fill={color} />
        </g>
      </svg>
    ),
  },
  {
    key: "Resort",
    label: "Resort",
    icon: (color) => (
      <svg width={8.632} height={10.002} viewBox="0 0 8.63186 10.0026">
        <path d={filterSvgPaths.pbe64d00} fill={color} />
      </svg>
    ),
  },
  {
    key: "Camping",
    label: "Camping",
    icon: (color) => (
      <svg width={10.44} height={10.387} viewBox="0 0 10.4395 10.3866">
        <path d={filterSvgPaths.p39b11000} fill={color} />
      </svg>
    ),
    smaller: true,
  },
  {
    key: "Cabin",
    label: "Cabin",
    icon: (color) => (
      <svg width={12.089} height={10} viewBox="0 0 12.0888 10.0002">
        <g>
          <rect fill={color} height="1.16235" rx="0.581175" width="9.76401" x="1.16516" y="8.83765" />
          <rect fill={color} height="1.16235" rx="0.581175" width="9.76401" x="1.16516" y="6.74298" />
          <rect fill={color} height="1.16235" rx="0.581175" width="9.76401" x="1.16516" y="4.65319" />
          <path d={filterSvgPaths.p1a6a6900} fill={color} />
        </g>
      </svg>
    ),
    smaller: true,
  },
  {
    key: "House",
    label: "House",
    icon: (color) => (
      <svg width={9.6} height={10.038} viewBox="0 0 9.60036 10.0379">
        <path d={filterSvgPaths.p3608f400} fill={color} />
      </svg>
    ),
    smaller: true,
  },
  {
    key: "Budget",
    label: "Budget",
    icon: (color) => (
      <svg width={10.008} height={10} viewBox="0 0 10.0078 10">
        <path d={filterSvgPaths.p3e1a2b00} fill={color} />
      </svg>
    ),
    smaller: true,
  },
];

function FilterChipRow({
  selected,
  onSelect,
}: {
  selected: FilterKey;
  onSelect: (k: FilterKey) => void;
}) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const stateRef = useRef({
    dragging: false,
    moved: 0,
    startX: 0,
    startScroll: 0,
    lastX: 0,
    lastT: 0,
    v: 0,
    pointerId: -1,
  });
  const momentumRef = useRef<number | null>(null);

  const stopMomentum = () => {
    if (momentumRef.current !== null) {
      cancelAnimationFrame(momentumRef.current);
      momentumRef.current = null;
    }
  };

  const onPointerDown = (e: React.PointerEvent) => {
    stopMomentum();
    const el = scrollRef.current!;
    const s = stateRef.current;
    s.dragging = true;
    s.moved = 0;
    s.startX = e.clientX;
    s.startScroll = el.scrollLeft;
    s.lastX = e.clientX;
    s.lastT = performance.now();
    s.v = 0;
    s.pointerId = e.pointerId;
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const s = stateRef.current;
    if (!s.dragging) return;
    const dx = e.clientX - s.startX;
    s.moved = Math.max(s.moved, Math.abs(dx));
    scrollRef.current!.scrollLeft = s.startScroll - dx;
    const now = performance.now();
    const dt = now - s.lastT;
    if (dt > 0) s.v = -(e.clientX - s.lastX) / dt; // px per ms
    s.lastX = e.clientX;
    s.lastT = now;
  };

  const onPointerUp = (e: React.PointerEvent) => {
    const s = stateRef.current;
    if (!s.dragging) return;
    s.dragging = false;
    try {
      (e.target as Element).releasePointerCapture?.(e.pointerId);
    } catch {}

    // Tap (very small movement) — let click on chip handle selection.
    if (s.moved < 6) return;

    // Momentum scroll
    let v = s.v * 16; // ~ per frame
    const el = scrollRef.current!;
    const step = () => {
      if (Math.abs(v) < 0.4) {
        momentumRef.current = null;
        return;
      }
      el.scrollLeft += v;
      v *= 0.93;
      momentumRef.current = requestAnimationFrame(step);
    };
    momentumRef.current = requestAnimationFrame(step);
  };

  useEffect(() => () => stopMomentum(), []);

  return (
    <div
      ref={scrollRef}
      className="yondr-chip-scroll"
      style={{
        overflowX: "auto",
        overflowY: "hidden",
        scrollbarWidth: "none",
        msOverflowStyle: "none",
        padding: "0 20px",
        cursor: "grab",
        WebkitOverflowScrolling: "touch",
        touchAction: "pan-x",
        userSelect: "none",
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "nowrap",
          gap: 5.678,
          width: "max-content",
        }}
      >
        {CHIPS.map((c) => {
          const active = selected === c.key;
          const bg = active ? OLIVE : OLIVE_FAINT;
          const color = active ? CARD_BG : "#000";
          const pad = c.smaller ? "4.755px 6.627px" : "6px 8px";
          return (
            <button
              key={c.key}
              onClick={(e) => {
                // Only fire if not a drag
                if (stateRef.current.moved < 6) onSelect(c.key);
                else e.preventDefault();
              }}
              style={{
                background: bg,
                border: "none",
                padding: pad,
                borderRadius: 82.838,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 2.057,
                cursor: "pointer",
                whiteSpace: "nowrap",
                fontFamily: FONT_STACK,
                fontWeight: 300,
                fontSize: 12,
                color,
                letterSpacing: "-0.12px",
                lineHeight: 1.2,
              }}
            >
              {c.icon(color)}
              <span>{c.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- LISTING / SWIPE ROW ---------------- */

const SAVE_REVEAL = 80;
const SAVE_THRESHOLD = 40;

function SwipeRow({
  listing,
  open,
  onOpen,
  onClose,
  onSave,
  saved,
}: {
  listing: Listing;
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  onSave: () => void;
  saved: boolean;
}) {
  const { instant } = useContext(AnimCtx);
  const x = useMotionValue(0);
  const heartCtrls = useAnimationControls();
  const pillCtrls = useAnimationControls();

  const snapSpring: Transition = instant
    ? { duration: 0 }
    : { type: "spring", stiffness: 380, damping: 28, bounce: 0.18 };

  useEffect(() => {
    animate(x, open ? -SAVE_REVEAL : 0, snapSpring);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const onDragEnd = (_: any, info: PanInfo) => {
    const final = x.get() + info.velocity.x * 0.05;
    if (final < -SAVE_THRESHOLD) onOpen();
    else onClose();
  };

  const handleSave = () => {
    if (!instant) {
      heartCtrls.start({ scale: [1, 1.35, 1] }, { duration: 0.28, ease: "easeOut" });
      pillCtrls.start(
        { scale: [1, 1.06, 1], backgroundColor: [CITRON, "#fff7a8", CITRON] },
        { duration: 0.35, ease: "easeOut" }
      );
    }
    onSave();
  };

  return (
    <div
      style={{
        position: "relative",
        width: 402,
        background: CARD_BG,
        overflow: "hidden",
      }}
    >
      {/* Foreground: draggable listing. Save button is a child positioned at
          left:100% of this layer — beyond the right edge — so the parent's
          overflow:hidden clips it entirely at rest. Dragging the motion.div
          left exposes it from the right. */}
      <motion.div
        style={{
          x,
          width: "100%",
          background: CARD_BG,
          position: "relative",
          touchAction: "pan-y",
        }}
        drag="x"
        dragConstraints={{ left: -SAVE_REVEAL, right: 0 }}
        dragElastic={0.05}
        onDragEnd={onDragEnd}
        onClick={(e) => {
          if (open) {
            e.stopPropagation();
            onClose();
          }
        }}
      >
        <ListingRow listing={listing} pillCtrls={pillCtrls} />

        <div
          style={{
            position: "absolute",
            left: "100%",
            top: 0,
            bottom: 0,
            width: SAVE_REVEAL,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: open ? "auto" : "none",
          }}
        >
          <div
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              handleSave();
            }}
            style={{
              background: OLIVE,
              width: 63.537,
              height: 67.117,
              borderRadius: 4.474,
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
            aria-label="Save"
          >
            <motion.svg
              animate={heartCtrls}
              width={10.533}
              height={8.579}
              viewBox="0 0 10.0772 8.65084"
              style={{ display: "block" }}
            >
              <path
                d={saveSvgPaths.p188a9d00}
                fill="#fff"
                stroke="#fff"
                strokeWidth="0.907849"
              />
            </motion.svg>
            <span
              style={{
                fontFamily: FONT_STACK,
                fontWeight: 400,
                fontSize: 11,
                color: "#fff",
                lineHeight: 1.2,
              }}
            >
              {saved ? "Saved" : "Save"}
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function ListingRow({
  listing,
  pillCtrls,
}: {
  listing: Listing;
  pillCtrls?: ReturnType<typeof useAnimationControls>;
}) {
  return (
    <div
      style={{
        background: CARD_BG,
        display: "flex",
        gap: 15,
        padding: "20px 15.46px",
        alignItems: "flex-start",
      }}
    >
      <div
        style={{
          width: 89.629,
          height: 82.09,
          borderRadius: 6.701,
          flexShrink: 0,
          background: `url(${listing.image}) center/cover no-repeat`,
          overflow: "hidden",
        }}
      />
      <div style={{ flex: 1, minWidth: 0, display: "flex", justifyContent: "space-between", gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
          <p
            style={{
              margin: 0,
              fontFamily: "'Besley', serif",
              fontSize: 14,
              color: "#000",
              lineHeight: 1.2,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {listing.name}
          </p>
          <div style={{ height: 4 }} />
          <SpecBlock listing={listing} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 5.608 }}>
          <motion.div
            animate={pillCtrls}
            style={{
              background: CITRON,
              padding: "6px 8px",
              borderRadius: 74.26,
              fontFamily: FONT_STACK,
              fontWeight: 300,
              fontSize: 12,
              color: "#000",
              whiteSpace: "nowrap",
              lineHeight: 1.2,
            }}
          >
            {listing.match}% Match
          </motion.div>
          <div style={{ display: "flex", alignItems: "center", gap: 3.505 }}>
            <svg width={7.931} height={7.931} viewBox="0 0 7.54262 7.17346">
              <path d={saveSvgPaths.p2392bf00} fill="#000" fillOpacity={0.6} />
            </svg>
            <span
              style={{
                fontFamily: FONT_STACK,
                fontWeight: 300,
                fontSize: 12,
                color: "#000",
                letterSpacing: 0.48,
                lineHeight: 1.2,
              }}
            >
              {listing.rating.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function TypeIcon({ type }: { type: PropertyType }) {
  switch (type) {
    case "House":
      return (
        <svg width={8.172} height={9.406} viewBox="0 0 8.17188 9.40606">
          <path d={listingsSvgPaths.p338a1c80} fill="#000" />
        </svg>
      );
    case "Villa":
      return (
        <svg width={11.284} height={9.41} viewBox="0 0 11.284 9.41">
          <g>
            <rect fill="#000" height="1.18894" rx="0.594468" width="9.11403" x="1.08803" y="8.22095" />
            <rect fill="#000" height="1.13579" rx="0.567895" transform="rotate(90 3.18139 2.27472)" width="6.62629" x="3.18139" y="2.27472" />
            <rect fill="#000" height="1.13579" rx="0.567895" transform="rotate(90 6.21207 2.27472)" width="6.62629" x="6.21207" y="2.27472" />
            <rect fill="#000" height="1.13579" rx="0.567895" transform="rotate(90 9.23724 2.27472)" width="6.62629" x="9.23724" y="2.27472" />
            <path d={listingsSvgPaths.p2a1a8200} fill="#000" />
          </g>
        </svg>
      );
    case "Hotel":
      return (
        <svg width={8.513} height={9.409} viewBox="0 0 8.513 9.409">
          <path d={listingsSvgPaths.pe60df00} fill="#000" />
        </svg>
      );
    case "Resort":
      return (
        <svg width={8.632} height={10.002} viewBox="0 0 8.63186 10.0026">
          <path d={filterSvgPaths.pbe64d00} fill="#000" />
        </svg>
      );
    case "Camping":
      return (
        <svg width={9.398} height={9.35} viewBox="0 0 9.39758 9.35049">
          <path d={listingsSvgPaths.pa1bee00} fill="#000" />
        </svg>
      );
    case "Cabin":
      return (
        <svg width={11.376} height={9.41} viewBox="0 0 11.3755 9.41">
          <g>
            <rect fill="#000" height="1.09377" rx="0.546886" width="9.18794" x="1.09722" y="8.31623" />
            <rect fill="#000" height="1.09377" rx="0.546886" width="9.18794" x="1.09722" y="6.34509" />
            <rect fill="#000" height="1.09377" rx="0.546886" width="9.18794" x="1.09722" y="4.37866" />
            <path d={listingsSvgPaths.p3b62a700} fill="#000" />
          </g>
        </svg>
      );
  }
}

function SpecBlock({ listing }: { listing: Listing }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-start" }}>
      <SpecRow icon={<TypeIcon type={listing.type} />} label={listing.type} />
      <SpecRow
        icon={
          <svg width={11.758} height={9.202} viewBox="0 0 12.4345 9.80509">
            <g>
              <path d={saveSvgPaths.p65c4180} fill="#000" stroke="#000" strokeWidth="0.15072" />
              <ellipse cx="8.74162" cy="1.95936" rx="1.95936" ry="1.95936" fill="#000" />
              <path d={saveSvgPaths.p75a3780} fill="#000" stroke="#FDFAF6" strokeWidth="0.602881" />
              <ellipse cx="4.22329" cy="3.17762" rx="1.95936" ry="1.95936" fill="#000" />
            </g>
          </svg>
        }
        label={`Guests ${listing.guests}`}
      />
      <SpecRow
        icon={
          <svg width={9.591} height={9.602} viewBox="0 0 9.59065 9.60168">
            <path d={saveSvgPaths.p2c31bef1} fill="#000" />
          </svg>
        }
        label={`Price ${listing.price}`}
      />
    </div>
  );
}

function SpecRow({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
      <div style={{ width: 12, display: "flex", justifyContent: "flex-start" }}>{icon}</div>
      <span
        style={{
          fontFamily: FONT_STACK,
          fontWeight: 300,
          fontSize: 12,
          color: "#000",
          lineHeight: 1.2,
          letterSpacing: 0.12,
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </span>
    </div>
  );
}

/* ---------------- BOTTOM MENU ---------------- */

function BottomMenu() {
  const Item = ({
    label,
    icon,
    active,
  }: {
    label: string;
    icon: React.ReactNode;
    active?: boolean;
  }) => (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, width: 75 }}>
      {icon}
      <span
        style={{
          fontFamily: FONT_STACK,
          fontWeight: 300,
          fontSize: 12,
          color: active ? "#000" : "rgba(0,0,0,0.15)",
          lineHeight: 1.2,
        }}
      >
        {label}
      </span>
    </div>
  );

  // Use the same shapes as V1 — exact icons are similar across the menu set
  const exploreIcon = (
    <svg width={12.7} height={12.7} viewBox="0 0 12.6934 12.6934">
      <path d={screenSvgPaths.p3d6f9a00 ?? ""} fill="#000" />
      <path d={screenSvgPaths.p23379e60 ?? ""} fill="#000" />
      <path d={screenSvgPaths.pd398f00 ?? ""} fill="#000" />
    </svg>
  );
  const savedIcon = (
    <svg width={12.7} height={12.7} viewBox="0 0 12.6934 12.6934">
      <path d={screenSvgPaths.p3d8cec80 ?? ""} fill="#000" fillOpacity={0.15} />
    </svg>
  );
  const tripsIcon = (
    <svg width={12.7} height={12.7} viewBox="0 0 12.6934 12.6934">
      <path d={screenSvgPaths.p26832580 ?? ""} fill="#000" fillOpacity={0.15} />
      <path d={screenSvgPaths.p14358580 ?? ""} fill="#000" fillOpacity={0.15} />
    </svg>
  );
  const profileIcon = (
    <svg width={12.7} height={12.7} viewBox="0 0 12.6934 12.6934">
      <path d={screenSvgPaths.p1bfc73c0 ?? ""} fill="#000" fillOpacity={0.15} />
      <path d={screenSvgPaths.p2a2d7c00 ?? ""} fill="#000" fillOpacity={0.15} />
    </svg>
  );

  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        background: CARD_BG,
        borderRadius: "20px 20px 0 0",
        boxShadow: "0 0 30px rgba(0,0,0,0.11)",
        display: "flex",
        justifyContent: "space-between",
        padding: "17px 34px",
      }}
    >
      <Item active label="Explore" icon={exploreIcon} />
      <Item label="Saved" icon={savedIcon} />
      <Item label="Trips" icon={tripsIcon} />
      <Item label="Profile" icon={profileIcon} />
    </div>
  );
}
