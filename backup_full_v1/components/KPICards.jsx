'use client';

import React from 'react';
import { ShieldCheck, AlertOctagon, AlertTriangle, Car } from 'lucide-react';

export default function KPICards({ dashboardData }) {
  const grandTotal = dashboardData?.grand_total || 0;
  const tiles = dashboardData?.tiles || [];

  let highAlerts = 0;
  let medAlerts = 0;
  let anprCount = 0;

  tiles.forEach(tile => {
    if (tile.severity === 'high') highAlerts += tile.total;
    if (tile.severity === 'medium') medAlerts += tile.total;

    (tile.use_cases || []).forEach(uc => {
      if (uc.use_case_name?.toLowerCase().includes('anpr')) {
        anprCount += uc.count;
      }
    });
  });

  return (
    <section className="kpi-grid">
      <div className="kpi-card">
        <div className="kpi-header">
          <span className="kpi-label">Total Detections</span>
          <div className="kpi-icon-wrap">
            <ShieldCheck size={16} />
          </div>
        </div>
        <div className="kpi-value">{grandTotal.toLocaleString()}</div>
        <div className="kpi-meta">
          <span>All Streams</span>
          <span className="kpi-pill info">Live Telemetry</span>
        </div>
      </div>

      <div className="kpi-card high">
        <div className="kpi-header">
          <span className="kpi-label">High Severity</span>
          <div className="kpi-icon-wrap">
            <AlertOctagon size={16} />
          </div>
        </div>
        <div className="kpi-value">{highAlerts.toLocaleString()}</div>
        <div className="kpi-meta">
          <span>Critical Alerts</span>
          <span className="kpi-pill high">Action Required</span>
        </div>
      </div>

      <div className="kpi-card med">
        <div className="kpi-header">
          <span className="kpi-label">Medium Severity</span>
          <div className="kpi-icon-wrap">
            <AlertTriangle size={16} />
          </div>
        </div>
        <div className="kpi-value">{medAlerts.toLocaleString()}</div>
        <div className="kpi-meta">
          <span>Standard Warnings</span>
          <span className="kpi-pill med">Monitored</span>
        </div>
      </div>

      <div className="kpi-card anpr">
        <div className="kpi-header">
          <span className="kpi-label">ANPR Detections</span>
          <div className="kpi-icon-wrap">
            <Car size={16} />
          </div>
        </div>
        <div className="kpi-value">{anprCount.toLocaleString()}</div>
        <div className="kpi-meta">
          <span>Vehicle License Plates</span>
          <span className="kpi-pill info">UAE / Gulf</span>
        </div>
      </div>
    </section>
  );
}
