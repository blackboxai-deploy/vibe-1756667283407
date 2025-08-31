export interface SpeedTestResult {
  downloadSpeed: number; // Mbps
  uploadSpeed: number; // Mbps
  ping: number; // ms
  jitter: number; // ms
  timestamp: number;
  testDuration: number; // seconds
  networkInfo?: NetworkInfo;
}

export interface NetworkInfo {
  ip: string;
  isp: string;
  location: {
    city: string;
    region: string;
    country: string;
  };
  connectionType: string;
  protocol: string;
}

export interface TestProgress {
  phase: 'ping' | 'download' | 'upload' | 'complete';
  progress: number; // 0-100
  currentSpeed?: number;
  status: string;
}

class SpeedTestEngine {
  private onProgress?: (progress: TestProgress) => void;
  private abortController?: AbortController;

  constructor(onProgress?: (progress: TestProgress) => void) {
    this.onProgress = onProgress;
  }

  async runFullTest(): Promise<SpeedTestResult> {
    this.abortController = new AbortController();
    const startTime = Date.now();

    try {
      // Phase 1: Ping Test
      this.updateProgress('ping', 0, 'Starting ping test...');
      const pingResults = await this.runPingTest();
      
      // Phase 2: Download Test  
      this.updateProgress('download', 25, 'Starting download test...');
      const downloadSpeed = await this.runDownloadTest();
      
      // Phase 3: Upload Test
      this.updateProgress('upload', 75, 'Starting upload test...');
      const uploadSpeed = await this.runUploadTest();
      
      // Phase 4: Get Network Info
      const networkInfo = await this.getNetworkInfo();
      
      const testDuration = (Date.now() - startTime) / 1000;
      
      const result: SpeedTestResult = {
        downloadSpeed: Math.round(downloadSpeed * 100) / 100,
        uploadSpeed: Math.round(uploadSpeed * 100) / 100,
        ping: Math.round(pingResults.averagePing * 100) / 100,
        jitter: Math.round(pingResults.jitter * 100) / 100,
        timestamp: Date.now(),
        testDuration: Math.round(testDuration * 100) / 100,
        networkInfo
      };

      this.updateProgress('complete', 100, 'Test completed successfully!');
      
      return result;
    } catch (error) {
      console.error('Speed test failed:', error);
      throw new Error('Speed test failed: ' + (error as Error).message);
    }
  }

  async runPingTest(): Promise<{ averagePing: number; jitter: number }> {
    const pingCount = 5;
    const pings: number[] = [];
    
    for (let i = 0; i < pingCount; i++) {
      if (this.abortController?.signal.aborted) throw new Error('Test aborted');
      
      const startTime = performance.now();
      
      try {
        const response = await fetch(`/api/test/ping?seq=${i}&testId=${Date.now()}`, {
          method: 'GET',
          cache: 'no-cache',
          signal: this.abortController?.signal
        });
        
        if (response.ok) {
          const endTime = performance.now();
          const roundTripTime = endTime - startTime;
          pings.push(roundTripTime);
          
          this.updateProgress('ping', (i + 1) * (25 / pingCount), `Ping ${i + 1}/${pingCount}: ${Math.round(roundTripTime)}ms`);
        }
      } catch (error) {
        console.warn(`Ping ${i + 1} failed:`, error);
      }
      
      // Small delay between pings
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    if (pings.length === 0) throw new Error('All ping tests failed');
    
    const averagePing = pings.reduce((sum, ping) => sum + ping, 0) / pings.length;
    const jitter = this.calculateJitter(pings);
    
    return { averagePing, jitter };
  }

  async runDownloadTest(): Promise<number> {
    const testSizes = [0.5, 1, 2, 5]; // MB
    let bestSpeed = 0;
    
    for (let i = 0; i < testSizes.length; i++) {
      if (this.abortController?.signal.aborted) throw new Error('Test aborted');
      
      const size = testSizes[i];
      const startTime = performance.now();
      
      try {
        const response = await fetch(`/api/test/download?size=${size}&timestamp=${Date.now()}`, {
          method: 'GET',
          cache: 'no-cache',
          signal: this.abortController?.signal
        });
        
        if (response.ok) {
          const data = await response.text();
          const endTime = performance.now();
          
          const duration = (endTime - startTime) / 1000; // seconds
          const sizeBytes = data.length;
          const speedMbps = (sizeBytes * 8) / (duration * 1024 * 1024); // Convert to Mbps
          
          bestSpeed = Math.max(bestSpeed, speedMbps);
          
          const progress = 25 + ((i + 1) * (50 / testSizes.length));
          this.updateProgress('download', progress, `Download: ${Math.round(speedMbps * 10) / 10} Mbps`, speedMbps);
        }
      } catch (error) {
        console.warn(`Download test ${i + 1} failed:`, error);
      }
      
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    return bestSpeed;
  }

  async runUploadTest(): Promise<number> {
    const testSizes = [0.25, 0.5, 1, 2]; // MB
    let bestSpeed = 0;
    
    for (let i = 0; i < testSizes.length; i++) {
      if (this.abortController?.signal.aborted) throw new Error('Test aborted');
      
      const size = testSizes[i];
      const testData = this.generateTestData(size);
      const startTime = performance.now();
      
      try {
        const response = await fetch('/api/test/upload', {
          method: 'POST',
          body: testData,
          headers: {
            'Content-Type': 'application/octet-stream',
          },
          signal: this.abortController?.signal
        });
        
        if (response.ok) {
          await response.json(); // Consume response but don't store
          const endTime = performance.now();
          
          const duration = (endTime - startTime) / 1000;
          const speedMbps = (testData.length * 8) / (duration * 1024 * 1024);
          
          bestSpeed = Math.max(bestSpeed, speedMbps);
          
          const progress = 75 + ((i + 1) * (25 / testSizes.length));
          this.updateProgress('upload', progress, `Upload: ${Math.round(speedMbps * 10) / 10} Mbps`, speedMbps);
        }
      } catch (error) {
        console.warn(`Upload test ${i + 1} failed:`, error);
      }
      
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    return bestSpeed;
  }

  async getNetworkInfo(): Promise<NetworkInfo | undefined> {
    try {
      const response = await fetch('/api/network-info', {
        signal: this.abortController?.signal
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.networkInfo;
      }
    } catch (error) {
      console.warn('Failed to get network info:', error);
    }
    
    return undefined;
  }

  private generateTestData(sizeInMB: number): string {
    const sizeInBytes = sizeInMB * 1024 * 1024;
    const chunkSize = 1024;
    const chunks = Math.ceil(sizeInBytes / chunkSize);
    
    let data = '';
    const chunk = 'A'.repeat(chunkSize);
    
    for (let i = 0; i < chunks; i++) {
      data += chunk;
    }
    
    return data.substring(0, sizeInBytes);
  }

  private calculateJitter(pings: number[]): number {
    if (pings.length < 2) return 0;
    
    const differences: number[] = [];
    for (let i = 1; i < pings.length; i++) {
      differences.push(Math.abs(pings[i] - pings[i - 1]));
    }
    
    return differences.reduce((sum, diff) => sum + diff, 0) / differences.length;
  }

  private updateProgress(phase: TestProgress['phase'], progress: number, status: string, currentSpeed?: number) {
    if (this.onProgress) {
      this.onProgress({ phase, progress, status, currentSpeed });
    }
  }

  abort() {
    if (this.abortController) {
      this.abortController.abort();
    }
  }
}

export { SpeedTestEngine };