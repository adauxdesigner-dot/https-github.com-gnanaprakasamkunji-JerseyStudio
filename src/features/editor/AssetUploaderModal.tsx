import * as React from 'react';
import {
  Upload,
  Image as ImageIcon,
  Trash2,
  Plus,
} from 'lucide-react';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { GarmentView } from './editorTypes';

export interface LocalAsset {
  id: string;
  name: string;
  type: 'crest' | 'sponsor' | 'badge' | 'artwork';
  dataUrl: string;
  fileName: string;
  format: 'png' | 'svg' | 'jpg';
  width: number;
  height: number;
  aspectRatio: number;
}

export interface AssetUploaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeView: GarmentView;
  onAddImageAsset: (asset: LocalAsset, targetDimensions: { width: number; height: number; x: number; y: number }) => void;
}

// Built-in starter athletic vector crests & sponsor logos (100% local inline SVGs)
const SAMPLE_STARTER_ASSETS: LocalAsset[] = [
  {
    id: 'starter-crest-fc',
    name: 'FC Championship Shield Crest',
    type: 'crest',
    format: 'svg',
    width: 400,
    height: 400,
    aspectRatio: 1,
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><polygon points="50,5 92,18 80,75 50,95 20,75 8,18" fill="%23FFC72C" stroke="%23FFFFFF" stroke-width="3"/><polygon points="50,12 85,22 75,70 50,88 25,70 15,22" fill="%230B2545"/><text x="50" y="58" font-family="sans-serif" font-weight="900" font-size="28" fill="%23FFFFFF" text-anchor="middle">FC</text></svg>`,
    fileName: 'fc_shield_crest.svg',
  },
  {
    id: 'starter-sponsor-fly',
    name: 'Aero Sports Chest Sponsor',
    type: 'sponsor',
    format: 'svg',
    width: 600,
    height: 150,
    aspectRatio: 4,
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 100"><text x="200" y="68" font-family="sans-serif" font-style="italic" font-weight="900" font-size="52" fill="%23FFFFFF" text-anchor="middle" letter-spacing="4">AEROSPORT</text></svg>`,
    fileName: 'aerosport_sponsor.svg',
  },
  {
    id: 'starter-badge-league',
    name: 'Gold Star League Honor Badge',
    type: 'badge',
    format: 'svg',
    width: 300,
    height: 300,
    aspectRatio: 1,
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><polygon points="50,5 64,36 98,36 70,57 81,91 50,70 19,91 30,57 2,36 36,36" fill="%23FFC72C" stroke="%23FFFFFF" stroke-width="2"/></svg>`,
    fileName: 'gold_star_league_badge.svg',
  },
];

export const AssetUploaderModal: React.FC<AssetUploaderModalProps> = ({
  isOpen,
  onClose,
  activeView,
  onAddImageAsset,
}) => {
  const [assets, setAssets] = React.useState<LocalAsset[]>(() => {
    try {
      const saved = localStorage.getItem('jerseystudio_local_assets');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return SAMPLE_STARTER_ASSETS;
  });

  const [activeTab, setActiveTab] = React.useState<'all' | 'crest' | 'sponsor' | 'badge'>('all');
  const [selectedAssetType, setSelectedAssetType] = React.useState<'crest' | 'sponsor' | 'badge'>('sponsor');
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Save assets to local storage
  React.useEffect(() => {
    try {
      localStorage.setItem('jerseystudio_local_assets', JSON.stringify(assets));
    } catch {
      // Ignore quota errors if storage full
    }
  }, [assets]);

  // Handle local file ingestion (PNG, SVG, JPG) via FileReader
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setErrorMsg(null);
    setIsProcessing(true);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const validTypes = ['image/png', 'image/svg+xml', 'image/jpeg', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        setErrorMsg(`Unsupported file type: ${file.name}. Only PNG, SVG, and JPG are supported.`);
        continue;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (!dataUrl) return;

        // Load image to extract natural dimensions and aspect ratio
        const img = new Image();
        img.onload = () => {
          const naturalW = img.naturalWidth || 300;
          const naturalH = img.naturalHeight || 300;
          const ext = file.name.split('.').pop()?.toLowerCase();
          const format = ext === 'svg' ? 'svg' : ext === 'png' ? 'png' : 'jpg';

          const newAsset: LocalAsset = {
            id: `asset-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
            name: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
            type: selectedAssetType,
            dataUrl,
            fileName: file.name,
            format,
            width: naturalW,
            height: naturalH,
            aspectRatio: naturalW / naturalH,
          };

          setAssets((prev) => [newAsset, ...prev]);
          setIsProcessing(false);
        };
        img.onerror = () => {
          setErrorMsg(`Failed to decode image data for ${file.name}`);
          setIsProcessing(false);
        };
        img.src = dataUrl;
      };
      reader.onerror = () => {
        setErrorMsg(`Failed to read file ${file.name}`);
        setIsProcessing(false);
      };
      reader.readAsDataURL(file);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDeleteAsset = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setAssets((prev) => prev.filter((a) => a.id !== id));
  };

  // Place asset onto jersey with appropriate physical dimensions
  const handlePlaceOnJersey = (asset: LocalAsset) => {
    let targetW = 4;
    let targetH = 4;
    let targetX = 8;
    let targetY = 8;

    if (asset.type === 'crest') {
      targetW = 3.2;
      targetH = 3.2 / asset.aspectRatio;
      targetX = 4.5;
      targetY = 7.5;
    } else if (asset.type === 'sponsor') {
      targetW = 10;
      targetH = Math.min(4, 10 / asset.aspectRatio);
      targetX = 5;
      targetY = 12.5;
    } else if (asset.type === 'badge') {
      targetW = 2.5;
      targetH = 2.5 / asset.aspectRatio;
      targetX = 14;
      targetY = 7.5;
    } else {
      targetW = 6;
      targetH = 6 / asset.aspectRatio;
      targetX = 7;
      targetY = 10;
    }

    onAddImageAsset(asset, {
      width: Number(targetW.toFixed(2)),
      height: Number(targetH.toFixed(2)),
      x: Number(targetX.toFixed(2)),
      y: Number(targetY.toFixed(2)),
    });
    onClose();
  };

  const filteredAssets = assets.filter((asset) => {
    if (activeTab === 'all') return true;
    return asset.type === activeTab;
  });

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Sponsor Logos & Crest Uploader"
      description="Ingest sponsor logos, team crests, and sleeve patches locally. PNG, SVG, and JPG are supported."
      size="xl"
    >
      <div className="flex flex-col h-[560px] -mx-6 -my-4">
        {/* Top Controls & Dropzone */}
        <div className="p-4 border-b border-border bg-surface-subtle/50 space-y-3 shrink-0">
          <div className="flex items-center justify-between gap-4">
            {/* Category Filter Pills */}
            <div className="flex bg-surface-subtle p-0.5 rounded-lg border border-border shrink-0">
              {(['all', 'crest', 'sponsor', 'badge'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    'px-3.5 py-1.5 rounded-md text-xs font-semibold capitalize transition-all',
                    activeTab === tab
                      ? 'bg-surface text-primary shadow-xs'
                      : 'text-text-secondary hover:text-text-primary'
                  )}
                >
                  {tab === 'all' ? `All (${assets.length})` : `${tab}s`}
                </button>
              ))}
            </div>

            {/* Asset Role Selector for incoming upload */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-secondary font-medium">Upload Role:</span>
              <select
                value={selectedAssetType}
                onChange={(e) => setSelectedAssetType(e.target.value as 'crest' | 'sponsor' | 'badge')}
                className="h-8 text-xs bg-surface border border-border rounded px-2 text-text-primary"
              >
                <option value="sponsor">Chest / Back Sponsor</option>
                <option value="crest">Club / Team Crest</option>
                <option value="badge">Sleeve / League Badge</option>
              </select>
            </div>
          </div>

          {/* Drag & Drop Upload Zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-border hover:border-primary bg-surface-subtle/60 hover:bg-surface-subtle p-4 rounded-lg flex items-center justify-center gap-4 cursor-pointer transition-all group"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".png,.svg,.jpg,.jpeg,image/png,image/svg+xml,image/jpeg"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
            <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-text-primary group-hover:text-primary">
                Click to browse or drop Sponsor Logos & Crests
              </div>
              <div className="text-[11px] text-text-muted">
                Accepts PNG (transparent), SVG (vector), and JPG • Processed 100% locally
              </div>
            </div>
          </div>

          {errorMsg && (
            <div className="p-2 rounded bg-danger-subtle text-danger border border-danger/30 text-xs">
              {errorMsg}
            </div>
          )}
        </div>

        {/* Asset Cards Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredAssets.length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center text-text-muted text-xs">
              <ImageIcon className="w-8 h-8 mb-2 opacity-40" />
              <span>No assets in this category. Upload your team graphics above.</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {filteredAssets.map((asset) => (
                <div
                  key={asset.id}
                  className="p-3 rounded-lg border border-border bg-surface flex flex-col justify-between group hover:border-primary hover:shadow-sm transition-all"
                >
                  {/* Top Bar: Name & Format Badge */}
                  <div className="flex items-start justify-between gap-1 mb-2">
                    <div>
                      <h4 className="text-xs font-bold text-text-primary truncate max-w-[130px] group-hover:text-primary">
                        {asset.name}
                      </h4>
                      <span className="text-[10px] text-text-muted font-mono uppercase">
                        {asset.type} • {asset.width}×{asset.height}px
                      </span>
                    </div>
                    <Badge variant="secondary" size="sm" className="font-mono text-[9px] uppercase">
                      {asset.format}
                    </Badge>
                  </div>

                  {/* Thumbnail Preview Area with Checkerboard Background for Transparency */}
                  <div className="h-28 w-full rounded bg-surface-subtle/80 border border-border/60 flex items-center justify-center p-2 overflow-hidden relative">
                    <img
                      src={asset.dataUrl}
                      alt={asset.name}
                      className="max-h-full max-w-full object-contain filter drop-shadow-xs group-hover:scale-105 transition-transform"
                    />
                  </div>

                  {/* Bottom Actions */}
                  <div className="flex items-center justify-between gap-2 mt-3 pt-2 border-t border-border/60">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 text-text-muted hover:text-danger"
                      onClick={(e) => handleDeleteAsset(asset.id, e)}
                      title="Delete asset"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>

                    <Button
                      size="sm"
                      variant="primary"
                      className="h-7 px-2.5 text-xs gap-1 font-semibold"
                      onClick={() => handlePlaceOnJersey(asset)}
                    >
                      <Plus className="w-3 h-3" />
                      Add to {activeView.replace('_', ' ')}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-border bg-surface-subtle flex items-center justify-between text-xs text-text-secondary shrink-0">
          <span>Active Garment View: <strong className="text-text-primary capitalize">{activeView.replace('_', ' ')}</strong></span>
          <Button size="sm" variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
