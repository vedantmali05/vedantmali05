# 🛠️ Central Config & AI Agent System Guide (`USAGE.md`)

This repository (`vedantmali05/vedantmali05`) serves as a central hub for essential developer configurations, AI agent scaffolding templates, and dotfiles backup across devices.

---

## 🤖 General-Purpose AI Agent System Scaffolding

This repo houses a plug-and-play **AI Agent System** ([AGENTS.md](AGENTS.md) and [.agents/](.agents/)) that can be copied directly into any new project repository.

### How to Scaffold a New Project
1. **Copy Agent Files**: Copy `AGENTS.md` and the `.agents/` folder into your target project directory.
2. **First Session Auto-Init**: On the first session in the new project, the AI agent will inspect the workspace (e.g. `package.json`, root files, directory layout, git remotes, and framework configs) and automatically populate placeholders (`<PROJECT_NAME>`, `<TECH_STACK>`, `<ARCH_OVERVIEW>`).

### Standard Modular Engineering Roles (`/role <name>`)
- `role-legacy-killer`: Legacy code migration & modernization specialist.
- `role-code-refactorer`: Code refactoring & styling standardization specialist.
- `role-code-sanitizer`: Code cleanup, formatting & optimization specialist.
- `role-component-architect`: Reusable UI component architect & developer.
- `role-ui-polish`: Visual polish & aesthetic specialist.
- `role-api-refactorer`: API service architecture & integration specialist.

### Workflow Signals
- `/discuss`: Low-token caveman mode discussion only. Zero code file touches.
- `/plan`: Write plan/todos to `todos-mini.md` or role `todos.md` without executing code.
- `/remember <instruction>` or **"remember"**: Append a dated rule to `## Remember` in `.agents/identity.md`.
- `/review <file>`: Audit target file against role checklist. Output issues only — no code edits.
- `/status`: Output concise roll-up of active tasks across `todos-mini.md` and role `todos.md` files.
- `/role <name>`: Explicitly switch active persona.
- **"sync"**: Review conversation and update `.agents/` context files.

---

## 🗂️ Tracked Configuration (`tracked-files.json`)

All tracked file paths are defined in `tracked-files.json` in the root directory:

```json
[
  {
    "label": "bashrc",
    "file_path": "~/.bashrc",
    "target_dir": "dotfiles"
  },
  {
    "label": "agent-skills",
    "file_path": "./.agents/skill-*.md",
    "target_dir": ".agents"
  },
  {
    "label": "agent-mcps",
    "file_path": "./.agents/mcp-*.md",
    "target_dir": ".agents"
  }
]
```

### Adding New Files in the Future
To track a new file or directory, simply open `tracked-files.json` and add a new entry:
```json
{
  "label": "my-config",
  "file_path": "~/.config/my-app/config.json",
  "target_dir": "my-app-config"
}
```
*No code modifications needed! The sync and restore scripts read `tracked-files.json` dynamically on every execution.*

---

## 🔄 How to Sync Files to GitHub

You can run the sync script anytime to copy updated local files into the repository and automatically commit & push them to GitHub.

### 1. Sync ALL Tracked Files (Default)
Run either of the following commands:
```bash
./sync.sh .
# OR
./sync.sh
# OR using the bash alias:
sync-repo
```

### 2. Sync a Specific Label Only
```bash
./sync.sh bashrc
# OR
./sync.sh agent-skills
# OR
./sync.sh agent-mcps
```

### 3. Sync any Custom File (Ad-hoc)
```bash
./sync.sh /path/to/any/file.txt
```

---

## 📥 How to Restore / Pull Files back to Local Folders

If you set up a new machine or need to restore files back to your system, run `restore.sh`.

### 1. Restore ALL Files
```bash
./restore.sh .
# OR
./restore.sh
```
*This reads `tracked-files.json` and copies files from the repository back to their local destination paths.*

### 2. Restore a Specific Label Only
```bash
./restore.sh bashrc
# OR
./restore.sh agent-skills
# OR
./restore.sh agent-mcps
```

---

## ⚙️ Terminal Alias (`~/.bashrc`)

An alias is configured in your `~/.bashrc` for quick access from any terminal directory:

```bash
alias sync-repo="/home/vedant/Projects/vedantmali05/sync.sh"
```

Simply type `sync-repo` in your terminal anytime you want to review and sync your files!
