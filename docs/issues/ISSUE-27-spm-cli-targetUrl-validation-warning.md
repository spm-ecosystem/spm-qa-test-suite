# Issue #27: Compiler Validation Warning for Missing Root `targetUrl` Field

- **Repository**: `spm-cli` (`src/commands/compile.hpp`, `src/veneer/parser.cpp`)
- **Defect Mapping**: `DEFECT-SIG-04`
- **Severity**: Important
- **Status**: Open

## 1. Problem Description

In `spm-cli`, compiling a Veneer spec (`.vnr`) that lacks a root-level `targetUrl` property currently succeeds without emitting any compiler warning or error. However, `docs/manifest-schema.md` marks `targetUrl` as a required root property for extension theme matching and Worker R2 publishing.

## 2. Technical Requirements

- Update `spm-cli` Veneer compiler parser/resolver:
  - Check if `manifest.targetUrl` is empty or missing after parsing all `.vnr` files in a theme project.
  - If missing, emit a clear compiler warning: `[Compiler Warning] Manifest lacks required root 'targetUrl' property. Extension theme matching may fail at runtime.`
  - If `--strict` flag is set on `spm compile`, treat missing `targetUrl` as a fatal compilation error.

## 3. Dependencies & Sub-issues

- **Prerequisites**: `spm compile` CLI command in `spm-cli`.
- **Related Issues**:
  - `ISSUE-27.1`: Add `--strict` flag to `spm compile`.

## 4. Acceptance Criteria & Test Plan

- [ ] `spm compile` outputs a compiler warning when compiling `.vnr` projects lacking `targetUrl`.
- [ ] CTest unit test added in `src/veneer/test_resolver.cpp`.
