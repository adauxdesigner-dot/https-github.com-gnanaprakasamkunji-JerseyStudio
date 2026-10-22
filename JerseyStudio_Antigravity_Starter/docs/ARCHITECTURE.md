# Architecture — JerseyStudio

## 1. System components
### Local desktop application
- Tauri desktop shell with narrowly scoped capabilities
- React + TypeScript UI
- Local application/business logic
- SQLite database for structured project data
- Local filesystem for imported artwork, assets, previews, exports, and backups
- Local entitlement verification module
- Local rendering/export pipeline

### Cloud services
- Identity provider for email ownership verification
- Authorization API to check admin approval and issue/refresh entitlements
- Admin portal and backend for account permissions, license status, and admin audit metadata
- Cloud database contains only identity/access/licensing metadata, not projects or artwork

## 2. Data boundary
Allowed cloud data, only when necessary:
- Verified account identifier/email
- Authentication challenge/session token
- License or entitlement identifier
- App version and platform, if justified
- Entitlement refresh request and result
- Minimal security/admin audit events without project content

Forbidden cloud data:
- Jersey designs, templates, SVG/canvas data
- Player names, roster contents, sizes, or numbers
- Project names, local file paths, thumbnails, previews
- Generated artwork and exports
- Document/file contents or hidden diagnostics containing them

## 3. Authorization sequence
1. User enters email.
2. Identity provider verifies email ownership.
3. Authorization API checks administrator approval and account status.
4. Server issues a signed entitlement with subject, app audience, permitted features, issue time, expiry, and optional device/license binding.
5. Desktop verifies the signature with an embedded public key and validates all claims.
6. App enables permitted features and records the last successful authorization time securely.
7. During offline operation, local features remain available until the seven-day authorization window expires.
8. On reconnection, app refreshes authorization and enforces updated permissions.

Do not implement entitlement signing with a private key embedded in the desktop client.

## 4. Offline policy
- Maximum offline window: 7 days from the last successful server authorization refresh.
- First authorization requires internet.
- After expiry, restrict licensed operations until revalidation.
- Preserve local data and provide clear recovery instructions.
- An offline client cannot receive immediate revocation. Enforce revocation after successful reconnection.
- Clock rollback and local tampering are risks; document mitigation and residual limitations.

## 5. Suggested data models
Local SQLite:
- projects
- templates
- design_elements
- personalization_fields
- roster_imports
- roster_records
- generated_variations
- approval_records
- export_jobs
- local_settings
- local_migration_metadata

Cloud database:
- admin_users
- authorized_accounts
- account_permissions
- licenses_or_entitlements
- authorization_events
- admin_audit_events

Do not put project tables or artwork metadata in the cloud database.

## 6. Engineering constraints
- Keep cloud authorization code isolated from local project data code.
- Make all local writes transactional where appropriate.
- Store assets under an app-owned local data directory with safe paths.
- Use least-privilege Tauri capabilities.
- Use migrations for local and cloud schemas.
- Never log tokens, roster data, artwork, or private file paths.
- Document any network request and its exact fields.
- Verify current framework documentation before choosing APIs or packages.
