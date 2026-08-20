/**
 * OmniVision AI Dashboard - API Client Module
 * Supports live backend communication, proxy routing, and graceful mock fallback.
 */

import { MOCK_DASHBOARD_DATA, MOCK_CAMERA_CONFIGS, MOCK_DETECTIONS } from './mockData.js';

export class ApiClient {
    constructor() {
        this.useProxy = true; // Use relative path proxy by default
        this.directBaseUrl = 'http://10.10.10.60:8009';
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
        endDate = null
    } = {}) {
        const params = {
            page,
            page_size: pageSize
        };
        if (useCaseId) params.use_case_id = useCaseId;
        if (severity && severity !== 'all') params.severity = severity;
        if (startDate) params.start_date = startDate;
        if (endDate) params.end_date = endDate;

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
