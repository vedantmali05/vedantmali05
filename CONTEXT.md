# Technical Context & System Specification

## System Architecture

### Configuration Tracking & Sync Engine
- **Configuration Registry**: `tracked-files.json`
- **Sync Command**: `sync.sh` (wraps `sync.py`)
- **Restore Command**: `restore.sh` (wraps `restore.py`)
- **Usage Guide**: `USAGE.md`

### Tracked Assets & Target Locations
- Shell Configurations: `~/.bashrc` -> `dotfiles/bashrc`

## System Environment
- **OS**: Linux
- **Shell**: Bash (`~/.bashrc`)
- **Python**: Python 3.x
- **Git Remote**: `origin main`
