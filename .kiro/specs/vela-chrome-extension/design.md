# Design Document

## Overview

Vela is a Chrome extension built with Manifest V3 that replaces the default new tab page with a productivity dashboard. The architecture follows a modern web application pattern using React + TypeScript + Vite for the frontend, Chrome Storage API for persistence, and service workers for background operations. The design emphasizes performance, offline-first functionality, and a clean, minimalist user interface that promotes focus and productivity.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Chrome Extension                         │
├─────────────────────────────────────────────────────────────┤
│  New Tab Page (React App)                                  │
│  ├── Timer Component (Circular Progress)                   │
│  ├── Task Management Component                             │
│  ├── Statistics Dashboard                                  │
│  ├── Spotify Integration                                   │
│  └── Theme Provider                                        │
├─────────────────────────────────────────────────────────────┤
│  Service Worker (Background Script)                        │
│  ├── Timer Management (chrome.alarms)                      │
│  ├── Notification System                                   │
│  ├── Data Sync Logic                                       │
│  └── Spotify API Integration                               │
├─────────────────────────────────────────────────────────────┤
│  Storage Layer                                             │
│  ├── Chrome Storage API (Local)                            │
│  ├── Chrome Storage API (Sync)                             │
│  └── IndexedDB (Large Data)                                │
├─────────────────────────────────────────────────────────────┤
│  External Integrations                                     │
│  ├── Spotify Web API                                       │
│  └── Chrome Notifications API                              │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

- **Frontend Framework:** React 18 with TypeScript
- **Build Tool:** Vite with Chrome Extension plugin
- **Styling:** Tailwind CSS for utility-first styling
- **State Management:** React Context + useReducer for global state
- **Storage:** Chrome Storage API (local and sync)
- **Background Processing:** Service Worker with chrome.alarms
- **External APIs:** Spotify Web API, Chrome Extension APIs

## Components and Interfaces

### Core Components

#### 1. App Component (Root)
```typescript
interface AppProps {}

interface AppState {
  theme: 'light' | 'dark' | 'system';
  isLoading: boolean;
  user: UserProfile | null;
}
```

**Responsibilities:**
- Initialize application state
- Handle theme detection and switching
- Manage global loading states
- Coordinate between major components

#### 2. Timer Component
```typescript
interface TimerProps {
  onSessionComplete: (session: FocusSession) => void;
  onSessionStart: (sessionConfig: SessionConfig) => void;
}

interface TimerState {
  timeRemaining: number;
  isActive: boolean;
  isPaused: boolean;
  sessionType: 'work' | 'break';
  totalDuration: number;
  streak: number;
}
```

**Responsibilities:**
- Render circular progress indicator with SVG
- Display time in MM:SS format
- Handle start/pause/stop controls
- Communicate with service worker for background timing
- Show streak badge with water droplet icon

#### 3. Task Management Component
```typescript
interface TaskListProps {
  tasks: Task[];
  onTaskCreate: (text: string) => void;
  onTaskUpdate: (id: string, updates: Partial<Task>) => void;
  onTaskDelete: (id: string) => void;
  onTaskReorder: (fromIndex: number, toIndex: number) => void;
}

interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
  completedAt?: Date;
  order: number;
}
```

**Responsibilities:**
- Render task list with checkboxes
- Handle inline editing (double-click)
- Manage drag-and-drop reordering
- Provide keyboard shortcuts for task operations
- Auto-save changes to storage

#### 4. Statistics Component
```typescript
interface StatsProps {
  dailyStats: DailyStats;
  weeklyStats: WeeklyStats[];
  streak: number;
}

interface DailyStats {
  date: Date;
  sessionsCompleted: number;
  totalFocusTime: number;
  tasksCompleted: number;
  streak: number;
}
```

**Responsibilities:**
- Display daily session count and focus time
- Show tasks completed today
- Render weekly bar chart
- Display streak information with visual indicator

#### 5. Spotify Integration Component
```typescript
interface SpotifyPlayerProps {
  isConnected: boolean;
  currentTrack?: SpotifyTrack;
  isPlaying: boolean;
  onConnect: () => void;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
}

interface SpotifyTrack {
  name: string;
  artist: string;
  album: string;
  duration: number;
  progress: number;
}
```

**Responsibilities:**
- Handle Spotify OAuth flow
- Display current track information
- Provide playback controls
- Manage token refresh
- Handle connection states

#### 6. Session Setup Modal
```typescript
interface SessionSetupProps {
  isOpen: boolean;
  onClose: () => void;
  onStart: (config: SessionConfig) => void;
  defaultConfig: SessionConfig;
}

interface SessionConfig {
  workDuration: number; // minutes
  breakDuration: number; // minutes
  skipBreaks: boolean;
  sessionType: 'pomodoro' | 'custom' | 'stopwatch';
}
```

**Responsibilities:**
- Present session configuration options
- Validate input ranges (5-120 minutes)
- Save user preferences
- Trigger timer start with configuration

### Service Worker Architecture

#### Background Timer Management
```typescript
class TimerManager {
  private activeSession: ActiveSession | null = null;
  
  async startSession(config: SessionConfig): Promise<void>
  async pauseSession(): Promise<void>
  async resumeSession(): Promise<void>
  async stopSession(): Promise<void>
  private handleAlarm(alarm: chrome.alarms.Alarm): Promise<void>
  private notifySessionComplete(): Promise<void>
}
```

**Responsibilities:**
- Manage chrome.alarms for accurate timing
- Handle session state persistence
- Send notifications on completion
- Sync timer state with UI
- Handle browser restart scenarios

#### Data Sync Manager
```typescript
class DataSyncManager {
  async syncToCloud(data: UserData): Promise<void>
  async syncFromCloud(): Promise<UserData>
  async resolveConflicts(local: UserData, remote: UserData): Promise<UserData>
  private handleOfflineChanges(): Promise<void>
}
```

**Responsibilities:**
- Manage offline-first data strategy
- Handle sync conflicts
- Batch sync operations
- Provide sync status to UI

## Data Models

### Core Data Structures

#### User Profile
```typescript
interface UserProfile {
  id: string;
  email?: string;
  displayName?: string;
  preferences: UserPreferences;
  createdAt: Date;
  lastActiveAt: Date;
}

interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  defaultSessionLength: number;
  defaultBreakLength: number;
  skipBreaks: boolean;
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  spotifyConnected: boolean;
}
```

#### Focus Session
```typescript
interface FocusSession {
  id: string;
  userId?: string;
  startTime: Date;
  endTime?: Date;
  plannedDuration: number;
  actualDuration?: number;
  sessionType: 'work' | 'break';
  completed: boolean;
  pausedTime: number;
  tasksWorkedOn: string[];
}
```

#### Statistics
```typescript
interface DailyStats {
  date: string; // YYYY-MM-DD
  sessionsStarted: number;
  sessionsCompleted: number;
  totalFocusTime: number; // minutes
  tasksCreated: number;
  tasksCompleted: number;
  streak: number;
}

interface WeeklyStats {
  weekStart: Date;
  dailyStats: DailyStats[];
  weeklyTotals: {
    sessions: number;
    focusTime: number;
    tasksCompleted: number;
  };
}
```

### Storage Schema

#### Chrome Storage Local
```typescript
interface LocalStorage {
  // Fast access data
  currentSession: ActiveSession | null;
  todaysTasks: Task[];
  todaysStats: DailyStats;
  userPreferences: UserPreferences;
  lastSync: Date;
}
```

#### Chrome Storage Sync
```typescript
interface SyncStorage {
  // Cross-device sync data
  userProfile: UserProfile;
  preferences: UserPreferences;
  recentTasks: Task[]; // Last 50 tasks
  weeklyStats: WeeklyStats[];
}
```

#### IndexedDB (for large datasets)
```typescript
interface VelaDB {
  tasks: Task[];
  sessions: FocusSession[];
  dailyStats: DailyStats[];
  spotifyTokens: SpotifyTokens;
}
```

## Error Handling

### Error Categories and Strategies

#### 1. Storage Errors
- **Chrome Storage Quota Exceeded:** Implement data cleanup and archiving
- **Storage Access Denied:** Graceful degradation to memory-only mode
- **Sync Conflicts:** Last-write-wins with user notification

#### 2. Timer Errors
- **Alarm API Failures:** Fallback to JavaScript timers with warning
- **Service Worker Termination:** Automatic session recovery on restart
- **Time Drift:** Periodic synchronization with system time

#### 3. External API Errors
- **Spotify API Rate Limits:** Implement exponential backoff
- **Network Connectivity:** Queue operations for retry when online
- **OAuth Token Expiry:** Automatic refresh with user re-auth fallback

#### 4. UI Errors
- **Component Render Errors:** Error boundaries with fallback UI
- **State Corruption:** Reset to default state with user notification
- **Performance Issues:** Lazy loading and virtualization for large datasets

### Error Recovery Mechanisms

```typescript
class ErrorHandler {
  static handleStorageError(error: StorageError): void {
    // Log error, show user notification, attempt recovery
  }
  
  static handleTimerError(error: TimerError): void {
    // Switch to fallback timing, notify user of degraded functionality
  }
  
  static handleAPIError(error: APIError): void {
    // Retry with backoff, show connection status, queue for later
  }
}
```

## Testing Strategy

### Unit Testing
- **Component Testing:** React Testing Library for all UI components
- **Service Testing:** Jest for service worker logic and data management
- **Utility Testing:** Pure function testing for calculations and formatting
- **Storage Testing:** Mock Chrome APIs for storage operations

### Integration Testing
- **End-to-End Flows:** Playwright for complete user journeys
- **Chrome Extension Testing:** Custom test harness for extension lifecycle
- **API Integration:** Mock external services for reliable testing
- **Cross-Browser Testing:** Automated testing on Chrome versions

### Performance Testing
- **Load Time Measurement:** Automated performance budgets
- **Memory Usage Monitoring:** Heap snapshots and leak detection
- **Timer Accuracy Testing:** Precision validation for focus sessions
- **Storage Performance:** Large dataset handling validation

### Test Data Management
```typescript
interface TestFixtures {
  users: UserProfile[];
  tasks: Task[];
  sessions: FocusSession[];
  stats: DailyStats[];
}
```

## Performance Considerations

### Load Time Optimization
- **Code Splitting:** Lazy load Spotify integration and advanced features
- **Bundle Size:** Tree shaking and dynamic imports
- **Critical Path:** Inline critical CSS and defer non-essential scripts
- **Caching Strategy:** Service worker caching for static assets

### Runtime Performance
- **Virtual Scrolling:** For large task lists and historical data
- **Debounced Updates:** Batch storage operations to reduce I/O
- **Memory Management:** Cleanup timers and event listeners
- **Background Processing:** Offload heavy computations to service worker

### Storage Optimization
- **Data Compression:** Compress historical data before storage
- **Cleanup Policies:** Archive old data and remove unused entries
- **Sync Efficiency:** Delta sync for large datasets
- **Quota Management:** Monitor and manage storage usage

## Security Considerations

### Data Protection
- **Local Storage Encryption:** Sensitive data encryption at rest
- **Token Security:** Secure storage of OAuth tokens
- **Data Validation:** Input sanitization and validation
- **Privacy Controls:** User control over data collection and sync

### Extension Security
- **Content Security Policy:** Strict CSP for XSS prevention
- **Permission Minimization:** Request only necessary permissions
- **Secure Communication:** HTTPS-only external requests
- **Code Integrity:** Subresource integrity for external dependencies

### API Security
- **OAuth Implementation:** Secure Spotify OAuth flow
- **Token Management:** Automatic refresh and secure storage
- **Rate Limiting:** Respect API limits and implement backoff
- **Error Handling:** Avoid exposing sensitive information in errors

## Accessibility Implementation

### WCAG 2.1 AA Compliance
- **Keyboard Navigation:** Full keyboard accessibility for all features
- **Screen Reader Support:** Proper ARIA labels and semantic HTML
- **Color Contrast:** Minimum 4.5:1 contrast ratio for all text
- **Focus Management:** Clear focus indicators and logical tab order

### Assistive Technology Support
- **Timer Announcements:** Screen reader updates for timer state changes
- **Task Management:** Accessible drag-and-drop with keyboard alternatives
- **Statistics:** Data tables with proper headers and descriptions
- **Modal Dialogs:** Proper focus trapping and escape handling

### Keyboard Shortcuts
```typescript
interface KeyboardShortcuts {
  'Space': 'Toggle timer (start/pause)';
  'Enter': 'Add new task or confirm action';
  'Escape': 'Cancel current action or close modal';
  'Tab': 'Navigate between elements';
  'Ctrl+D': 'Toggle dark mode';
  'Ctrl+N': 'Create new task';
  'Delete': 'Delete selected task';
}
```