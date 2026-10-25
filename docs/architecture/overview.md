# Architecture overview

CampusBrain is intentionally a small two-process application:

* **Frontend:** React, TypeScript, and Vite. Components are grouped by user-facing feature and share CSS tokens that mirror the canonical reference.
* **Backend:** FastAPI with environment-backed settings. The API is the future boundary for profile, academic data, document processing, and provider-backed AI.

The Android application will package the frontend with Capacitor in a later milestone. It must call a reachable backend; an APK does not contain a permanently running FastAPI process. Initial persistence is planned as local SQLite on the backend, with uploaded files stored outside database rows and explicit export/backup flows.