# Mobile IAP (Scaffold)

Recommended approach: RevenueCat handles StoreKit / Google Billing and subscription status.

What to do:
1) Create subscription products in App Store Connect / Play Console.
2) Mirror product IDs in RevenueCat.
3) Set:
   - EXPO_PUBLIC_REVENUECAT_API_KEY
   - EXPO_PUBLIC_IAP_PRODUCT_MONTHLY

Then, wire the purchase screen (not included yet) to call RevenueCat purchase APIs.

This repo also includes Stripe for web subscriptions; you can decide whether to unify entitlement logic later.
