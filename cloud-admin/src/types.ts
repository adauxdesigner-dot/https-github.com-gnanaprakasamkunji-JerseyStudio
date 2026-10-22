export type AccountStatus = 'pending' | 'approved' | 'suspended' | 'revoked';
export type LicenseTier = 'community' | 'pro_sportswear' | 'enterprise_apparel';

export interface EntitlementPayload {
  sub: string;              // user email
  iss: 'jerseystudio-cloud';// authorized cloud issuer
  aud: 'jerseystudio-desktop'; // target desktop client
  iat: number;              // issued at (epoch seconds)
  exp: number;              // expires at (epoch seconds, 7 days from iat)
  allowed_tier: LicenseTier;// licensed tier
  offline_grace_days: number;// 7
  account_id: string;
  token_id: string;
  features: string[];
}

export interface CompactEntitlementToken {
  entitlement_token: string; // base64url(canonical_payload) + "." + base64url(signature)
  payload: EntitlementPayload;
  signature: string;
  issued_at: string;
  expires_at: string;
  offline_grace_days: number;
}

export interface AuthorizedAccount {
  id: string;
  email: string;
  status: AccountStatus;
  email_verified_at: string | null;
  approved_at: string | null;
  approved_by: string | null;
  suspended_at: string | null;
  revoked_at: string | null;
  status_reason: string | null;
  created_at: string;
  updated_at: string;
  tier?: LicenseTier;
  features?: string[];
}

export interface AdminAuditEvent {
  id: string;
  timestamp: string;
  admin_email: string;
  action: string;
  target_email: string;
  details: string;
  ip_address?: string;
}
