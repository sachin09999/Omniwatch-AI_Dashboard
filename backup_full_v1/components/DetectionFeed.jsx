'use client';

import React from 'react';
import { Camera, MapPin, User, Box, SearchX } from 'lucide-react';

export default function DetectionFeed({ detections, onSelectDetection, imageMode = 'full' }) {
  if (!detections || detections.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
        <SearchX size={40} style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
        <p style={{ fontSize: '1rem', fontWeight: 500 }}>No detections found matching your filter.</p>
      </div>
    );
  }

  const formatTimestamp = (iso) => {
    if (!iso) return '';
    try {
      const d = new Date(iso);
      return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return iso;
    }
  };

  const getTimeAgo = (iso) => {
    if (!iso) return '';
    try {
      const diffMs = new Date() - new Date(iso);
      const diffSec = Math.floor(diffMs / 1000);
      if (diffSec < 60) return `${Math.max(1, diffSec)}s ago`;
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return `${diffMin}m ago`;
      const diffHr = Math.floor(diffMin / 60);
      if (diffHr < 24) return `${diffHr}h ago`;
      return `${Math.floor(diffHr / 24)}d ago`;
    } catch {
      return '';
    }
  };

  return (
    <div className="detections-grid">
      {detections.map((item) => {
        const det = item.detections?.[0] || {};
        const meta = det.metadata || {};
        const isAnpr = item.use_case_name?.toLowerCase().includes('anpr') || Boolean(meta.plate_text);
        const plateText = meta.plate_text;
        const plateOrigin = meta.plate_origin || 'UAE';
        const className = det.class_name || 'Object';
        const confPercent = Math.round((det.confidence || 0) * 1000) / 10;

        // In 'full' mode: use high-res 2560x1440 camera photo; in 'crop' mode: use thumbnail crop
        const rawUrl = imageMode === 'crop' && item.thumbnail_url ? item.thumbnail_url : (item.photo_url || item.thumbnail_url);
        const mediaUrl = rawUrl?.startsWith('/ai/detections/')
          ? `/api/media/${rawUrl.replace('/ai/detections/', '')}`
          : rawUrl;

        // Crop thumbnail snippet URL
        const rawThumb = item.thumbnail_url;
        const thumbSnippetUrl = rawThumb?.startsWith('/ai/detections/')
          ? `/api/media/${rawThumb.replace('/ai/detections/', '')}`
          : rawThumb;

        return (
          <div
            key={item.id}
            className="detection-card"
            onClick={() => onSelectDetection(item)}
          >
            <div className="card-media-wrapper">
              {mediaUrl ? (
                <img
                  src={mediaUrl}
                  alt={isAnpr ? `Plate ${plateText || 'ANPR'}` : `${className} detection`}
                  className="card-thumbnail"
                  loading="lazy"
                  style={{
                    objectFit: imageMode === 'crop' ? 'contain' : 'cover',
                    background: '#090d16'
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    if (e.target.nextElementSibling) {
                      e.target.nextElementSibling.style.display = 'flex';
                    }
                  }}
                />
              ) : null}

              {/* Fallback image view */}
              <div
                style={{
                  display: mediaUrl ? 'none' : 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  height: '100%',
                  color: 'var(--text-subtle)',
                  gap: '0.4rem',
                  fontSize: '0.75rem'
                }}
              >
                <Box size={24} />
                <span>Stream Snapshot</span>
              </div>

              <div className="card-badges-overlay">
                <span className={`severity-tag ${item.severity}`}>{item.severity}</span>
                <span className="confidence-tag">{confPercent}% Conf</span>
              </div>
            </div>

            <div className="card-body">
              <div className="plate-badge-container">
                {isAnpr && plateText ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div className="license-plate-badge">
                      <div className="plate-country-strip">
                        <span>{plateOrigin}</span>
                      </div>
                      <div className="plate-number-text">{plateText}</div>
                    </div>
                    {/* If in full camera view, show the mini plate crop thumbnail as a sharp snippet */}
                    {imageMode === 'full' && thumbSnippetUrl && (
                      <img
                        src={thumbSnippetUrl}
                        alt="Plate crop"
                        style={{ height: '28px', borderRadius: '4px', border: '1px solid var(--border-subtle)', objectFit: 'contain', background: '#000' }}
                        title="AI Cropped Plate Snippet"
                      />
                    )}
                  </div>
                ) : (
                  <div className="object-class-badge">
                    {className.toLowerCase() === 'person' ? (
                      <User size={15} style={{ color: 'var(--primary)' }} />
                    ) : (
                      <Box size={15} style={{ color: 'var(--primary)' }} />
                    )}
                    <span>{className}</span>
                  </div>
                )}
                <span className="usecase-tag">{item.use_case_name}</span>
              </div>

              <div className="card-meta-list">
                <div className="card-meta-item">
                  <Camera size={13} style={{ color: 'var(--text-subtle)' }} />
                  <span>{item.camera_name || 'Camera'}</span>
                </div>
                <div className="card-meta-item">
                  <MapPin size={13} style={{ color: 'var(--text-subtle)' }} />
                  <span>{item.zone_name || 'Zone'}</span>
                </div>
              </div>

              <div className="card-footer">
                <span>{formatTimestamp(item.detected_at)}</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>{getTimeAgo(item.detected_at)}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
