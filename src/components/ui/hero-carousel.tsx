import * as React from 'react';
import { Root, Slide, Dots } from './carousel';

export type HeroItem = {
  logo: React.ReactNode;
  media: React.ReactNode;
  text: React.ReactNode;
};

export type HeroCarouselProps = {
  items: HeroItem[];
  autoPlay?: boolean;
  intervalMs?: number;
  className?: string;
};

export function HeroCarousel({
  items,
  autoPlay = true,
  intervalMs = 6000,
  className,
}: HeroCarouselProps) {
  return (
    <Root autoPlay={autoPlay} intervalMs={intervalMs} className={className}>
      {items.map((item, i) => (
        <Slide key={i} index={i} className='space-y-6'>
          <div className='flex justify-center items-center mb-4'>
            {item.logo}
          </div>
          <div className='rounded-xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm'>
            {item.media}
          </div>
          <div className='text-sm leading-relaxed text-white/90 text-center'>
            {item.text}
          </div>
        </Slide>
      ))}
      <Dots
        className='mt-1 flex items-center justify-center gap-2 text-white/70'
        dotClassName='h-1.5 w-1.5 rounded-full bg-white/30'
        activeClassName='!bg-white/70'
      />
    </Root>
  );
}

export default HeroCarousel;
