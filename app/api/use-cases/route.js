import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const BACKEND_URL = process.env.BACKEND_URL || 'http://10.10.12.52:8009';

export async function GET(request) {
  try {
    const res = await fetch(`${BACKEND_URL}/ai/use-cases/`, {
      headers: { 'Accept': 'application/json' },
      cache: 'no-store'
    });

    if (!res.ok) throw new Error(`Backend returned status ${res.status}`);

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.warn('[Next.js API] Use cases proxy failed:', error.message);
    return NextResponse.json({
      message: 'Fallback mock use cases',
      status: 'success',
      data: [
        { id: 'bf6e9245-1e14-4d11-a467-41ebd48c93a4', name: 'ANPR Detection', use_case_type: 'anpr' },
        { id: 'ae933a6f-c17c-49e1-9fbc-8e75710100e7', name: 'Object Detection', use_case_type: 'object_detection' },
        { id: 'f3803638-3844-45d5-ad8f-930d25605b6b', name: 'Face Recognition', use_case_type: 'face_recognition' }
      ]
    });
  }
}
