import React from 'react';
import TodoCard from './TodoCard';

/**
 * Check if a todo is overdue
 * @param {string|null} dueDate - ISO date string (YYYY-MM-DD)
 * @param {boolean} completed - Whether the todo is completed
 * @returns {boolean} True if todo is overdue (incomplete and due date is in the past)
 */
function isOverdue(dueDate, completed) {
  if (!dueDate || completed) return false;
  
  try {
    const due = new Date(dueDate);
    const today = new Date();
    
    // Normalize to midnight for comparison
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    
    // Check if date is valid
    if (isNaN(due.getTime())) return false;
    
    return due < today;
  } catch (error) {
    return false;
  }
}

function TodoList({ todos, onToggle, onEdit, onDelete, isLoading }) {
  if (todos.length === 0) {
    return (
      <div className="todo-list empty-state">
        <p className="empty-state-message">
          No todos yet. Add one to get started! 👻
        </p>
      </div>
    );
  }

  return (
    <div className="todo-list">
      {todos.map((todo) => (
        <TodoCard
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onEdit={onEdit}
          onDelete={onDelete}
          isLoading={isLoading}
          isOverdue={isOverdue(todo.dueDate, todo.completed)}
        />
      ))}
    </div>
  );
}

export default TodoList;
