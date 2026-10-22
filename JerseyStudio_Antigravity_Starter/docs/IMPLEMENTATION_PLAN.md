# Implementation Plan

Work in the sequence below. Do not skip a gate because the UI looks complete.

## Milestone 1 — Requirements and design
Deliver:
- Confirmed user journeys and acceptance criteria
- Architecture and data-flow diagrams
- Threat model and risk register
- Local/cloud data schemas
- Offline authorization state machine
- Decisions requiring founder approval

Gate: founder approves the plan before implementation.


## Frontend and design system gate
Before building detailed screens, implement `docs/DESIGN_SYSTEM.md` and `docs/FRONTEND_ARCHITECTURE.md`.
Create reusable tokens and shared UI components, then review screenshots for the dashboard and editor shell. Do not begin full editor feature work until the visual foundation and navigation are approved.

## Milestone 2 — Desktop proof of concept
Build:
- Minimal Tauri app for Windows/macOS development
- Local SQLite persistence
- Local sample artwork rendering
- Offline create/save/reopen workflow
- Network inspection proving project content is not sent

Gate: core proof of concept works offline.

## Milestone 3 — Cloud authorization and admin
Build:
- Admin login and account management
- Email verification and approval
- Signed entitlement issuance and verification
- Seven-day offline window
- Suspend/revoke/refresh behavior
- Minimal audit logging

Gate: authorization tests pass, including expired/tampered entitlements and revocation after reconnection.

## Milestone 4 — Local editor
Build:
- Projects and templates
- Canvas and text editing with canvas resizing (custom dimensions & presets)
- Dynamic name/number fields
- Front/back views
- Local save/load and backups
- Basic PNG/JPG/PDF export

Gate: single-design workflow works offline.

## Milestone 5 — Bulk personalization
Build:
- CSV and supported Excel import
- Column mapping and row validation
- Local batch rendering
- Preview and approval
- Export jobs and ZIP output
- Retry behavior

Gate: 100-record test batch passes and no roster data is transmitted.

## Milestone 6 — QA and security
Test:
- Windows and macOS packaging
- Offline behavior and seven-day expiry
- Unauthorized access and admin permissions
- Network data boundary
- Invalid uploads and path traversal
- Interrupted saves and export jobs
- Backup/restore and update recovery
- Dependency and security review

Gate: no unresolved critical findings; evidence recorded.

## Milestone 7 — Pilot and release
- Sign/package installers
- Set up production admin portal and monitoring
- Test staging deployment and rollback
- Pilot with a small set of users
- Resolve issues before general release

Gate: explicit founder approval and documented release report.

## Work rules
At each milestone, the agent must explain the plan, implement only the approved scope, run tests, report evidence, update docs, and list known limitations.
