# ONE: INSEPARABLE (Monorepo MVP)

A mobile-first couples app with **Faith Mode ON by default (optional)**, daily anchors (3–7 min), Scripture Vault, real-time “tension today” repair flow, thought-redirection battle packs, stickers, streaks/rewards, and subscriptions/donations.

This repo contains:
- **apps/web**: Next.js web app (PWA-ready)
- **apps/server**: Node/Express API + Prisma DB + billing webhooks
- **apps/mobile**: Expo React Native app (IAP scaffold)

## Quick start (local)

### 1) Prereqs
- Node 20+
- npm (or pnpm)  
- (Optional) Docker for Postgres

### 2) Install
```bash
npm install
```

### 3) Env
Copy env example files:
```bash
copy apps\server\.env.example apps\server\.env
copy apps\web\.env.example apps\web\.env
copy apps\mobile\.env.example apps\mobile\.env
```

Defaults use SQLite for the DB (self-contained). To use Postgres, set `DATABASE_URL` accordingly.

### 4) DB migrate + seed
```bash
npm run db:migrate
npm run db:seed
```

### 5) Run (dev)
```bash
npm run dev
```

- Web: http://localhost:3000
- Server: http://localhost:4000
- Swagger-ish health: http://localhost:4000/health

## Stripe + Donations + “International payment methods”
This MVP uses **Stripe Checkout** with `automatic_payment_methods` enabled, so Stripe can show eligible payment methods for a customer automatically (cards + wallets + local methods, depending on country/currency and your dashboard settings). See Stripe docs: payment methods overview and country support tables.

- Server endpoints:
  - `POST /api/billing/create-checkout-session` (subscription)
  - `POST /api/billing/create-donation-session` (one-time or monthly)
  - `POST /api/billing/webhook` (Stripe webhook)

You must configure Stripe products/prices and set env vars.

## IAP (Mobile)
Mobile app includes a **RevenueCat**-based IAP scaffold (recommended path for iOS/Android subscriptions).
- Set `EXPO_PUBLIC_REVENUECAT_API_KEY` and product identifiers.
- The app includes a `Purchase` screen that you can finish wiring to your store listings.

## CI
GitHub Actions workflow:
- installs dependencies
- runs typecheck/lint
- runs prisma generate
- builds web + server

## Store Launch (Checklist)
See `docs/store-launch.md`.

---

**Design source:** This MVP implements the app structure and flows from the provided design docs (Faith Mode default + tabs + anchors + triggers + Scripture Vault + subscription/donation model).
