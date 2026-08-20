'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import KPICards from '@/components/KPICards';
import FilterBar from '@/components/FilterBar';
import DetectionFeed from '@/components/DetectionFeed';
import DetectionTable from '@/components/DetectionTable';
import CameraMatrix from '@/components/CameraMatrix';
import AnalyticsView from '@/components/AnalyticsView';
import InspectorModal from '@/components/InspectorModal';
import SettingsModal from '@/components/SettingsModal';
import { Activity, Video, BarChart3, ChevronLeft, ChevronRight } from 'lucide-react';

export default function DashboardPage() {
  const [theme, setTheme] = useState('dark');
  const [activeTab, setActiveTab] = useState('feed'); // 'feed' | 'configs' | 'analytics'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [imageMode, setImageMode] = useState('full'); // 'full' | 'crop'
  
  // Filters
  const [timeFrame, setTimeFrame] = useState('today');
  const [severity, setSeverity] = useState('all');
  const [useCase, setUseCase] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 12;

  // Data state
  const [dashboardData, setDashboardData] = useState(null);
  const [cameraConfigs, setCameraConfigs] = useState([]);
  const [detections, setDetections] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState('live');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modal states
  const [selectedDetection, setSelectedDetection] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Timers
  const [refreshInterval, setRefreshInterval] = useState(10);
  const [countdown, setCountdown] = useState(10);

  // Initialize theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('omnivision_theme') || 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('omnivision_theme', nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  // Fetch Dashboard Summary
  const loadDashboard = useCallback(async () => {
    try {
      const res = await fetch(`/api/dashboard?time_frame=${timeFrame}`);
      const data = await res.json();
      if (data?.data) {
        setDashboardData(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data', err);
    }
  }, [timeFrame]);

  // Fetch Camera Configs
  const loadCameraConfigs = useCallback(async () => {
    try {
      const url = useCase !== 'all' ? `/api/camera-ai-configs?use_case_id=${useCase}` : '/api/camera-ai-configs';
      const res = await fetch(url);
      const data = await res.json();
      if (data?.data) {
        setCameraConfigs(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch camera configs', err);
    }
  }, [useCase]);

  // Fetch Detections
  const loadDetections = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString()
      });
      if (useCase !== 'all') params.append('use_case_id', useCase);
      if (severity !== 'all') params.append('severity', severity);

      const res = await fetch(`/api/detections?${params.toString()}`);
      const data = await res.json();
      if (data?.data) {
        setDetections(data.data.items || []);
        setTotalRecords(data.data.total || (data.data.items || []).length);
      }
    } catch (err) {
      console.error('Failed to fetch detections', err);
    }
  }, [page, pageSize, useCase, severity]);

  const loadAll = useCallback(async () => {
    setIsRefreshing(true);
    await Promise.all([loadDashboard(), loadCameraConfigs(), loadDetections()]);
    setIsRefreshing(false);
  }, [loadDashboard, loadCameraConfigs, loadDetections]);

  // Initial Load
  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Auto-refresh timer
  useEffect(() => {
    if (refreshInterval <= 0) return;
    setCountdown(refreshInterval);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          loadAll();
          return refreshInterval;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [refreshInterval, loadAll]);

  // Filter detections by search query
  const filteredDetections = detections.filter((item) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const plateText = (item.detections?.[0]?.metadata?.plate_text || '').toLowerCase();
    const className = (item.detections?.[0]?.class_name || '').toLowerCase();
    const camName = (item.camera_name || '').toLowerCase();
    const zoneName = (item.zone_name || '').toLowerCase();
    const useCaseName = (item.use_case_name || '').toLowerCase();
    const srId = String(item.sr_id);

    return (
      plateText.includes(q) ||
      className.includes(q) ||
      camName.includes(q) ||
      zoneName.includes(q) ||
      useCaseName.includes(q) ||
      srId.includes(q)
    );
  });

  // Export handlers
  const handleExportCsv = () => {
    const headers = ['ID', 'SR_ID', 'Camera Name', 'Zone Name', 'Use Case', 'Severity', 'Plate Text', 'Class Name', 'Confidence', 'Detected At'];
    const rows = filteredDetections.map(item => {
      const det = item.detections?.[0] || {};
      const meta = det.metadata || {};
      return [
        `"${item.id}"`,
        item.sr_id,
        `"${item.camera_name}"`,
        `"${item.zone_name}"`,
        `"${item.use_case_name}"`,
        item.severity,
        `"${meta.plate_text || ''}"`,
        `"${det.class_name || ''}"`,
        det.confidence || '',
        `"${item.detected_at}"`
      ].join(',');
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `detections_export_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filteredDetections, null, 2));
    const link = document.createElement('a');
    link.href = dataStr;
    link.download = `detections_export_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
  };

  const totalPages = Math.ceil(totalRecords / pageSize) || 1;

  return (
    <div>
      {/* Top Header */}
      <Header
        connectionStatus={connectionStatus}
        countdown={countdown}
        theme={theme}
        onToggleTheme={toggleTheme}
        onRefresh={loadAll}
        onExportCsv={handleExportCsv}
        onExportJson={handleExportJson}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isRefreshing={isRefreshing}
      />

      {/* Tabs Bar */}
      <nav className="tabs-bar">
        <div className="tab-group">
          <button
            className={`tab-btn ${activeTab === 'feed' ? 'active' : ''}`}
            onClick={() => setActiveTab('feed')}
          >
            <Activity size={15} />
            <span>Surveillance Feed</span>
            <span className="tab-badge">{dashboardData?.grand_total || totalRecords}</span>
          </button>
          <button
            className={`tab-btn ${activeTab === 'configs' ? 'active' : ''}`}
            onClick={() => setActiveTab('configs')}
          >
            <Video size={15} />
            <span>Camera Matrix</span>
            <span className="tab-badge">{cameraConfigs.length}</span>
          </button>
          <button
            className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <BarChart3 size={15} />
            <span>ANPR Analytics</span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        {/* KPI Deck */}
        <KPICards dashboardData={dashboardData} />

        {/* Tab 1: Surveillance Feed */}
        {activeTab === 'feed' && (
          <section>
            <FilterBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              severity={severity}
              onSeverityChange={(s) => { setSeverity(s); setPage(1); }}
              timeFrame={timeFrame}
              onTimeFrameChange={(tf) => setTimeFrame(tf)}
              useCase={useCase}
              onUseCaseChange={(uc) => { setUseCase(uc); setPage(1); }}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              imageMode={imageMode}
              onImageModeChange={setImageMode}
            />

            <div className="feed-header">
              <h2 className="feed-title">Active AI Detections</h2>
              <span className="feed-count-badge">{filteredDetections.length} Detections Shown</span>
            </div>

            {viewMode === 'grid' ? (
              <DetectionFeed
                detections={filteredDetections}
                onSelectDetection={setSelectedDetection}
                imageMode={imageMode}
              />
            ) : (
              <DetectionTable
                detections={filteredDetections}
                onSelectDetection={setSelectedDetection}
              />
            )}

            {/* Pagination */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', padding: '1rem 0' }}>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, totalRecords)} of {totalRecords} records
              </div>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <button
                  className="btn"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  style={{ opacity: page <= 1 ? 0.5 : 1, cursor: page <= 1 ? 'not-allowed' : 'pointer' }}
                >
                  <ChevronLeft size={14} />
                  Previous
                </button>
                <button
                  className="btn"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  style={{ opacity: page >= totalPages ? 0.5 : 1, cursor: page >= totalPages ? 'not-allowed' : 'pointer' }}
                >
                  Next
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Tab 2: Camera Matrix */}
        {activeTab === 'configs' && (
          <section>
            <div className="feed-header">
              <h2 className="feed-title">Camera Stream & AI Config Matrix</h2>
              <span className="feed-count-badge">Endpoint: /ai/camera-ai-configs</span>
            </div>
            <CameraMatrix cameraConfigs={cameraConfigs} />
          </section>
        )}

        {/* Tab 3: ANPR Analytics */}
        {activeTab === 'analytics' && (
          <section>
            <AnalyticsView detections={detections} />
          </section>
        )}
      </main>

      {/* Inspector Modal */}
      {selectedDetection && (
        <InspectorModal
          detection={selectedDetection}
          onClose={() => setSelectedDetection(null)}
        />
      )}

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        refreshInterval={refreshInterval}
        onSaveSettings={({ refreshInterval: newRate, forceMock }) => {
          setRefreshInterval(newRate);
          setConnectionStatus(forceMock ? 'mock' : 'live');
          loadAll();
        }}
      />
    </div>
  );
}
