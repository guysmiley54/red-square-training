# Red Square Staff Training

Staff knowledge tests for Red Square Cafe, hosted on GitHub Pages.

Everyone signs in with their name and a 4-digit PIN. Crew see their own tests and results. Managers also get a crew view for their venue, with flags for anyone behind or scoring under the pass mark. Owners see every venue.

## Files

- `index.html` sign-in, My training, and the manager crew view
- `glenorchy-menu.html` + `glenorchy-menu.questions.js` the Glenorchy menu test (September 2026 menu)
- `common.js`, `common.css` shared sign-in session and styling
- `config.js` the address of the Apps Script web app
- `apps-script/Code.gs` the backend. It lives in the "Staff Training Log" Apps Script project (redsquarecafe80 Google account) and reads and writes the "Staff Training Log" spreadsheet

## The spreadsheet

- **Staff**: Name, Venue, Role (Crew, Manager or Owner), Email, Start date, Active. Leave the PIN column empty. Each person picks their PIN on first sign-in. Clear the cell to reset it. Venue can list more than one, separated by commas, or `All`.
- **Tests**: the tests each venue must pass and the date they were assigned. A test is due 14 days after it is assigned, or 14 days after the person's start date if that is later.
- **Attempts**: one row per attempt, written by the script.

- **Settings**: `Emails on` is `No` until you are ready. No email of any kind goes out while it is `No`.

## Rules

- Pass mark 80%.
- Behind: a required test not passed by its due date.
- Needs help: the latest attempt at a test is under the pass mark.
- Owners are not tested and do not appear in crew lists.
- A pass lasts 6 months, then a refresher is due within 14 days. Change the months per test in the Tests tab (0 = never).
- Anyone with an Email in the Staff tab is emailed their result after each attempt, and at most one reminder a week (Monday 8am) while they have a test overdue, failed, up for a refresher, or due within 7 days.
- Managers with an Email also get a Monday follow-up list. The Monday run is switched on by running `installWeeklyEmail` once in the Apps Script editor.
