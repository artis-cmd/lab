// Google API 인증 정보
const CLIENT_ID = '637353525540-h6fp54dnb8o54c4j3kacfro8ki02ddge.apps.googleusercontent.com';
const API_KEY = 'AIzaSyC6oq96wZFvcQ5oW0iiIBusSMw8DEEktOs';
const SPREADSHEET_ID = '1eviEguoA1ly8QRk68bRD4cmRIzFnSSqGmbIdky29qwk';
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets';

let tokenClient;
let gapiInited = false;
let gisInited = false;

// 지연 함수 추가 (API 요청 사이에 시간 간격을 두기 위함)
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// API 초기화 완료 확인 및 버튼 활성화
function maybeEnableButtons() {
    if (gapiInited && gisInited) {
        document.getElementById('authorize_button').style.visibility = 'visible';
    }
}

// ★GAPI 클라이언트 초기화
async function initializeGapiClient() {
    try {
        await gapi.client.init({
            apiKey: API_KEY,
            discoveryDocs: ["https://sheets.googleapis.com/$discovery/rest?version=v4"],
        });

        if (!gapi.client.sheets || !gapi.client.sheets.spreadsheets) {
            console.error("🚨 Google Sheets API가 로드되지 않았습니다.");
            return;
        }

        console.log("✅ Google Sheets API 로드 완료");

        gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: "A1:D10",
        }).then(response => {
            console.log("📌 데이터 가져오기 성공", response);
        }).catch(error => {
            console.error("❌ 데이터 가져오기 실패", error);
        });

    } catch (error) {
        console.error("❌ Google API 클라이언트 초기화 실패", error);
    }
}

// GIS 로드 핸들러
function handleGisLoad() {
        tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: CLIENT_ID,
            scope: SCOPES,
        callback: '', // 콜백은 handleAuthClick에서 설정
        });
        gisInited = true;
    console.log('GIS 초기화 성공');
        maybeEnableButtons();
    
    // 초기화 완료 후 자동 로그인 시도
    if (gapiInited) {
        tryAutoLogin();
    }
}

// 안전한 DOM 요소 제거 함수
function safeRemoveElement(element) {
    try {
      if (element && element.parentNode) {
        element.parentNode.removeChild(element);
                return true;
        }
    } catch (error) {
      console.log("요소 제거 중 오류:", error);
    }
    return false;
}

// 토큰 버킷 방식의 API 요청 제한기
const ApiRateLimiter = {
    tokens: 5,             // 초기 토큰 수
    maxTokens: 5,          // 최대 토큰 수
    refillRate: 1000,      // 토큰 리필 간격 (ms)
    lastRefill: Date.now(),
    queue: [],
    
    // 토큰 리필
    refill() {
        const now = Date.now();
        const elapsed = now - this.lastRefill;
        const newTokens = Math.floor(elapsed / this.refillRate);
        
        if (newTokens > 0) {
            this.tokens = Math.min(this.maxTokens, this.tokens + newTokens);
            this.lastRefill = now;
        }
    },
    
    // API 호출 요청
    async scheduleRequest(apiCall) {
        return new Promise((resolve, reject) => {
            this.queue.push({ apiCall, resolve, reject });
            this.processQueue();
        });
    },
    
    // 큐 처리
    async processQueue() {
        if (this.queue.length === 0) return;
        
        this.refill();
        
        if (this.tokens > 0) {
            this.tokens--;
            const { apiCall, resolve, reject } = this.queue.shift();
            
            try {
                const result = await apiCall();
                resolve(result);
            } catch (error) {
                reject(error);
            }
            
            // 큐에 남은 항목 처리
            setTimeout(() => this.processQueue(), 1000);
        } else {
            // 토큰이 없으면 리필 시간 후 다시 시도
            setTimeout(() => this.processQueue(), this.refillRate);
        }
    }
};



// 자동 로그인 시도 함수
function tryAutoLogin() {
    console.log('자동 로그인 시도 중...');
    
    // 로컬 스토리지에서 이전 로그인 상태 확인
    const wasLoggedIn = localStorage.getItem('checklist_logged_in');
    
    if (wasLoggedIn === 'true') {
        console.log('이전 로그인 세션 발견, 자동 로그인 시도');
        
        // 지연 시간을 두고 로그인 시도 (페이지 로드 후)
        setTimeout(() => {
            handleAuthClick();
        }, 1000);
    } else {
        console.log('이전 로그인 세션 없음, 수동 로그인 필요');
    }
}

// GAPI 로드 및 초기화
function handleClientLoad() {
    console.log('GAPI 로드 시작');
    gapi.load('client', initializeGapiClient);
}

// 로그인 상태 확인 함수
function isUserLoggedIn() {
    return gapi.client && gapi.client.getToken() !== null;
}

// 로그인 상태에 따라 UI 업데이트
function updateUIBasedOnAuthStatus() {
    const isLoggedIn = isUserLoggedIn();
    
    // 로그인 버튼 상태 업데이트
    document.getElementById('authorize_button').style.display = isLoggedIn ? 'none' : 'inline-block';
    document.getElementById('signout_button').style.display = isLoggedIn ? 'inline-block' : 'none';
    
    // 기타 UI 요소 업데이트
    const loadButton = document.getElementById('loadFromSheetButton');
    if (loadButton) {
        loadButton.disabled = !isLoggedIn;
    }
    
    // 상단 바 색상 변경
    updateTopBarColor(isLoggedIn);
    
    // 로컬 스토리지에 상태 저장
    localStorage.setItem('checklist_logged_in', isLoggedIn ? 'true' : 'false');
}

// ★구글 인증 처리 함수
function handleAuthClick() {
    console.log("🔑 인증 시도 중...");

    if (!tokenClient) {
        console.error("🚨 토큰 클라이언트가 초기화되지 않았습니다.");
        return;
    }

    tokenClient.callback = async (resp) => {
        if (resp.error) {
            console.error("❌ 인증 오류:", resp.error);
            return;
        }

        console.log("✅ 인증 성공!");
        document.getElementById("authorize_button").style.visibility = "hidden";
        document.getElementById("signout_button").style.visibility = "visible";

        updateUIBasedOnAuthStatus();  // UI 업데이트 추가
    };

    // 이미 토큰이 있다면 새 토큰 요청 없이 사용
    if (gapi.client.getToken() === null) {
        tokenClient.requestAccessToken({ prompt: "consent" });
    } else {
        tokenClient.requestAccessToken({ prompt: "" });
    }
}

// 로그아웃 처리 함수
function handleSignoutClick() {
    const token = gapi.client.getToken();
    if (token !== null) {
        google.accounts.oauth2.revoke(token.access_token);
        gapi.client.setToken('');
        document.getElementById('authorize_button').style.visibility = 'visible';
        document.getElementById('signout_button').style.visibility = 'hidden';
        
        // 로그아웃 시 UI 업데이트
        updateUIBasedOnAuthStatus();
        
        console.log('로그아웃 완료');
    }
}

// 헤더 업데이트 함수
async function updateHeaders() {
    try {
        if (!isUserLoggedIn()) {
            alert('로그인이 필요합니다.');
            return;
        }
        
        const sheetsResponse = await gapi.client.sheets.spreadsheets.get({
            spreadsheetId: SPREADSHEET_ID
        });
        
        const firstSheetName = sheetsResponse.result.sheets[0].properties.title;
        console.log('시트 이름:', firstSheetName);
        
        // 새로운 헤더 설정
        const headers = [
            ['날짜', '요일', '시간', '유형', '항목', '트레이드유형', '상태', '비고']
        ];
        
        // 헤더 업데이트
        const response = await gapi.client.sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: `${firstSheetName}!A1:H1`,
            valueInputOption: 'RAW',
            resource: {
                values: headers
            }
        });
        
        console.log('헤더 업데이트 성공:', response);
    } catch (error) {
        console.error('헤더 업데이트 실패:', error);
    }
}

// 통합된 ID 생성 함수
async function generateSequentialID() {
    try {
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const dd = String(now.getDate()).padStart(2, '0');
        const hh = String(now.getHours()).padStart(2, '0');
        const min = String(now.getMinutes()).padStart(2, '0');
        const sec = String(now.getSeconds()).padStart(2, '0');

        const dateStr = `${yyyy}${mm}${dd}`;
        const timeStr = `${hh}${min}${sec}`;

        if (!isUserLoggedIn()) {
            console.warn("로그인되지 않음: 임시 ID 생성");
            return { id: `${dateStr}-${timeStr}-0001`, time: `${hh}:${min}:${sec}` };
        }

        // Google Sheets에서 A열(ID) 가져오기
        const sheetsResponse = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: "A:A"
        });

        const rows = sheetsResponse.result.values || [];
        const filteredIDs = rows
            .map(row => row && row[0])
            .filter(id => id && id.startsWith(dateStr));

        // 기존 데이터 중 가장 큰 연번 찾기
        let maxNum = 0;
        filteredIDs.forEach(id => {
            const parts = id.split("-");
            if (parts.length >= 3) {
                const num = parseInt(parts[2], 10);
                if (!isNaN(num) && num > maxNum) {
                    maxNum = num;
                }
            }
        });

        const nextNum = maxNum + 1;
        const sequentialID = `${dateStr}-${timeStr}-${String(nextNum).padStart(4, '0')}`;

        console.log(`📌 생성된 ID: ${sequentialID}, 동일한 시간 적용: ${hh}:${min}:${sec}`);
        return { id: sequentialID, time: `${hh}:${min}:${sec}` };
    } catch (error) {
        console.warn("⚠️ ID 생성 오류:", error);
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const dd = String(now.getDate()).padStart(2, '0');
        const hh = String(now.getHours()).padStart(2, '0');
        const min = String(now.getMinutes()).padStart(2, '0');
        const sec = String(now.getSeconds()).padStart(2, '0');
        
        const dateStr = `${yyyy}${mm}${dd}`;
        const timeStr = `${hh}${min}${sec}`;
        
        return { id: `${dateStr}-${timeStr}-0001`, time: `${hh}:${min}:${sec}` };
    }
}

// API 호출 재시도 로직이 포함된 함수
async function retryApiCall(apiFunction, maxRetries = 3, baseDelayMs = 1000) {
    let lastError;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await apiFunction();
        } catch (error) {
            lastError = error;
            console.warn(`API 호출 실패 (시도 ${attempt + 1}/${maxRetries}):`, error);
            
            // 429 오류(Rate Limit)인 경우 더 긴 지연 시간 적용
            const waitTime = error.status === 429 ? baseDelayMs * 3 : baseDelayMs;
            await delay(waitTime * (attempt + 1));
        }
    }
    
    // 모든 시도 실패
    throw lastError;
}

// 체크리스트 항목 저장 함수 - 개선된 버전
async function saveChecklistItem(data) {
    try {
        if (!isUserLoggedIn()) {
            console.log('로그인이 필요합니다');
            return Promise.reject('로그인 필요');
        }

        // 기본 데이터 구조 확인 및 설정
        if (!data) data = {};
        if (!data.type) data.type = 'Unknown';
        if (!data.item) data.item = '';
        if (!data.action) data.action = '추가됨';
        if (!data.note) data.note = '';

        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;

        const days = ['日', '月', '火', '水', '木', '金', '土'];
        const dayOfWeek = days[now.getDay()];

        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        const formattedTime = `${hours}:${minutes}:${seconds}`;

        // 시트 이름 가져오기
        let firstSheetName = '';
        try {
            const sheetsResponse = await gapi.client.sheets.spreadsheets.get({
                spreadsheetId: SPREADSHEET_ID
            });
            firstSheetName = sheetsResponse.result.sheets[0].properties.title;
            console.log(`📌 첫 번째 시트 이름: ${firstSheetName}`);
        } catch (sheetError) {
            console.error("❌ Google Sheets에서 시트 이름을 가져오는 데 실패:", sheetError);
            return Promise.reject(sheetError);
        }

        // ID 생성
        const { id: uniqueID, time: fixedTime } = await generateSequentialID();

        // 유형에 이모지 추가
        let typeEmoji = '';
        switch (data.type) {
            case 'Strategy': typeEmoji = '⚠️ Strategy'; break;
            case 'Risk': typeEmoji = '🕵️ Risk'; break;
            case 'Mental': typeEmoji = '🧠 Mental'; break;
            case '🔄 Reset': typeEmoji = '🔄 Reset'; break;
            default: typeEmoji = data.type || '❓ Unknown';
        }

        // 트레이드 유형 이모지 추가
        let tradeTypeEmoji = '未選択 🈚';
        const tradeTypeSelect = document.getElementById('bgColorSelect');
        if (tradeTypeSelect) {
            const selectedOption = tradeTypeSelect.options[tradeTypeSelect.selectedIndex];
            if (selectedOption) {
                tradeTypeEmoji = selectedOption.text.replace(/-+/g, '').trim();
                
                if (tradeTypeEmoji === '未選択') tradeTypeEmoji = '未選択 🈚';
                if (tradeTypeEmoji.includes('Range')) tradeTypeEmoji += ' 📊';
                if (tradeTypeEmoji.includes('Bull')) tradeTypeEmoji += ' 📈';
                if (tradeTypeEmoji.includes('Bear')) tradeTypeEmoji += ' 📉';
                if (tradeTypeEmoji.includes('안하는게 낫다')) tradeTypeEmoji += ' 🚫';
            }
        }

        // 상태 이모지 추가
        let actionEmoji = '';
        switch (data.action) {
            case '추가됨': actionEmoji = '➕ 추가됨'; break;
            case '수정됨': actionEmoji = '✏️ 수정됨'; break;
            case '체크됨': actionEmoji = '✅ 체크됨'; break;
            case '삭제됨': actionEmoji = '🗑️ 삭제됨'; break;
            case '복원됨': actionEmoji = '↩️ 복원됨'; break;
            case '시트에서 가져옴': actionEmoji = '📥 시트에서 가져옴'; break;
            case '초기화됨': actionEmoji = '🔄 초기화됨'; break;
            default: actionEmoji = data.action || '❓';
        }

        // PDCA 단계 설정
        let stepPrefix = 'P';
        if (data.action === '체크됨') stepPrefix = 'D';
        else if (data.action === '수정됨') stepPrefix = 'C';
        else if (data.action === '복원됨') stepPrefix = 'A';
        else if (data.action === '초기화됨') stepPrefix = 'R';

        // 시리얼 넘버 설정
        let count = 1;
        try {
            const countResponse = await gapi.client.sheets.spreadsheets.values.get({
                spreadsheetId: SPREADSHEET_ID,
                range: `${firstSheetName}!A:A`
            });
            const rows = countResponse.result.values || [];
            count = rows.filter(row => row[0] && row[0].startsWith(formattedDate)).length + 1;
        } catch (countError) {
            console.warn("⚠️ 데이터 개수를 가져오는 데 실패: 새 연번을 1로 설정");
        }
        let serialNumber = `${stepPrefix}${String(count).padStart(3, '0')}`;

        // 최종 데이터 배열 생성
        const values = [[
            uniqueID,      // A열: 고유 ID
            formattedDate, // B열: 날짜
            dayOfWeek,     // C열: 요일
            fixedTime,     // D열: 시간
            serialNumber,  // E열: 연번PDCA
            typeEmoji,     // F열: 체크리스트 유형
            data.item,     // G열: 항목 내용
            tradeTypeEmoji,// H열: 트레이드 유형
            actionEmoji,   // I열: 상태
            data.note      // J열: 비고
        ]];
        
        console.log("📌 Google Sheets 저장 데이터:", JSON.stringify(values, null, 2));

        // 데이터 추가 - API 호출 재시도 로직 적용
        const appendData = async () => {
            const response = await gapi.client.sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
                range: `${firstSheetName}!A:J`,
            valueInputOption: 'RAW',
            insertDataOption: 'INSERT_ROWS',
            resource: {
                    values: values
                }
            });
            return response;
        };

        const response = await retryApiCall(appendData, 3, 1000);
        console.log(`✅ Google Sheets 저장 성공:`, response);
        return response;
    } catch (error) {
        console.error('❌ 데이터 저장 실패:', error);
        return Promise.reject(error);
    }
}

// ★구글 시트에서 데이터 가져오는 함수
async function loadItemsFromSheet() {
    let loadingMsg = null;
    
    try {
        if (!isUserLoggedIn()) {
            alert('데이터를 가져오려면 먼저 로그인해주세요.');
            return;
        }

        // 이미 로딩 중인지 확인
        if (document.querySelector('.loading-message')) {
            console.log('이미 데이터를 로드 중입니다.');
            return;
        }

        // API 요청 상태 표시
        loadingMsg = document.createElement('div');
        loadingMsg.className = 'loading-message';
        loadingMsg.innerHTML = '데이터 로드 중... <span class="spinner"></span>';
        loadingMsg.style.position = 'fixed';
        loadingMsg.style.top = '50%';
        loadingMsg.style.left = '50%';
        loadingMsg.style.transform = 'translate(-50%, -50%)';
        loadingMsg.style.padding = '20px';
        loadingMsg.style.background = 'rgba(0,0,0,0.7)';
        loadingMsg.style.color = 'white';
        loadingMsg.style.borderRadius = '10px';
        loadingMsg.style.zIndex = '9999';
        document.body.appendChild(loadingMsg);

        // 스프레드시트의 모든 시트 이름 가져오기
        const getSheetsData = async () => {
            return await gapi.client.sheets.spreadsheets.get({
                spreadsheetId: SPREADSHEET_ID
            });
        };

        // API 요청 제한기 활용
        const sheetsResponse = await ApiRateLimiter.scheduleRequest(getSheetsData);
        //const sheetsResponse = await retryApiCall(getSheetsData, 3, 1000);
                
        const sheets = sheetsResponse.result.sheets;
        const sheetNames = sheets.map(sheet => sheet.properties.title);
        
        // 셀렉트 박스로 시트 선택 UI 생성
        const dialog = document.createElement('div');
        dialog.className = 'sheet-selector-dialog';
        dialog.innerHTML = `
            <div class="sheet-selector-content">
                <h3>데이터를 가져올 시트 선택</h3>
                <select id="sheetSelector" class="sheet-select">
                    ${sheetNames.map(name => `<option value="${name}">${name}</option>`).join('')}
                </select>
                <div class="sheet-selector-buttons">
                    <button id="confirmSheetSelection" class="confirm-button">확인</button>
                    <button id="cancelSheetSelection" class="cancel-button">취소</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(dialog);
        
        // 셀렉트 박스에서 to_HTML 시트를 기본 선택으로 설정 (있는 경우)
        const selector = document.getElementById('sheetSelector');
        if (!selector) {
            alert('시트 선택기를 생성하는 데 실패했습니다.');
            if (loadingMsg) document.body.removeChild(loadingMsg);
            document.body.removeChild(dialog);
            return;
        }
        
        const defaultSheet = sheetNames.includes('to_HTML') ? 'to_HTML' : sheetNames[0];
        selector.value = defaultSheet;
        
        // 확인 버튼 클릭 처리
        return new Promise((resolve, reject) => {
            const confirmButton = document.getElementById('confirmSheetSelection');
            const cancelButton = document.getElementById('cancelSheetSelection');
            
            if (!confirmButton || !cancelButton) {
                alert('버튼을 생성하는 데 실패했습니다.');
                if (loadingMsg) document.body.removeChild(loadingMsg);
                document.body.removeChild(dialog);
                reject(new Error('UI 요소 생성 실패'));
                return;
            }
            
            confirmButton.addEventListener('click', async () => {
                const selectedSheetName = selector.value;
                document.body.removeChild(dialog);
                
                try {
                    // 선택한 시트에서 데이터 가져오기
                    const getSheetData = async () => {
                        return await gapi.client.sheets.spreadsheets.values.get({
                            spreadsheetId: SPREADSHEET_ID,
                            range: `${selectedSheetName}!A:B` // A와 B 열 데이터 가져오기 (유형과 항목)
                        });
                    };
                    
                    const response = await retryApiCall(getSheetData, 3, 1000);
                    
                    const rows = response.result.values;
                    if (!rows || rows.length <= 1) {
                        if (loadingMsg) document.body.removeChild(loadingMsg);
                        alert('가져올 데이터가 없습니다.');
                        resolve();
                        return;
                    }

                    // 헤더 행 건너뛰고 처리
                    let newItemsCount = 0;
                    
                    // 순차적으로 처리 (각 항목 사이에 지연 시간 추가)
                    for (let i = 1; i < rows.length; i++) {
                        if (rows[i] && rows[i].length >= 2) {
                            const type = rows[i][0]; // A열: 유형 (Strategy, Risk, Mental)
                            const item = rows[i][1]; // B열: 항목 내용
                            
                            if (item && type) {
                                // 각 유형에 맞게 항목 추가
                                let added = false;
                                switch(type.trim()) {
                                    case 'Strategy':
                                        added = await addItemFromSheet(item, 'checklist1');
                                        break;
                                    case 'Risk':
                                        added = await addItemFromSheet(item, 'checklist2');
                                        break;
                                    case 'Mental':
                                        added = await addItemFromSheet(item, 'checklist3');
                                        break;
                                }
                                if (added) newItemsCount++;
                                
                                // 항목 간 지연 시간 추가 (API 요청 제한 방지)
                                await delay(300);
                            }
                        }
                    }
                    
                    if (loadingMsg) document.body.removeChild(loadingMsg);
                    alert(`'${selectedSheetName}' 시트에서 ${newItemsCount}개의 새 항목을 가져왔습니다.`);
                    resolve();
                } catch (error) {
                    console.error('데이터 가져오기 실패:', error);
                    if (loadingMsg) document.body.removeChild(loadingMsg);
                    alert('데이터 가져오기 실패: ' + error.message);
                    reject(error);
                }
            });
            
            // 취소 버튼 클릭 처리
            cancelButton.addEventListener('click', () => {
                safeRemoveElement(dialog);
                safeRemoveElement(document.querySelector('.loading-message'));
                resolve();
            });
        });
    } catch (error) {
        console.error('시트 데이터 로드 실패:', error);
        if (loadingMsg) document.body.removeChild(loadingMsg);
        alert('데이터 가져오기 실패: ' + error.message);
    } finally {
        // 모든 경우에 로딩 메시지 제거 보장
        setTimeout(() => {
            const loadingElement = document.querySelector('.loading-message');
            safeRemoveElement(loadingElement);
        }, 500);
    }
}

// 시트에서 가져온 항목을 체크리스트에 추가하는 함수 (비동기)
async function addItemFromSheet(item, storageKey) {
    if (!item || !storageKey) {
        console.error("addItemFromSheet: 유효하지 않은 인자", { item, storageKey });
        return false;
    }

    let items = JSON.parse(localStorage.getItem(storageKey)) || [];

    if (items.includes(item)) {
        console.log(`중복 항목 건너뜀: ${item}`);
        return false;
    }

    items.push(item);
    localStorage.setItem(storageKey, JSON.stringify(items));

    const listId = getListIdFromStorageKey(storageKey);
    if (listId) {
        const list = document.getElementById(listId);
        if (list) {
            list.innerHTML = '';
            items.forEach((item, idx) => {
                if (typeof addItemToDOM === 'function') {
                    addItemToDOM(item, idx, listId, storageKey);
                }
            });
        }
    }

    // 가져온 데이터를 Google Sheets에도 기록
    const type = getChecklistType(storageKey);
    const data = {
        type: type,
        item: item,
        action: '시트에서 가져옴'
    };

    // API 요청 실패 시 재시도 로직
    const maxRetries = 3;
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            await saveChecklistItem(data);
            console.log(`Google Sheets에 '${item}' 기록 완료`);
            return true;
        } catch (error) {
            console.error(`시도 ${attempt + 1}/${maxRetries}: Google Sheets 기록 실패:`, error);
            
            // 429 오류(Too Many Requests)인 경우 더 긴 대기 시간 적용
            const waitTime = error.status === 429 ? 2000 : 1000;
            await delay(waitTime * (attempt + 1));
            
            // 마지막 시도에서도 실패한 경우
            if (attempt === maxRetries - 1) {
                console.error(`모든 시도 실패: Google Sheets에 '${item}' 기록 실패`);
            }
        }
    }

    return true;
}

// 통합된 체크 기능
async function saveCheckedItem(itemID, itemText) {
    try {
        if (!isUserLoggedIn()) {
            alert('로그인이 필요합니다.');
            return false;
        }
        
        console.log(`📌 체크된 항목 저장 시작: ${itemID} (${itemText})`);

        // 기본 데이터 구조 생성
        const data = {
            type: 'Checked Item',
            item: itemText,
            action: '체크됨',
            note: `항목 ID: ${itemID}`
        };
        
        // 기존 saveChecklistItem 함수 재사용
        await saveChecklistItem(data);
        console.log(`✅ 체크된 항목 저장 완료: ${itemID}`);
        
        return true;
    } catch (error) {
        console.error("❌ 체크된 항목 저장 실패:", error);
        return false;
    }
}

// 체크리스트 초기화 함수
async function resetChecklist() {
    const confirmReset = confirm("⚠️ 모든 데이터를 초기화하시겠습니까?");
    if (!confirmReset) return;

    try {
        if (!isUserLoggedIn()) {
            alert('로그인이 필요합니다.');
            return;
        }
        
        // 초기화 진행 중 플래그 설정 (중복 실행 방지)
        if (window.isResetting) {
            console.log("이미 초기화 진행 중입니다.");
            return;
        }
        
        window.isResetting = true;
        
        // 초기화 기록용 데이터 생성
        const data = {
            type: '🔄 Reset',
            item: '전체 데이터 초기화',
            action: '초기화됨',
            note: '사용자 요청에 의한 초기화'
        };
        
        // 초기화 기록
        await saveChecklistItem(data);
        
        // 로컬 스토리지 초기화
        localStorage.removeItem("checklist1");
        localStorage.removeItem("checklist2");
        localStorage.removeItem("checklist3");
        localStorage.removeItem("movedStorage");
        
        console.log("📌 초기화 기록 완료");
        alert("✅ 데이터가 초기화되었습니다!");
        
        // 플래그 초기화
        window.isResetting = false;
        
        // 화면 새로고침 (비동기 작업 완료 후)
        setTimeout(() => {
            location.reload();
        }, 500);
    } catch (error) {
        console.error("❌ 초기화 기록 실패:", error);
        alert("초기화 중 오류가 발생했습니다.");
        window.isResetting = false;
    }
}

// 로컬 스토리지 키로부터 리스트 ID 가져오기
function getListIdFromStorageKey(storageKey) {
    switch(storageKey) {
        case 'checklist1': return 'list1';
        case 'checklist2': return 'list2';
        case 'checklist3': return 'list3';
        default: return null;
    }
}

// 체크리스트 유형 반환 함수
function getChecklistType(storageKey) {
    switch(storageKey) {
        case 'checklist1': return 'Strategy';
        case 'checklist2': return 'Risk';
        case 'checklist3': return 'Mental';
        default: return 'Unknown';
    }
}

// top-bar 색상 변경 함수
function updateTopBarColor(isLoggedIn) {
    const topBar = document.querySelector('.top-bar');
    
    if (!topBar) {
        console.error('top-bar 요소를 찾을 수 없습니다!');
        return;
    }
    
    // 인라인 스타일 제거
    topBar.style.backgroundColor = '';
    topBar.style.color = '';
    
    // CSS 클래스로 스타일 적용
    if (isLoggedIn) {
        topBar.classList.remove('logged-out');
        topBar.classList.add('logged-in');
        console.log('로그인 상태 - logged-in 클래스 추가됨');
    } else {
        topBar.classList.remove('logged-in');
        topBar.classList.add('logged-out');
        console.log('로그아웃 상태 - logged-out 클래스 추가됨');
    }
}

// 체크리스트 렌더링 함수
function renderChecklist(items) {
    const checklistContainer = document.getElementById("checklistContainer");
    
    // 요소가 존재하는지 확인
    if (!checklistContainer) {
        console.error("checklistContainer 요소를 찾을 수 없습니다.");
        return;
    }
    
    checklistContainer.innerHTML = "";

    if (!items || !Array.isArray(items)) {
        console.warn("유효하지 않은 항목 데이터:", items);
        return;
    }

    items.forEach((item) => {
        if (!item || !item.id || !item.text) {
            console.warn("불완전한 항목 스킵:", item);
            return;
        }
        
        const listItem = document.createElement("li");
        listItem.className = "checklist-item";

        // 항목 텍스트
        const itemText = document.createElement("span");
        itemText.className = "item-text";
        itemText.textContent = item.text;
        
        // 체크 버튼
        const checkButton = document.createElement("button");
        checkButton.className = "check-button";
        checkButton.innerHTML = "✔️<span>체크</span>";
        checkButton.onclick = function () {
            saveCheckedItem(item.id, item.text);
            // 체크 후 UI 업데이트 (옵션)
            listItem.classList.add("checked");
            setTimeout(() => {
                listItem.remove();
            }, 500);
        };

        listItem.appendChild(itemText);
        listItem.appendChild(checkButton);
        checklistContainer.appendChild(listItem);
    });
}

// 페이지 로드 시 초기 상태 설정
document.addEventListener('DOMContentLoaded', function() {
    updateTopBarColor(false);
    
    // 로그인 버튼 초기 상태 설정
    const authorizeButton = document.getElementById('authorize_button');
    const signoutButton = document.getElementById('signout_button');
    
    if (authorizeButton && signoutButton) {
        authorizeButton.style.visibility = 'visible';
        signoutButton.style.visibility = 'hidden';
    }
    
    // CSS로 스피너 스타일 추가
    if (!document.getElementById('spinner-style')) {
        const styleElement = document.createElement('style');
        styleElement.id = 'spinner-style';
        styleElement.textContent = `
            .spinner {
                display: inline-block;
                width: 20px;
                height: 20px;
                border: 3px solid rgba(255,255,255,.3);
                border-radius: 50%;
                border-top-color: #fff;
                animation: spin 1s ease-in-out infinite;
            }
            
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(styleElement);
    }
});

// 전역 함수 노출
window.handleClientLoad = handleClientLoad;
window.handleGisLoad = handleGisLoad;
window.handleAuthClick = handleAuthClick;
window.handleSignoutClick = handleSignoutClick; 
window.saveChecklistItem = saveChecklistItem;
window.updateHeaders = updateHeaders;
window.loadItemsFromSheet = loadItemsFromSheet;
window.saveCheckedItem = saveCheckedItem;
window.resetChecklist = resetChecklist;
window.addItemFromSheet = addItemFromSheet;
window.renderChecklist = renderChecklist;
window.delay = delay;
window.retryApiCall = retryApiCall;
