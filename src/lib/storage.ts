import { SpeedTestResult } from './speedTest';

const STORAGE_KEY = 'speedtest_history';
const MAX_HISTORY_ITEMS = 50;

export interface StoredResult {
  id: string;
  date: string;
  downloadSpeed: number;
  uploadSpeed: number;
  ping: number;
  jitter: number;
  timestamp: number;
  testDuration: number;
  networkInfo?: {
    ip: string;
    isp: string;
    location: {
      city: string;
      region: string;
      country: string;
    };
    connectionType: string;
    protocol: string;
  };
}

export class TestResultsStorage {
  static saveResult(result: SpeedTestResult): StoredResult {
    const storedResult: StoredResult = {
      ...result,
      id: Math.random().toString(36).substring(2, 15),
      date: new Date(result.timestamp).toISOString(),
    };

    const history = this.getHistory();
    history.unshift(storedResult);

    // Keep only the latest MAX_HISTORY_ITEMS
    const trimmedHistory = history.slice(0, MAX_HISTORY_ITEMS);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedHistory));
    }

    return storedResult;
  }

  static getHistory(): StoredResult[] {
    if (typeof window === 'undefined') return [];

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load test history:', error);
      return [];
    }
  }

  static getLatestResult(): StoredResult | null {
    const history = this.getHistory();
    return history.length > 0 ? history[0] : null;
  }

  static deleteResult(id: string): boolean {
    const history = this.getHistory();
    const filteredHistory = history.filter(result => result.id !== id);
    
    if (filteredHistory.length !== history.length) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredHistory));
      }
      return true;
    }
    
    return false;
  }

  static clearHistory(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  static exportResults(): string {
    const history = this.getHistory();
    return JSON.stringify(history, null, 2);
  }

  static getAverageSpeed(): { download: number; upload: number; ping: number } | null {
    const history = this.getHistory();
    
    if (history.length === 0) return null;

    const totals = history.reduce(
      (acc, result) => ({
        download: acc.download + result.downloadSpeed,
        upload: acc.upload + result.uploadSpeed,
        ping: acc.ping + result.ping,
      }),
      { download: 0, upload: 0, ping: 0 }
    );

    return {
      download: Math.round((totals.download / history.length) * 100) / 100,
      upload: Math.round((totals.upload / history.length) * 100) / 100,
      ping: Math.round((totals.ping / history.length) * 100) / 100,
    };
  }

  static getBestSpeed(): { download: number; upload: number; ping: number } | null {
    const history = this.getHistory();
    
    if (history.length === 0) return null;

    const best = history.reduce(
      (best, result) => ({
        download: Math.max(best.download, result.downloadSpeed),
        upload: Math.max(best.upload, result.uploadSpeed),
        ping: Math.min(best.ping, result.ping), // Lower ping is better
      }),
      { download: 0, upload: 0, ping: Infinity }
    );

    return {
      download: Math.round(best.download * 100) / 100,
      upload: Math.round(best.upload * 100) / 100,
      ping: best.ping === Infinity ? 0 : Math.round(best.ping * 100) / 100,
    };
  }

  static getSpeedStats(): {
    total: number;
    average: { download: number; upload: number; ping: number } | null;
    best: { download: number; upload: number; ping: number } | null;
    latest: StoredResult | null;
  } {
    return {
      total: this.getHistory().length,
      average: this.getAverageSpeed(),
      best: this.getBestSpeed(),
      latest: this.getLatestResult(),
    };
  }
}