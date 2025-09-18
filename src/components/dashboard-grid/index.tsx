import React from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { MoreVertical } from 'lucide-react';
import { debug } from '../../lib/utils/debug';

const ResponsiveGridLayout = WidthProvider(Responsive);

// Minimal layout type compatible with react-grid-layout's Layout
export type GridLayout = {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
  static?: boolean;
  isDraggable?: boolean;
  isResizable?: boolean;
};

type DashboardGridProps = {
  cards: any[];
  className?: string;
  loadUrl?: string;
  disablePersistence?: boolean;
  onLoadingChange?: (loading: boolean) => void;
  onEditCard?: (id: string) => void;
  onRemoveCard?: (id: string) => void;
  isEditMode?: boolean;
  onLayoutChange?: (layout: any[]) => void;
  renderCardContent?: (card: any) => React.ReactNode;
};

export default function DashboardGrid({
  cards,
  className,
  onEditCard,
  onRemoveCard,
  isEditMode = false,
  onLayoutChange,
  renderCardContent,
}: DashboardGridProps) {
  const [layout, setLayout] = React.useState<GridLayout[] | null>(null);
  const layoutKeyRef = React.useRef<string | null>(null);
  const [openMenuId, setOpenMenuId] = React.useState<string | null>(null);

  // Fechar menu quando clicar fora
  React.useEffect(() => {
    const handleClickOutside = (_event: MouseEvent) => {
      if (openMenuId) {
        setOpenMenuId(null);
      }
    };

    if (openMenuId) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [openMenuId]);

  // Criar layout diretamente dos cards - sem loading interno
  React.useEffect(() => {
    debug.dashboard('Cards recebidos', cards);

    if (!cards || cards.length === 0) {
      setLayout([]);
      return;
    }

    // Criar layout diretamente dos cards com dados da API
    const next = cards.map((c, idx) => {
      // PRIORIDADE: Usar dados do DB primeiro, fallback apenas se for null/undefined
      const layout = {
        i: c.id,
        x: c.positionX ?? (idx % 3) * 4, // Ajustado para largura de 4
        y: c.positionY ?? Math.floor(idx / 3) * 9, // Ajustado para altura de 9
        w: c.width ?? 4, // Fallback para 4 (tamanho padrão)
        h: c.height ?? 9, // Fallback para 9 (tamanho padrão)
        minW: 4, // Largura mínima de 4
        minH: 9, // Altura mínima de 9
        maxW: 12,
        maxH: 12,
        isDraggable: isEditMode,
        isResizable: isEditMode,
      };

      return layout;
    });

    const key = JSON.stringify(next);
    if (layoutKeyRef.current !== key) {
      layoutKeyRef.current = key;
      setLayout(next);
    }
  }, [cards, isEditMode]);

  const handleLayoutChange = React.useCallback(
    (next: GridLayout[]) => {
      const key = JSON.stringify(next);
      if (layoutKeyRef.current !== key) {
        layoutKeyRef.current = key;
        setLayout(next);

        // Se estiver no modo de edição, usar callback personalizado (não salva)
        if (isEditMode && onLayoutChange) {
          onLayoutChange(next);
        }
        // NUNCA salva automaticamente - só quando clicar no check
      }
    },
    [isEditMode, onLayoutChange]
  );

  // Reconcile: when cards change, ensure each card has a layout item.
  React.useEffect(() => {
    if (!layout) return;
    const ids = new Set(layout.map(l => l.i));
    const cardsIds = new Set(cards.map(c => c.id));

    // Remove layout items for cards that no longer exist
    const next = layout.filter(l => cardsIds.has(l.i));

    // Add layout items for new cards
    for (const card of cards) {
      if (!ids.has(card.id)) {
        next.push({
          i: card.id,
          x: card.positionX ?? (next.length % 3) * 4, // Ajustado para largura de 4
          y: card.positionY ?? Math.floor(next.length / 3) * 9, // Ajustado para altura de 9
          w: card.width ?? 4, // Fallback para 4 (tamanho padrão)
          h: card.height ?? 9, // Fallback para 9 (tamanho padrão)
          minW: 4, // Largura mínima de 4
          minH: 9, // Altura mínima de 9
          maxW: 12,
          maxH: 12,
          isDraggable: isEditMode,
          isResizable: isEditMode,
        });
      }
    }

    if (next.length !== layout.length) {
      const key = JSON.stringify(next);
      layoutKeyRef.current = key;
      setLayout(next);
    }
  }, [cards, layout, isEditMode]);

  if (!layout)
    return (
      <div className={`${className} h-full flex items-center justify-center`}>
        Carregando layout…
      </div>
    );

  return (
    <div className={`${className} h-full`}>
      <ResponsiveGridLayout
        className='layout h-full'
        layouts={{ lg: layout }}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={30}
        onLayoutChange={handleLayoutChange}
        isDraggable={isEditMode}
        isResizable={isEditMode}
        compactType='vertical'
        preventCollision={false}
        useCSSTransforms={true}
      >
        {cards.map(card => (
          <div
            key={card.id}
            className='bg-white rounded-lg shadow-sm border border-gray-200 h-full flex flex-col overflow-hidden'
          >
            {/* Header do Card */}
            <div className='bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 px-4 py-3 flex-shrink-0'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center space-x-2'>
                  <div className='w-2 h-2 bg-blue-500 rounded-full'></div>
                  <h3 className='font-semibold text-gray-800 truncate text-sm'>
                    {card.title}
                  </h3>
                </div>
                <div className='relative'>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      setOpenMenuId(openMenuId === card.id ? null : card.id);
                    }}
                    className='p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-white/60 transition-colors'
                  >
                    <MoreVertical className='w-4 h-4' />
                  </button>

                  {openMenuId === card.id && (
                    <div className='absolute right-0 top-8 z-50 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1'>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          onEditCard?.(card.id);
                          setOpenMenuId(null);
                        }}
                        className='w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center'
                      >
                        <svg
                          className='w-4 h-4 mr-2'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
                          />
                        </svg>
                        Editar
                      </button>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          onRemoveCard?.(card.id);
                          setOpenMenuId(null);
                        }}
                        className='w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center'
                      >
                        <svg
                          className='w-4 h-4 mr-2'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                          />
                        </svg>
                        Deletar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Conteúdo do Card */}
            <div className='flex-1 p-4'>
              {renderCardContent ? (
                renderCardContent(card)
              ) : (
                <div className='text-sm text-gray-500'>
                  {card.chartType} - {card.sensorId}
                </div>
              )}
            </div>
          </div>
        ))}
      </ResponsiveGridLayout>
    </div>
  );
}

export type { DashboardGridProps };
