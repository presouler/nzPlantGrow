import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { getCurrentRecommendations, getPlantDetail } from './api/recommendations';
import { getAucklandWeather } from './api/weather';
import { PlantIcon } from './components/PlantIcon';
import type { AucklandWeatherResponse, CurrentRecommendationsResponse, GrowthStageId, HeroWeather, PlantDetail, PlantGrowthStage, PlantRecommendation, WeatherCondition } from './types';
import { formatMonthRange } from './utils/season';

const difficultyMeta = {
  easy: {
    label: '1/5 Easy / beginner friendly',
    className: 'easy',
    stars: 1,
  },
  medium: {
    label: '3/5 Medium / regular care needed',
    className: 'medium',
    stars: 3,
  },
  hard: {
    label: '5/5 Hard / experienced gardeners',
    className: 'hard',
    stars: 5,
  },
  moderate: {
    label: '3/5 Medium / regular care needed',
    className: 'medium',
    stars: 3,
  },
  advanced: {
    label: '5/5 Hard / experienced gardeners',
    className: 'hard',
    stars: 5,
  },
};

const difficultyGuide = [
  { stars: 1, text: 'Beginner friendly' },
  { stars: 2, text: 'Easy, occasional checks' },
  { stars: 3, text: 'Moderate regular care' },
  { stars: 4, text: 'Challenging conditions' },
  { stars: 5, text: 'Advanced growers' },
];

const seasonWeatherFallback: Record<string, HeroWeather> = {
  summer: {
    condition: 'sunny',
    comfort: 'hot',
    temperatureCelsius: 27,
  },
  autumn: {
    condition: 'sun-shower',
    comfort: 'suitable',
    temperatureCelsius: 18,
  },
  winter: {
    condition: 'cloudy',
    comfort: 'cold',
    temperatureCelsius: 9,
  },
  spring: {
    condition: 'overcast',
    comfort: 'suitable',
    temperatureCelsius: 16,
  },
};

function getHeroWeather(season: string, weather: AucklandWeatherResponse | null): HeroWeather {
  return weather ?? seasonWeatherFallback[season.toLowerCase()] ?? seasonWeatherFallback.spring;
}

function formatWeatherObservedAt(observedAt: string): string {
  const date = new Date(observedAt);

  if (Number.isNaN(date.getTime())) {
    return observedAt;
  }

  return new Intl.DateTimeFormat('en-NZ', {
    timeZone: 'Pacific/Auckland',
    hour: 'numeric',
    minute: '2-digit',
    day: 'numeric',
    month: 'short',
  }).format(date);
}

function HeroWeatherScene({ condition }: { condition: WeatherCondition }) {
  return (
    <div className="hero-weather-scene" aria-hidden="true">
      {(condition === 'sunny' || condition === 'sun-shower') && (
        <span className="hero-scene-sun">
          <span />
        </span>
      )}
      {(condition === 'cloudy' || condition === 'overcast' || condition === 'rainy' || condition === 'sun-shower') && (
        <>
          <span className="hero-scene-cloud hero-scene-cloud-one" />
          <span className="hero-scene-cloud hero-scene-cloud-two" />
        </>
      )}
      {(condition === 'rainy' || condition === 'sun-shower') && (
        <span className="hero-scene-rain">
          {Array.from({ length: 14 }, (_, index) => <i key={index} />)}
        </span>
      )}
      {condition === 'windy' && (
        <>
          <span className="hero-scene-wind hero-scene-wind-one" />
          <span className="hero-scene-wind hero-scene-wind-two" />
          <span className="hero-scene-wind hero-scene-wind-three" />
          <span className="hero-scene-leaf hero-scene-leaf-one" />
          <span className="hero-scene-leaf hero-scene-leaf-two" />
          <span className="hero-scene-leaf hero-scene-leaf-three" />
        </>
      )}
    </div>
  );
}

function getDifficultyMeta(difficulty: string) {
  return difficultyMeta[difficulty.toLowerCase() as keyof typeof difficultyMeta] ?? {
    label: difficulty,
    className: 'medium',
    stars: 3,
  };
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="star-rating" aria-label={`Planting difficulty ${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, index) => (
        <span className={index < rating ? 'star star-filled' : 'star'} key={index} aria-hidden="true">
          ★
        </span>
      ))}
    </span>
  );
}

function getWateringRating(watering: string) {
  const normalized = watering.toLowerCase();

  if (/\b(high|heavy|frequent|often|plenty|more water|needs? more|very moist)\b/.test(normalized)) {
    return 5;
  }

  if (/\b(reduce|reduced|after planting|establishing|lightly|low)\b/.test(normalized)) {
    return 2;
  }

  if (/\b(minimal|dry|drought|sparingly|little water)\b/.test(normalized)) {
    return 1;
  }

  if (/\b(deep|deeply|weekly|base)\b/.test(normalized)) {
    return 4;
  }

  if (/\b(regular|regularly|consistent|consistently|evenly|moderate|moist|shallow)\b/.test(normalized)) {
    return 3;
  }

  return 3;
}

function WaterDropRating({ watering }: { watering: string }) {
  const rating = getWateringRating(watering);

  return (
    <span
      className={`water-rating water-rating-${rating}`}
      aria-label={`Watering need ${rating} out of 5 drops: ${watering}`}
      role="img"
      title={watering}
    >
      {Array.from({ length: 5 }, (_, index) => (
        <svg
          className={index < rating ? 'water-drop water-drop-filled' : 'water-drop'}
          viewBox="0 0 24 24"
          aria-hidden="true"
          focusable="false"
          key={index}
        >
          <path d="M12 2.8C8 7.6 5.7 11.2 5.7 14.5a6.3 6.3 0 0 0 12.6 0C18.3 11.2 16 7.6 12 2.8Z" />
          <path className="water-drop-shine" d="M9.2 13.5c0 1.9 1.1 3.2 2.8 3.7" />
        </svg>
      ))}
    </span>
  );
}


const defaultGrowthStages: PlantGrowthStage[] = [
  {
    id: 'seed',
    label: 'Seed',
    headline: 'Seed',
    description: 'A quiet seed resting in warm, moist soil.',
    tip: 'Keep the bed evenly damp and protected while roots wake up.',
    timeLabel: 'Week 0',
    startDay: 0,
    endDay: 0,
  },
  {
    id: 'sprout',
    label: 'Sprout',
    headline: 'Sprout',
    description: 'The first shoot pushes through and starts chasing light.',
    tip: 'Gentle light and steady moisture help this fragile stage settle.',
    timeLabel: 'Week 1–2',
    startDay: 7,
    endDay: 14,
  },
  {
    id: 'leafy',
    label: 'Leafy growth',
    headline: 'Leafy growth',
    description: 'Leaves expand quickly as the plant builds energy.',
    tip: 'Check spacing, mulch lightly, and keep weeds from competing.',
    timeLabel: 'Week 3–6',
    startDay: 21,
    endDay: 42,
  },
  {
    id: 'flowering',
    label: 'Flowering',
    headline: 'Flowering',
    description: 'Flowers or strong growing tips show the plant is maturing.',
    tip: 'Avoid stress now; consistent watering supports the next stage.',
    timeLabel: 'Varies by crop',
    startDay: 42,
    endDay: 70,
  },
  {
    id: 'harvest',
    label: 'Harvest ready',
    headline: 'Harvest ready',
    description: 'Useful leaves, pods, bulbs, or fruit are ready to pick.',
    tip: 'Harvest regularly and gently so the plant keeps its strength.',
    timeLabel: 'Crop-specific harvest window',
    startDay: 60,
    endDay: 100,
  },
  {
    id: 'mature',
    label: 'Mature plant',
    headline: 'Mature plant',
    description: 'The plant is fully established and finishing its cycle.',
    tip: 'Collect seed, compost tired growth, or reset the bed for the next crop.',
    timeLabel: 'End of crop cycle',
    startDay: 90,
    endDay: 140,
  },
];

const growthStageOrder: Record<GrowthStageId, number> = {
  seed: 0,
  sprout: 1,
  leafy: 2,
  flowering: 3,
  harvest: 4,
  mature: 5,
};

function getGrowthPalette(plant: PlantDetail, visualHint?: string) {
  const source = `${visualHint ?? ''} ${plant.icon ?? ''} ${plant.id} ${plant.name}`.toLowerCase();

  if (source.includes('tomato')) return 'tomato';
  if (source.includes('garlic')) return 'garlic';
  if (source.includes('silverbeet') || source.includes('chard')) return 'silverbeet';
  if (source.includes('kawakawa')) return 'kawakawa';
  if (source.includes('kale')) return 'kale';
  return 'default';
}

function GrowthPlantSvg({ stage, plant }: { stage: PlantGrowthStage; plant: PlantDetail }) {
  const stageIndex = growthStageOrder[stage.id];
  const palette = getGrowthPalette(plant, stage.visualHint);
  const showSprout = stageIndex >= 1;
  const showLeaves = stageIndex >= 2;
  const showFlowers = stageIndex >= 3;
  const showHarvest = stageIndex >= 4;
  const showMature = stageIndex >= 5;

  return (
    <svg className={`growth-plant-svg growth-palette-${palette}`} viewBox="0 0 180 160" aria-hidden="true" focusable="false">
      <ellipse className="growth-soil" cx="90" cy="134" rx="64" ry="16" />
      {stage.id === 'seed' && (
        <>
          <ellipse className="growth-seed" cx="90" cy="124" rx="14" ry="9" />
          <path className="growth-seed-shine" d="M84 121c4-3 8-4 13-2" />
        </>
      )}
      {showSprout && <path className="growth-stem" d={`M90 124 C88 ${showMature ? 78 : 96}, 91 ${showMature ? 45 : 70}, 90 ${showMature ? 28 : 58}`} />}
      {showSprout && <path className="growth-leaf growth-leaf-sprout" d="M90 93C72 82 75 68 91 61c10 11 8 24-1 32Z" />}
      {showLeaves && (
        <>
          <path className="growth-leaf growth-leaf-left" d="M88 88C57 76 51 49 73 36c24 9 31 32 15 52Z" />
          <path className="growth-leaf growth-leaf-right" d="M93 79c31-13 42-38 20-53-25 9-33 32-20 53Z" />
          <path className="growth-leaf growth-leaf-low" d="M89 110C61 108 48 87 62 69c24 1 39 19 27 41Z" />
          <path className="growth-leaf growth-leaf-low-right" d="M93 108c28-2 43-22 29-40-24 1-40 18-29 40Z" />
        </>
      )}
      {showFlowers && (
        <g className="growth-flowers">
          <circle cx="88" cy="30" r="6" />
          <circle cx="79" cy="35" r="6" />
          <circle cx="97" cy="36" r="6" />
          <circle cx="88" cy="41" r="6" />
          <circle className="growth-flower-core" cx="88" cy="36" r="5" />
        </g>
      )}
      {showHarvest && (
        <g className="growth-harvest">
          <circle cx="67" cy="78" r="8" />
          <circle cx="113" cy="72" r="8" />
          <ellipse cx="88" cy="106" rx="8" ry="11" />
        </g>
      )}
      {showMature && (
        <>
          <path className="growth-mature-arch" d="M51 55C76 18 116 18 139 55" />
          <path className="growth-leaf growth-leaf-mature-left" d="M63 58C35 48 33 25 54 17c21 10 25 29 9 41Z" />
          <path className="growth-leaf growth-leaf-mature-right" d="M119 57c28-10 31-34 10-42-22 10-27 30-10 42Z" />
        </>
      )}
    </svg>
  );
}

function GrowthSimulator({ plant }: { plant: PlantDetail }) {
  const stages = plant.growthStages && plant.growthStages.length > 0 ? plant.growthStages : defaultGrowthStages;
  const [stageIndex, setStageIndex] = useState(Math.min(2, stages.length - 1));
  const safeStageIndex = Math.min(stageIndex, stages.length - 1);
  const stage = stages[safeStageIndex];
  const progress = stages.length > 1 ? safeStageIndex / (stages.length - 1) : 0;

  useEffect(() => {
    setStageIndex((currentIndex) => Math.min(currentIndex, stages.length - 1));
  }, [stages.length]);

  return (
    <div className="plant-detail-card growth-simulator-card">
      <div className="growth-simulator-copy">
        <p className="eyebrow">Interactive guide</p>
        <h2>Growth simulator</h2>
        <p>Drag the timeline to preview how {plant.name} changes from seed to mature plant.</p>
      </div>

      <div className="growth-simulator-stage" aria-live="polite">
        <GrowthPlantSvg stage={stage} plant={plant} />
        <div>
          <span className="growth-stage-count">Stage {safeStageIndex + 1} of {stages.length}</span>
          {stage.timeLabel && <span className="growth-stage-time">{stage.timeLabel}</span>}
          <h3>{stage.headline}</h3>
          <p>{stage.description}</p>
          <small>{stage.tip}</small>
        </div>
      </div>

      <label className="growth-range-label" htmlFor="growth-stage-range">Growth timeline</label>
      <input
        id="growth-stage-range"
        className="growth-range"
        type="range"
        min="0"
        max={stages.length - 1}
        step="1"
        value={safeStageIndex}
        aria-valuetext={stage.label}
        onChange={(event) => setStageIndex(Number(event.currentTarget.value))}
      />

      <div className="growth-timeline" style={{ '--growth-progress': `${progress * 100}%` } as CSSProperties} aria-label="Choose growth stage">
        {stages.map((item, index) => (
          <button
            className={index <= safeStageIndex ? 'growth-stage-dot is-active' : 'growth-stage-dot'}
            type="button"
            key={item.id}
            onClick={() => setStageIndex(index)}
            aria-pressed={index === safeStageIndex}
            aria-label={`Show ${item.label} stage`}
          >
            <span aria-hidden="true">{index + 1}</span>
            <strong>{item.label}</strong>
          </button>
        ))}
      </div>
    </div>
  );
}

function DifficultyGuide() {
  return (
    <aside className="difficulty-guide" aria-label="Planting difficulty guide">
      <strong>Difficulty guide</strong>
      <div className="difficulty-guide-list">
        {difficultyGuide.map((item) => (
          <div className="difficulty-guide-item" key={item.stars}>
            <StarRating rating={item.stars} />
            <span>{item.text}</span>
          </div>
        ))}
      </div>
    </aside>
  );
}

function getSunIconType(sun: string) {
  const normalized = sun.toLowerCase();

  if (normalized.includes('full sun')) return 'full-sun';
  if (normalized.includes('part shade') || normalized.includes('part sun')) return 'part-shade';
  if (normalized.includes('shade')) return 'shade';
  return 'part-shade';
}

function SunExposureIcon({ sun }: { sun: string }) {
  const iconType = getSunIconType(sun);

  return (
    <span className={`sun-icon sun-icon-${iconType}`} aria-label={`Sun requirement: ${sun}`} role="img">
      <svg viewBox="0 0 64 64" aria-hidden="true" focusable="false">
        {iconType !== 'shade' && (
          <>
            <circle className="sun-core" cx="32" cy="32" r="11" />
            <path
              className="sun-rays"
              d="M32 12v8M32 44v8M12 32h8M44 32h8M17.9 17.9l5.7 5.7M40.4 40.4l5.7 5.7M46.1 17.9l-5.7 5.7M23.6 40.4l-5.7 5.7"
            />
          </>
        )}
        {iconType !== 'full-sun' && (
          <path
            className="shade-cloud"
            d="M24 46h25a9 9 0 0 0 1.3-17.9A13 13 0 0 0 25.8 24 10.5 10.5 0 0 0 24 46Z"
          />
        )}
        {iconType === 'shade' && (
          <path
            className="shade-leaf"
            d="M14 35c12-19 29-22 40-18-2 18-16 32-36 31 6-9 14-16 24-22-12 3-21 9-28 21-4-4-4-8 0-12Z"
          />
        )}
      </svg>
    </span>
  );
}


type AppRoute =
  | { name: 'home' }
  | { name: 'plant-detail'; id: string };

type AppHistoryState = {
  homeScrollY?: number;
};

function getRouteFromLocation(): AppRoute {
  const match = window.location.pathname.match(/^\/plants\/([^/]+)\/?$/);

  if (!match) {
    return { name: 'home' };
  }

  return { name: 'plant-detail', id: decodeURIComponent(match[1]) };
}

function plantDetailPath(id: string): string {
  return `/plants/${encodeURIComponent(id)}`;
}

function getHistoryHomeScrollY(state: unknown): number | null {
  if (!state || typeof state !== 'object') return null;

  const scrollY = (state as AppHistoryState).homeScrollY;
  return typeof scrollY === 'number' && Number.isFinite(scrollY) ? scrollY : null;
}

function PlantCardLink({ plant, onOpen }: { plant: PlantRecommendation; onOpen: (id: string) => void }) {
  const difficulty = getDifficultyMeta(plant.difficulty);

  return (
    <a
      className="plant-card plant-card-link"
      href={plantDetailPath(plant.id)}
      onClick={(event) => {
        event.preventDefault();
        onOpen(plant.id);
      }}
      aria-label={`View details for ${plant.name}`}
    >
      <article>
        <div className="card-topline">
          <span className="category">{plant.category}</span>
          <PlantIcon id={plant.id} icon={plant.icon} name={plant.name} />
        </div>
        <h3>{plant.name}</h3>
        <dl>
          <div>
            <dt>Planting difficulty</dt>
            <dd className={`difficulty-value difficulty-${difficulty.className}`} aria-label={difficulty.label}>
              <StarRating rating={difficulty.stars} />
            </dd>
          </div>
          <div>
            <dt>Suitable months</dt>
            <dd>{formatMonthRange(plant.suitableMonths)}</dd>
          </div>
          <div>
            <dt>Sun</dt>
            <dd className="sun-visual"><SunExposureIcon sun={plant.sun} /></dd>
          </div>
          <div>
            <dt>Watering</dt>
            <dd className="water-visual"><WaterDropRating watering={plant.watering} /></dd>
          </div>
        </dl>
        <p>{plant.notes}</p>
        <span className="plant-card-cta">View details →</span>
      </article>
    </a>
  );
}

function PlantDetailPage({ plant, isLoading, onBack }: { plant: PlantDetail | null; isLoading: boolean; onBack: () => void }) {
  if (isLoading && !plant) {
    return <main className="app-shell loading">Loading plant details…</main>;
  }

  if (!plant) {
    return (
      <main className="app-shell loading">
        <button className="back-link" type="button" onClick={onBack}>← Back to recommendations</button>
        Plant details are not available yet.
      </main>
    );
  }

  const difficulty = getDifficultyMeta(plant.difficulty);
  const careTips = plant.careTips?.filter(Boolean) ?? [];
  const detailSections = plant.detailSections?.filter((section) => section.title || section.body || section.items?.length) ?? [];

  return (
    <main className="app-shell plant-detail-shell">
      <button className="back-link" type="button" onClick={onBack}>← Back to recommendations</button>

      <section className="plant-detail-hero" aria-labelledby="plant-detail-title">
        <div className="plant-detail-icon">
          <PlantIcon id={plant.id} icon={plant.icon} name={plant.name} />
        </div>
        <div>
          <p className="eyebrow">Plant detail</p>
          <h1 id="plant-detail-title">{plant.name}</h1>
          <div className="plant-detail-tags">
            <span className="category">{plant.category}</span>
            <span className={`difficulty difficulty-${difficulty.className}`}>{difficulty.label}</span>
          </div>
        </div>
      </section>

      <section className="plant-detail-grid" aria-label={`${plant.name} growing details`}>
        <div className="plant-detail-card plant-detail-summary">
          <h2>Growing snapshot</h2>
          <dl>
            <div>
              <dt>Difficulty</dt>
              <dd className={`difficulty-value difficulty-${difficulty.className}`}><StarRating rating={difficulty.stars} /></dd>
            </div>
            <div>
              <dt>Best planting months</dt>
              <dd>{plant.plantingWindowLabel ?? formatMonthRange(plant.suitableMonths)}</dd>
            </div>
            <div>
              <dt>Sun</dt>
              <dd><SunExposureIcon sun={plant.sun} /><span>{plant.sun}</span></dd>
            </div>
            <div>
              <dt>Water</dt>
              <dd><WaterDropRating watering={plant.watering} /><span>{plant.watering}</span></dd>
            </div>
          </dl>
        </div>

        <div className="plant-detail-card plant-notes-card">
          <h2>Notes</h2>
          <p>{plant.notes}</p>
        </div>

        <GrowthSimulator plant={plant} />

        {careTips.length > 0 && (
          <div className="plant-detail-card">
            <h2>Care tips</h2>
            <ul className="care-tip-list">
              {careTips.map((tip) => <li key={tip}>{tip}</li>)}
            </ul>
          </div>
        )}

        {detailSections.map((section) => (
          <div className="plant-detail-card" key={section.title}>
            <h2>{section.title}</h2>
            {section.body && <p>{section.body}</p>}
            {section.items && section.items.length > 0 && (
              <ul className="care-tip-list">
                {section.items.map((item) => <li key={item}>{item}</li>)}
              </ul>
            )}
          </div>
        ))}
      </section>
    </main>
  );
}

function App() {
  const [data, setData] = useState<CurrentRecommendationsResponse | null>(null);
  const [aucklandWeather, setAucklandWeather] = useState<AucklandWeatherResponse | null>(null);
  const [route, setRoute] = useState<AppRoute>(() => getRouteFromLocation());
  const [plantDetail, setPlantDetail] = useState<PlantDetail | null>(null);
  const [isPlantDetailLoading, setIsPlantDetailLoading] = useState(false);
  const homeScrollYRef = useRef(0);
  const pendingHomeScrollYRef = useRef<number | null>(null);

  useEffect(() => {
    let isMounted = true;

    void Promise.all([getCurrentRecommendations(), getAucklandWeather()]).then(([recommendations, weather]) => {
      if (!isMounted) return;

      setAucklandWeather(weather);
      setData(recommendations);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const previousScrollRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';

    const handlePopState = (event: PopStateEvent) => {
      const nextRoute = getRouteFromLocation();

      if (nextRoute.name === 'home') {
        pendingHomeScrollYRef.current = getHistoryHomeScrollY(event.state) ?? homeScrollYRef.current;
      }

      setRoute(nextRoute);
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.history.scrollRestoration = previousScrollRestoration;
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  useEffect(() => {
    if (route.name !== 'home' || !data || pendingHomeScrollYRef.current === null) return;

    const scrollY = pendingHomeScrollYRef.current;
    pendingHomeScrollYRef.current = null;
    window.requestAnimationFrame(() => window.scrollTo({ top: scrollY, left: 0, behavior: 'auto' }));
  }, [route, data]);

  useEffect(() => {
    if (route.name !== 'plant-detail') {
      setPlantDetail(null);
      setIsPlantDetailLoading(false);
      return;
    }

    let isMounted = true;
    setIsPlantDetailLoading(true);

    void getPlantDetail(route.id, data?.recommendations).then((plant) => {
      if (!isMounted) return;

      setPlantDetail(plant);
      setIsPlantDetailLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [route, data?.recommendations]);

  function navigateToPlant(id: string) {
    const path = plantDetailPath(id);
    const homeScrollY = window.scrollY;

    homeScrollYRef.current = homeScrollY;
    window.history.replaceState({ ...window.history.state, homeScrollY }, '', window.location.href);
    window.history.pushState({ homeScrollY }, '', path);
    setRoute({ name: 'plant-detail', id });
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }

  function navigateToHome() {
    const homeScrollY = homeScrollYRef.current;

    pendingHomeScrollYRef.current = homeScrollY;
    window.history.pushState({ homeScrollY }, '', '/');
    setRoute({ name: 'home' });
  }

  if (route.name === 'plant-detail') {
    return <PlantDetailPage plant={plantDetail} isLoading={isPlantDetailLoading} onBack={navigateToHome} />;
  }

  if (!data) {
    return <main className="app-shell loading">Loading seasonal planting ideas…</main>;
  }

  const heroWeather = getHeroWeather(data.season, aucklandWeather);
  const hasLiveWeather = aucklandWeather !== null;

  return (
    <main className="app-shell">
      <section className={`hero hero-weather-${heroWeather.condition} hero-temp-${heroWeather.comfort}`} aria-labelledby="page-title">
        <HeroWeatherScene condition={heroWeather.condition} />
        <p className="eyebrow">New Zealand planting guide</p>
        <h1 id="page-title">nzPlant</h1>
        <p className="intro">
          Seasonal plant recommendations for Kiwi home gardens, based on today’s NZ date.
        </p>
        <div className="hero-facts" aria-label="Current recommendation context">
          <span>{data.date}</span>
          <strong>{data.season}</strong>
          {hasLiveWeather && (
            <strong className="hero-temperature" aria-label={`Today’s temperature ${heroWeather.temperatureCelsius} degrees Celsius`}>
              {heroWeather.temperatureCelsius}°C
            </strong>
          )}
        </div>
        {aucklandWeather && (
          <p className="hero-weather-meta">
            {aucklandWeather.location} weather from {aucklandWeather.source} · updated{' '}
            {formatWeatherObservedAt(aucklandWeather.observedAt)}
          </p>
        )}
      </section>

      <section className="recommendations" aria-labelledby="recommendations-title">
        <div className="recommendations-layout">
          <div className="recommendations-main">
            <div className="section-heading">
              <p className="eyebrow">Plant now</p>
              <h2 id="recommendations-title">Recommended for {data.season.toLowerCase()}</h2>
            </div>

            <div className="plant-grid">
              {data.recommendations.map((plant) => (
                <PlantCardLink plant={plant} onOpen={navigateToPlant} key={plant.id} />
              ))}
            </div>
          </div>

          <DifficultyGuide />
        </div>
      </section>
    </main>
  );
}

export default App;
