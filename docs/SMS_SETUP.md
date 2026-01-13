# 📱 SMS (SOLAPI) 연동 가이드

## ✅ 연동 완료!

RETURN 프로젝트에 SOLAPI (Coolsms) SMS 서비스가 성공적으로 연동되었습니다!

---

## 📋 현재 설정

### 환경 변수 (.env)
```env
SOLAPI_API_KEY=NCSTYE7LONPODTYS
SOLAPI_API_SECRET=USM9H5EGC8VAOHTNZKQIWQJUQ15X3SZ5
SOLAPI_FROM=01049220573
```

### 발신번호
```
010-4922-0573 (인증 완료)
```

---

## 🚀 SMS 발송 기능

### 자동 발송되는 SMS:

1. **제안 도착 알림**
   - 고객이 예약 요청 후 매칭되면 자동 발송
   - 픽업 시간, 예상 요금 포함
   - 15분 내 수락 안내

2. **예약 확정 알림**
   - 고객이 제안 수락 시 자동 발송
   - 픽업 시간 확정 안내
   - 30분 전 재알림 예고

3. **픽업 임박 알림** (구현 예정)
   - 픽업 30분 전 자동 발송
   - 픽업 시간 및 장소 안내

---

## 🧪 테스트 방법

### 1. SMS 단독 테스트
```bash
cd backend
npx tsx test-sms.ts
```

### 2. 전체 플로우 테스트
1. 서버 실행: `npm run dev`
2. 프론트엔드에서 예약 요청
3. 10분 대기 (자동 매칭)
4. SMS 수신 확인

---

## 💰 요금 정보

- **SMS**: 약 15.4원/건
- **LMS (장문)**: 약 45원/건
- **현재 잔액**: SOLAPI 대시보드에서 확인
- **충전**: https://solapi.com

---

## 📊 발송 내역 확인

1. https://solapi.com 로그인
2. 좌측 메뉴 → **"발송 내역"**
3. 발송 성공/실패 확인

---

## ⚙️ 설정 변경

### API 키 재발급
1. SOLAPI 콘솔 → **"개발자 허브"**
2. 기존 키 삭제 → 새 키 생성
3. `backend/.env` 파일 수정

### 발신번호 추가
1. SOLAPI 콘솔 → **"발신번호"**
2. 새 번호 추가 → ARS 인증
3. `backend/.env`의 `SOLAPI_FROM` 변경

---

## 🔧 트러블슈팅

### SMS가 발송 안 됨
1. `.env` 파일 확인
2. API 키 유효성 확인
3. 잔액 확인 (SOLAPI 대시보드)
4. 발신번호 인증 상태 확인

### 오류 메시지
- **"Insufficient balance"**: 잔액 부족 → 충전 필요
- **"Invalid phone number"**: 번호 형식 오류
- **"Unauthorized"**: API 키 오류

---

## 📝 참고

- SOLAPI 문서: https://docs.solapi.com
- SOLAPI SDK: https://github.com/solapi/solapi-nodejs
- 요금제: https://solapi.com/pricing

---

## 🎯 다음 단계

- [ ] 픽업 임박 알림 자동화 (스케줄러)
- [ ] SMS 발송 실패 시 재시도 로직
- [ ] 발송 내역 DB 저장
- [ ] 관리자 대시보드에서 SMS 발송 통계

---

**SMS 연동 완료! 🎉**
