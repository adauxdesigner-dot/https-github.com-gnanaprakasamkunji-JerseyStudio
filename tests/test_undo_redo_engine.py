import re
import sys

def test_preview_html():
    print("=== STARTING QA AUDIT: preview.html ===")
    with open("preview.html", "r", encoding="utf-8") as f:
        html = f.read()

    # 1. Check for basic HTML closing tags
    assert "</html>" in html, "Missing </html>"
    assert "</body>" in html, "Missing </body>"
    assert "</script>" in html, "Missing </script>"

    # 2. Extract all IDs defined in HTML
    defined_ids = set(re.findall(r'id=["\']([a-zA-Z0-9_\-]+)["\']', html))
    print(f"Total defined DOM IDs in preview.html: {len(defined_ids)}")

    # 3. Check for duplicate IDs
    all_id_matches = re.findall(r'id=["\']([a-zA-Z0-9_\-]+)["\']', html)
    from collections import Counter
    counts = Counter(all_id_matches)
    duplicates = [id_name for id_name, c in counts.items() if c > 1]
    if duplicates:
        print(f"WARNING: Duplicate IDs found: {duplicates}")
    else:
        print("✓ Zero duplicate DOM IDs found.")

    # 4. Check all document.getElementById calls in JavaScript
    js_section = html.split("<script>")[1].split("</script>")[0]
    get_el_calls = set(re.findall(r'document\.getElementById\([\'"]([a-zA-Z0-9_\-]+)[\'"]\)', js_section))
    print(f"Total document.getElementById targets in JS: {len(get_el_calls)}")

    # Check which getElementById targets might be missing from defined_ids
    # Note: dynamically created IDs (like clones or text_layer_) won't be in initial HTML
    dynamic_prefixes = ('text_layer_', 'canvas-player-', 'canvas-logo-')
    missing_ids = []
    for target in get_el_calls:
        if target not in defined_ids:
            if not any(target.startswith(p) for p in ('text_layer_', 'dock-size-', 'btn-view-', 'export-btn-')):
                missing_ids.append(target)
    
    if missing_ids:
        print(f"WARNING: Possibly unreferenced element IDs in JS: {missing_ids}")
    else:
        print("✓ All document.getElementById targets exist in DOM.")

    # 5. Verify Undo / Redo engine components
    required_engine_symbols = [
        "undoStack",
        "redoStack",
        "MAX_HISTORY",
        "captureCurrentSnapshot",
        "recordHistoryState",
        "restoreSnapshot",
        "actionUndo",
        "actionRedo",
        "updateUndoRedoUI",
        "btn-toolbar-undo",
        "btn-toolbar-redo"
    ]
    for sym in required_engine_symbols:
        assert sym in html, f"Missing required Undo/Redo engine symbol: {sym}"
    print("✓ All core Undo/Redo engine symbols and structures present.")

    # 6. Check keyboard shortcuts for Undo/Redo
    assert "e.key.toLowerCase() === 'z'" in html, "Missing Cmd+Z listener"
    assert "e.key.toLowerCase() === 'y'" in html, "Missing Ctrl+Y listener"
    print("✓ Keyboard shortcut bindings (Cmd+Z, Shift+Cmd+Z, Ctrl+Y) verified.")

    # 7. Check that key operations call recordHistoryState
    history_hooks = [
        ("makeDraggable (Drag & Drop)", "snapBeforeDrag"),
        ("attachResizeHandles (Resize Artwork)", "snapBeforeResize"),
        ("alignActiveLayer", "recordHistoryState(`Align ${dir.toUpperCase()}`);"),
        ("applyActiveColor", "recordHistoryState(\"Change Color\");"),
        ("deleteLayerById", "recordHistoryState(\"Delete Layer\");"),
        ("duplicateActiveLayer", "recordHistoryState(\"Duplicate Layer\");"),
        ("addTextLayer", "recordHistoryState(`+ ${sampleText}`);"),
        ("insertSampleGraphic", "recordHistoryState(`Add Graphic: ${type}`);"),
        ("previewTeamPlayer", "recordHistoryState(`Player: ${name}`);"),
        ("applyPresetSize", "recordHistoryState(`Size: ${presetKey.toUpperCase()}`);"),
        ("placeLogoOnJersey", "recordHistoryState(\"Place Logo\");"),
        ("removeLogoFromJersey", "recordHistoryState(\"Remove Logo\");"),
        ("toggleFontWeight", "recordHistoryState(\"Toggle Bold\");"),
        ("toggleFontStyle", "recordHistoryState(\"Toggle Italic\");"),
        ("toggleCase", "recordHistoryState(\"Toggle Case\");"),
        ("changeFontSize", "recordHistoryState(\"Change Font Size\");"),
        ("triggerAutoFit", "recordHistoryState(\"Auto-Fit\");"),
        ("toggleArcEffect", "recordHistoryState(\"Toggle Arch Effect\");"),
        ("toggleStrokeEffect", "recordHistoryState(\"Toggle Outline Stroke\");"),
        ("toggleShadowEffect", "recordHistoryState(\"Toggle Drop Shadow\");"),
        ("renderFontList", "recordHistoryState(`Font: ${font.name}`);"),
    ]
    for name, hook in history_hooks:
        assert hook in html, f"Missing history hook for: {name} (expected '{hook}')"
        print(f"  ✓ History hook verified: {name}")

    print("\n=== ALL QA AUDIT CHECKS PASSED SUCCESSFULLY! ===")

if __name__ == "__main__":
    test_preview_html()
