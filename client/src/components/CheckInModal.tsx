import { useState, useCallback } from 'react';
import { X, UserPlus } from 'lucide-react';
import { roomsApi } from '../services/api';
import { toast } from 'react-hot-toast';

interface CheckInModalProps {
  roomId: string;
  roomNumber: string;
  onClose: () => void;
  onCheckIn: () => void;
}

// Hoist date calculations outside component to avoid recreation (rerender-memo-with-default-value)
const getTodayDate = () => new Date().toISOString().split('T')[0];
const getTomorrowDate = () => new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

export default function CheckInModal({
  roomId,
  roomNumber,
  onClose,
  onCheckIn,
}: CheckInModalProps) {
  // Early return for invalid props (js-early-exit)
  if (!roomId || !roomNumber) {
    return null;
  }

  const [formData, setFormData] = useState(() => ({
    guestName: '',
    guestPhone: '',
    checkInDate: getTodayDate(),
    checkOutDate: getTomorrowDate(),
  }));
  const [loading, setLoading] = useState(false);

  // Use functional setState for stable callbacks (rerender-functional-setstate)
  const handleInputChange = useCallback((field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Early return if required fields are missing (js-early-exit)
    if (!formData.guestName) {
      toast.error('Guest name is required');
      setLoading(false);
      return;
    }

    try {
      await roomsApi.checkIn(roomId, {
        guestName: formData.guestName,
        guestPhone: formData.guestPhone || undefined,
        checkInDate: new Date(formData.checkInDate).toISOString(),
        checkOutDate: new Date(formData.checkOutDate).toISOString(),
      });
      toast.success('Guest checked in successfully');
      onCheckIn();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to check in guest');
    } finally {
      setLoading(false);
    }
  }, [formData, roomId, onCheckIn]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold">Check In - Room {roomNumber}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Guest Name *
            </label>
            <input
              type="text"
              required
              value={formData.guestName}
              onChange={(e) => handleInputChange('guestName', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="John Smith"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.guestPhone}
              onChange={(e) => handleInputChange('guestPhone', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="+1-555-0123"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Check-in Date *
              </label>
              <input
                type="date"
                required
                value={formData.checkInDate}
                onChange={(e) => handleInputChange('checkInDate', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Check-out Date *
              </label>
              <input
                type="date"
                required
                min={formData.checkInDate}
                value={formData.checkOutDate}
                onChange={(e) => handleInputChange('checkOutDate', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
            >
              {loading ? 'Checking in...' : 'Check In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
