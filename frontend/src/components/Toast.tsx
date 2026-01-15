import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

// 토스트 타입
interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

// 배너 타입
interface Banner {
  message: string;
  type: 'info' | 'warning' | 'progress';
  show: boolean;
}

// Context 타입
interface ToastContextType {
  showToast: (message: string, type?: Toast['type'], duration?: number) => void;
  showBanner: (message: string, type?: Banner['type']) => void;
  hideBanner: () => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [banner, setBanner] = useState<Banner>({ message: '', type: 'info', show: false });

  const showToast = useCallback((message: string, type: Toast['type'] = 'info', duration = 3000) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = { id, message, type, duration };

    setToasts((prev) => [...prev, newToast]);

    // 자동 제거
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const showBanner = useCallback((message: string, type: Banner['type'] = 'info') => {
    setBanner({ message, type, show: true });
  }, []);

  const hideBanner = useCallback(() => {
    setBanner((prev) => ({ ...prev, show: false }));
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast, showBanner, hideBanner }}>
      {children}

      {/* 배너 (상단 고정) */}
      {banner.show && (
        <div
          className={`fixed top-0 left-0 right-0 z-50 px-4 py-3 text-center font-medium shadow-lg transition-all duration-300 ${
            banner.type === 'info'
              ? 'bg-blue-500 text-white'
              : banner.type === 'warning'
              ? 'bg-yellow-500 text-black'
              : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
          }`}
        >
          <div className="max-w-4xl mx-auto flex items-center justify-center gap-3">
            {banner.type === 'progress' && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            <span>{banner.message}</span>
            <button
              onClick={hideBanner}
              className="ml-4 text-white/80 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* 토스트 컨테이너 (하단 우측) */}
      <div className="fixed bottom-6 right-6 z-50 space-y-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`px-6 py-4 rounded-xl shadow-2xl font-medium animate-slide-in-right flex items-center gap-3 min-w-[300px] max-w-[400px] ${
              toast.type === 'success'
                ? 'bg-green-500 text-white'
                : toast.type === 'error'
                ? 'bg-red-500 text-white'
                : toast.type === 'warning'
                ? 'bg-yellow-500 text-black'
                : 'bg-gray-800 text-white'
            }`}
          >
            <span className="text-xl">
              {toast.type === 'success' && '✓'}
              {toast.type === 'error' && '✕'}
              {toast.type === 'warning' && '⚠'}
              {toast.type === 'info' && 'ℹ'}
            </span>
            <span className="flex-1">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="opacity-70 hover:opacity-100"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* 애니메이션 스타일 */}
      <style>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </ToastContext.Provider>
  );
}

// 상태 변경 메시지 헬퍼
export const STATUS_MESSAGES: Record<string, { message: string; type: Toast['type'] }> = {
  MATCHING: { message: '기사 배정 중입니다...', type: 'info' },
  ACCEPTED: { message: '기사님이 수락했어요! 🎉', type: 'success' },
  ARRIVED: { message: '기사님이 도착했어요! 📍', type: 'success' },
  ON_TRIP: { message: '운행이 시작되었습니다 🚗', type: 'info' },
  IN_PROGRESS: { message: '운행이 시작되었습니다 🚗', type: 'info' },
  COMPLETED: { message: '운행이 완료되었습니다! 🎉', type: 'success' },
  CANCELLED: { message: '예약이 취소되었습니다', type: 'warning' },
};
