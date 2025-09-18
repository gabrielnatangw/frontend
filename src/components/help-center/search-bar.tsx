import React, { useState, useEffect, useRef } from 'react';
import { Search, X, TrendingUp } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  useVideoSearch,
  usePopularSearches,
  useTrackSearch,
} from '../../lib/hooks/use-help-center';
import { useAuthStore } from '../../lib/stores/auth-store';

interface SearchBarProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
  showSuggestions?: boolean;
  className?: string;
}

export function SearchBar({
  onSearch,
  placeholder = 'Buscar vídeos de ajuda...',
  showSuggestions = true,
  className = '',
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const { user } = useAuthStore();
  const { data: searchResults, isLoading: isSearching } = useVideoSearch(query);
  const { data: popularSearches } = usePopularSearches(5);
  const trackSearchMutation = useTrackSearch();

  // Buscar sugestões baseadas na query
  const suggestions = React.useMemo(() => {
    if (!query.trim() || query.length < 2) return [];

    const results = searchResults?.data?.videos || [];
    return results.slice(0, 5).map(video => ({
      type: 'video' as const,
      id: video.id,
      title: video.title,
      description: video.description,
      thumbnail: video.thumbnail_url,
    }));
  }, [query, searchResults]);

  // Buscar termos populares quando não há query
  const popularTerms = React.useMemo(() => {
    if (query.trim()) return [];
    return popularSearches?.data?.popular_searches || [];
  }, [query, popularSearches]);

  // Fechar sugestões quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Navegação com teclado
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    const totalItems = suggestions.length + popularTerms.length;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev < totalItems - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : totalItems - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          if (selectedIndex < suggestions.length) {
            handleSuggestionClick(suggestions[selectedIndex]);
          } else {
            const popularIndex = selectedIndex - suggestions.length;
            handlePopularClick(popularTerms[popularIndex].search_term);
          }
        } else {
          handleSearch();
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setIsOpen(true);
    setSelectedIndex(-1);
  };

  const handleSearch = () => {
    if (!query.trim()) return;

    // Rastrear busca
    if (user?.id) {
      trackSearchMutation.mutate({
        search_term: query,
        results_count: searchResults?.data?.videos?.length || 0,
        user_id: user.id,
      });
    }

    onSearch?.(query);
    setIsOpen(false);
  };

  const handleSuggestionClick = (suggestion: any) => {
    setQuery(suggestion.title);
    onSearch?.(suggestion.title);
    setIsOpen(false);
  };

  const handlePopularClick = (term: string) => {
    setQuery(term);
    onSearch?.(term);
    setIsOpen(false);
  };

  const clearQuery = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  return (
    <div className={`relative ${className}`}>
      <div className='relative'>
        <Search
          className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'
          size={20}
        />
        <Input
          ref={inputRef}
          type='text'
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className='pl-10 pr-10'
        />
        {query && (
          <Button
            variant='text'
            size='sm'
            onClick={clearQuery}
            className='absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0'
          >
            <X size={16} />
          </Button>
        )}
      </div>

      {/* Sugestões */}
      {isOpen && showSuggestions && (
        <div
          ref={suggestionsRef}
          className='absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto'
        >
          {/* Resultados da busca */}
          {suggestions.length > 0 && (
            <div className='p-2'>
              <div className='text-xs font-medium text-gray-500 mb-2 px-2'>
                Resultados da busca
              </div>
              {suggestions.map((suggestion, index) => (
                <div
                  key={suggestion.id}
                  className={`flex items-center space-x-3 p-2 rounded cursor-pointer transition-colors ${
                    selectedIndex === index
                      ? 'bg-blue-50 text-blue-700'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <div className='w-12 h-8 bg-gray-100 rounded flex items-center justify-center'>
                    {suggestion.thumbnail ? (
                      <img
                        src={suggestion.thumbnail}
                        alt=''
                        className='w-full h-full object-cover rounded'
                      />
                    ) : (
                      <Search size={16} className='text-gray-400' />
                    )}
                  </div>
                  <div className='flex-1 min-w-0'>
                    <div className='font-medium text-sm truncate'>
                      {suggestion.title}
                    </div>
                    {suggestion.description && (
                      <div className='text-xs text-gray-500 truncate'>
                        {suggestion.description}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Termos populares */}
          {popularTerms.length > 0 && (
            <div className='p-2 border-t border-gray-100'>
              <div className='flex items-center space-x-2 text-xs font-medium text-gray-500 mb-2 px-2'>
                <TrendingUp size={14} />
                <span>Buscas populares</span>
              </div>
              <div className='flex flex-wrap gap-1'>
                {popularTerms.map((popular, index) => (
                  <Badge
                    key={popular.search_term}
                    variant='outline'
                    className={`cursor-pointer transition-colors ${
                      selectedIndex === suggestions.length + index
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'hover:bg-gray-50'
                    }`}
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

          {/* Estado de carregamento */}
          {isSearching && (
            <div className='p-4 text-center text-sm text-gray-500'>
              <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mx-auto mb-2'></div>
              Buscando...
            </div>
          )}

          {/* Sem resultados */}
          {query.length >= 2 && suggestions.length === 0 && !isSearching && (
            <div className='p-4 text-center text-sm text-gray-500'>
              Nenhum resultado encontrado para "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
