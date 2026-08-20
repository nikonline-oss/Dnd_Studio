#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod state;

use commands::assets::{
    delete_asset, get_asset_data_url, get_asset_file_path, get_asset_thumb_path, import_asset,
    list_assets, read_campaign_asset_data_url, read_file_as_data_url,
};
use commands::campaign::{
    close_campaign, create_campaign, delete_campaign, get_active_campaign, get_campaign_assets_dir,
    list_campaigns, open_campaign, rename_campaign,
};
use commands::campaign_io::{
    delete_multiplayer_session, delete_temp_file, export_campaign, export_campaign_to_temp,
    export_campaign_zip_to_temp, import_campaign, list_multiplayer_sessions,
    open_multiplayer_campaign, read_file_bytes, save_multiplayer_campaign,
    save_multiplayer_campaign_zip, update_multiplayer_session,
};
use commands::characters::{
    create_character, delete_character, get_character, list_characters, update_character,
};
use commands::compendiums::{
    create_compendium, create_compendium_entry, delete_compendium, delete_compendium_entry,
    list_compendium_entries, list_compendiums, update_compendium, update_compendium_entry,
};
use commands::journal::{
    create_journal_entry, create_journal_link, delete_journal_entry, delete_journal_link,
    get_journal_entry, list_journal_entries, list_journal_links, update_journal_entry,
};
use commands::maps::{
    create_map, delete_map, get_active_scene, get_map, import_map_image, list_maps, set_active_scene,
    set_map_visible_to_players, sync_active_scene, sync_map_visibility, update_map_fog,
};
use commands::plugin_deps::{
    can_deactivate_plugin, can_uninstall_plugin, validate_plugin_dependencies,
};
use commands::plugins::{
    get_plugin_sheet, get_plugin_theme_css, install_builtin_plugin, install_plugin_from_file,
    list_installed_plugins, list_link_types, list_plugin_sheets, list_plugin_themes,
    set_plugin_active, uninstall_plugin,
};
use commands::profiles::{create_profile, delete_profile, list_profiles, touch_profile};
use commands::tokens::{
    assign_token_character, create_token, delete_token, list_all_tokens, list_tokens, move_token,
};
use specta_typescript::Typescript;
use state::{AppPaths, AppState};
use tauri::Manager;

pub struct Commands;

fn main() {
    let builder =
        tauri_specta::Builder::<tauri::Wry>::new().commands(tauri_specta::collect_commands![
            create_campaign,
            list_campaigns,
            open_campaign,
            close_campaign,
            get_active_campaign,
            create_map,
            list_maps,
            get_map,
            create_token,
            list_tokens,
            move_token,
            delete_token,
            assign_token_character,
            list_all_tokens,
            create_character,
            list_characters,
            create_journal_entry,
            list_journal_entries,
            get_journal_entry,
            update_journal_entry,
            delete_journal_entry,
            get_character,
            update_character,
            delete_character,
            import_map_image,
            read_campaign_asset_data_url,
            update_map_fog,
            list_compendiums,
            list_compendium_entries,
            create_compendium,
            create_compendium_entry,
            update_compendium,
            delete_compendium,
            update_compendium_entry,
            delete_compendium_entry,
            export_campaign,
            import_campaign,
            install_plugin_from_file,
            list_installed_plugins,
            set_plugin_active,
            uninstall_plugin,
            get_plugin_sheet,
            list_plugin_sheets,
            list_plugin_themes,
            get_plugin_theme_css,
            list_link_types,
            list_journal_links,
            create_journal_link,
            delete_journal_link,
            install_builtin_plugin,
            import_asset,
            get_asset_file_path,
            get_asset_thumb_path,
            get_asset_data_url,
            delete_asset,
            list_assets,
            read_file_as_data_url,
            validate_plugin_dependencies,
            can_deactivate_plugin,
            can_uninstall_plugin,
            export_campaign_to_temp,
            read_file_bytes,
            delete_temp_file,
            delete_multiplayer_session,
            list_multiplayer_sessions,
            update_multiplayer_session,
            save_multiplayer_campaign,
            open_multiplayer_campaign,
            create_profile,
            delete_profile,
            list_profiles,
            touch_profile,
            get_campaign_assets_dir,
            rename_campaign,
            delete_campaign,
            export_campaign_zip_to_temp,
            save_multiplayer_campaign_zip,
            set_map_visible_to_players,
            set_active_scene,
            delete_map,
            get_active_scene,
            sync_map_visibility,
            sync_active_scene,
        ]);

    #[cfg(debug_assertions)]
    {
        let export_path =
            std::path::Path::new(env!("CARGO_MANIFEST_DIR")).join("../src/shared/api/bindings.ts");

        if let Err(err) = builder.export(Typescript::default(), &export_path) {
            eprintln!("Failed to export specta types: {err}");
        }
    }

    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(builder.invoke_handler())
        .manage(AppState::default())
        .setup(|app| {
            let data_dir = app.path().app_data_dir()?;

            let paths = AppPaths::new(data_dir);

            app.manage(paths);

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running DndStudio");
}
