import { NextResponse } from 'next/server';
import { MOCK_DETECTIONS } from '@/lib/mockData';

const BACKEND_URL = process.env.BACKEND_URL || 'http://10.10.12.50:8009';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  
  const useCaseId = searchParams.get('use_case_id');
  const severity = searchParams.get('severity');
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('page_size') || '10', 10);
  const startDate = searchParams.get('start_date');
  const endDate = searchParams.get('end_date');

  try {
    const url = new URL(`${BACKEND_URL}/ai/detections`);
    if (useCaseId && useCaseId !== 'all') url.searchParams.append('use_case_id', useCaseId);
    if (severity && severity !== 'all') url.searchParams.append('severity', severity);
    url.searchParams.append('page', page.toString());
    url.searchParams.append('page_size', pageSize.toString());
    if (startDate) url.searchParams.append('start_date', startDate);
    if (endDate) url.searchParams.append('end_date', endDate);

    const res = await fetch(url.toString(), {
      headers: { 'Accept': 'application/json' },
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
      items = items.filter(d => d.severity.toLowerCase() === severity.toLowerCase());
    }

    const start = (page - 1) * pageSize;
    const paginated = items.slice(start, start + pageSize);

    return NextResponse.json({
      message: 'Success',
      status: 'success',
      data: {
        items: paginated.length > 0 ? paginated : items,
        total: items.length,
        page,
        page_size: pageSize
      }
    });
  }
}
