import { NextResponse } from 'next/server';
import { MOCK_DASHBOARD_DATA } from '@/lib/mockData';

const BACKEND_URL = process.env.BACKEND_URL || 'http://10.10.12.50:8009';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const timeFrame = searchParams.get('time_frame') || 'today';

  try {
    const res = await fetch(`${BACKEND_URL}/ai/detections/dashboard?time_frame=${timeFrame}`, {
      headers: { 'Accept': 'application/json' },
      cache: 'no-store'
    });

    if (!res.ok) {
      throw new Error(`Backend returned status ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.warn('[Next.js API] Dashboard proxy failed, using mock data:', error.message);
    return NextResponse.json(MOCK_DASHBOARD_DATA);
  }
}
