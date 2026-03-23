# Frontend Testing - Exp 5 Summary

## ✅ All Tests Passing

```
Test Suites: 3 passed, 3 total
Tests:       19 passed, 19 total
Snapshots:   7 passed, 7 total
```

---

## Part A: Unit Tests - Button Component

**File:** `src/Button.test.js` (3 tests)

### What it tests:
- ✅ Component renders with correct label
- ✅ Click event handler is called
- ✅ Multiple clicks are tracked

### Key Testing Concepts:
```javascript
// Render component in test
render(<Button label="Click Me" />);

// Query by test ID
const button = screen.getByTestId('simple-button');

// Assert element is in document
expect(button).toBeInTheDocument();
expect(button).toHaveTextContent('Click Me');

// Mock function to track calls
const mockClickHandler = jest.fn();
render(<Button onClick={mockClickHandler} />);
fireEvent.click(button);
expect(mockClickHandler).toHaveBeenCalledTimes(1);
```

---

## Part B: Integration Tests - LoginForm Component

**File:** `src/LoginForm.test.js` (8 tests)

### What it tests:
- ✅ Form renders all fields
- ✅ User can type in input fields
- ✅ Email validation (required)
- ✅ Email format validation
- ✅ Password validation (required)
- ✅ Password length validation (min 6 chars)
- ✅ Success message on valid submission
- ✅ Form resets after successful submission

### Key Testing Concepts:
```javascript
// Fill input fields
fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

// Trigger form submission
fireEvent.click(submitButton);

// Assert error messages appear
expect(screen.getByTestId('error-message'))
  .toHaveTextContent('Email is required');

// Assert success messages
expect(screen.getByTestId('success-message'))
  .toHaveTextContent('Login successful!');
```

### Form Validation Rules:
- Email: Required + must contain '@'
- Password: Required + minimum 6 characters

---

## Part C: Snapshot Tests - CardList Component

**File:** `src/CardList.test.js` (8 tests)

### What it tests:
- ✅ Loading state snapshot
- ✅ Error state snapshot
- ✅ Empty state snapshot (empty array)
- ✅ Empty state snapshot (null cards)
- ✅ Single card snapshot
- ✅ Multiple cards snapshot
- ✅ Cards with different statuses snapshot
- ✅ Consistent snapshot rendering

### Key Testing Concepts:
```javascript
// Create snapshot
const { container } = render(<CardList loading={true} />);
expect(container.firstChild).toMatchSnapshot();

// Snapshots are stored in __snapshots__ folder
// First run: Creates snapshots
// Next runs: Compares to stored snapshots
// If intentional change: npm test -- -u (update snapshots)
```

### Component States Tested:
- **Loading:** Shows "⏳ Loading cards..."
- **Error:** Shows error message
- **Empty:** Shows "📭 No cards to display"
- **Data:** Shows grid of card components

---

## File Structure

```
fullstack_exp5/
├── src/
│   ├── Button.js              # Simple button component
│   ├── Button.test.js         # 3 unit tests
│   │
│   ├── LoginForm.js           # Form with validation
│   ├── LoginForm.test.js      # 8 integration tests
│   │
│   ├── CardList.js            # Component with multiple states
│   ├── CardList.test.js       # 8 snapshot tests
│   ├── CardList.test.js/      # Auto-created snapshots folder
│   │
│   ├── App.js                 # Main app showing all three
│   ├── index.js               # React entry point
│   ├── index.css              # Styling
│   └── setupTests.js          # Jest configuration
│
├── public/
│   └── index.html             # HTML entry point
│
├── package.json               # Dependencies
├── .gitignore                 # Git ignore rules
└── TESTING_GUIDE.md           # Comprehensive guide
```

---

## Test Results Breakdown

| Component | Type | Count | Status |
|-----------|------|-------|--------|
| **Button** | Unit | 3 | ✅ PASS |
| **LoginForm** | Integration | 8 | ✅ PASS |
| **CardList** | Snapshot | 8 | ✅ PASS |
| **Total** | - | **19** | **✅ PASS** |

---

## Installation & Running

### Install:
```bash
cd fullstack_exp5
npm install
```

### Run Tests:
```bash
npm test

# Watch mode
npm test -- --watch

# Coverage
npm test -- --coverage

# Update snapshots (after intentional changes)
npm test -- -u
```

### Start Dev Server:
```bash
npm start
```

---

## Example Test Patterns

### Unit Test Pattern
```javascript
describe('Component Name', () => {
  it('should do something', () => {
    render(<Component />);
    expect(screen.getByText('text')).toBeInTheDocument();
  });
});
```

### Integration Test Pattern
```javascript
describe('Form Component', () => {
  it('should handle submission', () => {
    render(<LoginForm />);
    
    // Fill
    fireEvent.change(input, { target: { value: 'text' } });
    
    // Submit
    fireEvent.click(button);
    
    // Assert
    expect(screen.getByText('Success')).toBeInTheDocument();
  });
});
```

### Snapshot Test Pattern
```javascript
describe('CardList', () => {
  it('should render loading state', () => {
    const { container } = render(<CardList loading={true} />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
```

---

## Testing Library Queries Used

| Query | Purpose |
|-------|---------|
| `getByTestId()` | Query by test ID | 
| `getByText()` | Query by visible text |
| `getByLabelText()` | Query form by label |

## Testing Utilities Used

| Utility | Purpose |
|---------|---------|
| `render()` | Mount component |
| `screen` | Query mounted component |
| `fireEvent` | Simulate browser events |
| `toBeInTheDocument()` | Jest matcher |
| `toHaveTextContent()` | Jest matcher |
| `toMatchSnapshot()` | Jest matcher |

---

## Learning Outcomes

### A. Unit Tests
- Test individual components in isolation
- Verify props and event handlers
- Use mock functions to track calls
- Simple, focused tests

### B. Integration Tests  
- Test user workflows and interactions
- Fill forms, trigger submissions
- Verify validation and error messages
- Test state changes and rerenders

### C. Snapshot Tests
- Record component output
- Detect unintended changes
- Perfect for complex components
- Track state variations

---

## Quick Reference

### Most Important Commands
```bash
npm test                          # Run all tests
npm test -- --watch              # Watch mode
npm test -- -u                   # Update snapshots
npm start                         # Start dev server
```

### Most Important Concepts
1. **render()** - Mount component for testing
2. **fireEvent** - Simulate user interactions
3. **screen** - Query elements in test
4. **expect()** - Make assertions
5. **jest.fn()** - Mock functions
6. **Snapshots** - Record component output

---

## Next Steps

1. ✅ Run tests: `npm test --watchAll=false`
2. ✅ Start app: `npm start`
3. ✅ View snapshots: Check `__snapshots__` folder
4. ✅ Modify tests: Change assertions and rerun
5. ✅ Add more components and tests

---

**Project:** fullstack_exp5  
**Status:** ✅ Complete and Running  
**Tests:** 19 / 19 Passing  
**Snapshots:** 7 / 7 Passing  
**Coverage:** All components tested  
**Difficulty:** Beginner Friendly
