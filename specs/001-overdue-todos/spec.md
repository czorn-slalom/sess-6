# Feature Specification: Support for Overdue Todo Items

**Feature Branch**: `1-overdue-todos`  
**Created**: 2026-02-03  
**Status**: Draft  
**Input**: User description: "Support for Overdue Todo Items - As a todo application user I want to easily identify and distinguish overdue tasks in my todo list so that I can prioritize my work and quickly see which tasks are past their due date"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Visual Identification of Overdue Todos (Priority: P1)

Users can immediately identify overdue todos through distinct visual styling without needing to manually compare due dates against today's date.

**Why this priority**: This is the core value proposition of the feature. Users need immediate visual feedback to prioritize their work effectively. Without this, the feature provides no value.

**Independent Test**: Can be fully tested by creating a todo with a past due date and verifying it displays with distinct visual styling (e.g., red text, warning icon) in the todo list.

**Acceptance Scenarios**:

1. **Given** I have a todo with a due date of yesterday, **When** I view the todo list, **Then** the overdue todo is displayed with distinct visual styling (red text color)
2. **Given** I have a todo with a due date of today, **When** I view the todo list, **Then** the todo is NOT marked as overdue (only past dates are overdue)
3. **Given** I have a todo with a due date in the future, **When** I view the todo list, **Then** the todo is NOT marked as overdue
4. **Given** I have a todo with no due date, **When** I view the todo list, **Then** the todo is NOT marked as overdue
5. **Given** I have multiple todos with various due dates (past, present, future, none), **When** I view the todo list, **Then** only todos with past due dates are visually marked as overdue

---

### User Story 2 - Overdue Status Persists After Completion (Priority: P2)

Users can see if a completed todo was completed after its due date, maintaining historical context about task completion timeliness.

**Why this priority**: Provides useful historical information without being critical for immediate task management. Users can still use the core overdue feature without this enhancement.

**Independent Test**: Can be tested by marking an overdue todo as complete and verifying the visual indication of "completed late" status is preserved.

**Acceptance Scenarios**:

1. **Given** I have an overdue todo (due date in the past, not completed), **When** I mark it as complete, **Then** it shows visual indication that it was completed after the due date
2. **Given** I have a todo with today's due date, **When** I mark it as complete today, **Then** it shows as completed on time (no overdue indication)
3. **Given** I have a todo with a future due date, **When** I mark it as complete, **Then** it shows as completed early (no overdue indication)
4. **Given** I have a completed todo that was marked complete before its due date, **When** I view it, **Then** it does NOT show overdue status

---

### Edge Cases

- What happens when a todo's due date becomes overdue while the user is viewing the list? (Page requires refresh to update overdue status)
- What happens when the system date changes (e.g., user travels across time zones)? (Overdue status calculated based on browser's local date)
- What happens with todos created with invalid dates? (Treated as having no due date, never marked overdue)
- What happens at exactly midnight when a todo transitions from "due today" to "overdue"? (Requires page refresh to see updated status)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST calculate whether a todo is overdue by comparing its due date to the current date
- **FR-002**: System MUST display overdue todos with distinct visual styling (red text color) to differentiate them from non-overdue todos
- **FR-003**: System MUST only mark todos as overdue if their due date is in the past (before today)
- **FR-004**: System MUST NOT mark todos as overdue if they have no due date
- **FR-005**: System MUST NOT mark todos as overdue if their due date is today or in the future
- **FR-006**: System MUST recalculate overdue status when the todo list is loaded/refreshed
- **FR-007**: System MUST preserve the "completed late" status for todos that were overdue when marked complete
- **FR-008**: System MUST use the browser's local date/time to determine if a todo is overdue
- **FR-009**: Visual styling for overdue todos MUST be consistent with the Halloween theme (orange/red color palette)
- **FR-010**: Visual styling for overdue todos MUST work in both light and dark modes

### Key Entities

- **Todo**: Existing entity with the following relevant attributes:
  - `dueDate`: Date string (ISO format, optional)
  - `completed`: Boolean indicating completion status
  - `completedAt`: Timestamp when todo was marked complete (if applicable)
  
- **Overdue Status**: Calculated property (not persisted) determined by:
  - Current date from browser
  - Todo's `dueDate` value
  - Todo's `completed` status

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can identify overdue todos within 1 second of viewing the todo list (visual distinction is immediate and clear)
- **SC-002**: 100% of todos with past due dates are visually marked as overdue
- **SC-003**: 0% of todos without due dates or with future/current due dates are incorrectly marked as overdue
- **SC-004**: Overdue visual styling is clearly visible in both light and dark mode
- **SC-005**: Users no longer need to manually check individual due dates to identify overdue tasks

## Assumptions

- The existing todo data model already includes a `dueDate` field
- The frontend has access to the current browser date for comparison
- The application uses the browser's local time zone for date calculations
- No server-side calculation of overdue status is required (client-side calculation only)
- No sorting or filtering by overdue status is required (just visual indication)
- No notifications or reminders for overdue todos are needed (visual indication only)

## Out of Scope

- Automatic sorting of overdue todos to the top of the list
- Filtering to show only overdue todos
- Email notifications or push notifications for overdue todos
- Snooze or reschedule functionality for overdue todos
- Overdue analytics or reporting
- Bulk operations on overdue todos
- Custom user-defined overdue thresholds or warning periods
