import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const requestStartTime = Date.now();
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const testId = searchParams.get('testId') || Math.random().toString(36).substring(7);
    const sequence = parseInt(searchParams.get('seq') || '1');
    
    // Simulate minimal processing time
    await new Promise(resolve => setTimeout(resolve, 1));
    
    const responseTime = Date.now();
    const serverProcessingTime = responseTime - requestStartTime;
    
    // Return timing information
    return NextResponse.json({
      success: true,
      ping: {
        testId,
        sequence,
        serverTimestamp: responseTime,
        serverProcessingTime,
        roundTripTime: serverProcessingTime, // Client will calculate actual RTT
      },
      server: {
        timestamp: responseTime,
        processing: serverProcessingTime,
      }
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
  } catch (error) {
    console.error('Ping test error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Ping test failed',
        timestamp: Date.now()
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const requestStartTime = Date.now();
    const body = await request.json();
    
    const responseTime = Date.now();
    const serverProcessingTime = responseTime - requestStartTime;
    
    return NextResponse.json({
      success: true,
      ping: {
        testId: body.testId || Math.random().toString(36).substring(7),
        sequence: body.sequence || 1,
        clientTimestamp: body.timestamp,
        serverTimestamp: responseTime,
        serverProcessingTime,
      },
      echo: {
        receivedData: body,
        serverTime: responseTime,
      }
    });
  } catch (error) {
    console.error('Ping POST test error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Ping POST test failed',
        timestamp: Date.now()
      },
      { status: 500 }
    );
  }
}