import { useState, useEffect, useRef } from 'react';
import { pointsApi } from '../services/api';
import { useToast } from './Toast';

// Confetti 파티클 타입
interface Particle {
  x: number;
  y: number;
  size: number;
  color: string;
  speedX: number;
  speedY: number;
  rotation: number;
  rotationSpeed: number;
}

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
  const [pointsBalance, setPointsBalance] = useState(0);
  const [usePoints, setUsePoints] = useState(0);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>();
  const { showToast } = useToast();

  const customerId = localStorage.getItem('butaxi_customer_id') || '';

  // 포인트 잔액 로드
  useEffect(() => {
    if (isOpen && customerId) {
      loadPointsBalance();
    }
  }, [isOpen, customerId]);

  const loadPointsBalance = async () => {
    try {
      const response: any = await pointsApi.getBalance(customerId);
      if (response.success) {
        setPointsBalance(response.data.balance);
      }
    } catch (error) {
      console.error('포인트 조회 실패:', error);
    }
  };

  // Confetti 효과
  useEffect(() => {
    if (step !== 'complete') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 캔버스 크기 설정
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // 파티클 색상
    const colors = ['#FCD34D', '#F59E0B', '#10B981', '#3B82F6', '#EC4899', '#8B5CF6'];

    // 파티클 생성
    const createParticles = () => {
      const particles: Particle[] = [];
      for (let i = 0; i < 150; i++) {
        particles.push({
          x: canvas.width / 2,
          y: canvas.height / 2,
          size: Math.random() * 8 + 4,
          color: colors[Math.floor(Math.random() * colors.length)],
          speedX: (Math.random() - 0.5) * 20,
          speedY: Math.random() * -15 - 5,
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 10,
        });
      }
      return particles;
    };

    particlesRef.current = createParticles();

    // 애니메이션 함수
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((p, index) => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.speedY += 0.3; // 중력
        p.speedX *= 0.99; // 마찰
        p.rotation += p.rotationSpeed;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, 1 - p.y / canvas.height);
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();

        // 화면 밖으로 나가면 제거
        if (p.y > canvas.height) {
          particlesRef.current.splice(index, 1);
        }
      });

      if (particlesRef.current.length > 0) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [step]);

  if (!isOpen) return null;

  const handleSelectMethod = (method: PaymentMethod) => {
    setSelectedMethod(method);
    setStep('confirm');
  };

  const handleConfirmPayment = async () => {
    setStep('processing');
    setErrorMessage('');

    try {
      // 포인트 사용 처리
      if (usePoints > 0 && customerId) {
        try {
          await pointsApi.usePoints({
            customerId,
            amount: usePoints,
            bookingId,
          });
        } catch (pointsError) {
          console.error('포인트 사용 실패:', pointsError);
          // 포인트 사용 실패해도 결제는 계속 진행
        }
      }

      // 가짜 결제 처리 (1.5초)
      await new Promise(resolve => setTimeout(resolve, 1500));

      // 포인트 적립 (실결제액의 3%)
      const finalPaidAmount = amount - usePoints;
      if (finalPaidAmount > 0 && customerId) {
        try {
          const earnResponse: any = await pointsApi.earnRideReward({
            customerId,
            bookingId,
            paidAmount: finalPaidAmount,
          });
          if (earnResponse.success) {
            setEarnedPoints(earnResponse.data.earnedPoints);
          }
        } catch (earnError) {
          console.error('포인트 적립 실패:', earnError);
          // 포인트 적립 실패해도 결제는 완료 처리
        }
      }

      setStep('complete');
    } catch (error: any) {
      console.error('결제 처리 실패:', error);
      const message = error.response?.data?.error || error.message || '결제 처리 중 오류가 발생했습니다.';
      setErrorMessage(message);
      showToast(message, 'error');
      setStep('confirm');
    }
  };

  const handleComplete = () => {
    setStep('select');
    setSelectedMethod(null);
    setUsePoints(0);
    setEarnedPoints(0);
    onComplete();
  };

  // 포인트 전액 사용 (최대 결제액의 50%까지)
  const handleUseAllPoints = () => {
    const maxUsable = Math.min(pointsBalance, Math.floor(amount * 0.5));
    setUsePoints(maxUsable);
  };

  // 최종 결제 금액
  const finalAmount = amount - usePoints;

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
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

      {/* Modal Container - 화면 중앙 고정 */}
      <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none">
        {/* Modal */}
        <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[85vh] overflow-y-auto animate-scale-in pointer-events-auto">
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

              {/* 포인트 사용 */}
              {pointsBalance > 0 && (
                <div className="bg-purple-50 rounded-2xl p-4 mb-6 border border-purple-100">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">💜</span>
                      <span className="font-semibold text-purple-900">포인트 사용</span>
                    </div>
                    <span className="text-sm text-purple-700">
                      보유: {pointsBalance.toLocaleString()}P
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={usePoints || ''}
                      onChange={(e) => {
                        const val = Math.min(
                          Math.max(0, parseInt(e.target.value) || 0),
                          Math.min(pointsBalance, Math.floor(amount * 0.5))
                        );
                        setUsePoints(val);
                      }}
                      placeholder="0"
                      className="flex-1 px-3 py-2 border border-purple-200 rounded-lg text-right font-mono focus:outline-none focus:border-purple-400"
                    />
                    <span className="text-purple-700">P</span>
                    <button
                      onClick={handleUseAllPoints}
                      className="px-3 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 transition"
                    >
                      전액
                    </button>
                  </div>
                  <p className="text-xs text-purple-600 mt-2">
                    * 최대 결제금액의 50%까지 사용 가능
                  </p>
                  {usePoints > 0 && (
                    <div className="mt-3 pt-3 border-t border-purple-200 flex justify-between text-sm font-semibold">
                      <span className="text-purple-900">실결제액</span>
                      <span className="text-purple-700">{finalAmount.toLocaleString()}원</span>
                    </div>
                  )}
                </div>
              )}

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

                <div className="border-t border-gray-200 pt-4 space-y-2">
                  <div className="flex justify-between items-center text-sm text-gray-600">
                    <span>이용 요금</span>
                    <span>{amount.toLocaleString()}원</span>
                  </div>
                  {usePoints > 0 && (
                    <div className="flex justify-between items-center text-sm text-purple-600">
                      <span>포인트 할인</span>
                      <span>-{usePoints.toLocaleString()}P</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                    <span className="text-gray-600">최종 결제 금액</span>
                    <span className="text-2xl font-bold">{finalAmount.toLocaleString()}원</span>
                  </div>
                </div>
              </div>

              {/* 예약 정보 */}
              <div className="text-sm text-gray-500 mb-6">
                <p>예약번호: {bookingId.slice(0, 8)}</p>
              </div>

              {/* 에러 메시지 */}
              {errorMessage && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <div className="flex items-center gap-2 text-red-700">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-semibold text-sm">{errorMessage}</span>
                  </div>
                </div>
              )}

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
            {/* Confetti Canvas */}
            <canvas
              ref={canvasRef}
              className="fixed inset-0 pointer-events-none z-50"
              style={{ width: '100vw', height: '100vh' }}
            />

            {/* 헤더 */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center animate-bounce-once">
                <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-1">예약 완료!</h2>
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

              <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                {usePoints > 0 && (
                  <div className="flex justify-between text-purple-600 text-sm">
                    <span>포인트 사용</span>
                    <span>-{usePoints.toLocaleString()}P</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="font-semibold">총 결제금액</span>
                  <span className="text-2xl font-bold">{finalAmount.toLocaleString()}원</span>
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

            {/* 적립 포인트 */}
            {earnedPoints > 0 && (
              <div className="mt-4 bg-purple-50 rounded-xl p-4 border border-purple-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🎉</span>
                    <span className="font-semibold text-purple-900">포인트 적립</span>
                  </div>
                  <span className="text-lg font-bold text-purple-600">+{earnedPoints.toLocaleString()}P</span>
                </div>
                <p className="text-xs text-purple-700 mt-1">결제금액의 3%가 적립되었습니다</p>
              </div>
            )}

            {/* 다음 단계 안내 */}
            <div className="mt-4 bg-amber-50 rounded-xl p-4 border border-amber-200">
              <div className="flex items-start gap-3">
                <div className="text-xl">🚕</div>
                <div className="text-sm">
                  <p className="font-semibold text-amber-900 mb-1">앞으로의 일정</p>
                  <ul className="text-amber-800 space-y-1">
                    <li>• 출발 30분 전 알림을 보내드려요</li>
                    <li>• 기사님이 픽업 장소로 이동합니다</li>
                    <li>• 예약 내역에서 상세 정보를 확인하세요</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 완료 버튼 */}
            <button
              onClick={handleComplete}
              className="w-full mt-6 py-4 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition"
            >
              예약 내역 보기
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
          @keyframes bounce-once {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.2); }
          }
          .animate-bounce-once {
            animation: bounce-once 0.5s ease-out;
          }
        `}</style>
        </div>
      </div>
    </div>
  );
}
