/**
 * Column Mapping Interface
 * Maps spreadsheet columns to jersey template personalization fields.
 * 100% Client-side.
 */

import * as React from 'react';
import {
  ArrowRight,
  Sparkles,
  FileSpreadsheet,
  Table as TableIcon,
} from 'lucide-react';
import { Button, Select, Badge, Alert } from '@/components/ui';
import { ParsedSheetData, ColumnMappingConfig } from './types';

export interface ColumnMapperProps {
  parsedData: ParsedSheetData;
  initialMapping?: ColumnMappingConfig;
  onConfirmMapping: (mapping: ColumnMappingConfig) => void;
  onBack: () => void;
}

/**
 * Intelligent heuristics to auto-detect header bindings
 */
export function autoDetectMapping(headers: string[]): ColumnMappingConfig {
  const findMatch = (regexList: RegExp[]): string => {
    for (const regex of regexList) {
      const match = headers.find((h) => regex.test(h.trim()));
      if (match) return match;
    }
    return '';
  };

  const nameColumn = findMatch([
    /^player\s*name$/i,
    /^full\s*name$/i,
    /^last\s*name$/i,
    /^name$/i,
    /player/i,
    /athlete/i,
  ]);

  const numberColumn = findMatch([
    /^jersey\s*(#|no|number)$/i,
    /^(#|no\.?|num|number)$/i,
    /^uniform$/i,
    /^squad\s*(#|no|number)$/i,
    /number/i,
    /#/i,
  ]);

  const sizeColumn = findMatch([
    /^jersey\s*size$/i,
    /^garment\s*size$/i,
    /^size$/i,
    /^fit$/i,
    /size/i,
  ]);

  // Capture other useful columns (e.g. position, nickname, sponsor)
  const standardAssigned = new Set([nameColumn, numberColumn, sizeColumn].filter(Boolean));
  const customColumns: Record<string, string> = {};

  headers.forEach((h) => {
    if (!standardAssigned.has(h)) {
      if (/position|pos/i.test(h)) {
        customColumns['position'] = h;
      } else if (/sponsor|logo/i.test(h)) {
        customColumns['sponsor'] = h;
      }
    }
  });

  return {
    nameColumn: nameColumn || (headers[0] ?? ''),
    numberColumn: numberColumn || (headers[1] ?? ''),
    sizeColumn: sizeColumn || (headers[2] ?? ''),
    customColumns,
  };
}

export const ColumnMapper: React.FC<ColumnMapperProps> = ({
  parsedData,
  initialMapping,
  onConfirmMapping,
  onBack,
}) => {
  const [mapping, setMapping] = React.useState<ColumnMappingConfig>(() => {
    return initialMapping || autoDetectMapping(parsedData.headers);
  });

  const headerOptions = React.useMemo(() => {
    const list = parsedData.headers.map((h) => ({
      value: h,
      label: h,
    }));
    return [{ value: '', label: '— Do Not Map (Omit) —' }, ...list];
  }, [parsedData.headers]);

  // Handle resetting / re-running auto detection
  const handleAutoDetect = () => {
    const detected = autoDetectMapping(parsedData.headers);
    setMapping(detected);
  };

  // Preview the first 3 rows using current mapping
  const previewRows = React.useMemo(() => {
    return parsedData.rawRows.slice(0, 3).map((row, idx) => ({
      rowNum: idx + 1,
      name: mapping.nameColumn ? row[mapping.nameColumn] || '—' : '—',
      number: mapping.numberColumn ? row[mapping.numberColumn] || '—' : '—',
      size: mapping.sizeColumn ? row[mapping.sizeColumn] || '—' : '—',
    }));
  }, [parsedData.rawRows, mapping]);

  const hasName = Boolean(mapping.nameColumn);
  const hasNumber = Boolean(mapping.numberColumn);
  const canProceed = hasName && hasNumber;

  return (
    <div className="space-y-6">
      {/* Header and File Info Card */}
      <div className="bg-surface rounded-md border border-border p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-sm bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-text-primary">{parsedData.fileName}</h2>
              <Badge variant="outline" size="sm">
                {parsedData.totalRawRows} Rows Loaded
              </Badge>
              <Badge variant="default" size="sm">
                {parsedData.activeSheet}
              </Badge>
            </div>
            <p className="text-xs text-text-secondary mt-0.5">
              Match the spreadsheet columns below to the personalization fields on your jersey template.
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleAutoDetect}
          leftIcon={<Sparkles className="w-3.5 h-3.5 text-primary" />}
        >
          Auto-Detect Columns
        </Button>
      </div>

      {/* Mapping Configuration Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Field 1: Player Name */}
        <div className="bg-surface rounded-md border border-border p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <label htmlFor="name-column-select" className="text-xs font-semibold text-text-primary">
                Player Name Field
              </label>
            </div>
            <Badge variant={mapping.nameColumn ? 'success' : 'danger'} size="sm">
              {mapping.nameColumn ? 'Mapped' : 'Required'}
            </Badge>
          </div>
          <p className="text-[11px] text-text-secondary">
            Primary text layer on jersey back arch (e.g. "JORDAN", "MESSI").
          </p>
          <Select
            id="name-column-select"
            options={headerOptions}
            value={mapping.nameColumn}
            onChange={(e) => setMapping({ ...mapping, nameColumn: e.target.value })}
            placeholder="Select column..."
          />
        </div>

        {/* Field 2: Jersey Number */}
        <div className="bg-surface rounded-md border border-border p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <label htmlFor="number-column-select" className="text-xs font-semibold text-text-primary">
                Jersey Number Field
              </label>
            </div>
            <Badge variant={mapping.numberColumn ? 'success' : 'danger'} size="sm">
              {mapping.numberColumn ? 'Mapped' : 'Required'}
            </Badge>
          </div>
          <p className="text-[11px] text-text-secondary">
            Back and front large numbers (e.g. "23", "10", "00").
          </p>
          <Select
            id="number-column-select"
            options={headerOptions}
            value={mapping.numberColumn}
            onChange={(e) => setMapping({ ...mapping, numberColumn: e.target.value })}
            placeholder="Select column..."
          />
        </div>

        {/* Field 3: Garment Size */}
        <div className="bg-surface rounded-md border border-border p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-text-muted" />
              <label htmlFor="size-column-select" className="text-xs font-semibold text-text-primary">
                Garment Size Field
              </label>
            </div>
            <Badge variant={mapping.sizeColumn ? 'default' : 'outline'} size="sm">
              {mapping.sizeColumn ? 'Mapped' : 'Optional'}
            </Badge>
          </div>
          <p className="text-[11px] text-text-secondary">
            Used for apparel size labels, tags, and cut-and-sew bundles (e.g. "M", "XL").
          </p>
          <Select
            id="size-column-select"
            options={headerOptions}
            value={mapping.sizeColumn}
            onChange={(e) => setMapping({ ...mapping, sizeColumn: e.target.value })}
            placeholder="Select column (optional)..."
          />
        </div>
      </div>

      {/* Validation Warnings */}
      {!canProceed && (
        <Alert
          variant="danger"
          title="Mapping Incomplete"
          description="Both Player Name and Jersey Number must be mapped to proceed to roster validation."
        />
      )}

      {/* Live Sample Preview Table */}
      <div className="bg-surface rounded-md border border-border overflow-hidden shadow-sm">
        <div className="px-4 py-3 border-b border-border bg-surface-subtle flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TableIcon className="w-4 h-4 text-text-secondary" />
            <h3 className="text-xs font-semibold text-text-primary">
              Live Preview with Current Column Mapping
            </h3>
          </div>
          <span className="text-[11px] text-text-muted">First 3 sample rows</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-border text-text-secondary bg-surface text-[11px]">
                <th className="py-2.5 px-4 font-semibold w-16">Row</th>
                <th className="py-2.5 px-4 font-semibold">Mapped Player Name</th>
                <th className="py-2.5 px-4 font-semibold">Mapped Jersey Number</th>
                <th className="py-2.5 px-4 font-semibold">Mapped Garment Size</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {previewRows.map((r) => (
                <tr key={r.rowNum} className="hover:bg-surface-subtle/50">
                  <td className="py-2.5 px-4 font-mono text-text-muted">{r.rowNum}</td>
                  <td className="py-2.5 px-4 font-medium text-text-primary">
                    {r.name === '—' ? (
                      <span className="text-text-muted italic">Unmapped</span>
                    ) : (
                      r.name
                    )}
                  </td>
                  <td className="py-2.5 px-4 font-mono font-semibold text-primary">
                    {r.number === '—' ? (
                      <span className="text-text-muted italic">Unmapped</span>
                    ) : (
                      `#${r.number}`
                    )}
                  </td>
                  <td className="py-2.5 px-4">
                    <Badge variant="outline" size="sm">
                      {r.size || 'Not Specified'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between pt-2">
        <Button variant="outline" size="sm" onClick={onBack}>
          Back to Import
        </Button>

        <Button
          variant="primary"
          size="md"
          disabled={!canProceed}
          onClick={() => onConfirmMapping(mapping)}
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          Proceed to Validate Roster ({parsedData.totalRawRows} Players)
        </Button>
      </div>
    </div>
  );
};
