import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import {
  Building2,
  Wifi,
  WifiOff,
  Plus,
  RefreshCw,
  LogOut,
  User,
} from 'lucide-react';
import { Room, RoomStats, RoomStatus, RoomType } from './types/room';
import { roomsApi } from './services/api';
import { socketService } from './services/socket';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import StatsCard from './components/StatsCard';
import RoomCard from './components/RoomCard';
import FilterBar from './components/FilterBar';
import LoginPage from './components/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';

// Dynamic imports for modal components (bundle-dynamic-imports)
const RoomModal = lazy(() => import('./components/RoomModal'));
const CheckInModal = lazy(() => import('./components/CheckInModal'));

// Loading fallback for suspense boundaries
function ModalLoadingFallback() {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
      </div>
    </div>
  );
}

function Dashboard() {
  const { user, isAdmin, logout } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [stats, setStats] = useState<RoomStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [checkInRoomId, setCheckInRoomId] = useState<string | null>(null);
  const [filters, setFilters] = useState<{
    floor?: number;
    status?: RoomStatus;
    type?: RoomType;
  }>({});

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [roomsData, statsData] = await Promise.all([
        roomsApi.getAll(filters),
        roomsApi.getStats(),
      ]);
      setRooms(roomsData);
      setStats(statsData);
    } catch (error) {
      toast.error('Failed to fetch room data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const socket = socketService.connect();

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    socketService.onRoomUpdated(({ roomId, room }) => {
      setRooms((prev) => prev.map((r) => (r.id === roomId ? room : r)));
      toast.success(`Room ${room.roomNumber} updated`);
    });

    socketService.onRoomCreated((room) => {
      setRooms((prev) => [...prev, room]);
      toast.success(`Room ${room.roomNumber} created`);
    });

    socketService.onRoomDeleted(({ roomId }) => {
      setRooms((prev) => prev.filter((r) => r.id !== roomId));
      toast.success('Room deleted');
    });

    socketService.onStatsUpdated((newStats) => {
      setStats(newStats);
    });

    return () => {
      socketService.disconnect();
    };
  }, []);

  const handleCheckIn = (roomId: string) => {
    setCheckInRoomId(roomId);
    setIsCheckInModalOpen(true);
  };

  const handleCheckOut = useCallback(async (roomId: string) => {
    try {
      await roomsApi.checkOut(roomId);
      toast.success('Guest checked out successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to check out guest');
    }
  }, [fetchData]);

  const handleCleaningComplete = useCallback(async (roomId: string) => {
    try {
      await roomsApi.completeCleaning(roomId);
      toast.success('Room marked as available');
      fetchData();
    } catch (error) {
      toast.error('Failed to update room status');
    }
  }, [fetchData]);

  const handleAddRoom = useCallback(() => {
    setSelectedRoom(null);
    setIsRoomModalOpen(true);
  }, []);

  const handleEditRoom = useCallback((room: Room) => {
    setSelectedRoom(room);
    setIsRoomModalOpen(true);
  }, []);

  const handleDeleteRoom = useCallback(async (roomId: string) => {
    if (!confirm('Are you sure you want to delete this room?')) return;
    try {
      await roomsApi.delete(roomId);
      toast.success('Room deleted');
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete room');
    }
  }, [fetchData]);

  const handleRoomSaved = useCallback(() => {
    setIsRoomModalOpen(false);
    fetchData();
  }, [fetchData]);

  const handleCheckInComplete = useCallback(() => {
    setIsCheckInModalOpen(false);
    setCheckInRoomId(null);
    fetchData();
  }, [fetchData]);

  return (
    <div className="min-h-screen bg-slate-100">
      <Toaster position="top-right" />

      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building2 className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Hotel Room Monitor</h1>
                <p className="text-sm text-slate-500">Real-time room status dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {connected ? (
                  <Wifi className="h-5 w-5 text-green-500" />
                ) : (
                  <WifiOff className="h-5 w-5 text-red-500" />
                )}
                <span className="text-sm text-slate-600">
                  {connected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg">
                <User className="h-4 w-4 text-slate-600" />
                <span className="text-sm font-medium text-slate-700">
                  {user?.firstName} {user?.lastName}
                </span>
                <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                  {user?.role}
                </span>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-1.5 px-3 py-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm">Logout</span>
              </button>
              <button
                onClick={fetchData}
                className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                title="Refresh"
              >
                <RefreshCw className={`h-5 w-5 text-slate-600 ${loading ? 'animate-spin' : ''}`} />
              </button>
              {isAdmin && (
                <button
                  onClick={handleAddRoom}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-5 w-5" />
                  Add Room
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            <StatsCard label="Total Rooms" value={stats.total} color="slate" />
            <StatsCard label="Vacant" value={stats.vacant} color="green" />
            <StatsCard label="Occupied" value={stats.occupied} color="blue" />
            <StatsCard label="Cleaning" value={stats.cleaning} color="yellow" />
            <StatsCard label="Maintenance" value={stats.maintenance} color="red" />
            <StatsCard label="Occupancy" value={`${stats.occupancyRate}%`} color="purple" />
          </div>
        )}

        <FilterBar filters={filters} onFilterChange={setFilters} />

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
          </div>
        ) : rooms.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No rooms found</h3>
            <p className="text-slate-500 mb-4">
              {isAdmin ? 'Get started by adding your first room' : 'No rooms available'}
            </p>
            {isAdmin && (
              <button
                onClick={handleAddRoom}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Room
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {rooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                isAdmin={isAdmin}
                onCheckIn={() => handleCheckIn(room.id)}
                onCheckOut={() => handleCheckOut(room.id)}
                onCleaningComplete={() => handleCleaningComplete(room.id)}
                onEdit={() => handleEditRoom(room)}
                onDelete={() => handleDeleteRoom(room.id)}
              />
            ))}
          </div>
        )}
      </main>

      {isRoomModalOpen && isAdmin && (
        <Suspense fallback={<ModalLoadingFallback />}>
          <RoomModal
            room={selectedRoom}
            onClose={() => setIsRoomModalOpen(false)}
            onSave={handleRoomSaved}
          />
        </Suspense>
      )}

      {isCheckInModalOpen && checkInRoomId && (
        <Suspense fallback={<ModalLoadingFallback />}>
          <CheckInModal
            roomId={checkInRoomId}
            roomNumber={rooms.find((r) => r.id === checkInRoomId)?.roomNumber || ''}
            onClose={() => {
              setIsCheckInModalOpen(false);
              setCheckInRoomId(null);
            }}
            onCheckIn={handleCheckInComplete}
          />
        </Suspense>
      )}
    </div>
  );
}

// Move LoginPageWrapper outside to avoid defining components inside components (rerender-no-inline-components)
function LoginPageWrapper() {
  const [isRegister, setIsRegister] = useState(false);

  return (
    <LoginPage
      isRegister={isRegister}
      onToggleMode={() => setIsRegister(!isRegister)}
    />
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPageWrapper />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
