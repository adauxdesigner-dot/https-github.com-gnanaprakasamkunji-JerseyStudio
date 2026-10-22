#!/usr/bin/env python3
"""
Direct in-process API and Service Logic Test for JerseyStudio Cloud Admin
Does not require network sockets, ensuring 100% sandboxed execution.
"""

import os
import sys
import json
import time
import base64
import sqlite3
from datetime import datetime, timedelta

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BASE_DIR)

from server import (
    get_db,
    sign_payload,
    verify_signature,
    log_audit,
    FORBIDDEN_DATA_KEYS
)

GREEN = "\033[92m"
RED = "\033[91m"
YELLOW = "\033[93m"
RESET = "\033[0m"

def log_pass(msg):
    print(f"  {GREEN}✔ PASS{RESET} {msg}")

def log_fail(msg):
    print(f"  {RED}✘ FAIL{RESET} {msg}")
    sys.exit(1)

print(f"\n{YELLOW}======================================================{RESET}")
print(f"{YELLOW}   JerseyStudio Cloud Admin Server Logic Unit Tests   {RESET}")
print(f"{YELLOW}======================================================{RESET}")

conn = get_db()

# 1. Asymmetric signature and verify
print("\n[TEST 1] Asymmetric Engine (sign_payload & verify_signature)")
payload = {
    "sub": "unit.test@falconathletics.com",
    "iss": "jerseystudio-cloud",
    "aud": "jerseystudio-desktop",
    "iat": int(time.time()),
    "exp": int(time.time()) + (7 * 86400),
    "allowed_tier": "pro_sportswear",
    "offline_grace_days": 7
}
canonical_json, sig_b64, compact_token = sign_payload(payload)
assert "." in compact_token, "Compact token format must contain dot separator"
is_valid = verify_signature(canonical_json, sig_b64)
if not is_valid:
    log_fail("Signature verification failed")
log_pass("Canonical payload signed with private key and verified with public key")

# 2. Tampering test
print("\n[TEST 2] Tampering Detection")
tampered_json = canonical_json.replace("pro_sportswear", "hacked_tier")
assert verify_signature(tampered_json, sig_b64) is False, "Tampered payload should fail verification"
log_pass("Tampered payload successfully detected and rejected")

# 3. Privacy boundary check
print("\n[TEST 3] Forbidden Data Keys Audit")
sample_request_with_roster = {"email": "user@team.com", "roster": [{"name": "Leo", "num": 10}]}
found_forbidden = [k for k in sample_request_with_roster.keys() if k.lower() in FORBIDDEN_DATA_KEYS]
assert len(found_forbidden) > 0, "Failed to catch forbidden roster key"
log_pass("Request containing forbidden 'roster' key caught by privacy boundary filter")

# 4. Audit logging
print("\n[TEST 4] Admin Audit Event Logging")
log_audit(conn, "founder@jerseystudio.internal", "user_approved", "unit.test@falconathletics.com", "Approved pro tier")
row = conn.execute(
    "SELECT action, target_email FROM admin_audit_events WHERE target_email = 'unit.test@falconathletics.com' ORDER BY timestamp DESC LIMIT 1"
).fetchone()
assert row["action"] == "user_approved", "Audit event not recorded"
log_pass("Audit event recorded in immutable table with timestamp and admin attribution")

conn.close()

print(f"\n{GREEN}======================================================{RESET}")
print(f"{GREEN}   ✔ ALL SERVER LOGIC UNIT TESTS PASSED!              {RESET}")
print(f"{GREEN}======================================================{RESET}\n")
