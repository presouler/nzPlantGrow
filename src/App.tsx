import { useEffect, useState } from 'react';
import { getCurrentRecommendations } from './api/recommendations';
import { getAucklandWeather } from './api/weather';
import { PlantIcon } from './components/PlantIcon';
import type { AucklandWeatherResponse, CurrentRecommendationsResponse, HeroWeather, WeatherCondition } from './types';
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

function App() {
  const [data, setData] = useState<CurrentRecommendationsResponse | null>(null);
  const [aucklandWeather, setAucklandWeather] = useState<AucklandWeatherResponse | null>(null);

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
              {data.recommendations.map((plant) => {
                const difficulty = getDifficultyMeta(plant.difficulty);

                return (
                  <article className="plant-card" key={plant.id}>
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
                  </article>
                );
              })}
            </div>
          </div>

          <DifficultyGuide />
        </div>
      </section>
    </main>
  );
}

export default App;
