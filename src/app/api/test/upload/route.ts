import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const startTime = Date.now();
    
    // Get the request body size and content
    const body = await request.text();
    const bodySize = new TextEncoder().encode(body).length;
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Calculate upload speed (bytes per second)
    const bytesPerSecond = bodySize / (duration / 1000);
    const mbps = (bytesPerSecond * 8) / (1024 * 1024); // Convert to Mbps
    
    // Get additional headers for analysis
    const contentType = request.headers.get('content-type') || 'unknown';
    
    return NextResponse.json({
      success: true,
      uploadSpeed: {
        bytesPerSecond: Math.round(bytesPerSecond),
        mbps: Math.round(mbps * 100) / 100,
        kbps: Math.round((bytesPerSecond / 1024) * 100) / 100,
      },
      metadata: {
        bodySize,
        duration,
        contentType,
        timestamp: endTime,
        serverProcessingTime: duration,
      }
    });
  } catch (error) {
    console.error('Upload test error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process upload test',
        timestamp: Date.now()
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Return endpoint info for upload testing
  return NextResponse.json({
    endpoint: '/api/test/upload',
    method: 'POST',
    description: 'Upload speed testing endpoint',
    maxSize: '100MB',
    supportedContentTypes: ['application/octet-stream', 'text/plain', 'multipart/form-data']
  });
}