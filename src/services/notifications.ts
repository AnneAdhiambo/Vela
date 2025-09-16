// Notification service for Vela Chrome Extension

export interface NotificationOptions {
  title: string;
  message: string;
  iconUrl?: string;
  type?: "basic" | "image" | "list" | "progress";
  priority?: 0 | 1 | 2; // 0 = low, 1 = normal, 2 = high
  requireInteraction?: boolean;
  silent?: boolean;
  contextMessage?: string;
  buttons?: Array<{
    title: string;
    iconUrl?: string;
  }>;
}

export interface NotificationPreferences {
  enabled: boolean;
  soundEnabled: boolean;
  requireInteraction: boolean;
  priority: 0 | 1 | 2;
}

export class NotificationService {
  private static instance: NotificationService;
  private permissionGranted: boolean = false;
  private preferences: NotificationPreferences = {
    enabled: true,
    soundEnabled: true,
    requireInteraction: false,
    priority: 1,
  };

  private constructor() {
    this.checkPermission();
    this.loadPreferences();
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Check if notification permission is granted
   */
  private async checkPermission(): Promise<void> {
    try {
      // Chrome extensions with notifications permission don't need to request permission
      // The permission is granted when the extension is installed
      this.permissionGranted = true;
    } catch (error) {
      console.error("Error checking notification permission:", error);
      this.permissionGranted = false;
    }
  }

  /**
   * Load notification preferences from storage
   */
  private async loadPreferences(): Promise<void> {
    try {
      const result = await chrome.storage.local.get(["userPreferences"]);
      if (result.userPreferences) {
        this.preferences = {
          enabled: result.userPreferences.notificationsEnabled ?? true,
          soundEnabled: result.userPreferences.soundEnabled ?? true,
          requireInteraction: false,
          priority: 1,
        };
      }
    } catch (error) {
      console.error("Error loading notification preferences:", error);
    }
  }

  /**
   * Update notification preferences
   */
  async updatePreferences(
    newPreferences: Partial<NotificationPreferences>
  ): Promise<void> {
    this.preferences = { ...this.preferences, ...newPreferences };

    try {
      const result = await chrome.storage.local.get(["userPreferences"]);
      const updatedUserPreferences = {
        ...result.userPreferences,
        notificationsEnabled: this.preferences.enabled,
        soundEnabled: this.preferences.soundEnabled,
      };

      await chrome.storage.local.set({
        userPreferences: updatedUserPreferences,
      });
    } catch (error) {
      console.error("Error updating notification preferences:", error);
    }
  }

  /**
   * Get current notification preferences
   */
  getPreferences(): NotificationPreferences {
    return { ...this.preferences };
  }

  /**
   * Check if notifications are enabled and permission is granted
   */
  isEnabled(): boolean {
    return this.permissionGranted && this.preferences.enabled;
  }

  /**
   * Show a notification
   */
  async show(id: string, options: NotificationOptions): Promise<boolean> {
    if (!this.isEnabled()) {
      console.log("Notifications are disabled or permission not granted");
      return false;
    }

    try {
      const notificationOptions: chrome.notifications.NotificationOptions<true> =
        {
          type: options.type || "basic",
          iconUrl: options.iconUrl || "icons/icon-48.png",
          title: options.title,
          message: options.message,
          priority: options.priority ?? this.preferences.priority,
          requireInteraction:
            options.requireInteraction ?? this.preferences.requireInteraction,
          silent: options.silent ?? !this.preferences.soundEnabled,
        };

      // Add context message if provided
      if (options.contextMessage) {
        notificationOptions.contextMessage = options.contextMessage;
      }

      // Add buttons if provided
      if (options.buttons && options.buttons.length > 0) {
        notificationOptions.buttons = options.buttons;
      }

      chrome.notifications.create(id, notificationOptions);

      // Play sound if enabled and not silent
      if (this.preferences.soundEnabled && !options.silent) {
        this.playNotificationSound();
      }

      return true;
    } catch (error) {
      console.error("Error showing notification:", error);
      return false;
    }
  }

  /**
   * Clear a notification
   */
  async clear(id: string): Promise<boolean> {
    try {
      chrome.notifications.clear(id);
      return true;
    } catch (error) {
      console.error("Error clearing notification:", error);
      return false;
    }
  }

  /**
   * Clear all notifications
   */
  async clearAll(): Promise<void> {
    try {
      chrome.notifications.getAll((notifications) => {
        if (notifications) {
          const clearPromises = Object.keys(notifications).map((id) =>
            this.clear(id)
          );
          Promise.all(clearPromises);
        }
      });
    } catch (error) {
      console.error("Error clearing all notifications:", error);
    }
  }

  /**
   * Play notification sound using Web Audio API
   */
  private playNotificationSound(): void {
    try {
      // Create a simple notification sound using Web Audio API
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Create a pleasant notification sound (two-tone chime)
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.3
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.error("Error playing notification sound:", error);
    }
  }

  /**
   * Show session completion notification
   */
  async showSessionComplete(
    sessionType: "work" | "break",
    duration: number
  ): Promise<boolean> {
    const isWorkSession = sessionType === "work";
    const title = isWorkSession
      ? "Focus Session Complete!"
      : "Break Time Over!";
    const message = isWorkSession
      ? `Great job! You focused for ${duration} minutes. Time for a break.`
      : `Break time is over. Ready for another focus session?`;

    const contextMessage = isWorkSession
      ? "Click to start a break or continue working"
      : "Click to start your next focus session";

    return this.show("session-complete", {
      title,
      message,
      contextMessage,
      priority: 2,
      requireInteraction: true,
      buttons: isWorkSession
        ? [{ title: "Take Break" }, { title: "Continue Working" }]
        : [{ title: "Start Focus Session" }, { title: "Extend Break" }],
    });
  }

  /**
   * Show task reminder notification
   */
  async showTaskReminder(taskCount: number): Promise<boolean> {
    if (taskCount === 0) return false;

    const title = "Don't Forget Your Tasks!";
    const message = `You have ${taskCount} task${
      taskCount > 1 ? "s" : ""
    } waiting for you.`;

    return this.show("task-reminder", {
      title,
      message,
      priority: 1,
      buttons: [{ title: "View Tasks" }],
    });
  }

  /**
   * Show streak achievement notification
   */
  async showStreakAchievement(streak: number): Promise<boolean> {
    if (streak < 2) return false;

    const title = `${streak} Day Streak! 🔥`;
    const message = `Amazing! You've maintained your productivity streak for ${streak} days.`;

    return this.show("streak-achievement", {
      title,
      message,
      priority: 1,
      requireInteraction: false,
    });
  }

  /**
   * Test notification (for settings)
   */
  async showTestNotification(): Promise<boolean> {
    return this.show("test-notification", {
      title: "Test Notification",
      message:
        "This is a test notification from Vela. If you can see this, notifications are working!",
      priority: 1,
      requireInteraction: false,
    });
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance();
