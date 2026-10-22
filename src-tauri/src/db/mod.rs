pub mod migrations;

use rusqlite::{params, Connection, Result};
use std::fs;
use std::path::{Path, PathBuf};
use serde::{Deserialize, Serialize};

#[derive(Debug, thiserror::Error)]
pub enum DbError {
    #[error("SQLite error: {0}")]
    Sqlite(#[from] rusqlite::Error),
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),
}

/// Initializes a local SQLite database at the specified path.
/// Sets performance and integrity pragmas (WAL mode, foreign keys, synchronous normal)
/// and applies pending migrations.
pub fn init_db(db_path: &Path) -> Result<Connection, DbError> {
    if let Some(parent) = db_path.parent() {
        fs::create_dir_all(parent)?;
    }

    let mut conn = Connection::open(db_path)?;

    // PRAGMA configuration for local data safety and performance
    conn.execute_batch(
        "PRAGMA journal_mode = WAL;
         PRAGMA synchronous = NORMAL;
         PRAGMA foreign_keys = ON;
         PRAGMA busy_timeout = 5000;"
    )?;

    migrations::run_migrations(&mut conn)?;

    Ok(conn)
}

// Data transfer models for Tauri commands
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProjectRecord {
    pub id: String,
    pub name: String,
    pub garment_type: String,
    pub canvas_width: f64,
    pub canvas_height: f64,
    pub canvas_unit: String,
    pub dpi: i64,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DesignElementRecord {
    pub id: String,
    pub project_id: String,
    pub view: String,
    pub element_type: String,
    pub x: f64,
    pub y: f64,
    pub width: f64,
    pub height: f64,
    pub rotation: f64,
    pub font_family: Option<String>,
    pub font_size: Option<f64>,
    pub fill_color: Option<String>,
    pub stroke_color: Option<String>,
    pub stroke_width: Option<f64>,
    pub text_content: Option<String>,
    pub field_binding: Option<String>,
    pub z_index: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RosterImportRecord {
    pub id: String,
    pub project_id: String,
    pub filename: String,
    pub row_count: i64,
    pub created_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RosterRecordItem {
    pub id: String,
    pub roster_id: String,
    pub row_index: i64,
    pub player_name: String,
    pub player_number: String,
    pub size: String,
    pub validation_status: String,
    pub validation_notes: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LocalLicenseCacheRecord {
    pub entitlement_token: String,
    pub last_verified_online: String,
    pub offline_grace_period_days: i64,
    pub cached_status: String,
}
