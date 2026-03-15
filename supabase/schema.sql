-- =============================================
-- BuildWise Database Schema
-- =============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- =============================================
-- Users table (extends Supabase auth.users)
-- =============================================
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null unique,
  role text not null default 'site_manager' check (role in ('admin', 'office_manager', 'project_manager', 'site_manager')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =============================================
-- Clients
-- =============================================
create table public.clients (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  company_number text,
  contact_name text,
  phone text,
  email text,
  address text,
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =============================================
-- Employees
-- =============================================
create table public.employees (
  id uuid primary key default uuid_generate_v4(),
  full_name text not null,
  national_id text,
  phone text,
  email text,
  role_title text not null,
  employee_type text not null default 'field' check (employee_type in ('field', 'office', 'freelancer')),
  hourly_rate numeric(10, 2) not null default 0,
  status text not null default 'active' check (status in ('active', 'inactive')),
  hire_date date not null default current_date,
  end_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =============================================
-- Projects
-- =============================================
create table public.projects (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  project_code text not null unique,
  client_id uuid not null references public.clients(id) on delete restrict,
  status text not null default 'planning' check (status in ('planning', 'active', 'on_hold', 'completed')),
  location text,
  description text,
  start_date date,
  end_date date,
  project_manager_user_id uuid references public.users(id) on delete set null,
  site_manager_user_id uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_projects_client_id on public.projects(client_id);
create index idx_projects_status on public.projects(status);

-- =============================================
-- Project Employees (assignments)
-- =============================================
create table public.project_employees (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references public.projects(id) on delete cascade,
  employee_id uuid not null references public.employees(id) on delete cascade,
  assigned_from date not null default current_date,
  assigned_to date,
  created_at timestamptz not null default now()
);

create index idx_project_employees_project on public.project_employees(project_id);
create index idx_project_employees_employee on public.project_employees(employee_id);

-- =============================================
-- Daily Logs
-- =============================================
create table public.daily_logs (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references public.projects(id) on delete cascade,
  log_date date not null,
  site_manager_user_id uuid references public.users(id) on delete set null,
  weather text,
  work_summary text not null,
  notes text,
  issues text,
  status text not null default 'draft' check (status in ('draft', 'submitted', 'approved')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_daily_logs_project on public.daily_logs(project_id);
create index idx_daily_logs_date on public.daily_logs(log_date);
create index idx_daily_logs_status on public.daily_logs(status);

-- =============================================
-- Daily Log Workers
-- =============================================
create table public.daily_log_workers (
  id uuid primary key default uuid_generate_v4(),
  daily_log_id uuid not null references public.daily_logs(id) on delete cascade,
  employee_id uuid not null references public.employees(id) on delete cascade,
  hours_worked numeric(4, 1) not null default 0 check (hours_worked >= 0 and hours_worked <= 24),
  overtime_hours numeric(4, 1) not null default 0 check (overtime_hours >= 0 and overtime_hours <= 24),
  notes text
);

create index idx_daily_log_workers_log on public.daily_log_workers(daily_log_id);
create index idx_daily_log_workers_employee on public.daily_log_workers(employee_id);

-- =============================================
-- Daily Log Files
-- =============================================
create table public.daily_log_files (
  id uuid primary key default uuid_generate_v4(),
  daily_log_id uuid not null references public.daily_logs(id) on delete cascade,
  file_path text not null,
  file_name text not null,
  file_type text not null default '',
  uploaded_at timestamptz not null default now()
);

create index idx_daily_log_files_log on public.daily_log_files(daily_log_id);

-- =============================================
-- Activity Logs (audit trail)
-- =============================================
create table public.activity_logs (
  id uuid primary key default uuid_generate_v4(),
  entity_type text not null,
  entity_id uuid not null,
  action text not null,
  user_id uuid references public.users(id) on delete set null,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index idx_activity_logs_entity on public.activity_logs(entity_type, entity_id);

-- =============================================
-- Row Level Security
-- =============================================

-- Enable RLS on all tables
alter table public.users enable row level security;
alter table public.clients enable row level security;
alter table public.employees enable row level security;
alter table public.projects enable row level security;
alter table public.project_employees enable row level security;
alter table public.daily_logs enable row level security;
alter table public.daily_log_workers enable row level security;
alter table public.daily_log_files enable row level security;
alter table public.activity_logs enable row level security;

-- Authenticated users can read all data
create policy "Authenticated users can read users" on public.users for select to authenticated using (true);
create policy "Authenticated users can read clients" on public.clients for select to authenticated using (true);
create policy "Authenticated users can read employees" on public.employees for select to authenticated using (true);
create policy "Authenticated users can read projects" on public.projects for select to authenticated using (true);
create policy "Authenticated users can read project_employees" on public.project_employees for select to authenticated using (true);
create policy "Authenticated users can read daily_logs" on public.daily_logs for select to authenticated using (true);
create policy "Authenticated users can read daily_log_workers" on public.daily_log_workers for select to authenticated using (true);
create policy "Authenticated users can read daily_log_files" on public.daily_log_files for select to authenticated using (true);
create policy "Authenticated users can read activity_logs" on public.activity_logs for select to authenticated using (true);

-- Write policies (simplified: authenticated users can insert/update/delete)
-- In production, you'd want more granular policies based on role
create policy "Authenticated users can insert clients" on public.clients for insert to authenticated with check (true);
create policy "Authenticated users can update clients" on public.clients for update to authenticated using (true);
create policy "Authenticated users can delete clients" on public.clients for delete to authenticated using (true);

create policy "Authenticated users can insert employees" on public.employees for insert to authenticated with check (true);
create policy "Authenticated users can update employees" on public.employees for update to authenticated using (true);
create policy "Authenticated users can delete employees" on public.employees for delete to authenticated using (true);

create policy "Authenticated users can insert projects" on public.projects for insert to authenticated with check (true);
create policy "Authenticated users can update projects" on public.projects for update to authenticated using (true);
create policy "Authenticated users can delete projects" on public.projects for delete to authenticated using (true);

create policy "Authenticated users can insert project_employees" on public.project_employees for insert to authenticated with check (true);
create policy "Authenticated users can update project_employees" on public.project_employees for update to authenticated using (true);
create policy "Authenticated users can delete project_employees" on public.project_employees for delete to authenticated using (true);

create policy "Authenticated users can insert daily_logs" on public.daily_logs for insert to authenticated with check (true);
create policy "Authenticated users can update daily_logs" on public.daily_logs for update to authenticated using (true);
create policy "Authenticated users can delete daily_logs" on public.daily_logs for delete to authenticated using (true);

create policy "Authenticated users can insert daily_log_workers" on public.daily_log_workers for insert to authenticated with check (true);
create policy "Authenticated users can update daily_log_workers" on public.daily_log_workers for update to authenticated using (true);
create policy "Authenticated users can delete daily_log_workers" on public.daily_log_workers for delete to authenticated using (true);

create policy "Authenticated users can insert daily_log_files" on public.daily_log_files for insert to authenticated with check (true);
create policy "Authenticated users can update daily_log_files" on public.daily_log_files for update to authenticated using (true);
create policy "Authenticated users can delete daily_log_files" on public.daily_log_files for delete to authenticated using (true);

create policy "Authenticated users can insert activity_logs" on public.activity_logs for insert to authenticated with check (true);

-- Users can update their own user record
create policy "Users can update own record" on public.users for update to authenticated using (auth.uid() = id);
create policy "Admins can insert users" on public.users for insert to authenticated with check (true);

-- =============================================
-- Storage bucket for daily log files
-- =============================================
insert into storage.buckets (id, name, public) values ('daily-log-files', 'daily-log-files', true)
on conflict (id) do nothing;

-- Storage policies
create policy "Authenticated users can upload files" on storage.objects
  for insert to authenticated with check (bucket_id = 'daily-log-files');

create policy "Anyone can view files" on storage.objects
  for select using (bucket_id = 'daily-log-files');

create policy "Authenticated users can delete files" on storage.objects
  for delete to authenticated using (bucket_id = 'daily-log-files');

-- =============================================
-- Function to auto-create user record on signup
-- =============================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.users (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'site_manager')
  );
  return new;
end;
$$;

-- Trigger
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
