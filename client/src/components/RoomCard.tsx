import React, { memo } from 'react';
import {
  BedDouble,
  Users,
  Calendar,
  Wrench,
  Sparkles,
  Clock,
  Edit2,
  Trash2,
  LogIn,
  LogOut,
  CheckCircle,
} from 'lucide-react';
import { Room, RoomStatus, RoomType } from '../types/room';
import { cn, getStatusColor, getStatusText, formatCurrency, formatDate } from '../utils/helpers';

interface RoomCardProps {
  room: Room;
  isAdmin: boolean;
  onCheckIn: () => void;
  onCheckOut: () => void;
  onCleaningComplete: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

// Move static data outside component to avoid recreation on each render (rerender-memo-with-default-value)
const statusIcons: Record<RoomStatus, React.ReactNode> = {
  [RoomStatus.VACANT]: <BedDouble className="h-5 w-5" />,
  [RoomStatus.OCCUPIED]: <Users className="h-5 w-5" />,
  [RoomStatus.CLEANING]: <Sparkles className="h-5 w-5" />,
  [RoomStatus.MAINTENANCE]: <Wrench className="h-5 w-5" />,
  [RoomStatus.RESERVED]: <Calendar className="h-5 w-5" />,
};

const typeLabels: Record<RoomType, string> = {
  [RoomType.SINGLE]: 'Single',
  [RoomType.DOUBLE]: 'Double',
  [RoomType.SUITE]: 'Suite',
  [RoomType.DELUXE]: 'Deluxe',
  [RoomType.PRESIDENTIAL]: 'Presidential',
};

// Memoize component to prevent unnecessary re-renders (rerender-memo)
const RoomCard = memo(function RoomCard({
  room,
  isAdmin,
  onCheckIn,
  onCheckOut,
  onCleaningComplete,
  onEdit,
  onDelete,
}: RoomCardProps) {
  // Early return if room data is invalid (js-early-exit)
  if (!room || !room.id) {
    return null;
  }

  const isOccupied = room.status === RoomStatus.OCCUPIED;
  const isVacant = room.status === RoomStatus.VACANT;
  const isCleaning = room.status === RoomStatus.CLEANING;
  const isMaintenance = room.status === RoomStatus.MAINTENANCE;
  const hasAmenities = room.amenities.length > 0;
  const hasMoreAmenities = room.amenities.length > 4;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-slate-900">{room.roomNumber}</span>
            <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600">
              Floor {room.floor}
            </span>
          </div>
          {isAdmin && (
            <div className="flex gap-1">
              <button
                onClick={onEdit}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700"
                title="Edit"
              >
                <Edit2 className="h-4 w-4" />
              </button>
              <button
                onClick={onDelete}
                className="p-1.5 rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-600"
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 mb-3">
          <span
            className={cn(
              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-white',
              getStatusColor(room.status)
            )}
          >
            {statusIcons[room.status]}
            {getStatusText(room.status)}
          </span>
          <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600">
            {typeLabels[room.type]}
          </span>
        </div>

        {isOccupied && room.guestName && (
          <div className="mb-3 p-2 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium text-blue-900">{room.guestName}</p>
            {room.guestPhone && (
              <p className="text-xs text-blue-700">{room.guestPhone}</p>
            )}
            <div className="flex items-center gap-1 mt-1 text-xs text-blue-600">
              <Clock className="h-3 w-3" />
              <span>Until {formatDate(room.checkOutDate)}</span>
            </div>
          </div>
        )}

        {isMaintenance && room.notes && (
          <div className="mb-3 p-2 bg-red-50 rounded-lg">
            <p className="text-xs text-red-700">{room.notes}</p>
          </div>
        )}

        {hasAmenities && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              {room.amenities.slice(0, 4).map((amenity, idx) => (
                <span
                  key={idx}
                  className="text-xs px-1.5 py-0.5 rounded bg-slate-50 text-slate-600"
                >
                  {amenity}
                </span>
              ))}
              {hasMoreAmenities && (
                <span className="text-xs px-1.5 py-0.5 rounded bg-slate-50 text-slate-600">
                  +{room.amenities.length - 4} more
                </span>
              )}
            </div>
          </div>
        )}

        <p className="text-lg font-semibold text-slate-900 mb-3">
          {formatCurrency(room.pricePerNight)}
          <span className="text-sm font-normal text-slate-500">/night</span>
        </p>

        <div className="flex gap-2">
          {isVacant && (
            <button
              onClick={onCheckIn}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
            >
              <LogIn className="h-4 w-4" />
              Check In
            </button>
          )}
          {isOccupied && (
            <button
              onClick={onCheckOut}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm font-medium"
            >
              <LogOut className="h-4 w-4" />
              Check Out
            </button>
          )}
          {isCleaning && isAdmin && (
            <button
              onClick={onCleaningComplete}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
            >
              <CheckCircle className="h-4 w-4" />
              Complete
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

export default RoomCard;
