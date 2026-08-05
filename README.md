# Asteroid Roulette

Every near-Earth object passing today, rendered in 3D at honest relative
scale, filed with a deadpan verdict.

## Stack

Next.js 15 (App Router, TypeScript), `@react-three/fiber` / `@react-three/drei`
(R3F v9) for the 3D scene, Tailwind CSS v4. No state library, no ORM, no
database, no auth — everything is derived from one API response.

## Local setup

```bash
npm install
cp .env.example .env.local
# edit .env.local and set NASA_API_KEY (see below)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Getting a NASA API key

Register for a free key at [api.nasa.gov](https://api.nasa.gov) — it's
instant and only needs an email address. `DEMO_KEY` also works without
registering, but is capped at 30 requests/hour/IP instead of 1,000/hour.

Without a key at all, or if the upstream feed fails or rate-limits, the app
serves `lib/fallback.json` instead and shows a "live feed unavailable"
note — the site never renders empty.

> **Note on `lib/fallback.json`:** this fixture was hand-built to match
> NeoWs' documented response schema (real asteroid designations, realistic
> diameters/velocities/miss-distances) rather than captured live, because
> the sandbox this project was built in couldn't reach `api.nasa.gov`.
> Swap in an actual captured response once you can hit the endpoint from
> your environment, if you want the fallback to be a literal snapshot
> rather than a representative stand-in.

## Scripts

- `npm run dev` — local dev server
- `npm run build` — production build
- `npm run start` — serve the production build
- `npm run typecheck` — `tsc --noEmit`
- `npm run lint` — ESLint

## Deploying to Vercel

1. Import the repo into Vercel.
2. In **Project Settings → Environment Variables**, add `NASA_API_KEY`
   with your key (or `DEMO_KEY`).
3. Deploy. The route handler at `app/api/neos/route.ts` reads the key
   server-side only — it never reaches the client.

## Notes

- The feed is cached with `next: { revalidate: 3600 }`; NeoWs data changes
  at most once a day and the key is capped at 1,000 requests/hour.
- `READABLE SCALE` (default) maps distance and size on separate, honestly
  labeled compressed scales so the full spread of today's objects fits on
  screen. `TRUE SCALE` animates to actual proportions — Earth becomes a
  dot, every asteroid vanishes — then says so.
- `prefers-reduced-motion` disables auto-rotation and animated camera
  easing in favor of instant transitions.
