# Complete Component Specifications & Props API Reference (`component-specs.md`)

This is the authoritative React component documentation for the **Site Package Manager (SPM)** ecosystem (`spm-components`). All modern layout reconstructions in SPM rely on these components to replace legacy DOM structures in Shadow DOM.

---

## 1. Architectural Guidelines & Contracts

1. **Strict Typescript Interfaces**: All props are optional with sensible neutral fallbacks to prevent runtime NPE crashes.
2. **Design Tokens via CSS Variables**: Never use hardcoded hex colors or static dimensions. All styling uses `--spm-*` visual tokens (e.g. `var(--spm-bg-primary)`, `var(--spm-accent)`, `var(--spm-text-primary)`).
3. **Prop Spreading**: All components accept `className?: string` and `style?: React.CSSProperties` and spread them onto the host root element.
4. **Conditional Rendering**: Empty or un-scraped properties must render nothing (no orphan tags or zero-width containers).

---

## 2. Comprehensive Component Index & Props API

### 1. `UiNavHeader` (Dedicated Navigation Header)
- **Category:** Dedicated Layout
- **Purpose:** Reconstructs main site navigation headers, topbars, and search header bars.
- **Props API:**
  | Prop | Type | Default | Description |
  | :--- | :--- | :--- | :--- |
  | `siteName` | `string` | `'Site'` | Fallback site text when no logo image is available |
  | `logoUrl` | `string` | - | Header logo image URL |
  | `logoHref` | `string` | `'/'` | Target link URL for logo click |
  | `primaryLinks` | `Array<{ label: string; url: string }>` | `[]` | Main navigation menu links |
  | `secondaryLinks` | `Array<{ label: string; url: string }>` | `[]` | Secondary right-aligned utility links |
  | `sticky` | `boolean` | `false` | Pin header to top of viewport with high elevation z-index |
  | `searchPlaceholder` | `string` | `'Search...'` | Search input placeholder text |
  | `items` | `Array<{ label: string; href: string }>` | `[]` | Quick nav items array |

- **Veneer Spec Example (`navigation.vnr`):**
  ```vnr
  reconstruct ".SearchHeader" -> UiNavHeader {
    logoText: "HN Search";
    searchPlaceholder: "Search stories by title, url or author...";
    items: R"([
      { "label": "About", "href": "https://hn.algolia.com/about" },
      { "label": "API", "href": "https://hn.algolia.com/api" }
    ])";
    preserve {
      logo: ".SearchHeader_logo";
      settingsButton: ".SearchHeader_settings";
    }
  }
  ```

---

### 2. `UiTableListPage` (Search Results & Data Table Page)
- **Category:** Dedicated Layout
- **Purpose:** Reconstructs search result feeds, wiki directories, tag aliases, and data tables.
- **Props API:**
  | Prop | Type | Default | Description |
  | :--- | :--- | :--- | :--- |
  | `pageTitle` | `string` | `'Wiki Pages'` | Header section title |
  | `tableRows` | `any[]` | `[]` | Data rows array matching column keys |
  | `columns` | `Array<TableColumnConfig>` | - | Column definitions (`key`, `header`, `width`, `align`, `type`, `urlKey`, `badgeStyleKey`) |
  | `pageLinks` | `Array<{ label: string; url: string }>` | `[]` | Pagination links array |
  | `height` | `string` | `'100vh'` | Layout container height |
  | `infiniteScroll` | `Record<string, string>` | - | Infinite scroll config (`nextPageSelector`, `nextPageText`) |

- **Veneer Spec Example (`pages.vnr`):**
  ```vnr
  reconstruct "#content:has(table.highlightable)" -> UiTableListPage {
    urlPattern: "page=alias&s=list";
    pageTitle: "Tag Aliases";
    height: "calc(100vh - 78px)";
    infiniteScroll: R"({
      "nextPageSelector": "#paginator .pagination a",
      "nextPageText": ">"
    })";
    columns: R"([
      { "key": "aliasName", "header": "Alias", "type": "link", "urlKey": "aliasUrl" },
      { "key": "toName", "header": "To Tag", "type": "link", "urlKey": "toUrl" }
    ])";
    child tableRows {
      selector: "table.highlightable tr:not(.tableheader)";
      bind aliasName: "td:nth-child(2) a | text";
      bind aliasUrl: "td:nth-child(2) a | attr:href";
      bind toName: "td:nth-child(3) a | text";
      bind toUrl: "td:nth-child(3) a | attr:href";
    }
  }
  ```

---

### 3. `UiCommentListPage` (Forum Threads & Discussion Boards)
- **Category:** Dedicated Layout
- **Purpose:** Reconstructs legacy discussion threads, forum comment boards, and nested reply trees.
- **Props API:**
  | Prop | Type | Default | Description |
  | :--- | :--- | :--- | :--- |
  | `pageTitle` | `string` | `'Comments'` | Title header of comments page |
  | `threads` | `Array<CommentThread>` | `[]` | Array of threads (`id`, `thumbnailUrl`, `postUrl`, `postDate`, `postUser`, `comments`) |
  | `pageLinks` | `Array<{ label: string; url: string }>` | `[]` | Pagination links |
  | `height` | `string` | `'100vh'` | Viewport height constraint |

- **Veneer Spec Example (`tables.vnr`):**
  ```vnr
  reconstruct "#content:has(#comment-list)" -> UiCommentListPage {
    urlPattern: "page=comment&s=list";
    pageTitle: "Comments Board";
    height: "calc(100vh - 78px)";
    child threads {
      selector: "#comment-list > div.post";
      bind id: "self | attr:id";
      bind thumbnailUrl: ".col1 img | attr:src";
      bind postUser: ".col2 span.info:nth-child(2) | text";
    }
  }
  ```

---

### 4. `UiSplitLayout` (Two-Column Master-Detail Shell)
- **Category:** Dedicated Layout
- **Purpose:** Full-height two-column layout shell combining image viewer/main HTML content and scroll panel sidebar.
- **Props API:**
  | Prop | Type | Default | Description |
  | :--- | :--- | :--- | :--- |
  | `imageSlot` | `Array<{ src: string; alt?: string }>` | `[]` | Media items - rendered via `UiImageViewer` |
  | `tags` | `Array<TagItem>` | `[]` | Tag badges list forwarded to sidebar |
  | `buttons` | `Array<ButtonItem>` | `[]` | Sidebar action buttons |
  | `statisticsHtml` | `string` | - | Raw HTML rendered in stats box |
  | `sidebarWidth` | `string` | `'280px'` | Width of sidebar panel |
  | `sidebarSide` | `'left' \| 'right'` | `'left'` | Alignment of sidebar |
  | `imageFit` | `'contain' \| 'cover'` | `'contain'` | Image object-fit mode |
  | `showSearch` | `boolean` | `false` | Enable sidebar search input |

---

### 5. `UiImageViewer` (Responsive Image Viewer Canvas)
- **Category:** Dedicated Layout
- **Purpose:** High-performance responsive image container filling viewport space.
- **Props API:**
  | Prop | Type | Default | Description |
  | :--- | :--- | :--- | :--- |
  | `src` | `string` | - | Image source URL |
  | `alt` | `string` | `''` | Image alternative text description |
  | `fit` | `'contain' \| 'cover'` | `'contain'` | CSS object-fit mode |
  | `background` | `string` | `var(--spm-bg-primary)` | Fallback container background color |

---

### 6. `UiScrollPanel` (Scrollable Sidebar Panel)
- **Category:** Dedicated Layout
- **Purpose:** Sidebar container for tag groups, action buttons, metadata, and search inputs.
- **Props API:**
  | Prop | Type | Default | Description |
  | :--- | :--- | :--- | :--- |
  | `tags` | `Array<{ name: string; count?: string; type?: string; url?: string }>` | `[]` | Tag items automatically grouped by `type` |
  | `buttons` | `Array<{ label: string; url: string }>` | `[]` | Action buttons |
  | `statisticsHtml` | `string` | - | Raw HTML statistics markup |
  | `showSearch` | `boolean` | `false` | Render search bar at top |
  | `width` | `string` | `'280px'` | Panel container width |

---

### 7. `UiStatsDashboard` (Metrics & Analytics Dashboard)
- **Category:** Dedicated Layout
- **Purpose:** Dashboard view for analytics metrics, ranking tables, and date range filters.
- **Props API:**
  | Prop | Type | Default | Description |
  | :--- | :--- | :--- | :--- |
  | `pageTitle` | `string` | `'Statistics'` | Main title header |
  | `dateRangeText` | `string` | `'All time'` | Range badge label |
  | `navLinks` | `Array<{ label: string; url: string }>` | `[]` | Top navigation links |
  | `sections` | `Array<StatSection>` | `[]` | Metric card sections |
  | `height` | `string` | `'100vh'` | Layout height |

---

### 8. `UiHeroLanding` (Landing Hero Page)
- **Category:** Dedicated Layout
- **Purpose:** Full-viewport hero banner with logo, tagline, search input, CTA button, and pill nav links.
- **Props API:**
  | Prop | Type | Default | Description |
  | :--- | :--- | :--- | :--- |
  | `siteName` | `string` | `'Site'` | Fallback site title |
  | `logoUrl` | `string` | - | Hero logo URL |
  | `tagline` | `string` | - | Main heading tagline |
  | `subtext` | `string` | - | Subtitle description |
  | `ctaLabel` | `string` | `'Browse'` | CTA button label |
  | `ctaUrl` | `string` | `'/'` | CTA button target link |
  | `searchSubmitUrl` | `string` | - | Target URL for search form submission |

---

### 9. `UiSearchBar` (Standalone Search Form Bar)
- **Category:** Dedicated Layout
- **Purpose:** Form search input with support for GET/POST form target, query binding, and hidden input forwarding.
- **Props API:**
  | Prop | Type | Default | Description |
  | :--- | :--- | :--- | :--- |
  | `placeholder` | `string` | `'Search...'` | Input placeholder text |
  | `defaultValue` | `string` | `''` | Initial input value |
  | `submitUrl` | `string` | - | Action form target URL |
  | `queryParamName` | `string` | `'q'` | Query parameter string key |

---

### 10. `UiImageCard` (Gallery Image Card)
- **Category:** Dedicated Layout
- **Purpose:** Single gallery thumbnail card with title caption, hover zoom effects, and aspect ratio controls.
- **Props API:**
  | Prop | Type | Default | Description |
  | :--- | :--- | :--- | :--- |
  | `imageUrl` | `string` | - | Image source URL |
  | `linkUrl` | `string` | - | Card click navigation link |
  | `title` | `string` | - | Card caption text |
  | `aspectRatio` | `string` | `'1:1'` | Image aspect ratio |
  | `showTitle` | `boolean` | `true` | Show title caption bar |

---

### 11. `LayoutPrimitives` (Base UI Blocks)
- **Category:** Layout Primitives (`src/components/primitives/LayoutPrimitives.tsx`)
- **Primitives List:**
  - `UiBox`: Standard `<div>` wrapper for padding and borders.
  - `UiFlexRow`: `<div>` flex row container.
  - `UiFlexColumn`: `<div>` flex column container.
  - `UiGrid`: `<div>` grid layout container.
  - `UiText`: Styled `<span>` for text overrides.
  - `UiImage`: Styled `<img>` responsive rendering.
  - `UiLink`: Styled `<a>` link anchor.
