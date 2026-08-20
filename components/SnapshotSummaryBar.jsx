'use client';

import React from 'react';
import { Camera, AlertTriangle, ShieldCheck, Layers } from 'lucide-react';

export default function SnapshotSummaryBar({
  totalSnapshots = 0,
  highPriorityCount = 0,
  anprCount = 0,
  activeCamerasCount = 0
}) {
  return (
    <div className="snapshot-summary-bar">
      <div className="summary-stat-card">
        <div className="stat-icon-wrapper total">
          <Layers size={18} />
        </div>
        <div className="stat-info">
          <span className="stat-label">Total Snapshots</span>
          <span className="stat-number">{totalSnapshots.toLocaleString()}</span>
        </div>
      </div>

      <div className="summary-stat-card">
        <div className="stat-icon-wrapper high">
          <AlertTriangle size={18} />
        </div>
        <div className="stat-info">
          <span className="stat-label">High Priority Alerts</span>
          <span className="stat-number high-text">{highPriorityCount.toLocaleString()}</span>
        </div>
      </div>

      <div className="summary-stat-card">
        <div className="stat-icon-wrapper anpr">
          <ShieldCheck size={18} />
        </div>
        <div className="stat-info">
          <span className="stat-label">ANPR Captures</span>
          <span className="stat-number">{anprCount.toLocaleString()}</span>
        </div>
      </div>

      <div className="summary-stat-card">
        <div className="stat-icon-wrapper cam">
          <Camera size={18} />
        </div>
        <div className="stat-info">
          <span className="stat-label">Active Cameras</span>
          <span className="stat-number">{activeCamerasCount} Streams</span>
        </div>
      </div>
    </div>
  );
}
