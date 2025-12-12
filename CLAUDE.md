# Money For Nothing Development Guide

> Guidelines for AI-assisted development on Money For Nothing - A minimalist, retro-styled finance tracking app.

## Tech Stack

- **Framework:** React Native (with React Native Web)
- **Language:** TypeScript
- **State Management:** React Context API + useReducer
- **Storage (Android):** Realm (AES-256 encrypted)
- **Storage (Web):** IndexedDB (unencrypted, with user warning)
- **Validation:** Zod schemas
- **UI:** Custom StyleSheet, monospaced font (Courier Prime)
- **Testing:** Jest + React Native Testing Library
- **Export:** react-csv (Web), expo-file-system + expo-sharing (Android)

---

## Quick Setup

### Initial Setup

```bash
# Clone and navigate to project
cd moneyfornothing

# Install dependencies
npm install

# Start development
npm start

# Run on specific platform
npm run android    # Android emulator/device
npm run web        # Web browser
npm run ios        # iOS simulator (future)
```

### Development Commands

```bash
npm start              # Start Expo dev server
npm run android        # Run on Android
npm run web            # Run on web
npm run ios            # Run on iOS (when supported)
npm test               # Run all tests
npm run test:watch     # Run tests in watch mode
npm run test:coverage  # Generate coverage report
npm run lint           # Run ESLint
npm run lint:fix       # Fix linting issues
npm run typecheck      # Run TypeScript type checking
```

### Environment Variables

Create `.env` for any environment-specific configuration:
```env
# No sensitive credentials needed for MVP (local-only storage)
NODE_ENV=development
```

---

## Architecture & Design Principles

### SOLID Principles in Practice

**Single Responsibility Principle**
- Components handle UI rendering only
- Hooks contain business logic
- Context providers manage state
- Storage modules handle persistence

**Open/Closed Principle**
- Use composition for extensible components
- Schema validation with Zod allows easy extension
- Storage abstraction for platform-specific implementations

**Liskov Substitution Principle**
- Consistent component prop patterns
- Standardized hook return values
- Interface-based storage contracts

**Interface Segregation Principle**
- Focused components per feature
- Specific hooks for specific needs
- Granular context providers

**Dependency Inversion Principle**
- Components depend on abstractions (context)
- Storage implementation injected per platform
- Testable through dependency injection

### File Structure

```
moneyfornothing/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── common/        # Buttons, inputs, cards
│   │   └── layout/        # Headers, containers, ASCII boxes
│   ├── screens/           # Screen components
│   │   ├── HomeScreen.tsx
│   │   ├── SettingsScreen.tsx
│   │   └── ...
│   ├── context/           # React Context providers
│   │   ├── AppContext.tsx
│   │   └── ThemeContext.tsx
│   ├── hooks/             # Custom React hooks
│   │   ├── useIncome.ts
│   │   ├── useBills.ts
│   │   ├── useSavings.ts
│   │   └── useMonthlyReset.ts
│   ├── storage/           # Platform-specific storage
│   │   ├── index.ts       # Storage abstraction
│   │   ├── realm.ts       # Android (Realm)
│   │   └── indexeddb.ts   # Web (IndexedDB)
│   ├── utils/             # Helpers, validators, formatters
│   │   ├── validators.ts  # Zod schemas
│   │   ├── formatters.ts  # Currency, date formatting
│   │   ├── csv.ts         # CSV export utilities
│   │   └── version.ts     # Random version string generator
│   ├── types/             # TypeScript type definitions
│   │   └── index.ts
│   └── __tests__/         # Test files
│       ├── components/
│       ├── hooks/
│       └── utils/
├── assets/                # Fonts, images
├── app.json               # Expo configuration
├── tsconfig.json          # TypeScript configuration
└── package.json
```

### Layer Responsibilities

**Screens** (`src/screens/`)
- Page-level components
- Compose smaller components
- Connect to context/hooks
- Handle navigation

**Components** (`src/components/`)
- Reusable UI elements
- Accept props, render UI
- No direct state management
- Styled with retro theme

**Hooks** (`src/hooks/`)
- Business logic encapsulation
- Data manipulation
- Side effect management
- Storage interactions

**Context** (`src/context/`)
- Global state management
- App-wide data sharing
- Reducer-based updates

**Storage** (`src/storage/`)
- Platform-specific persistence
- Encryption handling (Android)
- Data serialization

**Utils** (`src/utils/`)
- Pure functions
- Formatters, validators
- Shared helpers

---

## Development Workflow

### Feature Branch Strategy

**CRITICAL: NEVER commit directly to main - ALL changes require Pull Requests**

**Branch Selection Rules:**

**For ALL work (code, documentation, configs, tests, everything):**
- ALWAYS create a feature branch
- NEVER commit directly to main
- ALWAYS create a Pull Request for review
- NO EXCEPTIONS

**Branch naming conventions:**
- `feature/<feature-name>` - New features
- `fix/<bug-name>` - Bug fixes
- `refactor/<what>` - Code refactoring
- `docs/<what>` - Documentation updates
- `test/<what>` - Test additions/fixes

```bash
# Start new feature
git checkout main
git pull origin main
git checkout -b feature/<feature-name>

# Work on feature, commit regularly
git add .
git commit -m "Descriptive commit message"

# BEFORE pushing: Run tests and type check
npm test
npm run typecheck

# Push feature branch
git push -u origin feature/<feature-name>

# Create PR for review
# After approval, merge to main
```

### Testing Requirements

**MANDATORY: All new features must include tests**

Every PR must include:
1. **Unit tests** for hooks and utilities
2. **Component tests** for UI components
3. All tests passing (`npm test`)
4. Coverage for new code paths

**Running Tests:**
```bash
# Run all tests
npm test

# Run specific test file
npm test -- income.test.ts

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Code Quality Standards

**Before committing:**
- [ ] Code follows existing patterns
- [ ] TypeScript types are properly defined
- [ ] Zod schemas for data validation
- [ ] Error handling implemented
- [ ] Tests written and passing
- [ ] Manual testing on target platform(s)
- [ ] No commented-out code
- [ ] Accessibility considered

---

## Git Best Practices

### Branch Protection Rules

**Never work directly on main:**
1. Always check current branch: `git branch --show-current`
2. If on main, immediately create feature branch
3. All changes via PR and review

### Testing Before Push

**Non-negotiable testing protocol:**

```bash
# 1. Run automated tests
npm test

# 2. Run type checking
npm run typecheck

# 3. Start dev server and test manually
npm start
# Test on Android emulator and/or web browser

# 4. Verify expected behavior
# Check all affected features

# 5. Only push if everything works
git push
```

**Never say "fixed" or "should work" without:**
- Running the app
- Testing the actual feature
- Confirming no errors
- Verifying on target platform(s)

### Safe Git Operations

**Before any destructive operation:**
```bash
# Create backup branch
git branch backup-$(date +%Y%m%d-%H%M)
```

**Commit messages:**
```bash
# Good commit messages
git commit -m "Add bill payment toggle with progress update"
git commit -m "Fix monthly reset not triggering on app launch"
git commit -m "Refactor income storage to use Realm"

# Bad commit messages
git commit -m "fix"
git commit -m "updates"
git commit -m "wip"
```

---

## Testing Strategy

### Jest Configuration

Tests use Jest with React Native Testing Library:

```javascript
// jest.config.js
module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
  testMatch: ['**/__tests__/**/*.test.ts?(x)'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**'
  ]
};
```

### Unit Test Example

**Hook Test** - `src/__tests__/hooks/useBills.test.ts`:
```typescript
import { renderHook, act } from '@testing-library/react-hooks';
import { useBills } from '../../hooks/useBills';
import { AppProvider } from '../../context/AppContext';

describe('useBills', () => {
  const wrapper = ({ children }) => (
    <AppProvider>{children}</AppProvider>
  );

  it('should add a new bill', () => {
    const { result } = renderHook(() => useBills(), { wrapper });

    act(() => {
      result.current.addBill({ name: 'Rent', amount: 1500 });
    });

    expect(result.current.bills).toHaveLength(1);
    expect(result.current.bills[0].name).toBe('Rent');
    expect(result.current.bills[0].paid).toBe(false);
  });

  it('should toggle bill paid status', () => {
    const { result } = renderHook(() => useBills(), { wrapper });

    act(() => {
      result.current.addBill({ name: 'Electric', amount: 100 });
    });

    const billId = result.current.bills[0].id;

    act(() => {
      result.current.togglePaid(billId);
    });

    expect(result.current.bills[0].paid).toBe(true);
  });

  it('should calculate progress correctly', () => {
    const { result } = renderHook(() => useBills(), { wrapper });

    act(() => {
      result.current.addBill({ name: 'Bill 1', amount: 100 });
      result.current.addBill({ name: 'Bill 2', amount: 100 });
    });

    // Pay first bill
    act(() => {
      result.current.togglePaid(result.current.bills[0].id);
    });

    expect(result.current.progress).toBe(50);
  });
});
```

### Component Test Example

**Component Test** - `src/__tests__/components/BillItem.test.tsx`:
```typescript
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { BillItem } from '../../components/BillItem';

describe('BillItem', () => {
  const mockBill = {
    id: '1',
    name: 'Rent',
    amount: 1500,
    paid: false
  };

  it('renders bill name and amount', () => {
    const { getByText } = render(
      <BillItem bill={mockBill} onToggle={() => {}} />
    );

    expect(getByText('Rent')).toBeTruthy();
    expect(getByText('$1,500.00')).toBeTruthy();
  });

  it('calls onToggle when pressed', () => {
    const mockToggle = jest.fn();
    const { getByTestId } = render(
      <BillItem bill={mockBill} onToggle={mockToggle} />
    );

    fireEvent.press(getByTestId('bill-toggle'));
    expect(mockToggle).toHaveBeenCalledWith('1');
  });

  it('shows paid indicator when paid', () => {
    const paidBill = { ...mockBill, paid: true };
    const { getByTestId } = render(
      <BillItem bill={paidBill} onToggle={() => {}} />
    );

    expect(getByTestId('paid-indicator')).toBeTruthy();
  });
});
```

### Coverage Requirements

**Coverage Goals:**
- **Target: 80% coverage** for new code
- **100% coverage** for critical paths (storage, calculations, monthly reset)
- All edge cases tested
- Error handling tested

---

## Code Standards

### TypeScript Conventions

```typescript
// Use explicit types
interface Bill {
  id: string;
  name: string;
  amount: number;
  paid: boolean;
}

// Use const/let, never var
const bills: Bill[] = [];
let totalDue = 0;

// Use async/await
async function loadBills(): Promise<Bill[]> {
  const data = await storage.getBills();
  return data;
}

// Use arrow functions for consistency
const formatCurrency = (amount: number): string => {
  return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
};

// Destructuring
const { name, amount, paid } = bill;

// Optional chaining and nullish coalescing
const displayName = bill?.name ?? 'Unnamed Bill';
```

### Input Validation with Zod

**Define schemas in utils/validators.ts:**
```typescript
import { z } from 'zod';

export const incomeSchema = z.object({
  name: z.string().min(1).max(32),
  defaultAmount: z.number().positive().multipleOf(0.01),
  currentAmount: z.number().positive().multipleOf(0.01),
  paycheckNumber: z.union([z.literal(1), z.literal(2)])
});

export const billSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(32, 'Name too long')
    .regex(/^[a-zA-Z0-9\s-]+$/, 'Only letters, numbers, spaces, and hyphens'),
  amount: z.number()
    .positive('Amount must be positive')
    .multipleOf(0.01, 'Max 2 decimal places')
});

export const savingsSchema = z.object({
  name: z.string().min(1).max(32),
  amount: z.number().nonnegative().multipleOf(0.01)
});

// Validate input
export function validateBill(data: unknown): Bill {
  return billSchema.parse(data);
}
```

### Error Handling

```typescript
// Custom error types
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class StorageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StorageError';
  }
}

// Error handling in hooks
const addBill = async (data: BillInput): Promise<void> => {
  try {
    const validatedBill = validateBill(data);

    // Check for duplicates
    if (bills.some(b => b.name === validatedBill.name)) {
      throw new ValidationError('A bill with this name already exists');
    }

    await storage.saveBill(validatedBill);
    dispatch({ type: 'ADD_BILL', payload: validatedBill });
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError(error.errors[0].message);
    }
    throw error;
  }
};
```

### Component Patterns

**Functional components with TypeScript:**
```typescript
interface ProgressBarProps {
  progress: number;  // 0-100
  label?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  label
}) => {
  const filledBlocks = Math.round(progress / 100 * 30);
  const emptyBlocks = 30 - filledBlocks;

  return (
    <View style={styles.container} accessibilityRole="progressbar">
      <Text style={styles.bar}>
        {'▓'.repeat(filledBlocks)}{'░'.repeat(emptyBlocks)}
      </Text>
      <Text style={styles.percentage}>{progress}%</Text>
      {label && <Text style={styles.label}>{label}</Text>}
    </View>
  );
};
```

---

## Platform-Specific Considerations

### Storage Implementation

**Android (Realm):**
```typescript
// storage/realm.ts
import Realm from 'realm';

const BillSchema = {
  name: 'Bill',
  primaryKey: 'id',
  properties: {
    id: 'string',
    name: 'string',
    amount: 'double',
    paid: 'bool'
  }
};

// Open encrypted Realm
const realm = await Realm.open({
  schema: [BillSchema, IncomeSchema, SavingsSchema, AppStateSchema],
  encryptionKey: await getEncryptionKey() // From Android Keystore
});
```

**Web (IndexedDB):**
```typescript
// storage/indexeddb.ts
const DB_NAME = 'MoneyForNothing';
const DB_VERSION = 1;

export async function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      db.createObjectStore('income', { keyPath: 'id' });
      db.createObjectStore('bills', { keyPath: 'id' });
      db.createObjectStore('savings', { keyPath: 'id' });
      db.createObjectStore('appState', { keyPath: 'key' });
    };
  });
}
```

**Storage Abstraction:**
```typescript
// storage/index.ts
import { Platform } from 'react-native';

export interface StorageInterface {
  getBills(): Promise<Bill[]>;
  saveBill(bill: Bill): Promise<void>;
  deleteBill(id: string): Promise<void>;
  // ... other methods
}

export const storage: StorageInterface = Platform.select({
  android: require('./realm').default,
  web: require('./indexeddb').default,
  default: require('./indexeddb').default
});
```

### Web Security Warning

Display a warning to web users about unencrypted storage:

```typescript
// On app launch for web platform
if (Platform.OS === 'web') {
  Alert.alert(
    'Security Notice',
    'Data stored in your browser is not encrypted. For sensitive financial data, consider using the Android app.',
    [{ text: 'I Understand' }]
  );
}
```

---

## Security Best Practices

### Mobile Data Encryption

**Android Keystore for encryption keys:**
```typescript
// utils/encryption.ts
import * as SecureStore from 'expo-secure-store';

const KEY_NAME = 'realm_encryption_key';

export async function getEncryptionKey(): Promise<Int8Array> {
  let key = await SecureStore.getItemAsync(KEY_NAME);

  if (!key) {
    // Generate new 64-byte key
    const newKey = generateSecureKey(64);
    await SecureStore.setItemAsync(KEY_NAME, newKey);
    key = newKey;
  }

  return new Int8Array(Buffer.from(key, 'base64'));
}
```

### Input Sanitization

```typescript
// Sanitize all user input
export function sanitizeName(input: string): string {
  return input
    .trim()
    .slice(0, 32)
    .replace(/[<>]/g, ''); // Prevent injection
}

export function sanitizeAmount(input: string): number {
  const num = parseFloat(input);
  if (isNaN(num) || num < 0) {
    throw new ValidationError('Invalid amount');
  }
  return Math.round(num * 100) / 100; // Max 2 decimal places
}
```

### CSV Export Security

```typescript
// Sanitize data before CSV export to prevent injection
export function sanitizeForCSV(value: string): string {
  // Escape values that could be interpreted as formulas
  if (/^[=+\-@]/.test(value)) {
    return `'${value}`;
  }
  // Escape quotes and wrap in quotes if contains comma
  if (value.includes(',') || value.includes('"')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
```

---

## Accessibility

### Required Accessibility Features

- **High contrast**: Light grey (#ccc) on dark grey (#222) meets WCAG AA
- **Screen reader support**: All interactive elements have accessibility labels
- **Keyboard navigation**: Full functionality via keyboard (web)
- **Scalable text**: Support for system font size preferences

```typescript
// Accessible component example
<TouchableOpacity
  onPress={handleToggle}
  accessibilityRole="checkbox"
  accessibilityState={{ checked: bill.paid }}
  accessibilityLabel={`${bill.name}, ${formatCurrency(bill.amount)}, ${bill.paid ? 'paid' : 'unpaid'}`}
  accessibilityHint="Double tap to toggle paid status"
>
  {/* Component content */}
</TouchableOpacity>
```

---

## Communication Guidelines

### Testing & Verification

**Never claim something works without testing:**

**Don't say:**
- "This should work"
- "Fixed"
- "The feature is ready"

**Instead say:**
- "I've made changes. Please test on [platform] and verify it works"
- "Changes are ready for testing. Run `npm start` and test [feature]"
- "I've completed the implementation. Testing needed before merging"

### When Uncertain

**Always clarify before guessing:**

**Do:**
- "I see two approaches: A) [option] or B) [option]. Which fits better?"
- "The requirement is unclear. Should this [X] or [Y]?"
- "Before I proceed, should I [assumption]?"

### Reporting Status

**After any significant change, report:**
1. What was changed
2. What files were modified
3. What testing is needed
4. Any risks or considerations

---

## DO's and DON'Ts

### DO

**Code Quality**
- Use TypeScript with strict types
- Validate all input with Zod schemas
- Handle errors gracefully with user-friendly messages
- Write tests for new functionality
- Keep components small and focused
- Use descriptive variable and function names

**Security**
- Encrypt data on Android (Realm + Keystore)
- Warn web users about unencrypted storage
- Sanitize all user input
- Sanitize CSV exports to prevent injection
- Never store sensitive credentials (there shouldn't be any in MVP)

**Accessibility**
- Add accessibility labels to all interactive elements
- Support screen readers
- Maintain high contrast ratios
- Support keyboard navigation (web)

**Testing**
- Write tests before pushing code
- Test on target platform(s)
- Test happy paths and error cases
- Verify monthly reset logic works correctly

**Git**
- Always use feature branches
- Write clear commit messages
- Test locally before pushing
- Create PRs for review

### DON'T

**Code Quality**
- Use `any` type in TypeScript
- Leave commented-out code
- Hardcode values (use constants or config)
- Write components longer than 150 lines
- Skip input validation

**Security**
- Store unvalidated user input
- Skip CSV sanitization
- Ignore platform security differences
- Log sensitive financial data

**UI/UX**
- Break the retro aesthetic
- Skip accessibility features
- Ignore platform conventions

**Testing**
- Push code without running tests
- Say "fixed" without testing
- Skip tests for "small changes"
- Test only happy paths

**Git**
- Commit directly to main
- Push without testing
- Use vague commit messages
- Force push to shared branches

---

## Common Tasks

### Adding a New Data Type

1. **Define TypeScript types** in `src/types/index.ts`
2. **Create Zod schema** in `src/utils/validators.ts`
3. **Add storage methods** in `src/storage/`
4. **Create custom hook** in `src/hooks/`
5. **Add to context** if needed
6. **Create UI components**
7. **Write tests**

### Implementing Monthly Reset

The monthly reset logic should:
1. Check `lastSessionMonth` from storage on app launch
2. Compare with current month/year
3. If different:
   - Reset income `currentAmount` to `defaultAmount`
   - Set all bills `paid` to `false`
   - Update `lastSessionMonth`
4. Savings are not affected

### Adding CSV Export

```typescript
// utils/csv.ts
export function generateCSV(income: Income[], bills: Bill[], savings: Savings[]): string {
  const lines: string[] = [];

  lines.push('Type,Name,Amount,Status');

  income.forEach(i => {
    lines.push(`Income,${sanitizeForCSV(i.name)},${i.currentAmount},`);
  });

  bills.forEach(b => {
    lines.push(`Bill,${sanitizeForCSV(b.name)},${b.amount},${b.paid ? 'Paid' : 'Unpaid'}`);
  });

  savings.forEach(s => {
    lines.push(`Savings,${sanitizeForCSV(s.name)},${s.amount},`);
  });

  return lines.join('\n');
}
```

---

## Debugging Guide

**App won't start:**
```bash
# Clear cache and restart
npm start -- --clear

# Check for TypeScript errors
npm run typecheck

# Check dependencies
npm install
```

**Storage issues:**
```bash
# Android: Clear app data in emulator/device settings
# Web: Clear IndexedDB in browser dev tools

# Check storage implementation
# Add console.log temporarily to debug storage operations
```

**Styling issues:**
- Verify monospaced font is loading
- Check hex color values match spec (#222, #ccc)
- Test on both Android and web

**Monthly reset not working:**
- Check `lastSessionMonth` value in storage
- Verify date comparison logic
- Test by manually changing stored month value

---

**Remember:** Quality over speed. Test thoroughly. Ask when uncertain. Maintain the retro aesthetic.
