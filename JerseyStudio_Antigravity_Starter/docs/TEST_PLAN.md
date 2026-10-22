# Test Plan and Release Gates

## Functional tests
- Create, save, close, and reopen a project.
- Edit text and positions; verify saved state after restart.
- Import valid CSV/Excel data.
- Reject malformed files and show useful errors.
- Validate missing fields, long names, duplicates, and invalid values.
- Generate a 100-record batch.
- Verify each output's player data, dimensions, and content.
- Retry failed jobs without duplicating successful results.
- Backup and restore projects and assets.

## Authorization tests
- Unverified email is denied.
- Verified but unapproved account is denied.
- Approved account can obtain an entitlement.
- Invalid signature, wrong audience, wrong application, or expired entitlement is rejected.
- Suspended/revoked account is blocked after successful revalidation.
- Offline use works before the seven-day limit.
- After seven days without refresh, licensed features are restricted and local data remains intact.
- Clock rollback and device-binding behavior are tested and documented.

## Privacy/network tests
- Inspect network traffic during login, editing, saving, importing, rendering, exporting, error reporting, and updating.
- Confirm no project names, roster data, artwork, previews, local paths, or exports are transmitted.
- Confirm only documented authentication/authorization metadata is sent.
- Verify no hidden sync, remote rendering, or telemetry.
- Repeat core workflow with internet disconnected after authorization.

## Security tests
- Admin APIs enforce roles server-side.
- User cannot access admin functions.
- Desktop cannot use a cloud service-role key.
- File upload validation rejects malicious/malformed inputs.
- File operations cannot escape allowed directories.
- Secrets and tokens are not written to logs.
- Dependencies and packaging are reviewed.
- Local protections and limitations are documented.

## Release gate
Do not call the app production-ready until:
- Tests have actually run and results are recorded.
- Critical security findings are resolved.
- Windows and macOS install/update paths are tested.
- Backup/restore and rollback are documented.
- Network boundary is verified.
- Monitoring, support, and incident response are defined.
- Founder approves the release.

A checklist tick is not evidence by itself. Store actual logs, test output, and review results.
