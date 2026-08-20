'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import CameraDashboardView from '@/components/CameraDashboardView';

export default function DirectCameraUseCasePage() {
  const params = useParams();
  const slug = params?.slug || '';
  const useCaseSlug = params?.useCaseSlug || 'anpr';

  return <CameraDashboardView cameraSlug={slug} useCaseSlug={useCaseSlug} />;
}
