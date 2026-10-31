# Backend

## Files

- `server.js`: Express startup, the shared prices object, Coinbase connection, and browser WebSocket messages. Read the numbered sections from top to bottom.
- `routes/marketRoutes.js`: connects GET `/api/markets` to `getMarkets`.
- `controllers/marketController.js`: returns the latest cached prices as `{ assets: [...] }`.

`app.locals.prices = prices` lets the controller access the same object used by the WebSocket code. It is an in-memory cache, not a database.

## Run

From `backend/`:

```sh
npm run dev
```

For the certificate setup verified on this Mac:

```sh
NODE_EXTRA_CA_CERTS=/etc/ssl/cert.pem NODE_USE_SYSTEM_CA=1 npm run dev
```

Default port: 3001. `PORT` can be supplied in the shell environment; `.env` is not automatically loaded. The frontend currently connects to `ws://localhost:3001/price`.

## Next steps

- Calculate 24-hour change in the Coinbase message handler, before creating `price`.
- Add a CoinGecko fetching function in `server.js` when ready, with one refresh timer for the backend. Stop that timer in `shutdown()`.
- Merge market statistics into the cached records without replacing Coinbase prices; retain separate update timestamps.
- Extend the controller response and browser messages when statistics are available.

No CoinGecko requests, automatic reconnection, or persistence are implemented yet. A new server starts with an empty cache. Stock prices require a separate provider.
