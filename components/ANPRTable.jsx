'use client';

import React from 'react';
import { Camera, SearchX, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

export default function ANPRTable({
  detections = [],
  onSelectDetection,
  isLoading = false,
  sortField = 'detected_at',
  sortDirection = 'desc',
  onSortChange,
  useCaseName = 'ANPR'
}) {
  if (isLoading) {
    return (
      <div className="anpr-empty-box">
        <div className="anpr-spinner"></div>
        <p>Loading {useCaseName} detections...</p>
      </div>
    );
  }

  if (!detections || detections.length === 0) {
    return (
      <div className="anpr-empty-box">
        <SearchX size={40} style={{ opacity: 0.4, marginBottom: '0.5rem' }} />
        <h4 style={{ fontWeight: 600, color: 'var(--text-main)' }}>No {useCaseName} records found</h4>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Try adjusting your search criteria or date filter.</p>
      </div>
    );
  }

  const formatDateTime = (iso) => {
    if (!iso) return '—';
    try {
      const d = new Date(iso);
      if (isNaN(d.getTime())) return iso;
      
      const day = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
      const time = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase();
      return `${day}, ${time}`;
    } catch {
      return iso;
    }
  };

  const renderSortIcon = (field) => {
    if (sortField !== field) {
      return <ArrowUpDown size={13} className="anpr-sort-icon neutral" />;
    }
    return sortDirection === 'asc'
      ? <ArrowUp size={13} className="anpr-sort-icon active" />
      : <ArrowDown size={13} className="anpr-sort-icon active" />;
  };

  const handleHeaderClick = (field) => {
    if (onSortChange) {
      onSortChange(field);
    }
  };

  return (
    <div className="anpr-table-container">
      <table className="anpr-table">
        <thead>
          <tr>
            {/* 1. ID - Sortable */}
            <th
              style={{ width: '100px' }}
              className="sortable-header"
              onClick={() => handleHeaderClick('sr_id')}
              title="Sort by Record ID"
            >
              <div className="header-cell-flex">
                <span>ID</span>
                {renderSortIcon('sr_id')}
              </div>
            </th>

            {/* 2. Date & Time - Sortable */}
            <th
              style={{ width: '220px' }}
              className="sortable-header"
              onClick={() => handleHeaderClick('detected_at')}
              title="Sort by Timestamp"
            >
              <div className="header-cell-flex">
                <span>Date & Time</span>
                {renderSortIcon('detected_at')}
              </div>
            </th>

            {/* 3. Detection Source - Not Sortable */}
            <th style={{ width: '160px' }}>
              <span>Detection Source</span>
            </th>

            {/* 4. Detection Data - Sortable */}
            <th
              style={{ width: '180px' }}
              className="sortable-header"
              onClick={() => handleHeaderClick('plate_text')}
              title="Sort by Plate Number"
            >
              <div className="header-cell-flex">
                <span>Detection Data</span>
                {renderSortIcon('plate_text')}
              </div>
            </th>

            {/* 5. Camera - Sortable */}
            <th
              style={{ width: '200px' }}
              className="sortable-header"
              onClick={() => handleHeaderClick('camera_name')}
              title="Sort by Camera Name"
            >
              <div className="header-cell-flex">
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Camera size={14} />
                  <span>Camera</span>
                </div>
                {renderSortIcon('camera_name')}
              </div>
            </th>

            {/* 6. Zone - Sortable */}
            <th
              style={{ width: '160px' }}
              className="sortable-header"
              onClick={() => handleHeaderClick('zone_name')}
              title="Sort by Zone"
            >
              <div className="header-cell-flex">
                <span>Zone</span>
                {renderSortIcon('zone_name')}
              </div>
            </th>

            {/* 7. Status - Not Sortable */}
            <th style={{ width: '120px' }}>
              <span>Status</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {detections.map((item, idx) => {
            const det = item.detections?.[0] || {};
            const meta = det.metadata || {};
            const isFace = item.use_case_name?.toLowerCase().includes('face');
            const plateText = meta.plate_text || (isFace ? (det.class_name === 'unknown' ? 'Unidentified Face' : det.class_name || 'Face') : det.class_name ? det.class_name.toUpperCase() : '—');
            const formattedDate = formatDateTime(item.detected_at);
            
            // Image source: Use full scene photo snapshot for Detection Source
            const rawUrl = item.photo_url || item.thumbnail_url;
            const mediaUrl = rawUrl?.startsWith('/ai/detections/')
              ? `/api/media/${rawUrl.replace('/ai/detections/', '')}`
              : rawUrl;

            return (
              <tr
                key={item.id || idx}
                className="anpr-table-row"
                onClick={() => onSelectDetection(item)}
              >
                {/* 1. ID */}
                <td className="anpr-td-id">
                  {item.sr_id || '—'}
                </td>

                {/* 2. Date & Time */}
                <td className="anpr-td-datetime">
                  <span className="anpr-datetime-badge">
                    {formattedDate}
                  </span>
                </td>

                {/* 3. Detection Source (Full Scene Thumbnail with Blue Border) */}
                <td className="anpr-td-source">
                  <div
                    className="anpr-thumb-box"
                    title="Click to view snapshot details"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectDetection(item);
                    }}
                  >
                    {mediaUrl ? (
                      <img
                        src={mediaUrl}
                        alt={`Plate: ${plateText}`}
                        className="anpr-thumb-img"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const fb = e.currentTarget.nextElementSibling;
                          if (fb) fb.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div
                      className="anpr-thumb-fallback"
                      style={{ display: mediaUrl ? 'none' : 'flex' }}
                    >
                      <Camera size={16} />
                    </div>
                  </div>
                </td>

                {/* 4. Detection Data */}
                <td className="anpr-td-data">
                  <span className="anpr-plate-code">
                    {plateText}
                  </span>
                </td>

                {/* 5. Camera */}
                <td className="anpr-td-camera">
                  <a
                    href="#camera"
                    className="anpr-link"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onSelectDetection(item);
                    }}
                  >
                    <Camera size={14} style={{ flexShrink: 0 }} />
                    <span>{item.camera_name || 'Camera'}</span>
                  </a>
                </td>

                {/* 6. Zone */}
                <td className="anpr-td-zone">
                  <a
                    href="#zone"
                    className="anpr-link"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onSelectDetection(item);
                    }}
                  >
                    {item.zone_name || 'Zone 02'}
                  </a>
                </td>

                {/* 7. Status */}
                <td className="anpr-td-status">
                  <span className="anpr-status-badge">
                    active
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
