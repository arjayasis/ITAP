/**
 * ==============================================================================
 * ITAP 2nd General Membership Meeting 2026 @ Tech X Summit - Google Sheets Script
 * ==============================================================================
 * 
 * INSTRUCTIONS FOR SETUP:
 * 1. Open Google Sheets (https://sheets.new) and create a new spreadsheet.
 * 2. Rename the spreadsheet to: "ITAP 2nd GMM 2026 - Tech X Summit RSVPs".
 * 3. In Google Sheets, click on "Extensions" > "Apps Script".
 * 4. Delete any existing code in the editor and paste THIS ENTIRE SCRIPT.
 * 5. Click the floppy disk icon ("Save Project").
 * 6. Click the blue "Deploy" button (top right) > "New deployment".
 * 7. Click the gear icon next to "Select type" and choose "Web app".
 * 8. Set the configuration:
 *    - Description: "ITAP Tech X Summit 2026 RSVP Collector"
 *    - Execute as: "Me" (your email)
 *    - Who has access: "Anyone" (IMPORTANT: this allows the website to submit RSVPs)
 * 9. Click "Deploy". Grant permissions when prompted.
 * 10. Copy the "Web app URL" (starts with https://script.google.com/macros/s/...).
 * 11. Add it to your project's .env file as:
 *     GOOGLE_SHEETS_WEBHOOK_URL="https://script.google.com/macros/s/..."
 *     VITE_GOOGLE_SHEETS_WEBHOOK_URL="https://script.google.com/macros/s/..."
 * ==============================================================================
 */

function setupHeaders(sheet) {
  const headers = [
    "Timestamp",
    "Registration ID",
    "Full Name",
    "Company / Organization",
    "Job Title / Position",
    "Work Email",
    "Mobile Number",
    "With Companion?",
    "Companion Name",
    "Companion Designation"
  ];
  
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
  } else {
    // Check if row 1 needs header update (e.g. still has "Event Name" or missing "With Companion?")
    const lastCol = Math.max(sheet.getLastColumn(), headers.length);
    const currentHeaders = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    const needsUpdate = !currentHeaders.includes("With Companion?") || currentHeaders.includes("Event Name");
    
    if (needsUpdate) {
      // Overwrite Row 1 with the updated headers
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      // Clear any leftover old header cells (like Event Name, Venue, Submission Source)
      if (lastCol > headers.length) {
        sheet.getRange(1, headers.length + 1, 1, lastCol - headers.length).clearContent();
      }
    }
  }

  // Format headers with dark theme and cyan accent
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground("#0B0F2B");
  headerRange.setFontColor("#05BFE0");
  headerRange.setFontWeight("bold");
  headerRange.setFontFamily("Arial");
  sheet.setFrozenRows(1);
  sheet.autoResizeColumns(1, headers.length);
}

// Manual helper you can run once inside Apps Script to format your headers immediately
function updateHeadersNow() {
  var doc = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = doc.getSheetByName("TechX_RSVP_2026") || doc.getActiveSheet();
  setupHeaders(sheet);
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    var doc = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = doc.getSheetByName("TechX_RSVP_2026") || doc.getActiveSheet();
    
    // Auto-update header columns if needed
    setupHeaders(sheet);

    var data = {};
    
    // Parse incoming data whether sent as JSON or URL encoded form data
    if (e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (err) {
        data = e.parameter || {};
      }
    } else if (e.parameter) {
      data = e.parameter;
    }

    var timestamp = data.timestamp || new Date().toLocaleString("en-PH", { timeZone: "Asia/Manila" });
    var registrationId = data.registrationId || data.regId || "TECHX-ITAP-" + Math.floor(100000 + Math.random() * 900000);
    var fullName = data.fullName || data.name || "N/A";
    var companyName = data.companyName || data.company || "N/A";
    var jobTitle = data.jobTitle || data.position || data.title || "N/A";
    var email = data.email || "N/A";
    var mobile = data.mobile || data.phone || data.contact || "N/A";
    
    // Companion details
    var hasCompanion = (data.hasCompanion === 'yes' || data.hasCompanion === true || data.hasCompanion === 'true') ? "Yes" : "No";
    var companionName = hasCompanion === "Yes" ? (data.companionName && data.companionName !== 'None' ? data.companionName : "N/A") : "None";
    var companionDesignation = hasCompanion === "Yes" ? (data.companionDesignation || data.companionTitle || "N/A") : "None";

    // Append attendee record without Event Name, Venue, or Submission Source
    sheet.appendRow([
      timestamp,
      registrationId,
      fullName,
      companyName,
      jobTitle,
      email,
      mobile,
      hasCompanion,
      companionName,
      companionDesignation
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({
        status: "success",
        message: "RSVP successfully recorded",
        registrationId: registrationId
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        status: "error",
        message: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({
      status: "active",
      service: "ITAP 2nd GMM 2026 Google Sheets RSVP Collector",
      timestamp: new Date().toISOString()
    }))
    .setMimeType(ContentService.MimeType.JSON);
}
