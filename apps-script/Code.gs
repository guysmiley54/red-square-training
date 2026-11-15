/**
 * Red Square Staff Training — backend
 *
 * Standalone Apps Script project in the redsquarecafe80 Google account.
 * Deployed as a web app (Execute as: Me, Who has access: Anyone). The /exec URL goes in config.js.
 *
 * The "Staff Training Log" spreadsheet holds these tabs:
 *   Staff     one row per person. Leave the PIN column empty; each person sets their own PIN the
 *             first time they sign in. Clear the cell to reset a forgotten PIN.
 *   Tests     the tests each venue's crew must pass, the date each was assigned, and how often a refresher is due.
 *   Attempts  one row per test attempt (written by this script).
 *   Settings  the email on/off switch.
 *
 * Emails are OFF until the Settings tab says "Emails on | Yes". Once on, each person with an email in the Staff tab gets their result after every attempt, and at most one
 * reminder a week (Monday) while they have a test to do. Managers also get a Monday follow-up list.
 *
 * Nobody sees anything without signing in. Crew see their own results only.
 * Managers see the crew at their venue(s) and sit the tests themselves. Owners see everyone, and can sit any test to try it, but nothing is required of them.
 */
const SHEET_ID = '15ax94vTHrcXj73P3CmR-hwgc7nUEBOr5kCVwXKuMbkQ'; // "Staff Training Log" spreadsheet
const PASS_MARK = 80;       // percent
const DUE_DAYS = 14;        // days to pass a required test after it is assigned
const REFRESH_MONTHS = 6;   // a pass lasts this long before a refresher is due (override per test in the Tests tab, 0 = never)
const REMIND_WITHIN_DAYS = 7; // the weekly reminder mentions a test once it is due within this many days
const SESSION_HOURS = 4;    // how long a sign-in lasts
const MAX_PIN_TRIES = 5;    // wrong PINs before a 15 minute lockout
const TIMEZONE = 'Australia/Hobart';
const SITE_URL = 'https://guysmiley54.github.io/red-square-training/';

const TABS = {
  Staff: ['Name', 'Venue', 'Role', 'Email', 'Start date', 'Active', 'PIN (set by staff, clear to reset)'],
  Tests: ['Key', 'Title', 'Venue', 'Required', 'Assigned', 'Refresher every (months)'],
  Settings: ['Setting', 'Value'],
  Attempts: ['When', 'Name', 'Staff venue', 'Test key', 'Test', 'Section', 'Correct', 'Out of', 'Score %', 'Result', 'Questions missed', 'Attempt ID']
};
const SEED_TESTS = [
  ['glenorchy-menu:breakfast', 'Glenorchy menu: Breakfast dishes'],
  ['glenorchy-menu:lunch', 'Glenorchy menu: Lunch, burgers and lighter options'],
  ['glenorchy-menu:ingredients', 'Glenorchy menu: Tricky ingredients'],
  ['glenorchy-menu:addons', 'Glenorchy menu: Add-ons and pricing policy'],
  ['glenorchy-menu:dietary', 'Glenorchy menu: Dietary and allergens'],
  ['glenorchy-menu:drinks', 'Glenorchy menu: Drinks']
];

/* ---------- web app entry ---------- */

function doPost(e) {
  let out;
  try {
    out = route_(JSON.parse(e.postData.contents));
  } catch (err) {
    out = { ok: false, error: String((err && err.message) || err) };
  }
  return ContentService.createTextOutput(JSON.stringify(out)).setMimeType(ContentService.MimeType.JSON);
}

function route_(req) {
  switch (req.action) {
    case 'roster': return roster_();
    case 'login': return login_(req);
    case 'me': return me_(auth_(req));
    case 'attempt': return attempt_(auth_(req), req);
    case 'crew': return crew_(auth_(req));
    default: throw new Error('Unknown request.');
  }
}

/* ---------- sign-in ---------- */

// The sign-in drop-down. Shows first name and last initial only, because the site is public.
function roster_() {
  const list = staffList_();
  const labels = shortLabels_(list.map(function (s) { return s.name; }));
  return { ok: true, staff: list.map(function (s, i) { return { id: staffId_(s.key), label: labels[i] }; })
    .sort(function (a, b) { return a.label.localeCompare(b.label); }) };
}

// "Isabella Stocks" becomes "Isabella S.", with more of the surname only where two people would look the same.
function shortLabels_(names) {
  const parts = names.map(function (n) { const p = n.split(' '); return { first: p[0], last: p.slice(1).join(' ') }; });
  const letters = parts.map(function () { return 1; });
  const label = function (i) {
    const p = parts[i];
    if (!p.last) return p.first;
    return letters[i] >= p.last.length ? p.first + ' ' + p.last : p.first + ' ' + p.last.slice(0, letters[i]) + '.';
  };
  for (let round = 0; round < 30; round++) {
    const seen = {};
    // Same first letter and same visible surname counts as a clash, so Isabella S. and Isobella S. get told apart.
    parts.forEach(function (p, i) { const l = (p.first.charAt(0) + '|' + label(i).slice(p.first.length)).toLowerCase(); (seen[l] = seen[l] || []).push(i); });
    let clash = false;
    Object.keys(seen).forEach(function (l) {
      if (seen[l].length > 1) seen[l].forEach(function (i) { if (letters[i] < parts[i].last.length) { letters[i]++; clash = true; } });
    });
    if (!clash) break;
  }
  return parts.map(function (p, i) { return label(i); });
}

// An opaque id for the drop-down, so the page never needs anyone's full name.
function staffId_(key) {
  return hex_(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, secret_('SALT') + '|id|' + key)).slice(0, 16);
}

function login_(req) {
  let name = norm_(req.name);
  if (req.id) {
    const picked = staffList_().filter(function (s) { return staffId_(s.key) === String(req.id); })[0];
    name = picked ? picked.key : '';
  }
  const pin = String(req.pin == null ? '' : req.pin);
  const cache = CacheService.getScriptCache();
  const failKey = 'fail:' + (name || 'unknown');
  const fails = Number(cache.get(failKey)) || 0;
  if (fails >= MAX_PIN_TRIES) return { ok: false, error: 'Too many wrong tries. Wait 15 minutes, or ask your manager to reset your PIN.' };
  const miss = function () {
    cache.put(failKey, String(fails + 1), 900);
    return { ok: false, error: 'That PIN is not right for that name.' };
  };

  const staff = findStaff_(name);
  if (!staff) return miss();

  if (!staff.pinHash) {
    // First sign-in: the person chooses their own PIN.
    const newPin = String(req.newPin == null ? '' : req.newPin);
    if (!newPin) return { ok: false, needPin: true };
    if (!/^\d{4}$/.test(newPin)) return { ok: false, needPin: true, error: 'Your PIN must be 4 digits.' };
    const lock = LockService.getScriptLock();
    lock.waitLock(15000);
    try {
      const again = findStaff_(name);
      if (again.pinHash) return { ok: false, error: 'A PIN has already been set for this name. Ask your manager to reset it.' };
      setCell_('Staff', staff.row, TABS.Staff.length, hashPin_(name, newPin));
    } finally { lock.releaseLock(); }
  } else {
    if (!/^\d{4}$/.test(pin) || hashPin_(name, pin) !== staff.pinHash) return miss();
  }
  cache.remove(failKey);
  return { ok: true, token: makeToken_(name), profile: profile_(staff) };
}

function auth_(req) {
  const name = readToken_(req.token);
  const staff = name && findStaff_(name);
  if (!staff) throw new Error('Please sign in again.');
  return staff;
}

function hashPin_(name, pin) {
  return hex_(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, secret_('SALT') + '|' + name + '|' + pin));
}

function makeToken_(name) {
  const payload = name + '|' + (Date.now() + SESSION_HOURS * 3600 * 1000);
  return Utilities.base64EncodeWebSafe(payload) + '.' + sign_(payload);
}

function readToken_(token) {
  const parts = String(token || '').split('.');
  if (parts.length !== 2) return null;
  let payload;
  try { payload = Utilities.newBlob(Utilities.base64DecodeWebSafe(parts[0])).getDataAsString(); } catch (e) { return null; }
  if (sign_(payload) !== parts[1]) return null;
  const cut = payload.lastIndexOf('|');
  if (Number(payload.slice(cut + 1)) < Date.now()) return null;
  return payload.slice(0, cut);
}

function sign_(payload) {
  return Utilities.base64EncodeWebSafe(Utilities.computeHmacSha256Signature(payload, secret_('SECRET')));
}

// Random values kept in Script Properties, created the first time they are needed.
function secret_(key) {
  const props = PropertiesService.getScriptProperties();
  let v = props.getProperty(key);
  if (!v) { v = Utilities.getUuid() + Utilities.getUuid(); props.setProperty(key, v); }
  return v;
}

function hex_(bytes) {
  return bytes.map(function (b) { return ('0' + ((b + 256) % 256).toString(16)).slice(-2); }).join('');
}

/* ---------- requests ---------- */

function me_(staff) {
  const data = load_();
  return { ok: true, profile: profile_(staff), passMark: PASS_MARK, tests: status_(staff, data, new Date()), attempts: attemptsFor_(staff, data) };
}

function attempt_(staff, req) {
  const right = Math.max(0, Number(req.right) || 0);
  const total = Math.max(0, Number(req.total) || 0);
  if (!total || right > total) throw new Error('That result could not be read.');
  const pct = Math.round(right / total * 100);
  const key = clean_(req.testId, 40) + ':' + clean_(req.sectionId, 40);
  const id = clean_(req.id, 40);
  const missed = Array.isArray(req.missed) ? req.missed.map(function (m) { return clean_(m, 200); }).join(' | ') : '';

  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    // The page re-sends if it never hears back, so skip an attempt that is already logged.
    const rows = readTab_('Attempts');
    const idCol = TABS.Attempts.length - 1;
    if (id && rows.slice(-500).some(function (r) { return r[idCol] === id; })) return { ok: true, duplicate: true };
    appendRow_('Attempts', [new Date(), staff.name, staff.venueText, key, clean_(req.test, 60), clean_(req.section, 80),
      right, total, pct, pct >= PASS_MARK ? 'Pass' : 'Re-test', clean_(missed, 5000), id]);
  } finally { lock.releaseLock(); }
  try { emailResult_(staff, req, right, total, pct); } catch (e) { /* the result is saved either way */ }
  return { ok: true, pct: pct, passed: pct >= PASS_MARK };
}

function crew_(viewer) {
  if (viewer.role === 'Crew') throw new Error('The crew view is for managers.');
  const data = load_();
  const now = new Date();
  return { ok: true, passMark: PASS_MARK, crew: crewOf_(viewer, data).map(function (s) { return member_(s, data, now); }) };
}

/* ---------- status rules ---------- */

function crewOf_(viewer, data) {
  return data.staff.filter(function (s) {
    if (s.role === 'Owner') return false; // owners are not tested, so they never appear in a crew list
    if (viewer.role === 'Owner') return true;
    return s.venues.some(function (v) { return viewer.venues.indexOf(v) !== -1 || v === 'all' || viewer.venues.indexOf('all') !== -1; });
  });
}

function member_(s, data, now) {
  const tests = status_(s, data, now);
  return { name: s.name, venue: s.venueText, role: s.role, tests: tests, flags: flags_(tests), attempts: attemptsFor_(s, data) };
}

// One entry per required test that applies to this person.
function status_(staff, data, now) {
  const owner = staff.role === 'Owner'; // owners can sit any test to try it or demo it; nothing is due for them
  const mine = data.attempts.filter(function (a) { return norm_(a.name) === staff.key; });
  return data.tests.filter(function (t) {
    return t.required && (owner || t.venue === 'all' || staff.venues.indexOf('all') !== -1 || staff.venues.indexOf(t.venue) !== -1);
  }).map(function (t) {
    const at = mine.filter(function (a) { return a.key === t.key; });
    const passes = at.filter(function (a) { return a.pct >= PASS_MARK; });
    const latest = at.length ? at[at.length - 1] : null;
    const lastPass = passes.length ? passes[passes.length - 1] : null;
    let failsInRow = 0;
    for (let i = at.length - 1; i >= 0 && at[i].pct < PASS_MARK; i--) failsInRow++;
    // A pass runs out after the refresher period, then the test is due again.
    const refreshFrom = lastPass && t.refreshMonths > 0 ? addMonths_(lastPass.when, t.refreshMonths) : null;
    const needsRefresh = !!refreshFrom && now.getTime() > refreshFrom.getTime();
    const passed = !!lastPass && !needsRefresh;
    const from = needsRefresh ? refreshFrom.getTime()
      : (Math.max(t.assigned ? t.assigned.getTime() : 0, staff.start ? staff.start.getTime() : 0) || now.getTime());
    const due = new Date(from + DUE_DAYS * 86400000);
    return {
      key: t.key, title: t.title,
      state: owner ? (lastPass ? 'passed' : (latest ? 'retest' : 'todo'))
        : (passed ? 'passed' : (now.getTime() > due.getTime() ? 'overdue' : (needsRefresh ? 'refresh' : (latest ? 'retest' : 'todo')))),
      due: owner ? null : due.toISOString(),
      optional: owner,
      passedOn: lastPass ? lastPass.when.toISOString() : null,
      refreshOn: refreshFrom ? refreshFrom.toISOString() : null,
      best: at.length ? Math.max.apply(null, at.map(function (a) { return a.pct; })) : null,
      tries: at.length,
      latestPct: latest ? latest.pct : null,
      latestWhen: latest ? latest.when.toISOString() : null,
      failsInRow: failsInRow
    };
  });
}

// Behind: a required test not passed by its due date. Poor: the latest attempt at a test is under the pass mark.
function flags_(tests) {
  const behind = tests.filter(function (t) { return t.state === 'overdue'; });
  const poor = tests.filter(function (t) { return t.failsInRow > 0; });
  return {
    required: tests.length,
    passed: tests.filter(function (t) { return t.state === 'passed'; }).length,
    behind: behind.map(function (t) { return t.title; }),
    poor: poor.map(function (t) { return { title: t.title, pct: t.latestPct, failsInRow: t.failsInRow }; })
  };
}

function attemptsFor_(staff, data) {
  return data.attempts.filter(function (a) { return norm_(a.name) === staff.key; }).map(function (a) {
    return { when: a.when.toISOString(), key: a.key, test: a.test, section: a.section, right: a.right, total: a.total, pct: a.pct, missed: a.missed };
  }).reverse();
}

function profile_(s) { return { name: s.name, venue: s.venueText, role: s.role }; }

/* ---------- emails ---------- */

const SIGN_OFF = 'Adrian, Mic and the Red Square Crew';
const OWN_TIME = 'at work or in your own time, whichever suits you';

// Sent to the person straight after each attempt, if they have an email in the Staff tab.
function emailResult_(staff, req, right, total, pct) {
  if (!staff.email || !emailsOn_()) return;
  const title = clean_(req.test, 60) + ': ' + clean_(req.section, 80);
  const review = (Array.isArray(req.review) ? req.review : []).slice(0, 40).map(function (m) {
    return '- ' + clean_(m && m.q, 300) + '\n  Answer: ' + clean_(m && m.a, 300);
  });
  MailApp.sendEmail(staff.email, 'Your result: ' + title + ' ' + pct + '%',
    'Hi ' + first_(staff) + ',\n\nYou scored ' + right + ' out of ' + total + ' (' + pct + '%) on ' + title + '. ' +
    (pct >= PASS_MARK ? 'That is a pass.' : 'The pass mark is ' + PASS_MARK + '%, so this one needs another go.') +
    (review.length ? '\n\nThe ones you missed:\n\n' + review.join('\n\n') : '\n\nYou did not miss a single question.') +
    '\n\nYou can sit it again any time, ' + OWN_TIME + ':\n' + SITE_URL + '\n\n' + SIGN_OFF + '\n');
}

// Runs every Monday morning. Managers get their follow-up list, and anyone with a test
// to do gets one reminder. Nobody gets more than one reminder a week.
function weeklyDigest() {
  if (!emailsOn_()) return;
  const data = load_();
  const now = new Date();
  managerDigest_(data, now);
  staffReminders_(data, now);
}

function managerDigest_(data, now) {
  data.staff.filter(function (m) { return m.role !== 'Crew' && m.email; }).forEach(function (m) {
    const lines = [];
    crewOf_(m, data).forEach(function (s) {
      const f = flags_(status_(s, data, now));
      if (f.behind.length) lines.push(s.name + ' is behind on ' + f.behind.length + ' of ' + f.required + ' tests: ' + f.behind.join(', '));
      f.poor.forEach(function (p) {
        lines.push(s.name + ' scored ' + p.pct + '% on ' + p.title + (p.failsInRow > 1 ? ' (' + p.failsInRow + ' fails in a row)' : ''));
      });
    });
    if (!lines.length) return;
    MailApp.sendEmail(m.email, 'Staff training: ' + lines.length + ' to follow up',
      'Hi ' + first_(m) + ',\n\nThese need a follow up this week:\n\n- ' + lines.join('\n- ') +
      '\n\nThe pass mark is ' + PASS_MARK + '% and each test is due ' + DUE_DAYS + ' days after it is assigned.\n\nCrew view: ' + SITE_URL + '\n');
  });
}

function staffReminders_(data, now) {
  data.staff.filter(function (s) { return s.email && s.role !== 'Owner'; }).forEach(function (s) {
    const lines = reminderLines_(status_(s, data, now), now);
    if (!lines.length) return;
    MailApp.sendEmail(s.email, 'Menu training: ' + lines.length + (lines.length === 1 ? ' test' : ' tests') + ' to do',
      'Hi ' + first_(s) + ',\n\nHere is where your training is at:\n\n- ' + lines.join('\n- ') +
      '\n\nYou can do these ' + OWN_TIME + '. Sign in here:\n' + SITE_URL + '\n\n' + SIGN_OFF + '\n');
  });
}

// Tests worth a nudge: overdue, a failed last try, a refresher that has come up, or due within the week.
function reminderLines_(tests, now) {
  const soon = now.getTime() + REMIND_WITHIN_DAYS * 86400000;
  const out = [];
  tests.forEach(function (t) {
    const due = new Date(t.due);
    if (t.state === 'overdue') out.push(t.title + ': was due ' + day_(due));
    else if (t.state === 'refresh') out.push(t.title + ': refresher due by ' + day_(due) + ' (last passed ' + day_(new Date(t.passedOn)) + ')');
    else if (t.state === 'retest') out.push(t.title + ': last try ' + t.latestPct + '%, needs a re-test by ' + day_(due));
    else if (t.state === 'todo' && due.getTime() <= soon) out.push(t.title + ': due ' + day_(due));
  });
  return out;
}

// The master switch: no email of any kind is sent unless the Settings tab says "Emails on | Yes".
function emailsOn_() {
  return readTab_('Settings').some(function (r) { return norm_(r[0]) === 'emails on' && /^y/i.test(String(r[1]).trim()); });
}

function first_(s) { return s.name.split(' ')[0]; }
function day_(d) { return Utilities.formatDate(d, TIMEZONE, 'd MMM'); }

function installWeeklyEmail() {
  ScriptApp.getProjectTriggers().forEach(function (t) { if (t.getHandlerFunction() === 'weeklyDigest') ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger('weeklyDigest').timeBased().onWeekDay(ScriptApp.WeekDay.MONDAY).atHour(8).inTimezone(TIMEZONE).create();
}

// Run once from the editor to create the tabs. Also happens on the first request.
function setup() { Object.keys(TABS).forEach(function (n) { sheet_(n); }); }

/* ---------- sheet access ---------- */

function load_() {
  return { staff: staffList_(), tests: readTab_('Tests').filter(function (r) { return r[0]; }).map(function (r) {
    return { key: String(r[0]).trim(), title: String(r[1] || r[0]), venue: norm_(r[2]) || 'all', required: !/^n/i.test(String(r[3]).trim()), assigned: date_(r[4]),
      refreshMonths: (r[5] === '' || r[5] == null || isNaN(Number(r[5]))) ? REFRESH_MONTHS : Number(r[5]) };
  }), attempts: readTab_('Attempts').filter(function (r) { return r[0] && r[1]; }).map(function (r) {
    return { when: date_(r[0]) || new Date(0), name: String(r[1]), key: String(r[3]), test: String(r[4]), section: String(r[5]),
      right: Number(r[6]) || 0, total: Number(r[7]) || 0, pct: Number(r[8]) || 0, missed: String(r[10] || '') };
  }).sort(function (a, b) { return a.when - b.when; }) };
}

function staffList_() {
  return readTab_('Staff').map(function (r, i) {
    const role = /^own/i.test(String(r[2]).trim()) ? 'Owner' : (/^man/i.test(String(r[2]).trim()) ? 'Manager' : 'Crew');
    return { row: i + 2, name: String(r[0]).trim(), key: norm_(r[0]), venueText: String(r[1]).trim(),
      venues: String(r[1]).split(',').map(norm_).filter(String), role: role, email: String(r[3] || '').trim(),
      start: date_(r[4]), active: !/^n/i.test(String(r[5]).trim()), pinHash: String(r[6] || '').trim() };
  }).filter(function (s) { return s.key && s.active; });
}

function findStaff_(name) {
  const hits = staffList_().filter(function (s) { return s.key === name; });
  return hits.length === 1 ? hits[0] : null; // two people with the same name must be told apart in the sheet
}

function sheet_(name) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.appendRow(TABS[name]);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, TABS[name].length).setFontWeight('bold');
    if (name === 'Settings') sh.appendRow(['Emails on', 'No']);
    if (name === 'Tests') SEED_TESTS.forEach(function (t) { sh.appendRow([t[0], t[1], 'Glenorchy', 'Yes', new Date(), REFRESH_MONTHS]); });
  }
  return sh;
}

function readTab_(name) { return sheet_(name).getDataRange().getValues().slice(1); }
function appendRow_(name, row) { sheet_(name).appendRow(row); }
function setCell_(name, row, col, value) { sheet_(name).getRange(row, col).setValue(value); }

/* ---------- small helpers ---------- */

function addMonths_(d, n) { const x = new Date(d.getTime()); x.setMonth(x.getMonth() + n); return x; }
function norm_(v) { return String(v == null ? '' : v).trim().toLowerCase().replace(/\s+/g, ' '); }
function date_(v) {
  if (v instanceof Date) return isNaN(v.getTime()) ? null : v;
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}
// Text only, trimmed to length, and never treated as a formula by Sheets.
function clean_(v, max) {
  let s = String(v == null ? '' : v).trim().slice(0, max);
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}
