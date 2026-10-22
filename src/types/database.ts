/**
 * JerseyStudio Local Database Types
 * Strictly mirrors the local SQLite database schema defined in `src-tauri/src/db/schema.sql`.
 * Strict local-first privacy boundary: All project records, templates, elements, rosters,
 * variations, and exports stay entirely on the local device.
 */

export type GarmentType = 'jersey' | 't-shirt' | 'hoodie' | string;
export type CanvasUnit = 'px' | 'in' | 'mm' | 'cm';
export type ViewSide = 'front' | 'back';
export type ElementType = 'text' | 'image' | 'shape' | 'number' | 'name';
export type ValidationStatus = 'valid' | 'warning' | 'error';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';
export type ExportFormat = 'png' | 'pdf' | 'svg' | 'zip';
export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type LicenseStatus = 'active' | 'grace_period' | 'expired' | 'revoked';

/** Schema migration tracking table record */
export interface SchemaMigrationRecord {
  version: number;
  applied_at: string;
}

/** Project table record */
export interface ProjectRecord {
  id: string;
  name: string;
  garment_type: GarmentType;
  canvas_width: number;
  canvas_height: number;
  canvas_unit: CanvasUnit;
  dpi: number;
  created_at: string;
  updated_at: string;
}

/** Template table record */
export interface TemplateRecord {
  id: string;
  project_id: string;
  name: string;
  front_svg: string;
  back_svg: string;
  created_at: string;
}

/** Design elements placed on the jersey canvas */
export interface DesignElementRecord {
  id: string;
  project_id: string;
  view: ViewSide;
  element_type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  font_family?: string | null;
  font_size?: number | null;
  fill_color?: string | null;
  stroke_color?: string | null;
  stroke_width?: number | null;
  text_content?: string | null;
  field_binding?: string | null;
  z_index: number;
}

/** Roster import batch metadata */
export interface RosterImportRecord {
  id: string;
  project_id: string;
  filename: string;
  row_count: number;
  created_at: string;
}

/** Individual player roster item */
export interface RosterRecordItem {
  id: string;
  roster_id: string;
  row_index: number;
  player_name: string;
  player_number: string;
  size: string;
  validation_status: ValidationStatus;
  validation_notes?: string | null;
}

/** Generated jersey variation for a player */
export interface GeneratedVariationRecord {
  id: string;
  roster_record_id: string;
  view: ViewSide;
  output_preview_path: string;
  approval_status: ApprovalStatus;
  created_at: string;
}

/** Export batch job record */
export interface ExportJobRecord {
  id: string;
  project_id: string;
  format: ExportFormat;
  output_path: string;
  status: JobStatus;
  count: number;
  created_at: string;
}

/** Local settings key-value pair */
export interface LocalSettingRecord {
  key: string;
  value: string;
}

/** Local license cache for offline-first entitlement verification */
export interface LocalLicenseCacheRecord {
  entitlement_token: string;
  last_verified_online: string;
  offline_grace_period_days: number;
  cached_status: LicenseStatus;
}
