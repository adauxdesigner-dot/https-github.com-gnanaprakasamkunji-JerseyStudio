/**
 * Shared Type Definitions for JerseyStudio Frontend
 */

export type GarmentView = 'front' | 'back';

export type LengthUnit = 'in' | 'cm' | 'mm' | 'px';

export interface DocumentDimensions {
  width: number;
  height: number;
  unit: LengthUnit;
  dpi: number;
}

export type PersonalizationFieldType = 'text' | 'number' | 'image';

export interface PersonalizationField {
  id: string;
  name: string;
  type: PersonalizationFieldType;
  bindingKey: string;
  defaultVal: string;
  maxWidthInches: number;
  maxHeightInches: number;
  fontFamily: string;
  fontSize: number;
  fillColor: string;
  strokeColor?: string;
  strokeWidth?: number;
  textTransform?: 'uppercase' | 'none';
  autoFit: boolean;
}

export interface PlayerRosterRow {
  id: string;
  rowNumber: number;
  data: Record<string, string>;
  validationStatus: 'valid' | 'warning' | 'error';
  validationMessage?: string;
}

export interface ProjectMetadata {
  id: string;
  name: string;
  sport: string;
  createdAt: string;
  updatedAt: string;
  views: GarmentView[];
  dimensions: DocumentDimensions;
}
