import * as React from 'react';
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  AlertTriangle,
  Type,
  Compass,
  Square,
  Layers,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Switch } from '@/components/ui/Switch';
import { Badge } from '@/components/ui/Badge';
import {
  EditorElement,
  DynamicBindingKey,
  JerseyDesign,
} from './editorTypes';
import { getDimensionsInInches } from './exportEngine';

export interface PropertiesPanelProps {
  design: JerseyDesign;
  activeElement: EditorElement | null;
  onUpdateElement: (id: string, updates: Partial<EditorElement>) => void;
  onCommitHistory: () => void;
  onDeleteElement: (id: string) => void;
  onDuplicateElement: (id: string) => void;
  onAlignElement: (
    id: string,
    alignment: 'left' | 'center-h' | 'right' | 'top' | 'center-v' | 'bottom'
  ) => void;
  onOpenFontManager?: () => void;
  onAutoFitText?: (id: string) => void;
}

const QUICK_SWATCHES = [
  '#FFFFFF',
  '#000000',
  '#FFC72C', // Athletic Gold
  '#DC2626', // Scarlet Red
  '#1D4ED8', // Royal Blue
  '#0B2545', // Navy
  '#047857', // Emerald Green
  '#EA580C', // Orange
];

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  design,
  activeElement,
  onUpdateElement,
  onCommitHistory,
  onDeleteElement,
  onDuplicateElement,
  onAlignElement,
  onOpenFontManager,
  onAutoFitText,
}) => {
  const { widthInches, heightInches } = getDimensionsInInches(design.dimensions);

  // If no element is selected, display Canvas & Production Overview
  if (!activeElement) {
    const totalElements = design.elements.length;
    const dynamicElements = design.elements.filter((el) => el.bindingKey).length;
    const isPrintReadyDpi = design.dimensions.dpi >= 300;

    return (
      <aside className="w-80 bg-surface border-l border-border flex flex-col shrink-0 select-none shadow-xs p-4 overflow-y-auto space-y-6">
        <div>
          <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-1">
            Canvas Document
          </h3>
          <p className="text-xs text-text-secondary">
            Select an element on the canvas to configure typography, effects, colors, and positioning.
          </p>
        </div>

        {/* Document Stats Box */}
        <div className="bg-surface-subtle rounded-md border border-border p-3.5 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-text-secondary">Garment Size</span>
            <span className="font-semibold text-text-primary">
              {widthInches}" × {heightInches}"
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-text-secondary">Current View</span>
            <Badge variant="primary" size="sm" className="uppercase font-mono">
              {design.activeView.replace('_', ' ')}
            </Badge>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-text-secondary">Sublimation DPI</span>
            <span className="font-mono font-semibold text-text-primary">
              {design.dimensions.dpi} DPI
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-text-secondary">Active Layers</span>
            <span className="font-semibold text-text-primary">{totalElements} elements</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-text-secondary">Dynamic Personalization</span>
            <span className="font-semibold text-primary">{dynamicElements} fields</span>
          </div>
        </div>

        {/* Sublimation Readiness Audit */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold text-text-primary uppercase tracking-wider">
            Production Readiness
          </span>
          <div
            className={cn(
              'p-3 rounded-md border text-xs flex items-start gap-2.5',
              isPrintReadyDpi
                ? 'bg-success-subtle/40 border-success/30 text-success'
                : 'bg-warning-subtle/40 border-warning/30 text-warning'
            )}
          >
            {isPrintReadyDpi ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            )}
            <div>
              <div className="font-bold">
                {isPrintReadyDpi ? '300 DPI Dye Sublimation Standard' : 'Low Resolution Warning'}
              </div>
              <div className="text-[11px] text-text-secondary mt-0.5">
                {isPrintReadyDpi
                  ? 'Canvas matches dye sublimation print bed specifications for vector crispness.'
                  : 'Recommended DPI for sportswear production is 300 DPI.'}
              </div>
            </div>
          </div>
        </div>
      </aside>
    );
  }

  const isTextElement =
    activeElement.type === 'text' ||
    activeElement.type === 'dynamic_name' ||
    activeElement.type === 'dynamic_number';

  const isImageElement = activeElement.type === 'image';

  return (
    <aside className="w-80 bg-surface border-l border-border flex flex-col shrink-0 select-none shadow-xs overflow-hidden">
      {/* Element Header */}
      <div className="p-3 border-b border-border bg-surface-subtle/60 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 truncate">
          <span className="w-2.5 h-2.5 rounded-full bg-primary shrink-0" />
          <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider truncate">
            {activeElement.name}
          </h3>
        </div>
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            className="w-7 h-7 p-0"
            onClick={() => onDuplicateElement(activeElement.id)}
            title="Duplicate Layer"
          >
            <Copy className="w-3.5 h-3.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="w-7 h-7 p-0 text-danger hover:text-danger hover:bg-danger-subtle"
            onClick={() => onDeleteElement(activeElement.id)}
            title="Delete Layer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Scrollable Properties Body */}
      <div className="p-4 overflow-y-auto space-y-5 flex-1 text-xs">
        {/* Alignment Toolbar */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-text-primary uppercase tracking-wider block">
            Canvas Alignment
          </label>
          <div className="grid grid-cols-6 gap-1 bg-surface-subtle p-1 rounded-md border border-border">
            <button
              type="button"
              onClick={() => onAlignElement(activeElement.id, 'left')}
              className="p-1.5 rounded hover:bg-surface text-text-secondary hover:text-text-primary flex items-center justify-center transition-colors"
              title="Align Left"
            >
              <AlignLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onAlignElement(activeElement.id, 'center-h')}
              className="p-1.5 rounded hover:bg-surface text-text-secondary hover:text-text-primary flex items-center justify-center transition-colors"
              title="Align Horizontal Center"
            >
              <AlignCenter className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onAlignElement(activeElement.id, 'right')}
              className="p-1.5 rounded hover:bg-surface text-text-secondary hover:text-text-primary flex items-center justify-center transition-colors"
              title="Align Right"
            >
              <AlignRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onAlignElement(activeElement.id, 'top')}
              className="p-1.5 rounded hover:bg-surface text-text-secondary hover:text-text-primary flex items-center justify-center transition-colors"
              title="Align Top"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onAlignElement(activeElement.id, 'center-v')}
              className="p-1.5 rounded hover:bg-surface text-text-secondary hover:text-text-primary flex items-center justify-center transition-colors"
              title="Align Vertical Center"
            >
              <AlignJustify className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onAlignElement(activeElement.id, 'bottom')}
              className="p-1.5 rounded hover:bg-surface text-text-secondary hover:text-text-primary flex items-center justify-center transition-colors"
              title="Align Bottom"
            >
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* ====================================================================
            TEXT TYPOGRAPHY (For Text Elements)
            ==================================================================== */}
        {isTextElement && (
          <div className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-text-primary uppercase tracking-wider block">
                Text / Preview Content
              </label>
              <Input
                value={activeElement.text}
                onChange={(e) => {
                  onUpdateElement(activeElement.id, { text: e.target.value });
                }}
                onBlur={onCommitHistory}
                placeholder="Enter text..."
              />
            </div>

            {/* Dynamic Binding selector */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-text-primary uppercase tracking-wider block">
                Dynamic Roster Binding
              </label>
              <Select
                value={activeElement.bindingKey || 'none'}
                onChange={(e) => {
                  const val = e.target.value;
                  const key = val === 'none' ? undefined : (val as DynamicBindingKey);
                  onUpdateElement(activeElement.id, {
                    bindingKey: key,
                    type:
                      key === 'player_name'
                        ? 'dynamic_name'
                        : key === 'player_number'
                        ? 'dynamic_number'
                        : 'text',
                  });
                  onCommitHistory();
                }}
                options={[
                  { value: 'none', label: 'None (Static Text)' },
                  { value: 'player_name', label: 'Player Name {player_name}' },
                  { value: 'player_number', label: 'Player Number {player_number}' },
                ]}
              />
            </div>

            {/* Font Family Row + Font Manager Trigger Button */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-text-primary uppercase tracking-wider">
                  Font Family
                </label>
                {onOpenFontManager && (
                  <button
                    type="button"
                    onClick={onOpenFontManager}
                    className="text-[11px] text-primary hover:underline font-semibold flex items-center gap-1"
                  >
                    <Type className="w-3 h-3" />
                    Font Manager
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={activeElement.fontFamily}
                  onClick={onOpenFontManager}
                  className="flex-1 h-8 rounded border border-border bg-surface px-2.5 text-xs font-semibold cursor-pointer text-text-primary hover:border-primary transition-colors"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onOpenFontManager}
                  className="h-8 px-2 text-xs"
                >
                  Browse
                </Button>
              </div>
            </div>

            {/* Font Size & Auto-Fit */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-text-primary uppercase tracking-wider block">
                    Font Size
                  </label>
                  {onAutoFitText && (
                    <button
                      type="button"
                      onClick={() => onAutoFitText(activeElement.id)}
                      className="text-[10px] text-primary hover:underline font-bold"
                      title="Scale font size to fit bounding box perfectly"
                    >
                      Auto-Fit
                    </button>
                  )}
                </div>
                <Input
                  type="number"
                  min={8}
                  max={280}
                  value={activeElement.fontSize}
                  onChange={(e) => {
                    const val = Number(e.target.value) || 12;
                    onUpdateElement(activeElement.id, { fontSize: val });
                  }}
                  onBlur={onCommitHistory}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-text-primary uppercase tracking-wider block">
                  Alignment
                </label>
                <div className="flex bg-surface-subtle p-0.5 rounded border border-border h-8">
                  {(['left', 'center', 'right'] as const).map((align) => (
                    <button
                      key={align}
                      type="button"
                      onClick={() => {
                        onUpdateElement(activeElement.id, { textAlign: align });
                        onCommitHistory();
                      }}
                      className={cn(
                        'flex-1 py-0.5 text-xs rounded transition-all capitalize',
                        activeElement.textAlign === align
                          ? 'bg-surface text-primary font-bold shadow-xs'
                          : 'text-text-secondary hover:text-text-primary'
                      )}
                    >
                      {align}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Casing & Letter Spacing */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-text-primary uppercase tracking-wider block">
                  Casing
                </label>
                <Select
                  value={activeElement.textTransform || 'none'}
                  onChange={(e) => {
                    onUpdateElement(activeElement.id, {
                      textTransform: e.target.value as 'uppercase' | 'none' | 'lowercase',
                    });
                    onCommitHistory();
                  }}
                  options={[
                    { value: 'none', label: 'As Typed' },
                    { value: 'uppercase', label: 'UPPERCASE' },
                    { value: 'lowercase', label: 'lowercase' },
                  ]}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-text-primary uppercase tracking-wider block">
                  Spacing
                </label>
                <Input
                  type="number"
                  min={-5}
                  max={40}
                  value={activeElement.letterSpacing || 0}
                  onChange={(e) => {
                    onUpdateElement(activeElement.id, {
                      letterSpacing: Number(e.target.value) || 0,
                    });
                  }}
                  onBlur={onCommitHistory}
                />
              </div>
            </div>
          </div>
        )}

        {/* IMAGE ELEMENT PROPERTIES */}
        {isImageElement && (
          <div className="p-3 bg-surface-subtle rounded-md border border-border space-y-2">
            <span className="text-[11px] font-bold text-text-primary uppercase tracking-wider block">
              Logo / Graphic Asset
            </span>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded bg-surface border border-border flex items-center justify-center p-1 overflow-hidden shrink-0">
                <img
                  src={activeElement.imageSrc}
                  alt={activeElement.name}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <div className="overflow-hidden">
                <div className="font-semibold text-text-primary truncate">{activeElement.name}</div>
                <div className="text-[10px] text-text-muted truncate font-mono">
                  {activeElement.imageFileName || 'Imported Graphic'}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="h-[1px] bg-border" />

        {/* ====================================================================
            EFFECT 1: CURVED / ARC TEXT (Feature 1)
            ==================================================================== */}
        {isTextElement && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-primary" />
                <label className="text-[11px] font-bold text-text-primary uppercase tracking-wider">
                  Curved / Arc Text
                </label>
              </div>
              <Switch
                checked={activeElement.curvedTextEnabled ?? false}
                onChange={(checked: boolean) => {
                  onUpdateElement(activeElement.id, {
                    curvedTextEnabled: checked,
                    curvePower: activeElement.curvePower ?? 50,
                    curveDirection: activeElement.curveDirection ?? 'up',
                  });
                  onCommitHistory();
                }}
              />
            </div>

            {activeElement.curvedTextEnabled && (
              <div className="space-y-3 p-3 rounded-md bg-surface-subtle border border-border">
                {/* Arc Direction */}
                <div className="space-y-1">
                  <span className="text-[10px] text-text-muted uppercase font-bold">Arc Curve Direction</span>
                  <div className="flex bg-surface p-0.5 rounded border border-border">
                    <button
                      type="button"
                      onClick={() => {
                        onUpdateElement(activeElement.id, { curveDirection: 'up' });
                        onCommitHistory();
                      }}
                      className={cn(
                        'flex-1 py-1 text-xs rounded transition-all font-semibold',
                        activeElement.curveDirection !== 'down'
                          ? 'bg-primary text-white shadow-xs'
                          : 'text-text-secondary hover:text-text-primary'
                      )}
                    >
                      Arch Up (Rainbow)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onUpdateElement(activeElement.id, { curveDirection: 'down' });
                        onCommitHistory();
                      }}
                      className={cn(
                        'flex-1 py-1 text-xs rounded transition-all font-semibold',
                        activeElement.curveDirection === 'down'
                          ? 'bg-primary text-white shadow-xs'
                          : 'text-text-secondary hover:text-text-primary'
                      )}
                    >
                      Arch Down (Smile)
                    </button>
                  </div>
                </div>

                {/* Curvature Power Slider (0 to 100) */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-text-secondary">
                    <span className="font-semibold text-text-primary">Curvature Power</span>
                    <span className="font-mono font-bold text-primary">
                      {activeElement.curvePower ?? 50}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={activeElement.curvePower ?? 50}
                    onChange={(e) => {
                      onUpdateElement(activeElement.id, {
                        curvePower: Number(e.target.value),
                      });
                    }}
                    onMouseUp={onCommitHistory}
                    className="w-full accent-primary"
                  />
                  <div className="flex justify-between text-[10px] text-text-muted">
                    <span>Flat (0%)</span>
                    <span>Gentle (50%)</span>
                    <span>Max Arch (100%)</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ====================================================================
            EFFECT 2: TEXT STROKE & CORNER JOINS (Feature 1)
            ==================================================================== */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold text-text-primary uppercase tracking-wider">
              Outline / Stroke
            </label>
            <Switch
              checked={activeElement.strokeEnabled ?? false}
              onChange={(checked: boolean) => {
                onUpdateElement(activeElement.id, {
                  strokeEnabled: checked,
                  strokeWidth: activeElement.strokeWidth ?? 3,
                  strokeColor: activeElement.strokeColor ?? '#000000',
                  strokeJoin: activeElement.strokeJoin ?? 'round',
                });
                onCommitHistory();
              }}
            />
          </div>

          {activeElement.strokeEnabled && (
            <div className="space-y-3 p-3 rounded-md bg-surface-subtle border border-border">
              {/* Stroke Color */}
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={activeElement.strokeColor || '#000000'}
                  onChange={(e) => {
                    onUpdateElement(activeElement.id, { strokeColor: e.target.value });
                  }}
                  onBlur={onCommitHistory}
                  className="w-8 h-8 rounded border border-border cursor-pointer p-0.5"
                />
                <span className="font-mono text-xs uppercase font-semibold">
                  {activeElement.strokeColor || '#000000'}
                </span>
              </div>

              {/* Stroke Thickness Spinner / Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-text-secondary">
                  <span>Stroke Thickness</span>
                  <span className="font-mono font-bold text-text-primary">
                    {activeElement.strokeWidth || 1} pt
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={24}
                  value={activeElement.strokeWidth || 1}
                  onChange={(e) => {
                    onUpdateElement(activeElement.id, {
                      strokeWidth: Number(e.target.value),
                    });
                  }}
                  onMouseUp={onCommitHistory}
                  className="w-full accent-primary"
                />
              </div>

              {/* Stroke Corner Joins: Miter, Bevel, Round */}
              <div className="space-y-1">
                <span className="text-[10px] text-text-muted uppercase font-bold">Corner Joins</span>
                <div className="flex bg-surface p-0.5 rounded border border-border">
                  {(['miter', 'bevel', 'round'] as const).map((join) => {
                    const isSelected = (activeElement.strokeJoin || 'round') === join;
                    return (
                      <button
                        key={join}
                        type="button"
                        onClick={() => {
                          onUpdateElement(activeElement.id, { strokeJoin: join });
                          onCommitHistory();
                        }}
                        className={cn(
                          'flex-1 py-1 text-xs rounded transition-all capitalize font-medium',
                          isSelected
                            ? 'bg-primary text-white font-bold shadow-xs'
                            : 'text-text-secondary hover:text-text-primary'
                        )}
                      >
                        {join}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ====================================================================
            EFFECT 3: TEXT BOX BACKGROUND (Feature 1)
            ==================================================================== */}
        {isTextElement && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Square className="w-3.5 h-3.5 text-primary" />
                <label className="text-[11px] font-bold text-text-primary uppercase tracking-wider">
                  Text Box Background
                </label>
              </div>
              <Switch
                checked={activeElement.bgEnabled ?? false}
                onChange={(checked: boolean) => {
                  onUpdateElement(activeElement.id, {
                    bgEnabled: checked,
                    bgColor: activeElement.bgColor ?? '#000000',
                    bgOpacity: activeElement.bgOpacity ?? 0.85,
                    bgCornerRadius: activeElement.bgCornerRadius ?? 8,
                    bgPadding: activeElement.bgPadding ?? 12,
                  });
                  onCommitHistory();
                }}
              />
            </div>

            {activeElement.bgEnabled && (
              <div className="space-y-3 p-3 rounded-md bg-surface-subtle border border-border">
                {/* Background Color & Opacity */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={activeElement.bgColor || '#000000'}
                      onChange={(e) => {
                        onUpdateElement(activeElement.id, { bgColor: e.target.value });
                      }}
                      onBlur={onCommitHistory}
                      className="w-8 h-8 rounded border border-border cursor-pointer p-0.5"
                    />
                    <span className="font-mono text-xs uppercase font-semibold">
                      {activeElement.bgColor || '#000000'}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-text-muted">Opacity</span>
                    <span className="font-mono font-bold block text-text-primary">
                      {Math.round((activeElement.bgOpacity ?? 0.85) * 100)}%
                    </span>
                  </div>
                </div>

                {/* Opacity Slider */}
                <div className="space-y-1">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={Math.round((activeElement.bgOpacity ?? 0.85) * 100)}
                    onChange={(e) => {
                      onUpdateElement(activeElement.id, {
                        bgOpacity: Number(e.target.value) / 100,
                      });
                    }}
                    onMouseUp={onCommitHistory}
                    className="w-full accent-primary"
                  />
                </div>

                {/* Corner Radius (0 - 50) */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-text-secondary">
                    <span>Corner Radius (0 - 50px)</span>
                    <span className="font-mono font-bold text-text-primary">
                      {activeElement.bgCornerRadius ?? 8}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={50}
                    value={activeElement.bgCornerRadius ?? 8}
                    onChange={(e) => {
                      onUpdateElement(activeElement.id, {
                        bgCornerRadius: Number(e.target.value),
                      });
                    }}
                    onMouseUp={onCommitHistory}
                    className="w-full accent-primary"
                  />
                </div>

                {/* Padding (0 - 50) */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-text-secondary">
                    <span>Background Padding (0 - 50px)</span>
                    <span className="font-mono font-bold text-text-primary">
                      {activeElement.bgPadding ?? 12}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={50}
                    value={activeElement.bgPadding ?? 12}
                    onChange={(e) => {
                      onUpdateElement(activeElement.id, {
                        bgPadding: Number(e.target.value),
                      });
                    }}
                    onMouseUp={onCommitHistory}
                    className="w-full accent-primary"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* ====================================================================
            EFFECT 4: DROP SHADOW (Feature 1)
            ==================================================================== */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-primary" />
              <label className="text-[11px] font-bold text-text-primary uppercase tracking-wider">
                Drop Shadow
              </label>
            </div>
            <Switch
              checked={activeElement.shadowEnabled ?? false}
              onChange={(checked: boolean) => {
                onUpdateElement(activeElement.id, {
                  shadowEnabled: checked,
                  shadowColor: activeElement.shadowColor ?? '#000000',
                  shadowBlur: activeElement.shadowBlur ?? 8,
                  shadowOffsetX: activeElement.shadowOffsetX ?? 4,
                  shadowOffsetY: activeElement.shadowOffsetY ?? 4,
                  shadowOpacity: activeElement.shadowOpacity ?? 0.6,
                });
                onCommitHistory();
              }}
            />
          </div>

          {activeElement.shadowEnabled && (
            <div className="space-y-3 p-3 rounded-md bg-surface-subtle border border-border">
              {/* Shadow Color & Opacity */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={activeElement.shadowColor || '#000000'}
                    onChange={(e) => {
                      onUpdateElement(activeElement.id, { shadowColor: e.target.value });
                    }}
                    onBlur={onCommitHistory}
                    className="w-8 h-8 rounded border border-border cursor-pointer p-0.5"
                  />
                  <span className="font-mono text-xs uppercase font-semibold">
                    {activeElement.shadowColor || '#000000'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-text-muted">Opacity</span>
                  <span className="font-mono font-bold block text-text-primary">
                    {Math.round((activeElement.shadowOpacity ?? 0.6) * 100)}%
                  </span>
                </div>
              </div>

              {/* Shadow Opacity Slider */}
              <input
                type="range"
                min={0}
                max={100}
                value={Math.round((activeElement.shadowOpacity ?? 0.6) * 100)}
                onChange={(e) => {
                  onUpdateElement(activeElement.id, {
                    shadowOpacity: Number(e.target.value) / 100,
                  });
                }}
                onMouseUp={onCommitHistory}
                className="w-full accent-primary"
              />

              {/* Shadow Blur Slider (0 to 50) */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-text-secondary">
                  <span>Blur Radius</span>
                  <span className="font-mono font-bold text-text-primary">
                    {activeElement.shadowBlur ?? 8}px
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={50}
                  value={activeElement.shadowBlur ?? 8}
                  onChange={(e) => {
                    onUpdateElement(activeElement.id, {
                      shadowBlur: Number(e.target.value),
                    });
                  }}
                  onMouseUp={onCommitHistory}
                  className="w-full accent-primary"
                />
              </div>

              {/* Shadow Offset X & Y (-50 to +50) */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-text-secondary">
                    <span>Offset X</span>
                    <span className="font-mono font-bold">{activeElement.shadowOffsetX ?? 4}px</span>
                  </div>
                  <input
                    type="range"
                    min={-50}
                    max={50}
                    value={activeElement.shadowOffsetX ?? 4}
                    onChange={(e) => {
                      onUpdateElement(activeElement.id, {
                        shadowOffsetX: Number(e.target.value),
                      });
                    }}
                    onMouseUp={onCommitHistory}
                    className="w-full accent-primary"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-text-secondary">
                    <span>Offset Y</span>
                    <span className="font-mono font-bold">{activeElement.shadowOffsetY ?? 4}px</span>
                  </div>
                  <input
                    type="range"
                    min={-50}
                    max={50}
                    value={activeElement.shadowOffsetY ?? 4}
                    onChange={(e) => {
                      onUpdateElement(activeElement.id, {
                        shadowOffsetY: Number(e.target.value),
                      });
                    }}
                    onMouseUp={onCommitHistory}
                    className="w-full accent-primary"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="h-[1px] bg-border" />

        {/* ====================================================================
            FILL COLOR & SWATCHES
            ==================================================================== */}
        {!isImageElement && (
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-text-primary uppercase tracking-wider block">
              Fill Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={activeElement.fillColor}
                onChange={(e) => {
                  onUpdateElement(activeElement.id, { fillColor: e.target.value });
                }}
                onBlur={onCommitHistory}
                className="w-8 h-8 rounded border border-border cursor-pointer p-0.5"
              />
              <span className="font-mono text-xs uppercase font-semibold">{activeElement.fillColor}</span>
            </div>

            {/* Quick Swatches */}
            <div className="grid grid-cols-8 gap-1 pt-1">
              {QUICK_SWATCHES.map((hex) => (
                <button
                  key={hex}
                  type="button"
                  onClick={() => {
                    onUpdateElement(activeElement.id, { fillColor: hex });
                    onCommitHistory();
                  }}
                  style={{ backgroundColor: hex }}
                  className={cn(
                    'w-6 h-6 rounded border border-border/80 transition-transform hover:scale-110 shadow-xs',
                    activeElement.fillColor.toLowerCase() === hex.toLowerCase() &&
                      'ring-2 ring-primary ring-offset-1'
                  )}
                />
              ))}
            </div>
          </div>
        )}

        <div className="h-[1px] bg-border" />

        {/* ====================================================================
            PHYSICAL POSITION & BOUNDS (Inches)
            ==================================================================== */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-text-primary uppercase tracking-wider block">
            Position & Size (Inches)
          </label>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-[10px] text-text-muted">X (Left)</span>
              <Input
                type="number"
                step={0.1}
                value={activeElement.x}
                onChange={(e) => {
                  onUpdateElement(activeElement.id, { x: Number(e.target.value) || 0 });
                }}
                onBlur={onCommitHistory}
              />
            </div>
            <div>
              <span className="text-[10px] text-text-muted">Y (Top)</span>
              <Input
                type="number"
                step={0.1}
                value={activeElement.y}
                onChange={(e) => {
                  onUpdateElement(activeElement.id, { y: Number(e.target.value) || 0 });
                }}
                onBlur={onCommitHistory}
              />
            </div>
            <div>
              <span className="text-[10px] text-text-muted">Width</span>
              <Input
                type="number"
                step={0.1}
                value={activeElement.width}
                onChange={(e) => {
                  onUpdateElement(activeElement.id, { width: Number(e.target.value) || 1 });
                }}
                onBlur={onCommitHistory}
              />
            </div>
            <div>
              <span className="text-[10px] text-text-muted">Height</span>
              <Input
                type="number"
                step={0.1}
                value={activeElement.height}
                onChange={(e) => {
                  onUpdateElement(activeElement.id, { height: Number(e.target.value) || 1 });
                }}
                onBlur={onCommitHistory}
              />
            </div>
          </div>
        </div>

        {/* Rotation & Opacity */}
        <div className="space-y-3">
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-text-secondary">
              <span>Rotation</span>
              <span className="font-mono font-bold">{activeElement.rotation || 0}°</span>
            </div>
            <input
              type="range"
              min={0}
              max={360}
              value={activeElement.rotation || 0}
              onChange={(e) => {
                onUpdateElement(activeElement.id, { rotation: Number(e.target.value) });
              }}
              onMouseUp={onCommitHistory}
              className="w-full accent-primary"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs text-text-secondary">
              <span>Overall Layer Opacity</span>
              <span className="font-mono font-bold">
                {Math.round((activeElement.opacity ?? 1) * 100)}%
              </span>
            </div>
            <input
              type="range"
              min={10}
              max={100}
              value={Math.round((activeElement.opacity ?? 1) * 100)}
              onChange={(e) => {
                onUpdateElement(activeElement.id, { opacity: Number(e.target.value) / 100 });
              }}
              onMouseUp={onCommitHistory}
              className="w-full accent-primary"
            />
          </div>
        </div>
      </div>
    </aside>
  );
};
