import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const BACKEND_URL = process.env.BACKEND_URL || 'http://10.10.12.50:8009';

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
        { id: 'e0820c96-a414-4fd1-aaae-4fa3beaaee7f', name: 'ANPR Detection', use_case_type: 'anpr' },
        { id: 'ca6503cf-f881-4773-ab46-f6f22289d1bf', name: 'Object Detection', use_case_type: 'object_detection' },
        { id: '5345627b-3bcd-4aa5-9dab-202ac30d7f28', name: 'Face Recognition', use_case_type: 'face_recognition' }
      ]
    });
  }
}
