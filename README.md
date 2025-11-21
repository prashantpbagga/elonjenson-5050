# Index Basket Studio

A lightweight full-stack demo for building a custom basket of US-listed stocks, fetching live quotes, and comparing performance against major indices.

## Prerequisites
- Node.js 18+ (built-in `fetch` used for quote retrieval)
- Network access to Yahoo Finance quote API

## Install
No third-party dependencies are required. Initialize the repo and verify tests:

```bash
npm install   # no deps, but prepares lock/state
npm test
```

## Run locally
Start the server (defaults to port 3000) and open the app:

```bash
npm start
# or choose a port
PORT=8080 npm start
```

Then visit http://localhost:3000 (or your chosen port). The server serves static assets and provides:
- `GET /api/quotes?symbols=AAPL,MSFT` — live price lookup via Yahoo Finance
- `POST /api/basket` with `{ "basket": [{ "symbol": "AAPL", "allocation": 60 }, ...], "contribution": 500 }` — allocation breakdown with estimated shares

## Testing
Run the Node test suite:

```bash
npm test
```

## Deployment/hosting notes
The server binds to `0.0.0.0` by default, so it’s ready for platforms that expose `$PORT` (e.g., Render, Railway, Fly, Heroku). Ensure outbound HTTPS is allowed so quote fetching succeeds.

### Deploy to Vercel
This project ships a `vercel.json` that routes all requests to the Node handler so the static assets and `/api/*` endpoints stay unified.

1. Install the Vercel CLI and log in:
   ```bash
   npm i -g vercel
   vercel login
   ```
2. From the project root, deploy:
   ```bash
   vercel --prod
   ```
   The default settings detect `server.js` as an `@vercel/node` function and forward every path through it.
3. To test locally with Vercel’s runtime emulation, run:
   ```bash
   vercel dev
   ```
