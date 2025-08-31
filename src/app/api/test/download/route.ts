import { NextRequest, NextResponse } from 'next/server';

// Generate test data for download speed testing
function generateTestData(sizeInMB: number): string {
  const sizeInBytes = sizeInMB * 1024 * 1024;
  const chunkSize = 1024; // 1KB chunks
  const chunks = Math.ceil(sizeInBytes / chunkSize);
  
  let data = '';
  const chunk = 'A'.repeat(chunkSize);
  
  for (let i = 0; i < chunks; i++) {
    data += chunk;
  }
  
  return data.substring(0, sizeInBytes);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const size = parseFloat(searchParams.get('size') || '1'); // Default 1MB
    const timestamp = searchParams.get('timestamp') || Date.now().toString();
    
    // Validate size (between 0.1MB and 100MB)
    const validSize = Math.max(0.1, Math.min(100, size));
    
    // Generate test data
    const testData = generateTestData(validSize);
    
    // Add headers to prevent caching and track timing
    const headers = new Headers({
      'Content-Type': 'application/octet-stream',
      'Content-Length': testData.length.toString(),
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'X-Test-Size': validSize.toString(),
      'X-Test-Timestamp': timestamp,
    });
    
    return new NextResponse(testData, { headers });
  } catch (error) {
    console.error('Download test error:', error);
    return NextResponse.json(
      { error: 'Failed to generate test data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const size = parseFloat(searchParams.get('size') || '1');
    const validSize = Math.max(0.1, Math.min(100, size));
    
    const testData = generateTestData(validSize);
    
    return NextResponse.json({
      size: validSize,
      dataLength: testData.length,
      timestamp: Date.now(),
      data: testData
    });
  } catch (error) {
    console.error('Download test POST error:', error);
    return NextResponse.json(
      { error: 'Failed to generate test data' },
      { status: 500 }
    );
  }
}