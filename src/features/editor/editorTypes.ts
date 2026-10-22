import { CanvasDimensions } from '@/components/ui/CanvasResizeControl';

export type GarmentView = 'front' | 'back' | 'half_sleeve' | 'full_sleeve';

export type CanvasLayerType = 'text' | 'dynamic_name' | 'dynamic_number' | 'shape' | 'image';

export type DynamicBindingKey = 'player_name' | 'player_number' | 'custom';

export type StrokeCornerJoin = 'miter' | 'bevel' | 'round';

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
  strokeJoin?: StrokeCornerJoin; // 'miter' | 'bevel' | 'round'
  letterSpacing?: number; // in px or em
  textAlign: 'left' | 'center' | 'right';
  textTransform?: 'uppercase' | 'none' | 'lowercase';

  // Advanced Text Effects: Curved / Arc Text
  curvedTextEnabled?: boolean;
  curvePower?: number; // 0 to 100
  curveDirection?: 'up' | 'down'; // 'up' (rainbow arch) | 'down' (smile arch)

  // Advanced Text Effects: Text Box Background
  bgEnabled?: boolean;
  bgColor?: string;
  bgOpacity?: number; // 0 to 1
  bgCornerRadius?: number; // 0 to 50
  bgPadding?: number; // 0 to 50

  // Advanced Text Effects: Drop Shadow
  shadowEnabled?: boolean;
  shadowColor?: string;
  shadowBlur?: number; // 0 to 50
  shadowOffsetX?: number; // -50 to 50
  shadowOffsetY?: number; // -50 to 50
  shadowOpacity?: number; // 0 to 1

  // Shape properties
  shapeType?: 'rectangle' | 'circle' | 'badge' | 'stripe';

  // Image / Local Logo properties
  imageSrc?: string;
  imageFileName?: string;
  imageMimeType?: string;

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

export interface CustomFontItem {
  id: string;
  name: string;
  family: string;
  source: 'sports' | 'system' | 'uploaded';
  category?: 'varsity' | 'block' | 'collegiate' | 'sans' | 'serif' | 'display';
  previewUrl?: string;
  format?: string;
}

export interface GarmentSizeItem {
  id: string;
  name: string;
  category: 'youth' | 'adult';
  widthInches: number;
  heightInches: number;
  description: string;
}
