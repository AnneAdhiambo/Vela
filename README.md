# Vela - Chrome Extension

Transform every new tab into a productivity opportunity with focus sessions, task management, and progress tracking.

## Features

- 🎯 **Focus Timer**: Circular progress timer with customizable sessions (5-120 minutes)
- ✅ **Task Management**: Create, edit, complete, and reorder tasks with drag-and-drop
- 📊 **Progress Tracking**: Daily statistics, streak counter, and weekly overview
- 🎵 **Spotify Integration**: Control music playback without leaving your dashboard
- 🌙 **Theme Support**: Light and dark modes with system preference detection
- ⚡ **Offline First**: Full functionality without internet connection
- ♿ **Accessible**: Full keyboard navigation and screen reader support

## Development

### Prerequisites

- Node.js 18+ 
- Chrome browser for testing

### Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up EmailJS for authentication:
   - **For Vela team**: Follow `VELA_EMAIL_SETUP.md` (includes email server credentials)
   - **For others**: Follow `EMAILJS_SETUP.md` for general setup
   - Copy `.env.example` to `.env` and add your EmailJS credentials

4. Start development server:
   ```bash
   npm run dev
   ```

5. Build for production:
   ```bash
   npm run build
   ```

### Loading in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked" and select the `dist` folder
4. The extension will replace your new tab page

### Testing

Run the test suite:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

### Linting

Check code quality:
```bash
npm run lint
```

Auto-fix linting issues:
```bash
npm run lint:fix
```

## Project Structure

```
src/
├── components/          # React components
├── services/           # Business logic and API calls
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── types/              # TypeScript type definitions
├── background/         # Service worker scripts
├── popup/              # Extension popup
└── test/               # Test utilities and setup
```

## Architecture

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Build Tool**: Vite with Chrome Extension plugin
- **Storage**: Chrome Storage API (local and sync)
- **Background**: Service Worker with chrome.alarms
- **Testing**: Jest + React Testing Library

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

MIT License - see LICENSE file for details