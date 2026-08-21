'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import ANPRFilterBar from '@/components/ANPRFilterBar';
import ANPRTable from '@/components/ANPRTable';
import SnapshotGrid from '@/components/SnapshotGrid';
import InspectorModal from '@/components/InspectorModal';
import {
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Camera as CameraIcon,
  Cpu,
  Car,
  User,
  Box,
  Layers
} from 'lucide-react';
import { toCameraSlug, findCameraBySlugOrId } from '@/lib/cameraUtils';
import { resolveUseCase, toUseCaseSlug, USE_CASE_MAP, sanitizeUseCaseId } from '@/lib/useCaseUtils';
import { getDateRangeFromTimeFrame } from '@/lib/dateUtils';

export default function CameraDashboardView({
  cameraSlug = '',
  useCaseSlug = ''
}) {
  const router = useRouter();
  const [theme, setTheme] = useState('light');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'

  // Data states
  const [cameras, setCameras] = useState([]);
  const [zones, setZones] = useState([]);
  const [useCases, setUseCases] = useState([]);
  const [cameraConfigs, setCameraConfigs] = useState([]);
  const [detections, setDetections] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState('live');
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [countdown, setCountdown] = useState(10);

  // Active Use Case state
  const [selectedUseCaseSlug, setSelectedUseCaseSlug] = useState(useCaseSlug || '');

  // Keep in sync with prop if prop changes
  useEffect(() => {
    if (useCaseSlug) {
      setSelectedUseCaseSlug(useCaseSlug);
    }
  }, [useCaseSlug]);

  // Identify current camera object
  const currentCamera = useMemo(() => {
    if (!cameraSlug) return null;
    return findCameraBySlugOrId(cameras, cameraSlug);
  }, [cameras, cameraSlug]);

  // If no useCaseSlug provided, default to camera's attached use case or ANPR
  useEffect(() => {
    if (!selectedUseCaseSlug && currentCamera?.useCases && currentCamera.useCases.length > 0) {
      const primarySlug = toUseCaseSlug(currentCamera.useCases[0].use_case_name || currentCamera.useCases[0].use_case_id, useCases);
      setSelectedUseCaseSlug(primarySlug);
    } else if (!selectedUseCaseSlug) {
      setSelectedUseCaseSlug('anpr');
    }
  }, [selectedUseCaseSlug, currentCamera, useCases]);

  // Resolve Use Case from active slug and metadata
  const currentUseCase = useMemo(() => {
    return resolveUseCase(selectedUseCaseSlug || 'anpr', useCases);
  }, [selectedUseCaseSlug, useCases]);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [severity, setSeverity] = useState('all');
  const [timeFrame, setTimeFrame] = useState('today');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedZone, setSelectedZone] = useState('all');

  // Sorting & Pagination
  const [sortField, setSortField] = useState('detected_at');
  const [sortDirection, setSortDirection] = useState('desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Inspector Modal
  const [selectedDetection, setSelectedDetection] = useState(null);

  // Initialize theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('omnivision_theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('omnivision_theme', nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  // Fetch Cameras, Zones, Use Cases
  const loadMetadata = useCallback(async () => {
    try {
      const [cRes, zRes, uRes, cfgRes] = await Promise.allSettled([
        fetch('/api/cameras'),
        fetch('/api/zones'),
        fetch('/api/use-cases'),
        fetch('/api/camera-ai-configs')
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
    } catch (err) {
      console.warn('Metadata fetch failed', err);
    }
  }, []);

  const cameraId = currentCamera?.id || (cameraSlug && !['anpr', 'object', 'objects', 'face', 'faces'].includes(cameraSlug.toLowerCase()) ? cameraSlug : null);
  const cameraName = currentCamera?.name || (cameraId ? `Camera ${cameraSlug}` : null);

  // Dynamic Header Title & Subtitle based on Route
  const headerTitle = useMemo(() => {
    if (cameraName) {
      return `${cameraName} — ${currentUseCase.name}`;
    }
    return `Facility ${currentUseCase.name}`;
  }, [cameraName, currentUseCase]);

  const headerSubtitle = useMemo(() => {
    if (cameraName) {
      return `${currentUseCase.subtitle} • Scoped to ${cameraName}`;
    }
    return `${currentUseCase.subtitle} • All Cameras Stream`;
  }, [cameraName, currentUseCase]);

  // Dynamic Browser Tab Title
  useEffect(() => {
    if (headerTitle) {
      document.title = `${headerTitle} | Omni Watch`;
    }
  }, [headerTitle]);

  // Fetch Detections strictly scoped to this Route's Use Case and Camera
  const loadDetections = useCallback(async (customPage = page) => {
    try {
      const { startDate: effectiveStartDate, endDate: effectiveEndDate } = getDateRangeFromTimeFrame(timeFrame, startDate, endDate);
      const validUcId = sanitizeUseCaseId(currentUseCase.id);

      const queryParams = new URLSearchParams({
        use_case_id: validUcId,
        page: customPage.toString(),
        page_size: pageSize.toString()
      });

      if (severity && severity !== 'all') queryParams.append('severity', severity);
      if (effectiveStartDate) queryParams.append('start_date', effectiveStartDate);
      if (effectiveEndDate) queryParams.append('end_date', effectiveEndDate);
      if (cameraId) queryParams.append('camera_id', cameraId);
      if (selectedZone && selectedZone !== 'all') queryParams.append('zone_id', selectedZone);
      if (searchQuery && searchQuery.trim()) queryParams.append('search', searchQuery.trim());

      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata';

      const res = await fetch(`/api/detections?${queryParams.toString()}`, {
        headers: { 'X-User-Timezone': timezone }
      });
      const data = await res.json();
      if (data?.data) {
        setDetections(data.data.items || []);
        setTotalRecords(typeof data.data.total === 'number' ? data.data.total : (data.data.items || []).length);
        setConnectionStatus('live');
      }
    } catch (err) {
      console.warn('Detections fetch failed', err);
      setConnectionStatus('mock');
    }
  }, [cameraId, currentUseCase.id, page, pageSize, severity, selectedZone, timeFrame, startDate, endDate, searchQuery]);

  const loadAll = useCallback(async (showFullLoading = false, customPage = page) => {
    if (showFullLoading) setIsLoading(true);
    setIsRefreshing(true);
    await Promise.all([loadMetadata(), loadDetections(customPage)]);
    setIsLoading(false);
    setIsRefreshing(false);
  }, [loadMetadata, loadDetections, page]);

  useEffect(() => {
    loadAll(true);
  }, [loadAll]);

  // Auto-refresh timer
  useEffect(() => {
    setCountdown(10);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          loadDetections();
          return 10;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loadDetections]);

  // Sort Handler
  const handleSortChange = (field) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const displayDetections = useMemo(() => {
    if (!detections || detections.length === 0) return [];
    
    return [...detections].sort((a, b) => {
      let comparison = 0;
      if (sortField === 'sr_id') {
        comparison = (Number(a.sr_id) || 0) - (Number(b.sr_id) || 0);
      } else if (sortField === 'detected_at') {
        const timeA = a.detected_at ? new Date(a.detected_at).getTime() : 0;
        const timeB = b.detected_at ? new Date(b.detected_at).getTime() : 0;
        comparison = timeA - timeB;
      } else if (sortField === 'plate_text') {
        const plateA = (a.detections?.[0]?.metadata?.plate_text || a.detections?.[0]?.class_name || '').toLowerCase();
        const plateB = (b.detections?.[0]?.metadata?.plate_text || b.detections?.[0]?.class_name || '').toLowerCase();
        comparison = plateA.localeCompare(plateB);
      } else if (sortField === 'camera_name') {
        const camA = (a.camera_name || '').toLowerCase();
        const camB = (b.camera_name || '').toLowerCase();
        comparison = camA.localeCompare(camB);
      } else if (sortField === 'zone_name') {
        const zoneA = (a.zone_name || '').toLowerCase();
        const zoneB = (b.zone_name || '').toLowerCase();
        comparison = zoneA.localeCompare(zoneB);
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [detections, sortField, sortDirection]);

  const handleApplyFilter = () => {
    setPage(1);
    loadDetections(1);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSeverity('all');
    setSelectedZone('all');
    setTimeFrame('today');
    setStartDate('');
    setEndDate('');
    setSortField('detected_at');
    setSortDirection('desc');
    setPage(1);
    setTimeout(() => {
      loadAll(true, 1);
    }, 0);
  };

  const handleExportCsv = () => {
    const headers = ['ID', 'Date & Time', 'Detection Data', 'Camera', 'Zone', 'Severity', 'Status'];
    const rows = displayDetections.map((item) => {
      const det = item.detections?.[0] || {};
      const meta = det.metadata || {};
      return [
        item.sr_id || item.id,
        `"${item.detected_at || ''}"`,
        `"${meta.plate_text || det.class_name || ''}"`,
        `"${item.camera_name || ''}"`,
        `"${item.zone_name || ''}"`,
        `"${item.severity || 'normal'}"`,
        item.status || 'active'
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `${toCameraSlug(cameraName || currentUseCase.slug)}_detections_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  const currentDetectionIndex = useMemo(() => {
    if (!selectedDetection) return -1;
    return displayDetections.findIndex(d => (d.id === selectedDetection.id || d.sr_id === selectedDetection.sr_id));
  }, [selectedDetection, displayDetections]);

  const handleNextDetection = useCallback(() => {
    if (currentDetectionIndex >= 0 && currentDetectionIndex < displayDetections.length - 1) {
      setSelectedDetection(displayDetections[currentDetectionIndex + 1]);
    }
  }, [currentDetectionIndex, displayDetections]);

  const handlePrevDetection = useCallback(() => {
    if (currentDetectionIndex > 0) {
      setSelectedDetection(displayDetections[currentDetectionIndex - 1]);
    }
  }, [currentDetectionIndex, displayDetections]);

  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));

  return (
    <div className="anpr-page-wrapper">
      {/* Header */}
      <Header
        title={headerTitle}
        subtitle={headerSubtitle}
        connectionStatus={connectionStatus}
        countdown={countdown}
        theme={theme}
        onToggleTheme={toggleTheme}
        onRefresh={() => loadAll(false)}
        onExportCsv={handleExportCsv}
        isRefreshing={isRefreshing}
      />

      <main className="anpr-main-container">
        {/* Navigation & Scoped Camera Badge Bar */}
        {cameraName && (
          <div className="camera-nav-banner">
            <div className="camera-nav-left">
              <div className="camera-current-badge">
                <CameraIcon size={14} />
                <span>{cameraName}</span>
              </div>
            </div>
          </div>
        )}

        {/* Scoped Detections Section */}
        <section className="camera-events-section">
          <ANPRFilterBar
            searchQuery={searchQuery}
            onSearchChange={(q) => setSearchQuery(q)}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            severity={severity}
            onSeverityChange={(s) => {
              setSeverity(s);
              setPage(1);
            }}
            timeFrame={timeFrame}
            onTimeFrameChange={(t) => {
              setTimeFrame(t);
              setPage(1);
            }}
            startDate={startDate}
            onStartDateChange={(d) => {
              setStartDate(d);
              setPage(1);
            }}
            endDate={endDate}
            onEndDateChange={(d) => {
              setEndDate(d);
              setPage(1);
            }}
            selectedCamera={cameraId || 'all'}
            onCameraChange={() => {}}
            cameras={cameras}
            showCameraSelect={false}
            selectedZone={selectedZone}
            onZoneChange={(z) => {
              setSelectedZone(z);
              setPage(1);
            }}
            zones={zones}
            onApplyFilter={handleApplyFilter}
            onResetFilters={handleResetFilters}
          />

          {/* Detections Content: Table or Grid */}
          <div className="anpr-content-section">
            {viewMode === 'table' ? (
              <ANPRTable
                detections={displayDetections}
                onSelectDetection={setSelectedDetection}
                isLoading={isLoading}
                sortField={sortField}
                sortDirection={sortDirection}
                onSortChange={handleSortChange}
                useCaseName={currentUseCase.name}
              />
            ) : (
              <SnapshotGrid
                snapshots={displayDetections}
                onSelectSnapshot={setSelectedDetection}
                imageMode="full"
                isLoading={isLoading}
                useCaseName={currentUseCase.name}
              />
            )}

            {/* Pagination */}
            <div className="anpr-pagination">
              <div className="anpr-pagination-info">
                {totalRecords > 0 ? (
                  <span>
                    Showing {((page - 1) * pageSize) + 1}–{Math.min(page * pageSize, totalRecords)} of {totalRecords.toLocaleString()} records
                  </span>
                ) : (
                  <span>No {currentUseCase.name} records found</span>
                )}
              </div>

              <div className="anpr-pagination-controls">
                <div className="anpr-pagesize-wrapper">
                  <span className="anpr-pagesize-label">Rows per page:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      const size = parseInt(e.target.value, 10) || 10;
                      setPageSize(size);
                      setPage(1);
                      setTimeout(() => loadDetections(1), 0);
                    }}
                    className="anpr-pagesize-select"
                  >
                    <option value="10">10</option>
                    <option value="15">15</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                  </select>
                </div>

                <div className="anpr-pagination-actions">
                  <button
                    type="button"
                    className="anpr-btn"
                    disabled={page <= 1 || isLoading}
                    onClick={() => {
                      const target = Math.max(1, page - 1);
                      setPage(target);
                      loadDetections(target);
                    }}
                  >
                    <ChevronLeft size={15} />
                    <span>Previous</span>
                  </button>
                  <span className="anpr-page-indicator">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    type="button"
                    className="anpr-btn"
                    disabled={page >= totalPages || isLoading}
                    onClick={() => {
                      const target = Math.min(totalPages, page + 1);
                      setPage(target);
                      loadDetections(target);
                    }}
                  >
                    <span>Next</span>
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 3-Slide Inspector Modal */}
      {selectedDetection && (
        <InspectorModal
          detection={selectedDetection}
          onClose={() => setSelectedDetection(null)}
          onNextDetection={handleNextDetection}
          onPrevDetection={handlePrevDetection}
          hasPrevDetection={currentDetectionIndex > 0}
          hasNextDetection={currentDetectionIndex >= 0 && currentDetectionIndex < displayDetections.length - 1}
        />
      )}
    </div>
  );
}
