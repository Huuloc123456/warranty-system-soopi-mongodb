# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Soopi is a warranty and repair service-center system. Staff roles are receptionist, dispatcher, technician, warehouse, cashier and admin, and customers have a portal. This repo is a **MongoDB port** of the sibling project `../warranty-system-soopi`, which runs on SQL Server. That project was in turn ported from a Java/Spring app. Controllers, DTOs, authorization rules, state machines, billing rules and the whole React UI were kept. Only the persistence layer was rewritten to use MongoDB.Driver 3.12. The API URLs and JSON shapes are a contract shared with the frontend and with a third-party mobile app, so don't change them casually.

Docs, code comments, UI strings and error messages are in Vietnamese. Keep new ones in Vietnamese. Demo accounts are listed in `README.md` and `TAI_KHOAN.md`; the password is `1234` in Development.

## Prerequisites

MongoDB has to run locally on `127.0.0.1:27017` as **replica set `rs0`**, because the app relies on multi-document transactions. The app database is `soopi_mongodb`. Config is in `backend-dotnet/src/Soopi.Api/appsettings.json` and can be overridden with `Mongo__ConnectionString` or `Mongo__Database`. User Secrets id: `soopi-mongodb-local`. The Gmail SMTP password for OTP goes in `Email:AppPassword` (User Secrets or env), never in appsettings. If it's missing, OTP endpoints return `OTP_SEND_FAILED`.

## Commands

```powershell
.\run.bat            # npm ci if needed, build the frontend into the API's wwwroot, then run the API at http://localhost:8081
.\run.bat initdb     # only create collections/indexes/demo data (--InitializeOnly=true), then exit
.\run.bat test       # dotnet test backend-dotnet/Soopi.slnx

# Dev loop (two terminals)
dotnet run --project backend-dotnet/src/Soopi.Api --launch-profile http   # API :8081
cd frontend-react; npm.cmd run dev                                       # Vite :5174, proxies /api and /actuator to :8081

# Backend tests
dotnet test backend-dotnet/Soopi.slnx
dotnet test backend-dotnet/Soopi.slnx --filter "FullyQualifiedName~TicketTests"              # one class
dotnet test backend-dotnet/Soopi.slnx --filter "FullyQualifiedName~TicketTests.SomeMethod"   # one test

# Frontend (from frontend-react/)
npm.cmd run build    # tsc --noEmit + vite build -> ../backend-dotnet/src/Soopi.Api/wwwroot (gitignored)
npm.cmd run lint     # tsc --noEmit + scripts/check.mjs
npm.cmd test         # check.mjs + node --test scripts/{api,contrast,login}.test.mjs
node --test scripts/login.test.mjs                                          # one test file

# Verification (from repo root)
node verification/check-contract.mjs   # every API route of ../warranty-system-soopi (except chat) must exist here
node verification/mongo-smoke.mjs      # needs the API running; writes test documents into soopi_mongodb
```

Integration tests create a throwaway `soopi_mongodb_test_<guid>` database (or `soopi_mongodb_test_api_<guid>`) and drop only that one. They still need the local `rs0` replica set. Never point the tests at `soopi_mongodb`.

## Architecture

### Backend (`backend-dotnet/src/Soopi.Api`, ASP.NET Core .NET 10)

- **Layering:** `Controllers/` (thin; several controllers per file, grouped by area) → `Services/<Area>/` (business logic) → `Data/Stores/` (Mongo queries per aggregate) → `Data/AppDbContext`. Domain rules such as state machines, value objects, `DomainException` and `ErrorCode` live in `Domain/`. Everything is registered by hand in `Program.cs`, grouped by area. A new service or store must be added there.
- **`AppDbContext` (`Data/MongoContext.cs`)** is scoped per request over one shared singleton `MongoClient`. It isn't EF. It wraps collections and routes every call through `db.Session` when a transaction is open. Account and profile entities (`MongoSet<T>`) are change-tracked. `SaveChangesAsync` replaces each changed document using its *original BSON document as the filter*. If nothing matches, it throws `MongoConcurrencyException`, which is how lost updates are detected. Numeric IDs and business codes come from the `counters` collection via `$inc`. That increment runs **outside** the transaction on purpose, to avoid WriteConflicts, so gaps in the numbering are expected.
- **Transactions (`Data/MongoTransactions.cs`, `TransactionRunner.InTransactionAsync`)** use snapshot read concern and majority write concern. Nested calls join the outer transaction. Concurrency and transient errors are retried up to 3 times. An unknown commit result retries only the *commit* (so a payment is never replayed), with a 30 s limit. Side effects go in `afterCommit` or `afterRollback` callbacks. Don't run operations in parallel inside one transaction.
- **Document model:** tickets embed assignments, diagnosis, status history, notes, QC and handover. Quotations embed their lines and decisions. Parts embed per-shelf stock. The collection list and the index-protected invariants are in `docs/ARCHITECTURE.md`. Unique and partial indexes are created in `Data/MongoInitializer.cs`, along with demo seed data (only when Development and `Mongo:SeedDemo=true`). Tickets use a `version` check on save. Stock reserve and deduct use conditional updates inside the same transaction as the stock document.
- **Storage conventions:** instants are UTC BSON DateTime, calendar dates are `yyyy-MM-dd` strings, and money is Decimal128. API codes keep the business format (TN/KH/NV/BG/PX…) and are never ObjectIds. `Data/SqlText.cs` (`SqlMoney`, `JsonText`) is left over from the SQL Server version. It keeps the JSON output identical (e.g. `150000`, not `150000.00`).
- **Java parity:** a lot of the code deliberately reproduces the original Spring behavior. Examples: Problem Details errors via `Infrastructure/Errors`, the `SpringSecurityBoundaryMiddleware`, the `/actuator/health` shape, InvariantCulture, and validation that only uses explicit constraints. `JavaContractTests` checks JSON serialization and validation against `verification/java-domain-snapshots.json`, and `ParityRegressionTests` guards API behavior. If a test fails here, assume the parity is intended.
- **Auth:** JWT (RSA keys are required outside Development), plus rotating refresh tokens stored as hashes with token-family revocation. A refresh cookie is protected by middleware. Role-based policies are in `Services/Identity/Policies.cs`, and portal and file-ownership checks are enforced in the backend.
- **Files:** uploaded content lives on disk under `Storage:Directory` (`./data/files`, gitignored). MongoDB holds only the metadata and ownership in `attachments`. A backup needs both.
- **Hosting:** the API serves the built SPA from `wwwroot`. Old `.html` and Thymeleaf URLs redirect to SPA routes (the `pages` map in `Program.cs`). Only known UI routes fall back to `index.html`, so a wrong `/api/...` path still returns Problem Details.
- **Known limit:** reports filter in MongoDB but aggregate in memory (`Services/Reporting`). The push provider must be `"log"`.

### Frontend (`frontend-react`, React 19 + Vite + TypeScript)

This is a hybrid, not idiomatic React. Each staff page in `src/pages/*.tsx` is static JSX markup carried over from the original HTML. It calls `usePage(name, bodyAttrs, title, controller)`. Behavior lives in plain-JS DOM controllers in `src/behaviors/*.js`, which query `[data-*]` attributes and render with the `html` tagged template. Shared globals are set up in `src/runtime.ts` (`window.LML_API`, `LML_UI`, `LML_FMT`, `LML_LABELS`, plus shell and auth). Navigation between pages uses `<Link reloadDocument>`, so every page is a full document load. Customer-facing pages (`home`, `account`, `register`) use React state instead (`src/customer.tsx`). Role gating in the markup uses `data-roles`. Styles are split into `src/styles/` (`tokens.css` holds the design tokens). For visual work, follow `DESIGN.md` and `PRODUCT.md`.

`scripts/check.mjs` enforces the following:
- Each page contains "Soopi" and never the old name "longmanloc".
- Each behavior file passes `node --check`.
- When the original Java repo `../../../warranty-system-mysql` exists, the `id` and `name` attributes of each page must match the original HTML exactly. New ids have to be whitelisted in the `added` map.
- No page uses `dangerouslySetInnerHTML`.

### Contract guard

`verification/check-contract.mjs` checks that every API route (HTTP method + path, ignoring parameter names) declared in `../warranty-system-soopi`'s controllers still exists here. It doesn't compare files, because the two projects have diverged on purpose. Adding routes is fine. Removing or renaming one fails the check. The original's ticket chat (`ChatController.cs`, `ChatBubble.tsx`) is excluded and must not be ported: the check fails if those files appear here. The results are written to `verification/contract-results.json`. `contract-snapshots/` holds the extracted Java and .NET endpoint contracts.
