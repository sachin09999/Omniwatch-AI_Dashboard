'use client';

import React from 'react';
import {
  Search,
  List,
  LayoutGrid,
  Calendar,
  Filter,
  RotateCcw,
  ShieldAlert,
  Camera,
  MapPin,
  X
} from 'lucide-react';

export default function ANPRFilterBar({
  searchQuery = '',
  onSearchChange,
  viewMode = 'table',
  onViewModeChange,
  severity = 'all',
  onSeverityChange,
  timeFrame = 'today',
  onTimeFrameChange,
  startDate = '',
  onStartDateChange,
  endDate = '',
  onEndDateChange,
  selectedCamera = 'all',
  onCameraChange,
  cameras = [],
  showCameraSelect = false,
  selectedZone = 'all',
  onZoneChange,
  zones = [],
  onApplyFilter,
  onResetFilters
}) {
  return (
    <div className="anpr-filter-bar-container">
      <div className="anpr-filter-bar">
        <div className="filter-controls-left">
          {/* 1. Search Query Input */}
          <div className="anpr-search-wrapper">
            <Search size={15} className="anpr-search-icon" />
            <input
              type="text"
              placeholder="Search ID, Zone, Plate Number..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="anpr-search-input"
            />
            {searchQuery && (
              <button
                type="button"
                className="anpr-search-clear"
                onClick={() => onSearchChange('')}
                title="Clear search"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* 2. View Switcher: Table vs Grid */}
          <div className="anpr-view-toggle">
            <button
              type="button"
              className={`anpr-view-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => onViewModeChange('table')}
              title="List / Table View"
            >
              <List size={16} />
            </button>
            <button
              type="button"
              className={`anpr-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => onViewModeChange('grid')}
              title="Grid Cards View"
            >
              <LayoutGrid size={16} />
            </button>
          </div>

          {/* 3. Severity Dropdown */}
          <div className="anpr-select-wrapper">
            <ShieldAlert size={14} className="anpr-input-icon" />
            <select
              value={severity}
              onChange={(e) => onSeverityChange(e.target.value)}
              className="anpr-select with-icon"
              title="Filter by Severity"
            >
              <option value="all">All Severities</option>
              <option value="high">High Severity</option>
              <option value="medium">Medium Severity</option>
              <option value="low">Low Severity</option>
            </select>
          </div>

          {/* 4. Camera Dropdown (Only shown when showCameraSelect is true) */}
          {showCameraSelect && (
            <div className="anpr-select-wrapper">
              <Camera size={14} className="anpr-input-icon" />
              <select
                value={selectedCamera}
                onChange={(e) => onCameraChange(e.target.value)}
                className="anpr-select with-icon"
                title="Filter by Camera"
              >
                <option value="all">All cameras</option>
                {cameras.map((cam, idx) => (
                  <option key={cam.id || idx} value={cam.id || cam.name}>
                    {cam.name || cam.camera_name || 'Camera'}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 5. Zone Dropdown */}
          <div className="anpr-select-wrapper">
            <MapPin size={14} className="anpr-input-icon" />
            <select
              value={selectedZone}
              onChange={(e) => onZoneChange(e.target.value)}
              className="anpr-select with-icon"
              title="Filter by Zone"
            >
              <option value="all">All zones</option>
              {zones.map((zone, idx) => (
                <option
                  key={typeof zone === 'object' ? zone.id || idx : idx}
                  value={typeof zone === 'object' ? zone.id || zone.name : zone}
                >
                  {typeof zone === 'object' ? zone.name || 'Zone' : zone}
                </option>
              ))}
            </select>
          </div>

          {/* 6. Date / Timeframe Dropdown */}
          <div className="anpr-date-select-wrapper">
            <Calendar size={14} className="anpr-calendar-icon" />
            <select
              value={timeFrame}
              onChange={(e) => onTimeFrameChange(e.target.value)}
              className="anpr-select with-icon"
              title="Filter by Time Frame"
            >
              <option value="all_time">All time</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="last_7_days">Last 7 days</option>
              <option value="last_30_days">Last 30 days</option>
              <option value="this_month">This month</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {/* 7. Custom Date Range Pickers (shown when 'custom' is selected) */}
          {timeFrame === 'custom' && (
            <div className="anpr-custom-dates">
              <div className="date-input-group">
                <span className="date-label">From:</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => onStartDateChange(e.target.value)}
                  className="anpr-date-input"
                  placeholder="YYYY-MM-DD"
                />
              </div>
              <div className="date-input-group">
                <span className="date-label">To:</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => onEndDateChange(e.target.value)}
                  className="anpr-date-input"
                  placeholder="YYYY-MM-DD"
                />
              </div>
            </div>
          )}
        </div>

        <div className="filter-controls-right">
          {/* Apply Filter Action Button */}
          <button
            type="button"
            className="anpr-filter-btn"
            onClick={onApplyFilter}
            title="Apply selected filters"
          >
            <Filter size={14} />
            <span>Filter</span>
          </button>

          {/* Reset Filters Action Button */}
          <button
            type="button"
            className="anpr-reset-btn"
            onClick={onResetFilters}
            title="Reset all filters to defaults"
          >
            <RotateCcw size={14} />
            <span>Reset Filters</span>
          </button>
        </div>
      </div>
    </div>
  );
}
