# Quickstart Guide: Overdue Todos Feature

**Feature**: 001-overdue-todos | **Date**: 2026-02-03

## Overview

This quickstart guide provides developers with everything needed to understand and implement the overdue todos feature. The feature adds visual identification of overdue tasks and tracks completion timeliness.

## Feature Summary

**What**: Visual identification of overdue todo items (red text + ⚠️ icon) with historical tracking of late completions.

**Why**: Users need immediate visual feedback to prioritize work without manually comparing due dates.

**How**: Client-side overdue calculation (due date < today) + backend persistence of `wasOverdueWhenCompleted` flag.

## Key Concepts

### Overdue Status (Calculated)

A todo is **overdue** when:
- ✅ `completed` is `false`
- ✅ `dueDate` exists (not null)
- ✅ `dueDate` is before today (browser local time, midnight normalized)

Visual styling: **Red text + ⚠️ icon before title**

### Completed Late Status (Persisted)

A todo was **completed late** when:
- ✅ `completed` is `true`
- ✅ `wasOverdueWhenCompleted` is `true`

Visual styling: **Orange text + strikethrough** (or similar theme-appropriate styling)

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│ Frontend (React)                                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  TodoList Component                                          │
│  ├─ Calculates isOverdue for each todo                      │
│  └─ Passes overdue prop to TodoCard                         │
│                                                              │
│  TodoCard Component                                          │
│  ├─ Renders overdue styling (red + ⚠️) if isOverdue         │
│  ├─ Renders completed late styling if wasOverdueWhenCompleted│
│  └─ Handles toggle completion                               │
│                                                              │
│  Utility: isOverdue(todo)                                    │
│  └─ Pure function: due date comparison logic                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                            ▲ │
                            │ │ HTTP (JSON)
                            │ ▼
┌─────────────────────────────────────────────────────────────┐
│ Backend (Node.js + Express)                                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  GET /api/todos                                              │
│  └─ Returns todos with wasOverdueWhenCompleted field        │
│                                                              │
│  PUT /api/todos/:id                                          │
│  ├─ When marking complete: calculate overdue status         │
│  ├─ Set wasOverdueWhenCompleted = (dueDate < now)          │
│  ├─ Set completedAt timestamp                               │
│  └─ Return updated todo                                      │
│                                                              │
│  POST /api/todos                                             │
│  └─ Create with wasOverdueWhenCompleted = false            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ Database (SQLite)                                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  todos table                                                 │
│  ├─ id (INTEGER PRIMARY KEY)                                │
│  ├─ title (TEXT)                                             │
│  ├─ dueDate (TEXT) - ISO 8601: "YYYY-MM-DD"                │
│  ├─ completed (INTEGER) - 0 or 1                            │
│  ├─ completedAt (TEXT) - ISO timestamp                      │
│  └─ wasOverdueWhenCompleted (INTEGER) - 0 or 1 [NEW]       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Implementation Checklist

### Phase 1: Backend Changes

- [ ] **Database Migration**
  ```sql
  ALTER TABLE todos ADD COLUMN wasOverdueWhenCompleted INTEGER DEFAULT 0;
  ```

- [ ] **Update todoService.js**
  - [ ] Modify `createTodo()` to initialize `wasOverdueWhenCompleted = false`
  - [ ] Modify `updateTodo()` to set `wasOverdueWhenCompleted` when completing
  - [ ] Logic: If marking complete AND dueDate < currentDate → set true
  - [ ] Logic: If uncompleting → reset to false

- [ ] **Write Backend Tests**
  - [ ] Test: Create todo has `wasOverdueWhenCompleted = false`
  - [ ] Test: Complete overdue todo sets `wasOverdueWhenCompleted = true`
  - [ ] Test: Complete on-time todo sets `wasOverdueWhenCompleted = false`
  - [ ] Test: Uncomplete resets `wasOverdueWhenCompleted = false`
  - [ ] Test: Field is not settable by client requests

### Phase 2: Frontend Changes

- [ ] **Create Utility Function** (src/utils/dateUtils.js or inline)
  ```javascript
  export function isOverdue(todo) {
    if (todo.completed) return false;
    if (!todo.dueDate) return false;
    
    const dueDate = new Date(todo.dueDate);
    if (isNaN(dueDate.getTime())) return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
    
    return dueDate < today;
  }
  ```

- [ ] **Update TodoList Component**
  - [ ] Calculate `isOverdue` for each todo
  - [ ] Pass as prop to TodoCard: `<TodoCard overdue={isOverdue(todo)} />`

- [ ] **Update TodoCard Component**
  - [ ] Accept `overdue` prop
  - [ ] Conditional rendering:
    - If `overdue`: Add CSS class + render ⚠️ icon
    - If `completed && wasOverdueWhenCompleted`: Add "completed late" class
  - [ ] Add aria-label to warning icon: "Overdue"

- [ ] **Update theme.css**
  ```css
  .todo-overdue {
    color: var(--halloween-red, #d32f2f);
  }
  
  .todo-completed-late {
    color: var(--halloween-orange, #ff6b35);
    text-decoration: line-through;
  }
  
  .overdue-icon {
    margin-right: 8px;
  }
  ```

- [ ] **Write Frontend Tests**
  - [ ] Test: isOverdue() function with various date scenarios
  - [ ] Test: TodoCard renders warning icon when overdue
  - [ ] Test: TodoCard does not show overdue for future/current dates
  - [ ] Test: TodoCard shows "completed late" styling
  - [ ] Test: TodoList passes correct overdue prop

### Phase 3: Integration Testing

- [ ] **End-to-End Scenarios**
  - [ ] Create todo with past due date → displays as overdue
  - [ ] Mark overdue todo complete → displays "completed late"
  - [ ] Create todo with future date → NOT displayed as overdue
  - [ ] Mark on-time todo complete → NOT displayed as "completed late"
  - [ ] Uncomplete todo → overdue status recalculates correctly

### Phase 4: Accessibility & Polish

- [ ] **Accessibility**
  - [ ] Warning icon has aria-label or alt text
  - [ ] Color contrast meets WCAG AA standards
  - [ ] Color is not sole indicator (icon provides redundancy)

- [ ] **Visual Polish**
  - [ ] Test in light mode
  - [ ] Test in dark mode
  - [ ] Verify Halloween theme integration
  - [ ] Ensure icon alignment and spacing

## Code Examples

### Backend: Set wasOverdueWhenCompleted on Completion

```javascript
// In todoService.js updateTodo() method

updateTodo(id, updates) {
  const todo = this.getTodoById(id);
  if (!todo) return null;
  
  // When marking as complete
  if (updates.completed === true && !todo.completed) {
    // Calculate overdue status at completion time
    const isOverdue = this.isOverdueAtTime(todo.dueDate);
    updates.wasOverdueWhenCompleted = isOverdue;
    updates.completedAt = new Date().toISOString();
  }
  
  // When uncompleting
  if (updates.completed === false) {
    updates.wasOverdueWhenCompleted = false;
    updates.completedAt = null;
  }
  
  Object.assign(todo, updates);
  return todo;
}

isOverdueAtTime(dueDate) {
  if (!dueDate) return false;
  
  const due = new Date(dueDate);
  if (isNaN(due.getTime())) return false;
  
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  
  return due < now;
}
```

### Frontend: TodoCard with Overdue Styling

```javascript
function TodoCard({ todo, onToggle, overdue }) {
  const isCompletedLate = todo.completed && todo.wasOverdueWhenCompleted;
  
  const cardClass = overdue
    ? 'todo-card todo-overdue'
    : isCompletedLate
    ? 'todo-card todo-completed-late'
    : 'todo-card';
  
  return (
    <div className={cardClass}>
      {overdue && (
        <span className="overdue-icon" aria-label="Overdue">
          ⚠️
        </span>
      )}
      <h3>{todo.title}</h3>
      <p>Due: {todo.dueDate || 'No due date'}</p>
      <button onClick={() => onToggle(todo.id)}>
        {todo.completed ? 'Uncomplete' : 'Complete'}
      </button>
    </div>
  );
}
```

### Frontend: TodoList with Overdue Calculation

```javascript
function TodoList({ todos, onToggleTodo }) {
  // Utility function (could be extracted)
  const isOverdue = (todo) => {
    if (todo.completed) return false;
    if (!todo.dueDate) return false;
    
    const dueDate = new Date(todo.dueDate);
    if (isNaN(dueDate.getTime())) return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
    
    return dueDate < today;
  };
  
  return (
    <div className="todo-list">
      {todos.map(todo => (
        <TodoCard
          key={todo.id}
          todo={todo}
          onToggle={onToggleTodo}
          overdue={isOverdue(todo)}
        />
      ))}
    </div>
  );
}
```

## Testing Strategy

### Unit Tests

**Backend**:
- `todoService.isOverdueAtTime()` with various dates
- `todoService.updateTodo()` sets `wasOverdueWhenCompleted` correctly
- Database persistence of new field

**Frontend**:
- `isOverdue()` utility function
- TodoCard rendering with overdue prop
- TodoCard rendering with wasOverdueWhenCompleted

### Integration Tests

**Backend**:
- PUT /api/todos/:id sets field correctly
- GET /api/todos returns field
- Field validation and client protection

**Frontend**:
- TodoList → TodoCard data flow
- Complete todo → API call → UI update
- Overdue status updates on refresh

### Manual Testing

1. Create todo with yesterday's date → verify red styling + ⚠️
2. Complete it → verify "completed late" indication
3. Create todo with tomorrow's date → verify NO overdue styling
4. Complete it → verify NO "completed late" indication
5. Test both light and dark modes
6. Test accessibility (screen reader, keyboard navigation)

## Common Pitfalls

### ❌ Don't: Allow client to set wasOverdueWhenCompleted

```javascript
// BAD - client can manipulate flag
app.put('/api/todos/:id', (req, res) => {
  const updates = req.body; // Contains wasOverdueWhenCompleted from client
  const updated = todoService.updateTodo(id, updates);
});
```

### ✅ Do: Calculate on server, ignore client value

```javascript
// GOOD - server calculates flag
app.put('/api/todos/:id', (req, res) => {
  const updates = { ...req.body };
  delete updates.wasOverdueWhenCompleted; // Ignore client value
  const updated = todoService.updateTodo(id, updates);
});
```

### ❌ Don't: Calculate overdue on backend

The feature spec explicitly requires browser local time for calculation (FR-008).

### ✅ Do: Calculate overdue on frontend

Frontend calculates `isOverdue` using `new Date()` (browser time), backend only stores the completion-time flag.

### ❌ Don't: Use time components in date comparison

```javascript
// BAD - time matters, might give wrong results
return new Date(dueDate) < new Date();
```

### ✅ Do: Normalize to midnight for date-only comparison

```javascript
// GOOD - compare dates only
const due = new Date(dueDate);
const today = new Date();
due.setHours(0, 0, 0, 0);
today.setHours(0, 0, 0, 0);
return due < today;
```

## Performance Considerations

- **Overdue calculation**: O(1) per todo, negligible cost
- **No API overhead**: Field is returned with existing todo objects
- **No caching needed**: Simple comparison, recalculate on each render
- **Database query unchanged**: No new queries, just one additional column

## Rollout Plan

1. **Deploy backend** with database migration and new field support
2. **Verify backend** works (existing todos have default false value)
3. **Deploy frontend** with overdue calculation and visual styling
4. **Monitor** for issues (date parsing, styling, performance)
5. **Celebrate** 🎉 Users can now identify overdue todos instantly!

## Key Files Modified

```
Backend:
- packages/backend/src/services/todoService.js (add wasOverdueWhenCompleted logic)
- packages/backend/__tests__/app.test.js (add tests)

Frontend:
- packages/frontend/src/components/TodoList.js (calculate overdue)
- packages/frontend/src/components/TodoCard.js (render overdue styling)
- packages/frontend/src/styles/theme.css (overdue styles)
- packages/frontend/src/components/__tests__/TodoCard.test.js (add tests)
- packages/frontend/src/components/__tests__/TodoList.test.js (add tests)
```

## Questions?

Refer to detailed documentation:
- [Feature Specification](../spec.md) - Complete requirements
- [Data Model](../data-model.md) - Entity definitions and state transitions
- [API Contracts](../contracts/api.md) - Endpoint specifications
- [Research](../research.md) - Technical decisions and alternatives

## Summary

The overdue todos feature is straightforward:
1. **Backend**: Add `wasOverdueWhenCompleted` field, set it when completing overdue todos
2. **Frontend**: Calculate `isOverdue()`, render visual styling (red + ⚠️)
3. **Tests**: Comprehensive coverage for all scenarios
4. **Deploy**: Backend first, then frontend (backward compatible)

Simple, focused, effective. Let's build it! 🚀
