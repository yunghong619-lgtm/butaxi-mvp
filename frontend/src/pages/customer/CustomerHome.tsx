import { Link } from 'react-router-dom';

export default function CustomerHome() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-black mb-3">
            안녕하세요
          </h1>
          <p className="text-xl text-gray-600">
            어디로 이동하시나요?
          </p>
        </div>

        {/* Main Action */}
        <Link
          to="/customer/booking"
          className="block bg-black text-white p-8 rounded-2xl hover:bg-gray-900 transition-all duration-300 mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">지금 예약하기</h2>
              <p className="text-gray-400">왕복 예약을 한 번에</p>
            </div>
            <span className="text-4xl">→</span>
          </div>
        </Link>

        {/* Quick Links */}
        <div className="grid md:grid-cols-2 gap-4 mb-12">
          <Link
            to="/customer/proposals"
            className="border-2 border-gray-200 p-6 rounded-xl hover:border-black transition-colors"
          >
            <h3 className="font-bold text-lg mb-2">받은 제안</h3>
            <p className="text-gray-600 text-sm">도착한 제안을 확인하세요</p>
          </Link>

          <Link
            to="/customer/bookings"
            className="border-2 border-gray-200 p-6 rounded-xl hover:border-black transition-colors"
          >
            <h3 className="font-bold text-lg mb-2">예약 내역</h3>
            <p className="text-gray-600 text-sm">확정된 예약을 관리하세요</p>
          </Link>
        </div>

        {/* How it works */}
        <div className="border-t pt-12">
          <h3 className="text-xl font-bold mb-6">이용 방법</h3>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h4 className="font-bold mb-1">예약 요청</h4>
                <p className="text-gray-600 text-sm">출발지, 목적지, 시간을 입력하세요</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h4 className="font-bold mb-1">제안 받기</h4>
                <p className="text-gray-600 text-sm">매칭되면 15분 내로 수락하세요</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h4 className="font-bold mb-1">운행 이용</h4>
                <p className="text-gray-600 text-sm">픽업 장소에서 기사님을 만나세요</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
