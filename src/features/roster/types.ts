/**
 * Types for Roster Import, Column Mapping, Validation, and Batch Generation
 * Strictly local-first — no network transfers.
 */

export interface ParsedSheetData {
  fileName: string;
  fileSize: number;
  sheetNames: string[];
  activeSheet: string;
  headers: string[];
  rawRows: Record<string, string>[];
  totalRawRows: number;
}

export type TemplateFieldKey = 'name' | 'number' | 'size' | string;

export interface ColumnMappingConfig {
  nameColumn: string;
  numberColumn: string;
  sizeColumn: string;
  customColumns: Record<string, string>; // templateFieldKey -> fileHeader
}

export interface ValidationRuleConfig {
  requireName: boolean;
  requireNumber: boolean;
  allowDuplicateNumbers: boolean;
  maxNameLength: number; // e.g., 14 characters default before warning of jersey text overflow
  strictNumberDigitsOnly: boolean;
  allowedSizes: string[];
}

export type IssueSeverity = 'error' | 'warning';

export interface RosterRowIssue {
  field: 'name' | 'number' | 'size' | string;
  severity: IssueSeverity;
  message: string;
}

export type RowValidationStatus = 'valid' | 'warning' | 'error';

export interface ValidatedRosterRow {
  id: string;
  rowNumber: number;
  name: string;
  number: string;
  size: string;
  extraData: Record<string, string>;
  status: RowValidationStatus;
  issues: RosterRowIssue[];
}

export interface ValidationSummary {
  total: number;
  valid: number;
  warnings: number;
  errors: number;
  canProceedToBatch: boolean;
}

export type BatchExportFormat = 'png' | 'jpg' | 'pdf' | 'zip';

export type BatchItemStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'skipped';

export interface BatchItemResult {
  rowId: string;
  rowNumber: number;
  playerName: string;
  playerNumber: string;
  playerSize: string;
  status: BatchItemStatus;
  error?: string;
  outputBlob?: Blob;
  outputFileName: string;
  dataUrl?: string; // Data URL for live rendering in the UI
  durationMs?: number;
}

export interface BatchProgress {
  total: number;
  completed: number;
  failed: number;
  remaining: number;
  currentItemName?: string;
  isGenerating: boolean;
  isPaused: boolean;
  isFinished: boolean;
  percent: number;
}

export interface JerseyRenderOptions {
  format: BatchExportFormat;
  includeFrontView: boolean;
  includeBackView: boolean;
  width: number;
  height: number;
  dpi: number;
  quality: number; // for jpg: 0.1 to 1.0
  backgroundColor: string; // for jpg background fill
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  teamName: string;
}
