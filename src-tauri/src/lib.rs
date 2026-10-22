pub mod db;
pub mod auth;

use auth::{get_offline_auth_status, save_entitlement_token, clear_local_license};
use db::{DbError, DesignElementRecord, LocalLicenseCacheRecord, ProjectRecord};
use rusqlite::{params, Connection};
use std::path::PathBuf;
use std::sync::Mutex;
use tauri::{Manager, State};

pub struct AppState {
    pub db: Mutex<Connection>,
    pub db_path: PathBuf,
}

#[tauri::command]
pub fn check_db_health(state: State<AppState>) -> Result<String, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let version: i32 = conn
        .query_row(
            "SELECT MAX(version) FROM schema_migrations",
            [],
            |row| row.get(0),
        )
        .map_err(|e| e.to_string())?;

    Ok(format!("Database healthy at schema version {}", version))
}

#[tauri::command]
pub fn get_projects(state: State<AppState>) -> Result<Vec<ProjectRecord>, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare(
            "SELECT id, name, garment_type, canvas_width, canvas_height, canvas_unit, dpi, created_at, updated_at 
             FROM projects ORDER BY updated_at DESC",
        )
        .map_err(|e| e.to_string())?;

    let rows = stmt
        .query_map([], |row| {
            Ok(ProjectRecord {
                id: row.get(0)?,
                name: row.get(1)?,
                garment_type: row.get(2)?,
                canvas_width: row.get(3)?,
                canvas_height: row.get(4)?,
                canvas_unit: row.get(5)?,
                dpi: row.get(6)?,
                created_at: row.get(7)?,
                updated_at: row.get(8)?,
            })
        })
        .map_err(|e| e.to_string())?;

    let mut projects = Vec::new();
    for row in rows {
        projects.push(row.map_err(|e| e.to_string())?);
    }
    Ok(projects)
}

#[tauri::command]
pub fn create_project(project: ProjectRecord, state: State<AppState>) -> Result<ProjectRecord, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO projects (id, name, garment_type, canvas_width, canvas_height, canvas_unit, dpi, created_at, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)",
        params![
            project.id,
            project.name,
            project.garment_type,
            project.canvas_width,
            project.canvas_height,
            project.canvas_unit,
            project.dpi,
            project.created_at,
            project.updated_at
        ],
    )
    .map_err(|e| e.to_string())?;

    Ok(project)
}

#[tauri::command]
pub fn get_project(id: String, state: State<AppState>) -> Result<Option<ProjectRecord>, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare(
            "SELECT id, name, garment_type, canvas_width, canvas_height, canvas_unit, dpi, created_at, updated_at 
             FROM projects WHERE id = ?1",
        )
        .map_err(|e| e.to_string())?;

    let mut rows = stmt
        .query_map(params![id], |row| {
            Ok(ProjectRecord {
                id: row.get(0)?,
                name: row.get(1)?,
                garment_type: row.get(2)?,
                canvas_width: row.get(3)?,
                canvas_height: row.get(4)?,
                canvas_unit: row.get(5)?,
                dpi: row.get(6)?,
                created_at: row.get(7)?,
                updated_at: row.get(8)?,
            })
        })
        .map_err(|e| e.to_string())?;

    if let Some(project) = rows.next() {
        Ok(Some(project.map_err(|e| e.to_string())?))
    } else {
        Ok(None)
    }
}

#[tauri::command]
pub fn get_design_elements(
    project_id: String,
    view: String,
    state: State<AppState>,
) -> Result<Vec<DesignElementRecord>, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare(
            "SELECT id, project_id, view, element_type, x, y, width, height, rotation, 
                    font_family, font_size, fill_color, stroke_color, stroke_width, 
                    text_content, field_binding, z_index 
             FROM design_elements 
             WHERE project_id = ?1 AND view = ?2 
             ORDER BY z_index ASC",
        )
        .map_err(|e| e.to_string())?;

    let rows = stmt
        .query_map(params![project_id, view], |row| {
            Ok(DesignElementRecord {
                id: row.get(0)?,
                project_id: row.get(1)?,
                view: row.get(2)?,
                element_type: row.get(3)?,
                x: row.get(4)?,
                y: row.get(5)?,
                width: row.get(6)?,
                height: row.get(7)?,
                rotation: row.get(8)?,
                font_family: row.get(9)?,
                font_size: row.get(10)?,
                fill_color: row.get(11)?,
                stroke_color: row.get(12)?,
                stroke_width: row.get(13)?,
                text_content: row.get(14)?,
                field_binding: row.get(15)?,
                z_index: row.get(16)?,
            })
        })
        .map_err(|e| e.to_string())?;

    let mut elements = Vec::new();
    for row in rows {
        elements.push(row.map_err(|e| e.to_string())?);
    }
    Ok(elements)
}

#[tauri::command]
pub fn save_design_elements(
    project_id: String,
    view: String,
    elements: Vec<DesignElementRecord>,
    state: State<AppState>,
) -> Result<(), String> {
    let mut conn = state.db.lock().map_err(|e| e.to_string())?;
    let tx = conn.transaction().map_err(|e| e.to_string())?;

    // Delete existing elements for this view
    tx.execute(
        "DELETE FROM design_elements WHERE project_id = ?1 AND view = ?2",
        params![project_id, view],
    )
    .map_err(|e| e.to_string())?;

    // Insert new elements
    for el in elements {
        tx.execute(
            "INSERT INTO design_elements (
                id, project_id, view, element_type, x, y, width, height, rotation,
                font_family, font_size, fill_color, stroke_color, stroke_width,
                text_content, field_binding, z_index
            ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17)",
            params![
                el.id,
                el.project_id,
                el.view,
                el.element_type,
                el.x,
                el.y,
                el.width,
                el.height,
                el.rotation,
                el.font_family,
                el.font_size,
                el.fill_color,
                el.stroke_color,
                el.stroke_width,
                el.text_content,
                el.field_binding,
                el.z_index
            ],
        )
        .map_err(|e| e.to_string())?;
    }

    tx.commit().map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn get_local_setting(key: String, state: State<AppState>) -> Result<Option<String>, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT value FROM local_settings WHERE key = ?1")
        .map_err(|e| e.to_string())?;

    let mut rows = stmt
        .query_map(params![key], |row| row.get(0))
        .map_err(|e| e.to_string())?;

    if let Some(val) = rows.next() {
        Ok(Some(val.map_err(|e| e.to_string())?))
    } else {
        Ok(None)
    }
}

#[tauri::command]
pub fn set_local_setting(key: String, value: String, state: State<AppState>) -> Result<(), String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO local_settings (key, value) VALUES (?1, ?2)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value",
        params![key, value],
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn get_license_cache(state: State<AppState>) -> Result<Option<LocalLicenseCacheRecord>, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare(
            "SELECT entitlement_token, last_verified_online, offline_grace_period_days, cached_status 
             FROM local_license_cache LIMIT 1",
        )
        .map_err(|e| e.to_string())?;

    let mut rows = stmt
        .query_map([], |row| {
            Ok(LocalLicenseCacheRecord {
                entitlement_token: row.get(0)?,
                last_verified_online: row.get(1)?,
                offline_grace_period_days: row.get(2)?,
                cached_status: row.get(3)?,
            })
        })
        .map_err(|e| e.to_string())?;

    if let Some(record) = rows.next() {
        Ok(Some(record.map_err(|e| e.to_string())?))
    } else {
        Ok(None)
    }
}

#[tauri::command]
pub fn set_license_cache(record: LocalLicenseCacheRecord, state: State<AppState>) -> Result<(), String> {
    let mut conn = state.db.lock().map_err(|e| e.to_string())?;
    let tx = conn.transaction().map_err(|e| e.to_string())?;

    // Clear previous cache entries
    tx.execute("DELETE FROM local_license_cache", [])
        .map_err(|e| e.to_string())?;

    tx.execute(
        "INSERT INTO local_license_cache (entitlement_token, last_verified_online, offline_grace_period_days, cached_status)
         VALUES (?1, ?2, ?3, ?4)",
        params![
            record.entitlement_token,
            record.last_verified_online,
            record.offline_grace_period_days,
            record.cached_status
        ],
    )
    .map_err(|e| e.to_string())?;

    tx.commit().map_err(|e| e.to_string())?;
    Ok(())
}

pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let app_data_dir = app
                .path()
                .app_data_dir()
                .unwrap_or_else(|_| PathBuf::from("./jerseystudio_data"));

            let db_path = app_data_dir.join("jerseystudio.db");
            let conn = db::init_db(&db_path)
                .expect("Failed to initialize JerseyStudio local SQLite database");

            app.manage(AppState {
                db: Mutex::new(conn),
                db_path,
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            check_db_health,
            get_projects,
            create_project,
            get_project,
            get_design_elements,
            save_design_elements,
            get_local_setting,
            set_local_setting,
            get_license_cache,
            set_license_cache,
            get_offline_auth_status,
            save_entitlement_token,
            clear_local_license
        ])
        .run(tauri::generate_context!())
        .expect("error while running JerseyStudio desktop application");
}
