import { NextResponse } from 'next/server';
import { MOCK_CAMERA_CONFIGS } from '@/lib/mockData';
import { getBackendBase, getBackendHeaders } from '@/lib/backendClient';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const useCaseId = searchParams.get('use_case_id');
  const backendBase = getBackendBase();

  try {
    const url = new URL(`${backendBase}/ai/camera-ai-configs`);
    if (useCaseId) url.searchParams.append('use_case_id', useCaseId);

    const res = await fetch(url.toString(), {
      headers: getBackendHeaders(),
      cache: 'no-store'
    });

    if (!res.ok) throw new Error(`Backend returned status ${res.status}: ${res.statusText}`);

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.warn('[Next.js API] Camera configs proxy failed, using mock data:', error.message);
    let configs = [...MOCK_CAMERA_CONFIGS.data];
    if (useCaseId) {
      configs = configs.filter(c => c.use_case_id === useCaseId);
    }
    return NextResponse.json({
      message: 'Success',
      status: 'success',
      data: configs
    });
  }
}
