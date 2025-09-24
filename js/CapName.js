$(function() {
    // Datepicker initialization
    $("#datepicker").datepicker({
        dateFormat: 'yymmdd', // YYYYMMDD format
        showOn: 'focus', // Show calendar on focus
        onSelect: function() {
            generateFilename();
        }
    });

    // Set current date as default for datepicker
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
    const dd = String(today.getDate()).padStart(2, '0');
    $("#datepicker").val(`${yyyy}${mm}${dd}`);
    
    // Set current time (HHMM) as default
    const hh = String(today.getHours()).padStart(2, '0');
    const mi = String(today.getMinutes()).padStart(2, '0');
    $("#time").val(`${hh}${mi}`);

    const timeInput = document.getElementById('time');
    const marketSessionRadios = document.querySelectorAll('input[name="marketSession"]');
    const tradeStageRadios = document.querySelectorAll('input[name="tradeStage"]'); 
    const tradeDirectionSelect = document.getElementById('tradeDirection'); 
    const symbolSelect = document.getElementById('symbol'); 
    const usedToolRadios = document.querySelectorAll('input[name="usedTool"]');
    const trackRecordRadios = document.querySelectorAll('input[name="trackRecord"]');
    // Analysis radio groups
    const trendDowRadios = document.querySelectorAll('input[name="trendDow"]');
    const smaAnalysisSelect = document.getElementById('smaAnalysis');
    const roundNumberSelect = document.getElementById('roundNumber');
    const entryExitCheckboxes = document.querySelectorAll('input[name="entryExit"]');
    const technicalCheckboxes = document.querySelectorAll('input[name="technical"]');
    const failureAnalysisSelect = document.getElementById('failureAnalysis');
    const priceActionSelect = document.getElementById('priceAction');
    const maArrangementSelect = document.getElementById('maArrangement');

    const previewL1 = document.getElementById('preview-L1');
    const copyMessage = document.getElementById('copyMessage');
    const interpretationResult = document.getElementById('interpretationResult');
    const filenameToInterpretInput = document.getElementById('filenameToInterpret');

    // Dictionaries for interpretation
    const marketSessionMap = {
        'TK': '도쿄 (Tokyo)',
        'LD': '런던 (London)',
        'NY': '뉴욕 (New York)'
    };

    const tradeStageMap = {
        '복기': '매매 단계: 복기 (매매 결과 분석)',
        '진입전': '매매 단계: 진입 전 (매매 계획 수립)',
        '매매중': '매매 단계: 매매 중 (상황 변화 및 대응)',
        '결제후': '매매 단계: 결제 후 (결과 및 교훈)'
    };

    const tradeDirectionMap = {
        'Buy': '매매 방향: 매수 (Buy)',
        'Sell': '매매 방향: 매도 (Sell)',
        'Range': '매매 방향: 보합 (Range)'
    };

    const usedToolMap = {
        'FT5': '사용툴: FT5',
        'TV': '사용툴: Tradingview (TV)',
        'MT4': '사용툴: MT4'
    };

    const trackRecordMap = {
        'tR0': '매매 이력: 없음',
        'tR1': '매매 이력: 있음'
    };

    const layoutMap = {
        'L1': '레이아웃: L1 (1시간/15분/5분/1분 4분할 차트)',
        'H1M15M5M1': '레이아웃: H1/M15/M5/M1 4분할 차트 (포괄형 기본)'
    };

    // CUSTOM ANALYSIS ABBREVIATIONS - You can add more here!
    const customAnalysisMap = {
        'SZDP': '지지선돌파',
        'KHS': '강한상승',
        'MSSJ': '매수시점',
        'JHDRS': '저항돌파실패',
        'HDC': '하락다이버전스',
        'SNSJ': '손절시점',
        'EJB': '이중바닥',
        'TJ': '추세전환',
        'IKZ': '익절완료',
        'HT-SR': '상위차트 S/R',
        'NR': '노이즈 리버설',
        'SMA-Cross': '이평선 교차',
        'SMA-Bounce': '이평선 지지/저항',
        '시나리오': '진입/청산 조건: 시나리오',
        '금액': '진입/청산 조건: 금액',
        '위치': '진입/청산 조건: 위치',
        '기술분석01': '기타 기술 분석: 기술분석01',
        '기술분석02': '기타 기술 분석: 기술분석02',
        '기술분석03': '기타 기술 분석: 기술분석03',
        '기술분석04': '기타 기술 분석: 기술분석04',
        // Add your own custom abbreviations here:
        // 'YOUR_ABBR': 'Your full meaning',
    };

    // Generate Filename
    function generateFilename() {
        const date = $("#datepicker").val() || '20250101'; // Default date if empty
        
        // Add day of week (a-e) to date
        let dateWithDay = date;
        if (date && date.length === 8) {
            const year = parseInt(date.substring(0, 4));
            const month = parseInt(date.substring(4, 6)) - 1; // Month is 0-indexed
            const day = parseInt(date.substring(6, 8));
            const dateObj = new Date(year, month, day);
            const dayOfWeek = dateObj.getDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday
            
            // Convert to a-g (Monday=a, Tuesday=b, ..., Sunday=g)
            let dayLetter = '';
            if (dayOfWeek >= 1 && dayOfWeek <= 5) { // Monday to Friday
                dayLetter = String.fromCharCode(96 + dayOfWeek); // 'a' = 97, 'b' = 98, etc.
            } else if (dayOfWeek === 6) { // Saturday
                dayLetter = 'f';
            } else if (dayOfWeek === 0) { // Sunday
                dayLetter = 'g';
            }
            dateWithDay = date + dayLetter;
        }
        
        const time = timeInput.value.replace(/[^0-9]/g, '').padEnd(4, '0') || '0000'; // Default time if empty
        
        const marketSessionRadio = document.querySelector('input[name="marketSession"]:checked');
        const marketSession = marketSessionRadio ? marketSessionRadio.value.trim() : '';
        const marketSessionPart = marketSession ? `_${marketSession}` : '';
        
        const tradeStageRadio = document.querySelector('input[name="tradeStage"]:checked');
        const tradeStage = tradeStageRadio ? tradeStageRadio.value.trim() : '';
        const tradeStagePart = tradeStage ? `_${tradeStage}` : ''; 
        
        const tradeDirection = tradeDirectionSelect.value.trim(); 

        const symbol = symbolSelect.value.trim(); 
        const symbolPart = symbol || 'XAUUSD'; // Default symbol
        
        const usedToolRadio = document.querySelector('input[name="usedTool"]:checked');
        const usedTool = usedToolRadio ? usedToolRadio.value.trim() : 'FT5'; // Default to FT5
        const usedToolPart = usedTool ? `_${usedTool}` : '';

        const trackRecordRadio = document.querySelector('input[name="trackRecord"]:checked');
        const trackRecord = trackRecordRadio ? trackRecordRadio.value.trim() : 'tR0'; // Default to tR0
        const trackRecordPart = trackRecord ? `_${trackRecord}` : '_tR0';

        // Get selected analysis values from radio groups
        const getSelectedRadioValue = (radios) => {
            const selected = Array.from(radios).find(radio => radio.checked);
            return selected ? selected.value : '';
        };

        // Get selected checkbox values
        const getSelectedCheckboxValues = (checkboxes) => {
            return Array.from(checkboxes)
                .filter(checkbox => checkbox.checked)
                .map(checkbox => checkbox.value);
        };

        const analysisParts = [
            getSelectedRadioValue(trendDowRadios),
            smaAnalysisSelect.value.trim(),
            roundNumberSelect.value.trim(),
            ...getSelectedCheckboxValues(entryExitCheckboxes),
            ...getSelectedCheckboxValues(technicalCheckboxes),
            failureAnalysisSelect.value.trim(),
            priceActionSelect.value.trim(),
            maArrangementSelect.value.trim()
        ].filter(part => part !== ''); 

        // Prepend trade direction to analysis parts if it exists
        const finalAnalysisParts = [];
        if (tradeDirection) { // Use tradeDirection, not tradeDirectionPart
            finalAnalysisParts.push(tradeDirection); 
        }
        finalAnalysisParts.push(...analysisParts);

        const analysis = finalAnalysisParts.length > 0 ? finalAnalysisParts.join('_') : '분석내용';

        // Construct base name
        const baseName = `${dateWithDay}_${time}${marketSessionPart}${tradeStagePart}_${symbolPart}${usedToolPart}${trackRecordPart}`;
        
        // L1 template
        const L1Filename = `${baseName}_L1_${analysis}.png`;
        previewL1.textContent = L1Filename;
        
        // Debug log
        console.log('Generated filename:', L1Filename);
    }

    // Copy to Clipboard Function
    function copyToClipboard(text) {
        console.log('copyToClipboard 함수 실행, 텍스트:', text);
        console.log('copyMessage 요소:', copyMessage);
        
        // 모던 브라우저용 Clipboard API
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text).then(() => {
                console.log('클립보드 복사 성공 (Clipboard API)');
                copyMessage.classList.add('show');
                setTimeout(() => {
                    copyMessage.classList.remove('show');
                }, 1500);
            }).catch(err => {
                console.error('Clipboard API 실패:', err);
                fallbackCopyTextToClipboard(text);
            });
        } else {
            // 구형 브라우저용 대체 방법
            console.log('Clipboard API 사용 불가, 대체 방법 사용');
            fallbackCopyTextToClipboard(text);
        }
    }
    
    // 대체 복사 방법 (구형 브라우저 지원)
    function fallbackCopyTextToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            const successful = document.execCommand('copy');
            if (successful) {
                console.log('클립보드 복사 성공 (대체 방법)');
                copyMessage.classList.add('show');
                setTimeout(() => {
                    copyMessage.classList.remove('show');
                }, 1500);
            } else {
                console.error('대체 복사 방법 실패');
                alert('클립보드 복사에 실패했습니다. 수동으로 복사해주세요: ' + text);
            }
        } catch (err) {
            console.error('대체 복사 방법 오류:', err);
            alert('클립보드 복사에 실패했습니다. 수동으로 복사해주세요: ' + text);
        }
        
        document.body.removeChild(textArea);
    }

    // Interpret Filename Function - 체계적 분석 결과 도출
    window.interpretFilename = function() {
        const filename = filenameToInterpretInput.value.trim();
        if (!filename) {
            interpretationResult.innerHTML = '<p style="color:red;">해석할 파일명을 입력해주세요.</p>';
            interpretationResult.classList.add('error');
            return;
        }

        // Remove .png/.jpg etc. and split by '_'
        const parts = filename.replace(/\.(png|jpg|jpeg|gif|bmp)$/i, '').split('_');
        
        let interpretation = [];
        let currentIndex = 0;

        // 1. Date (YYYYMMDD + optional day letter a-g)
        if (parts[currentIndex] && (parts[currentIndex].length === 8 || parts[currentIndex].length === 9) && !isNaN(parts[currentIndex].substring(0, 8))) {
            const datePart = parts[currentIndex];
            const date = datePart.substring(0, 8);
            const dayLetter = datePart.length === 9 ? datePart.charAt(8) : '';
            
            let dayOfWeekText = '';
            if (dayLetter && dayLetter >= 'a' && dayLetter <= 'g') {
                const dayNames = ['', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일', '일요일'];
                let dayIndex;
                if (dayLetter === 'f') {
                    dayIndex = 6; // 토요일
                } else if (dayLetter === 'g') {
                    dayIndex = 7; // 일요일
                } else {
                    dayIndex = dayLetter.charCodeAt(0) - 96; // 'a'=1, 'b'=2, etc.
                }
                dayOfWeekText = ` (${dayNames[dayIndex]})`;
            }
            
            interpretation.push(`<strong>📅 날짜:</strong> ${date.substring(0, 4)}년 ${date.substring(4, 6)}월 ${date.substring(6, 8)}일${dayOfWeekText}`);
            currentIndex++;
        } else {
            interpretation.push(`<strong>📅 날짜:</strong> <span style="color:red;">[날짜 형식 오류 또는 누락]</span>`);
        }

        // 2. Time (HHMM)
        if (parts[currentIndex] && parts[currentIndex].length === 4 && !isNaN(parts[currentIndex])) {
            const time = parts[currentIndex];
            interpretation.push(`<strong>⏰ 시간:</strong> ${time.substring(0, 2)}시 ${time.substring(2, 4)}분`);
            currentIndex++;
        } else {
             interpretation.push(`<strong>⏰ 시간:</strong> <span style="color:red;">[시간 형식 오류 또는 누락]</span>`);
        }

        // 3. Market Session (TK, LD, NY)
        if (parts[currentIndex]) {
            const sessionPart = parts[currentIndex];
            if (marketSessionMap[sessionPart]) {
                interpretation.push(`<strong>🌍 시장 세션:</strong> ${marketSessionMap[sessionPart]}`);
                currentIndex++;
            }
        }

        // 4. Trade Stage (복기, 진입전, 매매중, 결제후)
        if (parts[currentIndex]) {
            const stagePart = parts[currentIndex];
            if (tradeStageMap[stagePart]) {
                interpretation.push(`<strong>📊 매매 단계:</strong> ${tradeStageMap[stagePart]}`);
                currentIndex++;
            }
        }

        // 5. Symbol (종목명)
        if (parts[currentIndex]) {
            const symbolPart = parts[currentIndex];
            interpretation.push(`<strong>💱 종목명:</strong> ${symbolPart}`);
            currentIndex++;
        }

        // 6. Used Tool (FT5, TV, MT4)
        if (parts[currentIndex]) {
            const toolPart = parts[currentIndex];
            if (usedToolMap[toolPart]) {
                interpretation.push(`<strong>🛠️ 사용툴:</strong> ${usedToolMap[toolPart]}`);
                currentIndex++;
            }
        }

        // 7. Track Record (tR0, tR1)
        if (parts[currentIndex]) {
            const trackPart = parts[currentIndex];
            if (trackRecordMap[trackPart]) {
                interpretation.push(`<strong>📈 매매 이력:</strong> ${trackRecordMap[trackPart]}`);
                currentIndex++;
            }
        }

        // 8. Layout (L1, H1M15M5M1)
        if (parts[currentIndex]) {
            const layoutPart = parts[currentIndex];
            if (layoutMap[layoutPart]) {
                interpretation.push(`<strong>📐 레이아웃:</strong> ${layoutMap[layoutPart]}`);
                currentIndex++;
            } else if (layoutPart.match(/^[HhMm][0-9]+([HhMm][0-9]+)*$/)) {
                interpretation.push(`<strong>📐 레이아웃:</strong> ${layoutPart} (포괄형 기본)`);
                currentIndex++;
            }
        }

        // 9. Trade Direction (Buy, Sell, Range)
        if (parts[currentIndex]) {
            const directionPart = parts[currentIndex];
            if (tradeDirectionMap[directionPart]) {
                interpretation.push(`<strong>🎯 매매 방향:</strong> ${tradeDirectionMap[directionPart]}`);
                currentIndex++;
            }
        }

        // 10. Technical Analysis (나머지 모든 부분)
        let technicalAnalysis = [];
        while (currentIndex < parts.length) {
            const analysisPart = parts[currentIndex];
            if (customAnalysisMap[analysisPart]) {
                technicalAnalysis.push(`<span style="color:blue;">${analysisPart}</span> (${customAnalysisMap[analysisPart]})`);
            } else {
                technicalAnalysis.push(`<span style="color:orange;">${analysisPart}</span> (사전 미등록 약어)`);
            }
            currentIndex++;
        }

        if (technicalAnalysis.length > 0) {
            interpretation.push(`<strong>🔍 기술 분석:</strong><br>${technicalAnalysis.join('<br>')}`);
        } else {
            interpretation.push(`<strong>🔍 기술 분석:</strong> <span style="color:orange;">[분석 내용 없음]</span>`);
        }

        // 체계적 분석 결과 출력
        interpretationResult.innerHTML = `
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                <h4 style="margin: 0 0 10px 0; color: #495057;">📋 파일명 체계적 분석 결과</h4>
                ${interpretation.map(p => `<p style="margin: 5px 0;">${p}</p>`).join('')}
            </div>
        `;
        interpretationResult.classList.remove('error');
    };

    // Function to update background color based on market session
    function updateSessionBackground() {
        const selectedSession = document.querySelector('input[name="marketSession"]:checked');
        const container = document.querySelector('.container');
        
        // Remove all session classes
        container.classList.remove('session-tokyo', 'session-london', 'session-newyork');
        
        if (selectedSession) {
            switch (selectedSession.value) {
                case 'TK':
                    container.classList.add('session-tokyo');
                    break;
                case 'LD':
                    container.classList.add('session-london');
                    break;
                case 'NY':
                    container.classList.add('session-newyork');
                    break;
            }
        }
    }

    // Function to update select box highlighting
    function updateSelectHighlighting() {
        const selects = document.querySelectorAll('select');
        selects.forEach(select => {
            if (select.value === '' || select.value === '선택 안 함') {
                select.classList.add('unselected');
            } else {
                select.classList.remove('unselected');
            }
        });
    }

    // Function to update trend section background color
    function updateTrendBackground() {
        const selectedTrend = document.querySelector('input[name="trendDow"]:checked');
        const inputSection = document.querySelector('.input-section');
        
        // Remove all trend classes
        inputSection.classList.remove('trend-range', 'trend-uptrend', 'trend-downtrend');
        
        if (selectedTrend) {
            switch (selectedTrend.value) {
                case 'Range':
                    inputSection.classList.add('trend-range');
                    break;
                case 'UpTrend':
                    inputSection.classList.add('trend-uptrend');
                    break;
                case 'DownTrend':
                    inputSection.classList.add('trend-downtrend');
                    break;
            }
        }
    }

    // Function to update trade direction select box color
    function updateDirectionBackground() {
        const selectedDirection = document.getElementById('tradeDirection');
        
        // Remove all direction classes
        selectedDirection.classList.remove('direction-range', 'direction-buy', 'direction-sell');
        
        if (selectedDirection.value) {
            switch (selectedDirection.value) {
                case 'Range':
                    selectedDirection.classList.add('direction-range');
                    break;
                case 'Buy':
                    selectedDirection.classList.add('direction-buy');
                    break;
                case 'Sell':
                    selectedDirection.classList.add('direction-sell');
                    break;
            }
        }
    }

    // Event Listeners
    timeInput.addEventListener('input', generateFilename);
    marketSessionRadios.forEach(radio => {
        radio.addEventListener('change', generateFilename);
        radio.addEventListener('change', updateSessionBackground);
    });
    tradeStageRadios.forEach(radio => {
        radio.addEventListener('change', generateFilename);
    });
    tradeDirectionSelect.addEventListener('change', generateFilename);
    tradeDirectionSelect.addEventListener('change', updateDirectionBackground); 
    tradeDirectionSelect.addEventListener('change', updateSelectHighlighting);
    symbolSelect.addEventListener('change', generateFilename); 
    usedToolRadios.forEach(radio => {
        radio.addEventListener('change', generateFilename);
    });
    trackRecordRadios.forEach(radio => {
        radio.addEventListener('change', generateFilename);
    });
    // Add event listeners for all radio groups
    trendDowRadios.forEach(radio => {
        radio.addEventListener('change', generateFilename);
        radio.addEventListener('change', updateTrendBackground);
    });
    smaAnalysisSelect.addEventListener('change', generateFilename);
    smaAnalysisSelect.addEventListener('change', updateSelectHighlighting);
    roundNumberSelect.addEventListener('change', generateFilename);
    roundNumberSelect.addEventListener('change', updateSelectHighlighting);
    entryExitCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', generateFilename);
    });
    technicalCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', generateFilename);
    });
    failureAnalysisSelect.addEventListener('change', generateFilename);
    failureAnalysisSelect.addEventListener('change', updateSelectHighlighting);
    priceActionSelect.addEventListener('change', generateFilename);
    priceActionSelect.addEventListener('change', updateSelectHighlighting);
    maArrangementSelect.addEventListener('change', generateFilename);
    maArrangementSelect.addEventListener('change', updateSelectHighlighting);

    document.querySelectorAll('.copy-preview-button').forEach(button => {
        button.addEventListener('click', () => {
            console.log('복사 버튼 클릭됨');
            const filenameToCopy = previewL1.textContent;
            console.log('복사할 파일명:', filenameToCopy);
            if (!filenameToCopy || filenameToCopy.trim() === '') {
                alert('복사할 파일명이 없습니다. 먼저 파일명 구성 요소를 입력해주세요.');
                return;
            }
            console.log('copyToClipboard 함수 호출');
            copyToClipboard(filenameToCopy);
        });
    });

    // Initial setup
    generateFilename(); // Generate initial filename on load
    updateSessionBackground(); // Set initial background color
    updateSelectHighlighting(); // Set initial select box highlighting
    updateTrendBackground(); // Set initial trend background color
    updateDirectionBackground(); // Set initial direction background color

    // 파일 관리 기능 초기화
    initializeFileManagement();
});

// 파일 관리 기능
function initializeFileManagement() {
    const folderInput = document.getElementById('folderInput');
    const selectFolderBtn = document.getElementById('selectFolderBtn');
    const outputFolderInput = document.getElementById('outputFolderInput');
    const selectOutputFolderBtn = document.getElementById('selectOutputFolderBtn');
    const outputFolderPath = document.getElementById('outputFolderPath');
    const fileList = document.getElementById('fileList');
    const renamePreview = document.getElementById('renamePreview');
    const renameBtn = document.getElementById('renameBtn');
    const renameStatus = document.getElementById('renameStatus');
    
    // 요소들이 제대로 로드되었는지 확인
    console.log('파일 관리 요소들 확인:');
    console.log('folderInput:', folderInput);
    console.log('selectFolderBtn:', selectFolderBtn);
    console.log('outputFolderInput:', outputFolderInput);
    console.log('selectOutputFolderBtn:', selectOutputFolderBtn);
    console.log('outputFolderPath:', outputFolderPath);
    console.log('fileList:', fileList);
    console.log('renamePreview:', renamePreview);
    console.log('renameBtn:', renameBtn);
    console.log('renameStatus:', renameStatus);
    
    let selectedFiles = [];
    let currentFiles = [];
    let outputFolder = null;

    // 폴더 선택 버튼 클릭 이벤트
    selectFolderBtn.addEventListener('click', () => {
        folderInput.click();
    });

    // 저장 폴더 선택 버튼 클릭 이벤트
    selectOutputFolderBtn.addEventListener('click', () => {
        console.log('저장 폴더 선택 버튼 클릭됨');
        const folderName = prompt('저장할 폴더명을 입력하세요:');
        if (folderName && folderName.trim() !== '') {
            outputFolder = folderName.trim();
            outputFolderInput.value = folderName.trim();
            outputFolderPath.textContent = `선택된 폴더: ${folderName.trim()}`;
            outputFolderPath.style.color = '#28a745';
            console.log('저장 폴더 설정됨:', folderName.trim());
        }
    });

    // 폴더 선택 이벤트
    folderInput.addEventListener('change', (event) => {
        const files = Array.from(event.target.files);
        currentFiles = files;
        displayFiles(files);
        updateRenamePreview();
    });

    // 저장 폴더 입력 이벤트 (직접 입력도 가능하도록)
    outputFolderInput.addEventListener('input', (event) => {
        const folderName = event.target.value.trim();
        if (folderName !== '') {
            outputFolder = folderName;
            outputFolderPath.textContent = `선택된 폴더: ${folderName}`;
            outputFolderPath.style.color = '#28a745';
        } else {
            outputFolder = null;
            outputFolderPath.textContent = '저장 폴더가 선택되지 않았습니다.';
            outputFolderPath.style.color = '#666';
        }
    });

    // 파일 목록 표시
    function displayFiles(files) {
        fileList.innerHTML = '';
        
        if (files.length === 0) {
            fileList.innerHTML = '<p class="no-files">폴더를 선택해주세요.</p>';
            return;
        }

        files.forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.dataset.index = index;
            
            const fileName = document.createElement('span');
            fileName.className = 'file-name';
            fileName.textContent = file.name;
            
            const fileSize = document.createElement('span');
            fileSize.className = 'file-size';
            fileSize.textContent = formatFileSize(file.size);
            
            fileItem.appendChild(fileName);
            fileItem.appendChild(fileSize);
            
            fileItem.addEventListener('click', () => {
                toggleFileSelection(index);
            });
            
            fileList.appendChild(fileItem);
        });
    }

    // 파일 선택 토글
    function toggleFileSelection(index) {
        const fileItem = fileList.querySelector(`[data-index="${index}"]`);
        
        if (selectedFiles.includes(index)) {
            selectedFiles = selectedFiles.filter(i => i !== index);
            fileItem.classList.remove('selected');
        } else {
            selectedFiles.push(index);
            fileItem.classList.add('selected');
        }
        
        updateRenameBtn();
    }

    // 파일 크기 포맷팅
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // 파일명 변경 버튼 업데이트
    function updateRenameBtn() {
        renameBtn.disabled = selectedFiles.length === 0;
        
        // artisAsset 업로드 버튼도 같이 업데이트
        const uploadToArtisBtn = document.getElementById('uploadToArtisBtn');
        if (uploadToArtisBtn) {
            uploadToArtisBtn.disabled = selectedFiles.length === 0;
        }
    }

    // 파일명 변경 미리보기 업데이트
    function updateRenamePreview() {
        const currentFilename = document.getElementById('preview-L1').textContent;
        renamePreview.textContent = currentFilename || '파일명을 생성해주세요.';
    }

    // 파일명 변경 버튼 클릭 이벤트
    renameBtn.addEventListener('click', () => {
        if (selectedFiles.length === 0) {
            showRenameStatus('선택된 파일이 없습니다.', 'error');
            return;
        }

        const currentFilename = document.getElementById('preview-L1').textContent;
        if (!currentFilename || currentFilename.trim() === '') {
            showRenameStatus('먼저 파일명을 생성해주세요.', 'error');
            return;
        }

        if (!outputFolder) {
            showRenameStatus('저장 폴더를 선택해주세요.', 'error');
            return;
        }

        // 선택된 파일들을 새 이름으로 다운로드
        selectedFiles.forEach(index => {
            const file = currentFiles[index];
            downloadFileWithNewName(file, currentFilename, outputFolder);
            
            // 스프레드시트에 로그 기록
            const timestamp = new Date().toISOString();
            window.logFilenameChange(file.name, currentFilename, outputFolder, timestamp);
        });

        showRenameStatus(`${selectedFiles.length}개 파일이 '${outputFolder}' 폴더에 새 이름으로 다운로드되었습니다.`, 'success');
        
        // 선택 해제
        selectedFiles.forEach(index => {
            const fileItem = fileList.querySelector(`[data-index="${index}"]`);
            if (fileItem) {
                fileItem.classList.remove('selected');
            }
        });
        selectedFiles = [];
        updateRenameBtn();
    });

    // 새 이름으로 파일 다운로드
    function downloadFileWithNewName(file, newName, outputFolder) {
        const extension = getFileExtension(file.name);
        const newFileName = newName + extension;
        
        // 브라우저 보안상 직접적인 폴더 지정은 불가능하므로,
        // 파일명에 폴더 정보를 포함하여 사용자가 쉽게 구분할 수 있도록 함
        const link = document.createElement('a');
        link.href = URL.createObjectURL(file);
        link.download = newFileName;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(link.href);
        
        // 사용자에게 저장 위치 안내
        console.log(`파일 '${newFileName}'이 다운로드되었습니다. '${outputFolder}' 폴더로 이동시켜주세요.`);
    }

    // 파일 확장자 추출
    function getFileExtension(filename) {
        const lastDotIndex = filename.lastIndexOf('.');
        return lastDotIndex !== -1 ? filename.substring(lastDotIndex) : '';
    }

    // 상태 메시지 표시
    function showRenameStatus(message, type) {
        renameStatus.textContent = message;
        renameStatus.className = `rename-status ${type}`;
        
        setTimeout(() => {
            renameStatus.textContent = '';
            renameStatus.className = 'rename-status';
        }, 3000);
    }

    // 파일명 생성 시 미리보기 업데이트
    const originalGenerateFilename = window.generateFilename;
    window.generateFilename = function() {
        originalGenerateFilename();
        updateRenamePreview();
    };

    // 구글 스프레드시트 로그 기능 초기화
    initializeSpreadsheetLogging();
    
    // artisAsset 업로드 기능 초기화
    initializeArtisAssetUpload();
}

// 구글 스프레드시트 로그 기능
function initializeSpreadsheetLogging() {
    const spreadsheetId = document.getElementById('spreadsheetId');
    const sheetName = document.getElementById('sheetName');
    const enableLogging = document.getElementById('enableLogging');
    const testConnectionBtn = document.getElementById('testConnectionBtn');
    const connectionStatus = document.getElementById('connectionStatus');

    // 구글 API 초기화 (API 키만 사용)
    gapi.load('client', initClient);

    function initClient() {
        gapi.client.init({
            'apiKey': 'AIzaSyAzbzatYXC_DekGlhKftfvJ-fJgGpHqqLk',
            'discoveryDocs': ['https://sheets.googleapis.com/$discovery/rest?version=v4']
        }).then(function() {
            console.log('Google API 초기화 완료');
            updateConnectionStatus('unknown');
        }).catch(function(error) {
            console.error('Google API 초기화 실패:', error);
            updateConnectionStatus('error');
        });
    }

    // 연결 테스트 버튼 이벤트
    testConnectionBtn.addEventListener('click', testConnection);

                                        function testConnection() {
                        if (!spreadsheetId.value.trim()) {
                            alert('스프레드시트 ID를 입력해주세요.');
                            return;
                        }

                        // API 키만 사용하는 방식으로 변경
                        testSpreadsheetAccess();
                    }

                    function testSpreadsheetAccess() {
                    // 고정된 스프레드시트 ID 사용
                    const FIXED_SPREADSHEET_ID = '1m6iWoFV-TQkIJg7sycK9P0bwC227Q2noBLZJleOrgsc';
                    
                    gapi.client.sheets.spreadsheets.get({
                        spreadsheetId: FIXED_SPREADSHEET_ID
                    }).then(function(response) {
                        console.log('스프레드시트 접근 성공:', response);
                        updateConnectionStatus('connected');
                    }).catch(function(error) {
                        console.error('스프레드시트 접근 실패:', error);
                        updateConnectionStatus('error');
                    });
                }

    function updateConnectionStatus(status) {
        connectionStatus.textContent = `연결 상태: ${getStatusText(status)}`;
        connectionStatus.className = `connection-status ${status}`;
    }

    function getStatusText(status) {
        switch(status) {
            case 'connected': return '연결됨';
            case 'error': return '연결 실패';
            case 'unknown': return '미확인';
            default: return '알 수 없음';
        }
    }

                    // 파일명 변경 로그 기록 함수 (API 키만 사용)
                window.logFilenameChange = function(originalName, newName, outputFolder, timestamp) {
                    if (!enableLogging.checked) {
                        console.log('로깅이 비활성화되어 있습니다.');
                        return;
                    }

                    // 스프레드시트 설정 고정
                    const FIXED_SPREADSHEET_ID = '1m6iWoFV-TQkIJg7sycK9P0bwC227Q2noBLZJleOrgsc';
                    const FIXED_SHEET_NAME = 'Sheet1';

                                                // 현재 시트의 데이터 개수를 확인하여 번호 생성
                    gapi.client.sheets.spreadsheets.values.get({
                        spreadsheetId: FIXED_SPREADSHEET_ID,
                        range: `${FIXED_SHEET_NAME}!A:A`
                    }).then(function(response) {
                        const rowCount = response.result.values ? response.result.values.length : 1;
                        const logData = [
                            rowCount, // 자동 번호
                            timestamp,
                            originalName,
                            newName,
                            outputFolder,
                            new Date().toLocaleString('ko-KR')
                        ];

                        // API 키만 사용하는 방식으로 변경
                        gapi.client.sheets.spreadsheets.values.append({
                            spreadsheetId: FIXED_SPREADSHEET_ID,
                            range: `${FIXED_SHEET_NAME}!A:F`,
                            valueInputOption: 'RAW',
                            insertDataOption: 'INSERT_ROWS',
                            resource: {
                                values: [logData]
                            }
                        }).then(function(response) {
                            console.log('로그 기록 성공:', response);
                        }).catch(function(error) {
                            console.error('로그 기록 실패:', error);
                        });
                    }).catch(function(error) {
                        console.error('행 개수 확인 실패:', error);
                    });
    };
}

// artisAsset 업로드 기능
function initializeArtisAssetUpload() {
    const uploadToArtisBtn = document.getElementById('uploadToArtisBtn');
    const uploadStatus = document.getElementById('uploadStatus');
    
    if (!uploadToArtisBtn || !uploadStatus) {
        console.log('artisAsset 업로드 요소를 찾을 수 없습니다.');
        return;
    }
    
    // artisAsset API 클라이언트 초기화
    const ARTIS_ASSET_API_BASE = 'http://localhost:8001/api';
    
    // artisAsset 업로드 버튼 클릭 이벤트
    uploadToArtisBtn.addEventListener('click', async () => {
        if (selectedFiles.length === 0) {
            showUploadStatus('선택된 파일이 없습니다.', 'error');
            return;
        }

        const currentFilename = document.getElementById('preview-L1').textContent;
        if (!currentFilename || currentFilename.trim() === '') {
            showUploadStatus('먼저 파일명을 생성해주세요.', 'error');
            return;
        }

        // 서버 연결 상태 확인
        try {
            showUploadStatus('artisAsset 서버 연결 확인 중...', 'progress');
            const healthResponse = await fetch(`${ARTIS_ASSET_API_BASE}/health`);
            
            if (!healthResponse.ok) {
                throw new Error('서버 응답 오류');
            }
            
            // 선택된 파일들을 FormData로 준비
            const formData = new FormData();
            const filesToUpload = selectedFiles.map(index => currentFiles[index]);
            
            filesToUpload.forEach((file, index) => {
                // 파일명을 생성된 이름으로 변경
                const extension = getFileExtension(file.name);
                const newFileName = currentFilename.replace('.png', '') + `_${index + 1}${extension}`;
                
                // 새로운 파일 객체 생성 (이름 변경)
                const renamedFile = new File([file], newFileName, { type: file.type });
                formData.append('files', renamedFile);
            });
            
            showUploadStatus(`${filesToUpload.length}개 파일을 artisAsset에 업로드 중...`, 'progress');
            
            // artisAsset에 업로드
            const uploadResponse = await fetch(`${ARTIS_ASSET_API_BASE}/files/upload`, {
                method: 'POST',
                body: formData
            });
            
            if (!uploadResponse.ok) {
                const errorData = await uploadResponse.json().catch(() => ({}));
                throw new Error(errorData.detail || '업로드 실패');
            }
            
            const result = await uploadResponse.json();
            showUploadStatus(`✅ ${result.files ? result.files.length : filesToUpload.length}개 파일이 artisAsset에 성공적으로 저장되었습니다!`, 'success');
            
            // 선택 해제
            selectedFiles.forEach(index => {
                const fileItem = fileList.querySelector(`[data-index="${index}"]`);
                if (fileItem) {
                    fileItem.classList.remove('selected');
                }
            });
            selectedFiles = [];
            updateRenameBtn();
            
            // 스프레드시트에 로그 기록
            const timestamp = new Date().toISOString();
            filesToUpload.forEach(file => {
                window.logFilenameChange(file.name, currentFilename, 'artisAsset/charts', timestamp);
            });
            
        } catch (error) {
            console.error('artisAsset 업로드 오류:', error);
            let errorMessage = '업로드에 실패했습니다.';
            
            if (error.message.includes('Failed to fetch')) {
                errorMessage = '❌ artisAsset 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.';
            } else if (error.message) {
                errorMessage = `❌ ${error.message}`;
            }
            
            showUploadStatus(errorMessage, 'error');
        }
    });
    
    // 업로드 상태 메시지 표시
    function showUploadStatus(message, type) {
        uploadStatus.textContent = message;
        uploadStatus.className = `upload-status ${type}`;
        
        if (type === 'success' || type === 'error') {
            setTimeout(() => {
                uploadStatus.textContent = '';
                uploadStatus.className = 'upload-status';
            }, 5000);
        }
    }
    
    // 파일 확장자 추출 (중복 방지를 위해 전역으로 이동)
    if (typeof window.getFileExtension === 'undefined') {
        window.getFileExtension = function(filename) {
            const lastDotIndex = filename.lastIndexOf('.');
            return lastDotIndex !== -1 ? filename.substring(lastDotIndex) : '.png';
        };
    }
}

// ========================================
// artisAsset 리포트 템플릿 관리 함수들
// ========================================

const ARTIS_ASSET_API_BASE = 'http://localhost:8003/api';

// 현재 템플릿 불러오기
async function loadCurrentTemplate() {
    try {
        const response = await fetch(`${ARTIS_ASSET_API_BASE}/report/template`);
        if (response.ok) {
            const template = await response.json();
            document.getElementById('templateEditor').value = JSON.stringify(template, null, 2);
            document.getElementById('templateStatus').textContent = '템플릿 상태: 불러오기 완료';
            document.getElementById('templateStatus').className = 'connection-status connected';
        } else {
            throw new Error('템플릿 불러오기 실패');
        }
    } catch (error) {
        console.error('템플릿 불러오기 오류:', error);
        document.getElementById('templateStatus').textContent = '템플릿 상태: 불러오기 실패';
        document.getElementById('templateStatus').className = 'connection-status error';
    }
}

// 프리셋 템플릿 불러오기
async function loadPresetTemplate() {
    const preset = document.getElementById('templatePreset').value;
    if (!preset) return;
    
    if (preset === 'custom') {
        document.getElementById('templateEditor').value = '';
        document.getElementById('templateEditor').placeholder = '커스텀 템플릿을 JSON 형식으로 입력하세요...';
        return;
    }
    
    try {
        const response = await fetch(`${ARTIS_ASSET_API_BASE}/report/presets`);
        if (response.ok) {
            const presets = await response.json();
            if (presets[preset]) {
                document.getElementById('templateEditor').value = JSON.stringify(presets[preset], null, 2);
                document.getElementById('templateStatus').textContent = `템플릿 상태: ${preset} 프리셋 로드됨`;
                document.getElementById('templateStatus').className = 'connection-status connected';
            }
        }
    } catch (error) {
        console.error('프리셋 불러오기 오류:', error);
        document.getElementById('templateStatus').textContent = '템플릿 상태: 프리셋 로드 실패';
        document.getElementById('templateStatus').className = 'connection-status error';
    }
}

// 템플릿 저장
async function saveTemplate() {
    const templateText = document.getElementById('templateEditor').value.trim();
    if (!templateText) {
        alert('템플릿을 입력해주세요.');
        return;
    }
    
    try {
        const template = JSON.parse(templateText);
        
        const response = await fetch(`${ARTIS_ASSET_API_BASE}/report/template`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(template)
        });
        
        if (response.ok) {
            const result = await response.json();
            document.getElementById('templateStatus').textContent = '템플릿 상태: 저장 완료';
            document.getElementById('templateStatus').className = 'connection-status connected';
            alert('리포트 템플릿이 성공적으로 저장되었습니다!');
        } else {
            const error = await response.json();
            throw new Error(error.detail || '템플릿 저장 실패');
        }
    } catch (error) {
        console.error('템플릿 저장 오류:', error);
        document.getElementById('templateStatus').textContent = '템플릿 상태: 저장 실패';
        document.getElementById('templateStatus').className = 'connection-status error';
        alert(`템플릿 저장 실패: ${error.message}`);
    }
}

// 템플릿 미리보기
function testTemplate() {
    const templateText = document.getElementById('templateEditor').value.trim();
    if (!templateText) {
        alert('템플릿을 입력해주세요.');
        return;
    }
    
    try {
        const template = JSON.parse(templateText);
        
        let preview = `<h3>${template.title || '제목 없음'}</h3>\n`;
        
        if (template.sections && Array.isArray(template.sections)) {
            template.sections.forEach(section => {
                preview += `<h4>${section.title || '제목 없음'}</h4>\n`;
                if (section.items && Array.isArray(section.items)) {
                    preview += '<ul>\n';
                    section.items.forEach(item => {
                        preview += `<li>${item}</li>\n`;
                    });
                    preview += '</ul>\n';
                }
            });
        }
        
        document.getElementById('previewContent').innerHTML = preview;
        document.getElementById('templateStatus').textContent = '템플릿 상태: 미리보기 생성됨';
        document.getElementById('templateStatus').className = 'connection-status connected';
        
    } catch (error) {
        document.getElementById('previewContent').innerHTML = `<p style="color: red;">JSON 형식 오류: ${error.message}</p>`;
        document.getElementById('templateStatus').textContent = '템플릿 상태: JSON 형식 오류';
        document.getElementById('templateStatus').className = 'connection-status error';
    }
}
  