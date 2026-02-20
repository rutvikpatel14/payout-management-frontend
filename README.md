# Payout Management Frontend

A Next.js-based frontend application for managing vendor payouts with role-based access control (OPS and FINANCE roles).

## Quick Start (Under 5 Minutes)

### Prerequisites
- Node.js 18+ installed
- Backend API running on `http://localhost:4000` (or configured URL)

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/rutvikpatel14/payout-management-frontend.git
   cd payout-management-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   Edit `.env.local` if your backend API is running on a different URL:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:4000
   ```

4. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

**Total time: ~3-5 minutes** (depending on npm install speed)

## Environment Setup

### Required Environment Variables

Create a `.env.local` file in the root directory (or copy from `.env.local.example`):

```env
# Backend API URL (default: http://localhost:4000)
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### Environment File Setup

1. Copy the example file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Update `NEXT_PUBLIC_API_URL` if your backend runs on a different port or domain.

3. **Note**: `.env.local` is gitignored and won't be committed to the repository.

## Seed Data Instructions

This frontend application requires a backend API to function. Seed data must be set up on the **backend API**, not in this frontend repository.

### Backend Requirements

The backend API should provide:

1. **Authentication Endpoint** (`POST /auth/login`)
   - Accepts: `{ email: string, password: string }`
   - Returns: `{ token: string, user: { id: string, email: string, role: 'OPS' | 'FINANCE' } }`

2. **At least one test user account**:
   - **OPS Role User**: Can create payouts, submit for approval
   - **FINANCE Role User**: Can approve/reject payouts

3. **Vendors Endpoint** (`GET /vendors`, `POST /vendors`)
   - Returns vendor list for payout creation

4. **Payouts Endpoint** (`GET /payouts`, `POST /payouts`, etc.)
   - Handles payout CRUD operations and workflow

### Recommended Seed Data

For testing purposes, the backend should include:

**Test Users:**
- Email: `ops@example.com`, Password: `password123`, Role: `OPS`
- Email: `finance@example.com`, Password: `password123`, Role: `FINANCE`

**Test Vendors:**
- At least 2-3 vendors with UPI IDs or bank account details

**Note**: Contact your backend team or refer to the backend repository's README for specific seed data setup instructions.

## Available Scripts

- `npm run dev` - Start development server (port 3000)
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Assumptions

1. **Backend API is running**: The frontend expects a backend API server running on `http://localhost:4000` (or configured URL) with the following endpoints:
   - `/auth/login` - Authentication
   - `/vendors` - Vendor management
   - `/payouts` - Payout management

2. **Node.js version**: Requires Node.js 18 or higher.

3. **Browser support**: Modern browsers with ES6+ support (Chrome, Firefox, Safari, Edge).

4. **Backend CORS**: The backend API must allow CORS requests from `http://localhost:3000` during development.

5. **Authentication**: Users must log in through the `/login` page. Authentication tokens are stored in localStorage.

6. **Role-based access**: 
   - OPS users can create and submit payouts
   - FINANCE users can approve/reject payouts

## Project Structure

```
payout-management-frontend/
├── src/
│   ├── app/              # Next.js app router pages
│   ├── contexts/         # React contexts (Auth)
│   ├── lib/              # Utilities (API client, validation)
│   └── styles/           # Global styles
├── .env.local.example    # Environment variables template
├── package.json          # Dependencies and scripts
└── README.md            # This file
```

## Troubleshooting

**Port 3000 already in use?**
```bash
# Kill the process or use a different port
PORT=3001 npm run dev
```

**Backend API not responding?**
- Verify the backend is running on the configured URL
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Ensure CORS is enabled on the backend for `http://localhost:3000`

**Login not working?**
- Verify backend authentication endpoint is accessible
- Check browser console for API errors
- Ensure backend has seed users created

## Tech Stack

- **Framework**: Next.js 16.1.6
- **React**: 19.2.3
- **TypeScript**: 5.x
- **Styling**: Tailwind CSS 4
- **Validation**: Zod 3.23.8

