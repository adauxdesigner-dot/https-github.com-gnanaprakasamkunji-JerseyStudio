# JerseyStudio — Cloud Authorization & Admin Portal (Milestone 3)

This module implements the isolated cloud authorization, identity verification, and asymmetric licensing infrastructure for JerseyStudio.

## Non-Negotiable Privacy Guarantee
- **Zero Project Content in Cloud**: Jersey artwork, templates, SVG/canvas structures, player rosters, and exports remain strictly on the user's desktop device.
- **Strict Cloud Boundary**: Cloud services manage **only**:
  1. Email ownership verification (OTP).
  2. Founder / administrator approval (1-click Approve, Deny, Suspend, Revoke).
  3. Asymmetric cryptographic entitlement signing (valid for 7 days offline).
  4. Minimal, tamper-evident audit logs of administrative actions.

## Architecture

```
                                  CLOUD AUTHORITY
                       [Cloud Admin Backend & Portal]
                       - Stores: identity & license metadata only
                       - Holds: Server RSA-256 Private Key (Restricted!)
                                      │
                 Signs 7-day entitlement token with private key
                                      │
                                      ▼
             [Compact JWS Token: payload.rsa_signature]
             - Claims: sub (email), iss ("jerseystudio-cloud"),
               aud ("jerseystudio-desktop"), iat, exp (+7 days),
               allowed_tier ("pro_sportswear"), offline_grace_days (7)
                                      │
                                      ▼
                         DESKTOP CLIENT APPLICATION
                       - Holds: Embedded Public Key ONLY
                       - Verifies: Asymmetric signature offline
                       - 7-Day Offline Window:
                         • Day 0 to 7: 100% active offline operation
                         • Day 8+: Non-destructive check-in prompt
                       - Local projects and files are NEVER destroyed
```

## Schema (`cloud-admin/schema/001_initial_schema.sql`)
- `admin_users`: Founder and staff admin logins.
- `authorized_accounts`: Registered user emails, verification status, and administrative status (`pending`, `approved`, `suspended`, `revoked`).
- `account_permissions`: Licensed feature tiers (`pro_sportswear`, `community`) and capability flags.
- `license_entitlements`: Record of issued tokens, signatures, and timestamps.
- `admin_audit_events`: Immutable audit trail of every administrative decision.

## Quickstart

### 1. Run Founder Admin Web Portal
Open `cloud-admin/portal/index.html` directly in any web browser, or start the server:
```bash
python3 cloud-admin/server.py
```
Visit: `http://localhost:8787/portal/`

### 2. Run Automated Verification Suite
```bash
python3 cloud-admin/tests/test_licensing_suite.py
python3 cloud-admin/tests/test_server_logic.py
```

### 3. Key Management
- `cloud-admin/keys/private_key.pem`: Server private key (2048-bit RSA / PKCS#1 v1.5 SHA-256). Strictly retained server-side.
- `cloud-admin/keys/public_key.pem`: Server public key. Embedded into the desktop application (`src/features/auth/publicKey.ts` and `src-tauri/src/auth.rs`).
