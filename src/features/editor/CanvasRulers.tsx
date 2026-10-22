import * as React from 'react';
import { cn } from '@/lib/utils';
import { EditorElement } from './editorTypes';

export interface CanvasRulersProps {
  canvasWidthInches: number;
  canvasHeightInches: number;
  scale: number; // pixels per inch at 100% zoom (e.g. 40)
  zoom: number;
  pan: { x: number; y: number };
  containerWidth: number;
  containerHeight: number;
  activeElement: EditorElement | null;
  unit: 'in' | 'cm';
  onUnitChange: (unit: 'in' | 'cm') => void;
}

const RULER_THICKNESS = 22; // px

export const CanvasRulers: React.FC<CanvasRulersProps> = ({
  canvasWidthInches,
  canvasHeightInches,
  scale,
  zoom,
  pan,
  containerWidth,
  containerHeight,
  activeElement,
  unit,
  onUnitChange,
}) => {
  // Convert physical values
  // In canvas coordinate system:
  // (0,0) of canvas board is at:
  // screenX = containerWidth/2 + pan.x - (canvasWidthPx * zoom)/2
  // screenY = containerHeight/2 + pan.y - (canvasHeightPx * zoom)/2
  const canvasWidthPx = canvasWidthInches * scale;
  const canvasHeightPx = canvasHeightInches * scale;

  const originScreenX = containerWidth / 2 + pan.x - (canvasWidthPx * zoom) / 2;
  const originScreenY = containerHeight / 2 + pan.y - (canvasHeightPx * zoom) / 2;

  // Render Horizontal Ruler (Top)
  const renderHorizontalRuler = () => {
    const ticks = [];
    const pixelsPerInch = scale * zoom;
    const pixelsPerUnit = unit === 'in' ? pixelsPerInch : pixelsPerInch / 2.54;
    const totalUnits = unit === 'in' ? canvasWidthInches : canvasWidthInches * 2.54;

    // How many units to show
    const step = pixelsPerUnit < 25 ? (unit === 'in' ? 2 : 5) : 1;
    const subTicksCount = unit === 'in' ? 4 : 5;

    for (let u = 0; u <= Math.ceil(totalUnits); u += step) {
      const pos = originScreenX + u * pixelsPerUnit;
      if (pos < RULER_THICKNESS || pos > containerWidth) continue;

      ticks.push(
        <div
          key={`h-major-${u}`}
          style={{ left: `${pos}px` }}
          className="absolute top-0 bottom-0 flex flex-col justify-between pointer-events-none"
        >
          <div className="w-[1px] h-2.5 bg-border-strong" />
          <span className="text-[9px] font-mono font-medium text-text-muted leading-none -ml-1">
            {u}
          </span>
        </div>
      );

      // Minor sub-ticks
      if (u < totalUnits) {
        for (let sub = 1; sub < subTicksCount; sub++) {
          const subPos = pos + (sub / subTicksCount) * (step * pixelsPerUnit);
          if (subPos >= RULER_THICKNESS && subPos <= containerWidth) {
            const isMid = sub === subTicksCount / 2;
            ticks.push(
              <div
                key={`h-minor-${u}-${sub}`}
                style={{ left: `${subPos}px` }}
                className={cn(
                  'absolute bottom-0 w-[1px] bg-border pointer-events-none',
                  isMid ? 'h-1.5 bg-text-muted/60' : 'h-1'
                )}
              />
            );
          }
        }
      }
    }

    return ticks;
  };

  // Render Vertical Ruler (Left)
  const renderVerticalRuler = () => {
    const ticks = [];
    const pixelsPerInch = scale * zoom;
    const pixelsPerUnit = unit === 'in' ? pixelsPerInch : pixelsPerInch / 2.54;
    const totalUnits = unit === 'in' ? canvasHeightInches : canvasHeightInches * 2.54;

    const step = pixelsPerUnit < 25 ? (unit === 'in' ? 2 : 5) : 1;
    const subTicksCount = unit === 'in' ? 4 : 5;

    for (let u = 0; u <= Math.ceil(totalUnits); u += step) {
      const pos = originScreenY + u * pixelsPerUnit;
      if (pos < RULER_THICKNESS || pos > containerHeight) continue;

      ticks.push(
        <div
          key={`v-major-${u}`}
          style={{ top: `${pos}px` }}
          className="absolute left-0 right-0 flex items-center justify-between pointer-events-none"
        >
          <div className="h-[1px] w-2.5 bg-border-strong" />
          <span className="text-[9px] font-mono font-medium text-text-muted leading-none -mt-1 pr-0.5">
            {u}
          </span>
        </div>
      );

      // Minor sub-ticks
      if (u < totalUnits) {
        for (let sub = 1; sub < subTicksCount; sub++) {
          const subPos = pos + (sub / subTicksCount) * (step * pixelsPerUnit);
          if (subPos >= RULER_THICKNESS && subPos <= containerHeight) {
            const isMid = sub === subTicksCount / 2;
            ticks.push(
              <div
                key={`v-minor-${u}-${sub}`}
                style={{ top: `${subPos}px` }}
                className={cn(
                  'absolute right-0 h-[1px] bg-border pointer-events-none',
                  isMid ? 'w-1.5 bg-text-muted/60' : 'w-1'
                )}
              />
            );
          }
        }
      }
    }

    return ticks;
  };

  // Calculate active element marker highlight on rulers
  let activeHMarker = null;
  let activeVMarker = null;
  if (activeElement) {
    const elLeft = originScreenX + activeElement.x * scale * zoom;
    const elWidth = activeElement.width * scale * zoom;
    const elTop = originScreenY + activeElement.y * scale * zoom;
    const elHeight = activeElement.height * scale * zoom;

    activeHMarker = (
      <div
        style={{
          left: `${Math.max(RULER_THICKNESS, elLeft)}px`,
          width: `${Math.max(2, elWidth)}px`,
        }}
        className="absolute top-0 bottom-0 bg-primary/25 border-x border-primary pointer-events-none"
      />
    );

    activeVMarker = (
      <div
        style={{
          top: `${Math.max(RULER_THICKNESS, elTop)}px`,
          height: `${Math.max(2, elHeight)}px`,
        }}
        className="absolute left-0 right-0 bg-primary/25 border-y border-primary pointer-events-none"
      />
    );
  }

  return (
    <>
      {/* Top-Left Unit Junction Box */}
      <div
        style={{ width: `${RULER_THICKNESS}px`, height: `${RULER_THICKNESS}px` }}
        className="absolute top-0 left-0 bg-surface border-r border-b border-border z-30 flex items-center justify-center select-none shadow-xs"
      >
        <button
          type="button"
          onClick={() => onUnitChange(unit === 'in' ? 'cm' : 'in')}
          className="text-[9px] font-mono font-bold text-primary hover:underline uppercase p-0.5"
          title={`Switch measurement unit (current: ${unit.toUpperCase()})`}
        >
          {unit}
        </button>
      </div>

      {/* Top Horizontal Ruler */}
      <div
        style={{
          left: `${RULER_THICKNESS}px`,
          right: 0,
          height: `${RULER_THICKNESS}px`,
        }}
        className="absolute top-0 bg-surface/90 backdrop-blur-xs border-b border-border overflow-hidden select-none z-20 pointer-events-none"
      >
        {activeHMarker}
        {renderHorizontalRuler()}
      </div>

      {/* Left Vertical Ruler */}
      <div
        style={{
          top: `${RULER_THICKNESS}px`,
          bottom: 0,
          width: `${RULER_THICKNESS}px`,
        }}
        className="absolute left-0 bg-surface/90 backdrop-blur-xs border-r border-border overflow-hidden select-none z-20 pointer-events-none"
      >
        {activeVMarker}
        {renderVerticalRuler()}
      </div>
    </>
  );
};
