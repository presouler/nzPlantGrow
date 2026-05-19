export type PlantDifficulty = 'easy' | 'medium' | 'hard' | 'Easy' | 'Moderate' | 'Advanced';

export type PlantRecommendation = {
  id: string;
  name: string;
  category: string;
  suitableMonths: number[];
  sun: string;
  watering: string;
  difficulty: PlantDifficulty;
  notes: string;
  icon?: string;
};

export type ApiPlantRecommendation = {
  id: string;
  name: string;
  category: string;
  plantingMonths: number[];
  sun: string;
  water: string;
  difficulty: PlantDifficulty;
  notes: string;
  icon?: string;
};

export type CurrentRecommendationsResponse = {
  date: string;
  season: string;
  recommendations: PlantRecommendation[];
};

export type ApiCurrentRecommendationsResponse = {
  date: string;
  timezone: string;
  season: string;
  month: number;
  recommendations: ApiPlantRecommendation[];
};
