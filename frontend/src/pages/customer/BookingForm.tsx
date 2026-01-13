import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { rideApi } from '../../services/api';
import AddressSearch from '../../components/AddressSearch';

export default function BookingForm() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    pickupAddress: '',
    pickupLat: 0,
    pickupLng: 0,
    dropoffAddress: '',
    dropoffLat: 0,
    dropoffLng: 0,
    returnAddress: '',
    returnLat: 0,
    returnLng: 0,
    homeAddress: '',
    homeLat: 0,
    homeLng: 0,
    desiredPickupTime: '',
    desiredReturnTime: '',
    passengerCount: 1,
    specialRequests: '',
  });

  const customerId = 'customer1-id';

  const handleSubmit = async () => {
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
      alert('예약 요청 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const canProceedStep1 = formData.pickupAddress && formData.dropoffAddress && formData.desiredPickupTime;
  const canProceedStep2 = formData.returnAddress && formData.homeAddress && formData.desiredReturnTime;
  const canSubmit = canProceedStep1 && canProceedStep2;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/customer')}
            className="text-gray-600 hover:text-black mb-4 flex items-center gap-2"
          >
            <span>←</span>
            <span>뒤로</span>
          </button>
          <h1 className="text-4xl font-bold text-black mb-2">예약하기</h1>
          <p className="text-gray-600">왕복 예약을 한 번에 신청하세요</p>
        </div>

        {/* Progress */}
        <div className="flex items-center mb-12">
          {[1, 2, 3].map((num) => (
            <div key={num} className="flex-1 flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                  step >= num ? 'bg-black text-white' : 'bg-gray-200 text-gray-500'
                }`}
              >
                {num}
              </div>
              {num < 3 && (
                <div
                  className={`flex-1 h-0.5 mx-2 ${
                    step > num ? 'bg-black' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: 가는 편 */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-6">가는 편</h2>

            <AddressSearch
              label="출발지"
              value={formData.pickupAddress}
              onChange={(address, lat, lng) => {
                setFormData({ ...formData, pickupAddress: address, pickupLat: lat, pickupLng: lng });
              }}
              placeholder="출발 위치를 검색하세요"
            />

            <AddressSearch
              label="도착지"
              value={formData.dropoffAddress}
              onChange={(address, lat, lng) => {
                setFormData({ ...formData, dropoffAddress: address, dropoffLat: lat, dropoffLng: lng });
              }}
              placeholder="도착 위치를 검색하세요"
            />

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                출발 시간
              </label>
              <input
                type="datetime-local"
                value={formData.desiredPickupTime}
                onChange={(e) => setFormData({ ...formData, desiredPickupTime: e.target.value })}
                className="w-full px-4 py-4 text-base border-2 border-gray-200 rounded-xl focus:border-black focus:outline-none transition-colors"
              />
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!canProceedStep1}
              className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-900 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              다음
            </button>
          </div>
        )}

        {/* Step 2: 귀가 편 */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-6">귀가 편</h2>

            <AddressSearch
              label="돌아올 출발지"
              value={formData.returnAddress}
              onChange={(address, lat, lng) => {
                setFormData({ ...formData, returnAddress: address, returnLat: lat, returnLng: lng });
              }}
              placeholder="돌아올 출발 위치를 검색하세요"
            />

            <AddressSearch
              label="집 주소"
              value={formData.homeAddress}
              onChange={(address, lat, lng) => {
                setFormData({ ...formData, homeAddress: address, homeLat: lat, homeLng: lng });
              }}
              placeholder="집 주소를 검색하세요"
            />

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                귀가 시간
              </label>
              <input
                type="datetime-local"
                value={formData.desiredReturnTime}
                onChange={(e) => setFormData({ ...formData, desiredReturnTime: e.target.value })}
                className="w-full px-4 py-4 text-base border-2 border-gray-200 rounded-xl focus:border-black focus:outline-none transition-colors"
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setStep(1)}
                className="flex-1 border-2 border-black text-black py-4 rounded-xl font-bold text-lg hover:bg-gray-50 transition-colors"
              >
                이전
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!canProceedStep2}
                className="flex-1 bg-black text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-900 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                다음
              </button>
            </div>
          </div>
        )}

        {/* Step 3: 확인 */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-6">예약 확인</h2>

            <div className="border-2 border-gray-200 rounded-xl p-6 space-y-4">
              <div>
                <h3 className="font-bold mb-3">가는 편</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">출발</span>
                    <span className="font-medium">{formData.pickupAddress}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">도착</span>
                    <span className="font-medium">{formData.dropoffAddress}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">시간</span>
                    <span className="font-medium">
                      {new Date(formData.desiredPickupTime).toLocaleString('ko-KR')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-bold mb-3">귀가 편</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">출발</span>
                    <span className="font-medium">{formData.returnAddress}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">도착</span>
                    <span className="font-medium">{formData.homeAddress}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">시간</span>
                    <span className="font-medium">
                      {new Date(formData.desiredReturnTime).toLocaleString('ko-KR')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                인원 수
              </label>
              <input
                type="number"
                min="1"
                max="7"
                value={formData.passengerCount}
                onChange={(e) => setFormData({ ...formData, passengerCount: parseInt(e.target.value) })}
                className="w-full px-4 py-4 text-base border-2 border-gray-200 rounded-xl focus:border-black focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                특별 요청 (선택)
              </label>
              <textarea
                value={formData.specialRequests}
                onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                placeholder="캐리어 등 특별한 요청사항이 있으면 입력하세요"
                rows={3}
                className="w-full px-4 py-4 text-base border-2 border-gray-200 rounded-xl focus:border-black focus:outline-none transition-colors resize-none"
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setStep(2)}
                className="flex-1 border-2 border-black text-black py-4 rounded-xl font-bold text-lg hover:bg-gray-50 transition-colors"
              >
                이전
              </button>
              <button
                onClick={handleSubmit}
                disabled={!canSubmit || loading}
                className="flex-1 bg-black text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-900 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {loading ? '처리 중...' : '예약 신청'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
