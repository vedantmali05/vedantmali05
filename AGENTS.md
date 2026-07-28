# Project Agent Entry Point

Read `.agents/identity.md` first. Everything you need to work on this project is documented there.

---

## Agent Setup & Auto-Initialization

When starting a session in a new repository or project:
1. Read `.agents/identity.md`. If project metadata or stack details contain placeholders (`<PROJECT_NAME>`, `<TECH_STACK>`, etc.), perform auto-detection by inspecting repository structure, configuration files (e.g. `package.json`, `Cargo.toml`, `pyproject.toml`, `go.mod`), git remotes, and existing files.
2. Auto-fill the project metadata in `.agents/identity.md`, `context-code.md`, and `context-api.md`.
3. Confirm the initialized configuration with the developer before proceeding with major tasks.

---

## Workflow Signals

Shorthand triggers used during chat sessions to direct agent behavior:

@AGENT: (Remove this line when in a project) "Follow these signals for the repo vedantmali05, too"

| Signal | Behavior | Touches Code Files? |
|---|---|---|
| `/discuss` | Caveman-mode discussion only. Zero file touches. | ❌ Never |
| `/plan` | Write plan/todos to relevant `todos.md` or `todos-mini.md` only. No execution. | ✅ Todos only |
| `/remember <instruction>` | Append to `## Remember` in most relevant `identity.md`. Confirm location. | ✅ Identity only |
| `/review <file>` | Audit target file against matching role's `review-checklist.md`. Output issues only — no edits. | ❌ Never |
| `/status` | Read all `todos.md` + `todos-mini.md`. Output concise progress summary per role. | ❌ Never |
| `/role <name>` | Explicitly load role identity + context + todos. Removes AI role-inference ambiguity. | ❌ Never |
| `remember` (inline) | Same as `/remember` — triggered mid-chat by keyword. | ✅ Identity only |
| `sync` (inline) | Review chat, update all relevant `.agents/` files. Confirm what was updated. | ✅ Context/identity |

### Signal Details

- **/discuss**: Strictly for alignment, design questions, or architectural brainstorming. The agent operates in low-token caveman mode and makes zero file modifications. Read ./agents/skill-caveman.md anc comeback here
- **/plan**: Analyzes requirements and drafts action items into `todos-mini.md` or a specific role's `todos.md`. Code changes are strictly forbidden during `/plan`.
- **/remember <instruction>**: Appends new developer guidelines or constraints into the `## Remember` block of the relevant `identity.md` file with a dated timestamp.
- **/review <file>**: Runs a pre-ship code review on the specified file using the checklists defined in the relevant role directory. Returns pass/fail items without modifying code.
- **/status**: Provides a quick roll-up of pending and completed tasks across `todos-mini.md` and role `todos.md` files.
- **/role <name>**: Directly activates a specific persona (`role-legacy-killer`, `role-code-refactorer`, `role-code-sanitizer`, `role-component-architect`, `role-ui-polish`, `role-api-refactorer`).
