# nzPlant Frontend

React + Vite frontend for the nzPlant MVP. The app helps New Zealand home gardeners see what to plant now, with seasonal recommendations, compact plant-care visuals, and a weather-aware hero title.

## What it does

- Shows today’s NZ date and current New Zealand season.
- Fetches current planting recommendations from the backend.
- Falls back to local mock data if the backend is unavailable.
- Displays plant cards with category, icon, planting difficulty, suitable months, sun exposure, watering need, and notes.
- Uses a weather-aware hero background with decorative sun, clouds, rain, wind, and leaf elements.
- Shows today’s temperature as a compact hero pill.

## Tech stack

- React
- Vite
- TypeScript
- pnpm
- Plain CSS in `src/styles.css`
- Inline SVG icons; no runtime image downloads

## Getting started

Install dependencies:

```bash
pnpm install
```

Start the development server:

```bash
pnpm run dev --host 127.0.0.1
```

Open:

```text
http://127.0.0.1:5173/
```

The Vite dev proxy forwards `/api` requests to:

```text
http://localhost:3000
```

Run the backend separately from the backend repository for live API data.

## Scripts

```bash
pnpm run dev        # Start Vite dev server
pnpm run typecheck  # Run TypeScript project checks
pnpm run build      # Typecheck and build production assets
pnpm run preview    # Preview the production build locally
```

## API integration

The app calls:

```text
GET /api/recommendations/current
```

Backend fields are normalized in `src/api/recommendations.ts`:

| Backend field | Frontend field |
| --- | --- |
| `plantingMonths` | `suitableMonths` |
| `water` | `watering` |
| `icon` | `icon` |

If the backend request fails, the app uses `src/data/mockRecommendations.ts`.

## UI highlights

### Hero weather title

The hero title changes visually based on weather state and temperature comfort:

- Weather states: `cloudy`, `overcast`, `sunny`, `rainy`, `sun-shower`, `windy`
- Temperature states: `cold`, `suitable`, `hot`, `very-hot`

The current MVP uses season-based fallback weather data inside `src/App.tsx`. A real weather API can replace this later while keeping the same condition, comfort, and temperature shape.

### Plant cards

Each plant card displays:

- Category pill
- Backend-provided plant icon variant
- English plant name
- Planting difficulty as 1–5 stars
- Suitable month range
- Sun exposure as an icon
- Watering need as a 1–5 droplet scale
- Short growing note

## Project structure

```text
src/
  App.tsx
  main.tsx
  styles.css
  types.ts
  api/
    recommendations.ts
  components/
    PlantIcon.tsx
  data/
    mockRecommendations.ts
  utils/
    season.ts
```

## Validation

Before committing changes, run:

```bash
pnpm run typecheck
pnpm run build
```

If pnpm build-script approval blocks local scripts in this environment, the equivalent direct validation is:

```bash
./node_modules/.bin/tsc -b
./node_modules/.bin/vite build
```

## Documentation

Longer-lived frontend notes are maintained in:

```text
docs/frontend-project.md
```

Update that file when routes, components, API normalization, visual contracts, or important implementation decisions change.

## Roadmap

- Split `App.tsx` into focused components.
- Replace season-based hero weather fallback with real weather data.
- Improve mock/backend data consistency.
- Add tests after component extraction.
- Add deployment documentation.
