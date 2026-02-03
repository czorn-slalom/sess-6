# Data Model: Support for Overdue Todo Items

**Feature**: 001-overdue-todos | **Date**: 2026-02-03

## Overview

This document defines the data model changes required to support overdue todo item identification and "completed late" status tracking. The changes extend the existing Todo entity with one new persisted field.

## Entities

### Todo (Modified)

The Todo entity represents a task item in the user's todo list. This feature adds one new field to track historical overdue status at completion time.

**Attributes**:

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| id | Integer | Yes | Auto-increment | Unique identifier for the todo |
| title | String | Yes | - | The todo item's title/description |
| dueDate | String (ISO 8601) | No | null | Due date in format "YYYY-MM-DD" |
| completed | Boolean | Yes | false | Whether the todo is completed |
| completedAt | String (ISO timestamp) | No | null | Timestamp when todo was marked complete |
| **wasOverdueWhenCompleted** | **Boolean** | **Yes** | **false** | **NEW: Flag indicating if todo was overdue at completion time** |

**New Field Details**:

- **wasOverdueWhenCompleted**:
  - Purpose: Preserve historical context about task completion timeliness
  - Set to `true` when user marks a todo as complete AND the todo's dueDate is in the past (before current date)
  - Set to `false` when user marks a todo as complete AND the todo was NOT overdue (future/current due date or no due date)
  - Once set at completion, this value does not change even if due date is later modified
  - Used by frontend to display "completed late" visual indication
  - Storage: SQLite INTEGER (0 = false, 1 = true) per SQLite boolean conventions

**Validation Rules**:

1. `dueDate` must be valid ISO 8601 date string (YYYY-MM-DD) or null
2. `dueDate` format validation at API boundaries
3. Invalid `dueDate` values treated as null (no due date)
4. `wasOverdueWhenCompleted` can only be set to true if `completed` is true
5. `wasOverdueWhenCompleted` immutable once set (not recalculated if dates change)

**State Transitions**:

```
┌─────────────────────────────────────────────────────────────┐
│ Initial State                                                │
│ - completed: false                                           │
│ - wasOverdueWhenCompleted: false                            │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ├─→ User marks complete (dueDate is past)
                     │   ├─ completed: true
                     │   ├─ completedAt: current timestamp
                     │   └─ wasOverdueWhenCompleted: true
                     │
                     ├─→ User marks complete (dueDate is today/future/null)
                     │   ├─ completed: true
                     │   ├─ completedAt: current timestamp
                     │   └─ wasOverdueWhenCompleted: false
                     │
                     └─→ User uncompletes todo
                         ├─ completed: false
                         ├─ completedAt: null
                         └─ wasOverdueWhenCompleted: false (reset)
```

**Business Rules**:

1. **Overdue Calculation** (not persisted, calculated at render time):
   - A todo is considered "overdue" if:
     - `completed` is false AND
     - `dueDate` is not null AND
     - `dueDate` < current date (browser local time, midnight normalized)
   - Overdue status is NOT persisted, only calculated for display

2. **Completed Late Indication** (persisted):
   - Display "completed late" styling if:
     - `completed` is true AND
     - `wasOverdueWhenCompleted` is true
   - This preserves historical accuracy even if due date is later modified

3. **Edge Cases**:
   - Invalid `dueDate`: Treat as no due date, never overdue
   - Null `dueDate`: Never overdue
   - Due date is today: NOT overdue (only past dates are overdue per FR-003)
   - Midnight transitions: Require page refresh to update overdue status

## Database Schema Changes

### Migration: Add wasOverdueWhenCompleted column

**SQLite DDL**:
```sql
-- Add new column with default value
ALTER TABLE todos ADD COLUMN wasOverdueWhenCompleted INTEGER DEFAULT 0;

-- Note: SQLite uses INTEGER for boolean: 0 = false, 1 = true
-- Default value 0 ensures backward compatibility with existing todos
```

**Backward Compatibility**:
- Existing todos will have `wasOverdueWhenCompleted` = 0 (false) by default
- No data backfill required
- Existing application code will work without modification (new field is additive)

**Migration Strategy**:
1. Apply schema change to database
2. Deploy backend code that populates field on todo completion
3. Deploy frontend code that uses field for display
4. No downtime required (backward compatible change)

## API Contract Updates

### GET /todos

**Response** (modified):
```json
{
  "todos": [
    {
      "id": 1,
      "title": "Complete project documentation",
      "dueDate": "2026-02-01",
      "completed": true,
      "completedAt": "2026-02-02T10:30:00Z",
      "wasOverdueWhenCompleted": true
    },
    {
      "id": 2,
      "title": "Review code",
      "dueDate": "2026-02-10",
      "completed": false,
      "completedAt": null,
      "wasOverdueWhenCompleted": false
    }
  ]
}
```

**Changes**: Added `wasOverdueWhenCompleted` boolean field to each todo object.

### POST /todos

**Request** (unchanged):
```json
{
  "title": "New todo item",
  "dueDate": "2026-02-15"
}
```

**Response** (modified):
```json
{
  "id": 3,
  "title": "New todo item",
  "dueDate": "2026-02-15",
  "completed": false,
  "completedAt": null,
  "wasOverdueWhenCompleted": false
}
```

**Changes**: Added `wasOverdueWhenCompleted` field (always false for new todos).

### PUT /todos/:id

**Request** (modified):
```json
{
  "completed": true
}
```

**Backend Logic** (new):
```javascript
// When marking todo as complete
if (completed === true && !todo.completed) {
  const isOverdue = todo.dueDate && new Date(todo.dueDate) < new Date();
  todo.wasOverdueWhenCompleted = isOverdue;
  todo.completedAt = new Date().toISOString();
}

// When marking todo as incomplete
if (completed === false) {
  todo.wasOverdueWhenCompleted = false;
  todo.completedAt = null;
}
```

**Response** (modified):
```json
{
  "id": 1,
  "title": "Complete project documentation",
  "dueDate": "2026-02-01",
  "completed": true,
  "completedAt": "2026-02-03T14:22:00Z",
  "wasOverdueWhenCompleted": true
}
```

**Changes**: 
- Backend now sets `wasOverdueWhenCompleted` based on overdue status at completion time
- Field resets to false when uncompleting a todo

### DELETE /todos/:id

**No changes** - deletes entire todo including new field.

## Frontend Calculated Properties

The following properties are calculated at render time and are NOT persisted:

### isOverdue (calculated)

**Definition**:
```javascript
function isOverdue(todo) {
  if (todo.completed) return false;
  if (!todo.dueDate) return false;
  
  const dueDate = new Date(todo.dueDate);
  if (isNaN(dueDate.getTime())) return false; // Invalid date
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  dueDate.setHours(0, 0, 0, 0);
  
  return dueDate < today;
}
```

**Usage**: Determines whether to apply overdue visual styling (red text, ⚠️ icon).

### isCompletedLate (from persisted field)

**Definition**:
```javascript
function isCompletedLate(todo) {
  return todo.completed && todo.wasOverdueWhenCompleted;
}
```

**Usage**: Determines whether to show "completed late" indication.

## Data Flow

```
User Action: Mark Todo as Complete
       ↓
Frontend: PUT /todos/:id { completed: true }
       ↓
Backend: 
  1. Check if todo.dueDate < currentDate
  2. Set wasOverdueWhenCompleted = true/false
  3. Set completed = true
  4. Set completedAt = current timestamp
  5. Save to database
       ↓
Frontend: Receive updated todo
       ↓
Component: Calculate display state
  - if completed && wasOverdueWhenCompleted: show "completed late" styling
  - else if !completed && isOverdue: show overdue styling
  - else: show normal styling
       ↓
User sees appropriate visual indication
```

## Testing Considerations

**Data scenarios to test**:

1. **Overdue calculation**:
   - Todo with past due date → isOverdue = true
   - Todo with today's due date → isOverdue = false
   - Todo with future due date → isOverdue = false
   - Todo with null due date → isOverdue = false
   - Completed todo with past due date → isOverdue = false

2. **wasOverdueWhenCompleted persistence**:
   - Mark overdue todo complete → wasOverdueWhenCompleted = true
   - Mark non-overdue todo complete → wasOverdueWhenCompleted = false
   - Uncomplete todo → wasOverdueWhenCompleted = false
   - Modify due date after completion → wasOverdueWhenCompleted unchanged

3. **Edge cases**:
   - Invalid date string → treated as no due date
   - Midnight boundary → dates normalized to 00:00:00 for comparison
   - Time zone changes → uses browser local time (no special handling)

## Summary

The data model extension is minimal and focused:
- **One new field**: `wasOverdueWhenCompleted` (boolean)
- **One new calculated property**: `isOverdue` (not persisted)
- **Backward compatible**: Existing todos work without modification
- **Simple state management**: Clear rules for when field is set/reset
- **Frontend responsibility**: Calculate overdue status at render time
- **Backend responsibility**: Persist wasOverdueWhenCompleted at completion time

This approach maintains simplicity while meeting all functional requirements for overdue todo identification and historical tracking.
