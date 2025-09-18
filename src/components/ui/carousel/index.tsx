import * as React from 'react';

type CarouselContextValue = {
  index: number;
  count: number;
  goTo: (i: number) => void;
  next: () => void;
  prev: () => void;
  dragging: boolean;
  dragDx: number;
  viewportWidth: number;
  reportSlideHeight: (h: number) => void;
  containerHeight: number;
};

const CarouselCtx = React.createContext<CarouselContextValue | null>(null);
function useCarouselCtx() {
  const ctx = React.useContext(CarouselCtx);
  if (!ctx)
    throw new Error('Carousel.* deve ser usado dentro de <Carousel.Root>');
  return ctx;
}

export type CarouselRootProps = {
  children: React.ReactNode;
  defaultIndex?: number;
  index?: number;
  onIndexChange?: (i: number) => void;
  autoPlay?: boolean;
  intervalMs?: number;
  className?: string;
};

function Root({
  children,
  defaultIndex = 0,
  index,
  onIndexChange,
  autoPlay = false,
  intervalMs = 5000,
  className,
}: CarouselRootProps) {
  const isControlled = typeof index === 'number';
  const [internal, setInternal] = React.useState(defaultIndex);
  const [paused, setPaused] = React.useState(false);
  const [dragging, setDragging] = React.useState(false);
  const [dragDx, setDragDx] = React.useState(0);
  const [viewportWidth, setViewportWidth] = React.useState(0);
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const slidesContainerRef = React.useRef<HTMLDivElement | null>(null);
  const [containerHeight, setContainerHeight] = React.useState<number>(0);
  const startPos = React.useRef<{ x: number; y: number } | null>(null);

  // discover slides count from children
  const allChildren = React.Children.toArray(children) as React.ReactElement[];
  const isCarouselSlide = (
    el: React.ReactElement
  ): el is React.ReactElement<CarouselSlideProps> =>
    React.isValidElement(el) &&
    (el.type as { displayName?: string }).displayName === Slide.displayName;
  const slides = allChildren.filter(
    isCarouselSlide
  ) as React.ReactElement<CarouselSlideProps>[];
  const count = slides.length;

  const value = isControlled ? (index as number) : internal;

  const goTo = React.useCallback(
    (i: number) => {
      const next = ((i % count) + count) % count; // clamp cyclic
      if (!isControlled) setInternal(next);
      onIndexChange?.(next);
    },
    [count, isControlled, onIndexChange]
  );

  const next = React.useCallback(() => goTo(value + 1), [goTo, value]);
  const prev = React.useCallback(() => goTo(value - 1), [goTo, value]);

  React.useEffect(() => {
    if (!autoPlay || paused || dragging || count <= 1) return;
    const id = setInterval(() => {
      goTo(value + 1);
    }, intervalMs);
    return () => clearInterval(id);
  }, [autoPlay, intervalMs, value, count, goTo, paused, dragging]);

  // Gesture: swipe
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    startPos.current = { x: e.clientX, y: e.clientY };
    setDragging(true);
    setPaused(true);
  };

  // measure viewport width
  React.useEffect(() => {
    if (!rootRef.current) return;
    const el = rootRef.current;
    const resize = () => setViewportWidth(el.clientWidth);
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging || !startPos.current) return;
    // prevent text selection and native gestures while dragging
    e.preventDefault();
    setDragDx(e.clientX - startPos.current.x);
  };
  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!startPos.current) return;
    const dx = e.clientX - startPos.current.x;
    const dy = e.clientY - startPos.current.y;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);
    const threshold = 60;
    if (absX > absY && absX > threshold) {
      if (dx < 0) next();
      else prev();
    }
    startPos.current = null;
    setDragging(false);
    setPaused(false);
    setDragDx(0);
  };
  const onPointerCancel = () => {
    startPos.current = null;
    setDragging(false);
    setPaused(false);
    setDragDx(0);
  };

  return (
    <CarouselCtx.Provider
      value={{
        index: value,
        count,
        goTo,
        next,
        prev,
        dragging,
        dragDx,
        viewportWidth,
        reportSlideHeight: h => setContainerHeight(h),
        containerHeight,
      }}
    >
      <div
        ref={rootRef}
        className={`${className ?? ''} ${dragging ? 'select-none cursor-grabbing' : 'cursor-grab'}`}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        onPointerLeave={onPointerCancel}
        style={{ touchAction: 'pan-y' }}
        onDragStart={e => e.preventDefault()}
      >
        {/* Stack slides using CSS grid so they overlap and we can crossfade */}
        <div
          ref={slidesContainerRef}
          className='relative grid'
          style={{
            height: containerHeight ? `${containerHeight}px` : undefined,
            transition: 'height 300ms ease',
          }}
        >
          {slides.map((slide, i) => {
            const absolute =
              containerHeight === 0 && i === value ? '' : ' absolute inset-0';
            return React.cloneElement<CarouselSlideProps>(slide, {
              key: i,
              index: i,
              className:
                'col-start-1 row-start-1 transition-all duration-500 ease-out' +
                absolute +
                ' ' +
                (slide.props.className ?? ''),
            });
          })}
        </div>
        {/* Render non-slide children (e.g., Dots) after slides */}
        {allChildren.filter(c => !isCarouselSlide(c))}
      </div>
    </CarouselCtx.Provider>
  );
}

export type CarouselSlideProps = {
  index: number; // posição do slide
  children: React.ReactNode;
  className?: string;
};

function Slide({ index, children, className }: CarouselSlideProps) {
  const {
    index: current,
    count,
    dragging,
    dragDx,
    viewportWidth,
    reportSlideHeight,
    // containerHeight,
  } = useCarouselCtx();
  const isCurrent = current === index;
  const prevIndex = (current - 1 + count) % count;
  const nextIndex = (current + 1) % count;
  const isPrev = index === prevIndex;
  const isNext = index === nextIndex;
  const ref = React.useRef<HTMLDivElement | null>(null);

  // Compute horizontal translation during drag
  let translateX = 0;
  if (dragging) {
    if (isCurrent) translateX = dragDx;
    else if (isNext && dragDx < 0) translateX = dragDx + viewportWidth;
    else if (isPrev && dragDx > 0) translateX = dragDx - viewportWidth;
    else translateX = 0;
  }

  // Visibility and transitions
  const isVisible = isCurrent || (dragging && (isPrev || isNext));
  const baseTransitions = dragging
    ? ''
    : 'transition-opacity transition-transform duration-500 ease-out';

  // Measure height when current or visibility changes
  React.useLayoutEffect(() => {
    if (!ref.current) return;
    if (!isVisible) return;
    const el = ref.current;
    const measure = () => reportSlideHeight(el.offsetHeight);
    measure();
    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(measure);
      ro.observe(el);
    } else {
      // Fallback: re-measure after a tick
      const id = setTimeout(measure, 0);
      return () => clearTimeout(id);
    }
    return () => ro?.disconnect();
  }, [isVisible, reportSlideHeight]);

  return (
    <div
      ref={ref}
      role='group'
      aria-roledescription='slide'
      aria-label={`Slide ${index + 1}`}
      className={
        (className ?? '') +
        ' ' +
        (isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none') +
        ' ' +
        baseTransitions
      }
      style={{ transform: `translateX(${translateX}px)` }}
    >
      {children}
    </div>
  );
}
Slide.displayName = 'Carousel.Slide';

export type CarouselDotsProps = {
  className?: string;
  dotClassName?: string;
  activeClassName?: string;
};

function Dots({ className, dotClassName, activeClassName }: CarouselDotsProps) {
  const { count, index, goTo } = useCarouselCtx();
  return (
    <div className={className ?? 'flex items-center justify-center gap-2'}>
      {Array.from({ length: count }).map((_, i) => (
        <button
          key={i}
          aria-label={`Ir para o slide ${i + 1}`}
          onClick={() => goTo(i)}
          className={
            (dotClassName ?? 'h-1.5 w-1.5 rounded-full bg-white/30') +
            (i === index ? ' ' + (activeClassName ?? '!bg-white/70') : '')
          }
        />
      ))}
    </div>
  );
}
Dots.displayName = 'Carousel.Dots';

// Exportar componentes individualmente
export { Root, Slide, Dots };
export default Root;
