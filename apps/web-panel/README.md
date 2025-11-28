# TerraHub Web Panel

Mobile-first web interface for TerraHub terrarium control.

## Overview

The web panel provides a responsive, mobile-optimized interface for:
- Real-time dashboard with sensor readings and relay states
- Port configuration and module mapping
- Schedule editor for day/night cycles
- Rules editor for sensor-based automation
- Network and backup settings

## Technology Stack

- **Framework:** Vue 3 with Composition API
- **Build Tool:** Vite
- **UI Components:** Custom components (mobile-first)
- **State Management:** Pinia
- **Styling:** Tailwind CSS
- **HTTP Client:** Axios

## Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## Project Structure

```
web-panel/
├─ public/           # Static assets
├─ src/
│  ├─ assets/       # Images, fonts, etc.
│  ├─ components/   # Vue components
│  ├─ composables/  # Vue composables
│  ├─ layouts/      # Page layouts
│  ├─ pages/        # Page components
│  ├─ stores/       # Pinia stores
│  ├─ services/     # API services
│  ├─ App.vue       # Root component
│  └─ main.ts       # Entry point
├─ index.html       # HTML template
├─ vite.config.ts   # Vite configuration
├─ tailwind.config.js
└─ package.json
```

## Pages

1. **Dashboard** - Live sensor readings, relay states, fault alerts
2. **Ports** - Configure port types and module assignments
3. **Schedules** - Create and manage time-based schedules
4. **Rules** - Define sensor threshold rules and actions
5. **Settings** - Network, time, and backup configuration

## API Communication

The panel communicates with the TerraHub controller via:
- HTTP REST API for configuration and commands
- WebSocket for real-time state updates

## Building for Deployment

The production build can be:
- Served directly from the ESP32's SPIFFS filesystem
- Hosted separately and connected to the controller API

```bash
# Build optimized for ESP32 SPIFFS
pnpm build

# The output in dist/ can be uploaded to SPIFFS
```

## License

MIT License - see [LICENSE](../../LICENSE) for details.
