# Claude 작업 내역

## 최종 업데이트: 2026-01-15 (오전 10:45)

---

## 프로젝트 개요
**butaxi** - 버스 + 택시 공유 이동 서비스 MVP
- 컨셉: 버스처럼 편하게, 택시처럼 빠르게
- 프론트엔드: React + Vite + TailwindCSS
- 백엔드: Express + Prisma + SQLite
- 지도: 네이버 지도 API
- 결제: 가짜 결제 (MVP)

---

## 완료된 작업

### [2026-01-15 오전 10:45 세션]

#### 1. 결제 완료 후 제안내역 안보이는 문제 수정
- **문제**: Proposal 수락 후 ACCEPTED 상태가 되면 목록에서 사라짐
- **해결**:
  - `proposal.controller.ts`: ACCEPTED 상태도 조회되도록 수정
  - `ProposalList.tsx`: ACCEPTED 상태 제안에 "결제 완료" 배지 표시
- **파일**:
  - `backend/src/controllers/proposal.controller.ts`
  - `frontend/src/pages/customer/ProposalList.tsx`

#### 2. 온보딩 슬로건 변경 + 동적 애니메이션
- **변경 내용**:
  - 슬로건: "오늘 밤, 걱정 말고 한 잔"
  - 서브 슬로건: "대리운전 없이 집까지 편하게"
  - 동적 원형 애니메이션: 택시가 원형 트랙을 돌면서 집으로 가는 컨셉
  - 펄스 효과, 맥주 아이콘 바운스 등 추가
- **파일**: `frontend/src/components/SplashScreen.tsx`

#### 3. 드라이버에게 예약 내역 표시 수정
- **문제**: Trip에 Driver가 배정되지 않아 기사 화면에서 운행이 안 보임
- **해결**:
  - `matching.service.ts`: Trip 생성 시 Driver 자동 배정
  - 기존 Trip들에 Driver 배정 (DB 업데이트)
  - Booking-Trip 연결 수정
- **파일**: `backend/src/services/matching.service.ts`

#### 4. 드라이버/관리자 페이지 우버 스타일 디자인 적용
- **변경 내용**:
  - DriverHome: 검정 헤더, 카드형 통계, 승객 아바타 표시
  - TripDetail: 컬러풀 헤더, 진행 상태 프로그레스 바
  - AdminDashboard: 검정 헤더, 그리드 KPI 카드, 시스템 상태 리스트
- **파일**:
  - `frontend/src/pages/driver/DriverHome.tsx`
  - `frontend/src/pages/driver/TripDetail.tsx`
  - `frontend/src/pages/admin/AdminDashboard.tsx`

---

### [2026-01-15 오후 세션]

#### 1. 예약 신청 백엔드 오류 수정
- **문제**: customerId가 User 테이블에 없어서 외래키 제약 위반 오류 발생
- **해결**: `ride.controller.ts` 수정 - customerId로 User가 없으면 자동 생성
- **파일**: `backend/src/controllers/ride.controller.ts`

#### 2. 프론트엔드 좌표 활용
- **문제**: 프론트엔드에서 좌표를 보내는데 백엔드에서 Kakao API로 다시 조회
- **해결**: 프론트엔드에서 좌표를 보내면 그대로 사용, 없을 때만 Kakao API 호출
- **파일**: `backend/src/controllers/ride.controller.ts`

#### 3. Proposal-Trip 관계 추가
- **문제**: 제안내역에서 차량/기사 정보가 표시되지 않음
- **해결**:
  - Prisma schema에 Proposal ↔ Trip relation 추가
  - proposal.controller에서 Trip/Vehicle/Driver include 추가
- **파일**:
  - `backend/prisma/schema.prisma`
  - `backend/src/controllers/proposal.controller.ts`

#### 4. 주소 검색 좌표 정상화
- **문제**: AddressSearch에서 Daum Postcode 검색 후 더미 좌표 생성
- **해결**: 네이버 Geocode API로 실제 좌표 획득
- **파일**: `frontend/src/components/AddressSearch.tsx`

#### 5. DB 설정 수정 (로컬 개발용)
- **문제**: schema.prisma가 PostgreSQL로 설정되어 있어 로컬 SQLite와 충돌
- **해결**: `provider = "sqlite"`로 변경
- **파일**: `backend/prisma/schema.prisma`
- **주의**: 배포 시 PostgreSQL로 다시 변경 필요

#### 6. 서비스명 변경: RETURN → butaxi
- **파일**: `frontend/src/components/SplashScreen.tsx`
- **변경 내용**:
  - 로고: "RETURN" → "butaxi"
  - 슬로건: "함께 타면, 더 가볍게" → "버스처럼 편하게, 택시처럼 빠르게"
  - 태그라인: "공유 택시 예약 서비스" → "버스 + 택시 공유 이동 서비스"

#### 7. Progress Stepper (우버 스타일 상태 타임라인)
- **파일**: `frontend/src/components/ProgressStepper.tsx` (신규)
- **기능**:
  - 6단계 상태 표시: 요청 → 배정중 → 수락 → 도착 → 운행중 → 완료
  - 애니메이션 진행 바
  - ETA/거리 카드 (가짜 값)
  - 미니 경로 애니메이션 (🚗 이동)
- **적용 위치**: `RideRequestList.tsx`, `BookingList.tsx`

#### 8. 기사 라이프사이클 버튼 개선
- **파일**: `frontend/src/pages/driver/TripDetail.tsx`
- **변경 내용**:
  - 상태별 단일 버튼: 준비완료 → 도착 → 운행시작 → 운행완료
  - 현재 상태 표시 UI 추가
  - 각 단계별 안내 메시지

#### 9. 토스트/배너 알림 시스템
- **파일**: `frontend/src/components/Toast.tsx` (신규)
- **기능**:
  - ToastProvider 컨텍스트
  - 성공/에러/정보/경고 타입 토스트
  - 상단 배너 (진행 중 상태)
  - 자동 제거 (3초)
- **적용 위치**: `App.tsx`, `TripDetail.tsx`, `ProposalList.tsx`

#### 10. 결제 플로우 (가짜 결제)
- **파일**: `frontend/src/components/PaymentModal.tsx` (신규)
- **기능**:
  - 결제 수단 선택: 카카오페이, 네이버페이, 카드
  - 요금 상세 표시: 기본요금 + 거리요금 + 시간요금
  - 결제 확인 모달
  - 결제 처리 애니메이션
  - 영수증 스타일 완료 화면
- **적용 위치**: `ProposalList.tsx` (제안 수락 시)

---

### [이전 세션]

#### 1. 제안내역 버그 수정
- customerId 하드코딩 문제 해결 (localStorage에서 가져오도록)

#### 2. 지도/현위치 기능 복원
- 네이버 지도, 현위치, 주소 검색 컴포넌트 복원

#### 3. BookingForm 주소 검색 통합
- AddressSearch 컴포넌트 사용

---

## 진행 예정 작업 (다음 세션)

### 완료된 작업 ✅
- ~~Progress Stepper (우버 스타일)~~ ✅
- ~~기사 라이프사이클 버튼~~ ✅
- ~~토스트/배너 알림~~ ✅
- ~~결제 플로우 개선~~ ✅

### 추가 개선 가능 항목
- 실시간 상태 폴링 (주기적으로 서버에서 상태 확인)
- 푸시 알림 연동 (FCM 등)
- 실제 결제 연동 (PG사 연동)
- 지도에 실시간 기사 위치 표시
- 리뷰/평점 시스템

---

## 기술 스택

### Frontend
- React 18 + TypeScript
- Vite 5.0
- TailwindCSS 3.4
- React Router 6.21
- Zustand 4.4 (상태 관리)
- Axios 1.6

### Backend
- Node.js + Express
- Prisma 5.22 + SQLite (로컬) / PostgreSQL (배포)
- SOLAPI (SMS)

### 외부 API
- 네이버 지도 API (ncpKeyId: zvr1hrw8n4)
- 네이버 Geocode API (주소 → 좌표)
- Daum Postcode (우편번호 검색)
- 카카오 API (백엔드 fallback geocoding)

---

## 주의사항

1. **서비스명**: butaxi (버스+택시 컨셉)
2. **디자인**: 우버/모던 심플 스타일 유지
3. **네이버 지도**: 현위치 + 예약신청 시 지도 표시 유지
4. **Daum Postcode**: 우편번호 주소 검색 기능 유지
5. **배포 시**: schema.prisma의 provider를 "postgresql"로 변경 필요

---

## 실행 방법

```bash
# Backend
cd backend
npm install
npx prisma generate
npx prisma db push
npm run dev

# Frontend (다른 터미널)
cd frontend
npm install
npm run dev
```

**서버 주소:**
- Backend: http://localhost:3000
- Frontend: http://localhost:5173

---

## 알려진 이슈

1. CSS @import 경고 (동작에는 문제 없음)
2. 모바일/PC 반응형 추가 점검 필요
3. Render 배포 상태 확인 필요 (PostgreSQL 설정)

---

*이 문서는 새로운 세션에서 작업을 이어받을 때 참고용으로 작성되었습니다.*
