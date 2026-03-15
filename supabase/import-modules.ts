/**
 * Import equipment, tools/inventory, and truck logs from Monday.com JSON exports.
 * Run with: npx tsx supabase/import-modules.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://aszqiiioiaccldsayjam.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzenFpaWlvaWFjY2xkc2F5amFtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzU3Nzc5MSwiZXhwIjoyMDg5MTUzNzkxfQ.vhVYRXFx6G4-w0ffOGXZqPqjwvF45RC4UyFJbIN5iTM'
)

// Helper: get column value text by id
function getCol(item: any, colId: string): string | null {
  const col = item.column_values?.find((c: any) => c.id === colId)
  return col?.text || null
}

// Helper: get column raw value by id
function getColValue(item: any, colId: string): string | null {
  const col = item.column_values?.find((c: any) => c.id === colId)
  return col?.value || null
}

function parseDate(text: string | null): string | null {
  if (!text) return null
  // date columns may have "2025-07-13 14:35" format — take just the date
  const match = text.match(/^\d{4}-\d{2}-\d{2}/)
  return match ? match[0] : null
}

function parseNumber(text: string | null): number | null {
  if (!text) return null
  const n = parseFloat(text)
  return isNaN(n) ? null : n
}

// ==================== EQUIPMENT ====================

function mapEquipmentCategory(groupTitle: string): string {
  const g = groupTitle.trim()
  if (g.includes('משאית') || g === 'משאיות') return 'truck'
  if (g.includes('עגלה') || g === 'עגלות' || g.includes('טריילר')) return 'trailer'
  if (g.includes('צמ') || g.includes('שופל') || g.includes('מחפרון') || g.includes('באגר') || g.includes("כלי צמ")) return 'heavy_equipment'
  if (g.includes('רכב') || g === 'רכבים') return 'vehicle'
  return 'other'
}

function mapEquipmentStatus(text: string | null): string {
  if (!text) return 'active'
  if (text.includes('לא פעיל')) return 'inactive'
  if (text.includes('פעיל')) return 'active'
  if (text.includes('תחזוקה')) return 'maintenance'
  if (text.includes('נזק') || text.includes('פגום')) return 'damaged'
  return 'active'
}

async function importEquipment() {
  const raw = JSON.parse(fs.readFileSync('/tmp/monday_equipment.json', 'utf-8'))
  const items = raw.data.boards[0].items_page.items

  const rows = items.map((item: any) => ({
    name: item.name,
    category: mapEquipmentCategory(item.group?.title || ''),
    type_name: item.group?.title || null,
    status: mapEquipmentStatus(getCol(item, 'color_mkrqdy92')),
    chassis_number: getCol(item, 'text_mkrqwqtn'),
    purchase_cost: parseNumber(getCol(item, 'numeric_mkrqrb2f')),
    operating_cost: parseNumber(getCol(item, 'numeric_mkrqh27n')),
    hourly_cost: parseNumber(getCol(item, 'numeric_mkrzbnpn')),
    test_expiry: parseDate(getCol(item, 'date_mkrqr8vh')),
    insurance_company: getCol(item, 'color_mkrqyz9d'),
    monday_item_id: item.id,
  }))

  const { data, error } = await supabase.from('equipment').upsert(rows, { onConflict: 'monday_item_id' }).select('id')
  if (error) {
    // Try insert instead if upsert fails (no unique constraint on monday_item_id)
    console.log('Upsert failed, trying insert...', error.message)
    const { data: d2, error: e2 } = await supabase.from('equipment').insert(rows).select('id')
    if (e2) throw e2
    return d2?.length || 0
  }
  return data?.length || 0
}

// ==================== INVENTORY ====================

function mapInventoryStatus(text: string | null): string {
  if (!text) return 'available'
  const t = text.toLowerCase()
  if (t.includes('in use') || t.includes('בשימוש')) return 'in_use'
  if (t.includes('out of stock') || t.includes('אזל')) return 'out_of_stock'
  if (t.includes('damaged') || t.includes('פגום')) return 'damaged'
  if (t.includes('expired') || t.includes('פג')) return 'expired'
  return 'available'
}

async function importInventory() {
  const raw = JSON.parse(fs.readFileSync('/tmp/monday_tools.json', 'utf-8'))
  const items = raw.data.boards[0].items_page.items

  const rows = items.map((item: any) => ({
    name: item.name,
    supplier_name: getCol(item, 'text_mm0e1ptq'),
    item_name: getCol(item, 'text_mm0enha0'),
    quantity: parseNumber(getCol(item, 'numeric_mm0eawse')) ?? 0,
    status: mapInventoryStatus(getCol(item, 'color_mm0edy5s')),
    priority: getCol(item, 'color_mm0eej4h'),
    received_date: parseDate(getCol(item, 'date_mm0ed9p3')),
    expiration_date: parseDate(getCol(item, 'date_mm0evsa8')),
    monday_item_id: item.id,
  }))

  const { data, error } = await supabase.from('inventory_items').insert(rows).select('id')
  if (error) throw error
  return data?.length || 0
}

// ==================== TRANSPORT LOGS ====================

function mapTransportType(text: string | null): string {
  if (!text) return 'other'
  if (text.includes('העברה')) return 'transfer'
  if (text.includes('הובלה')) return 'delivery'
  if (text.includes('יומית')) return 'daily'
  if (text.includes('פינוי')) return 'removal'
  return 'other'
}

async function importTransportLogs() {
  // Load projects for matching
  const { data: projects } = await supabase.from('projects').select('id, name')
  const projectMap = new Map<string, string>()
  if (projects) {
    for (const p of projects) {
      projectMap.set(p.name.trim().toLowerCase(), p.id)
    }
  }
  console.log(`  Loaded ${projectMap.size} projects for matching`)

  function matchProject(name: string | null): string | null {
    if (!name) return null
    const key = name.trim().toLowerCase()
    if (projectMap.has(key)) return projectMap.get(key)!
    // Partial match
    for (const [pName, pId] of projectMap) {
      if (pName.includes(key) || key.includes(pName)) return pId
    }
    return null
  }

  // Load both truck log files
  const raw1 = JSON.parse(fs.readFileSync('/tmp/monday_truck_logs_1.json', 'utf-8'))
  const raw2 = JSON.parse(fs.readFileSync('/tmp/monday_truck_logs_2.json', 'utf-8'))
  const items = [
    ...raw1.data.boards[0].items_page.items,
    ...raw2.data.boards[0].items_page.items,
  ]

  const rows = items
    .map((item: any) => {
      const logDate = parseDate(getCol(item, 'date_mkstkr4p'))
      if (!logDate) return null // skip items without date

      const fromName = getCol(item, 'color_mkst8szh')
      const toName = getCol(item, 'color_mkst77xm')

      return {
        log_date: logDate,
        transport_type: mapTransportType(getCol(item, 'single_selectdg76qzu')),
        from_project_name: fromName,
        to_project_name: toName,
        from_project_id: matchProject(fromName),
        to_project_id: matchProject(toName),
        quantity: parseNumber(getCol(item, 'number2b3g0puy')),
        source_location: getCol(item, 'color_mkst8r2g'),
        material_type: getCol(item, 'color_mkst3100'),
        certificate_number: getCol(item, 'text_mksv1csg'),
        billing_notes: getCol(item, 'text_mkstpj5s'),
        monday_item_id: item.id,
        monday_group: item.group?.title || null,
      }
    })
    .filter(Boolean)

  // Insert in batches of 100
  let total = 0
  for (let i = 0; i < rows.length; i += 100) {
    const batch = rows.slice(i, i + 100)
    const { data, error } = await supabase.from('transport_logs').insert(batch).select('id')
    if (error) throw error
    total += data?.length || 0
  }
  return total
}

// ==================== MAIN ====================

async function main() {
  console.log('=== BuildWise Module Import ===\n')

  console.log('1. Importing equipment...')
  const eqCount = await importEquipment()
  console.log(`   ✓ ${eqCount} equipment items imported\n`)

  console.log('2. Importing inventory/tools...')
  const invCount = await importInventory()
  console.log(`   ✓ ${invCount} inventory items imported\n`)

  console.log('3. Importing transport logs...')
  const tlCount = await importTransportLogs()
  console.log(`   ✓ ${tlCount} transport logs imported\n`)

  console.log('=== Import complete ===')
}

main().catch((err) => {
  console.error('Import failed:', err)
  process.exit(1)
})
