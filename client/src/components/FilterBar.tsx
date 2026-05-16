import React, { memo, useCallback } from 'react';
import { Filter, X } from 'lucide-react';
import { RoomStatus, RoomType } from '../types/room';

interface FilterBarProps {
  filters: {
    floor?: number;
    status?: RoomStatus;
    type?: RoomType;
  };
  onFilterChange: (filters: {
    floor?: number;
    status?: RoomStatus;
    type?: RoomType;
  }) => void;
}

// Move static data outside component to avoid recreation on each render (rerender-memo-with-default-value)
const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: RoomStatus.VACANT, label: 'Vacant' },
  { value: RoomStatus.OCCUPIED, label: 'Occupied' },
  { value: RoomStatus.CLEANING, label: 'Cleaning' },
  { value: RoomStatus.MAINTENANCE, label: 'Maintenance' },
  { value: RoomStatus.RESERVED, label: 'Reserved' },
];

const typeOptions = [
  { value: '', label: 'All Types' },
  { value: RoomType.SINGLE, label: 'Single' },
  { value: RoomType.DOUBLE, label: 'Double' },
  { value: RoomType.SUITE, label: 'Suite' },
  { value: RoomType.DELUXE, label: 'Deluxe' },
  { value: RoomType.PRESIDENTIAL, label: 'Presidential' },
];

const floorOptions = [
  { value: '', label: 'All Floors' },
  { value: '1', label: 'Floor 1' },
  { value: '2', label: 'Floor 2' },
  { value: '3', label: 'Floor 3' },
  { value: '4', label: 'Floor 4' },
  { value: '5', label: 'Floor 5' },
];

// Memoize component to prevent unnecessary re-renders (rerender-memo)
const FilterBar = memo(function FilterBar({ filters, onFilterChange }: FilterBarProps) {
  const hasFilters = filters.floor || filters.status || filters.type;

  // Use useCallback for stable callback (rerender-functional-setstate)
  const handleStatusChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({
      ...filters,
      status: (e.target.value as RoomStatus) || undefined,
    });
  }, [filters, onFilterChange]);

  const handleTypeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({
      ...filters,
      type: (e.target.value as RoomType) || undefined,
    });
  }, [filters, onFilterChange]);

  const handleFloorChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({
      ...filters,
      floor: e.target.value ? parseInt(e.target.value) : undefined,
    });
  }, [filters, onFilterChange]);

  const clearFilters = useCallback(() => {
    onFilterChange({});
  }, [onFilterChange]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2 text-slate-600">
          <Filter className="h-5 w-5" />
          <span className="font-medium">Filters</span>
        </div>

        <select
          value={filters.status || ''}
          onChange={handleStatusChange}
          className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          value={filters.type || ''}
          onChange={handleTypeChange}
          className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {typeOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          value={filters.floor?.toString() || ''}
          onChange={handleFloorChange}
          className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {floorOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {hasFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
          >
            <X className="h-4 w-4" />
            Clear
          </button>
        )}
      </div>
    </div>
  );
});

export default FilterBar;
