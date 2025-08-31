'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { NetworkInfo as NetworkInfoType } from '@/lib/speedTest';

interface NetworkInfoProps {
  className?: string;
}

export function NetworkInfo({ className }: NetworkInfoProps) {
  const [networkInfo, setNetworkInfo] = useState<NetworkInfoType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNetworkInfo = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/network-info');
        const data = await response.json();
        
        if (data.success && data.networkInfo) {
          setNetworkInfo(data.networkInfo);
        } else {
          setError('Failed to load network information');
        }
      } catch (err) {
        setError('Unable to fetch network information');
        console.error('Network info fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNetworkInfo();
  }, []);

  if (loading) {
    return (
      <Card className={`bg-gray-800/50 border-gray-700 ${className}`}>
        <CardHeader>
          <CardTitle className="text-lg text-white">Network Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex justify-between">
                <div className="h-4 bg-gray-600 rounded animate-pulse w-20"></div>
                <div className="h-4 bg-gray-600 rounded animate-pulse w-32"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !networkInfo) {
    return (
      <Card className={`bg-gray-800/50 border-gray-700 ${className}`}>
        <CardHeader>
          <CardTitle className="text-lg text-white">Network Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <div className="text-gray-400 mb-2">Unable to load network information</div>
            <Badge variant="outline" className="text-red-400 border-red-400">
              {error || 'Unknown Error'}
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getConnectionTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'fiber':
      case 'broadband':
        return 'bg-green-500';
      case 'cable':
      case 'dsl':
        return 'bg-blue-500';
      case 'wireless':
      case 'mobile':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getProtocolColor = (protocol: string) => {
    switch (protocol.toLowerCase()) {
      case 'https':
        return 'bg-green-500';
      case 'http':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card className={`bg-gray-800/50 border-gray-700 ${className}`}>
      <CardHeader>
        <CardTitle className="text-lg text-white">Network Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">IP Address:</span>
            <div className="flex items-center gap-2">
              <span className="text-white font-medium font-mono text-sm">
                {networkInfo.ip}
              </span>
              {networkInfo.ip !== 'unknown' && (
                <Badge variant="outline" className="text-green-400 border-green-400 text-xs">
                  Connected
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-400">ISP Provider:</span>
            <span className="text-white font-medium">{networkInfo.isp}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Location:</span>
            <span className="text-white font-medium">
              {networkInfo.location.city}, {networkInfo.location.region}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Country:</span>
            <span className="text-white font-medium">{networkInfo.location.country}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Connection Type:</span>
            <Badge className={`${getConnectionTypeColor(networkInfo.connectionType)} text-white`}>
              {networkInfo.connectionType}
            </Badge>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Protocol:</span>
            <Badge className={`${getProtocolColor(networkInfo.protocol)} text-white`}>
              {networkInfo.protocol}
            </Badge>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-4">
          <div className="text-center text-xs text-gray-500">
            Network information is detected automatically and may vary based on your connection setup
          </div>
        </div>
      </CardContent>
    </Card>
  );
}