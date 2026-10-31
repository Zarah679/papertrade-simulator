# Paper Trading Simulator

## Structure

- `frontend/` — Vue application, public assets, Vite configuration, and npm dependencies.
- `backend/` — reserved for the API server.
- `.vscode/` — shared editor settings.

## Run the frontend

```sh
cd frontend
npm install
npm run dev
```

Existing dependencies have been moved into `frontend/node_modules`, so reinstalling is only needed for a fresh checkout or dependency changes.

## Build the frontend

```sh
cd frontend
npm run build
```

The build output is written to `frontend/dist/`. Stop any old development server and restart it from `frontend/` after this folder move.

The Coinbase development proxy remains in `frontend/vite.config.js`. API fetching has not yet been moved to a backend server.
