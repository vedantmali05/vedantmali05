# graphify — Agent Init File

> **Agent: Read this file once and act on it.** Check if graphify is already set up (Step 0), then either set it up or jump straight to usage rules.

---

## Step 0 — Quick State Check (Do This First)

Before anything else, check the project state:

```bash
ls graphify-out/graph.json 2>/dev/null && echo "GRAPH_EXISTS" || echo "NO_GRAPH"
command -v graphify 2>/dev/null && echo "GRAPHIFY_INSTALLED" || echo "NOT_INSTALLED"
```

- **`GRAPH_EXISTS`** → Skip to [§ Using the Graph](#using-the-graph) immediately. Do not rebuild.
- **`GRAPHIFY_INSTALLED` but no graph** → Skip to [§ Run Graphify](#run-graphify).
- **Neither** → Start at [§ Install Graphify](#install-graphify).

---

## Install Graphify

> ⚠️ The correct package name is `graphifyy` (double `y`). Other similarly named packages are not official.

```bash
pip install graphifyy && graphify install
```

**Platform-specific install commands:**

| Platform | Command |
|---|---|
| Claude Code | `graphify install` |
| Gemini CLI | `graphify install --platform gemini` |
| Cursor | `graphify cursor install` |
| Codex | `graphify install --platform codex` |
| GitHub Copilot CLI | `graphify install --platform copilot` |
| VS Code Copilot Chat | `graphify vscode install` |

---

## Run Graphify

Navigate to the project root and run:

```bash
graphify .
```

This generates:

```
graphify-out/
├── graph.html        ← interactive visualization
├── GRAPH_REPORT.md   ← plain-language audit report
├── graph.json        ← raw graph data (used by all queries)
└── cache/
```

**Tip:** Create a `.graphifyignore` to exclude noise:

```
node_modules/
dist/
vendor/
*.generated.py
```

After the first run, proceed to usage rules below.

---

## Using the Graph

This project has a graphify knowledge graph at `graphify-out/`. Follow these rules for every codebase question:

### Query Rules (Always-On)

- **For any codebase or architecture question**, when `graphify-out/graph.json` exists, **first run**:
  ```bash
  graphify query "<your question>"
  ```
  Use `--dfs` for tracing a specific path, `--budget N` to cap output tokens.

- **For relationships between two concepts:**
  ```bash
  graphify path "ConceptA" "ConceptB"
  ```

- **For deep explanation of a single concept:**
  ```bash
  graphify explain "ConceptName"
  ```

- **If `graphify-out/wiki/index.md` exists** → use it for broad navigation instead of raw file browsing.

- **Read `graphify-out/GRAPH_REPORT.md`** only for broad architecture review, or when query/path/explain do not surface enough context.

- **Do NOT scan the entire codebase**. Do NOT load full files unless the graph output is definitively insufficient.

### After Modifying Code

Always update the graph (AST-only, free, no API cost):

```bash
graphify update .
```

---

## Directory Conventions for This Project

- All agent context files live in `.agents/`. Do **not** recreate them at the root or under legacy names (e.g. `GEMINI.md`, `ai-discussions/`).
- If graphify is reinstalled or run elsewhere and creates duplicate files/directories at the root or under legacy names, clean them up and consolidate them back into `.agents/`.

---

## Growing the Graph Over Time

```bash
# Re-run on changed files only (faster than full rebuild)
graphify update ./

# Add external knowledge (papers, blogs, docs, URLs)
graphify add <url>

# Keep a raw/ folder — drop docs there, graphify picks them up automatically
```

The graph improves with richer inputs: reasoning notes, architectural decisions, comments. Over time it becomes a persistent memory layer across all agent sessions.

---

## Reference

- Source: https://github.com/safishamsi/graphify
- Full skill (for agents with skill access): `~/.gemini/config/skills/graphify/SKILL.md`
