// Common Types for RETURN MVP

export interface Location {
  address: string;
  lat: number;
  lng: number;
}

export interface TimeWindow {
  start: Date;
  end: Date;
}

export interface KakaoCoordinates {
  x: number; // longitude
  y: number; // latitude
}

export interface KakaoAddress {
  address_name: string;
  x: string;
  y: string;
}

export interface KakaoRouteResponse {
  routes: Array<{
    summary: {
      distance: number; // meters
      duration: number; // seconds
    };
    sections: Array<{
      distance: number;
      duration: number;
    }>;
  }>;
}

export interface EmailNotification {
  to: string;
  subject: string;
  html: string;
}

export interface PaymentResult {
  success: boolean;
  transactionId: string;
  amount: number;
  paidAt: Date;
  message?: string;
}

export interface MatchingCriteria {
  timeWindow: number; // minutes (±30)
  maxDistance: number; // km (5)
  maxPassengers: number; // 9
}

export interface TripProposal {
  tripId: string;
  rideRequestId: string;
  confirmedPickupTime: Date;
  confirmedDropoffTime: Date;
  confirmedReturnPickupTime: Date;
  confirmedReturnDropoffTime: Date;
  estimatedPrice: number;
  estimatedDuration: number;
}

export interface MatchingResult {
  tripId: string;
  stops: Array<{
    sequence: number;
    type: 'PICKUP' | 'DROPOFF';
    location: Location;
    scheduledTime: Date;
    rideRequestId: string;
  }>;
}
