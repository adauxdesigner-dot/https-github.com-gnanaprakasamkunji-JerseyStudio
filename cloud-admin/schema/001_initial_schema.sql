-- JerseyStudio Cloud Authorization & Licensing Schema
-- STRICT ARCHITECTURAL RULE: Zero project, roster, template, or artwork tables!
-- User jersey designs and rosters remain exclusively on the user's desktop device.
-- Cloud scope is strictly limited to: email verification, founder approval, license tier,
-- asymmetric signed entitlement issuance, and admin audit logging.

-- 1. Admin Users (Founder and support staff managing approvals)
CREATE TABLE IF NOT EXISTS admin_users (
    id TEXT PRIMARY KEY NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'super_admin' CHECK(role IN ('founder', 'super_admin', 'support_admin')),
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- 2. Authorized Accounts (Desktop users requesting and holding licenses)
CREATE TABLE IF NOT EXISTS authorized_accounts (
    id TEXT PRIMARY KEY NOT NULL,
    email TEXT UNIQUE NOT NULL COLLATE NOCASE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'suspended', 'revoked')),
    email_verified_at TEXT,
    verification_otp TEXT,
    otp_expires_at TEXT,
    approved_at TEXT,
    approved_by TEXT REFERENCES admin_users(email),
    suspended_at TEXT,
    revoked_at TEXT,
    status_reason TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_authorized_accounts_email ON authorized_accounts(email);
CREATE INDEX IF NOT EXISTS idx_authorized_accounts_status ON authorized_accounts(status);

-- 3. Account Permissions (Licensed feature entitlements per account)
CREATE TABLE IF NOT EXISTS account_permissions (
    id TEXT PRIMARY KEY NOT NULL,
    account_id TEXT NOT NULL REFERENCES authorized_accounts(id) ON DELETE CASCADE,
    tier TEXT NOT NULL DEFAULT 'pro_sportswear' CHECK(tier IN ('community', 'pro_sportswear', 'enterprise_apparel')),
    max_export_resolution INTEGER NOT NULL DEFAULT 600,
    features_json TEXT NOT NULL DEFAULT '["vector_editor", "bulk_personalization", "csv_import", "hi_res_export", "offline_grace_7d"]',
    granted_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_account_permissions_account ON account_permissions(account_id);

-- 4. License Entitlements (Cryptographically signed 7-day tokens issued to approved accounts)
CREATE TABLE IF NOT EXISTS license_entitlements (
    id TEXT PRIMARY KEY NOT NULL,
    account_id TEXT NOT NULL REFERENCES authorized_accounts(id) ON DELETE CASCADE,
    token_id TEXT UNIQUE NOT NULL,
    issued_at TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    allowed_tier TEXT NOT NULL DEFAULT 'pro_sportswear',
    offline_grace_days INTEGER NOT NULL DEFAULT 7,
    signature TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'valid' CHECK(status IN ('valid', 'refreshed', 'revoked'))
);

CREATE INDEX IF NOT EXISTS idx_license_entitlements_account ON license_entitlements(account_id);
CREATE INDEX IF NOT EXISTS idx_license_entitlements_token_id ON license_entitlements(token_id);

-- 5. Admin Audit Events (Tamper-evident trail of administrative decisions)
CREATE TABLE IF NOT EXISTS admin_audit_events (
    id TEXT PRIMARY KEY NOT NULL,
    timestamp TEXT NOT NULL,
    admin_email TEXT NOT NULL,
    action TEXT NOT NULL CHECK(action IN (
        'user_registered',
        'user_approved',
        'user_denied',
        'user_suspended',
        'user_reactivated',
        'user_revoked',
        'otp_issued',
        'otp_verified',
        'entitlement_issued',
        'entitlement_refreshed',
        'admin_login'
    )),
    target_email TEXT NOT NULL,
    details TEXT NOT NULL,
    ip_address TEXT
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_events_timestamp ON admin_audit_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_events_target ON admin_audit_events(target_email);
