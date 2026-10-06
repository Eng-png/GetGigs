import img1 from "../../../imports/Listings-1/27e109c2d3a011f3ed5bb2a8bb32924cb2fce06e.png";
import img2 from "../../../imports/Listings-1/46af54ed1c12d4f3c69cabe0c3bdc2e01a10bc07.png";
import img3 from "../../../imports/Listings-1/bfa951233d1ecc1d5cc1819f6ed858f2c3a258f0.png";
import img4 from "../../../imports/Listings-1/2cdbbeb0ba621237f9ed9969229c100429096a8d.png";
import img5 from "../../../imports/Listings-1/fed2efd38c004ba6878a50dd53b4c52740806c36.png";
import img6 from "../../../imports/Listings-1/f4b18f8d4a81d98f7590e9d3248b8a353a641d63.png";
import img7 from "../../../imports/Listings-1/05b9bbbd868756acecc088ebb1d872669dfe1a33.png";
import img8 from "../../../imports/Listings-1/9dccecff49931eef5182217a2c3d81d48cd60813.png";
import img9 from "../../../imports/Listings-1/3d8d071a47acf9af842a5247c48c8f5425449cbd.png";
import img10 from "../../../imports/Listings-1/9e86636e2012fb010fa39c93f94afafb2cadffab.png";
import img11 from "../../../imports/Listings-1/ac4eae487c17661ff23537a63224eff7f6204b1a.png";
import img12 from "../../../imports/Listings-1/6cacf6db0c13093d31d3e9bf4e77b07546e9f453.png";

export type PropertyType = "House" | "Hotel" | "Villa" | "Cabin" | "Camping" | "Resort";
export type Price = "$" | "$$" | "$$$";

export type Listing = {
  id: string;
  name: string;
  type: PropertyType;
  guests: number;
  price: Price;
  match: number;
  rating: number;
  image: string;
};

export const LISTINGS: Listing[] = [
  { id: "oasis",      name: "Oasis",             type: "House",   guests: 5, price: "$$$", match: 95, rating: 4.96, image: img1 },
  { id: "cozy",       name: "Cozy Den",          type: "House",   guests: 4, price: "$$",  match: 91, rating: 4.78, image: img2 },
  { id: "garden",     name: "Garden Escape",     type: "House",   guests: 3, price: "$$",  match: 87, rating: 4.89, image: img3 },
  { id: "coastal",    name: "Coastal Villa",     type: "Villa",   guests: 4, price: "$$$", match: 83, rating: 4.62, image: img4 },
  { id: "wilderness", name: "Wilderness Escape", type: "Camping", guests: 2, price: "$",   match: 79, rating: 4.94, image: img5 },
  { id: "seaside",    name: "Seaside Resort",    type: "Hotel",   guests: 2, price: "$$$", match: 74, rating: 4.45, image: img6 },
  { id: "urban",      name: "Urban Retreat",     type: "House",   guests: 8, price: "$$$", match: 70, rating: 4.81, image: img7 },
  { id: "ocean",      name: "Ocean Vista",       type: "Hotel",   guests: 2, price: "$$$", match: 66, rating: 4.73, image: img8 },
  { id: "tiny",       name: "Tiny Home",         type: "Cabin",   guests: 2, price: "$",   match: 62, rating: 4.92, image: img9 },
  { id: "bunk",       name: "Shared Bunk Room",  type: "House",   guests: 1, price: "$",   match: 57, rating: 3.87, image: img10 },
  { id: "mountain",   name: "Mountain Lodge",    type: "Cabin",   guests: 4, price: "$",   match: 53, rating: 4.65, image: img11 },
  { id: "grand",      name: "Grand Marr",        type: "Hotel",   guests: 4, price: "$$$", match: 48, rating: 4.55, image: img12 },
];
