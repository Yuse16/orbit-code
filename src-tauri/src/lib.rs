use serde::Serialize;
use std::fs;
use std::path::Path;
use std::time::{SystemTime, UNIX_EPOCH};
use tauri_plugin_dialog::DialogExt;

const MAX_DEPTH: usize = 8;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct WorkspaceIndexNode {
    id: String,
    name: String,
    path: String,
    #[serde(rename = "type")]
    node_type: String,
    ext: Option<String>,
    children: Option<Vec<WorkspaceIndexNode>>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct WorkspaceIndexSnapshot {
    root: String,
    nodes: Vec<WorkspaceIndexNode>,
    folder_count: usize,
    file_count: usize,
    depth: usize,
    indexed_at: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct WorkspaceOpenResult {
    root: String,
    project_name: String,
    index: WorkspaceIndexSnapshot,
}

fn ignored_directory(name: &str) -> bool {
    matches!(
        name,
        ".git" | ".next" | "node_modules" | "target" | "dist" | "build" | ".turbo"
    )
}

fn extension(name: &str) -> Option<String> {
    let value = Path::new(name).extension()?.to_str()?.to_string();
    (!value.is_empty()).then_some(value)
}

fn read_nodes(
    directory: &Path,
    relative_parent: &str,
    depth: usize,
    counts: &mut (usize, usize, usize),
) -> Result<Vec<WorkspaceIndexNode>, String> {
    let mut entries = fs::read_dir(directory)
        .map_err(|error| format!("No se pudo leer {}: {error}", directory.display()))?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|error| format!("No se pudo enumerar {}: {error}", directory.display()))?;
    entries.sort_by_key(|entry| entry.file_name());

    let mut nodes = Vec::new();
    for entry in entries {
        let name = entry.file_name().to_string_lossy().into_owned();
        if name.starts_with('.') && name != ".env" {
            continue;
        }
        let path = entry.path();
        let relative = if relative_parent.is_empty() {
            name.clone()
        } else {
            format!("{relative_parent}/{name}")
        };
        let metadata = fs::symlink_metadata(&path)
            .map_err(|error| format!("No se pudo inspeccionar {}: {error}", path.display()))?;
        if metadata.file_type().is_symlink() {
            continue;
        }

        if metadata.is_dir() {
            if ignored_directory(&name) || depth >= MAX_DEPTH {
                continue;
            }
            let children = read_nodes(&path, &relative, depth + 1, counts)?;
            counts.0 += 1;
            counts.2 = counts.2.max(depth + 1);
            nodes.push(WorkspaceIndexNode {
                id: relative.clone(),
                name,
                path: relative,
                node_type: "folder".to_string(),
                ext: None,
                children: Some(children),
            });
        } else if metadata.is_file() {
            counts.1 += 1;
            counts.2 = counts.2.max(depth + 1);
            nodes.push(WorkspaceIndexNode {
                id: relative.clone(),
                name: name.clone(),
                path: relative,
                node_type: "file".to_string(),
                ext: extension(&name),
                children: None,
            });
        }
    }
    Ok(nodes)
}

#[tauri::command]
async fn open_folder(app: tauri::AppHandle) -> Result<Option<WorkspaceOpenResult>, String> {
    let Some(file_path) = app.dialog().file().blocking_pick_folder() else {
        return Ok(None);
    };
    let root = file_path
        .into_path()
        .map_err(|error| format!("Ruta de proyecto inválida: {error}"))?;
    let project_name = root
        .file_name()
        .and_then(|name| name.to_str())
        .unwrap_or("Proyecto")
        .to_string();
    let mut counts = (0, 0, 0);
    let nodes = read_nodes(&root, "", 0, &mut counts)?;
    let indexed_at = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_err(|error| format!("Reloj del sistema inválido: {error}"))?
        .as_secs()
        .to_string();

    Ok(Some(WorkspaceOpenResult {
        root: root.to_string_lossy().into_owned(),
        project_name,
        index: WorkspaceIndexSnapshot {
            root: root.to_string_lossy().into_owned(),
            nodes,
            folder_count: counts.0,
            file_count: counts.1,
            depth: counts.2,
            indexed_at,
        },
    }))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![open_folder])
        .run(tauri::generate_context!())
        .expect("error while running Orbit Code");
}
