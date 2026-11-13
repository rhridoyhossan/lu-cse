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

## Value Proposition

Campus_OS eliminates friction in university academic logistics for students and faculty:

- **Instant Timetable Queries**: Real-time batch and section routine resolution with instructor schedule filtering and client-side schedule rendering.
- **Unified Academic Stream**: Real-time academic notices, multi-semester curriculum graph navigation with prerequisite mapping, and searchable question banks.
- **Zero-Friction Access Model**: Public routes require zero authentication or identity friction, while administrative mutation workflows are isolated behind authenticated session guards.

---

## Core Engineering Challenges

### Treating Google Sheets as a Scalable Data Store
Building an institution-scale application without a dedicated SQL/NoSQL database requires solving several distributed systems and data-integrity constraints:

#### 1. Quota Throttling vs. Traffic Spikes
* **Constraint:** The Google Sheets API enforces strict rate limits (60 read requests per minute per project). During class changeovers and examination periods, sudden concurrent student traffic would immediately exhaust Google Cloud quotas and return HTTP 429 errors.
* **Engineering Solution:** Multi-tiered caching strategy combining Next.js App Router Incremental Static Regeneration (`unstable_cache` with tag-based invalidation) and orchestrated batch queries (`spreadsheets.values.batchGet`). Public traffic is served directly from edge cache memory, collapsing response latencies from ~600ms to sub-15ms and shielding the upstream Google API from high concurrency.

#### 2. Multidimensional Grid Normalization (Routine Engine)
* **Constraint:** Academic timetables are maintained by human faculty in irregular 2D spreadsheet matrices with merged cells, non-contiguous day sheets, and variable time slots across overlapping batch/section divisions.
* **Engineering Solution:** A custom single-pass normalization pipeline in `app/api/routine` and `app/api/teacher-routine`. It extracts raw row-major arrays, dynamically indexes day/time coordinates, and constructs an in-memory graph (`Map<Batch, Section[]>`) in $O(N)$ time, allowing instant schedule lookups without expensive query scans.

#### 3. Concurrency & Mutation Integrity without ACID Locks
* **Constraint:** Google Sheets lacks row-level locking and transactional isolation. Direct mutations from multiple administrators risk race conditions and formula injection.
* **Engineering Solution:** Deterministic row-index tracking (`_rowIndex`) paired with input sanitization that neutralizes spreadsheet formula triggers (`=`, `+`, `-`, `@`, `\t`, `\r`) and strictly commits all writes under `valueInputOption: "RAW"`.

#### 4. Edge Network Proxy Boundary
* **Architecture:** Utilizes Next.js 16's `proxy.ts` execution boundary for edge-level request interception, managing session validation, origin verification, and route isolation before downstream server components execute.

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