import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const BACKEND_URL = process.env.BACKEND_URL || 'http://10.10.12.50:8009';

export async function GET(request) {
  try {
    const res = await fetch(`${BACKEND_URL}/ai/cameras`, {
      headers: { 'Accept': 'application/json' },
      cache: 'no-store'
    });

    if (!res.ok) throw new Error(`Backend returned status ${res.status}`);

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.warn('[Next.js API] Cameras proxy failed:', error.message);
    return NextResponse.json({
      message: 'Fallback mock cameras',
      status: 'success',
      data: [
        { id: '29f1cc4b-2180-49f8-81b7-145136f49fa2', name: 'Terrace-Cam-23', is_active: true }
      ]
    });
  }
}
