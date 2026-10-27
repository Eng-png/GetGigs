import { useEffect, useMemo, useState } from "react";
import { addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, isSameDay, isSameMonth, parseISO, startOfMonth, startOfWeek, subMonths } from "date-fns";
import { CalendarDays, ChevronLeft, ChevronRight, Clock3, Trash2 } from "lucide-react";
import type { ArtistAvailability, AvailabilityVisibility } from "../../lib/getgigsData";
import { deleteAvailability, loadAvailabilityVisibility, loadOwnAvailability, loadSharedAvailability, setAvailabilityVisibility, upsertAvailability } from "../../lib/getgigsData";

const FONT = "'Google Sans Flex', 'Google Sans', Inter, sans-serif";
const INK = "#11100e";
const PAPER = "#fdfaf6";
const CITRON = "#e6e83c";
const GOLD = "#bd8e3c";

type Status = ArtistAvailability["status"];
const statusLabel: Record<Status, string> = { available: "Available", tentative: "Tentative", unavailable: "Unavailable" };
const statusColor: Record<Status, string> = { available: CITRON, tentative: "#efe4cb", unavailable: "#e5e1db" };

export default function AvailabilityCalendar({ userId, mode = "owner", artistIds = [], title = "Availability" }: { userId?: string; mode?: "owner" | "shared"; artistIds?: string[]; title?: string }) {
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [entries, setEntries] = useState<ArtistAvailability[]>([]);
  const [visibility, setVisibility] = useState<AvailabilityVisibility>("private");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [draft, setDraft] = useState<{ id?: string; status: Status; start: string; end: string; timezone: string; note: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const canEdit = mode === "owner" && Boolean(userId);
  const range = useMemo(() => ({ from: startOfMonth(month).toISOString(), to: addMonths(startOfMonth(month), 1).toISOString() }), [month]);

  const refresh = async () => {
    if (mode === "owner" && !userId) { setEntries([]); setLoading(false); return; }
    setLoading(true); setError("");
    try {
      const next = mode === "owner"
        ? await loadOwnAvailability(userId!, range.from, range.to)
        : await loadSharedAvailability(artistIds.length ? artistIds : userId ? [userId] : [], range.from, range.to);
      setEntries(next);
      if (mode === "owner") setVisibility(await loadAvailabilityVisibility(userId!));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load availability.");
    } finally { setLoading(false); }
  };

  useEffect(() => { void refresh(); }, [userId, mode, artistIds.join(","), range.from, range.to]);

  const days = eachDayOfInterval({ start: startOfWeek(startOfMonth(month)), end: endOfWeek(endOfMonth(month)) });
  const entriesForDay = (day: Date) => entries.filter((entry) => isSameDay(parseISO(entry.starts_at), day));
  const selectDay = (day: Date) => {
    setSelectedDate(day);
    const existing = entriesForDay(day)[0];
    setDraft(existing ? { id: existing.id, status: existing.status, start: format(parseISO(existing.starts_at), "HH:mm"), end: format(parseISO(existing.ends_at), "HH:mm"), timezone: existing.timezone, note: existing.note || "" } : { status: "available", start: "18:00", end: "22:00", timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC", note: "" });
    setMessage("");
  };
  const saveEntry = async () => {
    if (!userId || !selectedDate || !draft) return;
    setSaving(true); setError("");
    try {
      const date = format(selectedDate, "yyyy-MM-dd");
      const starts = zonedDateTimeToUtc(date, draft.start, draft.timezone);
      const ends = zonedDateTimeToUtc(date, draft.end, draft.timezone);
      if (ends <= starts) throw new Error("End time must be after start time.");
      const saved = await upsertAvailability({ id: draft.id, artist_user_id: userId, starts_at: starts.toISOString(), ends_at: ends.toISOString(), timezone: draft.timezone, status: draft.status, note: draft.note.trim() });
      setEntries((current) => [...current.filter((entry) => entry.id !== saved.id && !isSameDay(parseISO(entry.starts_at), selectedDate)), saved].sort((a, b) => a.starts_at.localeCompare(b.starts_at)));
      setMessage("Availability saved.");
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Could not save availability."); } finally { setSaving(false); }
  };
  const removeEntry = async () => {
    if (!userId || !draft?.id) return;
    setSaving(true); setError("");
    try { await deleteAvailability(userId, draft.id); setEntries((current) => current.filter((entry) => entry.id !== draft.id)); setDraft(null); setMessage("Availability removed."); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "Could not remove availability."); } finally { setSaving(false); }
  };
  const changeVisibility = async (next: AvailabilityVisibility) => {
    if (!userId) return;
    setVisibility(next); setError("");
    try { await setAvailabilityVisibility(userId, next); setMessage("Sharing settings saved."); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "Could not update sharing settings."); }
  };

  return <section style={{ fontFamily: FONT, color: INK }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 14 }}><div><span style={{ color: GOLD, fontSize: 8, fontWeight: 700, letterSpacing: 1.4, textTransform: "uppercase" }}>Gig windows</span><h2 style={{ margin: "6px 0 0", fontFamily: "'Nyght Serif', 'Iowan Old Style', serif", fontSize: 28, fontWeight: 500 }}>{title}</h2></div><CalendarDays size={22} /></div>
    {canEdit && <label style={{ display: "grid", gap: 6, marginBottom: 14, fontSize: 9 }}><span>Who can see your gig availability?</span><select value={visibility} onChange={(event) => void changeVisibility(event.target.value as AvailabilityVisibility)} style={inputStyle}><option value="private">Only me</option><option value="connections">My connections</option><option value="public">Published Artist Network</option></select></label>}
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}><button type="button" onClick={() => setMonth(subMonths(month, 1))} style={navButton} aria-label="Previous month"><ChevronLeft size={15}/></button><strong style={{ fontFamily: "'Nyght Serif', 'Iowan Old Style', serif", fontSize: 20 }}>{format(month, "MMMM yyyy")}</strong><button type="button" onClick={() => setMonth(addMonths(month, 1))} style={navButton} aria-label="Next month"><ChevronRight size={15}/></button></div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: 5, marginBottom: 5 }}>{["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((day) => <span key={day} style={{ textAlign: "center", color: "rgba(0,0,0,.45)", fontSize: 8 }}>{day}</span>)}</div>
    {loading ? <p style={helperStyle}>Loading availability…</p> : <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: 5 }}>{days.map((day) => { const dayEntries = entriesForDay(day); const strongest = dayEntries.find((entry) => entry.status === "available") || dayEntries[0]; const availableCount = new Set(dayEntries.filter((entry) => entry.status === "available").map((entry) => entry.artist_user_id)).size; const tentativeCount = new Set(dayEntries.filter((entry) => entry.status === "tentative").map((entry) => entry.artist_user_id)).size;     const allAvailable = mode === "shared" && artistIds.length > 1 && hasSharedAvailableOverlap(dayEntries, artistIds); return <button key={day.toISOString()} type="button" disabled={!canEdit && mode === "owner"} onClick={() => selectDay(day)} style={{ minHeight: 58, padding: 5, border: allAvailable ? `2px solid ${CITRON}` : selectedDate && isSameDay(selectedDate, day) ? `2px solid ${INK}` : "1px solid rgba(0,0,0,.12)", borderRadius: 10, background: strongest ? statusColor[strongest.status] : isSameMonth(day, month) ? "#f4efe7" : "#eeeae4", color: isSameMonth(day, month) ? INK : "rgba(0,0,0,.3)", cursor: canEdit ? "pointer" : "default", opacity: isSameMonth(day, month) ? 1 : .55 }}><span style={{ display: "block", textAlign: "left", fontSize: 9 }}>{format(day, "d")}</span>{mode === "shared" && artistIds.length > 1 ? <small style={{ display: "block", marginTop: 8, fontSize: 7, fontWeight: 700 }}>{availableCount}/{artistIds.length} available{tentativeCount ? ` · ${tentativeCount} tentative` : ""}</small> : strongest && <small style={{ display: "block", marginTop: 8, fontSize: 7, fontWeight: 700 }}>{statusLabel[strongest.status]}</small>}</button>; })}</div>}
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 13, fontSize: 8 }}>{(["available","tentative","unavailable"] as Status[]).map((status) => <span key={status} style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><i style={{ width: 10, height: 10, borderRadius: 3, background: statusColor[status], border: "1px solid rgba(0,0,0,.15)" }}/>{statusLabel[status]}</span>)}</div>
    {canEdit && selectedDate && draft && <div style={{ marginTop: 16, padding: 14, borderRadius: 15, background: "#f0ebe3" }}><strong style={{ fontFamily: "'Nyght Serif', 'Iowan Old Style', serif", fontSize: 19 }}>{format(selectedDate, "EEEE, MMMM d")}</strong><div style={{ display: "grid", gap: 8, marginTop: 11 }}><select value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value as Status })} style={inputStyle}>{(Object.keys(statusLabel) as Status[]).map((status) => <option key={status} value={status}>{statusLabel[status]}</option>)}</select><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}><label style={smallLabel}><Clock3 size={12}/>Start<input type="time" value={draft.start} onChange={(event) => setDraft({ ...draft, start: event.target.value })} style={inputStyle}/></label><label style={smallLabel}><Clock3 size={12}/>End<input type="time" value={draft.end} onChange={(event) => setDraft({ ...draft, end: event.target.value })} style={inputStyle}/></label></div><select value={draft.timezone} onChange={(event) => setDraft({ ...draft, timezone: event.target.value })} style={inputStyle}>{[draft.timezone, "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles", "UTC"].filter((value, index, values) => values.indexOf(value) === index).map((zone) => <option key={zone}>{zone}</option>)}</select><input value={draft.note} onChange={(event) => setDraft({ ...draft, note: event.target.value })} placeholder="Optional gig note" style={inputStyle}/><div style={{ display: "flex", gap: 7 }}><button type="button" disabled={saving} onClick={() => void saveEntry()} style={primaryButton}>{saving ? "Saving…" : "Save date"}</button>{draft.id && <button type="button" disabled={saving} onClick={() => void removeEntry()} style={deleteButton}><Trash2 size={13}/> Remove</button>}</div></div></div>}
    {!canEdit && !loading && !entries.length && <p style={helperStyle}>No shared gig windows are listed for this month.</p>}
    {message && <p role="status" style={{ color: "#536000", fontSize: 9 }}>{message}</p>}{error && <p role="alert" style={{ color: "#812d24", fontSize: 9 }}>{error}</p>}<p style={helperStyle}>Only add windows when you would genuinely consider rehearsing or playing a show. This is gig availability, not your private calendar.</p>
  </section>;
}

const inputStyle: React.CSSProperties = { minHeight: 36, boxSizing: "border-box", width: "100%", padding: "0 9px", border: "1px solid rgba(0,0,0,.18)", borderRadius: 9, background: PAPER, color: INK, fontFamily: FONT, fontSize: 9 };
const navButton: React.CSSProperties = { width: 31, height: 31, display: "grid", placeItems: "center", border: "1px solid rgba(0,0,0,.16)", borderRadius: "50%", background: "#f0ebe3", color: INK, cursor: "pointer" };
const primaryButton: React.CSSProperties = { minHeight: 34, padding: "0 13px", border: 0, borderRadius: 999, background: CITRON, color: INK, fontFamily: FONT, fontSize: 9, fontWeight: 700, cursor: "pointer" };
const deleteButton: React.CSSProperties = { ...primaryButton, display: "inline-flex", alignItems: "center", gap: 5, background: "#f7deda", color: "#812d24" };
const smallLabel: React.CSSProperties = { display: "grid", gap: 4, fontSize: 8 };
const helperStyle: React.CSSProperties = { color: "rgba(0,0,0,.5)", fontSize: 9, lineHeight: 1.5 };

function zonedDateTimeToUtc(date: string, time: string, timezone: string): Date {
  const [year, month, day] = date.split("-").map(Number);
  const [hours, minutes] = time.split(":").map(Number);
  const desiredUtc = Date.UTC(year, month - 1, day, hours, minutes);
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(desiredUtc));
  const values = Object.fromEntries(parts.filter((part) => part.type !== "literal").map((part) => [part.type, Number(part.value)]));
  const displayedUtc = Date.UTC(values.year, values.month - 1, values.day, values.hour, values.minute);
  return new Date(desiredUtc - (displayedUtc - desiredUtc));
}

function hasSharedAvailableOverlap(entries: ArtistAvailability[], artistIds: string[]): boolean {
  const windows = artistIds.map((artistId) => entries.filter((entry) => entry.artist_user_id === artistId && entry.status === "available"));
  if (windows.some((artistWindows) => !artistWindows.length)) return false;
  const [first, ...rest] = windows;
  return first.some((candidate) => rest.every((artistWindows) => artistWindows.some((entry) => {
    const start = Math.max(Date.parse(candidate.starts_at), Date.parse(entry.starts_at));
    const end = Math.min(Date.parse(candidate.ends_at), Date.parse(entry.ends_at));
    return start < end;
  })));
}
