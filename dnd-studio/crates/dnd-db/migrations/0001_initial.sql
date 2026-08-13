CREATE TABLE campaign_meta (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

CREATE TABLE users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('gm', 'player')),
    settings_json TEXT,
    created_at INTEGER NOT NULL
);

CREATE TABLE worlds (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0
);

CREATE TABLE maps (
    id TEXT PRIMARY KEY,
    world_id TEXT NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    image_path TEXT NOT NULL,
    grid_size INTEGER DEFAULT 50,
    fog_data BLOB,
    width INTEGER NOT NULL,
    height INTEGER NOT NULL
);

CREATE TABLE characters (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('pc', 'npc', 'monster')),
    sheet_template_id TEXT,
    data_json TEXT NOT NULL,
    owner_id TEXT REFERENCES users(id)
);

CREATE TABLE tokens (
    id TEXT PRIMARY KEY,
    map_id TEXT NOT NULL REFERENCES maps(id) ON DELETE CASCADE,
    character_id TEXT REFERENCES characters(id) ON DELETE SET NULL,
    x REAL NOT NULL,
    y REAL NOT NULL,
    rotation REAL DEFAULT 0,
    is_visible BOOLEAN DEFAULT 1
);

CREATE TABLE journal_entries (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content_markdown TEXT NOT NULL,
    folder_path TEXT DEFAULT '/',
    is_visible_to_players BOOLEAN DEFAULT 0
);

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
    is_visible_to_players BOOLEAN DEFAULT 0
);

CREATE TABLE compendiums (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    source_plugin_id TEXT,
    type TEXT NOT NULL
);

CREATE TABLE compendium_entries (
    id TEXT PRIMARY KEY,
    compendium_id TEXT NOT NULL REFERENCES compendiums(id) ON DELETE CASCADE,
    entry_key TEXT NOT NULL,
    name TEXT NOT NULL,
    data_json TEXT NOT NULL,
    UNIQUE(compendium_id, entry_key)
);

CREATE TABLE installed_plugins (
    plugin_id TEXT PRIMARY KEY,
    version TEXT NOT NULL,
    is_active BOOLEAN DEFAULT 1,
    config_json TEXT
);

CREATE INDEX idx_maps_world_id ON maps(world_id);
CREATE INDEX idx_tokens_map_id ON tokens(map_id);
CREATE INDEX idx_tokens_character_id ON tokens(character_id);
CREATE INDEX idx_characters_owner_id ON characters(owner_id);
CREATE INDEX idx_journal_links_source_entry_id ON journal_links(source_entry_id);
CREATE INDEX idx_compendium_entries_compendium_id ON compendium_entries(compendium_id);