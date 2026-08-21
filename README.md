# SPM QA Test Suite & Orchestration Portal

This repository contains the Quality Assurance (QA) validation suite, target test environments, and automated E2E browser automation frameworks for the **Site Package Manager (SPM)** ecosystem.

---

## 1. QA Orchestrator Lifecycle

The QA Orchestrator is the central controller responsible for preparing documentation, validating syntax compiler configurations, and spawning isolated parallel environment testers.

### Orchestration Pipeline Flow

```mermaid
graph TD
    Start(["Start QA Run"]) --> Step0["Step 0: Pull & Sync Documentation (npm run update-docs)"]
    Step0 --> Step1["Step 1: Scan Target Environments (environments/*)"]
    Step1 --> Step2["Step 2: Read Task Briefs (task.md) & Review Master Reports"]
    Step2 --> Step3["Step 3: Dispatch Parallel Subagents (invoke_subagent)"]
    Step3 --> SubagentFlow["Parallel Subagents Run Tests"]
    SubagentFlow --> Step4["Step 4: Collect Individual Results (result.md)"]
    Step4 --> Step5["Step 5: Compile Master Synthesis Report (master-qa-synthesis-report.md)"]
    Step5 --> End(["End QA Run"])
```

### Key Phases:
1. **Ecosystem Synchronization**: The orchestrator triggers `npm run update-docs` to gather Veneer Spec definitions, manifest schemas, command manuals, and React component specifications from `spm-cli` and `spm-components`.
2. **Parallel Dispatching**: Dispatches independent subagents concurrently per target site (e.g. `site-f-wiki`, `site-g-gallery`, `site-h-classifieds`), optimizing execution speed.
3. **Consolidation**: Gathers individual `result.md` files and updates the unified Master QA Synthesis Report.

---

## 2. E2E Browser Automation Flow

E2E testing guarantees that the browser extension compiles, intercepts network requests, injects Shadow DOM roots, and mounts React components correctly inside active tabs.

### E2E Automation Lifecycle

```mermaid
graph TD
    Init(["Init Playwright E2E"]) --> StartServer["Start Local HTTP Mock Server (port 8080)"]
    StartServer --> LaunchChrome["Launch Headless Chrome with SPM Extension Loaded"]
    LaunchChrome --> GetExtId["Navigate to http://localhost:8080/ & Extract data-spm-extension-id"]
    GetExtId --> ConfigStorage["Navigate to chrome-extension://<id>/index.html & Mock chrome.storage.local"]
    ConfigStorage --> OpenMockPage["Navigate to http://localhost:8080/wiki (Loads page-snapshot.html)"]
    OpenMockPage --> ValidateEngine["Modernizer index.iife.js runs inside DOM context"]
    ValidateEngine --> Assertions{"Evaluate Assertions"}
    Assertions -- "Verify Visibility" --> Annotate["Draw red borders & inject comment badges in DOM"]
    Annotate --> Capture["Take Visual Screenshot & save to screenshots/"]
    Capture --> EndE2E(["Close Browser Context & Stop Server"])
```

### Key Execution Pillars:
- **Sandbox Isolation**: Playwright mounts the dynamic React build output directly from `extension/dist/`.
- **Zero-Internet Dependency**: Intercepted pages are served locally on `localhost:8080` using Node's native `http` module, resolving Playwright's content-script injection limitations.
- **Visual Annotations & Highlights**: The test suite inspects elements, injects overlay comment badges directly into the webpage, and captures visual evidence stored under `/screenshots/`.

---

## 3. Getting Started

### Prerequisites
Make sure you have Node.js (v18+) installed.

### Installation
Install test suite dependencies:
```bash
npm install
```

### Synchronize Documentation
Pull and rebuild central reference documentation:
```bash
npm run update-docs
```

### Execute E2E Tests
Run the Playwright E2E test suite:
```bash
npm run test:e2e
```
