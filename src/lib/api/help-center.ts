import { apiRequest } from './config';
import type {
  // Temas
  CreateThemeRequest,
  UpdateThemeRequest,
  ThemeResponse,
  ThemesResponse,
  ThemeSearchParams,

  // Vídeos
  CreateVideoRequest,
  UpdateVideoRequest,
  VideoResponse,
  VideosResponse,
  VideoSearchParams,

  // Visualizações
  CreateUserViewRequest,
  UpdateUserViewRequest,
  UserViewResponse,
  UserViewsResponse,
  ViewCountResponse,

  // Buscas
  CreateSearchRequest,
  SearchResponse,
  SearchesResponse,
  PopularSearchesResponse,
  TrackSearchRequest,

  // Aplicações
  Application,
} from '../../types/help-center';

export const helpCenterApi = {
  // ===== TEMAS =====

  // Listar todos os temas
  async listThemes(params: ThemeSearchParams = {}): Promise<ThemesResponse> {
    const searchParams = new URLSearchParams();

    if (params.application_id)
      searchParams.append('application_id', params.application_id);
    if (params.active !== undefined)
      searchParams.append('active', params.active.toString());

    const queryString = searchParams.toString();
    const endpoint = `/help-center/themes${queryString ? `?${queryString}` : ''}`;

    return apiRequest(endpoint);
  },

  // Buscar tema por ID
  async getTheme(themeId: string): Promise<ThemeResponse> {
    return apiRequest(`/help-center/themes/${themeId}`);
  },

  // Criar novo tema
  async createTheme(data: CreateThemeRequest): Promise<ThemeResponse> {
    return apiRequest('/help-center/themes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Atualizar tema
  async updateTheme(
    themeId: string,
    data: UpdateThemeRequest
  ): Promise<ThemeResponse> {
    return apiRequest(`/help-center/themes/${themeId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Excluir tema
  async deleteTheme(
    themeId: string
  ): Promise<{ success: boolean; message: string }> {
    return apiRequest(`/help-center/themes/${themeId}`, {
      method: 'DELETE',
    });
  },

  // Listar temas ativos
  async getActiveThemes(): Promise<ThemesResponse> {
    try {
      const rawData = (await apiRequest(
        '/help-center/themes/active/all'
      )) as any;

      // Se a API retornar dados, mapear corretamente
      if ((rawData as any).data && (rawData as any).data.length > 0) {
        const mappedThemes = (rawData as any).data.map((theme: any) => ({
          id: theme.theme_id || theme.id,
          title: theme.name || theme.title,
          description: theme.description,
          icon_name: theme.icon_name || 'settings',
          color: theme.color || '#3b82f6',
          sort_order: theme.sort_order || 1,
          is_active: theme.is_active !== false,
          created_at: theme.created_at || new Date().toISOString(),
          updated_at: theme.updated_at || new Date().toISOString(),
          applications: theme.applications || [],
        }));

        return {
          success: true,
          data: {
            themes: mappedThemes,
          },
          message: 'Temas carregados com sucesso',
        };
      }

      // Se não houver dados da API, retornar erro
      throw new Error('Falha ao carregar temas do help center');
    } catch (error) {
      console.error('Erro ao buscar temas:', error);
      throw error;
    }
  },

  // Listar temas por aplicação
  async getThemesByApplication(applicationId: string): Promise<ThemesResponse> {
    return apiRequest(`/help-center/themes/application/${applicationId}`);
  },

  // Adicionar aplicação ao tema
  async addApplicationToTheme(
    themeId: string,
    applicationId: string
  ): Promise<{ success: boolean; message: string }> {
    return apiRequest(`/help-center/themes/${themeId}/applications`, {
      method: 'POST',
      body: JSON.stringify({ application_id: applicationId }),
    });
  },

  // Remover aplicação do tema
  async removeApplicationFromTheme(
    themeId: string,
    applicationId: string
  ): Promise<{ success: boolean; message: string }> {
    return apiRequest(
      `/help-center/themes/${themeId}/applications/${applicationId}`,
      {
        method: 'DELETE',
      }
    );
  },

  // Listar aplicações do tema
  async getThemeApplications(themeId: string): Promise<{
    success: boolean;
    data: { applications: Application[] };
    message: string;
  }> {
    return apiRequest(`/help-center/themes/${themeId}/applications`);
  },

  // ===== VÍDEOS =====

  // Listar todos os vídeos
  async listVideos(params: VideoSearchParams = {}): Promise<VideosResponse> {
    const searchParams = new URLSearchParams();

    if (params.q) searchParams.append('q', params.q);
    if (params.theme_id) searchParams.append('theme_id', params.theme_id);
    if (params.application_id)
      searchParams.append('application_id', params.application_id);
    if (params.platform) searchParams.append('platform', params.platform);
    if (params.featured !== undefined)
      searchParams.append('featured', params.featured.toString());
    if (params.active !== undefined)
      searchParams.append('active', params.active.toString());

    const queryString = searchParams.toString();
    const endpoint = `/help-center/videos${queryString ? `?${queryString}` : ''}`;

    return apiRequest(endpoint);
  },

  // Buscar vídeo por ID
  async getVideo(videoId: string): Promise<VideoResponse> {
    try {
      const rawData = (await apiRequest(
        `/help-center/videos/${videoId}`
      )) as any;

      // Se a API retornar dados, mapear corretamente
      if ((rawData as any).data) {
        const video = (rawData as any).data;
        const mappedVideo = {
          id: video.video_id || video.id,
          title: video.title,
          description: video.description,
          video_platform: (video.video_platform === 'YOUTUBE'
            ? 'YOUTUBE'
            : 'CUSTOM') as 'YOUTUBE' | 'VIMEO' | 'DAILYMOTION' | 'CUSTOM',
          external_video_id: video.external_video_id,
          external_url: `https://www.youtube.com/watch?v=${video.external_url}`,
          thumbnail_url: `https://img.youtube.com/vi/${video.external_url}/maxresdefault.jpg`,
          duration: video.duration || 300, // 5 minutos padrão
          sort_order: video.sort_order || 1,
          is_active: video.is_active !== false,
          is_featured: video.is_featured || false,
          created_at: video.created_at || new Date().toISOString(),
          updated_at: video.updated_at || new Date().toISOString(),
          theme_id: video.theme_id,
          applications: video.applications || [],
        };

        return {
          success: true,
          message: 'Vídeo carregado com sucesso',
          data: {
            video: mappedVideo,
          },
        };
      }

      // Se não houver dados, retornar erro
      return {
        success: false,
        data: null,
        message: 'Vídeo não encontrado',
      };
    } catch (error) {
      console.error('Erro ao buscar vídeo:', error);
      throw error;
    }
  },

  // Criar novo vídeo
  async createVideo(data: CreateVideoRequest): Promise<VideoResponse> {
    return apiRequest('/help-center/videos', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Atualizar vídeo
  async updateVideo(
    videoId: string,
    data: UpdateVideoRequest
  ): Promise<VideoResponse> {
    return apiRequest(`/help-center/videos/${videoId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Excluir vídeo
  async deleteVideo(
    videoId: string
  ): Promise<{ success: boolean; message: string }> {
    return apiRequest(`/help-center/videos/${videoId}`, {
      method: 'DELETE',
    });
  },

  // Listar vídeos por tema
  async getVideosByTheme(themeId: string): Promise<VideosResponse> {
    try {
      const rawData = await apiRequest(`/help-center/videos/theme/${themeId}`);

      // Se a API retornar dados, mapear corretamente
      if ((rawData as any).data && (rawData as any).data.length > 0) {
        const mappedVideos = (rawData as any).data.map((video: any) => ({
          id: video.video_id || video.id,
          title: video.title,
          description: video.description,
          video_platform: (video.video_platform === 'YOUTUBE'
            ? 'YOUTUBE'
            : 'CUSTOM') as 'YOUTUBE' | 'VIMEO' | 'DAILYMOTION' | 'CUSTOM',
          external_video_id: video.external_video_id,
          external_url: `https://www.youtube.com/watch?v=${video.external_url}`,
          thumbnail_url: `https://img.youtube.com/vi/${video.external_url}/maxresdefault.jpg`,
          duration: video.duration || 300,
          sort_order: video.sort_order || 1,
          is_active: video.is_active !== false,
          is_featured: video.is_featured || false,
          created_at: video.created_at || new Date().toISOString(),
          updated_at: video.updated_at || new Date().toISOString(),
          theme_id: video.theme_id,
          applications: video.applications || [],
        }));

        return {
          success: true,
          message: 'Vídeos carregados com sucesso',
          data: {
            videos: mappedVideos,
          },
        };
      }

      // Se não houver dados, retornar array vazio
      return {
        success: true,
        message: 'Nenhum vídeo encontrado',
        data: {
          videos: [],
        },
      };
    } catch (error) {
      console.error('Erro ao buscar vídeos por tema:', error);

      // Em caso de erro, retornar array vazio
      return {
        success: true,
        message: 'Erro ao carregar vídeos',
        data: {
          videos: [],
        },
      };
    }
  },

  // Listar vídeos por aplicação
  async getVideosByApplication(applicationId: string): Promise<VideosResponse> {
    return apiRequest(`/help-center/videos/application/${applicationId}`);
  },

  // Listar vídeos por tema e aplicação
  async getVideosByThemeAndApplication(
    themeId: string,
    applicationId: string
  ): Promise<VideosResponse> {
    return apiRequest(
      `/help-center/videos/theme/${themeId}/application/${applicationId}`
    );
  },

  // Listar vídeos ativos
  async getActiveVideos(): Promise<VideosResponse> {
    const rawData = await apiRequest('/help-center/videos/active/all');

    // Mapear os dados para a estrutura correta
    const mappedVideos =
      (rawData as any).data?.map((video: any) => ({
        id: video.video_id,
        title: video.title,
        description: video.description,
        video_platform:
          video.video_platform === 'YOUTUBE' ? 'YOUTUBE' : 'CUSTOM',
        external_video_id: video.external_video_id,
        external_url: `https://www.youtube.com/watch?v=${video.external_url}`,
        thumbnail_url: `https://img.youtube.com/vi/${video.external_url}/maxresdefault.jpg`,
        duration: video.duration || 300, // 5 minutos padrão
        sort_order: video.sort_order || 1,
        is_active: video.is_active || true,
        is_featured: video.is_featured || false,
        created_at: video.created_at || new Date().toISOString(),
        updated_at: video.updated_at || new Date().toISOString(),
        theme_id: video.theme_id,
        applications: video.applications || [],
      })) || [];

    return {
      success: true,
      message: 'Vídeos carregados com sucesso',
      data: {
        videos: mappedVideos,
      },
    };
  },

  // Listar vídeos em destaque
  async getFeaturedVideos(): Promise<VideosResponse> {
    const rawData = await apiRequest('/help-center/videos/featured/all');

    // Mapear os dados para a estrutura correta
    const mappedVideos =
      (rawData as any).data?.map((video: any) => ({
        id: video.video_id,
        title: video.title,
        description: video.description,
        video_platform:
          video.video_platform === 'YOUTUBE' ? 'YOUTUBE' : 'CUSTOM',
        external_video_id: video.external_video_id,
        external_url: `https://www.youtube.com/watch?v=${video.external_url}`,
        thumbnail_url: `https://img.youtube.com/vi/${video.external_url}/maxresdefault.jpg`,
        duration: video.duration || 300, // 5 minutos padrão
        sort_order: video.sort_order || 1,
        is_active: video.is_active || true,
        is_featured: video.is_featured || false,
        created_at: video.created_at || new Date().toISOString(),
        updated_at: video.updated_at || new Date().toISOString(),
        theme_id: video.theme_id,
        applications: video.applications || [],
      })) || [];

    return {
      success: true,
      message: 'Vídeos carregados com sucesso',
      data: {
        videos: mappedVideos,
      },
    };
  },

  // Buscar vídeos por termo
  async searchVideos(query: string): Promise<VideosResponse> {
    return apiRequest(
      `/help-center/videos/search?q=${encodeURIComponent(query)}`
    );
  },

  // Listar vídeos por plataforma
  async getVideosByPlatform(
    platform: 'YOUTUBE' | 'VIMEO' | 'DAILYMOTION' | 'CUSTOM'
  ): Promise<VideosResponse> {
    return apiRequest(`/help-center/videos/platform/${platform}`);
  },

  // Adicionar aplicação ao vídeo
  async addApplicationToVideo(
    videoId: string,
    applicationId: string
  ): Promise<{ success: boolean; message: string }> {
    return apiRequest(`/help-center/videos/${videoId}/applications`, {
      method: 'POST',
      body: JSON.stringify({ application_id: applicationId }),
    });
  },

  // Remover aplicação do vídeo
  async removeApplicationFromVideo(
    videoId: string,
    applicationId: string
  ): Promise<{ success: boolean; message: string }> {
    return apiRequest(
      `/help-center/videos/${videoId}/applications/${applicationId}`,
      {
        method: 'DELETE',
      }
    );
  },

  // Listar aplicações do vídeo
  async getVideoApplications(videoId: string): Promise<{
    success: boolean;
    data: { applications: Application[] };
    message: string;
  }> {
    return apiRequest(`/help-center/videos/${videoId}/applications`);
  },

  // ===== VISUALIZAÇÕES =====

  // Registrar visualização
  async createUserView(data: CreateUserViewRequest): Promise<UserViewResponse> {
    return apiRequest('/help-center/user-views', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Atualizar visualização
  async updateUserView(
    viewId: string,
    data: UpdateUserViewRequest
  ): Promise<UserViewResponse> {
    return apiRequest(`/help-center/user-views/${viewId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Excluir visualização
  async deleteUserView(
    viewId: string
  ): Promise<{ success: boolean; message: string }> {
    return apiRequest(`/help-center/user-views/${viewId}`, {
      method: 'DELETE',
    });
  },

  // Listar visualizações do usuário
  async getUserViews(userId: string): Promise<UserViewsResponse> {
    return apiRequest(`/help-center/user-views/user/${userId}`);
  },

  // Listar visualizações do vídeo
  async getVideoViews(videoId: string): Promise<UserViewsResponse> {
    return apiRequest(`/help-center/user-views/video/${videoId}`);
  },

  // Buscar visualização específica
  async getUserVideoView(
    userId: string,
    videoId: string
  ): Promise<UserViewResponse> {
    return apiRequest(
      `/help-center/user-views/user/${userId}/video/${videoId}`
    );
  },

  // Contar visualizações do vídeo
  async getVideoViewCount(videoId: string): Promise<ViewCountResponse> {
    return apiRequest(`/help-center/user-views/video/${videoId}/count`);
  },

  // Contar visualizações do usuário
  async getUserViewCount(userId: string): Promise<ViewCountResponse> {
    return apiRequest(`/help-center/user-views/user/${userId}/count`);
  },

  // Listar vídeos completados pelo usuário
  async getUserCompletedVideos(userId: string): Promise<VideosResponse> {
    return apiRequest(`/help-center/user-views/user/${userId}/completed`);
  },

  // Rastrear progresso de visualização
  async trackViewProgress(
    userId: string,
    videoId: string,
    watchDuration: number,
    completed?: boolean
  ): Promise<UserViewResponse> {
    return apiRequest(`/help-center/user-views/track/${userId}/${videoId}`, {
      method: 'POST',
      body: JSON.stringify({
        watch_duration: watchDuration,
        completed: completed || false,
      }),
    });
  },

  // ===== BUSCAS =====

  // Registrar busca
  async createSearch(data: CreateSearchRequest): Promise<SearchResponse> {
    return apiRequest('/help-center/searches', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Rastrear busca
  async trackSearch(data: TrackSearchRequest): Promise<SearchResponse> {
    return apiRequest('/help-center/searches/track', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Listar buscas do usuário
  async getUserSearches(
    userId: string,
    limit?: number
  ): Promise<SearchesResponse> {
    const searchParams = new URLSearchParams();
    if (limit) searchParams.append('limit', limit.toString());

    const queryString = searchParams.toString();
    const endpoint = `/help-center/searches/user/${userId}${queryString ? `?${queryString}` : ''}`;

    return apiRequest(endpoint);
  },

  // Listar buscas populares
  async getPopularSearches(limit?: number): Promise<PopularSearchesResponse> {
    const searchParams = new URLSearchParams();
    if (limit) searchParams.append('limit', limit.toString());

    const queryString = searchParams.toString();
    const endpoint = `/help-center/searches/popular${queryString ? `?${queryString}` : ''}`;

    return apiRequest(endpoint);
  },

  // Listar buscas recentes do usuário
  async getUserRecentSearches(
    userId: string,
    limit?: number
  ): Promise<SearchesResponse> {
    const searchParams = new URLSearchParams();
    if (limit) searchParams.append('limit', limit.toString());

    const queryString = searchParams.toString();
    const endpoint = `/help-center/searches/user/${userId}/recent${queryString ? `?${queryString}` : ''}`;

    return apiRequest(endpoint);
  },

  // Excluir busca específica
  async deleteSearch(
    searchId: string
  ): Promise<{ success: boolean; message: string }> {
    return apiRequest(`/help-center/searches/${searchId}`, {
      method: 'DELETE',
    });
  },

  // Excluir todas as buscas do usuário
  async deleteUserSearches(
    userId: string
  ): Promise<{ success: boolean; message: string }> {
    return apiRequest(`/help-center/searches/user/${userId}/all`, {
      method: 'DELETE',
    });
  },
};
