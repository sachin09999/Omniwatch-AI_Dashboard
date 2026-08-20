'use client';

import React from 'react';
import { Camera, RefreshCw, Sun, Moon, Download } from 'lucide-react';

export default function Header({
  title,
  subtitle,
  connectionStatus = 'live',
  countdown = 10,
  theme = 'light',
  onToggleTheme,
  onRefresh,
  onExportCsv,
  isRefreshing
}) {
  return (
    <header className="app-header">
      <div className="brand-wrapper">
        <div className="brand-icon">
          <Camera size={20} />
        </div>
        <div>
          <div className="brand-title">
            <span>{title || 'ANPR Detection Dashboard'}</span>
            <span className="brand-tag">LIVE</span>
          </div>
          <div className="brand-subtitle">{subtitle || 'Automated Vehicle Vision & ANPR Telemetry'}</div>
        </div>
      </div>

      <div className="header-status-group">
        <div className="status-pill">
          <span className={`status-dot ${connectionStatus === 'mock' ? 'mock' : ''}`}></span>
          <span>{connectionStatus === 'live' ? 'Live Stream Active' : 'Snapshot Cache'}</span>
        </div>
        <span className="sync-timer">
          Sync in {countdown}s
        </span>
      </div>

      <div className="header-actions">
        {/* Day / Night Theme Switch */}
        <button
          onClick={onToggleTheme}
          className="btn btn-icon"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Manual Refresh */}
        <button
          onClick={onRefresh}
          className="btn btn-primary"
          title="Refresh Data Now"
          disabled={isRefreshing}
        >
          <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
          <span>Sync</span>
        </button>

        {/* Export Data */}
        <button
          onClick={onExportCsv}
          className="btn"
          title="Export ANPR Detections to CSV"
        >
          <Download size={14} />
          <span>Export</span>
        </button>
      </div>
    </header>
  );
}
