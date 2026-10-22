import { CanvasDimensions, CanvasUnit } from '@/components/ui/CanvasResizeControl';

export type GarmentView = 'front' | 'back';

export type CanvasLayerType = 'text' | 'dynamic_name' | 'dynamic_number' | 'shape';

export type DynamicBindingKey = 'player_name' | 'player_number' | 'custom';

export interface EditorElement {
  id: string;
  name: string;
  type: CanvasLayerType;
  view: GarmentView | 'both';
  
  // Physical coordinates on canvas (in inches)
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number; // degrees 0-360

  // Text properties
  text: string;
  bindingKey?: DynamicBindingKey;
  fontFamily: string;
  fontSize: number; // in points
  fontWeight: string | number; // 'normal' | 'bold' | '900'
  fillColor: string; // hex
  strokeColor?: string;
  strokeWidth?: number; // in points
  strokeEnabled?: boolean;
  letterSpacing?: number; // in px or em
  textAlign: 'left' | 'center' | 'right';
  textTransform?: 'uppercase' | 'none' | 'lowercase';
  
  // Shape properties
  shapeType?: 'rectangle' | 'circle' | 'badge' | 'stripe';

  // Management
  opacity: number; // 0 to 1
  locked: boolean;
  visible: boolean;
  zIndex: number;
}

export interface JerseyMockupConfig {
  primaryColor: string;
  collarColor: string;
  trimColor: string;
  accentColor: string;
  showSeams: boolean;
  showGuides: boolean;
}

export interface JerseyDesign {
  id: string;
  name: string;
  dimensions: CanvasDimensions;
  activeView: GarmentView;
  mockup: JerseyMockupConfig;
  elements: EditorElement[];
}

export interface HistoryState {
  elements: EditorElement[];
  mockup: JerseyMockupConfig;
  dimensions: CanvasDimensions;
  activeView: GarmentView;
}

export type ExportFormat = 'png' | 'jpg' | 'pdf';

export interface ExportOptions {
  format: ExportFormat;
  view: GarmentView | 'both';
  dpi: number;
  transparentBg: boolean;
  backgroundColor: string; // for JPG or solid PNG
  jpegQuality: number; // 0.1 to 1.0
  includeMockup: boolean;
  scaleMultiplier?: number;
}

export interface BatchRosterItem {
  id: string;
  name: string;
  number: string;
  size?: string;
}
