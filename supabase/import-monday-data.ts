/**
 * Import Monday.com data into BuildWise SQL seed file.
 *
 * Usage: npx tsx supabase/import-monday-data.ts
 *
 * Reads JSON exports from /tmp/monday_*.json and generates
 * /Users/urielshershevsky/buildwise/supabase/seed-real.sql
 */

import * as fs from "fs";
import * as crypto from "crypto";

// ─── UUID v5 generation ───────────────────────────────────────────
const NAMESPACE = "6ba7b810-9dad-11d1-80b4-00c04fd430c8"; // DNS namespace

function uuidV5(name: string): string {
  const nsBytes = Buffer.from(NAMESPACE.replace(/-/g, ""), "hex");
  const nameBytes = Buffer.from(name, "utf8");
  const hash = crypto
    .createHash("sha1")
    .update(Buffer.concat([nsBytes, nameBytes]))
    .digest();

  // Set version 5
  hash[6] = (hash[6] & 0x0f) | 0x50;
  // Set variant
  hash[8] = (hash[8] & 0x3f) | 0x80;

  const hex = hash.toString("hex").slice(0, 32);
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20, 32),
  ].join("-");
}

function mondayIdToUuid(prefix: string, mondayId: string): string {
  return uuidV5(`buildwise:${prefix}:${mondayId}`);
}

// ─── Helpers ──────────────────────────────────────────────────────
function getCol(
  item: MondayItem,
  colId: string
): { text: string | null; value: string | null } {
  const col = item.column_values.find((c) => c.id === colId);
  return col || { text: null, value: null };
}

function getColText(item: MondayItem, colId: string): string | null {
  const col = getCol(item, colId);
  return col.text && col.text.trim() ? col.text.trim() : null;
}

function getColValue(item: MondayItem, colId: string): any {
  const col = getCol(item, colId);
  if (!col.value) return null;
  try {
    return JSON.parse(col.value);
  } catch {
    return col.value;
  }
}

function esc(val: string | null | undefined): string {
  if (val === null || val === undefined || val === "") return "NULL";
  return `'${val.replace(/'/g, "''")}'`;
}

function escOrDefault(
  val: string | null | undefined,
  defaultVal: string
): string {
  if (val === null || val === undefined || val === "") return esc(defaultVal);
  return esc(val);
}

// ─── Types ────────────────────────────────────────────────────────
interface MondayItem {
  id: string;
  name: string;
  group: { title: string };
  column_values: Array<{
    id: string;
    text: string | null;
    value: string | null;
  }>;
}

interface MondayExport {
  data: {
    boards: Array<{
      items_page: {
        items: MondayItem[];
      };
    }>;
  };
}

// ─── Load data ────────────────────────────────────────────────────
function loadItems(filePath: string): MondayItem[] {
  const raw: MondayExport = JSON.parse(fs.readFileSync(filePath, "utf8"));
  return raw.data.boards[0].items_page.items;
}

const clients = loadItems("/tmp/monday_clients.json");
const employees = loadItems("/tmp/monday_employees.json");
const inactiveEmployees = loadItems("/tmp/monday_inactive_employees.json");
const projects = loadItems("/tmp/monday_projects.json");
const foreignWorkers = loadItems("/tmp/monday_foreign_workers.json");

console.log(
  `Loaded: ${clients.length} clients, ${employees.length} employees, ${inactiveEmployees.length} inactive employees, ${projects.length} projects, ${foreignWorkers.length} foreign workers`
);

// ─── Build SQL ────────────────────────────────────────────────────
const sql: string[] = [];

sql.push("-- =============================================");
sql.push("-- BuildWise Seed Data (imported from Monday.com)");
sql.push(`-- Generated: ${new Date().toISOString()}`);
sql.push("-- =============================================");
sql.push("");
sql.push("BEGIN;");
sql.push("");

// Delete in reverse dependency order
sql.push("-- Clean existing data");
sql.push("DELETE FROM public.daily_log_workers;");
sql.push("DELETE FROM public.daily_log_files;");
sql.push("DELETE FROM public.daily_logs;");
sql.push("DELETE FROM public.project_employees;");
sql.push("DELETE FROM public.projects;");
sql.push("DELETE FROM public.employees;");
sql.push("DELETE FROM public.clients;");
sql.push("");

// ─── Clients ──────────────────────────────────────────────────────
sql.push("-- =============================================");
sql.push("-- Clients");
sql.push("-- =============================================");

// Default client for projects without a client relation
const DEFAULT_CLIENT_ID = mondayIdToUuid("client", "default-unknown");
sql.push(
  `INSERT INTO public.clients (id, name, company_number, is_active) VALUES (${esc(DEFAULT_CLIENT_ID)}, 'לקוח לא משויך', NULL, true);`
);

const clientIdMap = new Map<string, string>(); // monday ID -> uuid

for (const item of clients) {
  const uuid = mondayIdToUuid("client", item.id);
  clientIdMap.set(item.id, uuid);

  const name = item.name;
  const companyNumber = getColText(item, "text_mkrqwpzm");
  const email = getColText(item, "email_mkrqtrw1");
  const notes = getColText(item, "long_text_mkrqamkd");

  // Address: location column
  const locationVal = getColValue(item, "location_mkrqw9wp");
  let address: string | null = null;
  if (locationVal && typeof locationVal === "object" && locationVal.address) {
    address = locationVal.address;
  } else {
    address = getColText(item, "location_mkrqw9wp");
  }

  // Status
  const statusText = getColText(item, "color_mkrq8w1h");
  const isActive =
    statusText && statusText.includes("פעיל") && !statusText.includes("לא פעיל")
      ? true
      : statusText === null
        ? true
        : false;

  // Contact name & phone: check text columns
  const contactName = getColText(item, "text_mkrqvz8y"); // Could be contact
  const phone = getColText(item, "text_mkrqedfh"); // Could be phone

  sql.push(
    `INSERT INTO public.clients (id, name, company_number, contact_name, phone, email, address, notes, is_active) VALUES (${esc(uuid)}, ${esc(name)}, ${esc(companyNumber)}, ${esc(contactName)}, ${esc(phone)}, ${esc(email)}, ${esc(address)}, ${esc(notes)}, ${isActive});`
  );
}

sql.push("");

// ─── Employees ────────────────────────────────────────────────────
sql.push("-- =============================================");
sql.push("-- Employees");
sql.push("-- =============================================");

function processEmployee(item: MondayItem, forceInactive: boolean = false) {
  const uuid = mondayIdToUuid("employee", item.id);
  const name = item.name;
  const nationalId = getColText(item, "text_mkska4hf");
  const phoneVal = getColValue(item, "phone_mkry5e9f");
  const phone = phoneVal?.phone || getColText(item, "phone_mkry5e9f");
  const emailVal = getColValue(item, "email_mkskvrnf");
  const email = emailVal?.email || getColText(item, "email_mkskvrnf");

  // Role
  const roleText = getColText(item, "color_mkskhtr2");
  const roleTitle = roleText && roleText !== "בחר/י" ? roleText : "עובד";

  // Hourly rate
  const hourlyRateText = getColText(item, "numeric_mkrznr5");
  const hourlyRate = hourlyRateText ? parseFloat(hourlyRateText) || 0 : 0;

  // Status
  let status: string;
  if (forceInactive) {
    status = "inactive";
  } else {
    const statusText = getColText(item, "status");
    status =
      statusText && statusText.includes("לא פעילים") ? "inactive" : "active";
  }

  // Dates
  const hireDate = getColText(item, "date_mkskh173");
  const endDate = getColText(item, "date_mkrq8q7g");

  // Notes
  const notes = getColText(item, "long_text_mkrqes44");

  // Employee type from group
  const group = item.group.title;
  let employeeType: string;
  if (group.includes("שטח") || group === "עובדי שטח") {
    employeeType = "field";
  } else if (group.includes("פרילנס") || group === "פרילנסרים") {
    employeeType = "freelancer";
  } else if (group.includes("משרד") || group === "עובדי משרד") {
    employeeType = "office";
  } else {
    // Inactive employees board - guess from role
    employeeType = "field";
  }

  sql.push(
    `INSERT INTO public.employees (id, full_name, national_id, phone, email, role_title, employee_type, hourly_rate, status, hire_date, end_date, notes) VALUES (${esc(uuid)}, ${esc(name)}, ${esc(nationalId)}, ${esc(phone)}, ${esc(email)}, ${esc(roleTitle)}, ${esc(employeeType)}, ${hourlyRate}, ${esc(status)}, ${hireDate ? esc(hireDate) : "CURRENT_DATE"}, ${esc(endDate)}, ${esc(notes)});`
  );
}

for (const item of employees) {
  processEmployee(item, false);
}

for (const item of inactiveEmployees) {
  processEmployee(item, true);
}

sql.push("");

// ─── Foreign Workers ──────────────────────────────────────────────
sql.push("-- =============================================");
sql.push("-- Foreign Workers (as employees)");
sql.push("-- =============================================");

for (const item of foreignWorkers) {
  const uuid = mondayIdToUuid("employee", item.id);
  const name = item.name;

  // National ID: try passport columns
  let nationalId = getColText(item, "text_mkrq1jeq");
  if (!nationalId) {
    nationalId = getColText(item, "text_mkvmfrdc");
  }

  const phone = getColText(item, "text_mkvmck0w");

  // Hourly rate
  const hourlyRateText = getColText(item, "numeric_mkrq1x78");
  const hourlyRate = hourlyRateText ? parseFloat(hourlyRateText) || 0 : 0;

  // Status
  const statusText = getColText(item, "color_mkrqq4e2");
  const status =
    statusText && statusText.includes("לא פעילים") ? "inactive" : "active";

  sql.push(
    `INSERT INTO public.employees (id, full_name, national_id, phone, email, role_title, employee_type, hourly_rate, status, hire_date, notes) VALUES (${esc(uuid)}, ${esc(name)}, ${esc(nationalId)}, ${esc(phone)}, NULL, 'עובד זר', 'field', ${hourlyRate}, ${esc(status)}, CURRENT_DATE, NULL);`
  );
}

sql.push("");

// ─── Projects ─────────────────────────────────────────────────────
sql.push("-- =============================================");
sql.push("-- Projects");
sql.push("-- =============================================");

const usedProjectCodes = new Set<string>();

function generateProjectCode(name: string, id: string): string {
  // Try abbreviating the name
  const words = name.replace(/[^א-תa-zA-Z0-9\s]/g, "").split(/\s+/).filter(Boolean);
  let code: string;
  if (words.length >= 2) {
    code = words
      .slice(0, 3)
      .map((w) => w.slice(0, 3))
      .join("-");
  } else {
    code = name.slice(0, 8);
  }
  code = code.toUpperCase();

  // Ensure uniqueness
  let finalCode = code;
  let counter = 1;
  while (usedProjectCodes.has(finalCode)) {
    finalCode = `${code}-${counter}`;
    counter++;
  }
  usedProjectCodes.add(finalCode);
  return finalCode;
}

for (const item of projects) {
  const uuid = mondayIdToUuid("project", item.id);
  const name = item.name;

  // Project code
  let projectCode = getColText(item, "text_mkt45v1x");
  if (!projectCode) {
    projectCode = generateProjectCode(name, item.id);
  } else {
    if (usedProjectCodes.has(projectCode)) {
      projectCode = `${projectCode}-${item.id.slice(-4)}`;
    }
    usedProjectCodes.add(projectCode);
  }

  // Status
  const statusText = getColText(item, "color_mkwegb1z");
  let status: string;
  if (!statusText) {
    status = "planning";
  } else if (statusText.includes("חדשים")) {
    status = "planning";
  } else if (statusText.includes("בביצוע")) {
    status = "active";
  } else if (statusText.includes("חשבון סופי") || statusText.includes("מסירות")) {
    status = "active";
  } else if (statusText.includes("הסתיימו")) {
    status = "completed";
  } else {
    status = "planning";
  }

  // Client relation
  const relationVal = getColValue(item, "board_relation_mkrqvs80");
  let clientId = DEFAULT_CLIENT_ID;
  if (
    relationVal &&
    relationVal.linkedPulseIds &&
    relationVal.linkedPulseIds.length > 0
  ) {
    const pulseId = String(relationVal.linkedPulseIds[0].linkedPulseId);
    const mapped = clientIdMap.get(pulseId);
    if (mapped) clientId = mapped;
  }

  const location = getColText(item, "text_mkvbmnab");
  const description = getColText(item, "text_mkt48kfa");
  const startDate = getColText(item, "date_mkrqmrhv");
  const endDate = getColText(item, "date_mkrqj5fj");
  const notes = getColText(item, "long_text_mkrq35n6");

  sql.push(
    `INSERT INTO public.projects (id, name, project_code, client_id, status, location, description, start_date, end_date, notes) VALUES (${esc(uuid)}, ${esc(name)}, ${esc(projectCode)}, ${esc(clientId)}, ${esc(status)}, ${esc(location)}, ${esc(description)}, ${esc(startDate)}, ${esc(endDate)}, ${esc(notes)});`
  );
}

sql.push("");
sql.push("COMMIT;");
sql.push("");

// ─── Write output ─────────────────────────────────────────────────
const outputPath =
  "/Users/urielshershevsky/buildwise/supabase/seed-real.sql";
fs.writeFileSync(outputPath, sql.join("\n"), "utf8");
console.log(`Written ${sql.length} lines to ${outputPath}`);
console.log(
  `Totals: ${clients.length} clients + 1 default, ${employees.length + inactiveEmployees.length} employees, ${foreignWorkers.length} foreign workers, ${projects.length} projects`
);
