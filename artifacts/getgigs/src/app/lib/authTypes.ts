export type AppRole = "artist" | "booker" | "admin";

export type AccountStatus = "active" | "suspended";

export type UserProfile = {
  id: string;
  role: AppRole;
  email: string;
  display_name: string;
  profile_photo_url: string;
  city: string;
  state: string;
  country: string;
  account_status: AccountStatus;
  created_at: string;
  updated_at: string;
};

export type BookerProfile = {
  user_id: string;
  organization_name: string;
  contact_name: string;
  website: string;
  location: string;
  venue_type: string;
  capacity: string;
  genres: string[];
  description: string;
  logo_url: string;
  profile_status: string;
  created_at?: string;
  updated_at?: string;
};

export const EMPTY_BOOKER_PROFILE: Omit<BookerProfile, "user_id"> = {
  organization_name: "",
  contact_name: "",
  website: "",
  location: "",
  venue_type: "",
  capacity: "",
  genres: [],
  description: "",
  logo_url: "",
  profile_status: "draft",
};
