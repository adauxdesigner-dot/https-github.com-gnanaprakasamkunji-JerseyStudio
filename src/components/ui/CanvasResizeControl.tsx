import * as React from 'react';
import { Lock, Unlock, RotateCcw, Check, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './Button';
import { Input } from './Input';
import { Select } from './Select';
import { Badge } from './Badge';

export type CanvasUnit = 'in' | 'cm' | 'mm' | 'px';

export interface CanvasDimensions {
  width: number;
  height: number;
  unit: CanvasUnit;
  dpi: number;
}

export interface PresetSize {
  id: string;
  name: string;
  category: 'Garment Size' | 'Print Bed';
  widthInInches: number;
  heightInInches: number;
  description: string;
}

export const CANVAS_PRESETS: PresetSize[] = [
  {
    id: 'youth',
    name: 'Youth Standard',
    category: 'Garment Size',
    widthInInches: 16,
    heightInInches: 22,
    description: '16" × 22" (Youth)',
  },
  {
    id: 's',
    name: 'Adult Small (S)',
    category: 'Garment Size',
    widthInInches: 18,
    heightInInches: 26,
    description: '18" × 26"',
  },
  {
    id: 'm',
    name: 'Adult Medium (M)',
    category: 'Garment Size',
    widthInInches: 20,
    heightInInches: 28,
    description: '20" × 28" (Standard)',
  },
  {
    id: 'l',
    name: 'Adult Large (L)',
    category: 'Garment Size',
    widthInInches: 22,
    heightInInches: 30,
    description: '22" × 30"',
  },
  {
    id: 'xl',
    name: 'Adult Extra Large (XL)',
    category: 'Garment Size',
    widthInInches: 24,
    heightInInches: 32,
    description: '24" × 32"',
  },
  {
    id: 'xxl',
    name: 'Adult 2XL (XXL)',
    category: 'Garment Size',
    widthInInches: 26,
    heightInInches: 34,
    description: '26" × 34"',
  },
  {
    id: 'print-a3',
    name: 'Sublimation Bed A3',
    category: 'Print Bed',
    widthInInches: 11.69,
    heightInInches: 16.54,
    description: '29.7 × 42.0 cm',
  },
  {
    id: 'print-large',
    name: 'Large Format Bed',
    category: 'Print Bed',
    widthInInches: 28,
    heightInInches: 40,
    description: '28" × 40" Roll Press',
  },
];

// Conversion helper functions
function toInches(val: number, unit: CanvasUnit, dpi: number): number {
  switch (unit) {
    case 'in':
      return val;
    case 'cm':
      return val / 2.54;
    case 'mm':
      return val / 25.4;
    case 'px':
      return val / dpi;
  }
}

function fromInches(valInches: number, unit: CanvasUnit, dpi: number): number {
  switch (unit) {
    case 'in':
      return Math.round(valInches * 100) / 100;
    case 'cm':
      return Math.round(valInches * 2.54 * 10) / 10;
    case 'mm':
      return Math.round(valInches * 25.4);
    case 'px':
      return Math.round(valInches * dpi);
  }
}

export interface CanvasResizeControlProps {
  initialDimensions?: CanvasDimensions;
  onApplyDimensions: (dimensions: CanvasDimensions) => void;
  className?: string;
}

export const CanvasResizeControl: React.FC<CanvasResizeControlProps> = ({
  initialDimensions = {
    width: 20,
    height: 28,
    unit: 'in',
    dpi: 300,
  },
  onApplyDimensions,
  className,
}) => {
  const [dimensions, setDimensions] = React.useState<CanvasDimensions>(initialDimensions);
  const [aspectLocked, setAspectLocked] = React.useState<boolean>(true);
  const [appliedNotification, setAppliedNotification] = React.useState<boolean>(false);
  const [selectedPreset, setSelectedPreset] = React.useState<string>('m');

  // Stored aspect ratio (width / height in inches)
  const [aspectRatio, setAspectRatio] = React.useState<number>(
    toInches(initialDimensions.width, initialDimensions.unit, initialDimensions.dpi) /
    toInches(initialDimensions.height, initialDimensions.unit, initialDimensions.dpi)
  );

  const handleUnitChange = (newUnit: CanvasUnit) => {
    const widthInches = toInches(dimensions.width, dimensions.unit, dimensions.dpi);
    const heightInches = toInches(dimensions.height, dimensions.unit, dimensions.dpi);

    setDimensions({
      ...dimensions,
      unit: newUnit,
      width: fromInches(widthInches, newUnit, dimensions.dpi),
      height: fromInches(heightInches, newUnit, dimensions.dpi),
    });
  };

  const handleDpiChange = (newDpi: number) => {
    // If unit is px, update px values based on previous physical inches
    if (dimensions.unit === 'px') {
      const widthInches = toInches(dimensions.width, 'px', dimensions.dpi);
      const heightInches = toInches(dimensions.height, 'px', dimensions.dpi);
      setDimensions({
        ...dimensions,
        dpi: newDpi,
        width: Math.round(widthInches * newDpi),
        height: Math.round(heightInches * newDpi),
      });
    } else {
      setDimensions({
        ...dimensions,
        dpi: newDpi,
      });
    }
  };

  const handleWidthChange = (valStr: string) => {
    const parsed = parseFloat(valStr);
    const val = isNaN(parsed) ? 0 : Math.max(0, parsed);
    if (aspectLocked && aspectRatio > 0) {
      const newHeight = val / aspectRatio;
      setDimensions({
        ...dimensions,
        width: val,
        height: Math.round(newHeight * 100) / 100,
      });
    } else {
      setDimensions({ ...dimensions, width: val });
    }
    setSelectedPreset('custom');
  };

  const handleHeightChange = (valStr: string) => {
    const parsed = parseFloat(valStr);
    const val = isNaN(parsed) ? 0 : Math.max(0, parsed);
    if (aspectLocked && aspectRatio > 0) {
      const newWidth = val * aspectRatio;
      setDimensions({
        ...dimensions,
        width: Math.round(newWidth * 100) / 100,
        height: val,
      });
    } else {
      setDimensions({ ...dimensions, height: val });
    }
    setSelectedPreset('custom');
  };

  const handlePresetSelect = (presetId: string) => {
    setSelectedPreset(presetId);
    const preset = CANVAS_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    const newWidth = fromInches(preset.widthInInches, dimensions.unit, dimensions.dpi);
    const newHeight = fromInches(preset.heightInInches, dimensions.unit, dimensions.dpi);

    setDimensions({
      ...dimensions,
      width: newWidth,
      height: newHeight,
    });
    setAspectRatio(preset.widthInInches / preset.heightInInches);
  };

  const handleApply = () => {
    if (dimensions.width <= 0 || dimensions.height <= 0) return;
    onApplyDimensions(dimensions);
    setAppliedNotification(true);
    setTimeout(() => setAppliedNotification(false), 2000);
  };

  const handleReset = () => {
    setDimensions(initialDimensions);
    setSelectedPreset('m');
  };

  // Calculate live pixels
  const widthInches = toInches(dimensions.width, dimensions.unit, dimensions.dpi);
  const heightInches = toInches(dimensions.height, dimensions.unit, dimensions.dpi);
  const pixelWidth = Math.round(widthInches * dimensions.dpi);
  const pixelHeight = Math.round(heightInches * dimensions.dpi);

  return (
    <div
      className={cn(
        'flex flex-col gap-3 p-4 rounded-md border border-border bg-surface shadow-sm text-xs',
        className
      )}
    >
      <div className="flex items-center justify-between border-b border-border pb-2.5">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-text-primary text-sm">
            Canvas Dimensions
          </span>
          <Badge variant="primary" size="sm">
            Local Vector
          </Badge>
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleReset}
            title="Reset to default size"
            aria-label="Reset dimensions"
          >
            <RotateCcw className="w-3.5 h-3.5 text-text-secondary" />
          </Button>
        </div>
      </div>

      {/* Preset selector */}
      <div className="flex flex-col gap-1">
        <label className="font-medium text-text-secondary text-[11px]">
          Standard Garment & Print Presets
        </label>
        <div className="grid grid-cols-4 gap-1.5">
          {CANVAS_PRESETS.slice(0, 6).map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handlePresetSelect(preset.id)}
              className={cn(
                'py-1 px-2 rounded-sm border text-[11px] font-medium transition-colors text-center',
                selectedPreset === preset.id
                  ? 'border-primary bg-primary-subtle text-primary font-semibold'
                  : 'border-border bg-surface-subtle hover:bg-surface text-text-primary'
              )}
            >
              {preset.id.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Inputs for Width and Height with aspect lock */}
      <div className="grid grid-cols-5 gap-2 items-end pt-1">
        <div className="col-span-2">
          <Input
            label={`Width (${dimensions.unit})`}
            type="number"
            min="1"
            step={dimensions.unit === 'px' ? '1' : '0.1'}
            value={dimensions.width || ''}
            onChange={(e) => handleWidthChange(e.target.value)}
            className="tabular-nums"
          />
        </div>

        {/* Aspect Ratio Lock Button */}
        <div className="col-span-1 flex justify-center pb-1">
          <Button
            variant={aspectLocked ? 'secondary' : 'ghost'}
            size="icon-sm"
            type="button"
            onClick={() => setAspectLocked(!aspectLocked)}
            title={aspectLocked ? 'Aspect ratio locked' : 'Aspect ratio unlocked'}
            aria-label="Toggle aspect ratio lock"
          >
            {aspectLocked ? (
              <Lock className="w-3.5 h-3.5 text-primary" />
            ) : (
              <Unlock className="w-3.5 h-3.5 text-text-muted" />
            )}
          </Button>
        </div>

        <div className="col-span-2">
          <Input
            label={`Height (${dimensions.unit})`}
            type="number"
            min="1"
            step={dimensions.unit === 'px' ? '1' : '0.1'}
            value={dimensions.height || ''}
            onChange={(e) => handleHeightChange(e.target.value)}
            className="tabular-nums"
          />
        </div>
      </div>

      {/* Unit and DPI selectors */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <Select
          label="Unit"
          value={dimensions.unit}
          onChange={(e) => handleUnitChange(e.target.value as CanvasUnit)}
          options={[
            { value: 'in', label: 'Inches (in)' },
            { value: 'cm', label: 'Centimeters (cm)' },
            { value: 'mm', label: 'Millimeters (mm)' },
            { value: 'px', label: 'Pixels (px)' },
          ]}
        />

        <Select
          label="Resolution (DPI)"
          value={String(dimensions.dpi)}
          onChange={(e) => handleDpiChange(parseInt(e.target.value, 10))}
          options={[
            { value: '300', label: '300 DPI (Production Print)' },
            { value: '150', label: '150 DPI (Draft Proof)' },
            { value: '72', label: '72 DPI (Screen Preview)' },
          ]}
        />
      </div>

      {/* Computed Render Pixel info */}
      <div className="flex items-center justify-between px-2.5 py-2 rounded-sm bg-surface-subtle border border-border text-[11px] text-text-secondary">
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span>Output Render:</span>
        </span>
        <span className="font-mono font-medium text-text-primary tabular-nums">
          {pixelWidth} × {pixelHeight} px @ {dimensions.dpi} DPI
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 pt-1">
        <Button
          variant="primary"
          size="sm"
          className="w-full"
          onClick={handleApply}
          leftIcon={
            appliedNotification ? (
              <Check className="w-3.5 h-3.5 text-text-inverted" />
            ) : undefined
          }
        >
          {appliedNotification ? 'Canvas Updated!' : 'Apply Dimensions'}
        </Button>
      </div>
    </div>
  );
};
