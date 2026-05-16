import { useState, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import { Room, RoomType, RoomStatus } from '../types/room';
import { roomsApi } from '../services/api';
import { toast } from 'react-hot-toast';

interface RoomModalProps {
  room: Room | null;
  onClose: () => void;
  onSave: () => void;
}

// Move static data outside component to avoid recreation on each render (rerender-memo-with-default-value)
const roomTypes = Object.values(RoomType);
const roomStatuses = Object.values(RoomStatus);

const defaultAmenities = [
  'WiFi', 'TV', 'AC', 'Mini Bar', 'Safe', 'Balcony',
  'Ocean View', 'Jacuzzi', 'Butler Service', 'Private Pool',
];

const defaultFormData = {
  roomNumber: '',
  floor: 1,
  type: RoomType.SINGLE,
  status: RoomStatus.VACANT,
  pricePerNight: 100,
  notes: '',
  amenities: [] as string[],
};

export default function RoomModal({ room, onClose, onSave }: RoomModalProps) {
  const [formData, setFormData] = useState(() => defaultFormData);
  const [saving, setSaving] = useState(false);

  // Use lazy state initialization for editing existing room (rerender-lazy-state-init)
  useEffect(() => {
    if (room) {
      setFormData({
        roomNumber: room.roomNumber,
        floor: room.floor,
        type: room.type,
        status: room.status,
        pricePerNight: room.pricePerNight,
        notes: room.notes || '',
        amenities: room.amenities,
      });
    }
  }, [room]);

  // Use functional setState for stable callbacks (rerender-functional-setstate)
  const handleInputChange = useCallback((field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    // Early return if required fields are missing (js-early-exit)
    if (!formData.roomNumber || formData.floor < 1) {
      toast.error('Room number and floor are required');
      setSaving(false);
      return;
    }

    try {
      if (room) {
        await roomsApi.update(room.id, formData);
        toast.success('Room updated successfully');
      } else {
        await roomsApi.create({
          roomNumber: formData.roomNumber,
          floor: formData.floor,
          type: formData.type,
          pricePerNight: formData.pricePerNight,
          amenities: formData.amenities,
        });
        toast.success('Room created successfully');
      }
      onSave();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save room');
    } finally {
      setSaving(false);
    }
  }, [formData, room, onSave]);

  const toggleAmenity = useCallback((amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  }, []);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">
            {room ? 'Edit Room' : 'Add New Room'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Room Number *
              </label>
              <input
                type="text"
                required
                value={formData.roomNumber}
                onChange={(e) => handleInputChange('roomNumber', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="101"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Floor *
              </label>
              <input
                type="number"
                required
                min={1}
                value={formData.floor}
                onChange={(e) => handleInputChange('floor', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Room Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value as RoomType)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {roomTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0) + type.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </div>
            {room && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value as RoomStatus)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {roomStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status.charAt(0) + status.slice(1).toLowerCase()}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Price per Night ($)
            </label>
            <input
              type="number"
              min={0}
              value={formData.pricePerNight}
              onChange={(e) => handleInputChange('pricePerNight', parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Optional notes..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Amenities
            </label>
            <div className="flex flex-wrap gap-2">
              {defaultAmenities.map((amenity) => (
                <button
                  key={amenity}
                  type="button"
                  onClick={() => toggleAmenity(amenity)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    formData.amenities.includes(amenity)
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {amenity}
                </button>
              ))}
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
              disabled={saving}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
            >
              {saving ? 'Saving...' : room ? 'Update Room' : 'Create Room'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
