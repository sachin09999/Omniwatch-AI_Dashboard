'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import CameraDashboardView from '@/components/CameraDashboardView';

export default function DynamicTopLevelPage() {
  const params = useParams();
  const slug = (params?.slug || '').toLowerCase();

  // If slug is a use-case keyword (/anpr, /object, /objects, /face, /faces)
  if (['anpr', 'object', 'objects', 'object-detection', 'face', 'faces', 'face-recognition'].includes(slug)) {
    return <CameraDashboardView cameraSlug="" useCaseSlug={slug} />;
  }

  // Otherwise, it's a camera slug (/terrace-cam-23, /ip-parking)
  return <CameraDashboardView cameraSlug={slug} useCaseSlug="anpr" />;
}
