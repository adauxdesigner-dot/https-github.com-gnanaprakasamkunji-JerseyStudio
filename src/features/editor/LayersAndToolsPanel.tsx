import * as React from 'react';
import {
  Type,
  Sparkles,
  Shield,
  Square,
  Layers,
  Palette,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  Plus,
  Compass,
  Image as ImageIcon,
  Upload,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Switch } from '@/components/ui/Switch';
import {
  EditorElement,
  GarmentView,
  JerseyMockupConfig,
  CanvasLayerType,
} from './editorTypes';

export interface LayersAndToolsPanelProps {
  activeView: GarmentView;
  elements: EditorElement[];
  activeElementId: string | null;
  onSelectElement: (id: string | null) => void;
  onAddElement: (type: CanvasLayerType, defaultPreset?: Partial<EditorElement>) => void;
  onUpdateElement: (id: string, updates: Partial<EditorElement>) => void;
  onDeleteElement: (id: string) => void;
  onDuplicateElement: (id: string) => void;
  onReorderElement: (id: string, direction: 'up' | 'down') => void;
  mockupConfig: JerseyMockupConfig;
  onUpdateMockupConfig: (updates: Partial<JerseyMockupConfig>) => void;
  onOpenAssetUploader?: () => void;
}

type LeftPanelTab = 'add' | 'layers' | 'mockup';

const PRESET_FABRIC_COLORS = [
  { name: 'Navy Blue', hex: '#0B2545' },
  { name: 'Royal Blue', hex: '#1D4ED8' },
  { name: 'Scarlet Red', hex: '#DC2626' },
  { name: 'Burgundy', hex: '#831843' },
  { name: 'Emerald Green', hex: '#047857' },
  { name: 'Forest Green', hex: '#14532D' },
  { name: 'Athletic Gold', hex: '#EAB308' },
  { name: 'Amber Orange', hex: '#EA580C' },
  { name: 'Stealth Black', hex: '#0F172A' },
  { name: 'Optic White', hex: '#F8FAFC' },
];

export const LayersAndToolsPanel: React.FC<LayersAndToolsPanelProps> = ({
  activeView,
  elements,
  activeElementId,
  onSelectElement,
  onAddElement,
  onUpdateElement,
  onDeleteElement,
  onDuplicateElement,
  onReorderElement,
  mockupConfig,
  onUpdateMockupConfig,
  onOpenAssetUploader,
}) => {
  const [activeTab, setActiveTab] = React.useState<LeftPanelTab>('add');

  const visibleViewElements = elements
    .filter((el) => el.view === activeView || el.view === 'both')
    .sort((a, b) => b.zIndex - a.zIndex); // Show highest on top

  return (
    <aside className="w-72 bg-surface border-r border-border flex flex-col shrink-0 select-none shadow-xs">
      {/* ====================================================================
          TAB HEADER
          ==================================================================== */}
      <div className="h-12 border-b border-border flex items-center px-2 bg-surface-subtle/50">
        <div className="flex w-full bg-surface-subtle p-0.5 rounded-md border border-border">
          <button
            type="button"
            onClick={() => setActiveTab('add')}
            className={cn(
              'flex-1 py-1 rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition-all',
              activeTab === 'add'
                ? 'bg-surface text-primary shadow-xs'
                : 'text-text-secondary hover:text-text-primary'
            )}
          >
            <Plus className="w-3.5 h-3.5" />
            Add
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('layers')}
            className={cn(
              'flex-1 py-1 rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition-all relative',
              activeTab === 'layers'
                ? 'bg-surface text-primary shadow-xs'
                : 'text-text-secondary hover:text-text-primary'
            )}
          >
            <Layers className="w-3.5 h-3.5" />
            Layers
            <span className="text-[10px] bg-surface-muted px-1.5 rounded-full text-text-secondary">
              {visibleViewElements.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('mockup')}
            className={cn(
              'flex-1 py-1 rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition-all',
              activeTab === 'mockup'
                ? 'bg-surface text-primary shadow-xs'
                : 'text-text-secondary hover:text-text-primary'
            )}
          >
            <Palette className="w-3.5 h-3.5" />
            Jersey
          </button>
        </div>
      </div>

      {/* ====================================================================
          TAB 1: ADD ELEMENTS
          ==================================================================== */}
      {activeTab === 'add' && (
        <div className="p-4 space-y-5 overflow-y-auto flex-1">
          {/* Dynamic Personalization Fields */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-text-primary uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              Dynamic Personalization
            </div>
            <p className="text-[11px] text-text-secondary leading-tight">
              Fields automatically populated with player names and numbers during batch export.
            </p>

            <div className="grid grid-cols-1 gap-2 pt-1">
              <button
                type="button"
                onClick={() =>
                  onAddElement('dynamic_name', {
                    name: 'Player Name',
                    text: 'RODRIGUEZ',
                    bindingKey: 'player_name',
                    fontFamily: 'Impact',
                    fontSize: 48,
                    fillColor: '#FFFFFF',
                    strokeColor: '#000000',
                    strokeWidth: 2,
                    strokeEnabled: true,
                    textTransform: 'uppercase',
                    width: 14,
                    height: 2.5,
                    x: 3,
                    y: activeView === 'back' ? 5.5 : 8,
                  })
                }
                className="flex items-center gap-3 p-3 rounded-md border border-primary/30 bg-primary-subtle/30 hover:bg-primary-subtle hover:border-primary text-left transition-all group"
              >
                <div className="w-8 h-8 rounded bg-primary text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Type className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-text-primary group-hover:text-primary">
                    + Player Name Field
                  </div>
                  <div className="text-[10px] text-text-secondary font-mono">
                    Binds to {'{player_name}'}
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() =>
                  onAddElement('dynamic_number', {
                    name: 'Squad Number',
                    text: '10',
                    bindingKey: 'player_number',
                    fontFamily: 'Impact',
                    fontSize: 140,
                    fillColor: '#FFC72C',
                    strokeColor: '#000000',
                    strokeWidth: 4,
                    strokeEnabled: true,
                    width: 8,
                    height: 6,
                    x: 6,
                    y: activeView === 'back' ? 9 : 9,
                  })
                }
                className="flex items-center gap-3 p-3 rounded-md border border-primary/30 bg-primary-subtle/30 hover:bg-primary-subtle hover:border-primary text-left transition-all group"
              >
                <div className="w-8 h-8 rounded bg-primary text-white flex items-center justify-center shrink-0 shadow-xs font-black text-sm">
                  #
                </div>
                <div>
                  <div className="text-xs font-bold text-text-primary group-hover:text-primary">
                    + Squad Number Field
                  </div>
                  <div className="text-[10px] text-text-secondary font-mono">
                    Binds to {'{player_number}'}
                  </div>
                </div>
              </button>
            </div>
          </div>

          <div className="h-[1px] bg-border" />

          {/* Logos, Crests & Sponsor Ingestion */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-text-primary uppercase tracking-wider">
              <span>Sponsor Logos & Crests</span>
              <Badge variant="primary" size="sm" className="text-[9px]">Local Ingest</Badge>
            </div>
            <p className="text-[11px] text-text-secondary leading-tight">
              Ingest vector club crests and official sponsor marks (PNG, SVG, JPG).
            </p>

            {onOpenAssetUploader && (
              <button
                type="button"
                onClick={onOpenAssetUploader}
                className="w-full flex items-center justify-center gap-2 p-2.5 rounded-md border-2 border-dashed border-primary/40 bg-primary-subtle/20 hover:bg-primary-subtle/40 hover:border-primary text-primary font-bold text-xs transition-all shadow-xs"
              >
                <Upload className="w-4 h-4" />
                + Ingest Sponsor Logo / Crest
              </button>
            )}
          </div>

          <div className="h-[1px] bg-border" />

          {/* Static Design Elements */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-text-primary uppercase tracking-wider">
              Static Design Layers
            </div>

            <div className="grid grid-cols-1 gap-2 pt-1">
              <button
                type="button"
                onClick={() =>
                  onAddElement('text', {
                    name: 'Team Name Text',
                    text: 'FALCON FC',
                    fontFamily: 'Impact',
                    fontSize: 36,
                    fillColor: '#FFFFFF',
                    strokeEnabled: false,
                    width: 12,
                    height: 2,
                    x: 4,
                    y: 7,
                  })
                }
                className="flex items-center gap-3 p-2.5 rounded-md border border-border bg-surface hover:bg-surface-subtle text-left transition-all group"
              >
                <div className="w-7 h-7 rounded bg-surface-subtle border border-border flex items-center justify-center shrink-0 text-text-primary">
                  <Type className="w-3.5 h-3.5" />
                </div>
                <div className="text-xs font-semibold text-text-primary group-hover:text-primary">
                  Add Static Text / Team Name
                </div>
              </button>

              <button
                type="button"
                onClick={() =>
                  onAddElement('text', {
                    name: 'Curved Arch Text',
                    text: 'CHAMPIONS',
                    fontFamily: 'Impact',
                    fontSize: 34,
                    fillColor: '#FFC72C',
                    strokeEnabled: true,
                    strokeColor: '#000000',
                    strokeWidth: 3,
                    curvedTextEnabled: true,
                    curvePower: 50,
                    curveDirection: 'up',
                    width: 14,
                    height: 3.5,
                    x: 3,
                    y: 6.5,
                  })
                }
                className="flex items-center gap-3 p-2.5 rounded-md border border-border bg-surface hover:bg-surface-subtle text-left transition-all group"
              >
                <div className="w-7 h-7 rounded bg-surface-subtle border border-border flex items-center justify-center shrink-0 text-primary">
                  <Compass className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-text-primary group-hover:text-primary">
                    Add Curved / Arc Text
                  </div>
                  <div className="text-[10px] text-text-muted">Rainbow arch lettering</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() =>
                  onAddElement('shape', {
                    name: 'Chest Crest / Shield',
                    type: 'shape',
                    shapeType: 'circle',
                    fillColor: '#FFC72C',
                    strokeColor: '#FFFFFF',
                    strokeWidth: 2,
                    strokeEnabled: true,
                    width: 3.5,
                    height: 3.5,
                    x: 4.5,
                    y: 6.5,
                  })
                }
                className="flex items-center gap-3 p-2.5 rounded-md border border-border bg-surface hover:bg-surface-subtle text-left transition-all group"
              >
                <div className="w-7 h-7 rounded bg-surface-subtle border border-border flex items-center justify-center shrink-0 text-text-primary">
                  <Shield className="w-3.5 h-3.5" />
                </div>
                <div className="text-xs font-semibold text-text-primary group-hover:text-primary">
                  Add Crest / Emblem Shape
                </div>
              </button>

              <button
                type="button"
                onClick={() =>
                  onAddElement('shape', {
                    name: 'Sponsor / Stripe Block',
                    type: 'shape',
                    shapeType: 'rectangle',
                    fillColor: '#FFFFFF',
                    strokeEnabled: false,
                    width: 12,
                    height: 3,
                    x: 4,
                    y: 11,
                  })
                }
                className="flex items-center gap-3 p-2.5 rounded-md border border-border bg-surface hover:bg-surface-subtle text-left transition-all group"
              >
                <div className="w-7 h-7 rounded bg-surface-subtle border border-border flex items-center justify-center shrink-0 text-text-primary">
                  <Square className="w-3.5 h-3.5" />
                </div>
                <div className="text-xs font-semibold text-text-primary group-hover:text-primary">
                  Add Sponsor / Stripe Bar
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          TAB 2: LAYERS LIST
          ==================================================================== */}
      {activeTab === 'layers' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="p-2 border-b border-border bg-surface-subtle/40 flex items-center justify-between text-xs text-text-muted">
            <span>{visibleViewElements.length} elements on {activeView.replace('_', ' ')}</span>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {visibleViewElements.length === 0 ? (
              <div className="p-6 text-center text-xs text-text-muted">
                No elements on this view. Click "Add" tab to place artwork.
              </div>
            ) : (
              visibleViewElements.map((el) => {
                const isSelected = el.id === activeElementId;
                return (
                  <div
                    key={el.id}
                    onClick={() => onSelectElement(el.id)}
                    className={cn(
                      'flex items-center justify-between p-2 rounded border transition-all cursor-pointer group',
                      isSelected
                        ? 'border-primary bg-primary-subtle/40 text-primary'
                        : 'border-border/60 bg-surface hover:bg-surface-subtle text-text-primary'
                    )}
                  >
                    <div className="flex items-center gap-2 overflow-hidden mr-2">
                      {el.type === 'shape' ? (
                        <Square className="w-3.5 h-3.5 shrink-0 text-text-muted" />
                      ) : el.type === 'image' ? (
                        <ImageIcon className="w-3.5 h-3.5 shrink-0 text-primary" />
                      ) : (
                        <Type className="w-3.5 h-3.5 shrink-0 text-text-muted" />
                      )}
                      <span className="text-xs font-medium truncate">{el.name}</span>
                      {el.bindingKey && (
                        <Badge variant="primary" size="sm" className="text-[9px] py-0 px-1">
                          Dynamic
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-0.5 shrink-0">
                      {/* Reorder Up / Down */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onReorderElement(el.id, 'up');
                        }}
                        className="p-1 text-text-muted hover:text-text-primary rounded hover:bg-surface-muted"
                        title="Move Up"
                      >
                        <ChevronUp className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onReorderElement(el.id, 'down');
                        }}
                        className="p-1 text-text-muted hover:text-text-primary rounded hover:bg-surface-muted"
                        title="Move Down"
                      >
                        <ChevronDown className="w-3 h-3" />
                      </button>

                      {/* Visibility Toggle */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpdateElement(el.id, { visible: !el.visible });
                        }}
                        className="p-1 text-text-muted hover:text-text-primary rounded hover:bg-surface-muted"
                        title={el.visible ? 'Hide Element' : 'Show Element'}
                      >
                        {el.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-error" />}
                      </button>

                      {/* Lock Toggle */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpdateElement(el.id, { locked: !el.locked });
                        }}
                        className="p-1 text-text-muted hover:text-text-primary rounded hover:bg-surface-muted"
                        title={el.locked ? 'Unlock' : 'Lock'}
                      >
                        {el.locked ? <Lock className="w-3.5 h-3.5 text-warning" /> : <Unlock className="w-3.5 h-3.5" />}
                      </button>

                      {/* Duplicate */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDuplicateElement(el.id);
                        }}
                        className="p-1 text-text-muted hover:text-text-primary rounded hover:bg-surface-muted"
                        title="Duplicate"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteElement(el.id);
                        }}
                        className="p-1 text-text-muted hover:text-error rounded hover:bg-error-subtle/50"
                        title="Delete Element"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ====================================================================
          TAB 3: GARMENT MOCKUP STYLING
          ==================================================================== */}
      {activeTab === 'mockup' && (
        <div className="p-4 space-y-5 overflow-y-auto flex-1">
          {/* Primary Fabric Color */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-text-primary uppercase tracking-wider block">
              Main Fabric Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={mockupConfig.primaryColor}
                onChange={(e) => onUpdateMockupConfig({ primaryColor: e.target.value })}
                className="w-8 h-8 rounded border border-border cursor-pointer p-0.5"
              />
              <span className="font-mono text-xs uppercase">{mockupConfig.primaryColor}</span>
            </div>

            {/* Quick color swatches */}
            <div className="grid grid-cols-5 gap-1.5 pt-1">
              {PRESET_FABRIC_COLORS.map((c) => (
                <button
                  key={c.name}
                  onClick={() => onUpdateMockupConfig({ primaryColor: c.hex })}
                  style={{ backgroundColor: c.hex }}
                  className={cn(
                    'w-6 h-6 rounded border border-border/80 transition-transform hover:scale-110 shadow-xs',
                    mockupConfig.primaryColor.toLowerCase() === c.hex.toLowerCase() && 'ring-2 ring-primary ring-offset-1'
                  )}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          <div className="h-[1px] bg-border" />

          {/* Collar & Ribbing Color */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-text-primary uppercase tracking-wider block">
              Collar & Ribbing
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={mockupConfig.collarColor}
                onChange={(e) => onUpdateMockupConfig({ collarColor: e.target.value })}
                className="w-8 h-8 rounded border border-border cursor-pointer p-0.5"
              />
              <span className="font-mono text-xs uppercase">{mockupConfig.collarColor}</span>
            </div>
          </div>

          <div className="h-[1px] bg-border" />

          {/* Accent Side Panels */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-text-primary uppercase tracking-wider block">
              Accent Side Panels
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={mockupConfig.accentColor}
                onChange={(e) => onUpdateMockupConfig({ accentColor: e.target.value })}
                className="w-8 h-8 rounded border border-border cursor-pointer p-0.5"
              />
              <span className="font-mono text-xs uppercase">{mockupConfig.accentColor}</span>
            </div>
          </div>

          <div className="h-[1px] bg-border" />

          {/* Cuff & Hem Trim */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-text-primary uppercase tracking-wider block">
              Sleeve & Hem Trim
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={mockupConfig.trimColor}
                onChange={(e) => onUpdateMockupConfig({ trimColor: e.target.value })}
                className="w-8 h-8 rounded border border-border cursor-pointer p-0.5"
              />
              <span className="font-mono text-xs uppercase">{mockupConfig.trimColor}</span>
            </div>
          </div>

          <div className="h-[1px] bg-border" />

          {/* Seams & Guidelines Toggles */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-medium text-text-primary">Show Realistic Stitching</div>
                <div className="text-[10px] text-text-secondary">Raglan & yoke seamlines</div>
              </div>
              <Switch
                checked={mockupConfig.showSeams}
                onChange={(checked: boolean) => onUpdateMockupConfig({ showSeams: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-medium text-text-primary">Show Safe Print Zones</div>
                <div className="text-[10px] text-text-secondary">Chest & name guide boxes</div>
              </div>
              <Switch
                checked={mockupConfig.showGuides}
                onChange={(checked: boolean) => onUpdateMockupConfig({ showGuides: checked })}
              />
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
