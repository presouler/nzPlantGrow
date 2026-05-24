import { getCurrentRecommendations } from '../src/api/recommendations';
import { getAucklandWeather } from '../src/api/weather';
import { HomePage } from '../src/App';

const apiBaseUrl = process.env.API_BASE_URL ?? 'http://127.0.0.1:3000';

export const dynamic = 'force-dynamic';

export default async function Page() {
  try {
    const [data, aucklandWeather] = await Promise.all([
      getCurrentRecommendations(apiBaseUrl),
      getAucklandWeather(apiBaseUrl),
    ]);

    return <HomePage data={data} aucklandWeather={aucklandWeather} />;
  } catch {
    return (
      <main className="app-shell loading">
        <p>Plant recommendations are unavailable right now. Please check that the backend is running, then try again.</p>
      </main>
    );
  }
}
