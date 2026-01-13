# 🔧 상세 설치 가이드

## 목차
1. [사전 준비](#사전-준비)
2. [Kakao API 키 발급](#kakao-api-키-발급)
3. [Gmail 설정](#gmail-설정)
4. [백엔드 설정](#백엔드-설정)
5. [프론트엔드 설정](#프론트엔드-설정)
6. [문제 해결](#문제-해결)

---

## 사전 준비

### 1. Node.js 설치

**Windows:**
```powershell
# https://nodejs.org/ 에서 LTS 버전 다운로드
node --version  # 확인
npm --version
```

**Mac (Homebrew):**
```bash
brew install node@18
node --version
```

### 2. Git 설치 (선택)
```bash
git --version
```

---

## Kakao API 키 발급

### 1. Kakao Developers 계정 생성
1. https://developers.kakao.com/ 접속
2. 카카오 계정으로 로그인
3. "시작하기" 클릭

### 2. 애플리케이션 생성
1. **내 애플리케이션** → **애플리케이션 추가하기**
2. 앱 이름: `RETURN MVP`
3. 사업자명: 개인 (본인 이름)
4. 생성 완료

### 3. API 키 확인
1. 생성한 앱 클릭
2. **앱 키** 탭에서:
   - ✅ **REST API 키** 복사 (백엔드용)
   - ✅ **JavaScript 키** 복사 (프론트엔드용)

### 4. 플랫폼 설정
1. **플랫폼** 탭 → **Web 플랫폼 등록**
2. 사이트 도메인: `http://localhost:5173`
3. 저장

### 5. 활성화 설정
1. **카카오 로그인** 탭 → 활성화 설정 OFF (로그인 안 쓸 경우)
2. **Kakao Maps** 사용 자동 승인

---

## Gmail 설정

### 1. Google 계정 2단계 인증 활성화
1. https://myaccount.google.com/security 접속
2. **2단계 인증** → 활성화

### 2. 앱 비밀번호 생성
1. https://myaccount.google.com/apppasswords
2. **앱 선택**: 메일
3. **기기 선택**: Windows 컴퓨터 (또는 기타)
4. **생성** 클릭
5. 16자리 비밀번호 복사 (공백 제거)

---

## 백엔드 설정

### 1. 패키지 설치
```bash
cd backend
npm install
```

### 2. 환경 변수 파일 생성

**backend/.env 파일 생성:**
```env
# Database
DATABASE_URL="file:./dev.db"

# Server
PORT=3000
NODE_ENV=development

# Kakao Maps API
KAKAO_REST_API_KEY=여기에_REST_API_키_입력
KAKAO_ADMIN_KEY=여기에_REST_API_키_입력

# Email (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=여기에_앱_비밀번호_입력

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Payment
USE_REAL_PAYMENT=false
```

### 3. 데이터베이스 초기화
```bash
# Prisma Client 생성
npx prisma generate

# DB 마이그레이션
npx prisma migrate dev --name init

# 테스트 데이터 생성
npm run db:seed
```

### 4. 서버 실행
```bash
npm run dev
```

**성공 시 출력:**
```
╔═══════════════════════════════════════════╗
║      🚖  RETURN Backend Server 🚖        ║
╚═══════════════════════════════════════════╝

✅ Server running on: http://localhost:3000
📊 Health check: http://localhost:3000/api/health
```

### 5. 테스트
브라우저에서: http://localhost:3000/api/health

```json
{
  "success": true,
  "message": "RETURN Backend is running!",
  "timestamp": "2026-01-13T..."
}
```

---

## 프론트엔드 설정

### 1. 패키지 설치
```bash
cd frontend
npm install
```

### 2. Kakao JavaScript 키 설정

**frontend/index.html 파일 수정:**
```html
<!-- 11번 줄 -->
<script type="text/javascript" 
  src="//dapi.kakao.com/v2/maps/sdk.js?appkey=여기에_JavaScript_키_입력&libraries=services">
</script>
```

### 3. 개발 서버 실행
```bash
npm run dev
```

**성공 시 출력:**
```
  VITE v5.0.10  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h to show help
```

### 4. 브라우저 접속
http://localhost:5173

---

## 문제 해결

### 문제 1: `npm install` 실패
**원인**: Node.js 버전 낮음

**해결:**
```bash
node --version  # v18 이상이어야 함
# 낮으면 https://nodejs.org/ 에서 재설치
```

---

### 문제 2: Prisma 오류
**오류:**
```
Environment variable not found: DATABASE_URL
```

**해결:**
```bash
# backend/.env 파일이 있는지 확인
cd backend
ls -la .env  # Mac/Linux
dir .env     # Windows

# 없으면 다시 생성
```

---

### 문제 3: Kakao API 오류
**오류:**
```
401 Unauthorized - Invalid API key
```

**해결:**
1. API 키 재확인
2. 키에 공백이나 특수문자 없는지 확인
3. https://developers.kakao.com/ 에서 키 상태 확인
4. 도메인 설정 확인 (`http://localhost:5173`)

---

### 문제 4: 이메일 발송 안 됨
**증상**: 이메일이 안 옴

**확인 사항:**
1. Gmail 2단계 인증 활성화 확인
2. 앱 비밀번호 재확인 (16자리, 공백 제거)
3. `EMAIL_USER`가 올바른 Gmail 주소인지 확인

**참고**: 이메일 설정 없으면 콘솔에만 출력됩니다 (정상).

---

### 문제 5: 포트 충돌
**오류:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**해결:**

**Windows:**
```powershell
# 포트 사용 중인 프로세스 찾기
netstat -ano | findstr :3000

# PID로 종료 (예: 12345)
taskkill /PID 12345 /F
```

**Mac/Linux:**
```bash
# 포트 사용 중인 프로세스 찾기
lsof -i :3000

# 종료
kill -9 PID번호
```

---

### 문제 6: CORS 오류
**오류:**
```
Access to XMLHttpRequest has been blocked by CORS policy
```

**해결:**
1. 백엔드 서버가 실행 중인지 확인
2. `backend/src/index.ts` 에서 CORS 설정 확인
3. 포트 번호 확인 (백엔드: 3000, 프론트: 5173)

---

## 완료 체크리스트

설치가 완료되었는지 확인하세요:

- [ ] Node.js 18+ 설치됨
- [ ] Kakao REST API 키 발급
- [ ] Kakao JavaScript 키 발급
- [ ] Gmail 앱 비밀번호 발급 (선택)
- [ ] backend/.env 파일 생성
- [ ] `npm install` 성공 (백엔드/프론트엔드)
- [ ] Prisma 마이그레이션 완료
- [ ] 시드 데이터 생성
- [ ] 백엔드 서버 실행 성공 (http://localhost:3000)
- [ ] 프론트엔드 실행 성공 (http://localhost:5173)
- [ ] Health check API 응답 확인

---

## 다음 단계

모든 설치가 완료되었다면:

1. 📖 [README.md](../README.md) 읽기
2. 🧪 테스트 계정으로 예약 테스트
3. 📊 관리자 대시보드 확인
4. 🚗 기사 페이지 테스트

---

**문제가 해결되지 않으면 이슈를 남겨주세요!** 😊
