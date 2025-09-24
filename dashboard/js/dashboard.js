/**
 * artisAsset Dashboard 메인 스크립트
 * 대시보드의 모든 UI 인터랙션과 데이터 관리를 담당
 */

class Dashboard {
    constructor() {
        this.api = new ArtisAssetAPI();
        this.refreshInterval = null;
        this.websocket = null;
        this.isOnline = false;
        
        this.init();
    }

    /**
     * 대시보드 초기화
     */
    async init() {
        console.log('🚀 artisAsset Dashboard 초기화 중...');
        
        // 이벤트 리스너 설정
        this.setupEventListeners();
        
        // 초기 데이터 로드
        await this.loadInitialData();
        
        // 자동 새로고침 설정
        this.setupAutoRefresh();
        
        // WebSocket 연결 시도
        this.setupWebSocket();
        
        console.log('✅ Dashboard 초기화 완료');
    }

    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners() {
        // 새로고침 버튼
        document.getElementById('refreshBtn').addEventListener('click', () => {
            this.refreshData();
        });

        // 분석 실행 버튼
        document.getElementById('analyzeBtn').addEventListener('click', () => {
            this.triggerAnalysis();
        });

        // 자동 새로고침 설정
        document.getElementById('autoRefresh').addEventListener('change', (e) => {
            const value = e.target.value;
            if (value === 'custom') {
                document.getElementById('customRefreshDiv').style.display = 'inline-block';
            } else {
                document.getElementById('customRefreshDiv').style.display = 'none';
                this.setupAutoRefresh(parseInt(value));
            }
        });

        // 입력 필드 자동 패딩 처리
        this.setupTimeInputFormatting();

        // 사용자 지정 갱신 적용
        document.getElementById('applyCustomRefresh').addEventListener('click', () => {
            const hours = parseInt(document.getElementById('customRefreshHours').value) || 0;
            const minutes = parseInt(document.getElementById('customRefreshMinutes').value) || 0;
            const seconds = parseInt(document.getElementById('customRefreshSeconds').value) || 0;
            
            const totalSeconds = hours * 3600 + minutes * 60 + seconds;
            
            if (totalSeconds < 5) {
                this.showError('최소 5초 이상 설정해주세요.');
                return;
            }
            
            if (totalSeconds > 86400) { // 24시간
                this.showError('최대 24시간까지 설정 가능합니다.');
                return;
            }
            
            this.setupAutoRefresh(totalSeconds);
            
            // 사용자 친화적인 시간 표시 (두 자리 수 형태)
            const paddedHours = hours.toString().padStart(2, '0');
            const paddedMinutes = minutes.toString().padStart(2, '0');
            const paddedSeconds = seconds.toString().padStart(2, '0');
            
            const timeDisplay = `${paddedHours}:${paddedMinutes}:${paddedSeconds}`;
            
            // 한글 설명도 함께 표시
            let koreanDisplay = '';
            if (hours > 0) koreanDisplay += `${hours}시간 `;
            if (minutes > 0) koreanDisplay += `${minutes}분 `;
            if (seconds > 0) koreanDisplay += `${seconds}초`;
            
            this.showSuccess(`자동 갱신이 ${timeDisplay} (${koreanDisplay.trim()})로 설정되었습니다.`);
        });

        // Enter 키로도 적용 가능 (모든 시간 입력 필드에서)
        ['customRefreshHours', 'customRefreshMinutes', 'customRefreshSeconds'].forEach(id => {
            document.getElementById(id).addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    document.getElementById('applyCustomRefresh').click();
                }
            });
        });

        // 업로드 관련 이벤트
        this.setupUploadEvents();

        // 모달 관련 이벤트
        this.setupModalEvents();

        // 필터 이벤트
        this.setupFilterEvents();
    }

    /**
     * 업로드 관련 이벤트 설정
     */
    setupUploadEvents() {
        const uploadBtn = document.getElementById('uploadBtn');
        const uploadModal = document.getElementById('uploadModal');
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');

        uploadBtn.addEventListener('click', () => {
            uploadModal.classList.add('active');
        });

        // 드래그 앤 드롭
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            const files = e.dataTransfer.files;
            this.handleFileUpload(files);
        });

        // 파일 선택
        fileInput.addEventListener('change', (e) => {
            this.handleFileUpload(e.target.files);
        });
    }

    /**
     * 모달 관련 이벤트 설정
     */
    setupModalEvents() {
        // 리포트 모달
        document.getElementById('closeModal').addEventListener('click', () => {
            document.getElementById('reportModal').classList.remove('active');
        });

        // 업로드 모달
        document.getElementById('closeUploadModal').addEventListener('click', () => {
            document.getElementById('uploadModal').classList.remove('active');
        });

        // 모달 외부 클릭 시 닫기
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.classList.remove('active');
            }
        });
    }

    /**
     * 필터 이벤트 설정
     */
    setupFilterEvents() {
        const dateFilter = document.getElementById('dateFilter');
        const statusFilter = document.getElementById('statusFilter');
        const clearFilters = document.getElementById('clearFilters');

        [dateFilter, statusFilter].forEach(filter => {
            filter.addEventListener('change', () => {
                this.loadAnalysisHistory();
            });
        });

        clearFilters.addEventListener('click', () => {
            dateFilter.value = '';
            statusFilter.value = '';
            this.loadAnalysisHistory();
        });
    }

    /**
     * 초기 데이터 로드
     */
    async loadInitialData() {
        try {
            // 서버 상태 확인
            await this.checkServerStatus();
            
            if (this.isOnline) {
                // 병렬로 데이터 로드
                await Promise.all([
                    this.loadFilesStatus(),
                    this.loadAnalysisHistory(),
                    this.loadStats(),
                    this.loadRecentReports()
                ]);
            } else {
                this.showOfflineMessage();
            }
        } catch (error) {
            console.error('초기 데이터 로드 실패:', error);
            this.showError('데이터를 불러오는 중 오류가 발생했습니다.');
        }
    }

    /**
     * 서버 상태 확인
     */
    async checkServerStatus() {
        try {
            const health = await this.api.checkHealth();
            this.isOnline = health.status === 'online' || health.status === 'ok';
            
            if (this.isOnline) {
                this.hideOfflineMessage();
            }
        } catch (error) {
            this.isOnline = false;
        }
    }

    /**
     * 파일 현황 로드
     */
    async loadFilesStatus() {
        try {
            const data = await this.api.getFilesStatus();
            this.updateFilesStatus(data);
        } catch (error) {
            console.error('파일 현황 로드 실패:', error);
            this.showError('파일 현황을 불러올 수 없습니다.');
        }
    }

    /**
     * 분석 이력 로드
     */
    async loadAnalysisHistory() {
        try {
            const filters = {
                date: document.getElementById('dateFilter').value,
                status: document.getElementById('statusFilter').value
            };
            
            const data = await this.api.getAnalysisHistory(filters);
            this.updateAnalysisHistory(data);
        } catch (error) {
            console.error('분석 이력 로드 실패:', error);
            this.showError('분석 이력을 불러올 수 없습니다.');
        }
    }

    /**
     * 통계 데이터 로드
     */
    async loadStats() {
        try {
            const data = await this.api.getStatsSummary();
            this.updateStats(data);
        } catch (error) {
            console.error('통계 데이터 로드 실패:', error);
            // 통계는 실패해도 계속 진행
        }
    }

    /**
     * 최근 리포트 로드
     */
    async loadRecentReports() {
        try {
            const data = await this.api.getAnalysisHistory({ limit: 5 });
            this.updateRecentReports(data);
        } catch (error) {
            console.error('최근 리포트 로드 실패:', error);
        }
    }

    /**
     * 파일 현황 UI 업데이트
     */
    updateFilesStatus(data) {
        // 입력 파일
        document.getElementById('inputCount').textContent = data.input_count || 0;
        const inputList = document.getElementById('inputFilesList');
        
        if (data.input_files && data.input_files.length > 0) {
            inputList.innerHTML = `
                <div class="file-selection-controls">
                    <label class="select-all-label">
                        <input type="checkbox" id="selectAllFiles" onchange="dashboard.toggleSelectAll()">
                        <span>전체 선택</span>
                    </label>
                    <span class="selected-count" id="selectedCount">0개 선택됨</span>
                </div>
            ` + data.input_files.map((file, index) => `
                <div class="file-item">
                    <div class="file-checkbox">
                        <input type="checkbox" class="file-select-checkbox" data-filename="${file.name || file}" onchange="dashboard.updateSelectedCount()">
                    </div>
                    <div class="file-info">
                        <div class="file-name">📄 ${file.name || file}</div>
                        <div class="file-meta">${file.size ? formatFileSize(file.size) : ''} ${file.modified ? '• ' + formatRelativeTime(file.modified) : ''}</div>
                    </div>
                    <div class="file-actions">
                        <button class="btn btn-outline" onclick="dashboard.deleteFile('${file.name || file}', 'input')">🗑️</button>
                    </div>
                </div>
            `).join('');
        } else {
            inputList.innerHTML = '<div class="loading">분석 대기 중인 파일이 없습니다.</div>';
        }

        // 출력 파일
        document.getElementById('outputCount').textContent = data.output_count || 0;
        const outputList = document.getElementById('outputFilesList');
        
        if (data.output_files && data.output_files.length > 0) {
            outputList.innerHTML = data.output_files.map(file => `
                <div class="file-item">
                    <div class="file-info">
                        <div class="file-name">📊 ${file.name || file}</div>
                        <div class="file-meta">${file.size ? formatFileSize(file.size) : ''} ${file.modified ? '• ' + formatRelativeTime(file.modified) : ''}</div>
                    </div>
                    <div class="file-actions">
                        <button class="btn btn-outline" onclick="dashboard.viewReport('${file.name || file}')">👁️</button>
                        <button class="btn btn-outline" onclick="dashboard.viewImage('${file.name || file}')">🖼️</button>
                        <button class="btn btn-outline" onclick="dashboard.reanalyzeFile('${file.name || file}')">🔄</button>
                        <button class="btn btn-outline" onclick="dashboard.deleteFile('${file.name || file}', 'output')">🗑️</button>
                    </div>
                </div>
            `).join('');
        } else {
            outputList.innerHTML = '<div class="loading">분석 결과가 없습니다.</div>';
        }
    }

    /**
     * 분석 이력 UI 업데이트
     */
    updateAnalysisHistory(data) {
        const timeline = document.getElementById('analysisTimeline');
        
        if (data && data.length > 0) {
            timeline.innerHTML = data.map(item => `
                <div class="timeline-item">
                    <div class="timeline-dot ${item.status || 'completed'}"></div>
                    <div class="timeline-content">
                        <div class="timeline-title">${item.title || item.filename || '분석 작업'}</div>
                        <div class="timeline-meta">${formatRelativeTime(item.date || item.created_at)}</div>
                        <div class="timeline-description">${item.description || item.summary || '차트 분석 완료'}</div>
                    </div>
                </div>
            `).join('');
        } else {
            timeline.innerHTML = '<div class="loading">분석 이력이 없습니다.</div>';
        }
    }

    /**
     * 통계 UI 업데이트
     */
    updateStats(data) {
        if (data) {
            document.getElementById('todayAnalysis').textContent = data.today || 0;
            document.getElementById('weekAnalysis').textContent = data.week || 0;
            document.getElementById('totalAnalysis').textContent = data.total || 0;
            document.getElementById('successRate').textContent = data.success_rate ? `${data.success_rate}%` : '-%';
        }
    }

    /**
     * 최근 리포트 UI 업데이트
     */
    updateRecentReports(data) {
        const container = document.getElementById('recentReports');
        
        if (data && data.length > 0) {
            container.innerHTML = data.slice(0, 5).map(report => `
                <div class="report-item" onclick="dashboard.viewReport('${report.id || report.filename}')">
                    <div class="report-info">
                        <h4>${report.title || report.filename || 'Untitled Report'}</h4>
                        <p>${formatRelativeTime(report.date || report.created_at)}</p>
                    </div>
                    <div class="report-status ${report.status || 'completed'}">${report.status || 'completed'}</div>
                </div>
            `).join('');
        } else {
            container.innerHTML = '<div class="loading">최근 리포트가 없습니다.</div>';
        }
    }

    /**
     * 데이터 새로고침
     */
    async refreshData() {
        const refreshBtn = document.getElementById('refreshBtn');
        refreshBtn.disabled = true;
        refreshBtn.innerHTML = '🔄 새로고침 중...';
        
        try {
            await this.loadInitialData();
            this.showSuccess('데이터를 성공적으로 새로고침했습니다.');
        } catch (error) {
            this.showError('데이터 새로고침에 실패했습니다.');
        } finally {
            refreshBtn.disabled = false;
            refreshBtn.innerHTML = '🔄 새로고침';
        }
    }

    /**
     * 분석 실행 트리거
     */
    async triggerAnalysis() {
        const analyzeBtn = document.getElementById('analyzeBtn');
        
        // 선택된 파일들 확인
        const selectedFiles = this.getSelectedFiles();
        
        if (selectedFiles.length === 0) {
            this.showError('분석할 파일을 선택해주세요. 체크박스를 클릭하여 파일을 선택하세요.');
            return;
        }
        
        analyzeBtn.disabled = true;
        analyzeBtn.innerHTML = '🔄 분석 중...';
        
        try {
            const result = await this.api.triggerAnalysis(selectedFiles);
            
            // 상태 표시 영역에 성공 메시지 표시
            this.showAnalysisStatus(
                'success',
                '🎉 분석 시작!',
                `${selectedFiles.length}개 선택된 파일의 분석이 시작되었습니다. 완료되면 알림을 받으실 수 있습니다.`,
                10000  // 10초간 표시
            );
            
            // 5초 후 데이터 새로고침
            setTimeout(() => {
                this.refreshData();
            }, 5000);
        } catch (error) {
            this.showError('분석 실행에 실패했습니다: ' + getErrorMessage(error));
        } finally {
            analyzeBtn.disabled = false;
            analyzeBtn.innerHTML = '🚀 분석 실행';
        }
    }

    /**
     * 선택된 파일 목록 가져오기
     */
    getSelectedFiles() {
        const checkboxes = document.querySelectorAll('.file-select-checkbox:checked');
        return Array.from(checkboxes).map(checkbox => checkbox.dataset.filename);
    }

    /**
     * 전체 선택 토글
     */
    toggleSelectAll() {
        const selectAllCheckbox = document.getElementById('selectAllFiles');
        const fileCheckboxes = document.querySelectorAll('.file-select-checkbox');
        
        fileCheckboxes.forEach(checkbox => {
            checkbox.checked = selectAllCheckbox.checked;
        });
        
        this.updateSelectedCount();
    }

    /**
     * 선택된 파일 수 업데이트
     */
    updateSelectedCount() {
        const selectedCheckboxes = document.querySelectorAll('.file-select-checkbox:checked');
        const selectedCount = selectedCheckboxes.length;
        const totalCount = document.querySelectorAll('.file-select-checkbox').length;
        
        const selectedCountElement = document.getElementById('selectedCount');
        if (selectedCountElement) {
            selectedCountElement.textContent = `${selectedCount}개 선택됨`;
            
            // 분석 버튼 상태 업데이트
            const analyzeBtn = document.getElementById('analyzeBtn');
            if (selectedCount > 0) {
                analyzeBtn.innerHTML = `🚀 선택된 ${selectedCount}개 파일 분석`;
                analyzeBtn.disabled = false;
            } else {
                analyzeBtn.innerHTML = '🚀 분석 실행';
                analyzeBtn.disabled = false;
            }
        }
        
        // 전체 선택 체크박스 상태 업데이트
        const selectAllCheckbox = document.getElementById('selectAllFiles');
        if (selectAllCheckbox) {
            selectAllCheckbox.checked = selectedCount === totalCount && totalCount > 0;
            selectAllCheckbox.indeterminate = selectedCount > 0 && selectedCount < totalCount;
        }
    }

    /**
     * 파일 업로드 처리
     */
    async handleFileUpload(files) {
        if (files.length === 0) return;

        const uploadProgress = document.getElementById('uploadProgress');
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');

        uploadProgress.style.display = 'block';
        progressFill.style.width = '0%';
        progressText.textContent = '업로드 중...';

        try {
            const result = await this.api.uploadFiles(files, (progress) => {
                progressFill.style.width = `${progress}%`;
                progressText.textContent = `업로드 중... ${Math.round(progress)}%`;
            });

            progressText.textContent = '업로드 완료!';
            this.showSuccess(`${files.length}개 파일이 성공적으로 업로드되었습니다.`);
            
            // 모달 닫기 및 데이터 새로고침
            setTimeout(() => {
                document.getElementById('uploadModal').classList.remove('active');
                this.refreshData();
            }, 1500);

        } catch (error) {
            this.showError('파일 업로드에 실패했습니다: ' + getErrorMessage(error));
        } finally {
            uploadProgress.style.display = 'none';
        }
    }

    /**
     * 리포트 보기
     */
    async viewReport(reportId) {
        try {
            const report = await this.api.getReport(reportId);
            this.showReportModal(report);
        } catch (error) {
            this.showError('리포트를 불러올 수 없습니다: ' + getErrorMessage(error));
        }
    }

    /**
     * 이미지 보기
     */
    async viewImage(reportFileName) {
        try {
            // 리포트 파일명에서 원본 이미지명 추출
            // 예: screen_45932_report_v1.md → screen_45932
            let originalFileName = reportFileName;
            
            console.log('원본 리포트 파일명:', reportFileName);
            
            // .md 확장자 제거
            if (originalFileName.endsWith('.md')) {
                originalFileName = originalFileName.slice(0, -3);
                console.log('.md 제거 후:', originalFileName);
            }
            
            // _report_v숫자 패턴 제거 (정규식 수정)
            originalFileName = originalFileName.replace(/_report_v\d+$/, '');
            console.log('_report_v 제거 후:', originalFileName);
            
            // 혹시 여전히 _report가 남아있다면 제거
            originalFileName = originalFileName.replace(/_report.*$/, '');
            console.log('최종 이미지명:', originalFileName);
            
            this.showImageModal(originalFileName, reportFileName);
        } catch (error) {
            this.showError('이미지를 불러올 수 없습니다: ' + getErrorMessage(error));
        }
    }

    /**
     * 파일 삭제
     */
    async deleteFile(fileName, type) {
        if (!confirm(`'${fileName}' 파일을 삭제하시겠습니까?`)) {
            return;
        }

        try {
            await this.api.deleteFile(fileName, type);
            this.showSuccess('파일이 삭제되었습니다.');
            this.refreshData();
        } catch (error) {
            this.showError('파일 삭제에 실패했습니다: ' + getErrorMessage(error));
        }
    }

    /**
     * 파일 재분석
     */
    async reanalyzeFile(fileName) {
        if (!confirm(`'${fileName}' 파일을 다시 분석하시겠습니까?\n새로운 버전으로 분석 결과가 생성됩니다.`)) {
            return;
        }

        try {
            // 리포트 파일명에서 원본 이미지명 추출 (이미지 보기와 동일한 로직)
            let originalFileName = fileName;
            
            // .md 확장자 제거
            if (originalFileName.endsWith('.md')) {
                originalFileName = originalFileName.slice(0, -3);
            }
            
            // _report_v숫자.숫자 패턴 제거 (v1.1, v2.3 등)
            originalFileName = originalFileName.replace(/_report_v\d+(\.\d+)?$/, '');
            
            const finalFileName = originalFileName + '.png';
            console.log('재분석 파일명 추출:', fileName, '→', originalFileName, '→', finalFileName);
            console.log('API 호출 데이터:', { files: [finalFileName] });
            
            // 일반 분석 API 사용 (특정 파일만)
            const result = await this.api.triggerAnalysis([finalFileName]);
            
            // 상태 표시 영역에 재분석 성공 메시지 표시
            this.showAnalysisStatus(
                'success',
                '🔄 재분석 시작!',
                `${finalFileName} 파일의 재분석이 시작되었습니다. 완료되면 새로운 버전이 생성됩니다.`,
                8000  // 8초간 표시
            );
            
            // 5초 후 데이터 새로고침
            setTimeout(() => {
                this.refreshData();
            }, 5000);
        } catch (error) {
            this.showError('재분석 실행에 실패했습니다: ' + getErrorMessage(error));
        }
    }

    /**
     * 리포트 모달 표시
     */
    showReportModal(report) {
        const modal = document.getElementById('reportModal');
        const title = document.getElementById('modalTitle');
        const body = document.getElementById('modalBody');

        title.textContent = report.title || report.filename || 'Report';
        
        if (report.content) {
            // Markdown을 HTML로 변환 (간단한 변환)
            const htmlContent = report.content
                .replace(/^# (.*$)/gim, '<h1>$1</h1>')
                .replace(/^## (.*$)/gim, '<h2>$1</h2>')
                .replace(/^### (.*$)/gim, '<h3>$1</h3>')
                .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/gim, '<em>$1</em>')
                .replace(/\n/gim, '<br>');
            
            body.innerHTML = `<div class="report-content">${htmlContent}</div>`;
        } else {
            body.innerHTML = '<p>리포트 내용을 불러올 수 없습니다.</p>';
        }

        modal.classList.add('active');
    }

    /**
     * 이미지 모달 표시
     */
    showImageModal(imageName, reportFileName) {
        const modal = document.getElementById('reportModal');
        const title = document.getElementById('modalTitle');
        const body = document.getElementById('modalBody');

        title.textContent = `차트 이미지: ${imageName}`;
        
        // 이미지 URL 생성
        const imageUrl = `http://localhost:8003/api/images/${imageName}`;
        
        // DOM 요소를 직접 생성하여 이스케이프 문제 해결
        const imageViewer = document.createElement('div');
        imageViewer.className = 'image-viewer';
        
        const imageContainer = document.createElement('div');
        imageContainer.className = 'image-container';
        
        const chartImage = document.createElement('img');
        chartImage.src = imageUrl;
        chartImage.alt = imageName;
        chartImage.className = 'chart-image';
        chartImage.crossOrigin = 'anonymous';
        
        chartImage.onerror = function() {
            console.error('이미지 로드 실패:', imageUrl);
            imageContainer.innerHTML = `<div class="image-error">이미지를 불러올 수 없습니다.<br>URL: ${imageUrl}<br>파일: ${imageName}<br><a href="${imageUrl}" target="_blank">직접 링크 테스트</a></div>`;
        };
        
        chartImage.onload = function() {
            console.log('이미지 로드 성공:', imageUrl);
            this.style.display = 'block';
            this.style.opacity = '1';
        };
        
        imageContainer.appendChild(chartImage);
        
        const imageInfo = document.createElement('div');
        imageInfo.className = 'image-info';
        imageInfo.innerHTML = `
            <h4>📊 차트 정보</h4>
            <p><strong>요청 URL:</strong> <code>${imageUrl}</code></p>
            <p><strong>원본 파일:</strong> ${imageName}.png</p>
            <p><strong>관련 리포트:</strong> ${reportFileName}</p>
            <div class="image-actions">
                <button class="btn btn-primary" onclick="dashboard.viewReport('${reportFileName}')">📋 리포트 보기</button>
                <button class="btn btn-outline" onclick="dashboard.downloadImage('${imageName}')">💾 이미지 다운로드</button>
                <a href="${imageUrl}" target="_blank" class="btn btn-outline">🔗 새 창에서 열기</a>
                <button class="btn btn-outline" onclick="navigator.clipboard.writeText('${imageUrl}')">📋 URL 복사</button>
            </div>
        `;
        
        imageViewer.appendChild(imageContainer);
        imageViewer.appendChild(imageInfo);
        
        body.innerHTML = '';
        body.appendChild(imageViewer);

        modal.classList.add('active');
    }

    /**
     * 이미지 다운로드
     */
    async downloadImage(imageName) {
        try {
            const imageUrl = `http://localhost:8003/api/images/${imageName}`;
            const link = document.createElement('a');
            link.href = imageUrl;
            link.download = imageName;
            link.click();
        } catch (error) {
            this.showError('이미지 다운로드에 실패했습니다: ' + getErrorMessage(error));
        }
    }

    /**
     * 분석 상태 표시 영역에 메시지 표시
     */
    showAnalysisStatus(type, title, message, duration = 5000) {
        const statusSection = document.getElementById('analysisStatus');
        const statusIcon = document.getElementById('statusIcon');
        const statusTitle = document.getElementById('statusTitle');
        const statusMessage = document.getElementById('statusMessage');
        const statusTimestamp = document.getElementById('statusTimestamp');
        const notification = statusSection.querySelector('.status-notification');
        
        // 아이콘 설정
        const icons = {
            success: '🎉',
            processing: '🔄',
            error: '❌'
        };
        
        statusIcon.textContent = icons[type] || '📋';
        statusTitle.textContent = title;
        statusMessage.textContent = message;
        statusTimestamp.textContent = new Date().toLocaleString('ko-KR');
        
        // 스타일 클래스 설정
        notification.className = `status-notification ${type}`;
        
        // 표시
        statusSection.style.display = 'block';
        
        // 자동 숨김
        if (duration > 0) {
            setTimeout(() => {
                this.hideAnalysisStatus();
            }, duration);
        }
    }

    /**
     * 분석 상태 표시 영역 숨기기
     */
    hideAnalysisStatus() {
        const statusSection = document.getElementById('analysisStatus');
        statusSection.style.display = 'none';
    }

    /**
     * 자동 새로고침 설정
     */
    setupAutoRefresh(intervalSeconds = 0) {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }

        if (intervalSeconds > 0) {
            this.refreshInterval = setInterval(() => {
                this.refreshData();
            }, intervalSeconds * 1000);
        }
    }

    /**
     * WebSocket 연결 설정
     */
    setupWebSocket() {
        try {
            this.websocket = this.api.connectWebSocket((data) => {
                this.handleWebSocketMessage(data);
            });
        } catch (error) {
            console.log('WebSocket 연결을 사용할 수 없습니다:', error.message);
        }
    }

    /**
     * WebSocket 메시지 처리
     */
    handleWebSocketMessage(data) {
        switch (data.type) {
            case 'analysis_complete':
                this.showSuccess('분석이 완료되었습니다!');
                this.refreshData();
                break;
            case 'file_uploaded':
                this.refreshData();
                break;
            case 'error':
                this.showError(data.message);
                break;
        }
    }

    /**
     * 성공 메시지 표시
     */
    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    /**
     * 에러 메시지 표시
     */
    showError(message) {
        this.showNotification(message, 'error');
    }

    /**
     * 알림 표시
     */
    showNotification(message, type = 'info') {
        // 간단한 토스트 알림 구현
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 6px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            max-width: 300px;
            word-wrap: break-word;
            background: ${type === 'success' ? '#16a34a' : type === 'error' ? '#dc2626' : '#2563eb'};
            box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
        `;

        document.body.appendChild(notification);

        // 3초 후 자동 제거
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    /**
     * 오프라인 메시지 표시
     */
    showOfflineMessage() {
        const message = document.createElement('div');
        message.id = 'offline-message';
        message.innerHTML = `
            <div style="background: #fef3c7; color: #92400e; padding: 1rem; text-align: center; border-bottom: 1px solid #fbbf24;">
                ⚠️ artisAsset 서버에 연결할 수 없습니다. 서버를 시작하고 새로고침해주세요.
            </div>
        `;
        document.body.insertBefore(message, document.body.firstChild);
    }

    /**
     * 오프라인 메시지 숨기기
     */
    hideOfflineMessage() {
        const message = document.getElementById('offline-message');
        if (message) {
            message.remove();
        }
    }

    /**
     * 시간 입력 필드 포맷팅 설정
     */
    setupTimeInputFormatting() {
        const timeInputs = ['customRefreshHours', 'customRefreshMinutes', 'customRefreshSeconds'];
        
        timeInputs.forEach(inputId => {
            const input = document.getElementById(inputId);
            
            // 숫자만 입력 허용
            input.addEventListener('input', (e) => {
                // 숫자만 허용
                e.target.value = e.target.value.replace(/[^0-9]/g, '');
                
                // 입력 중에는 패딩하지 않음 (blur에서 처리)
                let value = parseInt(e.target.value) || 0;
                
                // 범위 체크만 수행
                if (inputId === 'customRefreshHours' && value > 23) {
                    e.target.value = '23';
                } else if ((inputId === 'customRefreshMinutes' || inputId === 'customRefreshSeconds') && value > 59) {
                    e.target.value = '59';
                }
            });
            
            // 포커스 아웃 시 두 자리 패딩 보장
            input.addEventListener('blur', (e) => {
                const value = parseInt(e.target.value) || 0;
                e.target.value = value.toString().padStart(2, '0');
            });
            
            // 포커스 시 전체 선택
            input.addEventListener('focus', (e) => {
                e.target.select();
            });
        });
    }
}

// 전역 dashboard 인스턴스 생성
let dashboard;

// DOM 로드 완료 후 초기화
document.addEventListener('DOMContentLoaded', () => {
    dashboard = new Dashboard();
});

// 전역으로 사용할 수 있도록 내보내기
window.dashboard = dashboard;

// 전역 함수들
function hideAnalysisStatus() {
    if (window.dashboard) {
        window.dashboard.hideAnalysisStatus();
    }
}
