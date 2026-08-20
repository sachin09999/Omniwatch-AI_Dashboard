'use client';

import React, { useState } from 'react';
import { Sliders, X } from 'lucide-react';

export default function SettingsModal({
  isOpen,
  onClose,
  refreshInterval,
  onSaveSettings
}) {
  const [rate, setRate] = useState(refreshInterval);
  const [backendUrl, setBackendUrl] = useState('http://10.10.12.50:8009');
  const [forceMock, setForceMock] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveSettings({
      refreshInterval: parseInt(rate, 10),
      backendUrl,
      forceMock
    });
    onClose();
  };

  return (
    <div className="modal-backdrop active" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="inspector-modal" style={{ maxWidth: '550px' }}>
        <div className="modal-header">
          <div className="modal-title">
            <Sliders size={18} style={{ color: 'var(--primary)' }} />
            <span>Dashboard Connection Settings</span>
          </div>
          <button onClick={onClose} className="btn btn-icon-only" style={{ border: 'none', background: 'transparent' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Backend Server URL
            </label>
            <input
              type="text"
              value={backendUrl}
              onChange={(e) => setBackendUrl(e.target.value)}
              style={{ width: '100%', padding: '0.6rem 0.85rem', background: 'rgba(10, 15, 28, 0.8)', border: '1px solid var(--border-card)', borderRadius: '8px', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', outline: 'none' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Auto-Refresh Interval
            </label>
            <select
              className="filter-select"
              style={{ width: '100%' }}
              value={rate}
              onChange={(e) => setRate(e.target.value)}
            >
              <option value="5">Every 5 seconds (High Frequency)</option>
              <option value="10">Every 10 seconds (Standard)</option>
              <option value="30">Every 30 seconds</option>
              <option value="0">Disabled (Manual Only)</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <input
              type="checkbox"
              id="forceMockCheckbox"
              checked={forceMock}
              onChange={(e) => setForceMock(e.target.checked)}
            />
            <label htmlFor="forceMockCheckbox" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              Force Snapshot Cache (Offline Mode)
            </label>
          </div>

          <button
            onClick={handleSave}
            className="btn btn-primary"
            style={{ justifyContent: 'center', marginTop: '0.5rem' }}
          >
            Apply & Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
