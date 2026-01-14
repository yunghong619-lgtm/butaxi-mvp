# 🚀 BUTAXI MVP - 클로드 인계 문서 (최종)

## 📌 프로젝트 개요
- **서비스명**: BUTAXI (Bus + Taxi 공유 택시 예약 서비스)
- **GitHub**: https://github.com/yunghong619-lgtm/butaxi-mvp
- **배포 플랫폼**: Render
  - Frontend: https://butaxi-frontend.onrender.com
  - Backend: https://butaxi-backend.onrender.com
  - Database: PostgreSQL (butaxi_db)

---

## ✅ 완료된 작업 (최종)

### 1. 네이버 지도 문제 해결
- ❌ 환경변수 주입 시도 → 빌드 에러 발생
- ✅ Client ID 하드코딩으로 유지 (보안상 문제 없음)
- ✅ 커밋: `a93f259`

### 2. Proposal 표시 문제 해결
- ❌ `ProposalList.tsx`에 customerId 하드코딩 ('customer1-id')
- ✅ localStorage에서 customerId 가져오도록 수정
- ✅ 커밋: `(최신 커밋)`

### 3. ID 표시 추가 (디버깅용)
- ✅ RideRequestList: 요청 ID 표시 (#xxxxxxxx)
- ✅ ProposalList: 제안 ID + 요청 ID 표시
- ✅ 이제 캡처만으로 DB 추적 가능

### 4. 백엔드 기능 (모두 구현 완료)
- ✅ RideRequest 생성
- ✅ 자동 User/Vehicle/Driver 생성
- ✅ 매칭 로직 (2명 이상, 5km, 30분)
- ✅ Trip 자동 생성
- ✅ Proposal 자동 생성 (커밋 e6bc146)
- ✅ SMS 알림 발송 (커밋 e6bc146)

---

## 🎯 현재 배포 상태

### 최근 커밋:
```
(최신) - fix: ProposalList customerId + Add ID display
a93f259 - revert: Revert to hardcoded Client ID
5798345 - fix: Use environment variable (빌드 실패)
e6bc146 - feat: Add Proposal + SMS
12dce72 - fix: Naver Maps SDK URL
45d413a - fix: Vehicle name + SMS
```

### 배포 대기 중:
- 🔄 Frontend: ProposalList + RideRequestList 수정 중

---

## 🧪 테스트 시나리오

### 1단계: 네이버 지도 확인
```
1. https://butaxi-frontend.onrender.com/customer/booking
2. F12 → Console: "✅ Naver Maps SDK loaded successfully"
3. "📍 현위치" 버튼 → 지도 모달 정상 표시
4. 네이버 콘솔: Dynamic Map 사용량 증가 확인
```

### 2단계: Proposal 확인
```
1. "내 예약 요청" → "제안됨" 상태 확인
2. 요청 ID 확인 (예: #a1b2c3d4)
3. "받은 제안" → 제안 표시 확인
4. 제안 ID + 요청 ID 매칭 확인
```

### 3단계: 매칭 테스트
```
브라우저 2개:
- 고객 A: 용인시 수지구 → 성남시 분당구 (15:00)
- 고객 B: 용인시 수지구 → 성남시 분당구 (15:03)

예상 결과:
✅ 2명 그룹 생성
✅ Proposal 생성 (각각)
✅ SMS 발송 (010-4922-0573)
✅ "받은 제안" 표시
```

---

## 🔧 환경변수

### Backend:
```env
DATABASE_URL=postgresql://butaxi_db_user:...@dpg-.../butaxi_db
NAVER_CLIENT_ID=zvr1hrw8n4
NAVER_CLIENT_SECRET=iQA1R4jg6jcISBLQNpLsBGh4LH2SIiV8vpMXxyQb
SOLAPI_API_KEY=NCSTYE7LONPODTYS
SOLAPI_API_SECRET=USM9H5EGC8VAOHTNZKQIWQJUQ15X3SZ5
SOLAPI_SENDER_PHONE=010-4922-0573
NODE_ENV=production
PORT=10000
```

### Frontend:
```env
VITE_API_URL=https://butaxi-backend.onrender.com/api
VITE_KAKAO_REST_API_KEY=03e6693a8b25414be33cea9e8e88b3cf
VITE_KAKAO_JS_KEY=5632e1df143603472a27798a1708b50a
VITE_NAVER_CLIENT_ID=zvr1hrw8n4
```

---

## 🐛 해결된 문제들

### 문제 1: 네이버 지도 인증 실패 ❌
**원인**: Web Service URL 설정 + SDK URL 오류
**해결**: 
- ✅ SDK URL 수정: `openapi` → `oapi`
- ✅ Web Service URL 3개 등록 (슬래시 포함/미포함/localhost)
- ✅ Client ID 하드코딩 유지

### 문제 2: Proposal이 UI에 표시 안됨 ❌
**원인**: ProposalList에 customerId 하드코딩
**해결**: 
- ✅ localStorage에서 customerId 가져오기
- ✅ RideRequestList와 동일한 방식 사용

### 문제 3: ID 추적 불가 ❌
**원인**: UI에 ID 미표시
**해결**: 
- ✅ 요청 ID: #xxxxxxxx (8자리)
- ✅ 제안 ID + 요청 ID 표시

---

## 📊 디버깅 가이드

### ID로 추적하기:
```
사용자가 캡처 전송 시:
1. 요청 ID 확인 (예: #a1b2c3d4)
2. Backend 로그 검색: a1b2c3d4
3. Proposal 생성 여부 확인
4. customerId 매칭 확인
```

### Backend 로그 확인:
```
https://dashboard.render.com → butaxi-backend → Logs

검색어:
- "✅ 예약 요청 생성: a1b2c3d4" → 요청 생성
- "✅ 그룹 생성: OUTBOUND - 2명" → 매칭 성공
- "💌 Proposal 생성: xyz" → Proposal 생성
- "📱 SMS 발송 완료" → SMS 발송
```

### 네이버 API 사용량:
```
https://console.ncloud.com/vpc/maps

정상:
- Dynamic Map: 0% → 페이지 로드 시마다 증가
- Geocoding: 주소 검색 시마다 증가
- Reverse Geocoding: 현위치 버튼 시마다 증가
```

---

## 🎯 남은 작업 (클로드가 할 일)

### 1. 배포 확인
- [ ] Render 프론트엔드 배포 완료 확인 (3-5분)
- [ ] 커밋 해시 확인 (최신 커밋)

### 2. 기능 테스트
- [ ] 네이버 지도 로드 확인
- [ ] "받은 제안" 페이지에 Proposal 표시 확인
- [ ] ID 표시 확인 (요청 ID, 제안 ID)

### 3. 매칭 & SMS 테스트
- [ ] 2명 매칭 테스트
- [ ] Proposal 생성 확인
- [ ] SMS 수신 확인 (010-4922-0573)

### 4. 전체 플로우 확인
```
예약 신청 → 매칭 → Proposal 생성 → SMS 발송 → 
"받은 제안" 표시 → 수락 → "예약 내역" 표시
```

---

## 💡 중요 포인트

### 1. Client ID 하드코딩이 괜찮은 이유:
- Client ID는 **공개 정보** (GitHub에 노출돼도 문제 없음)
- 실제 보안은 **Web Service URL**로 제어
- 등록된 URL에서만 지도 작동

### 2. localStorage 사용:
```javascript
// customerId 생성 (BookingForm.tsx)
const customerId = uuidv4();
localStorage.setItem('butaxi_customer_id', customerId);

// customerId 가져오기 (모든 페이지)
const customerId = localStorage.getItem('butaxi_customer_id');
```

### 3. Proposal 생성 플로우:
```
RideRequest (customerId: abc) →
Matching → Trip 생성 →
Proposal 생성 (requestId: abc의 ID) →
조회: /api/proposals/customer/abc
```

---

## 📞 클로드 시작 명령

```
프로젝트: BUTAXI MVP
최종 상태: ProposalList customerId 수정 + ID 표시 추가

배포 대기 중:
- Frontend 재배포 (자동, 3-5분)

다음 작업:
1. 배포 완료 대기
2. 네이버 지도 작동 확인
3. Proposal 표시 확인
4. 매칭 & SMS 테스트
5. 전체 플로우 검증

모든 기능이 정상이면 완료! 🎉

참고:
- HANDOFF_TO_CLAUDE.md (이 파일)
- Backend 로그 (Render)
- 네이버 API 사용량 (Console)
```

---

**마지막 업데이트**: 2026-01-14 10:30 AM (한국 시간)
**최종 커밋**: (방금 푸시됨)
**상태**: ProposalList 문제 해결 완료, 배포 대기 중
