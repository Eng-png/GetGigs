import { createContext, useContext, useEffect, useRef, useState } from "react";
import { motion, animate } from "motion/react";

import svgPaths from "../../../imports/ScreenCResult/svg-178vylhgc4";

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

function WipeDivider({
  delay = 0,
  duration = 0.4,
  color = "rgba(255,255,255,0.2)",
  height = 0.75,
}: {
  delay?: number;
  duration?: number;
  color?: string;
  height?: number;
}) {
  const { instant } = useContext(AnimCtx);
  if (instant) {
    return <div style={{ height, background: color, width: "100%" }} />;
  }
  return (
    <motion.div
      initial={{ scaleX: 0 }}
      animate={{ scaleX: 1 }}
      transition={{ duration, ease: "easeOut", delay }}
      style={{
        height,
        background: color,
        width: "100%",
        transformOrigin: "left center",
      }}
    />
  );
}

function Reveal({
  children,
  delay = 0,
  duration = 0.4,
  y = 16,
}: {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  y?: number;
}) {
  const { instant } = useContext(AnimCtx);
  if (instant) return <div>{children}</div>;
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration, ease: "easeOut", delay }}
    >
      {children}
    </motion.div>
  );
}

import heroImg from "../../../imports/ScreenCResult/46af54ed1c12d4f3c69cabe0c3bdc2e01a10bc07.png";
import compareBase from "../../../imports/ScreenCResult/cac075dca4a2c1c9cfa0ff0297ab3a015f06f4fc.png";
import compareCol1 from "../../../imports/ScreenCResult/bfa951233d1ecc1d5cc1819f6ed858f2c3a258f0.png";
import compareCol2 from "../../../imports/ScreenCResult/05b9bbbd868756acecc088ebb1d872669dfe1a33.png";
import compareCol3 from "../../../imports/ScreenCResult/33050954c453b8c75e02dcdc16bc90efd28d902f.png";

const FONT_STACK = "'Google Sans Flex', 'Google Sans', Inter, sans-serif";
const MENU_HEIGHT = 78;
const ACCENT = "#bd8e3c";
const CITRON = "#ddd864";
const PIN = "#cfd205";
const CARD_BG = "#fdfaf6";

const COL_WIDTH = 58;
const COL_GAP = 7;

export default function Version3Screen({ noScroll = false }: { noScroll?: boolean } = {}) {
  const reduced = useReducedMotion();
  const instant = noScroll || reduced;
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
        <style>{`.yondr-scroll-v3::-webkit-scrollbar{display:none}`}</style>

        <div
          className="yondr-scroll-v3"
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
          <Hero />
          <Reveal>
            <CompareAlternatives />
          </Reveal>
          <Reveal>
            <WhyMatched />
          </Reveal>
          <Reveal>
            <PriceAndReserve />
          </Reveal>
        </div>

        <BottomMenu />
      </div>
    </AnimCtx.Provider>
  );
}

/* --------------- HERO --------------- */

function Hero() {
  const { instant } = useContext(AnimCtx);
  return (
    <div
      style={{
        position: "relative",
        width: 402,
        height: 758,
        overflow: "hidden",
        background: "#000",
      }}
    >
      {instant ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `url(${heroImg}) center/cover no-repeat`,
          }}
        />
      ) : (
        <motion.div
          initial={{ scale: 1.06, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          style={{
            position: "absolute",
            inset: 0,
            background: `url(${heroImg}) center/cover no-repeat`,
          }}
        />
      )}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.4) 13.9%, rgba(51,51,51,0) 58.07%, rgba(0,0,0,0.4) 100%)",
          pointerEvents: "none",
        }}
      />
      <StatusBar invert />

      <div
        style={{
          position: "absolute",
          left: 20,
          top: 66,
          width: 362,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <Rise delay={0.1}>
          <TopBar />
        </Rise>
        <WipeDivider delay={0.18} duration={0.35} color="rgba(255,255,255,0.3)" />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 7,
            alignItems: "center",
            width: "100%",
          }}
        >
          <Rise delay={0.22}>
            <YMark />
          </Rise>
          <Rise delay={0.28}>
            <p style={{ margin: 0, fontFamily: FONT_STACK, fontWeight: 400, fontSize: 18, color: "#fff" }}>
              Your perfect place
            </p>
          </Rise>
          <Rise delay={0.34}>
            <p
              style={{
                margin: 0,
                fontFamily: FONT_STACK,
                fontWeight: 300,
                fontSize: 12,
                color: "#fff",
                opacity: 0.9,
              }}
            >
              Barcelona · Jun 15-22 · 2 guests
            </p>
          </Rise>
        </div>
      </div>

      {/* Pin + name + stats row — anchored together near bottom of hero (HeroModule frame top:597, left:37, w:331) */}
      <div
        style={{
          position: "absolute",
          left: 37,
          top: 597,
          width: 331,
          display: "flex",
          flexDirection: "column",
          gap: 30,
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
          }}
        >
          <Rise delay={0.5}>
            <svg width={22} height={22} viewBox="0 0 22 22">
              <path d={svgPaths.p2eb3f9f0} fill={PIN} fillOpacity={0.9} />
            </svg>
          </Rise>
          <Rise delay={0.56}>
            <p
              style={{
                margin: 0,
                fontFamily: "'Besley', serif",
                fontSize: 30,
                color: "#fff",
                lineHeight: 1.2,
              }}
            >
              Cozy Den
            </p>
          </Rise>
        </div>

        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            height: 44,
            justifyContent: "space-between",
          }}
        >
          <WipeDivider delay={0.74} duration={0.4} color="rgba(255,255,255,0.2)" />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
            }}
          >
            <Ring label="Walk" value="91%" delay={0.85} />
            <Ring label="Food" value="91%" delay={1.0} />
            <Ring label="Activity" value="91%" delay={1.15} />
          </div>
          <WipeDivider delay={0.78} duration={0.4} color="rgba(255,255,255,0.1)" />
        </div>
      </div>
    </div>
  );
}

function Ring({
  label,
  value,
  delay = 0,
}: {
  label: string;
  value: string;
  delay?: number;
}) {
  const { instant } = useContext(AnimCtx);
  const target = parseInt(value, 10) || 0;
  const pathRef = useRef<SVGPathElement | null>(null);
  const [len, setLen] = useState<number | null>(null);
  const [shown, setShown] = useState<number>(instant ? target : 0);

  useEffect(() => {
    if (pathRef.current) {
      setLen(pathRef.current.getTotalLength());
    }
  }, []);

  useEffect(() => {
    if (instant) return;
    const controls = animate(0, target, {
      duration: 0.9,
      ease: "easeOut",
      delay,
      onUpdate: (v) => setShown(Math.round(v)),
    });
    return () => controls.stop();
  }, [instant, target, delay]);

  const restingOffset = len != null ? len * (1 - target / 100) : 0;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      <svg width={24} height={24} viewBox="0 0 24.0039 24.0039">
        {instant || len == null ? (
          <path
            ref={pathRef}
            d={svgPaths.pb2c5d00}
            stroke={CITRON}
            strokeWidth={3.33467}
            fill="none"
            strokeDasharray={len ?? undefined}
            strokeDashoffset={instant && len != null ? restingOffset : undefined}
            strokeLinecap="round"
          />
        ) : (
          <motion.path
            d={svgPaths.pb2c5d00}
            stroke={CITRON}
            strokeWidth={3.33467}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={len}
            initial={{ strokeDashoffset: len }}
            animate={{ strokeDashoffset: restingOffset }}
            transition={{ duration: 0.9, ease: "easeOut", delay }}
          />
        )}
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <span
          style={{
            fontFamily: FONT_STACK,
            fontWeight: 300,
            fontSize: 12,
            color: "#fff",
            lineHeight: 1,
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontFamily: FONT_STACK,
            fontWeight: 300,
            fontSize: 12,
            color: "#fff",
            lineHeight: 1,
          }}
        >
          {shown}%
        </span>
      </div>
    </div>
  );
}

function TopBar() {
  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        color: "#fff",
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
  return (
    <div
      style={{
        width: 23,
        height: 30.307,
        border: "1.198px solid rgba(255,255,255,0.5)",
        borderRadius: 17.969,
        boxSizing: "border-box",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "31.62%",
          right: "24.11%",
          bottom: "31.64%",
          left: "24.1%",
          transform: "rotate(180deg)",
        }}
      >
        <svg width="100%" height="100%" viewBox="0 0 11.912 11.1363" preserveAspectRatio="xMidYMid meet" fill="none">
          <path d={svgPaths.p1ac2f840} fill="#fff" fillOpacity={0.5} />
        </svg>
      </div>
    </div>
  );
}

function StatusBar({ invert = false }: { invert?: boolean }) {
  const color = invert ? "#fff" : "#000";
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
        zIndex: 2,
      }}
    >
      <span
        style={{
          fontFamily: FONT_STACK,
          fontSize: 11,
          color,
          letterSpacing: 0.05,
        }}
      >
        9:41
      </span>
      <div
        style={{
          width: 20,
          height: 12.5,
          border: `1.25px solid ${color}`,
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
            background: color,
            borderRadius: 7.5,
          }}
        />
      </div>
    </div>
  );
}

/* --------------- COMPARE ALTERNATIVES --------------- */

function CompareAlternatives() {
  // Three columns of width 58, gap 7. Row label sits at left edge.
  const colsWidth = COL_WIDTH * 3 + COL_GAP * 2; // 186

  return (
    <div style={{ padding: "30px 20px 0", display: "flex", flexDirection: "column", gap: 9 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <p style={{ margin: 0, fontFamily: "'Besley', serif", fontSize: 16, color: "#000" }}>
          Compare Alternatives
        </p>
        <p
          style={{
            margin: 0,
            fontFamily: FONT_STACK,
            fontWeight: 300,
            fontSize: 14,
            color: "rgba(0,0,0,0.3)",
            letterSpacing: 0.7,
          }}
        >
          3/12
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%" }}>
        {/* Thumbnail row */}
        <CompareRow
          label=""
          values={[
            <Thumb key="t1" src={compareCol1} selected />,
            <Thumb key="t2" src={compareCol2} />,
            <Thumb key="t3" src={compareCol3} />,
          ]}
          colsWidth={colsWidth}
        />

        <CompareRow
          label="Match"
          values={[
            <MatchPill key="m1">91%</MatchPill>,
            <Plain key="m2">85%</Plain>,
            <Plain key="m3">81%</Plain>,
          ]}
          colsWidth={colsWidth}
        />
        <CompareRow
          label="Price"
          values={[<Plain key="p1">$146</Plain>, <Plain key="p2">$132</Plain>, <Plain key="p3">$120</Plain>]}
          colsWidth={colsWidth}
        />
        <CompareRow
          label="Style"
          values={[
            <Plain key="s1">Boutique</Plain>,
            <Plain key="s2">Coastal</Plain>,
            <Plain key="s3">Classic</Plain>,
          ]}
          colsWidth={colsWidth}
        />
        <CompareRow
          label="Location"
          values={[
            <Plain key="l1">0.3 km</Plain>,
            <Plain key="l2">1.2 km</Plain>,
            <Plain key="l3">2 km</Plain>,
          ]}
          colsWidth={colsWidth}
        />
        <CompareRow
          label="Reviews"
          values={[<Stars key="r1" />, <Stars key="r2" />, <Stars key="r3" />]}
          colsWidth={colsWidth}
        />
      </div>
    </div>
  );
}

function CompareRow({
  label,
  values,
  colsWidth,
}: {
  label: string;
  values: React.ReactNode[];
  colsWidth: number;
}) {
  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          minHeight: 16,
        }}
      >
        <span
          style={{
            fontFamily: FONT_STACK,
            fontWeight: 300,
            fontSize: 12,
            color: "#000",
            lineHeight: 1.2,
          }}
        >
          {label}
        </span>
        <div
          style={{
            display: "flex",
            gap: COL_GAP,
            width: colsWidth,
            justifyContent: "space-between",
          }}
        >
          {values.map((v, i) => (
            <div
              key={i}
              style={{
                width: COL_WIDTH,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {v}
            </div>
          ))}
        </div>
      </div>
      <div style={{ height: 0.5, background: "rgba(0,0,0,0.15)", width: "100%" }} />
    </>
  );
}

function Thumb({ src, selected }: { src: string; selected?: boolean }) {
  return (
    <div
      style={{
        width: COL_WIDTH,
        height: 53.809,
        borderRadius: 4.023,
        position: "relative",
        overflow: "visible",
      }}
    >
      <img
        src={compareBase}
        alt=""
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", borderRadius: 4.023 }}
      />
      <img
        src={src}
        alt=""
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          borderRadius: 4.023,
          backdropFilter: "blur(16.847px)",
        }}
      />
      {selected && (
        <div
          style={{
            position: "absolute",
            inset: -2,
            border: `2px solid ${PIN}`,
            borderRadius: 6.023,
            pointerEvents: "none",
          }}
        />
      )}
    </div>
  );
}

function MatchPill({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: PIN,
        opacity: 0.9,
        padding: "4px 7px",
        borderRadius: 74.26,
        fontFamily: FONT_STACK,
        fontWeight: 300,
        fontSize: 12,
        color: "#000",
        lineHeight: 1.2,
      }}
    >
      {children}
    </div>
  );
}

function Plain({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        fontFamily: FONT_STACK,
        fontWeight: 300,
        fontSize: 12,
        color: "#000",
        lineHeight: 1.2,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

function Stars() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      <svg width={6.662} height={6.662} viewBox="0 0 6.33559 6.0255">
        <path d={svgPaths.p1371d600} fill="#000" />
      </svg>
      <span
        style={{
          fontFamily: FONT_STACK,
          fontWeight: 300,
          fontSize: 12,
          color: "#000",
          letterSpacing: 0.6,
          lineHeight: 1.2,
        }}
      >
        4.91
      </span>
    </div>
  );
}

/* --------------- WHY WE MATCHED YOU --------------- */

function WhyMatched() {
  return (
    <div style={{ padding: "30px 20px 0", display: "flex", flexDirection: "column", gap: 12 }}>
      <p style={{ margin: 0, fontFamily: "'Besley', serif", fontSize: 16, color: "#000" }}>
        Why we matched you
      </p>

      <WhyRow
        icon={
          <svg width={10} height={17} viewBox="0 0 9.99976 16.9999">
            <path d={svgPaths.p377a480} fill="#000" />
            <path d={svgPaths.p1697e900} fill="#000" />
            <path d={svgPaths.pb9cc900} fill="#000" />
            <path d={svgPaths.p10c8000} fill="#000" />
          </svg>
        }
        title="Walkable to your saved spots"
        sub="4 of your wishlist places within 800m"
      />
      <Divider />
      <WhyRow
        icon={
          <svg width={14.761} height={17} viewBox="0 0 14.7619 17">
            <path d={svgPaths.p3b602780} fill="#000" />
            <path d={svgPaths.p1c9efc80} fill="#000" />
            <path d={svgPaths.p167da380} fill="#000" />
          </svg>
        }
        title="Food scene fits your trips"
        sub="Matches where you ate in Lisbon & Rome"
      />
      <Divider />
      <WhyRow
        icon={
          <svg width={16} height={17} viewBox="0 0 16 17">
            <path d={svgPaths.p2bbce700} fill="#000" />
          </svg>
        }
        title="Quiet area, like your last 3 stays"
        sub="Residential street, low night noise"
      />
      <Divider />
    </div>
  );
}

function Divider() {
  return <div style={{ height: 0.5, background: "rgba(0,0,0,0.15)", width: "100%" }} />;
}

function WhyRow({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      {icon}
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        <p
          style={{
            margin: 0,
            fontFamily: FONT_STACK,
            fontWeight: 500,
            fontSize: 12,
            color: "#000",
            lineHeight: "15.004px",
          }}
        >
          {title}
        </p>
        <p
          style={{
            margin: 0,
            fontFamily: FONT_STACK,
            fontWeight: 300,
            fontSize: 12,
            color: "#000",
            lineHeight: "15.004px",
          }}
        >
          {sub}
        </p>
      </div>
    </div>
  );
}

/* --------------- PRICE + RESERVE --------------- */

function PriceAndReserve() {
  return (
    <div
      style={{
        padding: "30px 20px 0",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 7, width: 160 }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 3 }}>
          <span
            style={{
              fontFamily: "'Besley', serif",
              fontSize: 16,
              color: "#000",
              lineHeight: 1.2,
            }}
          >
            $146
          </span>
          <span
            style={{
              fontFamily: FONT_STACK,
              fontWeight: 300,
              fontSize: 12,
              color: "rgba(0,0,0,0.3)",
              letterSpacing: 0.6,
              lineHeight: 1.2,
            }}
          >
            /night
          </span>
        </div>
        <span
          style={{
            fontFamily: FONT_STACK,
            fontWeight: 300,
            fontSize: 12,
            color: "rgba(0,0,0,0.3)",
            letterSpacing: 0.6,
            lineHeight: 1.2,
          }}
        >
          $1,022 · 7 nights
        </span>
      </div>
      <ReserveButton />
    </div>
  );
}

function ReserveButton() {
  const [hover, setHover] = useState(false);
  const [pressed, setPressed] = useState(false);
  const active = hover || pressed;
  return (
    <button
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => {
        setHover(false);
        setPressed(false);
      }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      style={{
        width: 103,
        padding: 10,
        borderRadius: 76.802,
        border: `0.404px solid ${active ? ACCENT : "rgba(189,142,60,0.4)"}`,
        background: active ? ACCENT : "transparent",
        color: active ? "#fff" : "#000",
        fontFamily: FONT_STACK,
        fontWeight: 300,
        fontSize: 12,
        lineHeight: 1.2,
        cursor: "pointer",
        transition: "background-color 150ms, color 150ms, border-color 150ms",
      }}
    >
      Reserve
    </button>
  );
}

/* --------------- BOTTOM MENU --------------- */

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
        background: CARD_BG,
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
