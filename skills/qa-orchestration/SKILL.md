---
name: qa-orchestration
description: Parallel Subagent QA Orchestrator for the SPM Ecosystem. Dispatches isolated subagents concurrently across test environments (site-a-forum, site-b-catalog, site-c-admin), reading each environment's internal task.md brief to evaluate theme development complexity, test documentation coverage, generate result.md reports, and create git commits in English.
---

# Parallel QA Subagent Orchestrator

ROLE: Senior QA Orchestration Architect & Parallel Subagent Controller  
CONTEXT: Site Package Manager (SPM) Ecosystem (`spm-qa-test-suite`)  
GOAL: Dispatch and coordinate independent subagents concurrently across test environments (`environments/*`), reading each environment's internal `task.md` brief, evaluating theme development complexity, checking documentation coverage against real-world scraping tasks, requiring each subagent to write an isolated `result.md` report, and creating local git commits for history tracking.

> [!IMPORTANT]
> **CRITICAL PIPELINE RULE (STRICTLY FORBIDDEN):**  
> Never modify or write directly to `manifest.json` files. All layouts, element selections, theme attributes, and dynamic binding pipelines must be defined using Veneer Spec syntax in `.vnr` source files. Compilation must go through the C++ CLI (`spm-cli`) compiler.

---

## 🚀 PARALLEL ORCHESTRATION PROTOCOL

When invoked, the Orchestrator MUST execute the following workflow:

### 1. Environment & Task Discovery
1. Inspect `/home/watashi/Projects/spm-qa-test-suite/environments/` to discover all active environment folders (e.g. `environments/site-a-forum/`, `environments/site-b-catalog/`, `environments/site-c-admin/`).
2. Read the internal **`task.md`** file located inside each environment directory (`environments/<environment-id>/task.md`), which contains the specific legacy site domain, target page scenario, and testing requirements for that environment.

### 2. Parallel Subagent Dispatch
Dispatch a dedicated subagent for each target environment concurrently using `invoke_subagent`. Pass the instructions from `environments/<environment-id>/task.md` to the respective subagent.

---

## 🤖 SUBAGENT INSTRUCTIONS (EXECUTED IN PARALLEL)

Each dispatched subagent MUST evaluate its assigned environment independently by reading its environment's `task.md` and relying **strictly** on the central documentation in `docs/` (`docs/veneer-reference.md`, `docs/component-specs.md`, `docs/manifest-schema.md`, `docs/cli-tooling.md`).

Each subagent MUST perform the following 5-part evaluation protocol:

### Part 1: Read Internal Environment Task Brief
- Read `environments/<environment-id>/task.md` to understand the target site domain, page scenario, and component targets.

### Part 2: Documentation Coverage & Friction Audit
- Attempt to build or validate the `.vnr` theme for the target site relying **strictly** on the documentation in `docs/`.
- Identify what information the documentation covers well versus what is missing, unclear, misleading, or ambiguous.

### Part 3: Theme Development Complexity Assessment
- Test the syntax complexity of `.vnr` bindings, class inheritance (`extends`), extractor pipes (`text`, `attr:name`, `html`, `hiddenInputs`), and C++ raw string literals (`R"([...])";`).
- Evaluate whether the target React component props contract handles the site's DOM structure smoothly or requires hacks.

### Part 4: Report Generation (`result.md`)
Upon completing testing, each subagent MUST write its findings to `environments/<environment-id>/result.md` in English.

### Part 5: Git Commit Protocol
Once `result.md` is generated and verified, each subagent MUST stage its environment files and commit the work locally with a structured commit message:
```bash
git add environments/<environment-id>/
git commit -m "qa(<environment-id>): complete evaluation and generate result.md report"
```

---

## 📤 MANDATORY `result.md` REPORT FORMAT

Each subagent MUST write its report using the following structure:

```markdown
# Environment QA Evaluation Report: [Environment ID / Site Name]

## 1. Executive Summary
- **Overall Modernization Experience:** [Smooth / Moderate Friction / High Friction]
- **Documentation Sufficiency Score:** [1-10]

---

## 2. What Worked Well (Positive Highlights)
- [List specific features, component props, or documentation examples that made theme development clear and frictionless]

---

## 3. Friction Points & Difficulties Encountered
- **Documentation Gaps:** [What was missing or poorly explained in docs/]
- **Syntax / Type Friction:** [Issues with .vnr syntax, JSON arrays, raw strings, or pipe extractors]
- **Component Limitations:** [Props or Shadow DOM styling constraints encountered]

---

## 4. Defect & Boundary Test Findings
| Defect ID | Location | Classification | Failure Mechanism | Proposed Remediation |
| :--- | :--- | :--- | :--- | :--- |
| `DEFECT-01` | `comments.vnr:L12` | Technical / Fallback | Missing avatar src renders orphan image tag | Add `avatarFallbackUrl` prop to `UiCommentListPage` |

---

## 5. Recommended Actions for Ecosystem Improvement
1. [Actionable recommendation 1]
2. [Actionable recommendation 2]
```
