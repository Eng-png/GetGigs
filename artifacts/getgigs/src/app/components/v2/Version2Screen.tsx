import { useMemo, useState } from "react";
import { Bookmark, CalendarDays, DollarSign, MapPin, MicVocal, Music2 } from "lucide-react";
import { motion } from "motion/react";
import type { Opportunity } from "../../data/opportunities";
import OpportunityDetailScreen from "../opportunities/OpportunityDetailScreen";

const FONT = "'Google Sans Flex', 'Google Sans', Inter, sans-serif";
const SERIF = "'Besley', 'Nyght Serif', 'Iowan Old Style', serif";
const PAPER = "#fdfaf6";
const OLIVE = "#857e38";
const CITRON = "#ddd864";

type FilterKey = "all" | "opening" | "showcase" | "support" | "boston" | "cambridge" | "paid";

const FILTERS: Array<{ key: FilterKey; label: string }> = [
  { key: "all", label: "All" },
  { key: "opening", label: "Opening Slots" },
  { key: "showcase", label: "Showcase" },
  { key: "support", label: "Support" },
  { key: "boston", label: "Boston" },
  { key: "cambridge", label: "Cambridge" },
  { key: "paid", label: "Paid" },
];

export default function Version2Screen({
  noScroll = false,
  savedOpportunityIds,
  onToggleSaved,
  onApply,
  onExplore,
  opportunities,
  accessMode = "guest",
  onRequireAuth,
}: {
  noScroll?: boolean;
  savedOpportunityIds: Set<string>;
  onToggleSaved: (opportunityId: string) => void;
  onApply: (opportunity: Opportunity) => void;
  onExplore: () => void;
  opportunities: Opportunity[];
  accessMode?: "guest" | "authenticated" | "demo";
  onRequireAuth?: () => void;
}) {
  const [filter, setFilter] = useState<FilterKey>("all");
  const [selected, setSelected] = useState<Opportunity | null>(null);
  const saved = useMemo(() => opportunities.filter((opportunity) => savedOpportunityIds.has(opportunity.id)), [savedOpportunityIds, opportunities]);
  const filtered = saved.filter((opportunity) => matchesFilter(opportunity, filter));

  if (selected) {
    return <OpportunityDetailScreen opportunity={selected} saved={savedOpportunityIds.has(selected.id)} accessMode={accessMode} onRequireAuth={onRequireAuth} onBack={() => setSelected(null)} onApply={onApply} onToggleSaved={(id) => { onToggleSaved(id); if (savedOpportunityIds.has(id)) setSelected(null); }} />;
  }

  return (
    <div data-no-edit style={{ width: "100%", height: "100%", position: "relative", overflow: "hidden", background: PAPER, color: "#000", fontFamily: FONT }}>
      <style>{`.saved-scroll::-webkit-scrollbar,.saved-filters::-webkit-scrollbar{display:none}`}</style>
      <div className="saved-scroll" style={{ position: "absolute", inset: 0, overflowY: noScroll ? "hidden" : "auto", scrollbarWidth: "none", paddingBottom: 112 }}>
        <StatusBar />
        <TopBar />
        <Header count={saved.length} />

        {saved.length > 0 ? (
          <>
            <FilterRow selected={filter} onSelect={setFilter} />
            <div style={{ padding: "14px 20px 0" }}>
              {filtered.length ? filtered.map((opportunity, index) => (
                <motion.div key={opportunity.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: noScroll ? 0 : .04 * index, duration: .24 }}>
                  <SavedOpportunityCard opportunity={opportunity} onOpen={() => { setSelected(opportunity); if (accessMode === "guest") onRequireAuth?.(); }} onUnsave={() => onToggleSaved(opportunity.id)} />
                </motion.div>
              )) : <FilteredEmpty onClear={() => setFilter("all")} />}
            </div>
          </>
        ) : <EmptyState onExplore={onExplore} />}
      </div>
    </div>
  );
}

function matchesFilter(opportunity: Opportunity, filter: FilterKey) {
  const title = opportunity.opportunityTitle.toLowerCase();
  if (filter === "all") return true;
  if (filter === "opening") return title.includes("opening");
  if (filter === "showcase") return title.includes("showcase") || title.includes("singer-songwriter");
  if (filter === "support") return title.includes("support");
  if (filter === "boston") return opportunity.city === "Boston";
  if (filter === "cambridge") return opportunity.city === "Cambridge";
  return !opportunity.compensationSummary.toLowerCase().includes("unpaid");
}

function StatusBar() {
  return <div style={{ height: 54, padding: "18px 20px 0", display: "flex", justifyContent: "space-between", boxSizing: "border-box", fontSize: 11 }}><span>9:41</span><span style={{ width: 20, height: 12, border: "1.25px solid #000", borderRadius: 8, display: "grid", placeItems: "center" }}><span style={{ width: 10, height: 5, borderRadius: 5, background: "#000" }}/></span></div>;
}

function TopBar() {
  return <div style={{ height: 72, padding: "18px 20px 0", display: "flex", alignItems: "flex-start", justifyContent: "space-between", boxSizing: "border-box" }}><span style={{ fontSize: 14 }}>←</span><span style={{ fontFamily: SERIF, fontSize: 19 }}>Yondr</span></div>;
}

function Header({ count }: { count: number }) {
  return (
    <header style={{ padding: "7px 20px 25px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 27, height: 34, border: "1px solid rgba(0,0,0,.4)", borderRadius: 18, display: "grid", placeItems: "center" }}><Music2 size={13} strokeWidth={1.6}/></div>
        <div>
          <h1 style={{ margin: 0, fontFamily: FONT, fontSize: 17, fontWeight: 500 }}>Your saved opportunities</h1>
          <p style={{ margin: "5px 0 0", color: "rgba(0,0,0,.5)", fontSize: 12 }}>Gigs and venues you want to revisit</p>
        </div>
      </div>
      <p style={{ margin: "17px 0 0", color: "rgba(0,0,0,.36)", fontSize: 11 }}>{count} saved {count === 1 ? "opportunity" : "opportunities"}</p>
    </header>
  );
}

function FilterRow({ selected, onSelect }: { selected: FilterKey; onSelect: (filter: FilterKey) => void }) {
  return (
    <div className="saved-filters" style={{ overflowX: "auto", scrollbarWidth: "none", padding: "0 20px", WebkitOverflowScrolling: "touch" }}>
      <div style={{ width: "max-content", display: "flex", gap: 6 }}>
        {FILTERS.map((filter) => {
          const active = filter.key === selected;
          return <button type="button" key={filter.key} onClick={() => onSelect(filter.key)} style={{ minHeight: 30, padding: "0 10px", border: 0, borderRadius: 999, background: active ? OLIVE : "rgba(133,126,56,.1)", color: active ? PAPER : "#000", fontFamily: FONT, fontSize: 11, cursor: "pointer", whiteSpace: "nowrap" }}>{filter.label}</button>;
        })}
      </div>
    </div>
  );
}

function SavedOpportunityCard({ opportunity, onOpen, onUnsave }: { opportunity: Opportunity; onOpen: () => void; onUnsave: () => void }) {
  return (
    <article style={{ position: "relative", marginBottom: 12, border: "1px solid rgba(0,0,0,.08)", borderRadius: 17, overflow: "hidden", background: PAPER, boxShadow: "0 7px 22px rgba(0,0,0,.045)" }}>
      <button type="button" onClick={onOpen} aria-label={`Open ${opportunity.venueName}: ${opportunity.opportunityTitle}`} style={{ width: "100%", padding: 12, border: 0, display: "grid", gridTemplateColumns: "98px minmax(0,1fr)", gap: 14, background: "transparent", textAlign: "left", cursor: "pointer" }}>
        <div style={{ height: 118, borderRadius: 12, background: `url(${opportunity.image}) center/cover no-repeat` }} />
        <div style={{ minWidth: 0, paddingRight: 34 }}>
          <span style={{ display: "inline-block", marginBottom: 7, padding: "5px 8px", borderRadius: 999, background: CITRON, fontSize: 10 }}>{opportunity.matchScore}% Match</span>
          <h2 style={{ margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: SERIF, fontSize: 18, fontWeight: 500 }}>{opportunity.venueName}</h2>
          <p style={{ margin: "3px 0 9px", color: "rgba(0,0,0,.56)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 10 }}>{opportunity.opportunityTitle}</p>
          <InfoLine icon={<MapPin size={11}/>} text={`${opportunity.city}, ${opportunity.state}`} />
          <InfoLine icon={<CalendarDays size={11}/>} text={opportunity.date} />
          <InfoLine icon={<DollarSign size={11}/>} text={opportunity.compensationSummary} />
        </div>
      </button>
      <button type="button" onClick={onUnsave} aria-label={`Remove ${opportunity.venueName} from Saved`} title="Remove from Saved" style={{ position: "absolute", top: 12, right: 12, width: 34, height: 34, padding: 0, border: "1px solid rgba(0,0,0,.14)", borderRadius: "50%", display: "grid", placeItems: "center", background: "rgba(253,250,246,.92)", color: "#000", cursor: "pointer" }}><Bookmark size={15} fill="currentColor"/></button>
    </article>
  );
}

function InfoLine({ icon, text }: { icon: React.ReactNode; text: string }) {
  return <div style={{ minWidth: 0, marginTop: 5, display: "flex", alignItems: "center", gap: 6, fontSize: 9.5 }}><span style={{ width: 12, flex: "0 0 12px", display: "grid", placeItems: "center" }}>{icon}</span><span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{text}</span></div>;
}

function EmptyState({ onExplore }: { onExplore: () => void }) {
  return <div style={{ minHeight: 390, padding: "50px 30px", display: "grid", placeItems: "center", textAlign: "center" }}><div><div style={{ width: 66, height: 66, margin: "0 auto", borderRadius: "50%", display: "grid", placeItems: "center", background: "rgba(221,216,100,.28)" }}><Bookmark size={25} strokeWidth={1.5}/></div><h2 style={{ margin: "20px 0 8px", fontFamily: SERIF, fontSize: 28, fontWeight: 500 }}>No saved gigs yet</h2><p style={{ margin: "0 auto", maxWidth: 280, color: "rgba(0,0,0,.5)", fontSize: 11, lineHeight: 1.55 }}>Save opportunities from Explore and they’ll appear here.</p><button type="button" onClick={onExplore} style={{ minHeight: 42, marginTop: 20, padding: "0 18px", border: "1px solid #000", borderRadius: 999, background: CITRON, fontFamily: FONT, fontSize: 10, fontWeight: 650, cursor: "pointer" }}>Explore Gigs</button></div></div>;
}

function FilteredEmpty({ onClear }: { onClear: () => void }) {
  return <div style={{ padding: "70px 20px", textAlign: "center" }}><MicVocal size={24} strokeWidth={1.4}/><h2 style={{ margin: "14px 0 6px", fontFamily: SERIF, fontSize: 22, fontWeight: 500 }}>No saved gigs in this filter</h2><button type="button" onClick={onClear} style={{ marginTop: 10, border: 0, background: "transparent", color: "#72520f", fontFamily: FONT, fontSize: 10, textDecoration: "underline", cursor: "pointer" }}>View all saved gigs</button></div>;
}
