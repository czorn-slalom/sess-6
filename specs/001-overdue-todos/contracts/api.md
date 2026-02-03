# API Contracts: Support for Overdue Todo Items

**Feature**: 001-overdue-todos | **Date**: 2026-02-03

## Overview

This document defines the REST API contracts for the overdue todos feature. The API follows RESTful conventions and extends existing endpoints with a new `wasOverdueWhenCompleted` field.

## Base URL

```
http://localhost:5001/api
```

## Common Headers

**Request Headers**:
```
Content-Type: application/json
```

**Response Headers**:
```
Content-Type: application/json
```

## Endpoints

### GET /todos

Retrieve all todo items.

**Request**:
```http
GET /api/todos
```

**Response**: `200 OK`
```json
{
  "todos": [
    {
      "id": 1,
      "title": "Complete project documentation",
      "dueDate": "2026-02-01",
      "completed": true,
      "completedAt": "2026-02-02T10:30:00.000Z",
      "wasOverdueWhenCompleted": true
    },
    {
      "id": 2,
      "title": "Review code changes",
      "dueDate": "2026-02-10",
      "completed": false,
      "completedAt": null,
      "wasOverdueWhenCompleted": false
    },
    {
      "id": 3,
      "title": "Meeting with team",
      "dueDate": null,
      "completed": false,
      "completedAt": null,
      "wasOverdueWhenCompleted": false
    }
  ]
}
```

**Field Descriptions**:
- `id` (integer): Unique todo identifier
- `title` (string): Todo title/description
- `dueDate` (string | null): ISO 8601 date string (YYYY-MM-DD) or null
- `completed` (boolean): Completion status
- `completedAt` (string | null): ISO 8601 timestamp when completed, or null
- `wasOverdueWhenCompleted` (boolean): **NEW** - true if todo was overdue when marked complete

**Status Codes**:
- `200 OK`: Successfully retrieved todos

---

### POST /todos

Create a new todo item.

**Request**:
```http
POST /api/todos
Content-Type: application/json

{
  "title": "New todo item",
  "dueDate": "2026-02-15"
}
```

**Request Body**:
- `title` (string, required): Todo title
- `dueDate` (string, optional): ISO 8601 date string (YYYY-MM-DD)

**Response**: `201 Created`
```json
{
  "id": 4,
  "title": "New todo item",
  "dueDate": "2026-02-15",
  "completed": false,
  "completedAt": null,
  "wasOverdueWhenCompleted": false
}
```

**Status Codes**:
- `201 Created`: Todo successfully created
- `400 Bad Request`: Invalid request body (missing title, invalid date format)

**Error Response** (400):
```json
{
  "error": "Invalid due date format. Expected YYYY-MM-DD."
}
```

---

### PUT /todos/:id

Update an existing todo item.

**Request** (mark as complete):
```http
PUT /api/todos/1
Content-Type: application/json

{
  "completed": true
}
```

**Request Body** (partial update):
- `title` (string, optional): New title
- `dueDate` (string | null, optional): New due date or null to clear
- `completed` (boolean, optional): New completion status

**Backend Logic for wasOverdueWhenCompleted**:
```javascript
// When marking as complete (completed changes from false to true)
if (updates.completed === true && !currentTodo.completed) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  
  if (currentTodo.dueDate) {
    const dueDate = new Date(currentTodo.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    updates.wasOverdueWhenCompleted = dueDate < now;
  } else {
    updates.wasOverdueWhenCompleted = false;
  }
  
  updates.completedAt = new Date().toISOString();
}

// When marking as incomplete (completed changes from true to false)
if (updates.completed === false) {
  updates.wasOverdueWhenCompleted = false;
  updates.completedAt = null;
}

// Note: wasOverdueWhenCompleted should NOT be directly settable by client
```

**Response**: `200 OK`
```json
{
  "id": 1,
  "title": "Complete project documentation",
  "dueDate": "2026-02-01",
  "completed": true,
  "completedAt": "2026-02-03T14:22:35.123Z",
  "wasOverdueWhenCompleted": true
}
```

**Status Codes**:
- `200 OK`: Todo successfully updated
- `404 Not Found`: Todo with given ID does not exist
- `400 Bad Request`: Invalid request body (invalid date format)

**Error Response** (404):
```json
{
  "error": "Todo not found"
}
```

---

### DELETE /todos/:id

Delete a todo item.

**Request**:
```http
DELETE /api/todos/1
```

**Response**: `204 No Content`

**Status Codes**:
- `204 No Content`: Todo successfully deleted
- `404 Not Found`: Todo with given ID does not exist

---

## Data Validation Rules

### dueDate Validation

**Valid formats**:
- `"2026-02-03"` (ISO 8601 date)
- `null` (no due date)

**Invalid formats**:
- `"02/03/2026"` (US format)
- `"2026-2-3"` (missing leading zeros)
- `"2026-02-03T00:00:00Z"` (includes time)
- `""` (empty string - should be null)
- `"invalid"` (non-date string)

**Validation logic**:
```javascript
function validateDueDate(dueDate) {
  if (dueDate === null || dueDate === undefined) {
    return true; // No due date is valid
  }
  
  if (typeof dueDate !== 'string') {
    return false;
  }
  
  // Check format: YYYY-MM-DD
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dueDate)) {
    return false;
  }
  
  // Verify it's a valid date
  const date = new Date(dueDate);
  return !isNaN(date.getTime());
}
```

### wasOverdueWhenCompleted Validation

**Important**: This field is **calculated by the backend** and should **not** be directly settable by the client. Any client-provided value for this field in PUT/POST requests should be ignored.

**Server-side enforcement**:
```javascript
// Ignore client-provided wasOverdueWhenCompleted
delete requestBody.wasOverdueWhenCompleted;

// Calculate it based on business logic
if (shouldMarkAsComplete) {
  todo.wasOverdueWhenCompleted = calculateOverdueStatus(todo);
}
```

## Backward Compatibility

**Existing clients**: Clients that don't know about `wasOverdueWhenCompleted` will simply ignore the field. The API remains backward compatible because:
- The new field is always present (never undefined)
- The field has a sensible default (false)
- All existing endpoints continue to work without modification

**Migration path**:
1. Deploy backend with new field support
2. Old todos will have `wasOverdueWhenCompleted = false` (default)
3. New completions will correctly set the field
4. Deploy frontend to use the new field
5. No coordination required between deployments

## Example Workflows

### Workflow 1: Create and Complete Overdue Todo

**Step 1**: Create todo
```http
POST /api/todos
{"title": "Task", "dueDate": "2026-01-15"}

Response: {"id": 5, "title": "Task", "dueDate": "2026-01-15", "completed": false, "completedAt": null, "wasOverdueWhenCompleted": false}
```

**Step 2**: Wait until after due date (or travel in time for testing)

**Step 3**: Mark as complete
```http
PUT /api/todos/5
{"completed": true}

Response: {"id": 5, "title": "Task", "dueDate": "2026-01-15", "completed": true, "completedAt": "2026-02-03T15:00:00Z", "wasOverdueWhenCompleted": true}
```

**Result**: Todo now has `wasOverdueWhenCompleted = true`, indicating it was completed late.

---

### Workflow 2: Complete On-Time Todo

**Step 1**: Create todo
```http
POST /api/todos
{"title": "Future task", "dueDate": "2026-03-01"}

Response: {"id": 6, "title": "Future task", "dueDate": "2026-03-01", "completed": false, "completedAt": null, "wasOverdueWhenCompleted": false}
```

**Step 2**: Mark as complete (before due date)
```http
PUT /api/todos/6
{"completed": true}

Response: {"id": 6, "title": "Future task", "dueDate": "2026-03-01", "completed": true, "completedAt": "2026-02-03T15:00:00Z", "wasOverdueWhenCompleted": false}
```

**Result**: Todo has `wasOverdueWhenCompleted = false`, indicating it was completed on time.

---

### Workflow 3: Uncomplete Todo

**Step 1**: Uncomplete a previously completed todo
```http
PUT /api/todos/5
{"completed": false}

Response: {"id": 5, "title": "Task", "dueDate": "2026-01-15", "completed": false, "completedAt": null, "wasOverdueWhenCompleted": false}
```

**Result**: `wasOverdueWhenCompleted` is reset to false, and `completedAt` is cleared.

## Testing Checklist

API contract tests should verify:

- [ ] GET /todos returns array with wasOverdueWhenCompleted field for all todos
- [ ] POST /todos creates todo with wasOverdueWhenCompleted = false
- [ ] PUT /todos/:id (complete overdue todo) sets wasOverdueWhenCompleted = true
- [ ] PUT /todos/:id (complete on-time todo) sets wasOverdueWhenCompleted = false
- [ ] PUT /todos/:id (uncomplete todo) resets wasOverdueWhenCompleted = false
- [ ] PUT /todos/:id ignores client-provided wasOverdueWhenCompleted value
- [ ] Invalid dueDate format returns 400 error with descriptive message
- [ ] Date validation accepts YYYY-MM-DD format only
- [ ] Null dueDate is valid and todo is never marked overdue
- [ ] Completed todos with past due dates have wasOverdueWhenCompleted = true
- [ ] Backend uses server-side date for overdue calculation at completion time

## Summary

The API contracts extend the existing REST API with minimal changes:
- **One new field**: `wasOverdueWhenCompleted` (boolean)
- **Server-calculated**: Backend determines value, client cannot set directly
- **Backward compatible**: Existing clients continue to work
- **Simple validation**: Date format and business logic validation
- **Clear workflows**: Well-defined behavior for all state transitions

All endpoints maintain RESTful conventions and provide appropriate error handling with descriptive messages.
