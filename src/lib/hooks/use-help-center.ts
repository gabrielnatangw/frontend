import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { helpCenterApi } from '../api/help-center';
import type {
  ThemeSearchParams,
  VideoSearchParams,
  CreateThemeRequest,
  UpdateThemeRequest,
  CreateVideoRequest,
  UpdateVideoRequest,
  CreateUserViewRequest,
  UpdateUserViewRequest,
  CreateSearchRequest,
  TrackSearchRequest,
} from '../../types/help-center';

// Query keys para Help Center
export const helpCenterKeys = {
  all: ['help-center'] as const,

  // Temas
  themes: () => [...helpCenterKeys.all, 'themes'] as const,
  themesList: (params: ThemeSearchParams) =>
    [...helpCenterKeys.themes(), 'list', params] as const,
  theme: (id: string) => [...helpCenterKeys.themes(), 'detail', id] as const,
  activeThemes: () => [...helpCenterKeys.themes(), 'active'] as const,
  themesByApplication: (appId: string) =>
    [...helpCenterKeys.themes(), 'application', appId] as const,

  // Vídeos
  videos: () => [...helpCenterKeys.all, 'videos'] as const,
  videosList: (params: VideoSearchParams) =>
    [...helpCenterKeys.videos(), 'list', params] as const,
  video: (id: string) => [...helpCenterKeys.videos(), 'detail', id] as const,
  videosByTheme: (themeId: string) =>
    [...helpCenterKeys.videos(), 'theme', themeId] as const,
  videosByApplication: (appId: string) =>
    [...helpCenterKeys.videos(), 'application', appId] as const,
  activeVideos: () => [...helpCenterKeys.videos(), 'active'] as const,
  featuredVideos: () => [...helpCenterKeys.videos(), 'featured'] as const,
  videoSearch: (query: string) =>
    [...helpCenterKeys.videos(), 'search', query] as const,

  // Visualizações
  userViews: () => [...helpCenterKeys.all, 'user-views'] as const,
  userViewsByUser: (userId: string) =>
    [...helpCenterKeys.userViews(), 'user', userId] as const,
  userViewsByVideo: (videoId: string) =>
    [...helpCenterKeys.userViews(), 'video', videoId] as const,
  userVideoView: (userId: string, videoId: string) =>
    [...helpCenterKeys.userViews(), 'user-video', userId, videoId] as const,
  videoViewCount: (videoId: string) =>
    [...helpCenterKeys.userViews(), 'count', 'video', videoId] as const,
  userViewCount: (userId: string) =>
    [...helpCenterKeys.userViews(), 'count', 'user', userId] as const,
  userCompletedVideos: (userId: string) =>
    [...helpCenterKeys.userViews(), 'completed', userId] as const,

  // Buscas
  searches: () => [...helpCenterKeys.all, 'searches'] as const,
  userSearches: (userId: string, limit?: number) =>
    [...helpCenterKeys.searches(), 'user', userId, limit] as const,
  popularSearches: (limit?: number) =>
    [...helpCenterKeys.searches(), 'popular', limit] as const,
  userRecentSearches: (userId: string, limit?: number) =>
    [...helpCenterKeys.searches(), 'recent', userId, limit] as const,
};

// ===== HOOKS PARA TEMAS =====

export function useThemes(params: ThemeSearchParams = {}) {
  return useQuery({
    queryKey: helpCenterKeys.themesList(params),
    queryFn: () => helpCenterApi.listThemes(params),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });
}

export function useTheme(themeId: string) {
  return useQuery({
    queryKey: helpCenterKeys.theme(themeId),
    queryFn: () => helpCenterApi.getTheme(themeId),
    enabled: !!themeId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useActiveThemes() {
  return useQuery({
    queryKey: helpCenterKeys.activeThemes(),
    queryFn: () => helpCenterApi.getActiveThemes(),
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 15 * 60 * 1000, // 15 minutos
  });
}

export function useThemesByApplication(applicationId: string) {
  return useQuery({
    queryKey: helpCenterKeys.themesByApplication(applicationId),
    queryFn: () => helpCenterApi.getThemesByApplication(applicationId),
    enabled: !!applicationId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useCreateTheme() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateThemeRequest) => helpCenterApi.createTheme(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: helpCenterKeys.themes() });
    },
  });
}

export function useUpdateTheme() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      themeId,
      data,
    }: {
      themeId: string;
      data: UpdateThemeRequest;
    }) => helpCenterApi.updateTheme(themeId, data),
    onSuccess: (_, { themeId }) => {
      queryClient.invalidateQueries({
        queryKey: helpCenterKeys.theme(themeId),
      });
      queryClient.invalidateQueries({ queryKey: helpCenterKeys.themes() });
    },
  });
}

export function useDeleteTheme() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (themeId: string) => helpCenterApi.deleteTheme(themeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: helpCenterKeys.themes() });
    },
  });
}

// ===== HOOKS PARA VÍDEOS =====

export function useVideos(params: VideoSearchParams = {}) {
  return useQuery({
    queryKey: helpCenterKeys.videosList(params),
    queryFn: () => helpCenterApi.listVideos(params),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useVideo(videoId: string) {
  return useQuery({
    queryKey: helpCenterKeys.video(videoId),
    queryFn: () => helpCenterApi.getVideo(videoId),
    enabled: !!videoId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useVideosByTheme(themeId: string) {
  return useQuery({
    queryKey: helpCenterKeys.videosByTheme(themeId),
    queryFn: () => helpCenterApi.getVideosByTheme(themeId),
    enabled: !!themeId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useVideosByApplication(applicationId: string) {
  return useQuery({
    queryKey: helpCenterKeys.videosByApplication(applicationId),
    queryFn: () => helpCenterApi.getVideosByApplication(applicationId),
    enabled: !!applicationId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useActiveVideos() {
  return useQuery({
    queryKey: helpCenterKeys.activeVideos(),
    queryFn: () => helpCenterApi.getActiveVideos(),
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
}

export function useFeaturedVideos() {
  return useQuery({
    queryKey: helpCenterKeys.featuredVideos(),
    queryFn: () => helpCenterApi.getFeaturedVideos(),
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
}

export function useVideoSearch(query: string) {
  return useQuery({
    queryKey: helpCenterKeys.videoSearch(query),
    queryFn: () => helpCenterApi.searchVideos(query),
    enabled: !!query && query.length > 2,
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000,
  });
}

export function useCreateVideo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateVideoRequest) => helpCenterApi.createVideo(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: helpCenterKeys.videos() });
    },
  });
}

export function useUpdateVideo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      videoId,
      data,
    }: {
      videoId: string;
      data: UpdateVideoRequest;
    }) => helpCenterApi.updateVideo(videoId, data),
    onSuccess: (_, { videoId }) => {
      queryClient.invalidateQueries({
        queryKey: helpCenterKeys.video(videoId),
      });
      queryClient.invalidateQueries({ queryKey: helpCenterKeys.videos() });
    },
  });
}

export function useDeleteVideo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (videoId: string) => helpCenterApi.deleteVideo(videoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: helpCenterKeys.videos() });
    },
  });
}

// ===== HOOKS PARA VISUALIZAÇÕES =====

export function useUserViews(userId: string) {
  return useQuery({
    queryKey: helpCenterKeys.userViewsByUser(userId),
    queryFn: () => helpCenterApi.getUserViews(userId),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useVideoViews(videoId: string) {
  return useQuery({
    queryKey: helpCenterKeys.userViewsByVideo(videoId),
    queryFn: () => helpCenterApi.getVideoViews(videoId),
    enabled: !!videoId,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useUserVideoView(userId: string, videoId: string) {
  return useQuery({
    queryKey: helpCenterKeys.userVideoView(userId, videoId),
    queryFn: () => helpCenterApi.getUserVideoView(userId, videoId),
    enabled: !!userId && !!videoId,
    staleTime: 1 * 60 * 1000, // 1 minuto
    gcTime: 3 * 60 * 1000,
  });
}

export function useVideoViewCount(videoId: string) {
  return useQuery({
    queryKey: helpCenterKeys.videoViewCount(videoId),
    queryFn: () => helpCenterApi.getVideoViewCount(videoId),
    enabled: !!videoId,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useUserViewCount(userId: string) {
  return useQuery({
    queryKey: helpCenterKeys.userViewCount(userId),
    queryFn: () => helpCenterApi.getUserViewCount(userId),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useUserCompletedVideos(userId: string) {
  return useQuery({
    queryKey: helpCenterKeys.userCompletedVideos(userId),
    queryFn: () => helpCenterApi.getUserCompletedVideos(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useCreateUserView() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserViewRequest) =>
      helpCenterApi.createUserView(data),
    onSuccess: (_, { user_id, video_id }) => {
      queryClient.invalidateQueries({
        queryKey: helpCenterKeys.userViewsByUser(user_id),
      });
      queryClient.invalidateQueries({
        queryKey: helpCenterKeys.userViewsByVideo(video_id),
      });
      queryClient.invalidateQueries({
        queryKey: helpCenterKeys.userVideoView(user_id, video_id),
      });
    },
  });
}

export function useUpdateUserView() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      viewId,
      data,
    }: {
      viewId: string;
      data: UpdateUserViewRequest;
    }) => helpCenterApi.updateUserView(viewId, data),
    onSuccess: (_, { viewId: _viewId }) => {
      queryClient.invalidateQueries({ queryKey: helpCenterKeys.userViews() });
    },
  });
}

export function useTrackViewProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      videoId,
      watchDuration,
      completed,
    }: {
      userId: string;
      videoId: string;
      watchDuration: number;
      completed?: boolean;
    }) =>
      helpCenterApi.trackViewProgress(
        userId,
        videoId,
        watchDuration,
        completed
      ),
    onSuccess: (_, { userId, videoId }) => {
      queryClient.invalidateQueries({
        queryKey: helpCenterKeys.userViewsByUser(userId),
      });
      queryClient.invalidateQueries({
        queryKey: helpCenterKeys.userViewsByVideo(videoId),
      });
      queryClient.invalidateQueries({
        queryKey: helpCenterKeys.userVideoView(userId, videoId),
      });
    },
  });
}

// ===== HOOKS PARA BUSCAS =====

export function useUserSearches(userId: string, limit?: number) {
  return useQuery({
    queryKey: helpCenterKeys.userSearches(userId, limit),
    queryFn: () => helpCenterApi.getUserSearches(userId, limit),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

export function usePopularSearches(limit?: number) {
  return useQuery({
    queryKey: helpCenterKeys.popularSearches(limit),
    queryFn: () => helpCenterApi.getPopularSearches(limit),
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

export function useUserRecentSearches(userId: string, limit?: number) {
  return useQuery({
    queryKey: helpCenterKeys.userRecentSearches(userId, limit),
    queryFn: () => helpCenterApi.getUserRecentSearches(userId, limit),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useCreateSearch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSearchRequest) => helpCenterApi.createSearch(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: helpCenterKeys.searches() });
    },
  });
}

export function useTrackSearch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TrackSearchRequest) => helpCenterApi.trackSearch(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: helpCenterKeys.searches() });
    },
  });
}

export function useDeleteSearch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (searchId: string) => helpCenterApi.deleteSearch(searchId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: helpCenterKeys.searches() });
    },
  });
}

export function useDeleteUserSearches() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => helpCenterApi.deleteUserSearches(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: helpCenterKeys.searches() });
    },
  });
}
