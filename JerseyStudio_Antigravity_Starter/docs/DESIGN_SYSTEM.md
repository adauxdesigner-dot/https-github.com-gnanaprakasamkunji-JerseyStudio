# JerseyStudio Design System

## 1. Product design direction
Create a premium, professional B2B desktop application for jersey designers and sportswear production teams. The UI should feel precise, calm, fast, and trustworthy. Prioritize the design canvas and production workflow over decorative marketing elements.

Use original branding. Do not copy Teedex branding, proprietary assets, or exact protected UI artwork.

## 2. Visual principles
- Clear hierarchy and strong readability.
- Neutral surfaces with one restrained primary accent.
- Compact but comfortable desktop workspace.
- Consistent spacing, alignment, and typography.
- Minimal decoration; no unnecessary gradients, glass effects, or excessive shadows.
- Use color meaningfully for status, warnings, and errors.
- Keep canvas controls distinct from the artwork being edited.
- Design for long working sessions and dense production data.

## 3. Theme and design tokens
Create centralized tokens in CSS variables or the chosen styling system. Do not hardcode arbitrary colors or spacing in individual components.

Initial light theme:
- App background: `#F5F6F8`
- Surface: `#FFFFFF`
- Subtle surface: `#F0F2F5`
- Primary text: `#171A21`
- Secondary text: `#5D6675`
- Border: `#DCE1E8`
- Primary action: `#3157D5`
- Primary hover: `#2547B8`
- Success: `#16845B`
- Warning: `#A86612`
- Error: `#C23838`
- Focus ring: `#7AA2FF`

Treat these as initial proposals. Validate contrast and refine before release. Add dark mode only after light mode is consistent and tested.

Spacing scale: 4, 8, 12, 16, 20, 24, 32, 40, 48 px.
Corner radii: 6 px for compact controls, 10 px for cards/panels, 14 px for major surfaces.
Borders: use subtle 1 px borders; avoid heavy outlines on every element.
Shadows: use sparingly for popovers, menus, and floating panels only.

## 4. Typography
- Use a readable system font stack or a properly licensed bundled font.
- Establish tokens for display/title, section heading, body, label, caption, and numeric/table text.
- Suggested base body size: 14–16 px.
- Ensure long player names, numbers, file names, and table values remain legible.
- Use tabular numerals for IDs, jersey numbers, quantities, and status tables where appropriate.
- Do not use typography alone to communicate errors or status.

## 5. Component library
Build reusable, documented components for:
- Buttons: primary, secondary, tertiary/ghost, destructive, icon-only.
- Text fields, numeric fields, dropdowns, checkboxes, radio groups, switches.
- Tooltips, popovers, dialogs, confirmation dialogs.
- Tabs, segmented controls, breadcrumbs.
- Cards, panels, badges, status indicators.
- Data tables, pagination, sortable columns, row selection.
- Toasts, inline alerts, progress bars, skeletons.
- Empty states, error states, retry states.
- File upload/drop zone with clear file restrictions.
- Accessible menus and keyboard navigation.

Each interactive component must define default, hover, focus, pressed, disabled, loading, success, and error states where relevant. Use consistent icon sizing and a single icon library.

## 6. Accessibility
- Keyboard-accessible controls and logical focus order.
- Visible focus indicators.
- Accessible names for icon-only controls.
- Do not communicate status through color alone.
- Sufficient text/background contrast.
- Respect reduced-motion settings.
- Dialogs must manage focus correctly and close predictably.
- Provide accessible alternatives for canvas actions where feasible.

## 7. Responsive behavior
The primary target is desktop, but layouts should adapt to smaller windows:
- At wide sizes, show navigation, canvas, and properties panel together.
- At medium sizes, allow collapsible side panels.
- At narrow sizes, prioritize the canvas and move secondary controls into panels or menus.
- Do not allow important actions to disappear below inaccessible scroll areas.

## 8. Design QA
- Use design tokens for all shared visual values.
- Avoid duplicated components and inconsistent one-off styling.
- Capture screenshots for each key page and state.
- Check visual consistency at supported window sizes and on both operating systems.
- Test empty, loading, validation, error, and success states.
- Record known visual defects and fix them before release.
## 9. Recommended implementation system
Use this default stack unless the architecture proof of concept shows a concrete incompatibility:
- **Tailwind CSS** for layout and utility styling.
- **shadcn/ui** as the source for accessible, customizable React UI components.
- **CSS variables / semantic design tokens** as the single source of truth for colors, surfaces, typography, borders, radii, and focus states.
- **Lucide icons** through the supported React icon package.
- A small set of project-owned components for product-specific behavior.

Use current official shadcn/ui installation guidance that matches the chosen React, Tailwind, and bundler versions. Do not copy configuration examples from a different major version blindly. Official references:
- https://ui.shadcn.com/docs
- https://ui.shadcn.com/docs/theming
- https://ui.shadcn.com/docs/installation

Use the library for common controls, not for the jersey canvas itself. The editor canvas, layers, selection handles, guides, and design-specific controls must be purpose-built and tested.

## 10. Design-system implementation deliverables
Before building all screens, create:
- A token file / CSS variables for light theme.
- A documented semantic color map.
- Typography and spacing tokens.
- Component variants and states.
- A reusable button, input, select, checkbox, dialog, tooltip, tabs, table, badge, toast, progress, and empty-state component set.
- A small component showcase page or development route demonstrating every component state.
- A page layout grid and desktop window-size rules.
- A visual QA checklist with screenshots.

Do not introduce a second component library without documenting why. Do not mix multiple icon libraries.

## 11. Proposed product look
- Light theme first, with neutral gray surfaces, near-black text, subtle borders, and one restrained blue primary action color.
- Use semantic success, warning, and error tokens rather than arbitrary colors.
- Keep shadows subtle and reserve them for floating surfaces.
- Prefer 8 px-based spacing rhythm, with 4 px for fine adjustments.
- Use compact density for tables and the editor, but keep controls comfortably clickable.
- Use one consistent typography family; verify font licensing before bundling custom fonts.
- Do not build dark mode until light theme and component states pass QA. If dark mode is later added, use semantic tokens rather than per-component color overrides.

## 12. Design references and originality
Use familiar productivity and design-tool interaction patterns as inspiration only. Do not reproduce another product's exact screen, brand, illustrations, or proprietary assets. Build an original JerseyStudio visual identity.
