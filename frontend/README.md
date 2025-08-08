# MoveSmart KE Frontend (Vite + React + TypeScript)

This is the frontend for MoveSmart KE, a Kenya-focused urban traffic intelligence app. It uses Vite, React, TypeScript, Tailwind, MapLibre, and TomTom APIs.

## Quick Start

1) Install

```
npm install
```

2) Configure environment

Copy `.env.example` to `.env` and fill your values:

```
VITE_TOMTOM_API_KEY=your_tomtom_api_key_here
# Optional if you call backend directly instead of proxy
VITE_API_BASE_URL=http://localhost:8000
```

3) Run the dev server (port 3000)

```
npm run dev
```

- Vite is configured to open the browser automatically.
- API requests to `/api/*` are proxied to `http://localhost:8000` (see `vite.config.js`).

4) Build for production

```
npm run build
```

5) Preview production build

```
npm run preview
```

## Key Features
- Roads Analytics: live metrics per major road (congestion, speed, travel time, incidents). Uses TomTom Traffic Flow API with graceful fallback.
- Dynamic City Support: Nairobi, Mombasa, Kisumu, Nakuru, Eldoret, and Kiambu with curated road lists.
- Map Integration: MapLibre GL with TomTom raster base and traffic overlays on the Dashboard.
- Authentication: Context-based auth flows and API client integration.

## Environment Variables
See `.env.example` for the full list. The most important is:
- `VITE_TOMTOM_API_KEY` – required for live TomTom traffic, routing, and geocoding.

## Notes
- In development, `API_BASE_URL` defaults to empty and `/api/*` requests are proxied to `http://localhost:8000` (configure in `vite.config.js`).
- Some features provide simulated data when backend or TomTom API is not available.

## Testing
```
npm test
```
Runs Vitest with jsdom.
