import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  database: {
    url: process.env.DATABASE_URL || 'file:./dev.db',
  },
  
  kakao: {
    restApiKey: process.env.KAKAO_REST_API_KEY || '',
    adminKey: process.env.KAKAO_ADMIN_KEY || '',
  },
  
  email: {
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || '',
  },
  
  solapi: {
    apiKey: process.env.SOLAPI_API_KEY || '',
    apiSecret: process.env.SOLAPI_API_SECRET || '',
    from: process.env.SOLAPI_FROM || '',
  },
  
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:5173',
  },
  
  payment: {
    useReal: process.env.USE_REAL_PAYMENT === 'true',
  },
  
  // MVP 정책 설정 (테스트용으로 완화)
  policy: {
    pickupTimeWindow: 60,      // ±60분 (테스트용 완화)
    returnTimeWindow: 60,      // ±60분 (테스트용 완화)
    proposalExpiryMinutes: 60 * 24, // 24시간 (테스트용)
    maxPassengersPerTrip: 4,   // 차량당 최대 4명
    bufferMinutesPerStop: 5,   // 각 Stop당 버퍼 시간
    matchingRadiusKm: 10,      // 매칭 반경 10km (테스트용 완화)
  },
};
