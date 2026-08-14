# Site Package Manager (SPM) - Theme Manifest Schema (`manifest-schema.md`)

The `manifest.json` file is the compiled output specification generated from Veneer Spec (`.vnr`) sources by `spm-cli`. It is evaluated at runtime by the SPM extension engine to reconstruct legacy HTML elements or layout sections with React components inside Shadow DOM.

---

## Root Fields

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `targetUrl` | `string` | Yes | Matching URL glob pattern indicating which domains this theme activates on (e.g. `*://example.com/*`). |
| `version` | `string` | No | Theme package version (e.g. `"1.0.0"`). |
| `minEngineVersion` | `string` | No | Minimum compatible version of the SPM engine (e.g. `"1.0.0"`). |
| `theme` | `object` | Yes | Defines global styling variables, custom CSS overrides, and metadata. |
| `components` | `array` | No | List of element selector overrides targeting, hiding, or replacing individual elements. |
| `reconstructs` | `array` | No | List of page-level section replacements mounting React components inside isolated Shadow DOM hosts. |

---

## 1. Theme Configuration

Defines styling variables (custom property mappings) and custom CSS rules injected globally.

```json
"theme": {
  "label": "Obsidian",
  "author": "spm-ecosystem",
  "description": "Obsidian dark theme",
  "cssVariables": {
    "--spm-bg-primary": "#09090b",
    "--spm-bg-surface": "#121215",
    "--spm-text-primary": "#f4f4f5",
    "--spm-text-muted": "#a1a1aa",
    "--spm-accent": "#ff6600",
    "--spm-border": "rgba(255, 255, 255, 0.08)",
    "--spm-radius": "8px"
  },
  "customStyles": "body { background-color: #09090b !important; color: #f4f4f5 !important; }"
}
```

---

## 2. Components Configuration

Replaces or hides targeted elements individually.

```json
"components": [
  {
    "name": "UiSearchBar",
    "selector": ".sidebar form",
    "action": "replace",
    "props": {
      "placeholder": "Search…",
      "submitUrl": "https://example.com/search",
      "queryParamName": "q"
    },
    "propsMap": {
      "defaultValue": "input[name='q'] | attr:value"
    }
  },
  {
    "name": "UiNavHeader",
    "selector": "#subnavbar",
    "action": "hide"
  }
]
```

---

## 3. Reconstructs Configuration

Reconstructs entire sections or full page contents with isolated React structures in Shadow DOM.

```json
"reconstructs": [
  {
    "containerSelector": "#gallery",
    "layoutComponent": "UiModernGridPage",
    "urlPattern": "page=gallery",
    "props": {
      "pageTitle": "Gallery"
    },
    "preserve": {
      "sidebarSlot": ".sidebar"
    },
    "children": [
      {
        "name": "items",
        "selector": "#gallery .item",
        "propsMap": {
          "id": "self | attr:id",
          "imageUrl": "img | attr:src",
          "linkUrl": "a | attr:href",
          "title": "img | attr:title"
        }
      }
    ]
  }
]
```

---

## 4. Prop Mapping Rules & Extractor Pipes

Dynamic extractions follow the format:

$$\text{Selector} \quad | \quad \text{Operation}$$

| Rule Syntax | Targeted Element | Result |
| :--- | :--- | :--- |
| `<css-selector> \| text` | First matching descendant | Text content (`textContent.trim()`). |
| `<css-selector> \| html` | First matching descendant | Inner HTML (`innerHTML`). |
| `<css-selector> \| attr:<name>` | First matching descendant | Attribute value (e.g. `attr:src` for images). |
| `<css-selector> \| hiddenInputs` | Form container | JSON array of `{ name, value }` for hidden form inputs. |
| `self \| text` | Targeted element itself | Text content of targeted element. |
| `self \| html` | Targeted element itself | Inner HTML of targeted element. |
| `self \| attr:<name>` | Targeted element itself | Value of specified attribute. |
| `self \| hrefOrOnclick` | Targeted element itself | Resolves `href` value, or extracts navigation from inline `onclick` handler. |
