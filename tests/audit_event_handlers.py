import re
import sys

def audit_html_event_handlers():
    with open("preview.html", "r", encoding="utf-8") as f:
        html = f.read()

    js_match = re.search(r'<script>([\s\S]*?)</script>', html)
    assert js_match, "No <script> block found in preview.html"
    js_code = js_match.group(1)

    # Find all function declarations in JS: function foo(...)
    declared_functions = set(re.findall(r'function\s+([a-zA-Z0-9_$]+)\s*\(', js_code))
    # Also find assigned functions: const/let/var foo = function or arrow
    assigned_functions = set(re.findall(r'(?:const|let|var)\s+([a-zA-Z0-9_$]+)\s*=\s*(?:function|\([^)]*\)\s*=>)', js_code))
    all_js_functions = declared_functions.union(assigned_functions)

    print(f"Total JavaScript functions defined: {len(all_js_functions)}")

    # Extract all inline event handlers in HTML: onclick="...", onchange="...", oninput="...", etc.
    event_attrs = ['onclick', 'onchange', 'oninput', 'onmousedown', 'onfocus', 'onblur']
    handler_regex = re.compile(r'\b(' + '|'.join(event_attrs) + r')=["\']([^"\']+)["\']')

    matches = handler_regex.findall(html)
    print(f"Total HTML inline event handlers found: {len(matches)}")

    missing_handlers = []
    checked_calls = set()

    # Browser built-ins or simple inline JS statements
    builtins = {'event.stopPropagation()', 'this.click()', 'this.select()', 'console.log'}

    for event_name, code in matches:
        # Extract function calls like funcName(...)
        func_calls = re.findall(r'([a-zA-Z0-9_$]+)\s*\(', code)
        for func in func_calls:
            checked_calls.add(func)
            # Ignore built-in keywords
            if func in ('stopPropagation', 'preventDefault', 'click', 'focus', 'alert', 'confirm', 'parseInt', 'parseFloat'):
                continue
            if func not in all_js_functions:
                missing_handlers.append((event_name, func, code))

    print(f"Unique functions invoked from HTML event handlers: {len(checked_calls)}")

    if missing_handlers:
        print(f"❌ ERROR: Missing JavaScript functions for {len(missing_handlers)} inline event calls:")
        for ev, fn, full_code in missing_handlers:
            print(f"  - Event '{ev}': function '{fn}' not defined! Full code: '{full_code}'")
        return False
    else:
        print("✓ All HTML event handler function calls are strictly defined in JavaScript!")
        return True

if __name__ == "__main__":
    success = audit_html_event_handlers()
    if not success:
        sys.exit(1)
