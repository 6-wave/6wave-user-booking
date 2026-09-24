# 6wave Booking: participant web app (Pool Party 2026)

User-facing frontend for the **Pool Party 2026** registration system (an adults-only, after-dark pool party): register, get a QR code, pay, and look your registration up later. Full product brief: [PROJECT_DESCRIPTION.md](PROJECT_DESCRIPTION.md).

**This repo is frontend only.** There is no backend, admin/staff dashboard, scanner app, auth, or real Paystack integration here. All data currently comes from a browser-side mock (see below).

Stack: Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 (no `tailwind.config`) · shadcn/ui · `motion` (UI animation + parallax) · `three` (3D water hero, lazy-loaded) · `qrcode`.

```bash
bun install
bun dev          # http://localhost:3000
bun run build && bun start
```

## Before going live

1. **Event details:** edit [lib/event.ts](lib/event.ts). Date, time and venue are currently "to be announced" placeholders. Also confirm with the organizers: the **"18+ only"** badge (`ageNote`), the `knowBeforeYouGo` copy (including "pay at the gate"), and the registration-number prefix (`referencePrefix`, currently `POOL`, so numbers look like `POOL-83921`; the backend must issue the same prefix).
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

`[id]` is an opaque backend ID, **not** the `POOL-12345` number (that is short and guessable, so it is only a display value and a lookup credential together with the phone number).

## Connecting the ASP.NET Core backend

All network access goes through two files; each function maps to one endpoint and has the real `apiFetch` call written beside it:

- [lib/api/registrations.ts](lib/api/registrations.ts): `POST /api/registrations`, `GET /api/registrations/lookup`, `GET /api/registrations/:id`, `GET /api/registrations/:id/qr`
- [lib/api/payments.ts](lib/api/payments.ts): `POST /api/payments/initialize`, `GET /api/payments/:reference`

Set `NEXT_PUBLIC_API_BASE_URL`, swap the mock call for the `apiFetch` line, and the types in [types/](types/) describe what the backend should return. Notes for the backend:

- The registration response carries a **`displayName`** already shortened (e.g. "George O."); the UI never needs the full name, phone or email again.
- The QR token is an **opaque, unpredictable string** from `GET …/qr`, rendered as-is. Nothing else is ever encoded in it.
- Payment status shown in the UI is only what the backend reports. The frontend never marks anything paid itself.
- Lookup requires **both** registration ID and phone (E.164), and should return the same "not found" for either being wrong.

### Paystack

The only file that changes is [components/payment/checkout-surface.tsx](components/payment/checkout-surface.tsx). Redirect to `authorizationUrl` (set the backend callback to `/payment/<id>`, which verifies `?reference=` on load) or use the inline popup. Everything after that (polling `GET /api/payments/:reference`, success/failed/cancelled screens) already works. **No Paystack keys belong in this repo.**

## Trying the mock

Data lives in `localStorage` (key `pool2026:mock-db:v1`); clear it to reset.

| Do this | To see |
| --- | --- |
| Look up `POOL-83921` + `08012345678` | A **paid** registration |
| Look up `POOL-40417` + `08098765432` | A **pending** registration you can pay for |
| Register with an email starting `error@` | Registration server error |
| Look up `POOL-00000` | Lookup server error |
| Pay, then choose an outcome in the demo checkout | Success / failed / cancelled (success takes ~2.5s to "confirm", like a real webhook) |

## Structure

```
app/          routes (server components; interactivity lives in components/)
components/   event/ registration/ payment/ qr/ feedback/ illustrations/ layout/ motion/ ui/ (shadcn)
hooks/        use-resource, use-registration, use-payment-flow (state machine)
lib/          api/ (+ mock/), qr/, validation/, event.ts, format.ts
types/        Registration, payment and event types
```

## Look and feel

Sun-drenched tropical pool party, taken from the owner's reference posters: turquoise water, mustard-gold and sunshine-yellow type, watermelon coral, palm green, cream (tokens in [app/globals.css](app/globals.css)). **No purple.** Chunky tactile buttons and "sticker" cards (`card-pop`). Copy is suggestive but never explicit, and there are no illustrations of people. The QR itself is always black on plain white so it scans reliably.

## The water hero: two tiers

The landing hero is real-time WebGL water (waves, caustics, sun glints, tap/hover ripples, scroll parallax). What a device gets is decided **before any water code is downloaded**:

| Tier | Who | What runs | JS cost |
| --- | --- | --- | --- |
| `full` | Desktops | three.js scene: displaced wave mesh, lit 3D yellow ring, coral ring and beach ball riding the waves, mouse-driven camera sway | ~133 KB gzipped, lazy |
| `lite` | Phones, tablets, ≤2 GB devices | Hand-written WebGL shader (one full-screen triangle, no engine, no mesh, no lights), ~30 fps cap, reduced resolution that adapts to frame time. Ring, coral ring and beach ball are light animated SVG on a parallax layer | ~5 KB, lazy |
| `none` | Data Saver, no WebGL, ~1 GB devices | Static poster with the same SVG floaters | 0 |

On both live tiers rendering stops when the hero is off-screen or the tab is hidden, and people with reduced-motion get one still frame.

| Piece | File |
| --- | --- |
| Wave definition (shared by GLSL and JS) | [lib/water/waves.ts](lib/water/waves.ts) |
| Shared water look + both shaders | [lib/water/shaders.ts](lib/water/shaders.ts) |
| `full` tier (three.js) | [lib/water/scene.ts](lib/water/scene.ts) |
| `lite` tier (raw WebGL) | [lib/water/lite.ts](lib/water/lite.ts) |
| Tier choice, lifecycle, pausing | [components/water/water-canvas.tsx](components/water/water-canvas.tsx) |
| Parallax layers (sun, water, floaters, palms, waves) | [components/event/hero-stage.tsx](components/event/hero-stage.tsx) |

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
