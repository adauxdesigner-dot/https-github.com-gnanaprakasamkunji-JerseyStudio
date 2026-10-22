import * as React from 'react';
import {
  Maximize,
  Sliders,
  Undo2,
  Redo2,
  Layers,
  Shirt,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Dialog } from '@/components/ui/Dialog';
import {
  CanvasResizeControl,
  CanvasDimensions,
  CANVAS_PRESETS,
  CanvasUnit,
} from '@/components/ui/CanvasResizeControl';
import { GarmentView } from './editorTypes';

export interface CanvasDimensionBarProps {
  dimensions: CanvasDimensions;
  onDimensionsChange: (newDims: CanvasDimensions) => void;
  activeView: GarmentView;
  onViewChange: (view: GarmentView) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}

export const CanvasDimensionBar: React.FC<CanvasDimensionBarProps> = ({
  dimensions,
  onDimensionsChange,
  activeView,
  onViewChange,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}) => {
  const [isResizeDialogOpen, setIsResizeDialogOpen] = React.useState(false);

  // Quick preset apply
  const handleQuickPreset = (presetId: string) => {
    const preset = CANVAS_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    let w = preset.widthInInches;
    let h = preset.heightInInches;

    if (dimensions.unit === 'cm') {
      w = Number((w * 2.54).toFixed(1));
      h = Number((h * 2.54).toFixed(1));
    } else if (dimensions.unit === 'mm') {
      w = Math.round(w * 25.4);
      h = Math.round(h * 25.4);
    } else if (dimensions.unit === 'px') {
      w = Math.round(w * dimensions.dpi);
      h = Math.round(h * dimensions.dpi);
    }

    onDimensionsChange({
      ...dimensions,
      width: w,
      height: h,
    });
  };

  // Determine current preset name if matching
  const matchingPreset = CANVAS_PRESETS.find((p) => {
    let targetW = p.widthInInches;
    let targetH = p.heightInInches;
    if (dimensions.unit === 'in') {
      return Math.abs(dimensions.width - targetW) < 0.1 && Math.abs(dimensions.height - targetH) < 0.1;
    }
    return false;
  });

  return (
    <div className="h-12 bg-surface border-b border-border px-4 flex items-center justify-between shrink-0 select-none shadow-xs z-10">
      {/* ====================================================================
          LEFT: Garment View Switcher & Undo/Redo
          ==================================================================== */}
      <div className="flex items-center gap-3">
        {/* Front / Back Toggle Segmented Control */}
        <div className="flex items-center bg-surface-subtle p-0.5 rounded-md border border-border">
          <button
            type="button"
            onClick={() => onViewChange('front')}
            className={cn(
              'px-3 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-all',
              activeView === 'front'
                ? 'bg-surface text-primary shadow-xs'
                : 'text-text-secondary hover:text-text-primary'
            )}
          >
            <Shirt className="w-3.5 h-3.5" />
            Front View
          </button>
          <button
            type="button"
            onClick={() => onViewChange('back')}
            className={cn(
              'px-3 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-all',
              activeView === 'back'
                ? 'bg-surface text-primary shadow-xs'
                : 'text-text-secondary hover:text-text-primary'
            )}
          >
            <Shirt className="w-3.5 h-3.5 rotate-180" />
            Back View
          </button>
        </div>

        <div className="w-[1px] h-4 bg-border" />

        {/* Undo and Redo buttons */}
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            className="w-8 h-8 p-0"
            disabled={!canUndo}
            onClick={onUndo}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="w-8 h-8 p-0"
            disabled={!canRedo}
            onClick={onRedo}
            title="Redo (Ctrl+Shift+Z)"
          >
            <Redo2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* ====================================================================
          CENTER: Quick Preset Pills & Dimension Summary
          ==================================================================== */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-text-muted font-medium mr-1">Presets:</span>
        <div className="flex items-center gap-1">
          {['youth', 's', 'm', 'l', 'xl', 'xxl'].map((presetId) => {
            const p = CANVAS_PRESETS.find((item) => item.id === presetId);
            const isSelected = matchingPreset?.id === presetId;
            return (
              <button
                key={presetId}
                onClick={() => handleQuickPreset(presetId)}
                className={cn(
                  'px-2 py-0.5 text-xs font-medium rounded transition-colors uppercase',
                  isSelected
                    ? 'bg-primary text-white font-semibold shadow-xs'
                    : 'bg-surface-subtle hover:bg-surface-muted text-text-secondary hover:text-text-primary'
                )}
                title={p?.description}
              >
                {presetId}
              </button>
            );
          })}
        </div>

        <div className="w-[1px] h-4 bg-border mx-1" />

        {/* Live Canvas Dimension Pill */}
        <button
          onClick={() => setIsResizeDialogOpen(true)}
          className="flex items-center gap-2 px-2.5 py-1 rounded bg-surface-subtle hover:bg-surface-muted border border-border text-xs text-text-primary transition-colors group"
        >
          <span className="font-mono font-semibold">
            {dimensions.width} × {dimensions.height} {dimensions.unit}
          </span>
          <Badge variant="primary" size="sm" className="font-mono text-[10px] py-0 px-1">
            {dimensions.dpi} DPI
          </Badge>
          <Sliders className="w-3.5 h-3.5 text-text-muted group-hover:text-primary transition-colors" />
        </button>
      </div>

      {/* ====================================================================
          RIGHT: Sublimation Print-Ready Indicator
          ==================================================================== */}
      <div className="flex items-center gap-2">
        <Badge variant={dimensions.dpi >= 300 ? 'success' : 'warning'} size="sm">
          {dimensions.dpi >= 300 ? 'Print Ready (300 DPI)' : 'Proof Quality'}
        </Badge>
      </div>

      {/* ====================================================================
          CANVAS RESIZE DIALOG (Powered by CanvasResizeControl)
          ==================================================================== */}
      <Dialog
        isOpen={isResizeDialogOpen}
        onClose={() => setIsResizeDialogOpen(false)}
        title="Canvas Document Setup & Resizing"
        description="Configure physical garment size, print bed dimensions, unit measurement, and DPI."
        size="lg"
      >
        <div className="p-2">
          <CanvasResizeControl
            initialDimensions={dimensions}
            onApplyDimensions={(newDims) => {
              onDimensionsChange(newDims);
              setIsResizeDialogOpen(false);
            }}
          />
        </div>
      </Dialog>
    </div>
  );
};
