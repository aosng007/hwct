/**
 * ScaleLog — Google Apps Script Web App Backend
 *
 * Deploy this script as a Web App:
 *   - Execute as: Me
 *   - Who has access: Anyone (auth enforced below via token verification)
 *
 * Set the AUTHORIZED_EMAIL and SPREADSHEET_ID constants before deploying.
 *
 * Endpoints:
 *   GET  /exec  → returns all data rows as JSON
 *   POST /exec  → appends a new row { date, height, weight, bmi }
 */

// ─── Configuration ────────────────────────────────────────────────────────────
const SPREADSHEET_ID = ''; // TODO: paste your Google Sheet ID here
const SHEET_NAME = 'ScaleLog';
const AUTHORIZED_EMAIL = ''; // TODO: paste your Google account email here
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Verify the Bearer token from the Authorization header and return the email.
 * Throws if the token is invalid or the email is not authorized.
 */
function verifyToken_(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Missing or invalid Authorization header');
  }
  const token = authHeader.slice(7);

  // Use Google's tokeninfo endpoint to validate the token server-side.
  const resp = UrlFetchApp.fetch(
    'https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(token),
    { muteHttpExceptions: true }
  );

  if (resp.getResponseCode() !== 200) {
    throw new Error('Token verification failed');
  }

  const info = JSON.parse(resp.getContentText());
  if (!info.email) {
    throw new Error('Could not extract email from token');
  }
  if (info.email !== AUTHORIZED_EMAIL) {
    throw new Error('Unauthorized email: ' + info.email);
  }
  return info.email;
}

function getSheet_() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(['Date', 'Height (cm)', 'Weight (kg)', 'BMI']);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function doGet(e) {
  try {
    const authHeader = e.parameter && e.parameter.authorization
      ? 'Bearer ' + e.parameter.authorization
      : (e.headers && e.headers['Authorization']);
    verifyToken_(authHeader);

    const sheet = getSheet_();
    const data = sheet.getDataRange().getValues();
    const headers = data[0]; // ['Date', 'Height (cm)', 'Weight (kg)', 'BMI']
    const rows = data.slice(1).map(function (row) {
      return {
        date: row[0] instanceof Date
          ? Utilities.formatDate(row[0], Session.getScriptTimeZone(), 'yyyy-MM-dd')
          : String(row[0]),
        height: Number(row[1]),
        weight: Number(row[2]),
        bmi: Number(row[3]),
      };
    });

    return ContentService
      .createTextOutput(JSON.stringify(rows))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    const authHeader = e.headers && e.headers['Authorization']
      ? e.headers['Authorization']
      : (e.parameter && e.parameter.authorization ? 'Bearer ' + e.parameter.authorization : null);
    verifyToken_(authHeader);

    const body = JSON.parse(e.postData.contents);
    const { date, height, weight, bmi } = body;

    if (date === null || date === undefined || date === '' ||
        height === null || height === undefined ||
        weight === null || weight === undefined ||
        bmi === null || bmi === undefined) {
      throw new Error('Missing required fields: date, height, weight, bmi');
    }

    const parsedHeight = Number(height);
    const parsedWeight = Number(weight);
    const parsedBmi = Number(bmi);

    if (!Number.isFinite(parsedHeight) || !Number.isFinite(parsedWeight) || !Number.isFinite(parsedBmi)) {
      throw new Error('Invalid numeric fields: height, weight, bmi');
    }

    const sheet = getSheet_();
    sheet.appendRow([date, parsedHeight, parsedWeight, parsedBmi]);

    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
