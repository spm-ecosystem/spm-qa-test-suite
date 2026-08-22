# QA Test Environment: Safebooru.org Layout Modernization

## Objective
Reconstruct `safebooru.org` legacy HTML interface into modern SPM React components using Veneer Spec (.vnr).

## Component Assignments:
1. **Header & Navigation Search:**
   - Map `#header` -> `UiNavHeader`
   - Map `#searchform` -> `UiSearchBar` with `hiddenInputs` for `page` and `s` params.
2. **Post Gallery & Grid:**
   - Map `#post-list .content` -> `UiModernGridPage`
   - Map `span.thumb` -> `UiImageCard` binding thumbnail URL (`attr:src`), post link (`hrefOrOnclick`), and own selector (`self | selector`).
3. **Sidebar Tag Metadata:**
   - Map `#tag-sidebar` -> `UiPostDetails` binding tag names (`text`) and counts (`nextSiblingText | cleanNumber`).
