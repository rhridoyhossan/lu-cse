# AGENTS.md — LU CSE (`Campus_OS` v5.4.3)

High-density architectural reference for AI coding agents working on `lu-cse`, the academic operations portal for Leading University Computer Science & Engineering (`https://lu-cse.vercel.app`).

---

## 1. Architecture at a Glance

- **Framework**: Next.js `^16.4.6` (App Router), React `19.2.3`, TypeScript `^5`, Tailwind CSS v4
- **UI & Animation**: Shadcn/Radix UI (`radix-ui`), `lucide-react`, GSAP `^3.15.1` (`@gsap/react`, `ScrollTrigger`), `lenis` smooth scroll, `typewriter-effect`, `html-to-image` (routine PNG export)
- **Authentication**: NextAuth v5 beta (`next-auth@5.0.0-beta.30`) with `CredentialsProvider` and stateless JWT sessions (`maxAge: 30d`)
- **Hosting**: Vercel (`bom1` Mumbai region in `vercel.json`), Node.js 24.x Fluid Compute, `@vercel/analytics`
- **Datastore (Zero-DB)**:
  - **Primary Google Sheet** (`GOOGLE_SHEET_ID`) via `@googleapis/sheets` (Service Account JWT)
  - **Student Routine Google Sheet** (sheet ID stored dynamically in `Data` tab row 1) via Google Sheets REST `values:batchGet` (`GOOGLE_SHEETS_API_KEY`)
  - **Question Bank Storage** (`DRIVE_FOLDER_ID`) via `@googleapis/drive` (Service Account JWT)
  - **Image Hosting** via ImgBB REST API (`IMGBB_API_KEY`)

---

## 2. Environment Variables (`env.example`)

| Variable | Purpose |
| :--- | :--- |
| `GOOGLE_SHEET_ID` | Primary spreadsheet ID (`General`, `Resources`, `Data`, `Users` tabs) |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | GCP Service Account email |
| `GOOGLE_PRIVATE_KEY` | Service Account PEM private key (`\n`-escaped; normalized in `lib/google-auth.ts`) |
| `GOOGLE_SHEETS_API_KEY` | API key for public `values:batchGet` routine sheet reads in `lib/routineSheet.ts` |
| `DRIVE_FOLDER_ID` | Root Google Drive folder containing course question-bank folders |
| `AUTH_SECRET` | NextAuth v5 JWT encryption/signing secret |
| `PRODUCTION_URL` | Canonical origin (`https://lu-cse.vercel.app`) for metadata, sitemap, robots, and `proxy.ts` origin checks |
| `NEXT_PUBLIC_INTERNAL_API_SECRET` | Shared header value (`x-internal-token`) validated by `proxy.ts` on matched `/api/*` routes |
| `IMGBB_API_KEY` | API key for admin notice image uploads in `app/api/upload/route.ts` |

---

## 3. Repository & File Map

### Root & Configuration
- `auth.ts` — NextAuth v5 config (`handlers`, `auth`, `signIn`, `signOut`). Authenticates against `Users!A2:E` cached 300s (`["google-sheets-users-auth"]`).
- `proxy.ts` — Next.js 16 edge proxy (`export const proxy = auth(...)`). **Scoped via `config.matcher` ONLY to `/dashboard/:path*`, `/login`, `/api/sheets/:path*`, and `/api/upload/:path*`.**
- `next.config.ts` — `experimental.optimizePackageImports: ["lucide-react"]`.
- `vercel.json` — Pins serverless execution region to `["bom1"]`.
- `eslint.config.mjs` — ESLint 9 flat config (`eslint-config-next/core-web-vitals` + `typescript`).
- `knip.config.js` — Unused export/file analysis config (`app/**` entries).

### `lib/` (Data Fetching, Auth & Utilities)
- `lib/google-auth.ts` — `getGoogleAuth(scope)` maintains a module-level `Map<GoogleScope, JWT>` singleton per scope (`sheetsRead`, `sheetsWrite`, `driveRead`) so JWT auth tokens are reused across warm requests.
- `lib/googleSheets.ts` — `getBatchData()` wrapped in `unstable_cache` (`key: ["google-sheets-full-data"]`, `revalidate: 2592000` [30 days], `tags: ["sheets"]`). Performs a single `spreadsheets.values.batchGet` for `["General!A2:G", "Resources!A2:E", "Data!A1:B"]`. Filters blank rows and slices `rawData.slice(2, 4)` into `notifications: PageNotification[]`.
- `lib/routineSheet.ts` — `DAYS` (`Sunday`..`Saturday`) and `getRoutineData()`. Reads `db.data[0][1]` from `getBatchData()`, then fetches `ranges=${day}!B2:K` for all 7 days via `fetch(url, { cache: "no-store" })` so caching lives solely in the outer `unstable_cache` handlers (preventing duplicate Data Cache writes).
- `lib/drive.ts` — `getCachedDriveData(code)` normalizes `code` to uppercase and wraps `fetchDriveCourseData(normalizedCode)` in `unstable_cache` (`key: ["drive-course-data", normalizedCode]`, `revalidate: 2592000` [30 days], `tags: ["drive-data", "drive-data-<CODE>"]`). Queries Drive folder matching `name contains '${code}'` inside `DRIVE_FOLDER_ID`, lists subfolders (`orderBy: "name"`), and fetches files in parallel (`orderBy: "name"`).
- `lib/adminSheets.ts` — Uncached `fetchSheets()` used exclusively by `/dashboard` SSR (`app/(auth)/dashboard/page.tsx`) so admins always see live sheet state with deterministic `_rowIndex` (`index + 2` for `General`/`Resources`, `index + 1` for `Data`).
- `lib/SmoothScrollProvider.tsx` — Client Lenis + GSAP `ScrollTrigger` ticker integration.
- `lib/utils.ts` — Tailwind `cn()` helper (`clsx` + `tailwind-merge`).

### `data/` (Static Academic Datasets)
- `data/course.ts` — `DEFAULT_EXAM_DETAILS` and `courseData` (`75` total courses: `54` theory + `21` `"Sessional"` courses) with course-specific mid/final exam notes.
- `data/curriculum.json` — 12-semester (`Y1 T1`..`Y4 T3` + `Elective`) syllabus JSON with credits, descriptions, prerequisites, and recommended resources.
- `data/data.ts` — `examOverview` cards (`MID_TERM()` 30m, `FINAL_EXAM()` 40m, `ASSESSMENT()` 30m).

### `app/` (App Router Pages & API Routes)
- `app/layout.tsx` — Root layout (`JetBrains_Mono`, dark theme). Calls `getBatchData()` to inject `maintenanceMode` (`db?.data?.[1]?.[1] === "TRUE"`) into `<MaintenanceGuard>` and `notifications` into `<NotificationPopup>`, plus `<Navbar>`, `<SmoothScrollProvider>`, and `<Analytics />`.
- `app/page.tsx` — Home page reading `db.general.at(-1)` for `<DashboardHero />` (live clock + client-side Open-Meteo weather fetch for LU Sylhet).
- `app/(public)/notices/page.tsx` — Server page passing `db.general` to `<SectionTabs>` -> `<TechCard>`.
- `app/(public)/resources/page.tsx` — Server page passing `db.resources` to `<ResourceGrid>` -> `<ResourceCard>`.
- `app/(public)/curriculum/page.tsx` — Static page passing `data/curriculum.json` to `<CurriculumList>` -> `<CourseCard>`.
- `app/(public)/routine/page.tsx` — Static shell rendering `<RoutineManager />`. `RoutineManager` reads `?type=student|teacher` and lazy-fetches `/api/routine` or `/api/teacher-routine` on demand.
- `app/(public)/question-bank/page.tsx` — Client-searchable grid of theory courses (`!title.toLowerCase().includes("sessional")`).
- `app/(public)/question-bank/[code]/page.tsx` — `dynamicParams = false`; `generateStaticParams()` generates `108` static routes (`54` theory courses in both lowercase and uppercase). Prefetches `getCachedDriveData(courseCode)` server-side and passes `initialData` to `<CourseDetailsClient />` (which only falls back to `/api/course?code=...` if `initialData === undefined`).
- `app/(auth)/login/page.tsx` — Client Credentials login UI (`signIn("credentials", { redirect: false })`).
- `app/(auth)/dashboard/page.tsx` — Protected SSR page (verifies `auth()`, calls uncached `fetchSheets()`, renders `<ClientDashboard />`).
- `app/sitemap.ts` & `app/robots.ts` — SEO metadata routes; `robots.ts` disallows `/api/`, `/login`, `/dashboard`.
- `app/loading.tsx` & `app/not-found.tsx` — Global loading skeleton and 404 page.

### `app/api/` (Route Handlers)
- `app/api/auth/[...nextauth]/route.ts` — Exports NextAuth `GET` & `POST` handlers.
- `app/api/routine/route.ts` — `GET` endpoint normalizing 7-day 2D arrays into `{ classes, timelines, routines: Record<"batch|section", WeeklyRoutine> }`. Cached via `unstable_cache` (`["routine-index"]`, `2592000s`, tag `"routine-data"`) and Edge `Cache-Control: public, s-maxage=2592000, stale-while-revalidate=86400`.
- `app/api/teacher-routine/route.ts` — `GET` endpoint running a 2-pass parser over all 7 days to detect teacher initials (`^[A-Z]{2,5}$` excluding `["RAB", "RKB", "ACL", "LAB", "PHY", "CHE", "MAT", "GED", "CSE", "NL"]`, skipping `"STUDENT NO"` / `"BUS TIME"` rows). Cached via `unstable_cache` (`["teacher-routine-index"]`, `2592000s`, tag `"routine-data"`) and Edge `Cache-Control: public, s-maxage=2592000, stale-while-revalidate=86400`.
- `app/api/course/route.ts` — `GET /api/course?code=...` validates `code` against `courseData`, reads `getCachedDriveData(code)`, responds with `Cache-Control: public, s-maxage=2592000, stale-while-revalidate=86400`.
- `app/api/sheets/route.ts` — Admin `POST` (append), `PUT` (update by `rowIndex`), `DELETE` (clear by `rowIndex`), and `PATCH` (manual cache revalidation for `target: "routine"` or `target: "drive"` with single `courseCode`). Re-checks `auth()`, enforces `Added By === session.user.id` on `PUT`/`DELETE` for `General` and `Resources`, validates `tab` on `POST`/`PUT` (`400` if invalid), sanitizes formula injection (`^[=+\-@\t\r]` -> `'...`), writes with `valueInputOption: "RAW"`, and runs scoped invalidation via `revalidateForTab(tab)` (`General` -> `"sheets"`, `"/"`, `"/notices"`; `Resources` -> `"sheets"`, `"/resources"`; `Data` -> `"sheets"`, `"routine-data"`, `"/"` layout, `"/api/routine"`, `"/api/teacher-routine"`).
- `app/api/upload/route.ts` — Admin `POST` multipart upload proxy to ImgBB (`https://api.imgbb.com/1/upload`).

---

## 4. Google Sheets & Drive Data Schemas

### Primary Workbook (`GOOGLE_SHEET_ID`)
| Tab | Range | Columns / Layout | Notes |
| :--- | :--- | :--- | :--- |
| `General` | `A2:G` (`A1:G` admin) | `[Title, Image URL(Optional), Link(Optional), Added By]` | Notices; latest notice shown on Home (`general.at(-1)`) |
| `Resources` | `A2:E` (`A1:E` admin) | `[Title, Format, Tags, Link, Added By]` | Formats: `Book`, `Video`, `PDF`, `Article`, `Tool`; comma-separated `Tags` |
| `Data` | `A1:B` | `[Key, Value]` | Row 1 (`data[0][1]`): Student Routine Sheet ID<br>Row 2 (`data[1][1]`): Maintenance Mode (`"TRUE"` / `"FALSE"`)<br>Rows 3–4 (`data.slice(2, 4)`): `[slug, html]` popup notifications |
| `Users` | `A2:E` | `[username, password, displayName, ...]` | Admin credentials read by `auth.ts` |

### Routine Workbook (`db.data[0][1]`)
- **Tabs**: `Sunday`, `Monday`, `Tuesday`, `Wednesday`, `Thursday`, `Friday`, `Saturday` (mapped sequentially by `DAYS` index in `lib/routineSheet.ts`).
- **Range**: `B2:K` per day tab.
- **Row 0**: Header row; columns `2..` are time slots (normalized via `.replace(/\s*-\s*/g, "-").replace(/\./g, ":")`).
- **Rows 1+**: `[Batch, Section, ...cellValues]`. `sundaySheet[1]` determines the `BREAK` column (`cell.toUpperCase().includes("BREAK")`).
- **Cell format convention**: `<COURSE_CODE> <TEACHER_INITIALS> <ROOM>` (e.g., `CSE-1101 ABC RAB-302`).

### Google Drive (`DRIVE_FOLDER_ID`)
```
DRIVE_FOLDER_ID/
  └── <Folder matching course code, e.g. "CSE-1101 ...">/
        ├── Mid Term/   -> files sorted by name
        └── Final/      -> files sorted by name (UI renders subfolders reversed)
```

---

## 5. Multi-Tier Caching & Invalidation Matrix

| Layer / Target | Cache Key / Tag | Revalidate / Edge Header | Invalidated By |
| :--- | :--- | :--- | :--- |
| `lib/googleSheets.ts` (`getBatchData`) | Key: `["google-sheets-full-data"]`<br>Tag: `"sheets"` | `unstable_cache`: `2592000s` (30d) | `POST`/`PUT`/`DELETE /api/sheets` |
| `lib/routineSheet.ts` (`getRoutineData`) | `cache: "no-store"` (no duplicate Data Cache entry) | Delegated to outer `unstable_cache` | Outer `"routine-data"` cache |
| `app/api/routine/route.ts` | Key: `["routine-index"]`<br>Tag: `"routine-data"` | `unstable_cache`: `2592000s` (30d)<br>CDN: `s-maxage=2592000, swr=86400` | 30d TTL, `Data` edit, or `PATCH /api/sheets` (`target: "routine"`) |
| `app/api/teacher-routine/route.ts` | Key: `["teacher-routine-index"]`<br>Tag: `"routine-data"` | `unstable_cache`: `2592000s` (30d)<br>CDN: `s-maxage=2592000, swr=86400` | 30d TTL, `Data` edit, or `PATCH /api/sheets` (`target: "routine"`) |
| `lib/drive.ts` (`getCachedDriveData`) | Key: `["drive-course-data", code]`<br>Tags: `"drive-data"`, `"drive-data-<CODE>"` | `unstable_cache`: `2592000s` (30d) | 30d TTL or `PATCH /api/sheets` (`target: "drive"`, single course) |
| `app/api/course/route.ts` | Uses `getCachedDriveData` | CDN: `s-maxage=2592000, swr=86400` | 30d TTL or `PATCH /api/sheets` (`target: "drive"`) |
| `auth.ts` (`getCachedUsers`) | Key: `["google-sheets-users-auth"]` | `unstable_cache`: `300s` (5m) | 5m TTL |
| `app/(public)/question-bank/[code]` | Static (`generateStaticParams`) | Build-time SSG (`dynamicParams = false`) | Revalidation via `PATCH /api/sheets` (`target: "drive"`), `Data` edit, or redeploy |

---

## 6. Security & Performance Guardrails (Do Not Break)

1. **Keep Google SDKs scoped**: Always import `@googleapis/sheets` and `@googleapis/drive`, never the monolithic `googleapis` package (which slows build/bundle size significantly).
2. **Preserve `proxy.ts` matcher boundary**: Never widen `proxy.ts` `config.matcher` to cover public pages or public `GET` APIs (`/api/routine`, `/api/teacher-routine`, `/api/course`). Doing so forces middleware execution on every request and increases Vercel Fluid Active CPU.
3. **Preserve `prefetch={false}` on `<Link>`**: Public navigation and cards intentionally set `prefetch={false}` to prevent automatic viewport prefetch storms against ISR/serverless endpoints.
4. **Preserve Sheet write protections**: Any new write path to Google Sheets must authenticate via `auth()`, verify ownership (`Added By`), strip/escape leading `=`, `+`, `-`, `@`, `\t`, `\r` characters (`sanitizeSheetValue`), and write with `valueInputOption: "RAW"`.
5. **Client HTML sanitization**: `NotificationPopup.tsx` renders HTML from `Data` rows 3–4 using `DOMParser` sanitization (`sanitizeNotificationHtml`). Keep blocked tags (`script`, `iframe`, `object`, `embed`, `link`, `style`, `form`, `input`, `button`, `textarea`) and `on*`/`javascript:`/`data:text/html` stripping intact. Note that server-side `DOMParser` is unavailable (`typeof window === "undefined"` returns raw string during SSR, and `NotificationPopup` only opens inside a `useEffect` on the client).

---

## 7. Known Gotchas & Verification Notes

- **TypeScript vs ESLint**:
  - `npx tsc --noEmit --incremental false` passes cleanly (0 errors). Note: on Windows sandboxes, plain `npx tsc --noEmit` can hit `EPERM` when updating `tsconfig.tsbuildinfo`; `--incremental false` avoids that write.
  - `npm run lint` (`eslint`) currently fails with pre-existing issues (mostly `@typescript-eslint/no-explicit-any` in `lib/googleSheets.ts`, `lib/adminSheets.ts`, `app/api/upload/route.ts`, and components, plus `react-hooks/set-state-in-effect` in `DashboardHero.tsx`, `MaintenanceView.tsx`, `NotificationPopup.tsx`, `ClientDashboard.tsx`, and minor JSX entity/comment-textnode rules). Next.js 16 `next build` skips running ESLint automatically unless configured.
- **Scoped vs Manual Revalidation**: Editing `General` or `Resources` in `/dashboard` only revalidates `"sheets"` and their respective public routes (`/` + `/notices`, or `/resources`); editing `Data` also revalidates `"routine-data"` and `"/"` (layout). Direct edits inside the Routine Google Sheet or Google Drive question bank folders can be pushed live from the `/dashboard` sidebar (`Cache Sync` -> `Sync Routine` or single-course `Sync Drive`) via `PATCH /api/sheets`.
- **Admin `DELETE` behavior**: `DELETE /api/sheets` calls `spreadsheets.values.clear` on `tab!A${rowIndex}:Z${rowIndex}`, leaving an empty row (filtered out by `cleanData` on public reads and `row.Title || row.Key` in `ClientDashboard`) so subsequent `_rowIndex` values do not shift. Also note `DELETE /api/sheets` validates ownership on non-`Data` tabs and skips validating `tab` as strictly as `POST`/`PUT`.
- **Commands**:
  ```bash
  npm run dev                          # Local Turbopack dev server
  npm run build                        # Production Next.js build
  npx tsc --noEmit --incremental false # Type-check without modifying tsbuildinfo
  npm run lint                         # ESLint static analysis
  ```
