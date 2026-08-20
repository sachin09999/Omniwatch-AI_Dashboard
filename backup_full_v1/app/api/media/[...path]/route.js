import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://10.10.12.52:8009';

export async function GET(request, { params }) {
  const pathSegments = params?.path || [];
  const subPath = pathSegments.join('/');
  const targetUrl = `${BACKEND_URL}/ai/detections/${subPath}`;

  try {
    const res = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'NextJS-OmniVision-Proxy/1.0'
      }
    });

    if (!res.ok) {
      return new NextResponse(`Media fetch failed: ${res.status}`, { status: res.status });
    }

    const contentType = res.headers.get('content-type') || 'image/jpeg';
    const buffer = await res.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600'
      }
    });
  } catch (err) {
    return new NextResponse('Media stream error', { status: 502 });
  }
}
