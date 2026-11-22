# DigiWork (Android)

Native Kotlin + Jetpack Compose (Material 3) workforce marketplace and service dispatch application rewritten from the Next.js DigiWork (`KAAMSETU`) platform.

## Core Features Preserved

- **Multi-Role Workspace Login & Switcher**: Sign in with `+91` mobile numbers or switch instantly across **Hiring Partner (Customer)**, **Worker Fleet**, **Contractor**, and **Super Admin** workspaces.
- **Discovery & 12-Trade Bilingual Catalogue (`Home`)**: Search tradespeople by skill or city, inspect bilingual profession rate cards, required tools, and certifications, launch **Urgent 25-Min Dispatch**, and browse nearby Aadhaar-verified specialists with Haversine distance & ETA estimates.
- **Customer Booking Lifecycle (`Bookings`)**: Create service requests with optional Urgent 30-Min priority (+₹149), hours selector, and transparent **₹99 DigiWork Platform Fee** breakdown; track 7-step progress with a live GPS route visualizer, confirm completion & pay, submit 3-tier worker reviews, or raise disputes.
- **Worker Operations & Digital Wallet (`Worker`)**: Toggle online/offline availability, step active jobs (`Accepted` → `On The Way` → `Arrived` → `Work Started` → `Completed` with inspection/completion notes), accept/decline requests with 1-job anti-double-booking enforcement, manage Bank/UPI payout accounts, request withdrawals (min ₹100 with atomic `reservedBalance` locking), and inspect the wallet transaction ledger.
- **Bulk Tenders & Contractor Console (`Tenders`)**: Browse open workforce tenders, submit crew/individual bids, publish new contractor project tenders, and shortlist, contract, or reject incoming bids.
- **Super Admin Control Room (`Admin`)**: Review worker KYC approvals/rejections, settle withdrawal requests with UTR references (or reject & refund `reservedBalance`), audit the ₹99 platform fee ledger, and resolve disputes.

## Local Persistence & Stubbed Services

- Application state is persisted locally on-device using JSON storage (`digiwork_store_v1.json`), replacing the original MongoDB/Prisma backend, Socket.IO real-time server, and Razorpay/SMS gateway integrations for standalone offline Android execution.

## Build & Stack

- **Language**: Kotlin 2.2
- **UI**: Jetpack Compose + Material Design 3 + Edge-to-Edge adaptive `NavigationBar` / `NavigationRail`
- **Build System**: Gradle Kotlin DSL (AGP 9.1.1, `compileSdk = 36`, `minSdk = 24`)
