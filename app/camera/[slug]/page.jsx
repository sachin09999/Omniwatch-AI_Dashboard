'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import CameraDashboardView from '@/components/CameraDashboardView';

export default function CameraPage() {
  const params = useParams();
  const slug = params?.slug || '';

  return <CameraDashboardView cameraSlug={slug} useCaseSlug="anpr" />;
}
