import type {
  ApiCurrentRecommendationsResponse,
  ApiPlantDetail,
  ApiPlantRecommendation,
  CurrentRecommendationsResponse,
  PlantDetail,
  PlantGrowthStage,
  PlantRecommendation,
} from '../types';

const endpoint = '/api/recommendations/current';
const plantDetailEndpoint = (id: string) => `/api/plants/${encodeURIComponent(id)}`;

function resolveApiUrl(path: string, baseUrl?: string): string {
  if (!baseUrl) return path;

  return new URL(path, baseUrl).toString();
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
    month: apiResponse.month,
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
      && (candidate.timeLabel === undefined || typeof candidate.timeLabel === 'string')
      && (candidate.startDay === undefined || typeof candidate.startDay === 'number')
      && (candidate.endDay === undefined || typeof candidate.endDay === 'number')
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

export async function getCurrentRecommendations(baseUrl?: string): Promise<CurrentRecommendationsResponse> {
  const response = await fetch(resolveApiUrl(endpoint, baseUrl), { headers: { Accept: 'application/json' }, cache: 'no-store' });

  if (!response.ok) {
    throw new Error(`Recommendations API returned ${response.status}`);
  }

  return normalizeApiResponse((await response.json()) as ApiCurrentRecommendationsResponse);
}

export async function getPlantDetail(id: string, baseUrl?: string): Promise<PlantDetail> {
  const response = await fetch(resolveApiUrl(plantDetailEndpoint(id), baseUrl), { headers: { Accept: 'application/json' }, cache: 'no-store' });

  if (!response.ok) {
    throw new Error(`Plant detail API returned ${response.status}`);
  }

  return normalizeApiPlantDetail((await response.json()) as ApiPlantDetail);
}
