#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod state;

use commands::campaign::{
    close_campaign, create_campaign, get_active_campaign, list_campaigns, open_campaign,
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
        get_active_campaign
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
