# Security and Privacy Requirements

## Non-negotiable promise
User-generated jersey data remains on the user's device. Cloud services manage identity, authorization, permissions, and licensing only.

## Identity and authorization
- Email text alone is not proof of identity.
- Verify email ownership before checking administrator approval.
- Deny unapproved, suspended, expired, or invalid accounts.
- Use server-signed entitlements with a secure signature algorithm and key management.
- The signing private key remains server-side.
- The desktop embeds only a public verification key.
- Validate signature, issuer, audience, application identity, expiry, and permissions.
- Use secure platform storage for refresh tokens or other sensitive secrets.
- Protect admin routes and APIs server-side with role checks.
- Log administrative changes without logging project content or secrets.

## Seven-day offline window
- Initial authorization requires internet.
- After a successful authorization refresh, core local functionality can operate offline for up to seven days.
- After expiry, restrict licensed functionality until revalidation.
- Never delete or corrupt local data because authorization expires.
- A remote revocation cannot be enforced while the device remains disconnected. Enforce it after reconnection.
- Test clock rollback and document residual risk. Do not claim local clock checks are tamper-proof.

## Local data security
- Store project data and artwork in an application-specific local directory.
- Restrict file permissions and use secure database/file handling.
- Evaluate encryption at rest based on threat model and platform capabilities.
- Validate imports and reject malformed or oversized files.
- Prevent path traversal and unsafe file operations.
- Provide local backup and restore.
- Explain that an owner or attacker with full operating-system control may bypass local protections.

## Network boundary
- Use HTTPS for cloud authorization.
- Document all network endpoints and request fields.
- Do not upload project names, local paths, player records, artwork, SVG/canvas data, previews, exports, or file contents.
- Do not enable cloud backups, sync, remote rendering, or hidden telemetry.
- Any future optional diagnostics require explicit consent and must exclude user content.

## Supply chain and release
- Keep secrets out of source control.
- Review dependencies and updates.
- Sign installers where platform requirements permit.
- Test update and rollback paths.
- Maintain security issue reporting and a response process.
- Do not claim compliance or production readiness without evidence.
