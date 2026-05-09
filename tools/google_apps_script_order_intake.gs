const SHEET_NAME = "Requests";
const HEADERS = [
  "created_at",
  "source",
  "invoice_id",
  "customer",
  "contact",
  "service",
  "amount",
  "status",
  "stripe_invoice_url",
  "delivery_due",
  "notes"
];

const MAX_FIELD_LENGTH = 1200;

function doPost(event) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const payload = JSON.parse(event.postData.contents || "{}");
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    if (!sheet) {
      throw new Error("Missing Requests sheet");
    }
    ensureHeaders(sheet);
    sheet.appendRow(HEADERS.map((header) => cleanValue(payload[header])));
    return jsonResponse({ ok: true });
  } catch (error) {
    return jsonResponse({ ok: false, error: String(error) });
  } finally {
    lock.releaseLock();
  }
}

function cleanValue(value) {
  if (value === undefined || value === null) {
    return "";
  }
  return String(value).slice(0, MAX_FIELD_LENGTH);
}

function ensureHeaders(sheet) {
  const current = sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0];
  const hasHeaders = HEADERS.every((header, index) => current[index] === header);
  if (!hasHeaders) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  }
}

function jsonResponse(body) {
  return ContentService
    .createTextOutput(JSON.stringify(body))
    .setMimeType(ContentService.MimeType.JSON);
}
