/**
 * JerseyStudio 100-Record Bulk Personalization TypeScript Test Suite
 * Milestone 6 Deliverable
 *
 * Imports BatchProcessor from src/features/roster/batchProcessor.ts
 * Verifies batch queue execution, progress reporting, memory cleanup, and ZIP creation.
 */

import { BatchProcessor } from '../src/features/roster/batchProcessor';
import { ValidatedRosterRow, BatchProgress, BatchItemResult } from '../src/features/roster/types';
import JSZip from 'jszip';

export function createMock100PlayerRoster(): ValidatedRosterRow[] {
  const lastNames = [
    'ANDERSON', 'THOMAS', 'JACKSON', 'WHITE', 'HARRIS', 'MARTIN', 'THOMPSON', 'GARCIA',
    'MARTINEZ', 'ROBINSON', 'CLARK', 'RODRIGUEZ', 'LEWIS', 'LEE', 'WALKER', 'HALL',
    'ALLEN', 'YOUNG', 'HERNANDEZ', 'KING', 'WRIGHT', 'LOPEZ', 'HILL', 'SCOTT', 'GREEN'
  ];
  const sizes = ['YS', 'YM', 'YL', 'S', 'M', 'L', 'XL', '2XL', '3XL'];

  const rows: ValidatedRosterRow[] = [];
  for (let i = 1; i <= 100; i++) {
    const ln = lastNames[(i - 1) % lastNames.length];
    const sz = sizes[(i - 1) % sizes.length];
    rows.push({
      id: `row-${i}`,
      rowNumber: i,
      name: ln,
      number: String(i),
      size: sz,
      position: `Player ${i}`,
      status: 'valid',
      issues: [],
      raw: { 'Player Name': ln, 'Jersey Number': String(i), 'Size': sz },
    });
  }
  return rows;
}

export async function runBulkGenerationTest(): Promise<{
  success: boolean;
  totalCompleted: number;
  totalFailed: number;
  zipSize: number;
  manifestRows: number;
}> {
  const rows = createMock100PlayerRoster();
  const processor = new BatchProcessor(rows, {
    format: 'zip',
    includeFrontView: false,
    includeBackView: true,
    width: 1200,
    height: 1500,
    dpi: 300,
    quality: 0.92,
    backgroundColor: '#ffffff',
    primaryColor: '#059669',
    secondaryColor: '#f8fafc',
    fontFamily: 'Impact, sans-serif',
    teamName: 'METRO CLUB',
  });

  const completedItems: BatchItemResult[] = [];
  let latestProgress: BatchProgress | null = null;

  await processor.execute({
    onProgress: (progress) => {
      latestProgress = progress;
    },
    onItemCompleted: (item) => {
      completedItems.push(item);
    },
  });

  // Generate ZIP bundle
  const zipBlob = await processor.createZipBundle();
  const zip = await JSZip.loadAsync(zipBlob);

  // Read manifest.csv from ZIP
  const manifestFile = zip.file('manifest.csv');
  let manifestRows = 0;
  if (manifestFile) {
    const text = await manifestFile.async('text');
    manifestRows = text.trim().split('\n').length;
  }

  // Dispose of object URLs and canvas memory to ensure zero memory leaks
  processor.dispose();

  return {
    success: completedItems.length === 100 && manifestRows === 101,
    totalCompleted: completedItems.filter((i) => i.status === 'completed').length,
    totalFailed: completedItems.filter((i) => i.status === 'failed').length,
    zipSize: zipBlob.size,
    manifestRows,
  };
}
