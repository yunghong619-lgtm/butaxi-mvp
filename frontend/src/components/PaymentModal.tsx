import { useState } from 'react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  amount: number;
  bookingId: string;
}

type PaymentMethod = 'kakaopay' | 'naverpay' | 'card' | null;
type PaymentStep = 'select' | 'confirm' | 'processing' | 'complete';

const PAYMENT_METHODS = [
  {
    id: 'kakaopay' as const,
    name: '카카오페이',
    icon: '💛',
    color: 'bg-yellow-400',
    description: '카카오페이로 간편결제',
  },
  {
    id: 'naverpay' as const,
    name: '네이버페이',
    icon: '💚',
    color: 'bg-green-500',
    description: '네이버페이로 간편결제',
  },
  {
    id: 'card' as const,
    name: '신용/체크카드',
    icon: '💳',
    color: 'bg-blue-500',
    description: '카드로 결제',
  },
];

export default function PaymentModal({
  isOpen,
  onClose,
  onComplete,
  amount,
  bookingId,
}: PaymentModalProps) {
  const [step, setStep] = useState<PaymentStep>('select');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(null);

  if (!isOpen) return null;

  const handleSelectMethod = (method: PaymentMethod) => {
    setSelectedMethod(method);
    setStep('confirm');
  };

  const handleConfirmPayment = () => {
    setStep('processing');

    // 가짜 결제 처리 (2초 후 완료)
    setTimeout(() => {
      setStep('complete');
    }, 2000);
  };

  const handleComplete = () => {
    setStep('select');
    setSelectedMethod(null);
    onComplete();
  };

  const handleClose = () => {
    setStep('select');
    setSelectedMethod(null);
    onClose();
  };

  // 요금 상세 (가짜)
  const baseFare = Math.round(amount * 0.6);
  const distanceFare = Math.round(amount * 0.3);
  const timeFare = Math.round(amount * 0.1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
        {/* Step 1: 결제 수단 선택 */}
        {step === 'select' && (
          <>
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">결제하기</h2>
                <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-full">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* 금액 표시 */}
              <div className="bg-gray-50 rounded-2xl p-6 mb-6">
                <p className="text-sm text-gray-600 mb-2">결제 금액</p>
                <p className="text-4xl font-bold">{amount.toLocaleString()}원</p>

                {/* 요금 상세 */}
                <div className="mt-4 pt-4 border-t border-gray-200 space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>기본요금</span>
                    <span>{baseFare.toLocaleString()}원</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>거리요금</span>
                    <span>{distanceFare.toLocaleString()}원</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>시간요금</span>
                    <span>{timeFare.toLocaleString()}원</span>
                  </div>
                </div>
              </div>

              {/* 결제 수단 */}
              <p className="text-sm font-semibold text-gray-700 mb-3">결제 수단 선택</p>
              <div className="space-y-3">
                {PAYMENT_METHODS.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => handleSelectMethod(method.id)}
                    className="w-full flex items-center gap-4 p-4 border-2 border-gray-200 rounded-xl hover:border-black hover:bg-gray-50 transition-all"
                  >
                    <div className={`w-12 h-12 ${method.color} rounded-xl flex items-center justify-center text-2xl`}>
                      {method.icon}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold">{method.name}</p>
                      <p className="text-sm text-gray-500">{method.description}</p>
                    </div>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Step 2: 결제 확인 */}
        {step === 'confirm' && selectedMethod && (
          <>
            <div className="p-6 border-b">
              <button onClick={() => setStep('select')} className="flex items-center gap-2 text-gray-600 mb-4">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                뒤로
              </button>
              <h2 className="text-2xl font-bold">결제 확인</h2>
            </div>

            <div className="p-6">
              {/* 선택된 결제 수단 */}
              <div className="bg-gray-50 rounded-2xl p-6 mb-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-12 h-12 ${PAYMENT_METHODS.find(m => m.id === selectedMethod)?.color} rounded-xl flex items-center justify-center text-2xl`}>
                    {PAYMENT_METHODS.find(m => m.id === selectedMethod)?.icon}
                  </div>
                  <div>
                    <p className="font-semibold">{PAYMENT_METHODS.find(m => m.id === selectedMethod)?.name}</p>
                    <p className="text-sm text-gray-500">결제 수단</p>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">결제 금액</span>
                    <span className="text-2xl font-bold">{amount.toLocaleString()}원</span>
                  </div>
                </div>
              </div>

              {/* 예약 정보 */}
              <div className="text-sm text-gray-500 mb-6">
                <p>예약번호: {bookingId.slice(0, 8)}</p>
              </div>

              {/* 버튼 */}
              <div className="flex gap-3">
                <button
                  onClick={handleClose}
                  className="flex-1 py-4 border-2 border-gray-200 rounded-xl font-semibold hover:bg-gray-50 transition"
                >
                  취소
                </button>
                <button
                  onClick={handleConfirmPayment}
                  className="flex-1 py-4 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition"
                >
                  결제하기
                </button>
              </div>
            </div>
          </>
        )}

        {/* Step 3: 결제 처리 중 */}
        {step === 'processing' && (
          <div className="p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
              <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin" />
            </div>
            <h2 className="text-2xl font-bold mb-2">결제 처리 중</h2>
            <p className="text-gray-600">잠시만 기다려주세요...</p>
          </div>
        )}

        {/* Step 4: 결제 완료 (영수증) */}
        {step === 'complete' && (
          <div className="p-6">
            {/* 헤더 */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-1">결제 완료</h2>
              <p className="text-gray-600">결제가 성공적으로 완료되었습니다</p>
            </div>

            {/* 영수증 스타일 */}
            <div className="bg-gray-50 rounded-2xl p-6 border-2 border-dashed border-gray-200">
              <div className="text-center pb-4 mb-4 border-b border-gray-200">
                <p className="text-sm text-gray-500">butaxi</p>
                <p className="text-xs text-gray-400 mt-1">{new Date().toLocaleString('ko-KR')}</p>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">기본요금</span>
                  <span>{baseFare.toLocaleString()}원</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">거리요금</span>
                  <span>{distanceFare.toLocaleString()}원</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">시간요금</span>
                  <span>{timeFare.toLocaleString()}원</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">총 결제금액</span>
                  <span className="text-2xl font-bold">{amount.toLocaleString()}원</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-500">
                <div className="flex justify-between">
                  <span>결제수단</span>
                  <span>{PAYMENT_METHODS.find(m => m.id === selectedMethod)?.name}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span>거래번호</span>
                  <span className="font-mono">TX{Date.now().toString().slice(-8)}</span>
                </div>
              </div>
            </div>

            {/* 완료 버튼 */}
            <button
              onClick={handleComplete}
              className="w-full mt-6 py-4 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition"
            >
              확인
            </button>
          </div>
        )}

        {/* 애니메이션 스타일 */}
        <style>{`
          @keyframes scale-in {
            from {
              transform: scale(0.9);
              opacity: 0;
            }
            to {
              transform: scale(1);
              opacity: 1;
            }
          }
          .animate-scale-in {
            animation: scale-in 0.2s ease-out;
          }
        `}</style>
      </div>
    </div>
  );
}
