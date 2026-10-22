# JerseyStudio — Pilot Launch & Founder Operations Runbook

This plain-English guide explains how to run your pilot test with your first 3 to 5 jersey designers and print shops.

---

## 1. How to Invite and Approve a Pilot User

You have complete control over who gets access through your **Founder Admin Portal**:

1. Open your admin portal on your computer:
   👉 **[`cloud-admin/portal/index.html`](file:///Users/mac/Documents/App/JerseyStudio/cloud-admin/portal/index.html)**
2. When a new user opens JerseyStudio, they enter their email address.
3. Their email immediately appears in your portal under **"Pending Approvals"**.
4. Simply click the green **"Approve"** button!
5. The user's desktop app will instantly unlock and issue them a **7-Day Offline License Pass**.

---

## 2. Managing Users During the Pilot

In your Admin Portal, you can manage any pilot user with one click:
* **Pause / Suspend:** Temporarily halts a user's license (e.g. if they are testing a trial).
* **Reactivate:** Immediately restores access.
* **Revoke:** Permanently blocks the account.
* **Audit Trail:** An automatic log records every action you take with an exact timestamp for complete business records.

---

## 3. What to Ask Pilot Users to Test

Give your pilot users these 4 simple tasks to test their real-world jersey workflow:

1. **Test a Single Jersey Design:**
   * Pick jersey colors (Body, Collar, Side Mesh Panels).
   * Type a custom team name, player name, and number.
   * Export a test PNG or JPG at 300 DPI.
2. **Test Roster Import:**
   * Drop in a CSV or Excel spreadsheet of their team.
   * Check if the app correctly maps the columns (Player Name, Jersey #, Garment Size).
3. **Test Validation & Inline Corrections:**
   * Test the duplicate jersey number toggle.
   * Click directly on any misspelled name in the table to fix it inline.
4. **Test Bulk Export (ZIP Package):**
   * Click "Generate All Team Jerseys".
   * Check the exported ZIP file to confirm all player graphics and the `manifest.csv` match their roster.

---

## 4. How to Generate the Installers for Windows and Mac

Because we set up GitHub Actions in `.github/workflows/release.yml`:
1. Push this project to your GitHub account.
2. Whenever you are ready to give users a downloadable installer:
   * Create a release tag (like `v0.1.0`).
   * GitHub will automatically compile:
     * **macOS:** `JerseyStudio_0.1.0_universal.dmg`
     * **Windows:** `JerseyStudio_0.1.0_x64-setup.exe` and `JerseyStudio_0.1.0_x64_en-US.msi`
3. Download the files directly from your GitHub Releases page and send them to your pilot users!

---

## 5. Security & Privacy Reminder
* Even during the pilot, **no customer artwork, player rosters, or team designs ever touch your cloud server**.
* Everything stays 100% on each user's computer.
