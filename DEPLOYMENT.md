# 🚀 BUTAXI 배포 가이드

## 📋 사전 준비

### 필요한 계정
- ✅ GitHub 계정
- ✅ Render 계정 (https://render.com)
- ✅ Kakao Developers 앱
- ✅ SOLAPI 계정

---

## 1️⃣ 환경변수 준비

### Backend 환경변수
```bash
# Database (Render에서 자동 생성됨)
DATABASE_URL=postgresql://...

# Kakao API
KAKAO_REST_API_KEY=03e6693a8b25414be33cea9e8e88b3cf
KAKAO_JS_API_KEY=5632e1df143603472a27798a1708b50a

# SOLAPI
SOLAPI_API_KEY=USM9H5EGC8VAOHTNZKQIWQJUQ15X3SZ5
SOLAPI_API_SECRET=(SOLAPI 콘솔에서 확인)
SOLAPI_SENDER_PHONE=(발신번호)

# Server
PORT=10000
NODE_ENV=production
```

### Frontend 환경변수
```bash
VITE_API_URL=(Backend URL - Render에서 생성됨)
VITE_KAKAO_REST_API_KEY=03e6693a8b25414be33cea9e8e88b3cf
```

---

## 2️⃣ Render 배포 순서

### Step 1: PostgreSQL 생성

1. Render 대시보드 접속
2. **New +** → **PostgreSQL**
3. 설정:
   - Name: `butaxi-db`
   - Database: `butaxi`
   - User: `butaxi`
   - Region: Oregon (US West)
   - Plan: Free (또는 Starter $7/월)
4. **Create Database**
5. `Internal Database URL` 복사 (나중에 사용)

### Step 2: Backend 배포

1. **New +** → **Web Service**
2. GitHub 저장소 연결: `yunghong619-lgtm/butaxi-mvp`
3. 설정:
   - Name: `butaxi-backend`
   - Region: Oregon (US West)
   - Branch: `main`
   - Root Directory: `backend`
   - Environment: `Node`
   - Build Command: `npm install && npx prisma generate && npx prisma migrate deploy`
   - Start Command: `npm run start`
   - Plan: Free (또는 Starter $7/월)
4. **Environment Variables** 추가:
   ```
   DATABASE_URL=(Step 1에서 복사한 Internal Database URL)
   NODE_ENV=production
   PORT=10000
   KAKAO_REST_API_KEY=03e6693a8b25414be33cea9e8e88b3cf
   KAKAO_JS_API_KEY=5632e1df143603472a27798a1708b50a
   SOLAPI_API_KEY=USM9H5EGC8VAOHTNZKQIWQJUQ15X3SZ5
   SOLAPI_API_SECRET=(your_secret)
   SOLAPI_SENDER_PHONE=(your_phone)
   ```
5. **Create Web Service**
6. 배포 완료 후 URL 복사 (예: `https://butaxi-backend.onrender.com`)

### Step 3: Frontend 배포

1. **New +** → **Static Site**
2. GitHub 저장소 연결: `yunghong619-lgtm/butaxi-mvp`
3. 설정:
   - Name: `butaxi-frontend`
   - Branch: `main`
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`
4. **Environment Variables** 추가:
   ```
   VITE_API_URL=(Step 2에서 복사한 Backend URL)
   VITE_KAKAO_REST_API_KEY=03e6693a8b25414be33cea9e8e88b3cf
   ```
5. **Create Static Site**
6. 배포 완료 후 URL로 접속!

---

## 3️⃣ 데이터베이스 초기 설정

### Seed 데이터 추가 (선택사항)

Backend가 배포된 후:

1. Render 대시보드 → `butaxi-backend` 서비스
2. **Shell** 탭 클릭
3. 명령어 실행:
   ```bash
   npm run db:seed
   ```

---

## 4️⃣ 배포 후 확인사항

### ✅ 체크리스트

- [ ] Frontend URL로 접속 가능
- [ ] Backend Health Check (`https://butaxi-backend.onrender.com/health`)
- [ ] 고객 페이지 접근 가능
- [ ] 드라이버 페이지 접근 가능
- [ ] 예약 신청 가능
- [ ] SMS 알림 작동

---

## 5️⃣ 비용 정보

### 무료 플랜
- Frontend (Static Site): 무료 ✅
- Backend (Web Service): 무료 (15분 미사용 시 슬립)
- PostgreSQL: 무료 (90일 후 삭제)
- **총 비용: $0/월**

### 유료 플랜 (추천)
- Frontend: 무료 ✅
- Backend: $7/월 (항상 활성)
- PostgreSQL: $7/월 (영구 보관)
- **총 비용: $14/월**

---

## 🔧 트러블슈팅

### 문제 1: Backend 빌드 실패
- Prisma 마이그레이션 오류 확인
- `DATABASE_URL` 환경변수 확인

### 문제 2: Frontend에서 API 연결 안됨
- `VITE_API_URL` 확인
- CORS 설정 확인 (backend/src/index.ts)

### 문제 3: 무료 플랜 슬립 모드
- 첫 요청 시 30초~1분 대기
- 유료 플랜으로 업그레이드 권장

---

## 📞 지원

문제가 있으면 GitHub Issues에 등록해주세요!
https://github.com/yunghong619-lgtm/butaxi-mvp/issues
