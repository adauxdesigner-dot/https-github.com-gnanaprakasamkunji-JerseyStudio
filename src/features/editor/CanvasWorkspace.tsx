import * as React from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCw,
  Hand,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Tooltip } from '@/components/ui/Tooltip';
import {
  JerseyDesign,
  EditorElement,
} from './editorTypes';
import { JerseyMockup } from './jerseyMockups';
import { getDimensionsInInches } from './exportEngine';
import { FloatingToolbar } from './FloatingToolbar';
import { CanvasRulers } from './CanvasRulers';

export interface CanvasWorkspaceProps {
  design: JerseyDesign;
  activeElementId: string | null;
  onSelectElement: (id: string | null) => void;
  onUpdateElement: (id: string, updates: Partial<EditorElement>) => void;
  onCommitHistory: () => void;
  onDeleteElement: (id: string) => void;
  onDuplicateElement: (id: string) => void;
  onAlignElement: (
    id: string,
    alignment: 'left' | 'center-h' | 'right' | 'top' | 'center-v' | 'bottom'
  ) => void;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  onFitToScreen: () => void;
  rulerUnit: 'in' | 'cm';
  onRulerUnitChange: (unit: 'in' | 'cm') => void;
}

const SCALE = 40; // 40 canvas pixels per physical inch

type ResizeHandle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

// Helper to convert hex + opacity to rgba string
function hexToRgba(hex: string, alpha: number): string {
  let cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map((c) => c + c).join('');
  }
  const r = parseInt(cleanHex.substring(0, 2), 16) || 0;
  const g = parseInt(cleanHex.substring(2, 4), 16) || 0;
  const b = parseInt(cleanHex.substring(4, 6), 16) || 0;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export const CanvasWorkspace: React.FC<CanvasWorkspaceProps> = ({
  design,
  activeElementId,
  onSelectElement,
  onUpdateElement,
  onCommitHistory,
  onDeleteElement,
  onDuplicateElement,
  onAlignElement,
  zoom,
  onZoomChange,
  onFitToScreen,
  rulerUnit,
  onRulerUnitChange,
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = React.useState({ width: 800, height: 600 });
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

  // Track container dimensions for rulers
  React.useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

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

    const startAngle = Math.atan2(e.clientY - centerScreenY, e.clientX - centerScreenX);

    rotateStartRef.current = {
      centerX: centerScreenX,
      centerY: centerScreenY,
      startAngle,
      initialRotation: activeElement.rotation || 0,
    };
  };

  // Auto-Fit Text algorithm (scales font size to fit bounding box perfectly)
  const handleAutoFitText = (id: string) => {
    const el = design.elements.find((item) => item.id === id);
    if (!el || el.type === 'shape' || el.type === 'image') return;

    const targetWidthPx = el.width * SCALE;
    const targetHeightPx = el.height * SCALE;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const testFontSize = 100;
    ctx.font = `${el.fontWeight || 'bold'} ${testFontSize}px "${el.fontFamily}", sans-serif`;
    const metrics = ctx.measureText(el.text || 'SAMPLE');
    const measuredW = metrics.width || 100;
    const measuredH = (metrics.actualBoundingBoxAscent || 75) + (metrics.actualBoundingBoxDescent || 25);

    const scaleW = (targetWidthPx * 0.92) / measuredW;
    const scaleH = (targetHeightPx * 0.90) / measuredH;
    const fitScale = Math.min(scaleW, scaleH);

    const optimalFontSizePx = testFontSize * fitScale;
    const optimalFontSizePt = Math.max(12, Math.round((optimalFontSizePx * 72) / SCALE));

    onUpdateElement(id, { fontSize: optimalFontSizePt });
    onCommitHistory();
  };

  // Global mouse move & up listeners
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
      if (isDragging && activeElement && !activeElement.locked) {
        const deltaX = (e.clientX - dragStartRef.current.mouseX) / (SCALE * zoom);
        const deltaY = (e.clientY - dragStartRef.current.mouseY) / (SCALE * zoom);

        let newX = Number((dragStartRef.current.elX + deltaX).toFixed(2));
        let newY = Number((dragStartRef.current.elY + deltaY).toFixed(2));

        // Center snapping guide
        const centerXInches = widthInches / 2;
        const elCenter = newX + activeElement.width / 2;
        if (Math.abs(elCenter - centerXInches) < 0.25) {
          newX = centerXInches - activeElement.width / 2;
          setSnapGuideV((widthInches * SCALE) / 2);
        } else {
          setSnapGuideV(null);
        }

        const centerYInches = heightInches / 2;
        const elCenterY = newY + activeElement.height / 2;
        if (Math.abs(elCenterY - centerYInches) < 0.25) {
          newY = centerYInches - activeElement.height / 2;
          setSnapGuideH((heightInches * SCALE) / 2);
        } else {
          setSnapGuideH(null);
        }

        onUpdateElement(activeElement.id, { x: newX, y: newY });
        return;
      }

      // 3. Resizing element
      if (resizingHandle && activeElement && !activeElement.locked) {
        const deltaX = (e.clientX - resizeStartRef.current.mouseX) / (SCALE * zoom);
        const deltaY = (e.clientY - resizeStartRef.current.mouseY) / (SCALE * zoom);

        const { elX, elY, elW, elH } = resizeStartRef.current;
        let newX = elX;
        let newY = elY;
        let newW = elW;
        let newH = elH;

        if (resizingHandle.includes('e')) newW = Math.max(0.5, elW + deltaX);
        if (resizingHandle.includes('s')) newH = Math.max(0.5, elH + deltaY);
        if (resizingHandle.includes('w')) {
          const w = Math.max(0.5, elW - deltaX);
          newX = elX + (elW - w);
          newW = w;
        }
        if (resizingHandle.includes('n')) {
          const h = Math.max(0.5, elH - deltaY);
          newY = elY + (elH - h);
          newH = h;
        }

        onUpdateElement(activeElement.id, {
          x: Number(newX.toFixed(2)),
          y: Number(newY.toFixed(2)),
          width: Number(newW.toFixed(2)),
          height: Number(newH.toFixed(2)),
        });
        return;
      }

      // 4. Rotating element
      if (isRotating && activeElement && !activeElement.locked) {
        const currentAngle = Math.atan2(
          e.clientY - rotateStartRef.current.centerY,
          e.clientX - rotateStartRef.current.centerX
        );
        let degrees =
          rotateStartRef.current.initialRotation +
          ((currentAngle - rotateStartRef.current.startAngle) * 180) / Math.PI;

        // Snap to 45 degree increments if shift is held
        if (e.shiftKey) {
          degrees = Math.round(degrees / 45) * 45;
        }

        // Normalize between 0 and 360
        degrees = Math.round(((degrees % 360) + 360) % 360);
        onUpdateElement(activeElement.id, { rotation: degrees });
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
    onUpdateElement,
    onCommitHistory,
  ]);

  // Spacebar pan mode toggle
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat && document.activeElement?.tagName !== 'INPUT') {
        isSpacePressedRef.current = true;
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
  }, []);

  // Filter elements visible on active view
  const activeElements = design.elements
    .filter((el) => el.view === design.activeView || el.view === 'both')
    .sort((a, b) => a.zIndex - b.zIndex);

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDownViewport}
      className={cn(
        'relative flex-1 h-full overflow-hidden bg-surface-muted select-none flex items-center justify-center',
        panMode || isSpacePressedRef.current ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
      )}
      style={{
        backgroundImage: `
          radial-gradient(circle, rgba(148, 163, 184, 0.25) 1px, transparent 1px)
        `,
        backgroundSize: '24px 24px',
      }}
    >
      {/* ====================================================================
          TOP & LEFT PHYSICAL RULERS (Feature 4)
          ==================================================================== */}
      <CanvasRulers
        canvasWidthInches={widthInches}
        canvasHeightInches={heightInches}
        scale={SCALE}
        zoom={zoom}
        pan={pan}
        containerWidth={containerSize.width}
        containerHeight={containerSize.height}
        activeElement={activeElement}
        unit={rulerUnit}
        onUnitChange={onRulerUnitChange}
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
          transition:
            isDragging || resizingHandle || isRotating || isPanning
              ? 'none'
              : 'transform 0.1s ease-out',
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

          const isText = el.type === 'text' || el.type === 'dynamic_name' || el.type === 'dynamic_number';
          const isImage = el.type === 'image';

          // Shadow filter for element
          const shadowStyle = el.shadowEnabled
            ? `drop-shadow(${el.shadowOffsetX ?? 4}px ${el.shadowOffsetY ?? 4}px ${el.shadowBlur ?? 8}px ${hexToRgba(
                el.shadowColor || '#000000',
                el.shadowOpacity ?? 0.6
              )})`
            : undefined;

          // Curved Arc Path math for SVG
          let curvedSvgContent = null;
          if (isText && el.curvedTextEnabled && (el.curvePower ?? 50) > 0) {
            const power = el.curvePower ?? 50;
            const dir = el.curveDirection ?? 'up';
            const sagitta = (power / 100) * (heightPx * 0.45);
            const startY = dir === 'up' ? heightPx * 0.75 : heightPx * 0.25;
            const ctrlY = dir === 'up' ? heightPx * 0.75 - sagitta * 2 : heightPx * 0.25 + sagitta * 2;
            const endY = startY;
            const arcPathId = `arc-${el.id}`;
            const arcD = `M 0,${startY} Q ${widthPx / 2},${ctrlY} ${widthPx},${endY}`;

            curvedSvgContent = (
              <svg
                viewBox={`0 0 ${widthPx} ${heightPx}`}
                className="w-full h-full overflow-visible pointer-events-none"
                style={{ filter: shadowStyle }}
              >
                <defs>
                  <path id={arcPathId} d={arcD} fill="none" />
                </defs>
                <text
                  fill={el.fillColor}
                  stroke={el.strokeEnabled ? el.strokeColor || '#000000' : 'none'}
                  strokeWidth={el.strokeEnabled ? Math.max(1, ((el.strokeWidth || 1) * SCALE) / 72) : 0}
                  strokeLinejoin={el.strokeJoin || 'round'}
                  paintOrder="stroke fill"
                  fontFamily={el.fontFamily}
                  fontSize={`${(el.fontSize * SCALE) / 72}px`}
                  fontWeight={el.fontWeight}
                  letterSpacing={el.letterSpacing ? `${el.letterSpacing}px` : undefined}
                >
                  <textPath href={`#${arcPathId}`} startOffset="50%" textAnchor="middle">
                    {el.text}
                  </textPath>
                </text>
              </svg>
            );
          }

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
              {/* Text Box Background Layer */}
              {isText && el.bgEnabled && (
                <div
                  style={{
                    position: 'absolute',
                    inset: `-${el.bgPadding ?? 12}px`,
                    backgroundColor: el.bgColor || '#000000',
                    opacity: el.bgOpacity ?? 0.85,
                    borderRadius: `${el.bgCornerRadius ?? 8}px`,
                    zIndex: -1,
                    pointerEvents: 'none',
                  }}
                />
              )}

              {/* Element Content: Shape, Image, Curved Text, or Standard Text */}
              {el.type === 'shape' ? (
                <div
                  style={{
                    backgroundColor: el.fillColor,
                    borderColor: el.strokeEnabled ? el.strokeColor : 'transparent',
                    borderWidth: el.strokeEnabled ? `${el.strokeWidth}px` : 0,
                    borderRadius: el.shapeType === 'circle' ? '9999px' : '4px',
                    filter: shadowStyle,
                  }}
                  className="w-full h-full shadow-sm"
                />
              ) : isImage ? (
                <img
                  src={el.imageSrc}
                  alt={el.name}
                  className="w-full h-full object-contain pointer-events-none select-none"
                  style={{ filter: shadowStyle }}
                />
              ) : curvedSvgContent ? (
                curvedSvgContent
              ) : (
                /* Standard Text with SVG paint-order for athletic varsity outline */
                <svg
                  viewBox={`0 0 ${widthPx} ${heightPx}`}
                  className="w-full h-full overflow-visible pointer-events-none"
                  style={{ filter: shadowStyle }}
                >
                  <text
                    x={el.textAlign === 'left' ? 0 : el.textAlign === 'right' ? widthPx : widthPx / 2}
                    y={heightPx / 2}
                    textAnchor={
                      el.textAlign === 'left' ? 'start' : el.textAlign === 'right' ? 'end' : 'middle'
                    }
                    dominantBaseline="central"
                    fill={el.fillColor}
                    stroke={el.strokeEnabled ? el.strokeColor || '#000000' : 'none'}
                    strokeWidth={
                      el.strokeEnabled ? Math.max(1, ((el.strokeWidth || 1) * SCALE) / 72) : 0
                    }
                    strokeLinejoin={el.strokeJoin || 'round'}
                    paintOrder="stroke fill"
                    fontFamily={el.fontFamily}
                    fontSize={`${(el.fontSize * SCALE) / 72}px`}
                    fontWeight={el.fontWeight}
                    letterSpacing={el.letterSpacing ? `${el.letterSpacing}px` : undefined}
                  >
                    {el.text}
                  </text>
                </svg>
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
                    className="absolute -top-7 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-surface border-2 border-primary cursor-grab flex items-center justify-center shadow-md hover:scale-125 transition-transform z-30"
                    title="Rotate element (drag to rotate, hold Shift for 45°)"
                  >
                    <RotateCw className="w-2.5 h-2.5 text-primary" />
                  </div>
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-[1.5px] h-3 bg-primary pointer-events-none" />

                  {/* Corner & Edge Resize Handles */}
                  {(['nw', 'ne', 'se', 'sw'] as ResizeHandle[]).map((handle) => (
                    <div
                      key={handle}
                      onMouseDown={(e) => handleResizeMouseDown(e, handle)}
                      className={cn(
                        'absolute w-2.5 h-2.5 bg-surface border-2 border-primary rounded-xs z-20 shadow-xs',
                        handle === 'nw' && '-top-1.5 -left-1.5 cursor-nwse-resize',
                        handle === 'ne' && '-top-1.5 -right-1.5 cursor-nesw-resize',
                        handle === 'se' && '-bottom-1.5 -right-1.5 cursor-nwse-resize',
                        handle === 'sw' && '-bottom-1.5 -left-1.5 cursor-nesw-resize'
                      )}
                    />
                  ))}
                  {(['n', 'e', 's', 'w'] as ResizeHandle[]).map((handle) => (
                    <div
                      key={handle}
                      onMouseDown={(e) => handleResizeMouseDown(e, handle)}
                      className={cn(
                        'absolute w-2 h-2 bg-surface border border-primary rounded-xs z-20 shadow-xs',
                        handle === 'n' && '-top-1 left-1/2 -translate-x-1/2 cursor-ns-resize',
                        handle === 'e' && 'top-1/2 -right-1 -translate-y-1/2 cursor-ew-resize',
                        handle === 's' && '-bottom-1 left-1/2 -translate-x-1/2 cursor-ns-resize',
                        handle === 'w' && 'top-1/2 -left-1 -translate-y-1/2 cursor-ew-resize'
                      )}
                    />
                  ))}
                </>
              )}
            </div>
          );
        })}

        {/* ====================================================================
            FLOATING SELECTION TOOLBAR (Feature 3)
            ==================================================================== */}
        {activeElement && (
          <FloatingToolbar
            element={activeElement}
            canvasScale={SCALE}
            zoom={zoom}
            pan={pan}
            onUpdateElement={onUpdateElement}
            onDuplicateElement={onDuplicateElement}
            onDeleteElement={onDeleteElement}
            onAlignElement={onAlignElement}
            onAutoFitText={handleAutoFitText}
          />
        )}
      </div>

      {/* ====================================================================
          CANVAS VIEWPORT OVERLAY CONTROLS (Bottom Right)
          ==================================================================== */}
      <div className="absolute bottom-4 right-4 z-20 flex items-center gap-1.5 bg-surface/90 backdrop-blur-md p-1.5 rounded-lg border border-border shadow-lg">
        <Tooltip content="Hand tool: pan canvas (Spacebar)">
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
            onClick={() => onZoomChange(Math.max(0.2, zoom - 0.1))}
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
        </Tooltip>

        <span className="font-mono text-xs font-semibold px-1 text-text-primary min-w-10 text-center">
          {Math.round(zoom * 100)}%
        </span>

        <Tooltip content="Zoom In">
          <Button
            size="sm"
            variant="ghost"
            className="w-8 h-8 p-0"
            onClick={() => onZoomChange(Math.min(3, zoom + 0.1))}
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
        </Tooltip>

        <div className="w-[1px] h-4 bg-border mx-0.5" />

        <Tooltip content="Fit to screen">
          <Button size="sm" variant="ghost" className="w-8 h-8 p-0" onClick={onFitToScreen}>
            <Maximize2 className="w-4 h-4" />
          </Button>
        </Tooltip>
      </div>
    </div>
  );
};
