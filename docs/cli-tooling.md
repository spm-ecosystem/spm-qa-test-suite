# Site Package Manager (SPM) - CLI Tooling & Pipeline Manual (`cli-tooling.md`)

The `spm-cli` C++17 binary acts as the official compiler and runtime development tools orchestrator for Site Package Manager (`spm`).

---

## 1. CLI Commands & Subcommands

### A. Development Mode (`spm dev`)
Starts an in-memory compiler and file watcher server with live hot-reloading for extension themes.
```bash
spm dev
```
- Monitors `.vnr` source files inside `vnr_project/` subdirectories.
- Automatically compiles `.vnr` changes into dynamic payloads and notifies the running browser extension to hot-reload Shadow DOM styles and component mounts.

### B. Project Compilation (`spm compile`)
Compiles a Veneer Spec (`.vnr`) project folder into a standalone, production-ready `manifest.json`.
```bash
spm compile [path/to/vnr_project]
```
- Lexes, parses, resolves class inheritance, and emits formatted JSON.
- Deep-merges preexisting metadata (`author`, `description`, `targetUrl`, `version`) into the output `manifest.json`.

---

## 2. Recommended Directory Layout for Themes

```text
site-domain/
└── theme-name/
    ├── manifest.json              # Auto-compiled production output
    ├── content.css                # Global CSS overrides
    └── vnr_project/               # Veneer Spec source folder
        ├── theme.vnr              # Theme tokens & custom styles
        ├── classes.vnr            # Scraping blueprints
        ├── navigation.vnr         # Header reconstructs
        └── pages.vnr              # Feed and page reconstructs
```
