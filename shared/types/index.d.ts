export interface Location {
    address: string;
    latitude: number;
    longitude: number;
}
export interface TimeWindow {
    start: Date;
    end: Date;
}
export interface RouteInfo {
    distance: number;
    duration: number;
    path: Location[];
}
export interface CustomerSchedule {
    pickupTime: Date;
    dropoffTime: Date;
    returnPickupTime: Date;
    returnDropoffTime: Date;
}
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}
export interface KakaoCoordinate {
    x: string;
    y: string;
}
export interface KakaoAddress {
    address_name: string;
    road_address?: {
        address_name: string;
    };
    x: string;
    y: string;
}
//# sourceMappingURL=index.d.ts.map