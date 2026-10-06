import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useAnimationControls } from "motion/react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const AnimCtx = createContext<{ instant: boolean }>({ instant: false });

function useInstant() {
  return useContext(AnimCtx).instant;
}

function Rise({
  delay = 0,
  duration = 0.3,
  y = 12,
  children,
  style,
}: {
  delay?: number;
  duration?: number;
  y?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  const instant = useInstant();
  if (instant) return <div style={style}>{children}</div>;
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

function MotionDivider({
  delay = 0,
  style,
}: {
  delay?: number;
  style: React.CSSProperties;
}) {
  const instant = useInstant();
  if (instant) return <div style={style} />;
  return (
    <motion.div
      style={{ ...style, transformOrigin: "left center" }}
      initial={{ scaleX: 0 }}
      animate={{ scaleX: 1 }}
      transition={{ duration: 0.3, ease: "easeOut", delay }}
    />
  );
}

import svgPaths from "../../../imports/ScreenAGallery/svg-hdvfxiy51l";

import deck1 from "../../../imports/deck-1.png";
import deck2 from "../../../imports/deck-2.png";
import deck3 from "../../../imports/deck-3.png";
import deck4 from "../../../imports/deck-4.png";

import { LISTINGS as CANONICAL_LISTINGS } from "../v2/listings";

const DECK_IMAGES = [deck1, deck2, deck3, deck4];

const FONT_STACK = "'Google Sans Flex', 'Google Sans', Inter, sans-serif";
const MENU_HEIGHT = 78;

// San Francisco coordinates by listing id — added on top of the canonical
// listing data shared with V2 so map markers can plot.
const COORDS: Record<string, [number, number]> = {
  oasis:      [37.7849, -122.4094],
  cozy:       [37.7649, -122.4294],
  garden:     [37.7942, -122.4194],
  coastal:    [37.7705, -122.4470],
  wilderness: [37.7990, -122.4660],
  seaside:    [37.8090, -122.4140],
  urban:      [37.7849, -122.4350],
  ocean:      [37.7580, -122.4080],
  tiny:       [37.7670, -122.4520],
  bunk:       [37.7780, -122.3970],
  mountain:   [37.7910, -122.4555],
  grand:      [37.7610, -122.4250],
};

type Listing = (typeof CANONICAL_LISTINGS)[number] & { coord: [number, number] };

const LISTINGS: Listing[] = CANONICAL_LISTINGS.map((l) => ({
  ...l,
  coord: COORDS[l.id] ?? [37.7785, -122.4194],
}));

const ACCENT = "#bd8e3c";
const PIN_SELECTED = "#ddd864";
const PIN_BORDER = "#857e38";

export default function Version1Screen({ noScroll = false }: { noScroll?: boolean } = {}) {
  const [view, setView] = useState<"gallery" | "map">("gallery");
  const [deckIdx, setDeckIdx] = useState(0);
  const [visibleCount, setVisibleCount] = useState(4); // grid items visible (excludes featured)
  const [selectedId, setSelectedId] = useState<string>("oasis");

  const reducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const ctx = useMemo(() => ({ instant: noScroll || reducedMotion }), [noScroll, reducedMotion]);

  return (
    <AnimCtx.Provider value={ctx}>
      <div
        style={{
          width: 402,
          height: "100%",
          background: "#fdfaf6",
          position: "relative",
          overflow: "hidden",
          fontFamily: FONT_STACK,
        }}
      >
        <style>{`.yondr-scroll::-webkit-scrollbar{display:none}`}</style>

        <div
          className="yondr-scroll"
          style={{
            position: "absolute",
            inset: 0,
            overflowY: noScroll ? "hidden" : "auto",
            overflowX: "hidden",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            paddingBottom: MENU_HEIGHT + 24,
          }}
        >
          <StatusBar />
          <TopBar />
          <Header />
          <div style={{ height: 18 }} />
          <Rise delay={0.27} duration={0.3}>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <Toggle view={view} setView={setView} />
            </div>
          </Rise>

          {view === "gallery" ? (
            <GalleryView
              deckIdx={deckIdx}
              onAdvance={() => setDeckIdx((i) => (i + 1) % DECK_IMAGES.length)}
              visibleCount={visibleCount}
              onShowMore={() => setVisibleCount(11)}
            />
          ) : (
            <MapView selectedId={selectedId} setSelectedId={setSelectedId} />
          )}
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
      <span
        style={{
          fontFamily: FONT_STACK,
          fontSize: 11,
          color: "#000",
          letterSpacing: 0.05,
        }}
      >
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
        left: 0,
        width: 402,
        paddingLeft: 20,
        paddingRight: 176,
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
          width: 53,
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

function Header() {
  return (
    <div
      style={{
        marginTop: 133,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
        padding: "0 20px",
        textAlign: "center",
        fontFamily: FONT_STACK,
        fontWeight: 300,
        fontSize: 14,
        color: "#000",
        lineHeight: 1.2,
      }}
    >
      <Rise delay={0.2} duration={0.3}>
        <p style={{ margin: 0 }}>12 curated picks</p>
      </Rise>
      <Rise delay={0.27} duration={0.3}>
        <p style={{ margin: 0, opacity: 0.4 }}>San Francisco · Jun 15-22 · 2 guests</p>
      </Rise>
    </div>
  );
}

function Toggle({
  view,
  setView,
}: {
  view: "gallery" | "map";
  setView: (v: "gallery" | "map") => void;
}) {
  const pill = (active: boolean, label: string, onClick: () => void) => (
    <button
      onClick={onClick}
      style={{
        background: active ? ACCENT : "transparent",
        border: "none",
        padding: "6px 10px",
        borderRadius: 64,
        cursor: "pointer",
        fontFamily: FONT_STACK,
        fontWeight: 300,
        fontSize: 12,
        color: "#000",
        lineHeight: 1.2,
      }}
    >
      {label}
    </button>
  );

  return (
    <div
      style={{
        background: "#f3ede2",
        display: "flex",
        gap: 1.789,
        padding: 1,
        borderRadius: 112,
      }}
    >
      {pill(view === "map", "Map", () => setView("map"))}
      {pill(view === "gallery", "Gallery", () => setView("gallery"))}
    </div>
  );
}

function GalleryView({
  deckIdx,
  onAdvance,
  visibleCount,
  onShowMore,
}: {
  deckIdx: number;
  onAdvance: () => void;
  visibleCount: number;
  onShowMore: () => void;
}) {
  const others = LISTINGS.slice(1); // exclude featured Oasis from the grid
  const shown = others.slice(0, visibleCount);
  const remaining = others.length - visibleCount;

  return (
    <>
      <Rise delay={0.34} duration={0.35} y={16}>
        <div style={{ display: "flex", justifyContent: "center", marginTop: 25 }}>
          <FeaturedDeck deckIdx={deckIdx} onAdvance={onAdvance} />
        </div>
      </Rise>

      <Rise delay={0.95} duration={0.35}>
        <div style={{ padding: "56px 20px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p style={{ margin: 0, fontFamily: "'Besley', serif", fontSize: 16, color: "#000", lineHeight: 1.2 }}>
            More matches for you
          </p>
          <p style={{ margin: 0, fontFamily: FONT_STACK, fontWeight: 300, fontSize: 14, color: "rgba(0,0,0,0.3)", letterSpacing: 0.7 }}>
            {visibleCount} of 12
          </p>
        </div>
      </Rise>

      <div
        style={{
          padding: "18px 20px 0",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 20,
        }}
      >
        {shown.map((l, i) => (
          <Rise key={l.id} delay={0.95 + 0.06 * i} duration={0.3}>
            <ListingCard listing={l} />
          </Rise>
        ))}
      </div>

      {visibleCount < others.length && (
        <Rise delay={0.95 + 0.06 * shown.length} duration={0.3}>
          <div style={{ padding: "18px 20px 0" }}>
            <ViewMoreButton onClick={onShowMore} remaining={remaining} />
          </div>
        </Rise>
      )}
    </>
  );
}

type Slot = "front" | "mid" | "back" | "hidden";

const SLOT_TARGET: Record<
  Slot,
  { x: number; y: number; rotate: number; scale: number; zIndex: number; opacity: number }
> = {
  front:  { x: 0, y: 43, rotate: 0,    scale: 1,     zIndex: 4, opacity: 1 },
  mid:    { x: 0, y: 18, rotate: 2.53, scale: 0.98,  zIndex: 3, opacity: 1 },
  back:   { x: 0, y: 0,  rotate: -3.7, scale: 0.955, zIndex: 2, opacity: 1 },
  hidden: { x: 0, y: 0,  rotate: -3.7, scale: 0.955, zIndex: 1, opacity: 1 },
};

const SLOT_ORDER: Slot[] = ["front", "mid", "back", "hidden"];
const slotForImage = (imgIdx: number, deckIdx: number): Slot =>
  SLOT_ORDER[(imgIdx - deckIdx + DECK_IMAGES.length) % DECK_IMAGES.length];

function FeaturedDeck({
  deckIdx,
  onAdvance,
}: {
  deckIdx: number;
  onAdvance: () => void;
}) {
  const instant = useInstant();
  const animatingRef = useRef(false);
  const prevDeckRef = useRef(deckIdx);
  const ctrl0 = useAnimationControls();
  const ctrl1 = useAnimationControls();
  const ctrl2 = useAnimationControls();
  const ctrl3 = useAnimationControls();
  const controls = [ctrl0, ctrl1, ctrl2, ctrl3];
  const mountedRef = useRef(false);

  // Initial load-in: settle each card to its slot.
  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;
    DECK_IMAGES.forEach((_, imgIdx) => {
      const slot = slotForImage(imgIdx, deckIdx);
      const target = SLOT_TARGET[slot];
      if (instant) {
        controls[imgIdx].set(target);
        return;
      }
      // back/mid: easeOut 0.3s with small delay. front: spring.
      if (slot === "front") {
        controls[imgIdx].start(target, {
          type: "spring",
          stiffness: 280,
          damping: 22,
          delay: 0.17,
        });
      } else if (slot === "mid") {
        controls[imgIdx].start(target, { duration: 0.3, ease: "easeOut", delay: 0.13 });
      } else if (slot === "back") {
        controls[imgIdx].start(target, { duration: 0.3, ease: "easeOut", delay: 0.1 });
      } else {
        controls[imgIdx].set(target);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // On deckIdx change, orchestrate the swap.
  useEffect(() => {
    if (deckIdx === prevDeckRef.current) return;
    const prev = prevDeckRef.current;
    prevDeckRef.current = deckIdx;

    if (instant) {
      DECK_IMAGES.forEach((_, imgIdx) => {
        controls[imgIdx].set(SLOT_TARGET[slotForImage(imgIdx, deckIdx)]);
      });
      return;
    }

    animatingRef.current = true;
    const tasks: Promise<unknown>[] = [];
    DECK_IMAGES.forEach((_, imgIdx) => {
      const oldSlot = slotForImage(imgIdx, prev);
      const newSlot = slotForImage(imgIdx, deckIdx);
      if (oldSlot === "front") {
        // Arc out, then to back.
        tasks.push(
          (async () => {
            await controls[imgIdx].start(
              { x: 72, y: 20, rotate: -8, scale: 0.82, zIndex: 5, opacity: 1 },
              { duration: 0.22, ease: "easeIn" },
            );
            await controls[imgIdx].start(SLOT_TARGET[newSlot], {
              duration: 0.26,
              ease: "easeOut",
            });
          })(),
        );
      } else if (oldSlot === "hidden" && newSlot === "back") {
        // Already at the same position; just snap z-index so it's visible behind mid.
        controls[imgIdx].set(SLOT_TARGET[newSlot]);
      } else {
        tasks.push(
          controls[imgIdx].start(SLOT_TARGET[newSlot], {
            duration: 0.48,
            ease: [0.4, 0, 0.6, 1],
          }),
        );
      }
    });
    Promise.all(tasks).then(() => {
      animatingRef.current = false;
    });
  }, [deckIdx, instant, controls]);

  const handleClick = () => {
    if (animatingRef.current) return;
    onAdvance();
  };

  return (
    <button
      onClick={handleClick}
      style={{
        background: "transparent",
        border: "none",
        padding: 0,
        cursor: "pointer",
        width: 362,
        height: 370,
        position: "relative",
      }}
    >
      {DECK_IMAGES.map((img, imgIdx) => {
        const slot = slotForImage(imgIdx, deckIdx);
        const initialTarget = SLOT_TARGET[slot];
        // Pre-paint: place each card at its slot (offset slightly + invisible if not instant)
        // so the load-in `.start()` animates into place.
        const initial = instant
          ? initialTarget
          : { ...initialTarget, opacity: 0, y: initialTarget.y - 12 };
        const isFrontInitially = slot === "front" && imgIdx === deckIdx && !mountedRef.current;
        return (
          <motion.div
            key={imgIdx}
            animate={controls[imgIdx]}
            initial={initial}
            style={{
              position: "absolute",
              top: 28,
              left: "50%",
              marginLeft: -176.45,
              width: 352.9,
              height: 313.5,
              borderRadius: 20.9,
              overflow: "hidden",
              background: `url(${img}) center/cover no-repeat`,
              boxShadow:
                slot === "front"
                  ? "0 -2.6px 5.2px rgba(0,0,0,0.25)"
                  : "0 -1.3px 3.9px rgba(0,0,0,0.1)",
              willChange: "transform, opacity",
              display: "flex",
              alignItems: "flex-start",
              padding: 15.6,
              boxSizing: "border-box",
            }}
          >
            {/* Bottom gradient + featured-pill row, rendered on every card so the
                photo never "swaps" into one with different overlays. The pills are
                only visible while the card sits at the front slot — opacity tied
                to slot. */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 50%)",
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
                opacity: slot === "front" || isFrontInitially ? 1 : 0,
                transition: "opacity 200ms",
              }}
            >
              <div style={{ display: "flex", gap: 10 }}>
                <Pill bg="#ddd864">Featured</Pill>
                <Pill bg="#ddd864">91% Match</Pill>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4.87 }}>
                <svg width={8.7} height={8.7} viewBox="0 0 8.27612 7.87106">
                  <path d={svgPaths.p157b4000} fill="#fff" />
                </svg>
                <span style={{ fontFamily: FONT_STACK, fontSize: 12, color: "#fff" }}>4.96</span>
              </div>
            </div>
          </motion.div>
        );
      })}
    </button>
  );
}

function Pill({ children, bg }: { children: React.ReactNode; bg: string }) {
  return (
    <span
      style={{
        background: bg,
        padding: "6px 8px",
        borderRadius: 74,
        fontFamily: FONT_STACK,
        fontWeight: 300,
        fontSize: 12,
        color: "#000",
        whiteSpace: "nowrap",
        lineHeight: 1.2,
      }}
    >
      {children}
    </span>
  );
}

function ListingCard({ listing }: { listing: Listing }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        height: 160,
        borderRadius: 8,
        overflow: "hidden",
        position: "relative",
        background: `url(${listing.image}) center/cover no-repeat`,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0) 50%)",
          pointerEvents: "none",
        }}
      />
      {/* Top tags row — pinned to top of every card */}
      <div
        style={{
          position: "absolute",
          top: 12,
          left: 12,
          right: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Pill bg="#ddd864">{listing.match}% Match</Pill>
        <div style={{ display: "flex", alignItems: "center", gap: 3.5 }}>
          <svg width={7.94} height={7.94} viewBox="0 0 8.27612 7.87106">
            <path d={svgPaths.p157b4000} fill="#000" fillOpacity={0.6} />
          </svg>
          <span style={{ fontFamily: FONT_STACK, fontWeight: 300, fontSize: 12, color: "#000" }}>
            {listing.rating.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Bottom spec card — hidden by default, slides up on hover */}
      <div
        style={{
          position: "absolute",
          left: 12,
          right: 12,
          bottom: 12,
          background: "#fdfaf6",
          padding: 6.77,
          borderRadius: 6.77,
          display: "flex",
          flexDirection: "column",
          gap: 8,
          transform: hover ? "translateY(0)" : "translateY(calc(100% + 12px))",
          opacity: hover ? 1 : 0,
          transition: "transform 220ms ease-out, opacity 180ms ease-out",
          pointerEvents: hover ? "auto" : "none",
        }}
      >
        <p
          style={{
            margin: 0,
            fontFamily: "'Besley', serif",
            fontSize: 13,
            color: "#000",
            lineHeight: 1.15,
          }}
        >
          {listing.name}
        </p>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <IconLabel iconPath={svgPaths.p218635f0} iconW={7.6} iconH={8.2} viewBox="0 0 7.2 8.2" label={listing.type} />
          <GuestIconLabel count={listing.guests} />
          <IconLabel iconPath={svgPaths.p1cd2000} iconW={9} iconH={9} viewBox="0 0 9.03 9.03" label={listing.price} />
        </div>
      </div>
    </div>
  );
}

function GuestIconLabel({ count }: { count: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      <svg width={10.146} height={8.086} viewBox="0 0 10.7372 8.61148">
        <g>
          <path d={svgPaths.p273ae400} fill="#000" stroke="#000" strokeWidth="0.131305" />
          <ellipse cx="7.54993" cy="1.7232" rx="1.69089" ry="1.7232" fill="#000" />
          <path d={svgPaths.pef79e90} fill="#000" stroke="#FDFAF6" strokeWidth="0.52522" />
          <ellipse cx="3.64771" cy="2.78207" rx="1.69089" ry="1.7232" fill="#000" />
        </g>
      </svg>
      <span
        style={{
          fontFamily: "'Poppins', sans-serif",
          fontWeight: 300,
          fontSize: 11,
          color: "#000",
          lineHeight: 1.2,
        }}
      >
        {count}
      </span>
    </div>
  );
}

function IconLabel({
  iconPath,
  iconW,
  iconH,
  viewBox,
  label,
}: {
  iconPath: string;
  iconW: number;
  iconH: number;
  viewBox: string;
  label: string;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      <svg width={iconW} height={iconH} viewBox={viewBox}>
        <path d={iconPath} fill="#000" />
      </svg>
      <span style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 300, fontSize: 11, color: "#000", lineHeight: 1.2 }}>
        {label}
      </span>
    </div>
  );
}

function ViewMoreButton({ onClick, remaining }: { onClick: () => void; remaining: number }) {
  const [hover, setHover] = useState(false);
  const active = hover;
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: "100%",
        background: active ? ACCENT : "transparent",
        border: `0.4px solid ${active ? ACCENT : "rgba(189,142,60,0.4)"}`,
        borderRadius: 76,
        padding: 10,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        fontFamily: FONT_STACK,
        fontWeight: 300,
        fontSize: 12,
        color: active ? "#fff" : "#000",
        lineHeight: 1.2,
      }}
    >
      <span>View More</span>
      <span style={{ color: active ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.3)" }}>· {remaining} Left</span>
    </button>
  );
}

function MapView({
  selectedId,
  setSelectedId,
}: {
  selectedId: string;
  setSelectedId: (id: string) => void;
}) {
  const selected = LISTINGS.find((l) => l.id === selectedId) ?? LISTINGS[0];
  return (
    <>
      <div style={{ display: "flex", justifyContent: "center", marginTop: 25 }}>
        <MapBox selectedId={selectedId} setSelectedId={setSelectedId} />
      </div>
      <div style={{ padding: "25px 20px 0" }}>
        <ListingSpec listing={selected} />
      </div>
    </>
  );
}

function MapBox({
  selectedId,
  setSelectedId,
}: {
  selectedId: string;
  setSelectedId: (id: string) => void;
}) {
  const mapEl = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});

  useEffect(() => {
    if (!mapEl.current || mapRef.current) return;
    const map = L.map(mapEl.current, {
      center: [37.7785, -122.4194],
      zoom: 13,
      zoomControl: false,
      attributionControl: false,
    });
    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      subdomains: "abcd",
      maxZoom: 19,
    }).addTo(map);

    LISTINGS.forEach((l) => {
      const m = L.marker(l.coord, {
        icon: makePinIcon(l, l.id === selectedId),
      }).addTo(map);
      m.on("click", () => setSelectedId(l.id));
      markersRef.current[l.id] = m;
    });

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
      markersRef.current = {};
    };
  }, []); // mount once

  useEffect(() => {
    Object.entries(markersRef.current).forEach(([id, marker]) => {
      const listing = LISTINGS.find((l) => l.id === id)!;
      marker.setIcon(makePinIcon(listing, id === selectedId));
    });
  }, [selectedId]);

  return (
    <div
      style={{
        width: 362,
        height: 310,
        borderRadius: 20,
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div ref={mapEl} style={{ width: "100%", height: "100%" }} />
      <div
        style={{
          position: "absolute",
          right: 10,
          bottom: 10,
          display: "flex",
          flexDirection: "column",
          background: "#fff",
          borderRadius: 8,
          overflow: "hidden",
          boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
          zIndex: 1000,
        }}
      >
        <ZoomBtn label="+" onClick={() => mapRef.current?.zoomIn()} />
        <div style={{ height: 1, background: "rgba(0,0,0,0.08)" }} />
        <ZoomBtn label="−" onClick={() => mapRef.current?.zoomOut()} />
      </div>
    </div>
  );
}

function ZoomBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 28,
        height: 28,
        background: "transparent",
        border: "none",
        cursor: "pointer",
        fontFamily: FONT_STACK,
        fontSize: 16,
        color: "#000",
        lineHeight: 1,
      }}
    >
      {label}
    </button>
  );
}

function makePinIcon(l: Listing, selected: boolean): L.DivIcon {
  const text = `${l.match}%`;
  const bg = selected ? PIN_SELECTED : "transparent";
  const color = selected ? "#000" : PIN_BORDER;
  const border = PIN_BORDER;
  const connector = selected
    ? `<div style="display:flex;flex-direction:column;align-items:center;width:10px;margin-top:-0.5px;">
         <div style="width:0.7px;height:34px;background:${PIN_BORDER};"></div>
         <div style="width:10px;height:10px;border-radius:50%;background:${PIN_BORDER};margin-top:-0.5px;"></div>
       </div>`
    : "";
  const html = `
    <div style="display:inline-flex;flex-direction:column;align-items:center;transform:translate(-50%, -100%);">
      <div style="
        background:${bg};
        border:0.7px solid ${border};
        color:${color};
        padding:6px 8px;
        border-radius:74px;
        font-family:Inter,sans-serif;
        font-weight:300;
        font-size:12px;
        line-height:1.2;
        white-space:nowrap;
        box-sizing:border-box;
      ">${text}</div>
      ${connector}
    </div>
  `;
  return L.divIcon({
    html,
    className: "yondr-pin",
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}

function ListingSpec({ listing }: { listing: Listing }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
      <p style={{ margin: 0, fontFamily: "'Besley', serif", fontSize: 20, color: "#000", lineHeight: 1.2 }}>
        {listing.name}
      </p>
      <Divider />
      <SpecRow
        icon={
          <svg width={9.1} height={10.4} viewBox="0 0 9.09293 10.3816">
            <path d={svgPaths.p1845d200} fill="#000" />
          </svg>
        }
        label={listing.type}
      />
      <Divider />
      <SpecRow
        icon={
          <svg width={12.1} height={9.4} viewBox="0 0 12.7749 10.0657">
            <g>
              <path d={svgPaths.p2a80e300} fill="#000" stroke="#000" strokeWidth="0.155" />
              <circle cx="8.98068" cy="2.01294" r="2.01294" fill="#000" />
              <path d={svgPaths.p7260180} fill="#000" stroke="#FDFAF6" strokeWidth="0.62" />
              <circle cx="4.33578" cy="3.25353" r="2.01294" fill="#000" />
            </g>
          </svg>
        }
        label="Number of Guests"
        right={String(listing.guests)}
      />
      <Divider />
      <SpecRow
        icon={
          <svg width={10.1} height={10.1} viewBox="0 0 10.078 10.078">
            <path d={svgPaths.p12c43b00} fill="#000" />
          </svg>
        }
        label="Price"
        right={listing.price}
      />
      <Divider />
    </div>
  );
}

function SpecRow({
  icon,
  label,
  right,
}: {
  icon: React.ReactNode;
  label: string;
  right?: string;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {icon}
        <span
          style={{
            fontFamily: FONT_STACK,
            fontWeight: 300,
            fontSize: 14,
            color: "#000",
            lineHeight: 1.2,
          }}
        >
          {label}
        </span>
      </div>
      {right !== undefined && (
        <span
          style={{
            fontFamily: FONT_STACK,
            fontWeight: 300,
            fontSize: 14,
            color: "#000",
            lineHeight: 1.2,
          }}
        >
          {right}
        </span>
      )}
    </div>
  );
}

function Divider() {
  return <div style={{ height: 1, background: "rgba(0,0,0,0.1)", width: "100%" }} />;
}

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

  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        background: "#fdfaf6",
        borderRadius: "20px 20px 0 0",
        boxShadow: "0 0 30px rgba(0,0,0,0.11)",
        display: "flex",
        justifyContent: "space-between",
        padding: "17px 34px",
      }}
    >
      <Item
        active
        label="Explore"
        icon={
          <svg width={12.7} height={12.7} viewBox="0 0 12.6934 12.6934">
            <path d={svgPaths.p3d6f9a00} fill="#000" />
            <path d={svgPaths.p23379e60} fill="#000" />
            <path d={svgPaths.pd398f00} fill="#000" />
          </svg>
        }
      />
      <Item
        label="Saved"
        icon={
          <svg width={12.7} height={12.7} viewBox="0 0 12.6934 12.6934">
            <path d={svgPaths.p3d8cec80} fill="#000" fillOpacity={0.15} />
          </svg>
        }
      />
      <Item
        label="Trips"
        icon={
          <svg width={12.7} height={12.7} viewBox="0 0 12.6934 12.6934">
            <path d={svgPaths.p26832580} fill="#000" fillOpacity={0.15} />
            <path d={svgPaths.p14358580} fill="#000" fillOpacity={0.15} />
          </svg>
        }
      />
      <Item
        label="Profile"
        icon={
          <svg width={12.7} height={12.7} viewBox="0 0 12.6934 12.6934">
            <path d={svgPaths.p1bfc73c0} fill="#000" fillOpacity={0.15} />
            <path d={svgPaths.p2a2d7c00} fill="#000" fillOpacity={0.15} />
          </svg>
        }
      />
    </div>
  );
}
