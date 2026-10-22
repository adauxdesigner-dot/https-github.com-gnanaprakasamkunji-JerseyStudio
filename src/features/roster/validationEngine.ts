/**
 * Local Row Validation Engine for Roster Data
 * Strictly client-side execution — Zero network transfers.
 */

import {
  ColumnMappingConfig,
  ValidationRuleConfig,
  ValidatedRosterRow,
  RosterRowIssue,
  ValidationSummary,
  RowValidationStatus,
} from './types';

export const DEFAULT_VALIDATION_CONFIG: ValidationRuleConfig = {
  requireName: true,
  requireNumber: true,
  allowDuplicateNumbers: false, // Flag duplicates by default
  maxNameLength: 14, // Common threshold for standard adult jersey back arch
  strictNumberDigitsOnly: true,
  allowedSizes: ['YXS', 'YS', 'YM', 'YL', 'YXL', 'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'],
};

/**
 * Validates a list of raw records mapped by column mapping against validation rules.
 */
export function validateRoster(
  rawRows: Record<string, string>[],
  mapping: ColumnMappingConfig,
  config: ValidationRuleConfig = DEFAULT_VALIDATION_CONFIG
): ValidatedRosterRow[] {
  // First pass: extract mapped values
  const rows: ValidatedRosterRow[] = rawRows.map((raw, index) => {
    const name = (raw[mapping.nameColumn] ?? '').trim();
    const number = (raw[mapping.numberColumn] ?? '').trim();
    const size = (raw[mapping.sizeColumn] ?? '').trim();

    // Extract any extra columns
    const extraData: Record<string, string> = {};
    for (const [key, colName] of Object.entries(mapping.customColumns)) {
      extraData[key] = (raw[colName] ?? '').trim();
    }

    return {
      id: `row-${index + 1}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      rowNumber: index + 1,
      name,
      number,
      size,
      extraData,
      status: 'valid' as RowValidationStatus,
      issues: [],
    };
  });

  return revalidateRows(rows, config);
}

/**
 * Re-runs full validation over an existing set of validated rows.
 * Recalculates duplicate numbers, length overflow, and missing values.
 */
export function revalidateRows(
  rows: ValidatedRosterRow[],
  config: ValidationRuleConfig = DEFAULT_VALIDATION_CONFIG
): ValidatedRosterRow[] {
  // Map of number -> row indices to detect duplicate jersey numbers
  const numberCount: Record<string, number[]> = {};

  rows.forEach((row, idx) => {
    const numClean = row.number.trim().toUpperCase();
    if (numClean) {
      if (!numberCount[numClean]) {
        numberCount[numClean] = [];
      }
      numberCount[numClean].push(idx);
    }
  });

  return rows.map((row, idx) => {
    const issues: RosterRowIssue[] = [];

    // 1. Player Name Validation
    if (config.requireName && !row.name.trim()) {
      issues.push({
        field: 'name',
        severity: 'error',
        message: 'Player name is missing.',
      });
    } else if (row.name.trim().length > config.maxNameLength) {
      issues.push({
        field: 'name',
        severity: 'warning',
        message: `Name length (${row.name.length} chars) exceeds ${config.maxNameLength} chars. Text may auto-shrink or overflow.`,
      });
    }

    // 2. Jersey Number Validation
    if (config.requireNumber && !row.number.trim()) {
      issues.push({
        field: 'number',
        severity: 'error',
        message: 'Jersey number is missing.',
      });
    } else if (row.number.trim()) {
      if (config.strictNumberDigitsOnly) {
        // Allow standard numbers: 0 to 999, 00, etc.
        const isNumeric = /^[0-9]+$/.test(row.number.trim());
        if (!isNumeric) {
          issues.push({
            field: 'number',
            severity: 'warning',
            message: 'Jersey number contains non-numeric characters.',
          });
        }
      }

      // Check duplicate number
      const numKey = row.number.trim().toUpperCase();
      const occurrences = numberCount[numKey] || [];
      if (occurrences.length > 1) {
        const otherRows = occurrences
          .filter((i) => i !== idx)
          .map((i) => rows[i].rowNumber)
          .join(', ');

        if (!config.allowDuplicateNumbers) {
          issues.push({
            field: 'number',
            severity: 'error',
            message: `Duplicate jersey #${row.number} (shared with row ${otherRows}).`,
          });
        } else {
          issues.push({
            field: 'number',
            severity: 'warning',
            message: `Duplicate jersey #${row.number} (shared with row ${otherRows}) — allowed by team settings.`,
          });
        }
      }
    }

    // 3. Garment Size Validation
    if (row.size.trim() && config.allowedSizes.length > 0) {
      const upperSize = row.size.trim().toUpperCase();
      const isKnownSize = config.allowedSizes.some((s) => s.toUpperCase() === upperSize);
      if (!isKnownSize) {
        issues.push({
          field: 'size',
          severity: 'warning',
          message: `Non-standard size "${row.size}". Standard sizes: ${config.allowedSizes.join(', ')}.`,
        });
      }
    }

    // Determine row-level status
    let status: RowValidationStatus = 'valid';
    if (issues.some((i) => i.severity === 'error')) {
      status = 'error';
    } else if (issues.some((i) => i.severity === 'warning')) {
      status = 'warning';
    }

    return {
      ...row,
      rowNumber: idx + 1,
      status,
      issues,
    };
  });
}

/**
 * Updates a specific cell in a validated row and immediately triggers revalidation.
 */
export function updateRowField(
  rows: ValidatedRosterRow[],
  rowId: string,
  field: 'name' | 'number' | 'size' | string,
  value: string,
  config: ValidationRuleConfig = DEFAULT_VALIDATION_CONFIG
): ValidatedRosterRow[] {
  const updatedRows = rows.map((r) => {
    if (r.id !== rowId) return r;
    if (field === 'name') return { ...r, name: value };
    if (field === 'number') return { ...r, number: value };
    if (field === 'size') return { ...r, size: value };
    return {
      ...r,
      extraData: { ...r.extraData, [field]: value },
    };
  });

  return revalidateRows(updatedRows, config);
}

/**
 * Appends a new blank player row.
 */
export function addBlankRow(
  rows: ValidatedRosterRow[],
  config: ValidationRuleConfig = DEFAULT_VALIDATION_CONFIG
): ValidatedRosterRow[] {
  const newRow: ValidatedRosterRow = {
    id: `row-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
    rowNumber: rows.length + 1,
    name: 'NEW PLAYER',
    number: '',
    size: 'L',
    extraData: {},
    status: 'error',
    issues: [],
  };

  return revalidateRows([...rows, newRow], config);
}

/**
 * Removes a row by ID and renumbers subsequent rows.
 */
export function deleteRow(
  rows: ValidatedRosterRow[],
  rowId: string,
  config: ValidationRuleConfig = DEFAULT_VALIDATION_CONFIG
): ValidatedRosterRow[] {
  const remaining = rows.filter((r) => r.id !== rowId);
  return revalidateRows(remaining, config);
}

/**
 * Computes high-level summary statistics for the validation view.
 */
export function calculateValidationSummary(rows: ValidatedRosterRow[]): ValidationSummary {
  let valid = 0;
  let warnings = 0;
  let errors = 0;

  for (const row of rows) {
    if (row.status === 'valid') valid++;
    else if (row.status === 'warning') warnings++;
    else if (row.status === 'error') errors++;
  }

  return {
    total: rows.length,
    valid,
    warnings,
    errors,
    canProceedToBatch: rows.length > 0 && errors === 0,
  };
}
