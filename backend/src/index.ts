import express from 'express';
import cors from 'cors';
import { config } from './config';
import routes from './routes';
import { matchingService } from './services/matching.service';
import { proposalService } from './services/proposal.service';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', routes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'RETURN MVP Backend',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/api/health',
      rides: '/api/rides/*',
      proposals: '/api/proposals/*',
      bookings: '/api/bookings/*',
      trips: '/api/trips/*',
    },
  });
});

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('서버 에러:', err);
  res.status(500).json({
    success: false,
    error: '서버 내부 오류가 발생했습니다.',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: '요청한 리소스를 찾을 수 없습니다.',
  });
});

// 서버 시작
const PORT = config.port;

app.listen(PORT, () => {
  console.log('\n');
  console.log('╔═══════════════════════════════════════════╗');
  console.log('║                                           ║');
  console.log('║      🚖  RETURN Backend Server 🚖        ║');
  console.log('║                                           ║');
  console.log('╚═══════════════════════════════════════════╝');
  console.log('');
  console.log(`✅ Server running on: http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌍 Environment: ${config.nodeEnv}`);
  console.log('');

  // 배경 작업 시작 (매칭 배치)
  startBackgroundJobs();
});

/**
 * 배경 작업 (매칭, Proposal 정리 등)
 */
function startBackgroundJobs() {
  console.log('🔄 배경 작업 시작...\n');

  // 매칭 배치 (10분마다)
  setInterval(async () => {
    try {
      await matchingService.runMatchingBatch();
    } catch (error) {
      console.error('매칭 배치 실패:', error);
    }
  }, 10 * 60 * 1000); // 10분

  // 만료된 Proposal 정리 (5분마다)
  setInterval(async () => {
    try {
      await proposalService.cleanupExpiredProposals();
    } catch (error) {
      console.error('Proposal 정리 실패:', error);
    }
  }, 5 * 60 * 1000); // 5분

  console.log('✅ 배경 작업이 시작되었습니다.');
  console.log('   - 매칭 배치: 10분마다');
  console.log('   - Proposal 정리: 5분마다\n');
}

export default app;
