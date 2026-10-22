#!/usr/bin/env python3
"""
JerseyStudio Cloud Licensing & Admin Backend
Isolated server module handling identity verification, administrator approvals,
and 7-day cryptographically signed offline entitlements.

NON-NEGOTIABLE PRIVACY BOUNDARY:
User projects, templates, jersey graphics, player rosters, and exports NEVER leave the user's device.
This server strictly rejects any request payload containing project or user artwork content.
"""

import sys
import os
import json
import uuid
import time
import base64
import sqlite3
import subprocess
from datetime import datetime, timedelta
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

PORT = int(os.environ.get("PORT", 8787))
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "jerseystudio_cloud.db")
KEY_DIR = os.path.join(BASE_DIR, "keys")
PRIVATE_KEY_PATH = os.path.join(KEY_DIR, "private_key.pem")
PUBLIC_KEY_PATH = os.path.join(KEY_DIR, "public_key.pem")
PORTAL_DIR = os.path.join(BASE_DIR, "portal")

FORBIDDEN_DATA_KEYS = {
    "project", "projects", "template", "templates", "roster", "rosters",
    "player", "players", "jersey", "jerseys", "canvas", "svg", "design",
    "artwork", "export", "exports", "file", "files", "dimensions"
}

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def sign_payload(payload_dict):
    """
    Signs a JSON dictionary with the server's private RSA key.
    Returns: (canonical_json_string, base64url_signature, full_compact_token)
    """
    canonical_json = json.dumps(payload_dict, separators=(',', ':'), sort_keys=True).encode('utf-8')
    res = subprocess.run(
        ['openssl', 'dgst', '-sha256', '-sign', PRIVATE_KEY_PATH],
        input=canonical_json,
        capture_output=True,
        check=True
    )
    signature_bytes = res.stdout
    
    # Base64url encode payload and signature
    payload_b64 = base64.urlsafe_b64encode(canonical_json).decode('utf-8').rstrip('=')
    signature_b64 = base64.urlsafe_b64encode(signature_bytes).decode('utf-8').rstrip('=')
    
    compact_token = f"{payload_b64}.{signature_b64}"
    return canonical_json.decode('utf-8'), signature_b64, compact_token

def verify_signature(canonical_json_str, signature_b64):
    """Verifies signature using the server's public RSA key."""
    # Add padding back if necessary
    rem = len(signature_b64) % 4
    if rem > 0:
        signature_b64 += '=' * (4 - rem)
    signature_bytes = base64.urlsafe_b64decode(signature_b64)
    
    temp_sig = f"/tmp/verify_sig_{uuid.uuid4().hex}.bin"
    with open(temp_sig, "wb") as f:
        f.write(signature_bytes)
        
    try:
        res = subprocess.run(
            ['openssl', 'dgst', '-sha256', '-verify', PUBLIC_KEY_PATH, '-signature', temp_sig],
            input=canonical_json_str.encode('utf-8'),
            capture_output=True
        )
        return res.returncode == 0
    finally:
        if os.path.exists(temp_sig):
            os.remove(temp_sig)

def log_audit(conn, admin_email, action, target_email, details, ip_address="127.0.0.1"):
    audit_id = f"audit-{uuid.uuid4().hex[:12]}"
    now_iso = datetime.utcnow().isoformat() + "Z"
    conn.execute(
        """INSERT INTO admin_audit_events (id, timestamp, admin_email, action, target_email, details, ip_address)
           VALUES (?, ?, ?, ?, ?, ?, ?)""",
        (audit_id, now_iso, admin_email, action, target_email, details, ip_address)
    )
    conn.commit()

class CloudAdminHandler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        # Concise logging
        sys.stderr.write(f"[{datetime.utcnow().strftime('%H:%M:%S')}] {args[0]} {args[1]}\n")

    def send_cors_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_cors_headers()
        self.end_headers()

    def send_json(self, status_code, data):
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self.send_cors_headers()
        self.end_headers()
        self.wfile.write(json.dumps(data).encode('utf-8'))

    def parse_body(self):
        content_length = int(self.headers.get('Content-Length', 0))
        if content_length == 0:
            return {}
        body_bytes = self.rfile.read(content_length)
        data = json.loads(body_bytes.decode('utf-8'))
        
        # STRICT PRIVACY AUDIT: Reject any payload containing forbidden project or roster keys!
        found_forbidden = [k for k in data.keys() if k.lower() in FORBIDDEN_DATA_KEYS]
        if found_forbidden:
            raise ValueError(f"Privacy Boundary Violation: Cloud authorization API strictly rejects project/artwork data. Received forbidden keys: {found_forbidden}")
        
        return data

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path
        query = parse_qs(parsed.query)

        # Static portal serving
        if path == '/' or path == '/portal' or path == '/portal/':
            self.serve_file(os.path.join(PORTAL_DIR, 'index.html'), 'text/html')
            return
        elif path.startswith('/portal/'):
            filename = path[len('/portal/'):]
            filepath = os.path.join(PORTAL_DIR, filename)
            if os.path.exists(filepath):
                ext = filepath.split('.')[-1]
                mime = 'text/css' if ext == 'css' else 'application/javascript' if ext == 'js' else 'text/html'
                self.serve_file(filepath, mime)
                return

        # API: Health Check
        if path == '/api/health':
            self.send_json(200, {
                "status": "healthy",
                "service": "jerseystudio-cloud-licensing",
                "version": "1.0.0",
                "timestamp": datetime.utcnow().isoformat() + "Z"
            })
            return

        # API: Public Verification Key (embedded in desktop app)
        if path == '/api/public-key':
            with open(PUBLIC_KEY_PATH, 'r') as f:
                pub_key_content = f.read()
            self.send_json(200, {
                "public_key": pub_key_content,
                "algorithm": "RSASSA-PKCS1-v1_5-SHA256",
                "issuer": "jerseystudio-cloud",
                "audience": "jerseystudio-desktop"
            })
            return

        # API: Admin Metrics
        if path == '/api/admin/metrics':
            conn = get_db()
            metrics = {
                "total": conn.execute("SELECT count(*) FROM authorized_accounts").fetchone()[0],
                "pending": conn.execute("SELECT count(*) FROM authorized_accounts WHERE status = 'pending'").fetchone()[0],
                "approved": conn.execute("SELECT count(*) FROM authorized_accounts WHERE status = 'approved'").fetchone()[0],
                "suspended": conn.execute("SELECT count(*) FROM authorized_accounts WHERE status = 'suspended'").fetchone()[0],
                "revoked": conn.execute("SELECT count(*) FROM authorized_accounts WHERE status = 'revoked'").fetchone()[0],
            }
            conn.close()
            self.send_json(200, metrics)
            return

        # API: Admin Users List
        if path == '/api/admin/users':
            conn = get_db()
            status_filter = query.get('status', [None])[0]
            search_query = query.get('search', [None])[0]

            sql = """
                SELECT a.id, a.email, a.status, a.email_verified_at, a.approved_at, a.approved_by, 
                       a.suspended_at, a.revoked_at, a.status_reason, a.created_at, a.updated_at,
                       p.tier, p.max_export_resolution, p.features_json
                FROM authorized_accounts a
                LEFT JOIN account_permissions p ON a.id = p.account_id
                WHERE 1=1
            """
            params = []
            if status_filter and status_filter != 'all':
                sql += " AND a.status = ?"
                params.append(status_filter)
            if search_query:
                sql += " AND a.email LIKE ?"
                params.append(f"%{search_query}%")
            sql += " ORDER BY a.created_at DESC"

            rows = conn.execute(sql, params).fetchall()
            users = []
            for r in rows:
                users.append({
                    "id": r["id"],
                    "email": r["email"],
                    "status": r["status"],
                    "email_verified_at": r["email_verified_at"],
                    "approved_at": r["approved_at"],
                    "approved_by": r["approved_by"],
                    "suspended_at": r["suspended_at"],
                    "revoked_at": r["revoked_at"],
                    "status_reason": r["status_reason"],
                    "created_at": r["created_at"],
                    "tier": r["tier"] or "pro_sportswear",
                    "features": json.loads(r["features_json"] or '[]')
                })
            conn.close()
            self.send_json(200, {"users": users})
            return

        # API: Admin Audit Logs
        if path == '/api/admin/audit-logs':
            conn = get_db()
            rows = conn.execute(
                "SELECT id, timestamp, admin_email, action, target_email, details, ip_address FROM admin_audit_events ORDER BY timestamp DESC LIMIT 100"
            ).fetchall()
            logs = [dict(r) for r in rows]
            conn.close()
            self.send_json(200, {"audit_logs": logs})
            return

        self.send_json(404, {"error": "Not Found"})

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path

        try:
            body = self.parse_body()
        except ValueError as e:
            self.send_json(400, {"error": str(e)})
            return
        except Exception as e:
            self.send_json(400, {"error": "Invalid JSON body"})
            return

        # =====================================================================
        # 1. Desktop Authentication Endpoints
        # =====================================================================

        # API: Request OTP for email ownership verification
        if path == '/api/auth/request-otp':
            email = body.get('email', '').strip().lower()
            if not email or '@' not in email:
                self.send_json(400, {"error": "Valid email address required"})
                return

            conn = get_db()
            user = conn.execute("SELECT * FROM authorized_accounts WHERE email = ?", (email,)).fetchone()
            
            # Deterministic simulation OTP for testing/local or 6-digit code
            otp = "789123" if "falconathletics" in email else "456789" if "test" in email else f"{int(time.time()) % 900000 + 100000}"
            now_iso = datetime.utcnow().isoformat() + "Z"
            expires_at = (datetime.utcnow() + timedelta(minutes=15)).isoformat() + "Z"

            if not user:
                account_id = f"acc-{uuid.uuid4().hex[:12]}"
                conn.execute(
                    """INSERT INTO authorized_accounts (id, email, status, verification_otp, otp_expires_at, created_at, updated_at)
                       VALUES (?, ?, 'pending', ?, ?, ?, ?)""",
                    (account_id, email, otp, expires_at, now_iso, now_iso)
                )
                perm_id = f"perm-{uuid.uuid4().hex[:12]}"
                conn.execute(
                    """INSERT INTO account_permissions (id, account_id, tier, granted_at, updated_at)
                       VALUES (?, ?, 'pro_sportswear', ?, ?)""",
                    (perm_id, account_id, now_iso, now_iso)
                )
                log_audit(conn, "system", "user_registered", email, "New user registered via OTP request")
            else:
                conn.execute(
                    "UPDATE authorized_accounts SET verification_otp = ?, otp_expires_at = ?, updated_at = ? WHERE email = ?",
                    (otp, expires_at, now_iso, email)
                )
            conn.commit()
            log_audit(conn, "system", "otp_issued", email, f"Generated OTP code for email verification")
            conn.close()

            self.send_json(200, {
                "success": true,
                "message": f"Verification code sent to {email}",
                "dev_otp": otp
            })
            return

        # API: Verify OTP & Retrieve Entitlement
        if path == '/api/auth/verify-otp':
            email = body.get('email', '').strip().lower()
            otp = body.get('otp', '').strip()
            conn = get_db()
            user = conn.execute("SELECT * FROM authorized_accounts WHERE email = ?", (email,)).fetchone()

            if not user:
                conn.close()
                self.send_json(404, {"error": "Account not found for email"})
                return

            if user["verification_otp"] != otp and otp != "999999":  # 999999 = master test bypass
                conn.close()
                self.send_json(400, {"error": "Invalid or expired verification code"})
                return

            now = datetime.utcnow()
            now_iso = now.isoformat() + "Z"
            conn.execute(
                "UPDATE authorized_accounts SET email_verified_at = ?, verification_otp = NULL, updated_at = ? WHERE id = ?",
                (now_iso, now_iso, user["id"])
            )
            conn.commit()
            log_audit(conn, "system", "otp_verified", email, "Email ownership verified successfully")

            # Check status
            status = user["status"]
            if status == "pending":
                conn.close()
                self.send_json(200, {
                    "success": true,
                    "status": "pending",
                    "email": email,
                    "message": "Email verified successfully! Your account is currently awaiting founder/administrator approval."
                })
                return
            elif status == "suspended":
                reason = user["status_reason"] or "Account suspended by administrator"
                conn.close()
                self.send_json(403, {
                    "success": false,
                    "status": "suspended",
                    "email": email,
                    "error": f"Account suspended: {reason}"
                })
                return
            elif status == "revoked":
                conn.close()
                self.send_json(403, {
                    "success": false,
                    "status": "revoked",
                    "email": email,
                    "error": "Account authorization has been permanently revoked by administrator"
                })
                return
            elif status == "approved":
                # Account approved -> Issue 7-day cryptographically signed entitlement
                token_res = self.issue_entitlement_for_account(conn, user)
                conn.close()
                self.send_json(200, token_res)
                return

        # API: Entitlement Refresh / Check-in
        if path == '/api/auth/refresh':
            email = body.get('email', '').strip().lower()
            token_id = body.get('token_id', '')

            conn = get_db()
            user = conn.execute("SELECT * FROM authorized_accounts WHERE email = ?", (email,)).fetchone()

            if not user:
                conn.close()
                self.send_json(404, {"error": "Account not found"})
                return

            # Strict Enforcement of Remote Decisions on Reconnection
            if user["status"] == "revoked":
                # Invalidate any cached entitlements
                conn.execute("UPDATE license_entitlements SET status = 'revoked' WHERE account_id = ?", (user["id"],))
                conn.commit()
                log_audit(conn, "system", "user_revoked", email, "Reconnection check-in enforced remote revocation")
                conn.close()
                self.send_json(403, {
                    "success": false,
                    "status": "revoked",
                    "error": "Account revoked by administrator. Local projects and files remain intact."
                })
                return

            if user["status"] == "suspended":
                conn.close()
                self.send_json(403, {
                    "success": false,
                    "status": "suspended",
                    "error": f"Account is suspended: {user['status_reason'] or 'Contact support'}"
                })
                return

            if user["status"] == "pending":
                conn.close()
                self.send_json(200, {
                    "success": true,
                    "status": "pending",
                    "message": "Account is still pending administrator approval"
                })
                return

            # Active & Approved -> Refresh 7-day entitlement window!
            token_res = self.issue_entitlement_for_account(conn, user, is_refresh=True)
            conn.close()
            self.send_json(200, token_res)
            return

        # =====================================================================
        # 2. Founder Admin Management Endpoints
        # =====================================================================

        admin_email = body.get('admin_email', 'founder@jerseystudio.internal')

        if path == '/api/admin/approve':
            email = body.get('email', '').strip().lower()
            tier = body.get('tier', 'pro_sportswear')
            conn = get_db()
            now_iso = datetime.utcnow().isoformat() + "Z"
            conn.execute(
                """UPDATE authorized_accounts 
                   SET status = 'approved', approved_at = ?, approved_by = ?, suspended_at = NULL, revoked_at = NULL, status_reason = NULL, updated_at = ?
                   WHERE email = ?""",
                (now_iso, admin_email, now_iso, email)
            )
            # Update tier
            user = conn.execute("SELECT id FROM authorized_accounts WHERE email = ?", (email,)).fetchone()
            if user:
                conn.execute(
                    "UPDATE account_permissions SET tier = ?, updated_at = ? WHERE account_id = ?",
                    (tier, now_iso, user["id"])
                )
            conn.commit()
            log_audit(conn, admin_email, "user_approved", email, f"Approved user with tier: {tier}")
            conn.close()
            self.send_json(200, {"success": true, "message": f"User {email} approved with {tier} tier"})
            return

        if path == '/api/admin/suspend':
            email = body.get('email', '').strip().lower()
            reason = body.get('reason', 'Administrative hold')
            conn = get_db()
            now_iso = datetime.utcnow().isoformat() + "Z"
            conn.execute(
                """UPDATE authorized_accounts 
                   SET status = 'suspended', suspended_at = ?, status_reason = ?, updated_at = ?
                   WHERE email = ?""",
                (now_iso, reason, now_iso, email)
            )
            conn.commit()
            log_audit(conn, admin_email, "user_suspended", email, f"Suspended user: {reason}")
            conn.close()
            self.send_json(200, {"success": true, "message": f"User {email} suspended: {reason}"})
            return

        if path == '/api/admin/reactivate':
            email = body.get('email', '').strip().lower()
            conn = get_db()
            now_iso = datetime.utcnow().isoformat() + "Z"
            conn.execute(
                """UPDATE authorized_accounts 
                   SET status = 'approved', suspended_at = NULL, revoked_at = NULL, status_reason = NULL, updated_at = ?
                   WHERE email = ?""",
                (now_iso, now_iso, email)
            )
            conn.commit()
            log_audit(conn, admin_email, "user_reactivated", email, "Reactivated account")
            conn.close()
            self.send_json(200, {"success": true, "message": f"User {email} reactivated"})
            return

        if path == '/api/admin/revoke':
            email = body.get('email', '').strip().lower()
            reason = body.get('reason', 'Revocation by administrator')
            conn = get_db()
            now_iso = datetime.utcnow().isoformat() + "Z"
            conn.execute(
                """UPDATE authorized_accounts 
                   SET status = 'revoked', revoked_at = ?, status_reason = ?, updated_at = ?
                   WHERE email = ?""",
                (now_iso, reason, now_iso, email)
            )
            conn.commit()
            log_audit(conn, admin_email, "user_revoked", email, f"Permanently revoked access: {reason}")
            conn.close()
            self.send_json(200, {"success": true, "message": f"User {email} revoked"})
            return

        if path == '/api/admin/deny':
            email = body.get('email', '').strip().lower()
            reason = body.get('reason', 'Registration request denied')
            conn = get_db()
            now_iso = datetime.utcnow().isoformat() + "Z"
            conn.execute(
                """UPDATE authorized_accounts 
                   SET status = 'revoked', revoked_at = ?, status_reason = ?, updated_at = ?
                   WHERE email = ?""",
                (now_iso, reason, now_iso, email)
            )
            conn.commit()
            log_audit(conn, admin_email, "user_denied", email, f"Denied registration request: {reason}")
            conn.close()
            self.send_json(200, {"success": true, "message": f"Registration for {email} denied"})
            return

        self.send_json(404, {"error": "Endpoint not found"})

    def issue_entitlement_for_account(self, conn, user, is_refresh=False):
        """Generates a 7-day cryptographically signed entitlement token."""
        now = datetime.utcnow()
        iat_sec = int(now.timestamp())
        exp_sec = iat_sec + (7 * 86400) # 7 days
        token_id = f"ent-{uuid.uuid4().hex[:16]}"

        perm = conn.execute("SELECT * FROM account_permissions WHERE account_id = ?", (user["id"],)).fetchone()
        tier = perm["tier"] if perm else "pro_sportswear"
        features = json.loads(perm["features_json"]) if perm and perm["features_json"] else [
            "vector_editor", "bulk_personalization", "csv_import", "hi_res_export", "offline_grace_7d"
        ]

        payload = {
            "sub": user["email"],
            "iss": "jerseystudio-cloud",
            "aud": "jerseystudio-desktop",
            "iat": iat_sec,
            "exp": exp_sec,
            "allowed_tier": tier,
            "offline_grace_days": 7,
            "account_id": user["id"],
            "token_id": token_id,
            "features": features
        }

        canonical_json, sig_b64, compact_token = sign_payload(payload)

        # Record in license_entitlements
        ent_id = f"lic-{uuid.uuid4().hex[:12]}"
        now_iso = now.isoformat() + "Z"
        exp_iso = (now + timedelta(days=7)).isoformat() + "Z"

        conn.execute(
            """INSERT INTO license_entitlements 
               (id, account_id, token_id, issued_at, expires_at, allowed_tier, offline_grace_days, signature, status)
               VALUES (?, ?, ?, ?, ?, ?, 7, ?, 'valid')""",
            (ent_id, user["id"], token_id, now_iso, exp_iso, tier, sig_b64)
        )
        conn.commit()

        action = "entitlement_refreshed" if is_refresh else "entitlement_issued"
        log_audit(conn, "system", action, user["email"], f"Issued 7-day signed offline entitlement token {token_id}")

        return {
            "success": True,
            "status": "active",
            "email": user["email"],
            "entitlement_token": compact_token,
            "payload": payload,
            "signature": sig_b64,
            "issued_at": now_iso,
            "expires_at": exp_iso,
            "offline_grace_days": 7
        }

    def serve_file(self, filepath, mime_type):
        if not os.path.exists(filepath):
            self.send_json(404, {"error": "Portal asset not found"})
            return
        with open(filepath, 'rb') as f:
            content = f.read()
        self.send_response(200)
        self.send_header('Content-Type', mime_type)
        self.send_cors_headers()
        self.end_headers()
        self.wfile.write(content)

def run_server():
    server_address = ('', PORT)
    httpd = HTTPServer(server_address, CloudAdminHandler)
    print(f"🚀 JerseyStudio Cloud Licensing & Admin Service listening on http://localhost:{PORT}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping server...")
        httpd.server_close()

if __name__ == '__main__':
    run_server()
