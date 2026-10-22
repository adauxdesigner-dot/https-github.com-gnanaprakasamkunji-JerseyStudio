import * as React from 'react';
import { AlertTriangle, Clock, ShieldAlert, RefreshCw } from 'lucide-react';
import { useAuth } from './useAuth';
import { Button } from '@/components/ui/Button';

export interface LicenseBannerProps {
  onOpenAuthModal: () => void;
}

export const LicenseBanner: React.FC<LicenseBannerProps> = ({ onOpenAuthModal }) => {
  const { status, hoursRemaining, isOnline, refreshLicense } = useAuth();
  const [loading, setLoading] = React.useState(false);

  if (status === 'active' || status === 'unregistered') {
    return null;
  }

  const handleRefresh = async () => {
    setLoading(true);
    try {
      await refreshLicense();
    } finally {
      setLoading(false);
    }
  };

  if (status === 'grace_period') {
    return (
      <div className="bg-warning/15 border-b border-warning/30 px-4 py-2 flex items-center justify-between text-xs text-text-primary shrink-0">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-warning shrink-0" />
          <span>
            <strong>Offline Renewal Notice:</strong> Your offline authorization expires in {hoursRemaining} hours.
            Connect to the internet to automatically refresh your 7-day window.
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading || !isOnline}
            leftIcon={<RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />}
          >
            {loading ? 'Refreshing...' : 'Check In Now'}
          </Button>
        </div>
      </div>
    );
  }

  if (status === 'expired') {
    return (
      <div className="bg-error/15 border-b border-error/30 px-4 py-2 flex items-center justify-between text-xs text-text-primary shrink-0">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-error shrink-0" />
          <span>
            <strong>7-Day Offline Window Expired:</strong> Online check-in required to export designs.
            <em> All local files, templates, and player rosters remain 100% intact on this Mac.</em>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={onOpenAuthModal}
          >
            Check In Online
          </Button>
        </div>
      </div>
    );
  }

  if (status === 'pending') {
    return (
      <div className="bg-warning/15 border-b border-warning/30 px-4 py-2 flex items-center justify-between text-xs text-text-primary shrink-0">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-warning shrink-0" />
          <span>
            <strong>Awaiting Administrator Approval:</strong> Your email has been verified. The JerseyStudio team is reviewing your account.
          </span>
        </div>
        <Button variant="outline" size="sm" onClick={onOpenAuthModal}>
          View Status
        </Button>
      </div>
    );
  }

  if (status === 'suspended' || status === 'revoked') {
    return (
      <div className="bg-error/15 border-b border-error/30 px-4 py-2 flex items-center justify-between text-xs text-text-primary shrink-0">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-error shrink-0" />
          <span>
            <strong>Account Access {status === 'revoked' ? 'Revoked' : 'Suspended'}:</strong> High-resolution export is temporarily paused. Your local project data is preserved.
          </span>
        </div>
        <Button variant="outline" size="sm" onClick={onOpenAuthModal}>
          Account Details
        </Button>
      </div>
    );
  }

  return null;
};
