/**
 * JerseyStudio Desktop Entitlement Service
 *
 * Manages the 7-day offline grace window:
 * - Day 0 to Day 7: 100% active offline operation.
 * - Day 8+: prompts user for online check-in. Local files NEVER deleted or corrupted!
 * - Reconnection: checks in with server to refresh 7-day entitlement or enforce remote revocation.
 *
 * STRICT PRIVACY BOUNDARY:
 * Zero project names, rosters, player names, or files are EVER sent in request payloads!
 */

import { verifyEntitlementOffline } from './cryptoVerifier';
import { AuthState, StoredLicenseRecord, VerificationResult } from './types';

const STORAGE_KEY = 'jerseystudio_license_cache';
const API_BASE_URL = typeof window !== 'undefined' && (window as any).__JERSEYSTUDIO_CLOUD_API__
  ? (window as any).__JERSEYSTUDIO_CLOUD_API__
  : 'http://localhost:8787';

class EntitlementService {
  private currentAuthState: AuthState = {
    status: 'unregistered',
    email: null,
    tier: null,
    token: null,
    payload: null,
    daysRemaining: 0,
    hoursRemaining: 0,
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    lastVerifiedOnline: null,
    errorMessage: null,
    isVerifying: false,
  };

  private listeners: Set<(state: AuthState) => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleNetworkChange(true));
      window.addEventListener('offline', () => this.handleNetworkChange(false));
    }
  }

  public subscribe(listener: (state: AuthState) => void): () => void {
    this.listeners.add(listener);
    listener(this.currentAuthState);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    for (const listener of this.listeners) {
      listener({ ...this.currentAuthState });
    }
  }

  public getState(): AuthState {
    return { ...this.currentAuthState };
  }

  /**
   * Initializes the entitlement state from local cache on desktop app launch.
   * Completely offline-capable.
   */
  public async initialize(): Promise<AuthState> {
    this.currentAuthState.isVerifying = true;
    this.notify();

    try {
      const rawCache = this.readLocalLicenseCache();
      if (!rawCache || !rawCache.entitlementToken) {
        this.currentAuthState = {
          ...this.currentAuthState,
          status: 'unregistered',
          isVerifying: false,
        };
        this.notify();
        return this.getState();
      }

      // Check if previous state was suspended or revoked
      if (rawCache.cachedStatus === 'suspended' || rawCache.cachedStatus === 'revoked') {
        this.currentAuthState = {
          ...this.currentAuthState,
          status: rawCache.cachedStatus,
          email: rawCache.payload?.sub || null,
          tier: rawCache.payload?.allowed_tier || null,
          token: rawCache.entitlementToken,
          payload: rawCache.payload,
          isVerifying: false,
          errorMessage: rawCache.cachedStatus === 'revoked'
            ? 'Account authorization was permanently revoked by administrator.'
            : 'Account is currently suspended. Please contact administrator.',
        };
        this.notify();
        return this.getState();
      }

      // Cryptographically verify offline
      const verification: VerificationResult = await verifyEntitlementOffline(rawCache.entitlementToken);

      if (!verification.valid) {
        this.currentAuthState = {
          ...this.currentAuthState,
          status: verification.status,
          email: verification.payload?.sub || null,
          tier: verification.payload?.allowed_tier || null,
          token: rawCache.entitlementToken,
          payload: verification.payload || null,
          daysRemaining: verification.daysRemaining,
          hoursRemaining: verification.hoursRemaining,
          errorMessage: verification.errorMessage || null,
          isVerifying: false,
        };
        this.notify();
        return this.getState();
      }

      // Valid entitlement!
      this.currentAuthState = {
        ...this.currentAuthState,
        status: verification.status,
        email: verification.payload!.sub,
        tier: verification.payload!.allowed_tier,
        token: rawCache.entitlementToken,
        payload: verification.payload!,
        daysRemaining: verification.daysRemaining,
        hoursRemaining: verification.hoursRemaining,
        lastVerifiedOnline: rawCache.lastVerifiedOnline ? new Date(rawCache.lastVerifiedOnline) : null,
        errorMessage: null,
        isVerifying: false,
      };

      this.notify();

      // If online, perform background refresh to check for revocation/refresh
      if (this.currentAuthState.isOnline && this.currentAuthState.email) {
        this.refreshOnline(this.currentAuthState.email, rawCache.entitlementToken).catch(() => {
          // Gracefully continue offline if server cannot be reached
        });
      }

      return this.getState();
    } catch (err: any) {
      this.currentAuthState = {
        ...this.currentAuthState,
        status: 'unregistered',
        isVerifying: false,
        errorMessage: err?.message || 'Failed to initialize local licensing',
      };
      this.notify();
      return this.getState();
    }
  }

  /**
   * Request an OTP for email identity verification.
   * Strictly sends only email — zero project data.
   */
  public async requestOtp(email: string): Promise<{ success: boolean; devOtp?: string; message: string }> {
    const cleanEmail = email.trim().toLowerCase();
    const res = await fetch(`${API_BASE_URL}/api/auth/request-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to request verification code');
    }

    return {
      success: true,
      devOtp: data.dev_otp,
      message: data.message || 'Verification code sent',
    };
  }

  /**
   * Verify entered OTP and retrieve signed entitlement or pending approval status.
   */
  public async verifyOtp(email: string, otp: string): Promise<AuthState> {
    const cleanEmail = email.trim().toLowerCase();
    this.currentAuthState.isVerifying = true;
    this.notify();

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, otp: otp.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        // May be suspended or revoked
        const status = data.status || 'unregistered';
        this.currentAuthState = {
          ...this.currentAuthState,
          status,
          email: cleanEmail,
          isVerifying: false,
          errorMessage: data.error || 'Verification failed',
        };
        if (status === 'suspended' || status === 'revoked') {
          this.writeLocalLicenseCache({
            entitlementToken: '',
            payload: {} as any,
            lastVerifiedOnline: new Date().toISOString(),
            offlineGracePeriodDays: 0,
            cachedStatus: status,
          });
        }
        this.notify();
        return this.getState();
      }

      if (data.status === 'pending') {
        this.currentAuthState = {
          ...this.currentAuthState,
          status: 'pending',
          email: cleanEmail,
          isVerifying: false,
          errorMessage: null,
        };
        this.notify();
        return this.getState();
      }

      // Approved & Issued -> Store token and verify
      if (data.status === 'active' && data.entitlement_token) {
        const verification = await verifyEntitlementOffline(data.entitlement_token);
        if (!verification.valid) {
          throw new Error('Server issued invalid token signature: ' + verification.errorMessage);
        }

        const record: StoredLicenseRecord = {
          entitlementToken: data.entitlement_token,
          payload: verification.payload!,
          lastVerifiedOnline: new Date().toISOString(),
          offlineGracePeriodDays: 7,
          cachedStatus: 'active',
        };
        this.writeLocalLicenseCache(record);

        this.currentAuthState = {
          status: 'active',
          email: cleanEmail,
          tier: verification.payload!.allowed_tier,
          token: data.entitlement_token,
          payload: verification.payload!,
          daysRemaining: verification.daysRemaining,
          hoursRemaining: verification.hoursRemaining,
          isOnline: true,
          lastVerifiedOnline: new Date(),
          errorMessage: null,
          isVerifying: false,
        };

        this.notify();
        return this.getState();
      }

      throw new Error('Unexpected response format from authorization service');
    } catch (err: any) {
      this.currentAuthState.isVerifying = false;
      this.currentAuthState.errorMessage = err?.message || 'Verification error';
      this.notify();
      throw err;
    }
  }

  /**
   * Online check-in: Refreshes 7-day entitlement or enforces remote revocation upon reconnection.
   */
  public async refreshOnline(email?: string, _currentToken?: string): Promise<AuthState> {
    const targetEmail = email || this.currentAuthState.email;
    if (!targetEmail) {
      return this.getState();
    }

    this.currentAuthState.isVerifying = true;
    this.notify();

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: targetEmail,
          token_id: this.currentAuthState.payload?.token_id || 'manual_refresh',
        }),
      });

      const data = await res.json();

      // Enforce remote revocation or suspension
      if (res.status === 403) {
        const revokedStatus = data.status === 'revoked' ? 'revoked' : 'suspended';
        this.currentAuthState = {
          ...this.currentAuthState,
          status: revokedStatus,
          isVerifying: false,
          errorMessage: data.error || `License ${revokedStatus} by administrator`,
        };
        this.writeLocalLicenseCache({
          entitlementToken: '',
          payload: {} as any,
          lastVerifiedOnline: new Date().toISOString(),
          offlineGracePeriodDays: 0,
          cachedStatus: revokedStatus,
        });
        this.notify();
        return this.getState();
      }

      if (!res.ok) {
        throw new Error(data.error || 'Refresh check-in failed');
      }

      if (data.status === 'pending') {
        this.currentAuthState = {
          ...this.currentAuthState,
          status: 'pending',
          isVerifying: false,
        };
        this.notify();
        return this.getState();
      }

      if (data.status === 'active' && data.entitlement_token) {
        const verification = await verifyEntitlementOffline(data.entitlement_token);
        if (!verification.valid) {
          throw new Error('Refreshed token has invalid signature');
        }

        const record: StoredLicenseRecord = {
          entitlementToken: data.entitlement_token,
          payload: verification.payload!,
          lastVerifiedOnline: new Date().toISOString(),
          offlineGracePeriodDays: 7,
          cachedStatus: 'active',
        };
        this.writeLocalLicenseCache(record);

        this.currentAuthState = {
          status: 'active',
          email: targetEmail,
          tier: verification.payload!.allowed_tier,
          token: data.entitlement_token,
          payload: verification.payload!,
          daysRemaining: verification.daysRemaining,
          hoursRemaining: verification.hoursRemaining,
          isOnline: true,
          lastVerifiedOnline: new Date(),
          errorMessage: null,
          isVerifying: false,
        };

        this.notify();
        return this.getState();
      }

      this.currentAuthState.isVerifying = false;
      this.notify();
      return this.getState();
    } catch (err: any) {
      // Reconnection error: if network offline, fallback to existing offline validity
      this.currentAuthState.isVerifying = false;
      this.notify();
      return this.getState();
    }
  }

  /**
   * Clear local license session without touching local project files.
   */
  public logout() {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
    this.currentAuthState = {
      status: 'unregistered',
      email: null,
      tier: null,
      token: null,
      payload: null,
      daysRemaining: 0,
      hoursRemaining: 0,
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
      lastVerifiedOnline: null,
      errorMessage: null,
      isVerifying: false,
    };
    this.notify();
  }

  private handleNetworkChange(isOnline: boolean) {
    this.currentAuthState.isOnline = isOnline;
    this.notify();
    if (isOnline && this.currentAuthState.email && this.currentAuthState.status !== 'revoked') {
      this.refreshOnline().catch(() => {});
    }
  }

  private readLocalLicenseCache(): StoredLicenseRecord | null {
    if (typeof localStorage === 'undefined') return null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  private writeLocalLicenseCache(record: StoredLicenseRecord) {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
    } catch {}
  }
}

export const entitlementService = new EntitlementService();
