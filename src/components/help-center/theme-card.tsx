import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Play,
  Video,
  Clock,
  Eye,
  ChevronRight,
  Settings,
  BarChart3,
  Monitor,
  Zap,
  Activity,
} from 'lucide-react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import type { Theme } from '../../types/help-center';

interface ThemeCardProps {
  theme: Theme;
  showVideoCount?: boolean;
  showViewCount?: boolean;
  className?: string;
  onClick?: () => void;
}

// Mapeamento de ícones do Lucide
const iconMap = {
  settings: Settings,
  monitor: Monitor,
  'bar-chart-3': BarChart3,
  zap: Zap,
  activity: Activity,
  play: Play,
  video: Video,
  clock: Clock,
  eye: Eye,
};

export function ThemeCard({
  theme,
  showVideoCount = true,
  showViewCount = false,
  className = '',
  onClick,
}: ThemeCardProps) {
  const navigate = useNavigate();

  // Debug: verificar dados do tema
  console.log('📚 ThemeCard recebido:', {
    theme,
    iconName: theme.icon_name,
    hasIcon: !!iconMap[theme.icon_name as keyof typeof iconMap],
  });

  // Selecionar ícone baseado no icon_name
  const IconComponent =
    theme.icon_name && iconMap[theme.icon_name as keyof typeof iconMap]
      ? iconMap[theme.icon_name as keyof typeof iconMap]
      : Settings;

  // Contar vídeos ativos
  const activeVideoCount =
    theme.videos?.filter(video => video.is_active).length || 0;

  // Contar visualizações totais (se disponível)
  const totalViews =
    theme.videos?.reduce((total, video) => {
      return total + (video as any).view_count || 0;
    }, 0) || 0;

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/help-center/theme/${theme.id}`);
    }
  };

  return (
    <Card
      className={`group cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] ${className}`}
      onClick={handleClick}
    >
      <div className='p-6'>
        {/* Header com ícone e título */}
        <div className='flex items-start justify-between mb-4'>
          <div className='flex items-center space-x-3'>
            <div
              className='p-3 rounded-lg'
              style={{
                backgroundColor: theme.color ? `${theme.color}20` : '#f3f4f6',
                color: theme.color || '#6b7280',
              }}
            >
              <IconComponent size={24} />
            </div>
            <div>
              <h3 className='text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors'>
                {theme.title}
              </h3>
              {theme.description && (
                <p className='text-sm text-gray-600 mt-1 line-clamp-2'>
                  {theme.description}
                </p>
              )}
            </div>
          </div>

          <ChevronRight
            size={20}
            className='text-gray-400 group-hover:text-blue-600 transition-colors'
          />
        </div>

        {/* Estatísticas */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-4'>
            {showVideoCount && (
              <div className='flex items-center space-x-1 text-sm text-gray-600'>
                <Video size={16} />
                <span>{activeVideoCount} vídeos</span>
              </div>
            )}

            {showViewCount && totalViews > 0 && (
              <div className='flex items-center space-x-1 text-sm text-gray-600'>
                <Eye size={16} />
                <span>{totalViews.toLocaleString()} visualizações</span>
              </div>
            )}
          </div>

          {/* Aplicações associadas */}
          {theme.applications && theme.applications.length > 0 && (
            <div className='flex space-x-1'>
              {theme.applications.slice(0, 3).map(app => (
                <Badge key={app.id} variant='secondary' className='text-xs'>
                  {app.name}
                </Badge>
              ))}
              {theme.applications.length > 3 && (
                <Badge variant='outline' className='text-xs'>
                  +{theme.applications.length - 3}
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Vídeos em destaque (se houver) */}
        {theme.videos &&
          theme.videos.filter(v => v.is_featured && v.is_active).length > 0 && (
            <div className='mt-4 pt-4 border-t border-gray-100'>
              <div className='flex items-center space-x-2 text-sm text-gray-600'>
                <Play size={16} />
                <span>Vídeos em destaque:</span>
              </div>
              <div className='mt-2 space-y-1'>
                {theme.videos
                  .filter(v => v.is_featured && v.is_active)
                  .slice(0, 2)
                  .map(video => (
                    <div
                      key={video.id}
                      className='flex items-center space-x-2 text-sm'
                    >
                      <div className='w-2 h-2 bg-blue-500 rounded-full'></div>
                      <span className='text-gray-700 truncate'>
                        {video.title}
                      </span>
                      {video.duration && (
                        <span className='text-gray-500 text-xs'>
                          {Math.floor(video.duration / 60)}:
                          {(video.duration % 60).toString().padStart(2, '0')}
                        </span>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}
      </div>
    </Card>
  );
}
