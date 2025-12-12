# Money For Nothing – Product Requirements Document (PRD)

---

## 1. Overview

**Money For Nothing** is a minimalist, retro-styled finance tracking app for Web and Android (with iOS support planned), designed to track only three types of financial items: Income, Bills, and Savings. The app features a monospaced, light-grey-on-dark-grey interface inspired by classic terminal UIs. Data is stored locally for the MVP, with CSV export for user data portability and a planned migration to cloud storage post-MVP.

---

## 2. Product Vision & Objectives

- **Vision:**  
  Enable users to effortlessly track essential financial flows with a nostalgic, distraction-free interface.

- **Objectives:**
  - Track only three item types: Income (with bi-monthly paychecks), Bills (with payment progress), and Savings.
  - Provide instant visual feedback on bill payment progress.
  - Offer CSV export for user data.
  - Deliver a retro, monospaced UI experience.

---

## 3. Target Audience

- Minimalist budgeters
- Retro tech enthusiasts
- Privacy-conscious individuals

---

## 4. Functional Requirements

### 4.1. Core Features

| Feature              | Description                                                                                                              |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Income Tracking      | Two recurring paycheck entries per month (fixed for simplicity), default values set by user, editable during month.      |
| Bill Tracking        | List of bills (name + amount), each marked paid/unpaid, with a progress meter. No due dates—users manage priority.       |
| Tus Últimos Pesos    | Displays remaining money: Total Income minus unpaid Bills. Spanish name is intentional for retro/quirky character.       |
| Savings Tracking     | List of savings items (name + amount), total displayed, not involved in calculations.                                    |
| Monthly Reset        | On app launch, if a new month has started since last session: paychecks reset to default, bills marked unpaid.           |
| Progress Meter       | Calculated as `(sum of paid bills) / (total bills amount) * 100`. Resets to 0% on monthly reset.                         |
| CSV Export           | Export all tracked data (income, bills, savings) as a CSV file from the settings page.                                   |
| Retro UI             | Monospaced font, light-grey text, dark grey background, ASCII-style layout, random version string for aesthetic.         |

### 4.2. Data Model

- **Income:**
  - `name` (string)
  - `defaultAmount` (number)
  - `currentAmount` (number, editable during month)
  - `paycheckNumber` (1 or 2)
- **Bills:**
  - `name` (string)
  - `amount` (number)
  - `paid` (boolean)
- **Savings:**
  - `name` (string)
  - `amount` (number)
- **App State:**
  - `lastSessionMonth` (string, format: "YYYY-MM") — used to detect month change for reset logic
  - `versionString` (string) — randomly generated nonsense string for retro display

---

## 5. Non-Functional Requirements

| Area          | Requirement                                                                             |
| ------------- | --------------------------------------------------------------------------------------- |
| Performance   | App load time <2s, smooth UI transitions, efficient memory usage.                       |
| Accessibility | WCAG 2.1 AA: high contrast, screen reader support, keyboard navigation, scalable text.  |
| Security      | Encrypted local storage on mobile (Realm with AES-256), user warning for web storage.   |
| Privacy       | Data minimization, clear privacy policy, user consent where required.                   |
| Reliability   | Manual backup/restore via CSV export.                                                   |
| Compliance    | GDPR/CCPA-ready privacy policy, accessibility compliance, platform-specific guidelines. |

---

## 6. Technical Architecture

### 6.1. Platform & Framework

| Layer            | Technology/Tool                      |
| ---------------- | ------------------------------------ |
| Core Framework   | React Native (with React Native Web) |
| Language         | TypeScript                           |
| State Management | React Context API + useReducer       |
| UI               | Custom StyleSheet, monospaced font   |
| Font             | Courier Prime or similar             |

### 6.2. Data Storage

| Platform | Storage Solution | Encryption       | Notes                                                    |
| -------- | ---------------- | ---------------- | -------------------------------------------------------- |
| Android  | Realm            | AES-256 built-in | Fast, encrypted, open source                             |
| Web      | IndexedDB        | None (warn user) | No robust browser encryption; use for non-sensitive data |

- **Key Management:** Store Realm encryption keys in Android Keystore.
- **Data Model:** JSON-compatible objects for easy migration.

### 6.3. Data Export

| Platform | Library/Tool                   | Description                       |
| -------- | ------------------------------ | --------------------------------- |
| Web      | react-csv, Blob API            | Generate and trigger CSV download |
| Android  | expo-file-system, expo-sharing | Write CSV and open share dialog   |

### 6.4. Monthly Reset Logic

- On app launch, check if the current month/year differs from the last recorded session.
- If a new month has started since the last session:
  - Reset both paycheck entries to their default values.
  - Mark all bills as unpaid; reset progress meter to 0%.
  - Store the current month/year as the new "last session" marker.
- Savings are not affected by the monthly reset.

---

## 7. UI/UX Design

### 7.1. Visual Style

- **Font:** Monospaced (Courier Prime or similar)
- **Colors:**
  - Background: `#222` (dark grey)
  - Text: `#ccc` (light grey)
- **Layout:** ASCII-style boxes, blocky buttons, solid borders, minimal shadows.
- **Progress Bar:** Simple, retro-styled for bill payment status.

### 7.2. Layout Example

```
┌───────────────────────────────────┐
│ MONEY FOR NOTHING    v0.01682.c  │
│          December 2025           │
├───────────────────────────────────┤
│ INCOME                   $6,200  │
├───────────────────────────────────┤
│ BILLS                $5,622 due  │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░ 45% │
│ Paid $2,534         $3,088 left  │
├───────────────────────────────────┤
│ TUS ÚLTIMOS PESOS        $3,112  │
├───────────────────────────────────┤
│ SAVINGS                $148,000  │
└───────────────────────────────────┘
            [ SETTINGS ]
```

**Note:** The version string (e.g., "v0.01682.c") is a randomly generated nonsense string, contributing to the retro aesthetic.

---

## 8. Data Validation & Error Handling

- **Input Validation:**
  - Name: max 32 characters, no special characters except spaces/hyphens.
  - Amount: positive numbers only, max 2 decimal places.
  - Prevent duplicate names within each section.
- **Error Handling:**
  - User-friendly error messages for invalid input, failed exports, or storage errors.
  - Graceful degradation if storage is unavailable.

---

## 9. Security & Privacy

- **Mobile:**
  - All financial data encrypted at rest (Realm, Android Keystore for keys).
- **Web:**
  - No encryption; display a warning to users about local data security limitations.
- **Export:**
  - Sanitize data before CSV export to prevent injection.
- **Privacy Policy:**
  - Clear, accessible privacy policy in app and on web.
  - Obtain user consent where required (GDPR/CCPA).
- **No sensitive banking credentials stored.**

---

## 10. Accessibility

- High-contrast color scheme.
- Monospaced font for readability.
- All functionality operable via keyboard.
- Screen reader support for all interactive elements.
- Resizable text.

---

## 11. Compliance

| Area                | Requirement                                                         |
| ------------------- | ------------------------------------------------------------------- |
| Data Privacy        | GDPR/CCPA-ready privacy policy, user consent, data minimization     |
| Security            | Encrypted storage (mobile), secure CSV export, no hardcoded secrets |
| Accessibility       | WCAG 2.1 AA compliance, screen reader, keyboard navigation          |
| Platform Guidelines | Privacy policy in app and store listing, accessibility statement    |
| Export/Portability  | CSV export of all user data                                         |

---

## 12. Development Phases

| Phase         | Tasks                                                                                   |
| ------------- | --------------------------------------------------------------------------------------- |
| 1. Setup      | Initialize React Native project, configure React Native Web, set up navigation & state. |
| 2. Data Model | Implement Realm (Android) and IndexedDB (Web) storage, define models for income/bills.  |
| 3. UI         | Build retro-styled screens for income, bills, savings, and settings.                    |
| 4. Logic      | Implement monthly reset, paycheck editing, bill status toggling, and progress meter.    |
| 5. Export     | Add CSV export (web: download, Android: share dialog).                                  |
| 6. Testing    | Test on web and Android, ensure monthly reset and export work as expected.              |
| 7. Deployment | Deploy web build (e.g., Vercel/Netlify), prepare Android APK for Play Store.            |

---

## 13. Open Source & Infrastructure

| Area             | Solution/Tool                                              | License/Notes                           |
| ---------------- | ---------------------------------------------------------- | --------------------------------------- |
| UI               | Custom StyleSheet, Courier Prime                           | Open source, cross-platform consistency |
| Data Storage     | Realm (Android), IndexedDB (Web)                           | Encrypted on mobile, fallback for web   |
| CSV Export       | react-csv (Web), expo-file-system + expo-sharing (Android) | MIT                                     |
| State Management | Context API + useReducer                                   | Simple, scalable for MVP                |
| Security         | Realm encryption, Keystore                                 | Industry standard for local data        |
| Build/Deploy     | Expo/React Native CLI, Vercel/Netlify, Play Store          | Open source, scalable infrastructure    |

---

## 14. Market Positioning

- Competes by emphasizing privacy, simplicity, and no account linking.
- Accessibility and data export as differentiators.
- No advanced analytics, reminders, or account linking.

---

## 15. Summary Table

| Area           | MVP Approach (Testing)                           | Production Approach (Post-MVP)                                          |
| -------------- | ------------------------------------------------ | ----------------------------------------------------------------------- |
| Authentication | None (single user, local only)                   | Firebase Auth or similar (if multi-user/cloud sync needed)              |
| Data Storage   | Local (Realm/IndexedDB, encrypted on mobile)     | Cloud database (Firestore/Supabase)                                     |
| Data Export    | CSV via react-csv/expo-file-system               | Same as MVP, with cloud data support                                    |
| Security       | Encrypted storage on mobile, user warning on web | Full encryption, secure authentication, regular audits                  |
| Accessibility  | High-contrast, keyboard/screen reader support    | Full WCAG 2.2 compliance, VPAT documentation                            |
| Compliance     | Privacy policy, consent, data minimization       | User rights management, breach notification, region-specific compliance |

---

## 16. References

- [GDPR](https://gdpr.eu/)
- [CCPA](https://oag.ca.gov/privacy/ccpa)
- [WCAG 2.1](https://www.w3.org/WAI/standards-guidelines/wcag/)
- [React Native](https://reactnative.dev/)
- [Realm](https://realm.io/)
- [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)

---
