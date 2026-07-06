# Legal Relationship Diagram Studio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create an independent development project for the legal relationship diagram editor without modifying the prototype or source material directories.

**Architecture:** Start by migrating the verified React + TypeScript + SVG editor into a new clean project directory. Keep the current feature set intact first, then use this project as the base for future modularization.

**Tech Stack:** React, TypeScript, Vite, SVG, browser localStorage, JSON import/export.

---

### Task 1: Bootstrap Project

**Files:**
- Create: `E:/codex/legal-relationship-diagram-studio/package.json`
- Create: `E:/codex/legal-relationship-diagram-studio/src/`
- Create: `E:/codex/legal-relationship-diagram-studio/README.md`
- Create: `E:/codex/legal-relationship-diagram-studio/LEGAL_DIAGRAM_SKILL.md`

- [x] **Step 1: Create a standalone project directory**

Use `E:/codex/legal-relationship-diagram-studio` as the new project root so the old prototype and source material directory remain unchanged.

- [x] **Step 2: Migrate verified source files**

Copy the previously verified Vite React project files into the new project.

- [x] **Step 3: Rename the package**

Set `package.json` name to `legal-relationship-diagram-studio`.

- [x] **Step 4: Install dependencies**

Run:

```bash
pnpm install
```

Expected: dependencies install without errors.

- [x] **Step 5: Build**

Run:

```bash
pnpm run build
```

Expected: TypeScript and Vite build both pass.

- [x] **Step 6: Start development server**

Run:

```bash
pnpm run dev
```

Expected: local preview URL is available for the user.
