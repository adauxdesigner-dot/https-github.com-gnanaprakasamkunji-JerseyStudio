import * as React from 'react';
import {
  Sliders,
  Undo2,
  Redo2,
  Shirt,
  Maximize,
  Scissors,
  Layers,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Dialog } from '@/components/ui/Dialog';
import {
  CanvasResizeControl,
  CanvasDimensions,
  CANVAS_PRESETS,
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
  onAutoFitSelectedText?: () => void;
  hasSelectedText?: boolean;
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
  onAutoFitSelectedText,
  hasSelectedText = false,
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
    const targetW = p.widthInInches;
    const targetH = p.heightInInches;
    if (dimensions.unit === 'in') {
      return Math.abs(dimensions.width - targetW) < 0.1 && Math.abs(dimensions.height - targetH) < 0.1;
    }
    return false;
  });

  return (
    <div className="h-12 bg-surface border-b border-border px-4 flex items-center justify-between shrink-0 select-none shadow-xs z-10">
      {/* ====================================================================
          LEFT: Garment View Switcher: Back, Front, Half Sleeve (HS), Full Sleeve (FS)
          ==================================================================== */}
      <div className="flex items-center gap-3">
        {/* 4-Way View Switcher Segmented Control */}
        <div className="flex items-center bg-surface-subtle p-0.5 rounded-md border border-border">
          <button
            type="button"
            onClick={() => onViewChange('back')}
            className={cn(
              'px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-all',
              activeView === 'back'
                ? 'bg-surface text-primary shadow-xs font-bold'
                : 'text-text-secondary hover:text-text-primary'
            )}
            title="Back View: Player name and squad number layout"
          >
            <Shirt className="w-3.5 h-3.5 rotate-180" />
            Back
          </button>

          <button
            type="button"
            onClick={() => onViewChange('front')}
            className={cn(
              'px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-all',
              activeView === 'front'
                ? 'bg-surface text-primary shadow-xs font-bold'
                : 'text-text-secondary hover:text-text-primary'
            )}
            title="Front View: Team crest, sponsor bar, chest logo"
          >
            <Shirt className="w-3.5 h-3.5" />
            Front
          </button>

          <button
            type="button"
            onClick={() => onViewChange('half_sleeve')}
            className={cn(
              'px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-all',
              activeView === 'half_sleeve'
                ? 'bg-surface text-primary shadow-xs font-bold'
                : 'text-text-secondary hover:text-text-primary'
            )}
            title="Half Sleeve (HS): Short sleeve tournament badge & sleeve sponsors"
          >
            <Scissors className="w-3.5 h-3.5" />
            Half Sleeve (HS)
          </button>

          <button
            type="button"
            onClick={() => onViewChange('full_sleeve')}
            className={cn(
              'px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-all',
              activeView === 'full_sleeve'
                ? 'bg-surface text-primary shadow-xs font-bold'
                : 'text-text-secondary hover:text-text-primary'
            )}
            title="Full Sleeve (FS): Long sleeve sublimation panel & cuff stripes"
          >
            <Layers className="w-3.5 h-3.5" />
            Full Sleeve (FS)
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
            title="Undo (⌘Z / Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="w-8 h-8 p-0"
            disabled={!canRedo}
            onClick={onRedo}
            title="Redo (⇧⌘Z / Ctrl+Y)"
          >
            <Redo2 className="w-4 h-4" />
          </Button>
        </div>

        {/* Top "Fit to Boundary" text scaling button */}
        {hasSelectedText && onAutoFitSelectedText && (
          <>
            <div className="w-[1px] h-4 bg-border" />
            <Button
              size="sm"
              variant="outline"
              onClick={onAutoFitSelectedText}
              className="h-8 px-2.5 text-xs gap-1.5 font-bold border-primary/40 text-primary hover:bg-primary-subtle"
              title="Automatically scale lettering to fit safely inside the printable boundary"
            >
              <Maximize className="w-3.5 h-3.5" />
              Fit to Boundary
            </Button>
          </>
        )}
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
