import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const BACKEND_URL = process.env.BACKEND_URL || 'http://10.10.12.50:8009';

export async function GET(request, { params }) {
  const pathSegments = params?.path || [];
  const subPath = pathSegments.join('/');
  
  // Route to /ai/cameras/... if path begins with "cameras" or /ai/use-cases if "use-cases", otherwise default to /ai/detections/...
  let targetUrl = `${BACKEND_URL}/ai/detections/${subPath}`;
  if (pathSegments[0] === 'cameras' || pathSegments[0] === 'use-cases') {
    targetUrl = `${BACKEND_URL}/ai/${subPath}`;
  }

  const fetchHeaders = {
    'User-Agent': 'NextJS-OmniVision-Proxy/1.0',
    'Accept': '*/*'
  };
  const clientRange = request.headers.get('range');
  if (clientRange) {
    fetchHeaders['range'] = clientRange;
  }

  try {
    const res = await fetch(targetUrl, {
      headers: fetchHeaders,
      cache: 'no-store'
    });

    if (!res.ok && res.status !== 206) {
      return new NextResponse(`Media fetch failed: ${res.status}`, { status: res.status });
    }

    const contentType = res.headers.get('content-type') || (subPath.endsWith('video') ? 'video/mp4' : 'image/jpeg');
    const buffer = await res.arrayBuffer();

    const responseHeaders = {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=1800',
      'Accept-Ranges': 'bytes'
    };

    if (res.headers.get('content-range')) {
      responseHeaders['Content-Range'] = res.headers.get('content-range');
    }
    if (res.headers.get('content-length')) {
      responseHeaders['Content-Length'] = res.headers.get('content-length');
    }

    return new NextResponse(buffer, {
      status: res.status === 206 ? 206 : 200,
      headers: responseHeaders
    });
  } catch (err) {
    return new NextResponse('Media stream error', { status: 502 });
  }
}
