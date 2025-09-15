# Implementation Plan

- [x] 1. Set up Chrome extension project structure and build system

  - Create Chrome extension manifest.json with new tab override and required permissions
  - Configure Vite build system with Chrome extension plugin for React + TypeScript
  - Set up Tailwind CSS configuration and base styles
  - Create directory structure for components, services, types, and assets
  - _Requirements: 1.1, 1.4_

- [x] 2. Implement core data models and TypeScript interfaces

  - Check if there are any issues before starting ...

  - Define TypeScript interfaces for Task, FocusSession, UserProfile, and Statistics
  - Create data validation functions for all models
  - Implement storage utility functions for Chrome Storage API
  - Write unit tests for data models and validation
  - _Requirements: 3.1, 3.6, 8.1, 8.4_

- [x] 3. Create basic Chrome Storage service layer

- Fix errors first!

  - Implement ChromeStorageService class with get/set/remove methods
  - Add data serialization and deserialization utilities
  - Create storage event listeners for cross-tab synchronization
  - Write unit tests for storage operations with mocked Chrome APIs
  - _Requirements: 8.1, 8.2, 8.4_

- [x] 4. Build foundational React app structure and theme system

  - Create main App component with React Context for global state
  - Implement ThemeProvider with light/dark mode detection and switching
  - Set up CSS custom properties for theme colors and create base component styles
  - Add theme toggle functionality with smooth transitions
  - _Requirements: 6.1, 6.2, 6.3, 6.8, 6.9_

- [x] 5. Implement circular timer component with visual progress

  - Create TimerDisplay component with SVG circular progress ring
  - Build timer state management with useReducer for time tracking
  - Implement MM:SS time formatting and display logic
  - Add visual progress animation using CSS transforms and SVG stroke-dasharray
  - Write unit tests for timer calculations and state transitions
  - _Requirements: 2.1, 2.2, 2.6_

- [x] 6. Add timer controls and basic functionality

  - Implement start, pause, and stop timer controls with button components
  - Create timer state persistence using Chrome Storage API
  - Add default 25-minute session with custom duration support (5-120 minutes)
  - Handle timer state restoration when tab is reopened
  - Write integration tests for timer control interactions
  - _Requirements: 2.3, 2.4, 2.6, 2.7, 2.8_

- [x] 7. Create service worker for background timer management

  - Implement service worker with chrome.alarms API for accurate background timing
  - Create message passing system between service worker and UI for timer synchronization
  - Add timer state persistence and recovery logic for browser restarts
  - Implement background timer completion detection and notification preparation
  - Write unit tests for service worker timer logic
  - _Requirements: 2.7, 2.8, 1.4_

- [ ] 8. Build task management component with CRUD operations

  - Create TaskList component with task display and checkbox functionality
  - Implement task creation with Enter key handling in input field
  - Add inline task editing with double-click activation and blur/enter saving
  - Create task deletion functionality with keyboard shortcuts
  - Write unit tests for all task CRUD operations
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.6_

- [x] 9. Add drag-and-drop task reordering functionality

  - Implement drag-and-drop using HTML5 drag API or react-beautiful-dnd
  - Create visual feedback during drag operations with placeholder elements
  - Update task order persistence in storage after reordering
  - Add keyboard accessibility for task reordering (arrow keys + modifier)
  - Write integration tests for drag-and-drop functionality
  - _Requirements: 3.5, 3.6, 9.2_

- [ ] 10. Implement statistics tracking and display

  - Create StatsService to calculate daily sessions, focus time, and task completion
  - Build Statistics component with daily counters and visual displays
  - Implement streak calculation logic with persistence across days
  - Add water droplet streak badge icon with proper styling
  - Create weekly bar chart visualization for session history
  - Write unit tests for statistics calculations and data aggregation
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_

- [x] 11. Create session setup modal and configuration

  - Build SessionSetupModal component with duration and break settings
  - Implement session configuration form with validation (5-120 minutes)
  - Add break skip/include toggle functionality
  - Create session preference persistence and default value management
  - Connect session setup to timer initialization
  - Write unit tests for session configuration validation and persistence
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

- [x] 12. Add notification system for session completion

  - check if there are errors and fix, fix if the implemenetation is not correct.
  - Implement Chrome notifications API integration for session completion alerts
  - Create both visual and audio notification options with user preferences
  - Add notification permission handling and user consent flow
  - Implement notification click handling to focus extension tab
  - Write integration tests for notification system
  - _Requirements: 2.5, 8.1_

- [x] 13. Implement Spotify OAuth integration

  - Set up Spotify OAuth flow using Chrome identity API
  - Create SpotifyService class for API communication and token management
  - Implement secure token storage and automatic refresh logic
  - Add Spotify connection UI with authentication status display
  - Write unit tests for OAuth flow and token management
  - _Requirements: 7.1, 7.6_

- [ ] 14. Build Spotify playback controls and track display

  - Create SpotifyPlayer component with current track information display
  - Implement play, pause, next, and previous track controls
  - Add real-time playback status synchronization with Spotify API
  - Handle Spotify API errors and connection state management
  - Write integration tests for Spotify playback functionality
  - _Requirements: 7.2, 7.3, 7.4, 7.5_

- [ ] 15. Add comprehensive keyboard navigation and accessibility

  - Implement keyboard shortcuts for all major functions (Space, Enter, Escape)
  - Add proper ARIA labels and semantic HTML throughout the application
  - Create focus management system with visible focus indicators
  - Implement screen reader announcements for timer state changes
  - Write accessibility tests using axe-core and manual testing
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

- [ ] 16. Implement data synchronization and offline functionality

  - Create DataSyncService for handling online/offline state management
  - Implement conflict resolution logic for data synchronization
  - Add offline change queuing and batch sync when connectivity returns
  - Create sync status indicators in the UI
  - Write integration tests for offline functionality and sync scenarios
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [ ] 17. Add error handling and recovery mechanisms

  - Implement global error boundary components for React error handling
  - Create error notification system with user-friendly messages
  - Add fallback mechanisms for Chrome API failures
  - Implement automatic retry logic for network operations
  - Write unit tests for error scenarios and recovery mechanisms
  - _Requirements: 1.5, 8.4_

- [ ] 18. Optimize performance and implement loading states

  - Add skeleton loading states for initial app load and data fetching
  - Implement code splitting for Spotify integration and advanced features
  - Optimize bundle size with tree shaking and dynamic imports
  - Add performance monitoring and ensure <200ms initial load time
  - Write performance tests and establish performance budgets
  - _Requirements: 1.2, 8.1_

- [x] 19. Build Working payment integration with polar.sh on frontend.


  - Install Polar Next.js SDK: pnpm add @polar-sh/nextjs

  - Configure environment variables:

  - POLAR_ACCESS_TOKEN=polar_oat_ICGj1TbqBc0urQSqjSqiBoF3S8ea2MZBvLyzq3uyEZH

  - POLAR_SUCCESS_URL=http://localhost:3000/success?checkout_id={CHECKOUT_ID}

  - Integrate Polar checkout components into premium/upgrade section

  - Add success page to handle Polar checkout_id and show confirmation

  - Test the full payment flow locally and in staging before launch
  - _Requirements: All requirements validation_

- [x] 20. Creating Landing Page

  Create folder frontend and scaffold a Next.js + Tailwind project (creates site repo root for landing page)

  - Build Hero section (headline, subheadline, primary CTA, Add-to-Chrome button) — creates first-impression conversion block

  - Implement Features panel listing core app features: Timer circle, CRUD tasks, Reminders, Daily streaks, Spotify player, Stats & graphs — creates feature-driven value grid

  - Add Premium section (benefits + Polar checkout link) — creates pricing/upgrade conversion flow

  - Build How It Works / Onboarding strip (3-step flow + screenshot) — creates quick user activation path

  - Create Testimonials / Social Proof block and trust badges — creates credibility on page

  - Implement Signup / Newsletter form (Supabase magic-link signup) + success states — creates lead capture & auth entry point

  - Add SEO / Open Graph meta, favicons, and analytics (Plausible/GA) — creates discoverability & tracking

  - Prepare assets & screenshots (logo, icon, dark/light mockups) and privacy/TOS links — creates required store/marketing assets

  - Deploy to Vercel, configure custom domain, and run cross-browser/device tests — creates live production site and verification
    _Requirements: All requirements integration_
