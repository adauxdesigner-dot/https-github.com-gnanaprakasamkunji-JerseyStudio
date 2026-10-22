import * as React from 'react';
import {
  Search,
  Upload,
  Type,
  Check,
  Laptop,
  Trophy,
  Sliders,
  FolderOpen,
  Trash2,
} from 'lucide-react';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { CustomFontItem } from './editorTypes';

export interface FontManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFontFamily: string;
  onSelectFont: (fontFamily: string) => void;
  customFonts: CustomFontItem[];
  onAddCustomFont: (font: CustomFontItem) => void;
  onRemoveCustomFont: (fontId: string) => void;
}

// Curated Athletic & Sports Fonts (Varsity, Collegiate, Block, Condensed)
export const SPORTS_FONTS_CATALOG: Array<{
  family: string;
  name: string;
  category: 'varsity' | 'block' | 'collegiate' | 'condensed' | 'stencil';
  sampleNumber: string;
  description: string;
}> = [
  {
    family: 'Impact',
    name: 'Impact Bold',
    category: 'varsity',
    sampleNumber: '10',
    description: 'Classic heavy athletic varsity block with maximum impact',
  },
  {
    family: 'Bebas Neue',
    name: 'Bebas Neue',
    category: 'condensed',
    sampleNumber: '07',
    description: 'Tall condensed pro sports title font',
  },
  {
    family: 'Oswald',
    name: 'Oswald',
    category: 'block',
    sampleNumber: '23',
    description: 'Modern block sports lettering for football and basketball',
  },
  {
    family: 'Anton',
    name: 'Anton Heavy',
    category: 'varsity',
    sampleNumber: '99',
    description: 'Ultra-bold geometric athletic headline typeface',
  },
  {
    family: 'Graduate',
    name: 'Graduate Collegiate',
    category: 'collegiate',
    sampleNumber: '88',
    description: 'Traditional American university collegiate varsity slab serif',
  },
  {
    family: 'Russo One',
    name: 'Russo One',
    category: 'block',
    sampleNumber: '04',
    description: 'High-energy angled sports typography',
  },
  {
    family: 'Teko',
    name: 'Teko Condensed',
    category: 'condensed',
    sampleNumber: '34',
    description: 'Extremely tall narrow jersey squad numbering font',
  },
  {
    family: 'Black Ops One',
    name: 'Black Ops Stencil',
    category: 'stencil',
    sampleNumber: '01',
    description: 'Aggressive tactical stencil for extreme sports and hockey',
  },
  {
    family: 'Montserrat',
    name: 'Montserrat ExtraBold',
    category: 'block',
    sampleNumber: '11',
    description: 'Clean modern athletic sans-serif used in elite football kits',
  },
  {
    family: 'Changa One',
    name: 'Changa One',
    category: 'varsity',
    sampleNumber: '18',
    description: 'Chunky collegiate display font with rounded athletic corners',
  },
  {
    family: 'Kanit',
    name: 'Kanit Athletic',
    category: 'condensed',
    sampleNumber: '09',
    description: 'Contemporary speed motorsport and esports jersey typography',
  },
  {
    family: 'Archivo Black',
    name: 'Archivo Pro Black',
    category: 'varsity',
    sampleNumber: '45',
    description: 'Heavyweight national tournament standard lettering',
  },
];

// Fallback System Fonts common on macOS and Windows
const SYSTEM_FONT_FALLBACKS = [
  'Arial',
  'Arial Black',
  'Helvetica Neue',
  'SF Pro Display',
  'Segoe UI',
  'Trebuchet MS',
  'Verdana',
  'Tahoma',
  'Franklin Gothic Medium',
  'Georgia',
  'Times New Roman',
  'Courier New',
  'Consolas',
  'Menlo',
  'Futura',
  'Avenir Next',
  'Lucida Grande',
  'Gill Sans',
  'Palatino',
  'Comic Sans MS',
];

export const FontManagerModal: React.FC<FontManagerModalProps> = ({
  isOpen,
  onClose,
  currentFontFamily,
  onSelectFont,
  customFonts,
  onAddCustomFont,
  onRemoveCustomFont,
}) => {
  const [activeTab, setActiveTab] = React.useState<'sports' | 'system' | 'upload'>('sports');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [previewFontSize, setPreviewFontSize] = React.useState(28);
  const [sampleText, setSampleText] = React.useState('RODRIGUEZ 10');

  // System local fonts state
  const [systemFonts, setSystemFonts] = React.useState<string[]>(SYSTEM_FONT_FALLBACKS);
  const [isQueryingLocalFonts, setIsQueryingLocalFonts] = React.useState(false);
  const [hasQueriedLocalFonts, setHasQueriedLocalFonts] = React.useState(false);
  const [queryError, setQueryError] = React.useState<string | null>(null);

  // File upload input ref
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = React.useState<string | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);

  // Scan local installed system fonts using window.queryLocalFonts() API (100% local)
  const handleQueryLocalFonts = async () => {
    setIsQueryingLocalFonts(true);
    setQueryError(null);
    try {
      if ('queryLocalFonts' in window && typeof (window as unknown as { queryLocalFonts?: () => Promise<Array<{ family: string }>> }).queryLocalFonts === 'function') {
        const availableFonts = await (window as unknown as { queryLocalFonts: () => Promise<Array<{ family: string }>> }).queryLocalFonts();
        const familySet = new Set<string>();
        for (const font of availableFonts) {
          if (font.family) {
            familySet.add(font.family);
          }
        }
        const sortedList = Array.from(familySet).sort((a, b) => a.localeCompare(b));
        setSystemFonts(sortedList);
        setHasQueriedLocalFonts(true);
      } else {
        // Local Font Access API not enabled in browser, fall back cleanly
        setSystemFonts(SYSTEM_FONT_FALLBACKS);
        setHasQueriedLocalFonts(true);
        setQueryError('Direct OS query not supported in current browser engine. Loaded standard Mac & Windows local fonts.');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Permission denied or unsupported';
      setQueryError(`System font access: ${message}. Using native system font list.`);
      setSystemFonts(SYSTEM_FONT_FALLBACKS);
      setHasQueriedLocalFonts(true);
    } finally {
      setIsQueryingLocalFonts(false);
    }
  };

  // Upload local font files (.ttf, .otf, .woff, .woff2) via HTML5 FontFace API
  const handleFontFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadError(null);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileName = file.name;
      const extension = fileName.split('.').pop()?.toLowerCase();

      if (!['ttf', 'otf', 'woff', 'woff2'].includes(extension || '')) {
        setUploadError(`Unsupported file "${fileName}". Please choose .ttf, .otf, .woff, or .woff2.`);
        continue;
      }

      try {
        const buffer = await file.arrayBuffer();
        const baseName = fileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        const fontId = `custom-font-${Date.now()}-${i}`;
        const fontFamily = `UserFont_${baseName.replace(/\s+/g, '')}_${Date.now()}`;

        // Register font with browser FontFace API into local memory
        const fontFace = new FontFace(fontFamily, buffer);
        await fontFace.load();
        document.fonts.add(fontFace);

        onAddCustomFont({
          id: fontId,
          name: baseName,
          family: fontFamily,
          source: 'uploaded',
          format: extension?.toUpperCase(),
        });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to parse font file';
        setUploadError(`Failed to load "${fileName}": ${message}`);
      }
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setIsUploading(false);
  };

  // Filtered Sports Fonts
  const filteredSportsFonts = React.useMemo(() => {
    return SPORTS_FONTS_CATALOG.filter(
      (font) =>
        font.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        font.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        font.family.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  // Filtered System Fonts
  const filteredSystemFonts = React.useMemo(() => {
    return systemFonts.filter((font) =>
      font.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [systemFonts, searchQuery]);

  // Filtered Uploaded Fonts
  const filteredCustomFonts = React.useMemo(() => {
    return customFonts.filter(
      (font) =>
        font.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        font.family.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [customFonts, searchQuery]);

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Jersey Font Manager"
      description="Select athletic typography, scan locally installed system fonts, or load your team's custom TTF/OTF files."
      size="xl"
    >
      <div className="flex flex-col h-[580px] -mx-6 -my-4">
        {/* Top Filter Bar: Tabs & Controls */}
        <div className="p-4 border-b border-border bg-surface-subtle/50 space-y-3 shrink-0">
          <div className="flex items-center justify-between gap-4">
            {/* Tab Selector */}
            <div className="flex bg-surface-subtle p-0.5 rounded-lg border border-border shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('sports')}
                className={cn(
                  'px-3.5 py-1.5 rounded-md text-xs font-semibold flex items-center gap-2 transition-all',
                  activeTab === 'sports'
                    ? 'bg-surface text-primary shadow-xs'
                    : 'text-text-secondary hover:text-text-primary'
                )}
              >
                <Trophy className="w-3.5 h-3.5" />
                Sports Fonts
                <Badge variant="secondary" size="sm" className="ml-1">
                  {SPORTS_FONTS_CATALOG.length}
                </Badge>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('system')}
                className={cn(
                  'px-3.5 py-1.5 rounded-md text-xs font-semibold flex items-center gap-2 transition-all',
                  activeTab === 'system'
                    ? 'bg-surface text-primary shadow-xs'
                    : 'text-text-secondary hover:text-text-primary'
                )}
              >
                <Laptop className="w-3.5 h-3.5" />
                System Fonts
                <Badge variant="secondary" size="sm" className="ml-1">
                  {systemFonts.length}
                </Badge>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                className={cn(
                  'px-3.5 py-1.5 rounded-md text-xs font-semibold flex items-center gap-2 transition-all',
                  activeTab === 'upload'
                    ? 'bg-surface text-primary shadow-xs'
                    : 'text-text-secondary hover:text-text-primary'
                )}
              >
                <Upload className="w-3.5 h-3.5" />
                Uploaded Fonts
                <Badge variant="primary" size="sm" className="ml-1">
                  {customFonts.length}
                </Badge>
              </button>
            </div>

            {/* Font Search Box */}
            <div className="relative flex-1 max-w-xs">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <Input
                placeholder="Search font by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-8 text-xs"
              />
            </div>
          </div>

          {/* Sample Text & Preview Size Slider */}
          <div className="flex items-center justify-between gap-4 pt-1">
            <div className="flex items-center gap-2 flex-1">
              <span className="text-xs text-text-secondary font-medium shrink-0">Sample Text:</span>
              <Input
                value={sampleText}
                onChange={(e) => setSampleText(e.target.value)}
                className="h-7 text-xs font-mono max-w-sm"
                placeholder="Type sample text..."
              />
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <span className="text-xs text-text-secondary font-medium flex items-center gap-1">
                <Sliders className="w-3.5 h-3.5" />
                Size: <span className="font-mono font-bold text-text-primary">{previewFontSize}px</span>
              </span>
              <input
                type="range"
                min="16"
                max="48"
                step="2"
                value={previewFontSize}
                onChange={(e) => setPreviewFontSize(Number(e.target.value))}
                className="w-28 accent-primary h-1.5 bg-border rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* ====================================================================
            TAB CONTENT
            ==================================================================== */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* TAB 1: SPORTS FONTS */}
          {activeTab === 'sports' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredSportsFonts.map((font) => {
                const isSelected = currentFontFamily === font.family;
                return (
                  <div
                    key={font.family}
                    onClick={() => {
                      onSelectFont(font.family);
                      onClose();
                    }}
                    className={cn(
                      'p-3.5 rounded-lg border text-left cursor-pointer transition-all flex flex-col justify-between group hover:border-primary hover:shadow-sm',
                      isSelected
                        ? 'border-primary bg-primary-subtle/30 ring-1 ring-primary'
                        : 'border-border bg-surface'
                    )}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-text-primary group-hover:text-primary">
                            {font.name}
                          </span>
                          <Badge variant="outline" size="sm" className="uppercase text-[9px]">
                            {font.category}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-text-muted mt-0.5 line-clamp-1">
                          {font.description}
                        </p>
                      </div>
                      {isSelected ? (
                        <div className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3" />
                        </div>
                      ) : (
                        <div className="w-7 h-7 rounded bg-surface-subtle flex items-center justify-center text-xs font-bold text-text-muted font-mono shrink-0">
                          {font.sampleNumber}
                        </div>
                      )}
                    </div>

                    {/* Live Preview Text */}
                    <div
                      style={{
                        fontFamily: font.family,
                        fontSize: `${previewFontSize}px`,
                      }}
                      className="py-2 text-text-primary tracking-wider truncate font-bold leading-tight"
                    >
                      {sampleText || 'JERSEY 10'}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: SYSTEM FONTS */}
          {activeTab === 'system' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-md bg-surface-subtle border border-border">
                <div>
                  <div className="text-xs font-bold text-text-primary">
                    Local Device Installed Fonts
                  </div>
                  <div className="text-[11px] text-text-secondary">
                    {hasQueriedLocalFonts
                      ? `Found ${systemFonts.length} locally installed system fonts.`
                      : 'Scan all font families installed natively on this Mac / Windows workstation.'}
                  </div>
                  {queryError && (
                    <div className="text-[11px] text-warning mt-1">{queryError}</div>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleQueryLocalFonts}
                  disabled={isQueryingLocalFonts}
                  className="shrink-0 text-xs gap-1.5"
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  {isQueryingLocalFonts ? 'Scanning OS...' : 'Scan Local Fonts'}
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredSystemFonts.map((fontName) => {
                  const isSelected = currentFontFamily === fontName;
                  return (
                    <div
                      key={fontName}
                      onClick={() => {
                        onSelectFont(fontName);
                        onClose();
                      }}
                      className={cn(
                        'p-3.5 rounded-lg border text-left cursor-pointer transition-all flex flex-col justify-between group hover:border-primary hover:shadow-sm',
                        isSelected
                          ? 'border-primary bg-primary-subtle/30 ring-1 ring-primary'
                          : 'border-border bg-surface'
                      )}
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-xs font-semibold text-text-primary group-hover:text-primary truncate">
                          {fontName}
                        </span>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </div>

                      {/* Live Preview Text */}
                      <div
                        style={{
                          fontFamily: fontName,
                          fontSize: `${previewFontSize}px`,
                        }}
                        className="py-1 text-text-primary truncate leading-tight"
                      >
                        {sampleText || 'CHAMPIONS 24'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: UPLOAD FONTS */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              {/* File Drop / Upload Box */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border hover:border-primary/70 bg-surface-subtle/40 hover:bg-surface-subtle p-6 rounded-lg text-center cursor-pointer transition-all group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".ttf,.otf,.woff,.woff2"
                  multiple
                  onChange={handleFontFileUpload}
                  className="hidden"
                />
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <Upload className="w-5 h-5" />
                </div>
                <div className="text-xs font-bold text-text-primary">
                  Click to Browse or Drag & Drop Custom Font Files
                </div>
                <div className="text-[11px] text-text-muted mt-1">
                  Supports .TTF, .OTF, .WOFF, and .WOFF2 • Loaded 100% locally into memory
                </div>
              </div>

              {uploadError && (
                <div className="p-2.5 rounded bg-warning-subtle text-warning border border-warning/30 text-xs">
                  {uploadError}
                </div>
              )}

              {/* Uploaded Fonts List */}
              {customFonts.length === 0 ? (
                <div className="text-center py-8 text-text-muted text-xs">
                  No custom fonts loaded yet. Upload your custom club, league, or sponsor TTF files above.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredCustomFonts.map((font) => {
                    const isSelected = currentFontFamily === font.family;
                    return (
                      <div
                        key={font.id}
                        className={cn(
                          'p-3.5 rounded-lg border text-left transition-all flex flex-col justify-between group hover:border-primary hover:shadow-sm',
                          isSelected
                            ? 'border-primary bg-primary-subtle/30 ring-1 ring-primary'
                            : 'border-border bg-surface'
                        )}
                      >
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-text-primary">
                              {font.name}
                            </span>
                            {font.format && (
                              <Badge variant="secondary" size="sm" className="font-mono text-[9px]">
                                {font.format}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0 text-text-muted hover:text-danger"
                              onClick={(e) => {
                                e.stopPropagation();
                                onRemoveCustomFont(font.id);
                              }}
                              title="Delete font"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              size="sm"
                              variant={isSelected ? 'primary' : 'outline'}
                              className="h-6 px-2 text-[11px]"
                              onClick={() => {
                                onSelectFont(font.family);
                                onClose();
                              }}
                            >
                              {isSelected ? 'Active' : 'Apply'}
                            </Button>
                          </div>
                        </div>

                        {/* Live Preview Text */}
                        <div
                          style={{
                            fontFamily: font.family,
                            fontSize: `${previewFontSize}px`,
                          }}
                          className="py-1 text-text-primary truncate leading-tight font-bold"
                        >
                          {sampleText || 'CUSTOM SQUAD 99'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-border bg-surface-subtle flex items-center justify-between text-xs text-text-secondary shrink-0">
          <div className="flex items-center gap-1.5">
            <Type className="w-3.5 h-3.5 text-primary" />
            <span>Active Font: <strong className="text-text-primary font-mono">{currentFontFamily}</strong></span>
          </div>
          <Button size="sm" variant="outline" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
