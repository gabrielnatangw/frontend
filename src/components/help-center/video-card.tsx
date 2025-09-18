import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Clock, Eye, Star, CheckCircle, PlayCircle } from 'lucide-react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import type { Video, UserView } from '../../types/help-center';

interface VideoCardProps {
  video: Video;
  userView?: UserView;
  showProgress?: boolean;
  showViewCount?: boolean;
  className?: string;
  onClick?: () => void;
}

// Mapeamento de plataformas para ícones e cores
const platformConfig = {
  YOUTUBE: {
    icon: '▶️',
    color: '#ff0000',
    name: 'YouTube',
  },
  VIMEO: {
    icon: '▶️',
    color: '#1ab7ea',
    name: 'Vimeo',
  },
  DAILYMOTION: {
    icon: '▶️',
    color: '#00aaff',
    name: 'Dailymotion',
  },
  CUSTOM: {
    icon: '▶️',
    color: '#6b7280',
    name: 'Custom',
  },
};

export function VideoCard({
  video,
  userView,
  showProgress = true,
  showViewCount = false,
  className = '',
  onClick,
}: VideoCardProps) {
  const navigate = useNavigate();

  // Debug: verificar dados do vídeo
  console.log('🎬 VideoCard recebido:', {
    video,
    videoPlatform: video.video_platform,
    hasPlatform: !!platformConfig[video.video_platform],
  });

  const platform = platformConfig[video.video_platform];
  const isCompleted = userView?.completed || false;
  const watchProgress = userView?.watch_duration || 0;
  const progressPercentage = video.duration
    ? (watchProgress / video.duration) * 100
    : 0;

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/help-center/video/${video.id}`);
    }
  };

  const handleExternalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Sempre navegar para a página interna em vez de abrir externamente
    navigate(`/help-center/video/${video.id}`);
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Card
      className={`group cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] ${className}`}
      onClick={handleClick}
    >
      <div className='relative'>
        {/* Thumbnail */}
        <div className='relative aspect-video bg-gray-100 rounded-t-lg overflow-hidden'>
          {video.thumbnail_url ? (
            <img
              src={video.thumbnail_url}
              alt={video.title}
              className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-200'
            />
          ) : (
            <div className='w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200'>
              <PlayCircle size={48} className='text-gray-400' />
            </div>
          )}

          {/* Overlay com play button */}
          <div className='absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center'>
            <div className='w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform duration-200'>
              <Play size={24} className='text-gray-800 ml-1' />
            </div>
          </div>

          {/* Badges */}
          <div className='absolute top-3 left-3 flex space-x-2'>
            {video.is_featured && (
              <Badge className='bg-yellow-500 text-white'>
                <Star size={12} className='mr-1' />
                Destaque
              </Badge>
            )}

            <Badge
              variant='secondary'
              className='text-xs'
              style={{
                backgroundColor: platform.color + '20',
                color: platform.color,
              }}
            >
              {platform.icon} {platform.name}
            </Badge>
          </div>

          {/* Duração */}
          {video.duration && (
            <div className='absolute bottom-3 right-3 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded'>
              {formatDuration(video.duration)}
            </div>
          )}

          {/* Status de visualização */}
          {isCompleted && (
            <div className='absolute top-3 right-3'>
              <CheckCircle size={20} className='text-green-500' />
            </div>
          )}
        </div>

        {/* Conteúdo */}
        <div className='p-4'>
          {/* Título */}
          <h3 className='font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-2'>
            {video.title}
          </h3>

          {/* Descrição */}
          {video.description && (
            <p className='text-sm text-gray-600 line-clamp-2 mb-3'>
              {video.description}
            </p>
          )}

          {/* Progresso de visualização */}
          {showProgress && userView && (
            <div className='mb-3'>
              <div className='flex items-center justify-between text-xs text-gray-600 mb-1'>
                <span>Progresso</span>
                <span>{Math.round(progressPercentage)}%</span>
              </div>
              <div className='w-full bg-gray-200 rounded-full h-2'>
                <div
                  className='bg-blue-500 h-2 rounded-full transition-all duration-300'
                  style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* Estatísticas e ações */}
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-4 text-sm text-gray-600'>
              {showViewCount && (
                <div className='flex items-center space-x-1'>
                  <Eye size={14} />
                  <span>{(video as any).view_count || 0}</span>
                </div>
              )}

              {video.duration && (
                <div className='flex items-center space-x-1'>
                  <Clock size={14} />
                  <span>{formatDuration(video.duration)}</span>
                </div>
              )}
            </div>

            <Button
              variant='text'
              size='sm'
              onClick={handleExternalClick}
              className='opacity-0 group-hover:opacity-100 transition-opacity duration-200'
            >
              <Play size={14} className='mr-1' />
              Assistir
            </Button>
          </div>

          {/* Aplicações associadas */}
          {video.applications && video.applications.length > 0 && (
            <div className='mt-3 pt-3 border-t border-gray-100'>
              <div className='flex flex-wrap gap-1'>
                {video.applications.slice(0, 3).map(app => (
                  <Badge key={app.id} variant='outline' className='text-xs'>
                    {app.name}
                  </Badge>
                ))}
                {video.applications.length > 3 && (
                  <Badge variant='outline' className='text-xs'>
                    +{video.applications.length - 3}
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
