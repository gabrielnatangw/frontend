import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, SortAsc, SortDesc, Grid, List } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { Badge } from '../../../components/ui/badge';
import { VideoCard } from '../../../components/help-center';
import { useTheme, useVideosByTheme } from '../../../lib/hooks/use-help-center';

type SortOption = 'title' | 'duration' | 'created_at' | 'sort_order';
type SortDirection = 'asc' | 'desc';

export default function ThemePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState<SortOption>('sort_order');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterFeatured, setFilterFeatured] = useState<boolean | null>(null);

  // Buscar dados
  const {
    data: themeData,
    isLoading: isLoadingTheme,
    error: themeError,
  } = useTheme(id!);
  const { data: videosData, isLoading: isLoadingVideos } = useVideosByTheme(
    id!
  );

  const theme = themeData?.data?.theme;
  const videos = videosData?.data?.videos || [];

  // Filtrar e ordenar vídeos
  const filteredVideos = videos
    .filter(video => {
      if (filterFeatured === null) return video.is_active;
      return video.is_active && video.is_featured === filterFeatured;
    })
    .sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'duration':
          aValue = a.duration || 0;
          bValue = b.duration || 0;
          break;
        case 'created_at':
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        case 'sort_order':
        default:
          aValue = a.sort_order || 0;
          bValue = b.sort_order || 0;
          break;
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const handleVideoClick = (videoId: string) => {
    navigate(`/help-center/video/${videoId}`);
  };

  const handleBack = () => {
    navigate('/help-center');
  };

  if (isLoadingTheme) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500'></div>
      </div>
    );
  }

  if (themeError || !theme) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold text-gray-900 mb-4'>
            Tema não encontrado
          </h1>
          <p className='text-gray-600 mb-8'>
            O tema que você está procurando não existe ou foi removido.
          </p>
          <Button onClick={handleBack}>
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
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
          <div className='flex items-center justify-between mb-6'>
            <Button
              variant='text'
              onClick={handleBack}
              className='flex items-center space-x-2'
            >
              <ArrowLeft size={20} />
              <span>Voltar</span>
            </Button>
          </div>

          {/* Informações do tema */}
          <div className='flex items-start space-x-6'>
            <div
              className='p-4 rounded-xl'
              style={{
                backgroundColor: theme.color ? `${theme.color}20` : '#f3f4f6',
                color: theme.color || '#6b7280',
              }}
            >
              <Play size={32} />
            </div>

            <div className='flex-1'>
              <h1 className='text-3xl font-bold text-gray-900 mb-2'>
                {theme.title}
              </h1>
              {theme.description && (
                <p className='text-lg text-gray-600 mb-4'>
                  {theme.description}
                </p>
              )}

              {/* Estatísticas */}
              <div className='flex items-center space-x-6 text-sm text-gray-600'>
                <div className='flex items-center space-x-1'>
                  <Play size={16} />
                  <span>{filteredVideos.length} vídeos</span>
                </div>
                {theme.applications && theme.applications.length > 0 && (
                  <div className='flex items-center space-x-1'>
                    <span>Aplicações:</span>
                    {theme.applications.map(app => (
                      <Badge
                        key={app.id}
                        variant='secondary'
                        className='text-xs'
                      >
                        {app.name}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Filtros e ordenação */}
        <div className='flex flex-wrap items-center justify-between mb-6'>
          <div className='flex items-center space-x-4'>
            <Select
              value={sortBy}
              onValueChange={(value: SortOption) => setSortBy(value)}
            >
              <SelectTrigger className='w-48'>
                <SelectValue placeholder='Ordenar por' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='sort_order'>Ordem padrão</SelectItem>
                <SelectItem value='title'>Título</SelectItem>
                <SelectItem value='duration'>Duração</SelectItem>
                <SelectItem value='created_at'>Data de criação</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant='outline'
              size='sm'
              onClick={() =>
                setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
              }
            >
              {sortDirection === 'asc' ? (
                <SortAsc size={16} />
              ) : (
                <SortDesc size={16} />
              )}
            </Button>

            <Select
              value={filterFeatured?.toString() || 'all'}
              onValueChange={value => {
                if (value === 'all') setFilterFeatured(null);
                else setFilterFeatured(value === 'true');
              }}
            >
              <SelectTrigger className='w-40'>
                <SelectValue placeholder='Filtrar' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>Todos</SelectItem>
                <SelectItem value='true'>Destaque</SelectItem>
                <SelectItem value='false'>Comum</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='flex items-center space-x-2'>
            <Button
              variant={viewMode === 'grid' ? 'contained' : 'outline'}
              size='sm'
              onClick={() => setViewMode('grid')}
            >
              <Grid size={16} />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'contained' : 'outline'}
              size='sm'
              onClick={() => setViewMode('list')}
            >
              <List size={16} />
            </Button>
          </div>
        </div>

        {/* Lista de vídeos */}
        {isLoadingVideos ? (
          <div
            className={`grid gap-6 ${
              viewMode === 'grid'
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                : 'grid-cols-1'
            }`}
          >
            {[...Array(6)].map((_, i) => (
              <div key={i} className='animate-pulse'>
                <div
                  className={`bg-gray-200 rounded-lg ${
                    viewMode === 'grid' ? 'h-64' : 'h-32'
                  }`}
                ></div>
              </div>
            ))}
          </div>
        ) : filteredVideos.length > 0 ? (
          <div
            className={`grid gap-6 ${
              viewMode === 'grid'
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                : 'grid-cols-1'
            }`}
          >
            {filteredVideos.map(video => (
              <VideoCard
                key={video.id}
                video={video}
                onClick={() => handleVideoClick(video.id)}
                className={viewMode === 'list' ? 'flex' : ''}
              />
            ))}
          </div>
        ) : (
          <div className='text-center py-12'>
            <Play size={48} className='mx-auto text-gray-400 mb-4' />
            <h3 className='text-lg font-medium text-gray-900 mb-2'>
              Nenhum vídeo encontrado
            </h3>
            <p className='text-gray-600'>
              Tente ajustar os filtros ou verificar se há vídeos disponíveis.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
