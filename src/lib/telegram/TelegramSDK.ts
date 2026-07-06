/**
 * Telegram SDK Initialization Manager
 * Single source of truth for Telegram Mini App initialization
 */

import type { TelegramWebApp } from "./types";

export interface TelegramInitStatus {
  sdkLoaded: boolean;
  telegramDetected: boolean;
  initDataAvailable: boolean;
  platform?: string;
  version?: string;
  colorScheme?: "light" | "dark";
  userId?: number;
  username?: string;
  firstName?: string;
  isPremium?: boolean;
  initData?: string;
  error?: string;
  timestamp: number;
}

export class TelegramSDK {
  private static instance: TelegramSDK;
  private initPromise: Promise<TelegramWebApp | null> | null = null;
  private webApp: TelegramWebApp | null = null;
  private logs: string[] = [];
  
  private constructor() {
    this.log("TelegramSDK instance created");
  }
  
  static getInstance(): TelegramSDK {
    if (!TelegramSDK.instance) {
      TelegramSDK.instance = new TelegramSDK();
    }
    return TelegramSDK.instance;
  }
  
  private log(message: string): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;
    this.logs.push(logMessage);
    console.log(`[TelegramSDK] ${message}`);
  }
  
  getLogs(): string[] {
    return [...this.logs];
  }
  
  /**
   * Initialize Telegram WebApp with retry logic
   * Returns null if Telegram is not available after timeout
   */
  async initialize(options: {
    maxAttempts?: number;
    retryInterval?: number;
    timeout?: number;
  } = {}): Promise<TelegramWebApp | null> {
    const {
      maxAttempts = 50,        // 50 attempts
      retryInterval = 100,     // 100ms between attempts
      timeout = 5000,          // 5 second total timeout
    } = options;
    
    // Return cached promise if already initializing
    if (this.initPromise) {
      this.log("Returning existing initialization promise");
      return this.initPromise;
    }
    
    // Return cached WebApp if already initialized
    if (this.webApp) {
      this.log("Returning cached WebApp instance");
      return this.webApp;
    }
    
    this.log("Starting Telegram initialization");
    
    this.initPromise = new Promise<TelegramWebApp | null>((resolve) => {
      let attempts = 0;
      const startTime = Date.now();
      
      const checkTelegram = () => {
        attempts++;
        const elapsed = Date.now() - startTime;
        
        this.log(`Attempt ${attempts}/${maxAttempts} (${elapsed}ms elapsed)`);
        
        // Check if script loaded
        if (typeof window === "undefined") {
          this.log("ERROR: Running in non-browser environment");
          resolve(null);
          return;
        }
        
        // Check if Telegram object exists
        if (!window.Telegram) {
          this.log(`Telegram object not found (attempt ${attempts})`);
          
          if (attempts >= maxAttempts || elapsed >= timeout) {
            this.log(`TIMEOUT: Telegram not detected after ${attempts} attempts (${elapsed}ms)`);
            resolve(null);
            return;
          }
          
          setTimeout(checkTelegram, retryInterval);
          return;
        }
        
        this.log("Telegram object detected!");
        
        // Check if WebApp exists
        if (!window.Telegram.WebApp) {
          this.log("ERROR: Telegram.WebApp is undefined");
          
          if (attempts >= maxAttempts || elapsed >= timeout) {
            this.log(`TIMEOUT: Telegram.WebApp not available after ${attempts} attempts`);
            resolve(null);
            return;
          }
          
          setTimeout(checkTelegram, retryInterval);
          return;
        }
        
        this.log("Telegram.WebApp detected!");
        
        const webApp = window.Telegram.WebApp;
        
        // Initialize WebApp
        try {
          this.log("Calling WebApp.ready()");
          webApp.ready();
          
          this.log("Calling WebApp.expand()");
          webApp.expand();
          
          this.webApp = webApp;
          
          // Log all available data
          this.log(`Platform: ${webApp.platform}`);
          this.log(`Version: ${webApp.version}`);
          this.log(`Color Scheme: ${webApp.colorScheme}`);
          this.log(`Viewport Height: ${webApp.viewportHeight}`);
          this.log(`Is Expanded: ${webApp.isExpanded}`);
          this.log(`InitData length: ${webApp.initData?.length || 0}`);
          
          if (webApp.initDataUnsafe?.user) {
            const user = webApp.initDataUnsafe.user;
            this.log(`User ID: ${user.id}`);
            this.log(`Username: ${user.username || "none"}`);
            this.log(`First Name: ${user.first_name}`);
            this.log(`Is Premium: ${user.is_premium || false}`);
          } else {
            this.log("WARNING: No user data in initDataUnsafe");
          }
          
          this.log("✅ Telegram initialization SUCCESSFUL");
          resolve(webApp);
          
        } catch (error) {
          this.log(`ERROR during initialization: ${error}`);
          resolve(null);
        }
      };
      
      checkTelegram();
    });
    
    return this.initPromise;
  }
  
  /**
   * Get the current initialization status
   */
  getStatus(): TelegramInitStatus {
    const timestamp = Date.now();
    
    if (typeof window === "undefined") {
      return {
        sdkLoaded: false,
        telegramDetected: false,
        initDataAvailable: false,
        error: "Not running in browser",
        timestamp,
      };
    }
    
    const telegram = window.Telegram;
    const webApp = telegram?.WebApp;
    
    const status: TelegramInitStatus = {
      sdkLoaded: !!telegram,
      telegramDetected: !!webApp,
      initDataAvailable: !!(webApp?.initData && webApp.initData.length > 0),
      timestamp,
    };
    
    if (webApp) {
      status.platform = webApp.platform;
      status.version = webApp.version;
      status.colorScheme = webApp.colorScheme;
      status.initData = webApp.initData;
      
      if (webApp.initDataUnsafe?.user) {
        status.userId = webApp.initDataUnsafe.user.id;
        status.username = webApp.initDataUnsafe.user.username;
        status.firstName = webApp.initDataUnsafe.user.first_name;
        status.isPremium = webApp.initDataUnsafe.user.is_premium;
      }
    }
    
    if (!telegram) {
      status.error = "Telegram SDK not loaded";
    } else if (!webApp) {
      status.error = "Telegram.WebApp is undefined";
    } else if (!webApp.initData) {
      status.error = "No initData (not opened as Mini App)";
    }
    
    return status;
  }
  
  /**
   * Get the WebApp instance (only if initialized)
   */
  getWebApp(): TelegramWebApp | null {
    return this.webApp;
  }
  
  /**
   * Check if running inside Telegram
   */
  isInTelegram(): boolean {
    return !!(this.webApp && this.webApp.initData);
  }
}
