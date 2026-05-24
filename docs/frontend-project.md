# nzPlant Frontend Project Notes

## Repository

- Git SSH: `git@github.com:presouler/nzPlantGrow.git`
- Local path: `/Users/leonkang/.openclaw/workspace/nzPlant/frontend`
- Branch: `main`

## Stack

- Next.js App Router
- React
- TypeScript
- pnpm 11.1.2
- Plain global CSS imported from `app/globals.css` -> `src/styles.css`
- No UI framework yet

## Runtime / Deployment

- Recommended dev command: `pnpm run dev`
- Default local URL: `http://127.0.0.1:3000/` (or set `PORT`, e.g. `PORT=5174 pnpm run dev` / `pnpm run start`)
- Production build/start: `pnpm run build`, then `pnpm run start`
- Next serves SSR routes directly; deploy by running `next start` (for example under PM2) and proxying web traffic to that Node process.
- `API_BASE_URL` is server-side only and defaults to `http://127.0.0.1:3000`.
- Browser-side API calls, if added later, should stay relative to `/api/*`. `next.config.ts` rewrites `/api/:path*` to `${API_BASE_URL}/api/:path*`.
- Static assets remain in `public/` and keep root-relative URLs. Growth images stay available at `/growth-stages/<plant>/<stage>.png`.

## Commands

From `/Users/leonkang/.openclaw/workspace/nzPlant/frontend`:

```bash
pnpm install
pnpm run dev
pnpm run typecheck
pnpm run build
pnpm run start
```

Current scripts:

- `dev`: `next dev`
- `typecheck`: `tsc --noEmit`
- `build`: `next build`
- `start`: `next start`

## Project Structure

```text
frontend/
  app/
    globals.css
    layout.tsx
    page.tsx
    not-found.tsx
    plants/[id]/page.tsx
  public/
    growth-stages/<plant>/<stage>.png
  src/
    App.tsx
    styles.css
    types.ts
    api/
      recommendations.ts
      weather.ts
    components/
      GrowthStageIcon.tsx
      PlantIcon.tsx
    utils/
      season.ts
  next.config.ts
  next-env.d.ts
  package.json
  tsconfig.json
```

## Routes / Pages

- `/` — App Router server page. Fetches current recommendations and Auckland weather on the server using `API_BASE_URL`, then renders the existing visual home UI through `HomePage`.
- `/plants/[id]` — App Router server page. Fetches `GET /api/plants/:id` on the server using `API_BASE_URL`, then renders the plant detail UI through `PlantDetailPage`. Failed detail fetches call `notFound()` and render `app/not-found.tsx`.

The previous custom browser History API router was removed. Plant cards use `next/link`, detail route IDs come from App Router `params`, and invalid details use Next `notFound`. No server-rendered path accesses `window`, `document`, `history`, or `localStorage`.

## Components

- `HomePage` (`src/App.tsx`) — presentational home UI for server-fetched recommendation/weather data.
- `PlantDetailPage` (`src/App.tsx`) — presentational detail UI for server-fetched plant data.
- `GrowthSimulator` (`src/App.tsx`) — client component interaction using local React state/range controls.
- `PlantCardLink` (`src/App.tsx`) — uses `next/link` for `/plants/[id]` navigation.
- `StarRating`, `DifficultyGuide`, `HeroWeatherScene`, `WaterDropRating`, `MonthTimeline`, `SunExposureIcon` remain in `src/App.tsx` for now.
- `PlantIcon` (`src/components/PlantIcon.tsx`) and `GrowthStageIcon` (`src/components/GrowthStageIcon.tsx`) remain reusable inline SVG components.

## API Calls

API clients:

- `src/api/recommendations.ts`
- `src/api/weather.ts`

Endpoints:

- `GET /api/recommendations/current`
- `GET /api/plants/:id`
- `GET /api/weather/auckland`

Server pages pass `API_BASE_URL` into the API helpers so Node fetches absolute backend URLs. API helper fetches use `cache: 'no-store'`, and App Router pages are marked `dynamic = 'force-dynamic'` so recommendation/weather/detail data is resolved per request instead of baked into the build.

Frontend behavior:

1. Fetch `/api/recommendations/current` on `/`.
2. Fetch `/api/weather/auckland` on `/`; invalid/unavailable weather returns `null` and the hero falls back to season-based styling without showing a fake temperature pill.
3. Fetch `/api/plants/:id` on `/plants/[id]`.
4. API failures render explicit unavailable/not-found UI; the frontend does not ship local mock plant data or generated fallback plant details.

Backend response fields still normalize as before:

```ts
plantingMonths -> suitableMonths
water -> watering
icon -> icon
```

## Types

Defined in `src/types.ts`, including:

- `PlantRecommendation`
- `PlantDetail`
- `PlantGrowthStage`
- `CurrentRecommendationsResponse`
- `AucklandWeatherResponse`
- weather and difficulty unions

## UI / Styling / Assets

- Global styles live in `src/styles.css` and are imported once by `app/globals.css`.
- Existing garden-themed visuals, plant icons, weather hero classes, star difficulty UI, sun icons, water-drop rating, month timeline, and growth simulator styles are preserved.
- Raster growth assets remain under `public/growth-stages/` and are referenced with root-relative paths, which matches Next public directory rules.
- Current raster-backed plants: `tomato`, `lettuce`, `broad-bean`, `silverbeet`, `coriander`, `parsley`, `kawakawa`, and `spinach`.

## Validation Status

Last verified after Next.js App Router migration QA:

```bash
pnpm run typecheck && pnpm run build
# blocked locally by pnpm ignored-build-script approval gate before scripts ran

./node_modules/.bin/tsc --noEmit
./node_modules/.bin/next build
PORT=3000 HOST=127.0.0.1 node ../backend/dist/server.js
PORT=5174 API_BASE_URL=http://127.0.0.1:3000 ./node_modules/.bin/next start
# smoke checked /, /plants/tomato, and /growth-stages/tomato/leafy.png return 200
```

`pnpm run typecheck` / `pnpm run build` are currently blocked by the local pnpm ignored-build-script approval gate (`pnpm approve-builds` required). Direct local binaries passed. Production `next start` smoke was verified against the backend on port 3000 and frontend on port 5174.

## Recent Important Changes

- Migrated from the temporary Vite SSR implementation to Next.js App Router.
- Removed the Vite runtime path: `server.mjs`, `vite.config.ts`, `index.html`, `src/entry-client.tsx`, `src/entry-server.tsx`, `src/main.tsx`, and `src/vite-env.d.ts`.
- Replaced custom History API routing with App Router pages, `next/link`, route `params`, and `notFound()`.
- Changed `package.json` scripts/dependencies from Vite to Next.
- Added `app/layout.tsx`, `app/page.tsx`, `app/plants/[id]/page.tsx`, `app/not-found.tsx`, `app/globals.css`, `next.config.ts`, and `next-env.d.ts`.
- Kept the existing visual design and static growth-stage assets accessible.

## Next Recommended Frontend Tasks

1. Split `src/App.tsx` into smaller focused components now that routing is handled by App Router.
2. Add frontend tests for API error/empty states and detail not-found behavior.
3. Update nginx/PM2 deployment config to proxy to `next start` instead of serving `dist`.

## Local Production Deployment Update — 2026-05-24

The local production deployment has been updated from static Vite `dist` hosting to a Next.js Node server behind nginx.

Runtime process:

- LaunchAgent plist: `~/Library/LaunchAgents/com.nzplant.frontend.plist`
- Source copy: `../deploy/nzplant.next.frontend.plist`
- Working directory: `/Users/leonkang/.openclaw/workspace/nzPlant/frontend`
- Command: `next start -H 127.0.0.1`
- Env: `NODE_ENV=production`, `PORT=3001`, `API_BASE_URL=http://127.0.0.1:3000`
- Logs: `../logs/frontend-next.out.log`, `../logs/frontend-next.err.log`

nginx:

- Active config: `/opt/homebrew/etc/nginx/servers/nzplant.conf`
- Source copy: `../deploy/nzplant.nginx.next.conf`
- `/api/` proxies to backend `http://127.0.0.1:3000`
- `/_next/static/`, static assets, and all page routes proxy to frontend `http://127.0.0.1:3001`
- Old static `root frontend/dist` + `try_files /index.html` deployment has been removed.

Deployment smoke was verified for `/`, `/plants/tomato`, `/api/recommendations/current`, and `/growth-stages/tomato/leafy.png`.
