/**
 * Staff Training Log
 * Receives test results from the training pages and adds one row per attempt to the "Attempts" tab.
 *
 * Setup: paste into Extensions > Apps Script in the log spreadsheet, then
 * Deploy > New deployment > Web app > Execute as: Me, Who has access: Anyone.
 * Copy the web app URL (ends in /exec) into LOG_URL in the training page.
 */
const SHEET_NAME = 'Attempts';
const HEADERS = ['When', 'Name', 'Venue', 'Test', 'Section', 'Correct', 'Out of', 'Score %', 'Result', 'Questions missed', 'Attempt ID'];

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    const d = JSON.parse(e.postData.contents);
    const sh = getSheet_();

    // The page re-sends an attempt if it never hears back, so skip one that is already logged.
    const id = clean_(d.id, 40);
    const last = sh.getLastRow();
    if (id && last > 1) {
      const from = Math.max(2, last - 499);
      const ids = sh.getRange(from, HEADERS.length, last - from + 1, 1).getValues();
      if (ids.some(function (r) { return r[0] === id; })) return json_({ ok: true, duplicate: true });
    }

    const right = Number(d.right) || 0;
    const total = Number(d.total) || 0;
    const pct = total ? Math.round(right / total * 100) : 0;
    const pass = Number(d.pass) || 80;
    const missed = Array.isArray(d.missed) ? d.missed.map(function (m) { return clean_(m, 200); }).join(' | ') : '';

    sh.appendRow([
      d.t ? new Date(Number(d.t)) : new Date(),
      clean_(d.name, 80), clean_(d.venue, 40), clean_(d.test, 40), clean_(d.section, 80),
      right, total, pct, pct >= pass ? 'Pass' : 'Re-test', clean_(missed, 5000), id
    ]);
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    try { lock.releaseLock(); } catch (ignore) {}
  }
}

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(HEADERS);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
  }
  return sh;
}

// Text only, trimmed to length, and never treated as a formula by Sheets.
function clean_(v, max) {
  let s = String(v == null ? '' : v).trim().slice(0, max);
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
