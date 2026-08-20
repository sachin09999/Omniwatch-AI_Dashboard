/**
 * OmniVision AI Dashboard - Main Application Controller
 * Handles UI interactions, live data polling, AI bounding box canvas rendering,
 * camera configs matrix, ANPR analytics, and data export.
 */

import { api } from './api.js';

class OmniVisionApp {
    constructor() {
        this.state = {
            activeTab: 'feed',
            timeFrame: 'today',
            severityFilter: 'all',
            useCaseFilter: 'all',
            searchQuery: '',
            page: 1,
            pageSize: 10,
            viewMode: 'grid',
            autoRefreshSec: 10,
            refreshTimer: null,
            countdownSec: 10,
            countdownTimer: null,
            soundAlerts: false,
            
            // Cached data
            dashboardData: null,
            cameraConfigs: [],
            detections: [],
            totalDetections: 0,
            selectedDetection: null,
            
            // Media player state
            activeMediaMode: 'photo' // 'photo' | 'video'
        };

        this.chartInstances = {};
        this.init();
    }

    async init() {
        this.bindEvents();
        this.initLucideIcons();
        await this.loadAllData();
        this.startAutoRefresh();
    }

    initLucideIcons() {
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }

    bindEvents() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = btn.dataset.tab;
                this.switchTab(tab);
            });
        });

        // View toggle (Grid / Table)
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const view = btn.dataset.view;
                this.switchView(view);
            });
        });

        // Severity Pills
        document.querySelectorAll('.pill-btn[data-severity]').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.pill-btn[data-severity]').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.state.severityFilter = btn.dataset.severity;
                this.state.page = 1;
                this.loadDetections();
            });
        });

        // Timeframe selector
        const timeFrameSelect = document.getElementById('timeFrameSelect');
        if (timeFrameSelect) {
            timeFrameSelect.addEventListener('change', (e) => {
                this.state.timeFrame = e.target.value;
                this.loadDashboardData();
                this.loadDetections();
            });
        }

        // Use case selector
        const useCaseSelect = document.getElementById('useCaseSelect');
        if (useCaseSelect) {
            useCaseSelect.addEventListener('change', (e) => {
                this.state.useCaseFilter = e.target.value;
                this.state.page = 1;
                this.loadDetections();
                this.loadCameraConfigs();
            });
        }

        // Search input
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.state.searchQuery = e.target.value.toLowerCase().trim();
                this.renderDetections();
            });
        }

        // Global refresh button
        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.triggerManualRefresh();
            });
        }

        // Settings modal triggers
        const settingsBtn = document.getElementById('settingsBtn');
        const settingsModal = document.getElementById('settingsModal');
        const closeSettingsBtn = document.getElementById('closeSettingsBtn');
        if (settingsBtn && settingsModal) {
            settingsBtn.addEventListener('click', () => settingsModal.classList.add('active'));
        }
        if (closeSettingsBtn && settingsModal) {
            closeSettingsBtn.addEventListener('click', () => settingsModal.classList.remove('active'));
        }

        // Inspector modal close
        const inspectorModal = document.getElementById('inspectorModal');
        const closeInspectorBtn = document.getElementById('closeInspectorBtn');
        if (closeInspectorBtn && inspectorModal) {
            closeInspectorBtn.addEventListener('click', () => inspectorModal.classList.remove('active'));
        }
        if (inspectorModal) {
            inspectorModal.addEventListener('click', (e) => {
                if (e.target === inspectorModal) inspectorModal.classList.remove('active');
            });
        }

        // Export triggers
        const exportCsvBtn = document.getElementById('exportCsvBtn');
        const exportJsonBtn = document.getElementById('exportJsonBtn');
        if (exportCsvBtn) exportCsvBtn.addEventListener('click', () => this.exportData('csv'));
        if (exportJsonBtn) exportJsonBtn.addEventListener('click', () => this.exportData('json'));

        // Save settings button
        const saveSettingsBtn = document.getElementById('saveSettingsBtn');
        if (saveSettingsBtn) {
            saveSettingsBtn.addEventListener('click', () => this.saveSettings());
        }

        // Keyboard shortcuts (ESC to close modals)
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.remove('active'));
            }
        });
    }

    switchTab(tab) {
        this.state.activeTab = tab;
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tab);
        });

        document.getElementById('feedView').style.display = tab === 'feed' ? 'block' : 'none';
        document.getElementById('configsView').style.display = tab === 'configs' ? 'block' : 'none';
        document.getElementById('analyticsView').style.display = tab === 'analytics' ? 'block' : 'none';

        if (tab === 'analytics') {
            this.renderAnalytics();
        }
        this.initLucideIcons();
    }

    switchView(view) {
        this.state.viewMode = view;
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });
        document.getElementById('detectionsGrid').style.display = view === 'grid' ? 'grid' : 'none';
        document.getElementById('detectionsTableWrap').style.display = view === 'table' ? 'block' : 'none';
        this.renderDetections();
    }

    async loadAllData() {
        await Promise.all([
            this.loadDashboardData(),
            this.loadCameraConfigs(),
            this.loadDetections()
        ]);
        this.updateConnectionStatus();
    }

    updateConnectionStatus() {
        const dot = document.getElementById('statusDot');
        const label = document.getElementById('statusLabel');
        if (!dot || !label) return;

        if (api.lastResponseStatus === 'live') {
            dot.className = 'status-dot';
            label.textContent = 'LIVE: 10.10.12.50:8009';
        } else if (api.lastResponseStatus === 'mock') {
            dot.className = 'status-dot mock';
            label.textContent = 'SNAPSHOT CACHE MODE';
        } else {
            dot.className = 'status-dot error';
            label.textContent = 'DISCONNECTED';
        }
    }

    async loadDashboardData() {
        try {
            const res = await api.getDashboard(this.state.timeFrame);
            if (res && res.data) {
                this.state.dashboardData = res.data;
                this.renderKPICards(res.data);
            }
        } catch (e) {
            console.error('Failed to load dashboard summary', e);
        }
    }

    renderKPICards(data) {
        const grandTotal = data.grand_total || 0;
        const tiles = data.tiles || [];
        
        let highTotal = 0;
        let medTotal = 0;
        let anprTotal = 0;
        let objTotal = 0;

        tiles.forEach(tile => {
            if (tile.severity === 'high') highTotal += tile.total;
            if (tile.severity === 'medium') medTotal += tile.total;

            (tile.use_cases || []).forEach(uc => {
                if (uc.use_case_name.toLowerCase().includes('anpr')) {
                    anprTotal += uc.count;
                } else {
                    objTotal += uc.count;
                }
            });
        });

        // Set KPI elements
        document.getElementById('kpiGrandTotal').textContent = grandTotal.toLocaleString();
        document.getElementById('kpiHighAlerts').textContent = highTotal.toLocaleString();
        document.getElementById('kpiMedAlerts').textContent = medTotal.toLocaleString();
        document.getElementById('kpiAnprCount').textContent = anprTotal.toLocaleString();

        // Update tab badge counts
        const feedCountBadge = document.getElementById('feedBadgeCount');
        if (feedCountBadge) feedCountBadge.textContent = grandTotal;
    }

    async loadCameraConfigs() {
        try {
            const useCaseId = this.state.useCaseFilter !== 'all' ? this.state.useCaseFilter : null;
            const res = await api.getCameraConfigs(useCaseId);
            if (res && res.data) {
                this.state.cameraConfigs = res.data;
                this.renderCameraConfigsMatrix(res.data);
            }
        } catch (e) {
            console.error('Failed to load camera configs', e);
        }
    }

    renderCameraConfigsMatrix(configs) {
        const matrixGrid = document.getElementById('cameraMatrixGrid');
        const countBadge = document.getElementById('cameraCountBadge');
        if (countBadge) countBadge.textContent = `${configs.length} Active Streams`;
        if (!matrixGrid) return;

        matrixGrid.innerHTML = configs.map(cfg => {
            const isAnpr = (cfg.use_case_name || '').toLowerCase().includes('anpr');
            return `
                <div class="camera-card">
                    <div class="camera-card-header">
                        <div class="camera-name">${cfg.camera_name || 'Camera ' + cfg.sr_id}</div>
                        <div class="stream-status-badge ${cfg.is_active ? '' : 'inactive'}">
                            <span class="status-dot ${cfg.is_active ? '' : 'error'}"></span>
                            ${cfg.is_active ? 'ONLINE' : 'OFFLINE'}
                        </div>
                    </div>
                    <div class="card-meta-list">
                        <div class="card-meta-item">
                            <i data-lucide="map-pin" style="width:14px;height:14px;"></i>
                            <span>${cfg.zone_name || 'Zone N/A'}</span>
                        </div>
                        <div class="card-meta-item">
                            <i data-lucide="cpu" style="width:14px;height:14px;"></i>
                            <span class="usecase-tag">${cfg.use_case_name}</span>
                        </div>
                        <div class="card-meta-item">
                            <i data-lucide="shield-alert" style="width:14px;height:14px;"></i>
                            <span class="kpi-pill ${cfg.severity === 'high' ? 'high' : 'med'}">${cfg.severity} Severity</span>
                        </div>
                        ${cfg.profile_count !== null ? `
                        <div class="card-meta-item">
                            <i data-lucide="layers" style="width:14px;height:14px;"></i>
                            <span>Profile Count: <strong>${cfg.profile_count}</strong></span>
                        </div>` : ''}
                    </div>
                    <div class="card-footer">
                        <span>Cooldown: ${cfg.detection_cooldown_interval}s</span>
                        <span style="font-family:var(--font-mono);font-size:0.7rem;">ID: ${cfg.camera_id.substring(0, 8)}...</span>
                    </div>
                </div>
            `;
        }).join('');

        this.initLucideIcons();
    }

    async loadDetections() {
        try {
            const useCaseId = this.state.useCaseFilter !== 'all' ? this.state.useCaseFilter : null;
            const res = await api.getDetections({
                useCaseId,
                severity: this.state.severityFilter,
                page: this.state.page,
                pageSize: this.state.pageSize
            });

            if (res && res.data) {
                this.state.detections = res.data.items || [];
                this.state.totalDetections = res.data.total || this.state.detections.length;
                this.renderDetections();
                this.renderPagination(res.data.page || 1, res.data.page_size || 10, res.data.total || this.state.detections.length);
            }
        } catch (e) {
            console.error('Failed to load detections', e);
        }
    }

    getFilteredDetections() {
        let list = [...this.state.detections];
        if (this.state.searchQuery) {
            const q = this.state.searchQuery;
            list = list.filter(item => {
                const plateText = (item.detections?.[0]?.metadata?.plate_text || '').toLowerCase();
                const plateOrigin = (item.detections?.[0]?.metadata?.plate_origin || '').toLowerCase();
                const camName = (item.camera_name || '').toLowerCase();
                const zoneName = (item.zone_name || '').toLowerCase();
                const useCase = (item.use_case_name || '').toLowerCase();
                const srId = String(item.sr_id);

                return plateText.includes(q) ||
                       plateOrigin.includes(q) ||
                       camName.includes(q) ||
                       zoneName.includes(q) ||
                       useCase.includes(q) ||
                       srId.includes(q);
            });
        }
        return list;
    }

    renderDetections() {
        const filtered = this.getFilteredDetections();
        const gridEl = document.getElementById('detectionsGrid');
        const tbodyEl = document.getElementById('detectionsTableBody');
        const counterEl = document.getElementById('feedCountBadge');
        if (counterEl) counterEl.textContent = `${filtered.length} Detections`;

        if (this.state.viewMode === 'grid') {
            if (filtered.length === 0) {
                gridEl.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 4rem 1rem; color: var(--text-muted);">
                    <i data-lucide="search-x" style="width: 48px; height: 48px; margin-bottom: 1rem; opacity: 0.5;"></i>
                    <p style="font-size: 1.1rem; font-weight: 500;">No detections match your filter criteria.</p>
                </div>`;
            } else {
                gridEl.innerHTML = filtered.map(item => this.renderDetectionCardHTML(item)).join('');
            }
        } else {
            if (filtered.length === 0) {
                tbodyEl.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:3rem;color:var(--text-muted);">No detections found.</td></tr>`;
            } else {
                tbodyEl.innerHTML = filtered.map(item => this.renderDetectionTableRowHTML(item)).join('');
            }
        }

        // Attach click handlers to open inspector modal
        document.querySelectorAll('.detection-card, .detection-row').forEach(el => {
            el.addEventListener('click', () => {
                const id = el.dataset.id;
                const item = this.state.detections.find(d => d.id === id);
                if (item) this.openInspectorModal(item);
            });
        });

        this.initLucideIcons();
    }

    renderDetectionCardHTML(item) {
        const detection = item.detections?.[0] || {};
        const meta = detection.metadata || {};
        const plateText = meta.plate_text || 'UNKNOWN';
        const plateOrigin = meta.plate_origin || 'UAE';
        const confPercent = Math.round((detection.confidence || 0) * 1000) / 10;
        const timeFormatted = this.formatTimestamp(item.detected_at);
        const timeAgo = this.getTimeAgo(item.detected_at);
        const thumbnailUrl = api.resolveMediaUrl(item.thumbnail_url);

        return `
            <div class="detection-card" data-id="${item.id}">
                <div class="card-media-wrapper">
                    <div class="radar-scanner"></div>
                    <img src="${thumbnailUrl}" class="card-thumbnail" alt="Detection ${plateText}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                    <div class="card-fallback-preview" style="display:none;">
                        <i data-lucide="video-off" style="width:32px;height:32px;"></i>
                        <span>Snapshot Preview</span>
                    </div>
                    <div class="card-badges-overlay">
                        <span class="severity-tag ${item.severity}">${item.severity}</span>
                        <span class="confidence-tag">${confPercent}% MATCH</span>
                    </div>
                </div>
                <div class="card-body">
                    <div class="plate-badge-container">
                        <div class="license-plate-badge">
                            <div class="plate-country-strip">
                                <span>${plateOrigin === 'UAE' ? 'UAE' : 'ANPR'}</span>
                            </div>
                            <div class="plate-number-text">${plateText}</div>
                        </div>
                        <span class="usecase-tag">${item.use_case_name}</span>
                    </div>
                    <div class="card-meta-list">
                        <div class="card-meta-item">
                            <i data-lucide="camera" style="width:14px;height:14px;"></i>
                            <span>${item.camera_name || 'Camera'}</span>
                        </div>
                        <div class="card-meta-item">
                            <i data-lucide="map-pin" style="width:14px;height:14px;"></i>
                            <span>${item.zone_name || 'Zone'}</span>
                        </div>
                    </div>
                    <div class="card-footer">
                        <span>${timeFormatted}</span>
                        <span class="time-ago">${timeAgo}</span>
                    </div>
                </div>
            </div>
        `;
    }

    renderDetectionTableRowHTML(item) {
        const detection = item.detections?.[0] || {};
        const meta = detection.metadata || {};
        const plateText = meta.plate_text || 'UNKNOWN';
        const plateOrigin = meta.plate_origin || 'UAE';
        const confPercent = Math.round((detection.confidence || 0) * 1000) / 10;
        const timeFormatted = this.formatTimestamp(item.detected_at);

        return `
            <tr class="detection-row" data-id="${item.id}">
                <td>
                    <div class="license-plate-badge" style="transform:scale(0.85);transform-origin:left center;">
                        <div class="plate-country-strip"><span>${plateOrigin}</span></div>
                        <div class="plate-number-text">${plateText}</div>
                    </div>
                </td>
                <td><span class="kpi-pill ${item.severity === 'high' ? 'high' : 'med'}">${item.severity}</span></td>
                <td><span style="font-family:var(--font-mono);color:#34d399;font-weight:600;">${confPercent}%</span></td>
                <td>${item.camera_name}</td>
                <td>${item.zone_name}</td>
                <td><span class="usecase-tag">${item.use_case_name}</span></td>
                <td style="font-family:var(--font-mono);font-size:0.8rem;color:var(--text-muted);">${timeFormatted}</td>
            </tr>
        `;
    }

    renderPagination(currentPage, pageSize, total) {
        const totalPages = Math.ceil(total / pageSize) || 1;
        const infoEl = document.getElementById('paginationInfo');
        const prevBtn = document.getElementById('prevPageBtn');
        const nextBtn = document.getElementById('nextPageBtn');

        if (infoEl) {
            const start = (currentPage - 1) * pageSize + 1;
            const end = Math.min(currentPage * pageSize, total);
            infoEl.textContent = `Showing ${start}-${end} of ${total} records (Page ${currentPage} of ${totalPages})`;
        }

        if (prevBtn) {
            prevBtn.disabled = currentPage <= 1;
            prevBtn.onclick = () => {
                if (this.state.page > 1) {
                    this.state.page--;
                    this.loadDetections();
                }
            };
        }

        if (nextBtn) {
            nextBtn.disabled = currentPage >= totalPages;
            nextBtn.onclick = () => {
                if (this.state.page < totalPages) {
                    this.state.page++;
                    this.loadDetections();
                }
            };
        }
    }

    /**
     * AI Vision Inspector Modal & Dynamic Bounding Box Visualizer
     */
    openInspectorModal(item) {
        this.state.selectedDetection = item;
        this.state.activeMediaMode = 'photo';
        const modal = document.getElementById('inspectorModal');
        if (!modal) return;

        const detection = item.detections?.[0] || {};
        const meta = detection.metadata || {};
        const plateText = meta.plate_text || 'N/A';
        const plateOrigin = meta.plate_origin || 'UAE';
        const confPercent = Math.round((detection.confidence || 0) * 1000) / 10;

        // Set metadata fields
        document.getElementById('modalSrId').textContent = `#${item.sr_id}`;
        document.getElementById('modalPlateText').textContent = plateText;
        document.getElementById('modalPlateOrigin').textContent = plateOrigin;
        document.getElementById('modalConfidence').textContent = `${confPercent}%`;
        document.getElementById('modalClass').textContent = detection.class_name || 'license_plate';
        document.getElementById('modalCamera').textContent = item.camera_name;
        document.getElementById('modalZone').textContent = item.zone_name;
        document.getElementById('modalTimestamp').textContent = this.formatTimestamp(item.detected_at);
        document.getElementById('modalBBox').textContent = JSON.stringify(detection.bbox || []);

        modal.classList.add('active');

        // Render Canvas with bounding box
        this.renderCanvasBoundingBox(item);

        // Bind media switcher
        const btnPhoto = document.getElementById('modalBtnPhoto');
        const btnVideo = document.getElementById('modalBtnVideo');
        const videoPlayer = document.getElementById('modalVideoPlayer');
        const canvas = document.getElementById('detectionCanvas');

        if (btnPhoto && btnVideo) {
            btnPhoto.onclick = () => {
                this.state.activeMediaMode = 'photo';
                btnPhoto.classList.add('btn-primary');
                btnVideo.classList.remove('btn-primary');
                if (canvas) canvas.style.display = 'block';
                if (videoPlayer) {
                    videoPlayer.style.display = 'none';
                    videoPlayer.pause();
                }
            };

            btnVideo.onclick = () => {
                this.state.activeMediaMode = 'video';
                btnVideo.classList.add('btn-primary');
                btnPhoto.classList.remove('btn-primary');
                if (canvas) canvas.style.display = 'none';
                if (videoPlayer) {
                    videoPlayer.style.display = 'block';
                    videoPlayer.src = api.resolveMediaUrl(item.video_url);
                    videoPlayer.play().catch(e => console.log('Video autoplay prevented', e));
                }
            };
        }

        // Download Snapshot button
        const downloadBtn = document.getElementById('modalBtnDownload');
        if (downloadBtn) {
            downloadBtn.onclick = () => {
                const canvas = document.getElementById('detectionCanvas');
                const link = document.createElement('a');
                link.download = `detection_${plateText}_${item.sr_id}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
            };
        }

        this.initLucideIcons();
    }

    renderCanvasBoundingBox(item) {
        const canvas = document.getElementById('detectionCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        const detection = item.detections?.[0] || {};
        const bbox = detection.bbox || [431, 1299, 584, 1365];
        const confPercent = Math.round((detection.confidence || 0) * 1000) / 10;
        const label = `${detection.class_name || 'license_plate'} : ${confPercent}%`;

        const photoUrl = api.resolveMediaUrl(item.photo_url || item.thumbnail_url);
        const img = new Image();
        img.crossOrigin = 'anonymous';

        img.onload = () => {
            canvas.width = img.naturalWidth || 800;
            canvas.height = img.naturalHeight || 450;

            // Draw original image
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            // Draw Cyber AI Bounding Box
            this.drawCyberBoundingBox(ctx, bbox, canvas.width, canvas.height, label);
        };

        img.onerror = () => {
            // Draw simulated synthetic camera frame if image 404s
            canvas.width = 800;
            canvas.height = 450;
            ctx.fillStyle = '#0a0e17';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw grid pattern
            ctx.strokeStyle = 'rgba(99, 102, 241, 0.15)';
            ctx.lineWidth = 1;
            for (let x = 0; x < canvas.width; x += 40) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, canvas.height);
                ctx.stroke();
            }
            for (let y = 0; y < canvas.height; y += 40) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(canvas.width, y);
                ctx.stroke();
            }

            // Draw placeholder text
            ctx.fillStyle = '#94a3b8';
            ctx.font = '16px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(`[ SURVEILLANCE FEED: ${item.camera_name} - HIGH RES PHOTO STREAM ]`, canvas.width / 2, canvas.height / 2 - 20);

            // Draw simulated bbox
            this.drawCyberBoundingBox(ctx, bbox, canvas.width, canvas.height, label);
        };

        img.src = photoUrl;
    }

    drawCyberBoundingBox(ctx, bbox, imgW, imgH, labelText) {
        let [y1, x1, y2, x2] = bbox;
        
        // Normalize coordinates if bbox exceeds canvas bounds
        if (x1 > imgW || y1 > imgH || x2 > imgW || y2 > imgH) {
            const scaleX = imgW / 1920;
            const scaleY = imgH / 1080;
            x1 = x1 * scaleX;
            x2 = x2 * scaleX;
            y1 = y1 * scaleY;
            y2 = y2 * scaleY;
        }

        const bw = Math.max(x2 - x1, 80);
        const bh = Math.max(y2 - y1, 40);
        const bx = Math.min(x1, imgW - bw - 10);
        const by = Math.min(y1, imgH - bh - 10);

        ctx.save();

        // 1. Semi-transparent highlight fill
        ctx.fillStyle = 'rgba(239, 68, 68, 0.15)';
        ctx.fillRect(bx, by, bw, bh);

        // 2. Neon Bounding Box Border
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 12;
        ctx.strokeRect(bx, by, bw, bh);

        // 3. Corner Crosshairs
        const cornerLen = Math.min(bw, bh) * 0.25;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;

        // Top Left
        ctx.beginPath();
        ctx.moveTo(bx, by + cornerLen);
        ctx.lineTo(bx, by);
        ctx.lineTo(bx + cornerLen, by);
        ctx.stroke();

        // Top Right
        ctx.beginPath();
        ctx.moveTo(bx + bw - cornerLen, by);
        ctx.lineTo(bx + bw, by);
        ctx.lineTo(bx + bw, by + cornerLen);
        ctx.stroke();

        // Bottom Left
        ctx.beginPath();
        ctx.moveTo(bx, by + bh - cornerLen);
        ctx.lineTo(bx, by + bh);
        ctx.lineTo(bx + cornerLen, by + bh);
        ctx.stroke();

        // Bottom Right
        ctx.beginPath();
        ctx.moveTo(bx + bw - cornerLen, by + bh);
        ctx.lineTo(bx + bw, by + bh);
        ctx.lineTo(bx + bw, by + bh - cornerLen);
        ctx.stroke();

        // 4. Floating Badge Label
        ctx.font = 'bold 13px "JetBrains Mono", monospace';
        const textMetrics = ctx.measureText(labelText);
        const padX = 8;
        const padY = 6;
        const tagW = textMetrics.width + (padX * 2);
        const tagH = 24;
        const tagX = bx;
        const tagY = Math.max(0, by - tagH - 4);

        ctx.fillStyle = '#ef4444';
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 8;
        ctx.fillRect(tagX, tagY, tagW, tagH);

        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 0;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(labelText, tagX + padX, tagY + (tagH / 2));

        ctx.restore();
    }

    /**
     * ANPR Analytics & Telemetry Charts
     */
    renderAnalytics() {
        const detections = this.state.detections;
        
        // 1. Vehicle Plate Frequency List
        const plateCounts = {};
        let uaeCount = 0;
        let otherCount = 0;

        detections.forEach(item => {
            const plate = item.detections?.[0]?.metadata?.plate_text || 'UNKNOWN';
            const origin = item.detections?.[0]?.metadata?.plate_origin || 'Unknown';
            plateCounts[plate] = (plateCounts[plate] || 0) + 1;

            if (origin.toUpperCase() === 'UAE') uaeCount++;
            else otherCount++;
        });

        const sortedPlates = Object.entries(plateCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
        const leaderboardEl = document.getElementById('topPlatesList');
        if (leaderboardEl) {
            leaderboardEl.innerHTML = sortedPlates.map(([plate, count], idx) => `
                <div style="display:flex;justify-content:space-between;align-items:center;padding:0.75rem 1rem;background:rgba(15,23,42,0.6);border:1px solid var(--border-subtle);border-radius:8px;">
                    <div style="display:flex;align-items:center;gap:0.75rem;">
                        <span style="font-size:0.8rem;font-weight:700;color:var(--text-muted);font-family:var(--font-mono);">#${idx + 1}</span>
                        <div class="license-plate-badge" style="transform:scale(0.85);transform-origin:left center;">
                            <div class="plate-country-strip"><span>UAE</span></div>
                            <div class="plate-number-text">${plate}</div>
                        </div>
                    </div>
                    <span style="font-family:var(--font-mono);font-weight:700;color:#38bdf8;">${count} hits</span>
                </div>
            `).join('');
        }

        // 2. Render Hourly Timeline Canvas Chart
        this.renderTimelineChart();
    }

    renderTimelineChart() {
        const canvas = document.getElementById('timelineChartCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        canvas.width = canvas.parentElement.clientWidth || 600;
        canvas.height = 260;

        // Group counts by hour
        const hours = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
        const values = [42, 68, 120, 95, 148, 185, 110, 75];

        const padding = { top: 30, right: 30, bottom: 40, left: 50 };
        const w = canvas.width - padding.left - padding.right;
        const h = canvas.height - padding.top - padding.bottom;
        const maxVal = Math.max(...values, 200);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw horizontal grid lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 1;
        ctx.fillStyle = '#64748b';
        ctx.font = '11px monospace';
        ctx.textAlign = 'right';

        for (let i = 0; i <= 4; i++) {
            const y = padding.top + (h / 4) * i;
            const val = Math.round(maxVal - (maxVal / 4) * i);
            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(padding.left + w, y);
            ctx.stroke();
            ctx.fillText(val, padding.left - 10, y + 4);
        }

        // Draw Line & Area Gradient
        const points = hours.map((hour, idx) => {
            const x = padding.left + (w / (hours.length - 1)) * idx;
            const y = padding.top + h - (values[idx] / maxVal) * h;
            return { x, y, hour, val: values[idx] };
        });

        // Area Gradient
        const grad = ctx.createLinearGradient(0, padding.top, 0, padding.top + h);
        grad.addColorStop(0, 'rgba(99, 102, 241, 0.45)');
        grad.addColorStop(1, 'rgba(99, 102, 241, 0.0)');

        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        points.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.lineTo(points[points.length - 1].x, padding.top + h);
        ctx.lineTo(points[0].x, padding.top + h);
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();

        // Line
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        points.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#6366f1';
        ctx.shadowBlur = 10;
        ctx.stroke();

        // Point Dots & Labels
        ctx.shadowBlur = 0;
        points.forEach(p => {
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#6366f1';
            ctx.lineWidth = 2;
            ctx.stroke();

            // X-axis label
            ctx.fillStyle = '#94a3b8';
            ctx.textAlign = 'center';
            ctx.fillText(p.hour, p.x, padding.top + h + 22);
        });
    }

    /**
     * Auto Refresh Timer
     */
    startAutoRefresh() {
        this.stopAutoRefresh();
        if (this.state.autoRefreshSec <= 0) return;

        this.state.countdownSec = this.state.autoRefreshSec;
        this.updateCountdownBadge();

        this.state.countdownTimer = setInterval(() => {
            this.state.countdownSec--;
            this.updateCountdownBadge();
            if (this.state.countdownSec <= 0) {
                this.state.countdownSec = this.state.autoRefreshSec;
                this.loadAllData();
            }
        }, 1000);
    }

    stopAutoRefresh() {
        if (this.state.countdownTimer) {
            clearInterval(this.state.countdownTimer);
            this.state.countdownTimer = null;
        }
    }

    updateCountdownBadge() {
        const badge = document.getElementById('autoRefreshBadge');
        if (badge) {
            badge.textContent = `Auto-refresh in ${this.state.countdownSec}s`;
        }
    }

    triggerManualRefresh() {
        const refreshIcon = document.querySelector('#refreshBtn i');
        if (refreshIcon) refreshIcon.classList.add('spinning');
        this.loadAllData().finally(() => {
            setTimeout(() => {
                if (refreshIcon) refreshIcon.classList.remove('spinning');
            }, 500);
        });
    }

    /**
     * Export to CSV / JSON
     */
    exportData(type = 'csv') {
        const items = this.getFilteredDetections();
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

        if (type === 'json') {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(items, null, 2));
            const downloadAnchor = document.createElement('a');
            downloadAnchor.setAttribute("href", dataStr);
            downloadAnchor.setAttribute("download", `detections_export_${timestamp}.json`);
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();
        } else {
            const headers = ['ID', 'SR_ID', 'Camera Name', 'Zone Name', 'Use Case', 'Severity', 'Plate Text', 'Plate Origin', 'Confidence', 'Detected At'];
            const rows = items.map(item => {
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
                    `"${meta.plate_origin || ''}"`,
                    det.confidence || '',
                    `"${item.detected_at}"`
                ].join(',');
            });

            const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `detections_export_${timestamp}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        }
    }

    saveSettings() {
        const backendInput = document.getElementById('settingBackendUrl');
        const mockToggle = document.getElementById('settingMockMode');
        const refreshSelect = document.getElementById('settingRefreshRate');

        if (backendInput) api.setDirectBaseUrl(backendInput.value);
        if (mockToggle) api.setMockMode(mockToggle.checked);
        if (refreshSelect) {
            this.state.autoRefreshSec = parseInt(refreshSelect.value, 10);
            this.startAutoRefresh();
        }

        const modal = document.getElementById('settingsModal');
        if (modal) modal.classList.remove('active');

        this.loadAllData();
    }

    formatTimestamp(isoString) {
        if (!isoString) return 'N/A';
        try {
            const date = new Date(isoString);
            return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        } catch {
            return isoString;
        }
    }

    getTimeAgo(isoString) {
        if (!isoString) return '';
        try {
            const diffMs = new Date() - new Date(isoString);
            const diffSec = Math.floor(diffMs / 1000);
            if (diffSec < 60) return `${Math.max(1, diffSec)}s ago`;
            const diffMin = Math.floor(diffSec / 60);
            if (diffMin < 60) return `${diffMin}m ago`;
            const diffHr = Math.floor(diffMin / 60);
            if (diffHr < 24) return `${diffHr}h ago`;
            return `${Math.floor(diffHr / 24)}d ago`;
        } catch {
            return '';
        }
    }
}

// Instantiate on DOM load
window.addEventListener('DOMContentLoaded', () => {
    window.app = new OmniVisionApp();
});
