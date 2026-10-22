import * as React from 'react';
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Maximize,
  Sliders,
  Type,
  Palette,
  Sparkles,
  Lock,
  Unlock,
  Trash2,
  Copy,
  Layers,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  AlertTriangle,
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
}

const ATHLETIC_FONTS = [
  { value: 'Impact', label: 'Impact (Varsity Bold)' },
  { value: 'Inter', label: 'Inter (Clean Sans)' },
  { value: 'Oswald', label: 'Oswald (Athletic Block)' },
  { value: 'Bebas Neue', label: 'Bebas Neue (Jersey Condensed)' },
  { value: 'Montserrat', label: 'Montserrat (Modern Sport)' },
  { value: 'Arial', label: 'Arial (Classic Sans)' },
  { value: 'Courier New', label: 'Courier New (Technical Monospace)' },
];

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
            Select an element on the canvas to configure typography, colors, and positioning.
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
              {design.activeView}
            </Badge>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-text-secondary">Print Resolution</span>
            <span className="font-mono font-semibold text-text-primary">
              {design.dimensions.dpi} DPI
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-text-secondary">Pixel Dimensions</span>
            <span className="font-mono text-text-primary text-[11px]">
              {Math.round(widthInches * design.dimensions.dpi)} ×{' '}
              {Math.round(heightInches * design.dimensions.dpi)} px
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-text-secondary">Layers</span>
            <span className="font-mono text-text-primary">
              {totalElements} total ({dynamicElements} dynamic)
            </span>
          </div>
        </div>

        {/* Dye Sublimation Production Checklist */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">
            Production Readiness
          </h4>

          <div className="space-y-2">
            <div className="flex items-start gap-2.5 p-2.5 rounded-md border border-border bg-surface">
              {isPrintReadyDpi ? (
                <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
              )}
              <div>
                <div className="text-xs font-semibold text-text-primary">
                  {isPrintReadyDpi ? '300 DPI Dye Sublimation' : 'Resolution Under 300 DPI'}
                </div>
                <div className="text-[11px] text-text-secondary leading-tight">
                  {isPrintReadyDpi
                    ? 'Artwork rendered at native high resolution for dye sublimation printers.'
                    : 'Consider setting canvas DPI to 300 before final printing export.'}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2.5 rounded-md border border-border bg-surface">
              <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-semibold text-text-primary">
                  Local-First Offline Storage
                </div>
                <div className="text-[11px] text-text-secondary leading-tight">
                  All rendering occurs 100% locally on your machine with zero cloud leaks.
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    );
  }

  // Active Element Selected -> Display Full Properties Inspector
  const isTextElement = activeElement.type !== 'shape';

  return (
    <aside className="w-80 bg-surface border-l border-border flex flex-col shrink-0 select-none shadow-xs overflow-y-auto">
      {/* ====================================================================
          HEADER: ELEMENT IDENTITY & ACTIONS
          ==================================================================== */}
      <div className="p-3.5 border-b border-border flex items-center justify-between bg-surface-subtle/50">
        <div className="overflow-hidden mr-2">
          <div className="text-xs font-bold text-text-primary truncate">
            {activeElement.name}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            {activeElement.bindingKey ? (
              <Badge variant="primary" size="sm" className="text-[10px] py-0 px-1 font-mono">
                Dynamic: {activeElement.bindingKey}
              </Badge>
            ) : (
              <span className="text-[10px] text-text-muted capitalize">
                {activeElement.type} element
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <Button
            size="sm"
            variant="ghost"
            className="w-7 h-7 p-0"
            onClick={() => onDuplicateElement(activeElement.id)}
            title="Duplicate Element"
          >
            <Copy className="w-3.5 h-3.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="w-7 h-7 p-0 hover:text-error"
            onClick={() => onDeleteElement(activeElement.id)}
            title="Delete Element"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-5">
        {/* ====================================================================
            QUICK ALIGNMENT TOOLBAR
            ==================================================================== */}
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
            TEXT CONTENT & BINDINGS (For Text Elements)
            ==================================================================== */}
        {isTextElement && (
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-text-primary uppercase tracking-wider block">
                Text / Preview Value
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
                    type: key === 'player_name' ? 'dynamic_name' : key === 'player_number' ? 'dynamic_number' : 'text',
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

            {/* Font Family */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-text-primary uppercase tracking-wider block">
                Font Family
              </label>
              <Select
                value={activeElement.fontFamily}
                onChange={(e) => {
                  onUpdateElement(activeElement.id, { fontFamily: e.target.value });
                  onCommitHistory();
                }}
                options={ATHLETIC_FONTS}
              />
            </div>

            {/* Font Size & Weight */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-text-primary uppercase tracking-wider block">
                  Font Size (pt)
                </label>
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
                  Text Alignment
                </label>
                <div className="flex bg-surface-subtle p-0.5 rounded border border-border">
                  {(['left', 'center', 'right'] as const).map((align) => (
                    <button
                      key={align}
                      type="button"
                      onClick={() => {
                        onUpdateElement(activeElement.id, { textAlign: align });
                        onCommitHistory();
                      }}
                      className={cn(
                        'flex-1 py-1 text-xs rounded transition-all capitalize',
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

            {/* Text Transform & Letter Spacing */}
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
                  Letter Spacing
                </label>
                <Input
                  type="number"
                  min={0}
                  max={20}
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

        <div className="h-[1px] bg-border" />

        {/* ====================================================================
            FILL COLOR & SWATCHES
            ==================================================================== */}
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
            <span className="font-mono text-xs uppercase">{activeElement.fillColor}</span>
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
                  activeElement.fillColor.toLowerCase() === hex.toLowerCase() && 'ring-2 ring-primary ring-offset-1'
                )}
              />
            ))}
          </div>
        </div>

        {/* ====================================================================
            STROKE & OUTLINE
            ==================================================================== */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold text-text-primary uppercase tracking-wider">
              Border / Stroke
            </label>
            <Switch
              checked={activeElement.strokeEnabled ?? false}
              onChange={(checked) => {
                onUpdateElement(activeElement.id, { strokeEnabled: checked });
                onCommitHistory();
              }}
            />
          </div>

          {activeElement.strokeEnabled && (
            <div className="space-y-2 pt-1">
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
                <span className="font-mono text-xs uppercase">
                  {activeElement.strokeColor || '#000000'}
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs text-text-secondary">
                  <span>Stroke Width</span>
                  <span className="font-mono">{activeElement.strokeWidth || 1} pt</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={16}
                  value={activeElement.strokeWidth || 1}
                  onChange={(e) => {
                    onUpdateElement(activeElement.id, {
                      strokeWidth: Number(e.target.value),
                    });
                  }}
                  onMouseUp={onCommitHistory}
                  className="w-full"
                />
              </div>
            </div>
          )}
        </div>

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

        {/* Rotation */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-text-secondary">
            <span>Rotation</span>
            <span className="font-mono">{activeElement.rotation || 0}°</span>
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
            className="w-full"
          />
        </div>
      </div>
    </aside>
  );
};
