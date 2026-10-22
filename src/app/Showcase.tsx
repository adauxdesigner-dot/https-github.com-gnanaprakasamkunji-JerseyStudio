import * as React from 'react';
import {
  Type,
  Palette,
  Search,
  Plus,
  Edit2,
  Download,
  RotateCw,
  Eye,
  Lock,
  Shirt,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Button,
  Input,
  Select,
  Checkbox,
  Switch,
  Dialog,
  Tooltip,
  Badge,
  Alert,
  Table,
  Column,
  CanvasResizeControl,
  CanvasDimensions,
} from '@/components/ui';

interface SamplePlayer {
  id: string;
  number: number;
  name: string;
  size: string;
  position: string;
  status: 'Ready' | 'Missing Name' | 'Overflow Warning';
}

const SAMPLE_ROSTER: SamplePlayer[] = [
  { id: '1', number: 10, name: 'ALEXANDER MORGAN', size: 'L', position: 'Forward', status: 'Ready' },
  { id: '2', number: 7, name: 'CHRISTIANO RIVERA', size: 'M', position: 'Winger', status: 'Ready' },
  { id: '3', number: 23, name: 'MARCUS VAN DE BERG', size: 'XL', position: 'Midfielder', status: 'Overflow Warning' },
  { id: '4', number: 1, name: 'DANIEL STERLING', size: 'XXL', position: 'Goalkeeper', status: 'Ready' },
  { id: '5', number: 4, name: 'LEO KOWALSKI', size: 'M', position: 'Defender', status: 'Ready' },
  { id: '6', number: 14, name: '', size: 'S', position: 'Substitute', status: 'Missing Name' },
  { id: '7', number: 9, name: 'GABRIEL SANTOS', size: 'L', position: 'Striker', status: 'Ready' },
  { id: '8', number: 8, name: 'KAI SCHMIDT', size: 'M', position: 'Midfielder', status: 'Ready' },
];

export const Showcase: React.FC = () => {
  // Showcase Tab state
  const [activeSection, setActiveSection] = React.useState<
    'tokens' | 'components' | 'editor-shell' | 'canvas-resize'
  >('components');

  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = React.useState<boolean>(false);

  // Form states
  const [inputVal, setInputVal] = React.useState<string>('Thunderbolts Home 2026');
  const [inputError, setInputError] = React.useState<string>('');
  const [selectedSport, setSelectedSport] = React.useState<string>('soccer');
  const [checkbox1, setCheckbox1] = React.useState<boolean>(true);
  const [checkbox2, setCheckbox2] = React.useState<boolean>(false);
  const [switch1, setSwitch1] = React.useState<boolean>(true);
  const [switch2, setSwitch2] = React.useState<boolean>(false);

  // Table state
  const [rosterData] = React.useState<SamplePlayer[]>(SAMPLE_ROSTER);
  const [sortBy, setSortBy] = React.useState<string>('number');
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = React.useState<number>(1);

  // Canvas Resize State
  const [canvasDimensions, setCanvasDimensions] = React.useState<CanvasDimensions>({
    width: 20,
    height: 28,
    unit: 'in',
    dpi: 300,
  });

  // Editor mockup states
  const [activeGarmentView, setActiveGarmentView] = React.useState<'front' | 'back'>('front');
  const [zoomLevel, setZoomLevel] = React.useState<number>(100);
  const [selectedElement, setSelectedElement] = React.useState<string>('player_number');

  // Handle table sorting
  const handleSort = (columnId: string) => {
    if (sortBy === columnId) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(columnId);
      setSortOrder('asc');
    }
  };

  const sortedData = React.useMemo(() => {
    return [...rosterData].sort((a, b) => {
      let aVal = a[sortBy as keyof SamplePlayer];
      let bVal = b[sortBy as keyof SamplePlayer];
      if (typeof aVal === 'string') {
        return sortOrder === 'asc'
          ? (aVal as string).localeCompare(bVal as string)
          : (bVal as string).localeCompare(aVal as string);
      }
      return sortOrder === 'asc'
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number);
    });
  }, [rosterData, sortBy, sortOrder]);

  const columns: Column<SamplePlayer>[] = [
    {
      id: 'number',
      header: 'No.',
      accessorKey: 'number',
      sortable: true,
      width: '60px',
      cell: (p) => (
        <span className="font-mono font-bold text-text-primary tabular-nums">
          #{p.number}
        </span>
      ),
    },
    {
      id: 'name',
      header: 'Player Name',
      accessorKey: 'name',
      sortable: true,
      cell: (p) => (
        <span className={p.name ? 'font-medium' : 'text-text-muted italic'}>
          {p.name || '(Empty / Missing)'}
        </span>
      ),
    },
    {
      id: 'size',
      header: 'Size',
      accessorKey: 'size',
      sortable: true,
      width: '70px',
      align: 'center',
      cell: (p) => (
        <Badge variant="outline" size="sm">
          {p.size}
        </Badge>
      ),
    },
    {
      id: 'position',
      header: 'Position',
      accessorKey: 'position',
      sortable: true,
    },
    {
      id: 'status',
      header: 'Validation Status',
      accessorKey: 'status',
      sortable: true,
      cell: (p) => {
        if (p.status === 'Ready') {
          return <Badge variant="success" size="sm" dot>Ready</Badge>;
        }
        if (p.status === 'Overflow Warning') {
          return <Badge variant="warning" size="sm" dot>Text Overflow</Badge>;
        }
        return <Badge variant="error" size="sm" dot>Missing Name</Badge>;
      },
    },
    {
      id: 'actions',
      header: 'Action',
      align: 'right',
      cell: (p) => (
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="icon-sm" title={`Edit ${p.name}`} aria-label={`Edit ${p.name}`}>
            <Edit2 className="w-3.5 h-3.5 text-text-secondary" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col h-full bg-bg-app">
      {/* Showcase Sub-header navigation */}
      <div className="bg-surface border-b border-border px-6 py-2.5 flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-sm font-semibold text-text-primary">
            Design System & Component Showcase
          </h2>
          <p className="text-xs text-text-secondary">
            Strict local tokens, accessible components, and editor workspace layout.
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-surface-subtle p-1 rounded-sm border border-border">
          <Button
            variant={activeSection === 'components' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setActiveSection('components')}
          >
            Components
          </Button>
          <Button
            variant={activeSection === 'canvas-resize' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setActiveSection('canvas-resize')}
          >
            Canvas Resizing
          </Button>
          <Button
            variant={activeSection === 'editor-shell' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setActiveSection('editor-shell')}
          >
            Editor Shell Mockup
          </Button>
          <Button
            variant={activeSection === 'tokens' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setActiveSection('tokens')}
          >
            Design Tokens
          </Button>
        </div>
      </div>

      {/* Main Showcase Body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8 max-w-7xl mx-auto w-full">
        {/* ====================================================================
            SECTION 1: UI COMPONENTS
            ==================================================================== */}
        {activeSection === 'components' && (
          <div className="space-y-8 animate-in fade-in duration-150">
            {/* Alerts & Notifications */}
            <section className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                1. Semantic Alerts
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Alert variant="info" title="Local-First Privacy Architecture">
                  All templates, roster rows, and vector exports stay 100% on your device. Never transmitted over the cloud.
                </Alert>
                <Alert variant="success" title="Authorization Active">
                  Licensed offline access verified. Next scheduled refresh in 6 days.
                </Alert>
                <Alert variant="warning" title="Player Name Overflow Warning">
                  Row #3 (MARCUS VAN DE BERG) exceeds 12-inch back printable width at current 72pt font size.
                </Alert>
                <Alert variant="error" title="Missing Required Field">
                  Row #6 has an empty player name. Please fix before approving bulk generation.
                </Alert>
              </div>
            </section>

            {/* Buttons Matrix */}
            <section className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                2. Buttons (Variants & Sizes)
              </h3>
              <div className="p-4 bg-surface rounded-md border border-border space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <Button variant="primary">Primary Action</Button>
                  <Button variant="secondary">Secondary Action</Button>
                  <Button variant="outline">Outline Action</Button>
                  <Button variant="ghost">Ghost Action</Button>
                  <Button variant="destructive">Destructive Action</Button>
                  <Button variant="subtleDestructive">Subtle Destructive</Button>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-border">
                  <Button variant="primary" size="sm">Small (32px)</Button>
                  <Button variant="primary" size="md">Medium (36px)</Button>
                  <Button variant="primary" size="lg">Large (42px)</Button>
                  <Button variant="primary" isLoading>Processing</Button>
                  <Button variant="primary" disabled>Disabled</Button>
                  <Button variant="outline" leftIcon={<Download className="w-4 h-4" />}>
                    Export PNG
                  </Button>
                  <Button variant="secondary" size="icon" title="Rotate Artwork" aria-label="Rotate Artwork">
                    <RotateCw className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </section>

            {/* Form Controls */}
            <section className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                3. Form Controls & Inputs
              </h3>
              <div className="p-4 bg-surface rounded-md border border-border grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="space-y-3">
                  <Input
                    label="Project Name"
                    value={inputVal}
                    onChange={(e) => {
                      setInputVal(e.target.value);
                      if (!e.target.value) {
                        setInputError('Project name cannot be empty');
                      } else {
                        setInputError('');
                      }
                    }}
                    errorMessage={inputError}
                    helperText="Stored locally in projects.sqlite"
                    leftIcon={<Shirt className="w-4 h-4" />}
                  />

                  <Input
                    label="Search Roster"
                    placeholder="Filter by name or number..."
                    leftIcon={<Search className="w-4 h-4" />}
                  />
                </div>

                <div className="space-y-3">
                  <Select
                    label="Sport Category"
                    value={selectedSport}
                    onChange={(e) => setSelectedSport(e.target.value)}
                    options={[
                      { value: 'soccer', label: 'Football / Soccer' },
                      { value: 'basketball', label: 'Basketball' },
                      { value: 'volleyball', label: 'Volleyball' },
                      { value: 'baseball', label: 'Baseball' },
                    ]}
                    helperText="Configures default garment silhouette"
                  />

                  <Select
                    label="Print Quality Preset"
                    defaultValue="300"
                    options={[
                      { value: '300', label: '300 DPI — High Res Production' },
                      { value: '150', label: '150 DPI — Fast Sample Proof' },
                      { value: '72', label: '72 DPI — Web Preview Only' },
                    ]}
                  />
                </div>

                <div className="space-y-4 pt-1">
                  <div className="space-y-2">
                    <Checkbox
                      label="Lock Personalization Field Bounds"
                      description="Prevents player name from bleeding into sleeve seams"
                      checked={checkbox1}
                      onChange={(e) => setCheckbox1(e.target.checked)}
                    />
                    <Checkbox
                      label="Allow Duplicate Numbers"
                      description="Permit identical numbers for scrimmage bibs"
                      checked={checkbox2}
                      onChange={(e) => setCheckbox2(e.target.checked)}
                    />
                  </div>

                  <div className="pt-2 border-t border-border space-y-2">
                    <Switch
                      label="Auto-Fit Long Player Names"
                      description="Scale down font size when name exceeds width"
                      checked={switch1}
                      onCheckedChange={setSwitch1}
                    />
                    <Switch
                      label="Include Bleed Margin (0.125 in)"
                      checked={switch2}
                      onCheckedChange={setSwitch2}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Badges & Modals */}
            <section className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                4. Badges, Tooltips & Modal Dialog
              </h3>
              <div className="p-4 bg-surface rounded-md border border-border flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="default">Default</Badge>
                  <Badge variant="primary">Primary</Badge>
                  <Badge variant="success" dot>Success</Badge>
                  <Badge variant="warning" dot>Warning</Badge>
                  <Badge variant="error" dot>Error</Badge>
                  <Badge variant="outline">Tabular: #23</Badge>
                </div>

                <div className="flex items-center gap-3">
                  <Tooltip content="Open accessible confirmation dialog" position="top">
                    <Button
                      variant="outline"
                      onClick={() => setIsDialogOpen(true)}
                    >
                      Trigger Sample Dialog
                    </Button>
                  </Tooltip>
                </div>
              </div>
            </section>

            {/* Data Table */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                  5. Roster Data Table (Sorting & Pagination)
                </h3>
                <span className="text-xs text-text-secondary">
                  Click column headers to sort • Tabular numerals applied
                </span>
              </div>

              <Table
                columns={columns}
                data={sortedData}
                keyExtractor={(item) => item.id}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={handleSort}
                currentPage={currentPage}
                totalPages={2}
                pageSize={8}
                totalItems={16}
                onPageChange={setCurrentPage}
              />
            </section>
          </div>
        )}

        {/* ====================================================================
            SECTION 2: CANVAS RESIZE CONTROL
            ==================================================================== */}
        {activeSection === 'canvas-resize' && (
          <div className="space-y-6 max-w-2xl mx-auto animate-in fade-in duration-150">
            <div className="bg-surface rounded-md border border-border p-5 space-y-2">
              <h3 className="text-base font-semibold text-text-primary">
                Garment Canvas Resizing & Dimension Control
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                As required by the founder, the editor allows precise configuration of garment dimensions in
                inches, centimeters, millimeters, or pixels. Standard sportswear presets (Youth, S, M, L, XL, XXL)
                can be applied instantly with proportional aspect-ratio lock.
              </p>
            </div>

            <CanvasResizeControl
              initialDimensions={canvasDimensions}
              onApplyDimensions={(newDims) => setCanvasDimensions(newDims)}
            />

            {/* Current Active Dimensions Callout */}
            <div className="p-4 rounded-md border border-border bg-surface-subtle flex items-center justify-between text-xs">
              <div>
                <span className="font-semibold text-text-primary">Active Document Dimensions:</span>
                <p className="text-text-secondary mt-0.5">
                  Physical: {canvasDimensions.width} × {canvasDimensions.height} {canvasDimensions.unit}
                </p>
              </div>
              <Badge variant="primary" size="lg">
                {canvasDimensions.dpi} DPI Production Ready
              </Badge>
            </div>
          </div>
        )}

        {/* ====================================================================
            SECTION 3: EDITOR SHELL WORKSPACE MOCKUP
            ==================================================================== */}
        {activeSection === 'editor-shell' && (
          <div className="h-[700px] border border-border rounded-md overflow-hidden bg-bg-app flex flex-col shadow-panel animate-in fade-in duration-150">
            {/* Editor Workspace Top Bar */}
            <div className="h-11 bg-surface border-b border-border px-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Button
                  variant={activeGarmentView === 'front' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setActiveGarmentView('front')}
                >
                  Front View
                </Button>
                <Button
                  variant={activeGarmentView === 'back' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setActiveGarmentView('back')}
                >
                  Back View
                </Button>
              </div>

              {/* Zoom & Fit Controls */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-text-secondary tabular-nums">
                  Zoom: {zoomLevel}%
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setZoomLevel(Math.max(50, zoomLevel - 10))}
                  aria-label="Zoom out"
                >
                  -
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setZoomLevel(Math.min(200, zoomLevel + 10))}
                  aria-label="Zoom in"
                >
                  +
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setZoomLevel(100)}
                >
                  Fit Canvas
                </Button>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  Export Single Proof
                </Button>
                <Button variant="primary" size="sm">
                  Generate Bulk Variations
                </Button>
              </div>
            </div>

            {/* 3-Panel Editor Workspace */}
            <div className="flex-1 flex overflow-hidden">
              {/* Left Panel: Layers and Personalization Fields */}
              <div className="w-64 bg-surface border-r border-border flex flex-col shrink-0">
                <div className="p-3 border-b border-border flex items-center justify-between">
                  <span className="text-xs font-semibold text-text-primary">
                    Artwork Layers
                  </span>
                  <Button variant="ghost" size="icon-sm" title="Add Layer" aria-label="Add Layer">
                    <Plus className="w-3.5 h-3.5" />
                  </Button>
                </div>

                <div className="flex-1 p-2 space-y-1 overflow-y-auto text-xs">
                  {/* Layer Item 1: Dynamic Personalization Field */}
                  <div
                    onClick={() => setSelectedElement('player_name')}
                    className={cn(
                      'flex items-center justify-between p-2 rounded-sm border cursor-pointer transition-colors',
                      selectedElement === 'player_name'
                        ? 'border-primary bg-primary-subtle text-primary'
                        : 'border-border bg-surface hover:bg-surface-subtle text-text-primary'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Type className="w-3.5 h-3.5 text-primary" />
                      <div className="flex flex-col">
                        <span className="font-semibold text-xs leading-none">
                          PLAYER NAME
                        </span>
                        <span className="text-[10px] text-text-secondary mt-0.5">
                          Dynamic Personalization
                        </span>
                      </div>
                    </div>
                    <Eye className="w-3.5 h-3.5 text-text-muted hover:text-text-primary" />
                  </div>

                  {/* Layer Item 2: Dynamic Number */}
                  <div
                    onClick={() => setSelectedElement('player_number')}
                    className={cn(
                      'flex items-center justify-between p-2 rounded-sm border cursor-pointer transition-colors',
                      selectedElement === 'player_number'
                        ? 'border-primary bg-primary-subtle text-primary'
                        : 'border-border bg-surface hover:bg-surface-subtle text-text-primary'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Type className="w-3.5 h-3.5 text-primary" />
                      <div className="flex flex-col">
                        <span className="font-semibold text-xs leading-none">
                          JERSEY NUMBER
                        </span>
                        <span className="text-[10px] text-text-secondary mt-0.5">
                          Dynamic Personalization
                        </span>
                      </div>
                    </div>
                    <Eye className="w-3.5 h-3.5 text-text-muted hover:text-text-primary" />
                  </div>

                  {/* Layer Item 3: Team Crest Logo */}
                  <div
                    onClick={() => setSelectedElement('team_crest')}
                    className={cn(
                      'flex items-center justify-between p-2 rounded-sm border cursor-pointer transition-colors',
                      selectedElement === 'team_crest'
                        ? 'border-primary bg-primary-subtle text-primary'
                        : 'border-border bg-surface hover:bg-surface-subtle text-text-primary'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Palette className="w-3.5 h-3.5 text-text-secondary" />
                      <div className="flex flex-col">
                        <span className="font-medium text-xs leading-none">
                          Team Crest (Chest Left)
                        </span>
                        <span className="text-[10px] text-text-muted mt-0.5">
                          Static Vector SVG
                        </span>
                      </div>
                    </div>
                    <Lock className="w-3.5 h-3.5 text-text-muted" />
                  </div>

                  {/* Layer Item 4: Sponsor Logo */}
                  <div
                    onClick={() => setSelectedElement('sponsor')}
                    className={cn(
                      'flex items-center justify-between p-2 rounded-sm border cursor-pointer transition-colors',
                      selectedElement === 'sponsor'
                        ? 'border-primary bg-primary-subtle text-primary'
                        : 'border-border bg-surface hover:bg-surface-subtle text-text-primary'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Palette className="w-3.5 h-3.5 text-text-secondary" />
                      <div className="flex flex-col">
                        <span className="font-medium text-xs leading-none">
                          Sponsor Logo (Chest Center)
                        </span>
                        <span className="text-[10px] text-text-muted mt-0.5">
                          Static Vector SVG
                        </span>
                      </div>
                    </div>
                    <Eye className="w-3.5 h-3.5 text-text-muted hover:text-text-primary" />
                  </div>
                </div>
              </div>

              {/* Center Panel: Jersey Design Canvas */}
              <div className="flex-1 bg-checkerboard flex items-center justify-center p-8 overflow-auto relative">
                {/* Simulated Garment Canvas */}
                <div
                  className="w-[340px] h-[460px] bg-surface rounded-lg border-2 border-border relative flex flex-col items-center justify-center p-6 shadow-panel select-none"
                  style={{ transform: `scale(${zoomLevel / 100})` }}
                >
                  {/* Subtle garment neck collar outline */}
                  <div className="absolute top-0 w-28 h-10 border-b-2 border-border rounded-b-full bg-surface-subtle/50" />

                  {/* Canvas View Label */}
                  <div className="absolute top-3 left-3">
                    <Badge variant="outline" size="sm">
                      {activeGarmentView.toUpperCase()} VIEW
                    </Badge>
                  </div>

                  {/* Canvas Dimensions Badge */}
                  <div className="absolute top-3 right-3">
                    <Badge variant="default" size="sm" className="tabular-nums font-mono text-[10px]">
                      20" × 28" (M)
                    </Badge>
                  </div>

                  {/* Simulated Jersey Content based on front/back */}
                  {activeGarmentView === 'back' ? (
                    <div className="flex flex-col items-center justify-center w-full mt-6 space-y-4">
                      {/* Player Name element */}
                      <div
                        onClick={() => setSelectedElement('player_name')}
                        className={cn(
                          'px-4 py-2 border-2 rounded-sm cursor-move text-center font-bold tracking-widest text-lg select-none transition-all',
                          selectedElement === 'player_name'
                            ? 'border-primary bg-primary-subtle/30 text-primary ring-2 ring-primary/20'
                            : 'border-dashed border-border hover:border-primary/50 text-text-primary'
                        )}
                      >
                        ALEXANDER
                      </div>

                      {/* Jersey Number element */}
                      <div
                        onClick={() => setSelectedElement('player_number')}
                        className={cn(
                          'w-36 h-44 flex items-center justify-center border-2 rounded-sm cursor-move font-mono font-black text-7xl select-none transition-all',
                          selectedElement === 'player_number'
                            ? 'border-primary bg-primary-subtle/30 text-primary ring-2 ring-primary/20'
                            : 'border-dashed border-border hover:border-primary/50 text-text-primary'
                        )}
                      >
                        10
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center w-full space-y-8">
                      {/* Chest area */}
                      <div className="w-full flex items-center justify-between px-6 pt-8">
                        <div
                          onClick={() => setSelectedElement('team_crest')}
                          className={cn(
                            'w-12 h-14 border rounded flex items-center justify-center text-[10px] font-bold cursor-pointer',
                            selectedElement === 'team_crest'
                              ? 'border-primary bg-primary-subtle text-primary'
                              : 'border-border bg-surface-subtle text-text-secondary'
                          )}
                        >
                          CREST
                        </div>
                        <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-[10px] text-text-muted">
                          JS
                        </div>
                      </div>

                      {/* Sponsor */}
                      <div
                        onClick={() => setSelectedElement('sponsor')}
                        className={cn(
                          'w-48 py-3 border rounded text-center text-xs font-bold tracking-wider cursor-pointer',
                          selectedElement === 'sponsor'
                            ? 'border-primary bg-primary-subtle text-primary'
                            : 'border-border bg-surface-subtle text-text-secondary'
                        )}
                      >
                        PRIMARY SPONSOR
                      </div>
                    </div>
                  )}

                  {/* Print boundary margin guide */}
                  <div className="absolute inset-4 border border-dashed border-border-hover/60 pointer-events-none rounded" />
                </div>
              </div>

              {/* Right Panel: Element Properties */}
              <div className="w-72 bg-surface border-l border-border flex flex-col shrink-0">
                <div className="p-3 border-b border-border">
                  <span className="text-xs font-semibold text-text-primary">
                    Element Properties
                  </span>
                </div>

                <div className="p-3 space-y-4 overflow-y-auto text-xs">
                  {selectedElement === 'player_number' ? (
                    <>
                      <div className="p-2.5 rounded-sm bg-primary-subtle/40 border border-primary/20 space-y-1">
                        <span className="font-semibold text-primary text-xs flex items-center gap-1.5">
                          <Type className="w-3.5 h-3.5" /> Dynamic Field: Jersey Number
                        </span>
                        <p className="text-[11px] text-text-secondary leading-tight">
                          Bound to roster column <code className="font-mono text-primary font-bold">#number</code>.
                        </p>
                      </div>

                      <Select
                        label="Font Family"
                        defaultValue="varsity"
                        options={[
                          { value: 'varsity', label: 'Jersey Varsity Block' },
                          { value: 'athletic', label: 'Modern Athletic Sans' },
                          { value: 'classic', label: 'Classic Collegiate' },
                        ]}
                      />

                      <div className="grid grid-cols-2 gap-2">
                        <Input label="Font Size" defaultValue="140 pt" />
                        <Input label="Tracking" defaultValue="0 em" />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <Input label="X Position" defaultValue="2.50 in" />
                        <Input label="Y Position" defaultValue="4.20 in" />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-text-primary">
                          Fill Color
                        </label>
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-sm bg-[#171A21] border border-border" />
                          <Input defaultValue="#171A21" className="font-mono" />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-text-primary">
                          Outline Stroke
                        </label>
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-sm bg-[#3157D5] border border-border" />
                          <Input defaultValue="#3157D5 (4px)" className="font-mono" />
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="p-2.5 rounded-sm bg-surface-subtle border border-border space-y-1">
                        <span className="font-semibold text-text-primary text-xs flex items-center gap-1.5">
                          <Type className="w-3.5 h-3.5" /> Selected: {selectedElement.toUpperCase()}
                        </span>
                        <p className="text-[11px] text-text-secondary leading-tight">
                          Configure typography, color fill, and alignment for this design element.
                        </p>
                      </div>

                      <Select
                        label="Text Alignment"
                        defaultValue="center"
                        options={[
                          { value: 'left', label: 'Left Aligned' },
                          { value: 'center', label: 'Center Aligned' },
                          { value: 'right', label: 'Right Aligned' },
                        ]}
                      />

                      <Input label="Width Max Bound" defaultValue="14.0 in" />
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ====================================================================
            SECTION 4: DESIGN TOKENS REFERENCE
            ==================================================================== */}
        {activeSection === 'tokens' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="bg-surface rounded-md border border-border p-5 space-y-2">
              <h3 className="text-base font-semibold text-text-primary">
                Official Design System Tokens
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Defined in <code className="font-mono text-primary font-semibold">docs/DESIGN_SYSTEM.md</code> and implemented in <code className="font-mono text-primary font-semibold">src/styles/tokens.css</code>.
                Light theme first, high-contrast, professional sportswear workstation palette.
              </p>
            </div>

            {/* Colors Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: 'App Background', hex: '#F5F6F8', css: '--color-bg-app', usage: 'Workspace canvas backdrop' },
                { name: 'Surface', hex: '#FFFFFF', css: '--color-surface', usage: 'Panels, cards, tables' },
                { name: 'Subtle Surface', hex: '#F0F2F5', css: '--color-surface-subtle', usage: 'Headers, disabled states' },
                { name: 'Primary Text', hex: '#171A21', css: '--color-text-primary', usage: 'High contrast headers & body' },
                { name: 'Secondary Text', hex: '#5D6675', css: '--color-text-secondary', usage: 'Subtitles, hints, labels' },
                { name: 'Border', hex: '#DCE1E8', css: '--color-border', usage: '1px structural borders' },
                { name: 'Primary Action', hex: '#3157D5', css: '--color-primary', usage: 'Main buttons, selections' },
                { name: 'Primary Hover', hex: '#2547B8', css: '--color-primary-hover', usage: 'Hover state for primary' },
                { name: 'Success', hex: '#16845B', css: '--color-success', usage: 'Validation pass, saved status' },
                { name: 'Warning', hex: '#A86612', css: '--color-warning', usage: 'Text overflow, caution' },
                { name: 'Error', hex: '#C23838', css: '--color-error', usage: 'Validation failures, missing data' },
                { name: 'Focus Ring', hex: '#7AA2FF', css: '--color-focus-ring', usage: 'Accessible focus indicator' },
              ].map((token) => (
                <div
                  key={token.css}
                  className="bg-surface rounded-md border border-border p-3 space-y-2 shadow-sm"
                >
                  <div
                    className="w-full h-12 rounded-sm border border-border shadow-inner"
                    style={{ backgroundColor: token.hex }}
                  />
                  <div className="flex flex-col">
                    <span className="font-semibold text-xs text-text-primary">
                      {token.name}
                    </span>
                    <span className="font-mono text-[11px] text-text-secondary">
                      {token.hex}
                    </span>
                    <span className="font-mono text-[10px] text-text-muted mt-0.5">
                      {token.css}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Typography Hierarchy */}
            <div className="bg-surface rounded-md border border-border p-5 space-y-4">
              <h4 className="text-sm font-semibold text-text-primary">
                Typography Scale
              </h4>
              <div className="space-y-3 divide-y divide-border text-text-primary">
                <div className="pt-2 flex items-baseline justify-between">
                  <span className="text-2xl font-bold">Display Title (26px Bold)</span>
                  <span className="text-xs text-text-muted font-mono">--font-size-display</span>
                </div>
                <div className="pt-2 flex items-baseline justify-between">
                  <span className="text-lg font-semibold">Section Heading H2 (18px SemiBold)</span>
                  <span className="text-xs text-text-muted font-mono">--font-size-h2</span>
                </div>
                <div className="pt-2 flex items-baseline justify-between">
                  <span className="text-base font-semibold">Subheading H3 (16px SemiBold)</span>
                  <span className="text-xs text-text-muted font-mono">--font-size-h3</span>
                </div>
                <div className="pt-2 flex items-baseline justify-between">
                  <span className="text-sm font-normal">Body Text (14px Regular)</span>
                  <span className="text-xs text-text-muted font-mono">--font-size-body</span>
                </div>
                <div className="pt-2 flex items-baseline justify-between">
                  <span className="text-xs font-medium">Control Label (13px Medium)</span>
                  <span className="text-xs text-text-muted font-mono">--font-size-label</span>
                </div>
                <div className="pt-2 flex items-baseline justify-between">
                  <span className="text-[11px] text-text-secondary">Helper & Caption (11-12px Regular)</span>
                  <span className="text-xs text-text-muted font-mono">--font-size-caption</span>
                </div>
                <div className="pt-2 flex items-baseline justify-between">
                  <span className="font-mono text-sm tabular-nums">Tabular Numerals: #10, #23, 1920 × 1080 px</span>
                  <span className="text-xs text-text-muted font-mono">.tabular-nums</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Accessible Dialog Preview */}
      <Dialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title="Confirm Batch Export"
        description="Verify local destination path and format parameters before generating."
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => setIsDialogOpen(false)}
              leftIcon={<Download className="w-3.5 h-3.5" />}
            >
              Start Local Export
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-xs text-text-secondary leading-relaxed">
            JerseyStudio will render <span className="font-semibold text-text-primary">16 player jersey graphics</span> at 300 DPI directly to your device storage.
          </p>
          <div className="p-3 bg-surface-subtle border border-border rounded-sm text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-text-secondary">Output Format:</span>
              <span className="font-semibold text-text-primary">ZIP (PNG + Print PDF)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Storage Location:</span>
              <span className="font-mono text-text-primary text-[11px]">~/Documents/JerseyStudio/Exports/FalconFC_2026</span>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
};
