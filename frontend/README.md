# HVTP Frontend

The frontend is built with Next.js (App Router), React, and TypeScript, and
styled with Tailwind CSS. It serves both the admin dashboard and the public
inventory listing.

## Getting Started

Copy `.env.template` to `.env.local` and fill in the Firebase web config from
the Firebase console, along with `NEXT_PUBLIC_API_URL` (`http://localhost:8000`
for local development). All values are `NEXT_PUBLIC_*`, so they're embedded in
the client bundle — none of them are secrets.

Then run:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The backend must be
running as well, since every page fetches its data from the API.

## Calling the API

All requests go through [`src/api/APIWrapper.ts`](./src/api/APIWrapper.ts),
which attaches the current user's Firebase ID token, unwraps the backend's
`{ success, data }` envelope, and throws on failure. Pass `token: null` to
skip authentication for public endpoints.

Pages fetch with [SWR](https://swr.vercel.app/) so revisiting a page renders
from cache while revalidating in the background. After a mutation, call the
`mutate` function returned by that page's `useSWR` to refresh immediately.

## Route protection

[`src/middleware.ts`](./src/middleware.ts) gates the admin routes. It reads the
Firebase ID token from a `session` cookie and verifies its signature and expiry
against Google's public keys using `jose` — the Admin SDK can't run there,
since middleware executes on the Edge runtime. An invalid or expired token
redirects to `/login`.

The cookie itself is managed in [`src/lib/session.ts`](./src/lib/session.ts) and
kept fresh by `AuthContext`, which writes the new token whenever Firebase
refreshes it. Set it only through that helper, so its flags and lifetime stay in
sync with what the middleware expects.

This is a first line of defense, not the security boundary — the backend
independently verifies the token on every request.
