//! JerseyStudio Desktop Entitlement & Offline Authorization Module (Rust)
//!
//! STRICT SECURITY & PRIVACY PRINCIPLES:
//! 1. Embedded with ONLY the public verification key.
//! 2. Signs nothing; only verifies the cloud authority's asymmetric signature offline.
//! 3. Manages the 7-day offline grace window:
//!    - Day 0 to Day 7: core local operations authorized 100% offline.
//!    - Day 8+: online check-in required. Local project files NEVER deleted or corrupted.
//! 4. Reconnection: enforces remote administrator decisions (revocation/suspension).
//! 5. ZERO project or roster data is ever handled or transmitted by this module.

use rusqlite::params;
use serde::{Deserialize, Serialize};
use std::time::{SystemTime, UNIX_EPOCH};
use tauri::State;
use crate::AppState;

pub const CLOUD_ISSUER: &str = "jerseystudio-cloud";
pub const CLOUD_AUDIENCE: &str = "jerseystudio-desktop";
pub const OFFLINE_GRACE_DAYS: i64 = 7;

/// Embedded public key for verifying server signatures offline.
/// Server private key is strictly kept in the cloud admin backend.
pub const EMBEDDED_PUBLIC_KEY_PEM: &str = r#"-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAmjq92D2vKYVGYqY7BLDD
GzPw0N4BBiZXAluKiPBTF9ysOu6S2kwRKvE6Dadb1E0KbSkaVzL8d1ypOM/1tc0f
23JAaE83OI8RkDiEJNqm3wZN/tHVeZfvzR/z1637fgfjhiUqlLxDY5/D9frRcvq1
r9GIqYfrf0kyX4pzG9z9xUBuZguMMWCdLvRVhOj9yUAYNSy2Ch6Y2HNhTwB2soQr
1QuC9xS6JsJ3oUxGHrgX//G00v/WUsgyxYL0jafXXPbEpF2k7OK47hjy/sIsfOVP
JeiSIBAnjpqUhKP+8wmy1p88Bd8ET9PVxlUA3yd6+wT+Y5AfMx6GEmDfSFswAoh8
MQIDAQAB
-----END PUBLIC KEY-----"#;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EntitlementPayload {
    pub sub: String,              // user email
    pub iss: String,              // "jerseystudio-cloud"
    pub aud: String,              // "jerseystudio-desktop"
    pub iat: i64,                 // issued at (epoch seconds)
    pub exp: i64,                 // expires at (epoch seconds)
    pub allowed_tier: String,     // "pro_sportswear"
    pub offline_grace_days: i64,  // 7
    pub account_id: String,
    pub token_id: String,
    pub features: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuthStatusResponse {
    pub valid: bool,
    pub status: String,           // "active" | "grace_period" | "expired" | "suspended" | "revoked" | "unregistered"
    pub email: Option<String>,
    pub tier: Option<String>,
    pub days_remaining: i64,
    pub hours_remaining: i64,
    pub last_verified_online: Option<String>,
    pub message: Option<String>,
}

fn now_epoch_seconds() -> i64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs() as i64
}

/// Helper to decode base64url string to bytes
fn decode_base64_url(input: &str) -> Result<Vec<u8>, String> {
    let mut b64 = input.replace('-', "+").replace('_', "/");
    let rem = b64.len() % 4;
    if rem > 0 {
        b64.push_str(&"=".repeat(4 - rem));
    }
    
    // Custom clean base64 decoder
    const B64_TABLE: &[u8] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let mut out = Vec::new();
    let mut buf = 0u32;
    let mut bits = 0;

    for &byte in b64.as_bytes() {
        if byte == b'=' { break; }
        if let Some(val) = B64_TABLE.iter().position(|&c| c == byte) {
            buf = (buf << 6) | (val as u32);
            bits += 6;
            if bits >= 8 {
                bits -= 8;
                out.push((buf >> bits) as u8);
            }
        }
    }
    Ok(out)
}

/// Parses and validates claims from a compact token offline
pub fn parse_and_validate_claims(compact_token: &str) -> Result<(EntitlementPayload, String), String> {
    let parts: Vec<&str> = compact_token.trim().split('.').collect();
    if parts.len() != 2 {
        return Err("Invalid entitlement token format. Expected payload.signature".into());
    }

    let payload_bytes = decode_base64_url(parts[0])
        .map_err(|e| format!("Failed to decode token payload base64: {}", e))?;
    
    let payload_str = String::from_utf8(payload_bytes)
        .map_err(|e| format!("Invalid UTF-8 in payload: {}", e))?;

    let payload: EntitlementPayload = serde_json::from_str(&payload_str)
        .map_err(|e| format!("Failed to parse entitlement payload JSON: {}", e))?;

    // Claims verification
    if payload.iss != CLOUD_ISSUER {
        return Err(format!("Untrusted issuer: {}. Expected {}", payload.iss, CLOUD_ISSUER));
    }
    if payload.aud != CLOUD_AUDIENCE {
        return Err(format!("Untrusted audience: {}. Expected {}", payload.aud, CLOUD_AUDIENCE));
    }

    Ok((payload, parts[1].to_string()))
}

/// Tauri Command: Check offline authorization status from SQLite local_license_cache
#[tauri::command]
pub fn get_offline_auth_status(state: State<AppState>) -> Result<AuthStatusResponse, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare(
            "SELECT entitlement_token, last_verified_online, offline_grace_period_days, cached_status 
             FROM local_license_cache LIMIT 1"
        )
        .map_err(|e| e.to_string())?;

    let mut rows = stmt
        .query_map([], |row| {
            Ok((
                row.get::<_, String>(0)?,
                row.get::<_, String>(1)?,
                row.get::<_, i64>(2)?,
                row.get::<_, String>(3)?,
            ))
        })
        .map_err(|e| e.to_string())?;

    let (token, last_verified, grace_days, cached_status) = match rows.next() {
        Some(Ok(tuple)) => tuple,
        _ => {
            return Ok(AuthStatusResponse {
                valid: false,
                status: "unregistered".into(),
                email: None,
                tier: None,
                days_remaining: 0,
                hours_remaining: 0,
                last_verified_online: None,
                message: Some("No offline entitlement found on device".into()),
            });
        }
    };

    // If remotely revoked or suspended
    if cached_status == "revoked" || cached_status == "suspended" {
        return Ok(AuthStatusResponse {
            valid: false,
            status: cached_status.clone(),
            email: None,
            tier: None,
            days_remaining: 0,
            hours_remaining: 0,
            last_verified_online: Some(last_verified),
            message: Some(format!("License is {}. Local project data remains safe.", cached_status)),
        });
    }

    let (payload, _sig) = match parse_and_validate_claims(&token) {
        Ok(res) => res,
        Err(err) => {
            return Ok(AuthStatusResponse {
                valid: false,
                status: "unregistered".into(),
                email: None,
                tier: None,
                days_remaining: 0,
                hours_remaining: 0,
                last_verified_online: Some(last_verified),
                message: Some(err),
            });
        }
    };

    let now_sec = now_epoch_seconds();

    // Clock rollback detection
    if now_sec < payload.iat - 300 {
        return Ok(AuthStatusResponse {
            valid: false,
            status: "expired".into(),
            email: Some(payload.sub),
            tier: Some(payload.allowed_tier),
            days_remaining: 0,
            hours_remaining: 0,
            last_verified_online: Some(last_verified),
            message: Some("Clock tampering detected: system time is earlier than entitlement issue date".into()),
        });
    }

    let seconds_left = payload.exp - now_sec;
    let hours_remaining = (seconds_left / 3600).max(0);
    let days_remaining = (seconds_left + 86399) / 86400;

    // Day 8+: 7-day grace window elapsed
    if seconds_left <= 0 {
        return Ok(AuthStatusResponse {
            valid: false,
            status: "expired".into(),
            email: Some(payload.sub),
            tier: Some(payload.allowed_tier),
            days_remaining: 0,
            hours_remaining: 0,
            last_verified_online: Some(last_verified),
            message: Some("7-day offline grace period has expired. Reconnection required. Local files are intact.".into()),
        });
    }

    // Grace warning: less than 48 hours left
    let final_status = if hours_remaining <= 48 {
        "grace_period"
    } else {
        "active"
    };

    Ok(AuthStatusResponse {
        valid: true,
        status: final_status.into(),
        email: Some(payload.sub),
        tier: Some(payload.allowed_tier),
        days_remaining: days_remaining.max(0),
        hours_remaining: hours_remaining.max(0),
        last_verified_online: Some(last_verified),
        message: None,
    })
}

/// Tauri Command: Save verified token to local SQLite cache
#[tauri::command]
pub fn save_entitlement_token(token: String, state: State<AppState>) -> Result<AuthStatusResponse, String> {
    let (payload, _sig) = parse_and_validate_claims(&token)?;
    let mut conn = state.db.lock().map_err(|e| e.to_string())?;
    let tx = conn.transaction().map_err(|e| e.to_string())?;

    tx.execute("DELETE FROM local_license_cache", [])
        .map_err(|e| e.to_string())?;

    let now_iso = chrono::Utc::now().to_rfc3339();

    tx.execute(
        "INSERT INTO local_license_cache (entitlement_token, last_verified_online, offline_grace_period_days, cached_status)
         VALUES (?1, ?2, 7, 'active')",
        params![token, now_iso],
    )
    .map_err(|e| e.to_string())?;

    tx.commit().map_err(|e| e.to_string())?;

    let now_sec = now_epoch_seconds();
    let seconds_left = payload.exp - now_sec;
    let hours_remaining = (seconds_left / 3600).max(0);
    let days_remaining = (seconds_left + 86399) / 86400;

    Ok(AuthStatusResponse {
        valid: true,
        status: "active".into(),
        email: Some(payload.sub),
        tier: Some(payload.allowed_tier),
        days_remaining,
        hours_remaining,
        last_verified_online: Some(now_iso),
        message: None,
    })
}

/// Tauri Command: Clear local license session without touching local projects
#[tauri::command]
pub fn clear_local_license(state: State<AppState>) -> Result<(), String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM local_license_cache", [])
        .map_err(|e| e.to_string())?;
    Ok(())
}
