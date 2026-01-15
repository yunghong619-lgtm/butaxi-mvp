import { PrismaClient, RideRequest } from '@prisma/client';
import { addMinutes, subMinutes, isWithinInterval } from 'date-fns';
import { config } from '../config';
import { kakaoService } from './kakao.service';
import { proposalService } from './proposal.service';

const prisma = new PrismaClient();

type TripDirection = 'OUTBOUND' | 'RETURN';

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
        const isLocationMatch = kakaoService.isWithinRadius(
          { lat: targetLat, lng: targetLng },
          { lat: rLat, lng: rLng },
          5 // 5km
        );

        return isTimeMatch && isLocationMatch;
      });

      if (matchingRequests.length > 0) {
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
        const vehicle = await prisma.vehicle.findFirst({
          where: { isActive: true },
        });

        if (!vehicle) {
          console.error('사용 가능한 차량이 없습니다.');
          continue;
        }

        // 드라이버 배정 (MVP: 첫 번째 활성 드라이버 사용)
        const driver = await prisma.user.findFirst({
          where: { role: 'DRIVER' },
        });

        if (!driver) {
          console.error('사용 가능한 드라이버가 없습니다.');
          continue;
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
            driverId: driver.id,
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
      } catch (error) {
        console.error('Trip 생성 실패:', error);
      }
    }

    return createdTripIds;
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

    // Trip 생성 후 Proposal 자동 생성
    for (const tripId of tripIds) {
      try {
        await proposalService.createProposalsForTrip(tripId);
        console.log(`📨 Proposal 생성 완료: Trip ${tripId.slice(0, 8)}`);
      } catch (error) {
        console.error(`Proposal 생성 실패 (Trip ${tripId}):`, error);
      }
    }

    console.log(`✅ 매칭 배치 완료: ${tripIds.length}개 Trip 생성\n`);
  }
}

export const matchingService = new MatchingService();
