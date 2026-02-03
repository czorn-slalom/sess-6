import React from 'react';
import { render, screen } from '@testing-library/react';
import TodoList from '../TodoList';

describe('TodoList Component', () => {
  const mockHandlers = {
    onToggle: jest.fn(),
    onEdit: jest.fn(),
    onDelete: jest.fn()
  };

  const mockTodos = [
    {
      id: 1,
      title: 'Todo 1',
      dueDate: '2025-12-25',
      completed: 0,
      createdAt: '2025-11-01T00:00:00Z'
    },
    {
      id: 2,
      title: 'Todo 2',
      dueDate: null,
      completed: 1,
      createdAt: '2025-11-02T00:00:00Z'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render empty state when todos array is empty', () => {
    render(<TodoList todos={[]} {...mockHandlers} isLoading={false} />);
    
    expect(screen.getByText(/No todos yet. Add one to get started!/)).toBeInTheDocument();
  });

  it('should render all todos when provided', () => {
    render(<TodoList todos={mockTodos} {...mockHandlers} isLoading={false} />);
    
    expect(screen.getByText('Todo 1')).toBeInTheDocument();
    expect(screen.getByText('Todo 2')).toBeInTheDocument();
  });

  it('should render correct number of todo cards', () => {
    const { container } = render(
      <TodoList todos={mockTodos} {...mockHandlers} isLoading={false} />
    );
    
    const cards = container.querySelectorAll('.todo-card');
    expect(cards).toHaveLength(2);
  });

  it('should pass handlers to TodoCard components', () => {
    render(<TodoList todos={mockTodos} {...mockHandlers} isLoading={false} />);
    
    // Verify that edit buttons exist for each todo
    expect(screen.getAllByLabelText(/Edit/)).toHaveLength(2);
    expect(screen.getAllByLabelText(/Delete/)).toHaveLength(2);
  });

  describe('Overdue Status Calculation', () => {
    // Mock current date to ensure consistent test results
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-02-03T12:00:00Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should pass isOverdue=true for todos with past due dates', () => {
      const overdueTodos = [
        {
          id: 1,
          title: 'Overdue Todo',
          dueDate: '2020-01-01',
          completed: 0,
          createdAt: '2025-11-01T00:00:00Z'
        }
      ];
      
      render(<TodoList todos={overdueTodos} {...mockHandlers} isLoading={false} />);
      
      const warningIcon = screen.getByRole('img', { name: 'Overdue' });
      expect(warningIcon).toBeInTheDocument();
    });

    it('should pass isOverdue=false for todos with future due dates', () => {
      const futureTodos = [
        {
          id: 1,
          title: 'Future Todo',
          dueDate: '2030-12-31',
          completed: 0,
          createdAt: '2025-11-01T00:00:00Z'
        }
      ];
      
      render(<TodoList todos={futureTodos} {...mockHandlers} isLoading={false} />);
      
      const warningIcon = screen.queryByRole('img', { name: 'Overdue' });
      expect(warningIcon).not.toBeInTheDocument();
    });

    it('should pass isOverdue=false for todos with no due date', () => {
      const noDateTodos = [
        {
          id: 1,
          title: 'No Due Date',
          dueDate: null,
          completed: 0,
          createdAt: '2025-11-01T00:00:00Z'
        }
      ];
      
      render(<TodoList todos={noDateTodos} {...mockHandlers} isLoading={false} />);
      
      const warningIcon = screen.queryByRole('img', { name: 'Overdue' });
      expect(warningIcon).not.toBeInTheDocument();
    });

    it('should pass isOverdue=false for completed todos even with past due dates', () => {
      const completedOverdueTodos = [
        {
          id: 1,
          title: 'Completed Overdue',
          dueDate: '2020-01-01',
          completed: 1,
          createdAt: '2025-11-01T00:00:00Z'
        }
      ];
      
      render(<TodoList todos={completedOverdueTodos} {...mockHandlers} isLoading={false} />);
      
      const warningIcon = screen.queryByRole('img', { name: 'Overdue' });
      expect(warningIcon).not.toBeInTheDocument();
    });

    it('should handle invalid due dates gracefully', () => {
      const invalidDateTodos = [
        {
          id: 1,
          title: 'Invalid Date',
          dueDate: 'invalid-date',
          completed: 0,
          createdAt: '2025-11-01T00:00:00Z'
        }
      ];
      
      render(<TodoList todos={invalidDateTodos} {...mockHandlers} isLoading={false} />);
      
      const warningIcon = screen.queryByRole('img', { name: 'Overdue' });
      expect(warningIcon).not.toBeInTheDocument();
    });
  });
});
