# Claude 작업 내역

## 최종 업데이트: 2026-01-16 (오전 10:00)

---

## 프로젝트 개요
**butaxi** - 버스 + 택시 공유 이동 서비스 MVP
- 컨셉: 버스처럼 편하게, 택시처럼 빠르게
- 프론트엔드: React + Vite + TailwindCSS
- 백엔드: Express + Prisma + PostgreSQL (배포)
- 지도: 네이버 지도 API
- 결제: 가짜 결제 (MVP)

---

## 배포 정보
- **프론트엔드**: https://butaxi-frontend.onrender.com
- **백엔드**: https://butaxi-backend.onrender.com
- **GitHub**: https://github.com/yunghong619-lgtm/butaxi-mvp

---

## 완료된 작업

### [2026-01-16 세션] - 현재

#### 1. 스타리아 실제 이미지 적용
- **변경**: 이모지/SVG → 실제 현대 스타리아 사진 (투명 배경)
- **파일**:
  - `frontend/public/images/staria-nobg.png` (새 이미지)
  - `frontend/src/components/VehicleCard.tsx`
- **커밋**: `feat: 스타리아 배경 제거 이미지 적용`

#### 2. 온보딩 화면 개선
- **변경**:
  - 맥주 이모지 → 역동적인 SVG 맥주잔 (거품 올라오는 효과)
  - 슬로건: "설렘 태우고 출발, 행복과 취기를 모시고 귀가"
  - 색상: 설렘(amber-400), 취기(rose-400)
- **파일**: `frontend/src/components/SplashScreen.tsx`
- **커밋**: `feat: 온보딩 화면 개선`, `style: 슬로건 색상 분리`

#### 3. SMS 무한 발송 문제 해결
- **변경**: Proposal 생성 시 SMS 발송 제거 → 수락 시에만 발송
- **파일**: `backend/src/services/proposal.service.ts`

#### 4. Render 배포 설정 수정
- **문제**: `tsx: not found`, TypeScript 빌드 에러
- **해결**:
  - `tsconfig.json`: `types: ["node"]` 추가
  - `package.json`: 타입 패키지를 dependencies로 이동
  - Start Command: `npm run dev` → `npm start`
  - Build Command: `npm install && npm run build`
- **파일**:
  - `backend/tsconfig.json`
  - `backend/package.json`
  - `render.yaml`

#### 5. 프론트엔드 API URL 수정
- **문제**: 상대경로 `/api`로 요청 → 백엔드로 안 감
- **해결**: `window.location.hostname`으로 런타임에 환경 판단
- **파일**: `frontend/src/services/api.ts`
- **커밋**: `fix: 런타임에 백엔드 URL 결정`

#### 6. API 타임아웃 증가
- **문제**: Render 무료 플랜 콜드 스타트로 타임아웃
- **해결**: 15초 → 60초
- **파일**: `frontend/src/services/api.ts`

---

### [2026-01-15 오전 세션]

#### 1. 결제 완료 후 제안내역 안보이는 문제 수정
- `proposal.controller.ts`: ACCEPTED 상태도 조회
- `ProposalList.tsx`: "결제 완료" 배지 표시

#### 2. 드라이버/관리자 페이지 우버 스타일 디자인 적용
- DriverHome, TripDetail, AdminDashboard 리디자인

#### 3. 드라이버에게 예약 내역 표시 수정
- Trip 생성 시 Driver 자동 배정

---

### [이전 세션]

- Progress Stepper (우버 스타일 상태 타임라인)
- 기사 라이프사이클 버튼 개선
- 토스트/배너 알림 시스템
- 결제 플로우 (가짜 결제)
- 네이버 지도 + Daum Postcode 연동
- 서비스명 변경: RETURN → butaxi

---

## 진행 예정 작업

### UX 개선
- [ ] 로딩 스켈레톤 UI
- [ ] 예약 성공 화면 (confetti + 요약)
- [ ] 자주 가는 장소 저장

### 핵심 기능
- [ ] 기사 실시간 위치 (지도 표시)
- [ ] 예상 도착 시간 표시

### 신뢰/안전
- [ ] 기사 프로필 (사진, 평점, 운행 횟수)
- [ ] 리뷰 시스템 (별점 + 한줄평)

### 비즈니스
- [ ] 프로모션 코드
- [ ] 친구 초대 기능
- [ ] 포인트 적립

---

## 절대 변경하지 않을 것 (합의 사항)

1. **온보딩 슬로건**: "설렘 태우고 출발, 행복과 취기를 모시고 귀가"
2. **슬로건 색상**: amber-400 + rose-400
3. **맥주잔 SVG 애니메이션**: 거품 올라오는 효과
4. **스타리아 이미지**: 투명 배경 실제 사진
5. **디자인 스타일**: 우버/모던 심플 (검정 베이스)
6. **서비스명**: butaxi

---

## 기술 스택

### Frontend
- React 18 + TypeScript
- Vite 5.0
- TailwindCSS 3.4
- React Router 6.21
- Axios 1.6

### Backend
- Node.js + Express
- Prisma 5.22 + PostgreSQL (Render)
- SOLAPI (SMS)

### 외부 API
- 네이버 지도 API
- 네이버 Geocode API
- Daum Postcode
- 카카오 API (백엔드 fallback)

---

## 주의사항

1. **기존 구현물 유지**: 새 기능 추가 시 기존 코드 최소 수정
2. **커밋 분리**: 기능별로 커밋 나눠서 롤백 용이하게
3. **디자인 일관성**: 우버 스타일 유지
4. **Render 무료 플랜**: 콜드 스타트 시 최대 50초 대기

---

## 실행 방법

```bash
# Backend
cd backend
npm install
npx prisma generate
npm run dev

# Frontend (다른 터미널)
cd frontend
npm install
npm run dev
```

**로컬 서버:**
- Backend: http://localhost:3000
- Frontend: http://localhost:5173

---

## 롤백 방법

```bash
# 특정 커밋으로 롤백
git log --oneline  # 커밋 확인
git revert <commit-hash>  # 해당 커밋 되돌리기

# 또는 특정 시점으로 복원
git reset --hard <commit-hash>
git push -f origin main  # 주의: 강제 푸시
```

---

*이 문서는 새로운 세션에서 작업을 이어받을 때 참고용으로 작성되었습니다.*
