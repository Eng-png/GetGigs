import { useEffect, useMemo, useState } from "react";
import { Activity, Building2, LayoutDashboard, Music2, ShieldCheck, TicketCheck, Users } from "lucide-react";
import type { Opportunity } from "../../data/opportunities";
import type { UserProfile } from "../../lib/authTypes";
import { loadAdminArtistRows, loadAdminBookerRows, loadAdminUsers, setAccountStatus } from "../../lib/getgigsData";
import ManageVenuesScreen from "./ManageVenuesScreen";

type Tab = "dashboard" | "users" | "artists" | "bookers" | "venues" | "opportunities" | "reports" | "manage";

const TABS: Array<[Tab,string,React.ComponentType<{size?:number}>]> = [
  ["dashboard","Dashboard",LayoutDashboard],["users","Users",Users],["artists","Artists",Music2],["bookers","Bookers",Building2],["venues","Venues",TicketCheck],["opportunities","Opportunities",Activity],["reports","Reports",ShieldCheck],["manage","Manage Venues",Building2],
];

export default function AdminDashboard({ venues, onVenuesChange }: { venues: Opportunity[]; onVenuesChange:(venues:Opportunity[])=>void }) {
  const [tab,setTab]=useState<Tab>("dashboard");
  const [users,setUsers]=useState<UserProfile[]>([]);
  const [artists,setArtists]=useState<Record<string,unknown>[]>([]);
  const [bookers,setBookers]=useState<Record<string,unknown>[]>([]);
  const [filter,setFilter]=useState<"all"|"artist"|"booker"|"admin">("all");
  const [notice,setNotice]=useState("");

  const reload=()=>Promise.all([loadAdminUsers(),loadAdminArtistRows(),loadAdminBookerRows()]).then(([u,a,b])=>{setUsers(u);setArtists(a as Record<string,unknown>[]);setBookers(b as Record<string,unknown>[]);}).catch((error)=>setNotice(error instanceof Error?error.message:"Could not load admin records."));
  useEffect(()=>{void reload();},[]);
  const filtered=useMemo(()=>filter==="all"?users:users.filter((user)=>user.role===filter),[filter,users]);

  if(tab==="manage") return <ManageVenuesScreen venues={venues} onChange={onVenuesChange} onClose={()=>setTab("dashboard")}/>;
  return <div className="gg-role-shell gg-admin-shell"><header className="gg-role-header"><div><span className="gg-kicker">Secure administrator workspace</span><h1>GetGigs Admin</h1><p>User and platform records are authorized by database policies, not by hidden buttons.</p></div></header>{notice&&<div className="gg-role-notice">{notice}</div>}<div className="gg-admin-tabs">{TABS.map(([id,label,Icon])=><button key={id} className={tab===id?"active":""} onClick={()=>setTab(id)}><Icon size={14}/>{label}</button>)}</div><div className="gg-role-content">
    {tab==="dashboard"&&<><section className="gg-metrics">{[[users.length,"Total users"],[users.filter(u=>u.role==="artist").length,"Artists"],[users.filter(u=>u.role==="booker").length,"Bookers"],[venues.length,"Venues"]].map(([value,label])=><article key={String(label)}><strong>{value}</strong><span>{label}</span></article>)}</section><section className="gg-admin-table"><h2>Recent activity</h2>{users.slice(0,6).map((user)=><div key={user.id}><span><strong>{user.display_name||"Unnamed account"}</strong><small>{user.email}</small></span><span>{user.role}</span><span>{formatDate(user.created_at)}</span></div>)}</section></>}
    {tab==="users"&&<section><div className="gg-role-title"><span className="gg-kicker">Registered accounts</span><h2>Users</h2></div><div className="gg-filter-row">{(["all","artist","booker","admin"] as const).map(value=><button key={value} className={filter===value?"active":""} onClick={()=>setFilter(value)}>{value==="booker"?"Looking for Artist":value}</button>)}</div><div className="gg-admin-table">{filtered.map(user=><div key={user.id}><span><strong>{user.display_name||"Unnamed account"}</strong><small>{user.email}</small></span><span>{user.role}<small>{user.account_status}</small></span><span>{formatDate(user.created_at)}</span><button onClick={async()=>{await setAccountStatus(user.id,user.account_status==="active"?"suspended":"active");await reload();}}>{user.account_status==="active"?"Suspend":"Reactivate"}</button></div>)}</div></section>}
    {tab==="artists"&&<DataOverview title="Artists" rows={artists} primary="artist_name" secondary="account_email" fields={["booking_email","genres","city","profile_completion","account_status"]}/>}
    {tab==="bookers"&&<DataOverview title="Looking for Artist accounts" rows={bookers} primary="organization_name" secondary="email" fields={["contact_name","location","venue_type","profile_status","account_status"]}/>}
    {tab==="venues"&&<DataOverview title="Venues" rows={venues.map(v=>({name:v.venueName,location:`${v.city}, ${v.state}`,verification:v.dataQuality.verificationStatus,type:v.publicInfo.venueType,sample:v.dataQuality.isDemo?"Sample / Demo":"Live"}))} primary="name" secondary="location" fields={["type","verification","sample"]}/>}
    {tab==="opportunities"&&<Placeholder title="Opportunities" copy="Booker-created opportunities are stored per account and available for moderation through database-authorized records."/>}
    {tab==="reports"&&<Placeholder title="Reports" copy="User-submitted platform reports will appear here for administrator review."/>}
  </div></div>;
}

function DataOverview({title,rows,primary,secondary,fields}:{title:string;rows:Record<string,unknown>[];primary:string;secondary:string;fields:string[]}){return <section><div className="gg-role-title"><span className="gg-kicker">Platform management</span><h2>{title}</h2><p>{rows.length} records</p></div><div className="gg-admin-records">{rows.map((row,index)=><article key={String(row.id||row.user_id||index)}><div><strong>{String(row[primary]||"Not added")}</strong><small>{String(row[secondary]||"")}</small></div><dl>{fields.map(field=><div key={field}><dt>{field.replaceAll("_"," ")}</dt><dd>{Array.isArray(row[field])?(row[field] as unknown[]).join(", "):String(row[field]??"—")}</dd></div>)}</dl></article>)}</div></section>}
function Placeholder({title,copy}:{title:string;copy:string}){return <div className="gg-empty-state"><ShieldCheck/><h2>{title}</h2><p>{copy}</p></div>}
function formatDate(value:string){return value?new Intl.DateTimeFormat("en-US",{dateStyle:"medium"}).format(new Date(value)):"—"}
