import deck1 from "../../imports/deck-1.png";
import deck2 from "../../imports/deck-2.png";
import deck3 from "../../imports/deck-3.png";
import deck4 from "../../imports/deck-4.png";

export type VerificationStatus = "Unverified" | "Verified" | "Needs review";

export type VenuePublicInfo = {
  venueName: string;
  venueType: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  capacity: string;
  description: string;
  website: string;
  instagram: string;
  publicPhone: string;
  bookingPage: string;
  coverImage: string;
  gallery: string[];
};

export type VenueBookingInfo = {
  contactName: string;
  email: string;
  phone: string;
  preferredContactMethod: string;
  bookingInstructions: string;
  submissionLink: string;
  internalNotes: string;
};

export type VenueRequirements = {
  genrePreferences: string;
  typicalSetLength: string;
  ageRequirement: string;
  drawRequirement: string;
  minimumAudience: string;
  paymentModel: string;
  typicalGuarantee: string;
  doorSplit: string;
  ticketRequirements: string;
  equipment: string;
  requiredMaterials: string;
  epkRequired: boolean;
  musicLinksRequired: boolean;
  socialLinksRequired: boolean;
  otherRequirements: string;
};

export type VenueMatching = {
  genres: string;
  typicalArtists: string;
  venueVibe: string;
  minimumCapacity: string;
  maximumCapacity: string;
  emergingArtistsAccepted: boolean;
  supportSlotsAvailable: boolean;
  whyItMatches: string;
};

export type VenueDataQuality = {
  sourceUrl: string;
  lastVerifiedDate: string;
  verificationStatus: VerificationStatus;
  isDemo: boolean;
};

export type Opportunity = {
  id: string;
  venueName: string;
  opportunityTitle: string;
  city: string;
  state: string;
  date: string;
  genre: string;
  compensationSummary: string;
  expectedDraw: string;
  matchScore: number;
  image: string;
  description: string;
  coordinate: [number, number];
  publicInfo: VenuePublicInfo;
  bookingInfo: VenueBookingInfo;
  requirements: VenueRequirements;
  matching: VenueMatching;
  dataQuality: VenueDataQuality;
};

type Seed = Omit<Opportunity, "publicInfo" | "bookingInfo" | "requirements" | "matching" | "dataQuality"> & {
  venueType: string;
  address: string;
  zip: string;
  capacity: string;
  website: string;
  instagram: string;
  gallery: string[];
  contactName: string;
  email: string;
  phone?: string;
  preferredContactMethod: string;
  bookingInstructions: string;
  submissionLink: string;
  internalNotes: string;
  typicalSetLength: string;
  ageRequirement: string;
  paymentModel: string;
  typicalGuarantee: string;
  equipment: string;
  requiredMaterials: string;
  typicalArtists: string;
  venueVibe: string;
  whyItMatches: string;
};

function createSampleVenue(seed: Seed): Opportunity {
  return {
    id: seed.id,
    venueName: seed.venueName,
    opportunityTitle: seed.opportunityTitle,
    city: seed.city,
    state: seed.state,
    date: seed.date,
    genre: seed.genre,
    compensationSummary: seed.compensationSummary,
    expectedDraw: seed.expectedDraw,
    matchScore: seed.matchScore,
    image: seed.image,
    description: seed.description,
    coordinate: seed.coordinate,
    publicInfo: {
      venueName: seed.venueName,
      venueType: seed.venueType,
      address: seed.address,
      city: seed.city,
      state: seed.state,
      zip: seed.zip,
      country: "United States",
      capacity: seed.capacity,
      description: seed.description,
      website: seed.website,
      instagram: seed.instagram,
      publicPhone: "",
      bookingPage: seed.submissionLink,
      coverImage: seed.image,
      gallery: seed.gallery,
    },
    bookingInfo: {
      contactName: seed.contactName,
      email: seed.email,
      phone: seed.phone ?? "",
      preferredContactMethod: seed.preferredContactMethod,
      bookingInstructions: seed.bookingInstructions,
      submissionLink: seed.submissionLink,
      internalNotes: seed.internalNotes,
    },
    requirements: {
      genrePreferences: seed.genre,
      typicalSetLength: seed.typicalSetLength,
      ageRequirement: seed.ageRequirement,
      drawRequirement: seed.expectedDraw,
      minimumAudience: seed.expectedDraw,
      paymentModel: seed.paymentModel,
      typicalGuarantee: seed.typicalGuarantee,
      doorSplit: seed.compensationSummary.toLowerCase().includes("door") ? "Available; terms confirmed per show" : "Not listed",
      ticketRequirements: "Confirm ticket expectations with the booking contact.",
      equipment: seed.equipment,
      requiredMaterials: seed.requiredMaterials,
      epkRequired: true,
      musicLinksRequired: true,
      socialLinksRequired: true,
      otherRequirements: "All details are sample information for prototype demonstration.",
    },
    matching: {
      genres: seed.genre,
      typicalArtists: seed.typicalArtists,
      venueVibe: seed.venueVibe,
      minimumCapacity: "25",
      maximumCapacity: seed.capacity.replace(/\D/g, "") || seed.capacity,
      emergingArtistsAccepted: true,
      supportSlotsAvailable: seed.opportunityTitle.toLowerCase().includes("support") || seed.opportunityTitle.toLowerCase().includes("opening"),
      whyItMatches: seed.whyItMatches,
    },
    dataQuality: {
      sourceUrl: seed.website,
      lastVerifiedDate: "Prototype sample — not verified",
      verificationStatus: "Unverified",
      isDemo: true,
    },
  };
}

export const OPPORTUNITIES: Opportunity[] = [
  createSampleVenue({
    id: "lilypad-opening-set", venueName: "The Lilypad", opportunityTitle: "Opening Set", city: "Cambridge", state: "MA", date: "Oct 25, 2026", genre: "Indie Pop · Alternative", compensationSummary: "$250 guarantee + door split", expectedDraw: "40–70 guests", matchScore: 91, image: deck1, description: "An intimate Inman Square room looking for a thoughtful local opener for a touring indie-pop bill. The evening favors expressive live sets and strong audience connection.", coordinate: [42.3744, -71.1005], venueType: "Independent listening room", address: "Inman Square", zip: "02139", capacity: "80", website: "https://www.lilypadinman.com", instagram: "https://www.instagram.com/lilypadcambridge", gallery: [deck1, deck2, deck4], contactName: "Alex Morgan", email: "bookings@lilypad.mock", phone: "(617) 555-0114", preferredContactMethod: "Email", bookingInstructions: "Send your GetGigs booking profile, one live performance video, and your estimated Boston draw. Please reference the October 25 opening slot.", submissionLink: "https://www.lilypadinman.com", internalNotes: "Mock contact for prototype use. Replace before launch.", typicalSetLength: "30–45 minutes", ageRequirement: "All ages; final policy varies by event", paymentModel: "Guarantee + door split", typicalGuarantee: "$250", equipment: "House PA; confirm backline in advance", requiredMaterials: "EPK, live video, Boston draw estimate", typicalArtists: "Emerging indie-pop and alternative artists", venueVibe: "Intimate, expressive, artist-led", whyItMatches: "Strong match because this room books indie pop, supports emerging artists, and fits a focused 40–80 person audience." }),
  createSampleVenue({
    id: "cafe-939-songwriter-night", venueName: "Cafe 939", opportunityTitle: "Singer-Songwriter Night", city: "Boston", state: "MA", date: "Nov 2, 2026", genre: "Singer-Songwriter · Indie Folk", compensationSummary: "$200 artist stipend", expectedDraw: "25–50 guests", matchScore: 87, image: deck2, description: "A seated showcase for emerging New England songwriters. Artists should be comfortable presenting original material in an attentive listening-room setting.", coordinate: [42.3473, -71.0879], venueType: "College listening room", address: "939 Boylston Street", zip: "02115", capacity: "200", website: "https://www.cafe939.com", instagram: "https://www.instagram.com/cafe939", gallery: [deck2, deck3], contactName: "Jordan Kim", email: "programming@cafe939.mock", preferredContactMethod: "Email", bookingInstructions: "Include two original songs, a short artist bio, and your preferred 25-minute performance format.", submissionLink: "https://www.cafe939.com", internalNotes: "Mock contact for prototype use. Student-programming review cycle is two weeks.", typicalSetLength: "25 minutes", ageRequirement: "All ages", paymentModel: "Artist stipend", typicalGuarantee: "$200", equipment: "Professional house sound and basic backline", requiredMaterials: "Two original songs and short artist bio", typicalArtists: "New England songwriters and small acoustic acts", venueVibe: "Seated, attentive, campus arts", whyItMatches: "A strong fit for original material, a flexible acoustic format, and artists building an attentive Boston audience." }),
  createSampleVenue({
    id: "sinclair-support-slot", venueName: "The Sinclair", opportunityTitle: "Support Slot", city: "Cambridge", state: "MA", date: "Nov 10, 2026", genre: "Indie Rock · Alternative", compensationSummary: "$400 guarantee", expectedDraw: "75–125 guests", matchScore: 79, image: deck3, description: "A high-energy support opportunity for a regional alternative-rock headliner. Best suited to a full band with a polished 35-minute set and recent live footage.", coordinate: [42.3731, -71.1207], venueType: "Music hall", address: "52 Church Street", zip: "02138", capacity: "525", website: "https://www.sinclaircambridge.com", instagram: "https://www.instagram.com/thesinclair", gallery: [deck3, deck1, deck4], contactName: "Taylor Reed", email: "talent@sinclair.mock", phone: "(617) 555-0172", preferredContactMethod: "Email first", bookingInstructions: "Submit a live video, recent Boston ticket history, stage plot, and a concise note about audience overlap with the headliner.", submissionLink: "https://www.sinclaircambridge.com", internalNotes: "Mock contact for prototype use. Full-band submissions only.", typicalSetLength: "35 minutes", ageRequirement: "18+ or all ages depending on event", paymentModel: "Guarantee", typicalGuarantee: "$400", equipment: "Full production; technical advance required", requiredMaterials: "Live video, ticket history, stage plot", typicalArtists: "Touring alternative and indie-rock acts", venueVibe: "High-energy, professional club", whyItMatches: "Best for a polished full band ready for a larger support slot and a 75+ person local draw." }),
  createSampleVenue({
    id: "passim-new-voices", venueName: "Club Passim", opportunityTitle: "New Voices Showcase", city: "Cambridge", state: "MA", date: "Nov 18, 2026", genre: "Folk · Acoustic · Roots", compensationSummary: "Door split + hospitality", expectedDraw: "30–60 guests", matchScore: 83, image: deck4, description: "A curated acoustic showcase for distinctive new voices across folk, roots, and singer-songwriter traditions. The room prioritizes strong songs and an intimate presentation.", coordinate: [42.3740, -71.1190], venueType: "Listening room", address: "47 Palmer Street", zip: "02138", capacity: "110", website: "https://www.passim.org", instagram: "https://www.instagram.com/clubpassim", gallery: [deck4, deck2], contactName: "Morgan Ellis", email: "submissions@passim.mock", preferredContactMethod: "Submission email", bookingInstructions: "Share three representative songs, one live room recording, a short bio, and your preferred set length.", submissionLink: "https://www.passim.org", internalNotes: "Mock contact for prototype use. Acoustic or lightly amplified formats preferred.", typicalSetLength: "30–45 minutes", ageRequirement: "All ages", paymentModel: "Door split + hospitality", typicalGuarantee: "Varies", equipment: "Listening-room PA; lightly amplified formats preferred", requiredMaterials: "Three songs, live recording, short bio", typicalArtists: "Folk, roots, acoustic and songwriter acts", venueVibe: "Historic, intimate, song-first", whyItMatches: "Strong match for acoustic storytelling, original songs, and an intimate audience experience." }),
];

export function normalizeOpportunity(opportunity: Opportunity): Opportunity {
  return {
    ...opportunity,
    venueName: opportunity.publicInfo.venueName,
    city: opportunity.publicInfo.city,
    state: opportunity.publicInfo.state,
    image: opportunity.publicInfo.coverImage,
    description: opportunity.publicInfo.description,
    genre: opportunity.matching.genres,
  };
}
