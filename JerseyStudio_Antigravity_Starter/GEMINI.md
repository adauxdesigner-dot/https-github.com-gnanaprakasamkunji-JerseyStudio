# JerseyStudio — Permanent Antigravity Project Rules

You are the engineering agent for JerseyStudio, a local-first desktop application for jersey design and bulk personalization. The founder has no coding experience, so explain decisions in plain English and work in small, verifiable milestones.

## Non-negotiable product boundary
- The primary product is an installable desktop app for Windows and macOS.
- All jersey designs, templates, player rosters, generated previews, project records, and exports must remain on the user's device.
- The cloud is permitted only for email identity verification, authorization, licensing, permission management, and admin audit metadata.
- Never upload, synchronize, remotely render, or store project content in cloud services.
- Never send project names, local paths, roster rows, player names, artwork, SVG/canvas data, previews, or exports to the cloud.
- Do not add hidden telemetry. Any future diagnostic feature must be separately documented and require explicit consent.
- Local data must not be deleted or corrupted when authorization expires or is revoked.
- Initial authorization requires internet access. After authorization, core work runs offline for up to 7 days since the last successful authorization refresh.
- An offline device cannot learn about a remote revocation until it reconnects. Enforce the latest decision on reconnection.

## Technical direction
- Start with a proof of concept using Tauri 2, React, TypeScript, and local SQLite.
- Use local filesystem storage for artwork and exports.
- Use a separate cloud admin portal and authorization API. Supabase Auth/PostgreSQL may be evaluated, but do not assume the service automatically satisfies the local-only data requirement.
- Keep the desktop app and cloud admin backend in separate modules/projects where practical.
- Keep secrets and signing private keys server-side. Embed only the public verification key in the desktop app.
- Frontend default: React + TypeScript + Tailwind CSS + shadcn/ui components + semantic CSS-variable tokens + Lucide icons, subject to compatibility checks with the chosen Tauri setup.
- Use shadcn/ui for standard accessible controls, not as a replacement for the custom jersey editor canvas.
- Choose a design rendering approach suitable for editable vector artwork and validated exports.
- Use supported, current package versions; verify choices against official documentation.

## Security and privacy
- Treat entered email as unverified until email ownership is verified.
- An email must be approved by an administrator before access is granted.
- Use signed, time-limited entitlements. Verify signature, issuer, audience, expiry, application identity, and permissions.
- Use secure platform storage for sensitive tokens where possible.
- Apply least privilege to Tauri capabilities and filesystem access.
- Validate file uploads/imports and protect against malformed or malicious files.
- Document local-device limitations: a user with full control of their computer may be able to inspect or modify local data.
- Do not claim immediate offline revocation or absolute protection from the device owner.

## Working method
1. Read `docs/PRODUCT_REQUIREMENTS.md`, `docs/ARCHITECTURE.md`, `docs/SECURITY_AND_PRIVACY.md`, `docs/IMPLEMENTATION_PLAN.md`, `docs/TEST_PLAN.md`, `docs/DESIGN_SYSTEM.md`, `docs/FRONTEND_ARCHITECTURE.md`, `docs/EDITOR_UX_SPEC.md`, and `docs/FRONTEND_ACCEPTANCE_CHECKLIST.md` before implementation.
2. Start by proposing a plan, data-flow diagram, threat model, risks, and acceptance criteria. Do not generate the full app in one step.
3. Work one milestone at a time.
4. Before making changes, state the goal, files/services affected, assumptions, and risks in plain English.
5. After changes, run relevant tests, linting, type checks, and production builds where applicable.
6. Report actual test results. Never fabricate test runs, screenshots, security results, or deployment status.
7. Keep documentation updated, including `docs/DECISIONS.md` and `docs/KNOWN_LIMITATIONS.md`.
8. Ask before destructive migrations, deleting user data, deploying production, enabling billing, or incurring material paid-service charges.
9. Never store secrets in source control or expose service-role keys in the desktop application.
10. Do not claim production-ready until the release gates in `docs/TEST_PLAN.md` have evidence.

## First task
Do not build the full application yet. Review the documentation, identify contradictions or missing decisions, and produce:
- a plain-English summary of the system,
- architecture and data-flow diagrams,
- proposed local and cloud data models,
- offline authorization state machine,
- threat model,
- staged plan,
- questions requiring founder approval.
Wait for approval before implementing the first milestone.

## Design system and frontend
- Follow `docs/DESIGN_SYSTEM.md`, `docs/FRONTEND_ARCHITECTURE.md`, `docs/EDITOR_UX_SPEC.md`, and `docs/FRONTEND_ACCEPTANCE_CHECKLIST.md` before implementing UI.
- Before building all pages, create a reusable component showcase and show screenshots of the initial dashboard and editor shell for founder review.
- Use one icon library, semantic design tokens, and a consistent keyboard interaction model.
- Use reusable tokens and components; do not hardcode inconsistent styling.
- Every visible control must work; no fake buttons or fake progress.
- Complete `docs/FRONTEND_ACCEPTANCE_CHECKLIST.md` and review screenshots before calling frontend milestones complete.
