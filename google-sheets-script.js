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

    var data = {};
    
    // Parse incoming data whether sent as JSON or URL encoded form data
    if (e && e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (err) {
        data = e.parameter || {};
      }
    } else if (e && e.parameter) {
      data = e.parameter;
    }

    if (data.isPingTest || data.test === true || data.test === 'true') {
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "Google Sheet connection active and responding.",
        timestamp: new Date().toISOString()
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // Branch 1: TechX Student Registration
    var isStudent = (data.attendeeType === 'student') || !!data.studentNumber || !!data.course;
    if (isStudent) {
      var studentSheet = doc.getSheetByName("TechX_Students_2026");
      if (!studentSheet) {
        studentSheet = doc.insertSheet("TechX_Students_2026");
      }

      var studentHeaders = [
        "Timestamp", "Registration ID", "Last Name", "First Name", "Middle Name",
        "Full Name", "Mobile Number", "Email Address", "Student Number", "Course",
        "T.I.P. Campus", "College / Department", "Data Privacy Agreed", "Event Name", "Event Date", "Venue"
      ];

      if (studentSheet.getLastRow() === 0) {
        studentSheet.appendRow(studentHeaders);
        var sHeaderRange = studentSheet.getRange(1, 1, 1, studentHeaders.length);
        sHeaderRange.setBackground("#0B0F2B");
        sHeaderRange.setFontColor("#05BFE0");
        sHeaderRange.setFontWeight("bold");
        studentSheet.setFrozenRows(1);
      }

      var sTimestamp = data.timestamp || new Date().toLocaleString("en-PH", { timeZone: "Asia/Manila" });
      var sRegId = data.registrationId || data.ticketId || ("TIP-TX-" + Math.floor(100000 + Math.random() * 900000));
      var sLastName = (data.lastName || "").trim();
      var sFirstName = (data.firstName || "").trim();
      var sMiddleName = (data.middleName || "").trim();
      var sFullName = data.fullName || (sFirstName + " " + (sMiddleName ? sMiddleName + " " : "") + sLastName).trim();
      var sMobile = data.mobile || data.phone || "N/A";
      var sEmail = (data.email || "N/A").toLowerCase();
      var sStudentNumber = data.studentNumber || data.idNumber || "N/A";
      var sCourse = data.course || "N/A";
      var sCampus = data.campus || "T.I.P. Quezon City";
      var sDept = data.collegeOrDept || "N/A";
      var sPrivacy = "Yes";
      var sEvent = data.eventName || "TECHX SUMMIT 2026";
      var sDate = data.eventDate || "October 15, 2026";
      var sVenue = data.venue || "Anniversary Hall, T.I.P. Quezon City";

      studentSheet.appendRow([
        sTimestamp, sRegId, sLastName, sFirstName, sMiddleName,
        sFullName, sMobile, sEmail, sStudentNumber, sCourse,
        sCampus, sDept, sPrivacy, sEvent, sDate, sVenue
      ]);

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "TechX Student registration successfully recorded in Google Sheets",
        registrationId: sRegId,
        studentNumber: sStudentNumber
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // Branch 2: GMM Industry RSVP
    var sheet = doc.getSheetByName("TechX_RSVP_2026") || doc.getActiveSheet();
    setupHeaders(sheet);

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
