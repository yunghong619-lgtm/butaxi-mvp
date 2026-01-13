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
  
  // MVP 정책 설정
  policy: {
    pickupTimeWindow: 30,      // ±30분
    returnTimeWindow: 45,      // ±45분
    proposalExpiryMinutes: 15, // 15분
    maxPassengersPerTrip: 4,   // 차량당 최대 4명
    bufferMinutesPerStop: 5,   // 각 Stop당 버퍼 시간
  },
};
