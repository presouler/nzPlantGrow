# nzPlant Design System Notes

## Purpose

This document captures the current UI direction and visual conventions for nzPlant so future frontend/UI work can continue consistently.

## Visual Direction

Keywords:

- Fresh
- Garden-like
- New Zealand home gardening
- Beginner-friendly
- Calm and practical

Current style:

- Soft green/yellow palette
- Rounded cards and hero panels
- Light botanical feel without heavy illustration yet
- Plain CSS, no component library

## Current Colors

Approximate colors used in `frontend/src/styles.css`:

- Main text: `#173224`
- Body background: `#f5f7ed`
- Hero dark green: `rgba(21, 83, 45, 0.95)`
- Hero secondary green: `rgba(69, 128, 53, 0.9)`
- Hero text: `#f8ffe9`
- Accent light yellow: `#f7ffc9`
- Card background: `rgba(255, 255, 255, 0.78)`
- Category background: `#e9f5d3`
- Difficulty easy background: `#e5f7d4`
- Difficulty medium background: `#fff2cc`
- Difficulty hard background: `#ffe0d4`
- Star filled: `#f4a825`

## Typography

Current font stack:

```css
Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
```

Current title style:

- Large `nzPlant` hero title
- Tight letter spacing
- Rounded modern app feel

## Layout

- Main shell max width: `1120px`
- Page padding: desktop `48px 0 64px`, mobile `20px 0 36px`
- Hero radius: `32px` desktop, `24px` mobile
- Plant cards: CSS grid, `repeat(auto-fit, minmax(260px, 1fr))`
- Card radius: `24px`

## Plant Card UI

Each card currently includes:

1. Category pill
2. Plant-specific rounded SVG icon tile
3. Plant name
4. Suitable months text
5. Sun exposure icon-only visual
6. Watering as a compact fixed 5-drop scale, with filled drops showing the rating and original guidance kept in accessible text / title
7. 5-star planting difficulty rating
8. Notes

## Plant Recommendation Icons

Current implementation is `frontend/src/components/PlantIcon.tsx` with inline SVG, so the app has no external icon/image dependency.

Covered plants:

- Broad Beans / 蚕豆 — bean pod motif
- Spinach / 菠菜 — paired leafy greens
- Garlic / 大蒜 — pale bulb with shoots
- Kale / 羽衣甘蓝 — darker ruffled brassica leaf
- Parsley / 欧芹 — clustered herb lobes
- Lettuce / 生菜 — rounded lettuce head
- Tomato / 番茄 — red fruit with green calyx
- Silverbeet / 瑞士甜菜 — broad chard leaves with yellow stems
- Coriander / 香菜 — smaller clustered herb lobes with cut detail
- Kawakawa / 新西兰胡椒树 — heart-shaped native leaf motif
- Unknown plants — generic seedling fallback

Style rules:

- Prioritize crop recognizability over abstraction; each plant should have one obvious identifying feature.
- Use simple filled botanical shapes with 2-3px rounded strokes in a 64x64 SVG viewBox.
- Keep icons readable inside the existing 58px card-header tile; current SVG render size is 48px on desktop and 44px on mobile for clearer silhouettes.
- Stay within the garden palette: leaf greens, soft yellow/cream backgrounds, silverbeet yellow stems, and tomato red only for tomato.
- Current distinguishing details: pod + beans for broad beans, broad oval leaves for spinach, white segmented bulb for garlic, ruffled dark leaf for kale, lobed bunch for parsley, round layered head for lettuce, red fruit + calyx for tomato, chard leaves + yellow midrib for silverbeet, finer cut herb leaves for coriander, heart-shaped perforated leaf for kawakawa.
- Add new plant variants to `PlantIcon.tsx` first, then add any new CSS classes in `frontend/src/styles.css`.

## Sun Exposure Icons

Requirement from user: do not show text like `full sun`, `part shade`, etc. Use images/icons instead.

Current implementation is inline SVG in `SunExposureIcon` inside `frontend/src/App.tsx`:

- `full sun`: sun icon
- `part sun` / `part shade`: sun + cloud icon
- `shade`: leaf/shade icon

Accessibility:

- Visual text is hidden/not rendered.
- The icon keeps an `aria-label` such as `Sun requirement: full sun` for screen readers.

Important fix already made:

- Full sun SVG was off-center; sun core and rays were moved to viewBox center `(32, 32)`.

Future improvement:

- Move icons from inline component into reusable files, e.g. `src/components/SunExposureIcon.tsx` or `src/assets/icons/*.svg`.
- Ask `ui-designer` to produce a cohesive SVG icon set.

## Watering Display

Requirement from user: do not show the long watering guidance directly on plant cards; use a 1-5 water-drop rating instead.

Important display rule:

- Always render the maximum 5 droplet positions, like the star difficulty scale.
- Example: 3/5 renders five water drops with 3 filled and 2 pale/unfilled, not only three drops.

Current implementation is inline SVG in `WaterDropRating` inside `frontend/src/App.tsx`:

- 1 drop: minimal / dry / drought / sparing watering signals
- 2 drops: low, after-planting-only, reduce watering, lightly moist, or establishment watering signals
- 3 drops: regular / consistent / evenly / moderate / moist watering signals
- 4 drops: deep / deeply / weekly / base watering signals
- 5 drops: high / heavy / frequent / needs-more-water signals

Accessibility:

- The visible UI is icon-only.
- The original watering text is preserved in `aria-label` and `title` on the water rating wrapper.
- `aria-label` format should be `Watering need 3 out of 5 drops: <original watering text>`.

Style rules:

- Use inline SVG or CSS only; no external image dependency.
- Keep the visual soft and garden-themed: rounded pale green/blue pill, blue droplets, small cream highlight strokes.
- Droplets should stay compact so the cards still scan quickly beside the star difficulty and sun icon systems.

## Difficulty Display

Requirement from user: planting difficulty should have 5 stars.

Current mapping:

- `easy` = 1/5 stars
- `medium` / `moderate` = 3/5 stars
- `hard` / `advanced` = 5/5 stars
- Unknown difficulty falls back to 3/5

Current copy:

- Easy / 新手友好 — `Recommended for beginners and busy home gardeners.`
- Medium / 需要照料 — `Good if you can check watering, pests, or support regularly.`
- Hard / 有经验再试 — `Best for experienced growers or protected growing spaces.`

Future improvement:

- Consider true 1-5 difficulty data in backend instead of deriving from three labels.
- Add Chinese copy across the whole UI if full bilingual UX is required.

## Image / Icon Generation Agent

OpenClaw has a `ui-designer` agent configured for UI, icons, illustrations, image assets, and design system work.

Image generation default:

- `openai/gpt-image-1.5`

When asking for transparent icons/logos/stickers:

- Use PNG or WebP output.
- Use transparent background.
- Store generated assets under the frontend repo, likely:
  - `frontend/src/assets/`
  - or `frontend/public/`

## Current UI Files

- `frontend/src/App.tsx` — page and inline UI components
- `frontend/src/components/PlantIcon.tsx` — plant-specific SVG recommendation icons
- `frontend/src/styles.css` — global CSS and visual system
- `frontend/src/api/recommendations.ts` — API normalization/fallback
- `frontend/src/data/mockRecommendations.ts` — fallback mock data
- `frontend/src/utils/season.ts` — frontend NZ season helpers

## Suggested UI Next Steps

1. Split `App.tsx` into components:
   - `Hero`
   - `PlantCard`
   - `StarRating`
   - `SunExposureIcon`
   - `RecommendationsGrid`
2. Extend the current icon system:
   - Move `SunExposureIcon` to its own component file
   - Move `WaterDropRating` to its own component file if `App.tsx` is split
   - Add category or difficulty icons only if they improve scanning without clutter
3. Add hero illustration using `gpt-image-1.5`.
4. Add bilingual UI copy if desired.
5. Add polish for mobile cards and spacing.

## Plant Growth Simulator Design

New plant detail pages can include a lightweight “Growth timeline” / “Watch it grow” module using only inline SVG and CSS. The visual language should match the current `PlantIcon` set: rounded green/yellow tiles, simple filled botanical shapes, 2-3px rounded strokes, no external image dependency.

Recommended layout:

- Place on `/plants/:id` below the `Growing snapshot` card or as a full-width detail card after the hero.
- Card title: `Growth timeline`; supporting copy: `Drag the slider to preview each stage from seed to harvest.`
- Two-column desktop layout: left side has the large current-stage icon and stage copy; right side has 5 stage chips or a horizontal timeline. Stack on mobile.
- Use one primary draggable control (`input[type="range"]`, min `0`, max `4`, step `1`) so it works with mouse, touch, and keyboard. Stage chips can also be buttons for direct selection.
- Keep interaction calm: 160-220ms transform/opacity transition, no continuous animations unless explicitly requested.

Stages and copy:

1. `seed` — Label: `Seed`; copy: `Start with a healthy seed or seedling mix. Keep the soil gently moist while roots wake up.`
2. `sprout` — Label: `Sprout`; copy: `First shoots appear. Protect from harsh wind and keep light steady.`
3. `leafy` — Label: `Leafy growth`; copy: `Leaves build energy. Check watering and thin or space plants if they crowd.`
4. `flowering` — Label: `Flowering`; copy: `Flowers signal fruit or seed formation. Avoid stress and keep pollinators welcome.`
5. `harvest` / `mature` — Label: `Harvest`; copy: `Pick when mature and healthy. Harvest little-and-often for many leafy crops.`

Color and sizing guidance:

- Stage icon tile: desktop `72px`, detail-feature size `112-144px`; mobile `60px`/`96px`.
- Timeline rail: `#d8edb7`; completed fill: `#6da63f`; active thumb: `#f4a825` with `#fff7d6` center.
- Stage tile backgrounds: seed `#fffbea → #e7f1d6`, sprout/leafy `#f5fbde → #dcefd2`, flowering `#fff7d6 → #e7f1d6`, harvest `#fff0d7 → #e7f1d6`.
- Use current semantic greens (`#356c32`, `#39743a`, `#78b95a`, `#9ccc65`), flower yellow (`#f7c948`), harvest tomato red (`#e95c45`) sparingly.

Reusable SVG / React-friendly structure:

- A lightweight `frontend/src/components/GrowthStageIcon.tsx` component has been added with variants: `seed`, `sprout`, `leafy`, `flowering`, `harvest`.
- It uses a 96x96 viewBox, shared `.growth-*` CSS classes, and `role="img"` / `aria-label` on the wrapper.
- The component is intentionally not wired into `App.tsx` yet; frontend implementation can import it when adding the draggable module.

Suggested module CSS class names for the future implementation:

- `.growth-simulator-card`
- `.growth-simulator-preview`
- `.growth-stage-icon-large`
- `.growth-stage-copy`
- `.growth-timeline`
- `.growth-stage-chip`
- `.growth-range`

Accessibility requirements:

- Slider label should include current stage, e.g. `Growth stage: Leafy growth, 3 of 5`.
- Stage chips need `aria-current="step"` or `aria-pressed` for the active stage.
- Do not rely on color alone; keep stage labels visible.

Crop-specific illustration rules:

- Growth artwork must be recognisable by silhouette and produce morphology, not just palette swaps.
- SVG is acceptable only when the plant is recognisable at actual card size. If users cannot identify the crop, switch that crop to staged raster/illustration assets.
- Main recommendation crops now use PNG stage illustrations under `public/growth-stages/<plant>/` rather than SVG: tomato, lettuce, broad-bean, silverbeet, coriander, parsley, kawakawa, and spinach.
- Tomato may use red fruit; leafy crops must not. Spinach mature/harvest specifically stays as an oval-leaf rosette with seed-stalk/cut cues, never tomato-like red berries.
- Broad bean should show long green pods with visible beans at harvest; lettuce image assets should remain stage-specific: seed/sprout = seeds and young seedling, leafy = low pale-green rosette, flowering/bolting = taller central stalk with small yellow flowers/seed heads and no fruit, harvest = compact layered lettuce head, mature = older bolted lettuce retaining lettuce leaf shapes; silverbeet needs yellow ribs; coriander should look lacy/fine; parsley should look rounded/lobed; kawakawa should keep the heart-shaped leaf and perforation motif.
- Add future plants by introducing named crop-specific image assets first when recognition is important: six files named `seed.png`, `sprout.png`, `leafy.png`, `flowering.png`, `harvest.png`, and `mature.png`, then document the identifying feature here.
