import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { rideApi } from '../../services/api';
import AddressSearch from '../../components/AddressSearch';
import TripMap from '../../components/TripMap';

export default function BookingForm() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  
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
    setError('');
    try {
      const response: any = await rideApi.createRequest({
        customerId,
        ...formData,
      });

      if (response.success) {
        alert('✅ 예약 요청이 접수되었습니다! 곧 제안을 보내드리겠습니다.');
        navigate('/customer/proposals');
      } else {
        setError('예약 요청에 실패했습니다. 다시 시도해주세요.');
      }
    } catch (err: any) {
      console.error('예약 요청 실패:', err);
      const errorMessage = err.response?.data?.message || err.message || '예약 요청 중 오류가 발생했습니다.';
      setError(errorMessage);
      alert(`❌ ${errorMessage}\n\n백엔드 서버가 실행 중인지 확인해주세요.`);
    } finally {
      setLoading(false);
    }
  };

  const canProceedStep1 = formData.pickupAddress && formData.dropoffAddress && formData.desiredPickupTime;
  const canProceedStep2 = formData.returnAddress && formData.homeAddress && formData.desiredReturnTime;
  const canSubmit = canProceedStep1 && canProceedStep2;

  // 지도용 stops 데이터 생성 (TripMap 컴포넌트 타입에 맞게)
  const outboundStops = [
    {
      id: '1',
      address: formData.pickupAddress,
      latitude: formData.pickupLat,
      longitude: formData.pickupLng,
      stopType: 'PICKUP',
      sequence: 1,
      actualTime: null,
    },
    {
      id: '2',
      address: formData.dropoffAddress,
      latitude: formData.dropoffLat,
      longitude: formData.dropoffLng,
      stopType: 'DROPOFF',
      sequence: 2,
      actualTime: null,
    },
  ];

  const returnStops = [
    {
      id: '3',
      address: formData.returnAddress,
      latitude: formData.returnLat,
      longitude: formData.returnLng,
      stopType: 'PICKUP',
      sequence: 1,
      actualTime: null,
    },
    {
      id: '4',
      address: formData.homeAddress,
      latitude: formData.homeLat,
      longitude: formData.homeLng,
      stopType: 'DROPOFF',
      sequence: 2,
      actualTime: null,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/customer')}
            className="text-gray-600 hover:text-black mb-4 flex items-center gap-2 transition"
          >
            <span>←</span>
            <span>뒤로</span>
          </button>
          <h1 className="text-4xl font-bold text-black mb-2">예약하기</h1>
          <p className="text-gray-600">왕복 예약을 한 번에 신청하세요</p>
        </div>

        {/* Progress */}
        <div className="flex items-center mb-12">
          {[
            { num: 1, label: '가는 편' },
            { num: 2, label: '귀가 편' },
            { num: 3, label: '확인' },
          ].map(({ num, label }) => (
            <div key={num} className="flex-1 flex items-center">
              <div className="flex flex-col items-center gap-2">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all ${
                    step >= num ? 'bg-black text-white shadow-lg' : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {num}
                </div>
                <span className={`text-xs font-medium ${step >= num ? 'text-black' : 'text-gray-400'}`}>
                  {label}
                </span>
              </div>
              {num < 3 && (
                <div
                  className={`flex-1 h-1 mx-3 rounded-full transition-all ${
                    step > num ? 'bg-black' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: 가는 편 */}
        {step === 1 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold">가는 편</h2>
              </div>

              <div className="space-y-6">
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
                  <label className="block text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    출발 시간
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.desiredPickupTime}
                    onChange={(e) => setFormData({ ...formData, desiredPickupTime: e.target.value })}
                    className="w-full px-5 py-4 text-base border-2 border-gray-200 rounded-2xl focus:border-black focus:outline-none transition-all shadow-sm hover:shadow-md cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!canProceedStep1}
              className="w-full bg-black text-white py-5 rounded-2xl font-bold text-lg hover:bg-gray-900 transition-all shadow-lg hover:shadow-xl disabled:bg-gray-300 disabled:cursor-not-allowed disabled:shadow-none"
            >
              다음 단계 →
            </button>
          </div>
        )}

        {/* Step 2: 귀가 편 */}
        {step === 2 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold">귀가 편</h2>
              </div>

              <div className="space-y-6">
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
                  <label className="block text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    귀가 시간
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.desiredReturnTime}
                    onChange={(e) => setFormData({ ...formData, desiredReturnTime: e.target.value })}
                    className="w-full px-5 py-4 text-base border-2 border-gray-200 rounded-2xl focus:border-black focus:outline-none transition-all shadow-sm hover:shadow-md cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setStep(1)}
                className="flex-1 border-2 border-black text-black py-5 rounded-2xl font-bold text-lg hover:bg-gray-50 transition-all shadow-sm hover:shadow-lg"
              >
                ← 이전
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!canProceedStep2}
                className="flex-1 bg-black text-white py-5 rounded-2xl font-bold text-lg hover:bg-gray-900 transition-all shadow-lg hover:shadow-xl disabled:bg-gray-300 disabled:cursor-not-allowed disabled:shadow-none"
              >
                다음 단계 →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: 확인 */}
        {step === 3 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold">예약 확인</h2>
            </div>

            {/* 가는 편 */}
            <div className="bg-gradient-to-br from-blue-50 to-white rounded-3xl p-8 shadow-lg border-2 border-blue-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">
                  가는 편
                </h3>
                {formData.desiredPickupTime && (
                  <span className="px-4 py-2 bg-blue-500 text-white text-sm font-semibold rounded-full">
                    {new Date(formData.desiredPickupTime).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                  </span>
                )}
              </div>

              {/* 시각적 경로 */}
              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold shadow-md">
                      A
                    </div>
                    <div className="w-0.5 h-16 bg-gradient-to-b from-blue-500 to-green-500"></div>
                  </div>
                  <div className="flex-1 pt-2">
                    <p className="text-xs text-gray-500 mb-1">출발지</p>
                    <p className="font-semibold text-gray-900">{formData.pickupAddress}</p>
                    {formData.desiredPickupTime && (
                      <p className="text-sm text-blue-600 mt-1">
                        {new Date(formData.desiredPickupTime).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center font-bold shadow-md">
                    B
                  </div>
                  <div className="flex-1 pt-2">
                    <p className="text-xs text-gray-500 mb-1">도착지</p>
                    <p className="font-semibold text-gray-900">{formData.dropoffAddress}</p>
                  </div>
                </div>
              </div>

              {/* 지도 */}
              {formData.pickupLat && formData.pickupLng ? (
                <div className="rounded-2xl overflow-hidden shadow-md border-2 border-white">
                  <TripMap
                    stops={outboundStops}
                    currentLocation={null}
                    showRoute={true}
                    height="250px"
                  />
                </div>
              ) : (
                <div className="rounded-2xl bg-gray-50 p-8 text-center border-2 border-gray-200">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 013.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  <p className="text-gray-600 font-medium">주소를 입력하면 지도가 표시됩니다</p>
                </div>
              )}
            </div>

            {/* 귀가 편 */}
            <div className="bg-gradient-to-br from-purple-50 to-white rounded-3xl p-8 shadow-lg border-2 border-purple-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">
                  귀가 편
                </h3>
                {formData.desiredReturnTime && (
                  <span className="px-4 py-2 bg-purple-500 text-white text-sm font-semibold rounded-full">
                    {new Date(formData.desiredReturnTime).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                  </span>
                )}
              </div>

              {/* 시각적 경로 */}
              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold shadow-md">
                      C
                    </div>
                    <div className="w-0.5 h-16 bg-gradient-to-b from-purple-500 to-pink-500"></div>
                  </div>
                  <div className="flex-1 pt-2">
                    <p className="text-xs text-gray-500 mb-1">출발지</p>
                    <p className="font-semibold text-gray-900">{formData.returnAddress}</p>
                    {formData.desiredReturnTime && (
                      <p className="text-sm text-purple-600 mt-1">
                        {new Date(formData.desiredReturnTime).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-pink-500 text-white rounded-full flex items-center justify-center font-bold shadow-md">
                    D
                  </div>
                  <div className="flex-1 pt-2">
                    <p className="text-xs text-gray-500 mb-1">도착지 (집)</p>
                    <p className="font-semibold text-gray-900">{formData.homeAddress}</p>
                  </div>
                </div>
              </div>

              {/* 지도 */}
              {formData.returnLat && formData.returnLng ? (
                <div className="rounded-2xl overflow-hidden shadow-md border-2 border-white">
                  <TripMap
                    stops={returnStops}
                    currentLocation={null}
                    showRoute={true}
                    height="250px"
                  />
                </div>
              ) : (
                <div className="rounded-2xl bg-gray-50 p-8 text-center border-2 border-gray-200">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 013.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  <p className="text-gray-600 font-medium">주소를 입력하면 지도가 표시됩니다</p>
                </div>
              )}
            </div>

            {/* 추가 정보 */}
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold">추가 정보</h3>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    인원 수
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="number"
                      min="1"
                      max="7"
                      value={formData.passengerCount}
                      onChange={(e) => setFormData({ ...formData, passengerCount: parseInt(e.target.value) || 1 })}
                      className="flex-1 px-5 py-4 text-base border-2 border-gray-200 rounded-2xl focus:border-black focus:outline-none transition-all shadow-sm hover:shadow-md"
                    />
                    <span className="text-gray-600">명</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    특별 요청 (선택)
                  </label>
                  <textarea
                    value={formData.specialRequests}
                    onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                    placeholder="캐리어, 유모차 등 특별한 요청사항이 있으면 입력하세요"
                    rows={3}
                    className="w-full px-5 py-4 text-base border-2 border-gray-200 rounded-2xl focus:border-black focus:outline-none transition-all resize-none shadow-sm hover:shadow-md"
                  />
                </div>
              </div>
            </div>

            {/* 에러 메시지 */}
            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 flex items-start gap-3">
                <span className="text-2xl">⚠️</span>
                <div>
                  <p className="font-semibold text-red-900 mb-1">예약 실패</p>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}

            {/* 버튼 */}
            <div className="flex gap-4">
              <button
                onClick={() => setStep(2)}
                disabled={loading}
                className="flex-1 border-2 border-black text-black py-5 rounded-2xl font-bold text-lg hover:bg-gray-50 transition-all shadow-sm hover:shadow-lg disabled:opacity-50"
              >
                ← 이전
              </button>
              <button
                onClick={handleSubmit}
                disabled={!canSubmit || loading}
                className="flex-1 bg-gradient-to-r from-black to-gray-800 text-white py-5 rounded-2xl font-bold text-lg hover:shadow-2xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    처리 중...
                  </span>
                ) : (
                  '🎉 예약 신청'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
