import * as React from 'react';
import { AppShell, NavigationTab, SaveStatus } from '@/components/layout/AppShell';
import { Showcase } from '@/app/Showcase';
import { DashboardView } from '@/features/dashboard/DashboardView';
import { RosterWorkflowView } from '@/features/roster';
import { EditorView } from '@/features/editor';
import { AuthModal } from '@/features/auth';

export function App() {
  const [currentTab, setCurrentTab] = React.useState<NavigationTab>('editor');
  const [saveStatus, setSaveStatus] = React.useState<SaveStatus>('saved');
  const [lastSaved, setLastSaved] = React.useState<Date | null>(new Date());
  const [isAuthModalOpen, setIsAuthModalOpen] = React.useState<boolean>(false);

  const handleManualSave = () => {
    setSaveStatus('saving');
    setTimeout(() => {
      setSaveStatus('saved');
      setLastSaved(new Date());
    }, 700);
  };

  return (
    <AppShell
      currentTab={currentTab}
      onTabChange={setCurrentTab}
      projectName="Falcon FC — Home Jersey 2026"
      saveStatus={saveStatus}
      lastSavedAt={lastSaved}
      onManualSave={handleManualSave}
      onOpenAuthModal={() => setIsAuthModalOpen(true)}
    >
      {currentTab === 'dashboard' ? (
        <DashboardView
          onOpenEditor={() => setCurrentTab('editor')}
          onOpenRoster={() => setCurrentTab('roster')}
        />
      ) : currentTab === 'roster' ? (
        <RosterWorkflowView onBackToEditor={() => setCurrentTab('editor')} />
      ) : currentTab === 'editor' ? (
        <EditorView />
      ) : (
        <Showcase />
      )}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </AppShell>
  );
}

export default App;
