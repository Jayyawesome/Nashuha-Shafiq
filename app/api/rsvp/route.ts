import fs from "node:fs/promises";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { attendanceOptions, type AttendanceStatus, type RsvpSubmission } from "@/src/lib/rsvp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const sheetName = "RSVP Responses";
const workbookPath = path.join(process.cwd(), "data", "shua-rsvp.xlsx");
const headers = ["Timestamp", "Name", "Attendance", "Pax", "Phone", "Wish", "Source"];

function cleanText(value: unknown, maxLength: number) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function excelSafe(value: string) {
  return /^[=+\-@]/.test(value) ? `'${value}` : value;
}

function excelDisplay(value: unknown) {
  const text = String(value ?? "");
  return text.startsWith("'") ? text.slice(1) : text;
}

function normalizeAttendance(value: unknown): AttendanceStatus {
  return attendanceOptions.includes(value as AttendanceStatus) ? (value as AttendanceStatus) : "Hadir";
}

async function workbookExists() {
  try {
    await fs.access(workbookPath);
    return true;
  } catch {
    return false;
  }
}

async function loadWorkbook() {
  if (await workbookExists()) {
    const buffer = await fs.readFile(workbookPath);
    return XLSX.read(buffer, { type: "buffer" });
  }
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet([headers]);
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  return workbook;
}

function getResponseSheet(workbook: XLSX.WorkBook) {
  const worksheet = workbook.Sheets[sheetName] ?? XLSX.utils.aoa_to_sheet([headers]);
  if (!workbook.Sheets[sheetName]) {
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  }
  return worksheet;
}

function readSubmissions(workbook: XLSX.WorkBook) {
  const worksheet = getResponseSheet(workbook);
  const rows = XLSX.utils.sheet_to_json<unknown[]>(worksheet, { header: 1, blankrows: false });
  return rows
    .slice(1)
    .filter((row) => row.some(Boolean))
    .map((row): RsvpSubmission => ({
      timestamp: excelDisplay(row[0]),
      name: excelDisplay(row[1]),
      attendance: normalizeAttendance(row[2]),
      pax: Number(row[3]) || 1,
      phone: excelDisplay(row[4]),
      wish: excelDisplay(row[5]),
      source: excelDisplay(row[6]) || "Website",
    }))
    .reverse()
    .slice(0, 20);
}

function nextAppendAddress(worksheet: XLSX.WorkSheet) {
  const rows = XLSX.utils.sheet_to_json<unknown[]>(worksheet, { header: 1, blankrows: false });
  return XLSX.utils.encode_cell({ r: Math.max(1, rows.length), c: 0 });
}

async function saveWorkbook(workbook: XLSX.WorkBook) {
  await fs.mkdir(path.dirname(workbookPath), { recursive: true });
  const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" }) as Buffer;
  await fs.writeFile(workbookPath, buffer);
}

export async function GET() {
  try {
    const workbook = await loadWorkbook();
    return NextResponse.json({ submissions: readSubmissions(workbook), workbook: "data/shua-rsvp.xlsx" });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Excel workbook tidak dapat dibaca." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const name = cleanText(body.name, 80);
    if (!name) {
      return NextResponse.json({ error: "Nama diperlukan untuk RSVP." }, { status: 400 });
    }

    const attendance = normalizeAttendance(body.attendance);
    const pax = Math.min(10, Math.max(1, Number(body.pax) || 1));
    const phone = cleanText(body.phone, 30);
    const wish = cleanText(body.wish, 240);
    const timestamp = new Date().toISOString();
    const workbook = await loadWorkbook();
    const worksheet = getResponseSheet(workbook);
    XLSX.utils.sheet_add_aoa(
      worksheet,
      [[timestamp, excelSafe(name), attendance, pax, excelSafe(phone), excelSafe(wish), "Website"]],
      { origin: nextAppendAddress(worksheet) },
    );
    await saveWorkbook(workbook);

    const submission: RsvpSubmission = {
      timestamp,
      name,
      attendance,
      pax,
      phone,
      wish,
      source: "Website",
    };

    return NextResponse.json({ submission, submissions: readSubmissions(workbook), workbook: "data/shua-rsvp.xlsx" });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "RSVP tidak dapat disimpan ke Excel." }, { status: 500 });
  }
}
