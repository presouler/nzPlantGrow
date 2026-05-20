# nzPlant Frontend Project Notes

## Repository

- Git SSH: `git@github.com:presouler/nzPlantGrow.git`
- Local path: `/Users/leonkang/.openclaw/workspace/nzPlant/frontend`
- Branch: `main`
- Repository status at setup: empty repository, no commits yet
- SSH access: configured and verified through GitHub user `presouler`

## Stack

- React
- Vite
- TypeScript
- pnpm 11.1.2
- Plain global CSS (`src/styles.css`)
- No UI framework yet

## Runtime

- Dev server port: `5173`
- Recommended dev command for exact local URL:

```bash
pnpm run dev --host 127.0.0.1
```

- Local URL: `http://127.0.0.1:5173/`
- Vite dev proxy: `/api` -> `http://localhost:3000`

## Commands

From `/Users/leonkang/.openclaw/workspace/nzPlant/frontend`:

```bash
pnpm install
pnpm run dev --host 127.0.0.1
pnpm run build
pnpm run typecheck
```

## Project Structure

```text
frontend/
  index.html
  package.json
  pnpm-lock.yaml
  vite.config.ts
  tsconfig.json
  tsconfig.app.json
  tsconfig.node.json
  src/
    App.tsx
    main.tsx
    styles.css
    types.ts
    vite-env.d.ts
    api/
      recommendations.ts
      weather.ts
    components/
      PlantIcon.tsx
    data/
      mockRecommendations.ts
    utils/
      season.ts
```

## Routes / Pages

Current app uses lightweight browser History API routing (no `react-router` yet), with manual scroll restoration between the recommendation list and detail pages:

- `/` — home screen showing:
  - `nzPlant` title and New Zealand planting guide tagline
  - Today's date formatted in New Zealand locale/time zone
  - Current New Zealand season
  - Hero weather title background and temperature pill
  - Seasonal recommended plant cards
  - One shared vertical 1-5 star planting difficulty guide
  - Plant cards showing planting difficulty as stars only
  - Clickable recommendation cards that navigate to plant detail pages
- `/plants/:id` — plant detail screen showing icon, category, difficulty stars, planting months/window label, sun, water, notes, care tips, optional detail sections, and a `Back to recommendations` button.
- When opening a detail page from the scrolled recommendation list, the app stores the home scroll position in History state and restores it when returning via the back button or browser Back.

## Current Components

Current MVP keeps UI components in `src/App.tsx`:

- `App` — fetches recommendation data and renders the page
- `StarRating` — renders 5-star difficulty rating
- `DifficultyGuide` — renders the shared 1-5 star planting difficulty explanation
- `HeroWeatherScene` — renders decorative hero background elements for sunny, rainy, cloudy, overcast, sun-shower, and windy states
- `WaterDropRating` — maps `watering` / backend `water` copy to a compact fixed 5-position water-drop visual while preserving the original guidance in accessibility text and `title`
- `SunExposureIcon` — renders icon-only sun exposure visual
- `PlantIcon` (`src/components/PlantIcon.tsx`) — renders inline SVG icons for recommendation cards and detail pages, prioritizing `plant.icon` from backend/API data and using `plant.id`/`plant.name` only as fallback
- `PlantCardLink` — clickable recommendation card link that pushes `/plants/:id` with History API
- `PlantDetailPage` — plant detail route UI with fallback-safe content and back navigation
- `GrowthSimulator` — interactive detail-page growth timeline. It prefers backend `plant.growthStages` from `GET /api/plants/:id` and falls back to the built-in generic seed-to-mature stages when no backend data is present.
- `getDifficultyMeta` — maps backend difficulty labels to UI labels, colors, and stars
- `getSunIconType` — maps backend sun labels to icon variants

Future split candidates:

- `components/Hero.tsx`
- `components/PlantCard.tsx`
- `components/RecommendationsGrid.tsx`
- `components/StarRating.tsx`
- `components/SunExposureIcon.tsx`
- `components/PlantIcon.tsx`

## API Calls

API clients:

- `src/api/recommendations.ts`
- `src/api/weather.ts`

Endpoints:

- `GET /api/recommendations/current`
- `GET /api/plants/:id`
- `GET /api/weather/auckland`

Frontend behavior:

1. Try to fetch `/api/recommendations/current`.
2. If backend is unavailable or response is not OK, fall back to local mock data.
3. Normalize backend fields for UI.

Backend response uses:

```ts
plantingMonths: number[];
water: string;
icon?: string;
```

Frontend UI type uses:

```ts
suitableMonths: number[];
watering: string;
icon?: string;
```

The mapping happens inside `normalizeApiResponse` in `src/api/recommendations.ts`. The backend `icon` field is preserved as-is and passed through to plant cards; preserve this unless frontend/backend API contracts are changed together.

Plant detail behavior:

1. On `/plants/:id`, call `GET /api/plants/:id`.
2. Normalize backend `plantingMonths`/`water` to frontend `suitableMonths`/`watering`.
3. Preserve optional backend `plantingWindowLabel`, `careTips`, `detailSections`, and `growthStages`.
4. If `growthStages` is present, the detail-page `GrowthSimulator` uses it for stage labels/headlines/descriptions/tips; if absent or invalid, the simulator keeps the built-in default stage fallback.
5. If the detail endpoint fails, build a non-blank fallback from current recommendations or local mock data; unknown ids get a basic generated detail card.

## Types

Defined in `src/types.ts`:

- `PlantDifficulty`
- `PlantRecommendation`
- `PlantGrowthStage`
- `GrowthStageId`
- `ApiPlantRecommendation`
- `CurrentRecommendationsResponse`
- `ApiCurrentRecommendationsResponse`
- `WeatherCondition`
- `TemperatureComfort`
- `HeroWeather`
- `AucklandWeatherResponse`


Plant detail `growthStages` contract:

```ts
growthStages?: Array<{
  id: 'seed' | 'sprout' | 'leafy' | 'flowering' | 'harvest' | 'mature';
  label: string;
  headline: string;
  description: string;
  tip: string;
  visualHint?: string;
}>;
```

The frontend normalizer filters invalid/empty `growthStages`. `visualHint` is currently lightweight metadata used only to influence the simulator palette when it matches known hints.

Difficulty currently accepts backend and frontend labels:

- `easy`
- `medium`
- `hard`
- `Easy`
- `Moderate`
- `Advanced`

## Mock Data

Fallback mock data lives in:

- `src/data/mockRecommendations.ts`

Important caveat:

- Mock data is not identical to backend seed data.
- For production-quality behavior, either generate mock data from backend schema or remove fallback once backend deployment is reliable.

## Date / Season Helpers

Frontend helper file:

- `src/utils/season.ts`

Uses timezone:

- `Pacific/Auckland`

Season mapping:

- Summer: Dec-Feb
- Autumn: Mar-May
- Winter: Jun-Aug
- Spring: Sep-Nov

Backend is the source of truth for recommendations. Frontend date/season helpers are primarily for fallback mock mode.

## UI / Styling

Styles live in:

- `src/styles.css`

Current visual direction:

- Garden-themed green/yellow palette
- Large rounded hero panel
- Responsive card grid
- Soft shadows
- Pill labels
- Inline SVG icons for sun exposure and hero weather

See also:

- `/Users/leonkang/.openclaw/workspace/nzPlant/docs/design-system.md`


## Hero Weather UI

The hero includes weather-driven title/background styling in `src/App.tsx`:

- Weather conditions: `cloudy`, `overcast`, `sunny`, `rainy`, `sun-shower`, `windy`
- Temperature comfort states: `cold`, `suitable`, `hot`, `very-hot`
- Each state combination gets variant classes on the hero section:
  - `.hero-weather-cloudy`, `.hero-weather-overcast`, `.hero-weather-sunny`, `.hero-weather-rainy`, `.hero-weather-sun-shower`, `.hero-weather-windy`
  - `.hero-temp-cold`, `.hero-temp-suitable`, `.hero-temp-hot`, `.hero-temp-very-hot`
- The hero/title background color changes by weather condition using CSS variables (`--hero-weather-background`, `--hero-weather-glow`, `--hero-weather-shadow`).
- The hero also renders decorative background weather scene elements:
  - Sunny / sun-shower: large sun
  - Rainy / sun-shower: rain drops
  - Cloudy / overcast / rainy / sun-shower: cloud layers
  - Windy: wind streaks and falling leaves
- UI displays weather through the hero/title background and decorative scene elements; there is no separate weather information card.
- The title facts row shows today’s temperature as a compact pill only when live Auckland weather is available, so refresh/fallback states do not show the old mock `18°C` value.
- When real weather loads, a small meta line under the facts row shows Auckland location/source/update time; there is still no separate weather information card.
- Decorative scene elements sit behind the title/date/season/temperature content and are hidden from assistive tech.

Current data source:

- `src/api/weather.ts` fetches `GET /api/weather/auckland`, expecting `location`, `temperatureCelsius`, `condition`, `comfort`, `observedAt`, and `source`.
- `App` requests recommendations and Auckland weather together on initial page load, then renders the hero once the weather request has settled. This prevents a refresh-time flash of the old season-based mock temperature before real Auckland weather arrives.
- `getHeroWeather(season, weather)` prefers the validated API weather and falls back to local season-based hero weather only when the endpoint fails or returns an unsupported payload; fallback weather can still drive background styling, but the visible temperature pill is hidden unless live weather exists.
- Keep the `HeroWeather` condition/comfort/temperature shape and hero variant class contract stable unless frontend/backend API contracts are changed together.

## Plant Card Display Contract

Each plant card currently renders:

- Category pill
- Backend/API-provided plant icon variant rendered as an inline SVG, with id/name fallback
- Plant name
- Planting difficulty value as 5-star rating only
- Suitable months text
- Sun exposure icon only
- Watering need as a fixed 5-drop scale, with filled drops indicating the rating and original watering guidance retained in `aria-label` and `title`
- Plant notes

## Watering UI

User requirement:

- Plant cards should not show long watering text directly.
- Show watering as a fixed 5-drop scale, like the star difficulty display: e.g. 3/5 renders 5 droplet positions with 3 filled and 2 pale/unfilled.
- Keep the original watering text available to assistive tech / hover title.
- Do not introduce external image dependencies.

Current implementation:

- `WaterDropRating` lives in `src/App.tsx` and renders five inline SVG droplets for every plant.
- Accessibility label format: `Watering need 3 out of 5 drops: <original watering text>`.
- Mapping is derived from the normalized `plant.watering` string, including backend `water` values after API normalization:
  - low / after planting / reduce / lightly / establishing -> 2 drops
  - minimal / dry / drought / sparingly -> 1 drop
  - regular / consistent / evenly / moderate / moist / shallow -> 3 drops
  - deep / deeply / weekly / base -> 4 drops
  - high / heavy / frequent / needs more water / very moist -> 5 drops
  - unknown fallback -> 3 drops
- Droplet styling is in `src/styles.css` under `.water-visual`, `.water-rating`, and `.water-drop`.

## Plant Icons

Current implementation:

- `src/components/PlantIcon.tsx` exports reusable inline SVG icons for recommendation cards.
- Cards pass `plant.icon`, `plant.id`, and `plant.name`; the component uses the backend/API `icon` field first, then falls back to id/name inference only when no recognized icon is provided.
- Supported backend icon strings include: `broad-beans` / `broad-bean`, `spinach`, `garlic`, `kale`, `parsley`, `lettuce`, `tomato`, `silverbeet`, `coriander`, `kawakawa`, and `default` / `seedling`.
- Covered current frontend mock and backend seed plants: Broad Beans, Spinach, Garlic, Kale, Parsley, Lettuce, Tomato, Silverbeet, Coriander, Kawakawa.
- Unknown or missing icon values fall back to id/name inference, then to a generic seedling icon; add a variant when a backend plant would otherwise repeat the fallback.
- Styling lives in `src/styles.css` under `.plant-icon`, variant backgrounds, and the high-recognition icon classes near the end of the file.
- No external image downloads or runtime asset dependencies are required.

Design intent:

- Lightweight 64x64 viewBox SVGs that remain legible at card-header size.
- Recognizable silhouettes over abstract leaf marks: tomato fruit/calyx, garlic bulb/cloves/shoots, bean pod with beans, lettuce head, chard yellow rib, kawakawa heart leaf/dots, and distinct herb/kale/spinach leaf forms.
- Consistent rounded tile, green/yellow garden theme, simple filled botanical shapes.
- Icon labels are available through `role="img"` / `aria-label`; inner SVGs are hidden from assistive tech.

## Sun Exposure Icons

User requirement:

- Do not show visible raw text like `full sun`, `part shade`, `part sun`.
- Use image/icon instead.

Current implementation:

- Inline SVG in `SunExposureIcon`
- `full sun` -> centered sun icon
- `part sun` / `part shade` -> sun + cloud icon
- `shade` -> leaf/shade icon

Accessibility:

- Icon has `aria-label="Sun requirement: ..."`
- SVG itself is `aria-hidden`

Known fix:

- Full sun icon was off-center and was fixed by moving SVG sun center to `(32, 32)`.

## Plant Icons

User requirement:

- Each recommendation card should show an icon corresponding to `plant.name`.
- Do not introduce external image dependencies.

Current implementation:

- Inline SVG in `src/components/PlantIcon.tsx`.
- `App.tsx` renders `<PlantIcon id={plant.id} icon={plant.icon} name={plant.name} />` in each recommendation card.
- The backend/API `icon` field is the primary source for icon choice. Name/id mapping remains as a safety fallback and covers current mock/backend-style plants: Broad Bean(s), Spinach, Garlic, Kale, Parsley, Lettuce, Tomato, Silverbeet, Coriander, and Kawakawa, including English and Chinese names where present.
- The 2026-05-19 icon refresh prioritizes recognizability: tomato has red fruit + calyx, garlic has a pale segmented bulb, lettuce is a round layered head, kale has a ruffled dark leaf, silverbeet has yellow chard stems, coriander uses finer cut lobes, and kawakawa is a heart-shaped leaf with small holes.
- Unknown names fall back to a generic seedling icon.
- Icons are exposed as `role="img"` with an accessible label based on the plant name.

## Difficulty UI

User requirement:

- Difficulty should be shown with 5 stars.
- Show one shared compact explanation for 1-star through 5-star difficulty as a right-side helper on desktop.
- Plant card difficulty rows should show stars only to keep cards compact.

Current mapping:

- `easy` = 1/5
- `medium` / `moderate` = 3/5
- `hard` / `advanced` = 5/5
- unknown fallback = 3/5

Current internal labels for accessibility:

- `1/5 Easy / beginner friendly`
- `3/5 Medium / regular care needed`
- `5/5 Hard / experienced gardeners`

Current shared guide layout/copy:

- Desktop: compact `Difficulty guide` aside on the right of the recommendation grid; sticky while scrolling.
- Narrow screens: guide stacks with the recommendations content.
- 1 star: Beginner friendly.
- 2 stars: Easy, occasional checks.
- 3 stars: Moderate regular care.
- 4 stars: Challenging conditions.
- 5 stars: Advanced growers.

## Validation Status

Last verified after plant detail page implementation:

```bash
./node_modules/.bin/tsc -b --noEmit
./node_modules/.bin/vite build
```

Both passed. Note: `pnpm run typecheck && pnpm run build` was blocked in this environment by pnpm ignored-build-script approval (`pnpm approve-builds` required for unrelated dependencies), so validation used the local project binaries directly.

## Recent Important Changes

- Initialized React + Vite + TypeScript MVP app.
- Connected frontend workspace to GitHub repository `presouler/nzPlantGrow`.
- Added homepage with NZ date, current season, and seasonal plant recommendations.
- Added local mock recommendation data and fallback API client.
- Installed pnpm and migrated from `package-lock.json` to `pnpm-lock.yaml`.
- Fixed API response normalization so backend `plantingMonths`/`water` fields render correctly.
- Added visible planting difficulty recommendation.
- Changed planting difficulty display to a five-star rating.
- Replaced visible sun requirement text with SVG icon-only visuals.
- Replaced visible watering guidance text on cards with compact 1-5 inline SVG water-drop ratings while preserving the original watering guidance for accessibility and hover titles.
- Changed difficulty UI to one shared 1-5 star explanation and simplified cards to show planting difficulty.
- Fixed full sun icon alignment.
- Reverted plant card difficulty rows to stars only and changed shared planting difficulty guide to a vertical list.
- Moved the shared difficulty guide from a large full-width block into a compact right-side helper aside on desktop.
- Added plant-name-specific inline SVG icons to recommendation cards without external image dependencies.
- Refreshed Broad Bean(s), Spinach, Garlic, Kale, Parsley, Lettuce, Tomato, Silverbeet, Coriander, and Kawakawa icons for clearer crop recognition while keeping inline 64x64 SVGs and the existing garden theme.
- Removed Chinese UI and mock-data copy for the initial English-only version.
- Added hero weather scene with condition variants, temperature comfort states, weather-driven hero/title background colours, and decorative scene elements for sun, rain, clouds, wind, and leaves.
- Removed the separate hero weather information card; weather is represented by the title background and scene elements, while temperature remains visible as a compact hero pill.
- Removed the temporary 20-card weather/title combination preview grid after visual review.
- Added frontend `icon?: string` support: API normalization preserves backend `icon`, mock recommendations include explicit icon variants, and plant cards pass `plant.icon` to `PlantIcon` before id/name fallback.
- Connected hero weather to `GET /api/weather/auckland` with payload validation, source/update meta text, and season-based fallback that preserves the existing hero weather class contract.
- Added `/plants/:id` detail pages using browser History API routing, clickable recommendation cards, `GET /api/plants/:id` integration, fallback detail construction, care tips/detail sections rendering, and `Back to recommendations` navigation.
- Added manual home scroll restoration so returning from a plant detail page lands back at the previous recommendation-list scroll position instead of the top.

## Next Recommended Frontend Tasks

1. Split `App.tsx` into reusable components.
2. Move `SunExposureIcon` into its own component and visually align it with the refreshed plant icon set.
3. Add bilingual UI labels if desired.
4. Improve mock/backend data consistency.
5. Add loading/error states beyond the current simple loading message.
6. Add tests after component split.
7. Commit and push initial frontend MVP.

## Plant Detail Growth Simulator

The `/plants/:id` detail screen includes an interactive `GrowthSimulator` card in `src/App.tsx`.

Current behavior:

- Users can drag a keyboard-accessible range slider to preview plant growth.
- Users can also click stage buttons along the timeline.
- The current stage updates live with matching artwork, stage label, helper copy, and care tip.
- The simulator covers six stages: `seed`, `sprout`, `leafy`, `flowering`, `harvest`, and `mature`.
- Primary recommended crops use generated raster PNG stage assets from `public/growth-stages/<plant>/<stage>.png` for stronger recognition at card size.
- Remaining unsupported/fallback crops can still render with the inline SVG fallback.
- The module is local to the detail page and does not change History API navigation or the existing home scroll restoration behavior.

Supporting design asset:

- `src/components/GrowthStageIcon.tsx`
  - Exports `GrowthStageIcon`
  - Provides a smaller rounded-tile stage icon set for future reuse in chips, summaries, or onboarding
  - Supported stages: `seed`, `sprout`, `leafy`, `flowering`, `harvest`
  - Inline SVG only; no external image dependency
  - Matches the existing rounded garden-themed `PlantIcon` visual language

Key CSS areas in `src/styles.css`:

- `.growth-simulator-card`, `.growth-simulator-stage`, `.growth-range`, `.growth-timeline`, `.growth-stage-dot`
- `.growth-plant-image`, `.growth-plant-svg`, `.growth-palette-*`, `.growth-soil`, `.growth-stem`, `.growth-leaf`, `.growth-flowers`, `.growth-harvest`
- `.growth-stage-icon*` for the supporting reusable icon set

### Growth simulator realism update

- The selected growth stage displays backend `timeLabel` when available, so the simulator reflects crop-specific timing rather than only generic stage numbers.
- Stage artwork is crop-aware: harvest/mature visuals use produce only when that plant actually has that produce. Example: spinach mature/harvest assets must never show tomato-like red fruit.
- Frontend accepts optional `startDay`/`endDay` for future proportional timelines, while the current UI keeps equal stage stops for simple dragging.
- If backend timing data is absent or invalid, the simulator still falls back to generic seed-to-mature copy.

### Growth simulator raster asset strategy

- `GrowthSimulator` resolves a crop palette from `plant.growthStages[].visualHint`, `plant.icon`, `plant.id`, and `plant.name`.
- Raster-backed plants are defined in `rasterGrowthPlants` and rendered by `RasterGrowthImage`.
- Current raster-backed plants: `tomato`, `lettuce`, `broad-bean`, `silverbeet`, `coriander`, `parsley`, `kawakawa`, and `spinach`.
- Each raster-backed plant must provide six canonical files:
  - `public/growth-stages/<plant>/seed.png`
  - `public/growth-stages/<plant>/sprout.png`
  - `public/growth-stages/<plant>/leafy.png`
  - `public/growth-stages/<plant>/flowering.png`
  - `public/growth-stages/<plant>/harvest.png`
  - `public/growth-stages/<plant>/mature.png`
- Keep image prompts/selection focused on real plant morphology, not decorative colour. If SVG is not recognisable enough at card size, prefer staged raster assets before spending more time on path details.
- Remaining palettes such as `kale`, `garlic`, and `default` keep the SVG fallback until dedicated assets are added.
