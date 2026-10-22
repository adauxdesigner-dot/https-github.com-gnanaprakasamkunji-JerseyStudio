-- JerseyStudio Local SQLite Database Schema
-- Strict local-first storage: all tables are strictly stored on the user's device.
-- Never synchronize, upload, or transmit any project data, roster data, or artwork.

PRAGMA foreign_keys = ON;

-- Migration tracking
CREATE TABLE IF NOT EXISTS schema_migrations (
    version INTEGER PRIMARY KEY NOT NULL,
    applied_at TEXT NOT NULL
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    garment_type TEXT NOT NULL DEFAULT 'jersey',
    canvas_width REAL NOT NULL DEFAULT 800.0,
    canvas_height REAL NOT NULL DEFAULT 1000.0,
    canvas_unit TEXT NOT NULL DEFAULT 'px',
    dpi INTEGER NOT NULL DEFAULT 300,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- Templates table
CREATE TABLE IF NOT EXISTS templates (
    id TEXT PRIMARY KEY NOT NULL,
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    front_svg TEXT NOT NULL,
    back_svg TEXT NOT NULL,
    created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_templates_project_id ON templates(project_id);

-- Design Elements table
CREATE TABLE IF NOT EXISTS design_elements (
    id TEXT PRIMARY KEY NOT NULL,
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    view TEXT NOT NULL CHECK(view IN ('front', 'back')),
    element_type TEXT NOT NULL CHECK(element_type IN ('text', 'image', 'shape', 'number', 'name')),
    x REAL NOT NULL DEFAULT 0.0,
    y REAL NOT NULL DEFAULT 0.0,
    width REAL NOT NULL DEFAULT 100.0,
    height REAL NOT NULL DEFAULT 50.0,
    rotation REAL NOT NULL DEFAULT 0.0,
    font_family TEXT,
    font_size REAL,
    fill_color TEXT,
    stroke_color TEXT,
    stroke_width REAL DEFAULT 0.0,
    text_content TEXT,
    field_binding TEXT,
    z_index INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_design_elements_project_view ON design_elements(project_id, view);

-- Roster Imports table
CREATE TABLE IF NOT EXISTS roster_imports (
    id TEXT PRIMARY KEY NOT NULL,
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    row_count INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_roster_imports_project_id ON roster_imports(project_id);

-- Roster Records table
CREATE TABLE IF NOT EXISTS roster_records (
    id TEXT PRIMARY KEY NOT NULL,
    roster_id TEXT NOT NULL REFERENCES roster_imports(id) ON DELETE CASCADE,
    row_index INTEGER NOT NULL,
    player_name TEXT NOT NULL,
    player_number TEXT NOT NULL,
    size TEXT NOT NULL,
    validation_status TEXT NOT NULL DEFAULT 'valid' CHECK(validation_status IN ('valid', 'warning', 'error')),
    validation_notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_roster_records_roster_id ON roster_records(roster_id);

-- Generated Variations table
CREATE TABLE IF NOT EXISTS generated_variations (
    id TEXT PRIMARY KEY NOT NULL,
    roster_record_id TEXT NOT NULL REFERENCES roster_records(id) ON DELETE CASCADE,
    view TEXT NOT NULL CHECK(view IN ('front', 'back')),
    output_preview_path TEXT NOT NULL,
    approval_status TEXT NOT NULL DEFAULT 'pending' CHECK(approval_status IN ('pending', 'approved', 'rejected')),
    created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_generated_variations_roster_record ON generated_variations(roster_record_id);

-- Export Jobs table
CREATE TABLE IF NOT EXISTS export_jobs (
    id TEXT PRIMARY KEY NOT NULL,
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    format TEXT NOT NULL CHECK(format IN ('png', 'pdf', 'svg', 'zip')),
    output_path TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'processing', 'completed', 'failed')),
    count INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_export_jobs_project_id ON export_jobs(project_id);

-- Local Settings key-value store (app preferences, user UI state)
CREATE TABLE IF NOT EXISTS local_settings (
    key TEXT PRIMARY KEY NOT NULL,
    value TEXT NOT NULL
);

-- Local License Cache (stores cryptographically signed entitlement and offline validity metadata)
CREATE TABLE IF NOT EXISTS local_license_cache (
    entitlement_token TEXT PRIMARY KEY NOT NULL,
    last_verified_online TEXT NOT NULL,
    offline_grace_period_days INTEGER NOT NULL DEFAULT 7,
    cached_status TEXT NOT NULL DEFAULT 'active' CHECK(cached_status IN ('active', 'grace_period', 'expired', 'revoked'))
);
