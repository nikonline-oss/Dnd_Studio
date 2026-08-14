#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod state;

use commands::campaign::{
    close_campaign, create_campaign, get_active_campaign, list_campaigns, open_campaign,
};
use commands::maps::{create_map, list_maps, get_map, import_map_image, read_campaign_asset_data_url};
use commands::tokens::{
    create_token,
    delete_token,
    list_tokens,
    move_token,
    assign_token_character,
};
use commands::characters::{create_character, list_characters, get_character, update_character};
use commands::journal::{
    create_journal_entry,
    delete_journal_entry,
    get_journal_entry,
    list_journal_entries,
    update_journal_entry,
};
use state::{AppPaths, AppState};
use tauri::Manager;
use specta_typescript::Typescript;

pub struct Commands;

fn main() {
    let builder = tauri_specta::Builder::<tauri::Wry>::new()
    .commands(tauri_specta::collect_commands![
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
