# ScaleLog ⚖️

A personal-use web app to log weight & height, auto-calculate BMI, and visualize trends on a BMI zone chart — backed by Google Sheets.

## Features

- 📊 **BMI Zone Chart** — colored background bands (Underweight / Normal / Overweight / Obese) with your data plotted over time
- 📝 **Entry Form** — height (cm), weight (kg), date; real-time BMI preview with validation
- 📅 **History Table** — all entries sorted newest-first
- 🔒 **Google OAuth** — sign-in gate; only your authorized email can access the app
- ☁️ **Google Sheets** — data persisted via a Google Apps Script Web App proxy

## Tech Stack

- **Frontend**: React + Vite + TypeScript
- **Styling**: Tailwind CSS v4
- **Charts**: Recharts
- **Forms**: react-hook-form
- **Auth**: @react-oauth/google + jwt-decode
- **Backend**: Google Apps Script (Web App)
- **Deployment**: Vercel

---

## Setup

### 1. Clone & Install

```bash
git clone https://github.com/aosng007/hwct.git
cd hwct
npm install
```

### 2. Google Apps Script Backend

1. Go to [script.google.com](https://script.google.com) and create a new project.
2. Paste the contents of `scripts/Code.gs` into the editor.
3. Set the three constants at the top of the file:
   - `SPREADSHEET_ID` — the ID from your Google Sheet URL (`/d/<ID>/edit`)
   - `AUTHORIZED_EMAIL` — your Google account email
   - `GOOGLE_CLIENT_ID` — your OAuth 2.0 Client ID (same value as `VITE_GOOGLE_CLIENT_ID`)
4. Deploy → **New deployment** → Type: **Web App**
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Copy the deployment URL (`https://script.google.com/macros/s/.../exec`).

### 3. Google Cloud OAuth Credentials

1. Open [Google Cloud Console](https://console.cloud.google.com/) and create a project.
2. Enable the **Google Sheets API** and configure the **OAuth consent screen**.
3. Create an **OAuth 2.0 Client ID** (Web Application type).
4. Add your Vercel domain to **Authorized JavaScript Origins** and **Authorized Redirect URIs**.
5. Copy the **Client ID**.

### 4. Environment Variables

```bash
cp .env.example .env
```

Edit `.env`:

```
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
VITE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
VITE_AUTHORIZED_EMAIL=you@example.com
```

### 5. Run Locally

```bash
npm run dev
```

### 6. Deploy to Vercel

1. Push to GitHub and import the repo in [Vercel](https://vercel.com).
2. Add the three environment variables in the Vercel project settings.
3. Deploy — HTTPS and CSP headers are configured automatically via `vercel.json`.

---

## Google Sheet Structure

The Apps Script creates the sheet automatically on first use. The columns are:

| Date       | Height (cm) | Weight (kg) | BMI   |
|------------|-------------|-------------|-------|
| 2025-01-01 | 175         | 72          | 23.51 |

---

## Security

- Google OAuth token is stored in memory only (cleared on tab close)
- Authorized email is checked both client-side (UX gate) and server-side (Apps Script)
- No Google API secrets in the frontend bundle
- HTTPS enforced by Vercel; CSP headers configured in `vercel.json`
- Apps Script only accesses the specific target spreadsheet
