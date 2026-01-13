import { Link } from 'react-router-dom';
import Logo from '../components/Logo';

export default function Home() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Logo & Title */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-8">
            <Logo variant="full" size="xl" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-black">
            Smart Share Ride
          </h1>
          <p className="text-gray-500 text-lg md:text-xl">
            버스처럼 효율적으로, 택시처럼 편리하게
          </p>
        </div>

        {/* Role Selection */}
        <div className="space-y-4 mb-12">
          {/* Customer */}
          <Link
            to="/customer"
            className="group block bg-black text-white p-8 rounded-2xl hover:bg-gray-900 transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">고객</h2>
                <p className="text-gray-300">예약하고 함께 이동하세요</p>
              </div>
              <div className="text-3xl group-hover:translate-x-2 transition-transform duration-300">
                →
              </div>
            </div>
          </Link>

          {/* Driver */}
          <Link
            to="/driver"
            className="group block border-2 border-gray-200 bg-white text-black p-8 rounded-2xl hover:border-black transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">드라이버</h2>
                <p className="text-gray-600">효율적으로 운행을 관리하세요</p>
              </div>
              <div className="text-3xl group-hover:translate-x-2 transition-transform duration-300">
                →
              </div>
            </div>
          </Link>

          {/* Admin */}
          <Link
            to="/admin"
            className="group block border border-gray-200 bg-gray-50 text-gray-700 p-6 rounded-2xl hover:bg-gray-100 transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-1">관리자</h3>
                <p className="text-sm text-gray-500">시스템 관리 및 모니터링</p>
              </div>
              <div className="text-2xl group-hover:translate-x-2 transition-transform duration-300">
                →
              </div>
            </div>
          </Link>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-6 pt-8 border-t border-gray-100">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 bg-black rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="font-semibold text-sm mb-1">빠른 매칭</h3>
            <p className="text-xs text-gray-500">최적 경로 자동 매칭</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 bg-black rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-sm mb-1">합리적 가격</h3>
            <p className="text-xs text-gray-500">최대 50% 절감</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 bg-black rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="font-semibold text-sm mb-1">안전한 이동</h3>
            <p className="text-xs text-gray-500">실시간 위치 추적</p>
          </div>
        </div>

        {/* Test Info */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-400">
            💡 테스트: 브라우저 창 2개로 고객/드라이버 동시 체험 가능
          </p>
        </div>
      </div>
    </div>
  );
}
