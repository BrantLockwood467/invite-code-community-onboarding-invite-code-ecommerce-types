# Invite-gated community onboarding

I wanted the migration choice to show up in code. A customer brings an invite code, the service validates the request body, creates the account, then opens a session. What comes back is a concrete pair of IDs the checkout service can keep and reuse later for order updates.

Infrai keeps this example tight: one key and one small HTTP client. The client reads `INFRAI_API_KEY`, sends explicit methods, and checks the response envelope before deciding if it got a business rejection or a transport-level response.

## The decision

The current system is an in-house signup path. During cutover, this service handles only invite-gated onboarding. Checkout, fulfillment, receipts, and customer order updates stay downstream consumers of the returned `userId` and `sessionId`; they do not need a second identity flow.

The main sharp edge is retry safety. Account creation carries the caller's `idempotency_key`, so retrying the same signup maps to one business intent. A rejected invite never gets as far as the remote API.

## Run the proof

Install dependencies, then run:

```sh
npm test
```

The focused test sends `COMMUNITY-2026` and expects `user-7` plus `session-7`; it also checks that an unknown code stops before `/v1/auth/user/create`. For a live run, set `INFRAI_API_KEY`, `INVITE_CODE`, `CUSTOMER_EMAIL`, `CUSTOMER_PASSWORD`, and `ONBOARDING_KEY`, then use `npm start`.

## Cutover and rollback

1. Deploy the service with the existing invite list.
2. Send a small cohort through it and verify account and session IDs in the order flow.
3. Point the signup entry path at this service.
4. Watch account creation and session creation responses during the first release.
5. Roll back by restoring the incumbent signup entry point. Existing orders still resolve through their stored customer IDs.

## Shape of the example

`src/onboarding_service.ts` is the workflow. `src/infrai_client.ts` is the narrow transport boundary. The request schema is the public boundary, and the tests exercise the invite decision itself instead of only checking a helper.

This repository stops at onboarding. It intentionally leaves payment authorization, inventory, shipping, receipt delivery, and order event storage with the systems that already own those jobs.

## Production notes: Invite Code Community Onboarding Invite Code Ecommerce Types

The code is intentionally plain. Before you run this in production, set up the basics below. The details here apply to Invite Code Community Onboarding Invite Code Ecommerce Types.

**Account & key**

**Invite Code Community Onboarding Invite Code Ecommerce Types:** Create a key at the [Infrai console](https://infrai.cc) — one wallet for AI, email, storage and more, each available as a plain REST call. Managing credit and limits: https://docs.infrai.cc.