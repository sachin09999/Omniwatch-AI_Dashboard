import { NextResponse } from 'next/server';
import { MOCK_DETECTIONS } from '@/lib/mockData';
import { getDateRangeFromTimeFrame } from '@/lib/dateUtils';
import { sanitizeUseCaseId } from '@/lib/useCaseUtils';

export const dynamic = 'force-dynamic';

const BACKEND_URL = process.env.BACKEND_URL || 'http://10.10.12.52:8009';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  
  const rawUseCaseId = searchParams.get('use_case_id');
  const severity = searchParams.get('severity');
  const cameraId = searchParams.get('camera_id');
  const zoneId = searchParams.get('zone_id');
  const timeFrame = searchParams.get('time_frame') || 'today';
  const startDateParam = searchParams.get('start_date');
  const endDateParam = searchParams.get('end_date');
  const search = searchParams.get('search') || searchParams.get('query');
  const page = searchParams.get('page') || '1';
  const pageSize = searchParams.get('page_size') || '10';

  // 1. Sanitize use_case_id to guarantee a valid UUID
  const validUseCaseId = sanitizeUseCaseId(rawUseCaseId);

  // 2. Compute start_date and end_date in YYYY-MM-DD format
  const { startDate, endDate } = getDateRangeFromTimeFrame(timeFrame, startDateParam, endDateParam);

  try {
    const url = new URL(`${BACKEND_URL}/ai/detections`);
    if (validUseCaseId && validUseCaseId !== 'all') {
      url.searchParams.append('use_case_id', validUseCaseId);
    }
    if (severity && severity !== 'all') {
      url.searchParams.append('severity', severity);
    }
    url.searchParams.append('page', page);
    url.searchParams.append('page_size', pageSize);
    if (startDate) {
      url.searchParams.append('start_date', startDate);
    }
    if (endDate) {
      url.searchParams.append('end_date', endDate);
    }

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
    if (validUseCaseId && validUseCaseId !== 'all') {
      items = items.filter(d => d.use_case_id === validUseCaseId || d.use_case_id === rawUseCaseId);
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
