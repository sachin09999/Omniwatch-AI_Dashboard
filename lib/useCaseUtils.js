/**
 * Use Case Slug Mapping & Utilities
 * Connected to Live Surveillance Backend
 */

export const USE_CASE_MAP = {
  anpr: {
    id: 'bf6e9245-1e14-4d11-a467-41ebd48c93a4',
    name: 'ANPR Detection',
    slug: 'anpr',
    use_case_type: 'anpr',
    subtitle: 'Automated License Plate Recognition & Vehicle Telemetry'
  },
  'anpr-detection': {
    id: 'bf6e9245-1e14-4d11-a467-41ebd48c93a4',
    name: 'ANPR Detection',
    slug: 'anpr',
    use_case_type: 'anpr',
    subtitle: 'Automated License Plate Recognition & Vehicle Telemetry'
  },
  object: {
    id: 'ae933a6f-c17c-49e1-9fbc-8e75710100e7',
    name: 'Object Detection',
    slug: 'object',
    use_case_type: 'object_detection',
    subtitle: 'AI Object & Vehicle Classification'
  },
  objects: {
    id: 'ae933a6f-c17c-49e1-9fbc-8e75710100e7',
    name: 'Object Detection',
    slug: 'object',
    use_case_type: 'object_detection',
    subtitle: 'AI Object & Vehicle Classification'
  },
  'object-detection': {
    id: 'ae933a6f-c17c-49e1-9fbc-8e75710100e7',
    name: 'Object Detection',
    slug: 'object',
    use_case_type: 'object_detection',
    subtitle: 'AI Object & Vehicle Classification'
  },
  face: {
    id: 'f3803638-3844-45d5-ad8f-930d25605b6b',
    name: 'Face Recognition',
    slug: 'face',
    use_case_type: 'face_recognition',
    subtitle: 'Biometric Face Identification & Surveillance'
  },
  faces: {
    id: 'f3803638-3844-45d5-ad8f-930d25605b6b',
    name: 'Face Recognition',
    slug: 'face',
    use_case_type: 'face_recognition',
    subtitle: 'Biometric Face Identification & Surveillance'
  },
  'face-recognition': {
    id: 'f3803638-3844-45d5-ad8f-930d25605b6b',
    name: 'Face Recognition',
    slug: 'face',
    use_case_type: 'face_recognition',
    subtitle: 'Biometric Face Identification & Surveillance'
  }
};

/**
 * Resolves a use case object by slug, name, or UUID
 * Optionally matches against live fetched useCases array
 */
export function resolveUseCase(slugOrId = '', dynamicUseCases = []) {
  if (!slugOrId) return USE_CASE_MAP.anpr;

  const raw = String(slugOrId).trim();
  const key = raw.toLowerCase().replace(/[_\s]+/g, '-');

  // 1. If dynamicUseCases list is provided from backend API
  if (Array.isArray(dynamicUseCases) && dynamicUseCases.length > 0) {
    const found = dynamicUseCases.find((uc) => {
      if (!uc) return false;
      const ucId = String(uc.id || uc.use_case_id || '').toLowerCase();
      const ucType = String(uc.use_case_type || '').toLowerCase().replace(/[_\s]+/g, '-');
      const ucName = String(uc.name || uc.use_case_name || '').toLowerCase().replace(/[_\s]+/g, '-');
      const target = raw.toLowerCase();

      return ucId === target || ucType === key || ucName === key || ucType.includes(key) || key.includes(ucType);
    });

    if (found) {
      const slug = (found.use_case_type === 'face_recognition' || String(found.name).toLowerCase().includes('face'))
        ? 'face'
        : (found.use_case_type === 'object_detection' || String(found.name).toLowerCase().includes('object'))
        ? 'object'
        : 'anpr';

      return {
        id: found.id || found.use_case_id || (USE_CASE_MAP[slug] ? USE_CASE_MAP[slug].id : found.id),
        name: found.name || found.use_case_name || USE_CASE_MAP[slug].name,
        slug,
        use_case_type: found.use_case_type || USE_CASE_MAP[slug].use_case_type,
        subtitle: USE_CASE_MAP[slug]?.subtitle || 'AI Vision Telemetry'
      };
    }
  }

  // 2. Direct key match in USE_CASE_MAP
  if (USE_CASE_MAP[key]) {
    return USE_CASE_MAP[key];
  }

  // 3. Match by UUID in USE_CASE_MAP
  for (const item of Object.values(USE_CASE_MAP)) {
    if (item.id === raw || item.id.toLowerCase() === raw.toLowerCase()) {
      return item;
    }
  }

  // 4. Fuzzy fallback match
  if (key.includes('face') || key.includes('fr') || key.includes('person')) return USE_CASE_MAP.face;
  if (key.includes('obj') || key.includes('vehic')) return USE_CASE_MAP.object;
  if (key.includes('anpr') || key.includes('plate')) return USE_CASE_MAP.anpr;

  return USE_CASE_MAP.anpr;
}

export function toUseCaseSlug(nameOrId = '', dynamicUseCases = []) {
  const resolved = resolveUseCase(nameOrId, dynamicUseCases);
  return resolved.slug;
}

