/**
 * Main Roster & Bulk Personalization Workflow View
 * Guides the user through:
 * Step 1: Ingest / Select Sample Roster
 * Step 2: Column Mapping & Template Alignment
 * Step 3: Validation, Duplicate Rules & Inline Corrections
 * Step 4: Batch Personalization & Local Export (ZIP/PNG/JPG/PDF)
 */

import * as React from 'react';
import {
  Upload,
  ArrowRight,
  Sparkles,
  Play,
  Pause,
  RefreshCw,
  FolderArchive,
  Check,
  HardDrive,
  Users,
  Shirt,
} from 'lucide-react';
import { Button, Badge, Alert, Select, Input } from '@/components/ui';
import {
  ParsedSheetData,
  ColumnMappingConfig,
  ValidatedRosterRow,
  ValidationRuleConfig,
  BatchProgress,
  BatchItemResult,
  JerseyRenderOptions,
  BatchExportFormat,
} from './types';
import { parseRosterFile } from './rosterParser';
import {
  SAMPLE_ROSTERS,
  sampleRosterToParsedSheet,
  SampleRosterDefinition,
} from './sampleData';
import { ColumnMapper, autoDetectMapping } from './ColumnMapper';
import {
  validateRoster,
  DEFAULT_VALIDATION_CONFIG,
} from './validationEngine';
import { RosterValidationTable } from './RosterValidationTable';
import {
  BatchProcessor,
  DEFAULT_RENDER_OPTIONS,
  triggerLocalDownload,
} from './batchProcessor';
import { cn } from '@/lib/utils';

export type WorkflowStep = 'import' | 'map' | 'validate' | 'batch';

export interface RosterWorkflowViewProps {
  onBackToEditor?: () => void;
}

export const RosterWorkflowView: React.FC<RosterWorkflowViewProps> = ({
  onBackToEditor,
}) => {
  // Navigation State
  const [currentStep, setCurrentStep] = React.useState<WorkflowStep>('import');

  // Step 1: Ingestion State
  const [parsedData, setParsedData] = React.useState<ParsedSheetData | null>(null);
  const [isLoadingFile, setIsLoadingFile] = React.useState(false);
  const [fileError, setFileError] = React.useState<string | null>(null);
  const [selectedSampleId, setSelectedSampleId] = React.useState<string>('basketball-10');

  // Step 2: Mapping State
  const [mappingConfig, setMappingConfig] = React.useState<ColumnMappingConfig | null>(null);

  // Step 3: Validation State
  const [validationConfig, setValidationConfig] = React.useState<ValidationRuleConfig>(
    DEFAULT_VALIDATION_CONFIG
  );
  const [validatedRows, setValidatedRows] = React.useState<ValidatedRosterRow[]>([]);

  // Step 4: Batch Processing State
  const [renderOptions, setRenderOptions] = React.useState<JerseyRenderOptions>(
    DEFAULT_RENDER_OPTIONS
  );
  const [batchProgress, setBatchProgress] = React.useState<BatchProgress>({
    total: 0,
    completed: 0,
    failed: 0,
    remaining: 0,
    isGenerating: false,
    isPaused: false,
    isFinished: false,
    percent: 0,
  });
  const [batchResults, setBatchResults] = React.useState<BatchItemResult[]>([]);
  const batchProcessorRef = React.useRef<BatchProcessor | null>(null);
  const [isExportingZip, setIsExportingZip] = React.useState(false);

  // Clean up object URLs on unmount
  React.useEffect(() => {
    return () => {
      batchProcessorRef.current?.dispose();
    };
  }, []);

  // File Input Drag & Drop Handlers
  const handleFileUpload = async (file: File) => {
    setIsLoadingFile(true);
    setFileError(null);
    try {
      const data = await parseRosterFile(file);
      setParsedData(data);
      const autoMap = autoDetectMapping(data.headers);
      setMappingConfig(autoMap);
      setCurrentStep('map');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setFileError(msg);
    } finally {
      setIsLoadingFile(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleSelectSample = (sample: SampleRosterDefinition) => {
    setSelectedSampleId(sample.id);
    const data = sampleRosterToParsedSheet(sample);
    setParsedData(data);
    const autoMap = autoDetectMapping(data.headers);
    setMappingConfig(autoMap);
    setRenderOptions((prev) => ({
      ...prev,
      teamName: sample.teamName,
      primaryColor: sample.primaryColor,
      secondaryColor: sample.secondaryColor,
    }));
    setCurrentStep('map');
  };

  // Step 2 -> Step 3 Transition
  const handleConfirmMapping = (mapping: ColumnMappingConfig) => {
    if (!parsedData) return;
    setMappingConfig(mapping);
    const rows = validateRoster(parsedData.rawRows, mapping, validationConfig);
    setValidatedRows(rows);
    setCurrentStep('validate');
  };

  // Step 3 -> Step 4 Transition
  const handleProceedToBatch = () => {
    batchProcessorRef.current?.dispose();
    batchProcessorRef.current = new BatchProcessor(validatedRows, renderOptions);
    setBatchResults([]);
    setBatchProgress({
      total: validatedRows.length,
      completed: 0,
      failed: 0,
      remaining: validatedRows.length,
      isGenerating: false,
      isPaused: false,
      isFinished: false,
      percent: 0,
    });
    setCurrentStep('batch');
  };

  // Batch Generation Handlers
  const handleStartBatch = async (retryFailedOnly = false) => {
    if (!batchProcessorRef.current) {
      batchProcessorRef.current = new BatchProcessor(validatedRows, renderOptions);
    }
    batchProcessorRef.current.setOptions(renderOptions);

    await batchProcessorRef.current.execute(
      {
        onProgress: (progress) => setBatchProgress({ ...progress }),
        onItemCompleted: (item) => {
          setBatchResults((prev) => {
            const idx = prev.findIndex((p) => p.rowId === item.rowId);
            if (idx >= 0) {
              const copy = [...prev];
              copy[idx] = item;
              return copy;
            }
            return [...prev, item];
          });
        },
      },
      retryFailedOnly
    );
  };

  const handlePauseBatch = () => {
    batchProcessorRef.current?.pause();
    setBatchProgress((prev) => ({ ...prev, isPaused: true }));
  };

  const handleResumeBatch = () => {
    batchProcessorRef.current?.resume();
    setBatchProgress((prev) => ({ ...prev, isPaused: false }));
  };

  const handleDownloadZip = async () => {
    if (!batchProcessorRef.current) return;
    setIsExportingZip(true);
    try {
      const zipBlob = await batchProcessorRef.current.createZipBundle();
      const filename = `${renderOptions.teamName.toLowerCase().replace(/\s+/g, '_')}_batch_${new Date().toISOString().slice(0, 10)}.zip`;
      triggerLocalDownload(zipBlob, filename);
    } finally {
      setIsExportingZip(false);
    }
  };

  // Step Titles Configuration
  const steps = [
    { id: 'import', title: '1. Ingest Roster' },
    { id: 'map', title: '2. Map Columns' },
    { id: 'validate', title: '3. Validate & Correct' },
    { id: 'batch', title: '4. Batch Generate' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Workflow Step Tracker */}
      <div className="bg-surface rounded-md border border-border p-3 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {steps.map((s, idx) => {
            const isActive = currentStep === s.id;
            const isPassed =
              (s.id === 'import' && currentStep !== 'import') ||
              (s.id === 'map' && (currentStep === 'validate' || currentStep === 'batch')) ||
              (s.id === 'validate' && currentStep === 'batch');

            return (
              <React.Fragment key={s.id}>
                {idx > 0 && <span className="text-border px-1">/</span>}
                <button
                  type="button"
                  disabled={!isPassed && !isActive}
                  onClick={() => {
                    if (isPassed) setCurrentStep(s.id as WorkflowStep);
                  }}
                  className={cn(
                    'px-3 py-1.5 rounded-sm text-xs font-semibold flex items-center gap-1.5 transition-colors',
                    isActive && 'bg-primary text-text-inverted',
                    isPassed && 'text-text-primary hover:bg-surface-subtle cursor-pointer',
                    !isPassed && !isActive && 'text-text-muted cursor-not-allowed'
                  )}
                >
                  {isPassed && <Check className="w-3.5 h-3.5 text-success shrink-0" />}
                  <span>{s.title}</span>
                </button>
              </React.Fragment>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          {onBackToEditor && (
            <Button
              variant="outline"
              size="sm"
              onClick={onBackToEditor}
              leftIcon={<Shirt className="w-3.5 h-3.5" />}
            >
              Jersey Editor
            </Button>
          )}
          {/* Local Storage Honest Indicator */}
          <div className="flex items-center gap-1.5 text-xs text-text-secondary">
            <HardDrive className="w-3.5 h-3.5 text-primary" />
            <span>Local Batch Engine — 0 Network Requests</span>
          </div>
        </div>
      </div>

      {/* ====================================================================
          STEP 1: INGEST / SAMPLE ROSTER SELECTION
          ==================================================================== */}
      {currentStep === 'import' && (
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-surface rounded-md border border-border p-6 shadow-sm">
            <h1 className="text-lg font-bold text-text-primary">
              Import Team Roster or Pick a Sample
            </h1>
            <p className="text-xs text-text-secondary mt-1">
              Upload your team spreadsheet in CSV, TSV, or Excel (.xlsx/.xls) format. All player data is processed strictly in your local browser memory.
            </p>
          </div>

          {fileError && (
            <Alert
              variant="danger"
              title="File Import Failed"
              description={fileError}
            />
          )}

          {/* Upload Drop Zone */}
          <div className="border-2 border-dashed border-border rounded-md bg-surface p-8 text-center hover:border-primary/50 transition-colors">
            <div className="max-w-md mx-auto flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3">
                <Upload className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-text-primary">
                Drag and drop your roster spreadsheet here
              </h3>
              <p className="text-xs text-text-secondary mt-1 mb-4">
                Supports CSV, TSV, XLSX, and XLS up to 25MB
              </p>

              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls,.tsv,.txt"
                  className="hidden"
                  onChange={handleFileInputChange}
                  disabled={isLoadingFile}
                />
                <Button variant="primary" size="md" disabled={isLoadingFile}>
                  {isLoadingFile ? 'Parsing File Locally...' : 'Browse Local Files'}
                </Button>
              </label>
            </div>
          </div>

          {/* Quick-Start Built-in Sample Rosters */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">
                Or Load a Built-in Sample Roster for Instant Testing
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {SAMPLE_ROSTERS.map((sample) => (
                <div
                  key={sample.id}
                  className={cn(
                    'bg-surface rounded-md border p-4 hover:border-primary transition-all shadow-sm flex flex-col justify-between',
                    selectedSampleId === sample.id
                      ? 'border-primary ring-1 ring-primary/30'
                      : 'border-border'
                  )}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" size="sm">
                        {sample.sport}
                      </Badge>
                      <Badge variant="primary" size="sm">
                        {sample.rowCount} Players
                      </Badge>
                    </div>

                    <h4 className="text-xs font-bold text-text-primary">{sample.name}</h4>
                    <p className="text-[11px] text-text-secondary leading-snug">
                      {sample.description}
                    </p>
                  </div>

                  <div className="pt-4 mt-2 border-t border-border flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/10"
                        style={{ backgroundColor: sample.primaryColor }}
                        title="Primary Color"
                      />
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/10"
                        style={{ backgroundColor: sample.secondaryColor }}
                        title="Accent Color"
                      />
                      <span className="text-[10px] text-text-muted font-mono">{sample.teamName}</span>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSelectSample(sample)}
                      rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                    >
                      Use Sample
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          STEP 2: COLUMN MAPPING
          ==================================================================== */}
      {currentStep === 'map' && parsedData && (
        <ColumnMapper
          parsedData={parsedData}
          initialMapping={mappingConfig || undefined}
          onConfirmMapping={handleConfirmMapping}
          onBack={() => setCurrentStep('import')}
        />
      )}

      {/* ====================================================================
          STEP 3: VALIDATION & CORRECTION TABLE
          ==================================================================== */}
      {currentStep === 'validate' && (
        <RosterValidationTable
          rows={validatedRows}
          validationConfig={validationConfig}
          onRowsChange={setValidatedRows}
          onConfigChange={setValidationConfig}
          onProceedToBatch={handleProceedToBatch}
          onBackToMapping={() => setCurrentStep('map')}
        />
      )}

      {/* ====================================================================
          STEP 4: BATCH GENERATION & EXPORT
          ==================================================================== */}
      {currentStep === 'batch' && (
        <div className="space-y-6">
          {/* Header & Controls */}
          <div className="bg-surface rounded-md border border-border p-6 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-text-primary">
                  Bulk Jersey Personalization Engine
                </h2>
                <p className="text-xs text-text-secondary mt-0.5">
                  Rendering {validatedRows.length} personalized jerseys for "{renderOptions.teamName}" with auto-fitting and print spec.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {!batchProgress.isGenerating ? (
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => handleStartBatch(false)}
                    leftIcon={<Play className="w-4 h-4" />}
                  >
                    {batchProgress.completed > 0 ? 'Re-Generate All' : 'Start Bulk Generation'}
                  </Button>
                ) : batchProgress.isPaused ? (
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleResumeBatch}
                    leftIcon={<Play className="w-4 h-4" />}
                  >
                    Resume
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={handlePauseBatch}
                    leftIcon={<Pause className="w-4 h-4" />}
                  >
                    Pause
                  </Button>
                )}

                {batchProgress.failed > 0 && !batchProgress.isGenerating && (
                  <Button
                    variant="danger"
                    size="md"
                    onClick={() => handleStartBatch(true)}
                    leftIcon={<RefreshCw className="w-4 h-4" />}
                  >
                    Retry Failed Only ({batchProgress.failed})
                  </Button>
                )}

                {batchResults.some((r) => r.status === 'completed') && (
                  <Button
                    variant="outline"
                    size="md"
                    disabled={isExportingZip || batchProgress.isGenerating}
                    onClick={handleDownloadZip}
                    leftIcon={<FolderArchive className="w-4 h-4 text-primary" />}
                  >
                    {isExportingZip ? 'Packaging ZIP...' : 'Download ZIP Bundle'}
                  </Button>
                )}
              </div>
            </div>

            {/* Render Config Ribbon */}
            <div className="pt-3 border-t border-border grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-text-secondary font-medium">Export Format</span>
                <Select
                  options={[
                    { value: 'zip', label: 'ZIP Bundle (PNG Files + Manifest)' },
                    { value: 'png', label: 'PNG Images (Transparent / High Res)' },
                    { value: 'jpg', label: 'JPEG Images (Compressed)' },
                    { value: 'pdf', label: 'PDF Production Sheets' },
                  ]}
                  value={renderOptions.format}
                  onChange={(e) =>
                    setRenderOptions({
                      ...renderOptions,
                      format: e.target.value as BatchExportFormat,
                    })
                  }
                />
              </div>

              <div>
                <span className="text-text-secondary font-medium">Team Header Arch</span>
                <Input
                  value={renderOptions.teamName}
                  onChange={(e) =>
                    setRenderOptions({ ...renderOptions, teamName: e.target.value.toUpperCase() })
                  }
                  placeholder="TEAM NAME"
                />
              </div>

              <div>
                <span className="text-text-secondary font-medium">Jersey Primary Color</span>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="color"
                    value={renderOptions.primaryColor}
                    onChange={(e) =>
                      setRenderOptions({ ...renderOptions, primaryColor: e.target.value })
                    }
                    className="w-8 h-8 rounded-sm cursor-pointer border border-border p-0.5 bg-surface"
                  />
                  <span className="font-mono text-xs text-text-primary">
                    {renderOptions.primaryColor}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-text-secondary font-medium">Accent / Trim Color</span>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="color"
                    value={renderOptions.secondaryColor}
                    onChange={(e) =>
                      setRenderOptions({ ...renderOptions, secondaryColor: e.target.value })
                    }
                    className="w-8 h-8 rounded-sm cursor-pointer border border-border p-0.5 bg-surface"
                  />
                  <span className="font-mono text-xs text-text-primary">
                    {renderOptions.secondaryColor}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Real-time Progress Bar & Metrics */}
          <div className="bg-surface rounded-md border border-border p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-text-primary">
                  {batchProgress.isGenerating
                    ? `Generating: ${batchProgress.currentItemName || 'Processing...'}`
                    : batchProgress.isFinished
                    ? 'Batch Generation Complete'
                    : 'Ready to Generate'}
                </span>
                {batchProgress.isPaused && (
                  <Badge variant="warning" size="sm">
                    Paused
                  </Badge>
                )}
              </div>
              <span className="font-mono font-bold text-primary">{batchProgress.percent}%</span>
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full bg-surface-subtle h-2.5 rounded-full overflow-hidden border border-border">
              <div
                className="bg-primary h-full transition-all duration-200"
                style={{ width: `${batchProgress.percent}%` }}
              />
            </div>

            {/* Statistics */}
            <div className="flex items-center justify-between text-[11px] text-text-secondary pt-1">
              <span>
                Total: <strong className="text-text-primary">{batchProgress.total}</strong>
              </span>
              <span>
                Completed: <strong className="text-success">{batchProgress.completed}</strong>
              </span>
              <span>
                Failed: <strong className="text-danger">{batchProgress.failed}</strong>
              </span>
              <span>
                Remaining: <strong className="text-text-muted">{batchProgress.remaining}</strong>
              </span>
            </div>
          </div>

          {/* Generated Gallery & Preview Cards */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">
                Generated Jersey Variations ({batchResults.length} / {validatedRows.length})
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentStep('validate')}
              >
                Back to Roster Table
              </Button>
            </div>

            {batchResults.length === 0 ? (
              <div className="border border-border rounded-md bg-surface p-12 text-center text-text-muted">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-xs">Click "Start Bulk Generation" above to render all jerseys.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {batchResults.map((item) => (
                  <div
                    key={item.rowId}
                    className="bg-surface rounded-md border border-border overflow-hidden shadow-sm flex flex-col justify-between hover:border-primary transition-all group"
                  >
                    {/* Rendered Preview Image */}
                    <div className="relative aspect-[4/5] bg-surface-subtle overflow-hidden flex items-center justify-center p-2">
                      {item.dataUrl ? (
                        <img
                          src={item.dataUrl}
                          alt={item.playerName}
                          className="max-h-full max-w-full object-contain drop-shadow-sm group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <span className="text-[10px] text-text-muted">Rendering...</span>
                      )}

                      {/* Status Overlay */}
                      <div className="absolute top-1.5 right-1.5">
                        {item.status === 'completed' && (
                          <Badge variant="success" size="sm">
                            #{item.playerNumber}
                          </Badge>
                        )}
                        {item.status === 'failed' && (
                          <Badge variant="danger" size="sm">
                            Failed
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Metadata Footer */}
                    <div className="p-2 border-t border-border bg-surface text-center">
                      <div className="text-xs font-bold text-text-primary truncate">
                        {item.playerName}
                      </div>
                      <div className="flex items-center justify-center gap-1.5 text-[10px] text-text-secondary mt-0.5">
                        <span className="font-mono">#{item.playerNumber}</span>
                        <span>•</span>
                        <span>Size {item.playerSize || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
