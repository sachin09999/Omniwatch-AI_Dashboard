'use client';

import React from 'react';
import { Search, LayoutGrid, List, Maximize2, Crop } from 'lucide-react';

export default function FilterBar({
  searchQuery,
  onSearchChange,
  severity,
  onSeverityChange,
  timeFrame,
  onTimeFrameChange,
  useCase,
  onUseCaseChange,
  viewMode,
  onViewModeChange,
  imageMode,
  onImageModeChange
}) {
  return (
    <div className="filter-bar">
      <div className="filter-left">
        <div className="search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search by Plate (e.g. 2001), Camera, Zone..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <div className="pill-group">
          <button
            className={`pill-btn ${severity === 'all' ? 'active' : ''}`}
            onClick={() => onSeverityChange('all')}
          >
            All Severities
          </button>
          <button
            className={`pill-btn high ${severity === 'high' ? 'active high' : ''}`}
            onClick={() => onSeverityChange('high')}
          >
            High
          </button>
          <button
            className={`pill-btn med ${severity === 'medium' ? 'active med' : ''}`}
            onClick={() => onSeverityChange('medium')}
          >
            Medium
          </button>
        </div>
      </div>

      <div className="filter-right">
        {/* Image Preview Toggle: Full Camera Scene vs Cropped Snippet */}
        <div className="pill-group" title="Card Image Preview Mode">
          <button
            className={`pill-btn ${imageMode === 'full' ? 'active' : ''}`}
            onClick={() => onImageModeChange('full')}
            style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <Maximize2 size={12} />
            <span>Full Scene</span>
          </button>
          <button
            className={`pill-btn ${imageMode === 'crop' ? 'active' : ''}`}
            onClick={() => onImageModeChange('crop')}
            style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <Crop size={12} />
            <span>Plate Crop</span>
          </button>
        </div>

        <select
          className="filter-select"
          value={timeFrame}
          onChange={(e) => onTimeFrameChange(e.target.value)}
        >
          <option value="today">Time Frame: Today</option>
          <option value="yesterday">Time Frame: Yesterday</option>
          <option value="this_week">Time Frame: This Week</option>
        </select>

        <select
          className="filter-select"
          value={useCase}
          onChange={(e) => onUseCaseChange(e.target.value)}
        >
          <option value="all">Use Case: All Categories</option>
          <option value="e0820c96-a414-4fd1-aaae-4fa3beaaee7f">ANPR Detection</option>
          <option value="ca6503cf-f881-4773-ab46-f6f22289d1bf">Object Detection</option>
        </select>

        <div className="pill-group">
          <button
            className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => onViewModeChange('grid')}
            title="Grid View"
            style={{ padding: '0.4rem 0.65rem', background: 'transparent', border: 'none', color: viewMode === 'grid' ? 'var(--text-main)' : 'var(--text-muted)', cursor: 'pointer', borderRadius: '4px' }}
          >
            <LayoutGrid size={15} />
          </button>
          <button
            className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
            onClick={() => onViewModeChange('table')}
            title="Table View"
            style={{ padding: '0.4rem 0.65rem', background: 'transparent', border: 'none', color: viewMode === 'table' ? 'var(--text-main)' : 'var(--text-muted)', cursor: 'pointer', borderRadius: '4px' }}
          >
            <List size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
