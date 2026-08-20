'use client';

import React from 'react';
import { Camera, MapPin, ShieldCheck, Activity, Cpu } from 'lucide-react';

export default function AdminKPICards({
  cameras = [],
  zones = [],
  useCases = [],
  totalDetections = 0
}) {
  const activeCamerasCount = cameras.filter((c) => c.is_active !== false).length;
  const totalCamerasCount = cameras.length;
  const totalZonesCount = zones.length;
  const activeUseCasesCount = useCases.length;

  return (
    <section className="admin-kpi-grid">
      {/* 1. Camera Streams KPI */}
      <div className="admin-kpi-card">
        <div className="admin-kpi-header">
          <span className="admin-kpi-label">Active Cameras</span>
          <div className="admin-kpi-icon-wrap primary">
            <Camera size={18} />
          </div>
        </div>
        <div className="admin-kpi-value-row">
          <span className="admin-kpi-value">{activeCamerasCount}</span>
          <span className="admin-kpi-total">/ {totalCamerasCount} total</span>
        </div>
        <div className="admin-kpi-meta">
          <span className="status-dot"></span>
          <span>{activeCamerasCount === totalCamerasCount ? 'All RTSP Streams Online' : `${totalCamerasCount - activeCamerasCount} Stream Offline`}</span>
        </div>
      </div>

      {/* 2. Monitored Zones KPI */}
      <div className="admin-kpi-card">
        <div className="admin-kpi-header">
          <span className="admin-kpi-label">Monitored Zones</span>
          <div className="admin-kpi-icon-wrap info">
            <MapPin size={18} />
          </div>
        </div>
        <div className="admin-kpi-value-row">
          <span className="admin-kpi-value">{totalZonesCount}</span>
          <span className="admin-kpi-total">zones</span>
        </div>
        <div className="admin-kpi-meta">
          <span>Facility Polygon Boundaries</span>
        </div>
      </div>

      {/* 3. AI Detections KPI */}
      <div className="admin-kpi-card">
        <div className="admin-kpi-header">
          <span className="admin-kpi-label">Total AI Detections</span>
          <div className="admin-kpi-icon-wrap success">
            <ShieldCheck size={18} />
          </div>
        </div>
        <div className="admin-kpi-value-row">
          <span className="admin-kpi-value">{totalDetections.toLocaleString()}</span>
          <span className="admin-kpi-total">events</span>
        </div>
        <div className="admin-kpi-meta">
          <span>Live License Plates &amp; Objects</span>
        </div>
      </div>

      {/* 4. Active AI Models KPI */}
      <div className="admin-kpi-card">
        <div className="admin-kpi-header">
          <span className="admin-kpi-label">AI Use Cases</span>
          <div className="admin-kpi-icon-wrap purple">
            <Cpu size={18} />
          </div>
        </div>
        <div className="admin-kpi-value-row">
          <span className="admin-kpi-value">{activeUseCasesCount}</span>
          <span className="admin-kpi-total">models active</span>
        </div>
        <div className="admin-kpi-meta">
          <span>ANPR, Vehicles &amp; Detection</span>
        </div>
      </div>
    </section>
  );
}
