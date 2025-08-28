import type {
  AniListResponse,
  QueryVariables,
  MediaResponse,
  MediaSeason,
} from "../types/anilist";
import { MediaType } from "../types/anilist";

const ANILIST_API_URL = "/api/graphql";

// Rate Limiting - AniList hat Limits von ~90 requests pro Minute
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 700; // 700ms zwischen Requests (ca. 85 requests/min)

const rateLimit = async () => {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;

  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    const delayNeeded = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
    console.log(`Rate limiting: waiting ${delayNeeded}ms`);
    await new Promise((resolve) => setTimeout(resolve, delayNeeded));
  }

  lastRequestTime = Date.now();
};

// Vereinfachte GraphQL-Query für Media-Suche
const MEDIA_SEARCH_QUERY = `
  query (
    $page: Int,
    $perPage: Int,
    $type: MediaType,
    $search: String,
    $genre_in: [String],
    $format_in: [MediaFormat],
    $status_in: [MediaStatus],
    $season: MediaSeason,
    $seasonYear: Int,
    $sort: [MediaSort]
  ) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        total
        currentPage
        lastPage
        hasNextPage
        perPage
      }
      media(
        type: $type,
        search: $search,
        genre_in: $genre_in,
        format_in: $format_in,
        status_in: $status_in,
        season: $season,
        seasonYear: $seasonYear,
        sort: $sort
      ) {
        id
        title {
          romaji
          english
          native
        }
        description
        coverImage {
          large
          medium
        }
        bannerImage
        averageScore
        status
        episodes
        chapters
        volumes
        startDate {
          year
          month
          day
        }
        endDate {
          year
          month
          day
        }
        genres
        studios {
          nodes {
            id
            name
          }
        }
        format
        season
        seasonYear
        popularity
        type
      }
    }
  }
`;

// Erweiterte Query für einzelnes Medium mit Relations, Characters und Staff
const MEDIA_DETAIL_QUERY = `
  query ($id: Int) {
    Media(id: $id) {
      id
      title {
        romaji
        english
        native
      }
      description
      coverImage {
        large
        medium
      }
      bannerImage
      averageScore
      status
      episodes
      chapters
      volumes
      startDate {
        year
        month
        day
      }
      endDate {
        year
        month
        day
      }
      genres
      studios {
        nodes {
          id
          name
        }
      }
      format
      season
      seasonYear
      popularity
      type
      relations {
        edges {
          relationType
          node {
            id
            title {
              romaji
              english
              native
            }
            coverImage {
              medium
            }
            type
            format
            status
            startDate {
              year
            }
            averageScore
          }
        }
      }
      characters(page: 1, perPage: 8, sort: [ROLE, RELEVANCE]) {
        edges {
          role
          node {
            id
            name {
              first
              last
              full
            }
            image {
              medium
            }
          }
        }
      }
      staff(page: 1, perPage: 6, sort: [RELEVANCE]) {
        edges {
          role
          node {
            id
            name {
              first
              last
              full
            }
            image {
              medium
            }
          }
        }
      }
    }
  }
`;

// Alte einfache Query für Kompatibilität
const MEDIA_BY_ID_QUERY = `
  query ($id: Int) {
    Media(id: $id) {
      id
      title {
        romaji
        english
        native
      }
      description
      coverImage {
        large
        medium
      }
      bannerImage
      averageScore
      meanScore
      status
      episodes
      chapters
      volumes
      startDate {
        year
        month
        day
      }
      endDate {
        year
        month
        day
      }
      genres
      studios {
        nodes {
          name
        }
      }
      format
      season
      seasonYear
      popularity
      trending
      favourites
      type
    }
  }
`;

// Retry-Funktionen für robustere API-Calls
const searchApiCall = async (
  query: string,
  variables: QueryVariables,
  retries: number = 3,
  delay: number = 1000
): Promise<AniListResponse> => {
  for (let i = 0; i < retries; i++) {
    try {
      await rateLimit(); // Rate limiting vor API-Call
      const response = await fetch(ANILIST_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          query,
          variables,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("HTTP error response:", errorText);
        console.error("Query variables:", variables);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.errors) {
        console.error("GraphQL errors in searchApiCall:", data.errors);
        console.error("Query variables:", variables);
        console.error("Failed query:", query);
        throw new Error(data.errors[0]?.message || "GraphQL error");
      }

      return data;
    } catch (error) {
      console.warn(`API call attempt ${i + 1} failed:`, error);

      if (i === retries - 1) {
        throw error;
      }

      // Exponential backoff
      await new Promise((resolve) =>
        setTimeout(resolve, delay * Math.pow(2, i))
      );
    }
  }
  throw new Error("All retry attempts failed");
};

const mediaApiCall = async (
  query: string,
  variables: { id: number },
  retries: number = 3,
  delay: number = 1000
): Promise<MediaResponse> => {
  for (let i = 0; i < retries; i++) {
    try {
      await rateLimit(); // Rate limiting vor API-Call
      const response = await fetch(ANILIST_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          query,
          variables,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("HTTP error response:", errorText);
        console.error("Media query variables:", variables);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.errors) {
        console.error("GraphQL errors in mediaApiCall:", data.errors);
        console.error("Media query variables:", variables);
        console.error("Failed media query:", query);
        throw new Error(data.errors[0]?.message || "GraphQL error");
      }

      return data;
    } catch (error) {
      console.warn(`API call attempt ${i + 1} failed:`, error);

      if (i === retries - 1) {
        throw error;
      }

      // Exponential backoff
      await new Promise((resolve) =>
        setTimeout(resolve, delay * Math.pow(2, i))
      );
    }
  }
  throw new Error("All retry attempts failed");
};

// Exportierte API-Funktionen
export const anilistApi = {
  async searchMedia(variables: QueryVariables): Promise<AniListResponse> {
    // Setze default sort wenn nicht angegeben
    const enhancedVariables = {
      sort: ["POPULARITY_DESC", "SCORE_DESC"],
      ...variables,
    };
    return searchApiCall(MEDIA_SEARCH_QUERY, enhancedVariables);
  },

  async getMediaById(id: number): Promise<MediaResponse> {
    return mediaApiCall(MEDIA_BY_ID_QUERY, { id });
  },

  async getMediaWithDetails(id: number): Promise<MediaResponse> {
    return mediaApiCall(MEDIA_DETAIL_QUERY, { id });
  },

  async getTopMedia(
    type: MediaType,
    page: number = 1,
    perPage: number = 20
  ): Promise<AniListResponse> {
    return searchApiCall(MEDIA_SEARCH_QUERY, {
      page,
      perPage,
      type,
      sort: ["POPULARITY_DESC", "SCORE_DESC"],
    });
  },

  async getMediaByGenre(
    genre: string,
    type: MediaType,
    page: number = 1
  ): Promise<AniListResponse> {
    return searchApiCall(MEDIA_SEARCH_QUERY, {
      page,
      perPage: 20,
      type,
      genre_in: [genre],
      sort: ["POPULARITY_DESC", "SCORE_DESC"],
    });
  },

  async getSeasonalAnime(
    season: string,
    year: number,
    page: number = 1
  ): Promise<AniListResponse> {
    return searchApiCall(MEDIA_SEARCH_QUERY, {
      page,
      perPage: 20,
      type: MediaType.ANIME,
      season: season.toUpperCase() as MediaSeason,
      seasonYear: year,
      sort: ["POPULARITY_DESC", "SCORE_DESC"],
    });
  },

  async getMediaByStudio(
    studioName: string,
    type: MediaType,
    page: number = 1
  ): Promise<AniListResponse> {
    // Studio-Suche über search parameter
    return searchApiCall(MEDIA_SEARCH_QUERY, {
      page,
      perPage: 20,
      type,
      search: studioName,
      sort: ["POPULARITY_DESC", "SCORE_DESC"],
    });
  },
};

export default anilistApi;
