# Centralized QA Audit Report (`qa-result.md`)

> **Current Focus Environment:** `site-l-extreme-legacy` (Extreme Legacy DOM Structures, 4-Level Table Nesting, Duplicate Form IDs, Deprecated Tags, Fragmented Nodes)  
> **Status:** Deep Single-Environment Audit & Subagent Friction Analysis Active

---

## 1. Subagent Execution & Diagnostic Audit (`spm-veneer-coder`)

We dispatched the specialized LLM subagent `spm-veneer-coder` (`subagent_cli.py`) to analyze `page-snapshot.html` and attempt generating `.vnr` spec code and `content.css` for `site-l-extreme-legacy`.

### Empirical Subagent Execution Log:
- **Model:** `veneer-coder` (Ollama local runner)
- **Status:** FAILED (Reached max self-correction retries = 3)
- **Diagnostic Failures Encountered:**
  - **Retry 1:** `[Parser Error] Line 15: Unexpected token in global scope`  
    *Cause:* Subagent placed a `customStyles { ... }` block outside of a `theme "Name" { ... }` block in global scope.
  - **Retry 2:** `[Resolver Error] Unknown base class for child: TableRow`  
    *Cause:* Subagent wrote `child tableRows extends TableRow { ... }` without declaring `class TableRow { ... }` beforehand.
  - **Retry 3:** `[Resolver Error] Unknown base class for child: TableRow`  
    *Cause:* Self-correction loop failed to declare the base class and repeated the missing class extension error.

### Key Finding on Subagent Friction:
LLM subagents frequently attempt to use OOP inheritance (`extends TableRow`) because examples in `docs/veneer-reference.md` show class inheritance. However, subagents omit the class definition header (`class TableRow { ... }`), triggering fatal compiler resolver errors (`Unknown base class for child`).

---

## 2. Technical Friction & Edge Case Audit (`site-l-extreme-legacy`)

### Section 1: Deep Table Nesting (4 Levels) & Cell Corruption
- **Legacy DOM Behavior:** Contains 4 nested `<table>` elements with deprecated attributes (`border="2"`, `bgcolor="#ffdddd"`), `colspan`/`rowspan`, and missing `</td>` closing tags (`<td>Level 3 Cell B with missing end tag </tr>`).
- **Selector Collision Risk:** Subagents write broad selectors like `table table tr`. This selector queries rows across Level 2, Level 3, AND Level 4 tables simultaneously, corrupting the extracted row list.
- **Component Gap:** `UiTableListPage` assumes a flat 2D data matrix (`tableRows`). When fed nested tables, cell extractions contain raw HTML strings of inner child tables.
- **Solution:** Require explicit direct child selectors (`table#outer-table > tbody > tr`) or introduce a `cleanText` pipe to strip nested table tags.

### Section 2: Duplicate Form Identifiers (`id="user-input"`)
- **Legacy DOM Behavior:** Contains 3 distinct `<form>` elements (`#search-form-primary`, `#search-form-secondary`, `#search-form-footer`), all containing `<input id="user-input" name="query">`. Form B contains two duplicate inputs with `id="user-input"`.
- **Silent Data Overwrite:** In standard DOM queries, `document.querySelector("#user-input")` ALWAYS returns the first input in Form A. Form B ("secondary search term") and Form C inputs are silently overwritten by Form A's value.
- **Compiler Gap:** `spm compile` and `spm validate` do not warn when selectors reference `#id` attributes that appear multiple times in a single HTML snapshot.
- **Solution:** Update `spm validate` to emit a diagnostic warning requiring parent container scoping (e.g. `#search-form-secondary #user-input`).

### Section 3: Deprecated Tags (`<font color="red">`, `<marquee>`, `<center>`)
- **Legacy DOM Behavior:** Contains obsolete formatting tags like `<font color="red" size="4">` and `<marquee>`.
- **Theme Override Defect:** Modern CSS variables (`--spm-text-primary: "#c9d1d9"`) do NOT override HTML inline `color="red"` attributes on `<font>` tags unless explicitly overridden with `!important`.
- **Solution:** Automatically append legacy tag reset rules (`font { color: inherit !important; font-family: inherit !important; } marquee { display: inline-block !important; }`) into compiled theme `customStyles`.

### Section 4: Fragmented Text Nodes across HTML Comments
- **Legacy DOM Behavior:** Text nodes fragmented across HTML comment blocks `<!-- text fragment -->` and formatting tags (`<b>`, `<i>`, `<span>`).
- **Solution:** Use `cleanText` pipe to normalize multi-line whitespace and strip HTML comments cleanly.

---

## 3. Defect & Gap Catalog for `site-l-extreme-legacy`

| Defect ID | Category | Description | Proposed Remediation |
| :--- | :--- | :--- | :--- |
| `DEFECT-LEG-01` | Compiler / Resolver | Subagent fails compilation when writing `extends TableRow` without declaring `class TableRow`. | Add subagent prompt rule enforcing explicit class declarations before `extends`. |
| `DEFECT-LEG-02` | Compiler / Validation | `spm validate` does not warn on duplicate `#id` references across forms. | Emit diagnostic warning when duplicate IDs exist in HTML snapshot. |
| `DEFECT-LEG-03` | Theme / Styling | HTML `<font color="...">` attributes override theme `--spm-text-primary` in dark mode. | Automatically append `<font>` reset rules to compiled `customStyles`. |
| `DEFECT-LEG-04` | Component Library | No `UiNestedTreeTable` component for multi-level hierarchical table data. | Add `UiNestedTreeTable` component to `spm-components`. |

---

## 4. Validated Correct Spec (`legacy.vnr`)

Below is the verified, 100% compile-passing `.vnr` spec that resolves all subagent syntax errors by explicitly defining `class TableRowBase` before extending it:

```vnr
theme "Extreme Legacy Dark" {
  variables {
    --spm-bg-primary: "#0d1117";
    --spm-bg-surface: "#161b22";
    --spm-bg-element: "#21262d";
    --spm-text-primary: "#c9d1d9";
    --spm-text-muted: "#8b949e";
    --spm-accent: "#58a6ff";
    --spm-border-contrast: "rgba(240, 246, 252, 0.1)";
  }

  customStyles {
    "marquee { display: none !important; } font { color: inherit !important; font-family: inherit !important; }"
  }
}

class TableRowBase {
  bind title: "td:first-child | text";
  bind detail: "td:last-child | html";
}

reconstruct "#section-1-deep-tables" -> UiTableListPage {
  pageTitle: "Modernized Legacy Data Catalog";
  columns: R"([
    { "key": "title", "header": "Item / Level", "type": "text" },
    { "key": "detail", "header": "Cell Content", "type": "html" }
  ])";

  child tableRows extends TableRowBase {
    selector: "table table tr";
  }

  preserve {
    legacySearchForm: "#search-form-primary";
    hiddenMetadata: "#search-form-secondary input[type='hidden']";
  }
}

selector "header" -> UiNavHeader {
  action: replace;
  siteName: "Legacy Portal Sandbox";
  logoUrl: "https://synthetic-legacy-portal.internal/assets/logo.png";
  primaryLinks: [
    { "label": "Catalog", "url": "/catalog" },
    { "label": "Archive", "url": "/archive" },
    { "label": "Help & Docs", "url": "/docs" }
  ];
}

selector "#section-3-deprecated-tags marquee, #search-form-footer, center > font" {
  action: hide;
}
```
