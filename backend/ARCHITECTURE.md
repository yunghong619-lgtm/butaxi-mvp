# 🏗️ BUTAXI 백엔드 아키텍처 문서

> 마지막 업데이트: 2026-01-15  
> 클로드가 헷갈리지 않도록 정리한 시스템 구조 문서

---

## 📋 목차
- [시스템 흐름도](#시스템-흐름도)
- [Proposal 생성 경로](#proposal-생성-경로)
- [주요 서비스 역할](#주요-서비스-역할)
- [자동 실행 작업](#자동-실행-작업)

---

## 🔄 시스템 흐름도

### 예약 요청 → 제안 → 확정 플로우

```
1. 고객이 예약 요청
   └─> POST /api/rides/requests
       └─> ride.controller.ts: createRequest()
           ├─> RideRequest 생성 (DB 저장)
           └─> matchingService.runMatchingBatch() 즉시 실행 ✅

2. 매칭 서비스 실행
   └─> matching.service.ts: runMatchingBatch()
       ├─> findMatchableRequests() - REQUESTED 상태 찾기
       ├─> groupByTimeAndLocation() - 시간/위치 기준 그룹화
       └─> createTripsFromGroups()
           ├─> Trip 생성
           ├─> Stop 생성 (픽업/하차 순서)
           └─> createProposalsForTrip() ✅
               ├─> Proposal 생성 (request.id 사용)
               ├─> RideRequest 상태 → PROPOSED
               └─> SMS 발송

3. 고객이 제안 확인
   └─> GET /api/proposals/customer/:customerId
       └─> proposal.controller.ts: getCustomerProposals()
           └─> ACTIVE 상태 Proposal 조회 (Trip/Vehicle/Driver 정보 포함)

4. 고객이 제안 수락
   └─> POST /api/proposals/:proposalId/accept
       └─> proposal.service.ts: acceptProposal()
           ├─> Booking 생성
           ├─> 결제 처리 (Mock)
           ├─> RideRequest 상태 → CONFIRMED
           └─> SMS 확정 알림 발송
```

---

## 🎯 Proposal 생성 경로

### ✅ 실제 사용되는 경로 (매칭 서비스)

**파일:** `backend/src/services/matching.service.ts`

```typescript
// 201-259번 라인
private async createProposalsForTrip(trip: any, group: MatchGroup): Promise<void> {
  for (const request of group.requests) {
    // ✅ 올바른 방식: RideRequest의 ID 사용
    const proposal = await prisma.proposal.create({
      data: {
        requestId: request.id,  // ← RideRequest ID (올바름!)
        status: 'ACTIVE',
        outboundTripId: group.direction === 'OUTBOUND' ? trip.id : null,
        returnTripId: group.direction === 'RETURN' ? trip.id : null,
        // ... 나머지 필드
      },
    });
    
    // RideRequest 상태 업데이트
    await prisma.rideRequest.update({
      where: { id: request.id },
      data: { status: 'PROPOSED' },
    });
    
    // SMS 발송
    // ...
  }
}
```

### ❌ 사용되지 않는 오래된 코드 (제거됨)

**파일:** `backend/src/services/proposal.service.ts`

- `createProposalsForTrip()` - 제거됨 ✅
- `generateProposal()` - 제거됨 ✅

**현재 proposal.service.ts의 역할:**
- ✅ `acceptProposal()` - 제안 수락 처리
- ✅ `cleanupExpiredProposals()` - 만료된 제안 정리 (5분마다 자동 실행)

---

## 🔧 주요 서비스 역할

### 1. **MatchingService** (matching.service.ts)
**책임:** 예약 요청 매칭 및 Trip/Proposal 생성

**주요 메서드:**
- `runMatchingBatch()` - 매칭 배치 작업 실행
- `findMatchableRequests()` - 매칭 가능한 요청 찾기
- `groupByTimeAndLocation()` - 시간/위치 기준 그룹화
- `createTripsFromGroups()` - Trip 생성
- `createProposalsForTrip()` - **Proposal 생성** ⭐
- `optimizeStops()` - Stop 순서 최적화

**실행 시점:**
1. 예약 요청 생성 시 즉시 실행 (ride.controller.ts 112번 라인)
2. 10분마다 자동 실행 (index.ts 78-84번 라인)

---

### 2. **ProposalService** (proposal.service.ts)
**책임:** Proposal 관리 (수락, 정리)

**주요 메서드:**
- `acceptProposal()` - 제안 수락 및 Booking 생성
- `cleanupExpiredProposals()` - 만료된 제안 정리

**실행 시점:**
- `acceptProposal()`: 고객이 제안 수락 시
- `cleanupExpiredProposals()`: 5분마다 자동 실행

---

### 3. **RideController** (ride.controller.ts)
**책임:** 예약 요청 API 엔드포인트

**주요 메서드:**
- `createRequest()` - 예약 요청 생성 + 즉시 매칭 실행
- `getCustomerRequests()` - 고객의 요청 목록 조회
- `getRequestDetail()` - 요청 상세 조회
- `cancelRequest()` - 요청 취소

---

### 4. **ProposalController** (proposal.controller.ts)
**책임:** Proposal API 엔드포인트

**주요 메서드:**
- `getCustomerProposals()` - 고객의 제안 목록 조회 (Trip/Vehicle/Driver 포함)
- `getProposalDetail()` - 제안 상세 조회
- `acceptProposal()` - 제안 수락
- `rejectProposal()` - 제안 거부

---

## ⏰ 자동 실행 작업

**파일:** `backend/src/index.ts` (74-98번 라인)

### 1. 매칭 배치 (10분마다)
```typescript
setInterval(async () => {
  await matchingService.runMatchingBatch();
}, 10 * 60 * 1000);
```

### 2. 만료된 Proposal 정리 (5분마다)
```typescript
setInterval(async () => {
  await proposalService.cleanupExpiredProposals();
}, 5 * 60 * 1000);
```

---

## 📊 데이터베이스 관계

```
User (고객/기사)
  ├─> RideRequest (예약 요청)
  │     ├─> Proposal (제안)
  │     │     ├─> outboundTrip (가는 편 Trip)
  │     │     └─> returnTrip (귀가 편 Trip)
  │     └─> Booking (확정 예약)
  │           ├─> outboundTrip
  │           └─> returnTrip
  │
  └─> Vehicle (차량)
        └─> Trip (운행)
              └─> Stop (정거장)
                    └─> customerId (고객 참조)
```

---

## 🔍 디버깅 가이드

### Proposal이 보이지 않을 때 체크리스트

1. **RideRequest 생성 확인**
   ```sql
   SELECT * FROM ride_requests WHERE customerId = 'customer-xxx';
   ```

2. **Proposal 생성 확인**
   ```sql
   SELECT * FROM proposals WHERE requestId IN (
     SELECT id FROM ride_requests WHERE customerId = 'customer-xxx'
   );
   ```

3. **Trip/Vehicle/Driver 연결 확인**
   ```sql
   SELECT p.*, t.vehicleId, t.driverId 
   FROM proposals p
   LEFT JOIN trips t ON p.outboundTripId = t.id
   WHERE p.requestId = 'request-xxx';
   ```

4. **브라우저 localStorage 확인**
   ```javascript
   console.log('Customer ID:', localStorage.getItem('butaxi_customer_id'));
   ```

5. **API 직접 호출 테스트**
   ```bash
   curl http://localhost:3000/api/proposals/customer/customer-xxx
   ```

---

## 🚀 최근 변경사항 (2026-01-15)

### 1. Proposal API 개선
- ✅ Trip/Vehicle/Driver 정보 포함하도록 include 추가
- ✅ 디버깅 로그 추가 (customerId, 조회 건수)
- ✅ validProposals 필터링 적용

### 2. 코드 정리
- ❌ proposal.service.ts의 미사용 함수 제거
- ✅ 주석 추가로 역할 명확화
- ✅ 실제 사용 경로 문서화

### 3. 프론트엔드 개선
- ✅ ProposalList에 드라이버/차량 정보 UI 추가 (우버 스타일)
- ✅ DateTimePicker 컴포넌트 추가 (모바일 친화적)
- ✅ 전화 걸기 버튼 추가

---

## 📝 참고 문서

- [SMS 연동 가이드](./docs/SMS_SETUP.md)
- [설정 가이드](./docs/SETUP_GUIDE.md)
- [배포 가이드](../DEPLOYMENT.md)

---

**이 문서는 클로드가 시스템을 정확히 이해하고 일관된 수정을 할 수 있도록 작성되었습니다.**
