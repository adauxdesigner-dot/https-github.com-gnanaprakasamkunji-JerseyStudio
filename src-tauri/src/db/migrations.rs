use rusqlite::{params, Connection, Result};
use chrono::Utc;

pub const CURRENT_SCHEMA_VERSION: i32 = 1;

/// Embedded SQL schema definition for Version 1
pub const INITIAL_SCHEMA_SQL: &str = include_str!("schema.sql");

/// Runs all pending database migrations within a transaction.
pub fn run_migrations(conn: &mut Connection) -> Result<()> {
    // Ensure migrations table exists
    conn.execute(
        "CREATE TABLE IF NOT EXISTS schema_migrations (
            version INTEGER PRIMARY KEY NOT NULL,
            applied_at TEXT NOT NULL
        );",
        [],
    )?;

    // Check latest applied version
    let current_version: Option<i32> = conn
        .query_row(
            "SELECT MAX(version) FROM schema_migrations",
            [],
            |row| row.get(0),
        )
        .unwrap_or(None);

    let current_version = current_version.unwrap_or(0);

    if current_version < 1 {
        let tx = conn.transaction()?;
        
        // Execute initial schema
        tx.execute_batch(INITIAL_SCHEMA_SQL)?;

        // Record migration
        let now = Utc::now().to_rfc3339();
        tx.execute(
            "INSERT INTO schema_migrations (version, applied_at) VALUES (?1, ?2)",
            params![1, now],
        )?;

        tx.commit()?;
    }

    Ok(())
}
