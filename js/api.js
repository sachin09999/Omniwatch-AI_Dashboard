/**
 * OmniVision AI Dashboard - API Client Module
 * Supports live backend communication, proxy routing, and graceful mock fallback.
 */

import { MOCK_DASHBOARD_DATA, MOCK_CAMERA_CONFIGS, MOCK_DETECTIONS } from './mockData.js';

export class ApiClient {
    constructor() {
        this.useProxy = true; // Use relative path proxy by default
        this.directBaseUrl = 'http://10.10.12.52:8009';
        this.proxyBaseUrl = ''; // Same host (e.g. localhost:8080)
        this.mockMode = false;
        this.lastResponseStatus = 'unknown'; // 'live', 'mock', 'error'
    }

    getBaseUrl() {
        if (this.useProxy) {
            return this.proxyBaseUrl;
        }
        return this.directBaseUrl;
    }

    setUseProxy(value) {
        this.useProxy = !!value;
    }

    setDirectBaseUrl(url) {
        this.directBaseUrl = url.replace(/\/+$/, '');
    }

    setMockMode(value) {
        this.mockMode = !!value;
    }

    async request(path, params = {}) {
        if (this.mockMode) {
            this.lastResponseStatus = 'mock';
            return this.getMockResponse(path, params);
        }

        const url = new URL(`${this.getBaseUrl()}${path}`, window.location.origin);
        Object.keys(params).forEach(key => {
            if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
                url.searchParams.append(key, params[key]);
            }
        });

        try {
            const response = await fetch(url.toString(), {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            this.lastResponseStatus = 'live';
            return data;
        } catch (error) {
            console.warn(`[ApiClient] Request to ${url.toString()} failed. Falling back to mock dataset.`, error);
            this.lastResponseStatus = 'mock';
            return this.getMockResponse(path, params);
        }
    }

    getMockResponse(path, params = {}) {
        if (path.includes('/ai/detections/dashboard')) {
            return JSON.parse(JSON.stringify(MOCK_DASHBOARD_DATA));
        }

        if (path.includes('/ai/camera-ai-configs')) {
            let data = [...MOCK_CAMERA_CONFIGS.data];
            if (params.use_case_id) {
                data = data.filter(c => c.use_case_id === params.use_case_id);
            }
            return {
                message: "Success (Snapshot Cache)",
                status: "success",
                data: data
            };
        }

        if (path.includes('/ai/detections')) {
            let items = [...MOCK_DETECTIONS.data.items];

            if (params.use_case_id) {
                items = items.filter(d => d.use_case_id === params.use_case_id);
            }
            if (params.severity && params.severity !== 'all') {
                items = items.filter(d => d.severity.toLowerCase() === params.severity.toLowerCase());
            }
            
            const page = parseInt(params.page) || 1;
            const pageSize = parseInt(params.page_size) || 10;
            const start = (page - 1) * pageSize;
            const paginatedItems = items.slice(start, start + pageSize);

            return {
                message: "Success (Snapshot Cache)",
                status: "success",
                data: {
                    items: paginatedItems.length > 0 ? paginatedItems : items,
                    total: items.length,
                    page: page,
                    page_size: pageSize
                }
            };
        }

        return { message: "Success", status: "success", data: {} };
    }

    /**
     * Get Dashboard KPI Summary
     * @param {string} timeFrame - 'today', 'yesterday', 'this_week', etc.
     */
    async getDashboard(timeFrame = 'today') {
        return this.request('/ai/detections/dashboard', { time_frame: timeFrame });
    }

    /**
     * Get Camera AI Configs
     * @param {string} useCaseId - Optional filter by use case ID
     */
    async getCameraConfigs(useCaseId = null) {
        const params = {};
        if (useCaseId) params.use_case_id = useCaseId;
        return this.request('/ai/camera-ai-configs', params);
    }

    /**
     * Get Detections list with filtering and pagination
     */
    async getDetections({
        useCaseId = null,
        severity = null,
        page = 1,
        pageSize = 10,
        startDate = null,
        endDate = null,
        timeFrame = 'today',
        cameraId = null,
        zoneId = null,
        search = null
    } = {}) {
        let effectiveStart = startDate;
        let effectiveEnd = endDate;

        if (!effectiveStart || !effectiveEnd) {
            const now = new Date();
            const formatDate = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            const todayStr = formatDate(now);

            if (!timeFrame || timeFrame === 'today') {
                effectiveStart = todayStr;
                effectiveEnd = todayStr;
            } else if (timeFrame === 'yesterday') {
                const yest = new Date(now);
                yest.setDate(now.getDate() - 1);
                const yestStr = formatDate(yest);
                effectiveStart = yestStr;
                effectiveEnd = yestStr;
            } else if (timeFrame === 'last_7_days' || timeFrame === 'this_week' || timeFrame === 'week') {
                const w = new Date(now);
                w.setDate(now.getDate() - 7);
                effectiveStart = formatDate(w);
                effectiveEnd = todayStr;
            } else if (timeFrame === 'last_30_days' || timeFrame === 'this_month' || timeFrame === 'month') {
                const m = new Date(now);
                m.setDate(now.getDate() - 30);
                effectiveStart = formatDate(m);
                effectiveEnd = todayStr;
            } else if (timeFrame !== 'all' && timeFrame !== 'all_time') {
                effectiveStart = todayStr;
                effectiveEnd = todayStr;
            }
        }

        let validUcId = useCaseId;
        if (!validUcId || validUcId === 'e0820c96-a414-4fd1-aaae-4fa3beaaee7f') {
            validUcId = 'bf6e9245-1e14-4d11-a467-41ebd48c93a4';
        } else if (validUcId === 'ca6503cf-f881-4773-ab46-f6f22289d1bf') {
            validUcId = 'ae933a6f-c17c-49e1-9fbc-8e75710100e7';
        }

        const params = {
            page,
            page_size: pageSize
        };
        if (validUcId && validUcId !== 'all') params.use_case_id = validUcId;
        if (severity && severity !== 'all') params.severity = severity;
        if (effectiveStart) params.start_date = effectiveStart;
        if (effectiveEnd) params.end_date = effectiveEnd;
        if (cameraId && cameraId !== 'all') params.camera_id = cameraId;
        if (zoneId && zoneId !== 'all') params.zone_id = zoneId;
        if (search && search.trim()) params.search = search.trim();

        return this.request('/ai/detections', params);
    }

    /**
     * Build full URL for image/video media
     */
    resolveMediaUrl(relativeUrl) {
        if (!relativeUrl) return '';
        if (relativeUrl.startsWith('http://') || relativeUrl.startsWith('https://')) {
            return relativeUrl;
        }
        const base = this.getBaseUrl();
        return `${base}${relativeUrl.startsWith('/') ? '' : '/'}${relativeUrl}`;
    }
}

export const api = new ApiClient();
