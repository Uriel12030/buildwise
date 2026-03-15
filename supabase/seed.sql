-- =============================================
-- BuildWise Seed Data
-- =============================================
-- NOTE: Run this AFTER creating the auth users via Supabase dashboard or API.
-- The seed script below assumes the auth users have already been created
-- and their UUIDs are known.
--
-- Demo users to create in Supabase Auth (email/password):
-- 1. admin@buildwise.demo / admin123456   (role: admin)
-- 2. office@buildwise.demo / office123456 (role: office_manager)
-- 3. pm@buildwise.demo / pm123456         (role: project_manager)
-- 4. site@buildwise.demo / site123456     (role: site_manager)
--
-- After creating auth users, the trigger will auto-create public.users records.
-- You can then update the roles with:
-- UPDATE public.users SET role = 'admin' WHERE email = 'admin@buildwise.demo';
-- UPDATE public.users SET role = 'office_manager' WHERE email = 'office@buildwise.demo';
-- UPDATE public.users SET role = 'project_manager' WHERE email = 'pm@buildwise.demo';
-- UPDATE public.users SET role = 'site_manager' WHERE email = 'site@buildwise.demo';

-- =============================================
-- Clients
-- =============================================
insert into public.clients (id, name, company_number, contact_name, phone, email, address, notes) values
  ('c1000000-0000-0000-0000-000000000001', 'Acme Construction Ltd', '514789632', 'David Cohen', '050-1234567', 'david@acme-const.co.il', '123 Herzl St, Tel Aviv', 'Long-term client, priority service'),
  ('c1000000-0000-0000-0000-000000000002', 'Greenfield Developments', '518963214', 'Sarah Levy', '052-9876543', 'sarah@greenfield.co.il', '45 Rothschild Blvd, Tel Aviv', 'Residential projects'),
  ('c1000000-0000-0000-0000-000000000003', 'Tel Aviv Municipality', '510000001', 'Yossi Ben-David', '03-7654321', 'yossi@tlv.gov.il', 'Rabin Square, Tel Aviv', 'Government client, strict documentation'),
  ('c1000000-0000-0000-0000-000000000004', 'Haifa Industrial Park', '520147896', 'Rachel Mizrahi', '054-1112233', 'rachel@hip.co.il', '78 Industrial Rd, Haifa', null),
  ('c1000000-0000-0000-0000-000000000005', 'Negev Solar Energy', '525896314', 'Avi Peretz', '058-4445566', 'avi@negevsolar.co.il', 'Beer Sheva Industrial Zone', 'Renewable energy projects');

-- =============================================
-- Employees
-- =============================================
insert into public.employees (id, full_name, national_id, phone, email, role_title, employee_type, hourly_rate, status, hire_date, notes) values
  ('e1000000-0000-0000-0000-000000000001', 'Moshe Katz', '123456789', '050-1111111', 'moshe@buildwise.co.il', 'Heavy Equipment Operator', 'field', 85.00, 'active', '2023-01-15', 'Experienced crane operator'),
  ('e1000000-0000-0000-0000-000000000002', 'Ahmad Hassan', '234567890', '052-2222222', null, 'Electrician', 'field', 75.00, 'active', '2023-03-01', 'Licensed electrician'),
  ('e1000000-0000-0000-0000-000000000003', 'Igor Petrov', '345678901', '054-3333333', null, 'Welder', 'field', 80.00, 'active', '2023-06-01', 'Certified welder'),
  ('e1000000-0000-0000-0000-000000000004', 'Yael Shimoni', '456789012', '050-4444444', 'yael@buildwise.co.il', 'Safety Officer', 'office', 95.00, 'active', '2022-09-01', null),
  ('e1000000-0000-0000-0000-000000000005', 'Carlos Rodriguez', null, '058-5555555', null, 'General Laborer', 'field', 55.00, 'active', '2024-01-10', null),
  ('e1000000-0000-0000-0000-000000000006', 'Tal Ben-Ari', '567890123', '050-6666666', 'tal@buildwise.co.il', 'Plumber', 'freelancer', 90.00, 'active', '2023-11-01', 'Available weekends'),
  ('e1000000-0000-0000-0000-000000000007', 'Dmitry Volkov', '678901234', '052-7777777', null, 'Concrete Worker', 'field', 65.00, 'active', '2024-02-15', null),
  ('e1000000-0000-0000-0000-000000000008', 'Noa Friedman', '789012345', '054-8888888', 'noa@buildwise.co.il', 'Surveyor', 'office', 100.00, 'active', '2022-06-01', null),
  ('e1000000-0000-0000-0000-000000000009', 'Ali Mansour', '890123456', '050-9999999', null, 'Painter', 'field', 60.00, 'inactive', '2023-01-01', 'On leave'),
  ('e1000000-0000-0000-0000-000000000010', 'Lior Shapira', '901234567', '058-0000000', null, 'Scaffolding Specialist', 'freelancer', 85.00, 'active', '2024-03-01', null);

-- =============================================
-- Projects (will need real user IDs for PM/site manager)
-- =============================================
insert into public.projects (id, name, project_code, client_id, status, location, description, start_date, end_date) values
  ('p1000000-0000-0000-0000-000000000001', 'Tower 42 Residential Complex', 'PRJ-001', 'c1000000-0000-0000-0000-000000000001', 'active', 'Herzliya Marina', 'High-rise residential tower, 42 floors, luxury apartments', '2024-06-01', '2026-12-31'),
  ('p1000000-0000-0000-0000-000000000002', 'Green Valley Housing', 'PRJ-002', 'c1000000-0000-0000-0000-000000000002', 'active', 'Modiin', '120-unit residential development with parks', '2024-09-01', '2026-06-30'),
  ('p1000000-0000-0000-0000-000000000003', 'City Park Renovation', 'PRJ-003', 'c1000000-0000-0000-0000-000000000003', 'planning', 'Tel Aviv, Yarkon Park', 'Infrastructure renovation of Yarkon Park facilities', '2025-04-01', '2025-12-31'),
  ('p1000000-0000-0000-0000-000000000004', 'Industrial Warehouse B7', 'PRJ-004', 'c1000000-0000-0000-0000-000000000004', 'active', 'Haifa Bay', 'New 5000sqm warehouse construction', '2024-11-01', '2025-08-30'),
  ('p1000000-0000-0000-0000-000000000005', 'Solar Farm Phase 2', 'PRJ-005', 'c1000000-0000-0000-0000-000000000005', 'on_hold', 'Arad', 'Expansion of solar panel farm, 50MW additional capacity', '2025-01-15', null),
  ('p1000000-0000-0000-0000-000000000006', 'Office Tower Renovation', 'PRJ-006', 'c1000000-0000-0000-0000-000000000001', 'completed', 'Ramat Gan Diamond Exchange', 'Complete renovation of 15-story office building', '2023-06-01', '2024-12-31');

-- =============================================
-- Project Employees
-- =============================================
insert into public.project_employees (project_id, employee_id, assigned_from) values
  ('p1000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000001', '2024-06-15'),
  ('p1000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000002', '2024-07-01'),
  ('p1000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000003', '2024-08-01'),
  ('p1000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000004', '2024-06-01'),
  ('p1000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000007', '2024-09-01'),
  ('p1000000-0000-0000-0000-000000000002', 'e1000000-0000-0000-0000-000000000005', '2024-09-15'),
  ('p1000000-0000-0000-0000-000000000002', 'e1000000-0000-0000-0000-000000000006', '2024-10-01'),
  ('p1000000-0000-0000-0000-000000000002', 'e1000000-0000-0000-0000-000000000007', '2024-10-01'),
  ('p1000000-0000-0000-0000-000000000004', 'e1000000-0000-0000-0000-000000000001', '2024-11-15'),
  ('p1000000-0000-0000-0000-000000000004', 'e1000000-0000-0000-0000-000000000003', '2024-11-15'),
  ('p1000000-0000-0000-0000-000000000004', 'e1000000-0000-0000-0000-000000000010', '2024-12-01');

-- =============================================
-- Daily Logs (today and recent)
-- =============================================
insert into public.daily_logs (id, project_id, log_date, weather, work_summary, notes, issues, status) values
  ('d1000000-0000-0000-0000-000000000001', 'p1000000-0000-0000-0000-000000000001', current_date, 'Sunny, 28°C', 'Completed floor 18 concrete pour. Rebar installation on floor 19 started.', 'Concrete truck arrived 30 minutes late.', 'Minor delay due to concrete delivery.', 'submitted'),
  ('d1000000-0000-0000-0000-000000000002', 'p1000000-0000-0000-0000-000000000001', current_date - interval '1 day', 'Partly cloudy', 'Floor 17 finishing work. Electrical conduit installation floors 15-16.', null, null, 'approved'),
  ('d1000000-0000-0000-0000-000000000003', 'p1000000-0000-0000-0000-000000000002', current_date, 'Sunny', 'Foundation work for buildings C and D. Drainage system installation.', 'Soil test results received - all good.', null, 'draft'),
  ('d1000000-0000-0000-0000-000000000004', 'p1000000-0000-0000-0000-000000000004', current_date - interval '1 day', 'Cloudy, 22°C', 'Steel frame erection for section B. Roofing material delivered.', null, 'Crane needed servicing, 2hr downtime.', 'submitted'),
  ('d1000000-0000-0000-0000-000000000005', 'p1000000-0000-0000-0000-000000000002', current_date - interval '2 days', 'Rain', 'Limited outdoor work due to rain. Indoor electrical work on building A.', 'Rain stopped by 2PM, resumed grading.', 'Weather delay - 4 hours lost.', 'approved'),
  ('d1000000-0000-0000-0000-000000000006', 'p1000000-0000-0000-0000-000000000001', current_date - interval '3 days', 'Sunny', 'Floor 16 concrete pour completed. Safety inspection passed.', 'Inspector approved all safety measures.', null, 'approved'),
  ('d1000000-0000-0000-0000-000000000007', 'p1000000-0000-0000-0000-000000000004', current_date - interval '2 days', 'Windy', 'Foundation inspection. Utility connections started.', null, 'High winds - suspended crane operations after 3PM.', 'approved');

-- =============================================
-- Daily Log Workers
-- =============================================
insert into public.daily_log_workers (daily_log_id, employee_id, hours_worked, overtime_hours, notes) values
  ('d1000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000001', 9, 1, 'Crane operation'),
  ('d1000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000003', 8, 0, 'Rebar welding'),
  ('d1000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000007', 8, 0, 'Concrete pour'),
  ('d1000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000004', 4, 0, 'Safety inspection'),
  ('d1000000-0000-0000-0000-000000000002', 'e1000000-0000-0000-0000-000000000002', 8, 2, 'Electrical conduit'),
  ('d1000000-0000-0000-0000-000000000002', 'e1000000-0000-0000-0000-000000000001', 8, 0, null),
  ('d1000000-0000-0000-0000-000000000002', 'e1000000-0000-0000-0000-000000000007', 8, 0, null),
  ('d1000000-0000-0000-0000-000000000003', 'e1000000-0000-0000-0000-000000000005', 8, 0, 'Foundation work'),
  ('d1000000-0000-0000-0000-000000000003', 'e1000000-0000-0000-0000-000000000006', 6, 0, 'Drainage pipes'),
  ('d1000000-0000-0000-0000-000000000003', 'e1000000-0000-0000-0000-000000000007', 8, 0, 'Excavation'),
  ('d1000000-0000-0000-0000-000000000004', 'e1000000-0000-0000-0000-000000000001', 6, 0, 'Crane operation - limited due to servicing'),
  ('d1000000-0000-0000-0000-000000000004', 'e1000000-0000-0000-0000-000000000003', 8, 1, 'Steel welding'),
  ('d1000000-0000-0000-0000-000000000004', 'e1000000-0000-0000-0000-000000000010', 8, 0, 'Scaffolding setup'),
  ('d1000000-0000-0000-0000-000000000005', 'e1000000-0000-0000-0000-000000000002', 6, 0, 'Indoor electrical only'),
  ('d1000000-0000-0000-0000-000000000005', 'e1000000-0000-0000-0000-000000000005', 4, 0, 'Sent home early due to rain'),
  ('d1000000-0000-0000-0000-000000000006', 'e1000000-0000-0000-0000-000000000001', 9, 1, null),
  ('d1000000-0000-0000-0000-000000000006', 'e1000000-0000-0000-0000-000000000003', 9, 1, null),
  ('d1000000-0000-0000-0000-000000000006', 'e1000000-0000-0000-0000-000000000007', 8, 0, null),
  ('d1000000-0000-0000-0000-000000000007', 'e1000000-0000-0000-0000-000000000001', 5, 0, 'Wind limited crane use'),
  ('d1000000-0000-0000-0000-000000000007', 'e1000000-0000-0000-0000-000000000010', 8, 0, null);
