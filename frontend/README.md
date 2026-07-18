# Frontend — WFH Attendance

Vite + React + TypeScript SPA for the WFH Attendance system. See the
[root README](../README.md) for the full project overview, architecture, and
how to run the backend this depends on.

## Setup

```bash
cp .env.example .env   # VITE_API_URL, defaults to http://localhost:3000
npm install
npm run dev
```

Requires the backend (Gateway + microservices + MySQL) to already be running
— see the root README's "Running it" section.

## Structure

```
src/
  api/          fetch client + shared TypeScript types (mirrors backend DTOs)
  auth/         AuthContext (JWT decode/storage) + ProtectedRoute
  components/   reusable UI: PhotoUploader, DataTable, Button, Field, Badge, Modal, AppShell
  pages/        LoginPage, CheckInPage (employee), AdminDashboardPage (admin)
  styles/       design tokens (OKLCH) + global styles
```
