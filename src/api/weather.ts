import type { AucklandWeatherResponse, WeatherCondition, TemperatureComfort } from '../types';

const endpoint = '/api/weather/auckland';

const weatherConditions = new Set<WeatherCondition>([
  'cloudy',
  'overcast',
  'sunny',
  'rainy',
  'sun-shower',
  'windy',
]);

const comfortStates = new Set<TemperatureComfort>(['cold', 'suitable', 'hot', 'very-hot']);

function isAucklandWeatherResponse(value: unknown): value is AucklandWeatherResponse {
  if (!value || typeof value !== 'object') return false;

  const weather = value as Partial<AucklandWeatherResponse>;

  return (
    typeof weather.location === 'string' &&
    typeof weather.temperatureCelsius === 'number' &&
    typeof weather.condition === 'string' &&
    weatherConditions.has(weather.condition as WeatherCondition) &&
    typeof weather.comfort === 'string' &&
    comfortStates.has(weather.comfort as TemperatureComfort) &&
    typeof weather.observedAt === 'string' &&
    typeof weather.source === 'string'
  );
}

export async function getAucklandWeather(): Promise<AucklandWeatherResponse | null> {
  try {
    const response = await fetch(endpoint, { headers: { Accept: 'application/json' } });

    if (!response.ok) {
      throw new Error(`Auckland weather API returned ${response.status}`);
    }

    const weather = await response.json();

    if (!isAucklandWeatherResponse(weather)) {
      throw new Error('Auckland weather API returned an unsupported payload');
    }

    return weather;
  } catch {
    return null;
  }
}
