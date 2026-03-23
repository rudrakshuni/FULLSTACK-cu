# Frontend Testing with Jest & React Testing Library - exp5

Simple, focused examples of unit tests, integration tests, and snapshot tests for React components.

## Project Structure

```
fullstack_exp5/
├── src/
│   ├── Button.js              # UNIT TEST: Simple button component
│   ├── Button.test.js         # 3 unit tests (render, click, multiple clicks)
│   ├── LoginForm.js           # INTEGRATION TEST: Form with validation
│   ├── LoginForm.test.js      # 8 integration tests (fill, submit, validate)
│   ├── CardList.js            # SNAPSHOT TEST: Component with states
│   ├── CardList.test.js       # 8 snapshot tests (loading, error, empty, data)
│   ├── App.js                 # Main app component
│   ├── index.js               # React entry point
│   ├── index.css              # Styling
│   └── setupTests.js          # Jest configuration
├── public/
│   └── index.html             # HTML entry point
├── package.json               # Dependencies
└── .gitignore                 # Git ignore rules
```

## Part A: Unit Tests - Button Component

**File:** `src/Button.test.js`

### What are Unit Tests?
Testing individual components in isolation. Focus on:
- Component renders correctly
- Props work as expected
- Event handlers are called

### Example Tests:
```javascript
// Test 1: Render test
it('should render the button with correct label text', () => {
  render(<Button label="Click Me" />);
  const button = screen.getByTestId('simple-button');
  expect(button).toHaveTextContent('Click Me');
});

// Test 2: Click handler test
it('should call onClick handler when button is clicked', () => {
  const mockClickHandler = jest.fn();
  render(<Button label="Submit" onClick={mockClickHandler} />);
  const button = screen.getByTestId('simple-button');
  fireEvent.click(button);
  expect(mockClickHandler).toHaveBeenCalledTimes(1);
});
```

### Key Concepts:
- `render()` - Mount component in test DOM
- `screen.getByTestId()` - Query by test ID
- `fireEvent.click()` - Simulate click
- `jest.fn()` - Mock functions
- `expect()` - Assertions

---

## Part B: Integration Tests - Login Form

**File:** `src/LoginForm.test.js`

### What are Integration Tests?
Testing how components work together with user interactions.
- Fill multiple inputs
- Trigger form submission
- Validate error messages
- Check success states

### Example Tests:
```javascript
// Test: User fills form and submits
it('should update input fields when user types', async () => {
  const user = userEvent.setup();
  render(<LoginForm />);
  
  const emailInput = screen.getByTestId('email-field');
  await user.type(emailInput, 'test@example.com');
  
  expect(emailInput.value).toBe('test@example.com');
});

// Test: Validation message appears
it('should show error when email is empty', async () => {
  render(<LoginForm />);
  fireEvent.click(screen.getByTestId('submit-button'));
  
  await waitFor(() => {
    expect(screen.getByTestId('error-message'))
      .toHaveTextContent('Email is required');
  });
});
```

### Key Patterns:
- `userEvent.setup()` - Realistic user interactions
- `userEvent.type()` - Simulate typing
- `waitFor()` - Wait for async updates
- `fireEvent.click()` - Trigger form submit
- Multiple assertions per test

---

## Part C: Snapshot Tests - Card List

**File:** `src/CardList.test.js`

### What are Snapshot Tests?
Recording component output and comparing future renders to ensure consistency.
Perfect for:
- Complex components with multiple states
- Visual regression detection
- Documenting expected output

### Example Tests:
```javascript
// Test: Loading state snapshot
it('should match snapshot for loading state', () => {
  const { container } = render(<CardList loading={true} />);
  expect(container.firstChild).toMatchSnapshot('loading-state');
});

// Test: Multiple cards snapshot
it('should match snapshot with multiple cards', () => {
  const mockCards = [
    { title: 'Card 1', description: 'First', status: 'active' },
    { title: 'Card 2', description: 'Second', status: 'inactive' }
  ];
  const { container } = render(<CardList cards={mockCards} />);
  expect(container.firstChild).toMatchSnapshot('multiple-cards');
});
```

### Snapshot Workflow:
1. First test run creates snapshots in `__snapshots__` folder
2. Component output is serialized to string
3. Future tests compare to stored snapshot
4. If changed intentionally: `npm test -- -u` to update
5. If changed unintentionally: Fix component and rerun

---

## Installation & Running

### Install Dependencies:
```bash
cd fullstack_exp5
npm install
```

### Run All Tests:
```bash
npm test
```

### Run Tests in Watch Mode:
```bash
npm test -- --watch
```

### Generate Coverage Report:
```bash
npm test -- --coverage --watchAll=false
```

### Update Snapshots (after intentional changes):
```bash
npm test -- -u
```

### Start Dev Server:
```bash
npm start
```

---

## Test Statistics

| Aspect | Count |
|--------|-------|
| **Total Tests** | 19 |
| **Unit Tests** | 3 (Button) |
| **Integration Tests** | 8 (LoginForm) |
| **Snapshot Tests** | 8 (CardList) |
| **Test Files** | 3 |
| **Components Tested** | 3 |

---

## Common Testing Patterns

### 1. Render & Assert
```javascript
it('should render with props', () => {
  render(<Button label="Submit" />);
  expect(screen.getByText('Submit')).toBeInTheDocument();
});
```

### 2. User Interaction
```javascript
it('should handle click', async () => {
  const user = userEvent.setup();
  const mockFn = jest.fn();
  render(<Button onClick={mockFn} />);
  await user.click(screen.getByRole('button'));
  expect(mockFn).toHaveBeenCalled();
});
```

### 3. Form Submission
```javascript
it('should validate on submit', async () => {
  const user = userEvent.setup();
  render(<LoginForm />);
  await user.type(screen.getByTestId('email-field'), 'invalid');
  fireEvent.click(screen.getByTestId('submit-button'));
  await waitFor(() => {
    expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
  });
});
```

### 4. Async Assertions
```javascript
it('should show success message', async () => {
  render(<LoginForm />);
  // ... fill form
  fireEvent.click(screen.getByTestId('submit-button'));
  
  // Wait for state update
  await waitFor(() => {
    expect(screen.getByText('Success!')).toBeInTheDocument();
  });
});
```

### 5. Snapshots
```javascript
it('should match snapshot', () => {
  const { container } = render(<CardList />);
  expect(container.firstChild).toMatchSnapshot();
});
```

---

## Best Practices

### 1. Use Semantic Queries
✅ Good:
```javascript
screen.getByRole('button', { name: /submit/i })
screen.getByLabelText('Email')
screen.getByTestId('submit-button')
```

❌ Avoid:
```javascript
screen.getByClass('btn')
container.querySelector('.button')
```

### 2. Test User Behavior, Not Implementation
✅ Good:
```javascript
await user.type(emailInput, 'test@example.com');
fireEvent.click(button);
```

❌ Avoid:
```javascript
emailInput.value = 'test@example.com';
emailInput.dispatchEvent(new Event('change'));
```

### 3. Use `userEvent` Over `fireEvent`
```javascript
// ✅ Simulates real user behavior
await userEvent.type(input, 'text');

// ❌ Simulates only event, not realistic
fireEvent.change(input, { target: { value: 'text' } });
```

### 4. Wait for Async Updates
```javascript
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument();
});
```

### 5. Test Edge Cases
- Empty inputs
- Invalid formats
- Loading states
- Error states
- Multiple interactions

---

## Debugging Tests

### 1. Print DOM
```javascript
const { debug } = render(<Component />);
debug(); // Print entire DOM to console
```

### 2. Check What's Available
```javascript
screen.logTestingPlaygroundURL(); // Link to testing playground
```

### 3. Use screen.debug()
```javascript
screen.debug(screen.getByTestId('form'));
```

### 4. Check Queries
```javascript
// See what element would match
screen.getByRole('button', { hidden: true }).getAttribute('data-testid');
```

---

## Key Testing Library Utilities

| Utility | Purpose |
|---------|---------|
| `render()` | Mount component in test DOM |
| `screen` | Query mounted components |
| `fireEvent` | Simulate browser events |
| `userEvent` | Simulate user interactions |
| `waitFor()` | Wait for async state updates |
| `within()` | Query subset of DOM |
| `getByRole()` | Query by accessibility role |
| `getByTestId()` | Query by test ID attribute |
| `getByLabelText()` | Query form by label |
| `getByText()` | Query by visible text |
| `queryBy*()` | Return null if not found |
| `findBy*()` | Return promise (async) |

---

## Expected Output

```
PASS  src/Button.test.js
  Button Component - Unit Tests
    ✓ should render the button with correct label text (25ms)
    ✓ should call onClick handler when button is clicked (15ms)
    ✓ should handle multiple clicks (10ms)

PASS  src/LoginForm.test.js
  LoginForm Component - Integration Tests
    ✓ should render form with email and password fields (18ms)
    ✓ should update input fields when user types (45ms)
    ✓ should show error when email is empty (35ms)
    ✓ should show error for invalid email format (40ms)
    ✓ should show error when password is empty (30ms)
    ✓ should show error for short password (25ms)
    ✓ should show success message on valid submission (50ms)
    ✓ should clear fields after successful submission (20ms)

PASS  src/CardList.test.js
  CardList Component - Snapshot Tests
    ✓ should match snapshot for loading state (12ms)
    ✓ should match snapshot for error state (8ms)
    ✓ should match snapshot for empty cards array (10ms)
    ✓ should match snapshot when cards is null (8ms)
    ✓ should match snapshot with single card (15ms)
    ✓ should match snapshot with multiple cards (18ms)
    ✓ should match snapshot with different card statuses (20ms)
    ✓ should consistently render same cards snapshot (25ms)

Test Suites: 3 passed, 3 total
Tests:       19 passed, 19 total
Snapshots:   8 passed, 8 total
Time:        2.345s
```

---

## Quick Reference

### Import Statements
```javascript
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
```

### Basic Test Structure
```javascript
describe('Component Name', () => {
  it('should do something', () => {
    render(<Component />);
    expect(screen.getByText('text')).toBeInTheDocument();
  });
});
```

### Async Test Pattern
```javascript
it('should handle async operation', async () => {
  const user = userEvent.setup();
  render(<Component />);
  
  await user.type(input, 'value');
  
  await waitFor(() => {
    expect(screen.getByText('Result')).toBeInTheDocument();
  });
});
```

---

## Summary

**Part A (Unit Tests):** Test Button in isolation - render, props, click handlers
**Part B (Integration Tests):** Test LoginForm with user workflow - fill, validate, submit
**Part C (Snapshot Tests):** Test CardList states - loading, error, empty, data

All examples are simple and easy to understand - perfect for learning!

---

**Created:** March 23, 2026  
**Project:** fullstack_exp5  
**Status:** Ready to run  
**Tests:** 19 total (3 unit + 8 integration + 8 snapshot)
