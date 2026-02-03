# Implementation Plan: Support for Overdue Todo Items

**Branch**: `001-overdue-todos` | **Date**: 2026-02-03 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-overdue-todos/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Users need to quickly identify overdue tasks through visual styling (red text, warning icon ⚠️) based on due dates in the past. The feature must also preserve "completed late" status for todos that were overdue when marked complete, using a `wasOverdueWhenCompleted` boolean flag for historical tracking.

## Technical Context

**Language/Version**: JavaScript (Node.js 18+, React 18.2.0)
**Primary Dependencies**: React, Express, better-sqlite3, axios
**Storage**: SQLite (better-sqlite3) - backend already uses in-memory database
**Testing**: Jest with React Testing Library (frontend), Jest with supertest (backend)
**Target Platform**: Web (browser-based React SPA + Node.js backend)
**Project Type**: Web application (monorepo with frontend/backend packages)
**Performance Goals**: <100ms for overdue status calculation, immediate visual feedback on page load
**Constraints**: Client-side date calculations using browser local time, 80%+ test coverage maintained
**Scale/Scope**: Small feature (~5-10 files modified, 2 new database columns, visual styling updates)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Single Responsibility ✅ PASS
- Overdue calculation logic isolated in service layer
- Visual presentation handled by presentational components
- Data persistence handled by backend service
- Each component has one clear responsibility

### II. Test-First Development ✅ PASS
- Tests required for overdue calculation logic
- Tests required for visual rendering of overdue items
- Tests required for "completed late" flag persistence
- Integration tests for complete user workflows
- Target: 80%+ coverage maintained

### III. Code Quality Standards ✅ PASS
- Follow existing project conventions (2-space indent, camelCase/PascalCase)
- ESLint compliance required
- Organized imports: external → internal → styles
- Colocated tests in `__tests__/` directories

### IV. DRY and KISS ✅ PASS
- Date comparison logic extracted to utility function
- Simple boolean calculation (due date < current date)
- No premature optimization
- Reuse existing styling system (theme.css)

### V. SOLID Architecture ✅ PASS
- Open/Closed: Extend TodoCard component via props, not modification
- Interface Segregation: Pass only necessary overdue props
- Dependency Inversion: Inject date service for testability

### VI. Error Handling ✅ PASS
- Gracefully handle invalid due dates (treat as no due date)
- Validate date format at API boundaries
- User-friendly error messages if date operations fail

### VII. Git Commit Discipline ✅ PASS
- Atomic commits: backend changes, frontend changes, styling, tests
- Clear commit messages following `type: description` format
- Feature branch: `001-overdue-todos`

**GATE STATUS**: ✅ ALL CHECKS PASSED - Proceed to Phase 0

## Project Structure

### Documentation (this feature)

```text
specs/001-overdue-todos/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
packages/backend/
├── src/
│   ├── app.js                    # Existing - may need route updates
│   ├── index.js                  # Existing - no changes
│   └── services/
│       └── todoService.js        # MODIFY - add wasOverdueWhenCompleted field
└── __tests__/
    └── app.test.js               # MODIFY - add tests for new field

packages/frontend/
├── src/
│   ├── App.js                    # Existing - no changes
│   ├── components/
│   │   ├── TodoCard.js           # MODIFY - add overdue visual styling
│   │   ├── TodoForm.js           # Existing - no changes
│   │   ├── TodoList.js           # MODIFY - calculate overdue status
│   │   └── __tests__/
│   │       ├── TodoCard.test.js  # MODIFY - test overdue rendering
│   │       └── TodoList.test.js  # MODIFY - test overdue calculation
│   ├── services/
│   │   └── todoService.js        # Existing - may need minor updates
│   └── styles/
│       └── theme.css             # MODIFY - add overdue styling
└── setupTests.js                 # Existing - no changes
```

**Structure Decision**: This is a web application with separate frontend (React) and backend (Node.js/Express) packages. The feature requires modifications to existing components rather than new files. Changes are isolated to:
- Backend: Add `wasOverdueWhenCompleted` field to todo model and service
- Frontend: Add overdue calculation logic, visual styling, and icon rendering
- Tests: Comprehensive coverage for all new logic paths

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations detected. All constitution principles are satisfied by this feature implementation.
