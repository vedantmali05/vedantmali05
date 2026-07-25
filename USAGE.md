# 🛠️ Important Files Sync & Backup Guide (`USAGE.md`)

This repository (`vedantmali05/vedantmali05`) is configured to store, backup, and restore important configuration files, dotfiles, and agent skills across your devices.

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
    "label": "coexio-skills",
    "file_path": "~/Projects/coexio/.agents/skill-*.md",
    "target_dir": "coexio-agents"
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
./sync.sh coexio-skills
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
*This reads `tracked-files.json` and copies files from the repository back to their local destination paths (e.g. `dotfiles/.bashrc` -> `~/.bashrc`).*

### 2. Restore a Specific Label Only
```bash
./restore.sh bashrc
# OR
./restore.sh coexio-skills
```

---

## ⚙️ Terminal Alias (`~/.bashrc`)

An alias is configured in your `~/.bashrc` for quick access from any terminal directory:

```bash
alias sync-repo="/home/vedant/Projects/vedantmali05/sync.sh"
```

Simply type `sync-repo` in your terminal anytime you want to review and sync your files!
