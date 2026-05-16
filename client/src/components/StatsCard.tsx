import { memo } from 'react';

interface StatsCardProps {
  label: string;
  value: number | string;
  color: 'slate' | 'green' | 'blue' | 'yellow' | 'red' | 'purple';
}

// Move static data outside component to avoid recreation on each render (rerender-memo-with-default-value)
const colorClasses = {
  slate: 'bg-slate-100 text-slate-800 border-slate-200',
  green: 'bg-green-100 text-green-800 border-green-200',
  blue: 'bg-blue-100 text-blue-800 border-blue-200',
  yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  red: 'bg-red-100 text-red-800 border-red-200',
  purple: 'bg-purple-100 text-purple-800 border-purple-200',
};

// Memoize component to prevent unnecessary re-renders (rerender-memo)
const StatsCard = memo(function StatsCard({ label, value, color }: StatsCardProps) {
  // Early return for invalid props (js-early-exit)
  if (!label || !colorClasses[color]) {
    return null;
  }

  return (
    <div className={`rounded-xl border p-4 ${colorClasses[color]}`}>
      <p className="text-sm font-medium opacity-80">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
});

export default StatsCard;
