'use client';

import React from 'react';
import { Eye, RefreshCw, FileSpreadsheet, FileCode, Settings, Sun, Moon } from 'lucide-react';

export default function Header({
  connectionStatus = 'live',
  countdown = 10,
  theme = 'dark',
  onToggleTheme,
  onRefresh,
  onExportCsv,
  onExportJson,
  onOpenSettings,
  isRefreshing
}) {
  return (
    <header className="app-header">
      <div className="brand-wrapper">
        <div className="brand-icon">
          <Eye size={20} />
        </div>
        <div>
          <div className="brand-title">
            <span>OmniVision AI</span>
            <span style={{ fontSize: '0.65rem', background: 'var(--primary-bg)', color: 'var(--primary)', padding: '0.1rem 0.45rem', borderRadius: '4px', border: '1px solid var(--primary-border)', fontWeight: 600 }}>
              ENTERPRISE
            </span>
          </div>
          <div className="brand-subtitle">Automated Vision & ANPR Intelligence</div>
        </div>
      </div>

      <div className="header-status-group">
        <div className="status-pill">
          <span className={`status-dot ${connectionStatus === 'mock' ? 'mock' : ''}`}></span>
          <span>{connectionStatus === 'live' ? 'Connected (10.10.12.50:8009)' : 'Snapshot Cache'}</span>
        </div>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', fontFamily: 'var(--font-mono)' }}>
          Sync in {countdown}s
        </span>
      </div>

      <div className="header-actions">
        {/* Day / Night Mode Toggle */}
        <button
          onClick={onToggleTheme}
          className="btn btn-icon"
          title={theme === 'dark' ? 'Switch to Day Mode (Light)' : 'Switch to Night Mode (Dark)'}
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Manual Refresh */}
        <button onClick={onRefresh} className="btn" title="Refresh Live Data">
          <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
          <span>Sync</span>
        </button>

        {/* Export Data */}
        <div className="pill-group">
          <button onClick={onExportCsv} className="pill-btn" title="Export CSV">
            <FileSpreadsheet size={13} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
            CSV
          </button>
          <button onClick={onExportJson} className="pill-btn" title="Export JSON">
            <FileCode size={13} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
            JSON
          </button>
        </div>

        {/* Settings */}
        <button onClick={onOpenSettings} className="btn btn-icon" title="Connection Settings">
          <Settings size={16} />
        </button>
      </div>
    </header>
  );
}
