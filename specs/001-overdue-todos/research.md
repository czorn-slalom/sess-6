# Research: Support for Overdue Todo Items

**Feature**: 001-overdue-todos | **Date**: 2026-02-03

## Overview

This document consolidates research findings and technical decisions for implementing overdue todo item support in the todo application. All technical context details were successfully resolved from existing codebase analysis.

## Technical Stack Validation

### Decision: Use existing React + Node.js + SQLite stack
**Rationale**: The project already has a working monorepo with React 18.2.0 frontend and Node.js backend using better-sqlite3 for storage. Adding overdue functionality requires minimal new dependencies.

**Alternatives considered**:
- Adding date library (e.g., date-fns, moment.js) - REJECTED: Native JavaScript Date is sufficient for simple date comparisons
- Moving to PostgreSQL - REJECTED: SQLite is adequate for feature requirements, no migration needed

## Date Handling Strategy

### Decision: Client-side date calculations using browser local time
**Rationale**: 
- Feature spec explicitly states "System MUST use the browser's local date/time to determine if a todo is overdue" (FR-008)
- Simpler implementation with no timezone complexities
- Matches user's perception of "today" vs "yesterday"
- Backend stores due dates as ISO strings, frontend calculates overdue status

**Alternatives considered**:
- Server-side calculation with UTC - REJECTED: Spec requires browser local time
- Storing timezone with each todo - REJECTED: Adds unnecessary complexity for current requirements

**Best practices**:
- Use `new Date()` for current date (browser local time)
- Compare dates using `date1 < date2` after normalizing to midnight (00:00:00)
- Store dates as ISO 8601 strings in database (e.g., "2026-02-01")
- Parse dates with `new Date(dateString)` and validate with `isNaN(date.getTime())`

## Data Model Extension

### Decision: Add `wasOverdueWhenCompleted` boolean field to todo model
**Rationale**:
- Feature spec requires preserving "completed late" status (FR-007, FR-011, FR-012)
- Boolean flag is simplest approach for this requirement
- Set to `true` when marking an overdue todo as complete
- Persisted in SQLite database for historical tracking

**Alternatives considered**:
- Calculate at render time using `completedAt` and `dueDate` - REJECTED: Spec explicitly requires persisting the flag
- Storing completion lateness in days - REJECTED: Only need binary late/on-time distinction per spec
- Adding `overdueAt` timestamp - REJECTED: Over-engineering, boolean flag is sufficient

**Schema change**:
```sql
ALTER TABLE todos ADD COLUMN wasOverdueWhenCompleted INTEGER DEFAULT 0;
```
(SQLite uses INTEGER for boolean: 0 = false, 1 = true)

## Visual Styling Approach

### Decision: CSS classes + emoji warning icon ⚠️
**Rationale**:
- Spec requires red text color and warning icon (FR-002, clarification from 2026-02-03)
- Project already uses theme.css for centralized styling
- Emoji icon ⚠️ is simple, accessible, no additional icon library needed
- Works in both light and dark modes (emoji renders consistently)

**Alternatives considered**:
- Icon library (Font Awesome, Material Icons) - REJECTED: Adds dependency, emoji is sufficient
- SVG icons - REJECTED: More complex, emoji is simpler for single icon use case
- Different icon (🚨, ⏰, ❗) - REJECTED: ⚠️ is universally recognized as warning/attention

**CSS approach**:
```css
.todo-overdue {
  color: var(--halloween-red); /* Consistent with Halloween theme */
}

.todo-completed-late {
  color: var(--halloween-orange); /* Softer indication for completed items */
  text-decoration: line-through;
}
```

**Accessibility**:
- Warning icon must have aria-label="Overdue" per FR-013
- Color not sole indicator (icon provides redundancy)
- Sufficient color contrast for WCAG AA compliance

## Testing Strategy

### Decision: Jest + React Testing Library (frontend), Jest + supertest (backend)
**Rationale**: Project already uses these tools with established patterns

**Test coverage areas**:
1. **Unit tests**:
   - Overdue calculation logic (various date scenarios)
   - wasOverdueWhenCompleted flag setting on completion
   - Visual rendering of overdue styling and icon
   - Edge cases: invalid dates, null dates, midnight transitions

2. **Integration tests**:
   - Complete workflow: create todo → becomes overdue → mark complete
   - API persistence of wasOverdueWhenCompleted flag
   - Rendering of completed late todos

3. **Component tests**:
   - TodoCard renders overdue styling when date is past
   - TodoCard does not show overdue for future/current dates
   - TodoList calculates and passes overdue prop correctly

**Best practices**:
- Mock Date in tests for deterministic results
- Test boundary conditions (midnight, today, yesterday, tomorrow)
- Verify both visual output and underlying data state

## Performance Considerations

### Decision: Calculate overdue status at render time (TodoList component)
**Rationale**:
- Simple comparison operation: O(1) per todo
- No expensive computations or external calls
- Performance goal <100ms easily achievable for typical list sizes (<1000 items)
- Recalculated on each render ensures status stays current

**Alternatives considered**:
- Backend calculation on fetch - REJECTED: Spec requires browser local time
- Caching/memoization - REJECTED: Premature optimization, not needed for current scale
- WebWorkers for calculation - REJECTED: Massive over-engineering for simple comparison

## Error Handling Strategy

### Decision: Treat invalid dates as "no due date"
**Rationale**:
- Graceful degradation approach
- Prevents crashes from malformed data
- Clear mental model: if we can't parse date, treat as if there isn't one
- Edge case behavior documented in spec

**Implementation**:
```javascript
function isOverdue(dueDate) {
  if (!dueDate) return false;
  const due = new Date(dueDate);
  if (isNaN(due.getTime())) return false; // Invalid date
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  return due < today;
}
```

## Halloween Theme Integration

### Decision: Use existing CSS custom properties from theme.css
**Rationale**:
- Spec requires consistency with Halloween theme (FR-009)
- Project already has themed color palette
- Must work in both light and dark modes (FR-010)

**Color selection**:
- Overdue todos: Use existing `--halloween-red` or similar theme color
- Completed late: Use `--halloween-orange` for softer indication
- Ensure contrast ratios meet accessibility standards

## Dependencies Assessment

**No new dependencies required**:
- ✅ Date handling: Native JavaScript Date API
- ✅ Icons: Emoji ⚠️ (no icon library needed)
- ✅ Testing: Existing Jest + React Testing Library + supertest
- ✅ Styling: Existing CSS/theme system
- ✅ Database: Existing better-sqlite3

**Development approach**:
- Leverage existing patterns and conventions
- Minimal code changes to achieve requirements
- Follow KISS principle: simple, direct implementation

## Migration Considerations

**Database migration**:
- Add `wasOverdueWhenCompleted` column with default value 0
- No data backfill needed (historical todos won't have this flag)
- Backward compatible: existing todos work without modification

**Deployment**:
- No breaking changes to API contracts
- Existing todos without wasOverdueWhenCompleted field default to false
- Can be deployed incrementally without coordination requirements

## Summary

All technical decisions align with project constitution and feature requirements. The implementation leverages existing infrastructure without adding unnecessary complexity or dependencies. Date calculations use browser local time as specified, visual styling integrates with the Halloween theme, and the `wasOverdueWhenCompleted` flag provides simple persistence for historical tracking.

**Key takeaways**:
- Simple, focused implementation using native APIs
- No new dependencies required
- Clear separation of concerns (calculation, presentation, persistence)
- Comprehensive test coverage planned
- Backward compatible with existing data
