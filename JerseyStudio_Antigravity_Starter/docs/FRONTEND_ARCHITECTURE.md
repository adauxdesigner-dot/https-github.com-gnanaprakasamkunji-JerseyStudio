# Frontend Architecture and UX Specification

## 1. Goals
Build a real, maintainable desktop UI using Tauri + React + TypeScript. The UI must be connected to working local application logic and must not be a static mockup.

## 2. App shell
Implement a consistent desktop shell with:
- Left navigation for Dashboard, Projects, Templates, and Settings.
- Main content area.
- Contextual project actions.
- Clear save status and local/offline status.
- Account/license status without exposing tokens or sensitive entitlement details.
- Toasts and dialogs for meaningful feedback.

Do not show cloud-sync language because cloud synchronization is prohibited.

## 3. Required screens
1. Welcome / email entry.
2. Email verification and authorization pending/denied states.
3. Dashboard and recent projects.
4. Project list.
5. New project flow.
6. Jersey design editor.
7. Template library.
8. Roster import and column mapping.
9. Import validation and correction table.
10. Bulk generation progress.
11. Variation review and approval.
12. Export configuration and export progress.
13. Local backup and restore.
14. Settings, license status, privacy information, and support.
15. Clear offline-expired and reconnection-required states.

The cloud admin portal is a separate web application and should have its own routes, layout, authentication, authorization, and deployment.

## 4. Editor layout
For wide desktop windows, use:
- Left tool rail or left panel: select, text, shapes/assets, layers.
- Center workspace: jersey canvas with zoom, pan, guides, and view selector.
- Right properties panel: selected element's editable properties.
- Top bar: project name, save state, undo/redo, preview, and export.
- Optional bottom status area: zoom level, dimensions, selected object, and validation warnings.

The canvas should remain the visual focus. Panels must not overlap the artwork by default.

Support front/back view selection in the data model. Do not pretend to implement 3D rendering unless it is actually built and tested.

## 5. Frontend code organization
Use a clear modular structure, adapting to the actual framework scaffold:
- `src/app/` or equivalent: routes and page composition.
- `src/components/ui/`: shared controls.
- `src/components/layout/`: app shell and navigation.
- `src/features/projects/`: project workflows.
- `src/features/editor/`: canvas, tools, properties, layers.
- `src/features/roster/`: import, mapping, validation.
- `src/features/generation/`: batch progress and variations.
- `src/features/export/`: export options and status.
- `src/features/auth/`: desktop authorization UI.
- `src/lib/`: pure utilities and shared validation.
- `src/types/`: shared types.
- `src-tauri/`: Rust commands and desktop capabilities, where applicable.

Keep business logic out of large UI components. Use typed service interfaces for local database, file storage, rendering, and authorization.

## 6. State management
- Use local component state for temporary UI state.
- Use a documented app-level state solution only when cross-page state requires it.
- Treat SQLite/local files as the source of truth for saved projects.
- Clearly separate unsaved editor state from persisted state.
- Show save progress, saved, and save-failed states.
- Prevent silent data loss when navigating away with unsaved changes.
- Avoid storing project content in cloud-backed state services.

## 7. User interaction rules
- Every visible control must have a real action or be clearly disabled with an explanation.
- Destructive actions require confirmation and appropriate recovery behavior.
- Form validation should explain what is wrong and how to fix it.
- Long-running generation/export work must show progress and allow safe cancellation where supported.
- Errors must be actionable and must not expose stack traces or secrets to end users.
- Support undo/redo for editor operations where feasible.
- Preserve keyboard focus and selection after common editing actions.

## 8. Local-first UX
- Display an honest local/offline status.
- Do not show cloud sync indicators.
- Explain that projects and exports are stored on this device.
- Authentication may require the internet; core editing works offline after valid authorization and within the seven-day policy.
- When authorization expires, clearly explain that licensed operations require reconnection. Never remove or hide local projects.

## 9. Frontend quality gates
- TypeScript type checks pass.
- Linting passes.
- Unit and component tests cover important logic.
- End-to-end tests cover project creation, editor save/load, roster import, bulk generation, and export.
- Screenshots are reviewed at representative desktop window sizes.
- No dead buttons, placeholder links, or fake progress.
- No project data sent to cloud APIs.
## 10. Recommended UI implementation
Use React + TypeScript with Tailwind CSS and shadcn/ui components, backed by semantic CSS-variable tokens defined in `docs/DESIGN_SYSTEM.md`. Use Lucide icons consistently. Confirm package compatibility with the actual Tauri/Vite setup before installing dependencies.

Use a router appropriate for the desktop app. Keep the cloud admin portal as a separate deployable application or clearly isolated package, with its own authentication and server-side authorization.

## 11. Screen-level layout acceptance
### Dashboard
- Primary action: create a new design.
- Recent projects with last-edited information stored locally.
- Template shortcuts and clear first-run empty state.
- Local storage/privacy explanation and honest authorization status.
### Projects
- Search/filter/sort locally.
- Clear create, open, duplicate, archive/delete actions.
- Confirm destructive actions.
### Editor
- Top bar: project name, saved/unsaved/error state, undo/redo, preview, export.
- Left tools/layers panel.
- Center canvas and zoom/view controls.
- Right properties panel.
- Footer/status area for dimensions, selection, and validation.
### Roster import
- File selection, file type/size guidance, row preview, column mapping, validation summary, row-level errors, retry/correction flow.
### Batch generation
- Actual progress derived from work completed, cancel if safe, resumable/retryable failures, no fake progress.
### Variation review
- Grid/list preview, clear approval status, inspect individual record, show data/layout warnings.
### Export
- Format/dimension settings, local destination, progress, per-file errors, completion summary.
### Settings
- Local data location, local backup/restore, privacy statement, app version, license status, support, authorization refresh action.

## 12. Keyboard and interaction model
Define and document keyboard shortcuts before implementation, including common actions such as save, undo, redo, delete selected element, duplicate, zoom, and fit-to-canvas. Avoid conflicting with operating-system shortcuts. Every shortcut must be visible in menus/tooltips and testable.

Use confirmation for destructive actions. Do not use color alone for status. Preserve focus after dialogs and common editor actions. Provide a route or interaction to perform essential canvas operations without a mouse where feasible.

## 13. Frontend visual review
For each milestone, provide screenshots of:
- Dashboard
- Empty and populated project list
- Editor with no selection and with a selected text element
- Roster import success and validation error
- Batch generation progress and failure
- Export success and failure
- Authorization denied and offline-expired states

Review screenshots at wide, medium, and narrow desktop window sizes. Screenshots are review evidence, not a substitute for functional tests.
