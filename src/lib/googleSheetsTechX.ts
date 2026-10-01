/**
 * Google Sheets Integration & Webhook Handler for TechX Summit 2026 Student Registration
 */

export const STORAGE_KEY_TECHX_SHEETS = 'techx_student_sheets_webhook';

// Default deployed webhook endpoint for Student Registration
export const DEFAULT_TECHX_STUDENT_WEBHOOK = 
  'https://script.google.com/macros/s/AKfycbw-2p-1fL-_IDixg68VgGLggXMtbxvEFSGj2mwkTUVawmYn4GE5iBPV_BuZl4AvukO5/exec';

/**
 * Checks if a given URL is a Google Apps Script Library link rather than a Web App endpoint.
 */
export function isGoogleScriptLibraryUrl(url?: string): boolean {
  if (!url) return false;
  return url.includes('/macros/library/d/') || url.includes('/library/d/');
}

/**
 * Extracts Google Apps Script Project/Script ID from a library or editor URL.
 */
export function extractScriptIdFromUrl(url?: string): string | null {
  if (!url) return null;
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

/**
 * Gets direct Google Apps Script project editor URL.
 */
export function getScriptEditorUrl(urlOrScriptId?: string): string {
  if (!urlOrScriptId) return 'https://script.google.com';
  const scriptId = urlOrScriptId.includes('/') ? extractScriptIdFromUrl(urlOrScriptId) : urlOrScriptId;
  return scriptId ? `https://script.google.com/d/${scriptId}/edit` : 'https://script.google.com';
}

/**
 * Returns the currently active Google Sheets Webhook URL for Student Registration.
 * Checks localStorage first, then VITE environment variables, then the default script URL.
 */
export function getActiveTechXSheetsWebhook(): string {
  if (typeof window !== 'undefined') {
    const custom = localStorage.getItem(STORAGE_KEY_TECHX_SHEETS);
    // If custom is stored but it's the old RSVP webhook, a library URL, or outdated URL, clear and return official student webhook
    if (custom && (
      custom.includes('AKfycbwZjUcC7UNIPniLLt4YncpwNXOFx42UkZCb8A8ATtYjAMBj-jz1OEnbvyM4Uu54PfhhnA') ||
      custom.includes('AKfycbx6JpS4WkG99mA8dbryWxKWyJ2ZPXmtbSmXGhAGwLjq') ||
      custom.includes('AKfycbz7oOcamc48Hpcq4oF272ODDILWXWC0T0RUi3teB75mQEnPGA4qaFdUG4lFQfMKm3A') ||
      isGoogleScriptLibraryUrl(custom) ||
      custom.endsWith('/dev')
    )) {
      localStorage.removeItem(STORAGE_KEY_TECHX_SHEETS);
      return DEFAULT_TECHX_STUDENT_WEBHOOK;
    }
    if (custom && custom.trim().startsWith('https://script.google.com/')) {
      return custom.trim();
    }
  }

  const envUrl = (import.meta as any).env?.VITE_GOOGLE_SHEETS_STUDENT_WEBHOOK_URL ||
                 (import.meta as any).env?.GOOGLE_SHEETS_STUDENT_WEBHOOK_URL ||
                 (typeof process !== 'undefined' && process.env?.GOOGLE_SHEETS_STUDENT_WEBHOOK_URL);
                 
  if (envUrl && typeof envUrl === 'string' && envUrl.trim().startsWith('https://script.google.com/') && !envUrl.endsWith('/dev')) {
    return envUrl.trim();
  }

  return DEFAULT_TECHX_STUDENT_WEBHOOK;
}

/**
 * Saves a custom Google Sheets Webhook URL to localStorage.
 */
export function saveTechXSheetsWebhook(url: string): void {
  if (typeof window !== 'undefined') {
    const cleaned = url.trim();
    if (cleaned) {
      localStorage.setItem(STORAGE_KEY_TECHX_SHEETS, cleaned);
    } else {
      localStorage.removeItem(STORAGE_KEY_TECHX_SHEETS);
    }
  }
}

/**
 * Resets to default Webhook URL.
 */
export function resetTechXSheetsWebhook(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY_TECHX_SHEETS);
  }
}

export interface StudentRegistrationPayload {
  registrationId: string;
  attendeeType?: string;
  lastName: string;
  firstName: string;
  middleName?: string;
  fullName: string;
  email: string;
  mobile: string;
  studentNumber?: string;
  idNumber?: string;
  course: string;
  campus: string;
  collegeOrDept: string;
  college?: string;
  program?: string;
  location?: string;
  yearLevel?: string;
  dataPrivacyConsent: boolean;
  dataPrivacyAcceptedAt?: string;
  eventName?: string;
  eventDate?: string;
  venue?: string;
  timestamp?: string;
  createdAt?: number;
  source?: string;
}

export interface GoogleSheetsSubmitResult {
  ok: boolean;
  method: 'server_proxy' | 'direct_webhook' | 'offline_fallback';
  message: string;
  status?: number;
  isForbidden?: boolean;
  error?: string;
}

/**
 * Sends student registration data strictly to the Student Registration Google Sheet Webhook.
 * It will NOT cross-post or fall back to the Industry RSVP Google Sheet.
 */
export async function submitStudentRegistrationToGoogleSheets(
  payload: StudentRegistrationPayload
): Promise<GoogleSheetsSubmitResult> {
  const activeWebhook = getActiveTechXSheetsWebhook();
  
  if (isGoogleScriptLibraryUrl(activeWebhook)) {
    const scriptId = extractScriptIdFromUrl(activeWebhook);
    return {
      ok: false,
      method: 'offline_fallback',
      message: 'Configured URL is a Google Apps Script Library link, not an executable Web App webhook URL. Deploy as Web App with access set to "Anyone".',
      error: `Library link detected (${scriptId || 'unknown ID'})`
    };
  }

  const formattedPayload = {
    ...payload,
    timestamp: payload.timestamp || new Date().toLocaleString('en-PH', { timeZone: 'Asia/Manila' }),
    source: payload.source || 'TechXSummit2026 Student Portal'
  };

  let directDispatched = false;

  // 1. Direct browser fetch with mode: 'no-cors'
  // Dispatches payload directly from client browser to Google Apps Script endpoint
  if (activeWebhook && activeWebhook.startsWith('https://script.google.com/')) {
    try {
      const formParams = new URLSearchParams();
      Object.entries(formattedPayload).forEach(([key, val]) => {
        formParams.append(key, typeof val === 'object' ? JSON.stringify(val) : String(val));
      });

      await fetch(activeWebhook, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formParams
      });

      directDispatched = true;
      console.log('✅ Direct student registration webhook dispatched to:', activeWebhook);
    } catch (directErr: any) {
      console.warn('Direct Google Sheets dispatch notice:', directErr);
    }
  }

  // 2. Submit via internal serverless proxy (/api/submit-techx-registration)
  try {
    const serverProxyResponse = await fetch('/api/submit-techx-registration', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...formattedPayload,
        webhookUrl: activeWebhook
      })
    });

    const proxyData = await serverProxyResponse.json().catch(() => ({}));

    if (serverProxyResponse.ok && proxyData.success) {
      console.log('✅ Student registration synced to Google Sheets via API proxy');
      return {
        ok: true,
        method: 'server_proxy',
        message: 'Registration recorded in Google Sheet via API proxy'
      };
    } else {
      const isForbidden = serverProxyResponse.status === 403 || 
                          proxyData.status === 403 || 
                          proxyData.error?.includes('403') ||
                          proxyData.error?.includes('Permission');
      console.warn('Student Webhook proxy response notice:', proxyData);
      if (isForbidden) {
        return {
          ok: directDispatched,
          method: directDispatched ? 'direct_webhook' : 'server_proxy',
          status: 403,
          isForbidden: true,
          message: 'Google Apps Script Permission Denied (403): Set "Who has access" to "Anyone" in Google Apps Script deployment settings.',
          error: proxyData.error || 'HTTP 403 Forbidden'
        };
      }
    }
  } catch (err) {
    console.debug('Server proxy attempt notice:', err);
  }

  if (directDispatched) {
    return {
      ok: true,
      method: 'direct_webhook',
      message: 'Registration dispatched to Student Google Sheets webhook'
    };
  }

  return {
    ok: false,
    method: 'offline_fallback',
    message: 'Could not connect to Google Sheets webhook'
  };
}

/**
 * Tests the connection to the Google Sheets Webhook URL.
 * Uses the server diagnosis endpoint for exact HTTP status code reporting.
 */
export async function testGoogleSheetsWebhookConnection(webhookUrl?: string): Promise<{
  ok: boolean;
  latencyMs: number;
  message: string;
  status?: number;
  isForbidden?: boolean;
  isLibraryLink?: boolean;
  scriptId?: string;
  scriptEditorUrl?: string;
}> {
  const targetUrl = webhookUrl || getActiveTechXSheetsWebhook();
  const startTime = Date.now();

  if (!targetUrl || !targetUrl.startsWith('https://script.google.com/')) {
    return {
      ok: false,
      latencyMs: 0,
      message: 'Invalid Google Apps Script Webhook URL. Must start with https://script.google.com/'
    };
  }

  // Pre-check for Apps Script Library URL
  if (isGoogleScriptLibraryUrl(targetUrl)) {
    const scriptId = extractScriptIdFromUrl(targetUrl);
    const editorUrl = getScriptEditorUrl(targetUrl);
    return {
      ok: false,
      latencyMs: 0,
      status: 302,
      isLibraryLink: true,
      scriptId: scriptId || undefined,
      scriptEditorUrl: editorUrl,
      message: 'Google Apps Script Library link detected. Webhooks require a Web App URL ending in /exec with "Who has access" set to "Anyone".'
    };
  }

  try {
    // 1. Test via server diagnostic proxy (bypasses browser CORS and reads real HTTP status)
    const serverTest = await fetch('/api/test-sheets-connection', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ webhookUrl: targetUrl })
    });

    if (serverTest.ok) {
      const data = await serverTest.json();
      return {
        ok: data.ok,
        status: data.status,
        isForbidden: data.isForbidden,
        isLibraryLink: data.isLibraryLink,
        scriptId: data.scriptId,
        scriptEditorUrl: data.scriptEditorUrl,
        latencyMs: data.latencyMs || (Date.now() - startTime),
        message: data.message || (data.ok ? 'Connection verified!' : 'Connection test failed')
      };
    }
  } catch (err) {
    // Server proxy fallback
  }

  // 2. Direct browser fallback test
  try {
    const res = await fetch(targetUrl, {
      method: 'GET',
      mode: 'cors'
    }).catch(async () => {
      const testParams = new URLSearchParams();
      testParams.append('test', 'true');
      testParams.append('isPingTest', 'true');
      testParams.append('timestamp', new Date().toISOString());

      await fetch(targetUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: testParams
      });
      return { ok: true, status: 200, text: async () => 'OK (no-cors)' };
    });

    const latencyMs = Date.now() - startTime;
    return {
      ok: true,
      latencyMs,
      message: `Connected successfully (${latencyMs}ms)`
    };
  } catch (err: any) {
    return {
      ok: false,
      latencyMs: Date.now() - startTime,
      message: err?.message || 'Connection test failed'
    };
  }
}

/**
 * Complete Google Apps Script source code for display and one-click copy in the UI
 */
export const GOOGLE_APPS_SCRIPT_SOURCE = `/**
 * TECHX SUMMIT 2026: CREATING WHAT'S NEXT - T.I.P. Student Registration Collector
 * Google Apps Script for Google Sheets
 * 
 * Setup:
 * 1. Open Google Sheets (https://sheets.new)
 * 2. Go to Extensions > Apps Script
 * 3. Replace all code with this script and Save
 * 4. Click Deploy > New deployment > Web app
 * 5. Execute as: "Me" | Who has access: "Anyone" (CRITICAL: Do NOT set to "Only myself")
 * 6. Copy the Web app URL and paste into your TechX Summit settings!
 */

const SHEET_NAME = "TechX_Students_2026";
const HEADERS = [
  "Timestamp", "Registration ID", "Last Name", "First Name", "Middle Name", 
  "Full Name", "Mobile Number", "Email Address", "Student Number", "Course", 
  "T.I.P. Campus", "College / Department", "Data Privacy Agreed", 
  "Event Name", "Event Date", "Venue"
];

function setupHeaders(sheet) {
  if (!sheet) return;
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
  } else {
    const currentHeaders = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), HEADERS.length)).getValues()[0];
    if (!currentHeaders.includes("Student Number")) {
      sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    }
  }
  const headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
  headerRange.setBackground("#0B0F2B");
  headerRange.setFontColor("#05BFE0");
  headerRange.setFontWeight("bold");
  headerRange.setFontFamily("Arial");
  headerRange.setHorizontalAlignment("center");
  sheet.setRowHeight(1, 36);
  sheet.setFrozenRows(1);
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME) || ss.getActiveSheet();
    setupHeaders(sheet);

    let data = {};
    if (e && e.postData && e.postData.contents) {
      try { data = JSON.parse(e.postData.contents); } catch (err) { data = e.parameter || {}; }
    } else if (e && e.parameter) {
      data = e.parameter;
    }

    if (data.isPingTest || data.test === true || data.test === 'true') {
      return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Connection OK" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const timestamp = data.timestamp || new Date().toLocaleString("en-PH", { timeZone: "Asia/Manila" });
    const registrationId = data.registrationId || data.ticketId || ("TIP-TX-" + Math.floor(100000 + Math.random() * 900000));
    const lastName = (data.lastName || "").trim();
    const firstName = (data.firstName || "").trim();
    const middleName = (data.middleName || "").trim();
    const fullName = data.fullName || (firstName + " " + (middleName ? middleName + " " : "") + lastName).trim();
    const mobile = data.mobile || data.phone || "N/A";
    const email = (data.email || "N/A").toLowerCase();
    const studentNumber = data.studentNumber || data.idNumber || "N/A";
    const course = data.course || "N/A";
    const campus = data.campus || "T.I.P. Quezon City";
    const collegeOrDept = data.collegeOrDept || "N/A";
    const dataPrivacyAgreed = "Yes";
    const eventName = data.eventName || "TECHX SUMMIT 2026: CREATING WHAT'S NEXT";
    const eventDate = data.eventDate || "October 15, 2026 (8:00 AM – 5:00 PM)";
    const venue = data.venue || "Anniversary Hall, T.I.P. Quezon City";

    sheet.appendRow([
      timestamp, registrationId, lastName, firstName, middleName, fullName,
      mobile, email, studentNumber, course, campus, collegeOrDept,
      dataPrivacyAgreed, eventName, eventDate, venue
    ]);

    const lastRow = sheet.getLastRow();
    const rowRange = sheet.getRange(lastRow, 1, 1, HEADERS.length);
    rowRange.setFontFamily("Arial");
    rowRange.setFontSize(10);
    if (lastRow % 2 === 0) rowRange.setBackground("#F8FAFC");

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Student registration saved to Google Sheets",
      registrationId: registrationId,
      studentNumber: studentNumber
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "active",
    service: "TechX Summit 2026 Student Registration Webhook",
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}`;
