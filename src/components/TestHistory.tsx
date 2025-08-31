'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TestResultsStorage, StoredResult } from '@/lib/storage';

interface TestHistoryProps {
  onResultSelect?: (result: StoredResult) => void;
  className?: string;
}

export function TestHistory({ onResultSelect, className }: TestHistoryProps) {
  const [history, setHistory] = useState<StoredResult[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    const results = TestResultsStorage.getHistory();
    const statistics = TestResultsStorage.getSpeedStats();
    setHistory(results);
    setStats(statistics);
  };

  const clearHistory = () => {
    TestResultsStorage.clearHistory();
    loadHistory();
  };

  const deleteResult = (id: string) => {
    TestResultsStorage.deleteResult(id);
    loadHistory();
  };

  const exportResults = () => {
    const data = TestResultsStorage.exportResults();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `speedtest-results-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getSpeedColor = (speed: number, type: 'download' | 'upload') => {
    const thresholds = type === 'download' ? { good: 25, fair: 5 } : { good: 10, fair: 3 };
    
    if (speed >= thresholds.good) return 'text-green-400';
    if (speed >= thresholds.fair) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getPingColor = (ping: number) => {
    if (ping <= 20) return 'text-green-400';
    if (ping <= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (history.length === 0) {
    return (
      <Card className={`bg-gray-800/50 border-gray-700 ${className}`}>
        <CardHeader>
          <CardTitle className="text-lg text-white">Test History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">No test results yet</div>
            <div className="text-sm text-gray-500">
              Run your first speed test to see results here
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-gray-800/50 border-gray-700 ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg text-white">
          Test History ({history.length})
        </CardTitle>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-300 border-gray-600 hover:bg-gray-700"
          >
            {isExpanded ? 'Collapse' : 'Expand'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={exportResults}
            className="text-gray-300 border-gray-600 hover:bg-gray-700"
          >
            Export
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={clearHistory}
            className="text-red-400 border-red-600 hover:bg-red-900"
          >
            Clear
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Statistics Summary */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-900/50 rounded-lg">
            <div className="text-center">
              <div className="text-white font-semibold">
                {stats.average?.download?.toFixed(1) || '0'} Mbps
              </div>
              <div className="text-xs text-gray-400">Avg Download</div>
            </div>
            <div className="text-center">
              <div className="text-white font-semibold">
                {stats.average?.upload?.toFixed(1) || '0'} Mbps
              </div>
              <div className="text-xs text-gray-400">Avg Upload</div>
            </div>
            <div className="text-center">
              <div className="text-white font-semibold">
                {stats.best?.download?.toFixed(1) || '0'} Mbps
              </div>
              <div className="text-xs text-gray-400">Best Download</div>
            </div>
            <div className="text-center">
              <div className="text-white font-semibold">
                {stats.average?.ping?.toFixed(0) || '0'} ms
              </div>
              <div className="text-xs text-gray-400">Avg Ping</div>
            </div>
          </div>
        )}

        {/* Recent Results */}
        <div className="space-y-2">
          <h4 className="text-white font-medium">Recent Tests</h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {(isExpanded ? history : history.slice(0, 5)).map((result) => (
              <div
                key={result.id}
                className="flex items-center justify-between p-3 bg-gray-900/30 rounded-lg hover:bg-gray-900/50 transition-colors cursor-pointer"
                onClick={() => onResultSelect?.(result)}
              >
                <div className="flex items-center space-x-4">
                  <div className="text-xs text-gray-400">
                    {new Date(result.timestamp).toLocaleDateString()} {' '}
                    {new Date(result.timestamp).toLocaleTimeString()}
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <div className={`text-sm font-medium ${getSpeedColor(result.downloadSpeed, 'download')}`}>
                        {result.downloadSpeed.toFixed(1)}
                      </div>
                      <div className="text-xs text-gray-500">Down</div>
                    </div>
                    
                    <div className="text-center">
                      <div className={`text-sm font-medium ${getSpeedColor(result.uploadSpeed, 'upload')}`}>
                        {result.uploadSpeed.toFixed(1)}
                      </div>
                      <div className="text-xs text-gray-500">Up</div>
                    </div>
                    
                    <div className="text-center">
                      <div className={`text-sm font-medium ${getPingColor(result.ping)}`}>
                        {result.ping.toFixed(0)}
                      </div>
                      <div className="text-xs text-gray-500">Ping</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {result.networkInfo && (
                    <Badge variant="outline" className="text-xs text-gray-400 border-gray-600">
                      {result.networkInfo.isp}
                    </Badge>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteResult(result.id);
                    }}
                    className="text-red-400 hover:text-red-300 hover:bg-red-900/20 p-1 h-auto"
                  >
                    ×
                  </Button>
                </div>
              </div>
            ))}
          </div>
          
          {!isExpanded && history.length > 5 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(true)}
              className="w-full text-gray-400 hover:text-gray-300"
            >
              Show {history.length - 5} more results
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}