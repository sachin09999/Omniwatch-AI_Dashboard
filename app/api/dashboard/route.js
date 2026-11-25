import { NextResponse } from 'next/server';
import { MOCK_DASHBOARD_DATA } from '@/lib/mockData';
import { getBackendBase, backendFetch } from '@/lib/backendClient';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const timeFrame = searchParams.get('time_frame') || 'all_time';
  const backendBase = getBackendBase();

  try {
    const res = await backendFetch(`${backendBase}/ai/detections/dashboard?time_frame=${timeFrame}`);

    if (!res.ok) {
      throw new Error(`Backend returned status ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.warn('[Next.js API] Dashboard proxy failed, using mock data:', error.message);
    return NextResponse.json(MOCK_DASHBOARD_DATA);
  }
}
