/**
 * Camera URL slug and resolution utilities
 */

export function toCameraSlug(nameOrId = '') {
  if (!nameOrId) return '';
  return nameOrId
    .toLowerCase()
    .trim()
    .replace(/[_\s]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/--+/g, '-');
}

export function findCameraBySlugOrId(cameras = [], slugOrId = '') {
  if (!slugOrId || !cameras || cameras.length === 0) return null;
  
  const target = slugOrId.toLowerCase().trim();
  const cleanTarget = toCameraSlug(target);

  return (
    cameras.find((cam) => {
      const camId = (cam.id || '').toLowerCase();
      const camName = (cam.name || cam.camera_name || '').toLowerCase();
      const camSlug = toCameraSlug(camName);

      if (camId === target) return true;
      if (camName === target) return true;
      if (camSlug === cleanTarget) return true;

      // Handle common variants like 'ip-parking' vs 'ipcam-12-parking'
      const normTarget = cleanTarget.replace(/[^a-z0-9]/g, '');
      const normCamSlug = camSlug.replace(/[^a-z0-9]/g, '');
      if (normTarget && normCamSlug && (normCamSlug.includes(normTarget) || normTarget.includes(normCamSlug))) {
        return true;
      }

      return false;
    }) || null
  );
}

export function getCameraPreviewUrl(cam) {
  if (!cam) return null;
  const raw = cam.preview_url || cam.photo_url || cam.thumbnail_url;
  if (!raw) return null;
  if (raw.startsWith('/ai/cameras/')) {
    return `/api/media/cameras/${raw.replace('/ai/cameras/', '')}`;
  }
  if (raw.startsWith('/ai/detections/')) {
    return `/api/media/${raw.replace('/ai/detections/', '')}`;
  }
  return raw;
}
