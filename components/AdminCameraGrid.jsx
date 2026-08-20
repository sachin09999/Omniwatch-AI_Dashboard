'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Camera,
  MapPin,
  Cpu,
  ArrowRight,
  Search,
  Video,
  ExternalLink
} from 'lucide-react';
import { toCameraSlug, getCameraPreviewUrl } from '@/lib/cameraUtils';
import { toUseCaseSlug } from '@/lib/useCaseUtils';

export default function AdminCameraGrid({
  cameras = [],
  cameraConfigs = [],
  isLoading = false
}) {
  const [searchQuery, setSearchQuery] = useState('');

  // Map camera config metadata
  const enrichedCameras = useMemo(() => {
    return cameras.map((cam) => {
      const slug = toCameraSlug(cam.name || cam.id);
      const previewUrl = getCameraPreviewUrl(cam);
      const useCases = cam.use_cases || [];
      const zonesCount = cam.zones_count || (cam.zones ? cam.zones.length : 1);

      return {
        ...cam,
        slug,
        previewUrl,
        useCases,
        zonesCount
      };
    });
  }, [cameras]);

  // Filter cameras by search
  const filteredCameras = useMemo(() => {
    if (!searchQuery.trim()) return enrichedCameras;
    const q = searchQuery.toLowerCase().trim();

    return enrichedCameras.filter((c) => {
      const name = (c.name || '').toLowerCase();
      const id = (c.id || '').toLowerCase();
      const stream = (c.streaming_url || '').toLowerCase();
      const ucs = (c.useCases || []).map((u) => (u.use_case_name || '').toLowerCase()).join(' ');

      return name.includes(q) || id.includes(q) || stream.includes(q) || ucs.includes(q);
    });
  }, [enrichedCameras, searchQuery]);

  return (
    <div className="admin-camera-section">
      {/* Section Header & Search */}
      <div className="admin-camera-header-row">
        <div>
          <h2 className="admin-section-title">Facility Cameras &amp; AI Streams</h2>
          <p className="admin-section-subtitle">
            Select a camera to enter its dedicated real-time ANPR &amp; surveillance dashboard
          </p>
        </div>

        <div className="admin-camera-search-wrap">
          <Search size={15} className="admin-search-icon" />
          <input
            type="text"
            placeholder="Search cameras, zones, or streams..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="admin-camera-search-input"
          />
        </div>
      </div>

      {/* Camera Cards Grid */}
      {isLoading ? (
        <div className="admin-camera-loading">
          <div className="anpr-spinner"></div>
          <p>Loading AI camera nodes...</p>
        </div>
      ) : filteredCameras.length === 0 ? (
        <div className="admin-camera-empty">
          <Camera size={40} style={{ opacity: 0.4, marginBottom: '0.5rem' }} />
          <h4>No cameras matching &ldquo;{searchQuery}&rdquo;</h4>
          <p>Try searching with another keyword or check camera streaming connections.</p>
        </div>
      ) : (
        <div className="admin-camera-grid">
          {filteredCameras.map((cam) => {
            const isOnline = cam.is_active !== false;
            const targetRoute = `/camera/${cam.slug}/anpr`;

            return (
              <div key={cam.id} className="admin-camera-card">
                {/* Live Preview Thumbnail / Feed Header */}
                <Link href={targetRoute} className="admin-card-media-box">
                  {cam.previewUrl ? (
                    <img
                      src={cam.previewUrl}
                      alt={`Preview for ${cam.name}`}
                      className="admin-card-preview-img"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const fb = e.currentTarget.nextElementSibling;
                        if (fb) fb.style.display = 'flex';
                      }}
                    />
                  ) : null}

                  <div
                    className="admin-card-media-fallback"
                    style={{ display: cam.previewUrl ? 'none' : 'flex' }}
                  >
                    <Video size={36} />
                    <span>RTSP Live Stream</span>
                  </div>

                  {/* Top Badges */}
                  <div className="admin-card-top-badges">
                    <span className={`admin-stream-badge ${isOnline ? 'online' : 'offline'}`}>
                      <span className={`status-dot ${isOnline ? '' : 'error'}`}></span>
                      {isOnline ? 'LIVE STREAM' : 'OFFLINE'}
                    </span>
                    <span className="admin-zone-count-badge">
                      <MapPin size={11} />
                      {cam.zonesCount} {cam.zonesCount === 1 ? 'Zone' : 'Zones'}
                    </span>
                  </div>

                  {/* Hover Enter Overlay */}
                  <div className="admin-card-hover-overlay">
                    <span className="admin-card-enter-pill">
                      <span>Open ANPR Dashboard</span>
                      <ExternalLink size={13} />
                    </span>
                  </div>
                </Link>

                {/* Card Content Body */}
                <div className="admin-card-body">
                  <div className="admin-card-title-row">
                    <div className="admin-card-cam-title">
                      <Camera size={16} className="cam-icon" />
                      <h3 className="cam-name">{cam.name || `Camera ${cam.sr_id}`}</h3>
                    </div>
                    <span className="admin-cam-id-pill">#{cam.sr_id || cam.id.slice(0, 6)}</span>
                  </div>

                  {/* Attached AI Use Cases (Direct links to /camera/[slug]/[useCase]) */}
                  <div className="admin-card-usecases-row">
                    {cam.useCases && cam.useCases.length > 0 ? (
                      cam.useCases.map((uc, idx) => {
                        const ucSlug = toUseCaseSlug(uc.use_case_name || uc.use_case_id);
                        return (
                          <Link
                            key={idx}
                            href={`/camera/${cam.slug}/${ucSlug}`}
                            className="admin-usecase-badge"
                            title={`Open ${uc.use_case_name} Dashboard`}
                          >
                            <Cpu size={11} />
                            <span>{uc.use_case_name || 'AI Model'}</span>
                          </Link>
                        );
                      })
                    ) : (
                      <>
                        <Link
                          href={`/camera/${cam.slug}/anpr`}
                          className="admin-usecase-badge"
                        >
                          <Cpu size={11} />
                          <span>ANPR Detection</span>
                        </Link>
                        <Link
                          href={`/camera/${cam.slug}/object`}
                          className="admin-usecase-badge"
                        >
                          <Cpu size={11} />
                          <span>Object Detection</span>
                        </Link>
                      </>
                    )}
                  </div>

                  {/* RTSP Stream URL info */}
                  {cam.streaming_url && (
                    <div className="admin-card-stream-url truncate" title={cam.streaming_url}>
                      <code>{cam.streaming_url.replace(/rtsp:\/\/[^@]+@/, 'rtsp://')}</code>
                    </div>
                  )}

                  {/* Card Action Footer */}
                  <div className="admin-card-footer">
                    <Link href={targetRoute} className="admin-enter-dashboard-btn">
                      <span>Enter Camera Dashboard</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
