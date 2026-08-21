'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import AdminKPICards from '@/components/AdminKPICards';
import AdminCameraGrid from '@/components/AdminCameraGrid';

export default function AdminMainDashboard() {
  const [theme, setTheme] = useState('light');
  
  // Data states
  const [cameras, setCameras] = useState([]);
  const [zones, setZones] = useState([]);
  const [useCases, setUseCases] = useState([]);
  const [cameraConfigs, setCameraConfigs] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState('live');
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [countdown, setCountdown] = useState(10);

  // Initialize theme and browser title
  useEffect(() => {
    const savedTheme = localStorage.getItem('omnivision_theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
    document.title = 'OmniVision AI Command Center | Omni Watch';
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('omnivision_theme', nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  // Fetch Metadata (Cameras, Zones, Use Cases, Configs, Grand Total)
  const loadMetadata = useCallback(async () => {
    try {
      const [cRes, zRes, uRes, cfgRes, dRes] = await Promise.allSettled([
        fetch('/api/cameras'),
        fetch('/api/zones'),
        fetch('/api/use-cases'),
        fetch('/api/camera-ai-configs'),
        fetch('/api/detections?page=1&page_size=1')
      ]);

      if (cRes.status === 'fulfilled') {
        const cData = await cRes.value.json();
        if (cData?.data) setCameras(cData.data);
      }
      if (zRes.status === 'fulfilled') {
        const zData = await zRes.value.json();
        if (zData?.data) setZones(zData.data);
      }
      if (uRes.status === 'fulfilled') {
        const uData = await uRes.value.json();
        if (uData?.data) setUseCases(uData.data);
      }
      if (cfgRes.status === 'fulfilled') {
        const cfgData = await cfgRes.value.json();
        if (cfgData?.data) setCameraConfigs(cfgData.data);
      }
      if (dRes.status === 'fulfilled') {
        const dData = await dRes.value.json();
        if (typeof dData?.data?.total === 'number') {
          setTotalRecords(dData.data.total);
          setConnectionStatus('live');
        }
      }
    } catch (err) {
      console.warn('Admin metadata fetch failed', err);
      setConnectionStatus('mock');
    }
  }, []);

  const loadAll = useCallback(async (showFullLoading = false) => {
    if (showFullLoading) setIsLoading(true);
    setIsRefreshing(true);
    await loadMetadata();
    setIsLoading(false);
    setIsRefreshing(false);
  }, [loadMetadata]);

  useEffect(() => {
    loadAll(true);
  }, [loadAll]);

  // Auto-refresh timer
  useEffect(() => {
    setCountdown(10);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          loadMetadata();
          return 10;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loadMetadata]);

  return (
    <div className="anpr-page-wrapper">
      {/* Top Application Header */}
      <Header
        title="OmniVision AI Command Center"
        subtitle="Facility Camera Surveillance & ANPR Management"
        connectionStatus={connectionStatus}
        countdown={countdown}
        theme={theme}
        onToggleTheme={toggleTheme}
        onRefresh={() => loadAll(false)}
        isRefreshing={isRefreshing}
      />

      <main className="admin-main-container">
        {/* Admin Dashboard Hero Title */}
        <div className="admin-hero-header">
          <div className="admin-hero-title-group">
            <h1 className="admin-hero-title">Facility Surveillance Hub</h1>
            <p className="admin-hero-subtitle">
              Choose a camera dashboard below to view real-time ANPR, vehicle telemetry, and live camera detection events
            </p>
          </div>
          <div className="admin-live-badge-group">
            <div className="admin-status-indicator">
              <span className="status-dot"></span>
              <span>AI Engine Active (Port 8009)</span>
            </div>
          </div>
        </div>

        {/* 1. Global Facility KPIs */}
        <AdminKPICards
          cameras={cameras}
          zones={zones}
          useCases={useCases}
          totalDetections={totalRecords}
        />

        {/* 2. Camera Choice & Navigation Grid */}
        <AdminCameraGrid
          cameras={cameras}
          cameraConfigs={cameraConfigs}
          isLoading={isLoading}
        />
      </main>
    </div>
  );
}
