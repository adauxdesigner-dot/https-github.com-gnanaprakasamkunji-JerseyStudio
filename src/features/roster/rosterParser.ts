/**
 * Local CSV and Excel (XLSX/XLS) Parser
 * 100% Client-side execution — Zero network transfers.
 */

import * as XLSX from 'xlsx';
import { ParsedSheetData } from './types';

export interface ParseOptions {
  activeSheetIndex?: number;
  maxRows?: number;
}

/**
 * Parses a File object (CSV, TSV, or XLSX/XLS) entirely locally in browser/Tauri.
 */
export async function parseRosterFile(
  file: File,
  options: ParseOptions = {}
): Promise<ParsedSheetData> {
  const fileName = file.name;
  const fileSize = file.size;
  const lowerName = fileName.toLowerCase();

  if (fileSize > 25 * 1024 * 1024) {
    throw new Error('File exceeds maximum supported size (25MB).');
  }

  if (lowerName.endsWith('.csv') || lowerName.endsWith('.txt') || lowerName.endsWith('.tsv')) {
    const text = await readFileAsText(file);
    return parseCSVString(text, fileName, fileSize);
  }

  if (lowerName.endsWith('.xlsx') || lowerName.endsWith('.xls')) {
    const arrayBuffer = await file.arrayBuffer();
    return parseExcelBuffer(arrayBuffer, fileName, fileSize, options);
  }

  throw new Error(
    `Unsupported file format: "${fileName}". Please provide a CSV, TSV, or Excel (.xlsx, .xls) file.`
  );
}

/**
 * Reads a text file safely with BOM detection (UTF-8, UTF-16).
 */
async function readFileAsText(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);

  // Check UTF-8 BOM (EF BB BF)
  if (bytes.length >= 3 && bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) {
    const decoder = new TextDecoder('utf-8');
    return decoder.decode(bytes.subarray(3));
  }

  // Check UTF-16 LE BOM (FF FE)
  if (bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xfe) {
    const decoder = new TextDecoder('utf-16le');
    return decoder.decode(bytes.subarray(2));
  }

  // Check UTF-16 BE BOM (FE FF)
  if (bytes.length >= 2 && bytes[0] === 0xfe && bytes[1] === 0xff) {
    const decoder = new TextDecoder('utf-16be');
    return decoder.decode(bytes.subarray(2));
  }

  // Default UTF-8
  const decoder = new TextDecoder('utf-8');
  return decoder.decode(buffer);
}

/**
 * Parses raw CSV/TSV text with delimiter detection, quote handling, and clean row extraction.
 */
export function parseCSVString(
  csvContent: string,
  fileName = 'imported_roster.csv',
  fileSize = csvContent.length
): ParsedSheetData {
  if (!csvContent || csvContent.trim().length === 0) {
    throw new Error('The imported file is empty.');
  }

  // Remove leading BOM if left in string
  const cleanContent = csvContent.replace(/^\uFEFF/, '').trim();
  const rawLines = splitCSVLines(cleanContent);

  if (rawLines.length === 0) {
    throw new Error('No readable data rows found in CSV.');
  }

  // Delimiter detection on first non-empty line
  const delimiter = detectDelimiter(rawLines[0]);

  // Parse each line into cell arrays
  const parsedRows: string[][] = [];
  for (const line of rawLines) {
    const cells = parseCSVLine(line, delimiter).map((cell) => cell.trim());
    // Only keep if at least one cell has content
    if (cells.some((c) => c.length > 0)) {
      parsedRows.push(cells);
    }
  }

  if (parsedRows.length === 0) {
    throw new Error('All lines in the file are blank or whitespace.');
  }

  // Headers from first line
  const rawHeaders = parsedRows[0];
  const headers = normalizeHeaders(rawHeaders);

  // Remaining lines as data rows
  const dataRows = parsedRows.slice(1);
  const rawRecords: Record<string, string>[] = [];

  for (const rowCells of dataRows) {
    const record: Record<string, string> = {};
    headers.forEach((header, index) => {
      record[header] = rowCells[index] !== undefined ? rowCells[index] : '';
    });
    rawRecords.push(record);
  }

  return {
    fileName,
    fileSize,
    sheetNames: ['CSV Data'],
    activeSheet: 'CSV Data',
    headers,
    rawRows: rawRecords,
    totalRawRows: rawRecords.length,
  };
}

/**
 * Parses an Excel array buffer locally via SheetJS.
 */
export function parseExcelBuffer(
  buffer: ArrayBuffer,
  fileName: string,
  fileSize: number,
  options: ParseOptions = {}
): ParsedSheetData {
  let workbook: XLSX.WorkBook;
  try {
    workbook = XLSX.read(buffer, {
      type: 'array',
      cellDates: true,
      raw: false,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`Failed to parse Excel workbook: ${msg}`);
  }

  const sheetNames = workbook.SheetNames;
  if (!sheetNames || sheetNames.length === 0) {
    throw new Error('Excel workbook contains no sheets.');
  }

  const sheetIndex = options.activeSheetIndex ?? 0;
  const activeSheet = sheetNames[sheetIndex] || sheetNames[0];
  const worksheet = workbook.Sheets[activeSheet];

  if (!worksheet) {
    throw new Error(`Worksheet "${activeSheet}" could not be opened.`);
  }

  // Convert to 2D array of values
  const matrix: unknown[][] = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    defval: '',
    blankrows: false,
  });

  if (!matrix || matrix.length === 0) {
    throw new Error(`Sheet "${activeSheet}" is empty.`);
  }

  // First non-empty row is headers
  let headerRowIndex = 0;
  while (headerRowIndex < matrix.length && (!matrix[headerRowIndex] || matrix[headerRowIndex].length === 0)) {
    headerRowIndex++;
  }

  if (headerRowIndex >= matrix.length) {
    throw new Error(`No header row found in sheet "${activeSheet}".`);
  }

  const rawHeaders = (matrix[headerRowIndex] || []).map((val) => String(val ?? '').trim());
  const headers = normalizeHeaders(rawHeaders);

  const rawRecords: Record<string, string>[] = [];
  for (let r = headerRowIndex + 1; r < matrix.length; r++) {
    const row = matrix[r];
    if (!row || row.length === 0) continue;

    const rowCells = row.map((cell) => {
      if (cell === null || cell === undefined) return '';
      return String(cell).trim();
    });

    // Check if entire row is empty
    const hasData = rowCells.some((c) => c.length > 0);
    if (!hasData) continue;

    const record: Record<string, string> = {};
    headers.forEach((header, colIdx) => {
      record[header] = rowCells[colIdx] !== undefined ? rowCells[colIdx] : '';
    });
    rawRecords.push(record);
  }

  return {
    fileName,
    fileSize,
    sheetNames,
    activeSheet,
    headers,
    rawRows: rawRecords,
    totalRawRows: rawRecords.length,
  };
}

/**
 * Delimiter auto-detection: checks comma, semicolon, tab, and pipe.
 */
function detectDelimiter(sampleLine: string): string {
  const delimiters = [',', ';', '\t', '|'];
  let bestDelimiter = ',';
  let maxCount = -1;

  for (const delim of delimiters) {
    let count = 0;
    let inQuotes = false;
    for (let i = 0; i < sampleLine.length; i++) {
      const char = sampleLine[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (!inQuotes && char === delim) {
        count++;
      }
    }
    if (count > maxCount) {
      maxCount = count;
      bestDelimiter = delim;
    }
  }

  return maxCount > 0 ? bestDelimiter : ',';
}

/**
 * Splits a CSV string into lines while respecting quoted newlines.
 */
function splitCSVLines(text: string): string[] {
  const lines: string[] = [];
  let currentLine = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentLine += '""';
        i++; // Skip escaped quote
      } else {
        inQuotes = !inQuotes;
        currentLine += char;
      }
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++; // Skip \n
      }
      if (currentLine.trim().length > 0) {
        lines.push(currentLine);
      }
      currentLine = '';
    } else {
      currentLine += char;
    }
  }

  if (currentLine.trim().length > 0) {
    lines.push(currentLine);
  }

  return lines;
}

/**
 * Parses a single CSV line into an array of cell values.
 */
function parseCSVLine(line: string, delimiter: string): string[] {
  const cells: string[] = [];
  let currentCell = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentCell += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      cells.push(currentCell);
      currentCell = '';
    } else {
      currentCell += char;
    }
  }
  cells.push(currentCell);
  return cells;
}

/**
 * Cleans header names, deduplicates duplicate headers, and fills blank headers.
 */
function normalizeHeaders(rawHeaders: string[]): string[] {
  const seenCount: Record<string, number> = {};
  return rawHeaders.map((hdr, idx) => {
    let clean = hdr.trim();
    if (!clean) {
      clean = `Column ${idx + 1}`;
    }
    if (seenCount[clean]) {
      seenCount[clean]++;
      clean = `${clean} (${seenCount[clean]})`;
    } else {
      seenCount[clean] = 1;
    }
    return clean;
  });
}
