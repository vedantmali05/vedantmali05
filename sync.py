#!/usr/bin/env python3
import os
import sys
import json
import glob
import shutil
import subprocess
from datetime import datetime

REPO_DIR = os.path.dirname(os.path.abspath(__file__))
CONFIG_FILE = os.path.join(REPO_DIR, "tracked-files.json")

def run_cmd(cmd, cwd=REPO_DIR):
    result = subprocess.run(cmd, shell=True, cwd=cwd, text=True, capture_output=True)
    return result.returncode, result.stdout.strip(), result.stderr.strip()

def load_config():
    if not os.path.exists(CONFIG_FILE):
        print(f"Error: Config file not found at {CONFIG_FILE}")
        sys.exit(1)
    with open(CONFIG_FILE, "r") as f:
        return json.load(f)

def sync_entry(entry):
    label = entry.get("label", "unnamed")
    raw_path = entry.get("file_path", "")
    target_dir_name = entry.get("target_dir", "files")

    expanded_path = os.path.expanduser(raw_path)
    dest_dir = os.path.join(REPO_DIR, target_dir_name)
    os.makedirs(dest_dir, exist_ok=True)

    matched_files = glob.glob(expanded_path)
    if not matched_files:
        print(f"  ⚠️  No files found matching: {raw_path} (label: {label})")
        return 0

    copied_count = 0
    for src in matched_files:
        if os.path.isfile(src):
            fname = os.path.basename(src)
            dest = os.path.join(dest_dir, fname)
            shutil.copy2(src, dest)
            print(f"  ✓ [{label}] {src}  --->  {os.path.relpath(dest, REPO_DIR)}")
            copied_count += 1
    return copied_count

def sync_custom_path(path_arg, target_dir="custom-files"):
    expanded_path = os.path.expanduser(path_arg)
    dest_dir = os.path.join(REPO_DIR, target_dir)
    os.makedirs(dest_dir, exist_ok=True)

    matched = glob.glob(expanded_path)
    if not matched:
        print(f"  ⚠️  File or pattern not found: {path_arg}")
        return 0

    count = 0
    for src in matched:
        if os.path.isfile(src):
            fname = os.path.basename(src)
            dest = os.path.join(dest_dir, fname)
            shutil.copy2(src, dest)
            print(f"  ✓ [custom] {src}  --->  {os.path.relpath(dest, REPO_DIR)}")
            count += 1
    return count

def main():
    args = sys.argv[1:]
    target_arg = args[0] if len(args) > 0 else "."

    config = load_config()
    print("🔄 Starting Config Sync...")

    total_synced = 0
    if target_arg in [".", "all", "*"]:
        for entry in config:
            total_synced += sync_entry(entry)
    else:
        # Check if target_arg matches any label
        matched_labels = [e for e in config if e.get("label") == target_arg]
        if matched_labels:
            for entry in matched_labels:
                total_synced += sync_entry(entry)
        else:
            # Treat as arbitrary file path
            total_synced += sync_custom_path(target_arg)

    if total_synced == 0:
        print("ℹ️  No files were synced.")
        return

    # Check git status
    code, status_out, _ = run_cmd("git status --porcelain")
    if not status_out:
        print("✨ Repo is already up to date. Nothing to commit.")
        return

    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    commit_msg = f"Auto-sync [{target_arg}]: {timestamp}"

    print(f"\n📦 Committing & Pushing changes to GitHub...")
    run_cmd("git add .")
    code, commit_out, commit_err = run_cmd(f'git commit -m "{commit_msg}"')
    if code != 0 and "nothing to commit" not in commit_out:
        print(f"Error committing: {commit_err}")
        return

    code, push_out, push_err = run_cmd("git push origin main")
    if code == 0:
        print("🚀 Successfully synced and pushed to GitHub!")
    else:
        print(f"❌ Git push failed:\n{push_err}")

if __name__ == "__main__":
    main()
