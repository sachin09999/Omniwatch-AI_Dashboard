import { NextResponse } from 'next/server';
import { MOCK_DETECTIONS } from '@/lib/mockData';

export const dynamic = 'force-dynamic';

const BACKEND_URL = process.env.BACKEND_URL || 'http://10.10.12.50:8009';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  
  const useCaseId = searchParams.get('use_case_id');
  const severity = searchParams.get('severity');
  const cameraId = searchParams.get('camera_id');
  const zoneId = searchParams.get('zone_id');
  const timeFrame = searchParams.get('time_frame');
  const startDate = searchParams.get('start_date');
  const endDate = searchParams.get('end_date');
  const search = searchParams.get('search') || searchParams.get('query');
  const page = searchParams.get('page') || '1';
  const pageSize = searchParams.get('page_size') || '10';

  try {
    const url = new URL(`${BACKEND_URL}/ai/detections`);
    if (useCaseId && useCaseId !== 'all') url.searchParams.append('use_case_id', useCaseId);
    if (severity && severity !== 'all') url.searchParams.append('severity', severity);
    if (cameraId && cameraId !== 'all') url.searchParams.append('camera_id', cameraId);
    if (zoneId && zoneId !== 'all') url.searchParams.append('zone_id', zoneId);
    
    // time_frame filter
    if (timeFrame && timeFrame !== 'all' && timeFrame !== 'all_time') {
      url.searchParams.append('time_frame', timeFrame);
    }
    if (startDate) url.searchParams.append('start_date', startDate);
    if (endDate) url.searchParams.append('end_date', endDate);
    if (search && search.trim()) url.searchParams.append('search', search.trim());

    url.searchParams.append('page', page);
    url.searchParams.append('page_size', pageSize);

    const userTimezone = request.headers.get('x-user-timezone') || 'Asia/Kolkata';

    const res = await fetch(url.toString(), {
      headers: {
        'Accept': 'application/json',
        'X-User-Timezone': userTimezone
      },
      cache: 'no-store'
    });

    if (!res.ok) throw new Error(`Backend returned status ${res.status}`);

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.warn('[Next.js API] Detections proxy failed, using mock data:', error.message);
    
    let items = [...MOCK_DETECTIONS.data.items];
    if (useCaseId && useCaseId !== 'all') {
      items = items.filter(d => d.use_case_id === useCaseId);
    }
    if (severity && severity !== 'all') {
      items = items.filter(d => d.severity?.toLowerCase() === severity.toLowerCase());
    }
    if (cameraId && cameraId !== 'all') {
      items = items.filter(d => d.camera_id === cameraId || d.camera_name === cameraId);
    }
    if (zoneId && zoneId !== 'all') {
      items = items.filter(d => d.zone_id === zoneId || d.zone_name === zoneId);
    }
    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      items = items.filter(d =>
        (d.camera_name || '').toLowerCase().includes(q) ||
        (d.zone_name || '').toLowerCase().includes(q) ||
        (d.detections?.[0]?.metadata?.plate_text || '').toLowerCase().includes(q) ||
        (d.detections?.[0]?.class_name || '').toLowerCase().includes(q)
      );
    }

    const p = parseInt(page, 10) || 1;
    const ps = parseInt(pageSize, 10) || 10;
    const start = (p - 1) * ps;
    const paginated = items.slice(start, start + ps);

    return NextResponse.json({
      message: 'Success',
      status: 'success',
      data: {
        items: paginated,
        total: items.length,
        page: p,
        page_size: ps
      }
    });
  }
}

