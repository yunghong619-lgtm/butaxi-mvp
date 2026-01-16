import { useState, useEffect } from 'react';

export interface SavedPlace {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  icon: string;
  createdAt: number;
}

const STORAGE_KEY = 'butaxi_saved_places';

// 기본 장소 아이콘 옵션
export const PLACE_ICONS = [
  { id: 'home', icon: '🏠', label: '집' },
  { id: 'work', icon: '🏢', label: '회사' },
  { id: 'school', icon: '🏫', label: '학교' },
  { id: 'gym', icon: '🏋️', label: '헬스장' },
  { id: 'cafe', icon: '☕', label: '카페' },
  { id: 'restaurant', icon: '🍽️', label: '맛집' },
  { id: 'star', icon: '⭐', label: '즐겨찾기' },
];

export function useSavedPlaces() {
  const [places, setPlaces] = useState<SavedPlace[]>([]);

  // localStorage에서 불러오기
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setPlaces(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved places:', e);
      }
    }
  }, []);

  // localStorage에 저장
  const savePlaces = (newPlaces: SavedPlace[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newPlaces));
    setPlaces(newPlaces);
  };

  // 장소 추가
  const addPlace = (place: Omit<SavedPlace, 'id' | 'createdAt'>) => {
    // 동일한 주소가 있으면 업데이트
    const existingIndex = places.findIndex((p) => p.address === place.address);
    if (existingIndex >= 0) {
      const updated = [...places];
      updated[existingIndex] = {
        ...updated[existingIndex],
        ...place,
      };
      savePlaces(updated);
      return;
    }

    // 최대 10개까지만 저장
    const newPlace: SavedPlace = {
      ...place,
      id: `place-${Date.now()}`,
      createdAt: Date.now(),
    };

    const newPlaces = [newPlace, ...places].slice(0, 10);
    savePlaces(newPlaces);
  };

  // 장소 삭제
  const removePlace = (id: string) => {
    const newPlaces = places.filter((p) => p.id !== id);
    savePlaces(newPlaces);
  };

  // 장소 이름 변경
  const updatePlace = (id: string, updates: Partial<SavedPlace>) => {
    const newPlaces = places.map((p) =>
      p.id === id ? { ...p, ...updates } : p
    );
    savePlaces(newPlaces);
  };

  return {
    places,
    addPlace,
    removePlace,
    updatePlace,
  };
}
