'use client';

import React from 'react';
import { Camera, MapPin, SearchX, Clock, ShieldAlert, Sparkles, Eye, Box, Maximize2 } from 'lucide-react';

export default function SnapshotList({
  snapshots = [],
  onSelectSnapshot,
  imageMode = 'full',
  isLoading = false
}) {
  if (isLoading) {
    return (
      <div className="snapshot-loading-container">
        <div className="snapshot-spinner"></div>
        <p>Fetching surveillance records...</p>
      </div>
    );
  }

  if (!snapshots || snapshots.length === 0) {
    return (
      <div className="snapshot-empty-container">
        <SearchX size={44} className="snapshot-empty-icon" />
        <h3>No records found</h3>
        <p>Try adjusting your search query or filter criteria.</p>
      </div>
    );
  }

  const parseDate = (iso) => {
    if (!iso) return { date: '—', time: '—', timeAgo: '' };
    try {
      const d = new Date(iso);
      if (isNaN(d.getTime())) return { date: iso, time: '', timeAgo: '' };
      
      const date = d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
      const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      
      const diffMs = new Date() - d;
      const diffSec = Math.floor(diffMs / 1000);
      let timeAgo = '';
      if (diffSec < 60) timeAgo = `${Math.max(1, diffSec)}s ago`;
      else if (diffSec < 3600) timeAgo = `${Math.floor(diffSec / 60)}m ago`;
      else if (diffSec < 86400) timeAgo = `${Math.floor(diffSec / 3600)}h ago`;
      else timeAgo = `${Math.floor(diffSec / 86400)}d ago`;

      return { date, time, timeAgo };
    } catch {
      return { date: iso, time: '', timeAgo: '' };
    }
  };

  return (
    <div className="table-responsive-wrapper">
      <table className="snapshot-table">
        <thead>
          <tr>
            <th style={{ width: '90px' }}>Sr. No</th>
            <th style={{ width: '130px' }}>Picture</th>
            <th>Vehicle Number</th>
            <th style={{ width: '130px' }}>Date</th>
            <th style={{ width: '120px' }}>Time</th>
            <th style={{ width: '110px' }}>Severity</th>
            <th>Camera & Zone</th>
            <th style={{ width: '90px', textAlign: 'center' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {snapshots.map((item, index) => {
            const det = item.detections?.[0] || {};
            const meta = det.metadata || {};
            const isAnpr = item.use_case_name?.toLowerCase().includes('anpr') || Boolean(meta.plate_text);
            const plateText = meta.plate_text;
            const plateOrigin = meta.plate_origin || 'UAE';
            const className = det.class_name || (isAnpr ? 'License Plate' : 'Object');
            const confPercent = Math.round((det.confidence || 0) * 1000) / 10;
            const { date, time, timeAgo } = parseDate(item.detected_at);

            // Picture URL
            const rawUrl = imageMode === 'crop' && item.thumbnail_url ? item.thumbnail_url : (item.photo_url || item.thumbnail_url);
            const mediaUrl = rawUrl?.startsWith('/ai/detections/')
              ? `/api/media/${rawUrl.replace('/ai/detections/', '')}`
              : rawUrl;

            // Mini cropped plate snippet
            const rawThumb = item.thumbnail_url;
            const thumbSnippetUrl = rawThumb?.startsWith('/ai/detections/')
              ? `/api/media/${rawThumb.replace('/ai/detections/', '')}`
              : rawThumb;

            return (
              <tr
                key={item.id || index}
                className="snapshot-table-row"
                onClick={() => onSelectSnapshot(item)}
              >
                {/* 1. Sr. No */}
                <td className="cell-sr-no">
                  <span className="sr-no-badge">
                    #{item.sr_id || index + 1}
                  </span>
                </td>

                {/* 2. Picture */}
                <td className="cell-picture">
                  <div className="table-img-wrapper" title="Click to inspect snapshot">
                    {mediaUrl ? (
                      <img
                        src={mediaUrl}
                        alt={`Capture ${plateText || className}`}
                        className="table-thumbnail-img"
                        loading="lazy"
                        style={{
                          objectFit: imageMode === 'crop' ? 'contain' : 'cover'
                        }}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const fb = e.currentTarget.nextElementSibling;
                          if (fb) fb.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div
                      className="table-img-fallback"
                      style={{ display: mediaUrl ? 'none' : 'flex' }}
                    >
                      <Camera size={18} />
                    </div>
                    <div className="img-hover-overlay">
                      <Maximize2 size={13} />
                    </div>
                  </div>
                </td>

                {/* 3. Vehicle Number */}
                <td className="cell-vehicle-number">
                  {isAnpr && plateText ? (
                    <div className="table-plate-flex">
                      <div className="table-plate-badge">
                        <span className="table-plate-origin">{plateOrigin}</span>
                        <span className="table-plate-digits">{plateText}</span>
                      </div>
                      {thumbSnippetUrl && imageMode === 'full' && (
                        <img
                          src={thumbSnippetUrl}
                          alt="Plate Crop"
                          className="table-plate-crop-snippet"
                          title="AI Plate Crop"
                        />
                      )}
                    </div>
                  ) : (
                    <div className="table-non-vehicle-cell">
                      <span className="no-plate-dash">—</span>
                      <span className="table-object-tag">
                        <Box size={11} />
                        {className}
                      </span>
                    </div>
                  )}
                  {confPercent > 0 && isAnpr && (
                    <span className="table-conf-subtext">
                      <Sparkles size={10} />
                      {confPercent}% confidence
                    </span>
                  )}
                </td>

                {/* 4. Date */}
                <td className="cell-date">
                  <span className="table-date-text">{date}</span>
                </td>

                {/* 5. Time */}
                <td className="cell-time">
                  <div className="table-time-group">
                    <span className="table-time-text">{time}</span>
                    {timeAgo && <span className="table-time-ago">{timeAgo}</span>}
                  </div>
                </td>

                {/* 6. Severity */}
                <td className="cell-severity">
                  <span className={`table-severity-pill ${item.severity || 'low'}`}>
                    {item.severity === 'high' && <ShieldAlert size={12} />}
                    {item.severity || 'normal'}
                  </span>
                </td>

                {/* 7. Camera & Zone */}
                <td className="cell-location">
                  <div className="table-location-group">
                    <div className="table-cam-name">
                      <Camera size={13} />
                      <span>{item.camera_name || 'Camera'}</span>
                    </div>
                    <div className="table-zone-name">
                      <MapPin size={12} />
                      <span>{item.zone_name || 'Zone'}</span>
                    </div>
                  </div>
                </td>

                {/* 8. Action */}
                <td className="cell-action">
                  <button
                    className="btn btn-icon table-action-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectSnapshot(item);
                    }}
                    title="Inspect snapshot & AI bounding box"
                  >
                    <Eye size={15} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
