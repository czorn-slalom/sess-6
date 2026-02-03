<!--
Sync Impact Report - Constitution v1.0.0 (2026-02-03)
======================================================
Version Change: Initial → 1.0.0
Modified Principles: None (initial creation)
Added Sections: All core principles, Code Quality Standards, Development Workflow
Removed Sections: None

Templates Status:
✅ .specify/templates/plan-template.md - Reviewed (constitution check section aligned)
✅ .specify/templates/spec-template.md - Reviewed (requirements aligned with principles)
✅ .specify/templates/tasks-template.md - Reviewed (task categories support all principles)

Follow-up TODOs: None
-->

# Todo App Constitution

## Core Principles

### I. Single Responsibility (NON-NEGOTIABLE)

Each module, component, and function MUST have one well-defined responsibility and one reason to change.

**Rules**:
- React components handle ONLY presentation logic or ONLY container logic, never both
- Backend services separate route handling, business logic, and data access into distinct layers
- Utility functions perform one transformation or operation
- No "god objects" or components that handle multiple unrelated concerns

**Rationale**: Single responsibility ensures maintainability, testability, and clear architectural boundaries. Violations lead to coupled code that's difficult to test, understand, and modify.

### II. Test-First Development (NON-NEGOTIABLE)

All new functionality and bug fixes MUST have tests written before or alongside implementation, with 80%+ code coverage maintained.

**Rules**:
- Write tests that describe expected behavior before implementation
- All tests MUST pass before code review
- Unit tests for individual components/functions with mocked dependencies
- Integration tests for component interactions and API communication
- Mock external dependencies (API calls, timers, databases)
- Tests MUST be independent and executable in any order

**Rationale**: Test-first development ensures code correctness, documents expected behavior, prevents regressions, and maintains project reliability. The 80% coverage target ensures comprehensive testing without pursuing diminishing returns.

### III. Code Quality Standards (NON-NEGOTIABLE)

Code MUST follow established formatting, naming, and organization conventions enforced by ESLint and project guidelines.

**Rules**:
- Use 2-space indentation for all code (JavaScript, JSON, CSS, Markdown)
- camelCase for variables/functions, PascalCase for components/classes, UPPER_SNAKE_CASE for constants
- Organized imports: external libraries → internal modules → styles, separated by blank lines
- Remove all trailing whitespace and use LF line endings
- No linting errors or warnings before commit
- Descriptive names that clearly indicate purpose (no single-letter variables except loops)
- Keep lines under 100 characters for readability
- Colocate tests with source code in `__tests__/` directories

**Rationale**: Consistent code style improves readability, reduces cognitive load during code review, prevents trivial merge conflicts, and maintains professional code quality standards.

### IV. DRY and KISS Principles

Code MUST avoid repetition (DRY) and favor simple, straightforward solutions (KISS) over premature optimization or unnecessary complexity.

**Rules**:
- Extract repeated code into shared functions, utilities, or components
- Prefer simple, readable implementations over clever but obscure code
- Avoid premature optimization—write clear code first, optimize only when profiling identifies bottlenecks
- Break complex logic into smaller, understandable functions with clear names
- Document "why" in comments, not "what" (code should be self-documenting)

**Rationale**: DRY reduces maintenance burden and prevents inconsistent behavior across repeated code. KISS ensures code remains understandable to all team members and reduces bugs from overcomplicated logic.

### V. SOLID Architecture Principles

Design decisions MUST align with SOLID principles to ensure extensible, maintainable architecture.

**Rules**:
- **Single Responsibility**: Covered in Principle I
- **Open/Closed**: Use props and composition to extend behavior without modifying existing code
- **Liskov Substitution**: Component implementations MUST honor their interface contracts
- **Interface Segregation**: Pass only necessary props; keep prop lists focused and minimal
- **Dependency Inversion**: Inject dependencies rather than hardcoding them; depend on abstractions

**Rationale**: SOLID principles create flexible, testable architectures that gracefully accommodate changing requirements without requiring extensive rewrites.

### VI. Error Handling and User Feedback

All operations that can fail MUST include error handling with meaningful messages and user-appropriate feedback.

**Rules**:
- Wrap fallible operations in try-catch blocks
- Provide clear, actionable error messages to users (e.g., "Failed to update todo. Please try again.")
- Log detailed errors for debugging (console.error with context)
- Never expose internal implementation details or stack traces to end users
- Validate input data at API boundaries with descriptive validation messages
- Use default values and guard clauses to prevent undefined errors

**Rationale**: Graceful error handling improves user experience, aids debugging, and prevents silent failures that corrupt application state.

### VII. Git Commit Discipline

All commits MUST be atomic, represent one logical change, and include clear commit messages explaining the "why" behind changes.

**Rules**:
- Each commit represents one logical change (single feature, fix, or refactor)
- Use feature branches for new work (e.g., `feature/todo-editing`)
- Commit messages follow format: `type: brief description` with optional body explaining rationale
- Standard types: `feat`, `fix`, `refactor`, `test`, `docs`, `style`, `chore`
- All linting errors and tests MUST pass before commit
- Use pull requests for code review before merging to main

**Rationale**: Atomic commits with clear messages create a comprehensible project history, simplify debugging through git bisect, and make code review more effective.

## Code Quality Standards

### Import Organization

Imports MUST be organized in three groups separated by blank lines:
1. External libraries (Node.js, npm packages)
2. Internal modules (project code)
3. Styles (CSS imports)

Use relative paths for internal modules. Avoid circular dependencies.

### File Organization

Frontend structure:
```
packages/frontend/src/
  components/          # Reusable UI components
  services/            # API services and business logic
  utils/               # Utility functions
  __tests__/           # Integration and setup tests
```

Backend structure:
```
packages/backend/src/
  routes/              # Express route handlers
  controllers/         # Business logic
  services/            # Data access layer
  middleware/          # Express middleware
  __tests__/           # Tests
```

### Documentation Standards

- Use JSDoc for public functions and components
- Comment on "why" decisions were made, not "what" code does
- Keep comments updated when code changes
- Avoid obvious comments that restate the code

## Development Workflow

### Code Review Checklist

Before submitting code for review, developers MUST verify:
- [ ] Code follows naming conventions
- [ ] Imports are organized correctly
- [ ] No linting errors or warnings
- [ ] Code is DRY and avoids repetition
- [ ] Functions/components have single responsibility
- [ ] Error handling is implemented
- [ ] Comments are clear and helpful
- [ ] Tests are written and passing (80%+ coverage maintained)
- [ ] Git commits are atomic and well-described
- [ ] No console.log statements left in production code

### Testing Requirements

- Target: 80%+ code coverage across all packages
- Unit tests for components, functions, route handlers
- Integration tests for component interactions and API calls
- Tests colocated with source in `__tests__/` directories
- Tests MUST be independent, executable in any order
- Follow Arrange-Act-Assert pattern
- Use descriptive test names explaining what is tested

### Linting and Formatting

- ESLint enforces code quality rules
- All linting errors MUST be fixed before PR creation
- No unused or undefined variables
- Consistent arrow function usage
- No console statements in production code (warnings acceptable in development)

## Governance

This constitution supersedes all other development practices and guidelines. All team members MUST adhere to these principles.

### Amendment Process

1. Proposed changes MUST be documented with clear rationale
2. Team discussion and approval required
3. Version number updated according to semantic versioning:
   - MAJOR: Backward incompatible principle removals or redefinitions
   - MINOR: New principles added or materially expanded guidance
   - PATCH: Clarifications, wording fixes, non-semantic refinements
4. Migration plan required for breaking changes
5. All templates and documentation updated to reflect amendments

### Compliance Review

- All PRs MUST pass constitution compliance checks before merge
- Complexity that violates principles MUST be explicitly justified with technical rationale
- Constitution violations flagged during code review MUST be resolved
- Refer to project documentation in `docs/` for detailed guidance on each principle

### Living Document

This constitution is a living document. As the project evolves:
- Add new patterns and best practices learned
- Update based on team retrospectives and feedback
- Keep tooling configurations aligned with principles
- Share knowledge through code reviews and documentation

**Version**: 1.0.0 | **Ratified**: 2026-02-03 | **Last Amended**: 2026-02-03
