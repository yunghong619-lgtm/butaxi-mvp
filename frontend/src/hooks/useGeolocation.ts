import { useState, useEffect, useCallback } from 'react';

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  error: string | null;
  loading: boolean;
}

interface UseGeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  watch?: boolean; // 실시간 추적 여부
}

export function useGeolocation(options: UseGeolocationOptions = {}) {
  const {
    enableHighAccuracy = true,
    timeout = 5000,
    maximumAge = 0,
    watch = false,
  } = options;

  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    error: null,
    loading: true,
  });

  const onSuccess = useCallback((position: GeolocationPosition) => {
    setState({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      error: null,
      loading: false,
    });
  }, []);

  const onError = useCallback((error: GeolocationPositionError) => {
    let errorMessage = '위치 정보를 가져올 수 없습니다.';

    switch (error.code) {
      case error.PERMISSION_DENIED:
        errorMessage = '위치 권한이 거부되었습니다.';
        break;
      case error.POSITION_UNAVAILABLE:
        errorMessage = '위치 정보를 사용할 수 없습니다.';
        break;
      case error.TIMEOUT:
        errorMessage = '위치 정보 요청 시간이 초과되었습니다.';
        break;
    }

    setState({
      latitude: null,
      longitude: null,
      accuracy: null,
      error: errorMessage,
      loading: false,
    });
  }, []);

  // 현재 위치 가져오기 (수동)
  const getCurrentPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: '브라우저가 위치 정보를 지원하지 않습니다.',
        loading: false,
      }));
      return;
    }

    setState(prev => ({ ...prev, loading: true }));

    navigator.geolocation.getCurrentPosition(onSuccess, onError, {
      enableHighAccuracy,
      timeout,
      maximumAge,
    });
  }, [enableHighAccuracy, timeout, maximumAge, onSuccess, onError]);

  useEffect(() => {
    if (!navigator.geolocation) {
      setState({
        latitude: null,
        longitude: null,
        accuracy: null,
        error: '브라우저가 위치 정보를 지원하지 않습니다.',
        loading: false,
      });
      return;
    }

    let watchId: number | undefined;

    if (watch) {
      // 실시간 위치 추적
      watchId = navigator.geolocation.watchPosition(onSuccess, onError, {
        enableHighAccuracy,
        timeout,
        maximumAge,
      });
    } else {
      // 한 번만 가져오기
      getCurrentPosition();
    }

    return () => {
      if (watchId !== undefined) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watch, enableHighAccuracy, timeout, maximumAge, onSuccess, onError, getCurrentPosition]);

  return {
    ...state,
    getCurrentPosition,
  };
}
