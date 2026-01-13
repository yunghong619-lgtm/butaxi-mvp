import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { rideApi } from '../../services/api';

export default function BookingForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    pickupAddress: '',
    dropoffAddress: '',
    returnAddress: '',
    homeAddress: '',
    desiredPickupTime: '',
    desiredReturnTime: '',
    passengerCount: 1,
    specialRequests: '',
  });

  // 테스트용 고객 ID (실제로는 로그인 시스템에서 가져와야 함)
  const customerId = 'customer1-id'; // TODO: 실제 로그인 시스템 연동

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response: any = await rideApi.createRequest({
        customerId,
        ...formData,
      });

      if (response.success) {
        alert('예약 요청이 접수되었습니다! 곧 제안을 보내드리겠습니다.');
        navigate('/customer/proposals');
      }
    } catch (error) {
      console.error('예약 요청 실패:', error);
      alert('예약 요청 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm p-8">
        <h2 className="text-2xl font-bold mb-6">새 예약 요청</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 가는 편 */}
          <div className="border-l-4 border-primary-500 pl-4">
            <h3 className="text-lg font-semibold mb-4">🚖 가는 편</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  출발지 (픽업 장소) *
                </label>
                <input
                  type="text"
                  name="pickupAddress"
                  value={formData.pickupAddress}
                  onChange={handleChange}
                  placeholder="예: 서울특별시 강남구 역삼동 123"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  희망 픽업 시간 *
                </label>
                <input
                  type="datetime-local"
                  name="desiredPickupTime"
                  value={formData.desiredPickupTime}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  실제 픽업 시간은 ±30분 범위에서 조정될 수 있습니다.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  목적지 (하차 장소) *
                </label>
                <input
                  type="text"
                  name="dropoffAddress"
                  value={formData.dropoffAddress}
                  onChange={handleChange}
                  placeholder="예: 서울특별시 서초구 서초동 456"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>

          {/* 귀가 편 */}
          <div className="border-l-4 border-success-500 pl-4">
            <h3 className="text-lg font-semibold mb-4">🏠 귀가 편</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  귀가 픽업 장소 *
                </label>
                <input
                  type="text"
                  name="returnAddress"
                  value={formData.returnAddress}
                  onChange={handleChange}
                  placeholder="예: 서울특별시 서초구 서초동 456"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-success-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  희망 귀가 시간 *
                </label>
                <input
                  type="datetime-local"
                  name="desiredReturnTime"
                  value={formData.desiredReturnTime}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-success-500 focus:border-transparent"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  실제 픽업 시간은 ±45분 범위에서 조정될 수 있습니다.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  집 주소 (하차 장소) *
                </label>
                <input
                  type="text"
                  name="homeAddress"
                  value={formData.homeAddress}
                  onChange={handleChange}
                  placeholder="예: 서울특별시 강남구 역삼동 123"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-success-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>

          {/* 추가 정보 */}
          <div>
            <h3 className="text-lg font-semibold mb-4">추가 정보</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  인원 수
                </label>
                <input
                  type="number"
                  name="passengerCount"
                  value={formData.passengerCount}
                  onChange={handleChange}
                  min="1"
                  max="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  특이사항
                </label>
                <textarea
                  name="specialRequests"
                  value={formData.specialRequests}
                  onChange={handleChange}
                  placeholder="예: 캐리어 2개, 휠체어 필요 등"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* 버튼 */}
          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={() => navigate('/customer')}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '처리 중...' : '예약 요청하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
