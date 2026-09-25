# 6ixwave Booking: participant web app (Sound Wave: The Ember Prelude)

User-facing frontend for **SOUND WAVE: The Ember Prelude** (AMG presents, with 6ixwave Entertainment; 31st October, 8PM, Jinos Lounge/Club): register, get a QR code, pay, and look your registration up later.

**This repo is frontend only.** There is no backend, admin/staff dashboard, scanner app, auth, or real Paystack integration here. All data currently comes from a browser-side mock (see below).

Stack: Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 (no `tailwind.config`) · shadcn/ui · `motion` (UI animation + parallax) · a hand-written WebGL shader (the club hero) · `qrcode`.

```bash
bun install
bun dev          # http://localhost:3000
bun run build && bun start
```

## Before going live

1. **Event details and prices:** everything is in [lib/event.ts](lib/event.ts), taken from the flyer and the organizers: Regular ₦7,000, VIP ₦10,000, a **group of 5** (Regular ₦35,000 / VIP ₦50,000) and **tables** at ₦100k / ₦150k / ₦200k / ₦250k / ₦300k. **Wave 1** (25 September to 18 October) is announced; Wave 2 prices and dates are not, so add them to `waves` in [lib/event.ts](lib/event.ts) before 18 October, and assumed the current prices are the Wave 1 prices. Assumptions still to confirm: a group costs 5 × the single price (no discount); **each person in a group gets their own QR code** (the scanner marks each code used, so one shared code would admit only one person); a table is **one** QR code (if a table admits a set number of people, change its `admits` and every guest gets a code); the year (inferred as 2026); the `knowBeforeYouGo` copy (including "pay at the gate"); and the registration-number prefix (`referencePrefix`, currently `WAVE`, so numbers look like `WAVE-83921`; the backend must issue the same prefix).
2. **Connect the backend:** see below.
3. Delete `lib/api/mock/` and `components/payment/mock-checkout-sheet.tsx`.

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Landing page |
| `/register` | Registration form |
| `/registration/[id]/success` | Shown right after registering: QR + PENDING |
| `/registration/[id]` | Status page: payment status, QR, event details |
| `/payment/[id]` | Pay screen. Also handles a `?reference=` return from a hosted checkout |
| `/lookup` | Find a registration by registration ID + phone |

`[id]` is an opaque backend ID, **not** the `WAVE-12345` number (that is short and guessable, so it is only a display value and a lookup credential together with the phone number).

## Connecting the ASP.NET Core backend

All network access goes through two files; each function maps to one endpoint and has the real `apiFetch` call written beside it:

- [lib/api/registrations.ts](lib/api/registrations.ts): `POST /api/registrations`, `GET /api/registrations/lookup`, `GET /api/registrations/:id`, `GET /api/registrations/:id/qr`
- [lib/api/payments.ts](lib/api/payments.ts): `POST /api/payments/initialize`, `GET /api/payments/:reference`

Set `NEXT_PUBLIC_API_BASE_URL`, swap the mock call for the `apiFetch` line, and the types in [types/](types/) describe what the backend should return. Notes for the backend:

- **What was bought:** `POST /api/registrations` takes `optionId` (one of `regular`, `vip`, `regular-group`, `vip-group`, `table-100k`, `table-150k`, `table-200k`, `table-250k`, `table-300k`) plus `fullName`, `phone`, `email`; the registration response echoes `optionId`. The prices shown in the UI come from [lib/event.ts](lib/event.ts), but the **backend must own the price per option** and use it for `POST /api/payments/initialize` (whose `amount` the UI shows in checkout). Never trust an amount sent from the browser.
- **Waves:** the site only *displays* the current wave ("Wave 1 · on sale until 18 October", from `waves` in [lib/event.ts](lib/event.ts), in Nigerian time, refreshed hourly). The **backend must own the sale windows and per-wave prices**, and reject or reprice a purchase outside them; the browser never decides.
- **One QR per person:** `GET /api/registrations/:id/qr` returns `{ registrationId, tokens: string[] }`: one opaque token for a ticket or table, five for a group of 5. One payment covers the whole registration and activates all its codes together; the scanner marks each code used individually.
- The registration response carries a **`displayName`** already shortened (e.g. "George O."); the UI never needs the full name, phone or email again.
- The QR token is an **opaque, unpredictable string** from `GET …/qr`, rendered as-is. Nothing else is ever encoded in it.
- Payment status shown in the UI is only what the backend reports. The frontend never marks anything paid itself.
- Lookup requires **both** registration ID and phone (E.164), and should return the same "not found" for either being wrong.

### Paystack

The only file that changes is [components/payment/checkout-surface.tsx](components/payment/checkout-surface.tsx). Redirect to `authorizationUrl` (set the backend callback to `/payment/<id>`, which verifies `?reference=` on load) or use the inline popup. Everything after that (polling `GET /api/payments/:reference`, success/failed/cancelled screens) already works. **No Paystack keys belong in this repo.**

## Trying the mock

Data lives in `localStorage` (key `soundwave:mock-db:v3`); clear it to reset.

| Do this | To see |
| --- | --- |
| Look up `WAVE-83921` + `08012345678` | A **paid VIP** registration |
| Look up `WAVE-40417` + `08098765432` | A **pending Regular** registration you can pay for (₦7,000) |
| Look up `WAVE-77015` + `08055556666` | A **pending Regular group of 5** with five QR codes (₦35,000) |
| Look up `WAVE-62208` + `08033334444` | A **paid ₦150k table** |
| Register with an email starting `error@` | Registration server error |
| Look up `WAVE-00000` | Lookup server error |
| Pay, then choose an outcome in the demo checkout | Success / failed / cancelled (success takes ~2.5s to "confirm", like a real webhook) |

## Structure

```
app/          routes (server components; interactivity lives in components/)
components/   event/ registration/ payment/ qr/ feedback/ club/ illustrations/ layout/ motion/ ui/ (shadcn)
hooks/        use-resource, use-registration, use-payment-flow (state machine)
lib/          api/ (+ mock/), club/, qr/, validation/, event.ts, format.ts
types/        Registration, payment and event types
```

## Brand assets

The logos were extracted from the supplied images (background removed) and traced to vector, so they're crisp at any size. They're used in white on the dark UI:

- [public/brand/6ixwave-wordmark-white.svg](public/brand/6ixwave-wordmark-white.svg): header
- [public/brand/all-mask-gang-white.svg](public/brand/all-mask-gang-white.svg): footer (All Mask Gang)
- [app/icon.svg](app/icon.svg), [app/favicon.ico](app/favicon.ico), [app/apple-icon.png](app/apple-icon.png): favicon set, a white "6IX" on a black tile (the full wordmark is too wide to read at tab size)

If a higher-resolution or vector original exists, swap it into those files; it would be sharper than this trace of a screenshot.

## Look and feel

Taken from the flyer: near-black, its red, ember orange and a cream brush-script subtitle, with a heavy poster typeface for the title (tokens in [app/globals.css](app/globals.css)). **No purple** (red and blue light mix into purple, so the light effects stay red / ember / warm white). Chunky tactile buttons and dark "sticker" cards (`card-pop`). No illustrations of people except the abstract crowd silhouette. The QR itself is always black on plain white so it scans reliably.

## The club hero

The landing hero is a WebGL scene drawn per pixel by one fragment shader, with no 3D engine: sweeping red/ember laser beams through haze, a rotating mirror-tile disco ball, rising embers on three depths (each moving at its own parallax rate on scroll and mouse), drifting light spots, and a bass-hit shockwave where you tap. A crowd silhouette on its own faster layer sits in front, and the beat is a gentle brightness swell, never a strobe.

What a device gets is decided **before any of its code is downloaded**:

| Tier | Who | What runs |
| --- | --- | --- |
| `full` | Desktops | Full detail (7 beams, 3 ember layers, 22 light spots), mouse parallax and beam sway, drawn at CSS-pixel resolution |
| `lite` | Phones, tablets, ≤2 GB devices | 4 beams, 2 ember layers, 10 light spots, reduced resolution, ~30 fps cap |
| `none` | Data Saver, no WebGL, ~1 GB devices | Static poster with CSS beams |

Both live tiers adapt their resolution to frame time, stop rendering when the hero is off-screen or the tab is hidden, and give reduced-motion users one still frame.

| Piece | File |
| --- | --- |
| The shader | [lib/club/shader.ts](lib/club/shader.ts) |
| Renderer (raw WebGL, adaptive quality) | [lib/club/renderer.ts](lib/club/renderer.ts) |
| Tier choice, lifecycle, pausing | [components/club/club-canvas.tsx](components/club/club-canvas.tsx) |
| Parallax layers | [components/event/hero-stage.tsx](components/event/hero-stage.tsx) |
| Crowd, CSS beams, equalizer, poster | [components/illustrations/](components/illustrations/) |

Other sections use lighter scroll parallax ([Parallax](components/motion/parallax.tsx)). Type and spacing scale down on small phones via a fluid root font size in [app/globals.css](app/globals.css) (16px at ~390px wide, 14px floor).

## Deploy to Render

[render.yaml](render.yaml) is a Blueprint for a Node web service. Render installs Bun automatically because `bun.lock` is in the repo root ([.bun-version](.bun-version) pins it; [.node-version](.node-version) pins Node).

1. Push this repo to GitHub or GitLab.
2. In Render: **New + → Blueprint**, pick the repo, and apply. (Or **New + → Web Service** with build `bun install --frozen-lockfile && bun run build`, start `bun run start`, health check path `/`.)
3. Render injects `PORT`; `next start` uses it and listens on all interfaces, so nothing else is needed.

Notes:
- **Free instances sleep after 15 minutes without traffic** and take about a minute to wake. Use a paid instance (e.g. Starter) for the event day, or warm the site up beforehand.
- **Right now this deploys the mock.** Registrations and payments live only in each visitor's own browser (`localStorage`). Nothing is shared between visitors, and nobody at the organizers' end can see anything, so it's a demo, not something to run the event on. The real event needs the ASP.NET backend (see "Connecting the ASP.NET Core backend").
- When the API exists, set `NEXT_PUBLIC_API_BASE_URL` in Render's environment settings. Never put secrets (Paystack keys included) in `NEXT_PUBLIC_*` variables.

## Animation

Above-the-fold entrances are CSS ([Reveal](components/motion/reveal.tsx)) so they play without waiting for JavaScript. Scroll reveals and state changes use `motion` through `LazyMotion` (small bundle). `prefers-reduced-motion` is honored globally.
