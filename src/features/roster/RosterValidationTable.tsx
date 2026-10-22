/**
 * Interactive Roster Validation & Inline Correction Table
 * Real-time row validation, duplicate-number toggles, and inline editing.
 * 100% Client-side.
 */

import * as React from 'react';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Trash2,
  Search,
  ArrowRight,
  ShieldAlert,
  Edit2,
  Check,
} from 'lucide-react';
import {
  Button,
  Input,
  Badge,
  Alert,
  Switch,
  Tooltip,
} from '@/components/ui';
import {
  ValidatedRosterRow,
  ValidationRuleConfig,
  ValidationSummary,
} from './types';
import {
  updateRowField,
  addBlankRow,
  deleteRow,
  calculateValidationSummary,
  revalidateRows,
} from './validationEngine';
import { cn } from '@/lib/utils';

export interface RosterValidationTableProps {
  rows: ValidatedRosterRow[];
  validationConfig: ValidationRuleConfig;
  onRowsChange: (updatedRows: ValidatedRosterRow[]) => void;
  onConfigChange: (newConfig: ValidationRuleConfig) => void;
  onProceedToBatch: () => void;
  onBackToMapping: () => void;
}

type FilterTab = 'all' | 'errors' | 'warnings' | 'valid';

export const RosterValidationTable: React.FC<RosterValidationTableProps> = ({
  rows,
  validationConfig,
  onRowsChange,
  onConfigChange,
  onProceedToBatch,
  onBackToMapping,
}) => {
  const [activeTab, setActiveTab] = React.useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [editingCell, setEditingCell] = React.useState<{ rowId: string; field: string } | null>(null);
  const [editValue, setEditValue] = React.useState('');
  const [currentPage, setCurrentPage] = React.useState(1);
  const pageSize = 15;

  const summary: ValidationSummary = React.useMemo(() => {
    return calculateValidationSummary(rows);
  }, [rows]);

  // Handle duplicate-number toggle
  const handleToggleDuplicateNumbers = (allowDuplicates: boolean) => {
    const updatedConfig = {
      ...validationConfig,
      allowDuplicateNumbers: allowDuplicates,
    };
    onConfigChange(updatedConfig);
    const revalidated = revalidateRows(rows, updatedConfig);
    onRowsChange(revalidated);
  };

  // Filtered rows
  const filteredRows = React.useMemo(() => {
    let result = rows;

    if (activeTab === 'errors') {
      result = result.filter((r) => r.status === 'error');
    } else if (activeTab === 'warnings') {
      result = result.filter((r) => r.status === 'warning');
    } else if (activeTab === 'valid') {
      result = result.filter((r) => r.status === 'valid');
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.number.toLowerCase().includes(q) ||
          r.size.toLowerCase().includes(q)
      );
    }

    return result;
  }, [rows, activeTab, searchQuery]);

  const totalPages = Math.ceil(filteredRows.length / pageSize) || 1;
  const paginatedRows = filteredRows.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Cell editing handlers
  const handleStartEdit = (rowId: string, field: string, currentValue: string) => {
    setEditingCell({ rowId, field });
    setEditValue(currentValue);
  };

  const handleSaveEdit = () => {
    if (!editingCell) return;
    const updated = updateRowField(
      rows,
      editingCell.rowId,
      editingCell.field,
      editValue,
      validationConfig
    );
    onRowsChange(updated);
    setEditingCell(null);
  };

  const handleCancelEdit = () => {
    setEditingCell(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  // Row operations
  const handleAddRow = () => {
    const updated = addBlankRow(rows, validationConfig);
    onRowsChange(updated);
    // Switch to all tab and navigate to last page
    setActiveTab('all');
    setCurrentPage(Math.ceil((rows.length + 1) / pageSize));
  };

  const handleDeleteRow = (rowId: string) => {
    const updated = deleteRow(rows, rowId, validationConfig);
    onRowsChange(updated);
  };

  return (
    <div className="space-y-4">
      {/* 1. Metric Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-surface rounded-md border border-border p-3 flex items-center justify-between shadow-sm">
          <div>
            <div className="text-xs text-text-secondary font-medium">Total Players</div>
            <div className="text-xl font-bold text-text-primary mt-0.5">{summary.total}</div>
          </div>
          <Badge variant="outline" size="sm">
            Roster
          </Badge>
        </div>

        <div className="bg-surface rounded-md border border-border p-3 flex items-center justify-between shadow-sm">
          <div>
            <div className="text-xs text-text-secondary font-medium">Ready to Print</div>
            <div className="text-xl font-bold text-success mt-0.5">{summary.valid}</div>
          </div>
          <CheckCircle2 className="w-5 h-5 text-success" />
        </div>

        <div className="bg-surface rounded-md border border-border p-3 flex items-center justify-between shadow-sm">
          <div>
            <div className="text-xs text-text-secondary font-medium">Review Warnings</div>
            <div className="text-xl font-bold text-warning mt-0.5">{summary.warnings}</div>
          </div>
          <AlertTriangle className="w-5 h-5 text-warning" />
        </div>

        <div className="bg-surface rounded-md border border-border p-3 flex items-center justify-between shadow-sm">
          <div>
            <div className="text-xs text-text-secondary font-medium">Blocking Errors</div>
            <div className="text-xl font-bold text-danger mt-0.5">{summary.errors}</div>
          </div>
          <AlertCircle className="w-5 h-5 text-danger" />
        </div>
      </div>

      {/* 2. Interactive Control Bar */}
      <div className="bg-surface rounded-md border border-border p-3 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <Button
            variant={activeTab === 'all' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => {
              setActiveTab('all');
              setCurrentPage(1);
            }}
          >
            All Players ({summary.total})
          </Button>

          {summary.errors > 0 && (
            <Button
              variant={activeTab === 'errors' ? 'danger' : 'ghost'}
              size="sm"
              onClick={() => {
                setActiveTab('errors');
                setCurrentPage(1);
              }}
              leftIcon={<AlertCircle className="w-3.5 h-3.5" />}
            >
              Errors ({summary.errors})
            </Button>
          )}

          {summary.warnings > 0 && (
            <Button
              variant={activeTab === 'warnings' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => {
                setActiveTab('warnings');
                setCurrentPage(1);
              }}
              leftIcon={<AlertTriangle className="w-3.5 h-3.5" />}
            >
              Warnings ({summary.warnings})
            </Button>
          )}

          <Button
            variant={activeTab === 'valid' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => {
              setActiveTab('valid');
              setCurrentPage(1);
            }}
          >
            Valid ({summary.valid})
          </Button>
        </div>

        {/* Search, Config & Add */}
        <div className="flex items-center gap-3">
          {/* Duplicate Numbers Toggle */}
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-sm bg-surface-subtle border border-border">
            <Switch
              id="duplicate-numbers-toggle"
              checked={validationConfig.allowDuplicateNumbers}
              onCheckedChange={handleToggleDuplicateNumbers}
              label="Allow Duplicate Numbers"
            />
          </div>

          {/* Quick Search */}
          <div className="w-48">
            <Input
              placeholder="Search player or #..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              leftIcon={<Search className="w-3.5 h-3.5 text-text-muted" />}
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleAddRow}
            leftIcon={<Plus className="w-3.5 h-3.5 text-primary" />}
          >
            Add Player
          </Button>
        </div>
      </div>

      {/* 3. Validation Blocking Warning if errors exist */}
      {summary.errors > 0 && (
        <Alert
          variant="danger"
          title={`${summary.errors} Row${summary.errors > 1 ? 's' : ''} Require Correction Before Export`}
          description="Click any cell in the table below to edit missing names or numbers inline. The table revalidates immediately upon saving."
        />
      )}

      {/* 4. Interactive Validation Table */}
      <div className="bg-surface rounded-md border border-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-border text-text-secondary bg-surface-subtle uppercase tracking-wider text-[11px]">
                <th className="py-2.5 px-3 font-semibold w-12 text-center">#</th>
                <th className="py-2.5 px-3 font-semibold w-24">Status</th>
                <th className="py-2.5 px-3 font-semibold">Player Name</th>
                <th className="py-2.5 px-3 font-semibold w-28">Jersey #</th>
                <th className="py-2.5 px-3 font-semibold w-24">Size</th>
                <th className="py-2.5 px-3 font-semibold">Validation Notes</th>
                <th className="py-2.5 px-3 font-semibold w-16 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-text-muted">
                    No players found matching current filter or search query.
                  </td>
                </tr>
              ) : (
                paginatedRows.map((row) => {
                  const isEditingName = editingCell?.rowId === row.id && editingCell?.field === 'name';
                  const isEditingNumber = editingCell?.rowId === row.id && editingCell?.field === 'number';
                  const isEditingSize = editingCell?.rowId === row.id && editingCell?.field === 'size';

                  const nameIssue = row.issues.find((i) => i.field === 'name');
                  const numberIssue = row.issues.find((i) => i.field === 'number');
                  const sizeIssue = row.issues.find((i) => i.field === 'size');

                  return (
                    <tr
                      key={row.id}
                      className={cn(
                        'hover:bg-surface-subtle/50 transition-colors group',
                        row.status === 'error' && 'bg-danger/5 hover:bg-danger/10',
                        row.status === 'warning' && 'bg-warning/5 hover:bg-warning/10'
                      )}
                    >
                      {/* Row Index */}
                      <td className="py-2.5 px-3 text-center font-mono text-text-muted text-[11px]">
                        {row.rowNumber}
                      </td>

                      {/* Status Badge */}
                      <td className="py-2.5 px-3">
                        {row.status === 'valid' && (
                          <Badge variant="success" size="sm" className="gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Valid
                          </Badge>
                        )}
                        {row.status === 'warning' && (
                          <Badge variant="warning" size="sm" className="gap-1">
                            <AlertTriangle className="w-3 h-3" /> Warning
                          </Badge>
                        )}
                        {row.status === 'error' && (
                          <Badge variant="danger" size="sm" className="gap-1">
                            <AlertCircle className="w-3 h-3" /> Error
                          </Badge>
                        )}
                      </td>

                      {/* Editable Player Name */}
                      <td className="py-2.5 px-3">
                        {isEditingName ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              autoFocus
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value.toUpperCase())}
                              onKeyDown={handleKeyDown}
                              className="h-7 px-2 text-xs rounded-sm border border-primary bg-surface font-semibold focus:outline-none w-full max-w-xs"
                            />
                            <Button variant="primary" size="icon-sm" onClick={handleSaveEdit}>
                              <Check className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        ) : (
                          <div
                            onClick={() => handleStartEdit(row.id, 'name', row.name)}
                            className={cn(
                              'cursor-pointer py-1 px-1.5 rounded-sm hover:bg-surface border border-transparent hover:border-border inline-flex items-center gap-1.5 font-semibold text-text-primary',
                              !row.name && 'text-danger italic font-normal',
                              nameIssue?.severity === 'warning' && 'text-warning'
                            )}
                            title="Click to edit name"
                          >
                            <span>{row.name || '[Missing Name]'}</span>
                            <Edit2 className="w-3 h-3 opacity-0 group-hover:opacity-60 text-text-muted" />
                          </div>
                        )}
                      </td>

                      {/* Editable Jersey Number */}
                      <td className="py-2.5 px-3">
                        {isEditingNumber ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              autoFocus
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onKeyDown={handleKeyDown}
                              className="h-7 px-2 text-xs rounded-sm border border-primary bg-surface font-mono font-bold focus:outline-none w-20"
                            />
                            <Button variant="primary" size="icon-sm" onClick={handleSaveEdit}>
                              <Check className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        ) : (
                          <div
                            onClick={() => handleStartEdit(row.id, 'number', row.number)}
                            className={cn(
                              'cursor-pointer py-1 px-1.5 rounded-sm hover:bg-surface border border-transparent hover:border-border inline-flex items-center gap-1.5 font-mono font-bold',
                              row.number ? 'text-primary' : 'text-danger italic font-normal'
                            )}
                            title="Click to edit number"
                          >
                            <span>{row.number ? `#${row.number}` : '[Missing #]'}</span>
                            <Edit2 className="w-3 h-3 opacity-0 group-hover:opacity-60 text-text-muted" />
                          </div>
                        )}
                      </td>

                      {/* Editable Size */}
                      <td className="py-2.5 px-3">
                        {isEditingSize ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              autoFocus
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value.toUpperCase())}
                              onKeyDown={handleKeyDown}
                              className="h-7 px-2 text-xs rounded-sm border border-primary bg-surface uppercase focus:outline-none w-16"
                            />
                            <Button variant="primary" size="icon-sm" onClick={handleSaveEdit}>
                              <Check className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        ) : (
                          <div
                            onClick={() => handleStartEdit(row.id, 'size', row.size)}
                            className="cursor-pointer py-1 px-1.5 rounded-sm hover:bg-surface border border-transparent hover:border-border inline-flex items-center gap-1"
                            title="Click to edit size"
                          >
                            <Badge variant={sizeIssue ? 'warning' : 'outline'} size="sm">
                              {row.size || '—'}
                            </Badge>
                            <Edit2 className="w-2.5 h-2.5 opacity-0 group-hover:opacity-60 text-text-muted" />
                          </div>
                        )}
                      </td>

                      {/* Issues / Notes */}
                      <td className="py-2.5 px-3 text-[11px]">
                        {row.issues.length === 0 ? (
                          <span className="text-text-muted">No issues</span>
                        ) : (
                          <div className="flex flex-col gap-1">
                            {row.issues.map((issue, idx) => (
                              <div
                                key={idx}
                                className={cn(
                                  'flex items-center gap-1.5',
                                  issue.severity === 'error' ? 'text-danger' : 'text-warning'
                                )}
                              >
                                {issue.severity === 'error' ? (
                                  <AlertCircle className="w-3 h-3 shrink-0" />
                                ) : (
                                  <AlertTriangle className="w-3 h-3 shrink-0" />
                                )}
                                <span>{issue.message}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-3 text-right">
                        <Tooltip content="Delete player from roster">
                          <button
                            type="button"
                            onClick={() => handleDeleteRow(row.id)}
                            className="p-1 rounded-sm text-text-muted hover:text-danger hover:bg-surface transition-colors"
                            aria-label={`Delete row ${row.rowNumber}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </Tooltip>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex items-center justify-between px-3 py-2 border-t border-border bg-surface-subtle/50 text-xs text-text-secondary select-none">
          <div className="tabular-nums">
            Showing <span className="font-medium text-text-primary">
              {filteredRows.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
            </span> to{' '}
            <span className="font-medium text-text-primary">
              {Math.min(currentPage * pageSize, filteredRows.length)}
            </span> of{' '}
            <span className="font-medium text-text-primary">{filteredRows.length}</span> players
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
              >
                Prev
              </Button>
              <span className="font-mono text-xs">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* 5. Navigation Action Footer */}
      <div className="flex items-center justify-between pt-2">
        <Button variant="outline" size="sm" onClick={onBackToMapping}>
          Back to Column Mapping
        </Button>

        <div className="flex items-center gap-3">
          {summary.errors > 0 ? (
            <span className="text-xs text-danger font-medium flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4" /> Fix {summary.errors} error{summary.errors > 1 ? 's' : ''} to proceed
            </span>
          ) : summary.warnings > 0 ? (
            <span className="text-xs text-warning font-medium">
              {summary.warnings} warning{summary.warnings > 1 ? 's' : ''} will be auto-fitted
            </span>
          ) : (
            <span className="text-xs text-success font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> All {summary.total} players validated
            </span>
          )}

          <Button
            variant="primary"
            size="md"
            disabled={!summary.canProceedToBatch}
            onClick={onProceedToBatch}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Continue to Batch Generation ({summary.valid + summary.warnings} Players)
          </Button>
        </div>
      </div>
    </div>
  );
};
