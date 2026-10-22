import * as React from 'react';
import {
  Shirt,
  CopyCheck,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { GarmentSizeItem, JerseyMockupConfig, GarmentView } from './editorTypes';
import { JerseyMockup } from './jerseyMockups';

export interface MultiSizeFilmstripProps {
  currentSizeId: string;
  onSelectSize: (size: GarmentSizeItem) => void;
  onApplyToAll: () => void;
  mockupConfig: JerseyMockupConfig;
  activeView: GarmentView;
  elementCount: number;
}

// Complete Sports Garment Sizing Range: Youth + Adult
export const GARMENT_SIZE_PRESETS: GarmentSizeItem[] = [
  // Youth Sizes
  { id: 'youth-1-2', name: '1-2 Yr', category: 'youth', widthInches: 13, heightInches: 17, description: 'Youth Toddler 1-2 Years (13" × 17")' },
  { id: 'youth-3-4', name: '3-4 Yr', category: 'youth', widthInches: 14, heightInches: 19, description: 'Youth Early 3-4 Years (14" × 19")' },
  { id: 'youth-5-6', name: '5-6 Yr', category: 'youth', widthInches: 15, heightInches: 21, description: 'Youth Junior 5-6 Years (15" × 21")' },
  { id: 'youth-7-8', name: '7-8 Yr', category: 'youth', widthInches: 16, heightInches: 23, description: 'Youth Junior 7-8 Years (16" × 23")' },
  { id: 'youth-9-10', name: '9-10 Yr', category: 'youth', widthInches: 17, heightInches: 25, description: 'Youth Mid 9-10 Years (17" × 25")' },
  { id: 'youth-11-12', name: '11-12 Yr', category: 'youth', widthInches: 18, heightInches: 26.5, description: 'Youth Senior 11-12 Years (18" × 26.5")' },

  // Adult Sizes
  { id: 'adult-xs', name: 'XS', category: 'adult', widthInches: 18.5, heightInches: 27, description: 'Adult Extra Small (18.5" × 27")' },
  { id: 'adult-s', name: 'S', category: 'adult', widthInches: 19.5, heightInches: 28, description: 'Adult Small (19.5" × 28")' },
  { id: 'adult-m', name: 'M', category: 'adult', widthInches: 20.5, heightInches: 29, description: 'Adult Medium (20.5" × 29")' },
  { id: 'adult-l', name: 'L', category: 'adult', widthInches: 22, heightInches: 30, description: 'Adult Large (22" × 30")' },
  { id: 'adult-xl', name: 'XL', category: 'adult', widthInches: 23.5, heightInches: 31, description: 'Adult Extra Large (23.5" × 31")' },
  { id: 'adult-2xl', name: '2XL', category: 'adult', widthInches: 25, heightInches: 32, description: 'Adult 2X Large (25" × 32")' },
  { id: 'adult-3xl', name: '3XL', category: 'adult', widthInches: 26.5, heightInches: 33, description: 'Adult 3X Large (26.5" × 33")' },
  { id: 'adult-4xl', name: '4XL', category: 'adult', widthInches: 28, heightInches: 34, description: 'Adult 4X Large (28" × 34")' },
  { id: 'adult-5xl', name: '5XL', category: 'adult', widthInches: 29.5, heightInches: 35, description: 'Adult 5X Large (29.5" × 35")' },
  { id: 'adult-6xl', name: '6XL', category: 'adult', widthInches: 31, heightInches: 36, description: 'Adult 6X Large (31" × 36")' },
];

export const MultiSizeFilmstrip: React.FC<MultiSizeFilmstripProps> = ({
  currentSizeId,
  onSelectSize,
  onApplyToAll,
  mockupConfig,
  activeView,
  elementCount,
}) => {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const [filterCategory, setFilterCategory] = React.useState<'all' | 'youth' | 'adult'>('all');
  const [showAppliedToast, setShowAppliedToast] = React.useState(false);

  const filteredSizes = GARMENT_SIZE_PRESETS.filter((size) => {
    if (filterCategory === 'all') return true;
    return size.category === filterCategory;
  });

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -260 : 260;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleApplyToAllClick = () => {
    onApplyToAll();
    setShowAppliedToast(true);
    setTimeout(() => setShowAppliedToast(false), 2500);
  };

  return (
    <div className="h-24 bg-surface border-t border-border flex items-center px-4 shrink-0 select-none shadow-sm relative z-10 gap-3">
      {/* Left Control Column */}
      <div className="flex flex-col gap-1.5 shrink-0 pr-3 border-r border-border">
        <div className="flex items-center gap-1.5">
          <Shirt className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-bold text-text-primary uppercase tracking-wider">
            Garment Filmstrip
          </span>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center bg-surface-subtle p-0.5 rounded border border-border">
          <button
            type="button"
            onClick={() => setFilterCategory('all')}
            className={cn(
              'px-2 py-0.5 rounded text-[10px] font-semibold transition-all',
              filterCategory === 'all'
                ? 'bg-surface text-primary shadow-xs'
                : 'text-text-secondary hover:text-text-primary'
            )}
          >
            All ({GARMENT_SIZE_PRESETS.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterCategory('youth')}
            className={cn(
              'px-2 py-0.5 rounded text-[10px] font-semibold transition-all',
              filterCategory === 'youth'
                ? 'bg-surface text-primary shadow-xs'
                : 'text-text-secondary hover:text-text-primary'
            )}
          >
            Youth (6)
          </button>
          <button
            type="button"
            onClick={() => setFilterCategory('adult')}
            className={cn(
              'px-2 py-0.5 rounded text-[10px] font-semibold transition-all',
              filterCategory === 'adult'
                ? 'bg-surface text-primary shadow-xs'
                : 'text-text-secondary hover:text-text-primary'
            )}
          >
            Adult (10)
          </button>
        </div>
      </div>

      {/* Carousel Navigation Button: Left */}
      <button
        type="button"
        onClick={() => handleScroll('left')}
        className="w-6 h-16 rounded bg-surface-subtle hover:bg-surface-muted border border-border flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors shrink-0"
        title="Scroll left"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Scrollable Size Cards Filmstrip */}
      <div
        ref={scrollContainerRef}
        className="flex-1 flex items-center gap-2 overflow-x-auto py-1 scrollbar-none scroll-smooth"
        style={{ scrollbarWidth: 'none' }}
      >
        {filteredSizes.map((size) => {
          const isSelected = size.id === currentSizeId || size.name.toLowerCase() === currentSizeId.toLowerCase();
          return (
            <div
              key={size.id}
              onClick={() => onSelectSize(size)}
              className={cn(
                'w-28 h-20 rounded-md border p-1.5 flex flex-col justify-between shrink-0 cursor-pointer transition-all group relative',
                isSelected
                  ? 'border-primary bg-primary-subtle/30 ring-1 ring-primary shadow-xs'
                  : 'border-border bg-surface hover:border-primary/50 hover:bg-surface-subtle'
              )}
            >
              {/* Card Top: Size Name & Category Tag */}
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    'text-xs font-black tracking-wide font-mono',
                    isSelected ? 'text-primary' : 'text-text-primary group-hover:text-primary'
                  )}
                >
                  {size.name}
                </span>
                <span className="text-[9px] uppercase px-1 rounded bg-surface-muted text-text-muted font-bold">
                  {size.category === 'youth' ? 'YTH' : 'ADT'}
                </span>
              </div>

              {/* Card Middle: Miniature Jersey Visual */}
              <div className="h-7 w-full flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity">
                <div className="w-6 h-7">
                  <JerseyMockup
                    view={activeView}
                    config={mockupConfig}
                    className="w-full h-full drop-shadow-xs"
                  />
                </div>
              </div>

              {/* Card Bottom: Physical Dimensions */}
              <div className="text-[9px] font-mono text-text-muted text-center leading-none">
                {size.widthInches}" × {size.heightInches}"
              </div>
            </div>
          );
        })}
      </div>

      {/* Carousel Navigation Button: Right */}
      <button
        type="button"
        onClick={() => handleScroll('right')}
        className="w-6 h-16 rounded bg-surface-subtle hover:bg-surface-muted border border-border flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors shrink-0"
        title="Scroll right"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* Bulk Sync All Sizes Button */}
      <div className="flex flex-col items-center justify-center pl-3 border-l border-border shrink-0">
        <Button
          size="sm"
          variant="primary"
          onClick={handleApplyToAllClick}
          className="gap-1.5 text-xs font-bold shadow-xs whitespace-nowrap bg-emerald-600 hover:bg-emerald-700 text-white"
          title="Scale and synchronize current artwork and typography proportionally across all garment grades"
        >
          <CopyCheck className="w-3.5 h-3.5" />
          Sync All Sizes
        </Button>
        <span className="text-[10px] text-text-muted mt-1 font-mono">
          Sync {elementCount} elements
        </span>
      </div>

      {/* Sync All Toast confirmation */}
      {showAppliedToast && (
        <div className="absolute top-2 right-6 bg-emerald-600 text-white text-xs px-3.5 py-2 rounded-lg shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <Sparkles className="w-4 h-4 text-emerald-200" />
          <span className="font-semibold">Artwork scaled and synchronized across all {GARMENT_SIZE_PRESETS.length} garment size grades!</span>
        </div>
      )}
    </div>
  );
};
