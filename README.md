# Next.js Authentication App

A secure multi-step authentication system built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

- ✅ Multi-step authentication flow
- ✅ Secure word generation with expiration
- ✅ Multi-Factor Authentication (MFA)
- ✅ Responsive design with mobile-first approach
- ✅ Rate limiting and security measures
- ✅ Transaction dashboard with mock data
- ✅ Comprehensive unit tests

## Project Structure

```
src/
├── app/                 # Next.js App Router
│   ├── api/            # API routes
│   ├── login/          # Login pages
│   ├── dashboard/      # Dashboard page
│   └── layout.tsx      # Root layout
├── components/         # Reusable components
│   ├── ui/            # Basic UI components
│   └── layout/        # Layout components
├── hocs/               # Higher order components
├── lib/               # Utilities and helpers
├── types/             # TypeScript definitions
└── __tests__/         # Test files
```

## Getting Started

### Prerequisites

- Node.js 18.8 or later
- npm

1. Clone the repository:

```bash
git clone https://github.com/Deckerds/ascendion-nextforge.git
cd ascendion-nextforge
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
.env.local
SECRET_KEY=next_secret_key
```

4. Run the development server:

```bash
npm run dev
```

## Authentication Flow

### Step 1: Username Input

- Enter username
- System generates secure word (expires in 60 seconds)
- Rate limiting: 1 request per 10 seconds per user

### Step 2: Password Input

- Display secure word to user
- Enter password (hashed client-side)
- Secure word validation

### Step 3: Multi-Factor Authentication

- Enter 6-digit MFA code
- Time-based code generation
- 3 attempts before lockout

### Step 4: Dashboard Access

- View transaction history
- Secure session management

## API Endpoints

- `POST /api/getSecureWord` - Generate secure word
- `POST /api/login` - Authenticate user
- `POST /api/verifyMfa` - Verify MFA code
- `GET /api/transaction-history` - Fetch transactions

## Testing

Run the test suite:

```bash
# Run all tests
npm run test
```

## Demo Instructions

For demo purposes, the MFA code is displayed in the UI.

## Technologies Used

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Jest** - Testing framework
- **React Testing Library** - Component testing
