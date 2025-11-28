# TerraHub Web Panel

Mobile-first PWA for discovering and managing multiple TerraHub controllers.

## Features

- Mobile-first PWA for discovering and managing multiple TerraHub controllers.
- Vue 3 + Vite application with Tailwind CSS styling.
- Progressive Web App (installable, offline-ready with auto-updates and cached API reads).
- TanStack Query-powered data fetching for discovery and controller health polling.
- Manual controller entry plus unicast-friendly network discovery, with local persistence for multiple controllers.
- Responsive layout tuned for phones and tablets, optimized for touch.
- One-click simulator controller for exercising the UI without hardware.
- ESP configuration page to provision Wi-Fi/hostname during first-boot setup.

## Getting started

```bash
# Install workspace dependencies
pnpm install

# Start the dev server
pnpm --filter @terra-hub/web-panel dev

# Type-check
pnpm --filter @terra-hub/web-panel lint

# Build & preview production assets
pnpm --filter @terra-hub/web-panel build
pnpm --filter @terra-hub/web-panel preview
```

### Using the simulator controller

- Launch the web panel and open the **Add a controller** card in the sidebar.
- Click **Add simulator controller** to pin a mock controller that streams realistic sensor values.
- The simulator stays persisted locally, so you can explore the dashboard without any physical devices.

### First-time provisioning (controller access point)

1. Power on the controller; it will broadcast `TerraHub-Setup` (password `terra-hub`).
2. Connect to that network from your phone, then browse to `http://192.168.4.1` to open the PWA.
3. Switch to the **Settings** tab and enter your home Wi-Fi SSID/password and optional hostname.
4. Save to let the ESP32 join your LAN; the setup AP remains available for recovery.

## Project structure

```
apps/web-panel/
├─ public/           # Static assets and PWA icons
├─ src/
│  ├─ api/          # HTTP helpers
│  ├─ components/   # UI components
│  ├─ stores/       # Pinia stores
│  ├─ views/        # Page-level views
│  ├─ App.vue       # Root component
│  └─ main.ts       # Entry point
├─ index.html       # HTML template
├─ vite.config.ts   # Vite + PWA config
├─ tailwind.config.cjs
└─ package.json
```

## API surface

The app expects the following endpoints to be exposed by controllers or a gateway:

- `GET /api/controllers/discover` → `{ controllers: ControllerSummary[] }`
- `GET /api/controllers/status?host=<host>&port=<port>&protocol=<proto>` → `ControllerStatus`
- `GET /api/config` → `{ apSsid, apPassword, apIp, stationIp, stationConnected, stationSsid, hostname, wifiConfigured }`
- `POST /api/config/wifi` → `{ ssid, hostname, ip, connected }`

Both calls are made through TanStack Query for caching and refetch behavior.

## License

MIT License - see [LICENSE](../../LICENSE) for details.
