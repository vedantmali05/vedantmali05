# Active Sprint Tasks
> Vedant: Add ALL new tasks here. Use → role-<name> tags for routing.
> AI: Read tags, load all tagged role identity.md + context.md before working.
> Multi-role task = load all tagged role contexts.

---

## Active Tasks

- [x] **Design System Subfolder Integration (History Preserved)** → role-component-architect
  - [x] Run `git subtree add --prefix=design-system /home/vedant/Projects/design-system main` to import full history & files into `design-system/`.
  - [x] Verify commit log history inside `design-system/` subfolder (`git log --oneline -- design-system/`).
  - [x] Push merged history to GitHub `main` branch to update GitHub heatmap (`git push origin main`).
  - [x] Leave standalone repo untouched for manual verification.

- [x] **Phase 1: Agent Self-Initialization Engine (Autofill Q2)**
  - [x] Add project auto-detection & initialization protocol in `.agents/identity.md` and `AGENTS.md`.
  - [x] Instruct agent to scan repository structure, `package.json`/code files, git remote, and framework on first run to replace `<PROJECT_NAME>`, `<TECH_STACK>`, `<ARCH_OVERVIEW>`, and dev preferences automatically.

- [x] **Phase 2: Core Context Files Templatization (C1)**
  - [x] Clean `AGENTS.md`: remove "Coexio" hardcoded header and make title generic.
  - [x] Templatize `identity.md`: remove Bitrix, server `/1/`/`/2/`/`/3/` dirs, teammate names (Karan/Girish/Prashant), and current focus log.
  - [x] Templatize `context-code.md` & `context-api.md`: replace Coexio-specific API refs and mock system details with general architecture templates.

- [x] **Phase 3: Skills & `tracked-files.json` Realignment (C2)**
  - [x] Realign root `skills/` directory and `.agents/` skill files (`skill-caveman.md`, `skill-grill-me.md`, `mcp-graphify.md`).
  - [x] Update `tracked-files.json` to replace hardcoded `~/Projects/coexio/.agents/skill-*.md` paths with standard project relative pattern `.agents/skill-*.md`.

- [x] **Phase 4: Generalize All 6 Roles (C3 + Q1)**
  - [x] Preserve all 6 roles: `role-legacy-killer`, `role-code-refactorer`, `role-code-sanitizer`, `role-component-architect`, `role-ui-polish`, `role-api-refactorer`.
  - [x] Clean internal files (`identity.md`, `context.md`, `todos.md`, `review-checklist.md`) across all 6 roles to remove Coexio-specific code references while preserving role specs.

- [x] **Phase 5: Task Drivers & Workflow Signals (C4 & C5)**
  - [x] Clean `todos-mini.md` and `todos-deferred.md` into clean skeleton task drivers.
  - [x] Update signal documentation in `AGENTS.md` and `.agents/identity.md` for seamless role switching (`/role <name>`) and task management.