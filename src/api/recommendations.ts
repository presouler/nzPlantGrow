import { mockRecommendations } from '../data/mockRecommendations';
import type { ApiCurrentRecommendationsResponse, CurrentRecommendationsResponse } from '../types';
import { getNzMonth, getNzSeason, formatNzDate } from '../utils/season';

const endpoint = '/api/recommendations/current';

function buildMockResponse(): CurrentRecommendationsResponse {
  const currentMonth = getNzMonth();
  const recommendations = mockRecommendations.filter((plant) =>
    plant.suitableMonths.includes(currentMonth),
  );

  return {
    date: formatNzDate(),
    season: getNzSeason(),
    recommendations: recommendations.length > 0 ? recommendations : mockRecommendations.slice(0, 4),
  };
}

function normalizeApiResponse(apiResponse: ApiCurrentRecommendationsResponse): CurrentRecommendationsResponse {
  return {
    date: apiResponse.date,
    season: apiResponse.season,
    recommendations: apiResponse.recommendations.map((plant) => ({
      id: plant.id,
      name: plant.name,
      category: plant.category,
      suitableMonths: plant.plantingMonths,
      sun: plant.sun,
      watering: plant.water,
      difficulty: plant.difficulty,
      notes: plant.notes,
      icon: plant.icon,
    })),
  };
}

export async function getCurrentRecommendations(): Promise<CurrentRecommendationsResponse> {
  try {
    const response = await fetch(endpoint, { headers: { Accept: 'application/json' } });

    if (!response.ok) {
      throw new Error(`Recommendations API returned ${response.status}`);
    }

    return normalizeApiResponse((await response.json()) as ApiCurrentRecommendationsResponse);
  } catch {
    return buildMockResponse();
  }
}
