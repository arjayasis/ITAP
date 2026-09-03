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
    "Companion Designation",
    "Event Name",
    "Venue",
    "Submission Source"
  ];
  
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    // Format headers
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground("#0B0F2B");
    headerRange.setFontColor("#05BFE0");
    headerRange.setFontWeight("bold");
    headerRange.setFontFamily("Roboto");
    sheet.setFrozenRows(1);
    sheet.autoResizeColumns(1, headers.length);
  }
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    var doc = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = doc.getSheetByName("TechX_RSVP_2026") || doc.getActiveSheet();
    
    // Auto-initialize header columns if sheet is fresh
    setupHeaders(sheet);

    var data = {};
    
    // Parse incoming data whether sent as JSON or URL encoded form data
    if (e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (err) {
        // Fallback for form-url-encoded
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
    var hasCompanion = (data.hasCompanion === 'yes' || data.hasCompanion === true || data.hasCompanion === 'true') ? "Yes" : "No";
    var companionName = hasCompanion === "Yes" ? (data.companionName || "N/A") : "None";
    var companionDesignation = hasCompanion === "Yes" ? (data.companionDesignation || data.companionTitle || "N/A") : "None";
    var eventName = data.event || "ITAP 2nd General Membership Meeting 2026";
    var venue = data.venue || "Technological Institute of the Philippines (T.I.P.) Quezon City";
    var source = data.source || "Web Portal RSVP";

    // Append attendee record
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
      companionDesignation,
      eventName,
      venue,
      source
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
