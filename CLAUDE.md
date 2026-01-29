# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Start development server
bun dev

# Build for production (runs TypeScript compiler + Vite build)
bun run build

# Preview production build
bun preview

# Run linter
bun lint

# Install dependencies
bun install

# Add new dependency
bun add <package-name>

# Add dev dependency
bun add -d <package-name>

# Firebase Functions (Python backend)
cd functions
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Deploy functions
firebase deploy --only functions

# Run functions emulator locally
firebase emulators:start --only functions
```

## High-Level Architecture

### Application Purpose

A React web app for splitting restaurant checks among multiple people. Users progress through a 4-step workflow to add items, assign people, distribute items, and view payment summaries.

### Workflow Steps

The app follows a linear 4-step process controlled by `WorkflowStep` enum:

1. **INPUT**: Add check items manually or via image upload
2. **PEOPLE**: Add people who are splitting the check
3. **ASSIGN**: Assign items to people using drag-and-drop
4. **SUMMARY**: View calculated totals for each person

Step transitions are managed in `App.tsx` with AnimatePresence for smooth transitions between views.

### State Management Pattern

All application state lives in **CheckSplitContext** (`src/context/CheckSplitContext.tsx`):

- Uses `useReducer` with centralized reducer logic
- Single source of truth for items, people, tax/tip rates
- Context provides wrapper functions (addItem, assignItemToPerson, etc.) that dispatch actions
- All components access state via `useCheckSplit()` hook

**Key state behavior:**

- Items can be assigned to multiple people (splitting support)
- Removing a person automatically unassigns all their items
- State includes tax/tip rates and service charges for calculations

### Calculation Engine

Split calculations are in `src/utils/calculations.ts`:

- Handles proportional splitting when items are shared between multiple people
- Distributes tax, tip, and service charges proportionally based on subtotals
- Tax is calculated on subtotal, tip is calculated on subtotal + tax
- Returns detailed breakdown per person and grand total

### Drag-and-Drop System

Assignment view uses `@dnd-kit` library:

- Items are draggable between an "unassigned pool" and person drop zones
- Custom hook `useDragAndDrop` encapsulates all DnD logic
- Supports assigning items to multiple people (creates copies in UI)
- Uses collision detection to determine valid drop targets

### Backend (Firebase Functions)

The `functions/` directory contains a Python Firebase Functions backend for receipt OCR:

**Receipt Analysis Callable** (`analyze_receipt`):

- Uses AWS Textract AnalyzeExpense API for receipt OCR
- Called via Firebase `httpsCallable` from frontend (not direct HTTP)
- Accepts base64-encoded image file (JPEG, PNG, PDF up to 2MB) with contentType
- Returns extracted line items (name, price, quantity) and summary fields (subtotal, tax, tip, total, service_charge)

**Environment Variables** (configured as Firebase secrets):

- `AWS_ACCESS_KEY_ID`: AWS credentials for Textract
- `AWS_SECRET_ACCESS_KEY`: AWS credentials for Textract
- `AWS_REGION`: AWS region (defaults to us-east-1)

**Dependencies** (in `functions/requirements.txt`):

- `firebase_functions`: Firebase Functions Python SDK
- `firebase_admin`: Firebase Admin SDK (>=6.0.0 for App Check support)
- `boto3`: AWS SDK for Python (Textract integration)

**App Check Security:**

- Uses Firebase App Check with reCAPTCHA v3 to verify requests
- App Check tokens are automatically attached by `httpsCallable` SDK
- Backend uses `enforce_app_check=True` on callable function decorator
- In emulator mode (`FUNCTIONS_EMULATOR=true`), enforcement is disabled

### Component Organization

- **views/**: Full-page views for each workflow step
- **components/**: Organized by feature (check-input, people, assignment, summary, shared, layout)
- **shared/**: Reusable UI primitives (Button, Card, Modal, etc.)
- **layout/**: App shell components (Header, Footer, Stepper, Container)
- **functions/**: Python Firebase Functions backend

### Technology Stack Notes

**Motion (not framer-motion):**

- Import from `'motion/react'` (not `'motion'`)
- Successor to framer-motion with same API
- Used for animations and AnimatePresence

**Tailwind CSS v4:**

- Uses CSS-first configuration (no tailwind.config.js needed)
- Custom theme defined in `src/index.css` using `@theme` directive
- Vite plugin via `@tailwindcss/vite` (no PostCSS config needed)
- Import path: `@import "tailwindcss";`

**shadcn/ui:**

- Configured with heroicons (not lucide)
- Components go in `src/components/ui/`
- Utility function `cn()` in `src/lib/utils.ts` for className merging
- Add components with: `npx shadcn@latest add [component]`

**Internationalization:**

- react-i18next with browser language detection
- Translations in `src/locales/en/` and `src/locales/es/`
- Initialized in `src/i18n.ts`, imported in `main.tsx`
- Use `const { t } = useTranslation()` for translations

**Path Aliases:**

- `@/*` maps to `./src/*` (configured in tsconfig and vite.config.ts)
- Used for cleaner imports across the codebase

**Firebase Functions (Python):**

- Python 3.13 backend in `functions/` directory
- Uses virtual environment (`functions/venv/`)
- AWS Textract for receipt OCR processing
- Deployed as Firebase HTTPS callable functions

**Firebase App Check:**

- Initialized in `src/firebase.ts` with reCAPTCHA v3 provider
- Called early in `src/main.tsx` before app renders
- Tokens automatically attached by `httpsCallable` SDK
- Functions emulator auto-connected in development via `connectFunctionsEmulator`
- Required environment variables (frontend):
  - `VITE_FIREBASE_API_KEY`: Firebase API key
  - `VITE_FIREBASE_APP_ID`: Firebase App ID
  - `VITE_FIREBASE_MESSAGING_SENDER_ID`: Firebase sender ID
  - `VITE_RECAPTCHA_SITE_KEY`: reCAPTCHA v3 site key
  - `VITE_APPCHECK_DEBUG_TOKEN`: Debug token for local development

## Key Implementation Patterns

### Adding New Workflow Steps

1. Add step to `WorkflowStep` enum in `src/types/index.ts`
2. Create view component in `src/views/`
3. Add step to stepper config in `src/components/layout/Stepper.tsx`
4. Add case in `App.tsx` renderStep switch

### Using Context State

Always use the provided wrapper functions, never dispatch directly:

```tsx
const {state, addItem, assignItemToPerson} = useCheckSplit();
```

### Item Assignment Logic

Items have an `assignedTo: string[]` array supporting multiple people. When calculating splits, item cost is divided equally among assigned people.

### Color Assignment

People are assigned colors from a predefined palette in `src/constants/index.ts` via `getNextPersonColor()` function for visual distinction.

## Build Notes

- Uses Rolldown (experimental Vite replacement) via `npm:rolldown-vite` override
- TypeScript builds before Vite bundle (`tsc -b && vite build`)
- React 19 with new features (no forwardRef needed)
