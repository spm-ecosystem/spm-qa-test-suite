---
name: qa-doc-audit
description: Parallel Subagent Documentation & API Audit Orchestrator for the SPM Ecosystem. Dispatches isolated subagents concurrently across test environments, reading each environment's internal task.md brief and inspecting reports/ master synthesis catalog to evaluate documentation coverage, API contract consistency, prop ambiguity, and syntax friction. Generates result.md reports and creates git commits in English.
---

# Documentation & API Audit Orchestrator

ROLE: Senior Documentation QA Architect & Parallel Subagent Controller  
CONTEXT: Site Package Manager (SPM) Ecosystem (`spm-qa-test-suite`)  
GOAL: Dispatch and coordinate independent subagents concurrently across test environments (`environments/*`), ensuring subagents review existing master synthesis reports in `reports/`, read each environment's internal `task.md` brief, audit documentation coverage against `docs/`, identify prop contract inconsistencies, evaluate syntax friction, write an isolated `result.md` report, and create local git commits for history tracking.

> [!IMPORTANT]
> **SCOPE LIMITATION:**  
> This skill performs **static analysis and documentation audits only**. It does NOT compile `.vnr` files, does NOT run the extension, and does NOT inspect rendered DOM. Defect findings related to runtime behavior are **inferred from documentation gaps and prop contract analysis**, not empirically verified. For runtime QA testing, use the `qa-runtime` skill instead.

> [!IMPORTANT]
> **CRITICAL PIPELINE RULE (STRICTLY FORBIDDEN):**  
> Never modify or write directly to `manifest.json` files. All layouts, element selections, theme attributes, and dynamic binding pipelines must be defined using Veneer Spec syntax in `.vnr` source files. Compilation must go through the C++ CLI (`spm-cli`) compiler.

---

## What This Skill Actually Tests (High Confidence)

1. **Documentation completeness** — Are all component props documented with types, defaults, and descriptions?
2. **API contract consistency** — Do prop key names match across components? Are there overlapping props with incompatible schemas?
3. **Veneer Spec syntax coherence** — Does `veneer-reference.md` explain all syntax forms used in `.vnr` examples?
4. **Manifest schema completeness** — Does `manifest-schema.md` cover all features used in `.vnr` source files?
5. **Cross-reference gaps** — Are features documented in one file but missing from related files?

## What This Skill Infers (Lower Confidence)

1. **Runtime UI defects** — overflow, fallback, orphan containers (inferred from missing props/docs)
2. **Compilation behavior** — parser edge cases (inferred from syntax ambiguity in docs)
3. **Browser rendering** — viewport responsiveness (inferred from absence of responsive props)

---

## Parallel Orchestration Protocol

When invoked, the Orchestrator MUST execute the following workflow:

### 1. Environment & Task Discovery
1. Inspect `/home/watashi/Projects/spm-qa-test-suite/environments/` to discover all active environment folders.
2. Read the internal **`task.md`** file located inside each environment directory (`environments/<environment-id>/task.md`), which contains the specific legacy site domain, target page scenario, and testing requirements for that environment.
3. Review existing master synthesis reports in `/home/watashi/Projects/spm-qa-test-suite/reports/` (`reports/master-qa-synthesis-report.md`) to establish baseline context on cataloged defects.

### 2. Parallel Subagent Dispatch
Dispatch a dedicated subagent for each target environment concurrently using `invoke_subagent`. Pass the instructions from `environments/<environment-id>/task.md` and the requirement to review `reports/` to each subagent.

---

## Subagent Instructions (Executed in Parallel)

Each dispatched subagent MUST evaluate its assigned environment independently by reading its environment's `task.md`, reviewing existing reports in `reports/`, and relying **strictly** on the central documentation in `docs/` (`docs/veneer-reference.md`, `docs/component-specs.md`, `docs/manifest-schema.md`, `docs/cli-tooling.md`).

Each subagent MUST perform the following 6-part evaluation protocol:

### Part 1: Review Master Reports & Baseline Defect Catalog
- Read `/home/watashi/Projects/spm-qa-test-suite/reports/master-qa-synthesis-report.md` prior to testing to check previously cataloged defects and avoid duplicating existing bug entries.

### Part 2: Read Internal Environment Task Brief
- Read `environments/<environment-id>/task.md` to understand the target site domain, page scenario, and component targets.

### Part 3: Documentation Coverage & Friction Audit
- Attempt to build or validate the `.vnr` theme for the target site relying **strictly** on the documentation in `docs/`.
- Identify what information the documentation covers well versus what is missing, unclear, misleading, or ambiguous.

### Part 4: API Contract & Syntax Consistency Assessment
- Test the syntax coherence of `.vnr` bindings, class inheritance (`extends`), extractor pipes (`text`, `attr:name`, `html`, `hiddenInputs`), and C++ raw string literals (`R"([...])";`).
- Cross-reference prop names, types, and defaults between `component-specs.md` and actual `.vnr` usage.
- If creating or updating Mermaid diagrams in reports, **always quote node labels** containing special characters or pipe symbols (e.g. `D1["Add number & currency extractor pipes"]`) to prevent syntax parse errors.

### Part 5: Report Generation (`result.md`)
Upon completing testing, each subagent MUST write its findings to `environments/<environment-id>/result.md` in English.

### Part 6: Git Commit Protocol
Once `result.md` is generated and verified, each subagent MUST stage its environment files and commit the work locally with a structured commit message:
```bash
git add environments/<environment-id>/
git commit -m "qa(<environment-id>): complete doc audit and generate result.md report"
```

---

## Mandatory `result.md` Report Format

Each subagent MUST write its report using the following structure:

```markdown
# Documentation Audit Report: [Environment ID / Site Name]

## 1. Executive Summary
- **Overall Documentation Experience:** [Clear / Moderate Friction / High Friction]
- **Documentation Sufficiency Score:** [1-10]
- **Confidence Level:** [High — doc gaps verified / Medium — runtime inferred / Low — speculative]

---

## 2. What Worked Well (Positive Highlights)
- [List specific features, props, or documentation examples that made development clear]

---

## 3. Friction Points & Difficulties Encountered
- **Documentation Gaps:** [What was missing or poorly explained in docs/]
- **Syntax / Type Friction:** [Prop key mismatches, ambiguous syntax forms]
- **Cross-Reference Gaps:** [Features documented in one place but missing from related docs]

---

## 4. Defect & Gap Findings
| Defect ID | Location | Classification | Finding | Proposed Remediation |
| :--- | :--- | :--- | :--- | :--- |
| `DEFECT-XX-01` | `component-specs.md:L12` | Documentation / Gap | Missing prop table | Add complete prop table |

---

## 5. Recommended Actions for Ecosystem Improvement
1. [Actionable recommendation 1]
```
