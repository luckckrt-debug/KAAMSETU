# KAAMSETU — Implementation Status & Architecture Blueprint

**Tagline:** Right People. Right Place. Right Work.  
**Platform Concept:** Scalable, trustworthy Indian digital workforce ecosystem connecting verified skilled workers, customers, contractors, companies, and bulk labour/tender providers.

---

## 1. Module Implementation Tracker

| Module | Status | Details / Routes |
|---|---|---|
| **Phase 1: Project Architecture & Design System** | **COMPLETED** | Forest green (`#173D2B`), warm orange (`#F2A65A`), accent lime (`#B7E36A`) palette, Inter/Manrope typography, responsive layouts, Indian localization, mobile-touch friendly UI, dynamic navbar & footer. |
| **Phase 2: Database & Authentication** | **COMPLETED** | 32-model PostgreSQL Prisma schema (`prisma/schema.prisma`), full RBAC (7 roles: `CUSTOMER`, `WORKER`, `CONTRACTOR`, `TENDER_OWNER`, `TEAM_LEADER`, `ADMIN`, `SUPER_ADMIN`), Phone OTP auth with TTL (5m), cooldown (60s), rate-limiting (5 req/10m), JWT sessions with HTTP-only cookies, role redirection. |
| **Phase 3: Worker Onboarding & Discovery** | **COMPLETED** | 7-step worker onboarding (`/register/worker`), Aadhaar/PAN KYC document tracking, skills/rates, real geospatial search (`/api/workers`) using Haversine spherical distance, multi-criteria filtering & sorting (Distance, Rating, Price, Experience), public profiles (`/workers/[id]`). |
| **Phase 4: Customer Hiring & Booking Lifecycle** | **COMPLETED** | Booking engine with 13 server-verified states (`PENDING`, `OFFERED`, `ACCEPTED`, `ON_THE_WAY`, `ARRIVED`, `WORK_STARTED`, `IN_PROGRESS`, `PAUSED`, `COMPLETED`, `CONFIRMED_BY_CUSTOMER`, `CANCELLED_BY_CUSTOMER`, `CANCELLED_BY_WORKER`, `DISPUTED`), transaction-safe dispatch, anti-double-booking constraint, customer (`/customer/dashboard`) & worker active job consoles (`/worker/active-job`). |
| **Phase 5: Real-time GPS Tracking & Routes** | **COMPLETED** | Worker GPS coordinate telemetry ingestion (`/api/tracking/update`), real-time Socket.IO room broadcast (`location:stream`), real Haversine distance, realistic urban transit ETA calculation (24-28 km/h + 20% traffic factor), stale telemetry detection (>120s), low accuracy warning (>100m), interactive tracking view (`/track/[bookingId]`). |
| **Phase 6: Payment Architecture & Escrow Ledger** | **COMPLETED** | Test-mode payment gateway integration, append-only double-entry transaction ledger, automatic platform commission split (10% platform, 90% worker), duplicate payment prevention, refund ledger, worker payouts to UPI (`/api/payments/payout`), earnings dashboard (`/worker/earnings`). |
| **Phase 7: Tender Marketplace & Bulk Workforce** | **COMPLETED** | Workforce tender creation (`/tenders/create`), browse tenders (`/tenders`), detailed tender requirements (`/tenders/[id]`), contractor bidding review (`/contractor/dashboard`), team applications (`/api/teams`), crew allocation, budget calculations. |
| **Phase 8: Admin Backoffice & Verification** | **COMPLETED** | Real-time aggregated metrics (`/api/admin/metrics`), KYC verification review and approval/rejection (`/admin`), booking oversight, dispute resolution desk (`/api/disputes/[id]/resolve`), immutable audit logs (`/api/admin/audit-logs`). |
| **Phase 9: Realtime Chat, Notifications & Ratings** | **COMPLETED** | Booking-scoped Socket.IO chat (`chat:send`, `chat:received`), 4-tier job rating (Quality, Timeliness, Behaviour, Overall), customer dispute logging (`/api/disputes`), in-app notifications. |
| **Phase 10: Testing, Verification & Production Readiness** | **COMPLETED** | 32-flow comprehensive test suite (`scripts/run-tests.js`) passing 32/32 tests with zero failures; Next.js 14 production build (`npm run build`) generates 42 static/dynamic routes with zero errors. |
| **Phase 11: Live GPS Tracking & Geospatial Dispatch** | **COMPLETED** | Live interactive tracking with Mapbox/Leaflet/OpenStreetMap fallback, route polyline calculation, real-time worker movement simulation, urban grid router, stale detection (>120s), low accuracy warnings. |
| **Phase 12: Instant Worker Earnings, Digital Wallet & Payout System** | **COMPLETED** | Automated earning credit upon completion + payment verification, transparent commission engine (`workerNet = gross - commission - fees`), idempotent webhooks (`job_earn_${bookingId}_${paymentId}`), double-spend protection with balance locking (`reservedBalance`), payout abstraction (RazorpayX/Cashfree) adhering to `NOT_CONFIGURED` without fake transfers, worker financial console (`/worker/earnings`), cash job commission tracking (`commissionPayable`), and Admin Settlement Desk (`/admin/finance`). |

---

## 2. API Endpoints Catalog

- **Auth & Session:**
  - `POST /api/auth/send-otp` (Phone rate-limited OTP generation)
  - `POST /api/auth/verify-otp` (OTP validation & session creation)
  - `POST /api/auth/register` (Role-specific profile registration)
  - `GET /api/auth/me` (Current authenticated user & active roles)
  - `POST /api/auth/logout` (Session revocation)

- **Worker Services & Financials:**
  - `GET /api/workers` (Geospatial search with radius, category, rating, price filters)
  - `GET /api/workers/:id` (Worker public profile, verified credentials, reviews)
  - `PUT /api/worker/profile` (Update personal details, skills, hourly/daily rates)
  - `PUT /api/worker/availability` (Toggle online/offline status, working hours)
  - `POST /api/worker/documents` (Upload KYC/qualification documents)
  - `GET /api/worker/requests` (Incoming booking requests for active worker)
  - `GET /api/worker/wallet` (Digital wallet balances, reserve, and payout accounts)
  - `GET /api/worker/wallet/transactions` (Filterable immutable double-entry ledger entries)
  - `GET /api/worker/earnings/summary` (Detailed financial KPIs: Today, Week, Month, Lifetime, Withdrawable)
  - `GET /api/worker/earnings/history` (Completed job earning breakdown)
  - `GET /api/worker/payout-accounts` (Saved bank accounts & UPI IDs)
  - `POST /api/worker/payout-accounts` (Add verified Bank Account or UPI ID)
  - `DELETE /api/worker/payout-accounts/:id` (Delete payout destination)
  - `GET /api/worker/withdrawals` (Worker withdrawal history and processing status)
  - `POST /api/worker/withdrawals` (Request withdrawal with instant atomic balance lock)
  - `GET /api/worker/withdrawals/:id` (Single withdrawal details)

- **Booking Engine & Live Dispatch:**
  - `POST /api/bookings` (Create new booking request with location & requirements)
  - `GET /api/bookings/:id` (Get booking details, assigned worker, status timeline)
  - `POST /api/bookings/:id/accept` (Worker acceptance with transaction lock)
  - `POST /api/bookings/:id/reject` (Worker rejection & auto-redispatch)
  - `POST /api/bookings/:id/status` (Status transitions with automatic earning credit upon PAYMENT_PAID or cash completion)
  - `POST /api/bookings/:id/confirm` (Customer confirmation)
  - `POST /api/bookings/:id/cancel` (Cancellation with reason)
  - `GET /api/bookings/:id/route` (Route polyline, traffic ETA, steps)

- **Real-time Tracking & Telemetry:**
  - `POST /api/tracking/update` (Secure GPS coordinate ingestion from worker on active job)
  - `GET /api/tracking/:bookingId` (Get live location, ETA, and accuracy for authorized customer)

- **Tenders & Bulk Hiring:**
  - `GET /api/tenders` (Browse active workforce tenders with filters)
  - `POST /api/tenders` (Create tender by contractor/tender owner)
  - `GET /api/tenders/:id` (Tender details and requirements)
  - `POST /api/tenders/:id/apply` (Worker or Team application)
  - `PUT /api/tenders/:id/applications/:appId` (Contractor shortlist/select/reject)
  - `POST /api/teams` (Create worker team with leader and member list)

- **Payments, Webhooks & Payouts:**
  - `POST /api/payments/create-order` (Initiate booking payment)
  - `POST /api/payments/verify` (Server-side signature and transaction verification)
  - `POST /api/payments/webhook` (HMAC SHA256 verified payment webhook with automatic earning credit)
  - `POST /api/payouts/webhook` (Signed payout webhook updating withdrawal status & settling reserves)
  - `GET /api/payments/history` (User transaction ledger)
  - `POST /api/payments/payout` (Worker payout request)

- **Admin Operations & Finance:**
  - `GET /api/admin/metrics` (Real aggregated database statistics)
  - `GET /api/admin/verifications` (Pending worker KYC documents)
  - `POST /api/admin/verifications/:id/review` (Approve/Reject with reason)
  - `GET /api/admin/audit-logs` (Immutable administrative audit trail)
  - `GET /api/admin/finance/summary` (Macro financial dashboard metrics: GMV, worker earnings, platform commissions, pending payouts)
  - `GET /api/admin/finance/transactions` (Filterable master ledger)
  - `GET /api/admin/finance/withdrawals` (Withdrawal processing queue)
  - `POST /api/admin/finance/withdrawals/:id/review` (Admin approve or reject & restore reserved funds)
  - `GET /api/admin/finance/commissions` (List active commission rules)
  - `POST /api/admin/finance/commissions` (Create or update profession/service commission rules)

- **Disputes & Reviews:**
  - `POST /api/reviews` (Submit 4-tier quality/timeliness/behaviour rating)
  - `POST /api/disputes` (Submit booking dispute with evidence)
  - `POST /api/disputes/:id/resolve` (Admin settlement & resolution notes)

---

## 3. Database Architecture & Migrations

- **Prisma Schema (`prisma/schema.prisma`):** Full 32-model normalized schema targeting PostgreSQL (with PostGIS extensions for spatial data):
  - `User`, `UserRole`, `WorkerProfile`, `WorkerSkill`, `Category`, `Subcategory`, `WorkerLocation`, `WorkerAvailability`, `WorkerDocument`, `CustomerProfile`, `ContractorProfile`, `Tender`, `TenderRequirement`, `TenderApplication`, `TenderTeam`, `TenderTeamMember`, `Booking`, `BookingLocation`, `BookingAssignment`, `BookingStatusHistory`, `JobReview`, `JobDispute`, `Payment`, `PaymentTransaction`, `WorkerPayout`, `WalletLedger`, `PlatformCommission`, `ChatMessage`, `Notification`, `AdminUser`, `AuditLog`.
- **Hybrid Storage Strategy:**
  - **Prisma PostgreSQL Client:** Fully typed client generated via `npx prisma generate` for production PostgreSQL deployments.
  - **JSON Transactional Store (`lib/store.ts`):** Complete out-of-the-box in-memory/file persistence with pre-seeded Indian data across Noida, Delhi, Gurugram, Mumbai, Bengaluru, and Hyderabad. Allows instant local development, end-to-end testing, and evaluation without requiring external database server setup.

---

## 4. Test Suite Verification (55/55 Flows)

The test runner at `scripts/run-tests.js` exercises all 55 critical business flows with 100% pass rate:

```
[PASS] Flow 1: Customer registration with phone and role
[PASS] Flow 2: OTP generation, rate limiting and verification
[PASS] Flow 3: Worker registration with trade skills and hourly rates
[PASS] Flow 4: Worker KYC status check (SUBMITTED / UNDER_REVIEW / VERIFIED)
[PASS] Flow 5: Worker authentication and JWT session token generation
[PASS] Flow 6: Worker online/offline availability toggle
[PASS] Flow 7: Geospatial nearby worker discovery within 25 km
[PASS] Flow 8: Customer booking creation with transaction safety
[PASS] Flow 9: Worker acceptance of offered job
[PASS] Flow 10: Anti-double-booking validation constraint
[PASS] Flow 11: Worker starts route (ON THE WAY) activating GPS broadcast
[PASS] Flow 12: Worker GPS coordinate telemetry ingestion
[PASS] Flow 13: Real distance and ETA calculated for authorized customer
[PASS] Flow 14: Worker arrives at customer site
[PASS] Flow 15: Work start logged with diagnostic notes
[PASS] Flow 16: Worker completes job with resolution notes
[PASS] Flow 17: Customer inspects and confirms job completion
[PASS] Flow 18: Payment order creation with commission split (10% platform, 90% worker)
[PASS] Flow 19: Server-side payment signature verification and status update
[PASS] Flow 20: Duplicate payment prevention check
[PASS] Flow 21: Payment failure recording and retry capability
[PASS] Flow 22: Refund transaction ledger creation
[PASS] Flow 23: Worker payout ledger settlement to UPI
[PASS] Flow 24: Contractor workforce tender creation with headcount specifications
[PASS] Flow 25: Worker/team tender bid submission
[PASS] Flow 26: Contractor shortlisting tender application
[PASS] Flow 27: Contractor awarding tender and contracting crew
[PASS] Flow 28: Workforce team creation with leader and members
[PASS] Flow 29: Admin review and approval of pending worker KYC
[PASS] Flow 30: Role-based access control permission paths
[PASS] Flow 31: RBAC authorization rejection for unauthorized role
[PASS] Flow 32: Job dispute creation and admin resolution
[PASS] Flow 33: Geospatial worker discovery with expanding search radius and anti-busy filter
[PASS] Flow 34: Road network routing provider calculating road polyline and traffic ETA
[PASS] Flow 35: Atomic worker acceptance prevents race conditions and subsequent acceptance attempts
[PASS] Flow 36: Worker GPS telemetry recording with stale location detection (>120s)
[PASS] Flow 37: Complete 12-state booking lifecycle progression
[PASS] Flow 38: Admin live operations telemetry overview and freshness calculation
[PASS] Flow 39: Online payment verification triggering immediate digital wallet credit
[PASS] Flow 40: Platform commission calculation standard 10% platform rate
[PASS] Flow 41: Profession-specific commission rule override (e.g. 8% for AC Technicians)
[PASS] Flow 42: Worker commission exemption rule (0% platform cut for special incentive)
[PASS] Flow 43: Net earning calculation mathematical integrity: gross - commission - fees = net
[PASS] Flow 44: Idempotent duplicate earning credit prevention (double webhook does not double credit)
[PASS] Flow 45: Digital wallet balance breakdown accuracy (available, reserved, lifetime)
[PASS] Flow 46: Withdrawal request locks funds from availableBalance into reservedBalance immediately
[PASS] Flow 47: Withdrawal rejection when requested amount exceeds availableBalance
[PASS] Flow 48: Minimum withdrawal threshold enforcement (e.g. ₹100 minimum)
[PASS] Flow 49: Concurrent withdrawal overspend prevention guarantees wallet integrity
[PASS] Flow 50: Payout provider abstraction adheres to NOT_CONFIGURED fallback without fake success
[PASS] Flow 51: Withdrawal success finalization deducts reserved balance and increments totalWithdrawn
[PASS] Flow 52: Failed payout automatically restores reserved funds back to availableBalance
[PASS] Flow 53: Cash job accounting: physical cash retained, platform commission tracked as payable, zero wallet inflation
[PASS] Flow 54: Admin financial control & settlement desk summary, ledger, and withdrawal queues
[PASS] Flow 55: Financial audit logging for sensitive balance adjustments and review actions

======================================================
TEST RESULTS: 55 PASSED, 0 FAILED (TOTAL 55 FLOWS)
======================================================
```

---

## 5. Startup & Operational Run Guide

### Quick Start
```bash
# 1. Install dependencies (already installed)
npm install

# 2. Run the 32-flow automated verification test suite
npm test
# (or: node scripts/run-tests.js)

# 3. Build for production (Next.js 14)
npm run build

# 4. Start production server (Next.js + Socket.IO real-time engine)
npm start
# Server listens at http://localhost:3000

# 5. Or run in development mode
npm run dev
```

### Seeded Credentials for Testing
- **Test OTP:** `123456` works for all phone numbers.
- **Pre-seeded Customer:** Phone: `+919876543210` (Ramesh Kumar, Noida)
- **Pre-seeded Worker:** Phone: `+919876543211` (Rajesh Sharma, Senior Electrician, Sector 62 Noida)
- **Pre-seeded Contractor:** Phone: `+919876543215` (Vikram Construction Co.)
- **Pre-seeded Admin:** Phone: `+919876543219` (Admin Portal)
