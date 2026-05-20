export type PlantDifficulty = 'easy' | 'medium' | 'hard' | 'Easy' | 'Moderate' | 'Advanced';

export type WeatherCondition = 'cloudy' | 'overcast' | 'sunny' | 'rainy' | 'sun-shower' | 'windy';

export type TemperatureComfort = 'cold' | 'suitable' | 'hot' | 'very-hot';

export type HeroWeather = {
  condition: WeatherCondition;
  comfort: TemperatureComfort;
  temperatureCelsius: number;
};

export type AucklandWeatherResponse = HeroWeather & {
  location: string;
  observedAt: string;
  source: string;
};

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

export type PlantDetailSection = {
  title: string;
  body?: string;
  items?: string[];
};

export type PlantDetail = PlantRecommendation & {
  plantingWindowLabel?: string;
  careTips?: string[];
  detailSections?: PlantDetailSection[];
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

export type ApiPlantDetail = ApiPlantRecommendation & {
  plantingWindowLabel?: string;
  careTips?: string[];
  detailSections?: PlantDetailSection[];
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
