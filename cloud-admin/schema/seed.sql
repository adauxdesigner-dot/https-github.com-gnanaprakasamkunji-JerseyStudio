-- Seed data for JerseyStudio Cloud Admin
-- Includes the founder super_admin and initial representative users in each authorization state

INSERT OR IGNORE INTO admin_users (id, email, password_hash, role, is_active, created_at, updated_at)
VALUES (
    'admin-001',
    'founder@jerseystudio.internal',
    'scrypt:32768:8:1$founder_secure_hash',
    'founder',
    1,
    '2026-10-01T00:00:00Z',
    '2026-10-01T00:00:00Z'
);

-- Approved active account
INSERT OR IGNORE INTO authorized_accounts (id, email, status, email_verified_at, approved_at, approved_by, created_at, updated_at)
VALUES (
    'acc-001',
    'active.coach@falconathletics.com',
    'approved',
    '2026-10-15T10:00:00Z',
    '2026-10-15T10:30:00Z',
    'founder@jerseystudio.internal',
    '2026-10-15T09:45:00Z',
    '2026-10-15T10:30:00Z'
);

INSERT OR IGNORE INTO account_permissions (id, account_id, tier, max_export_resolution, features_json, granted_at, updated_at)
VALUES (
    'perm-001',
    'acc-001',
    'pro_sportswear',
    600,
    '["vector_editor", "bulk_personalization", "csv_import", "hi_res_export", "offline_grace_7d"]',
    '2026-10-15T10:30:00Z',
    '2026-10-15T10:30:00Z'
);

-- Pending account awaiting founder 1-click approval
INSERT OR IGNORE INTO authorized_accounts (id, email, status, email_verified_at, created_at, updated_at)
VALUES (
    'acc-002',
    'new.designer@unitedsport.org',
    'pending',
    '2026-10-22T08:15:00Z',
    '2026-10-22T08:10:00Z',
    '2026-10-22T08:15:00Z'
);

INSERT OR IGNORE INTO account_permissions (id, account_id, tier, max_export_resolution, features_json, granted_at, updated_at)
VALUES (
    'perm-002',
    'acc-002',
    'pro_sportswear',
    600,
    '["vector_editor", "bulk_personalization", "csv_import", "hi_res_export", "offline_grace_7d"]',
    '2026-10-22T08:15:00Z',
    '2026-10-22T08:15:00Z'
);

-- Suspended account
INSERT OR IGNORE INTO authorized_accounts (id, email, status, email_verified_at, approved_at, approved_by, suspended_at, status_reason, created_at, updated_at)
VALUES (
    'acc-003',
    'pastdue.manager@vipersrugby.com',
    'suspended',
    '2026-09-01T12:00:00Z',
    '2026-09-01T14:00:00Z',
    'founder@jerseystudio.internal',
    '2026-10-20T11:00:00Z',
    'Subscription invoice overdue',
    '2026-09-01T11:50:00Z',
    '2026-10-20T11:00:00Z'
);

INSERT OR IGNORE INTO account_permissions (id, account_id, tier, max_export_resolution, features_json, granted_at, updated_at)
VALUES (
    'perm-003',
    'acc-003',
    'pro_sportswear',
    600,
    '["vector_editor", "bulk_personalization", "csv_import", "hi_res_export", "offline_grace_7d"]',
    '2026-09-01T14:00:00Z',
    '2026-09-01T14:00:00Z'
);

-- Revoked account (permanently terminated access)
INSERT OR IGNORE INTO authorized_accounts (id, email, status, email_verified_at, approved_at, approved_by, revoked_at, status_reason, created_at, updated_at)
VALUES (
    'acc-004',
    'terminated.user@unauthorized-reseller.io',
    'revoked',
    '2026-08-10T10:00:00Z',
    '2026-08-10T11:00:00Z',
    'founder@jerseystudio.internal',
    '2026-10-18T16:00:00Z',
    'Terms of service violation',
    '2026-08-10T09:30:00Z',
    '2026-10-18T16:00:00Z'
);

-- Audit log entries
INSERT OR IGNORE INTO admin_audit_events (id, timestamp, admin_email, action, target_email, details, ip_address)
VALUES
    ('audit-001', '2026-10-15T10:30:00Z', 'founder@jerseystudio.internal', 'user_approved', 'active.coach@falconathletics.com', 'Approved pro_sportswear tier license', '127.0.0.1'),
    ('audit-002', '2026-10-20T11:00:00Z', 'founder@jerseystudio.internal', 'user_suspended', 'pastdue.manager@vipersrugby.com', 'Suspended: Subscription invoice overdue', '127.0.0.1'),
    ('audit-003', '2026-10-18T16:00:00Z', 'founder@jerseystudio.internal', 'user_revoked', 'terminated.user@unauthorized-reseller.io', 'Revoked: Terms of service violation', '127.0.0.1');
