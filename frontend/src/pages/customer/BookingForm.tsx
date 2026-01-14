import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { rideApi, customerApi } from '../../services/api';

export default function BookingForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
  });
  const [isCustomerLinked, setIsCustomerLinked] = useState(false);
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

  useEffect(() => {
    // 기존 고객 정보 확인
    const savedCustomerId = localStorage.getItem('butaxi_customer_id');
    const savedName = localStorage.getItem('butaxi_customer_name');
    const savedPhone = localStorage.getItem('butaxi_customer_phone');

    if (savedCustomerId && savedName && savedPhone) {
      setIsCustomerLinked(true);
      setCustomerInfo({ name: savedName, phone: savedPhone });
    }
  }, []);

  const formatPhone = (value: string) => {
    const numbers = value.replace(/[^\d]/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let customerId = localStorage.getItem('butaxi_customer_id');

      // 고객 정보가 없으면 먼저 생성
      if (!customerId) {
        if (!customerInfo.name || !customerInfo.phone) {
          alert('이름과 전화번호를 입력해주세요.');
          setLoading(false);
          return;
        }

        const customerResponse: any = await customerApi.findOrCreate({
          name: customerInfo.name,
          phone: customerInfo.phone.replace(/-/g, ''),
        });

        if (customerResponse.success) {
          customerId = customerResponse.data.id;
          localStorage.setItem('butaxi_customer_id', customerId!);
          localStorage.setItem('butaxi_customer_name', customerResponse.data.name);
          localStorage.setItem('butaxi_customer_phone', customerResponse.data.phone);
          setIsCustomerLinked(true);
        } else {
          throw new Error('고객 정보 생성 실패');
        }
      }

      // 예약 요청 생성
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

  const handleCustomerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCustomerInfo({
      ...customerInfo,
      [name]: name === 'phone' ? formatPhone(value) : value,
    });
  };

  const handleUnlinkCustomer = () => {
    localStorage.removeItem('butaxi_customer_id');
    localStorage.removeItem('butaxi_customer_name');
    localStorage.removeItem('butaxi_customer_phone');
    setIsCustomerLinked(false);
    setCustomerInfo({ name: '', phone: '' });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm p-8">
        <h2 className="text-2xl font-bold mb-6">새 예약 요청</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 고객 정보 */}
          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="text-lg font-semibold mb-4">👤 고객 정보</h3>

            {isCustomerLinked ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-green-800">{customerInfo.name}</p>
                      <p className="text-sm text-green-600">{customerInfo.phone}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleUnlinkCustomer}
                    className="text-sm text-gray-500 hover:text-gray-700 underline"
                  >
                    변경
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    이름 *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={customerInfo.name}
                    onChange={handleCustomerChange}
                    placeholder="홍길동"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required={!isCustomerLinked}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    전화번호 *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={customerInfo.phone}
                    onChange={handleCustomerChange}
                    placeholder="010-0000-0000"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    maxLength={13}
                    required={!isCustomerLinked}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    이 번호로 예약 확인 및 알림을 받으실 수 있습니다.
                  </p>
                </div>
              </div>
            )}
          </div>

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
