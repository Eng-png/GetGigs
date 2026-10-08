export type Artist = {
  name: string;
  city: string;
  genres: string[];
  capacity: string;
  radius: string;
  audience: string;
  style: string;
  stage: string;
  email: string;
  artistType: string;
  monthlyListeners: number;
  socialFollowers: number;
  typicalAudienceSize: string;
  preferredCities: string[];
  preferredVenueTypes: string[];
  willingToTravel: boolean;
  travelMiles: number;
  links: {
    spotify: string;
    appleMusic: string;
    youtube: string;
    soundcloud: string;
    instagram: string;
    tiktok: string;
  };
};

export type FitFactors = { genre: number; location: number; audience: number; capacity: number; style: number };
export type Venue = {
  id: string; name: string; city: string; state: string; address: string; lat: number; lng: number;
  image: string; genres: string[]; capacity: number; type: string; description: string; website: string;
  email: string; age: string; ticket: string; accessibility: string; equipment: string[];
  booking: string; lead: string; audience: string; style: string; factors: FitFactors; score?: number;
};