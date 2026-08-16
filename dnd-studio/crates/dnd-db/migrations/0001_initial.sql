-- ============================================
-- DndStudio v1.1 Final MVP Schema
-- ============================================

-- Метаданные кампании
CREATE TABLE campaign_meta (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

-- Пользователи
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('gm', 'co_gm', 'player', 'spectator')),
    settings_json TEXT,
    created_at INTEGER NOT NULL,
    version INTEGER NOT NULL DEFAULT 0
);

-- Активы
CREATE TABLE assets (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL CHECK(type IN ('map', 'token', 'portrait', 'audio', 'icon')),
    filename TEXT NOT NULL,
    content_hash TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    size_bytes INTEGER NOT NULL,
    width INTEGER,
    height INTEGER,
    thumb_filename TEXT,
    created_at INTEGER NOT NULL,
    UNIQUE(type, content_hash)
);

-- Миры
CREATE TABLE worlds (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    version INTEGER NOT NULL DEFAULT 0
);

-- Карты
CREATE TABLE maps (
    id TEXT PRIMARY KEY,
    world_id TEXT NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    asset_id TEXT REFERENCES assets(id),
    grid_size INTEGER DEFAULT 50,
    grid_offset_x REAL DEFAULT 0,
    grid_offset_y REAL DEFAULT 0,
    scale REAL DEFAULT 1.0,
    fog_data BLOB,
    image_path TEXT,
    width INTEGER NOT NULL,
    height INTEGER NOT NULL,
    sort_order INTEGER DEFAULT 0,
    is_visible_to_players BOOLEAN DEFAULT 0,
    version INTEGER NOT NULL DEFAULT 0
);

-- Персонажи
CREATE TABLE characters (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('pc', 'npc', 'monster')),
    sheet_template_id TEXT,
    data_json TEXT NOT NULL,
    owner_id TEXT REFERENCES users(id),
    portrait_asset_id TEXT REFERENCES assets(id),
    status TEXT NOT NULL DEFAULT 'active'
        CHECK(status IN ('draft', 'pending_approval', 'active', 'archived')),
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    version INTEGER NOT NULL DEFAULT 0
);

-- Токены
CREATE TABLE tokens (
    id TEXT PRIMARY KEY,
    map_id TEXT NOT NULL REFERENCES maps(id) ON DELETE CASCADE,
    character_id TEXT REFERENCES characters(id) ON DELETE SET NULL,
    asset_id TEXT REFERENCES assets(id),
    x REAL NOT NULL,
    y REAL NOT NULL,
    rotation REAL DEFAULT 0,
    scale REAL DEFAULT 1.0,
    is_visible BOOLEAN DEFAULT 1,
    layer TEXT DEFAULT 'default'
        CHECK(layer IN ('background', 'default', 'foreground', 'ui')),
    version INTEGER NOT NULL DEFAULT 0
);

-- Журнал
CREATE TABLE journal_entries (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content_markdown TEXT NOT NULL,
    folder_path TEXT DEFAULT '/',
    sort_order INTEGER DEFAULT 0,
    visibility TEXT NOT NULL DEFAULT 'gm_only'
        CHECK(visibility IN ('gm_only', 'players', 'public')),
    players_can_edit BOOLEAN NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    version INTEGER NOT NULL DEFAULT 0
);

-- Связи журнала (граф)
CREATE TABLE journal_links (
    id TEXT PRIMARY KEY,
    source_entry_id TEXT NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
    target_type TEXT NOT NULL,
    target_id TEXT NOT NULL,
    link_type TEXT NOT NULL DEFAULT 'reference',
    is_directed BOOLEAN DEFAULT 1,
    weight REAL DEFAULT 1.0,
    label TEXT,
    metadata_json TEXT,
    is_visible_to_players BOOLEAN DEFAULT 0,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
);

-- Компендии
CREATE TABLE compendiums (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    source_plugin_id TEXT,
    type TEXT NOT NULL,
    version TEXT NOT NULL DEFAULT '1.0.0'
);

CREATE TABLE compendium_entries (
    id TEXT PRIMARY KEY,
    compendium_id TEXT NOT NULL REFERENCES compendiums(id) ON DELETE CASCADE,
    entry_key TEXT NOT NULL,
    name TEXT NOT NULL,
    data_json TEXT NOT NULL,
    UNIQUE(compendium_id, entry_key)
);

-- Плагины
CREATE TABLE installed_plugins (
    plugin_id TEXT PRIMARY KEY,
    version TEXT NOT NULL,
    is_active BOOLEAN DEFAULT 1,
    config_json TEXT,
    installed_at INTEGER NOT NULL,
    compat_warning TEXT
);

-- Сессии мультиплеера
CREATE TABLE sessions (
    id TEXT PRIMARY KEY,
    created_by TEXT NOT NULL REFERENCES users(id),
    access_code_hash TEXT,
    max_players INTEGER DEFAULT 10,
    is_active BOOLEAN DEFAULT 1,
    created_at INTEGER NOT NULL
);

-- Состояние сессии
CREATE TABLE session_state (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

-- Индексы
CREATE INDEX idx_maps_world_id ON maps(world_id);
CREATE INDEX idx_maps_asset_id ON maps(asset_id);
CREATE INDEX idx_tokens_map_id ON tokens(map_id);
CREATE INDEX idx_tokens_character_id ON tokens(character_id);
CREATE INDEX idx_tokens_asset_id ON tokens(asset_id);
CREATE INDEX idx_characters_owner_id ON characters(owner_id);
CREATE INDEX idx_characters_status ON characters(status);
CREATE INDEX idx_journal_links_source_entry_id ON journal_links(source_entry_id);
CREATE INDEX idx_compendium_entries_compendium_id ON compendium_entries(compendium_id);
CREATE INDEX idx_assets_type_hash ON assets(type, content_hash);
CREATE INDEX idx_sessions_created_by ON sessions(created_by);