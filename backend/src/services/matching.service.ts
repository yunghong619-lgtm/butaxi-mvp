import { PrismaClient, RideRequest, TripDirection } from '@prisma/client';
import { addMinutes, subMinutes, isWithinInterval, format } from 'date-fns';
import { config } from '../config';
import { naverService } from './naver.service';
import { smsService } from './sms.service';

const prisma = new PrismaClient();

interface MatchGroup {
  requests: RideRequest[];
  direction: TripDirection;
  timeWindow: { start: Date; end: Date };
  centerLocation: { lat: number; lng: number };
}

export class MatchingService {
  /**
   * 매칭 가능한 예약 요청들을 그룹화
   */
  async findMatchableRequests(): Promise<MatchGroup[]> {
    // REQUESTED 상태의 요청들 가져오기
    const requests = await prisma.rideRequest.findMany({
      where: {
        status: 'REQUESTED',
      },
      orderBy: {
        desiredPickupTime: 'asc',
      },
    });

    if (requests.length === 0) {
      console.log('매칭할 요청이 없습니다.');
      return [];
    }

    console.log(`📋 매칭 대상 요청: ${requests.length}개`);

    // 가는 편과 귀가 편 분리
    const outboundGroups = this.groupByTimeAndLocation(requests, 'OUTBOUND');
    const returnGroups = this.groupByTimeAndLocation(requests, 'RETURN');

    return [...outboundGroups, ...returnGroups];
  }

  /**
   * 시간대와 위치 기준으로 그룹화 (MVP 단순 버전)
   */
  private groupByTimeAndLocation(
    requests: RideRequest[],
    direction: TripDirection
  ): MatchGroup[] {
    const groups: MatchGroup[] = [];
    const processed = new Set<string>();

    for (const request of requests) {
      if (processed.has(request.id)) continue;

      const targetTime = direction === 'OUTBOUND' ? request.desiredPickupTime : request.desiredReturnTime;
      const targetLat = direction === 'OUTBOUND' ? request.pickupLat : request.returnLat;
      const targetLng = direction === 'OUTBOUND' ? request.pickupLng : request.returnLng;

      // 시간 범위 설정
      const timeWindow = direction === 'OUTBOUND' ? config.policy.pickupTimeWindow : config.policy.returnTimeWindow;
      const windowStart = subMinutes(targetTime, timeWindow);
      const windowEnd = addMinutes(targetTime, timeWindow);

      // 같은 시간대 + 같은 지역 요청 찾기
      const matchingRequests = requests.filter((r) => {
        if (processed.has(r.id)) return false;

        const rTime = direction === 'OUTBOUND' ? r.desiredPickupTime : r.desiredReturnTime;
        const rLat = direction === 'OUTBOUND' ? r.pickupLat : r.returnLat;
        const rLng = direction === 'OUTBOUND' ? r.pickupLng : r.returnLng;

        // 시간 체크 (±30분 or ±45분)
        const isTimeMatch = isWithinInterval(rTime, { start: windowStart, end: windowEnd });

        // 거리 체크 (반경 5km 이내)
        const isLocationMatch = naverService.isWithinRadius(
          { lat: targetLat, lng: targetLng },
          { lat: rLat, lng: rLng },
          5 // 5km
        );

        return isTimeMatch && isLocationMatch;
      });

      // ✅ 수정: 최소 2명 이상일 때만 그룹 생성 (합승 필수)
      if (matchingRequests.length >= 2) {
        // 최대 4명까지만
        const limitedRequests = matchingRequests.slice(0, config.policy.maxPassengersPerTrip);

        limitedRequests.forEach((r) => processed.add(r.id));

        groups.push({
          requests: limitedRequests,
          direction,
          timeWindow: { start: windowStart, end: windowEnd },
          centerLocation: { lat: targetLat, lng: targetLng },
        });

        console.log(
          `✅ 그룹 생성: ${direction} - ${limitedRequests.length}명 (시간: ${targetTime.toLocaleString('ko-KR')})`
        );
      } else if (matchingRequests.length === 1) {
        console.log(
          `⏳ 매칭 대기 중: ${direction} - ${matchingRequests[0].id} (추가 요청 필요)`
        );
      }
    }

    return groups;
  }

  /**
   * Trip 생성 및 Stop 순서 결정
   */
  async createTripsFromGroups(groups: MatchGroup[]): Promise<string[]> {
    const createdTripIds: string[] = [];

    for (const group of groups) {
      try {
        // 차량 배정 (MVP: 첫 번째 활성 차량 사용)
        let vehicle = await prisma.vehicle.findFirst({
          where: { isActive: true },
        });

        // 차량이 없으면 자동 생성
        if (!vehicle) {
          console.log('⚠️ 사용 가능한 차량이 없습니다. 자동 생성합니다...');
          
          // Driver 자동 생성
          let driver = await prisma.user.findFirst({
            where: { role: 'DRIVER' },
          });

          if (!driver) {
            driver = await prisma.user.create({
              data: {
                id: `driver-auto-${Date.now()}`,
                name: '자동 배정 기사',
                email: `driver-auto-${Date.now()}@butaxi.com`,
                phone: '010-0000-0000',
                role: 'DRIVER',
              },
            });
            console.log(`👤 Driver 자동 생성: ${driver.id}`);
          }

          // Vehicle 자동 생성
          vehicle = await prisma.vehicle.create({
            data: {
              name: `자동배정차량-${Date.now().toString().slice(-4)}`,
              licensePlate: `AUTO-${Date.now().toString().slice(-4)}`,
              capacity: 4,
              isActive: true,
            },
          });
          console.log(`🚗 Vehicle 자동 생성: ${vehicle.id} (${vehicle.licensePlate})`);
        }

        // Stop 순서 최적화 (MVP: 단순 순서)
        const stops = await this.optimizeStops(group);

        // Trip 시작/종료 시간 계산
        const startTime = stops[0].scheduledTime;
        const endTime = stops[stops.length - 1].scheduledTime;

        // Trip 생성
        const trip = await prisma.trip.create({
          data: {
            vehicleId: vehicle.id,
            direction: group.direction,
            status: 'PLANNED',
            startTime,
            endTime,
            stops: {
              create: stops,
            },
          },
        });

        createdTripIds.push(trip.id);

        console.log(`🚗 Trip 생성 완료: ${trip.id} (${group.direction}, ${group.requests.length}명)`);

        // ✅ Proposal 생성 및 SMS 발송
        await this.createProposalsForTrip(trip, group);
      } catch (error) {
        console.error('Trip 생성 실패:', error);
      }
    }

    return createdTripIds;
  }

  /**
   * Trip에 대한 Proposal 생성 및 알림 발송
   */
  private async createProposalsForTrip(trip: any, group: MatchGroup): Promise<void> {
    try {
      for (const request of group.requests) {
        // Proposal 생성
        const proposal = await prisma.proposal.create({
          data: {
            requestId: request.id,
            status: 'ACTIVE',
            // 가는 편 정보
            outboundTripId: group.direction === 'OUTBOUND' ? trip.id : null,
            pickupTime: group.direction === 'OUTBOUND' ? trip.startTime : request.desiredPickupTime,
            dropoffTime: group.direction === 'OUTBOUND' ? trip.endTime : request.desiredPickupTime,
            // 귀가 편 정보
            returnTripId: group.direction === 'RETURN' ? trip.id : null,
            returnPickupTime: group.direction === 'RETURN' ? trip.startTime : request.desiredReturnTime,
            returnDropoffTime: group.direction === 'RETURN' ? trip.endTime : request.desiredReturnTime,
            // 가격 (임시)
            estimatedPrice: 15000,
            // 유효기간 (24시간 - 테스트용)
            expiresAt: addMinutes(new Date(), 60 * 24),
          },
        });

        // RideRequest 상태 업데이트
        await prisma.rideRequest.update({
          where: { id: request.id },
          data: { status: 'PROPOSED' },
        });

        console.log(`💌 Proposal 생성: ${proposal.id} (Request: ${request.id})`);

        // SMS 알림 발송
        try {
          const user = await prisma.user.findUnique({
            where: { id: request.customerId },
          });

          if (user && user.phone) {
            const pickupTimeStr = format(
              group.direction === 'OUTBOUND' ? trip.startTime : request.desiredReturnTime,
              'MM월 dd일 HH:mm'
            );
            await smsService.sendProposalNotification(
              user.phone,
              user.name,
              pickupTimeStr,
              15000
            );
            console.log(`📱 SMS 발송 완료: ${user.phone}`);
          }
        } catch (smsError) {
          console.error('SMS 발송 실패:', smsError);
          // SMS 실패해도 계속 진행
        }
      }
    } catch (error) {
      console.error('Proposal 생성 실패:', error);
    }
  }

  /**
   * Stop 순서 최적화 (MVP: 단순 버전)
   */
  private async optimizeStops(group: MatchGroup) {
    const stops: any[] = [];
    let currentTime = group.timeWindow.start;

    // 1. 모든 픽업 먼저
    for (let i = 0; i < group.requests.length; i++) {
      const request = group.requests[i];

      const pickupLat = group.direction === 'OUTBOUND' ? request.pickupLat : request.returnLat;
      const pickupLng = group.direction === 'OUTBOUND' ? request.pickupLng : request.returnLng;
      const pickupAddress = group.direction === 'OUTBOUND' ? request.pickupAddress : request.returnAddress;

      stops.push({
        stopType: 'PICKUP',
        sequence: i + 1,
        address: pickupAddress,
        latitude: pickupLat,
        longitude: pickupLng,
        scheduledTime: currentTime,
        customerId: request.customerId,
      });

      // 다음 Stop까지 이동시간 + 버퍼
      currentTime = addMinutes(currentTime, 5 + config.policy.bufferMinutesPerStop);
    }

    // 2. 모든 하차 순서
    for (let i = 0; i < group.requests.length; i++) {
      const request = group.requests[i];

      const dropoffLat = group.direction === 'OUTBOUND' ? request.dropoffLat : request.homeLat;
      const dropoffLng = group.direction === 'OUTBOUND' ? request.dropoffLng : request.homeLng;
      const dropoffAddress = group.direction === 'OUTBOUND' ? request.dropoffAddress : request.homeAddress;

      stops.push({
        stopType: 'DROPOFF',
        sequence: group.requests.length + i + 1,
        address: dropoffAddress,
        latitude: dropoffLat,
        longitude: dropoffLng,
        scheduledTime: currentTime,
        customerId: request.customerId,
      });

      currentTime = addMinutes(currentTime, 5 + config.policy.bufferMinutesPerStop);
    }

    return stops;
  }

  /**
   * 매칭 배치 작업 실행
   */
  async runMatchingBatch(): Promise<void> {
    console.log('\n🔄 매칭 배치 시작...');

    const groups = await this.findMatchableRequests();

    if (groups.length === 0) {
      console.log('매칭 가능한 그룹이 없습니다.');
      return;
    }

    const tripIds = await this.createTripsFromGroups(groups);

    console.log(`✅ 매칭 배치 완료: ${tripIds.length}개 Trip 생성\n`);
  }
}

export const matchingService = new MatchingService();
