'use client';

import React from 'react';
import { Search, X, Maximize2, Crop, Sparkles, AlertTriangle, Car } from 'lucide-react';

export default function SimpleFilterBar({
  searchQuery = '',
  onSearchChange,
  activeFilter = 'all', // 'all' | 'high' | 'anpr' | 'objects'
  onFilterChange,
  imageMode = 'full', // 'full' | 'crop'
  onImageModeChange,
  totalCount = 0
}) {
  return (
    <div className="simple-filter-bar">
      {/* Filter 1: Live Fast Search */}
      <div className="simple-search-box">
        <Search size={16} className="search-icon" />
        <input
          type="text"
          placeholder="Filter by plate number (e.g. 2001), camera, or zone..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Search snapshots"
        />
        {searchQuery && (
          <button
            className="search-clear-btn"
            onClick={() => onSearchChange('')}
            title="Clear search"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Filter 2: 1-Click Category & Severity Pills */}
      <div className="simple-pill-group">
        <button
          className={`filter-pill ${activeFilter === 'all' ? 'active' : ''}`}
          onClick={() => onFilterChange('all')}
        >
          <span>All Snapshots</span>
          <span className="pill-count">{totalCount}</span>
        </button>

        <button
          className={`filter-pill high ${activeFilter === 'high' ? 'active' : ''}`}
          onClick={() => onFilterChange('high')}
        >
          <AlertTriangle size={13} />
          <span>High Priority</span>
        </button>

        <button
          className={`filter-pill anpr ${activeFilter === 'anpr' ? 'active' : ''}`}
          onClick={() => onFilterChange('anpr')}
        >
          <Car size={13} />
          <span>ANPR Only</span>
        </button>

        <button
          className={`filter-pill ${activeFilter === 'objects' ? 'active' : ''}`}
          onClick={() => onFilterChange('objects')}
        >
          <Sparkles size={13} />
          <span>Objects</span>
        </button>
      </div>

      {/* Snapshot Preview Switcher */}
      <div className="preview-mode-toggle">
        <button
          className={`mode-btn ${imageMode === 'full' ? 'active' : ''}`}
          onClick={() => onImageModeChange('full')}
          title="Full Camera Scene Snapshot"
        >
          <Maximize2 size={13} />
          <span>Full Scene</span>
        </button>
        <button
          className={`mode-btn ${imageMode === 'crop' ? 'active' : ''}`}
          onClick={() => onImageModeChange('crop')}
          title="Cropped Object/Plate Snippet"
        >
          <Crop size={13} />
          <span>Cropped</span>
        </button>
      </div>
    </div>
  );
}
