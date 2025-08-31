'use client';

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { SpeedGauge } from '@/components/SpeedGauge';
import { TestResults } from '@/components/TestResults';
import { NetworkInfo } from '@/components/NetworkInfo';
import { TestHistory } from '@/components/TestHistory';
import { SpeedTestEngine, SpeedTestResult, TestProgress } from '@/lib/speedTest';
import { TestResultsStorage, StoredResult } from '@/lib/storage';

export default function SpeedTestPage() {
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [testProgress, setTestProgress] = useState<TestProgress | null>(null);
  const [currentResult, setCurrentResult] = useState<SpeedTestResult | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [speedTestEngine, setSpeedTestEngine] = useState<SpeedTestEngine | null>(null);

  // Real-time speed values for gauges
  const [realtimeDownload, setRealtimeDownload] = useState(0);
  const [realtimeUpload, setRealtimeUpload] = useState(0);
  const [realtimePing, setRealtimePing] = useState(0);

  const handleProgressUpdate = useCallback((progress: TestProgress) => {
    setTestProgress(progress);
    
    // Update real-time gauge values
    if (progress.phase === 'download' && progress.currentSpeed) {
      setRealtimeDownload(progress.currentSpeed);
    } else if (progress.phase === 'upload' && progress.currentSpeed) {
      setRealtimeUpload(progress.currentSpeed);
    }
    
    // Extract ping from status when available
    if (progress.phase === 'ping' && progress.status) {
      const pingMatch = progress.status.match(/(\d+)ms/);
      if (pingMatch) {
        setRealtimePing(parseInt(pingMatch[1]));
      }
    }
  }, []);

  const startSpeedTest = async () => {
    try {
      setIsTestRunning(true);
      setShowResults(false);
      setCurrentResult(null);
      setTestProgress(null);
      
      // Reset gauge values
      setRealtimeDownload(0);
      setRealtimeUpload(0);
      setRealtimePing(0);
      
      const engine = new SpeedTestEngine(handleProgressUpdate);
      setSpeedTestEngine(engine);
      
      const result = await engine.runFullTest();
      
      // Store result in local storage
      TestResultsStorage.saveResult(result);
      
      // Update final gauge values with test results
      setRealtimeDownload(result.downloadSpeed);
      setRealtimeUpload(result.uploadSpeed);
      setRealtimePing(result.ping);
      
      setCurrentResult(result);
      setShowResults(true);
    } catch (error) {
      console.error('Speed test failed:', error);
      setTestProgress({
        phase: 'complete',
        progress: 100,
        status: 'Test failed: ' + (error as Error).message
      });
    } finally {
      setIsTestRunning(false);
      setSpeedTestEngine(null);
    }
  };

  const stopSpeedTest = () => {
    if (speedTestEngine) {
      speedTestEngine.abort();
    }
    setIsTestRunning(false);
    setSpeedTestEngine(null);
    setTestProgress(null);
    setRealtimeDownload(0);
    setRealtimeUpload(0);
    setRealtimePing(0);
  };

  const handleHistoryResultSelect = (result: StoredResult) => {
    // Convert StoredResult to SpeedTestResult format
    const speedTestResult: SpeedTestResult = {
      downloadSpeed: result.downloadSpeed,
      uploadSpeed: result.uploadSpeed,
      ping: result.ping,
      jitter: result.jitter,
      timestamp: result.timestamp,
      testDuration: result.testDuration,
      networkInfo: result.networkInfo
    };
    
    setCurrentResult(speedTestResult);
    setShowResults(true);
    setRealtimeDownload(result.downloadSpeed);
    setRealtimeUpload(result.uploadSpeed);
    setRealtimePing(result.ping);
  };

  const getCurrentPhase = () => {
    if (!testProgress) return '';
    
    switch (testProgress.phase) {
      case 'ping': return 'Testing Latency...';
      case 'download': return 'Testing Download Speed...';
      case 'upload': return 'Testing Upload Speed...';
      case 'complete': return 'Test Complete!';
      default: return '';
    }
  };

  const getCurrentPhaseColor = () => {
    if (!testProgress) return 'text-gray-400';
    
    switch (testProgress.phase) {
      case 'ping': return 'text-blue-400';
      case 'download': return 'text-green-400';
      case 'upload': return 'text-yellow-400';
      case 'complete': return 'text-emerald-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
            Internet Speed Test
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Test your internet connection speed and get detailed performance analytics
          </p>
        </div>

        {/* Main Test Interface */}
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Speed Gauges */}
          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
            <CardContent className="py-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 justify-items-center">
                <SpeedGauge
                  speed={realtimeDownload}
                  maxSpeed={100}
                  label="Download Speed"
                  unit="MBPS"
                  isActive={testProgress?.phase === 'download'}
                />
                <SpeedGauge
                  speed={realtimeUpload}
                  maxSpeed={50}
                  label="Upload Speed"
                  unit="MBPS"
                  isActive={testProgress?.phase === 'upload'}
                />
                <SpeedGauge
                  speed={realtimePing}
                  maxSpeed={200}
                  label="Ping"
                  unit="MS"
                  isActive={testProgress?.phase === 'ping'}
                />
              </div>
            </CardContent>
          </Card>

          {/* Test Controls */}
          <div className="text-center space-y-6">
            {!isTestRunning ? (
              <Button
                onClick={startSpeedTest}
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold px-8 py-4 text-lg rounded-xl shadow-lg transform transition hover:scale-105"
              >
                Start Speed Test
              </Button>
            ) : (
              <div className="space-y-4">
                <Button
                  onClick={stopSpeedTest}
                  variant="destructive"
                  size="lg"
                  className="px-8 py-4 text-lg rounded-xl"
                >
                  Stop Test
                </Button>
              </div>
            )}

            {/* Progress Information */}
            {testProgress && (
              <div className="max-w-md mx-auto space-y-4">
                <div className="space-y-2">
                  <div className={`text-lg font-medium ${getCurrentPhaseColor()}`}>
                    {getCurrentPhase()}
                  </div>
                  <Progress 
                    value={testProgress.progress} 
                    className="h-2 bg-gray-700"
                  />
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>{testProgress.status}</span>
                    <span>{Math.round(testProgress.progress)}%</span>
                  </div>
                </div>
                
                <Badge 
                  variant="outline" 
                  className={`${getCurrentPhaseColor()} border-current`}
                >
                  {testProgress.phase.charAt(0).toUpperCase() + testProgress.phase.slice(1)} Phase
                </Badge>
              </div>
            )}
          </div>

          {/* Test Results */}
          <TestResults result={currentResult} isVisible={showResults} />

          {/* Network Information and History */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <NetworkInfo />
            <TestHistory onResultSelect={handleHistoryResultSelect} />
          </div>

          {/* Footer Information */}
          <Card className="bg-gray-800/30 border-gray-700">
            <CardContent className="py-6">
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold text-white">About This Test</h3>
                <p className="text-sm text-gray-400 max-w-3xl mx-auto">
                  This speed test measures your internet connection by downloading and uploading test data 
                  to our servers. Results may vary based on network conditions, server load, and your 
                  device capabilities. For best results, close other applications that use internet 
                  during the test.
                </p>
                <div className="flex flex-wrap justify-center gap-4 pt-4">
                  <Badge variant="outline" className="text-green-400 border-green-400">
                    Real-time Testing
                  </Badge>
                  <Badge variant="outline" className="text-blue-400 border-blue-400">
                    Multiple Measurements
                  </Badge>
                  <Badge variant="outline" className="text-purple-400 border-purple-400">
                    Detailed Analytics
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}