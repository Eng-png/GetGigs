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

import type { Opportunity } from "../../data/opportunities";
import OpportunityDetailScreen from "../opportunities/OpportunityDetailScreen";

const DECK_IMAGES = [deck1, deck2, deck3, deck4];

const FONT_STACK = "'Google Sans Flex', 'Google Sans', Inter, sans-serif";
const MENU_HEIGHT = 78;

type Listing = Opportunity & { name: string; match: number; coord: [number, number] };

const ListingsCtx = createContext<Listing[]>([]);
const useListings = () => useContext(ListingsCtx);

const ACCENT = "#bd8e3c";
const PIN_SELECTED = "#ddd864";
const PIN_BORDER = "#857e38";

export default function Version1Screen({ opportunities, accessMode = "guest", onRequireAuth, onSearch, noScroll = false, onApply, savedOpportunityIds, onToggleSaved }: { opportunities: Opportunity[]; accessMode?: "guest" | "authenticated" | "demo"; onRequireAuth?: () => void; onSearch?: (query: string, filters: Record<string, unknown>) => void; noScroll?: boolean; onApply: (opportunity: Opportunity) => void; savedOpportunityIds: Set<string>; onToggleSaved: (opportunityId: string) => void }) {
  const listings = useMemo(() => opportunities.map((opportunity) => ({ ...opportunity, name: opportunity.venueName, match: opportunity.matchScore, coord: opportunity.coordinate })), [opportunities]);
  const [view, setView] = useState<"gallery" | "map">("gallery");
  const [deckIdx, setDeckIdx] = useState(0);
  const [visibleCount, setVisibleCount] = useState(3); // grid items visible (excludes featured)
  const [selectedId, setSelectedId] = useState<string>(listings[0]?.id ?? "");
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);

  const reducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const ctx = useMemo(() => ({ instant: noScroll || reducedMotion }), [noScroll, reducedMotion]);

  const openOpportunity = (opportunity: Opportunity) => { setSelectedOpportunity(opportunity); if (accessMode === "guest") onRequireAuth?.(); };

  if (selectedOpportunity) {
    return (
      <OpportunityDetailScreen
        opportunity={selectedOpportunity}
        saved={savedOpportunityIds.has(selectedOpportunity.id)}
        onBack={() => setSelectedOpportunity(null)}
        onApply={onApply}
        onToggleSaved={onToggleSaved}
        accessMode={accessMode}
        onRequireAuth={onRequireAuth}
      />
    );
  }

  return (
    <ListingsCtx.Provider value={listings}><AnimCtx.Provider value={ctx}>
      <div
        style={{
          width: "100%",
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
              onAdvance={() => setDeckIdx((i) => (i + 1) % Math.max(1, Math.min(listings.length, DECK_IMAGES.length)))}
              visibleCount={visibleCount}
              onShowMore={() => setVisibleCount(listings.length - 1)}
              onOpen={openOpportunity}
            />
          ) : (
            <MapView selectedId={selectedId} setSelectedId={setSelectedId} onOpen={openOpportunity} onSearch={onSearch} />
          )}
        </div>

      </div>
    </AnimCtx.Provider></ListingsCtx.Provider>
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
        width: "100%",
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
        <p style={{ margin: 0 }}>4 curated opportunities</p>
      </Rise>
      <Rise delay={0.27} duration={0.3}>
        <p style={{ margin: 0, opacity: 0.4 }}>Boston + Cambridge · Fall 2026</p>
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
  onOpen,
}: {
  deckIdx: number;
  onAdvance: () => void;
  visibleCount: number;
  onShowMore: () => void;
  onOpen: (opportunity: Opportunity) => void;
}) {
  const listings = useListings();
  const others = listings.slice(1);
  const shown = others.slice(0, visibleCount);
  const remaining = others.length - visibleCount;

  return (
    <>
      <Rise delay={0.34} duration={0.35} y={16}>
        <div style={{ display: "flex", justifyContent: "center", marginTop: 25 }}>
          <FeaturedDeck deckIdx={deckIdx} onAdvance={onAdvance} onOpen={onOpen} />
        </div>
      </Rise>

      <Rise delay={0.95} duration={0.35}>
        <div style={{ padding: "56px 20px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p style={{ margin: 0, fontFamily: "'Besley', serif", fontSize: 16, color: "#000", lineHeight: 1.2 }}>
            More matches for you
          </p>
          <p style={{ margin: 0, fontFamily: FONT_STACK, fontWeight: 300, fontSize: 14, color: "rgba(0,0,0,0.3)", letterSpacing: 0.7 }}>
            {Math.min(visibleCount + 1, listings.length)} of {listings.length}
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
            <ListingCard listing={l} onOpen={onOpen} />
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
  onOpen,
}: {
  deckIdx: number;
  onAdvance: () => void;
  onOpen: (opportunity: Opportunity) => void;
}) {
  const listings = useListings();
  const deckListings = listings.slice(0, DECK_IMAGES.length);
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
    deckListings.forEach((_, imgIdx) => {
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

  const handleAdvance = () => {
    if (animatingRef.current) return;
    onAdvance();
  };

  return (
    <div
      role="group"
      aria-label="Featured venue opportunities"
      style={{
        background: "transparent",
        padding: 0,
        width: "calc(100% - 40px)",
        height: 370,
        position: "relative",
      }}
    >
      {deckListings.map((opportunity, imgIdx) => {
        const img = opportunity.image;
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
            role={slot === "front" ? "button" : undefined}
            tabIndex={slot === "front" ? 0 : -1}
            aria-label={slot === "front" ? `View ${opportunity.venueName} opportunity` : undefined}
            onClick={() => slot === "front" && onOpen(opportunity)}
            onKeyDown={(event) => {
              if (slot === "front" && (event.key === "Enter" || event.key === " ")) onOpen(opportunity);
            }}
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
              cursor: slot === "front" ? "pointer" : "default",
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
                background: "linear-gradient(to bottom, rgba(0,0,0,.44) 0%, rgba(0,0,0,0) 42%, rgba(0,0,0,.76) 100%)",
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
                <Pill bg="#ddd864">{opportunity.matchScore}% Match</Pill>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4.87 }}>
                <svg width={8.7} height={8.7} viewBox="0 0 8.27612 7.87106">
                  <path d={svgPaths.p157b4000} fill="#fff" />
                </svg>
                <span style={{ fontFamily: FONT_STACK, fontSize: 11, color: "#fff" }}>View details</span>
              </div>
            </div>
            <div
              style={{
                position: "absolute",
                left: 18,
                right: 18,
                bottom: 17,
                color: "#fff",
                textAlign: "left",
                opacity: slot === "front" || isFrontInitially ? 1 : 0,
                transition: "opacity 200ms",
              }}
            >
              <h2 style={{ margin: 0, fontFamily: "'Besley', serif", fontSize: 27, fontWeight: 500, lineHeight: 1.05 }}>
                {opportunity.venueName}
              </h2>
              <p style={{ margin: "7px 0 0", fontFamily: FONT_STACK, fontSize: 11, lineHeight: 1.45 }}>
                {opportunity.city}, {opportunity.state}<br />
                {opportunity.opportunityTitle} · {opportunity.date}
              </p>
            </div>
          </motion.div>
        );
      })}
      <button
        type="button"
        onClick={handleAdvance}
        style={{
          position: "absolute",
          right: 13,
          bottom: 1,
          zIndex: 8,
          border: "1px solid rgba(0,0,0,.18)",
          borderRadius: 999,
          padding: "7px 11px",
          background: "#fdfaf6",
          fontFamily: FONT_STACK,
          fontSize: 10,
          cursor: "pointer",
        }}
      >
        Next match →
      </button>
    </div>
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

function ListingCard({ listing, onOpen }: { listing: Listing; onOpen: (opportunity: Opportunity) => void }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      type="button"
      aria-label={`View ${listing.venueName}: ${listing.opportunityTitle}`}
      onClick={() => onOpen(listing)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: "100%",
        height: 205,
        padding: 0,
        border: 0,
        borderRadius: 8,
        overflow: "hidden",
        position: "relative",
        background: `url(${listing.image}) center/cover no-repeat`,
        cursor: "pointer",
        textAlign: "left",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to bottom, rgba(0,0,0,.2) 0%, rgba(0,0,0,0) 44%, rgba(0,0,0,.78) 100%)",
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
        <span style={{ padding: "5px 8px", borderRadius: 999, background: "rgba(253,250,246,.9)", fontFamily: FONT_STACK, fontSize: 9 }}>View</span>
      </div>

      <div
        style={{
          position: "absolute",
          left: 12,
          right: 12,
          bottom: 12,
          color: "#fff",
          display: "flex",
          flexDirection: "column",
          gap: 4,
          transform: hover ? "translateY(-2px)" : "translateY(0)",
          transition: "transform 180ms ease-out",
        }}
      >
        <p
          style={{
            margin: 0,
            fontFamily: "'Besley', serif",
            fontSize: 17,
            color: "#fff",
            lineHeight: 1.15,
          }}
        >
          {listing.venueName}
        </p>
        <span style={{ fontFamily: FONT_STACK, fontSize: 9, lineHeight: 1.35 }}>{listing.city}, {listing.state}</span>
        <span style={{ fontFamily: FONT_STACK, fontSize: 9, lineHeight: 1.35 }}>{listing.opportunityTitle} · {listing.date}</span>
      </div>
    </button>
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

type LivePlace = {
  id: string;
  name: string;
  address: string;
  rating?: number;
  ratingCount?: number;
  openNow?: boolean;
  category?: string;
  photoUrl?: string;
  mapsUrl?: string;
  location: [number, number];
};

function MapView({
  selectedId,
  setSelectedId,
  onOpen,
  onSearch,
}: {
  selectedId: string;
  setSelectedId: (id: string) => void;
  onOpen: (opportunity: Opportunity) => void;
  onSearch?: (query: string, filters: Record<string, unknown>) => void;
}) {
  const listings = useListings();
  const selected = listings.find((l) => l.id === selectedId) ?? listings[0];
  const [livePlaces, setLivePlaces] = useState<LivePlace[]>([]);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const selectedPlace = livePlaces.find((place) => place.id === selectedPlaceId) ?? livePlaces[0];
  return (
    <>
      <div style={{ display: "flex", justifyContent: "center", marginTop: 25 }}>
        <MapBox
          selectedId={selectedId}
          setSelectedId={setSelectedId}
          onPlaces={(places) => {
            setLivePlaces(places);
            setSelectedPlaceId(places[0]?.id ?? null);
          }}
          selectedPlaceId={selectedPlaceId}
          onSelectPlace={setSelectedPlaceId}
          onSearch={onSearch}
        />
      </div>
      <div style={{ padding: "20px 20px 0" }}>
        {selectedPlace ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: selectedPlace.photoUrl ? "86px minmax(0, 1fr)" : "1fr",
              gap: 13,
              padding: 13,
              border: "1px solid rgba(0,0,0,.12)",
              borderRadius: 16,
              background: "#fdfaf6",
            }}
          >
            {selectedPlace.photoUrl && (
              <img
                src={selectedPlace.photoUrl}
                alt=""
                style={{ width: 86, height: 92, borderRadius: 11, objectFit: "cover" }}
              />
            )}
            <div style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: 5 }}>
              <strong style={{ fontFamily: FONT_STACK, fontSize: 15 }}>{selectedPlace.name}</strong>
              <span style={{ color: "rgba(0,0,0,.62)", fontFamily: FONT_STACK, fontSize: 11 }}>
                {selectedPlace.rating ? `★ ${selectedPlace.rating.toFixed(1)}` : "Not yet rated"}
                {selectedPlace.ratingCount ? ` (${selectedPlace.ratingCount.toLocaleString()})` : ""}
                {selectedPlace.category ? ` · ${selectedPlace.category}` : ""}
              </span>
              <span style={{ color: "rgba(0,0,0,.58)", fontFamily: FONT_STACK, fontSize: 10, lineHeight: 1.35 }}>
                {selectedPlace.address}
              </span>
              {selectedPlace.openNow !== undefined && (
                <span style={{ color: selectedPlace.openNow ? "#25833e" : "#c4322e", fontFamily: FONT_STACK, fontSize: 10, fontWeight: 600 }}>
                  {selectedPlace.openNow ? "Open now" : "Closed"}
                </span>
              )}
              {selectedPlace.mapsUrl && (
                <a href={selectedPlace.mapsUrl} target="_blank" rel="noreferrer" style={{ color: "#72520f", fontFamily: FONT_STACK, fontSize: 10, fontWeight: 600 }}>
                  View on Google Maps ↗
                </a>
              )}
            </div>
          </div>
        ) : (
          <ListingSpec listing={selected} onOpen={onOpen} />
        )}
      </div>
    </>
  );
}

function MapBox({
  selectedId,
  setSelectedId,
  onPlaces,
  selectedPlaceId,
  onSelectPlace,
  onSearch,
}: {
  selectedId: string;
  setSelectedId: (id: string) => void;
  onPlaces: (places: LivePlace[]) => void;
  selectedPlaceId: string | null;
  onSelectPlace: (id: string) => void;
  onSearch?: (query: string, filters: Record<string, unknown>) => void;
}) {
  const listings = useListings();
  const mapEl = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});
  const radiusRef = useRef<L.Circle | null>(null);
  const userMarkerRef = useRef<L.CircleMarker | null>(null);
  const googleMapRef = useRef<any>(null);
  const googleMarkersRef = useRef<Record<string, any>>({});
  const liveGoogleMarkersRef = useRef<Record<string, any>>({});
  const googleRadiusRef = useRef<any>(null);
  const googleUserRef = useRef<any>(null);
  const areaQueryRef = useRef("");
  const [engine, setEngine] = useState<"google" | "openstreetmap">("openstreetmap");
  const [locationStatus, setLocationStatus] = useState<"idle" | "locating" | "ready" | "error">("idle");
  const [nearbyCount, setNearbyCount] = useState(listings.length);
  const [areaQuery, setAreaQuery] = useState("");
  const [areaLabel, setAreaLabel] = useState("");
  const [mapMessage, setMapMessage] = useState("");
  const [embeddedGoogleQuery, setEmbeddedGoogleQuery] = useState("");

  areaQueryRef.current = areaQuery;

  const initializeLeaflet = () => {
    if (!mapEl.current || mapRef.current || googleMapRef.current) return;
    const map = L.map(mapEl.current, {
      center: [42.3656, -71.1025],
      zoom: 13,
      zoomControl: false,
      attributionControl: true,
    });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);
    map.on("click", () => setEmbeddedGoogleQuery(normalizeGoogleMapsQuery(areaQueryRef.current)));

    listings.forEach((listing) => {
      const marker = L.marker(listing.coord, {
        icon: makePinIcon(listing, listing.id === selectedId),
      }).addTo(map);
      marker.on("click", () => setSelectedId(listing.id));
      markersRef.current[listing.id] = marker;
    });

    mapRef.current = map;
    setEngine("openstreetmap");
  };

  useEffect(() => {
    if (!mapEl.current || mapRef.current || googleMapRef.current) return;
    let disposed = false;
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim();

    if (apiKey) {
      loadGoogleMaps(apiKey)
        .then(() => {
          if (disposed || !mapEl.current || !window.google?.maps) return;
          const google = window.google;
          const map = new google.maps.Map(mapEl.current, {
            center: { lat: 42.3656, lng: -71.1025 },
            zoom: 13,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            zoomControl: true,
          });
          map.addListener("click", () => setEmbeddedGoogleQuery(normalizeGoogleMapsQuery(areaQueryRef.current)));
          listings.forEach((listing) => {
            const marker = new google.maps.Marker({
              map,
              position: { lat: listing.coord[0], lng: listing.coord[1] },
              title: listing.name,
              label: { text: `${listing.match}%`, color: "#000", fontSize: "11px", fontWeight: "600" },
            });
            marker.addListener("click", () => setSelectedId(listing.id));
            googleMarkersRef.current[listing.id] = marker;
          });
          googleMapRef.current = map;
          setEngine("google");
        })
        .catch(() => {
          if (!disposed) initializeLeaflet();
        });
    } else {
      initializeLeaflet();
    }

    return () => {
      disposed = true;
      mapRef.current?.remove();
      mapRef.current = null;
      markersRef.current = {};
      radiusRef.current = null;
      userMarkerRef.current = null;
      Object.values(googleMarkersRef.current).forEach((marker) => marker.setMap(null));
      googleMarkersRef.current = {};
      Object.values(liveGoogleMarkersRef.current).forEach((marker) => marker.setMap(null));
      liveGoogleMarkersRef.current = {};
      googleRadiusRef.current?.setMap(null);
      googleUserRef.current?.setMap(null);
      googleMapRef.current = null;
    };
  }, []); // mount once

  useEffect(() => {
    Object.entries(markersRef.current).forEach(([id, marker]) => {
      const listing = listings.find((l) => l.id === id)!;
      marker.setIcon(makePinIcon(listing, id === selectedId));
    });
  }, [selectedId]);

  useEffect(() => {
    Object.entries(liveGoogleMarkersRef.current).forEach(([id, marker]) => {
      marker.setZIndex(id === selectedPlaceId ? 1000 : undefined);
      marker.setAnimation(id === selectedPlaceId ? window.google?.maps?.Animation?.BOUNCE : null);
      if (id === selectedPlaceId) window.setTimeout(() => marker.setAnimation(null), 650);
    });
  }, [selectedPlaceId]);

  const showArea = (center: [number, number], label: string) => {
    const nearby = listings.filter((listing) => milesBetween(center, listing.coord) <= 3);
    setNearbyCount(nearby.length);
    setAreaLabel(label);
    setMapMessage("");
    if (nearby.length && !nearby.some((listing) => listing.id === selectedId)) {
      setSelectedId(nearby[0].id);
    }

    if (googleMapRef.current && window.google?.maps) {
      const google = window.google;
      const position = { lat: center[0], lng: center[1] };
      googleMapRef.current.setCenter(position);
      googleMapRef.current.setZoom(14);
      googleRadiusRef.current?.setMap(null);
      googleUserRef.current?.setMap(null);
      googleRadiusRef.current = new google.maps.Circle({
        map: googleMapRef.current,
        center: position,
        radius: 4828.03,
        fillColor: "#dde04a",
        fillOpacity: 0.13,
        strokeColor: "#857e38",
        strokeOpacity: 0.8,
        strokeWeight: 1.5,
      });
      googleUserRef.current = new google.maps.Marker({
        map: googleMapRef.current,
        position,
        title: label,
        zIndex: 999,
      });
      listings.forEach((listing) => {
        googleMarkersRef.current[listing.id]?.setMap(nearby.some((item) => item.id === listing.id) ? googleMapRef.current : null);
      });
    } else if (mapRef.current) {
      const map = mapRef.current;
      map.setView(center, 14);
      radiusRef.current?.remove();
      userMarkerRef.current?.remove();
      radiusRef.current = L.circle(center, {
        radius: 4828.03,
        color: "#857e38",
        weight: 1.5,
        fillColor: "#dde04a",
        fillOpacity: 0.13,
      }).addTo(map);
      userMarkerRef.current = L.circleMarker(center, {
        radius: 7,
        color: "#fff",
        weight: 2,
        fillColor: "#246bfd",
        fillOpacity: 1,
      }).addTo(map).bindTooltip(label);
      listings.forEach((listing) => {
        const marker = markersRef.current[listing.id];
        const shouldShow = nearby.some((item) => item.id === listing.id);
        if (shouldShow && !map.hasLayer(marker)) marker.addTo(map);
        if (!shouldShow && map.hasLayer(marker)) marker.removeFrom(map);
      });
    }
    setLocationStatus("ready");
  };

  const useMyLocation = () => {
    onSearch?.("bars and live music venues near me", { radiusMiles: 3, source: "current_location" });
    setEmbeddedGoogleQuery("bars and live music venues near me");
    setAreaLabel("your location");
    if (!navigator.geolocation) {
      setMapMessage("Using Google’s approximate nearby location because precise location is unavailable.");
      setLocationStatus("ready");
      return;
    }
    setLocationStatus("locating");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setEmbeddedGoogleQuery(`bars and live music venues near ${coords.latitude},${coords.longitude}`);
        setAreaLabel("your location");
        setMapMessage("Using your precise browser location.");
        setLocationStatus("ready");
      },
      () => {
        setMapMessage("Using Google’s approximate nearby location. Allow location access for more precise results.");
        setLocationStatus("ready");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  };

  const searchArea = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearch?.(areaQuery.trim() || "bars and live music venues", { radiusMiles: 3, source: "map" });
    setEmbeddedGoogleQuery(normalizeGoogleMapsQuery(areaQuery));
    setAreaLabel(areaQuery.trim() || "bars and venues near you");
    setMapMessage("Google Maps is open inside GetGigs");
    setLocationStatus("ready");
  };

  return (
    <div
      style={{
        width: "calc(100% - 40px)",
        height: embeddedGoogleQuery ? 430 : 360,
        borderRadius: 20,
        overflow: "hidden",
        position: "relative",
        background: "#fdfaf6",
      }}
    >
      {embeddedGoogleQuery ? (
        <iframe
          title="Google Maps venue search"
          src={googleMapsEmbedUrl(embeddedGoogleQuery)}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
          style={{ position: "absolute", inset: "104px 0 0", width: "100%", height: "calc(100% - 104px)", border: 0 }}
        />
      ) : (
        <div ref={mapEl} style={{ width: "100%", height: "100%", cursor: "pointer" }} />
      )}
      <form
        onSubmit={searchArea}
        style={{
          position: "absolute",
          left: 10,
          right: 10,
          top: 10,
          zIndex: 1000,
          height: 42,
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "4px 5px 4px 14px",
          border: "1px solid rgba(0,0,0,.2)",
          borderRadius: 999,
          background: "rgba(253,250,246,.96)",
          boxShadow: "0 3px 12px rgba(0,0,0,.16)",
        }}
      >
        <input
          value={areaQuery}
          onChange={(event) => setAreaQuery(event.target.value)}
          placeholder="Bars or venues near a ZIP or area"
          aria-label="Search bars, venues, ZIP code, city, or area"
          style={{
            minWidth: 0,
            flex: 1,
            border: 0,
            outline: 0,
            background: "transparent",
            color: "#000",
            fontFamily: FONT_STACK,
            fontSize: 12,
          }}
        />
        <button
          type="submit"
          disabled={locationStatus === "locating"}
          style={{
            height: 32,
            padding: "0 13px",
            border: "1px solid #000",
            borderRadius: 999,
            background: "#dde04a",
            color: "#000",
            fontFamily: FONT_STACK,
            fontSize: 11,
            fontWeight: 600,
            cursor: locationStatus === "locating" ? "wait" : "pointer",
          }}
        >
          Open
        </button>
      </form>
      <button
        type="button"
        onClick={useMyLocation}
        disabled={locationStatus === "locating"}
        style={{
          position: "absolute",
          left: 10,
          top: 62,
          zIndex: 1000,
          minHeight: 30,
          padding: "0 10px",
          border: "1px solid rgba(0,0,0,.2)",
          borderRadius: 999,
          background: "#fdfaf6",
          color: "#000",
          boxShadow: "0 2px 9px rgba(0,0,0,.15)",
          fontFamily: FONT_STACK,
          fontSize: 11,
          fontWeight: 500,
          cursor: locationStatus === "locating" ? "wait" : "pointer",
        }}
      >
        {locationStatus === "locating" ? "Locating…" : "Use my location"}
      </button>
      {embeddedGoogleQuery && (
        <span
          style={{
            position: "absolute",
            top: 70,
            left: 132,
            right: 12,
            color: "rgba(0,0,0,.62)",
            fontFamily: FONT_STACK,
            fontSize: 9,
            lineHeight: 1.3,
          }}
        >
          {mapMessage.includes("location")
            ? mapMessage
            : "Tap any red marker to see the bar’s rating, address, hours, and Google Maps details."}
        </span>
      )}
      {!embeddedGoogleQuery && <div
        role="status"
        style={{
          position: "absolute",
          left: 10,
          bottom: 10,
          zIndex: 1000,
          maxWidth: "calc(100% - 90px)",
          padding: "7px 10px",
          borderRadius: 9,
          background: "rgba(253,250,246,.92)",
          color: "#000",
          fontFamily: FONT_STACK,
          fontSize: 10,
          boxShadow: "0 2px 9px rgba(0,0,0,.12)",
        }}
      >
        {locationStatus === "ready"
          ? `${nearbyCount} result${nearbyCount === 1 ? "" : "s"} for ${shortAreaLabel(areaLabel)}${mapMessage ? ` · ${mapMessage}` : ""}`
          : locationStatus === "error"
            ? mapMessage
            : `${engine === "google" ? "Google Maps" : "Preview map"} · tap the map to explore on Google Maps`}
      </div>}
      {!embeddedGoogleQuery && <div
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
        <ZoomBtn label="+" onClick={() => {
          mapRef.current?.zoomIn();
          const map = googleMapRef.current;
          if (map) map.setZoom((map.getZoom() || 13) + 1);
        }} />
        <div style={{ height: 1, background: "rgba(0,0,0,0.08)" }} />
        <ZoomBtn label="−" onClick={() => {
          mapRef.current?.zoomOut();
          const map = googleMapRef.current;
          if (map) map.setZoom((map.getZoom() || 13) - 1);
        }} />
      </div>}
    </div>
  );
}

declare global {
  interface Window {
    google?: any;
  }
}

let googleMapsPromise: Promise<void> | null = null;

function loadGoogleMaps(apiKey: string): Promise<void> {
  if (window.google?.maps) return Promise.resolve();
  if (googleMapsPromise) return googleMapsPromise;
  googleMapsPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&v=weekly&loading=async&libraries=places`;
    script.async = true;
    script.onload = () => window.google?.maps ? resolve() : reject(new Error("Google Maps failed to initialize"));
    script.onerror = () => reject(new Error("Google Maps failed to load"));
    document.head.appendChild(script);
  });
  return googleMapsPromise;
}

function milesBetween(a: [number, number], b: [number, number]): number {
  const toRadians = (degrees: number) => degrees * Math.PI / 180;
  const earthRadiusMiles = 3958.8;
  const lat = toRadians(b[0] - a[0]);
  const lng = toRadians(b[1] - a[1]);
  const h = Math.sin(lat / 2) ** 2
    + Math.cos(toRadians(a[0])) * Math.cos(toRadians(b[0])) * Math.sin(lng / 2) ** 2;
  return 2 * earthRadiusMiles * Math.asin(Math.sqrt(h));
}

function shortAreaLabel(label: string): string {
  if (!label) return "that area";
  const parts = label.split(",").map((part) => part.trim()).filter(Boolean);
  return parts.slice(0, 2).join(", ");
}

function normalizeGoogleMapsQuery(value: string): string {
  const query = value.trim();
  const hasVenueType = /\b(bar|bars|venue|venues|club|clubs|music)\b/i.test(query);
  return query
    ? hasVenueType ? query : `bars and live music venues near ${query}`
    : "bars and live music venues near me";
}

function googleMapsEmbedUrl(query: string): string {
  return `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
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

function ListingSpec({ listing, onOpen }: { listing: Listing; onOpen: (opportunity: Opportunity) => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
      <p style={{ margin: 0, fontFamily: "'Besley', serif", fontSize: 20, color: "#000", lineHeight: 1.2 }}>
        {listing.venueName}
      </p>
      <Divider />
      <SpecRow icon={<span aria-hidden>⌖</span>} label={`${listing.city}, ${listing.state}`} />
      <Divider />
      <SpecRow icon={<span aria-hidden>♪</span>} label={listing.opportunityTitle} right={listing.date} />
      <Divider />
      <SpecRow icon={<span aria-hidden>◎</span>} label="Match" right={`${listing.matchScore}%`} />
      <Divider />
      <button type="button" onClick={() => onOpen(listing)} style={{ minHeight: 42, border: "1px solid #000", borderRadius: 999, background: "#dde04a", fontFamily: FONT_STACK, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>View opportunity</button>
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
