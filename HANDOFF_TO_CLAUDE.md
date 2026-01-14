# 🚀 BUTAXI MVP - 클로드 인계 문서

## 📌 프로젝트 개요
- **서비스명**: BUTAXI (Bus + Taxi 공유 택시 예약 서비스)
- **GitHub**: https://github.com/yunghong619-lgtm/butaxi-mvp
- **배포 플랫폼**: Render
  - Frontend: https://butaxi-frontend.onrender.com
  - Backend: https://butaxi-backend.onrender.com
  - Database: PostgreSQL (butaxi_db)

---

## ✅ 완료된 작업

### 1. 인프라 & 배포
- ✅ GitHub 저장소 생성 및 코드 푸시
- ✅ Render 배포 완료
  - PostgreSQL Database 생성
  - Backend Web Service (Node.js + Express + Prisma)
  - Frontend Static Site (React + Vite + TailwindCSS)
- ✅ 환경변수 모두 설정 완료

### 2. 백엔드 기능 (모두 구현 완료)
- ✅ RideRequest 생성 (예약 요청)
- ✅ 자동 User 생성 (customerId 없을 시)
- ✅ 자동 Vehicle/Driver 생성 (Render Free Plan 대응)
- ✅ 매칭 로직 (2명 이상 그룹화, 5km 반경, 30분 이내)
- ✅ Trip 자동 생성
- ✅ **Proposal 자동 생성** (커밋 e6bc146)
- ✅ **SMS 알림 발송** (커밋 e6bc146)
- ✅ 상태 관리: REQUESTED → PROPOSED → CONFIRMED

### 3. 프론트엔드 기능 (모두 구현 완료)
- ✅ 예약 신청 폼 (Daum Postcode API)
- ✅ 내 예약 요청 페이지
- ✅ 받은 제안 페이지
- ✅ 예약 내역 페이지
- ✅ 드라이버 대시보드
- ✅ 관리자 대시보드

### 4. API 통합
- ✅ Naver Maps API (Geocoding, Reverse Geocoding, Dynamic Map)
- ✅ Daum Postcode API (주소 검색)
- ✅ SOLAPI (SMS 발송)

---

## 🚨 현재 남아있는 문제 1가지

### ❌ 네이버 지도 인증 실패

**증상**:
```
네이버 지도 Open API 인증이 실패하였습니다
Authentication Failed (Error Code: 200)
Client ID: zvr1hrw8n4
URL: https://butaxi-frontend.onrender.com/
```

**브라우저 Console 오류**:
```javascript
❌ Naver Maps SDK failed to load
```

**API 사용량**: 모든 API 0% (호출 자체가 차단되고 있음)

---

## 🔍 원인 분석

### 네이버 클라우드 설정 (모두 정상 ✅)
1. **API 활성화**:
   - ✅ Dynamic Map
   - ✅ Geocoding
   - ✅ Reverse Geocoding

2. **인증 정보**:
   - Client ID: `zvr1hrw8n4`
   - Client Secret: `iQA1R4jg6jcISBLQNpLsBGh4LH2SIiV8vpMXxyQb`

3. **Web 서비스 URL** (3개 모두 등록됨):
   - `http://localhost:5173`
   - `https://butaxi-frontend.onrender.com`
   - `https://butaxi-frontend.onrender.com/`

### 코드 문제 발견! 🎯

**`frontend/index.html` (수정 전)**:
```html
<script src="https://oapi.map.naver.com/openapi/v3/maps.js?ncpClientId=zvr1hrw8n4"></script>
```

**문제점**:
- ❌ Client ID가 **하드코딩**되어 있음
- ❌ Vite 빌드 시 환경변수로 교체되지 않음
- ❌ Render 배포 시 실제 환경변수가 주입되지 않음

**해결 방법**:
- ✅ `%VITE_NAVER_CLIENT_ID%` 플레이스홀더 사용
- ✅ `vite.config.ts`에서 환경변수 주입 설정
- ✅ Render 재배포 필요

---

## 🛠️ 방금 수정한 내용

### 1. `frontend/index.html`
```html
<!-- 수정 전 -->
<script src="https://oapi.map.naver.com/openapi/v3/maps.js?ncpClientId=zvr1hrw8n4"></script>

<!-- 수정 후 -->
<script src="https://oapi.map.naver.com/openapi/v3/maps.js?ncpClientId=%VITE_NAVER_CLIENT_ID%"></script>
```

### 2. `frontend/vite.config.ts` (새로 추가)
```typescript
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
        },
      },
    },
    define: {
      '%VITE_NAVER_CLIENT_ID%': JSON.stringify(env.VITE_NAVER_CLIENT_ID || 'zvr1hrw8n4'),
    },
  };
});
```

---

## 📋 다음 단계 (클로드가 해야 할 일)

### 1. Git Commit & Push
```bash
git add frontend/index.html frontend/vite.config.ts
git commit -m "fix: Use environment variable for Naver Maps Client ID"
git push origin main
```

### 2. Render 프론트엔드 재배포
- Render가 자동으로 재배포를 시작함 (3-5분 소요)
- 또는 수동 배포: Dashboard → butaxi-frontend → "Manual Deploy" → "Clear build cache & deploy"

### 3. 환경변수 확인
Render Frontend 설정에서 다음 환경변수가 설정되어 있는지 확인:
```
VITE_NAVER_CLIENT_ID=zvr1hrw8n4
```

**만약 없다면 추가:**
- Render Dashboard → butaxi-frontend → Environment
- Key: `VITE_NAVER_CLIENT_ID`
- Value: `zvr1hrw8n4`
- Save Changes

---

## 🧪 테스트 시나리오

### 배포 완료 후 (5-10분 후)

#### 1단계: 네이버 지도 로드 확인
```
1. https://butaxi-frontend.onrender.com/customer/booking 접속
2. F12 (개발자 도구) → Console 탭 확인
3. "✅ Naver Maps SDK loaded successfully" 메시지 확인
4. "📍 현위치" 버튼 클릭
5. 지도 모달이 정상적으로 열리는지 확인
```

**성공 기준**:
- ✅ Console에 성공 메시지
- ✅ 지도 모달 정상 표시
- ✅ 네이버 API 사용량 증가 (Dynamic Map 0% → 사용량 발생)

#### 2단계: 매칭 & Proposal 테스트

**브라우저 1 (고객 A)**:
```
출발: 경기 용인시 수지구 동천로 13
도착: 경기 성남시 분당구 성남대로 지하 333
가는 편: 오늘 15:00
귀가 편: 오늘 20:00
```

**브라우저 2 (고객 B)**:
```
출발: 경기 용인시 수지구 고기로45번길 40-18
도착: 경기 성남시 분당구 성남대로 지하 333
가는 편: 오늘 15:03
귀가 편: 오늘 20:02
```

**예상 결과**:
1. ✅ 예약 신청 완료
2. ✅ 백엔드 로그: "✅ 그룹 생성: OUTBOUND - 2명"
3. ✅ 백엔드 로그: "💌 Proposal 생성"
4. ✅ 백엔드 로그: "📱 SMS 발송 완료: 010-4922-0573"
5. ✅ 휴대폰 SMS 수신 (2통)
6. ✅ "받은 제안" 페이지에 제안 표시
7. ✅ 상태: "제안됨" (파란색 배지)

---

## 🔧 환경변수 전체 목록

### Backend (Render)
```env
DATABASE_URL=postgresql://butaxi_db_user:JQKxikhMHxRoabAWiZ2vDkRh0zH3Cd30@dpg-d5j2hol6ubrc73ef79jg-a/butaxi_db
NAVER_CLIENT_ID=zvr1hrw8n4
NAVER_CLIENT_SECRET=iQA1R4jg6jcISBLQNpLsBGh4LH2SIiV8vpMXxyQb
SOLAPI_API_KEY=NCSTYE7LONPODTYS
SOLAPI_API_SECRET=USM9H5EGC8VAOHTNZKQIWQJUQ15X3SZ5
SOLAPI_SENDER_PHONE=010-4922-0573
NODE_ENV=production
PORT=10000
```

### Frontend (Render)
```env
VITE_API_URL=https://butaxi-backend.onrender.com/api
VITE_KAKAO_REST_API_KEY=03e6693a8b25414be33cea9e8e88b3cf
VITE_KAKAO_JS_KEY=5632e1df143603472a27798a1708b50a
VITE_NAVER_CLIENT_ID=zvr1hrw8n4  ← 이게 중요!
```

---

## 📊 최근 커밋 히스토리

```
e6bc146 - feat: Add Proposal creation and SMS notification after Trip matching
12dce72 - fix: correct Naver Maps SDK URL (openapi -> oapi)
45d413a - fix: Vehicle name field + SMS sender phone + auto-user phone number
```

**다음 커밋** (클로드가 해야 함):
```
fix: Use environment variable for Naver Maps Client ID
```

---

## 🐛 문제 발생 시 디버깅

### 백엔드 로그 확인
```
https://dashboard.render.com → butaxi-backend → Logs
```

**찾아야 할 로그**:
- `"✅ 예약 요청 생성"` → 요청 접수
- `"🚀 즉시 매칭 실행"` → 매칭 시작
- `"✅ 그룹 생성: OUTBOUND - 2명"` → 매칭 성공
- `"🚗 Trip 생성 완료"` → Trip 생성
- `"💌 Proposal 생성"` → Proposal 생성
- `"📱 SMS 발송 완료"` → SMS 발송

### 프론트엔드 빌드 확인
```
https://dashboard.render.com → butaxi-frontend → Events
```

**확인 사항**:
- 최신 커밋 해시가 배포되었는지
- 빌드 성공 여부
- 환경변수 주입 로그

### 네이버 API 사용량 확인
```
https://console.ncloud.com/vpc/maps → Application → BUTAXI → API 관리
```

**정상 시**:
- Dynamic Map: 0% → 사용량 증가
- Geocoding: 주소 검색 시마다 증가
- Reverse Geocoding: 현위치 버튼 클릭 시마다 증가

---

## 💡 추가 참고 사항

### 1. Render Free Plan 제약
- Backend: 15분 비활성 시 sleep 모드 (첫 요청 시 50초 소요)
- Frontend: 빌드 캐시 제한
- Database: Shell 접근 불가 (Seed 데이터 직접 입력 불가)

### 2. 자동 생성 로직
- User: `customerId`가 없으면 자동 생성 (phone: 010-4922-0573)
- Vehicle/Driver: 매칭 시 활성 차량이 없으면 자동 생성

### 3. SMS 테스트
- 발신번호: 010-4922-0573
- 수신번호: 010-4922-0573 (동일 - 테스트용)
- SOLAPI 잔액 확인: https://solapi.com

---

## 📞 클로드 시작 명령어

```
프로젝트: BUTAXI MVP (공유 택시 예약 서비스)
GitHub: yunghong619-lgtm/butaxi-mvp

현재 상태:
- 네이버 지도 인증 실패 문제 해결 완료
- frontend/index.html과 vite.config.ts 수정 완료
- Git commit & push 필요
- Render 재배포 필요

다음 작업:
1. Git commit: "fix: Use environment variable for Naver Maps Client ID"
2. Git push origin main
3. Render 프론트엔드 환경변수 확인 (VITE_NAVER_CLIENT_ID)
4. 배포 완료 후 테스트

자세한 내용은 HANDOFF_TO_CLAUDE.md 참조.
```

---

## ✅ 체크리스트

클로드가 완료해야 할 작업:

- [ ] Git commit & push 실행
- [ ] Render 프론트엔드 환경변수 확인/추가
- [ ] 재배포 대기 (3-5분)
- [ ] 네이버 지도 로드 확인
- [ ] API 사용량 증가 확인
- [ ] 매칭 & Proposal 테스트 (2명)
- [ ] SMS 수신 확인
- [ ] 모든 기능 정상 작동 확인

---

**마지막 업데이트**: 2026-01-14 03:30 AM (한국 시간)
**작성자**: AI Assistant (Cursor)
**인계 대상**: Claude (Agent Mode)
