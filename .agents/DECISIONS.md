# Architectural & Design Decisions

## Decision Log

### 1. Centralized Configuration Sync Engine
- **Date**: 2026-09-24
- **Context**: Needed a flexible, lightweight system to sync dotfiles and developer configurations without heavy external dependencies.
- **Decision**: Implemented `tracked-files.json` paired with Python (`sync.py`, `restore.py`) and Bash wrapper scripts (`sync.sh`, `restore.sh`).
- **Status**: Active

### 2. Streamlined Project Context Architecture
- **Date**: 2026-09-24
- **Context**: Replaced legacy role/skill `.agents/` structure with root-level uppercase context files (`IDENTITY.md`, `DECISIONS.md`, `CONTEXT.md`, `AGENTS.md`).
- **Decision**: Maintain high-level project metadata, architectural decisions, and technical context directly in root Markdown files for simple accessibility and clear governance.
- **Status**: Active
