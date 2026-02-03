# Tasks: Support for Overdue Todo Items

**Feature**: 001-overdue-todos | **Date**: 2026-02-03
**Input**: Design documents from `/specs/001-overdue-todos/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: NOT included (not requested in specification)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Path Conventions

This is a web application with monorepo structure:
- Backend: `packages/backend/src/`
- Frontend: `packages/frontend/src/`
- Tests colocated in `__tests__/` directories

---

## Phase 1: Setup (Database Infrastructure)

**Purpose**: Prepare database schema for new field

- [ ] T001 Apply database migration to add wasOverdueWhenCompleted column to todos table in packages/backend/src/services/todoService.js

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core backend logic that MUST be complete before frontend can use the feature

**⚠️ CRITICAL**: Frontend work cannot begin until backend is complete and deployed

- [ ] T002 Update createTodo() method to initialize wasOverdueWhenCompleted=false in packages/backend/src/services/todoService.js
- [ ] T003 Update updateTodo() method to set wasOverdueWhenCompleted flag on completion in packages/backend/src/services/todoService.js
- [ ] T004 Add backend test for creating todo with wasOverdueWhenCompleted=false in packages/backend/__tests__/app.test.js
- [ ] T005 [P] Add backend test for completing overdue todo sets flag to true in packages/backend/__tests__/app.test.js
- [ ] T006 [P] Add backend test for completing on-time todo keeps flag false in packages/backend/__tests__/app.test.js
- [ ] T007 [P] Add backend test for uncompleting todo resets flag to false in packages/backend/__tests__/app.test.js

**Checkpoint**: Backend ready - frontend implementation can now begin

---

## Phase 3: User Story 1 - Visual Identification of Overdue Todos (Priority: P1) 🎯 MVP

**Goal**: Users can immediately identify overdue todos through distinct visual styling (red text + ⚠️ icon) without manually comparing due dates.

**Independent Test**: Create a todo with a past due date via the UI, verify it displays with red text and ⚠️ icon in the todo list. Create todos with today's date, future dates, and no dates - verify they do NOT show overdue styling.

### Implementation for User Story 1

- [ ] T008 [P] [US1] Create isOverdue utility function in packages/frontend/src/utils/ (or inline in TodoList.js)
- [ ] T009 [P] [US1] Add CSS classes for overdue styling (.todo-overdue) in packages/frontend/src/styles/theme.css
- [ ] T010 [US1] Update TodoList component to calculate isOverdue status for each todo in packages/frontend/src/components/TodoList.js
- [ ] T011 [US1] Update TodoCard component to accept overdue prop and render red text + ⚠️ icon when true in packages/frontend/src/components/TodoCard.js
- [ ] T012 [US1] Add aria-label to warning icon for accessibility in packages/frontend/src/components/TodoCard.js
- [ ] T013 [US1] Add test for isOverdue() function with past/present/future/null dates in packages/frontend/src/components/__tests__/TodoList.test.js or packages/frontend/src/__tests__/
- [ ] T014 [P] [US1] Add test for TodoCard rendering warning icon when overdue prop is true in packages/frontend/src/components/__tests__/TodoCard.test.js
- [ ] T015 [P] [US1] Add test for TodoCard NOT showing overdue styling for future/current dates in packages/frontend/src/components/__tests__/TodoCard.test.js
- [ ] T016 [P] [US1] Add test for TodoList passing correct overdue prop to TodoCard in packages/frontend/src/components/__tests__/TodoList.test.js

**Checkpoint**: At this point, User Story 1 should be fully functional - overdue todos are visually distinct in the UI

---

## Phase 4: User Story 2 - Overdue Status Persists After Completion (Priority: P2)

**Goal**: Users can see if a completed todo was completed after its due date, maintaining historical context about task completion timeliness.

**Independent Test**: Create a todo with a past due date, mark it as complete via the UI, verify it displays with "completed late" styling (orange text with strikethrough or similar theme-appropriate indication).

### Implementation for User Story 2

- [ ] T017 [US2] Add CSS classes for completed-late styling (.todo-completed-late) in packages/frontend/src/styles/theme.css
- [ ] T018 [US2] Update TodoCard component to check wasOverdueWhenCompleted flag and render completed-late styling in packages/frontend/src/components/TodoCard.js
- [ ] T019 [US2] Add test for TodoCard showing completed-late styling when completed=true and wasOverdueWhenCompleted=true in packages/frontend/src/components/__tests__/TodoCard.test.js
- [ ] T020 [P] [US2] Add test for TodoCard NOT showing completed-late styling when completed on time in packages/frontend/src/components/__tests__/TodoCard.test.js
- [ ] T021 [P] [US2] Add integration test for complete workflow: create overdue todo → mark complete → verify wasOverdueWhenCompleted flag in packages/backend/__tests__/app.test.js or packages/frontend/src/__tests__/

**Checkpoint**: At this point, both User Stories 1 AND 2 should work - users can identify overdue todos AND see historical "completed late" status

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T022 [P] Verify color contrast meets WCAG AA standards for overdue and completed-late styling in both light and dark modes
- [ ] T023 [P] Test visual styling integration with Halloween theme (orange/red color palette)
- [ ] T024 Validate all edge cases from spec.md: invalid dates, null dates, midnight transitions
- [ ] T025 Run quickstart.md validation scenarios to confirm all acceptance criteria are met
- [ ] T026 [P] Update project documentation if needed in docs/

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all frontend work
- **User Story 1 (Phase 3)**: Depends on Foundational (Phase 2) completion - this is the MVP
- **User Story 2 (Phase 4)**: Depends on Foundational (Phase 2) completion - can be developed in parallel with US1 or after
- **Polish (Phase 5)**: Depends on desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Independent of US1 (uses same backend changes)

### Within Each User Story

**User Story 1**:
1. Utility function + CSS styling can be done in parallel (T008, T009)
2. TodoList update (T010) depends on utility function (T008)
3. TodoCard update (T011, T012) can be done after CSS (T009) is available
4. Tests (T013-T016) can be written in parallel after implementation

**User Story 2**:
1. CSS styling (T017) can be done in parallel with tests
2. TodoCard update (T018) depends on CSS (T017)
3. Tests (T019-T021) can be written in parallel after implementation

### Parallel Opportunities

- **Phase 1**: Single task, cannot parallelize
- **Phase 2**: T004-T007 (backend tests) can run in parallel after T002-T003 complete
- **Phase 3 (US1)**: 
  - T008 (utility) and T009 (CSS) can run in parallel
  - T014, T015, T016 (tests) can run in parallel after implementation
- **Phase 4 (US2)**:
  - T019, T020, T021 (tests) can run in parallel after T018 complete
- **Phase 5**: T022, T023, T026 (polish tasks) can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch CSS and utility function together:
Task: "Create isOverdue utility function in packages/frontend/src/utils/"
Task: "Add CSS classes for overdue styling in packages/frontend/src/styles/theme.css"

# After implementation is done, launch all tests together:
Task: "Add test for TodoCard rendering warning icon when overdue prop is true"
Task: "Add test for TodoCard NOT showing overdue styling for future/current dates"
Task: "Add test for TodoList passing correct overdue prop to TodoCard"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (database migration)
2. Complete Phase 2: Foundational (backend logic and tests)
3. Complete Phase 3: User Story 1 (visual identification)
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

**This delivers core value**: Users can now immediately identify overdue todos

### Incremental Delivery

1. Complete Setup + Foundational → Backend ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP! 🎯)
3. Add User Story 2 → Test independently → Deploy/Demo (Enhanced with historical tracking)
4. Complete Polish → Final polish and validation

### Parallel Team Strategy

With multiple developers:

1. **Together**: Complete Setup + Foundational (Phase 1 + Phase 2)
2. **Split work** (once Foundational is done):
   - Developer A: User Story 1 (visual identification)
   - Developer B: User Story 2 (completed late status)
3. Stories complete and integrate independently
4. **Together**: Phase 5 polish and validation

---

## Notes

- **[P]** tasks = different files, no dependencies, can run in parallel
- **[Story]** label maps task to specific user story (US1, US2) for traceability
- Each user story should be independently completable and testable
- Backend changes in Phase 2 support BOTH user stories
- Focus on MVP (US1) first for fastest time to value
- US2 can be delivered as an enhancement after MVP
- Commit after each task or logical group
- Stop at checkpoints to validate story independently
- All tests included per Project Constitution (80%+ coverage requirement)

---

## Summary

**Total Tasks**: 26
- Phase 1 (Setup): 1 task
- Phase 2 (Foundational): 6 tasks (backend)
- Phase 3 (User Story 1): 9 tasks (frontend + tests)
- Phase 4 (User Story 2): 5 tasks (frontend + tests)
- Phase 5 (Polish): 5 tasks

**Parallel Opportunities**: 14 tasks marked [P] can run in parallel within their phase

**MVP Scope**: Phases 1-3 (16 tasks) deliver User Story 1 - core visual identification feature

**Independent Test Criteria**:
- **US1**: Create todo with past due date → see red text + ⚠️ icon
- **US2**: Mark overdue todo complete → see "completed late" styling

**Implementation Notes**:
- Simple, focused implementation using native JavaScript Date API
- No new dependencies required
- Leverages existing React + Express + SQLite stack
- Client-side overdue calculation with backend persistence of completion status
- All changes follow Single Responsibility Principle and project constitution
