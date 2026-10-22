import * as React from 'react';
import {
  Download,
  HardDrive,
  Type,
  Upload,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { CanvasDimensions } from '@/components/ui/CanvasResizeControl';
import {
  JerseyDesign,
  EditorElement,
  GarmentView,
  HistoryState,
  CanvasLayerType,
  JerseyMockupConfig,
  CustomFontItem,
  GarmentSizeItem,
} from './editorTypes';
import { CanvasWorkspace } from './CanvasWorkspace';
import { CanvasDimensionBar } from './CanvasDimensionBar';
import { LayersAndToolsPanel } from './LayersAndToolsPanel';
import { PropertiesPanel } from './PropertiesPanel';
import { ExportModal } from './ExportModal';
import { FontManagerModal } from './FontManagerModal';
import { AssetUploaderModal, LocalAsset } from './AssetUploaderModal';
import { MultiSizeFilmstrip } from './MultiSizeFilmstrip';
import { getDimensionsInInches } from './exportEngine';

const INITIAL_MOCKUP: JerseyMockupConfig = {
  primaryColor: '#0B2545', // Navy
  collarColor: '#FFC72C',  // Athletic Gold
  trimColor: '#FFFFFF',    // White
  accentColor: '#134074',  // Subtle secondary navy
  showSeams: true,
  showGuides: true,
};

const INITIAL_ELEMENTS: EditorElement[] = [
  // BACK VIEW ELEMENTS
  {
    id: 'elem-name',
    name: 'Player Name (Curved Arc)',
    type: 'dynamic_name',
    view: 'back',
    text: 'RODRIGUEZ',
    bindingKey: 'player_name',
    fontFamily: 'Impact',
    fontSize: 50,
    fontWeight: 'bold',
    fillColor: '#FFFFFF',
    strokeColor: '#000000',
    strokeWidth: 3,
    strokeEnabled: true,
    strokeJoin: 'round',
    curvedTextEnabled: true,
    curvePower: 35,
    curveDirection: 'up',
    letterSpacing: 2,
    textAlign: 'center',
    textTransform: 'uppercase',
    x: 4,
    y: 7.2,
    width: 12,
    height: 2.8,
    rotation: 0,
    opacity: 1,
    locked: false,
    visible: true,
    zIndex: 10,
  },
  {
    id: 'elem-num',
    name: 'Squad Number',
    type: 'dynamic_number',
    view: 'back',
    text: '10',
    bindingKey: 'player_number',
    fontFamily: 'Impact',
    fontSize: 160,
    fontWeight: 'bold',
    fillColor: '#FFC72C',
    strokeColor: '#000000',
    strokeWidth: 5,
    strokeEnabled: true,
    strokeJoin: 'miter',
    shadowEnabled: true,
    shadowColor: '#000000',
    shadowBlur: 10,
    shadowOffsetX: 4,
    shadowOffsetY: 6,
    shadowOpacity: 0.5,
    letterSpacing: 0,
    textAlign: 'center',
    textTransform: 'uppercase',
    x: 5,
    y: 11,
    width: 10,
    height: 7.5,
    rotation: 0,
    opacity: 1,
    locked: false,
    visible: true,
    zIndex: 20,
  },

  // FRONT VIEW ELEMENTS
  {
    id: 'elem-crest',
    name: 'Club Crest Emblem',
    type: 'shape',
    shapeType: 'circle',
    view: 'front',
    text: '',
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: 'normal',
    fillColor: '#FFC72C',
    strokeColor: '#FFFFFF',
    strokeWidth: 2,
    strokeEnabled: true,
    textAlign: 'center',
    x: 4.5,
    y: 8,
    width: 3.2,
    height: 3.2,
    rotation: 0,
    opacity: 1,
    locked: false,
    visible: true,
    zIndex: 10,
  },
  {
    id: 'elem-sponsor',
    name: 'Chest Sponsor Bar',
    type: 'shape',
    shapeType: 'rectangle',
    view: 'front',
    text: '',
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: 'normal',
    fillColor: '#FFFFFF',
    strokeEnabled: false,
    textAlign: 'center',
    x: 4,
    y: 13,
    width: 12,
    height: 2.5,
    rotation: 0,
    opacity: 0.95,
    locked: false,
    visible: true,
    zIndex: 15,
  },
  {
    id: 'elem-front-team',
    name: 'Team Name Text',
    type: 'text',
    view: 'front',
    text: 'FALCON FC',
    fontFamily: 'Impact',
    fontSize: 28,
    fontWeight: 'bold',
    fillColor: '#0B2545',
    strokeEnabled: false,
    letterSpacing: 3,
    textAlign: 'center',
    textTransform: 'uppercase',
    x: 4,
    y: 13.2,
    width: 12,
    height: 2,
    rotation: 0,
    opacity: 1,
    locked: false,
    visible: true,
    zIndex: 25,
  },

  // HALF SLEEVE (HS) ELEMENTS
  {
    id: 'elem-hs-badge',
    name: 'Tournament Sleeve Badge',
    type: 'shape',
    shapeType: 'circle',
    view: 'half_sleeve',
    text: '',
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: 'normal',
    fillColor: '#FFC72C',
    strokeColor: '#FFFFFF',
    strokeWidth: 2,
    strokeEnabled: true,
    textAlign: 'center',
    x: 8.5,
    y: 11,
    width: 3,
    height: 3,
    rotation: 0,
    opacity: 1,
    locked: false,
    visible: true,
    zIndex: 10,
  },

  // FULL SLEEVE (FS) ELEMENTS
  {
    id: 'elem-fs-text',
    name: 'Sleeve Stripe Text',
    type: 'text',
    view: 'full_sleeve',
    text: 'ATHLETICS',
    fontFamily: 'Impact',
    fontSize: 22,
    fontWeight: 'bold',
    fillColor: '#FFFFFF',
    strokeEnabled: true,
    strokeColor: '#000000',
    strokeWidth: 2,
    letterSpacing: 4,
    textAlign: 'center',
    textTransform: 'uppercase',
    x: 7,
    y: 13,
    width: 6,
    height: 2,
    rotation: 90,
    opacity: 1,
    locked: false,
    visible: true,
    zIndex: 10,
  },
];

export const EditorView: React.FC = () => {
  // Main Design State
  const [design, setDesign] = React.useState<JerseyDesign>({
    id: 'project-falcon-2026',
    name: 'Falcon FC — Home Jersey 2026',
    dimensions: {
      width: 20,
      height: 28,
      unit: 'in',
      dpi: 300,
    },
    activeView: 'back', // default to back view
    mockup: INITIAL_MOCKUP,
    elements: INITIAL_ELEMENTS,
  });

  const [activeElementId, setActiveElementId] = React.useState<string | null>('elem-name');
  const [zoom, setZoom] = React.useState(0.65);
  const [rulerUnit, setRulerUnit] = React.useState<'in' | 'cm'>('in');
  const [currentSizeId, setCurrentSizeId] = React.useState('adult-l');

  // Modal Dialog States
  const [isExportModalOpen, setIsExportModalOpen] = React.useState(false);
  const [isFontManagerOpen, setIsFontManagerOpen] = React.useState(false);
  const [isAssetUploaderOpen, setIsAssetUploaderOpen] = React.useState(false);

  // Custom User Fonts in Memory
  const [customFonts, setCustomFonts] = React.useState<CustomFontItem[]>([]);

  // History Stack for local undo/redo
  const [history, setHistory] = React.useState<HistoryState[]>([
    {
      elements: INITIAL_ELEMENTS,
      mockup: INITIAL_MOCKUP,
      dimensions: { width: 20, height: 28, unit: 'in', dpi: 300 },
      activeView: 'back',
    },
  ]);
  const [historyIndex, setHistoryIndex] = React.useState(0);

  // Record history snapshot
  const commitHistory = () => {
    setHistory((prev) => {
      const upToCurrent = prev.slice(0, historyIndex + 1);
      const nextState: HistoryState = {
        elements: JSON.parse(JSON.stringify(design.elements)),
        mockup: { ...design.mockup },
        dimensions: { ...design.dimensions },
        activeView: design.activeView,
      };
      const newHistory = [...upToCurrent, nextState];
      if (newHistory.length > 30) newHistory.shift();
      return newHistory;
    });
    setHistoryIndex((prev) => Math.min(prev + 1, 29));
  };

  // Undo Handler
  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      const targetState = history[prevIndex];
      setDesign((prev) => ({
        ...prev,
        elements: JSON.parse(JSON.stringify(targetState.elements)),
        mockup: { ...targetState.mockup },
        dimensions: { ...targetState.dimensions },
        activeView: targetState.activeView,
      }));
      setHistoryIndex(prevIndex);
    }
  };

  // Redo Handler
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      const targetState = history[nextIndex];
      setDesign((prev) => ({
        ...prev,
        elements: JSON.parse(JSON.stringify(targetState.elements)),
        mockup: { ...targetState.mockup },
        dimensions: { ...targetState.dimensions },
        activeView: targetState.activeView,
      }));
      setHistoryIndex(nextIndex);
    }
  };

  // Handle Dimension Change
  const handleDimensionsChange = (newDimensions: CanvasDimensions) => {
    setDesign((prev) => ({
      ...prev,
      dimensions: newDimensions,
    }));
    commitHistory();
  };

  // Handle View Change (Back, Front, Half Sleeve, Full Sleeve)
  const handleViewChange = (newView: GarmentView) => {
    setDesign((prev) => ({
      ...prev,
      activeView: newView,
    }));
    setActiveElementId(null);
  };

  // Update Element Properties
  const handleUpdateElement = (id: string, updates: Partial<EditorElement>) => {
    setDesign((prev) => ({
      ...prev,
      elements: prev.elements.map((el) => (el.id === id ? { ...el, ...updates } : el)),
    }));
  };

  // Add Element to Active View
  const handleAddElement = (type: CanvasLayerType, defaultPreset?: Partial<EditorElement>) => {
    const newId = `elem-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const maxZ = design.elements.reduce((max, el) => Math.max(max, el.zIndex), 0);

    const newElement: EditorElement = {
      id: newId,
      name: defaultPreset?.name || (type === 'shape' ? 'Shape Element' : 'Text Element'),
      type,
      view: design.activeView,
      text: defaultPreset?.text || (type === 'dynamic_number' ? '10' : 'TEAM'),
      bindingKey: defaultPreset?.bindingKey,
      fontFamily: defaultPreset?.fontFamily || 'Impact',
      fontSize: defaultPreset?.fontSize || (type === 'dynamic_number' ? 120 : 36),
      fontWeight: defaultPreset?.fontWeight || 'bold',
      fillColor: defaultPreset?.fillColor || '#FFFFFF',
      strokeColor: defaultPreset?.strokeColor || '#000000',
      strokeWidth: defaultPreset?.strokeWidth || 2,
      strokeEnabled: defaultPreset?.strokeEnabled ?? false,
      strokeJoin: defaultPreset?.strokeJoin || 'round',
      curvedTextEnabled: defaultPreset?.curvedTextEnabled ?? false,
      curvePower: defaultPreset?.curvePower ?? 50,
      curveDirection: defaultPreset?.curveDirection ?? 'up',
      textAlign: defaultPreset?.textAlign || 'center',
      textTransform: defaultPreset?.textTransform || 'uppercase',
      shapeType: defaultPreset?.shapeType || 'rectangle',
      x: defaultPreset?.x ?? 5,
      y: defaultPreset?.y ?? 8,
      width: defaultPreset?.width ?? 10,
      height: defaultPreset?.height ?? 3,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      zIndex: maxZ + 10,
    };

    setDesign((prev) => ({
      ...prev,
      elements: [...prev.elements, newElement],
    }));
    setActiveElementId(newId);
    commitHistory();
  };

  // Add Ingested Image / Logo Element
  const handleAddImageAsset = (
    asset: LocalAsset,
    targetDimensions: { width: number; height: number; x: number; y: number }
  ) => {
    const newId = `elem-img-${Date.now()}`;
    const maxZ = design.elements.reduce((max, el) => Math.max(max, el.zIndex), 0);

    const newElement: EditorElement = {
      id: newId,
      name: asset.name,
      type: 'image',
      view: design.activeView,
      imageSrc: asset.dataUrl,
      imageFileName: asset.fileName,
      imageMimeType: asset.format,
      text: '',
      fontFamily: 'Inter',
      fontSize: 14,
      fontWeight: 'normal',
      fillColor: '#FFFFFF',
      textAlign: 'center',
      x: targetDimensions.x,
      y: targetDimensions.y,
      width: targetDimensions.width,
      height: targetDimensions.height,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      zIndex: maxZ + 10,
    };

    setDesign((prev) => ({
      ...prev,
      elements: [...prev.elements, newElement],
    }));
    setActiveElementId(newId);
    commitHistory();
  };

  // Delete Element
  const handleDeleteElement = (id: string) => {
    setDesign((prev) => ({
      ...prev,
      elements: prev.elements.filter((el) => el.id !== id),
    }));
    if (activeElementId === id) {
      setActiveElementId(null);
    }
    commitHistory();
  };

  // Duplicate Element
  const handleDuplicateElement = (id: string) => {
    const target = design.elements.find((el) => el.id === id);
    if (!target) return;

    const copyId = `elem-copy-${Date.now()}`;
    const maxZ = design.elements.reduce((max, el) => Math.max(max, el.zIndex), 0);

    const duplicate: EditorElement = {
      ...JSON.parse(JSON.stringify(target)),
      id: copyId,
      name: `${target.name} (Copy)`,
      x: target.x + 0.5,
      y: target.y + 0.5,
      zIndex: maxZ + 10,
    };

    setDesign((prev) => ({
      ...prev,
      elements: [...prev.elements, duplicate],
    }));
    setActiveElementId(copyId);
    commitHistory();
  };

  // Reorder Element
  const handleReorderElement = (id: string, direction: 'up' | 'down') => {
    const elIndex = design.elements.findIndex((el) => el.id === id);
    if (elIndex === -1) return;

    const targetEl = design.elements[elIndex];
    const newZ = direction === 'up' ? targetEl.zIndex + 15 : Math.max(0, targetEl.zIndex - 15);

    handleUpdateElement(id, { zIndex: newZ });
    commitHistory();
  };

  // Align Element
  const handleAlignElement = (
    id: string,
    alignment: 'left' | 'center-h' | 'right' | 'top' | 'center-v' | 'bottom'
  ) => {
    const el = design.elements.find((item) => item.id === id);
    if (!el) return;

    const { widthInches, heightInches } = getDimensionsInInches(design.dimensions);

    let newX = el.x;
    let newY = el.y;

    if (alignment === 'left') newX = 1;
    else if (alignment === 'center-h') newX = Number(((widthInches - el.width) / 2).toFixed(2));
    else if (alignment === 'right') newX = Number((widthInches - el.width - 1).toFixed(2));
    else if (alignment === 'top') newY = 3;
    else if (alignment === 'center-v') newY = Number(((heightInches - el.height) / 2).toFixed(2));
    else if (alignment === 'bottom') newY = Number((heightInches - el.height - 3).toFixed(2));

    handleUpdateElement(id, { x: newX, y: newY });
    commitHistory();
  };

  // Auto-Fit font size to bounding box
  const handleAutoFitText = (id: string) => {
    const el = design.elements.find((item) => item.id === id);
    if (!el || el.type === 'shape' || el.type === 'image') return;

    const targetWidthPx = el.width * 40;
    const targetHeightPx = el.height * 40;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const testFontSize = 100;
    ctx.font = `${el.fontWeight || 'bold'} ${testFontSize}px "${el.fontFamily}", sans-serif`;
    const metrics = ctx.measureText(el.text || 'SAMPLE');
    const measuredW = metrics.width || 100;
    const measuredH =
      (metrics.actualBoundingBoxAscent || 75) + (metrics.actualBoundingBoxDescent || 25);

    const scaleW = (targetWidthPx * 0.92) / measuredW;
    const scaleH = (targetHeightPx * 0.90) / measuredH;
    const fitScale = Math.min(scaleW, scaleH);

    const optimalFontSizePx = testFontSize * fitScale;
    const optimalFontSizePt = Math.max(12, Math.round((optimalFontSizePx * 72) / 40));

    handleUpdateElement(id, { fontSize: optimalFontSizePt });
    commitHistory();
  };

  // Multi-Size Selection: Proportional Garment Scaling
  const handleSelectSize = (size: GarmentSizeItem) => {
    const prevW = design.dimensions.width;
    const prevH = design.dimensions.height;
    const ratioW = size.widthInches / prevW;
    const ratioH = size.heightInches / prevH;

    // Proportionally scale positions and dimensions of all artwork elements
    const scaledElements = design.elements.map((el) => ({
      ...el,
      x: Number((el.x * ratioW).toFixed(2)),
      y: Number((el.y * ratioH).toFixed(2)),
      width: Number((el.width * ratioW).toFixed(2)),
      height: Number((el.height * ratioH).toFixed(2)),
      fontSize: Math.round(el.fontSize * Math.min(ratioW, ratioH)),
    }));

    setDesign((prev) => ({
      ...prev,
      dimensions: {
        ...prev.dimensions,
        width: size.widthInches,
        height: size.heightInches,
        unit: 'in',
      },
      elements: scaledElements,
    }));
    setCurrentSizeId(size.id);
    commitHistory();
  };

  // Bulk Apply to All confirmation
  const handleApplyToAll = () => {
    // In a multi-size workflow, this locks layout proportions across all size tiers
    commitHistory();
  };

  // Update Mockup Configuration
  const handleUpdateMockupConfig = (updates: Partial<JerseyMockupConfig>) => {
    setDesign((prev) => ({
      ...prev,
      mockup: { ...prev.mockup, ...updates },
    }));
    commitHistory();
  };

  // Fit to screen helper
  const handleFitToScreen = () => {
    setZoom(0.65);
  };

  const activeElement = design.elements.find((el) => el.id === activeElementId) || null;
  const isSelectedText =
    activeElement &&
    (activeElement.type === 'text' ||
      activeElement.type === 'dynamic_name' ||
      activeElement.type === 'dynamic_number');

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-bg-app">
      {/* ====================================================================
          TOP APPLICATION BAR FOR EDITOR
          ==================================================================== */}
      <div className="h-12 border-b border-border bg-surface px-4 flex items-center justify-between shrink-0 shadow-xs z-20">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-text-primary">{design.name}</span>
            <Badge variant="success" size="sm" className="flex items-center gap-1 font-mono text-[10px]">
              <HardDrive className="w-3 h-3" />
              Encrypted on Device (100% Offline)
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Font Manager Trigger */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFontManagerOpen(true)}
            leftIcon={<Type className="w-3.5 h-3.5 text-primary" />}
            className="text-xs font-semibold"
            title="Sports & System Font Studio"
          >
            Fonts
          </Button>

          {/* Quick Asset Ingest Trigger */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAssetUploaderOpen(true)}
            leftIcon={<Upload className="w-3.5 h-3.5 text-primary" />}
            className="text-xs font-semibold"
            title="Upload Sponsor Logos & Club Crests"
          >
            Logos & Crests
          </Button>

          {/* Export Production Files */}
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsExportModalOpen(true)}
            leftIcon={<Download className="w-4 h-4" />}
            className="font-bold"
            title="Export print-ready 300 DPI dye-sublimation files"
          >
            Export Production Files (300 DPI)
          </Button>
        </div>
      </div>

      {/* ====================================================================
          MAIN 3-PANEL EDITOR WORKSPACE
          ==================================================================== */}
      <div className="flex flex-1 overflow-hidden">
        {/* PANEL 1 (LEFT): Add Tools, Layers, Mockup Styling, Sponsor Uploader */}
        <LayersAndToolsPanel
          activeView={design.activeView}
          elements={design.elements}
          activeElementId={activeElementId}
          onSelectElement={setActiveElementId}
          onAddElement={handleAddElement}
          onUpdateElement={handleUpdateElement}
          onDeleteElement={handleDeleteElement}
          onDuplicateElement={handleDuplicateElement}
          onReorderElement={handleReorderElement}
          mockupConfig={design.mockup}
          onUpdateMockupConfig={handleUpdateMockupConfig}
          onOpenAssetUploader={() => setIsAssetUploaderOpen(true)}
        />

        {/* PANEL 2 (CENTER): Canvas Dimension Bar + Rulers + Interactive Canvas + Bottom Filmstrip */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {/* Top Bar with 4 Views & Auto-Fit Text */}
          <CanvasDimensionBar
            dimensions={design.dimensions}
            onDimensionsChange={handleDimensionsChange}
            activeView={design.activeView}
            onViewChange={handleViewChange}
            canUndo={historyIndex > 0}
            canRedo={historyIndex < history.length - 1}
            onUndo={handleUndo}
            onRedo={handleRedo}
            onAutoFitSelectedText={() => activeElementId && handleAutoFitText(activeElementId)}
            hasSelectedText={!!isSelectedText}
          />

          {/* Canvas Viewport with Top & Left Physical Rulers and Floating Toolbar */}
          <div className="flex-1 relative overflow-hidden">
            <CanvasWorkspace
              design={design}
              activeElementId={activeElementId}
              onSelectElement={setActiveElementId}
              onUpdateElement={handleUpdateElement}
              onCommitHistory={commitHistory}
              onDeleteElement={handleDeleteElement}
              onDuplicateElement={handleDuplicateElement}
              onAlignElement={handleAlignElement}
              zoom={zoom}
              onZoomChange={setZoom}
              onFitToScreen={handleFitToScreen}
              rulerUnit={rulerUnit}
              onRulerUnitChange={setRulerUnit}
            />
          </div>

          {/* Bottom Multi-Size Garment Filmstrip (Youth 1-2 Yr to 11-12 Yr, Adult XS to 6XL) */}
          <MultiSizeFilmstrip
            currentSizeId={currentSizeId}
            onSelectSize={handleSelectSize}
            onApplyToAll={handleApplyToAll}
            mockupConfig={design.mockup}
            activeView={design.activeView}
            elementCount={design.elements.length}
          />
        </div>

        {/* PANEL 3 (RIGHT): Advanced Text Effects & Properties Inspector */}
        <PropertiesPanel
          design={design}
          activeElement={activeElement}
          onUpdateElement={handleUpdateElement}
          onCommitHistory={commitHistory}
          onDeleteElement={handleDeleteElement}
          onDuplicateElement={handleDuplicateElement}
          onAlignElement={handleAlignElement}
          onOpenFontManager={() => setIsFontManagerOpen(true)}
          onAutoFitText={handleAutoFitText}
        />
      </div>

      {/* ====================================================================
          MODALS & OVERLAYS
          ==================================================================== */}
      {/* 1. Font Manager Modal (Sports Fonts, System Fonts, Upload Fonts) */}
      <FontManagerModal
        isOpen={isFontManagerOpen}
        onClose={() => setIsFontManagerOpen(false)}
        currentFontFamily={activeElement?.fontFamily || 'Impact'}
        onSelectFont={(fontFamily) => {
          if (activeElementId) {
            handleUpdateElement(activeElementId, { fontFamily });
            commitHistory();
          }
        }}
        customFonts={customFonts}
        onAddCustomFont={(newFont) => setCustomFonts((prev) => [newFont, ...prev])}
        onRemoveCustomFont={(id) => setCustomFonts((prev) => prev.filter((f) => f.id !== id))}
      />

      {/* 2. Sponsor Logos & Crests Local Uploader Modal */}
      <AssetUploaderModal
        isOpen={isAssetUploaderOpen}
        onClose={() => setIsAssetUploaderOpen(false)}
        activeView={design.activeView}
        onAddImageAsset={handleAddImageAsset}
      />

      {/* 3. High-Resolution Sublimation Print Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        design={design}
      />
    </div>
  );
};
