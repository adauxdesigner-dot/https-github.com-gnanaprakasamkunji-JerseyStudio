# Product Requirements — JerseyStudio

## 1. Vision
Create an original, local-first desktop product inspired by common jersey-design workflows. Help sportswear manufacturers, jersey designers, sublimation printers, and teams create jersey artwork, personalize player names/numbers in bulk, review variations, and export artwork for production.

Use public product behavior only as market reference. Do not copy proprietary source code, protected assets, or branding.

## 2. Users
- Jersey manufacturers and production operators
- Sportswear and apparel designers
- Sublimation printing businesses
- Sports teams and kit managers

## 3. Core local workflows
1. Install desktop app.
2. Enter email and verify identity online.
3. Cloud authorization service checks admin approval.
4. Authorized user receives a signed entitlement.
5. Create/open a local project.
6. Create or import a jersey template.
7. Add and edit text and personalization fields.
8. Import CSV or supported Excel roster.
9. Map columns and validate rows.
10. Generate personalized previews locally.
11. Inspect, edit, and approve variations.
12. Export supported PNG, JPG, PDF files and optional ZIP batch locally.
13. Save and reopen the project offline.

## 4. Functional scope
### Authentication and access
- Email verification and administrator approval are separate requirements.
- Admin can approve, deny, suspend, reactivate, and revoke users.
- Entitlements specify expiry and allowed features.
- Seven-day maximum offline window after successful refresh.
- Expired authorization restricts licensed features but never deletes local content.

### Projects and templates
- Create, rename, duplicate, open, archive, and delete projects with confirmation.
- Save templates as structured editable design data.
- Support jersey front/back views; more garment views may be added later.
- Provide local backup and restore.

### Editor
- Add, edit, move, resize, and delete text elements.
- Configure font, size, color, alignment, stroke, and position.
- Define dynamic player name/number fields.
- Support undo/redo where feasible.
- Flag text overflow and invalid placements.
- Persist edits locally.

### Roster and bulk generation
- Import CSV and a defined set of Excel formats.
- Preview rows and map columns.
- Validate missing/invalid values and configurable duplicate-number rules.
- Generate each variation locally.
- Show progress and per-record errors.
- Retry failed records without duplicating successful outputs.

### Export
- Export actual PNG, JPG, PDF files and ZIP batches if supported.
- Canvas resizing: support custom dimensions (inches, cm, px), aspect ratio locking, and standard garment/bed presets.
- Verify output content, dimensions, and resolution.
- Support transparent backgrounds when required.
- Clearly document that production readiness depends on defined print specifications, color profile, bleed, and machine requirements.

### Cloud admin portal
- Admin authentication and role-based access.
- Add and approve email addresses.
- Assign application permissions and license validity.
- Suspend, reactivate, and revoke access.
- View minimal account/license status and admin audit events.
- Never view or retrieve local user project data.

## 5. Non-functional requirements
- Windows and macOS support.
- Core design and export workflow works offline after authorization.
- No project-content transfer to cloud.
- Safe local persistence and backup/restore.
- Accessible, clear interface and understandable error messages.
- Automated tests and reproducible builds.
- Clear privacy notice and documented limitations.

## 6. MVP exclusions
- Cloud project storage or synchronization
- Cloud rendering or cloud AI APIs for core functionality
- Payment/subscription billing until core workflow is validated
- Automatic factory/ERP integrations
- Claims of support for untested print-machine formats
- Hidden analytics or telemetry
