import type { BookingProfile } from "../data/bookingProfile";
import { EMPTY_PROFILE } from "../data/bookingProfile";
import type { Opportunity } from "../data/opportunities";
import type { BookerProfile, UserProfile } from "./authTypes";
import { requireSupabase } from "./supabase";

export type PublicArtist = {
  user_id: string;
  artist_name: string;
  artist_type: string;
  city: string;
  region: string;
  genres: string[];
  bio: string;
  profile_photo_url: string;
  cover_photo_url: string;
  website: string;
  spotify_url: string;
  youtube_url: string;
  instagram_url: string;
  updated_at: string;
};

export type PostedOpportunity = {
  id: string;
  owner_id: string;
  title: string;
  organization_name: string;
  location: string;
  description: string;
  genres: string[];
  compensation: string;
  event_date: string;
  status: "draft" | "open" | "closed";
  created_at: string;
};

export type SiteContent = { content_key: string; content_value: string; updated_at: string };
export type AdminActivity = {
  id: string;
  actor_id: string | null;
  subject_user_id: string | null;
  activity_type: string;
  details: Record<string, unknown>;
  created_at: string;
};

export async function loadArtistProfile(userId: string): Promise<BookingProfile> {
  const client = requireSupabase();
  const { data, error } = await client.from("artist_profiles").select("profile_data").eq("user_id", userId).maybeSingle();
  if (error) throw error;
  return data?.profile_data ? { ...EMPTY_PROFILE, ...(data.profile_data as unknown as BookingProfile) } : EMPTY_PROFILE;
}

export async function saveArtistProfile(userId: string, profile: BookingProfile): Promise<BookingProfile> {
  const client = requireSupabase();
  const stored = await uploadEmbeddedProfileMedia(userId, profile);
  const completion = profileCompletion(stored);
  const genres = [stored.genre, ...stored.secondaryGenres.split(",")].map((item) => item.trim()).filter(Boolean);
  const { data, error } = await client.rpc("save_artist_profile", {
    profile_input: stored,
    completion_input: completion,
    genres_input: genres,
  });
  if (error) throw new Error(`Profile save failed (${error.code || "supabase"}): ${error.message}`);
  try {
    await logActivity(userId, "profile_updated", { profileCompletion: completion });
  } catch (error) {
    console.warn("Profile saved, but activity logging failed.", error);
  }
  return (data || stored) as BookingProfile;
}

export async function loadAdminArtistProfile(userId: string): Promise<BookingProfile> {
  const { data, error } = await requireSupabase().from("artist_profiles").select("profile_data").eq("user_id", userId).single();
  if (error) throw error;
  return { ...EMPTY_PROFILE, ...((data?.profile_data || {}) as Partial<BookingProfile>) };
}

export async function loadSavedVenueIds(userId: string): Promise<string[]> {
  const { data, error } = await requireSupabase().from("saved_venues").select("venue_id").eq("user_id", userId);
  if (error) throw error;
  return (data || []).map((row) => String(row.venue_id));
}

export async function setVenueSaved(userId: string, venueId: string, saved: boolean) {
  const client = requireSupabase();
  const result = saved
    ? await client.from("saved_venues").upsert({ user_id: userId, venue_id: venueId })
    : await client.from("saved_venues").delete().eq("user_id", userId).eq("venue_id", venueId);
  if (result.error) throw result.error;
  await logActivity(userId, saved ? "venue_saved" : "venue_unsaved", { venueId });
}

export async function recordSearch(userId: string, searchQuery: string, filters: Record<string, unknown>) {
  const { error } = await requireSupabase().from("search_history").insert({ user_id: userId, search_query: searchQuery, filters });
  if (error) throw error;
  await logActivity(userId, "search", { query: searchQuery, filters });
}

export async function logActivity(actorId: string, activityType: string, details: Record<string, unknown> = {}, subjectUserId?: string) {
  const { error } = await requireSupabase().from("admin_activity").insert({
    actor_id: actorId,
    subject_user_id: subjectUserId || actorId,
    activity_type: activityType,
    details,
  });
  if (error) throw error;
}

export async function loadSiteContent(): Promise<Record<string, string>> {
  const { data, error } = await requireSupabase().from("site_content").select("content_key, content_value");
  if (error) throw error;
  return Object.fromEntries((data || []).map((row) => [String(row.content_key), String(row.content_value)]));
}

export async function saveSiteContent(contentKey: string, contentValue: string, userId: string) {
  const { error } = await requireSupabase().from("site_content").upsert({
    content_key: contentKey,
    content_value: contentValue,
    updated_by: userId,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
  await logActivity(userId, "content_updated", { contentKey });
}

export async function loadAdminActivity(limit = 100): Promise<AdminActivity[]> {
  const { data, error } = await requireSupabase().from("admin_activity").select("*").order("created_at", { ascending: false }).limit(limit);
  if (error) throw error;
  return (data || []) as AdminActivity[];
}

export async function updateAdminUser(userId: string, input: Partial<Pick<UserProfile, "display_name" | "city" | "state" | "country" | "account_status" | "role">>, actorId: string) {
  const { error } = await requireSupabase().from("profiles").update({ ...input, updated_at: new Date().toISOString() }).eq("id", userId);
  if (error) throw error;
  await logActivity(actorId, "user_updated", { fields: Object.keys(input) }, userId);
}

export async function deleteAdminUser(userId: string): Promise<void> {
  const client = requireSupabase();
  const { error } = await client.functions.invoke("delete-user", { body: { userId } });
  if (error) throw error;
}

export async function updateAdminArtist(userId: string, profileData: BookingProfile, actorId: string) {
  const client = requireSupabase();
  const stored = await uploadEmbeddedProfileMedia(userId, profileData);
  const { error: profileError } = await client.from("artist_profiles").update({
    profile_data: stored,
    profile_completion: profileCompletion(stored),
    updated_at: new Date().toISOString(),
  }).eq("user_id", userId);
  if (profileError) throw profileError;
  const genres = [stored.genre, ...stored.secondaryGenres.split(",")].map((item) => item.trim()).filter(Boolean);
  const { error: directoryError } = await client.from("artist_directory").update({
    artist_name: stored.name,
    artist_type: stored.artistType,
    city: stored.city,
    region: stored.region,
    genres,
    bio: stored.oneLineBio || stored.shortBio,
    profile_photo_url: stored.image,
    cover_photo_url: stored.bandImage,
    updated_at: new Date().toISOString(),
  }).eq("user_id", userId);
  if (directoryError) throw directoryError;
  await logActivity(actorId, "artist_updated", { fields: ["profile_data", "directory"] }, userId);
}

export async function uploadPrivateDocument(userId: string, file: File, label: string) {
  const client = requireSupabase();
  const extension = file.name.split(".").pop()?.replace(/[^a-z0-9]/gi, "").toLowerCase() || "bin";
  const safeLabel = label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "document";
  const path = `${userId}/${safeLabel}-${Date.now()}.${extension}`;
  const { error } = await client.storage.from("private-documents").upload(path, file, { contentType: file.type || undefined, upsert: false });
  if (error) throw error;
  return path;
}

export async function loadPublishedVenues(includePrivate = false): Promise<Opportunity[]> {
  const client = requireSupabase();
  const { data, error } = await client.from("venues").select("id, public_data").eq("is_published", true).order("updated_at", { ascending: false });
  if (error) throw error;
  const venues = (data || []).map((row) => row.public_data as unknown as Opportunity);
  if (!includePrivate || !venues.length) return venues;
  const { data: privateRows, error: privateError } = await client.from("venue_private_details").select("venue_id, booking_info").in("venue_id", venues.map((venue) => venue.id));
  if (privateError) throw privateError;
  const privateById = new Map((privateRows || []).map((row) => [String(row.venue_id), row.booking_info]));
  return venues.map((venue) => ({ ...venue, bookingInfo: (privateById.get(venue.id) as unknown as Opportunity["bookingInfo"]) || emptyBookingInfo() }));
}

export async function syncRealVenues(previous: Opportunity[], next: Opportunity[]) {
  const client = requireSupabase();
  const priorReal = previous.filter((venue) => !venue.dataQuality.isDemo);
  const nextReal = next.filter((venue) => !venue.dataQuality.isDemo);
  const removed = priorReal.filter((venue) => !nextReal.some((candidate) => candidate.id === venue.id));
  if (removed.length) {
    const { error } = await client.from("venues").delete().in("id", removed.map((venue) => venue.id));
    if (error) throw error;
  }
  if (nextReal.length) {
    const { error } = await client.from("venues").upsert(nextReal.map((venue) => ({
      id: venue.id,
      public_data: { ...venue, bookingInfo: emptyBookingInfo() },
      is_demo: false,
      is_verified: venue.dataQuality.verificationStatus === "Verified",
      is_published: true,
      updated_at: new Date().toISOString(),
    })));
    if (error) throw error;
    const { error: privateError } = await client.from("venue_private_details").upsert(nextReal.map((venue) => ({ venue_id: venue.id, booking_info: venue.bookingInfo, updated_at: new Date().toISOString() })));
    if (privateError) throw privateError;
  }
}

function emptyBookingInfo(): Opportunity["bookingInfo"] {
  return { contactName: "", email: "", phone: "", preferredContactMethod: "", bookingInstructions: "", submissionLink: "", internalNotes: "" };
}

export async function loadPublicArtists(): Promise<PublicArtist[]> {
  const { data, error } = await requireSupabase().from("artist_directory").select("*").eq("is_published", true).order("updated_at", { ascending: false });
  if (error) throw error;
  return (data || []) as PublicArtist[];
}

export async function loadSavedArtistIds(userId: string): Promise<string[]> {
  const { data, error } = await requireSupabase().from("saved_artists").select("artist_user_id").eq("user_id", userId);
  if (error) throw error;
  return (data || []).map((row) => String(row.artist_user_id));
}

export async function setArtistSaved(userId: string, artistUserId: string, saved: boolean) {
  const client = requireSupabase();
  const result = saved
    ? await client.from("saved_artists").upsert({ user_id: userId, artist_user_id: artistUserId })
    : await client.from("saved_artists").delete().eq("user_id", userId).eq("artist_user_id", artistUserId);
  if (result.error) throw result.error;
}

export async function loadBookerProfile(userId: string): Promise<BookerProfile | null> {
  const { data, error } = await requireSupabase().from("booker_profiles").select("*").eq("user_id", userId).maybeSingle();
  if (error) throw error;
  return data as BookerProfile | null;
}

export async function saveBookerProfile(profile: BookerProfile) {
  const client = requireSupabase();
  const payload = { ...profile, profile_status: profile.organization_name ? "complete" : "draft", updated_at: new Date().toISOString() };
  const { error } = await client.from("booker_profiles").upsert(payload);
  if (error) throw error;
  const { error: profileError } = await client.from("profiles").update({ display_name: profile.organization_name || profile.contact_name, city: profile.location, updated_at: new Date().toISOString() }).eq("id", profile.user_id);
  if (profileError) throw profileError;
}

export async function loadBookerOpportunities(userId: string): Promise<PostedOpportunity[]> {
  const { data, error } = await requireSupabase().from("opportunities").select("*").eq("owner_id", userId).order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []) as PostedOpportunity[];
}

export async function createBookerOpportunity(input: Omit<PostedOpportunity, "id" | "created_at">) {
  const { error } = await requireSupabase().from("opportunities").insert(input);
  if (error) throw error;
}

export async function loadAdminUsers(): Promise<UserProfile[]> {
  const { data, error } = await requireSupabase().from("profiles").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []) as UserProfile[];
}

export async function loadAdminArtistRows() {
  const { data, error } = await requireSupabase().from("admin_artist_overview").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function loadAdminBookerRows() {
  const { data, error } = await requireSupabase().from("admin_booker_overview").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function setAccountStatus(userId: string, accountStatus: "active" | "suspended") {
  const { error } = await requireSupabase().from("profiles").update({ account_status: accountStatus, updated_at: new Date().toISOString() }).eq("id", userId);
  if (error) throw error;
}

function profileCompletion(profile: BookingProfile) {
  const checks = [profile.name, profile.genre, profile.city, profile.shortBio, profile.image, profile.bookingEmail, profile.videos.length, profile.setLengths.length, profile.availability.length];
  return Math.round(checks.filter(Boolean).length / checks.length * 100);
}

async function uploadEmbeddedProfileMedia(userId: string, profile: BookingProfile): Promise<BookingProfile> {
  // Cropped profile media is intentionally kept as a compact data URL. This
  // avoids a broken public-storage URL preventing the saved profile from rendering.
  return { ...profile };
}
