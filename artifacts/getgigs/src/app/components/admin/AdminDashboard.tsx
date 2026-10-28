import { useEffect, useMemo, useState } from "react";
import { Activity, Building2, LayoutDashboard, Music2, Pencil, ShieldCheck, TicketCheck, Trash2, Users } from "lucide-react";
import type { Opportunity } from "../../data/opportunities";
import type { UserProfile } from "../../lib/authTypes";
import { loadAdminActivity, loadAdminArtistRows, loadAdminBookerRows, loadAdminUsers, loadSiteContent, saveAllSiteContent, saveSiteContent, setAccountStatus, updateAdminUser, deleteAdminUser, type AdminActivity } from "../../lib/getgigsData";
import ManageVenuesScreen from "./ManageVenuesScreen";
import AdminArtistEditor from "./AdminArtistEditor";

type Tab = "dashboard" | "users" | "artists" | "bookers" | "venues" | "opportunities" | "reports" | "manage" | "content" | "typography" | "activity";

const TABS: Array<[Tab,string,React.ComponentType<{size?:number}>]> = [
  ["dashboard","Dashboard",LayoutDashboard],["users","Users",Users],["artists","Artists",Music2],["bookers","Bookers",Building2],["venues","Venues",TicketCheck],["opportunities","Opportunities",Activity],["reports","Reports",ShieldCheck],["manage","Manage Venues",Building2],["content","Site Content",Pencil],["typography","Typography",Pencil],["activity","Activity",Activity],
];

export default function AdminDashboard({ venues, onVenuesChange, actorId }: { venues: Opportunity[]; onVenuesChange:(venues:Opportunity[])=>Promise<void>; actorId: string }) {
  const [tab,setTab]=useState<Tab>("dashboard");
  const [users,setUsers]=useState<UserProfile[]>([]);
  const [artists,setArtists]=useState<Record<string,unknown>[]>([]);
  const [bookers,setBookers]=useState<Record<string,unknown>[]>([]);
  const [filter,setFilter]=useState<"all"|"artist"|"booker"|"admin">("all");
  const [notice,setNotice]=useState("");
  const [content,setContent]=useState<Record<string,string>>({});
  const [activity,setActivity]=useState<AdminActivity[]>([]);
  const [editingArtist,setEditingArtist]=useState<{id:string;name:string}|null>(null);

  const reload=()=>Promise.all([loadAdminUsers(),loadAdminArtistRows(),loadAdminBookerRows(),loadSiteContent(),loadAdminActivity()]).then(([u,a,b,c,events])=>{setUsers(u);setArtists(a as Record<string,unknown>[]);setBookers(b as Record<string,unknown>[]);setContent(c);setActivity(events);}).catch((error)=>setNotice(error instanceof Error?error.message:"Could not load admin records."));
  useEffect(()=>{void reload();},[]);
  const filtered=useMemo(()=>filter==="all"?users:users.filter((user)=>user.role===filter),[filter,users]);

  if(tab==="manage") return <ManageVenuesScreen venues={venues} onChange={onVenuesChange} onClose={()=>setTab("dashboard")}/>;
  if(editingArtist) return <div className="gg-role-shell gg-admin-shell"><AdminArtistEditor userId={editingArtist.id} actorId={actorId} artistName={editingArtist.name} onClose={()=>setEditingArtist(null)} onSaved={()=>{setEditingArtist(null);void reload();}}/></div>;
  return <div className="gg-role-shell gg-admin-shell"><header className="gg-role-header"><div><span className="gg-kicker">Secure administrator workspace</span><h1>GetGigs Admin</h1><p>User and platform records are authorized by database policies, not by hidden buttons.</p></div></header>{notice&&<div className="gg-role-notice">{notice}</div>}<div className="gg-admin-tabs">{TABS.map(([id,label,Icon])=><button key={id} className={tab===id?"active":""} onClick={()=>setTab(id)}><Icon size={14}/>{label}</button>)}</div><div className="gg-role-content">
    {tab==="dashboard"&&<><section className="gg-metrics">{[[users.length,"Total users"],[users.filter(u=>u.role==="artist").length,"Artists"],[users.filter(u=>u.role==="booker").length,"Bookers"],[venues.length,"Venues"]].map(([value,label])=><article key={String(label)}><strong>{value}</strong><span>{label}</span></article>)}</section><section className="gg-admin-table"><h2>Recent activity</h2>{users.slice(0,6).map((user)=><div key={user.id}><span><strong>{user.display_name||"Unnamed account"}</strong><small>{user.email}</small></span><span>{user.role}</span><span>{formatDate(user.created_at)}</span></div>)}</section></>}
    {tab==="users"&&<section><div className="gg-role-title"><span className="gg-kicker">Registered accounts</span><h2>Users</h2></div><div className="gg-filter-row">{(["all","artist","booker","admin"] as const).map(value=><button key={value} className={filter===value?"active":""} onClick={()=>setFilter(value)}>{value==="booker"?"Looking for Artist":value}</button>)}</div><div className="gg-admin-table">{filtered.map(user=><div key={user.id}><span><strong>{user.display_name||"Unnamed account"}</strong><small>{user.email}</small></span><span>{user.role}<small>{user.account_status}</small></span><span>{formatDate(user.created_at)}</span><span className="gg-user-actions"><button onClick={async()=>{const displayName=window.prompt("Display name",user.display_name);if(displayName===null)return;const city=window.prompt("City",user.city);if(city===null)return;await updateAdminUser(user.id,{display_name:displayName,city},actorId);await reload();}}><Pencil size={13}/> Edit</button><button onClick={async()=>{await setAccountStatus(user.id,user.account_status==="active"?"suspended":"active");await reload();}}>{user.account_status==="active"?"Suspend":"Reactivate"}</button>{user.id!==actorId&&<button className="danger" onClick={async()=>{if(window.confirm(`Permanently delete ${user.display_name||user.email}?`)){await deleteAdminUser(user.id);await reload();}}}><Trash2 size={13}/> Delete</button>}</span></div>)}</div></section>}
    {tab==="artists"&&<ArtistOverview rows={artists} onEdit={(id,name)=>setEditingArtist({id,name})}/>}
    {tab==="bookers"&&<DataOverview title="Looking for Artist accounts" rows={bookers} primary="organization_name" secondary="email" fields={["contact_name","location","venue_type","profile_status","account_status"]}/>}
    {tab==="venues"&&<DataOverview title="Venues" rows={venues.map(v=>({name:v.venueName,location:`${v.city}, ${v.state}`,verification:v.dataQuality.verificationStatus,type:v.publicInfo.venueType,sample:v.dataQuality.isDemo?"Sample / Demo":"Live"}))} primary="name" secondary="location" fields={["type","verification","sample"]}/>}
    {tab==="opportunities"&&<Placeholder title="Opportunities" copy="Booker-created opportunities are stored per account and available for moderation through database-authorized records."/>}
    {tab==="reports"&&<Placeholder title="Reports" copy="User-submitted platform reports will appear here for administrator review."/>}
    {tab==="content"&&<ContentEditor content={content} actorId={actorId} onSaved={reload}/>}
    {tab==="typography"&&<TypographyEditor content={content} actorId={actorId} onSaved={reload}/>}
    {tab==="activity"&&<ActivityOverview rows={activity}/>}
  </div></div>;
}

function ArtistOverview({ rows, onEdit }: { rows: Record<string,unknown>[]; onEdit: (id:string,name:string)=>void }) {
  return <section><div className="gg-role-title"><span className="gg-kicker">Artist management</span><h2>Artists</h2><p>{rows.length} records · edit full profile JSON including image URLs and booking details.</p></div><div className="gg-admin-records">{rows.map((row,index)=><article key={String(row.id||index)}><div><strong>{String(row.artist_name||"Not added")}</strong><small>{String(row.account_email||"")}</small></div><dl><div><dt>Genres</dt><dd>{String(row.genres||"—")}</dd></div><div><dt>Location</dt><dd>{String(row.city||"—")}</dd></div><div><dt>Status</dt><dd>{String(row.account_status||"—")}</dd></div></dl><button type="button" onClick={()=>onEdit(String(row.id),String(row.artist_name||"Artist"))}><Pencil size={14}/> Edit artist</button></article>)}</div></section>;
}
function ContentEditor({ content, actorId, onSaved }: { content: Record<string,string>; actorId:string; onSaved:()=>Promise<unknown>|void }) {
  const [values,setValues]=useState(content); const [busy,setBusy]=useState(false);
  const [status,setStatus]=useState<{type:"success"|"error";message:string}|null>(null);
  useEffect(()=>setValues(content),[content]);
  const saveAll=async()=>{setBusy(true);setStatus(null);try{await saveAllSiteContent(values,actorId);await onSaved();setStatus({type:"success",message:"All changes saved successfully."});}catch(error){setStatus({type:"error",message:error instanceof Error?error.message:"Could not save the changes. Please try again."});}finally{setBusy(false);}};
  return <section><div className="gg-role-title"><span className="gg-kicker">Live website copy</span><h2>Site Content</h2><p>These values are stored privately and can be updated without changing application logic.</p></div><div className="gg-content-editor">{Object.entries(values).map(([key,value])=><label key={key}><span>{key}</span><textarea value={value} onChange={event=>{setStatus(null);setValues(current=>({...current,[key]:event.target.value}));}}/></label>)}<div className="gg-content-save-all">{status&&<p className={status.type} role="status">{status.message}</p>}<button type="button" disabled={busy} onClick={()=>void saveAll()}>{busy?"Saving all changes…":"Save all changes"}</button></div></div></section>;
}
function TypographyEditor({ content, actorId, onSaved }: { content: Record<string,string>; actorId:string; onSaved:()=>Promise<unknown>|void }) {
  const [values,setValues]=useState({ family: content["style.detail.fontFamily"] || "'Google Sans Flex', 'Google Sans', Inter, sans-serif", size: content["style.detail.fontSize"] || "11px", color: content["style.detail.color"] || "#11100e" });
  const [busy,setBusy]=useState(false);
  useEffect(()=>setValues({ family: content["style.detail.fontFamily"] || "'Google Sans Flex', 'Google Sans', Inter, sans-serif", size: content["style.detail.fontSize"] || "11px", color: content["style.detail.color"] || "#11100e" }),[content]);
  const save=async()=>{setBusy(true);try{await saveSiteContent("style.detail.fontFamily",values.family,actorId);await saveSiteContent("style.detail.fontSize",values.size,actorId);await saveSiteContent("style.detail.color",values.color,actorId);document.documentElement.style.setProperty("--gg-detail-font-family",values.family);document.documentElement.style.setProperty("--gg-detail-font-size",values.size);document.documentElement.style.setProperty("--gg-detail-color",values.color);await onSaved();}finally{setBusy(false);}};
  return <section><div className="gg-role-title"><span className="gg-kicker">Venue details styling</span><h2>Typography</h2><p>Controls apply to non-heading labels and values on venue/details pages. Headings keep their existing design.</p></div><div className="gg-typography-editor"><label><span>Font family</span><select value={values.family} onChange={event=>setValues(current=>({...current,family:event.target.value}))}><option value="'Google Sans Flex', 'Google Sans', Inter, sans-serif">Current small/body font</option><option value="Inter, sans-serif">Inter</option><option value="'Besley', serif">Besley</option><option value="system-ui, sans-serif">System UI</option></select></label><label><span>Font size</span><input type="text" value={values.size} onChange={event=>setValues(current=>({...current,size:event.target.value}))} placeholder="11px"/></label><label><span>Text color</span><input type="color" value={/^#[0-9a-f]{6}$/i.test(values.color) ? values.color : "#11100e"} onChange={event=>setValues(current=>({...current,color:event.target.value}))}/></label><button type="button" className="primary" disabled={busy} onClick={()=>void save()}>{busy ? "Saving…" : "Save typography"}</button></div></section>;
}
function ActivityOverview({ rows }: { rows: AdminActivity[] }) { return <section><div className="gg-role-title"><span className="gg-kicker">Audit trail</span><h2>User Activity</h2><p>{rows.length} recent events. Sensitive credentials are never recorded.</p></div><div className="gg-admin-table">{rows.map(row=><div key={row.id}><span><strong>{row.activity_type.replaceAll("_"," ")}</strong><small>{row.subject_user_id||"System"}</small></span><span>{JSON.stringify(row.details)}</span><span>{formatDate(row.created_at)}</span></div>)}</div></section>; }
function DataOverview({title,rows,primary,secondary,fields}:{title:string;rows:Record<string,unknown>[];primary:string;secondary:string;fields:string[]}){return <section><div className="gg-role-title"><span className="gg-kicker">Platform management</span><h2>{title}</h2><p>{rows.length} records</p></div><div className="gg-admin-records">{rows.map((row,index)=><article key={String(row.id||row.user_id||index)}><div><strong>{String(row[primary]||"Not added")}</strong><small>{String(row[secondary]||"")}</small></div><dl>{fields.map(field=><div key={field}><dt>{field.replaceAll("_"," ")}</dt><dd>{Array.isArray(row[field])?(row[field] as unknown[]).join(", "):String(row[field]??"—")}</dd></div>)}</dl></article>)}</div></section>}
function Placeholder({title,copy}:{title:string;copy:string}){return <div className="gg-empty-state"><ShieldCheck/><h2>{title}</h2><p>{copy}</p></div>}
function formatDate(value:string){return value?new Intl.DateTimeFormat("en-US",{dateStyle:"medium"}).format(new Date(value)):"—"}
