#!/usr/bin/env python3
import os
import sys
import json
import glob
import shutil

REPO_DIR = os.path.dirname(os.path.abspath(__file__))
CONFIG_FILE = os.path.join(REPO_DIR, "tracked-files.json")

def load_config():
    if not os.path.exists(CONFIG_FILE):
        print(f"Error: Config file not found at {CONFIG_FILE}")
        sys.exit(1)
    with open(CONFIG_FILE, "r") as f:
        return json.load(f)

def restore_entry(entry):
    label = entry.get("label", "unnamed")
    raw_dest = entry.get("file_path", "")
    target_dir_name = entry.get("target_dir", "files")

    source_dir = os.path.join(REPO_DIR, target_dir_name)
    if not os.path.exists(source_dir):
        print(f"  ⚠️  Repo directory does not exist: {target_dir_name} (label: {label})")
        return 0

    expanded_dest = os.path.expanduser(raw_dest)
    files_in_repo = [os.path.join(source_dir, f) for f in os.listdir(source_dir) if os.path.isfile(os.path.join(source_dir, f))]

    if not files_in_repo:
        print(f"  ⚠️  No files found in repo directory: {target_dir_name}")
        return 0

    restored_count = 0

    # Case 1: Destination is wildcard pattern or directory structure
    if "*" in raw_dest or "?" in raw_dest:
        dest_dir = os.path.dirname(expanded_dest)
        os.makedirs(dest_dir, exist_ok=True)
        pattern = os.path.basename(raw_dest).replace("*", ".*").replace("?", ".")
        import re
        regex = re.compile(f"^{pattern}$")

        for src in files_in_repo:
            fname = os.path.basename(src)
            if regex.match(fname):
                target_file = os.path.join(dest_dir, fname)
                shutil.copy2(src, target_file)
                print(f"  ✓ [{label}] {os.path.relpath(src, REPO_DIR)}  --->  {target_file}")
                restored_count += 1

    # Case 2: Destination is a single explicit file path
    else:
        dest_dir = os.path.dirname(expanded_dest)
        os.makedirs(dest_dir, exist_ok=True)
        fname = os.path.basename(expanded_dest)
        src_file = os.path.join(source_dir, fname)

        if not os.path.exists(src_file) and files_in_repo:
            src_file = files_in_repo[0] # Fallback if single file in dir

        if os.path.exists(src_file):
            shutil.copy2(src_file, expanded_dest)
            print(f"  ✓ [{label}] {os.path.relpath(src_file, REPO_DIR)}  --->  {expanded_dest}")
            restored_count += 1

    return restored_count

def main():
    args = sys.argv[1:]
    target_arg = args[0] if len(args) > 0 else "."

    config = load_config()
    print("📥 Starting File Restoration...")

    total_restored = 0
    if target_arg in [".", "all", "*"]:
        for entry in config:
            total_restored += restore_entry(entry)
    else:
        matched_labels = [e for e in config if e.get("label") == target_arg]
        if matched_labels:
            for entry in matched_labels:
                total_restored += restore_entry(entry)
        else:
            print(f"⚠️ Label '{target_arg}' not found in {CONFIG_FILE}")

    if total_restored > 0:
        print(f"\n✨ Restored {total_restored} file(s) successfully!")
    else:
        print("ℹ️ No files were restored.")

if __name__ == "__main__":
    main()
