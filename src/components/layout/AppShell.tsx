import * as React from 'react';
import {
  LayoutDashboard,
  FolderKanban,
  Shirt,
  Settings,
  HardDrive,
  ShieldCheck,
  Save,
  CheckCircle,
  Clock,
  Sparkles,
  HelpCircle,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Tooltip } from '@/components/ui/Tooltip';
import { LicenseStatusBadge, LicenseBanner } from '@/features/auth';

export type NavigationTab = 'dashboard' | 'projects' | 'templates' | 'editor' | 'roster' | 'settings';

export type SaveStatus = 'saved' | 'saving' | 'unsaved' | 'error';

export interface AppShellProps {
  currentTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  projectName?: string;
  saveStatus?: SaveStatus;
  lastSavedAt?: Date | null;
  onManualSave?: () => void;
  onOpenAuthModal?: () => void;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  currentTab,
  onTabChange,
  projectName = 'Falcon FC — Home Jersey 2026',
  saveStatus = 'saved',
  lastSavedAt = new Date(),
  onManualSave,
  onOpenAuthModal,
  children,
}) => {
  const navItems = [
    { id: 'dashboard' as NavigationTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'editor' as NavigationTab, label: 'Jersey Editor', icon: Shirt, badge: 'Active' },
    { id: 'roster' as NavigationTab, label: 'Roster & Bulk', icon: Users, badge: 'New' },
    { id: 'projects' as NavigationTab, label: 'Projects', icon: FolderKanban },
    { id: 'templates' as NavigationTab, label: 'Templates', icon: Sparkles },
    { id: 'settings' as NavigationTab, label: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-bg-app select-none text-text-primary">
      {/* ====================================================================
          1. Left Navigation Sidebar
          ==================================================================== */}
      <aside className="w-56 bg-surface border-r border-border flex flex-col justify-between shrink-0 shadow-sm z-20">
        <div className="flex flex-col">
          {/* Brand Header */}
          <div className="h-12 px-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-sm bg-primary flex items-center justify-center text-text-inverted font-bold text-sm tracking-wider">
                JS
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-xs tracking-tight text-text-primary leading-none">
                  JerseyStudio
                </span>
                <span className="text-[10px] text-text-secondary leading-tight mt-0.5">
                  Desktop Edition
                </span>
              </div>
            </div>
            <Badge variant="default" size="sm" className="font-mono text-[10px]">
              v0.1.0
            </Badge>
          </div>

          {/* Navigation Items */}
          <nav className="p-2 space-y-1" aria-label="Main Navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onTabChange(item.id)}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2 rounded-sm text-xs font-medium transition-colors text-left',
                    isActive
                      ? 'bg-primary text-text-inverted shadow-sm'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-subtle'
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={cn('w-4 h-4 shrink-0', isActive ? 'text-text-inverted' : 'text-text-secondary')} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && !isActive && (
                    <Badge variant="primary" size="sm">
                      {item.badge}
                    </Badge>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer: Local-First & License Status Indicators */}
        <div className="p-3 border-t border-border bg-surface-subtle/50 space-y-2">
          {/* Honest Local-Only Storage Callout */}
          <div className="flex items-start gap-2 p-2 rounded-sm bg-surface border border-border text-[11px]">
            <HardDrive className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
            <div className="flex flex-col">
              <span className="font-medium text-text-primary">100% Local Storage</span>
              <span className="text-text-secondary text-[10px] leading-tight mt-0.5">
                Designs and rosters remain strictly on this Mac.
              </span>
            </div>
          </div>

          {/* Offline License Status Indicator */}
          <LicenseStatusBadge onOpenAuthModal={onOpenAuthModal || (() => {})} />
        </div>
      </aside>

      {/* ====================================================================
          2. Main Area (Top Bar + Main Content Area)
          ==================================================================== */}
      <div className="flex flex-col flex-1 h-full min-w-0 overflow-hidden">
        {/* Top Status Bar */}
        <header className="h-12 border-b border-border bg-surface px-4 flex items-center justify-between shrink-0 z-10">
          {/* Project Title and Breadcrumb */}
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-xs text-text-muted font-medium">Project</span>
            <span className="text-xs text-border">/</span>
            <h1 className="text-xs font-semibold text-text-primary truncate max-w-xs">
              {projectName}
            </h1>
            <Badge variant="outline" size="sm">
              Vector Master
            </Badge>
          </div>

          {/* Honest Save Status & Local Status Bar */}
          <div className="flex items-center gap-3">
            {/* Save state indicator */}
            <div className="flex items-center gap-1.5 text-xs text-text-secondary">
              {saveStatus === 'saved' && (
                <>
                  <CheckCircle className="w-3.5 h-3.5 text-success" />
                  <span className="text-[11px]">
                    Saved locally {lastSavedAt ? `at ${lastSavedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
                  </span>
                </>
              )}
              {saveStatus === 'saving' && (
                <>
                  <Clock className="w-3.5 h-3.5 text-warning animate-spin" />
                  <span className="text-[11px] text-warning">Writing to disk...</span>
                </>
              )}
              {saveStatus === 'unsaved' && (
                <>
                  <span className="w-2 h-2 rounded-full bg-warning" />
                  <span className="text-[11px] text-warning font-medium">Unsaved changes</span>
                </>
              )}
            </div>

            {onManualSave && (
              <Tooltip content="Save Project to Local SQLite & Disk (Cmd+S)">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onManualSave}
                  leftIcon={<Save className="w-3.5 h-3.5 text-text-secondary" />}
                >
                  Save
                </Button>
              </Tooltip>
            )}

            <div className="h-4 w-[1px] bg-border" />

            {/* Offline Status Badge (Strict: NO cloud sync) */}
            <Tooltip content="Application operating offline. All rendering & storage happens locally on device.">
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-sm bg-surface-subtle border border-border text-[11px] font-medium text-text-secondary cursor-help">
                <span className="w-1.5 h-1.5 rounded-full bg-success" />
                <span>Local-First</span>
              </div>
            </Tooltip>

            {/* Help action */}
            <Tooltip content="Documentation & Shortcuts">
              <Button variant="ghost" size="icon-sm" aria-label="Help & Documentation">
                <HelpCircle className="w-4 h-4 text-text-secondary" />
              </Button>
            </Tooltip>
          </div>
        </header>

        {/* Dynamic License Notification Banner */}
        <LicenseBanner onOpenAuthModal={onOpenAuthModal || (() => {})} />

        {/* Content View Area */}
        <main className="flex-1 overflow-auto bg-bg-app">
          {children}
        </main>
      </div>
    </div>
  );
};
