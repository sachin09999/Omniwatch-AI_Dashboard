'use client';

import React, { useEffect, useRef } from 'react';

export default function AnalyticsView({ detections }) {
  const canvasRef = useRef(null);

  // Top license plates
  const plateCounts = {};
  detections.forEach((item) => {
    const plate = item.detections?.[0]?.metadata?.plate_text;
    if (plate) {
      plateCounts[plate] = (plateCounts[plate] || 0) + 1;
    }
  });

  const sortedPlates = Object.entries(plateCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

    canvas.width = canvas.parentElement?.clientWidth || 600;
    canvas.height = 240;

    const hours = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];
    const values = [24, 65, 110, 85, 140, 195, 130, 80];

    const padding = { top: 25, right: 25, bottom: 35, left: 45 };
    const w = canvas.width - padding.left - padding.right;
    const h = canvas.height - padding.top - padding.bottom;
    const maxVal = 200;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Grid lines
    ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';
    ctx.lineWidth = 1;
    ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'right';

    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (h / 4) * i;
      const val = Math.round(maxVal - (maxVal / 4) * i);
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + w, y);
      ctx.stroke();
      ctx.fillText(val, padding.left - 8, y + 4);
    }

    const points = hours.map((hour, idx) => {
      const x = padding.left + (w / (hours.length - 1)) * idx;
      const y = padding.top + h - (values[idx] / maxVal) * h;
      return { x, y, hour, val: values[idx] };
    });

    // Gradient Area
    const grad = ctx.createLinearGradient(0, padding.top, 0, padding.top + h);
    grad.addColorStop(0, isDark ? 'rgba(59, 130, 246, 0.35)' : 'rgba(37, 99, 235, 0.2)');
    grad.addColorStop(1, 'rgba(37, 99, 235, 0.0)');

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    points.forEach((p) => ctx.lineTo(p.x, p.y));
    ctx.lineTo(points[points.length - 1].x, padding.top + h);
    ctx.lineTo(points[0].x, padding.top + h);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Line
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    points.forEach((p) => ctx.lineTo(p.x, p.y));
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Points
    points.forEach((p) => {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#2563eb';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
      ctx.textAlign = 'center';
      ctx.fillText(p.hour, p.x, padding.top + h + 20);
    });
  }, [detections]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.25rem', marginBottom: '2rem' }}>
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-card)', borderRadius: '12px', padding: '1.25rem', boxShadow: 'var(--shadow-card)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>Hourly Detection Frequency</h3>
          <span className="kpi-pill info">Today</span>
        </div>
        <div style={{ width: '100%', height: '240px', position: 'relative' }}>
          <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }}></canvas>
        </div>
      </div>

      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-card)', borderRadius: '12px', padding: '1.25rem', boxShadow: 'var(--shadow-card)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>Top Detected Plates</h3>
          <span className="kpi-pill info">ANPR</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {sortedPlates.length > 0 ? (
            sortedPlates.map(([plate, count], idx) => (
              <div
                key={plate}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.85rem', background: 'var(--bg-surface-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '6px' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    #{idx + 1}
                  </span>
                  <div className="license-plate-badge" style={{ transform: 'scale(0.85)', transformOrigin: 'left center' }}>
                    <div className="plate-country-strip"><span>UAE</span></div>
                    <div className="plate-number-text">{plate}</div>
                  </div>
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--primary)' }}>
                  {count} hits
                </span>
              </div>
            ))
          ) : (
            <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
              No ANPR plates detected yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
