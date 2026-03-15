# BuildWise — Construction Operations Management

A modern, production-ready MVP for managing construction company operations: projects, clients, employees, and daily work logs.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript (strict)
- **Styling:** Tailwind CSS + shadcn/ui
- **Backend:** Supabase (Postgres, Auth, Storage)
- **Forms:** React Hook Form + Zod
- **Tables:** TanStack Table
- **Charts:** Recharts
- **Icons:** Lucide React
- **Toasts:** Sonner

## Features

- Role-based authentication (admin, office manager, project manager, site manager)
- Client management with related projects
- Project management with employee assignments
- Daily work logs with worker hours tracking
- File/image uploads for daily logs
- Dashboard with stats, charts, and missing logs alerts
- Responsive design (desktop-first, mobile-friendly)
- Searchable, sortable data tables
- Status badges with consistent color system

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project ([create one here](https://supabase.com/dashboard))

### 1. Clone and install

```bash
git clone <your-repo-url>
cd buildwise
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase project credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Set up the database

1. Open the Supabase SQL Editor
2. Run the contents of `supabase/schema.sql` — this creates all tables, indexes, RLS policies, storage bucket, and the auth trigger
3. Run the contents of `supabase/seed.sql` — this creates demo clients, employees, projects, and daily logs

### 4. Create demo users

```bash
npx tsx supabase/create-demo-users.ts
```

Or create them manually in Supabase Auth dashboard:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@buildwise.demo | admin123456 |
| Office Manager | office@buildwise.demo | office123456 |
| Project Manager | pm@buildwise.demo | pm123456 |
| Site Manager | site@buildwise.demo | site123456 |

After creating users via dashboard, update their roles:

```sql
UPDATE public.users SET role = 'admin' WHERE email = 'admin@buildwise.demo';
UPDATE public.users SET role = 'office_manager' WHERE email = 'office@buildwise.demo';
UPDATE public.users SET role = 'project_manager' WHERE email = 'pm@buildwise.demo';
UPDATE public.users SET role = 'site_manager' WHERE email = 'site@buildwise.demo';
```

### 5. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deployment to Vercel

1. Push to GitHub
2. Import the repo in Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Deploy

No extra configuration needed — the project is Vercel-ready.

## Project Structure

```
src/
  app/
    (auth)/login/         # Login page
    (app)/                # Authenticated layout
      dashboard/          # Dashboard with stats & charts
      clients/            # Clients CRUD
      employees/          # Employees CRUD
      projects/           # Projects CRUD + employee assignment
      logs/               # Daily logs CRUD + workers + files
  components/
    ui/                   # shadcn/ui components
    layout/               # Page header, stat cards, badges, etc.
    forms/                # Form field wrapper, file uploader
    tables/               # Data table wrapper
  features/
    clients/              # Client server actions
    employees/            # Employee server actions
    projects/             # Project server actions
    logs/                 # Daily log server actions
    dashboard/            # Dashboard data fetching
  lib/
    auth/                 # Auth context, user helpers
    db/                   # Supabase client setup
    permissions/          # Role-based permission system
    validations/          # Zod schemas
  types/                  # TypeScript type definitions
supabase/
  schema.sql              # Full database schema
  seed.sql                # Demo data
  create-demo-users.ts    # Script to create auth users
```

## User Roles

| Role | Permissions |
|------|-------------|
| **Admin** | Full access to everything |
| **Office Manager** | Manage clients, employees, projects; view logs |
| **Project Manager** | View/edit projects, manage logs, approve logs |
| **Site Manager** | Create/edit daily logs, upload files, limited scope |

## Known Limitations

- RLS policies are simplified (all authenticated users can read/write) — tighten for production
- No real-time updates (consider Supabase Realtime for live dashboards)
- File uploads go through server actions — consider client-side upload for large files
- No password reset flow
- No user management UI (manage via Supabase dashboard)

## Recommended Next Features

1. **Equipment Management** — track machinery, maintenance schedules
2. **Subcontractor Module** — manage subcontractors and their assignments
3. **Financial Module** — invoices, payments, budget tracking
4. **Reports & Export** — PDF/Excel export for daily logs and summaries
5. **Hebrew RTL Support** — full Hebrew localization
6. **Real-time Notifications** — push notifications for log submissions
7. **Mobile App** — React Native or PWA for field workers
8. **Advanced Permissions** — project-scoped access control
9. **Truck/Vehicle Logs** — fleet management
10. **Payroll Integration** — based on logged hours

## License

MIT
