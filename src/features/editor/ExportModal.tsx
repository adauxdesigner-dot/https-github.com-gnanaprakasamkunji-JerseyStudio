import * as React from 'react';
import {
  Download,
  FileImage,
  FileText,
  Loader2,
  HardDrive,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Switch } from '@/components/ui/Switch';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';
import {
  JerseyDesign,
  ExportFormat,
  ExportOptions,
  BatchRosterItem,
  GarmentView,
} from './editorTypes';
import {
  exportJersey,
  triggerFileDownload,
  renderBatchPersonalized,
  getDimensionsInInches,
} from './exportEngine';

export interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  design: JerseyDesign;
}

const SAMPLE_BATCH_ROSTER: BatchRosterItem[] = [
  { id: '1', name: 'RODRIGUEZ', number: '10', size: 'M' },
  { id: '2', name: 'SMITH', number: '7', size: 'L' },
  { id: '3', name: 'JOHNSON', number: '23', size: 'XL' },
  { id: '4', name: 'CHEN', number: '9', size: 'M' },
  { id: '5', name: 'DAVIS', number: '4', size: 'S' },
];

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  design,
}) => {
  const [format, setFormat] = React.useState<ExportFormat>('png');
  const [exportView, setExportView] = React.useState<GarmentView>('back');
  const [dpi, setDpi] = React.useState<number>(300);
  const [transparentBg, setTransparentBg] = React.useState<boolean>(true);
  const [backgroundColor, setBackgroundColor] = React.useState<string>('#FFFFFF');
  const [jpegQuality, setJpegQuality] = React.useState<number>(0.92);
  const [includeMockup, setIncludeMockup] = React.useState<boolean>(false);

  // Batch Personalization mode
  const [isBatchMode, setIsBatchMode] = React.useState<boolean>(false);

  // Export execution status
  const [isExporting, setIsExporting] = React.useState<boolean>(false);
  const [exportProgress, setExportProgress] = React.useState<{
    current: number;
    total: number;
    label: string;
  } | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  const { widthInches, heightInches } = getDimensionsInInches(design.dimensions);
  const pixelWidth = Math.round(widthInches * dpi);
  const pixelHeight = Math.round(heightInches * dpi);

  const handleExport = async () => {
    setIsExporting(true);
    setSuccessMessage(null);

    const options: ExportOptions = {
      format,
      view: exportView,
      dpi,
      transparentBg: format === 'png' ? transparentBg : false,
      backgroundColor,
      jpegQuality,
      includeMockup,
    };

    try {
      if (isBatchMode) {
        // Batch Personalization Export
        const results = await renderBatchPersonalized(
          design,
          SAMPLE_BATCH_ROSTER,
          options,
          (current, total, label) => {
            setExportProgress({ current, total, label });
          }
        );

        // Download each generated file locally
        for (const item of results) {
          triggerFileDownload(item.blob, item.filename);
          await new Promise((r) => setTimeout(r, 120)); // Brief stagger for browser download queue
        }

        setSuccessMessage(`Successfully generated and downloaded ${results.length} personalized jersey files!`);
      } else {
        // Single Item Export
        const result = await exportJersey(design, exportView, options);
        triggerFileDownload(result.blob, result.filename);
        setSuccessMessage(`Successfully exported ${result.filename}!`);
      }
    } catch (err: unknown) {
      console.error('Export failed:', err);
      const msg = err instanceof Error ? err.message : String(err);
      alert(`Export error: ${msg || 'Unknown error'}`);
    } finally {
      setIsExporting(false);
      setExportProgress(null);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Export Production Print Files"
      description="Generate local 300 DPI print files for dye sublimation heat press transfer and client review."
      size="lg"
    >
      <div className="p-4 space-y-6">
        {/* ====================================================================
            LOCAL PROCESSING & STORAGE NOTICE
            ==================================================================== */}
        <div className="flex items-center gap-2.5 p-3 bg-surface-subtle border border-border rounded-md text-xs text-text-primary">
          <HardDrive className="w-4 h-4 text-primary shrink-0" />
          <div className="flex flex-col">
            <span className="font-bold text-text-primary">
              100% Local Storage & Offline Rendering
            </span>
            <span className="text-text-secondary text-[11px] mt-0.5">
              Saved locally to your computer at <code className="font-mono font-semibold text-text-primary">~/Documents/JerseyStudio/Exports/</code> (Zero cloud transmission).
            </span>
          </div>
        </div>

        {/* ====================================================================
            FORMAT SELECTOR TABS
            ==================================================================== */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-text-primary uppercase tracking-wider block">
            Export File Format
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => {
                setFormat('png');
                setTransparentBg(true);
              }}
              className={cn(
                'flex flex-col items-center justify-center p-3 rounded-lg border text-center transition-all',
                format === 'png'
                  ? 'border-primary bg-primary-subtle/30 ring-2 ring-primary/20'
                  : 'border-border bg-surface hover:bg-surface-subtle'
              )}
            >
              <FileImage className={cn('w-6 h-6 mb-1.5', format === 'png' ? 'text-primary' : 'text-text-secondary')} />
              <div className="text-xs font-bold text-text-primary">PNG (Transparent)</div>
              <div className="text-[10px] text-text-muted mt-0.5">Dye-sublimation heat press transfer</div>
            </button>

            <button
              type="button"
              onClick={() => {
                setFormat('jpg');
                setTransparentBg(false);
              }}
              className={cn(
                'flex flex-col items-center justify-center p-3 rounded-lg border text-center transition-all',
                format === 'jpg'
                  ? 'border-primary bg-primary-subtle/30 ring-2 ring-primary/20'
                  : 'border-border bg-surface hover:bg-surface-subtle'
              )}
            >
              <FileImage className={cn('w-6 h-6 mb-1.5', format === 'jpg' ? 'text-primary' : 'text-text-secondary')} />
              <div className="text-xs font-bold text-text-primary">JPG (Solid Proof)</div>
              <div className="text-[10px] text-text-muted mt-0.5">Client digital mockup sign-off</div>
            </button>

            <button
              type="button"
              onClick={() => {
                setFormat('pdf');
                setTransparentBg(false);
              }}
              className={cn(
                'flex flex-col items-center justify-center p-3 rounded-lg border text-center transition-all',
                format === 'pdf'
                  ? 'border-primary bg-primary-subtle/30 ring-2 ring-primary/20'
                  : 'border-border bg-surface hover:bg-surface-subtle'
              )}
            >
              <FileText className={cn('w-6 h-6 mb-1.5', format === 'pdf' ? 'text-primary' : 'text-text-secondary')} />
              <div className="text-xs font-bold text-text-primary">Print PDF (Vector)</div>
              <div className="text-[10px] text-text-muted mt-0.5">1:1 true-scale production sheet</div>
            </button>
          </div>
        </div>

        {/* ====================================================================
            EXPORT PARAMETERS
            ==================================================================== */}
        <div className="grid grid-cols-2 gap-4 bg-surface-subtle p-4 rounded-lg border border-border">
          {/* Garment View */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-primary block">
              Garment View
            </label>
            <Select
              value={exportView}
              onChange={(e) => setExportView(e.target.value as GarmentView)}
              options={[
                { value: 'back', label: 'Back View (Names & Numbers)' },
                { value: 'front', label: 'Front View (Crest & Sponsor)' },
                { value: 'half_sleeve', label: 'Half Sleeve (HS - Tournament Badge)' },
                { value: 'full_sleeve', label: 'Full Sleeve (FS - Long Sleeve Panel)' },
              ]}
            />
          </div>

          {/* Resolution DPI */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-primary block">
              Target Resolution
            </label>
            <Select
              value={dpi.toString()}
              onChange={(e) => setDpi(Number(e.target.value))}
              options={[
                { value: '300', label: '300 DPI — Dye Sublimation (Print Ready)' },
                { value: '150', label: '150 DPI — Medium Screen Proof' },
                { value: '72', label: '72 DPI — Web Preview' },
              ]}
            />
          </div>

          {/* Output Sizing Info */}
          <div className="col-span-2 flex items-center justify-between text-xs py-1 border-t border-b border-border/80">
            <span className="text-text-secondary">Calculated Pixel Dimensions:</span>
            <span className="font-mono font-semibold text-text-primary">
              {pixelWidth} × {pixelHeight} px ({widthInches}" × {heightInches}")
            </span>
          </div>

          {/* PNG Background transparency toggle */}
          {format === 'png' && (
            <div className="col-span-2 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-text-primary">Transparent Background</div>
                <div className="text-[11px] text-text-secondary">
                  Recommended for sublimation print transfers
                </div>
              </div>
              <Switch
                checked={transparentBg}
                onChange={setTransparentBg}
              />
            </div>
          )}

          {/* JPG Background Fill Color */}
          {(format === 'jpg' || (!transparentBg && format === 'png')) && (
            <div className="col-span-2 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-text-primary">Solid Background Fill</div>
                <div className="text-[11px] text-text-secondary">
                  Background canvas color fill
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="w-7 h-7 rounded border border-border cursor-pointer p-0.5"
                />
                <span className="font-mono text-xs uppercase">{backgroundColor}</span>
              </div>
            </div>
          )}

          {/* JPG Quality Compression Slider */}
          {format === 'jpg' && (
            <div className="col-span-2 space-y-1.5 pt-1">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-text-primary">JPEG Quality Compression</span>
                <span className="font-mono font-semibold text-primary">
                  {Math.round(jpegQuality * 100)}%
                </span>
              </div>
              <input
                type="range"
                min={0.1}
                max={1.0}
                step={0.05}
                value={jpegQuality}
                onChange={(e) => setJpegQuality(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-[10px] text-text-muted">
                <span>0.1 (Smallest File)</span>
                <span>0.92 (High Production Quality)</span>
                <span>1.0 (Maximum)</span>
              </div>
            </div>
          )}

          {/* Include Mockup Garment Outline Toggle */}
          <div className="col-span-2 flex items-center justify-between pt-1">
            <div>
              <div className="text-xs font-semibold text-text-primary">Include Jersey Mockup Outline</div>
              <div className="text-[11px] text-text-secondary">
                Turn on for client visual mockups; turn off for print-only artwork film
              </div>
            </div>
            <Switch
              checked={includeMockup}
              onChange={setIncludeMockup}
            />
          </div>
        </div>

        {/* ====================================================================
            BATCH ROSTER PERSONALIZATION OPTION
            ==================================================================== */}
        <div className="border border-border rounded-lg p-4 space-y-3 bg-surface">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <div>
                <div className="text-xs font-bold text-text-primary">
                  Batch Personalization Export
                </div>
                <div className="text-[11px] text-text-secondary">
                  Generate individualized prints for all players in the roster
                </div>
              </div>
            </div>
            <Switch
              checked={isBatchMode}
              onChange={setIsBatchMode}
            />
          </div>

          {isBatchMode && (
            <div className="pt-2 border-t border-border space-y-2">
              <div className="text-xs text-text-secondary flex items-center justify-between">
                <span>Roster Queue ({SAMPLE_BATCH_ROSTER.length} players):</span>
                <Badge variant="primary" size="sm">
                  {SAMPLE_BATCH_ROSTER.length} Files
                </Badge>
              </div>

              <div className="grid grid-cols-5 gap-1.5 text-[11px]">
                {SAMPLE_BATCH_ROSTER.map((p) => (
                  <div
                    key={p.id}
                    className="p-1.5 rounded bg-surface-subtle border border-border text-center truncate"
                  >
                    <div className="font-bold text-text-primary">#{p.number}</div>
                    <div className="truncate text-text-secondary">{p.name}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Progress or Success Alerts */}
        {exportProgress && (
          <div className="p-3 bg-primary-subtle border border-primary/30 rounded-md flex items-center gap-3">
            <Loader2 className="w-4 h-4 text-primary animate-spin" />
            <div className="flex-1 text-xs">
              <div className="font-semibold text-text-primary">
                Rendering {exportProgress.label}...
              </div>
              <div className="text-text-secondary text-[11px]">
                Item {exportProgress.current} of {exportProgress.total}
              </div>
            </div>
          </div>
        )}

        {successMessage && (
          <Alert variant="success" title="Export Completed">
            {successMessage}
          </Alert>
        )}

        {/* ====================================================================
            FOOTER ACTIONS
            ==================================================================== */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
          <Button variant="ghost" onClick={onClose} disabled={isExporting}>
            Cancel
          </Button>

          <Button
            variant="primary"
            onClick={handleExport}
            disabled={isExporting}
            leftIcon={
              isExporting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )
            }
          >
            {isExporting
              ? 'Generating 300 DPI Prints Locally...'
              : isBatchMode
              ? `Batch Export (${SAMPLE_BATCH_ROSTER.length} Jerseys - 300 DPI)`
              : `Download ${format.toUpperCase()} (${dpi} DPI Production File)`}
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
