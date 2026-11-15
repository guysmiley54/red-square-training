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
 *   Training  one row each time a manager signs off that they trained someone on a section.
 *
 * Training comes first: a test is not due, and a low score is not flagged, until a manager has signed off
 * the floor training for that person and section. The 14 days run from the sign-off.
 *
 * Emails are OFF until the Settings tab says "Emails on | Yes". Once on, each person with an email in the Staff tab gets their result after every attempt, and at most one
 * reminder a week (Monday) while they have a test to do. Managers and owners get a Monday summary of their crew.
 *
 * Menu change: update the questions, then set the test's Assigned date in the Tests tab to the changeover date.
 * Passes from before that date stop counting, so everyone re-sits on the new menu within 14 days.
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
  Training: ['When', 'Name', 'Test key', 'Trained by'],
  Attempts: ['When', 'Name', 'Staff venue', 'Test key', 'Test', 'Section', 'Correct', 'Out of', 'Score %', 'Result', 'Questions missed', 'Attempt ID', 'Seconds taken']
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
    case 'train': return train_(auth_(req), req);
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
  const secs = Math.max(0, Math.min(7200, Math.round(Number(req.secs) || 0))); // how long the attempt took
  const missed = Array.isArray(req.missed) ? req.missed.map(function (m) { return clean_(m, 200); }).join(' | ') : '';

  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    // The page re-sends if it never hears back, so skip an attempt that is already logged.
    fixHeader_('Attempts');
    const rows = readTab_('Attempts');
    const idCol = 11; // the Attempt ID column
    if (id && rows.slice(-500).some(function (r) { return r[idCol] === id; })) return { ok: true, duplicate: true };
    appendRow_('Attempts', [new Date(), staff.name, staff.venueText, key, clean_(req.test, 60), clean_(req.section, 80),
      right, total, pct, pct >= PASS_MARK ? 'Pass' : 'Re-test', clean_(missed, 5000), id, secs]);
  } finally { lock.releaseLock(); }
  try { emailResult_(staff, req, right, total, pct, secs); } catch (e) { /* the result is saved either way */ }
  return { ok: true, pct: pct, passed: pct >= PASS_MARK };
}

function crew_(viewer) {
  if (viewer.role === 'Crew') throw new Error('The crew view is for managers.');
  const data = load_();
  const now = new Date();
  return { ok: true, passMark: PASS_MARK, crew: crewOf_(viewer, data).map(function (s) { return member_(s, data, now); }) };
}

// A manager or owner records that they have trained someone on the floor. That starts the clock on the test.
function train_(viewer, req) {
  if (viewer.role === 'Crew') throw new Error('Only managers can sign off training.');
  const data = load_();
  const person = crewOf_(viewer, data).filter(function (s) { return staffId_(s.key) === String(req.staff); })[0];
  if (!person) throw new Error('That person is not in your crew.');
  const keys = (Array.isArray(req.keys) ? req.keys : []).map(String);
  const now = new Date();
  const open = status_(person, data, now).filter(function (t) { return t.state === 'untrained' && keys.indexOf(t.key) !== -1; });
  if (!open.length) return { ok: true, added: 0 };
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    open.forEach(function (t) { appendRow_('Training', [now, person.name, t.key, viewer.name]); });
  } finally { lock.releaseLock(); }
  return { ok: true, added: open.length };
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
  return { id: staffId_(s.key), name: s.name, venue: s.venueText, role: s.role, tests: tests, flags: flags_(tests), attempts: attemptsFor_(s, data) };
}

// One entry per required test that applies to this person.
function status_(staff, data, now) {
  const owner = staff.role === 'Owner'; // owners can sit any test to try it or demo it; nothing is due for them
  const mine = data.attempts.filter(function (a) { return norm_(a.name) === staff.key; });
  return data.tests.filter(function (t) {
    return t.required && (owner || t.venue === 'all' || staff.venues.indexOf('all') !== -1 || staff.venues.indexOf(t.venue) !== -1);
  }).map(function (t) {
    // When the menu changes, the Assigned date is moved forward. Only attempts since then count,
    // so everyone re-sits on the new menu. Older attempts stay in their history.
    const all = mine.filter(function (a) { return a.key === t.key; });
    const since = t.assigned ? t.assigned.getTime() : 0;
    const at = all.filter(function (a) { return a.when.getTime() >= since; });
    const menuChanged = !owner && all.some(function (a) { return a.when.getTime() < since && a.pct >= PASS_MARK; }) &&
      !at.some(function (a) { return a.pct >= PASS_MARK; });
    const passes = at.filter(function (a) { return a.pct >= PASS_MARK; });
    const latest = at.length ? at[at.length - 1] : null;
    const lastPass = passes.length ? passes[passes.length - 1] : null;
    // A pass runs out after the refresher period, then the test is due again.
    const refreshFrom = lastPass && t.refreshMonths > 0 ? addMonths_(lastPass.when, t.refreshMonths) : null;
    const needsRefresh = !!refreshFrom && now.getTime() > refreshFrom.getTime();
    const passed = !!lastPass && !needsRefresh;
    // Training on the floor comes first. Until a manager signs it off, nothing is due and a low score is not held against anyone.
    const signed = data.training.filter(function (x) { return x.name === staff.key && x.key === t.key; })
      .sort(function (a, b) { return a.when - b.when; })[0] || null;
    const untrained = !owner && !signed && !lastPass;
    // A fail from before the training was signed off is not held against anyone.
    const counted = signed ? at.filter(function (x) { return x.when.getTime() >= signed.when.getTime(); }) : at;
    const latestCounted = counted.length ? counted[counted.length - 1] : null;
    let failsInRow = 0;
    for (let i = counted.length - 1; i >= 0 && counted[i].pct < PASS_MARK; i--) failsInRow++;
    const from = needsRefresh ? refreshFrom.getTime()
      : (Math.max(t.assigned ? t.assigned.getTime() : 0, staff.start ? staff.start.getTime() : 0, signed ? signed.when.getTime() : 0) || now.getTime());
    const due = new Date(from + DUE_DAYS * 86400000);
    return {
      key: t.key, title: t.title,
      state: owner ? (lastPass ? 'passed' : (latest ? 'retest' : 'todo'))
        : (untrained ? 'untrained' : (passed ? 'passed' : (now.getTime() > due.getTime() ? 'overdue' : (needsRefresh ? 'refresh' : (latestCounted ? 'retest' : 'todo'))))),
      due: owner || untrained ? null : due.toISOString(),
      trainedOn: signed ? signed.when.toISOString() : null,
      trainedBy: signed ? signed.by : null,
      optional: owner,
      menuChanged: menuChanged,
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
// Neither applies to a test the person has not been trained on yet.
function flags_(tests) {
  const behind = tests.filter(function (t) { return t.state === 'overdue'; });
  const poor = tests.filter(function (t) { return t.failsInRow > 0 && t.state !== 'untrained'; });
  return {
    required: tests.length,
    passed: tests.filter(function (t) { return t.state === 'passed'; }).length,
    behind: behind.map(function (t) { return t.title; }),
    untrained: tests.filter(function (t) { return t.state === 'untrained'; }).map(function (t) { return t.title; }),
    poor: poor.map(function (t) { return { title: t.title, pct: t.latestPct, failsInRow: t.failsInRow }; })
  };
}

function attemptsFor_(staff, data) {
  return data.attempts.filter(function (a) { return norm_(a.name) === staff.key; }).map(function (a) {
    return { when: a.when.toISOString(), key: a.key, test: a.test, section: a.section, right: a.right, total: a.total, pct: a.pct, missed: a.missed, secs: a.secs };
  }).reverse();
}

function profile_(s) { return { name: s.name, venue: s.venueText, role: s.role }; }

/* ---------- emails ---------- */

const SIGN_OFF = 'Adrian, Mic and the Red Square Crew';
const OWN_TIME = 'at work or in your own time, whichever suits you';
const SUMMARY_DAYS = 7; // the weekly summary covers results from the last 7 days
const INK = '#151515', PAPER = '#f4f2ec', MUTED = '#5d5b57', RULE = '#d9d6cf', RED = '#c8201f', HI = '#ffe14a';
const TONES = { good: '#1d7a45', bad: '#b3261e', warn: '#8a5a00', plain: '#5d5b57' };
const FONT = "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;";

// The master switch: no email of any kind is sent unless the Settings tab says "Emails on | Yes".
function emailsOn_() {
  return readTab_('Settings').some(function (r) { return norm_(r[0]) === 'emails on' && /^y/i.test(String(r[1]).trim()); });
}

function send_(to, subject, text, html) {
  MailApp.sendEmail({ to: to, subject: subject, body: text, htmlBody: html, name: 'Red Square Training' });
}

/* -- building blocks for the HTML emails (tables and inline styles, so every mail app shows them the same) -- */

function esc_(v) { return String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

function pill_(text, tone) {
  const c = TONES[tone] || TONES.plain;
  return '<span style="display:inline-block;border:2px solid ' + c + ';color:' + c + ';font-size:11px;font-weight:700;letter-spacing:.06em;' +
    'text-transform:uppercase;padding:2px 7px;white-space:nowrap;">' + esc_(text) + '</span>';
}

function shell_(heading, inner, buttonText) {
  return '<div style="margin:0;padding:24px 12px;background:' + PAPER + ';' + FONT + 'color:' + INK + ';">' +
    '<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;margin:0 auto;background:#ffffff;border:2px solid ' + INK + ';">' +
    '<tr><td style="padding:22px 24px 14px;border-bottom:3px solid ' + INK + ';">' +
    '<div style="font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;">' +
    '<span style="display:inline-block;width:11px;height:11px;background:' + RED + ';margin-right:8px;"></span>Red Square Cafe</div>' +
    '<div style="font-size:26px;font-weight:900;line-height:1.15;margin-top:6px;">' + esc_(heading) + '</div></td></tr>' +
    '<tr><td style="padding:20px 24px 8px;font-size:15px;line-height:1.5;">' + inner + '</td></tr>' +
    '<tr><td style="padding:8px 24px 24px;"><a href="' + SITE_URL + '" style="display:inline-block;background:' + INK + ';color:#ffffff;' +
    'text-decoration:none;font-weight:700;font-size:15px;padding:12px 20px;">' + esc_(buttonText) + '</a></td></tr>' +
    '<tr><td style="padding:14px 24px;border-top:1px solid ' + RULE + ';font-size:13px;color:' + MUTED + ';">' + esc_(SIGN_OFF) + '</td></tr>' +
    '</table></div>';
}

function section_(title, rowsHtml) {
  return '<div style="margin:18px 0 6px;"><span style="background:' + HI + ';color:' + INK + ';font-weight:900;font-size:14px;letter-spacing:.04em;' +
    'text-transform:uppercase;padding:3px 8px;">' + esc_(title) + '</span></div>' +
    '<table role="presentation" cellpadding="0" cellspacing="0" width="100%">' + rowsHtml + '</table>';
}

// One line in a list: bold lead, lighter detail underneath, an optional status pill on the right.
function line_(lead, detail, pillHtml) {
  return '<tr><td style="padding:9px 0;border-bottom:1px solid ' + RULE + ';font-size:15px;line-height:1.4;">' +
    '<div style="font-weight:700;">' + esc_(lead) + '</div>' + (detail ? '<div style="color:' + MUTED + ';font-size:14px;">' + esc_(detail) + '</div>' : '') + '</td>' +
    '<td align="right" valign="top" style="padding:9px 0 9px 10px;border-bottom:1px solid ' + RULE + ';">' + (pillHtml || '') + '</td></tr>';
}

function p_(html) { return '<p style="margin:0 0 12px;">' + html + '</p>'; }

/* -- the three emails -- */

// To the person, straight after each attempt.
function emailResult_(staff, req, right, total, pct, secs) {
  if (!staff.email || !emailsOn_()) return;
  const title = clean_(req.test, 60) + ': ' + clean_(req.section, 80);
  const pass = pct >= PASS_MARK;
  const review = (Array.isArray(req.review) ? req.review : []).slice(0, 40).map(function (m) {
    return { q: clean_(m && m.q, 300), a: clean_(m && m.a, 300) };
  });
  const verdict = (pass ? 'That is a pass.' : 'The pass mark is ' + PASS_MARK + '%, so this one needs another go.') + (secs ? ' It took you ' + took_(secs) + '.' : '');

  const text = 'Hi ' + first_(staff) + ',\n\nYou scored ' + right + ' out of ' + total + ' (' + pct + '%) on ' + title + '. ' + verdict +
    (review.length ? '\n\nThe ones you missed:\n\n' + review.map(function (m) { return '- ' + m.q + '\n  Answer: ' + m.a; }).join('\n\n')
      : '\n\nYou did not miss a single question.') +
    '\n\nYou can sit it again any time, ' + OWN_TIME + ':\n' + SITE_URL + '\n\n' + SIGN_OFF + '\n';

  const html = shell_('Your result',
    p_('Hi ' + esc_(first_(staff)) + ',') +
    '<table role="presentation" cellpadding="0" cellspacing="0" style="margin:4px 0 10px;"><tr>' +
    '<td style="font-size:56px;font-weight:900;line-height:1;">' + pct + '%</td>' +
    '<td style="padding-left:14px;">' + pill_(pass ? 'Pass' : 'Re-test needed', pass ? 'good' : 'bad') + '</td></tr></table>' +
    p_('<b>' + right + ' of ' + total + '</b> correct on <b>' + esc_(title) + '</b>. ' + esc_(verdict)) +
    (review.length ? section_('The ones you missed', review.map(function (m) {
      return '<tr><td style="padding:10px 0;border-bottom:1px solid ' + RULE + ';font-size:15px;line-height:1.4;"><div style="font-weight:700;">' + esc_(m.q) +
        '</div><div style="color:' + TONES.good + ';">' + esc_(m.a) + '</div></td></tr>';
    }).join('')) : p_('You did not miss a single question.')) +
    '<p style="margin:16px 0 4px;color:' + MUTED + ';font-size:14px;">You can sit it again any time, ' + OWN_TIME + '.</p>',
    'Sit it again');
  send_(staff.email, 'Your result: ' + title + ' ' + pct + '%', text, html);
}

// Runs every Monday morning. Managers and owners get a summary of their crew, and anyone
// with a test to do gets one reminder. Nobody gets more than one of each a week.
function weeklyDigest() {
  if (!emailsOn_()) return;
  const data = load_();
  const now = new Date();
  weeklySummary_(data, now);
  staffReminders_(data, now);
}

// What a manager or owner needs to know about their crew this week.
function summaryFor_(viewer, data, now) {
  const from = now.getTime() - SUMMARY_DAYS * 86400000;
  const out = { follow: [], retest: [], results: [], progress: [], training: [] };
  crewOf_(viewer, data).forEach(function (s) {
    const tests = status_(s, data, now);
    const f = flags_(tests);
    if (f.behind.length) out.follow.push({ lead: s.name, detail: 'Behind on ' + f.behind.length + ' of ' + f.required + ': ' + shortTitles_(f.behind), label: 'Behind', tone: 'bad' });
    f.poor.forEach(function (p) {
      out.follow.push({ lead: s.name, detail: p.pct + '% on ' + shortTitle_(p.title) + (p.failsInRow > 1 ? ', ' + p.failsInRow + ' fails in a row' : ''), label: 'Low score', tone: 'warn' });
    });
    if (f.untrained.length) out.training.push({ lead: s.name, detail: (f.untrained.length === f.required ? 'All ' + f.required + ' sections' : shortTitles_(f.untrained)), label: 'To train', tone: 'plain' });
    const refresh = tests.filter(function (t) { return t.state === 'refresh' || (t.state === 'overdue' && t.refreshOn && new Date(t.refreshOn) <= now); });
    const changed = tests.filter(function (t) { return t.menuChanged; });
    if (refresh.length) out.retest.push({ lead: s.name, detail: 'Refresher due: ' + shortTitles_(refresh.map(function (t) { return t.title; })), label: 'Refresher', tone: 'warn' });
    if (changed.length) out.retest.push({ lead: s.name, detail: 'Menu changed, re-sit: ' + shortTitles_(changed.map(function (t) { return t.title; })), label: 'Menu change', tone: 'warn' });
    data.attempts.filter(function (a) { return norm_(a.name) === s.key && a.when.getTime() >= from; }).forEach(function (a) {
      out.results.push({ lead: s.name, detail: a.test + ': ' + a.section + ', ' + day_(a.when) + (a.secs ? ', ' + took_(a.secs) : ''), label: a.pct + '%', tone: a.pct >= PASS_MARK ? 'good' : 'bad' });
    });
    out.progress.push({ lead: s.name, detail: f.passed + ' of ' + f.required + ' passed' + (f.untrained.length ? ', ' + f.untrained.length + ' not trained yet' : ''),
      label: f.behind.length ? 'Behind' : (f.poor.length ? 'Needs help' : (f.required && f.passed === f.required ? 'Complete' : (f.untrained.length ? 'To train' : 'On track'))),
      tone: f.behind.length ? 'bad' : (f.poor.length ? 'warn' : (f.required && f.passed === f.required ? 'good' : 'plain')) });
  });
  return out;
}

function weeklySummary_(data, now) {
  data.staff.filter(function (m) { return m.role !== 'Crew' && m.email; }).forEach(function (m) {
    const sum = summaryFor_(m, data, now);
    if (!sum.progress.length) return;
    if (!sum.follow.length && !sum.retest.length && !sum.results.length && !sum.training.length) return; // a quiet week sends nothing
    const mail = summaryEmail_(m, sum);
    send_(m.email, mail.subject, mail.text, mail.html);
  });
}

function summaryEmail_(m, sum) {
  const rows = function (list) { return list.map(function (x) { return line_(x.lead, x.detail, pill_(x.label, x.tone)); }).join(''); };
  const textRows = function (list) { return list.map(function (x) { return '- ' + x.lead + ': ' + x.detail + ' [' + x.label + ']'; }).join('\n'); };
  const counts = [];
  if (sum.follow.length) counts.push(sum.follow.length + ' to follow up');
  if (sum.retest.length) counts.push(sum.retest.length + ' ready to re-test');
  if (sum.results.length) counts.push(sum.results.length + (sum.results.length === 1 ? ' result' : ' results') + ' this week');
  if (sum.training.length) counts.push(sum.training.length + ' waiting on training');
  const where = m.role === 'Owner' ? 'all venues' : m.venueText;

  const html = shell_('Crew training summary',
    p_('Hi ' + esc_(first_(m)) + ', here is the week for <b>' + esc_(where) + '</b>: ' + esc_(counts.join(', ')) + '.') +
    (sum.follow.length ? section_('Needs a follow up', rows(sum.follow)) : '') +
    (sum.retest.length ? section_('Ready to re-test', rows(sum.retest)) : '') +
    (sum.results.length ? section_('Results this week', rows(sum.results)) : '') +
    (sum.training.length ? section_('Waiting on floor training', rows(sum.training)) : '') +
    section_('Where everyone is at', rows(sum.progress)) +
    '<p style="margin:16px 0 4px;color:' + MUTED + ';font-size:14px;">Pass mark ' + PASS_MARK + '%. A test is due ' + DUE_DAYS + ' days after you sign off the training in the crew view.</p>',
    'Open the crew view');

  const text = 'Hi ' + first_(m) + ',\n\nCrew training summary for ' + where + ': ' + counts.join(', ') + '.\n' +
    (sum.follow.length ? '\nNEEDS A FOLLOW UP\n' + textRows(sum.follow) + '\n' : '') +
    (sum.retest.length ? '\nREADY TO RE-TEST\n' + textRows(sum.retest) + '\n' : '') +
    (sum.results.length ? '\nRESULTS THIS WEEK\n' + textRows(sum.results) + '\n' : '') +
    (sum.training.length ? '\nWAITING ON FLOOR TRAINING\n' + textRows(sum.training) + '\n' : '') +
    '\nWHERE EVERYONE IS AT\n' + textRows(sum.progress) + '\n\nCrew view: ' + SITE_URL + '\n\n' + SIGN_OFF + '\n';
  return { subject: 'Crew training: ' + counts.join(', '), text: text, html: html };
}

function staffReminders_(data, now) {
  data.staff.filter(function (s) { return s.email && s.role !== 'Owner'; }).forEach(function (s) {
    const items = reminderItems_(status_(s, data, now), now);
    if (!items.length) return;
    const mail = reminderEmail_(s, items);
    send_(s.email, mail.subject, mail.text, mail.html);
  });
}

function reminderEmail_(s, items) {
  const html = shell_('Your menu training',
    p_('Hi ' + esc_(first_(s)) + ', here is where your training is at.') +
    section_(items.length === 1 ? '1 test to do' : items.length + ' tests to do',
      items.map(function (x) { return line_(x.lead, x.detail, pill_(x.label, x.tone)); }).join('')) +
    '<p style="margin:16px 0 4px;color:' + MUTED + ';font-size:14px;">You can do these ' + OWN_TIME + '.</p>',
    'Go to my training');
  const text = 'Hi ' + first_(s) + ',\n\nHere is where your training is at:\n\n' +
    items.map(function (x) { return '- ' + x.lead + ': ' + x.detail; }).join('\n') +
    '\n\nYou can do these ' + OWN_TIME + '. Sign in here:\n' + SITE_URL + '\n\n' + SIGN_OFF + '\n';
  return { subject: 'Menu training: ' + items.length + (items.length === 1 ? ' test' : ' tests') + ' to do', text: text, html: html };
}

// Tests worth a nudge: overdue, a failed last try, a refresher or menu change, or due within the week.
function reminderItems_(tests, now) {
  const soon = now.getTime() + REMIND_WITHIN_DAYS * 86400000;
  const out = [];
  tests.forEach(function (t) {
    const due = new Date(t.due);
    const changed = t.menuChanged ? 'The menu has changed, so this needs a re-sit. ' : '';
    if (t.state === 'overdue') out.push({ lead: t.title, detail: changed + 'Was due ' + day_(due), label: 'Overdue', tone: 'bad' });
    else if (t.state === 'refresh') out.push({ lead: t.title, detail: 'Refresher due by ' + day_(due) + '. Last passed ' + day_(new Date(t.passedOn)), label: 'Refresher', tone: 'warn' });
    else if (t.state === 'retest') out.push({ lead: t.title, detail: changed + 'Last try ' + t.latestPct + '%. Re-test by ' + day_(due), label: 'Re-test', tone: 'warn' });
    else if (t.state === 'todo' && t.menuChanged) out.push({ lead: t.title, detail: changed + 'Due ' + day_(due), label: 'Menu change', tone: 'warn' });
    else if (t.state === 'todo' && due.getTime() <= soon) out.push({ lead: t.title, detail: 'Due ' + day_(due), label: 'Due soon', tone: 'plain' });
  });
  return out;
}

function shortTitle_(t) { return String(t).replace(/^[^:]*:\s*/, ''); }
function shortTitles_(list) { return list.map(shortTitle_).join(', '); }
function took_(secs) { const m = Math.floor(secs / 60), r = secs % 60; return m ? m + ' min' + (r ? ' ' + r + ' sec' : '') : r + ' sec'; }
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
  return { staff: staffList_(), training: readTab_('Training').filter(function (r) { return r[0] && r[1]; }).map(function (r) {
    return { when: date_(r[0]) || new Date(0), name: norm_(r[1]), key: String(r[2]), by: String(r[3] || '') };
  }), tests: readTab_('Tests').filter(function (r) { return r[0]; }).map(function (r) {
    return { key: String(r[0]).trim(), title: String(r[1] || r[0]), venue: norm_(r[2]) || 'all', required: !/^n/i.test(String(r[3]).trim()), assigned: date_(r[4]),
      refreshMonths: (r[5] === '' || r[5] == null || isNaN(Number(r[5]))) ? REFRESH_MONTHS : Number(r[5]) };
  }), attempts: readTab_('Attempts').filter(function (r) { return r[0] && r[1]; }).map(function (r) {
    return { when: date_(r[0]) || new Date(0), name: String(r[1]), key: String(r[3]), test: String(r[4]), section: String(r[5]),
      right: Number(r[6]) || 0, total: Number(r[7]) || 0, pct: Number(r[8]) || 0, missed: String(r[10] || ''), secs: Number(r[12]) || 0 };
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

// Adds any column headings a tab is missing, for tabs created before a column was added.
function fixHeader_(name) {
  const sh = sheet_(name), want = TABS[name];
  const have = sh.getRange(1, 1, 1, want.length).getValues()[0];
  want.forEach(function (h, i) { if (!String(have[i] || '').trim()) sh.getRange(1, i + 1).setValue(h).setFontWeight('bold'); });
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
