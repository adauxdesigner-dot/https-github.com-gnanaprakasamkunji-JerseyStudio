import * as React from 'react';
import { ShieldCheck, ShieldAlert, Clock, AlertTriangle, Shield } from 'lucide-react';
import { useAuth } from './useAuth';
import { cn } from '@/lib/utils';
import { Tooltip } from '@/components/ui/Tooltip';

export interface LicenseStatusBadgeProps {
  onOpenAuthModal: () => void;
  className?: string;
}

export const LicenseStatusBadge: React.FC<LicenseStatusBadgeProps> = ({
  onOpenAuthModal,
  className,
}) => {
  const { status, daysRemaining, hoursRemaining } = useAuth();

  let icon = <Shield className="w-3.5 h-3.5 text-text-muted" />;
  let label = 'Unlicensed';
  let badgeText = 'Sign in';
  let badgeColor = 'text-text-muted bg-surface-subtle';
  let tooltip = 'Click to activate your 7-day offline license.';

  if (status === 'active') {
    icon = <ShieldCheck className="w-3.5 h-3.5 text-success" />;
    label = 'Offline Authorized';
    badgeText = `${daysRemaining}d left`;
    badgeColor = 'text-success bg-success/10 border-success/30';
    tooltip = `Cryptographically authorized offline. ${daysRemaining} days remaining before online check-in is required.`;
  } else if (status === 'grace_period') {
    icon = <Clock className="w-3.5 h-3.5 text-warning" />;
    label = 'Renewal Due Soon';
    badgeText = `${hoursRemaining}h left`;
    badgeColor = 'text-warning bg-warning/10 border-warning/30';
    tooltip = `Entitlement expires in ${hoursRemaining} hours. Reconnect to refresh your 7-day offline window.`;
  } else if (status === 'pending') {
    icon = <Clock className="w-3.5 h-3.5 text-warning" />;
    label = 'Pending Approval';
    badgeText = 'Reviewing';
    badgeColor = 'text-warning bg-warning/10 border-warning/30';
    tooltip = 'Email verified. Waiting for administrator 1-click approval.';
  } else if (status === 'expired') {
    icon = <AlertTriangle className="w-3.5 h-3.5 text-error" />;
    label = 'Offline Expired';
    badgeText = 'Check in';
    badgeColor = 'text-error bg-error/10 border-error/30 animate-pulse';
    tooltip = '7-day offline window expired. Local files remain intact. Click to check in online.';
  } else if (status === 'suspended' || status === 'revoked') {
    icon = <ShieldAlert className="w-3.5 h-3.5 text-error" />;
    label = status === 'revoked' ? 'Revoked' : 'Suspended';
    badgeText = 'Restricted';
    badgeColor = 'text-error bg-error/10 border-error/30';
    tooltip = `Account is ${status}. Local data is safe. Click for details.`;
  }

  return (
    <Tooltip content={tooltip}>
      <button
        type="button"
        onClick={onOpenAuthModal}
        className={cn(
          'w-full flex items-center justify-between text-[11px] p-2 rounded-sm bg-surface border border-border hover:border-primary/50 transition-colors text-left group',
          className
        )}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          {icon}
          <span className="font-medium text-text-primary truncate">{label}</span>
        </div>
        <span
          className={cn(
            'px-1.5 py-0.5 rounded text-[10px] font-mono border transition-colors',
            badgeColor
          )}
        >
          {badgeText}
        </span>
      </button>
    </Tooltip>
  );
};
