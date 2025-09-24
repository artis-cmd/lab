// E:\OneDrive\HTML\js\search.js


// 🔹 서버 IP 주소 (필요에 따라 변경)
const SERVER_IP = "http://192.168.1.26:5000";

// 🔹 검색 관련 요소들
const searchBox = document.getElementById("searchBox");
const searchResults = document.getElementById("searchResults");
const searchResultCount = document.getElementById("searchResultCount");
const searchState = document.getElementById("search-state");
const currentUrl = document.getElementById("currentUrl");
const processStatus = document.getElementById("processStatus");
const searchStatus = document.getElementById("searchStatus");
const loadingStatus = document.getElementById("loadingStatus");

// 🔹 디바운싱 타이머
let debounceTimer;

// 🔹 검색 상태 업데이트 함수
const updateSearchState = (url, process, search, loading) => {
    currentUrl.textContent = url;
    processStatus.textContent = process;
    searchStatus.textContent = search;
    loadingStatus.textContent = loading;
};

// 🔹 파일 열기 함수를 경로 복사 함수로 변경
const copyFilePath = (filepath) => {
    // HTML 폴더를 기준으로 경로 수정
    const adjustedPath = filepath.startsWith('/HTML/') ? filepath : `/HTML${filepath}`;
    
    // 클립보드에 복사
    navigator.clipboard.writeText(adjustedPath)
        .then(() => {
            updateSearchState(adjustedPath, "복사 완료", "검색 완료", "성공");
            alert("✅ 파일 경로가 클립보드에 복사되었습니다!");
        })
        .catch(error => {
            console.error('❌ 복사 실패:', error);
            updateSearchState(adjustedPath, "복사 실패", "검색 완료", "실패");
            alert("❌ 클립보드 복사에 실패했습니다.");
        });
};

// 🔹 검색 함수
const searchFiles = async (query) => {
    updateSearchState(window.location.href, "처리중", "검색중", "로딩중");
    searchResults.innerHTML = ""; // 검색 결과 초기화
    searchResultCount.innerHTML = ""; // 검색 결과 개수 초기화

    // 🔹 검색어가 2자 미만이면 요청하지 않음
    if (query.length < 2) {
        searchResultCount.innerHTML = "🔹 검색어를 2자 이상 입력하세요.";
        updateSearchState(window.location.href, "대기중", "검색 전", "대기중");
        return;
    }

    try {
        const response = await fetch(`${SERVER_IP}/search?query=${query}`);
        const data = await response.json();

        // 🔹 검색 결과 없음 처리
        if (!data.results || data.results.length === 0) {
            searchResults.innerHTML = `<li class="no-results">❌ 검색 결과가 없습니다.</li>`;
            searchResultCount.innerHTML = `❌ "<span class="search-keyword">${query}</span>" 검색 결과 : 총 0개`;
            updateSearchState(window.location.href, "대기중", "검색 완료", "대기중");
            return;
        }
        
        // 🔹 검색 결과 표시
        searchResults.classList.add("has-results");
        searchResultCount.innerHTML = `🔍 "<span class="search-keyword">${query}</span>" 검색 결과 : 총 ${data.results.length}개`;

        // 🔹 검색 결과 목록 생성 - 파일 열기 방식 수정
        data.results.forEach(file => {
            const li = document.createElement("li");
            li.classList.add("search-result-item");
            
            li.innerHTML = `
                <div class="search-result-container">
                    <div class="result-filename">✅ ${file.filename}</div>
                    <div class="path-text" style="display: flex; align-items: center; gap: 10px;">
                        <span>📁 ${file.filepath}</span>
                        <button 
                            onclick="copyText('${file.filepath}', this)" 
                            style="padding: 5px 10px; border: 1px solid #ccc; border-radius: 4px; cursor: pointer; transition: all 0.3s;">
                            📋 복사
                        </button>
                    </div>
                </div>
            `;
            searchResults.appendChild(li);
        });
        updateSearchState(window.location.href, "대기중", "검색 완료", "대기중");
    } catch (error) {
        // 🔹 에러 처리
        searchResults.innerHTML = "<li>🚨 서버 오류 발생</li>";
        searchResultCount.innerHTML = "🚨 서버 오류로 검색이 실패했습니다.";
        console.error("검색 오류:", error);
        updateSearchState(window.location.href, "처리 실패", "검색 실패", "로딩 실패");
    }
};

// 🔹 검색창의 이벤트를 처리하는 함수
const handleSearch = () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        const query = searchBox.value.trim();
        searchFiles(query);
    }, 300);
};

// 🔹 검색창에 이벤트 리스너 추가
searchBox.addEventListener('input', handleSearch);

// 📌 **경로를 클릭하면 클립보드에 복사되는 함수**
function copyToClipboard(event, text) {
    // 📌 **파일 경로에서 마지막 파일명 제거 (디렉토리 경로 유지)**
    let directoryPath = text.replace(/[^\\/]+$/, ''); // 마지막 `\파일명` 제거

    // 📌 **드라이브 문자 뒤에 강제 `\` 추가 (`E:\OneDrive\HTML\main` 형식 유지)**
    directoryPath = directoryPath.replace(/^([A-Za-z]):(?!\\)/, '$1:\\');

    navigator.clipboard.writeText(directoryPath).then(() => {

        let copiedElements = document.querySelectorAll(".copy-success");
        copiedElements.forEach(el => el.style.display = "none"); // 기존 메시지 숨김

        let target = event.target.nextElementSibling;
        if (target) {
            target.style.display = "inline"; // ✅ "복사됨!" 메시지 표시
            target.onclick = () => {
                target.style.display = "none"; // ✅ 클릭하면 메시지 숨김
            };
        }
    }).catch(err => {
        console.error("복사 실패:", err);
    });
}

// 🔹 초기 상태 설정
updateSearchState(window.location.href, "대기중", "검색 전", "대기중");

// 가장 단순한 텍스트 복사 함수
function copyText(text, buttonElement) {
    // 경로 앞에 'E:/OneDrive/HTML' 추가
    const fullPath = `E:/OneDrive/HTML${text}`;
    
    // 텍스트 복사
    const textarea = document.createElement('textarea');
    textarea.value = fullPath;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    
    // 버튼 스타일 변경 및 피드백
    buttonElement.innerHTML = '✅ 복사완료!';
    buttonElement.style.backgroundColor = '#4CAF50';
    buttonElement.style.color = 'white';
    
    // 2초 후 원래 상태로 복구
    setTimeout(() => {
        buttonElement.innerHTML = '📋 복사';
        buttonElement.style.backgroundColor = '';
        buttonElement.style.color = '';
    }, 2000);
}
