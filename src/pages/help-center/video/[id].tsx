import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Play,
  Clock,
  Eye,
  Star,
  Share2,
  Bookmark,
  CheckCircle,
  ThumbsUp,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { VideoPlayer } from '../../../components/help-center';
import {
  useVideo,
  useVideosByTheme,
  useVideoViewCount,
  useUserVideoView,
  useCreateUserView,
  useTrackViewProgress,
} from '../../../lib/hooks/use-help-center';
import { useAuthStore } from '../../../lib/stores/auth-store';

export default function VideoPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  // Buscar dados
  const {
    data: videoData,
    isLoading: isLoadingVideo,
    error: videoError,
  } = useVideo(id!);
  const { data: relatedVideosData } = useVideosByTheme(
    videoData?.data?.video?.theme_id || ''
  );
  const { data: viewCountData } = useVideoViewCount(id!);
  const { data: userViewData } = useUserVideoView(user?.id || '', id!);

  // Mutations
  const createUserViewMutation = useCreateUserView();
  const trackProgressMutation = useTrackViewProgress();

  const video = videoData?.data?.video;
  const relatedVideos =
    relatedVideosData?.data?.videos?.filter(v => v.id !== id) || [];
  const viewCount = viewCountData?.data?.count || 0;
  const userView = userViewData?.data?.user_view;

  // Debug: verificar estado do carregamento
  console.log('🎬 Debug Video Page:', {
    id,
    videoData,
    isLoadingVideo,
    videoError,
    video,
    hasVideo: !!video,
  });

  const handleBack = () => {
    if (video?.theme_id) {
      navigate(`/help-center/theme/${video.theme_id}`);
    } else {
      navigate('/help-center');
    }
  };

  const handleVideoClick = (videoId: string) => {
    navigate(`/help-center/video/${videoId}`);
  };

  // Removido: função para abrir vídeo externamente
  // Agora todos os vídeos são reproduzidos na plataforma

  const handleShare = async () => {
    if (navigator.share && video) {
      try {
        await navigator.share({
          title: video.title,
          text: video.description || '',
          url: window.location.href,
        });
      } catch (error) {
        console.log('Erro ao compartilhar:', error);
      }
    } else {
      // Fallback: copiar URL para clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    // TODO: Implementar bookmark no backend
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    // TODO: Implementar like no backend
  };

  const handleProgress = (progress: number) => {
    if (user?.id && video) {
      trackProgressMutation.mutate({
        userId: user.id,
        videoId: video.id,
        watchDuration: Math.floor(progress),
        completed: false,
      });
    }
  };

  const handleComplete = () => {
    if (user?.id && video) {
      // Criar visualização se não existir
      if (!userView) {
        createUserViewMutation.mutate({
          user_id: user.id,
          video_id: video.id,
          watch_duration: video.duration || 0,
          completed: true,
        });
      } else {
        // Atualizar visualização existente
        trackProgressMutation.mutate({
          userId: user.id,
          videoId: video.id,
          watchDuration: video.duration || 0,
          completed: true,
        });
      }
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (isLoadingVideo) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500'></div>
      </div>
    );
  }

  if (videoError || !video) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold text-gray-900 mb-4'>
            Vídeo não encontrado
          </h1>
          <p className='text-gray-600 mb-8'>
            O vídeo que você está procurando não existe ou foi removido.
          </p>
          <Button onClick={() => navigate('/help-center')}>
            <ArrowLeft size={16} className='mr-2' />
            Voltar ao Centro de Ajuda
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <div className='bg-white border-b border-gray-200'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4'>
          <div className='flex items-center justify-between'>
            <Button
              variant='text'
              onClick={handleBack}
              className='flex items-center space-x-2'
            >
              <ArrowLeft size={20} />
              <span>Voltar</span>
            </Button>

            <div className='flex items-center space-x-2'>
              <Button variant='outline' size='sm' onClick={handleShare}>
                <Share2 size={16} className='mr-2' />
                Compartilhar
              </Button>
              <Button variant='outline' size='sm' onClick={handleBookmark}>
                <Bookmark
                  size={16}
                  className={`mr-2 ${isBookmarked ? 'fill-current' : ''}`}
                />
                {isBookmarked ? 'Salvo' : 'Salvar'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Player e informações */}
          <div className='lg:col-span-2 space-y-6'>
            {/* Player */}
            <div className='bg-white rounded-lg shadow-sm overflow-hidden'>
              <VideoPlayer
                video={video}
                onProgress={handleProgress}
                onComplete={handleComplete}
                className='w-full'
              />
            </div>

            {/* Informações do vídeo */}
            <div className='bg-white rounded-lg shadow-sm p-6'>
              <div className='flex items-start justify-between mb-4'>
                <div className='flex-1'>
                  <h1 className='text-2xl font-bold text-gray-900 mb-2'>
                    {video.title}
                  </h1>
                  {video.description && (
                    <p className='text-gray-600 mb-4'>{video.description}</p>
                  )}
                </div>

                <div className='flex items-center space-x-2'>
                  <Button variant='outline' size='sm' onClick={handleLike}>
                    <ThumbsUp
                      size={16}
                      className={`mr-2 ${isLiked ? 'fill-current' : ''}`}
                    />
                    {isLiked ? 'Curtido' : 'Curtir'}
                  </Button>
                </div>
              </div>

              {/* Estatísticas */}
              <div className='flex items-center space-x-6 text-sm text-gray-600 mb-4'>
                <div className='flex items-center space-x-1'>
                  <Eye size={16} />
                  <span>{viewCount.toLocaleString()} visualizações</span>
                </div>
                {video.duration && (
                  <div className='flex items-center space-x-1'>
                    <Clock size={16} />
                    <span>{formatDuration(video.duration)}</span>
                  </div>
                )}
                {video.is_featured && (
                  <div className='flex items-center space-x-1'>
                    <Star size={16} className='text-yellow-500' />
                    <span className='text-yellow-600'>Destaque</span>
                  </div>
                )}
                {userView?.completed && (
                  <div className='flex items-center space-x-1'>
                    <CheckCircle size={16} className='text-green-500' />
                    <span className='text-green-600'>Concluído</span>
                  </div>
                )}
              </div>

              {/* Aplicações associadas */}
              {video.applications && video.applications.length > 0 && (
                <div className='mb-4'>
                  <h3 className='text-sm font-medium text-gray-900 mb-2'>
                    Aplicações:
                  </h3>
                  <div className='flex flex-wrap gap-2'>
                    {video.applications.map(app => (
                      <Badge key={app.id} variant='secondary'>
                        {app.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Botão removido: vídeos são reproduzidos na plataforma */}
            </div>
          </div>

          {/* Sidebar */}
          <div className='space-y-6'>
            {/* Vídeos relacionados */}
            {relatedVideos.length > 0 && (
              <div className='bg-white rounded-lg shadow-sm p-6'>
                <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                  Vídeos Relacionados
                </h3>
                <div className='space-y-4'>
                  {relatedVideos.slice(0, 5).map(relatedVideo => (
                    <div
                      key={relatedVideo.id}
                      className='flex space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors'
                      onClick={() => handleVideoClick(relatedVideo.id)}
                    >
                      <div className='w-20 h-12 bg-gray-200 rounded flex-shrink-0 overflow-hidden'>
                        {relatedVideo.thumbnail_url ? (
                          <img
                            src={relatedVideo.thumbnail_url}
                            alt={relatedVideo.title}
                            className='w-full h-full object-cover'
                          />
                        ) : (
                          <div className='w-full h-full flex items-center justify-center'>
                            <Play size={16} className='text-gray-400' />
                          </div>
                        )}
                      </div>
                      <div className='flex-1 min-w-0'>
                        <h4 className='text-sm font-medium text-gray-900 line-clamp-2'>
                          {relatedVideo.title}
                        </h4>
                        {relatedVideo.duration && (
                          <p className='text-xs text-gray-500 mt-1'>
                            {formatDuration(relatedVideo.duration)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Informações adicionais */}
            <div className='bg-white rounded-lg shadow-sm p-6'>
              <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                Informações
              </h3>
              <div className='space-y-3 text-sm'>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Plataforma:</span>
                  <span className='font-medium'>{video.video_platform}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Criado em:</span>
                  <span className='font-medium'>
                    {new Date(video.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                {video.theme && (
                  <div className='flex justify-between'>
                    <span className='text-gray-600'>Tema:</span>
                    <span className='font-medium'>{video.theme.title}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
