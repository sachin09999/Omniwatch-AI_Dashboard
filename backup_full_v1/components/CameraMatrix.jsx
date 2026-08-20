'use client';

import React from 'react';
import { MapPin, Cpu, ShieldAlert, Layers } from 'lucide-react';

export default function CameraMatrix({ cameraConfigs }) {
  return (
    <div className="matrix-grid">
      {cameraConfigs.map((cfg) => (
        <div key={cfg.id} className="camera-card">
          <div className="camera-card-header">
            <div className="camera-name">{cfg.camera_name || `Camera ${cfg.sr_id}`}</div>
            <div className={`stream-status-badge ${cfg.is_active ? '' : 'inactive'}`}>
              <span className={`status-dot ${cfg.is_active ? '' : 'error'}`}></span>
              {cfg.is_active ? 'ONLINE' : 'OFFLINE'}
            </div>
          </div>

          <div className="card-meta-list">
            <div className="card-meta-item">
              <MapPin size={14} style={{ color: 'var(--text-muted)' }} />
              <span>{cfg.zone_name || 'Zone N/A'}</span>
            </div>
            <div className="card-meta-item">
              <Cpu size={14} style={{ color: 'var(--text-muted)' }} />
              <span className="usecase-tag">{cfg.use_case_name}</span>
            </div>
            <div className="card-meta-item">
              <ShieldAlert size={14} style={{ color: 'var(--text-muted)' }} />
              <span className={`kpi-pill ${cfg.severity === 'high' ? 'high' : 'med'}`}>
                {cfg.severity} Severity
              </span>
            </div>
            {cfg.profile_count !== null && (
              <div className="card-meta-item">
                <Layers size={14} style={{ color: 'var(--text-muted)' }} />
                <span>Profile Count: <strong>{cfg.profile_count}</strong></span>
              </div>
            )}
          </div>

          <div className="card-footer">
            <span>Cooldown: {cfg.detection_cooldown_interval}s</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>
              ID: {cfg.camera_id.substring(0, 8)}...
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
