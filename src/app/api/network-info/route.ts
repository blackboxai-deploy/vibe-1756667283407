import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Extract IP and headers information
    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const connectingIp = request.headers.get('x-connecting-ip');
    
    // Determine the client IP address
    let clientIp = 'unknown';
    if (forwarded) {
      clientIp = forwarded.split(',')[0].trim();
    } else if (realIp) {
      clientIp = realIp;
    } else if (connectingIp) {
      clientIp = connectingIp;
    }
    
    // Get additional network information from headers
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const acceptLanguage = request.headers.get('accept-language') || 'unknown';
    const acceptEncoding = request.headers.get('accept-encoding') || 'unknown';
    
    // Connection information
    const connection = request.headers.get('connection') || 'unknown';
    const protocol = request.headers.get('x-forwarded-proto') || 'https';
    
    // Server information
    const serverTimestamp = Date.now();
    const host = request.headers.get('host') || 'unknown';
    
    // Simulate ISP detection (in a real app, you'd use a service like ipinfo.io)
    const mockISPs = [
      'Comcast Business',
      'Verizon FiOS',
      'AT&T Fiber',
      'Cox Communications',
      'Spectrum',
      'CenturyLink',
      'Xfinity',
      'T-Mobile Home Internet'
    ];
    const simulatedISP = mockISPs[Math.floor(Math.random() * mockISPs.length)];
    
    // Mock location data
    const mockLocations = [
      { city: 'San Francisco', region: 'California', country: 'United States' },
      { city: 'New York', region: 'New York', country: 'United States' },
      { city: 'Los Angeles', region: 'California', country: 'United States' },
      { city: 'Chicago', region: 'Illinois', country: 'United States' },
      { city: 'Miami', region: 'Florida', country: 'United States' }
    ];
    const simulatedLocation = mockLocations[Math.floor(Math.random() * mockLocations.length)];
    
    return NextResponse.json({
      success: true,
      networkInfo: {
        ip: clientIp,
        isp: simulatedISP,
        location: simulatedLocation,
        connectionType: 'Broadband', // Could be enhanced with actual detection
        protocol: protocol.toUpperCase(),
      },
      headers: {
        userAgent,
        acceptLanguage,
        acceptEncoding,
        connection,
        host,
      },
      server: {
        timestamp: serverTimestamp,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      }
    });
  } catch (error) {
    console.error('Network info error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to retrieve network information',
        timestamp: Date.now()
      },
      { status: 500 }
    );
  }
}