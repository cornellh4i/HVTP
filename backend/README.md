# HVTP Backend

The backend is built with TypeScript and Express, with Cloud Firestore as the
database. It is containerized with Docker and deployed to DigitalOcean.

## Backend Layers

The backend follows the MVC pattern and can be divided into three layers:

- **Routes** — files in [`src/routes`](./src/routes), one per entity.

  Each file maps an HTTP verb and path to a controller function. Routers are
  mounted under `/api` in [`src/index.ts`](./src/index.ts), which is also
  where authentication and CORS are applied to every request.

- **Controllers** — files in [`src/controllers`](./src/controllers).

  This is where the logic lives. A controller parses the request, performs
  the Firestore read or write, invalidates any cache the write affects, and
  shapes the response. Responses always go through `successJson` or
  `errorJson` from [`src/utils/jsonResponses.ts`](./src/utils/jsonResponses.ts),
  so every endpoint returns `{ success, data }` or `{ success, error }`.

- **Models** — files in [`src/models`](./src/models).

  Unlike Mongoose models, these are only TypeScript types — they describe
  the shape of documents in each collection and can't query anything.
  Firestore access happens in the controllers via `getDb()`.

One exception: [`src/services/dashboardMetrics.ts`](./src/services/dashboardMetrics.ts)
holds the dashboard's aggregation logic, which was too large to leave in a
controller. It's the only service.

Example: fetching the item list.

1. In the routes layer, [`routes/items.ts`](./src/routes/items.ts) maps
   `GET /api/getAllItems` to the `getAllItems` controller. Before it runs,
   the middleware in [`index.ts`](./src/index.ts) verifies the caller's
   Firebase ID token.

2. In the controller layer, [`controllers/items.ts`](./src/controllers/items.ts)
   wraps the Firestore read in `getOrSetCache`. On a cache hit it returns
   immediately; otherwise it reads the `items` collection and caches the
   result for 60 seconds.

3. Writes like `updateItem` call `invalidateItemCaches()` after the update,
   so the next read reflects the change instead of waiting out the TTL.

## Authentication

Authentication uses Firebase Auth. The frontend sends an ID token as
`Authorization: Bearer <token>`, and the middleware in
[`src/middleware/middleware.ts`](./src/middleware/middleware.ts) verifies it.

Auth is **deny-by-default**: a single middleware in
[`index.ts`](./src/index.ts) protects everything under `/api`, and a route is
public only if it's listed in `PUBLIC_API_PATHS`. Today that's just
`/public/items`, which backs the public inventory listing. If you add a route
that should be reachable without logging in, add it to that list — otherwise
it's protected automatically.

Note that there are no roles or permissions beyond this. Any authenticated
user can call any endpoint.

## Caching

[`src/utils/cache.ts`](./src/utils/cache.ts) is a simple in-memory TTL cache
used by the item, sales, and dashboard read endpoints. Keys and the 60-second
default TTL live in [`src/utils/cacheKeys.ts`](./src/utils/cacheKeys.ts).

Two things to keep in mind:

- **If you add a write that touches items or sales, invalidate the cache**
  by calling `invalidateItemCaches()` or `invalidateSaleCaches()`. Forgetting
  is silent — the data is just stale for up to a minute.
- **The cache is per-process**, so the backend must run as a single instance.
  With more than one, a write handled by one instance won't invalidate the
  others.

## Getting Started

Copy `.envtemplate` to `.env` and fill in the Firebase service account
values. `FIREBASE_PRIVATE_KEY` must stay on one line with its `\n` escapes
intact — a real multi-line key won't parse.

Then run:

```bash
npm install
npm run dev
```

The server starts on port 8000. API documentation is served at `/api-docs`.

Avoid `npm run build` — `outDir` isn't set in `tsconfig.json`, so it emits a
`.js` file next to every source file. Use `npx tsc --noEmit` to type-check.
