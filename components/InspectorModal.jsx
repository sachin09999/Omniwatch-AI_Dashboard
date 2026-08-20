'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  X,
  Camera,
  Download,
  Sparkles,
  Video,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Crop,
  ZoomIn,
  ZoomOut,
  RotateCcw
} from 'lucide-react';

export default function InspectorModal({
  detection,
  onClose,
  onNextDetection,
  onPrevDetection,
  hasPrevDetection = false,
  hasNextDetection = false
}) {
  const cropCanvasRef = useRef(null);
  const mediaContainerRef = useRef(null);
  const videoRef = useRef(null);

  // Exactly 3 carousel slides:
  // 0 = Full Scene
  // 1 = Plate Crop
  // 2 = Video Recording
  const [activeSlide, setActiveSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  // Scroll to Zoom & Pan States
  const [zoomScale, setZoomScale] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  const det = detection?.detections?.[0] || {};
  const meta = det.metadata || {};
  const isAnpr = Boolean(meta.plate_text) || detection?.use_case_name?.toLowerCase().includes('anpr');
  const isFace = detection?.use_case_name?.toLowerCase().includes('face');
  const className = det.class_name ? (isFace && det.class_name === 'unknown' ? 'Face (Unknown)' : det.class_name) : (isAnpr ? 'License Plate' : 'Object');
  const confPercent = Math.round((det.confidence || meta.det_score || 0) * 1000) / 10;
  const plateText = meta.plate_text || (isFace ? (det.class_name === 'unknown' ? 'Face (Unknown)' : det.class_name) : det.class_name || 'Detection');
  const plateOrigin = meta.plate_origin || 'UAE';

  const rawPhotoUrl = detection?.photo_url || detection?.thumbnail_url;
  const photoUrl = rawPhotoUrl?.startsWith('/ai/detections/')
    ? `/api/media/${rawPhotoUrl.replace('/ai/detections/', '')}`
    : rawPhotoUrl;

  const rawThumbUrl = detection?.thumbnail_url;
  const thumbUrl = rawThumbUrl?.startsWith('/ai/detections/')
    ? `/api/media/${rawThumbUrl.replace('/ai/detections/', '')}`
    : rawThumbUrl;

  const rawVideoUrl = detection?.video_url;
  const videoUrl = rawVideoUrl?.startsWith('/ai/detections/')
    ? `/api/media/${rawVideoUrl.replace('/ai/detections/', '')}`
    : rawVideoUrl || (photoUrl ? photoUrl.replace('/photo', '/video') : null);

  const totalSlides = 3;
  const slideLabels = ['Full Scene', isAnpr ? 'Plate Crop' : isFace ? 'Face Crop' : 'Object Crop', 'Video Recording'];

  // Reset zoom on slide or detection change
  const resetZoom = useCallback(() => {
    setZoomScale(1);
    setPanOffset({ x: 0, y: 0 });
    setIsDragging(false);
  }, []);

  useEffect(() => {
    resetZoom();
  }, [activeSlide, detection, resetZoom]);

  // Zoom In / Out handlers
  const handleZoomIn = (e) => {
    if (e) e.stopPropagation();
    setZoomScale((prev) => Math.min(prev * 1.3, 8));
  };

  const handleZoomOut = (e) => {
    if (e) e.stopPropagation();
    setZoomScale((prev) => {
      const next = prev / 1.3;
      if (next <= 1.05) {
        setPanOffset({ x: 0, y: 0 });
        return 1;
      }
      return next;
    });
  };

  // Wheel zoom handler with smooth zoom centering
  const handleWheelZoom = (e) => {
    if (activeSlide === 2) return; // Don't zoom video player
    e.preventDefault();

    const zoomFactor = e.deltaY < 0 ? 1.18 : 0.85;

    setZoomScale((prevScale) => {
      let newScale = prevScale * zoomFactor;
      if (newScale < 1) {
        newScale = 1;
        setPanOffset({ x: 0, y: 0 });
      } else if (newScale > 8) {
        newScale = 8;
      }

      if (newScale === 1) {
        setPanOffset({ x: 0, y: 0 });
      }
      return newScale;
    });
  };

  // Attach non-passive wheel listener so e.preventDefault() works cleanly
  useEffect(() => {
    const el = mediaContainerRef.current;
    if (!el) return;

    const onWheel = (e) => handleWheelZoom(e);
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [activeSlide]);

  // Mouse pan drag handlers
  const handleMouseDown = (e) => {
    if (activeSlide === 2 || e.button !== 0) return;
    if (zoomScale > 1) {
      e.preventDefault();
      setIsDragging(true);
      dragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        panX: panOffset.x,
        panY: panOffset.y
      };
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging || zoomScale <= 1) return;
    e.preventDefault();
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setPanOffset({
      x: dragStartRef.current.panX + dx,
      y: dragStartRef.current.panY + dy
    });
  };

  const handleMouseUp = () => {
    if (isDragging) setIsDragging(false);
  };

  // Double click toggles zoom
  const handleDoubleClick = (e) => {
    if (activeSlide === 2) return;
    e.stopPropagation();
    if (zoomScale > 1) {
      resetZoom();
    } else {
      setZoomScale(2.5);
    }
  };

  // Render clean high-resolution cropped plate canvas for Slide 1
  useEffect(() => {
    if (!detection || activeSlide !== 1) return;
    const canvas = cropCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const bbox = det.bbox || [];
    if (!photoUrl || bbox.length !== 4) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      let [c1, c2, c3, c4] = bbox;
      let x1, y1, x2, y2;
      if (c1 > c2 && c1 > img.naturalHeight * 0.8) {
        x1 = c1; y1 = c2; x2 = c3; y2 = c4;
      } else if (c2 > c1 && c2 > img.naturalHeight * 0.8) {
        y1 = c1; x1 = c2; y2 = c3; x2 = c4;
      } else {
        y1 = c1; x1 = c2; y2 = c3; x2 = c4;
      }

      const padX = 24;
      const padY = 16;
      const bx = Math.max(0, Math.min(x1, x2) - padX);
      const by = Math.max(0, Math.min(y1, y2) - padY);
      const bw = Math.min(img.naturalWidth - bx, Math.abs(x2 - x1) + (padX * 2));
      const bh = Math.min(img.naturalHeight - by, Math.abs(y2 - y1) + (padY * 2));

      canvas.width = Math.max(bw * 2, 560);
      canvas.height = Math.max(bh * 2, 260);

      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, bx, by, bw, bh, 0, 0, canvas.width, canvas.height);
    };

    img.src = photoUrl;
  }, [detection, photoUrl, det.bbox, activeSlide]);

  // Fullscreen toggle handler
  const toggleFullscreen = useCallback(() => {
    const el = mediaContainerRef.current;
    if (!el) return;

    if (!document.fullscreenElement) {
      if (el.requestFullscreen) {
        el.requestFullscreen().catch((err) => console.warn('Fullscreen request failed:', err));
      } else if (el.webkitRequestFullscreen) {
        el.webkitRequestFullscreen();
      } else if (el.msRequestFullscreen) {
        el.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch((err) => console.warn('Exit fullscreen failed:', err));
      }
    }
  }, []);

  // Listen to fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Navigation handlers
  const handlePrevSlide = (e) => {
    if (e) e.stopPropagation();
    resetZoom();
    setActiveSlide((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
  };

  const handleNextSlide = (e) => {
    if (e) e.stopPropagation();
    resetZoom();
    setActiveSlide((prev) => (prev === totalSlides - 1 ? 0 : prev + 1));
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (zoomScale > 1) {
          resetZoom();
        } else if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        } else {
          onClose();
        }
      } else if (e.key === 'ArrowLeft') {
        handlePrevSlide();
      } else if (e.key === 'ArrowRight') {
        handleNextSlide();
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      } else if (e.key === '+' || e.key === '=') {
        handleZoomIn();
      } else if (e.key === '-' || e.key === '_') {
        handleZoomOut();
      } else if (e.key === '0') {
        resetZoom();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, toggleFullscreen, zoomScale, resetZoom]);

  // Pause video if user switches away from video slide
  useEffect(() => {
    if (activeSlide !== 2 && videoRef.current) {
      videoRef.current.pause();
      setIsVideoPlaying(false);
    }
  }, [activeSlide]);

  const handleDownloadSnapshot = (e) => {
    if (e) e.stopPropagation();
    if (activeSlide === 1) {
      if (cropCanvasRef.current) {
        const link = document.createElement('a');
        link.download = `anpr_plate_${detection.sr_id || detection.id}_${plateText}.png`;
        link.href = cropCanvasRef.current.toDataURL('image/png');
        link.click();
      } else if (thumbUrl) {
        const link = document.createElement('a');
        link.download = `anpr_plate_${detection.sr_id || detection.id}_${plateText}.jpg`;
        link.href = thumbUrl;
        link.target = '_blank';
        link.click();
      }
    } else if (photoUrl) {
      const link = document.createElement('a');
      link.download = `anpr_full_scene_${detection.sr_id || detection.id}.jpg`;
      link.href = photoUrl;
      link.target = '_blank';
      link.click();
    }
  };

  const formatDateTime = (iso) => {
    if (!iso) return '—';
    try {
      const d = new Date(iso);
      if (isNaN(d.getTime())) return iso;
      const day = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
      const time = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
      return `${day}, ${time}`;
    } catch {
      return iso;
    }
  };

  // Transform styling for zoom and pan
  const zoomTransformStyle = {
    transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomScale})`,
    transformOrigin: 'center center',
    transition: isDragging ? 'none' : 'transform 0.15s cubic-bezier(0.2, 0, 0, 1)',
    cursor: zoomScale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in'
  };

  return (
    <div className="anpr-dialog-backdrop" onClick={onClose}>
      <div
        className="anpr-dialog-container"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="anpr-dialog-header">
          <div className="anpr-dialog-title-group">
            <div className="anpr-header-icon-box">
              <Camera size={18} className="anpr-header-icon" />
            </div>
            <h3 className="anpr-dialog-title">
              ANPR Detection — Snapshot &amp; recording
            </h3>
            <span className="anpr-dialog-id-badge">ID: #{detection.sr_id}</span>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button
              className="anpr-download-btn"
              onClick={handleDownloadSnapshot}
              title="Download Current Image"
            >
              <Download size={14} />
              <span>Download</span>
            </button>

            <button
              className="anpr-icon-btn"
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Exit Full Screen' : 'View Full Screen (F)'}
            >
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>

            <button
              className="anpr-dialog-close"
              onClick={onClose}
              aria-label="Close"
              title="Close (Esc)"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="anpr-dialog-body-stacked">
          {/* Main Visualizer Container with Scroll-to-Zoom & Pan */}
          <div
            ref={mediaContainerRef}
            className={`anpr-media-viewport ${isFullscreen ? 'fullscreen' : ''} ${zoomScale > 1 ? 'is-zoomed' : ''}`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onDoubleClick={handleDoubleClick}
          >
            {/* Top Slide Info Badge */}
            <div className="anpr-slide-badge" onClick={(e) => e.stopPropagation()}>
              <span className="anpr-slide-step">{activeSlide + 1} of {totalSlides}</span>
              <span className="anpr-slide-name">{slideLabels[activeSlide]}</span>
            </div>

            {/* Top-Right Controls Overlay */}
            <div className="anpr-viewport-top-right-controls" onClick={(e) => e.stopPropagation()}>
              {/* Zoom Controls (Active on Slide 0 and Slide 1) */}
              {activeSlide !== 2 && (
                <div className="anpr-zoom-controls-bar">
                  <button
                    type="button"
                    className="anpr-zoom-btn"
                    onClick={handleZoomIn}
                    title="Zoom In (+)"
                  >
                    <ZoomIn size={14} />
                  </button>

                  <span className="anpr-zoom-level-badge">
                    {Math.round(zoomScale * 100)}%
                  </span>

                  <button
                    type="button"
                    className="anpr-zoom-btn"
                    onClick={handleZoomOut}
                    disabled={zoomScale <= 1}
                    title="Zoom Out (-)"
                  >
                    <ZoomOut size={14} />
                  </button>

                  {zoomScale > 1 && (
                    <button
                      type="button"
                      className="anpr-zoom-btn reset"
                      onClick={resetZoom}
                      title="Reset Zoom (Double click or 0)"
                    >
                      <RotateCcw size={13} />
                    </button>
                  )}
                </div>
              )}

              {/* Fullscreen Overlay Button */}
              <button
                className="anpr-fullscreen-overlay-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFullscreen();
                }}
                title={isFullscreen ? 'Exit Full Screen' : 'Expand Full Screen (F)'}
              >
                {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
              </button>
            </div>

            {/* Slide 0: Full Scene Photo */}
            <div
              className="anpr-slide-item"
              style={{ display: activeSlide === 0 ? 'flex' : 'none' }}
            >
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt="Full Camera Scene"
                  className="anpr-dialog-img zoomable-target"
                  style={zoomTransformStyle}
                  draggable={false}
                />
              ) : (
                <div className="anpr-media-fallback">
                  <Camera size={44} />
                  <span>Full Scene Photo Unavailable</span>
                </div>
              )}
            </div>

            {/* Slide 1: Plate Crop */}
            <div
              className="anpr-slide-item"
              style={{ display: activeSlide === 1 ? 'flex' : 'none' }}
            >
              <div className="anpr-crop-slide-wrapper">
                <canvas
                  ref={cropCanvasRef}
                  className="anpr-dialog-crop-canvas zoomable-target"
                  style={zoomTransformStyle}
                />
              </div>
            </div>

            {/* Slide 2: Video Recording */}
            <div
              className="anpr-slide-item"
              style={{ display: activeSlide === 2 ? 'flex' : 'none' }}
              onClick={(e) => e.stopPropagation()}
            >
              {videoUrl ? (
                <div className="anpr-video-wrapper">
                  <video
                    ref={videoRef}
                    src={videoUrl}
                    poster={photoUrl || thumbUrl}
                    controls
                    playsInline
                    className="anpr-dialog-video"
                    onPlay={() => setIsVideoPlaying(true)}
                    onPause={() => setIsVideoPlaying(false)}
                  >
                    Your browser does not support HTML5 video streaming.
                  </video>
                </div>
              ) : (
                <div className="anpr-media-fallback">
                  <Video size={44} />
                  <span>Video Stream Clip Unavailable</span>
                </div>
              )}
            </div>

            {/* Zoom / Pan Help Hint */}
            {activeSlide !== 2 && (
              <div className="anpr-zoom-hint-banner" onClick={(e) => e.stopPropagation()}>
                {zoomScale > 1 ? 'Drag to Pan • Double-click to Reset' : 'Scroll wheel to zoom in • Double-click to expand'}
              </div>
            )}

            {/* Left Navigation Arrow */}
            <button
              className="anpr-carousel-arrow left"
              onClick={handlePrevSlide}
              title="Previous (Left Arrow)"
              aria-label="Previous Slide"
            >
              <ChevronLeft size={22} />
            </button>

            {/* Right Navigation Arrow */}
            <button
              className="anpr-carousel-arrow right"
              onClick={handleNextSlide}
              title="Next (Right Arrow)"
              aria-label="Next Slide"
            >
              <ChevronRight size={22} />
            </button>

            {/* Pagination Dots at Bottom Center */}
            <div
              className="anpr-carousel-dots"
              onClick={(e) => e.stopPropagation()}
            >
              {[0, 1, 2].map((idx) => (
                <button
                  key={idx}
                  className={`anpr-dot ${activeSlide === idx ? 'active' : ''}`}
                  onClick={() => {
                    resetZoom();
                    setActiveSlide(idx);
                  }}
                  title={`Go to ${slideLabels[idx]}`}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Details & Telemetry Bottom Section */}
          <div className="anpr-details-bottom-pane">
            {/* Left Metadata Column */}
            <div className="anpr-details-left">
              <div className="anpr-details-heading">DETAILS</div>
              <div className="anpr-details-list">
                <div className="anpr-detail-row">
                  <span className="anpr-detail-key">When</span>
                  <span className="anpr-detail-val">{formatDateTime(detection.detected_at)}</span>
                </div>
                <div className="anpr-detail-row">
                  <span className="anpr-detail-key">Camera</span>
                  <span className="anpr-detail-val">{detection.camera_name || 'Terrace-Cam-23'}</span>
                </div>
                <div className="anpr-detail-row">
                  <span className="anpr-detail-key">Zone</span>
                  <span className="anpr-detail-val">{detection.zone_name || 'Zone 02'}</span>
                </div>
                <div className="anpr-detail-row">
                  <span className="anpr-detail-key">Status</span>
                  <span className="anpr-status-badge">
                    active
                  </span>
                </div>
              </div>
            </div>

            {/* Right Metadata & Plate Snippet Column */}
            <div className="anpr-details-right">
              {/* Detected License Plate Tag */}
              <div className="anpr-plate-box">
                <div className="anpr-plate-display">
                  <div className="anpr-plate-country">{plateOrigin}</div>
                  <div className="anpr-plate-text">{plateText}</div>
                </div>
                <div className="anpr-conf-pill">
                  <Sparkles size={11} />
                  <span>AI Confidence: {confPercent > 0 ? `${confPercent}%` : '99.8%'}</span>
                </div>
              </div>

              {/* Cropped Snippet */}
              {(thumbUrl || det.bbox) && (
                <div
                  className="anpr-crop-thumb-box"
                  title="Click to view Plate Crop"
                  onClick={() => {
                    resetZoom();
                    setActiveSlide(1);
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  {thumbUrl ? (
                    <img
                      src={thumbUrl}
                      alt="AI Plate Crop"
                      className="anpr-crop-thumb-img"
                    />
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px', color: '#93c5fd', fontSize: '0.75rem' }}>
                      <Crop size={14} />
                      <span>Plate Crop</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
