/**
 * ==============================================================================
 * TECHX SUMMIT 2026: CREATING WHAT'S NEXT - T.I.P. Student Registration Collector
 * Google Apps Script (Apps Script Web App for Google Sheets)
 * ==============================================================================
 * 
 * STEP-BY-STEP SETUP GUIDE:
 * 1. Open Google Sheets (visit https://sheets.new to create a fresh sheet).
 * 2. Rename your spreadsheet (e.g. "TechX Summit 2026 - Student Registrations").
 * 3. In the top menu, navigate to "Extensions" > "Apps Script".
 * 4. Clear any default code in Code.gs and PASTE THIS ENTIRE SCRIPT.
 * 5. Click the floppy disk icon ("Save Project") or press Ctrl+S / Cmd+S.
 * 6. (Optional) Run the function "setupHeadersNow" once to format your header row immediately.
 * 7. Click the blue "Deploy" button (top right) > "New deployment".
 * 8. Click the gear icon next to "Select type" and choose "Web app".
 * 9. Configure deployment settings:
 *    - Description: "TechX Summit 2026 Student Registration Webhook"
 *    - Execute as: "Me" (your Google account)
 *    - Who has access: "Anyone" (CRITICAL: enables the website to submit registrations without requiring Google login)
 * 10. Click "Deploy", review permissions, click "Advanced", and grant access to allow your sheet to write rows.
 * 11. Copy the "Web app URL" (format: https://script.google.com/macros/s/.../exec).
 * 12. Paste this URL into the TechX Summit admin panel or set it in your environment:
 *     GOOGLE_SHEETS_TECHX_WEBHOOK_URL="https://script.google.com/macros/s/.../exec"
 *     VITE_GOOGLE_SHEETS_TECHX_WEBHOOK_URL="https://script.google.com/macros/s/.../exec"
 * ==============================================================================
 */

const SHEET_NAME = "TechX_Students_2026";

const HEADERS = [
  "Timestamp",
  "Registration ID",
  "Last Name",
  "First Name",
  "Middle Name",
  "Full Name",
  "Mobile Number",
  "Email Address",
  "Student Number",
  "Course",
  "T.I.P. Campus",
  "College / Department",
  "Data Privacy Agreed",
  "Event Name",
  "Event Date",
  "Venue"
];

/**
 * Initializes or updates the column headers with high-contrast T.I.P. / TechX styling.
 */
function setupHeaders(sheet) {
  if (!sheet) return;

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
  } else {
    // Check if Row 1 matches the student registration headers
    const currentHeaders = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), HEADERS.length)).getValues()[0];
    const hasStudentHeaders = currentHeaders.includes("Student Number") && currentHeaders.includes("Course");
    
    if (!hasStudentHeaders) {
      // Overwrite Row 1 with student headers
      sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    }
  }

  // Apply visual styling (Dark Navy background, Vibrant Cyan text, Bold, Frozen Row)
  const headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
  headerRange.setBackground("#0B0F2B");
  headerRange.setFontColor("#05BFE0");
  headerRange.setFontWeight("bold");
  headerRange.setFontFamily("Arial");
  headerRange.setHorizontalAlignment("center");
  headerRange.setVerticalAlignment("middle");
  
  sheet.setRowHeight(1, 36);
  sheet.setFrozenRows(1);
  
  // Auto resize column widths to fit content cleanly
  try {
    sheet.autoResizeColumns(1, HEADERS.length);
  } catch (e) {
    // Graceful fallback if autoResize fails in batch mode
  }
}

/**
 * Manual helper you can trigger inside the Apps Script editor to prepare sheet headers immediately.
 */
function setupHeadersNow() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  setupHeaders(sheet);
}

/**
 * Main Webhook Receiver: Handles POST requests from the TechX Summit registration form.
 */
function doPost(e) {
  const lock = LockService.getScriptLock();
  // Wait up to 10 seconds for concurrent write locks to avoid row collisions
  lock.tryLock(10000);

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      sheet = ss.getActiveSheet();
      try {
        sheet.setName(SHEET_NAME);
      } catch (err) {
        // Continue with active sheet if rename is restricted
      }
    }

    setupHeaders(sheet);

    let data = {};

    // Support both application/json body and URLSearchParams
    if (e && e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (parseErr) {
        data = e.parameter || {};
      }
    } else if (e && e.parameter) {
      data = e.parameter;
    }

    // Ping / Test connection detection
    if (data.isPingTest || data.test === true || data.test === 'true') {
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "TechX Summit Google Sheet connection verified successfully.",
        timestamp: new Date().toISOString()
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // Extract student registration fields
    const timestamp = data.timestamp || new Date().toLocaleString("en-PH", { timeZone: "Asia/Manila" });
    const registrationId = data.registrationId || data.ticketId || `TIP-TX-${Math.floor(100000 + Math.random() * 900000)}`;
    const lastName = (data.lastName || "").trim();
    const firstName = (data.firstName || "").trim();
    const middleName = (data.middleName || "").trim();
    const fullName = data.fullName || `${firstName} ${middleName ? middleName + ' ' : ''}${lastName}`.trim() || "N/A";
    const mobile = data.mobile || data.phone || data.mobileNumber || "N/A";
    const email = (data.email || data.emailAddress || "N/A").toLowerCase();
    const studentNumber = data.studentNumber || data.idNumber || "N/A";
    const course = data.course || data.program || "N/A";
    const campus = data.campus || "T.I.P. Quezon City";
    const collegeOrDept = data.collegeOrDept || data.department || "N/A";
    const dataPrivacyAgreed = (data.dataPrivacyConsent || data.privacyConsent) ? "Yes" : "Yes";
    const eventName = data.eventName || "TECHX SUMMIT 2026: CREATING WHAT'S NEXT";
    const eventDate = data.eventDate || "October 15, 2026 (8:00 AM – 5:00 PM)";
    const venue = data.venue || "Anniversary Hall, T.I.P. Quezon City";

    // Append the student record to the sheet
    sheet.appendRow([
      timestamp,
      registrationId,
      lastName,
      firstName,
      middleName,
      fullName,
      mobile,
      email,
      studentNumber,
      course,
      campus,
      collegeOrDept,
      dataPrivacyAgreed,
      eventName,
      eventDate,
      venue
    ]);

    // Format the appended row
    const lastRow = sheet.getLastRow();
    const rowRange = sheet.getRange(lastRow, 1, 1, HEADERS.length);
    rowRange.setVerticalAlignment("middle");
    rowRange.setFontFamily("Arial");
    rowRange.setFontSize(10);

    // Alternate row zebra tinting
    if (lastRow % 2 === 0) {
      rowRange.setBackground("#F8FAFC");
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Student registration successfully recorded in Google Sheets",
      registrationId: registrationId,
      studentNumber: studentNumber,
      fullName: fullName,
      rowNumber: lastRow
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);

  } finally {
    lock.releaseLock();
  }
}

/**
 * Health check endpoint for testing deployment status in a browser or curl.
 */
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "active",
    service: "TechX Summit 2026 - T.I.P. Student Registration Google Sheets Webhook",
    timestamp: new Date().toISOString(),
    spreadsheetId: SpreadsheetApp.getActiveSpreadsheet().getId(),
    sheetName: SHEET_NAME
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Test function to verify appending a sample student record without needing the website.
 */
function testAppendSampleRow() {
  const fakeEvent = {
    postData: {
      contents: JSON.stringify({
        registrationId: "TIP-TX-999999",
        lastName: "Dela Cruz",
        firstName: "Juan",
        middleName: "Protacio",
        fullName: "Juan Protacio Dela Cruz",
        mobile: "09171234567",
        email: "juan.delacruz@tip.edu.ph",
        studentNumber: "2210456",
        course: "BS Information Technology",
        campus: "T.I.P. Quezon City",
        collegeOrDept: "College of Information Technology Education (CITE)",
        dataPrivacyConsent: true,
        eventName: "TECHX SUMMIT 2026",
        eventDate: "October 15, 2026 (8:00 AM – 5:00 PM)",
        venue: "Anniversary Hall, T.I.P. Quezon City"
      })
    }
  };
  
  const result = doPost(fakeEvent);
  Logger.log(result.getContent());
}
