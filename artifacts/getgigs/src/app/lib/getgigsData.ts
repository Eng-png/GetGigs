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
  const { error: privateError } = await client.from("artist_profiles").upsert({
    user_id: userId,
    profile_data: stored,
    profile_completion: completion,
    updated_at: new Date().toISOString(),
  });
  if (privateError) throw privateError;

  const genres = [stored.genre, ...stored.secondaryGenres.split(",")].map((item) => item.trim()).filter(Boolean);
  const { error: publicError } = await client.from("artist_directory").upsert({
    user_id: userId,
    artist_name: stored.name,
    artist_type: stored.artistType,
    city: stored.city,
    region: stored.region,
    genres,
    bio: stored.oneLineBio || stored.shortBio,
    profile_photo_url: stored.image,
    cover_photo_url: stored.bandImage,
    website: stored.website,
    spotify_url: stored.spotify,
    youtube_url: stored.youtube,
    instagram_url: stored.instagram,
    is_published: Boolean(stored.name),
    updated_at: new Date().toISOString(),
  });
  if (publicError) throw publicError;

  const { error: profileError } = await client.from("profiles").update({
    display_name: stored.name,
    profile_photo_url: stored.image,
    city: stored.city,
    state: stored.region,
    country: stored.country,
    updated_at: new Date().toISOString(),
  }).eq("id", userId);
  if (profileError) throw profileError;

  const { error: preferencesError } = await client.from("user_preferences").upsert({
    user_id: userId,
    preferred_genres: genres,
    preferred_city: stored.preferences.cities || stored.preferredCities || stored.city,
    preferred_radius: stored.preferences.travelRadius,
    preferred_capacity: stored.preferences.capacity || stored.preferredVenueCapacity,
    preferred_gig_types: stored.preferences.gigTypes,
    updated_at: new Date().toISOString(),
  });
  if (preferencesError) throw preferencesError;
  return stored;
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
}

export async function recordSearch(userId: string, searchQuery: string, filters: Record<string, unknown>) {
  const { error } = await requireSupabase().from("search_history").insert({ user_id: userId, search_query: searchQuery, filters });
  if (error) throw error;
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
  const next = { ...profile };
  if (next.image.startsWith("data:")) next.image = await uploadDataUrl(userId, next.image, "profile");
  if (next.bandImage.startsWith("data:")) next.bandImage = await uploadDataUrl(userId, next.bandImage, "cover");
  return next;
}

async function uploadDataUrl(userId: string, dataUrl: string, label: string) {
  const client = requireSupabase();
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  const extension = blob.type.split("/")[1]?.replace("jpeg", "jpg") || "jpg";
  const path = `${userId}/${label}-${Date.now()}.${extension}`;
  const { error } = await client.storage.from("profile-media").upload(path, blob, { contentType: blob.type, upsert: true });
  if (error) throw error;
  return client.storage.from("profile-media").getPublicUrl(path).data.publicUrl;
}
