export interface GenreData {
  genre: string;
  percentage: number;
  playCount: number;
}

export interface GenrePreferencesCardProps {
  data: GenreData[];
}