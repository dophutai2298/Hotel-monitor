import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { RoomStatus } from '../types/room';

// Memoize class name merging function (js-cache-function-results)
const cnCache = new Map<string, string>();

export function cn(...inputs: ClassValue[]) {
  const key = JSON.stringify(inputs);
  if (cnCache.has(key)) {
    return cnCache.get(key)!;
  }
  const result = twMerge(clsx(inputs));
  cnCache.set(key, result);
  return result;
}

// Memoize status color mapping (js-cache-function-results)
const statusColorCache = new Map<RoomStatus, string>();
const statusColors: Record<RoomStatus, string> = {
  [RoomStatus.VACANT]: 'bg-status-vacant',
  [RoomStatus.OCCUPIED]: 'bg-status-occupied',
  [RoomStatus.CLEANING]: 'bg-status-cleaning',
  [RoomStatus.MAINTENANCE]: 'bg-status-maintenance',
  [RoomStatus.RESERVED]: 'bg-status-reserved',
};

export function getStatusColor(status: RoomStatus): string {
  if (statusColorCache.has(status)) {
    return statusColorCache.get(status)!;
  }
  const color = statusColors[status] || 'bg-gray-500';
  statusColorCache.set(status, color);
  return color;
}

// Memoize status text mapping (js-cache-function-results)
const statusTextCache = new Map<RoomStatus, string>();
const statusTexts: Record<RoomStatus, string> = {
  [RoomStatus.VACANT]: 'Vacant',
  [RoomStatus.OCCUPIED]: 'Occupied',
  [RoomStatus.CLEANING]: 'Cleaning',
  [RoomStatus.MAINTENANCE]: 'Maintenance',
  [RoomStatus.RESERVED]: 'Reserved',
};

export function getStatusText(status: RoomStatus): string {
  if (statusTextCache.has(status)) {
    return statusTextCache.get(status)!;
  }
  const text = statusTexts[status] || status.charAt(0) + status.slice(1).toLowerCase();
  statusTextCache.set(status, text);
  return text;
}

// Cache currency formatter instance (js-cache-function-results)
const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

export function formatCurrency(amount: number): string {
  return currencyFormatter.format(amount);
}

// Cache date formatter instances (js-cache-function-results)
const dateFormatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
});

const dateTimeFormatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

export function formatDate(date: string | Date | undefined): string {
  if (!date) return 'N/A';
  return dateFormatter.format(new Date(date));
}

export function formatDateTime(date: string | Date | undefined): string {
  if (!date) return 'N/A';
  return dateTimeFormatter.format(new Date(date));
}
