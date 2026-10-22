import * as React from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCw,
  Hand,
  MousePointer,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Tooltip } from '@/components/ui/Tooltip';
import { Badge } from '@/components/ui/Badge';
import {
  JerseyDesign,
  EditorElement,
  GarmentView,
  JerseyMockupConfig,
} from './editorTypes';
import { JerseyMockup } from './jerseyMockups';
import { getDimensionsInInches } from './exportEngine';

export interface CanvasWorkspaceProps {
  design: JerseyDesign;
  activeElementId: string | null;
  onSelectElement: (id: string | null) => void;
  onUpdateElement: (id: string, updates: Partial<EditorElement>) => void;
  onCommitHistory: () => void;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  onFitToScreen: () => void;
}

const SCALE = 40; // 40 canvas pixels per physical inch

type ResizeHandle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

export const CanvasWorkspace: React.FC<CanvasWorkspaceProps> = ({
  design,
  activeElementId,
  onSelectElement,
  onUpdateElement,
  onCommitHistory,
  zoom,
  onZoomChange,
  onFitToScreen,
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [pan, setPan] = React.useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = React.useState(false);
  const [panMode, setPanMode] = React.useState(false);
  const panStartRef = React.useRef({ x: 0, y: 0 });
  const isSpacePressedRef = React.useRef(false);

  // Dragging state
  const [isDragging, setIsDragging] = React.useState(false);
  const dragStartRef = React.useRef({ mouseX: 0, mouseY: 0, elX: 0, elY: 0 });

  // Resizing state
  const [resizingHandle, setResizingHandle] = React.useState<ResizeHandle | null>(null);
  const resizeStartRef = React.useRef({
    mouseX: 0,
    mouseY: 0,
    elX: 0,
    elY: 0,
    elW: 0,
    elH: 0,
  });

  // Rotating state
  const [isRotating, setIsRotating] = React.useState(false);
  const rotateStartRef = React.useRef({ centerX: 0, centerY: 0, startAngle: 0, initialRotation: 0 });

  // Snapping guides
  const [snapGuideV, setSnapGuideV] = React.useState<number | null>(null);
  const [snapGuideH, setSnapGuideH] = React.useState<number | null>(null);

  const { widthInches, heightInches } = getDimensionsInInches(design.dimensions);
  const canvasWidthPx = Math.round(widthInches * SCALE);
  const canvasHeightPx = Math.round(heightInches * SCALE);

  const activeElement = design.elements.find((el) => el.id === activeElementId) || null;

  // Fit to screen on initial mount
  React.useEffect(() => {
    onFitToScreen();
  }, [widthInches, heightInches]);

  // Handle Pan start
  const handleMouseDownViewport = (e: React.MouseEvent) => {
    if (panMode || e.button === 1 || isSpacePressedRef.current) {
      e.preventDefault();
      setIsPanning(true);
      panStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
    } else if (e.target === containerRef.current || (e.target as HTMLElement).id === 'canvas-board') {
      onSelectElement(null);
    }
  };

  // Drag start on an element
  const handleElementMouseDown = (e: React.MouseEvent, element: EditorElement) => {
    if (element.locked || !element.visible || panMode) return;
    e.stopPropagation();
    onSelectElement(element.id);

    setIsDragging(true);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      elX: element.x,
      elY: element.y,
    };
  };

  // Resize handle mouse down
  const handleResizeMouseDown = (e: React.MouseEvent, handle: ResizeHandle) => {
    if (!activeElement || activeElement.locked) return;
    e.stopPropagation();
    setResizingHandle(handle);

    resizeStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      elX: activeElement.x,
      elY: activeElement.y,
      elW: activeElement.width,
      elH: activeElement.height,
    };
  };

  // Rotate handle mouse down
  const handleRotateMouseDown = (e: React.MouseEvent) => {
    if (!activeElement || activeElement.locked || !containerRef.current) return;
    e.stopPropagation();
    setIsRotating(true);

    const canvasRect = containerRef.current.getBoundingClientRect();
    const centerScreenX =
      canvasRect.left + (pan.x + (activeElement.x + activeElement.width / 2) * SCALE * zoom);
    const centerScreenY =
      canvasRect.top + (pan.y + (activeElement.y + activeElement.height / 2) * SCALE * zoom);

    const rad = Math.atan2(e.clientY - centerScreenY, e.clientX - centerScreenX);
    rotateStartRef.current = {
      centerX: centerScreenX,
      centerY: centerScreenY,
      startAngle: (rad * 180) / Math.PI,
      initialRotation: activeElement.rotation || 0,
    };
  };

  // Global Mouse Move and Mouse Up handlers
  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // 1. Panning
      if (isPanning) {
        setPan({
          x: e.clientX - panStartRef.current.x,
          y: e.clientY - panStartRef.current.y,
        });
        return;
      }

      // 2. Dragging element
      if (isDragging && activeElement) {
        const deltaPxX = (e.clientX - dragStartRef.current.mouseX) / zoom;
        const deltaPxY = (e.clientY - dragStartRef.current.mouseY) / zoom;
        let newX = dragStartRef.current.elX + deltaPxX / SCALE;
        let newY = dragStartRef.current.elY + deltaPxY / SCALE;

        // Snapping to horizontal/vertical center
        const elCenterX = newX + activeElement.width / 2;
        const canvasCenterX = widthInches / 2;
        const snapThreshold = 0.35; // inches

        if (Math.abs(elCenterX - canvasCenterX) < snapThreshold) {
          newX = canvasCenterX - activeElement.width / 2;
          setSnapGuideV(canvasCenterX * SCALE);
        } else {
          setSnapGuideV(null);
        }

        const elCenterY = newY + activeElement.height / 2;
        const canvasCenterY = heightInches / 2;
        if (Math.abs(elCenterY - canvasCenterY) < snapThreshold) {
          newY = canvasCenterY - activeElement.height / 2;
          setSnapGuideH(canvasCenterY * SCALE);
        } else {
          setSnapGuideH(null);
        }

        onUpdateElement(activeElement.id, {
          x: Number(newX.toFixed(2)),
          y: Number(newY.toFixed(2)),
        });
        return;
      }

      // 3. Resizing element
      if (resizingHandle && activeElement) {
        const deltaPxX = (e.clientX - resizeStartRef.current.mouseX) / zoom;
        const deltaPxY = (e.clientY - resizeStartRef.current.mouseY) / zoom;
        const deltaInchesX = deltaPxX / SCALE;
        const deltaInchesY = deltaPxY / SCALE;

        let { elX, elY, elW, elH } = resizeStartRef.current;
        const minSize = 0.5; // min 0.5 inches

        if (resizingHandle.includes('e')) {
          elW = Math.max(minSize, elW + deltaInchesX);
        }
        if (resizingHandle.includes('s')) {
          elH = Math.max(minSize, elH + deltaInchesY);
        }
        if (resizingHandle.includes('w')) {
          const newW = Math.max(minSize, elW - deltaInchesX);
          elX += elW - newW;
          elW = newW;
        }
        if (resizingHandle.includes('n')) {
          const newH = Math.max(minSize, elH - deltaInchesY);
          elY += elH - newH;
          elH = newH;
        }

        onUpdateElement(activeElement.id, {
          x: Number(elX.toFixed(2)),
          y: Number(elY.toFixed(2)),
          width: Number(elW.toFixed(2)),
          height: Number(elH.toFixed(2)),
        });
        return;
      }

      // 4. Rotating element
      if (isRotating && activeElement) {
        const { centerX, centerY, startAngle, initialRotation } = rotateStartRef.current;
        const currentRad = Math.atan2(e.clientY - centerY, e.clientX - centerX);
        const currentAngle = (currentRad * 180) / Math.PI;
        let deltaAngle = currentAngle - startAngle;
        let newRotation = (initialRotation + deltaAngle) % 360;
        if (newRotation < 0) newRotation += 360;

        // Snap near 0, 90, 180, 270
        const snapTol = 4;
        if (Math.abs(newRotation) < snapTol || Math.abs(newRotation - 360) < snapTol) newRotation = 0;
        else if (Math.abs(newRotation - 90) < snapTol) newRotation = 90;
        else if (Math.abs(newRotation - 180) < snapTol) newRotation = 180;
        else if (Math.abs(newRotation - 270) < snapTol) newRotation = 270;

        onUpdateElement(activeElement.id, {
          rotation: Math.round(newRotation),
        });
      }
    };

    const handleMouseUp = () => {
      if (isDragging || resizingHandle || isRotating) {
        onCommitHistory();
      }
      setIsPanning(false);
      setIsDragging(false);
      setResizingHandle(null);
      setIsRotating(false);
      setSnapGuideV(null);
      setSnapGuideH(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [
    isPanning,
    isDragging,
    resizingHandle,
    isRotating,
    activeElement,
    zoom,
    widthInches,
    heightInches,
  ]);

  // Keyboard navigation & element deletion
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        isSpacePressedRef.current = true;
      }

      if (!activeElement || (e.target as HTMLElement).tagName === 'INPUT') return;

      const step = e.shiftKey ? 0.5 : 0.05; // inches

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        onUpdateElement(activeElement.id, { x: Number((activeElement.x - step).toFixed(2)) });
        onCommitHistory();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        onUpdateElement(activeElement.id, { x: Number((activeElement.x + step).toFixed(2)) });
        onCommitHistory();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        onUpdateElement(activeElement.id, { y: Number((activeElement.y - step).toFixed(2)) });
        onCommitHistory();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        onUpdateElement(activeElement.id, { y: Number((activeElement.y + step).toFixed(2)) });
        onCommitHistory();
      } else if (e.key === 'Escape') {
        onSelectElement(null);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        isSpacePressedRef.current = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [activeElement]);

  const activeElements = design.elements
    .filter((el) => el.view === design.activeView || el.view === 'both')
    .sort((a, b) => a.zIndex - b.zIndex);

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDownViewport}
      className={cn(
        'relative w-full h-full overflow-hidden bg-[#E2E8F0]/50 select-none flex items-center justify-center',
        panMode ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
      )}
    >
      {/* Background Subtle Grid Pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage: `radial-gradient(circle, #94A3B8 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* ====================================================================
          TRANSFORMABLE CANVAS BOARD
          ==================================================================== */}
      <div
        id="canvas-board"
        style={{
          width: `${canvasWidthPx}px`,
          height: `${canvasHeightPx}px`,
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: 'center center',
          transition: isDragging || resizingHandle || isRotating || isPanning ? 'none' : 'transform 0.1s ease-out',
        }}
        className="relative bg-surface rounded shadow-2xl border border-border/80 shrink-0"
      >
        {/* Layer 1: Realistic Vector Mockup */}
        <JerseyMockup
          view={design.activeView}
          config={design.mockup}
          className="absolute inset-0 w-full h-full"
        />

        {/* Layer 2: Snapping Guidelines */}
        {snapGuideV !== null && (
          <div
            className="absolute top-0 bottom-0 w-[1.5px] bg-primary z-40 pointer-events-none shadow-[0_0_8px_rgba(49,87,213,0.8)]"
            style={{ left: `${snapGuideV}px` }}
          />
        )}
        {snapGuideH !== null && (
          <div
            className="absolute left-0 right-0 h-[1.5px] bg-primary z-40 pointer-events-none shadow-[0_0_8px_rgba(49,87,213,0.8)]"
            style={{ top: `${snapGuideH}px` }}
          />
        )}

        {/* Layer 3: Canvas Design Elements */}
        {activeElements.map((el) => {
          const isSelected = el.id === activeElementId;
          const leftPx = el.x * SCALE;
          const topPx = el.y * SCALE;
          const widthPx = el.width * SCALE;
          const heightPx = el.height * SCALE;

          if (!el.visible) return null;

          return (
            <div
              key={el.id}
              onMouseDown={(e) => handleElementMouseDown(e, el)}
              style={{
                left: `${leftPx}px`,
                top: `${topPx}px`,
                width: `${widthPx}px`,
                height: `${heightPx}px`,
                transform: `rotate(${el.rotation || 0}deg)`,
                opacity: el.opacity ?? 1,
                zIndex: isSelected ? 50 : el.zIndex,
              }}
              className={cn(
                'absolute flex items-center justify-center select-none group',
                el.locked ? 'cursor-not-allowed' : 'cursor-move',
                isSelected && 'ring-2 ring-primary ring-offset-1 rounded-sm'
              )}
            >
              {/* Element Content */}
              {el.type === 'shape' ? (
                <div
                  style={{
                    backgroundColor: el.fillColor,
                    borderColor: el.strokeEnabled ? el.strokeColor : 'transparent',
                    borderWidth: el.strokeEnabled ? `${el.strokeWidth}px` : 0,
                    borderRadius: el.shapeType === 'circle' ? '9999px' : '4px',
                  }}
                  className="w-full h-full shadow-sm"
                />
              ) : (
                <div
                  style={{
                    color: el.fillColor,
                    fontFamily: el.fontFamily,
                    fontSize: `${(el.fontSize * SCALE) / 72}px`,
                    fontWeight: el.fontWeight,
                    letterSpacing: `${el.letterSpacing || 0}px`,
                    textAlign: el.textAlign,
                    textTransform: el.textTransform || 'none',
                    WebkitTextStroke: el.strokeEnabled && el.strokeColor && el.strokeWidth
                      ? `${(el.strokeWidth * SCALE) / 72}px ${el.strokeColor}`
                      : undefined,
                  }}
                  className="w-full h-full flex items-center justify-center font-bold tracking-wider leading-none"
                >
                  {el.text}
                </div>
              )}

              {/* Dynamic Field Identifier Badge */}
              {el.bindingKey && (
                <span
                  className={cn(
                    'absolute -top-6 left-0 text-[10px] font-mono px-1.5 py-0.5 rounded bg-primary text-white pointer-events-none flex items-center gap-1 shadow-sm transition-opacity',
                    isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  )}
                >
                  <Sparkles className="w-2.5 h-2.5" />
                  {el.bindingKey === 'player_name' ? 'PLAYER NAME' : 'SQUAD NUMBER'}
                </span>
              )}

              {/* Selection Transform Controls (8 handles + 1 rotation stem) */}
              {isSelected && !el.locked && (
                <>
                  {/* Rotation Stem Handle */}
                  <div
                    onMouseDown={handleRotateMouseDown}
                    className="absolute -top-7 left-1/2 -translate-x-1/2 w-4 h-4 bg-surface border-2 border-primary rounded-full cursor-grab active:cursor-grabbing shadow flex items-center justify-center hover:scale-125 transition-transform"
                    title="Rotate element"
                  >
                    <RotateCw className="w-2.5 h-2.5 text-primary" />
                  </div>
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-[1px] h-3 bg-primary pointer-events-none" />

                  {/* 8 Resize Handles */}
                  <div
                    onMouseDown={(e) => handleResizeMouseDown(e, 'nw')}
                    className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-surface border-2 border-primary rounded-sm cursor-nw-resize hover:scale-125 shadow"
                  />
                  <div
                    onMouseDown={(e) => handleResizeMouseDown(e, 'n')}
                    className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-surface border-2 border-primary rounded-sm cursor-n-resize hover:scale-125 shadow"
                  />
                  <div
                    onMouseDown={(e) => handleResizeMouseDown(e, 'ne')}
                    className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-surface border-2 border-primary rounded-sm cursor-ne-resize hover:scale-125 shadow"
                  />
                  <div
                    onMouseDown={(e) => handleResizeMouseDown(e, 'e')}
                    className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 bg-surface border-2 border-primary rounded-sm cursor-e-resize hover:scale-125 shadow"
                  />
                  <div
                    onMouseDown={(e) => handleResizeMouseDown(e, 'se')}
                    className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-surface border-2 border-primary rounded-sm cursor-se-resize hover:scale-125 shadow"
                  />
                  <div
                    onMouseDown={(e) => handleResizeMouseDown(e, 's')}
                    className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-surface border-2 border-primary rounded-sm cursor-s-resize hover:scale-125 shadow"
                  />
                  <div
                    onMouseDown={(e) => handleResizeMouseDown(e, 'sw')}
                    className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-surface border-2 border-primary rounded-sm cursor-sw-resize hover:scale-125 shadow"
                  />
                  <div
                    onMouseDown={(e) => handleResizeMouseDown(e, 'w')}
                    className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-3 h-3 bg-surface border-2 border-primary rounded-sm cursor-w-resize hover:scale-125 shadow"
                  />
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* ====================================================================
          FLOATING BOTTOM-RIGHT ZOOM & PAN HUD
          ==================================================================== */}
      <div className="absolute bottom-4 right-4 bg-surface/95 backdrop-blur border border-border rounded-lg shadow-lg p-1.5 flex items-center gap-1.5 z-30">
        <Tooltip content="Select Mode">
          <Button
            size="sm"
            variant={!panMode ? 'primary' : 'ghost'}
            className="w-8 h-8 p-0"
            onClick={() => setPanMode(false)}
          >
            <MousePointer className="w-4 h-4" />
          </Button>
        </Tooltip>

        <Tooltip content="Pan Workspace (Spacebar + drag)">
          <Button
            size="sm"
            variant={panMode ? 'primary' : 'ghost'}
            className="w-8 h-8 p-0"
            onClick={() => setPanMode(!panMode)}
          >
            <Hand className="w-4 h-4" />
          </Button>
        </Tooltip>

        <div className="w-[1px] h-4 bg-border mx-0.5" />

        <Tooltip content="Zoom Out">
          <Button
            size="sm"
            variant="ghost"
            className="w-8 h-8 p-0"
            onClick={() => onZoomChange(Math.max(0.2, Number((zoom - 0.15).toFixed(2))))}
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
        </Tooltip>

        <span className="text-xs font-mono font-medium px-1.5 text-text-secondary select-none min-w-[42px] text-center">
          {Math.round(zoom * 100)}%
        </span>

        <Tooltip content="Zoom In">
          <Button
            size="sm"
            variant="ghost"
            className="w-8 h-8 p-0"
            onClick={() => onZoomChange(Math.min(3.0, Number((zoom + 0.15).toFixed(2))))}
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
        </Tooltip>

        <Tooltip content="Fit to Screen">
          <Button
            size="sm"
            variant="ghost"
            className="w-8 h-8 p-0"
            onClick={onFitToScreen}
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
        </Tooltip>
      </div>
    </div>
  );
};
