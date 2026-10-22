/**
 * JerseyStudio Desktop Entitlement & Licensing Types
 *
 * NON-NEGOTIABLE PRIVACY BOUNDARY:
 * Local projects, jersey artwork, templates, and player rosters NEVER leave the user's computer.
 * Auth state deals ONLY with email identity, administrator approval, and asymmetric cryptographic license validity.
 */

export type LicenseTier = 'community' | 'pro_sportswear' | 'enterprise_apparel';

export type AccountStatus = 'pending' | 'approved' | 'suspended' | 'revoked';

export type DesktopLicenseStatus =
  | 'unregistered'    // No email or license set yet
  | 'pending'         // Email verified, waiting for founder 1-click approval
  | 'active'          // Valid cryptographic entitlement, within 7-day offline window
  | 'grace_period'    // Expiring soon (1-2 days left)
  | 'expired'         // Day 8+: 7-day offline grace period has elapsed, online check-in needed
  | 'suspended'       // Cloud administrator suspended license (enforced on reconnection)
  | 'revoked';        // Cloud administrator permanently revoked access (enforced on reconnection)

export interface EntitlementPayload {
  sub: string;               // user email
  iss: 'jerseystudio-cloud'; // issuer must match cloud authority
  aud: 'jerseystudio-desktop'; // audience must match desktop client
  iat: number;               // issued at (epoch seconds)
  exp: number;               // expires at (epoch seconds, iat + 7 days)
  allowed_tier: LicenseTier; // licensed tier
  offline_grace_days: number;// 7 days
  account_id: string;
  token_id: string;
  features: string[];
}

export interface StoredLicenseRecord {
  entitlementToken: string;
  payload: EntitlementPayload;
  lastVerifiedOnline: string;   // ISO string timestamp of last online check-in
  offlineGracePeriodDays: number;
  cachedStatus: DesktopLicenseStatus;
}

export interface VerificationResult {
  valid: boolean;
  status: DesktopLicenseStatus;
  payload?: EntitlementPayload;
  daysRemaining: number;
  hoursRemaining: number;
  errorMessage?: string;
}

export interface AuthState {
  status: DesktopLicenseStatus;
  email: string | null;
  tier: LicenseTier | null;
  token: string | null;
  payload: EntitlementPayload | null;
  daysRemaining: number;
  hoursRemaining: number;
  isOnline: boolean;
  lastVerifiedOnline: Date | null;
  errorMessage: string | null;
  isVerifying: boolean;
}
