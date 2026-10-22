import * as React from 'react';
import {
  Lock,
  Unlock,
  Copy,
  Trash2,
  AlignCenterHorizontal,
  AlignCenterVertical,
  AlignLeft,
  AlignRight,
  AlignTop,
  AlignBottom,
  Sparkles,
  Maximize,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { EditorElement } from './editorTypes';

export interface FloatingToolbarProps {
  element: EditorElement;
  canvasScale: number;
  zoom: number;
  pan: { x: number; y: number };
  onUpdateElement: (id: string, updates: Partial<EditorElement>) => void;
  onDuplicateElement: (id: string) => void;
  onDeleteElement: (id: string) => void;
  onAlignElement: (
    id: string,
    alignment: 'left' | 'center-h' | 'right' | 'top' | 'center-v' | 'bottom'
  ) => void;
  onAutoFitText?: (id: string) => void;
}

const QUICK_COLORS = [
  '#FFFFFF',
  '#000000',
  '#FFC72C', // Gold
  '#DC2626', // Red
  '#1D4ED8', // Royal
  '#0B2545', // Navy
  '#047857', // Emerald
  '#EA580C', // Orange
];

export const FloatingToolbar: React.FC<FloatingToolbarProps> = ({
  element,
  canvasScale,
  zoom,
  pan,
  onUpdateElement,
  onDuplicateElement,
  onDeleteElement,
  onAlignElement,
  onAutoFitText,
}) => {
  const [showColorPicker, setShowColorPicker] = React.useState(false);
  const [showAlignMenu, setShowAlignMenu] = React.useState(false);

  // Compute absolute screen position relative to canvas board
  // Bounding box in canvas coordinates:
  const elLeftPx = element.x * canvasScale;
  const elTopPx = element.y * canvasScale;
  const elWidthPx = element.width * canvasScale;

  const isTextElement = element.type === 'text' || element.type === 'dynamic_name' || element.type === 'dynamic_number';

  return (
    <div
      style={{
        left: `${elLeftPx + elWidthPx / 2}px`,
        top: `${Math.max(10, elTopPx - 44)}px`,
        transform: 'translateX(-50%)',
      }}
      className="absolute z-50 flex items-center gap-1 p-1 bg-surface/95 backdrop-blur-md rounded-lg border border-border shadow-xl select-none text-xs transition-opacity animate-in fade-in zoom-in-95 pointer-events-auto"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* Dynamic Key Identifier Badge */}
      {element.bindingKey && (
        <div className="flex items-center gap-1 pl-1.5 pr-2 py-0.5 border-r border-border text-[11px] font-mono text-primary font-bold">
          <Sparkles className="w-3 h-3 text-primary animate-pulse" />
          <span>{element.bindingKey === 'player_name' ? 'NAME' : 'NUM'}</span>
        </div>
      )}

      {/* Quick Color Picker Button */}
      <div className="relative">
        <button
          type="button"
          onClick={() => {
            setShowColorPicker(!showColorPicker);
            setShowAlignMenu(false);
          }}
          className="flex items-center gap-1 px-1.5 py-1 rounded hover:bg-surface-subtle transition-colors"
          title="Quick Color"
        >
          <div
            className="w-4 h-4 rounded-full border border-border shadow-xs"
            style={{ backgroundColor: element.fillColor }}
          />
          <ChevronDown className="w-3 h-3 text-text-muted" />
        </button>

        {showColorPicker && (
          <div className="absolute top-full left-0 mt-1 p-2 bg-surface rounded-lg border border-border shadow-xl z-50 grid grid-cols-4 gap-1.5 w-32">
            {QUICK_COLORS.map((hex) => (
              <button
                key={hex}
                type="button"
                onClick={() => {
                  onUpdateElement(element.id, { fillColor: hex });
                  setShowColorPicker(false);
                }}
                className={cn(
                  'w-6 h-6 rounded-full border border-border hover:scale-110 transition-transform shadow-xs',
                  element.fillColor === hex && 'ring-2 ring-primary ring-offset-1'
                )}
                style={{ backgroundColor: hex }}
              />
            ))}
          </div>
        )}
      </div>

      <div className="w-[1px] h-4 bg-border mx-0.5" />

      {/* Alignment Menu */}
      <div className="relative">
        <button
          type="button"
          onClick={() => {
            setShowAlignMenu(!showAlignMenu);
            setShowColorPicker(false);
          }}
          className="flex items-center gap-0.5 p-1 rounded hover:bg-surface-subtle text-text-secondary hover:text-text-primary transition-colors"
          title="Position Alignment"
        >
          <AlignCenterHorizontal className="w-3.5 h-3.5" />
          <ChevronDown className="w-2.5 h-2.5 text-text-muted" />
        </button>

        {showAlignMenu && (
          <div className="absolute top-full left-0 mt-1 p-1 bg-surface rounded-lg border border-border shadow-xl z-50 flex flex-col gap-0.5 min-w-36">
            <button
              type="button"
              onClick={() => {
                onAlignElement(element.id, 'center-h');
                setShowAlignMenu(false);
              }}
              className="flex items-center gap-2 px-2 py-1.5 rounded text-left hover:bg-surface-subtle text-xs text-text-primary"
            >
              <AlignCenterHorizontal className="w-3.5 h-3.5 text-primary" />
              Center Horizontal
            </button>
            <button
              type="button"
              onClick={() => {
                onAlignElement(element.id, 'center-v');
                setShowAlignMenu(false);
              }}
              className="flex items-center gap-2 px-2 py-1.5 rounded text-left hover:bg-surface-subtle text-xs text-text-primary"
            >
              <AlignCenterVertical className="w-3.5 h-3.5 text-primary" />
              Center Vertical
            </button>
            <div className="h-[1px] bg-border my-0.5" />
            <button
              type="button"
              onClick={() => {
                onAlignElement(element.id, 'left');
                setShowAlignMenu(false);
              }}
              className="flex items-center gap-2 px-2 py-1.5 rounded text-left hover:bg-surface-subtle text-xs text-text-primary"
            >
              <AlignLeft className="w-3.5 h-3.5 text-text-secondary" />
              Align Left
            </button>
            <button
              type="button"
              onClick={() => {
                onAlignElement(element.id, 'right');
                setShowAlignMenu(false);
              }}
              className="flex items-center gap-2 px-2 py-1.5 rounded text-left hover:bg-surface-subtle text-xs text-text-primary"
            >
              <AlignRight className="w-3.5 h-3.5 text-text-secondary" />
              Align Right
            </button>
            <button
              type="button"
              onClick={() => {
                onAlignElement(element.id, 'top');
                setShowAlignMenu(false);
              }}
              className="flex items-center gap-2 px-2 py-1.5 rounded text-left hover:bg-surface-subtle text-xs text-text-primary"
            >
              <AlignTop className="w-3.5 h-3.5 text-text-secondary" />
              Align Top
            </button>
            <button
              type="button"
              onClick={() => {
                onAlignElement(element.id, 'bottom');
                setShowAlignMenu(false);
              }}
              className="flex items-center gap-2 px-2 py-1.5 rounded text-left hover:bg-surface-subtle text-xs text-text-primary"
            >
              <AlignBottom className="w-3.5 h-3.5 text-text-secondary" />
              Align Bottom
            </button>
          </div>
        )}
      </div>

      {/* Auto-Fit Button (for Text) */}
      {isTextElement && onAutoFitText && (
        <button
          type="button"
          onClick={() => onAutoFitText(element.id)}
          className="px-2 py-1 rounded bg-primary-subtle text-primary hover:bg-primary hover:text-white font-semibold text-[11px] transition-colors flex items-center gap-1"
          title="Auto-Fit font size to bounding box"
        >
          <Maximize className="w-3 h-3" />
          Auto-Fit
        </button>
      )}

      {/* Lock / Unlock Toggle */}
      <button
        type="button"
        onClick={() => onUpdateElement(element.id, { locked: !element.locked })}
        className={cn(
          'p-1.5 rounded transition-colors',
          element.locked
            ? 'bg-warning-subtle text-warning hover:bg-warning hover:text-white'
            : 'text-text-secondary hover:bg-surface-subtle hover:text-text-primary'
        )}
        title={element.locked ? 'Unlock Element' : 'Lock Element'}
      >
        {element.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
      </button>

      {/* Duplicate Element */}
      <button
        type="button"
        onClick={() => onDuplicateElement(element.id)}
        className="p-1.5 rounded text-text-secondary hover:bg-surface-subtle hover:text-text-primary transition-colors"
        title="Duplicate Element (Ctrl+D)"
      >
        <Copy className="w-3.5 h-3.5" />
      </button>

      {/* Delete Element */}
      <button
        type="button"
        onClick={() => onDeleteElement(element.id)}
        className="p-1.5 rounded text-text-secondary hover:bg-danger-subtle hover:text-danger transition-colors"
        title="Delete Element (Backspace)"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
