# 🕯️ artisAsset + HTML 통합 시스템

HTML 프로젝트와 artisAsset이 통합된 트레이딩 차트 분석 시스템입니다.

## 📋 시스템 개요

### 주요 구성 요소
1. **HTML 프로젝트**: 파일명 생성 도구 및 대시보드 UI
2. **artisAsset**: AI 기반 차트 분석 백엔드 시스템
3. **통합 대시보드**: 실시간 파일 관리 및 분석 현황

### 새로운 기능
- ✅ 파일명 도구에서 artisAsset으로 직접 업로드
- ✅ 웹 기반 대시보드로 분석 현황 실시간 모니터링
- ✅ FastAPI 기반 RESTful API
- ✅ WebSocket을 통한 실시간 알림
- ✅ 구글 스프레드시트 연동 로그

## 🚀 시작하기

### 1. 시스템 요구사항
- Python 3.8+
- Node.js (선택사항, 개발용)
- 웹 브라우저 (Chrome, Firefox, Edge 권장)

### 2. artisAsset 서버 실행

```bash
# artisAsset 디렉토리로 이동
cd "E:\GoogleDrive\My Drive\artisAsset"

# 필요한 패키지 설치 (최초 1회)
pip install -r requirements.txt

# 대시보드 서버 실행
python dashboard_server.py
```

서버가 성공적으로 실행되면:
- 🌐 대시보드 API: http://localhost:8003
- 📖 API 문서: http://localhost:8003/docs

### 3. HTML 대시보드 접근

웹 브라우저에서 다음 중 하나를 열어주세요:
- **시작 페이지**: `E:\GoogleDrive\My Drive\HTML\main\m0004_ArtisAsset_Dashboard.html`
- **메인 대시보드**: `E:\GoogleDrive\My Drive\HTML\dashboard\index.html`
- **파일명 도구**: `E:\GoogleDrive\My Drive\HTML\main\m0003_CaptureName.html`

## 📝 사용 방법

### 방법 1: 파일명 도구에서 직접 업로드

1. **파일명 도구 열기**
   ```
   E:\GoogleDrive\My Drive\HTML\main\m0003_CaptureName.html
   ```

2. **파일명 생성**
   - 날짜, 시간, 종목명 등 입력
   - 매매 단계, 분석 내용 선택
   - 자동으로 파일명 생성 확인

3. **파일 선택 및 업로드**
   - "폴더 선택" 버튼으로 차트 이미지들이 있는 폴더 선택
   - 업로드할 파일들을 클릭하여 선택
   - **"🚀 artisAsset에 저장"** 버튼 클릭
   - 자동으로 생성된 파일명으로 artisAsset에 저장됨

### 방법 2: 대시보드에서 관리

1. **대시보드 접속**
   ```
   E:\GoogleDrive\My Drive\HTML\dashboard\index.html
   ```

2. **파일 현황 확인**
   - 📥 입력 대기: 분석 대기 중인 파일들
   - 📊 분석 완료: 분석이 완료된 파일들

3. **분석 실행**
   - "🚀 분석 실행" 버튼 클릭
   - 실시간으로 분석 진행 상황 확인
   - WebSocket을 통한 완료 알림

4. **결과 확인**
   - 분석 이력에서 완료된 작업 확인
   - 리포트 클릭으로 상세 내용 보기
   - 통계 요약에서 전체 현황 파악

## 🔧 API 엔드포인트

### 파일 관리
- `GET /api/files/status` - 파일 현황 조회
- `POST /api/files/upload` - 파일 업로드
- `DELETE /api/files/{type}/{filename}` - 파일 삭제

### 분석 관리
- `POST /api/analysis/trigger` - 분석 실행
- `GET /api/analysis/history` - 분석 이력 조회
- `GET /api/reports/{report_id}` - 리포트 상세 조회

### 통계
- `GET /api/stats/summary` - 통계 요약

### 시스템
- `GET /api/health` - 서버 상태 확인
- `WebSocket /ws` - 실시간 알림

## 📊 대시보드 기능

### 파일 현황
- 실시간 파일 개수 표시
- 파일 목록 및 메타데이터
- 드래그 앤 드롭 업로드
- 개별 파일 삭제

### 분석 이력
- 시간순 분석 이력 표시
- 날짜 및 상태별 필터링
- 분석 결과 요약

### 통계 요약
- 오늘/주간/전체 분석 수
- 성공률 표시
- 실시간 업데이트

### 실시간 알림
- WebSocket 기반 실시간 상태 업데이트
- 분석 완료 알림
- 에러 발생 알림

## 🔗 시스템 연동

### 파일 플로우
```
[파일명 도구] → [artisAsset/charts] → [AI 분석] → [리포트 생성]
                      ↓
                 [대시보드 모니터링]
```

### 데이터 플로우
1. **업로드**: HTML → artisAsset API → charts 폴더
2. **분석**: 대시보드 → ChartAnalyzer → Vision/Gemini API
3. **결과**: JSON 데이터 + Markdown 리포트
4. **모니터링**: WebSocket → 실시간 대시보드 업데이트

## 🛠️ 개발 정보

### 기술 스택
- **백엔드**: FastAPI, Python, asyncio
- **프론트엔드**: HTML5, CSS3, Vanilla JavaScript
- **AI**: Google Vision API, Google Gemini API
- **통신**: REST API, WebSocket
- **로깅**: 구글 스프레드시트 연동

### 프로젝트 구조
```
HTML/
├── dashboard/           # 새로운 대시보드
│   ├── index.html
│   ├── css/dashboard.css
│   └── js/
│       ├── api-client.js
│       └── dashboard.js
├── main/
│   ├── m0003_CaptureName.html  # 업데이트된 파일명 도구
│   └── m0004_ArtisAsset_Dashboard.html  # 시작 페이지
└── js/CapName.js       # 업데이트된 스크립트

artisAsset/
├── dashboard_server.py  # 새로운 서버 실행 스크립트
├── src/api/
│   └── dashboard_api.py # 새로운 API 서버
└── requirements.txt     # 업데이트된 의존성
```

## 🚨 문제 해결

### 서버 연결 오류
1. artisAsset 서버가 실행 중인지 확인
2. 포트 8000이 사용 중인지 확인
3. 방화벽 설정 확인

### 파일 업로드 실패
1. 파일 형식 확인 (PNG, JPG, JPEG, BMP, TIFF)
2. 파일 크기 확인 (10MB 이하)
3. artisAsset/data/input/charts 폴더 권한 확인

### 분석 실패
1. Google API 키 설정 확인
2. .env 파일 설정 확인
3. 인터넷 연결 상태 확인

## 📈 향후 계획

### 단기 개선사항
- [ ] 분석 진행률 표시
- [ ] 배치 분석 기능
- [ ] 에러 로그 상세화
- [ ] 모바일 반응형 개선

### 중기 개선사항
- [ ] 사용자 인증 시스템
- [ ] 분석 결과 시각화
- [ ] 자동 백업 기능
- [ ] 성능 모니터링

### 장기 개선사항
- [ ] 클라우드 배포
- [ ] 다중 사용자 지원
- [ ] 고급 분석 알고리즘
- [ ] 외부 시스템 연동

## 📞 지원

문제가 발생하거나 개선 사항이 있으시면 GitHub Issues를 통해 문의해주세요.

---

**⚠️ 주의사항**: 이 시스템은 교육 및 연구 목적으로 제작되었습니다. 실제 트레이딩에 사용하기 전에 충분한 검증이 필요합니다.

