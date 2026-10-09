import deck1 from "../../imports/deck-1.png";
import deck2 from "../../imports/deck-2.png";
import deck3 from "../../imports/deck-3.png";

export type Visibility = "Public" | "Bookers Only" | "Private";

export type BookingProfile = {
  name: string;
  artistType: string;
  genre: string;
  secondaryGenres: string;
  city: string;
  region: string;
  pronouns: string;
  tagline: string;
  website: string;
  instagram: string;
  tiktok: string;
  spotify: string;
  appleMusic: string;
  youtube: string;
  soundcloud: string;
  bandcamp: string;
  otherUrl: string;
  contactName: string;
  artistEmail: string;
  bookingEmail: string;
  phone: string;
  managerName: string;
  managerEmail: string;
  bookingAgent: string;
  bookingAgentEmail: string;
  oneLineBio: string;
  shortBio: string;
  fullBio: string;
  image: string;
  bandImage: string;
  artistLogo: string;
  country: string;
  performersCount: string;
  localOrTouring: string;
  preferredCities: string;
  preferredVenueCapacity: string;
  minimumGuarantee: string;
  openToDoorSplit: boolean;
  openToSupportSlots: boolean;
  ageRestrictions: string;
  epkFile: string;
  stagePlotFile: string;
  techRiderFile: string;
  hospitalityRiderFile: string;
  pressPhotoFiles: string[];
  performanceFormats: string[];
  setLengths: string[];
  feeRange: string;
  feeVisibility: Visibility;
  audienceDraw: Array<{ city: string; estimate: string }>;
  tracks: Array<{ title: string; artwork: string; spotify: string; appleMusic: string }>;
  videos: Array<{ title: string; venue: string; date: string; url: string; thumbnail: string; featured?: boolean }>;
  shows: Array<{ venue: string; city: string; date: string; capacity: number; attendance: number; tickets: number; fee: string; merch: string; role: string }>;
  pressQuotes: string[];
  notablePerformances: string[];
  rider: { members: string[]; inputs: Array<{ channel: number; instrument: string; input: string }>; backline: string; monitors: string; microphones: string; lighting: string; power: string; hospitality: string };
  availability: Array<{ month: string; date: number; status: "Available" | "Tentative" | "Unavailable" }>;
  preferences: { capacity: string; gigTypes: string[]; compatibleArtists: string; travelRadius: string; cities: string; minimumFee: string; touring: boolean };
};

export const MAYA_PROFILE: BookingProfile = {
  name: "Maya Rivers",
  artistType: "Solo Artist",
  genre: "Indie Pop",
  secondaryGenres: "Alternative, Electronic, Dream Pop",
  city: "Boston",
  region: "MA, United States",
  pronouns: "she/her",
  tagline: "Dreamy indie-pop combining intimate songwriting with electronic production.",
  website: "https://mayarivers.example.com",
  instagram: "https://instagram.com/mayariversmusic",
  tiktok: "https://tiktok.com/@mayariversmusic",
  spotify: "https://open.spotify.com/artist/mayarivers",
  appleMusic: "https://music.apple.com/artist/maya-rivers",
  youtube: "https://youtube.com/@mayariversmusic",
  soundcloud: "https://soundcloud.com/mayarivers",
  bandcamp: "https://mayarivers.bandcamp.com",
  otherUrl: "",
  contactName: "Maya Rivers",
  artistEmail: "maya@mayarivers.example.com",
  bookingEmail: "booking@mayarivers.com",
  phone: "(617) 555-0148",
  managerName: "Jordan Lee",
  managerEmail: "jordan@northlineartists.com",
  bookingAgent: "Avery Chen",
  bookingAgentEmail: "avery@harborbooking.com",
  oneLineBio: "Boston-based indie-pop artist blending intimate songwriting with atmospheric electronic production.",
  shortBio: "Maya Rivers writes luminous indie-pop about distance, memory, and becoming. Pairing intimate vocals with atmospheric synths and a dynamic live band, she has built a loyal New England audience through carefully crafted performances and independently released music.",
  fullBio: "Maya Rivers is a Boston-based indie-pop artist whose work lives between intimate songwriting and atmospheric electronic production. Her songs begin quietly—with voice, piano, or a single guitar—and expand into detailed arrangements shaped by synths, live drums, and close vocal layers. Since releasing her first independent singles, Maya has developed a devoted regional audience through shows across Boston, Cambridge, Providence, and New York. Her live set moves easily between vulnerable solo moments and full-band crescendos, making it adaptable for listening rooms, club support slots, college stages, and festivals. Maya’s recent performances include sold-out hometown bills and support appearances for touring alternative-pop artists. She is currently preparing a new EP while building thoughtful partnerships with independent venues and promoters.",
  image: deck1,
  bandImage: deck3,
  artistLogo: "",
  country: "United States",
  performersCount: "4",
  localOrTouring: "Local and regional touring",
  preferredCities: "Boston, Providence, New York, Portland",
  preferredVenueCapacity: "100–500",
  minimumGuarantee: "$300",
  openToDoorSplit: true,
  openToSupportSlots: true,
  ageRestrictions: "All ages preferred",
  epkFile: "Maya-Rivers-EPK.pdf",
  stagePlotFile: "Maya-Rivers-Stage-Plot.pdf",
  techRiderFile: "Maya-Rivers-Tech-Rider.pdf",
  hospitalityRiderFile: "",
  pressPhotoFiles: [],
  performanceFormats: ["Solo", "Acoustic", "Full Band"],
  setLengths: ["30 minutes", "45 minutes", "60 minutes"],
  feeRange: "$300–$500",
  feeVisibility: "Bookers Only",
  audienceDraw: [{ city: "Boston", estimate: "60–100" }, { city: "New York", estimate: "30–50" }, { city: "Los Angeles", estimate: "20–40" }],
  tracks: [
    { title: "Afterimage", artwork: deck2, spotify: "https://open.spotify.com", appleMusic: "https://music.apple.com" },
    { title: "Slow Weather", artwork: deck3, spotify: "https://open.spotify.com", appleMusic: "https://music.apple.com" },
    { title: "Borrowed Light", artwork: deck1, spotify: "https://open.spotify.com", appleMusic: "https://music.apple.com" },
  ],
  videos: [
    { title: "Afterimage — Live", venue: "The Lilypad", date: "Aug 20, 2026", url: "https://www.youtube.com/watch?v=ysz5S6PUM-U", thumbnail: deck1, featured: true },
    { title: "Slow Weather — Full Band", venue: "Cafe 939", date: "May 15, 2026", url: "https://www.youtube.com/watch?v=jNQXAC9IVRw", thumbnail: deck3 },
  ],
  shows: [
    { venue: "The Lilypad", city: "Cambridge, MA", date: "Aug 20, 2026", capacity: 80, attendance: 65, tickets: 61, fee: "$250", merch: "$110", role: "Headliner" },
    { venue: "Cafe 939", city: "Boston, MA", date: "May 15, 2026", capacity: 200, attendance: 160, tickets: 146, fee: "$400", merch: "$225", role: "Support" },
    { venue: "The Jungle", city: "Somerville, MA", date: "Mar 28, 2026", capacity: 120, attendance: 92, tickets: 84, fee: "$300", merch: "$145", role: "Headliner" },
    { venue: "Baby's All Right", city: "Brooklyn, NY", date: "Jan 17, 2026", capacity: 280, attendance: 118, tickets: 104, fee: "$350", merch: "$180", role: "Showcase" },
  ],
  pressQuotes: ["“A glowing, detail-rich live set.” — Allston Pudding", "“One of Boston’s most assured emerging pop voices.” — Sound of Boston"],
  notablePerformances: ["Boston Calling local showcase", "Support for Hana Vu at Cafe 939", "First Night Boston 2026"],
  rider: {
    members: ["Maya — Vocal / Keys", "Alex — Guitar", "Sam — Bass", "Jordan — Drums"],
    inputs: [{ channel: 1, instrument: "Lead Vocal", input: "XLR" }, { channel: 2, instrument: "Guitar", input: "DI" }, { channel: 3, instrument: "Keys L", input: "DI" }, { channel: 4, instrument: "Keys R", input: "DI" }],
    backline: "4-piece drum kit, bass amp, two guitar stands",
    monitors: "Four monitor mixes preferred",
    microphones: "One wireless vocal mic plus two backing vocal mics",
    lighting: "Warm front wash with programmable color backlight",
    power: "Two grounded power drops stage left",
    hospitality: "Water, tea, and one vegetarian meal",
  },
  availability: [{ month: "October", date: 12, status: "Available" }, { month: "October", date: 18, status: "Tentative" }, { month: "October", date: 25, status: "Available" }, { month: "November", date: 3, status: "Available" }, { month: "November", date: 8, status: "Unavailable" }, { month: "November", date: 21, status: "Available" }],
  preferences: { capacity: "100–500", gigTypes: ["Headline", "Supporting", "Festival", "College", "Showcase"], compatibleArtists: "Indie pop, alternative, electronic, singer-songwriter", travelRadius: "Boston + 100 miles", cities: "Boston, Providence, New York, Portland", minimumFee: "$300", touring: true },
};

/** Blank starting point for a real prototype account. Demo mode deliberately uses MAYA_PROFILE. */
export const EMPTY_PROFILE: BookingProfile = {
  ...MAYA_PROFILE,
  name: "",
  artistType: "",
  genre: "",
  secondaryGenres: "",
  city: "",
  region: "",
  country: "",
  pronouns: "",
  tagline: "",
  website: "",
  instagram: "",
  tiktok: "",
  spotify: "",
  appleMusic: "",
  youtube: "",
  soundcloud: "",
  bandcamp: "",
  otherUrl: "",
  contactName: "",
  artistEmail: "",
  bookingEmail: "",
  phone: "",
  managerName: "",
  managerEmail: "",
  bookingAgent: "",
  bookingAgentEmail: "",
  oneLineBio: "",
  shortBio: "",
  fullBio: "",
  image: "",
  bandImage: "",
  artistLogo: "",
  performersCount: "",
  localOrTouring: "",
  preferredCities: "",
  preferredVenueCapacity: "",
  minimumGuarantee: "",
  openToDoorSplit: false,
  openToSupportSlots: false,
  ageRestrictions: "",
  epkFile: "",
  stagePlotFile: "",
  techRiderFile: "",
  hospitalityRiderFile: "",
  pressPhotoFiles: [],
  performanceFormats: [],
  setLengths: [],
  feeRange: "",
  audienceDraw: [],
  tracks: [],
  videos: [],
  shows: [],
  pressQuotes: [],
  notablePerformances: [],
  availability: [],
  preferences: { capacity: "", gigTypes: [], compatibleArtists: "", travelRadius: "", cities: "", minimumFee: "", touring: false },
};
