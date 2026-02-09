# Store Launch Checklist (MVP)

## Web (PWA)
- [ ] Set `manifest.json` and icons
- [ ] Add `apple-touch-icon` and `theme-color`
- [ ] Enable HTTPS on hosting
- [ ] Test install on iOS Safari + Android Chrome
- [ ] Configure domain + privacy policy + terms

## iOS / Android
This repo includes an Expo app with IAP scaffold (RevenueCat).
- [ ] Create Apple Developer + Google Play accounts
- [ ] Set bundle identifiers
- [ ] Configure IAP products (subscriptions) in App Store Connect / Play Console
- [ ] Mirror product IDs in RevenueCat
- [ ] Build with EAS and upload
- [ ] Fill store listing: screenshots, description, keywords
- [ ] Add privacy policy URL

## Payments
- [ ] Stripe account + products/prices
- [ ] Enable payment methods in Stripe Dashboard for target markets
- [ ] Configure webhook endpoint + secret
- [ ] Verify subscription status sync in DB
- [ ] Verify donation flows

## Ops
- [ ] Set `DATABASE_URL` (Postgres recommended in production)
- [ ] Configure email provider (Resend) for nudges
- [ ] Create admin user (optional)
- [ ] Run cron pings for `/api/cron/daily` and `/api/cron/drift`
