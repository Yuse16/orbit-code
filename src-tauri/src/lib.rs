use serde::Serialize;
use std::fs;
use std::path::Path;
use std::process::{Command, Stdio};
use std::time::{Duration, Instant, SystemTime, UNIX_EPOCH};
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
    stack: WorkspaceStack,
    package_json: Option<PackageManifest>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct WorkspaceStack {
    framework: String,
    language: String,
    package_manager: String,
    build_system: String,
    confidence: f32,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct PackageManifest {
    name: Option<String>,
    version: Option<String>,
    scripts: Vec<String>,
    dependency_count: usize,
    dev_dependency_count: usize,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct GitChange {
    status: String,
    path: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct GitStatusResult {
    branch: String,
    worktree: String,
    status: String,
    pending_changes: usize,
    last_summary: String,
    changes: Vec<GitChange>,
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

fn stack_signal(name: &str, is_directory: bool) -> bool {
    is_directory && matches!(name, "src-tauri" | "app" | "pages")
        || !is_directory
            && (matches!(
                name,
                "package.json"
                    | "Cargo.toml"
                    | "tsconfig.json"
                    | "pnpm-lock.yaml"
                    | "pnpm-workspace.yaml"
                    | "package-lock.json"
                    | "yarn.lock"
                    | "bun.lockb"
                    | "vite.config.ts"
                    | "vite.config.js"
                    | "next.config.ts"
                    | "next.config.js"
                    | "astro.config.ts"
                    | "nuxt.config.ts"
                    | "angular.json"
            ) || name.starts_with("next.config.")
                || name.starts_with("vite.config."))
}

fn detect_stack(signals: &[String]) -> WorkspaceStack {
    let has = |name: &str| signals.iter().any(|signal| signal == name);
    let has_prefix = |prefix: &str| signals.iter().any(|signal| signal.starts_with(prefix));
    let framework = if has_prefix("next.config.") {
        "next"
    } else if has_prefix("vite.config.") {
        "vite"
    } else if has_prefix("astro.config.") {
        "astro"
    } else if has_prefix("nuxt.config.") {
        "nuxt"
    } else if has("angular.json") {
        "angular"
    } else if has("src-tauri") {
        "tauri"
    } else if has("Cargo.toml") {
        "cargo"
    } else if has("package.json") {
        "node"
    } else {
        "unknown"
    };
    let language = if has("Cargo.toml") {
        "rust"
    } else if has("tsconfig.json") {
        "typescript"
    } else if has("package.json") {
        "javascript"
    } else {
        "unknown"
    };
    let package_manager = if has("pnpm-lock.yaml") || has("pnpm-workspace.yaml") {
        "pnpm"
    } else if has("yarn.lock") {
        "yarn"
    } else if has("bun.lockb") {
        "bun"
    } else if has("package-lock.json") {
        "npm"
    } else if has("Cargo.toml") {
        "cargo"
    } else {
        "unknown"
    };
    let build_system = if has_prefix("next.config.") {
        "next"
    } else if has_prefix("vite.config.") {
        "vite"
    } else if has("Cargo.toml") {
        "cargo"
    } else if has("package.json") {
        "node"
    } else {
        "unknown"
    };
    let confidence = (0.25 + signals.len() as f32 * 0.08).min(1.0);
    WorkspaceStack {
        framework: framework.to_string(),
        language: language.to_string(),
        package_manager: package_manager.to_string(),
        build_system: build_system.to_string(),
        confidence,
    }
}

fn read_package_manifest(root: &Path) -> Result<Option<PackageManifest>, String> {
    let path = root.join("package.json");
    if !path.is_file() {
        return Ok(None);
    }
    let content = fs::read_to_string(&path)
        .map_err(|error| format!("No se pudo leer package.json: {error}"))?;
    let value: serde_json::Value = serde_json::from_str(&content)
        .map_err(|error| format!("package.json no es JSON válido: {error}"))?;
    let object = value
        .as_object()
        .ok_or_else(|| "package.json debe contener un objeto".to_string())?;
    let scripts = object
        .get("scripts")
        .and_then(serde_json::Value::as_object)
        .map(|scripts| scripts.keys().cloned().collect())
        .unwrap_or_default();
    let dependency_count = object
        .get("dependencies")
        .and_then(serde_json::Value::as_object)
        .map_or(0, serde_json::Map::len);
    let dev_dependency_count = object
        .get("devDependencies")
        .and_then(serde_json::Value::as_object)
        .map_or(0, serde_json::Map::len);
    Ok(Some(PackageManifest {
        name: object
            .get("name")
            .and_then(serde_json::Value::as_str)
            .map(str::to_string),
        version: object
            .get("version")
            .and_then(serde_json::Value::as_str)
            .map(str::to_string),
        scripts,
        dependency_count,
        dev_dependency_count,
    }))
}

fn read_nodes(
    directory: &Path,
    relative_parent: &str,
    depth: usize,
    counts: &mut (usize, usize, usize),
    signals: &mut Vec<String>,
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
            if relative_parent.is_empty() && stack_signal(&name, true) {
                signals.push(name.clone());
            }
            let children = read_nodes(&path, &relative, depth + 1, counts, signals)?;
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
            if relative_parent.is_empty() && stack_signal(&name, false) {
                signals.push(name.clone());
            }
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
    let mut signals = Vec::new();
    let nodes = read_nodes(&root, "", 0, &mut counts, &mut signals)?;
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
        stack: detect_stack(&signals),
        package_json: read_package_manifest(&root)?,
    }))
}

#[tauri::command]
fn git_status(root: String) -> Result<GitStatusResult, String> {
    let path = Path::new(&root);
    if !path.is_absolute() || !path.is_dir() {
        return Err("La raíz del proyecto no es válida".to_string());
    }

    let mut child = Command::new("git")
        .args(["-C", &root, "status", "--porcelain=v1", "--branch"])
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .map_err(|error| format!("No se pudo ejecutar Git: {error}"))?;
    let deadline = Instant::now() + Duration::from_secs(5);
    loop {
        if child
            .try_wait()
            .map_err(|error| format!("No se pudo consultar Git: {error}"))?
            .is_some()
        {
            break;
        }
        if Instant::now() >= deadline {
            let _ = child.kill();
            return Err("Git excedió el tiempo máximo de lectura".to_string());
        }
        std::thread::sleep(Duration::from_millis(10));
    }
    let output = child
        .wait_with_output()
        .map_err(|error| format!("No se pudo leer la salida de Git: {error}"))?;
    if !output.status.success() {
        let error = String::from_utf8_lossy(&output.stderr).trim().to_string();
        return Err(if error.is_empty() {
            "La carpeta no es un repositorio Git".to_string()
        } else {
            error
        });
    }

    let text = String::from_utf8_lossy(&output.stdout);
    let mut lines = text.lines();
    let branch_line = lines.next().unwrap_or_default();
    let branch = branch_line
        .strip_prefix("## ")
        .unwrap_or("HEAD")
        .split("...")
        .next()
        .unwrap_or("HEAD")
        .to_string();
    let mut changes = Vec::new();
    for line in lines {
        if line.len() < 4 {
            continue;
        }
        let code = &line[..2];
        let path = line[3..]
            .split(" -> ")
            .last()
            .unwrap_or(&line[3..])
            .to_string();
        let status = if code == "??" {
            "?"
        } else if code.contains('D') {
            "D"
        } else if code.contains('A') {
            "A"
        } else {
            "M"
        };
        changes.push(GitChange {
            status: status.to_string(),
            path,
        });
    }
    let pending_changes = changes.len();
    let status = if pending_changes == 0 {
        "clean"
    } else {
        "changes-pending"
    };
    let last_summary = if pending_changes == 0 {
        "Sin cambios pendientes".to_string()
    } else {
        format!("{pending_changes} cambios pendientes")
    };

    Ok(GitStatusResult {
        branch,
        worktree: root,
        status: status.to_string(),
        pending_changes,
        last_summary,
        changes,
    })
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![git_status, open_folder])
        .run(tauri::generate_context!())
        .expect("error while running Orbit Code");
}
