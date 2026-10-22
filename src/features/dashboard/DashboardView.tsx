import * as React from 'react';
import {
  FolderPlus,
  FileSpreadsheet,
  Shirt,
  ArrowRight,
  HardDrive,
  Clock,
} from 'lucide-react';
import { Button, Badge, Alert } from '@/components/ui';

export interface DashboardViewProps {
  onOpenEditor: () => void;
  onOpenRoster?: () => void;
  onOpenShowcase?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenEditor,
  onOpenRoster,
}) => {
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Welcome Banner */}
      <div className="bg-surface rounded-md border border-border p-6 shadow-sm flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-text-primary">
              Welcome to JerseyStudio
            </h2>
            <Badge variant="primary" size="sm">
              Local Desktop
            </Badge>
          </div>
          <p className="text-xs text-text-secondary max-w-xl">
            Design master sportswear jerseys, import player rosters, and batch-personalize names and numbers offline on your device.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            leftIcon={<FolderPlus className="w-4 h-4" />}
            onClick={onOpenEditor}
          >
            New Jersey Project
          </Button>
        </div>
      </div>

      {/* Local-First Guarantee Banner */}
      <Alert variant="info" title="Zero Cloud Data Boundary">
        JerseyStudio runs strictly on your machine. Your vector artwork, player names, jersey numbers, and exported graphics are never uploaded or synced to external cloud services.
      </Alert>

      {/* Quick Workflows Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1 */}
        <div
          onClick={onOpenEditor}
          className="bg-surface rounded-md border border-border p-5 hover:border-primary/50 transition-all cursor-pointer shadow-sm group"
        >
          <div className="w-10 h-10 rounded-sm bg-primary-subtle text-primary flex items-center justify-center mb-3">
            <Shirt className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-semibold text-text-primary group-hover:text-primary transition-colors">
            Vector Jersey Editor
          </h3>
          <p className="text-xs text-text-secondary mt-1 leading-relaxed">
            Configure master templates with front & back views, custom dimensions, and dynamic personalization fields.
          </p>
          <div className="mt-4 flex items-center text-xs text-primary font-medium gap-1">
            <span>Open Editor</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Card 2 */}
        <div
          onClick={onOpenRoster || onOpenEditor}
          className="bg-surface rounded-md border border-border p-5 hover:border-primary/50 transition-all cursor-pointer shadow-sm group"
        >
          <div className="w-10 h-10 rounded-sm bg-success-subtle text-success flex items-center justify-center mb-3">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-semibold text-text-primary group-hover:text-primary transition-colors">
            Bulk Roster Automation
          </h3>
          <p className="text-xs text-text-secondary mt-1 leading-relaxed">
            Import CSV or Excel rosters with column mapping and instant text overflow validation.
          </p>
          <div className="mt-4 flex items-center text-xs text-primary font-medium gap-1">
            <span>Import Roster</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-surface rounded-md border border-border p-5 hover:border-primary/50 transition-all cursor-pointer shadow-sm group">
          <div className="w-10 h-10 rounded-sm bg-surface-subtle text-text-primary flex items-center justify-center mb-3">
            <HardDrive className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-semibold text-text-primary group-hover:text-primary transition-colors">
            Print-Ready Local Exports
          </h3>
          <p className="text-xs text-text-secondary mt-1 leading-relaxed">
            Export production PNG, JPG, or PDF files at 300 DPI directly to your local file system.
          </p>
          <div className="mt-4 flex items-center text-xs text-primary font-medium gap-1">
            <span>Configure Exports</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* Recent Projects Section */}
      <div className="bg-surface rounded-md border border-border overflow-hidden shadow-sm">
        <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-text-secondary" />
            <span className="text-xs font-semibold text-text-primary">
              Recent Local Projects
            </span>
          </div>
          <Button variant="ghost" size="sm">
            View All Projects
          </Button>
        </div>

        <div className="divide-y divide-border">
          {[
            {
              name: 'Thunderbolts FC — Home Kit 2026',
              sport: 'Soccer',
              players: 22,
              dimensions: '20" × 28" (M)',
              modified: '12 minutes ago',
            },
            {
              name: 'Apex Dragons — Away Jersey',
              sport: 'Basketball',
              players: 15,
              dimensions: '22" × 30" (L)',
              modified: 'Yesterday at 4:30 PM',
            },
            {
              name: 'Pacific Volleyball Youth Camp',
              sport: 'Volleyball',
              players: 48,
              dimensions: '16" × 22" (Youth)',
              modified: 'Oct 20, 2026',
            },
          ].map((project, idx) => (
            <div
              key={idx}
              onClick={onOpenEditor}
              className="p-4 flex items-center justify-between hover:bg-surface-subtle/70 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-sm bg-surface-subtle border border-border flex items-center justify-center text-text-secondary group-hover:border-primary/40 group-hover:text-primary">
                  <Shirt className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-text-primary group-hover:text-primary">
                    {project.name}
                  </h4>
                  <div className="flex items-center gap-2 text-[11px] text-text-secondary mt-0.5">
                    <span>{project.sport}</span>
                    <span>•</span>
                    <span className="tabular-nums">{project.players} players</span>
                    <span>•</span>
                    <span className="tabular-nums font-mono">{project.dimensions}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-text-muted">{project.modified}</span>
                <Button variant="outline" size="sm">
                  Open
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
