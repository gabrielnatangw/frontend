// Tipos para o Help Center

export interface Theme {
  id: string;
  title: string;
  description?: string;
  icon_name?: string;
  color?: string;
  sort_order?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  applications?: Application[];
  videos?: Video[];
}

export interface Video {
  id: string;
  title: string;
  description?: string;
  video_platform: 'YOUTUBE' | 'VIMEO' | 'DAILYMOTION' | 'CUSTOM';
  external_video_id: string;
  external_url: string;
  thumbnail_url?: string;
  duration?: number;
  sort_order?: number;
  is_featured: boolean;
  is_active: boolean;
  theme_id: string;
  created_at: string;
  updated_at: string;
  theme?: Theme;
  applications?: Application[];
}

export interface Application {
  id: string;
  name: string;
  code: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserView {
  id: string;
  user_id: string;
  video_id: string;
  watch_duration?: number;
  completed: boolean;
  created_at: string;
  updated_at: string;
  video?: Video;
}

export interface Search {
  id: string;
  search_term: string;
  results_count: number;
  user_id?: string;
  created_at: string;
}

export interface PopularSearch {
  search_term: string;
  count: number;
}

// Requests
export interface CreateThemeRequest {
  title: string;
  description?: string;
  icon_name?: string;
  color?: string;
  sort_order?: number;
  application_ids?: string[];
}

export interface UpdateThemeRequest {
  title?: string;
  description?: string;
  icon_name?: string;
  color?: string;
  sort_order?: number;
  application_ids?: string[];
}

export interface CreateVideoRequest {
  title: string;
  description?: string;
  video_platform: 'YOUTUBE' | 'VIMEO' | 'DAILYMOTION' | 'CUSTOM';
  external_video_id: string;
  external_url: string;
  thumbnail_url?: string;
  duration?: number;
  sort_order?: number;
  is_featured?: boolean;
  theme_id: string;
  application_ids?: string[];
}

export interface UpdateVideoRequest {
  title?: string;
  description?: string;
  video_platform?: 'YOUTUBE' | 'VIMEO' | 'DAILYMOTION' | 'CUSTOM';
  external_video_id?: string;
  external_url?: string;
  thumbnail_url?: string;
  duration?: number;
  sort_order?: number;
  is_featured?: boolean;
  theme_id?: string;
  application_ids?: string[];
}

export interface CreateUserViewRequest {
  user_id: string;
  video_id: string;
  watch_duration?: number;
  completed?: boolean;
}

export interface UpdateUserViewRequest {
  watch_duration?: number;
  completed?: boolean;
}

export interface CreateSearchRequest {
  search_term: string;
  results_count: number;
  user_id?: string;
}

export interface TrackSearchRequest {
  search_term: string;
  results_count: number;
  user_id?: string;
}

// Responses
export interface ThemeResponse {
  success: boolean;
  data: {
    theme: Theme;
  };
  message: string;
}

export interface ThemesResponse {
  success: boolean;
  data: {
    themes: Theme[];
  };
  message: string;
}

export interface VideoResponse {
  success: boolean;
  data: {
    video: Video;
  };
  message: string;
}

export interface VideosResponse {
  success: boolean;
  data: {
    videos: Video[];
  };
  message: string;
}

export interface UserViewResponse {
  success: boolean;
  data: {
    user_view: UserView;
  };
  message: string;
}

export interface UserViewsResponse {
  success: boolean;
  data: {
    user_views: UserView[];
  };
  message: string;
}

export interface SearchResponse {
  success: boolean;
  data: {
    search: Search;
  };
  message: string;
}

export interface SearchesResponse {
  success: boolean;
  data: {
    searches: Search[];
  };
  message: string;
}

export interface PopularSearchesResponse {
  success: boolean;
  data: {
    popular_searches: PopularSearch[];
  };
  message: string;
}

export interface ViewCountResponse {
  success: boolean;
  data: {
    count: number;
  };
  message: string;
}

// Parâmetros de busca
export interface VideoSearchParams {
  q?: string;
  theme_id?: string;
  application_id?: string;
  platform?: 'YOUTUBE' | 'VIMEO' | 'DAILYMOTION' | 'CUSTOM';
  featured?: boolean;
  active?: boolean;
}

export interface ThemeSearchParams {
  application_id?: string;
  active?: boolean;
}

// Estatísticas
export interface HelpCenterStats {
  total_themes: number;
  total_videos: number;
  total_views: number;
  popular_searches: PopularSearch[];
  featured_videos: Video[];
  recent_videos: Video[];
}
