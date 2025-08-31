'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SpeedTestResult } from '@/lib/speedTest';

interface TestResultsProps {
  result: SpeedTestResult | null;
  isVisible: boolean;
}

export function TestResults({ result, isVisible }: TestResultsProps) {
  if (!result || !isVisible) return null;

  const getSpeedRating = (speed: number, type: 'download' | 'upload') => {
    const thresholds = {
      download: { excellent: 100, good: 25, fair: 5 },
      upload: { excellent: 50, good: 10, fair: 3 }
    };
    
    const threshold = thresholds[type];
    
    if (speed >= threshold.excellent) return { label: 'Excellent', color: 'bg-green-500' };
    if (speed >= threshold.good) return { label: 'Good', color: 'bg-blue-500' };
    if (speed >= threshold.fair) return { label: 'Fair', color: 'bg-yellow-500' };
    return { label: 'Poor', color: 'bg-red-500' };
  };

  const getPingRating = (ping: number) => {
    if (ping <= 20) return { label: 'Excellent', color: 'bg-green-500' };
    if (ping <= 50) return { label: 'Good', color: 'bg-blue-500' };
    if (ping <= 100) return { label: 'Fair', color: 'bg-yellow-500' };
    return { label: 'Poor', color: 'bg-red-500' };
  };

  const downloadRating = getSpeedRating(result.downloadSpeed, 'download');
  const uploadRating = getSpeedRating(result.uploadSpeed, 'upload');
  const pingRating = getPingRating(result.ping);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Main Results */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
            Speed Test Results
            <Badge variant="outline" className="text-green-400 border-green-400">
              Completed
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Download Speed */}
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-white">
                {result.downloadSpeed.toFixed(1)}
                <span className="text-lg text-gray-400 ml-1">Mbps</span>
              </div>
              <div className="text-gray-300 font-medium">Download</div>
              <Badge className={`${downloadRating.color} text-white`}>
                {downloadRating.label}
              </Badge>
            </div>

            {/* Upload Speed */}
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-white">
                {result.uploadSpeed.toFixed(1)}
                <span className="text-lg text-gray-400 ml-1">Mbps</span>
              </div>
              <div className="text-gray-300 font-medium">Upload</div>
              <Badge className={`${uploadRating.color} text-white`}>
                {uploadRating.label}
              </Badge>
            </div>

            {/* Ping */}
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-white">
                {result.ping.toFixed(0)}
                <span className="text-lg text-gray-400 ml-1">ms</span>
              </div>
              <div className="text-gray-300 font-medium">Ping</div>
              <Badge className={`${pingRating.color} text-white`}>
                {pingRating.label}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Test Details */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-lg text-white">Test Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Jitter:</span>
              <span className="text-white font-medium">{result.jitter.toFixed(1)} ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Test Duration:</span>
              <span className="text-white font-medium">{result.testDuration.toFixed(1)}s</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Test Time:</span>
              <span className="text-white font-medium">
                {new Date(result.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Date:</span>
              <span className="text-white font-medium">
                {new Date(result.timestamp).toLocaleDateString()}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Network Information */}
        {result.networkInfo && (
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg text-white">Network Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">IP Address:</span>
                <span className="text-white font-medium font-mono text-sm">
                  {result.networkInfo.ip}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">ISP:</span>
                <span className="text-white font-medium">{result.networkInfo.isp}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Location:</span>
                <span className="text-white font-medium">
                  {result.networkInfo.location.city}, {result.networkInfo.location.region}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Connection:</span>
                <span className="text-white font-medium">
                  {result.networkInfo.connectionType}
                </span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Performance Insights */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg text-white">Performance Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="text-white font-medium">Best for:</h4>
                <div className="text-sm text-gray-300 space-y-1">
                  {result.downloadSpeed >= 25 && (
                    <div>&#8226; 4K video streaming</div>
                  )}
                  {result.downloadSpeed >= 5 && (
                    <div>&#8226; HD video streaming</div>
                  )}
                  {result.downloadSpeed >= 1 && (
                    <div>&#8226; Web browsing and email</div>
                  )}
                  {result.uploadSpeed >= 3 && (
                    <div>&#8226; Video calls</div>
                  )}
                  {result.ping <= 50 && (
                    <div>&#8226; Online gaming</div>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-white font-medium">Connection Quality:</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${downloadRating.color}`}></div>
                    <span className="text-sm text-gray-300">Download Quality</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${uploadRating.color}`}></div>
                    <span className="text-sm text-gray-300">Upload Quality</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${pingRating.color}`}></div>
                    <span className="text-sm text-gray-300">Latency Quality</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}