'use client';

import React from 'react';
import { Camera, MapPin, Box, SearchX, Clock, ShieldAlert, Sparkles } from 'lucide-react';

export default function SnapshotGrid({
  snapshots = [],
  onSelectSnapshot,
  imageMode = 'full',
  isLoading = false
}) {
  if (isLoading) {
    return (
      <div className="snapshot-loading-container">
        <div className="snapshot-spinner"></div>
        <p>Fetching AI stream snapshots...</p>
      </div>
    );
  }

  if (!snapshots || snapshots.length === 0) {
    return (
      <div className="snapshot-empty-container">
        <SearchX size={44} className="snapshot-empty-icon" />
        <h3>No snapshots found</h3>
        <p>Try adjusting your search query or filter criteria.</p>
      </div>
    );
  }

  const formatTimestamp = (iso) => {
    if (!iso) return '';
    try {
      const d = new Date(iso);
      if (isNaN(d.getTime())) return iso;
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) + ' • ' +
             d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return iso;
    }
  };

  const getTimeAgo = (iso) => {
    if (!iso) return '';
    try {
      const d = new Date(iso);
      if (isNaN(d.getTime())) return '';
      const diffMs = new Date() - d;
      const diffSec = Math.floor(diffMs / 1000);
      if (diffSec < 0) return 'Just now';
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
    <div className="snapshot-grid">
      {snapshots.map((item) => {
        const det = item.detections?.[0] || {};
        const meta = det.metadata || {};
        const isAnpr = item.use_case_name?.toLowerCase().includes('anpr') || Boolean(meta.plate_text);
        const plateText = meta.plate_text;
        const plateOrigin = meta.plate_origin || 'UAE';
        const className = det.class_name || (isAnpr ? 'License Plate' : 'Object');
        const confPercent = Math.round((det.confidence || 0) * 1000) / 10;

        // Image selection based on imageMode (full scene high-res snapshot vs cropped snippet)
        const rawUrl = imageMode === 'crop' && item.thumbnail_url ? item.thumbnail_url : (item.photo_url || item.thumbnail_url);
        const mediaUrl = rawUrl?.startsWith('/ai/detections/')
          ? `/api/media/${rawUrl.replace('/ai/detections/', '')}`
          : rawUrl;

        // Cropped mini thumbnail
        const rawThumb = item.thumbnail_url;
        const thumbSnippetUrl = rawThumb?.startsWith('/ai/detections/')
          ? `/api/media/${rawThumb.replace('/ai/detections/', '')}`
          : rawThumb;

        return (
          <article
            key={item.id}
            className="snapshot-card"
            onClick={() => onSelectSnapshot(item)}
            tabIndex={0}
            role="button"
            aria-label={`Snapshot ${item.camera_name} - ${plateText || className}`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelectSnapshot(item);
              }
            }}
          >
            {/* Snapshot Image Container */}
            <div className="snapshot-media-box">
              {mediaUrl ? (
                <img
                  src={mediaUrl}
                  alt={isAnpr ? `Snapshot: Plate ${plateText || 'Capture'}` : `Snapshot: ${className}`}
                  className="snapshot-img"
                  loading="lazy"
                  style={{
                    objectFit: imageMode === 'crop' ? 'contain' : 'cover'
                  }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.nextElementSibling;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
              ) : null}

              {/* Fallback image */}
              <div
                className="snapshot-img-fallback"
                style={{ display: mediaUrl ? 'none' : 'flex' }}
              >
                <Camera size={32} />
                <span>Camera Snapshot</span>
              </div>

              {/* Top Badges Overlay */}
              <div className="snapshot-badge-overlay">
                <span className={`snap-severity-tag ${item.severity || 'low'}`}>
                  {item.severity === 'high' && <ShieldAlert size={12} />}
                  {item.severity || 'normal'}
                </span>
                {confPercent > 0 && (
                  <span className="snap-conf-tag">
                    <Sparkles size={11} />
                    {confPercent}%
                  </span>
                )}
              </div>

              {/* Relative Time overlay */}
              <div className="snapshot-time-overlay">
                <Clock size={11} />
                <span>{getTimeAgo(item.detected_at)}</span>
              </div>
            </div>

            {/* Snapshot Card Content */}
            <div className="snapshot-content">
              {/* Primary detection identification */}
              <div className="snapshot-primary-row">
                {isAnpr && plateText ? (
                  <div className="snapshot-plate-wrapper">
                    <div className="snapshot-plate-badge">
                      <span className="plate-origin">{plateOrigin}</span>
                      <span className="plate-digits">{plateText}</span>
                    </div>
                    {imageMode === 'full' && thumbSnippetUrl && (
                      <img
                        src={thumbSnippetUrl}
                        alt="Crop snippet"
                        className="snapshot-mini-crop"
                        title="AI Cropped Plate"
                      />
                    )}
                  </div>
                ) : (
                  <div className="snapshot-object-badge">
                    <Box size={14} />
                    <span>{className}</span>
                  </div>
                )}
              </div>

              {/* Location & Camera Info */}
              <div className="snapshot-meta-row">
                <div className="snapshot-meta-item" title={`Camera: ${item.camera_name}`}>
                  <Camera size={13} />
                  <span className="truncate">{item.camera_name || 'Camera'}</span>
                </div>
                <div className="snapshot-meta-item" title={`Zone: ${item.zone_name}`}>
                  <MapPin size={13} />
                  <span className="truncate">{item.zone_name || 'Zone'}</span>
                </div>
              </div>

              {/* Footer Timestamp */}
              <div className="snapshot-footer">
                <span className="snapshot-timestamp">{formatTimestamp(item.detected_at)}</span>
                <span className="snapshot-inspect-hint">Click to inspect →</span>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
