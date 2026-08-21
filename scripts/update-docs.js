import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const testSuiteRoot = path.join(__dirname, '..');
const cliDocsRoot = path.join(testSuiteRoot, '../spm-cli/docs');
const componentsDocsRoot = path.join(testSuiteRoot, '../spm-components/docs/components');

console.log('[Docs Sync] Starting sync of authoritative ecosystem documentation...');

// Helper to copy a file cleanly
function copyDoc(src, dest) {
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`[Docs Sync] ✓ Synced ${path.basename(dest)}`);
  } else {
    console.warn(`[Docs Sync] ⚠️ Source not found: ${src}`);
  }
}

// 1. Sync Compiler Specs
copyDoc(
  path.join(cliDocsRoot, 'manifest_schema.md'),
  path.join(testSuiteRoot, 'docs/manifest-schema.md')
);
copyDoc(
  path.join(cliDocsRoot, 'veneer_spec.md'),
  path.join(testSuiteRoot, 'docs/veneer-reference.md')
);
copyDoc(
  path.join(cliDocsRoot, 'cli_tooling.md'),
  path.join(testSuiteRoot, 'docs/cli-tooling.md')
);

// 2. Aggregate Component Specs
const componentSpecsPath = path.join(testSuiteRoot, 'docs/component-specs.md');
const headerText = `# Complete Component Specifications & Props API Reference (\`component-specs.md\`)

This is the authoritative React component documentation for the **Site Package Manager (SPM)** ecosystem (\`spm-components\`). All modern layout reconstructions in SPM rely on these components to replace legacy DOM structures in Shadow DOM.

---

## 1. Architectural Guidelines & Contracts

1. **Strict Typescript Interfaces**: All props are optional with sensible neutral fallbacks to prevent runtime NPE crashes.
2. **Design Tokens via CSS Variables**: Never use hardcoded hex colors or static dimensions. All styling uses \`--spm-*\` visual tokens (e.g. \`var(--spm-bg-primary)\`, \`var(--spm-accent)\`, \`var(--spm-text-primary)\`).
3. **Prop Spreading**: All components accept \`className?: string\` and \`style?: React.CSSProperties\` and spread them onto the host root element.
4. **Conditional Rendering**: Empty or un-scraped properties must render nothing (no orphan tags or zero-width containers).

---

## 2. Comprehensive Component Index & Props API
`;

try {
  if (fs.existsSync(componentsDocsRoot)) {
    const files = fs.readdirSync(componentsDocsRoot)
      .filter(file => file.endsWith('.md') && file !== 'LayoutPrimitives.md')
      .sort(); // Sort alphabetically to maintain deterministic ordering

    let combinedBody = headerText;

    // First process components in alphabetical order
    files.forEach((file, index) => {
      const filePath = path.join(componentsDocsRoot, file);
      const content = fs.readFileSync(filePath, 'utf8');
      
      combinedBody += `\n### ${index + 1}. ${path.basename(file, '.md')}\n\n`;
      // Clean leading headers or duplicate main headers from component specs
      const cleanContent = content.replace(/^#\s+.+$/m, '').trim();
      combinedBody += cleanContent + '\n\n---\n';
    });

    // Finally append LayoutPrimitives if it exists
    const primitivesPath = path.join(componentsDocsRoot, 'LayoutPrimitives.md');
    if (fs.existsSync(primitivesPath)) {
      const content = fs.readFileSync(primitivesPath, 'utf8');
      combinedBody += `\n### Layout Primitives\n\n`;
      const cleanContent = content.replace(/^#\s+.+$/m, '').trim();
      combinedBody += cleanContent + '\n';
    }

    fs.writeFileSync(componentSpecsPath, combinedBody, 'utf8');
    console.log('[Docs Sync] ✓ Successfully aggregated and updated component-specs.md');
  } else {
    console.warn(`[Docs Sync] ⚠️ Component docs folder not found: ${componentsDocsRoot}`);
  }
} catch (e) {
  console.error('[Docs Sync] ❌ Failed to compile component specifications: ' + e.message);
  process.exit(1);
}

console.log('[Docs Sync] Documentation sync completed successfully.');
