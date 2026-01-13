import { Link } from 'react-router-dom';
import Logo from '../components/Logo';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-4">
      <div className="max-w-5xl w-full">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <div className="flex justify-center mb-8">
            <Logo variant="full" size="xl" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Smart Share Ride
          </h1>
          <p className="text-gray-500 text-xl md:text-2xl font-light">
            버스처럼 효율적으로, 택시처럼 편리하게
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {/* Customer Card */}
          <Link
            to="/customer"
            className="group relative bg-black text-white p-10 rounded-3xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-black opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold">고객</h2>
                <div className="text-4xl group-hover:translate-x-2 transition-transform duration-300">→</div>
              </div>
              <p className="text-gray-300 text-lg mb-8">
                예약하고 함께 이동하세요
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  <span>간편한 예약 신청</span>
                </div>
                <div className="flex items-center gap-3 text-gray-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  <span>실시간 위치 추적</span>
                </div>
                <div className="flex items-center gap-3 text-gray-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  <span>합리적인 비용</span>
                </div>
              </div>
            </div>
          </Link>

          {/* Driver Card */}
          <Link
            to="/driver"
            className="group relative bg-white border-2 border-gray-200 text-black p-10 rounded-3xl hover:border-black hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold">드라이버</h2>
                <div className="text-4xl group-hover:translate-x-2 transition-transform duration-300">→</div>
              </div>
              <p className="text-gray-600 text-lg mb-8">
                효율적으로 운행을 관리하세요
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-600">
                  <div className="w-1.5 h-1.5 rounded-full bg-black" />
                  <span>최적화된 경로</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <div className="w-1.5 h-1.5 rounded-full bg-black" />
                  <span>실시간 위치 공유</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <div className="w-1.5 h-1.5 rounded-full bg-black" />
                  <span>정거장 관리</span>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16 px-4">
          <div className="text-center">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="font-semibold text-lg mb-2">빠른 매칭</h3>
            <p className="text-gray-500 text-sm">AI 기반 최적 경로 매칭</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-4">💰</div>
            <h3 className="font-semibold text-lg mb-2">합리적인 가격</h3>
            <p className="text-gray-500 text-sm">택시 대비 최대 50% 절감</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-4">🌟</div>
            <h3 className="font-semibold text-lg mb-2">안전한 이동</h3>
            <p className="text-gray-500 text-sm">실시간 위치 추적 시스템</p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm">
          <p className="text-gray-400 mb-4">
            💡 테스트용: 브라우저 창 2개로 고객/드라이버 동시 체험
          </p>
          <Link
            to="/admin"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-black transition-colors"
          >
            <span>관리자 페이지</span>
            <span>→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
