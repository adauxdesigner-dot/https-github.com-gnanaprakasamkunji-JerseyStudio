import * as React from 'react';
import {
  Download,
  HardDrive,
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
} from './editorTypes';
import { CanvasWorkspace } from './CanvasWorkspace';
import { CanvasDimensionBar } from './CanvasDimensionBar';
import { LayersAndToolsPanel } from './LayersAndToolsPanel';
import { PropertiesPanel } from './PropertiesPanel';
import { ExportModal } from './ExportModal';
import { getDimensionsInInches } from './exportEngine';

const INITIAL_MOCKUP: JerseyMockupConfig = {
  primaryColor: '#0B2545', // Navy
  collarColor: '#FFC72C',  // Athletic Gold
  trimColor: '#FFFFFF',    // White
  accentColor: '#134074',  // Subtle secondary navy
  showSeams: true,
  showGuides: false,
};

const INITIAL_ELEMENTS: EditorElement[] = [
  // BACK VIEW ELEMENTS
  {
    id: 'elem-name',
    name: 'Player Name',
    type: 'dynamic_name',
    view: 'back',
    text: 'RODRIGUEZ',
    bindingKey: 'player_name',
    fontFamily: 'Impact',
    fontSize: 52,
    fontWeight: 'bold',
    fillColor: '#FFFFFF',
    strokeColor: '#000000',
    strokeWidth: 3,
    strokeEnabled: true,
    letterSpacing: 2,
    textAlign: 'center',
    textTransform: 'uppercase',
    x: 4,
    y: 7.5,
    width: 12,
    height: 2.2,
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
    letterSpacing: 0,
    textAlign: 'center',
    textTransform: 'uppercase',
    x: 5,
    y: 10.5,
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
    activeView: 'back', // default to back view where names and numbers live
    mockup: INITIAL_MOCKUP,
    elements: INITIAL_ELEMENTS,
  });

  // Active Selection
  const [activeElementId, setActiveElementId] = React.useState<string | null>('elem-num');

  // Zoom & Viewport state
  const [zoom, setZoom] = React.useState<number>(0.65);

  // Export Modal state
  const [isExportModalOpen, setIsExportModalOpen] = React.useState(false);

  // Undo / Redo History Stack
  const [history, setHistory] = React.useState<HistoryState[]>([
    {
      elements: INITIAL_ELEMENTS,
      mockup: INITIAL_MOCKUP,
      dimensions: { width: 20, height: 28, unit: 'in', dpi: 300 },
      activeView: 'back',
    },
  ]);
  const [historyIndex, setHistoryIndex] = React.useState<number>(0);

  // Commit state to history stack
  const commitHistory = React.useCallback(() => {
    setHistory((prev) => {
      const sliced = prev.slice(0, historyIndex + 1);
      return [
        ...sliced,
        {
          elements: JSON.parse(JSON.stringify(design.elements)),
          mockup: { ...design.mockup },
          dimensions: { ...design.dimensions },
          activeView: design.activeView,
        },
      ];
    });
    setHistoryIndex((prev) => prev + 1);
  }, [design, historyIndex]);

  // Undo action
  const handleUndo = React.useCallback(() => {
    if (historyIndex > 0) {
      const nextIndex = historyIndex - 1;
      const targetState = history[nextIndex];
      setHistoryIndex(nextIndex);
      setDesign((prev) => ({
        ...prev,
        elements: JSON.parse(JSON.stringify(targetState.elements)),
        mockup: { ...targetState.mockup },
        dimensions: { ...targetState.dimensions },
        activeView: targetState.activeView,
      }));
    }
  }, [history, historyIndex]);

  // Redo action
  const handleRedo = React.useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      const targetState = history[nextIndex];
      setHistoryIndex(nextIndex);
      setDesign((prev) => ({
        ...prev,
        elements: JSON.parse(JSON.stringify(targetState.elements)),
        mockup: { ...targetState.mockup },
        dimensions: { ...targetState.dimensions },
        activeView: targetState.activeView,
      }));
    }
  }, [history, historyIndex]);

  // Keyboard shortcuts for Undo/Redo
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'y') {
        handleRedo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  // Dimensions change
  const handleDimensionsChange = (newDimensions: CanvasDimensions) => {
    setDesign((prev) => ({ ...prev, dimensions: newDimensions }));
    commitHistory();
  };

  // Garment view change
  const handleViewChange = (newView: GarmentView) => {
    setDesign((prev) => ({ ...prev, activeView: newView }));
    setActiveElementId(null);
  };

  // Element updates
  const handleUpdateElement = (id: string, updates: Partial<EditorElement>) => {
    setDesign((prev) => ({
      ...prev,
      elements: prev.elements.map((el) => (el.id === id ? { ...el, ...updates } : el)),
    }));
  };

  // Add Element
  const handleAddElement = (type: CanvasLayerType, defaultPreset?: Partial<EditorElement>) => {
    const newId = `elem-${Date.now()}`;
    const maxZ = design.elements.reduce((max, el) => Math.max(max, el.zIndex), 0);
    const newElement: EditorElement = {
      id: newId,
      name: defaultPreset?.name || (type === 'shape' ? 'Shape Element' : 'Text Layer'),
      type,
      view: design.activeView,
      text: defaultPreset?.text || 'CUSTOM TEXT',
      bindingKey: defaultPreset?.bindingKey,
      fontFamily: defaultPreset?.fontFamily || 'Inter',
      fontSize: defaultPreset?.fontSize || 36,
      fontWeight: defaultPreset?.fontWeight || 'bold',
      fillColor: defaultPreset?.fillColor || '#FFFFFF',
      strokeColor: defaultPreset?.strokeColor || '#000000',
      strokeWidth: defaultPreset?.strokeWidth || 2,
      strokeEnabled: defaultPreset?.strokeEnabled ?? false,
      letterSpacing: defaultPreset?.letterSpacing || 0,
      textAlign: defaultPreset?.textAlign || 'center',
      textTransform: defaultPreset?.textTransform || 'none',
      shapeType: defaultPreset?.shapeType || 'rectangle',
      x: defaultPreset?.x || 5,
      y: defaultPreset?.y || 8,
      width: defaultPreset?.width || 10,
      height: defaultPreset?.height || 3,
      rotation: defaultPreset?.rotation || 0,
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

    const copyId = `elem-${Date.now()}`;
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

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-bg-app">
      {/* ====================================================================
          TOP APPLICATION BAR FOR EDITOR
          ==================================================================== */}
      <div className="h-12 border-b border-border bg-surface px-4 flex items-center justify-between shrink-0 shadow-xs z-20">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-text-primary">{design.name}</span>
            <Badge variant="success" size="sm" className="flex items-center gap-1 font-mono">
              <HardDrive className="w-3 h-3" />
              100% Offline
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsExportModalOpen(true)}
            leftIcon={<Download className="w-4 h-4" />}
          >
            Export Artwork
          </Button>
        </div>
      </div>

      {/* ====================================================================
          MAIN 3-PANEL EDITOR WORKSPACE
          ==================================================================== */}
      <div className="flex flex-1 overflow-hidden">
        {/* PANEL 1 (LEFT): Add Tools, Layers, Mockup Styling */}
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
        />

        {/* PANEL 2 (CENTER): Canvas Dimension Bar + Interactive Canvas */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          <CanvasDimensionBar
            dimensions={design.dimensions}
            onDimensionsChange={handleDimensionsChange}
            activeView={design.activeView}
            onViewChange={handleViewChange}
            canUndo={historyIndex > 0}
            canRedo={historyIndex < history.length - 1}
            onUndo={handleUndo}
            onRedo={handleRedo}
          />

          <div className="flex-1 relative overflow-hidden">
            <CanvasWorkspace
              design={design}
              activeElementId={activeElementId}
              onSelectElement={setActiveElementId}
              onUpdateElement={handleUpdateElement}
              onCommitHistory={commitHistory}
              zoom={zoom}
              onZoomChange={setZoom}
              onFitToScreen={handleFitToScreen}
            />
          </div>
        </div>

        {/* PANEL 3 (RIGHT): Typography & Element Properties Inspector */}
        <PropertiesPanel
          design={design}
          activeElement={activeElement}
          onUpdateElement={handleUpdateElement}
          onCommitHistory={commitHistory}
          onDeleteElement={handleDeleteElement}
          onDuplicateElement={handleDuplicateElement}
          onAlignElement={handleAlignElement}
        />
      </div>

      {/* High-Resolution Local Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        design={design}
      />
    </div>
  );
};
