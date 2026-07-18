# WFH Attendance & Employee Monitoring System

A technical test submission for a fullstack developer recruitment process.

Two use cases, one web app, role-based:

- **Employee** — logs in, checks in with a photo (server-side timestamp),
  checks out, views their own attendance history.
- **HRD Admin** — manages employee master data (create/update/deactivate),
  views all attendance records (read-only, filterable by date/employee).

---

## Architecture

```
React SPA ──HTTP──▶ API Gateway ──TCP──▶ Employee Service ──▶ MySQL
                                  └─TCP──▶ Attendance Service ──▶ MySQL
```

The brief's "API with microservices concept" requirement is fulfilled by the
**backend**: a Gateway plus two independent NestJS microservices talking over
TCP, each owning its own tables. The **frontend** is a single React SPA with
role-based routing — combining the two user-facing use cases into one app was
confirmed acceptable with the recruiter; it doesn't affect the backend's
microservice decomposition.

| Piece | What it owns |
|---|---|
| **Gateway** (`apps/gateway`) | The only HTTP entry point. JWT issuing/verification, role guards, HTTP→TCP proxying, file upload handling (photos land here; only the file path travels downstream). |
| **Employee Service** (`apps/employee-service`) | `user` and `employee` tables. Employee CRUD, credential validation. |
| **Attendance Service** (`apps/attendance-service`) | `attendance` table. Check-in/out, attendance queries. |
| **libs/common** | Shared DTOs, TCP message-pattern constants, enums, interfaces — imported as `@app/common` by all three backend apps. |
| **Frontend** (`frontend/`) | Vite + React + TypeScript SPA. Independent `package.json`, not part of the NestJS monorepo. |

## Tech stack

| Layer | Choice |
|---|---|
| Language | TypeScript everywhere |
| Backend | NestJS (monorepo: `apps/` + `libs/common`) |
| Frontend | React + TypeScript, Vite, plain CSS (OKLCH design tokens, no Tailwind) |
| Database | MySQL, shared across services |
| ORM | TypeORM (`synchronize: true` — convenient for this test, not a production practice) |
| Auth | JWT, role-based (`ADMIN` / `EMPLOYEE`) |
| Inter-service transport | TCP (`@nestjs/microservices`) |
| Orchestration | Docker Compose |

---

## Running it

### 1. Backend

```bash
cp .env.example .env   # adjust DB_PASSWORD / JWT_SECRET if you want
docker compose up -d --build
```

This brings up MySQL, Employee Service, Attendance Service, and the Gateway.
The Gateway is published at `http://localhost:3000`; the two microservices
are only reachable inside the Docker network. Confirm everything is alive:

```bash
curl http://localhost:3000/health
# {"gateway":{"status":"ok"},"employeeService":{"status":"ok",...},"attendanceService":{"status":"ok",...}}
```

**Bootstrap the first admin.** `POST /employees` (the only way to create a
login) requires an admin token — so on a fresh database there's a
chicken-and-egg problem. Solve it once with:

```bash
node scripts/seed-admin.js admin Admin123!
```

This connects straight to MySQL and inserts the row (idempotent — safe to
re-run). From there, log in as `admin` / `Admin123!` and create the rest of
the employees through the app itself.

### 2. Frontend

```bash
cd frontend
cp .env.example .env   # VITE_API_URL, defaults to http://localhost:3000
npm install
npm run dev
```

Open the printed URL (typically `http://localhost:5173`).

### 3. Try it

- Log in as `admin` / `Admin123!` → **Employees** tab → *Add employee* (this
  also creates that employee's login).
- Log out, log in as the employee you just created → upload any photo →
  *Check in* → try checking in again (rejected: one check-in per day) →
  *Check out*.
- Log back in as admin → **Attendance** tab → see the record, click *View* to
  see the photo.

---

## Key architectural decisions

Each of these was a deliberate trade-off for a 3–4 day test, not an
oversight. Noted here so they don't get silently "fixed" later.

1. **Shared MySQL database, not database-per-service.** `attendance`
   references `employee`; a shared schema avoids inter-service calls purely
   to enrich data. Next step for production: split the databases and enrich
   via an internal API call or an event-driven read model.
2. **`user` and `employee` are separate tables.** `user` is the auth
   identity, `employee` is the HR domain record. An admin account can exist
   with no `employee` row (`employeeId` is nullable on `user`).
3. **Soft delete only.** "Deleting" an employee sets `status = INACTIVE`,
   never a hard `DELETE` — `attendance` rows reference `employee` by ID, and
   historical records must survive.
4. **Server-side timestamps for check-in/out.** A client-supplied time can be
   spoofed by changing the device clock, so it's never trusted or even
   accepted from the request.
5. **Photo upload is handled at the Gateway, not the services.** TCP
   transport isn't suited to large binaries. The Gateway saves the file to
   `UPLOAD_DIR` and passes only the filename downstream; the Gateway also
   serves `/uploads` statically so the admin UI can display the photo.
6. **`RpcException`, not NestJS HTTP exceptions, inside the microservices.**
   `NotFoundException` / `ConflictException` don't serialize correctly over
   TCP. Both microservices always throw `RpcException({ statusCode,
   message })`; the Gateway's `sendTcp()` helper is the one place that
   translates that back into a real HTTP response.
7. **`password` has `select: false` on the `User` entity.** Normal queries
   never return the hash — it's explicitly selected in exactly one place,
   `UserService.validateCredentials()`.
8. **`create`/`update` on Employee run inside a DB transaction** (via
   `DataSource.transaction`) because they touch both `employee` and `user` —
   both succeed or both roll back.
9. **MySQL over Oracle** (the brief allowed either) — faster to provision, no
   licensing overhead, keeps the focus on architecture rather than DB setup.
10. **Node 20, not 18, in the Dockerfile** — TypeORM relies on the global
    `crypto` API, not reliably available as a global on Node 18.
11. **JWT guard is hand-rolled**, not Passport — `@nestjs/jwt` + a custom
    `JwtAuthGuard`/`RolesGuard` pair applied globally via `APP_GUARD`, with a
    `@Public()` escape hatch for the login route. Chosen for a smaller
    dependency footprint at this scope.
12. **Frontend has one custom reusable component required by the brief:
    `<PhotoUploader />`** (drag-and-drop + click-to-browse + preview, full
    interactive-state coverage). `<DataTable />` is a second, generic,
    reusable table shared by the employee list and the attendance list.

---

## API contract (Gateway-facing)

All routes are exposed by the Gateway over HTTP. Protected routes require
`Authorization: Bearer <token>`.

| Method | Endpoint | Access | Notes |
|---|---|---|---|
| POST | `/auth/login` | Public | `{ username, password }` → `{ accessToken }` |
| POST | `/employees` | Admin | Creates the HR record *and* its login user |
| GET | `/employees` | Admin | Optional `?status=&search=` |
| GET | `/employees/:id` | Admin | |
| PATCH | `/employees/:id` | Admin | Partial update; `username`/`password` optional |
| DELETE | `/employees/:id` | Admin | Soft delete — sets `status = INACTIVE` |
| POST | `/attendance/check-in` | Employee | Multipart, file field `photo`. `employeeId` comes from the JWT, never the body. One check-in per day. |
| PATCH | `/attendance/check-out` | Employee | Requires an open check-in today |
| GET | `/attendance/me` | Employee | Own history |
| GET | `/attendance` | Admin | Optional `?date=&employeeId=` |

Internal TCP message patterns live in `libs/common/src/constants/patterns.ts`
(`EMPLOYEE_PATTERNS`, `ATTENDANCE_PATTERNS`, `AUTH_PATTERNS`).

A full manual test suite (including negative/guard cases — wrong role, no
token, wrong password, duplicate check-in) is at
[`requests/api.http`](requests/api.http) (VS Code "REST Client" extension).

---

## Project structure

```
apps/
  gateway/              HTTP entry point, auth, proxying, uploads
  employee-service/     user + employee microservice
  attendance-service/   attendance microservice
libs/common/            shared DTOs, enums, TCP patterns, interfaces
frontend/               Vite + React + TypeScript SPA
scripts/seed-admin.js   bootstraps the first admin account
requests/api.http       manual end-to-end test suite
CONTEXT.md              full development log and decision history
```

## Known limitations / next steps for production

- Shared database across services (decision #1) — would split per service
  in production.
- `synchronize: true` on TypeORM — would use migrations in production.
- No automated test suite (unit/e2e) — verification for this submission was
  done via the manual `requests/api.http` suite and a scripted browser
  walkthrough of the frontend; adding Jest/Playwright coverage would be a
  natural next step.
- No refresh-token flow — the JWT simply expires (`JWT_EXPIRES_IN`) and the
  user logs in again.
