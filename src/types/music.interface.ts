export interface TimeRange {
  startDate: Date;
  endDate: Date;
}

export interface MusicQueryDto {
  guildId: string;
  startDate: string;
  endDate: string;
  limit?: number;
}

export interface MetricWithChange {
  value: number;
  change: number;
}

export interface MusicOverviewResponse {
  totalPlays: MetricWithChange;
  activeListeners: MetricWithChange;
  uniqueArtists: MetricWithChange;
  dualListenings: MetricWithChange;
}

export interface GenrePreference {
  genre: string;
  percentage: number;
  playCount: number;
}

export interface Artist {
  id: string;
  name: string;
  spotifyId: string | null;
  genres: string[];
  createdAt: any;
  updatedAt: any;
}

export interface TopArtist {
  artist: Artist;
  _count: {
    songName: number;
  };
}

export interface PeakHoursResponse {
  hourlyDistribution: number[];
  peakHour: number;
  totalListens: number;
}

export interface AverageSessionResponse {
  averageMinutes: number;
  formattedDuration: string;
  change: number;
}

export interface PopularTrack {
  songName: string;
  artist: string;
  album: string;
  _count: {
    songName: number;
  };
}

export interface MusicDashboardResponse {
  overview: MusicOverviewResponse;
  genres: GenrePreference[];
  topArtists: TopArtist[];
  peakHours: PeakHoursResponse;
  avgSession: AverageSessionResponse;
  popularTracks: PopularTrack[];
}

export interface AggregationResponse {
  success: boolean;
  message: string;
}
