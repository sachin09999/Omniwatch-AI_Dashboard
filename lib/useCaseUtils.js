/**
 * Use Case Slug Mapping Utilities
 */

export const USE_CASE_MAP = {
  anpr: {
    id: 'e0820c96-a414-4fd1-aaae-4fa3beaaee7f',
    name: 'ANPR Detection',
    slug: 'anpr',
    subtitle: 'Automated License Plate Recognition'
  },
  object: {
    id: 'ca6503cf-f881-4773-ab46-f6f22289d1bf',
    name: 'Object Detection',
    slug: 'object',
    subtitle: 'AI Object & Vehicle Classification'
  },
  objects: {
    id: 'ca6503cf-f881-4773-ab46-f6f22289d1bf',
    name: 'Object Detection',
    slug: 'object',
    subtitle: 'AI Object & Vehicle Classification'
  },
  'object-detection': {
    id: 'ca6503cf-f881-4773-ab46-f6f22289d1bf',
    name: 'Object Detection',
    slug: 'object',
    subtitle: 'AI Object & Vehicle Classification'
  },
  face: {
    id: '5345627b-3bcd-4aa5-9dab-202ac30d7f28',
    name: 'Face Recognition',
    slug: 'face',
    subtitle: 'Biometric Face Identification'
  },
  faces: {
    id: '5345627b-3bcd-4aa5-9dab-202ac30d7f28',
    name: 'Face Recognition',
    slug: 'face',
    subtitle: 'Biometric Face Identification'
  },
  'face-recognition': {
    id: '5345627b-3bcd-4aa5-9dab-202ac30d7f28',
    name: 'Face Recognition',
    slug: 'face',
    subtitle: 'Biometric Face Identification'
  }
};

export function resolveUseCase(slugOrId = '') {
  if (!slugOrId) return USE_CASE_MAP.anpr;

  const key = slugOrId.toLowerCase().trim().replace(/[_\s]+/g, '-');
  
  if (USE_CASE_MAP[key]) {
    return USE_CASE_MAP[key];
  }

  // Check by ID
  for (const item of Object.values(USE_CASE_MAP)) {
    if (item.id === slugOrId) {
      return item;
    }
  }

  // Fallback match
  if (key.includes('anpr') || key.includes('plate')) return USE_CASE_MAP.anpr;
  if (key.includes('obj')) return USE_CASE_MAP.object;
  if (key.includes('face')) return USE_CASE_MAP.face;

  return USE_CASE_MAP.anpr;
}

export function toUseCaseSlug(nameOrId = '') {
  const resolved = resolveUseCase(nameOrId);
  return resolved.slug;
}
