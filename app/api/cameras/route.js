import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const BACKEND_URL = process.env.BACKEND_URL || 'http://10.10.12.52:8009';

export async function GET(request) {
  const backendBase = (process.env.BACKEND_URL || 'http://10.10.12.52:8009').trim().replace(/\/+$/, '');
  const targetUrl = `${backendBase}/ai/cameras`;

  try {
    const res = await fetch(targetUrl, {
      headers: { 'Accept': 'application/json' },
      cache: 'no-store'
    });

    if (!res.ok) throw new Error(`Backend returned status ${res.status}: ${res.statusText}`);

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.warn('[Next.js API] Cameras proxy failed:', error.message, 'Target:', targetUrl);
    return NextResponse.json({
      message: 'Fallback mock cameras',
      status: 'success',
      debug_target: targetUrl,
      debug_error: error.message,
      data: [
        { id: '29f1cc4b-2180-49f8-81b7-145136f49fa2', name: 'Terrace-Cam-23', is_active: true }
      ]
    });
  }
}
