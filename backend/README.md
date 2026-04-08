# AeroPulse Backend

Express + MongoDB backend API for web and future mobile clients.

## Setup

1. Copy `.env.example` to `.env`
2. Update `MONGODB_URI` and `JWT_SECRET`
3. Install dependencies:
   - `npm install`
4. Seed demo users (optional):
   - `npm run seed`
5. Run backend:
   - `npm run dev`

## API Base URL

- `http://localhost:5000/api`

## Auth Endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

## User Endpoints (Bearer token required)

- `PATCH /api/users/profile`
- `PATCH /api/users/preferences`
- `PATCH /api/users/privacy`
- `PATCH /api/users/notifications`
- `PATCH /api/users/password`
- `DELETE /api/users/me`
