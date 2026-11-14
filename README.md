<div align="center">

```
 ██████╗ █████╗ ███╗   ███╗██████╗ ██╗   ██╗███████╗       ██████╗ ███████╗
██╔════╝██╔══██╗████╗ ████║██╔══██╗██║   ██║██╔════╝      ██╔═══██╗██╔════╝
██║     ███████║██╔████╔██║██████╔╝██║   ██║███████╗      ██║   ██║███████╗
██║     ██╔══██║██║╚██╔╝██║██╔═══╝ ██║   ██║╚════██║      ██║   ██║╚════██║
╚██████╗██║  ██║██║ ╚═╝ ██║██║     ╚██████╔╝███████║      ╚██████╔╝███████║
 ╚═════╝╚═╝  ╚═╝╚═╝     ╚═╝╚═╝      ╚═════╝ ╚══════╝       ╚═════╝ ╚══════╝
```

**"Compiled with Dedication. Executed with Spirit."**

[![Version](https://img.shields.io/github/package-json/v/rhridoyhossan/lu-cse?style=for-the-badge&color=06b6d4&label=v)](package.json)
[![Status](https://img.shields.io/badge/System-Online-22c55e?style=for-the-badge)](https://github.com/rhridoyhossan/lu-cse)
[![Views](https://komarev.com/ghpvc/?username=rhridoyhossan&repo=lu-cse&label=VIEWS&color=6366f1&style=for-the-badge)](https://github.com/rhridoyhossan/lu-cse)
[![LU CSE](https://img.shields.io/badge/LU-CSE-a855f7?style=for-the-badge)](https://github.com/rhridoyhossan/lu-cse)

</div>

High-throughput academic operations platform for Leading University Computer Science & Engineering. Built as a zero-infrastructure application using Google Workspace APIs as a serverless operational datastore.

---

## What It Provides
 
Students and faculty, no login needed:
- Batch, section and instructor routines
- Live notices and resources
- Curriculum with prerequisites
- Searchable question bank
Admins: a protected dashboard to publish updates, with routines still maintained in Google Sheets.
 
## Core Engineering Challenges
 
### 1. Quota Throttling vs. Traffic Spikes
- **Constraint:** The Google Sheets API enforces strict read quotas. Class changeovers and exam periods would exhaust them and return HTTP 429 errors.
- **Engineering Solution:** Two-tier caching: Vercel Edge CDN (`s-maxage`) in front of Next.js `unstable_cache` with tag-based invalidation. All sheet reads are collapsed into one `spreadsheets.values.batchGet` call per cache window. Latency drops from ~600 ms to sub-15 ms, and the Google API is shielded from concurrency.
### 2. Multidimensional Grid Normalization (Routine Engine)
- **Constraint:** Timetables are edited by faculty as irregular 2D grids with merged cells, non-contiguous day sheets and variable time slots.
- **Engineering Solution:** A single-pass normalization pipeline in `app/api/routine` and `app/api/teacher-routine`. It indexes day/time coordinates from raw row-major arrays and builds an in-memory `Map<Batch, Section[]>` in O(N), so lookups need no scans.
### 3. Concurrency & Mutation Integrity without ACID Locks
- **Constraint:** Sheets has no row-level locking or transactions. Concurrent admin edits risk race conditions and formula injection.
- **Engineering Solution:** Deterministic row-index tracking (`_rowIndex`), input sanitization that neutralizes formula triggers (`=`, `+`, `-`, `@`, `\t`, `\r`), and all writes committed with `valueInputOption: "RAW"`.
### 4. Selective Edge Proxy Boundary
- **Constraint:** Middleware on every request wastes compute and adds latency to public pages.
- **Engineering Solution:** `proxy.ts` runs only on `/dashboard`, `/login`, `/api/sheets` and `/api/upload`. Static assets and public routes skip it entirely. Protected handlers re-verify `req.auth` for defense in depth.
### 5. Minimizing Vercel Active CPU
- **Constraint:** Fluid compute bills for Active CPU time, so every function invocation costs money.
- **Engineering Solution:** Requests are kept off functions wherever possible:
  - `s-maxage` + stale-while-revalidate on API routes
  - ISR (600 s) for public pages and SSG for 106 question-bank pages (`dynamicParams = false`)
  - Static routine UI with client-side data fetching and filtering
  - Scoped `@googleapis/*` packages instead of `googleapis`, cutting compile time from 22.9 s to 6.7 s

---

## Configuration & Environment

### Prerequisites
- Node.js 18+
- Google Cloud Platform Service Account with Sheets and Drive API scopes
- Google Sheets API Key (for routine lookups)
- ImgBB API Key (asset storage)

### Environment Setup

```env
# Google Workspace Credentials
GOOGLE_SHEET_ID=
GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_PRIVATE_KEY=
GOOGLE_SHEETS_API_KEY=
DRIVE_FOLDER_ID=

# Authentication & Deployment
AUTH_SECRET=
PRODUCTION_URL=https://your-domain.com
IMGBB_API_KEY=
```

### Commands

```bash
npm install        # Install project dependencies
npm run dev        # Start development server (Turbopack)
npm run build      # Compile production build
npm run start      # Launch production server
npm run lint       # Run static analysis
```

---

<div align="center">
  Built with 💙 <strong>Leading University CSE</strong><br/>
</div>
