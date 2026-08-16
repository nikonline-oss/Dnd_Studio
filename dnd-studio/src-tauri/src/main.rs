#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod state;

use commands::campaign::{
    close_campaign, create_campaign, get_active_campaign, list_campaigns, open_campaign,
};
use commands::campaign_io::{export_campaign, import_campaign};
use commands::characters::{create_character, get_character, list_characters, update_character};
use commands::compendiums::{
    create_compendium, create_compendium_entry, delete_compendium, delete_compendium_entry,
    list_compendium_entries, list_compendiums, update_compendium, update_compendium_entry,
};
use commands::journal::{
    create_journal_entry, delete_journal_entry, get_journal_entry, list_journal_entries,
    update_journal_entry, list_journal_links, create_journal_link, delete_journal_link
};
use commands::maps::{
    create_map, get_map, import_map_image, list_maps, read_campaign_asset_data_url, update_map_fog,
};
use commands::plugins::{
    get_plugin_sheet, get_plugin_theme_css, install_plugin_from_file, list_installed_plugins,
    list_plugin_sheets, list_plugin_themes, set_plugin_active, uninstall_plugin, list_link_types,
    install_builtin_plugin
};
use commands::tokens::{
    assign_token_character, create_token, delete_token, list_tokens, move_token,
};
use commands::assets::{
    import_asset,
    get_asset_file_path,
    get_asset_thumb_path,
    get_asset_data_url,
    delete_asset,
    list_assets,
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
            create_character,
            list_characters,
            create_journal_entry,
            list_journal_entries,
            get_journal_entry,
            update_journal_entry,
            delete_journal_entry,
            get_character,
            update_character,
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
            let campaigns_dir = data_dir.join("campaigns");
            std::fs::create_dir_all(&campaigns_dir)?;

            let index_file = data_dir.join("campaign-index.json");

            app.manage(AppPaths {
                data_dir,
                campaigns_dir,
                index_file,
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running DndStudio");
}
