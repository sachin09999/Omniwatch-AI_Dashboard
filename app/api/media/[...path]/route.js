import { NextResponse } from 'next/server';
import { getBackendBase, getBackendHeaders } from '@/lib/backendClient';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  const pathSegments = params?.path || [];
  const subPath = pathSegments.join('/');
  const backendBase = getBackendBase();
  
  // Route to /ai/cameras/... if path begins with "cameras" or /ai/use-cases if "use-cases", otherwise default to /ai/detections/...
  let targetUrl = `${backendBase}/ai/detections/${subPath}`;
  if (pathSegments[0] === 'cameras' || pathSegments[0] === 'use-cases') {
    targetUrl = `${backendBase}/ai/${subPath}`;
  }

  const extraHeaders = {
    'User-Agent': 'NextJS-OmniVision-Proxy/1.0',
    'Accept': '*/*'
  };
  const clientRange = request.headers.get('range');
  if (clientRange) {
    extraHeaders['range'] = clientRange;
  }

  try {
    const res = await fetch(targetUrl, {
      headers: getBackendHeaders(extraHeaders),
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
