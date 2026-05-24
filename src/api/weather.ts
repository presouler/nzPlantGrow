import type { AucklandWeatherResponse, WeatherCondition, TemperatureComfort } from '../types';

const endpoint = '/api/weather/auckland';

function resolveApiUrl(path: string, baseUrl?: string): string {
  if (!baseUrl) return path;

  return new URL(path, baseUrl).toString();
}

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

export async function getAucklandWeather(baseUrl?: string): Promise<AucklandWeatherResponse | null> {
  try {
    const response = await fetch(resolveApiUrl(endpoint, baseUrl), { headers: { Accept: 'application/json' }, cache: 'no-store' });

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
