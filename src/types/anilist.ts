// TypeScript-Interfaces für AniList GraphQL API

export interface MediaTitle {
  romaji: string | null;
  english: string | null;
  native: string | null;
}

export interface CoverImage {
  extraLarge: string | null;
  large: string | null;
  medium: string | null;
  color: string | null;
}

// Media Relations Types
export interface MediaEdge {
  id: number;
  relationType: 'SEQUEL' | 'PREQUEL' | 'PARENT' | 'SIDE_STORY' | 'CHARACTER' | 'SUMMARY' | 'ALTERNATIVE' | 'SPIN_OFF' | 'OTHER' | 'SOURCE' | 'COMPILATION' | 'CONTAINS';
  node: Media;
}

export interface MediaRelationConnection {
  edges: MediaEdge[];
  nodes: Media[];
  pageInfo?: PageInfo;
}

// Character Types
export interface CharacterName {
  first: string | null;
  middle: string | null;
  last: string | null;
  full: string | null;
  native: string | null;
}

export interface CharacterImage {
  large: string | null;
  medium: string | null;
}

export interface Character {
  id: number;
  name: CharacterName;
  image: CharacterImage;
  description: string | null;
}

export interface CharacterEdge {
  id: number;
  role: 'MAIN' | 'SUPPORTING' | 'BACKGROUND';
  name: string | null;
  voiceActors: Staff[];
  node: Character;
}

// Staff Types
export interface StaffName {
  first: string | null;
  middle: string | null;
  last: string | null;
  full: string | null;
  native: string | null;
}

export interface StaffImage {
  large: string | null;
  medium: string | null;
}

export interface Staff {
  id: number;
  name: StaffName;
  image: StaffImage;
  languageV2: string | null;
  description: string | null;
}

export interface StaffEdge {
  id: number;
  role: string | null;
  node: Staff;
}

// Studio Types
export interface Studio {
  id: number;
  name: string;
  isMain: boolean;
}

// Enhanced Media interface
export interface Media {
  id: number;
  title: MediaTitle;
  description: string | null;
  coverImage: CoverImage;
  bannerImage: string | null;
  genres: string[];
  tags: MediaTag[];
  averageScore: number | null;
  meanScore: number | null;
  episodes: number | null;
  chapters: number | null;
  volumes: number | null;
  status: string | null;
  type: MediaType;
  format: string | null;
  source: string | null;
  season: string | null;
  seasonYear: number | null;
  popularity: number | null;
  trending: number | null;
  favourites: number | null;
  startDate: {
    year: number | null;
    month: number | null;
    day: number | null;
  } | null;
  endDate: {
    year: number | null;
    month: number | null;
    day: number | null;
  } | null;
  studios: {
    nodes: Studio[];
  };
  relations?: MediaRelationConnection;
  characters?: {
    edges: CharacterEdge[];
    nodes: Character[];
  };
  staff?: {
    edges: StaffEdge[];
    nodes: Staff[];
  };
}

// Media Tag Types
export interface MediaTag {
  id: number;
  name: string;
  description: string | null;
  category: string | null;
  rank: number | null;
  isGeneralSpoiler: boolean;
  isMediaSpoiler: boolean;
  isAdult: boolean;
}

export const MediaType = {
  ANIME: 'ANIME',
  MANGA: 'MANGA'
} as const;

export type MediaType = typeof MediaType[keyof typeof MediaType];

export const MediaFormat = {
  TV: 'TV',
  TV_SHORT: 'TV_SHORT',
  MOVIE: 'MOVIE',
  SPECIAL: 'SPECIAL',
  OVA: 'OVA',
  ONA: 'ONA',
  MUSIC: 'MUSIC',
  MANGA: 'MANGA',
  NOVEL: 'NOVEL',
  ONE_SHOT: 'ONE_SHOT'
} as const;

export type MediaFormat = typeof MediaFormat[keyof typeof MediaFormat];

export const MediaStatus = {
  FINISHED: 'FINISHED',
  RELEASING: 'RELEASING',
  NOT_YET_RELEASED: 'NOT_YET_RELEASED',
  CANCELLED: 'CANCELLED',
  HIATUS: 'HIATUS'
} as const;

export type MediaStatus = typeof MediaStatus[keyof typeof MediaStatus];

export const MediaSeason = {
  WINTER: 'WINTER',
  SPRING: 'SPRING',
  SUMMER: 'SUMMER',
  FALL: 'FALL'
} as const;

export type MediaSeason = typeof MediaSeason[keyof typeof MediaSeason];

export interface PageInfo {
  total: number;
  currentPage: number;
  lastPage: number;
  hasNextPage: boolean;
  perPage: number;
}

export interface MediaConnection {
  media: Media[];
  pageInfo: PageInfo;
}

export interface AniListResponse {
  data: {
    Page: MediaConnection;
  };
}

export interface QueryVariables {
  page?: number;
  perPage?: number;
  type?: MediaType;
  search?: string;
  genre_in?: string[];
  tag_in?: string[];
  sort?: string[];
  id?: number;
  format_in?: MediaFormat[];
  status_in?: MediaStatus[];
  season?: MediaSeason;
  seasonYear?: number;
  year?: string;
  source?: string;
  countryOfOrigin?: string;
}

export interface MediaResponse {
  data: {
    Media: Media;
  };
} 