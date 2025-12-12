# Money For Nothing

A minimalist, retro-styled personal finance tracker for managing monthly income, bills, and savings. Built with React Native and Expo for Android and Web.

## Features

- **Income Tracking** - Track paychecks and additional income sources with default/current amounts
- **Bills Management** - Add bills, mark as paid, and track progress with a visual progress bar
- **Savings Tracker** - Monitor savings accounts with a 12-month history spark line
- **Monthly Reset** - Automatically resets income to defaults and bills to unpaid each month
- **CSV Import/Export** - Back up your data or import from spreadsheets
- **Setup Wizard** - Guided onboarding for first-time users
- **Cross-Platform** - Works on Android and Web browsers
- **Retro Terminal Aesthetic** - Monospace fonts, ASCII-style UI, dark theme

## Tech Stack

- **Framework:** React Native with Expo
- **Language:** TypeScript
- **State Management:** React Context + useReducer
- **Storage:** AsyncStorage (Android), IndexedDB (Web)
- **Validation:** Zod schemas
- **UI:** Custom StyleSheet with monospace typography

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- For Android development: Android Studio with an emulator or a physical device
- For Web: Any modern browser

### Installation

```bash
# Clone the repository
git clone https://github.com/rnagoda/moneyfornothing.git
cd moneyfornothing

# Install dependencies
npm install
```

### Running the App

```bash
# Start the Expo development server
npm start

# Run on Android (emulator or connected device)
npm run android

# Run in web browser
npm run web

# Run on iOS (macOS only, when supported)
npm run ios
```

## Usage

### First Launch

When you first open the app, a setup wizard will guide you through:

1. **Income Setup** - Enter your paycheck amounts and any additional income
2. **Bills Setup** - Add your monthly bills (rent, utilities, subscriptions, etc.)
3. **Savings Setup** - Add your savings accounts and current balances

### Daily Use

#### Home Screen
The main screen shows your "Tus Ultimos Pesos" - the money remaining after bills. Tap any section to manage it:

- **Income Card** - View and edit income sources
- **Bills Card** - Shows progress bar and remaining unpaid amount
- **Savings Card** - Displays total savings with trend spark line

#### Managing Bills
- Tap the checkbox `[ ]` to mark a bill as paid `[X]`
- Tap a bill name or amount to edit inline
- Use `[ + ]` to add new bills
- Tap `DEL` to remove a bill

#### Managing Income
- Tap any amount to edit (current or default)
- Current amounts are used for this month's calculations
- Default amounts are restored on monthly reset

#### Managing Savings
- Update amounts as your savings change
- View the 12-month history spark line to track growth

### Monthly Reset

At the start of each month, the app automatically:
- Resets all income to their default amounts
- Marks all bills as unpaid
- Savings are preserved (no reset)

### Import/Export

Access from Settings (gear icon):

- **Export CSV** - Download all your data as a spreadsheet
- **Import CSV** - Restore from a backup or import from another source

CSV format:
```csv
Money For Nothing Export - December 2024

--- INCOME ---
Name,Default Amount,Current Amount,Paycheck Number
Paycheck 1,2500,2500,1
Paycheck 2,2500,2500,2
Side Hustle,500,500,

--- BILLS ---
Name,Amount,Paid
Rent,1200,No
Electric,150,Yes

--- SAVINGS ---
Name,Amount
Emergency Fund,5000
Vacation,1200

--- SAVINGS HISTORY ---
Month,Total
2024-01,4500
2024-02,4800
2024-03,5200
```

## Development

### Commands

```bash
npm start              # Start Expo dev server
npm run android        # Run on Android
npm run web            # Run on web
npm run ios            # Run on iOS

npm test               # Run tests
npm run test:watch     # Run tests in watch mode
npm run test:coverage  # Generate coverage report

npm run lint           # Run ESLint
npm run lint:fix       # Fix linting issues
npm run typecheck      # TypeScript type checking
```

### Project Structure

```
moneyfornothing/
├── src/
│   ├── components/
│   │   ├── common/        # Reusable UI (buttons, inputs, cards)
│   │   ├── layout/        # Layout components (progress bar, spark line)
│   │   ├── modals/        # Modal screens (Income, Bills, Savings)
│   │   └── onboarding/    # Setup wizard components
│   ├── context/           # React Context (AppContext)
│   ├── hooks/             # Custom hooks (useIncome, useBills, useSavings)
│   ├── screens/           # Screen components (Home, Settings)
│   ├── storage/           # Platform-specific storage
│   ├── theme/             # Colors, typography, spacing
│   ├── types/             # TypeScript type definitions
│   └── utils/             # Helpers (formatters, CSV, validators)
├── assets/
│   └── fonts/             # Custom monospace fonts
├── App.tsx                # App entry point
└── package.json
```

## Security Note

- **Android:** Data is stored locally using AsyncStorage
- **Web:** Data is stored in IndexedDB (unencrypted browser storage)

For sensitive financial data, the Android app is recommended. Web storage is convenient but not encrypted.

## License

MIT
