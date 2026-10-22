import * as React from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Clock,
  Mail,
  KeyRound,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  X,
  HardDrive,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from './useAuth';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const {
    status,
    email: currentEmail,
    tier,
    daysRemaining,
    hoursRemaining,
    isOnline,
    lastVerifiedOnline,
    isVerifying,
    errorMessage,
    requestOtp,
    verifyOtp,
    refreshLicense,
    logout,
  } = useAuth();

  const [step, setStep] = React.useState<'email' | 'otp' | 'status'>('email');
  const [emailInput, setEmailInput] = React.useState('');
  const [otpInput, setOtpInput] = React.useState('');
  const [devOtpHint, setDevOtpHint] = React.useState<string | null>(null);
  const [localLoading, setLocalLoading] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (status === 'active' || status === 'grace_period' || status === 'expired' || status === 'pending' || status === 'suspended' || status === 'revoked') {
      setStep('status');
      if (currentEmail) {
        setEmailInput(currentEmail);
      }
    } else {
      setStep('email');
    }
  }, [status, currentEmail, isOpen]);

  if (!isOpen) return null;

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !emailInput.includes('@')) {
      setFormError('Please enter a valid email address.');
      return;
    }

    setFormError(null);
    setLocalLoading(true);
    try {
      const res = await requestOtp(emailInput);
      if (res.devOtp) {
        setDevOtpHint(res.devOtp);
      }
      setStep('otp');
    } catch (err: any) {
      setFormError(err.message || 'Failed to send verification code');
    } finally {
      setLocalLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpInput || otpInput.trim().length < 6) {
      setFormError('Please enter the 6-digit verification code.');
      return;
    }

    setFormError(null);
    setLocalLoading(true);
    try {
      await verifyOtp(emailInput, otpInput);
      setStep('status');
    } catch (err: any) {
      setFormError(err.message || 'Verification failed');
    } finally {
      setLocalLoading(false);
    }
  };

  const handleManualRefresh = async () => {
    setLocalLoading(true);
    setFormError(null);
    try {
      await refreshLicense();
    } catch (err: any) {
      setFormError(err.message || 'Failed to refresh license check-in');
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-surface rounded-lg border border-border shadow-xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-surface-subtle/50">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-primary text-text-inverted flex items-center justify-center font-bold text-xs">
              JS
            </div>
            <div>
              <h2 className="text-sm font-semibold text-text-primary">
                JerseyStudio Licensing & Identity
              </h2>
              <p className="text-[11px] text-text-secondary">
                Asymmetric 7-day offline cryptographic licensing
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-sm text-text-secondary hover:text-text-primary hover:bg-surface transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          {/* Privacy Reassurance Callout */}
          <div className="flex items-start gap-2.5 p-2.5 rounded-sm bg-surface-subtle border border-border text-xs">
            <HardDrive className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <div className="text-[11px] text-text-secondary leading-tight">
              <strong className="text-text-primary block font-medium">Local-Only Project Privacy</strong>
              Only your email and license validity are verified. Your jersey artwork, rosters, and player names NEVER leave this computer.
            </div>
          </div>

          {formError && (
            <div className="p-2.5 rounded-sm bg-error/10 border border-error/30 text-error text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* STEP 1: EMAIL ENTRY */}
          {step === 'email' && (
            <form onSubmit={handleRequestOtp} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-text-primary mb-1">
                  Work / Team Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="coach@yourteam.com"
                    disabled={localLoading}
                    className="w-full text-xs pl-8 pr-3 py-2 rounded-sm border border-border bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    required
                  />
                  <Mail className="w-3.5 h-3.5 text-text-muted absolute left-2.5 top-2.5" />
                </div>
                <span className="text-[10px] text-text-muted mt-1 block">
                  A 6-digit confirmation code will be sent to confirm email ownership.
                </span>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="sm"
                className="w-full justify-center"
                disabled={localLoading || !emailInput}
              >
                {localLoading ? 'Sending Code...' : 'Send Verification Code'}
              </Button>
            </form>
          )}

          {/* STEP 2: OTP VERIFICATION */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-text-primary">
                    Enter 6-Digit Code
                  </label>
                  <button
                    type="button"
                    onClick={() => setStep('email')}
                    className="text-[11px] text-primary hover:underline"
                  >
                    Change email
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    maxLength={6}
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value.trim())}
                    placeholder="123456"
                    disabled={localLoading}
                    className="w-full text-center tracking-widest font-mono text-base py-2 rounded-sm border border-border bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    required
                  />
                  <KeyRound className="w-3.5 h-3.5 text-text-muted absolute left-2.5 top-3" />
                </div>
                {devOtpHint && (
                  <div className="text-[10px] text-primary bg-primary/10 p-1.5 rounded-sm mt-1.5 flex items-center justify-between font-mono">
                    <span>Dev/Simulation OTP: <strong>{devOtpHint}</strong></span>
                    <button
                      type="button"
                      onClick={() => setOtpInput(devOtpHint)}
                      className="underline font-sans text-[10px]"
                    >
                      Auto-fill
                    </button>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setStep('email')}
                  className="flex-1 justify-center"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={localLoading || otpInput.length < 6}
                  className="flex-1 justify-center"
                >
                  {localLoading ? 'Verifying...' : 'Verify & Authorize'}
                </Button>
              </div>
            </form>
          )}

          {/* STEP 3: STATUS VIEW (Active, Pending, Grace, Expired, Suspended) */}
          {step === 'status' && (
            <div className="space-y-4">
              {/* ACTIVE OR GRACE STATUS */}
              {(status === 'active' || status === 'grace_period') && (
                <div className="p-3 rounded-sm bg-success/10 border border-success/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-success font-semibold text-xs">
                      <ShieldCheck className="w-4 h-4" />
                      <span>{status === 'active' ? 'License Active & Offline Authorized' : 'Renewal Due Soon'}</span>
                    </div>
                    <Badge variant="primary" size="sm">
                      {tier || 'pro_sportswear'}
                    </Badge>
                  </div>
                  <div className="text-xs text-text-secondary space-y-1 pt-1">
                    <div>Authorized Account: <strong className="text-text-primary font-mono">{currentEmail}</strong></div>
                    <div>
                      Offline Grace Window: <strong className="text-success font-semibold">{daysRemaining} days remaining</strong> ({hoursRemaining}h)
                    </div>
                    {lastVerifiedOnline && (
                      <div className="text-[10px] text-text-muted">
                        Last checked online: {lastVerifiedOnline.toLocaleDateString()} at {lastVerifiedOnline.toLocaleTimeString()}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* PENDING APPROVAL STATUS */}
              {status === 'pending' && (
                <div className="p-3 rounded-sm bg-warning/10 border border-warning/30 space-y-2">
                  <div className="flex items-center gap-1.5 text-warning font-semibold text-xs">
                    <Clock className="w-4 h-4" />
                    <span>Email Verified — Pending Founder Approval</span>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Your email address <strong className="text-text-primary">{currentEmail}</strong> has been verified.
                    Access is currently awaiting 1-click approval from the JerseyStudio team.
                  </p>
                  <p className="text-[11px] text-text-muted">
                    Once approved by the founder, click "Check Status" below to activate your 7-day offline entitlement.
                  </p>
                </div>
              )}

              {/* EXPIRED STATUS (DAY 8+) */}
              {status === 'expired' && (
                <div className="p-3 rounded-sm bg-error/10 border border-error/30 space-y-2">
                  <div className="flex items-center gap-1.5 text-error font-semibold text-xs">
                    <AlertTriangle className="w-4 h-4" />
                    <span>7-Day Offline Grace Window Expired</span>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    It has been more than 7 days since your last online check-in. Connect to the internet and click "Check In Online" to refresh your entitlement.
                  </p>
                  <div className="p-2 rounded-sm bg-surface border border-border text-[11px] text-text-primary">
                    <strong>Notice:</strong> Your designs, templates, and player rosters remain 100% safe and intact on this Mac.
                  </div>
                </div>
              )}

              {/* SUSPENDED / REVOKED STATUS */}
              {(status === 'suspended' || status === 'revoked') && (
                <div className="p-3 rounded-sm bg-error/10 border border-error/30 space-y-2">
                  <div className="flex items-center gap-1.5 text-error font-semibold text-xs">
                    <ShieldAlert className="w-4 h-4" />
                    <span>Account Authorization {status === 'revoked' ? 'Revoked' : 'Suspended'}</span>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    {errorMessage || 'Your account access has been restricted by the administrator.'}
                  </p>
                  <div className="p-2 rounded-sm bg-surface border border-border text-[11px] text-text-primary">
                    <strong>Local Data Integrity:</strong> Local files and projects are never destroyed. Contact support for reinstatement.
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-border gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleManualRefresh}
                  disabled={localLoading || !isOnline}
                  leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${localLoading ? 'animate-spin' : ''}`} />}
                >
                  {localLoading ? 'Checking...' : 'Check In Online'}
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      logout();
                      setStep('email');
                    }}
                  >
                    Switch Account
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={onClose}
                  >
                    Done
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
