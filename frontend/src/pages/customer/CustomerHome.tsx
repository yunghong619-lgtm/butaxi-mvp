import { Link } from 'react-router-dom';

export default function CustomerHome() {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 text-white">
        <h2 className="text-3xl font-bold mb-4">안녕하세요! 👋</h2>
        <p className="text-lg mb-6">
          RETURN과 함께 편리하고 경제적인 공유 택시를 이용해보세요.
        </p>
        <Link
          to="/customer/booking"
          className="inline-block bg-white text-primary-600 font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition"
        >
          지금 예약하기 →
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/customer/booking"
          className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition border-2 border-transparent hover:border-primary-500"
        >
          <div className="text-4xl mb-4">📝</div>
          <h3 className="text-lg font-semibold mb-2">새 예약 요청</h3>
          <p className="text-gray-600 text-sm">
            왕복 예약을 한 번에 신청하고 제안을 받아보세요
          </p>
        </Link>

        <Link
          to="/customer/proposals"
          className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition border-2 border-transparent hover:border-primary-500"
        >
          <div className="text-4xl mb-4">📬</div>
          <h3 className="text-lg font-semibold mb-2">받은 제안</h3>
          <p className="text-gray-600 text-sm">
            도착한 운행 제안을 확인하고 수락하세요
          </p>
        </Link>

        <Link
          to="/customer/bookings"
          className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition border-2 border-transparent hover:border-primary-500"
        >
          <div className="text-4xl mb-4">🎫</div>
          <h3 className="text-lg font-semibold mb-2">예약 내역</h3>
          <p className="text-gray-600 text-sm">
            확정된 예약과 이용 내역을 확인하세요
          </p>
        </Link>
      </div>

      {/* Info Cards */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-xl font-semibold mb-4">💡 이용 방법</h3>
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-semibold">
              1
            </div>
            <div>
              <h4 className="font-semibold">예약 요청</h4>
              <p className="text-gray-600 text-sm">
                출발지, 목적지, 희망 시간을 입력하세요. 왕복 예약이 가능합니다.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-semibold">
              2
            </div>
            <div>
              <h4 className="font-semibold">제안 받기</h4>
              <p className="text-gray-600 text-sm">
                비슷한 경로의 다른 고객들과 매칭되면 제안을 받습니다. (15분 이내 수락 필요)
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-semibold">
              3
            </div>
            <div>
              <h4 className="font-semibold">운행 이용</h4>
              <p className="text-gray-600 text-sm">
                확정된 시간에 픽업 장소에서 기사님을 만나세요. 안전한 여행 되세요!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Test Account Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">🧪 테스트 계정</h3>
        <p className="text-blue-700 text-sm mb-3">
          MVP 테스트를 위한 샘플 계정입니다. 실제 결제는 진행되지 않습니다.
        </p>
        <div className="space-y-1 text-sm">
          <p className="text-blue-800">
            <strong>고객 1:</strong> customer1@test.com (김철수)
          </p>
          <p className="text-blue-800">
            <strong>고객 2:</strong> customer2@test.com (이영희)
          </p>
        </div>
      </div>
    </div>
  );
}
