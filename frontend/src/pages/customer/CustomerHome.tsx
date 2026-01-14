import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { customerApi } from '../../services/api';

export default function CustomerHome() {
  const [phone, setPhone] = useState('');
  const [isLinked, setIsLinked] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // 이미 연결된 고객 정보 확인
    const savedCustomerId = localStorage.getItem('butaxi_customer_id');
    const savedCustomerName = localStorage.getItem('butaxi_customer_name');
    const savedPhone = localStorage.getItem('butaxi_customer_phone');

    if (savedCustomerId && savedCustomerName) {
      setIsLinked(true);
      setCustomerName(savedCustomerName);
      if (savedPhone) setPhone(savedPhone);
    }
  }, []);

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;

    setLoading(true);
    setError('');

    try {
      const response: any = await customerApi.getByPhone(phone.replace(/-/g, ''));
      if (response.success && response.data) {
        // localStorage에 고객 정보 저장
        localStorage.setItem('butaxi_customer_id', response.data.id);
        localStorage.setItem('butaxi_customer_name', response.data.name);
        localStorage.setItem('butaxi_customer_phone', response.data.phone);

        setIsLinked(true);
        setCustomerName(response.data.name);
        setError('');
      }
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError('해당 전화번호로 등록된 예약이 없습니다.');
      } else {
        setError('조회 중 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUnlink = () => {
    localStorage.removeItem('butaxi_customer_id');
    localStorage.removeItem('butaxi_customer_name');
    localStorage.removeItem('butaxi_customer_phone');
    setIsLinked(false);
    setCustomerName('');
    setPhone('');
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/[^\d]/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
  };

  return (
    <div className="space-y-8">
      {/* 전화번호 연결 섹션 */}
      {!isLinked ? (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-1">기존 예약 조회</h3>
              <p className="text-sm text-gray-600">전화번호를 입력하면 이전 예약을 확인할 수 있어요</p>
            </div>
          </div>

          <form onSubmit={handlePhoneSubmit} className="flex gap-3">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(formatPhone(e.target.value))}
              placeholder="010-0000-0000"
              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-lg"
              maxLength={13}
            />
            <button
              type="submit"
              disabled={loading || phone.length < 12}
              className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
            >
              {loading ? '...' : '조회'}
            </button>
          </form>

          {error && (
            <p className="mt-3 text-sm text-red-500">{error}</p>
          )}
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-green-800">{customerName}님으로 연결됨</p>
                <p className="text-sm text-green-600">{phone}</p>
              </div>
            </div>
            <button
              onClick={handleUnlink}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              연결 해제
            </button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 text-white">
        <h2 className="text-3xl font-bold mb-4">
          {isLinked ? `${customerName}님, 안녕하세요! 👋` : '안녕하세요! 👋'}
        </h2>
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
    </div>
  );
}
