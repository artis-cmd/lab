/**
 * artisAsset API 클라이언트
 * artisAsset 백엔드 서버와의 통신을 담당하는 클래스
 */
class ArtisAssetAPI {
    constructor(baseURL = 'http://localhost:8003') {
        this.baseURL = baseURL;
        this.apiBase = `${baseURL}/api`;
    }

    /**
     * API 요청을 보내는 헬퍼 메서드
     * @param {string} endpoint - API 엔드포인트
     * @param {Object} options - fetch 옵션
     * @returns {Promise<Object>} API 응답
     */
    async request(endpoint, options = {}) {
        try {
            const url = endpoint.startsWith('http') ? endpoint : `${this.apiBase}${endpoint}`;
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API 요청 실패:', error);
            throw error;
        }
    }

    /**
     * 서버 연결 상태 확인
     * @returns {Promise<Object>} 서버 상태 정보
     */
    async checkHealth() {
        try {
            return await this.request('/health');
        } catch (error) {
            return { status: 'offline', error: error.message };
        }
    }

    /**
     * 파일 현황 조회
     * @returns {Promise<Object>} 입력/출력 파일 현황
     */
    async getFilesStatus() {
        return await this.request('/files/status');
    }

    /**
     * 분석 이력 조회
     * @param {Object} filters - 필터 옵션
     * @returns {Promise<Array>} 분석 이력 배열
     */
    async getAnalysisHistory(filters = {}) {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value) params.append(key, value);
        });
        
        const queryString = params.toString();
        const endpoint = queryString ? `/analysis/history?${queryString}` : '/analysis/history';
        
        return await this.request(endpoint);
    }

    /**
     * 통계 요약 조회
     * @returns {Promise<Object>} 통계 데이터
     */
    async getStatsSummary() {
        return await this.request('/stats/summary');
    }

    /**
     * 특정 리포트 조회
     * @param {string} reportId - 리포트 ID
     * @returns {Promise<Object>} 리포트 상세 정보
     */
    async getReport(reportId) {
        return await this.request(`/reports/${reportId}`);
    }

    /**
     * 분석 실행 트리거
     * @param {Array} fileNames - 분석할 파일명 배열 (선택사항)
     * @returns {Promise<Object>} 분석 작업 정보
     */
    async triggerAnalysis(fileNames = []) {
        return await this.request('/analysis/trigger', {
            method: 'POST',
            body: JSON.stringify({ files: fileNames })
        });
    }

    /**
     * 특정 파일 재분석
     * @param {string} fileName - 재분석할 파일명
     * @returns {Promise<Object>} 재분석 작업 정보
     */
    async reanalyzeFile(fileName) {
        return await this.request(`/analysis/reanalyze/${fileName}`, {
            method: 'POST'
        });
    }

    /**
     * 파일 업로드
     * @param {FileList} files - 업로드할 파일들
     * @param {Function} onProgress - 진행률 콜백 함수
     * @returns {Promise<Object>} 업로드 결과
     */
    async uploadFiles(files, onProgress = null) {
        const formData = new FormData();
        Array.from(files).forEach(file => {
            formData.append('files', file);
        });

        try {
            const xhr = new XMLHttpRequest();
            
            return new Promise((resolve, reject) => {
                xhr.upload.addEventListener('progress', (event) => {
                    if (event.lengthComputable && onProgress) {
                        const percentComplete = (event.loaded / event.total) * 100;
                        onProgress(percentComplete);
                    }
                });

                xhr.addEventListener('load', () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        try {
                            const response = JSON.parse(xhr.responseText);
                            resolve(response);
                        } catch (e) {
                            resolve({ success: true, message: 'Upload completed' });
                        }
                    } else {
                        reject(new Error(`Upload failed with status: ${xhr.status}`));
                    }
                });

                xhr.addEventListener('error', () => {
                    reject(new Error('Upload failed'));
                });

                xhr.open('POST', `${this.apiBase}/files/upload`);
                xhr.send(formData);
            });
        } catch (error) {
            console.error('파일 업로드 실패:', error);
            throw error;
        }
    }

    /**
     * 파일 삭제
     * @param {string} fileName - 삭제할 파일명
     * @param {string} type - 파일 타입 ('input' | 'output')
     * @returns {Promise<Object>} 삭제 결과
     */
    async deleteFile(fileName, type = 'input') {
        return await this.request(`/files/${type}/${fileName}`, {
            method: 'DELETE'
        });
    }

    /**
     * 실시간 상태 업데이트를 위한 WebSocket 연결
     * @param {Function} onMessage - 메시지 수신 콜백
     * @returns {WebSocket} WebSocket 인스턴스
     */
    connectWebSocket(onMessage) {
        const wsUrl = this.baseURL.replace('http', 'ws') + '/ws';
        const ws = new WebSocket(wsUrl);
        
        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                onMessage(data);
            } catch (error) {
                console.error('WebSocket 메시지 파싱 오류:', error);
            }
        };

        ws.onerror = (error) => {
            console.error('WebSocket 오류:', error);
        };

        ws.onclose = () => {
            console.log('WebSocket 연결 종료');
        };

        return ws;
    }
}

/**
 * 파일 크기를 사람이 읽기 쉬운 형태로 변환
 * @param {number} bytes - 바이트 크기
 * @returns {string} 포맷된 크기 문자열
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 날짜를 상대적 시간으로 변환
 * @param {string|Date} date - 날짜
 * @returns {string} 상대적 시간 문자열
 */
function formatRelativeTime(date) {
    const now = new Date();
    const targetDate = new Date(date);
    const diffInSeconds = Math.floor((now - targetDate) / 1000);

    if (diffInSeconds < 60) {
        return '방금 전';
    } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes}분 전`;
    } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours}시간 전`;
    } else if (diffInSeconds < 2592000) {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days}일 전`;
    } else {
        return targetDate.toLocaleDateString('ko-KR');
    }
}

/**
 * 에러 메시지를 사용자 친화적으로 변환
 * @param {Error} error - 에러 객체
 * @returns {string} 사용자 친화적 에러 메시지
 */
function getErrorMessage(error) {
    if (error.message.includes('Failed to fetch')) {
        return 'artisAsset 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.';
    } else if (error.message.includes('404')) {
        return '요청한 리소스를 찾을 수 없습니다.';
    } else if (error.message.includes('500')) {
        return '서버에서 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
    } else {
        return error.message || '알 수 없는 오류가 발생했습니다.';
    }
}

// API 클라이언트 인스턴스를 전역으로 사용할 수 있도록 내보내기
window.ArtisAssetAPI = ArtisAssetAPI;
window.formatFileSize = formatFileSize;
window.formatRelativeTime = formatRelativeTime;
window.getErrorMessage = getErrorMessage;
