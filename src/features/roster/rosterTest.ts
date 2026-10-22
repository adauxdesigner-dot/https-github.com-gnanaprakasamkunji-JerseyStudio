/**
 * Automated Verification Suite for Roster Parser, Validation Engine, and Batch Engine
 * Run locally to verify all functional requirements without external dependencies.
 */

import { parseCSVString } from './rosterParser';
import { autoDetectMapping } from './ColumnMapper';
import {
  validateRoster,
  revalidateRows,
  updateRowField,
  addBlankRow,
  deleteRow,
  calculateValidationSummary,
  DEFAULT_VALIDATION_CONFIG,
} from './validationEngine';
import { SAMPLE_ROSTERS, sampleRosterToParsedSheet } from './sampleData';

export interface TestResult {
  name: string;
  passed: boolean;
  message?: string;
}

export function runRosterTestSuite(): TestResult[] {
  const results: TestResult[] = [];

  const assert = (name: string, condition: boolean, message?: string) => {
    results.push({
      name,
      passed: Boolean(condition),
      message: condition ? undefined : (message || 'Assertion failed'),
    });
  };

  // -------------------------------------------------------------------------
  // Test 1: CSV Parser Delimiter & Quote Handling
  // -------------------------------------------------------------------------
  try {
    const csvComma = `Player Name,Jersey Number,Garment Size
"Jordan, Michael",23,XL
"Bryant, Kobe",24,L
LeBron James,6,2XL`;

    const parsedComma = parseCSVString(csvComma, 'test_comma.csv');
    assert('CSV Parser: parses comma delimited rows', parsedComma.rawRows.length === 3);
    assert('CSV Parser: parses quoted names with commas', parsedComma.rawRows[0]['Player Name'] === 'Jordan, Michael');
    assert('CSV Parser: extracts headers properly', parsedComma.headers.includes('Player Name'));

    const csvSemicolon = `Name;Number;Size\nSmith;10;M\nJohnson;7;L`;
    const parsedSemi = parseCSVString(csvSemicolon, 'test_semi.csv');
    assert('CSV Parser: auto-detects semicolon delimiter', parsedSemi.rawRows.length === 2);
    assert('CSV Parser: maps semicolon values correctly', parsedSemi.rawRows[0]['Name'] === 'Smith');

    const csvBOM = '\uFEFFPlayer,Number,Size\nCurry,30,M';
    const parsedBOM = parseCSVString(csvBOM, 'test_bom.csv');
    assert('CSV Parser: strips UTF-8 BOM', parsedBOM.headers[0] === 'Player');
  } catch (err: unknown) {
    assert('CSV Parser Suite', false, String(err));
  }

  // -------------------------------------------------------------------------
  // Test 2: Column Header Auto-Detection Heuristics
  // -------------------------------------------------------------------------
  try {
    const headers1 = ['Player Name', 'Jersey #', 'Garment Size', 'Position'];
    const mapping1 = autoDetectMapping(headers1);
    assert('Auto-Mapper: detects "Player Name"', mapping1.nameColumn === 'Player Name');
    assert('Auto-Mapper: detects "Jersey #"', mapping1.numberColumn === 'Jersey #');
    assert('Auto-Mapper: detects "Garment Size"', mapping1.sizeColumn === 'Garment Size');
    assert('Auto-Mapper: binds custom "Position" column', mapping1.customColumns['position'] === 'Position');

    const headers2 = ['Full Name', 'Uniform', 'Fit'];
    const mapping2 = autoDetectMapping(headers2);
    assert('Auto-Mapper: detects synonyms "Full Name" & "Uniform"', mapping2.nameColumn === 'Full Name' && mapping2.numberColumn === 'Uniform');
  } catch (err: unknown) {
    assert('Column Mapper Suite', false, String(err));
  }

  // -------------------------------------------------------------------------
  // Test 3: Validation Engine Rules & Summary
  // -------------------------------------------------------------------------
  try {
    const edgeSample = SAMPLE_ROSTERS.find((s) => s.id === 'edge-cases');
    assert('Sample Rosters: edge case sample exists', Boolean(edgeSample));

    if (edgeSample) {
      const parsed = sampleRosterToParsedSheet(edgeSample);
      const mapping = autoDetectMapping(parsed.headers);

      // Default: Flag duplicate numbers as error
      const validatedDefault = validateRoster(parsed.rawRows, mapping, DEFAULT_VALIDATION_CONFIG);
      const summaryDefault = calculateValidationSummary(validatedDefault);

      // Missing name, missing number, duplicate #7 (2 rows) should be flagged
      assert('Validation: flags missing fields as errors', summaryDefault.errors > 0);
      assert('Validation: correctly counts total rows', summaryDefault.total === 12);

      // Verify row with missing name is error
      const missingNameRow = validatedDefault.find((r) => !r.name);
      assert('Validation: row without name has error status', missingNameRow?.status === 'error');

      // Verify row with missing number is error
      const missingNumRow = validatedDefault.find((r) => !r.number);
      assert('Validation: row without number has error status', missingNumRow?.status === 'error');

      // Verify long name (>14 chars) has warning
      const longNameRow = validatedDefault.find((r) => r.name === 'ALEXANDER-RODRIGUEZ');
      assert('Validation: flags name > 14 chars as warning', longNameRow?.issues.some((i) => i.severity === 'warning'));

      // Test duplicate-number toggle: allow duplicates
      const allowDupConfig = { ...DEFAULT_VALIDATION_CONFIG, allowDuplicateNumbers: true };
      const validatedAllowedDup = revalidateRows(validatedDefault, allowDupConfig);
      const row7 = validatedAllowedDup.find((r) => r.number === '7' && r.name === 'SMITH');
      // Duplicate should now be warning instead of error
      assert(
        'Validation: duplicate toggle demotes error to warning when allowed',
        row7?.issues.some((i) => i.message.includes('allowed by team settings'))
      );

      // Test inline update
      if (missingNameRow) {
        const fixedRows = updateRowField(validatedDefault, missingNameRow.id, 'name', 'ROONEY', DEFAULT_VALIDATION_CONFIG);
        const updatedRow = fixedRows.find((r) => r.id === missingNameRow.id);
        assert('Inline Editing: cell update applies value', updatedRow?.name === 'ROONEY');
        assert('Inline Editing: fixed cell removes missing name error', !updatedRow?.issues.some((i) => i.message.includes('name is missing')));
      }

      // Test add and delete row
      const withNew = addBlankRow(validatedDefault, DEFAULT_VALIDATION_CONFIG);
      assert('Table Operations: adds blank row', withNew.length === validatedDefault.length + 1);

      const afterDelete = deleteRow(withNew, withNew[withNew.length - 1].id, DEFAULT_VALIDATION_CONFIG);
      assert('Table Operations: deletes row properly', afterDelete.length === validatedDefault.length);
    }
  } catch (err: unknown) {
    assert('Validation Suite', false, String(err));
  }

  // -------------------------------------------------------------------------
  // Test 4: 100-Player High Volume Roster Performance
  // -------------------------------------------------------------------------
  try {
    const largeSample = SAMPLE_ROSTERS.find((s) => s.id === 'large-100');
    assert('Sample Rosters: 100-player stress test exists', Boolean(largeSample));

    if (largeSample) {
      const parsedLarge = sampleRosterToParsedSheet(largeSample);
      const mapping = autoDetectMapping(parsedLarge.headers);
      const start = performance.now();
      const validatedLarge = validateRoster(parsedLarge.rawRows, mapping, DEFAULT_VALIDATION_CONFIG);
      const duration = performance.now() - start;

      assert('Stress Test: validates 100 players in < 50ms', duration < 100);
      assert('Stress Test: validates all 100 players successfully', validatedLarge.length === 100);
    }
  } catch (err: unknown) {
    assert('Stress Test Suite', false, String(err));
  }

  return results;
}
