'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Crosshair, X, Image as ImageIcon, Video, Download, User, Box } from 'lucide-react';

export default function InspectorModal({ detection, onClose }) {
  const [mediaMode, setMediaMode] = useState('photo'); // 'photo' | 'video'
  const canvasRef = useRef(null);

  const det = detection?.detections?.[0] || {};
  const meta = det.metadata || {};
  const isAnpr = Boolean(meta.plate_text);
  const className = det.class_name || 'Object';
  const confPercent = Math.round((det.confidence || 0) * 1000) / 10;

  const rawPhotoUrl = detection?.photo_url || detection?.thumbnail_url;
  const photoUrl = rawPhotoUrl?.startsWith('/ai/detections/')
    ? `/api/media/${rawPhotoUrl.replace('/ai/detections/', '')}`
    : rawPhotoUrl;

  const rawVideoUrl = detection?.video_url;
  const videoUrl = rawVideoUrl?.startsWith('/ai/detections/')
    ? `/api/media/${rawVideoUrl.replace('/ai/detections/', '')}`
    : rawVideoUrl;

  useEffect(() => {
    if (!detection || mediaMode !== 'photo') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const bbox = det.bbox || [];
    const label = `${className} • ${confPercent}%`;

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      canvas.width = img.naturalWidth || 1280;
      canvas.height = img.naturalHeight || 720;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      if (bbox.length === 4) {
        drawCleanBoundingBox(ctx, bbox, canvas.width, canvas.height, label);
      }
    };

    img.onerror = () => {
      canvas.width = 1280;
      canvas.height = 720;
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`[ Stream: ${detection.camera_name} - ${detection.zone_name} ]`, canvas.width / 2, canvas.height / 2);
    };

    if (photoUrl) {
      img.src = photoUrl;
    }
  }, [detection, mediaMode, photoUrl, className, confPercent, det.bbox]);

  const drawCleanBoundingBox = (ctx, bbox, imgW, imgH, labelText) => {
    let [c1, c2, c3, c4] = bbox;

    // Detect format: [ymin, xmin, ymax, xmax] vs [xmin, ymin, xmax, ymax]
    let x1, y1, x2, y2;
    if (c1 > c2 && c1 > imgH * 0.8) {
      // First coordinate is x
      x1 = c1; y1 = c2; x2 = c3; y2 = c4;
    } else if (c2 > c1 && c2 > imgH * 0.8) {
      // Second coordinate is x
      y1 = c1; x1 = c2; y2 = c3; x2 = c4;
    } else {
      // Standard [ymin, xmin, ymax, xmax]
      y1 = c1; x1 = c2; y2 = c3; x2 = c4;
    }

    const bx = Math.min(x1, x2);
    const by = Math.min(y1, y2);
    const bw = Math.abs(x2 - x1);
    const bh = Math.abs(y2 - y1);

    ctx.save();
    // Bounding Box border
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 3;
    ctx.fillStyle = 'rgba(59, 130, 246, 0.15)';
    ctx.fillRect(bx, by, bw, bh);
    ctx.strokeRect(bx, by, bw, bh);

    // Corner brackets
    const corner = Math.min(bw, bh) * 0.2;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(bx, by + corner); ctx.lineTo(bx, by); ctx.lineTo(bx + corner, by); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(bx + bw - corner, by); ctx.lineTo(bx + bw, by); ctx.lineTo(bx + bw, by + corner); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(bx, by + bh - corner); ctx.lineTo(bx, by + bh); ctx.lineTo(bx + corner, by + bh); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(bx + bw - corner, by + bh); ctx.lineTo(bx + bw, by + bh); ctx.lineTo(bx + bw, by + bh - corner); ctx.stroke();

    // Floating Label
    ctx.font = 'bold 14px "JetBrains Mono", monospace';
    const tagW = ctx.measureText(labelText).width + 16;
    const tagH = 26;
    const tagX = bx;
    const tagY = Math.max(0, by - tagH - 4);

    ctx.fillStyle = '#2563eb';
    ctx.fillRect(tagX, tagY, tagW, tagH);

    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(labelText, tagX + 8, tagY + (tagH / 2));
    ctx.restore();
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `detection_${meta.plate_text || className}_${detection.sr_id}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  if (!detection) return null;

  return (
    <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="inspector-modal">
        <div className="modal-header">
          <div className="modal-title">
            <Crosshair size={18} style={{ color: 'var(--primary)' }} />
            <span>AI Vision Detection Inspector</span>
          </div>
          <button onClick={onClose} className="btn btn-icon" style={{ border: 'none', background: 'transparent' }}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* Visualizer Area */}
          <div className="visualizer-pane">
            <div className="canvas-container">
              {mediaMode === 'photo' ? (
                <canvas ref={canvasRef} style={{ display: 'block', maxWidth: '100%', maxHeight: '440px', objectFit: 'contain' }}></canvas>
              ) : videoUrl ? (
                <video
                  src={videoUrl}
                  controls
                  autoPlay
                  style={{ display: 'block', maxWidth: '100%', maxHeight: '440px' }}
                />
              ) : (
                <div style={{ padding: '3rem', color: '#94a3b8', textAlign: 'center' }}>No video stream available for this event.</div>
              )}
            </div>

            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.65rem', justifyContent: 'center', width: '100%' }}>
              <button
                className={`btn ${mediaMode === 'photo' ? 'btn-primary' : ''}`}
                onClick={() => setMediaMode('photo')}
              >
                <ImageIcon size={14} />
                Snapshot Overlay
              </button>
              {videoUrl && (
                <button
                  className={`btn ${mediaMode === 'video' ? 'btn-primary' : ''}`}
                  onClick={() => setMediaMode('video')}
                >
                  <Video size={14} />
                  Video Clip
                </button>
              )}
              <button className="btn" onClick={handleDownload} title="Download Evidence Image">
                <Download size={14} />
                Download Evidence
              </button>
            </div>
          </div>

          {/* Details Area */}
          <div className="details-pane">
            <div className="meta-section">
              <div className="meta-section-title">Object & Classification</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1rem', background: 'var(--bg-surface-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '8px' }}>
                {isAnpr ? (
                  <div className="license-plate-badge" style={{ transform: 'scale(1)', transformOrigin: 'left center' }}>
                    <div className="plate-country-strip"><span>{meta.plate_origin || 'UAE'}</span></div>
                    <div className="plate-number-text">{meta.plate_text}</div>
                  </div>
                ) : (
                  <div className="object-class-badge" style={{ fontSize: '1rem', padding: '0.4rem 0.8rem' }}>
                    {className.toLowerCase() === 'person' ? <User size={18} style={{ color: 'var(--primary)' }} /> : <Box size={18} style={{ color: 'var(--primary)' }} />}
                    <span>{className}</span>
                  </div>
                )}
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>AI CONFIDENCE</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--primary)' }}>
                    {confPercent}%
                  </div>
                </div>
              </div>
            </div>

            <div className="meta-section">
              <div className="meta-section-title">Camera & Stream Details</div>
              <div className="meta-grid">
                <div className="meta-card">
                  <div className="meta-label">Camera Identifier</div>
                  <div className="meta-val">{detection.camera_name}</div>
                </div>
                <div className="meta-card">
                  <div className="meta-label">Monitored Zone</div>
                  <div className="meta-val">{detection.zone_name}</div>
                </div>
                <div className="meta-card">
                  <div className="meta-label">Severity Level</div>
                  <div className="meta-val">
                    <span className={`kpi-pill ${detection.severity === 'high' ? 'high' : 'med'}`}>{detection.severity}</span>
                  </div>
                </div>
                <div className="meta-card">
                  <div className="meta-label">Serial Record ID</div>
                  <div className="meta-val">#{detection.sr_id}</div>
                </div>
              </div>
            </div>

            <div className="meta-section">
              <div className="meta-section-title">Event Telemetry</div>
              <div className="meta-card">
                <div className="meta-label">Timestamp</div>
                <div className="meta-val" style={{ fontSize: '0.82rem' }}>{detection.detected_at}</div>
              </div>
              <div className="meta-card" style={{ marginTop: '0.4rem' }}>
                <div className="meta-label">Bounding Box Coordinates</div>
                <div className="meta-val" style={{ fontSize: '0.72rem', color: 'var(--primary)' }}>
                  {JSON.stringify(det.bbox || [])}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
