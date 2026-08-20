'use client';

import React from 'react';
import { User, Box } from 'lucide-react';

export default function DetectionTable({ detections, onSelectDetection }) {
  const formatTimestamp = (iso) => {
    if (!iso) return '';
    try {
      const d = new Date(iso);
      return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return iso;
    }
  };

  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-card)', borderRadius: '12px', overflow: 'hidden', marginBottom: '2rem', boxShadow: 'var(--shadow-card)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
        <thead>
          <tr style={{ background: 'var(--bg-surface-secondary)' }}>
            <th style={{ padding: '0.85rem 1.2rem', color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border-subtle)' }}>Detection / Plate</th>
            <th style={{ padding: '0.85rem 1.2rem', color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border-subtle)' }}>Severity</th>
            <th style={{ padding: '0.85rem 1.2rem', color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border-subtle)' }}>Confidence</th>
            <th style={{ padding: '0.85rem 1.2rem', color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border-subtle)' }}>Camera</th>
            <th style={{ padding: '0.85rem 1.2rem', color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border-subtle)' }}>Zone</th>
            <th style={{ padding: '0.85rem 1.2rem', color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border-subtle)' }}>Category</th>
            <th style={{ padding: '0.85rem 1.2rem', color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border-subtle)' }}>Detected Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {detections.map((item) => {
            const det = item.detections?.[0] || {};
            const meta = det.metadata || {};
            const isAnpr = Boolean(meta.plate_text);
            const className = det.class_name || 'Object';
            const confPercent = Math.round((det.confidence || 0) * 1000) / 10;

            return (
              <tr
                key={item.id}
                onClick={() => onSelectDetection(item)}
                style={{ cursor: 'pointer', borderBottom: '1px solid var(--border-subtle)', transition: 'background 150ms ease' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-surface-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <td style={{ padding: '0.75rem 1.2rem' }}>
                  {isAnpr ? (
                    <div className="license-plate-badge" style={{ transform: 'scale(0.85)', transformOrigin: 'left center' }}>
                      <div className="plate-country-strip"><span>{meta.plate_origin || 'UAE'}</span></div>
                      <div className="plate-number-text">{meta.plate_text}</div>
                    </div>
                  ) : (
                    <div className="object-class-badge" style={{ padding: '0.2rem 0.55rem', fontSize: '0.78rem' }}>
                      {className.toLowerCase() === 'person' ? <User size={13} /> : <Box size={13} />}
                      <span>{className}</span>
                    </div>
                  )}
                </td>
                <td style={{ padding: '0.75rem 1.2rem' }}>
                  <span className={`kpi-pill ${item.severity === 'high' ? 'high' : 'med'}`}>{item.severity}</span>
                </td>
                <td style={{ padding: '0.75rem 1.2rem', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-main)' }}>
                  {confPercent}%
                </td>
                <td style={{ padding: '0.75rem 1.2rem' }}>{item.camera_name}</td>
                <td style={{ padding: '0.75rem 1.2rem' }}>{item.zone_name}</td>
                <td style={{ padding: '0.75rem 1.2rem' }}>
                  <span className="usecase-tag">{item.use_case_name}</span>
                </td>
                <td style={{ padding: '0.75rem 1.2rem', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {formatTimestamp(item.detected_at)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
