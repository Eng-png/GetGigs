# GetGigs – Venue Artist Matchmap

GetGigs helps independent artists find venues that fit their sound, audience, home city, and career stage. Explore personalized venue recommendations, understand why each venue matches, browse a coordinate-based discovery map, and save promising stages for later.

## Main features

- Discover and search a curated set of 15+ sample venues across major U.S. music cities
- Filter venues by location, genre, capacity, venue type, and match score
- Review explainable match scores for genre, location, audience, capacity, and performance style
- Browse an interactive mock map with selectable venue markers and previews
- Open detailed venue profiles with booking and accessibility information
- Save venues, remove them, and sort the saved list
- Edit an artist profile and complete a five-step onboarding flow
- Keep the prototype's artist preferences and saved venues in browser local storage

## Technology

- React, TypeScript, and Vite
- Wouter for client-side routing
- Lucide for icons
- Local storage for prototype persistence

No account, external API key, map service, or custom design-system package is required.

## Installation and running locally

This repository is a pnpm workspace and uses `pnpm-lock.yaml` as its lockfile. From the repository root:

```bash
pnpm install
pnpm --filter @workspace/getgigs run dev
```

To build and typecheck the app in the workspace:

```bash
pnpm --filter @workspace/getgigs run typecheck
pnpm --filter @workspace/getgigs run build
```

When running outside Replit, the app defaults to port `5173` and the root URL path. The workspace's `pnpm` commands are the supported install/build path; do not use `npm install` at the repository root.


## Project structure

```text
artifacts/getgigs/
  src/
    components/   Reusable interface components
    data/         Structured sample venues and artist defaults
    hooks/        Local persistence and app state
    pages/        Discover, map, venue details, saved venues, profile
    utils/        Matching, filtering, and formatting helpers
```

## Future improvements

- Connect a verified venue directory and artist streaming/social profiles
- Add account-based sync across devices
- Replace the illustrated map with a mapping provider when credentials are available
- Provide direct booking inquiry workflows and verified booking availability
- Refine recommendations using feedback from artists and venue partners

Sample venue details are illustrative and should be verified before booking.