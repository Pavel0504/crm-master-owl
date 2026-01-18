import { WifiOff, Wifi } from 'lucide-react';
import { useServiceWorker } from '../hooks/useServiceWorker';

export default function OfflineIndicator() {
  const { isOnline, updateAvailable, updateServiceWorker } = useServiceWorker();

  if (isOnline && !updateAvailable) {
    return null;
  }

  return (
    <>
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white px-4 py-2 flex items-center justify-center gap-2 shadow-lg">
          <WifiOff className="h-5 w-5" />
          <span className="font-medium">Нет подключения к интернету</span>
        </div>
      )}

      {updateAvailable && (
        <div className="fixed bottom-4 right-4 z-50 bg-gradient-to-r from-orange-500 to-rose-500 text-white px-6 py-4 rounded-xl shadow-xl flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Wifi className="h-5 w-5" />
            <span className="font-medium">Доступно обновление</span>
          </div>
          <button
            onClick={updateServiceWorker}
            className="bg-white text-orange-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-all"
          >
            Обновить
          </button>
        </div>
      )}
    </>
  );
}
