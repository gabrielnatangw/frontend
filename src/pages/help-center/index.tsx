import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Play,
  BookOpen,
  TrendingUp,
  Grid,
  List,
  Star,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { ThemeCard, VideoCard, SearchBar } from '../../components/help-center';
import {
  useActiveThemes,
  useFeaturedVideos,
  usePopularSearches,
  useVideoSearch,
} from '../../lib/hooks/use-help-center';

export default function HelpCenterPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApplication, setSelectedApplication] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'themes' | 'videos'>('themes');

  // Buscar dados
  const { data: themesData, isLoading: isLoadingThemes } = useActiveThemes();
  const { data: featuredVideosData, isLoading: isLoadingFeatured } =
    useFeaturedVideos();
  const { data: popularSearches } = usePopularSearches(5);
  const { data: searchResults, isLoading: isSearching } =
    useVideoSearch(searchQuery);

  const themes = themesData?.data?.themes || [];
  const featuredVideos = featuredVideosData?.data?.videos || [];
  const popularTerms = popularSearches?.data?.popular_searches || [];

  // Debug: verificar dados recebidos
  console.log('🔍 Debug Help Center:', {
    themesData,
    featuredVideosData,
    themes: themes.length,
    featuredVideos: featuredVideos.length,
    isLoadingThemes,
    isLoadingFeatured,
  });

  // Debug: verificar estrutura dos vídeos
  if (featuredVideos.length > 0) {
    console.log('🎥 Primeiro vídeo em destaque:', featuredVideos[0]);
  }

  // Debug: verificar estrutura dos temas
  if (themes.length > 0) {
    console.log('📚 Primeiro tema:', themes[0]);
  } else {
    console.log('❌ Nenhum tema encontrado. Dados brutos:', themesData);
  }

  // Aplicações disponíveis (hardcoded por enquanto)
  const applications = [
    { id: 'all', name: 'Todas as aplicações' },
    { id: 'd-trace', name: 'D-Trace' },
    { id: 'p-trace', name: 'P-Trace' },
    { id: 'e-trace', name: 'E-Trace' },
    { id: 'm-trace', name: 'M-Trace' },
  ];

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setViewMode('videos');
  };

  const handleThemeClick = (themeId: string) => {
    navigate(`/help-center/theme/${themeId}`);
  };

  const handleVideoClick = (videoId: string) => {
    navigate(`/help-center/video/${videoId}`);
  };

  const handlePopularClick = (term: string) => {
    setSearchQuery(term);
    setViewMode('videos');
  };

  // Filtrar temas por aplicação
  const filteredThemes = themes.filter(theme => {
    if (selectedApplication === 'all') return true;
    return theme.applications?.some(app => app.id === selectedApplication);
  });

  // Filtrar vídeos por aplicação
  const filteredVideos = (searchResults?.data?.videos || []).filter(video => {
    if (selectedApplication === 'all') return true;
    return video.applications?.some(app => app.id === selectedApplication);
  });

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <div className='bg-white border-b border-gray-200'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
          <div className='text-center'>
            <h1 className='text-4xl font-bold text-gray-900 mb-4'>
              Centro de Ajuda
            </h1>
            <p className='text-xl text-gray-600 mb-8'>
              Encontre tutoriais, guias e vídeos para usar nossas ferramentas
            </p>

            {/* Barra de busca */}
            <div className='max-w-2xl mx-auto mb-8'>
              <SearchBar
                onSearch={handleSearch}
                placeholder='Buscar vídeos de ajuda...'
                className='w-full'
              />
            </div>

            {/* Filtros */}
            <div className='flex flex-wrap items-center justify-center gap-4 mb-8'>
              <Select
                value={selectedApplication}
                onValueChange={setSelectedApplication}
              >
                <SelectTrigger className='w-48'>
                  <SelectValue placeholder='Filtrar por aplicação' />
                </SelectTrigger>
                <SelectContent>
                  {applications.map(app => (
                    <SelectItem key={app.id} value={app.id}>
                      {app.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className='flex items-center space-x-2'>
                <Button
                  variant={viewMode === 'themes' ? 'contained' : 'outline'}
                  size='sm'
                  onClick={() => setViewMode('themes')}
                >
                  <Grid size={16} className='mr-2' />
                  Temas
                </Button>
                <Button
                  variant={viewMode === 'videos' ? 'contained' : 'outline'}
                  size='sm'
                  onClick={() => setViewMode('videos')}
                >
                  <List size={16} className='mr-2' />
                  Vídeos
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Buscas populares */}
        {!searchQuery && popularTerms.length > 0 && (
          <div className='mb-8'>
            <h2 className='text-2xl font-semibold text-gray-900 mb-4 flex items-center'>
              <TrendingUp size={24} className='mr-2' />
              Buscas Populares
            </h2>
            <div className='flex flex-wrap gap-2'>
              {popularTerms.map((popular, _index) => (
                <Badge
                  key={popular.search_term}
                  variant='outline'
                  className='cursor-pointer hover:bg-blue-50 hover:text-blue-700 transition-colors'
                  onClick={() => handlePopularClick(popular.search_term)}
                >
                  {popular.search_term}
                  <span className='ml-1 text-xs text-gray-400'>
                    ({popular.count})
                  </span>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Vídeos em destaque */}
        {!searchQuery && featuredVideos.length > 0 && (
          <div className='mb-8'>
            <h2 className='text-2xl font-semibold text-gray-900 mb-4 flex items-center'>
              <Star size={24} className='mr-2' />
              Vídeos em Destaque
            </h2>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
              {featuredVideos.slice(0, 4).map(video => (
                <VideoCard
                  key={video.id}
                  video={video}
                  onClick={() => handleVideoClick(video.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Conteúdo principal */}
        {viewMode === 'themes' ? (
          <div>
            <h2 className='text-2xl font-semibold text-gray-900 mb-6 flex items-center'>
              <BookOpen size={24} className='mr-2' />
              Temas de Ajuda
            </h2>

            {isLoadingThemes ? (
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                {[...Array(6)].map((_, i) => (
                  <div key={i} className='animate-pulse'>
                    <div className='bg-gray-200 rounded-lg h-48'></div>
                  </div>
                ))}
              </div>
            ) : filteredThemes.length > 0 ? (
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                {filteredThemes.map(theme => (
                  <ThemeCard
                    key={theme.id}
                    theme={theme}
                    onClick={() => handleThemeClick(theme.id)}
                  />
                ))}
              </div>
            ) : (
              <div className='text-center py-12'>
                <BookOpen size={48} className='mx-auto text-gray-400 mb-4' />
                <h3 className='text-lg font-medium text-gray-900 mb-2'>
                  Nenhum tema encontrado
                </h3>
                <p className='text-gray-600'>
                  Tente ajustar os filtros ou buscar por vídeos específicos.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div>
            <h2 className='text-2xl font-semibold text-gray-900 mb-6 flex items-center'>
              <Play size={24} className='mr-2' />
              {searchQuery
                ? `Resultados para "${searchQuery}"`
                : 'Todos os Vídeos'}
            </h2>

            {isSearching ? (
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
                {[...Array(8)].map((_, i) => (
                  <div key={i} className='animate-pulse'>
                    <div className='bg-gray-200 rounded-lg h-64'></div>
                  </div>
                ))}
              </div>
            ) : filteredVideos.length > 0 ? (
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
                {filteredVideos.map(video => (
                  <VideoCard
                    key={video.id}
                    video={video}
                    onClick={() => handleVideoClick(video.id)}
                  />
                ))}
              </div>
            ) : (
              <div className='text-center py-12'>
                <Search size={48} className='mx-auto text-gray-400 mb-4' />
                <h3 className='text-lg font-medium text-gray-900 mb-2'>
                  {searchQuery
                    ? 'Nenhum vídeo encontrado'
                    : 'Nenhum vídeo disponível'}
                </h3>
                <p className='text-gray-600 mb-4'>
                  {searchQuery
                    ? `Tente usar termos diferentes ou verificar a ortografia.`
                    : 'Não há vídeos disponíveis no momento.'}
                </p>
                {searchQuery && (
                  <Button
                    variant='outline'
                    onClick={() => {
                      setSearchQuery('');
                      setViewMode('themes');
                    }}
                  >
                    Ver todos os temas
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
