# 🚖 RETURN - 공유 택시 예약 서비스 MVP

**함께 가는 즐거운 여정**

RETURN은 비슷한 시간대, 비슷한 경로를 가진 고객들을 스마트하게 매칭하여 경제적이고 편리한 공유 택시 서비스를 제공합니다.

---

## 📋 목차

- [주요 기능](#주요-기능)
- [기술 스택](#기술-스택)
- [설치 및 실행](#설치-및-실행)
- [프로젝트 구조](#프로젝트-구조)
- [API 문서](#api-문서)
- [환경 변수 설정](#환경-변수-설정)
- [테스트 계정](#테스트-계정)
- [MVP 제한사항](#mvp-제한사항)

---

## ✨ 주요 기능

### 고객
- ✅ 왕복 예약 (가는 편 + 귀가 편) 한 번에 신청
- ✅ 희망 시간 입력 (정확한 시간 X, 범위 내 조정)
- ✅ 매칭 제안 받기 (15분 내 수락/거부)
- ✅ 예약 확정 및 Mock 결제
- ✅ 예약 취소 (시간대별 수수료)

### 기사
- ✅ 배정된 Trip 확인
- ✅ 경로 및 승객 정보 표시
- ✅ Stop별 체크인 기능
- ✅ 운행 상태 업데이트

### 시스템 (자동화)
- ✅ 스마트 매칭 알고리즘 (10분마다 자동 실행)
- ✅ ETA 계산 (Kakao Maps API 연동)
- ✅ **SMS 알림** (제안 도착, 예약 확정 등) 🆕
- ✅ 이메일 알림 (상세 정보 제공)
- ✅ Proposal 자동 만료 처리

---

## 🛠 기술 스택

### 백엔드
- **Node.js 18+** + TypeScript
- **Express** - REST API 서버
- **Prisma ORM** - 타입 안전 데이터베이스 쿼리
- **SQLite** - 로컬 데이터베이스 (MVP용, PostgreSQL 전환 가능)
- **Nodemailer** - 이메일 알림
- **Axios** - Kakao Maps API 연동

### 프론트엔드
- **React 18** + TypeScript
- **Vite** - 빠른 빌드 도구
- **React Router** - 페이지 라우팅
- **TailwindCSS** - 스타일링
- **Axios** - API 통신

### 외부 API
- **Kakao Maps API** - 주소 검색, 좌표 변환, 경로 계산
- **SOLAPI (Coolsms)** - SMS 발송
- **Gmail SMTP** - 이메일 발송 (Nodemailer, 선택)

---

## 🚀 설치 및 실행

### 사전 준비

1. **Node.js 18 이상** 설치
   ```bash
   node --version  # v18.x.x 이상
   ```

2. **Kakao Developers API 키 발급**
   - https://developers.kakao.com/
   - REST API 키 발급
   - JavaScript 키 발급

3. **Gmail 앱 비밀번호 발급** (선택)
   - Gmail 계정 → 보안 → 2단계 인증 활성화
   - 앱 비밀번호 생성

---

### 1️⃣ 백엔드 설정

```bash
# 백엔드 폴더로 이동
cd backend

# 패키지 설치
npm install

# 환경 변수 설정 (.env 파일 생성)
# 아래 내용을 복사하여 backend/.env 파일 생성

DATABASE_URL="file:./dev.db"
PORT=3000
NODE_ENV=development

# Kakao Maps API (필수!)
KAKAO_REST_API_KEY=your_kakao_rest_api_key_here
KAKAO_ADMIN_KEY=your_kakao_admin_key_here

# SOLAPI SMS (필수!)
SOLAPI_API_KEY=your_solapi_api_key
SOLAPI_API_SECRET=your_solapi_api_secret
SOLAPI_FROM=01012345678

# Email (선택 - 없으면 콘솔에만 출력)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password

FRONTEND_URL=http://localhost:5173
USE_REAL_PAYMENT=false

# 데이터베이스 초기화
npx prisma generate
npx prisma migrate dev --name init

# 테스트 데이터 생성 (선택)
npx prisma db seed

# 서버 실행
npm run dev
```

서버가 실행되면: **http://localhost:3000**

---

### 2️⃣ 프론트엔드 설정

```bash
# 프론트엔드 폴더로 이동 (새 터미널)
cd frontend

# 패키지 설치
npm install

# Kakao Maps JavaScript 키 설정
# frontend/index.html 파일 수정
# 11번 줄의 YOUR_JAVASCRIPT_KEY_HERE를 실제 키로 교체

# 개발 서버 실행
npm run dev
```

프론트엔드가 실행되면: **http://localhost:5173**

---

## 📁 프로젝트 구조

```
RETURN-MVP/
├── backend/                    # Node.js 백엔드
│   ├── prisma/
│   │   ├── schema.prisma      # DB 스키마
│   │   └── seed.ts            # 테스트 데이터
│   ├── src/
│   │   ├── config/            # 환경 설정
│   │   ├── controllers/       # API 컨트롤러
│   │   ├── services/          # 비즈니스 로직
│   │   │   ├── kakao.service.ts
│   │   │   ├── matching.service.ts
│   │   │   ├── proposal.service.ts
│   │   │   ├── payment.service.ts
│   │   │   └── email.service.ts
│   │   ├── routes/            # API 라우트
│   │   └── index.ts           # 메인 서버
│   └── package.json
│
├── frontend/                   # React 프론트엔드
│   ├── src/
│   │   ├── pages/
│   │   │   ├── customer/      # 고객 페이지
│   │   │   ├── driver/        # 기사 페이지
│   │   │   └── admin/         # 관리자 페이지
│   │   ├── components/        # 공통 컴포넌트
│   │   ├── services/          # API 서비스
│   │   └── App.tsx
│   └── package.json
│
├── shared/                     # 공통 타입
│   └── types/
│
├── docs/                       # 문서
└── README.md
```

---

## 📡 API 문서

### Base URL
```
http://localhost:3000/api
```

### 주요 엔드포인트

#### 예약 요청 (Ride Request)
```bash
POST   /api/rides/requests           # 예약 요청 생성
GET    /api/rides/requests/customer/:customerId   # 고객의 요청 목록
GET    /api/rides/requests/:requestId             # 요청 상세
DELETE /api/rides/requests/:requestId             # 요청 취소
```

#### 제안 (Proposal)
```bash
GET    /api/proposals/customer/:customerId        # 고객의 제안 목록
GET    /api/proposals/:proposalId                 # 제안 상세
POST   /api/proposals/:proposalId/accept          # 제안 수락
POST   /api/proposals/:proposalId/reject          # 제안 거부
```

#### 예약 (Booking)
```bash
GET    /api/bookings/customer/:customerId         # 고객의 예약 목록
GET    /api/bookings/:bookingId                   # 예약 상세
POST   /api/bookings/:bookingId/cancel            # 예약 취소
```

#### 운행 (Trip)
```bash
GET    /api/trips/driver/:driverId                # 기사의 Trip 목록
GET    /api/trips/:tripId                         # Trip 상세
PATCH  /api/trips/:tripId/status                  # Trip 상태 업데이트
POST   /api/trips/stops/:stopId/checkin           # Stop 체크인
```

---

## 🔑 환경 변수 설정

### backend/.env
```env
# 필수
DATABASE_URL="file:./dev.db"
PORT=3000
KAKAO_REST_API_KEY=your_key_here

# 선택
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### frontend/index.html
```html
<!-- 11번 줄 -->
<script src="//dapi.kakao.com/v2/maps/sdk.js?appkey=YOUR_JAVASCRIPT_KEY_HERE"></script>
```

---

## 👥 테스트 계정

시드 데이터 생성 후 사용 가능한 계정:

### 고객
- **고객 1**: customer1@test.com (김철수)
- **고객 2**: customer2@test.com (이영희)

### 기사
- **기사**: driver@test.com (박기사)

### 관리자
- **관리자**: admin@return.com (관리자)

> **참고**: 현재 MVP에는 로그인 기능이 없습니다. 
> 프론트엔드 코드에서 `customerId` 하드코딩으로 테스트합니다.

---

## ⚠️ MVP 제한사항

이 프로젝트는 **MVP(Minimum Viable Product)** 단계입니다.

### 구현됨 ✅
- 예약 요청 및 매칭 시스템
- 제안 생성 및 수락/거부
- Mock 결제 (실제 결제 안 됨)
- 이메일 알림
- 기본 UI (고객/기사/관리자)

### 미구현 / 단순화 🚧
- **인증/로그인**: 없음 (ID 하드코딩)
- **결제**: Mock만 (실제 PG 연동 X)
- **알림**: 이메일만 (푸시 알림 X)
- **매칭 알고리즘**: 단순 규칙 기반
- **지도**: Kakao Maps 기본 연동만
- **실시간 추적**: 없음
- **관리자 대시보드**: 정적 데이터

### 프로덕션 전환 시 필요한 것
1. 인증 시스템 (JWT, OAuth)
2. 실제 결제 연동 (토스페이먼츠, 카카오페이)
3. Firebase 푸시 알림
4. SQLite → PostgreSQL 전환
5. 고급 매칭 알고리즘 (ML 기반)
6. 실시간 차량 추적
7. 보안 강화 (HTTPS, Rate Limiting)
8. 에러 모니터링 (Sentry)
9. 로그 시스템

---

## 📊 시스템 동작 방식

### 1️⃣ 고객이 예약 요청
- 출발지, 목적지, 희망 시간 입력
- 왕복 예약 (가는 편 + 귀가 편)
- Status: **REQUESTED**

### 2️⃣ 매칭 엔진 (10분마다 자동 실행)
- 비슷한 시간대 (±30분) 요청 그룹화
- 비슷한 지역 (반경 5km) 묶기
- Trip 생성 및 최적 경로 계산

### 3️⃣ Proposal 생성 및 발송
- 각 고객에게 확정 시간표 제공
- 이메일 알림 발송
- 15분 유효 시간

### 4️⃣ 고객 수락
- Proposal 수락 시 Booking 생성
- Mock 결제 처리 (2초 대기)
- 확정 이메일 발송

### 5️⃣ 운행 당일
- 기사에게 Trip 배정
- Stop별 체크인
- 운행 완료

---

## 🧪 테스트 방법

### 1. 백엔드 테스트
```bash
# Health check
curl http://localhost:3000/api/health

# 예약 요청 생성 (Postman/Thunder Client 사용)
POST http://localhost:3000/api/rides/requests
Content-Type: application/json

{
  "customerId": "고객_ID",
  "pickupAddress": "서울특별시 강남구 역삼동 123",
  "desiredPickupTime": "2026-01-15T09:00:00",
  "dropoffAddress": "서울특별시 서초구 서초동 456",
  "returnAddress": "서울특별시 서초구 서초동 456",
  "desiredReturnTime": "2026-01-15T18:00:00",
  "homeAddress": "서울특별시 강남구 역삼동 123",
  "passengerCount": 1
}
```

### 2. 프론트엔드 테스트
1. http://localhost:5173 접속
2. 고객 페이지 → 새 예약 요청
3. 폼 작성 후 제출
4. 10분 대기 (또는 백엔드에서 수동 매칭)
5. "받은 제안" 페이지에서 제안 확인
6. 수락 → 예약 내역 확인

---

## 🐛 문제 해결

### Kakao API 오류
- API 키가 올바른지 확인
- https://developers.kakao.com/ 에서 키 상태 확인
- 도메인 설정 확인 (localhost 허용)

### 이메일 발송 안 됨
- Gmail 앱 비밀번호 재확인
- 2단계 인증 활성화 확인
- 없으면 콘솔에만 출력됨 (정상)

### 매칭이 안 됨
- 10분 대기 (배치 주기)
- 비슷한 시간대(±30분)와 지역(5km) 내 요청 필요
- 테스트용으로 여러 요청 생성 필요

---

## 📝 라이선스

MIT License

---

## 👨‍💻 개발자

RETURN MVP - 2026

**함께 가는 즐거운 여정 🚖**

---

## 🙏 감사합니다!

이 프로젝트는 MVP 단계이며, 지속적으로 개선될 예정입니다.
피드백과 제안은 언제나 환영합니다! 😊
