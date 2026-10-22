# Product and Technical Decisions

Record each decision with date, status, rationale, and consequences.

## Current decisions
- Product: original Teedex-inspired jersey design and bulk-personalization application.
- Primary app: installable desktop application.
- Initial platforms: Windows and macOS.
- Data boundary: all jersey/project data stays local.
- Cloud purpose: identity verification, authorization, permissions, licensing, and minimal admin audit metadata only.
- Initial login: email ownership verification plus administrator approval.
- Offline policy: up to seven days from the last successful authorization refresh.
- Expiry behavior: restrict licensed functionality; never delete local data.
- Revocation: enforced after reconnect; immediate offline revocation is not possible.
- Initial technical direction: evaluate Tauri 2, React, TypeScript, and SQLite.
- Proposed design system: Tailwind CSS + shadcn/ui + semantic CSS-variable tokens + Lucide icons; validate package compatibility in the proof of concept before final approval.
- Supported export formats: PNG, JPG, PDF, and ZIP batch export (with configurable background color for JPG and transparency for PNG/PDF).
- Canvas dimension & resizing: Canvas supports flexible resizing (custom width, height, DPI, and garment size/print-bed presets).
- Engineering team structure: 6 specialized subagents coordinated by lead agent (Frontend, Desktop/SQLite, Canvas Engine, Roster Pipeline, Cloud Auth/Licensing, QA & Security).
- Milestone 3 Asymmetric Licensing: 2048-bit RSA-SHA256 asymmetric engine. Server private key stays strictly isolated in `cloud-admin/keys/`. Desktop client embeds exclusively the public verification key.
- Offline Grace Window: 7 calendar days from issuance. Day 0 to Day 7 is 100% active offline. Day 8+ requires online check-in. Local projects, rosters, and files are never destroyed or corrupted.
- Strict Cloud Privacy Boundary: Cloud database schema contains zero project, template, roster, or artwork tables. Cloud API middleware rejects any request containing forbidden artwork or project parameters.

## Decision template
### Decision: [title]
- Date:
- Status: Proposed / Approved / Rejected
- Context:
- Options considered:
- Decision:
- Consequences:
- Follow-up:
