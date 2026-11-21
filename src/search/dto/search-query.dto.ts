export class SearchQueryDto {
  q?: string;
  category?: string;
  genre?: string;
  limit?: string;
  userId?: string;
  kidsMode?: string;
}

export interface SearchResultItem {
  id: number | string;
  title: string;
  type: 'movie' | 'series' | 'episode' | 'interactive' | 'short' | 'video';
  slug?: string;
  image: string;
  card_image?: string;
  description?: string;
  year?: number | string | null;
  rating?: number | null;
  duration?: string | null;
  languages?: string | null;
  director?: string | null;
  actors?: string | null;
  genres?: string[];
  genreIds?: string | null;
  isFree?: boolean;
  isComingSoon?: boolean;
  quality?: string | null;
  certificate?: {
    id?: number;
    code: string;
    name?: string;
    certification_system?: string;
    badge_color?: string;
  } | null;
  href: string;
  viewCount?: number;
}

export interface SearchResponseData {
  results: SearchResultItem[];
  total: number;
  meta: {
    total: number;
    query: string;
    category: string;
    counts: {
      all: number;
      movie: number;
      series: number;
      interactive: number;
      short: number;
      video: number;
    };
  };
}
