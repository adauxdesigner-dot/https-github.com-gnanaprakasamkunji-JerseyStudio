# Jersey Design Editor — UX Specification

## Primary task
Allow a user to create or open a master jersey design, configure editable fields, preview personalized versions, and export files locally.

## Canvas
- Show the active garment view and document dimensions.
- Support canvas resizing (custom width/height in inches, cm, mm, and px, DPI selection, and aspect ratio lock).
- Provide dimension presets for common jersey sizes (Youth, S, M, L, XL, XXL) and print beds.
- Support zoom, fit-to-canvas, and pan.
- Display selection outlines and resize handles.
- Support move, select, add text, delete, and alignment actions.
- Provide visible snapping/guides where implemented.
- Keep the canvas background distinct from transparent artwork.
- Make it clear when an element is selected.

## Layers and elements
- Show a list of design elements/layers.
- Allow selecting, renaming where useful, reordering, hiding, and locking where supported.
- Clearly distinguish static artwork from dynamic personalization fields.
- Keep element positions and properties in structured project data.
- Ensure undo/redo and save/load preserve the document accurately.

## Properties panel
For text elements, expose supported properties such as:
- Text or field binding
- Font family from available/licensed fonts
- Font size
- Fill color
- Stroke and stroke width if supported
- Alignment
- Position and dimensions
- Letter spacing if supported
- Overflow warning and fit behavior

Do not display controls for unsupported features.

## Personalization fields
- A master template can define fields such as player name and player number.
- Provide clear field names and examples.
- Keep the master template unchanged when generating variations.
- Flag missing data and text overflow before approval.
- Let the user inspect generated variations before export.

## Roster workflow
- Show selected file name and accepted formats.
- Preview rows before importing.
- Map columns explicitly.
- Show row-level errors and correction guidance.
- Never silently discard invalid rows.
- Make duplicate-number handling configurable because some teams may allow duplicates.

## Export workflow
- Let users choose supported format (PNG, JPG, PDF, ZIP) and dimensions.
- For JPG exports, support configurable background fill color and quality compression.
- Show estimated output count and local destination.
- Display progress and failures.
- Verify output files after generation.
- Do not label an export print-ready unless required production parameters have been configured and tested.
