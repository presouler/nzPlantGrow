import { mockRecommendations } from '../data/mockRecommendations';
import type {
  ApiCurrentRecommendationsResponse,
  ApiPlantDetail,
  ApiPlantRecommendation,
  CurrentRecommendationsResponse,
  PlantDetail,
  PlantGrowthStage,
  PlantRecommendation,
} from '../types';
import { getNzMonth, getNzSeason, formatNzDate, formatMonthRange } from '../utils/season';

const endpoint = '/api/recommendations/current';
const plantDetailEndpoint = (id: string) => `/api/plants/${encodeURIComponent(id)}`;

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

function normalizeApiPlant(plant: ApiPlantRecommendation): PlantRecommendation {
  return {
    id: plant.id,
    name: plant.name,
    category: plant.category,
    suitableMonths: plant.plantingMonths,
    sun: plant.sun,
    watering: plant.water,
    difficulty: plant.difficulty,
    notes: plant.notes,
    icon: plant.icon,
  };
}

function normalizeApiResponse(apiResponse: ApiCurrentRecommendationsResponse): CurrentRecommendationsResponse {
  return {
    date: apiResponse.date,
    season: apiResponse.season,
    recommendations: apiResponse.recommendations.map(normalizeApiPlant),
  };
}

const growthStageIds = new Set(['seed', 'sprout', 'leafy', 'flowering', 'harvest', 'mature']);

function normalizeApiGrowthStages(stages: ApiPlantDetail['growthStages']): PlantGrowthStage[] | undefined {
  if (!Array.isArray(stages)) return undefined;

  const normalizedStages = stages.filter((stage): stage is PlantGrowthStage => {
    if (stage === null || typeof stage !== 'object') return false;

    const candidate = stage as Record<string, unknown>;

    return typeof candidate.id === 'string'
      && growthStageIds.has(candidate.id)
      && typeof candidate.label === 'string'
      && typeof candidate.headline === 'string'
      && typeof candidate.description === 'string'
      && typeof candidate.tip === 'string'
      && (candidate.visualHint === undefined || typeof candidate.visualHint === 'string');
  });

  return normalizedStages.length > 0 ? normalizedStages : undefined;
}

function normalizeApiPlantDetail(plant: ApiPlantDetail): PlantDetail {
  return {
    ...normalizeApiPlant(plant),
    plantingWindowLabel: plant.plantingWindowLabel,
    careTips: plant.careTips,
    detailSections: plant.detailSections,
    growthStages: normalizeApiGrowthStages(plant.growthStages),
  };
}

function humanizePlantId(id: string): string {
  return id
    .split('-')
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(' ') || 'Plant';
}

function buildFallbackPlantDetail(id: string, recommendations: PlantRecommendation[] = []): PlantDetail {
  const plant = recommendations.find((candidate) => candidate.id === id)
    ?? mockRecommendations.find((candidate) => candidate.id === id)
    ?? {
      id,
      name: humanizePlantId(id),
      category: 'Garden plant',
      suitableMonths: [getNzMonth()],
      sun: 'Full sun to part shade',
      watering: 'Water regularly while establishing.',
      difficulty: 'Easy' as const,
      notes: 'Detailed growing notes are not available yet, but this page will update automatically when the backend provides them.',
      icon: id,
    };

  return {
    ...plant,
    plantingWindowLabel: formatMonthRange(plant.suitableMonths),
    careTips: [
      plant.sun,
      plant.watering,
      'Check soil moisture and local frost risk before planting.',
    ],
    detailSections: [
      {
        title: 'At a glance',
        body: plant.notes,
      },
    ],
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

export async function getPlantDetail(id: string, recommendations: PlantRecommendation[] = []): Promise<PlantDetail> {
  try {
    const response = await fetch(plantDetailEndpoint(id), { headers: { Accept: 'application/json' } });

    if (!response.ok) {
      throw new Error(`Plant detail API returned ${response.status}`);
    }

    return normalizeApiPlantDetail((await response.json()) as ApiPlantDetail);
  } catch {
    return buildFallbackPlantDetail(id, recommendations);
  }
}
