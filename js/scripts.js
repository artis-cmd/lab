// 정적 메뉴 관련 변수들
var stmnLEFT = 24; 
var stmnGAP1 = 0;
var stmnGAP2 = 200;
var stmnBASE = 200;
var stmnActivateSpeed = 1;
var stmnScrollSpeed = 1;
var stmnTimer;

// 정적 메뉴 갱신 함수
function RefreshStaticMenu() { 
    var stmnStartPoint, stmnEndPoint; 
    stmnStartPoint = parseInt(document.getElementById('STATICMENU').style.top, 10); 
    stmnEndPoint = Math.max(document.documentElement.scrollTop, document.body.scrollTop) + stmnGAP2; 
    if (stmnEndPoint < stmnGAP1) stmnEndPoint = stmnGAP1; 
    if (stmnStartPoint != stmnEndPoint) { 
        stmnScrollAmount = Math.ceil( Math.abs( stmnEndPoint - stmnStartPoint ) / 15 ); 
        document.getElementById('STATICMENU').style.top = parseInt(document.getElementById('STATICMENU').style.top, 10) + ( ( stmnEndPoint<stmnStartPoint ) ? -stmnScrollAmount : stmnScrollAmount ) + 'px'; 
        stmnRefreshTimer = stmnScrollSpeed; 
    }
    stmnTimer = setTimeout("RefreshStaticMenu();", stmnActivateSpeed); 
} 

// 정적 메뉴 초기화
function InitializeStaticMenu() {
    document.getElementById('STATICMENU').style.right = stmnLEFT + 'px';
    document.getElementById('STATICMENU').style.top = document.body.scrollTop + stmnBASE + 'px'; 
    RefreshStaticMenu();
}

// 이미지 팝업 함수
function openImageInNewWindow(src) {
    var img = new Image();
    img.onload = function() {
        var imgWidth = this.width;
        var imgHeight = this.height;
        
        var windowWidth = imgWidth + 10;
        var windowHeight = imgHeight + 10;
        
        var screenWidth = window.screen.width;
        var screenHeight = window.screen.height;
        
        var left = (screenWidth - windowWidth) / 2;
        var top = (screenHeight - windowHeight) / 2;
        
        var newWindow = window.open("", "_blank", `width=${windowWidth},height=${windowHeight},left=${left},top=${top}`);
        
        newWindow.document.write(`
            <html>
            <head>
                <title>Original Size Image</title>
                <style>
                    body { margin: 0; padding: 5px; display: flex; flex-direction: column; justify-content: center; align-items: center; min-height: 100vh; background-color: #f0f0f0; }
                    img { display: block; max-width: 100%; max-height: calc(100vh - 40px); cursor: pointer; }
                    .close-info { margin-top: 10px; font-family: Arial, sans-serif; color: #666; }
                </style>
            </head>
            <body>
                <img src="${src}" alt="Original Size Image" onclick="window.close();">
                <div class="close-info">Click the image to close the window</div>
            </body>
            </html>
        `);
        newWindow.document.close();
    }
    img.src = src;
}

// 이미지 슬라이더 관련 변수와 함수들
const track = document.querySelector('.slider-track');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const pageInfo = document.getElementById('pageInfo');
const totalItems = document.querySelectorAll('.slider-item').length;
let currentIndex = 0;

// ★　창 크기 조정 시 자동으로 반응
function resizeImages() {
    const sliderItems = document.querySelectorAll(".slider-item img");
    sliderItems.forEach(img => {
        img.style.width = "100%";
        img.style.height = "auto"; // 비율 유지하면서 크기 조정
    });
}

// 창 크기 변경 시 이미지 크기 자동 조절
window.addEventListener("resize", resizeImages);
document.addEventListener("DOMContentLoaded", resizeImages);


// ✏️ 정규식을 확장하여 범용 정규식 적용（모두 대응）프롬프트, 료시 둘 다 
function getFileNumber(element) {
    if (!element) return "??"; // 요소가 없을 때 기본값 반환

    const img = element.querySelector('img');
    if (!img || !img.src) return "??"; // 이미지가 없거나 src가 없는 경우

    const imgSrc = img.src.split('/').pop(); // 파일명만 추출
    console.log("🔍 이미지 파일명:", imgSrc); // 디버깅용 콘솔 출력

    // 정규식: 다양한 패턴 대응 (예: PPT_Design-001.png, Image_01.jpg, Photo-02.jpeg)
    const match = imgSrc.match(/(?:[^\d]*)(\d+)\.(?:png|jpg|jpeg|gif)$/i);

    return match ? match[1] : "??"; // 숫자 부분 반환, 없으면 "??"
}

//  ✏️ 모든 페이지에서 null 없이 정상적으로 표시되도록 보완　totalItems를 페이지 업데이트 함수에 반영
function updateSlider() {
    if (!track) return;
    
    const sliderWidth = document.querySelector('.slider').offsetWidth;
    const offset = -currentIndex * sliderWidth;
    track.style.transform = `translateX(${offset}px)`;

    const currentSlide = document.querySelectorAll('.slider-item')[currentIndex];
    const currentNumber = getFileNumber(currentSlide);

    if (pageInfo) {
        console.log(`📌 현재 슬라이드: ${currentNumber} / ${totalItems}`); // 디버깅 로그 추가
        pageInfo.textContent = `${currentNumber} / ${totalItems}`;
    }

    if (prevBtn) prevBtn.disabled = currentIndex === 0;
    if (nextBtn) nextBtn.disabled = currentIndex === totalItems - 1;
}


// 챕터 토글 함수
function toggleChapter(element) {
    var content = element.nextElementSibling;
    content.style.display = content.style.display === "block" ? "none" : "block";
}

// 팝업 관련 함수들
function showPopup(event) {
    hidePopup();
    const popup = event.currentTarget.querySelector('.popup');
    if (popup) {
        popup.style.display = 'block';
        popup.style.top = `${event.currentTarget.offsetHeight}px`;
        popup.style.left = '0';
    }
}

function hidePopup() {
    document.querySelectorAll('.popup').forEach(popup => popup.style.display = 'none');
}

function showDetail(event, html) {
    event.preventDefault();
    const detailSection = document.getElementById('detail-section');
    if (detailSection) detailSection.innerHTML = html;
}

// DOM 로드 완료 시 초기화
document.addEventListener("DOMContentLoaded", function () {
    console.log("✅ DOM 로드 완료");

    // ✅ 검색 개수 표시 요소 초기화 (초기 메시지 표시)
    let searchSummary = document.getElementById("search-summary");
    if (searchSummary) {
        searchSummary.innerHTML = `<span style="color: gray;">⬆️ 검색어를 입력하세요.</span>`;
    } else {
        console.error("🚨 오류: 검색 결과 개수를 표시할 요소(id='search-summary')를 찾을 수 없습니다.");
    }

    // ✅ 검색 개수 표시 요소 확인
    let searchCount = document.getElementById("search-count");
    if (!searchCount) {
        console.error("🚨 오류: 검색 개수를 표시할 요소(id=search-count)를 찾을 수 없습니다.");
    } else {
        console.log("✅ 검색 개수 표시 요소 찾음:", searchCount);
    }

    // ✅ `searchFiles`를 글로벌 범위에 등록 (이벤트에서 호출 가능하도록)
    window.searchFiles = searchFiles;

    // ✅ 검색창(`search-box`) 이벤트 리스너 추가
    let searchBox = document.getElementById("search-box");

    if (searchBox) {
        // 🔹 입력할 때마다 검색 실행 (디바운싱 적용)
        let debounceTimer;
        searchBox.addEventListener("input", function () {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(searchFiles, 500); // 0.5초 지연 후 실행
        });

        // 🔹 Enter 키 입력 시 즉시 검색 실행
        searchBox.addEventListener("keypress", function (event) {
            if (event.key === "Enter") {
                searchFiles();
            }
        });
    } else {
        console.warn("❗ 검색 입력창(id='search-box')을 찾을 수 없습니다.");
    }

    // 🔹 `.dropdown-toggle` 초기화
    let dropdownToggles = document.querySelectorAll('.dropdown-toggle');

    if (dropdownToggles.length === 0) {
        console.warn("🚨 `.dropdown-toggle` 요소를 찾을 수 없습니다. HTML을 확인하세요.");
    } else {
        console.log("✅ `.dropdown-toggle` 요소 찾음:", dropdownToggles.length, "개");
    }

    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', function () {
            console.log("🔽 드롭다운 클릭됨:", this.textContent.trim());

            let content = this.nextElementSibling;
            if (!content) {
                console.warn("🚨 `.dropdown-toggle` 클릭했지만, 다음 요소를 찾을 수 없습니다.");
                return;
            }

            // 🔽 기존 열려 있던 드롭다운 닫고, 클릭한 것만 토글
            let allDropdowns = document.querySelectorAll('.dropdown-content');
            allDropdowns.forEach(drop => {
                if (drop !== content) drop.style.display = 'none';
            });

            // 🔹 현재 클릭한 항목만 토글
            content.style.display = (content.style.display === 'block') ? 'none' : 'block';

            // 🔹 ▼ / ▲ 아이콘 변경
            if (this.textContent.includes('▼')) {
                this.textContent = this.textContent.replace('▼', '▲');
            } else {
                this.textContent = this.textContent.replace('▲', '▼');
            }
        });
    });

    // 🔹 아코디언 초기화
    document.querySelectorAll('.accordion-header').forEach(header => {
        header.addEventListener('click', () => {
            let content = header.nextElementSibling;
            if (!content) return;

            content.style.display = content.style.display === 'block' ? 'none' : 'block';
        });
    });

    // ✅ 검색 결과 클릭 이벤트 코드 (변경 필요)
    document.querySelectorAll('.search-result a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault(); // 기본 동작 방지 (새 창에서 열리는 것 방지)
            let fileUrl = this.getAttribute('href'); // 클릭된 링크의 href 값 가져오기
            window.location.href = fileUrl; // Flask 서버에서 파일 로드
        });
    });

    
    // 🔹 슬라이더 버튼 이벤트 초기화
    let prevBtn = document.getElementById('prevBtn');
    let nextBtn = document.getElementById('nextBtn');
    let track = document.querySelector('.slider-track');

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentIndex > 0) {
                currentIndex--;
                updateSlider();
            }
        });
    } else {
        console.warn("❗ prevBtn 요소를 찾을 수 없습니다.");
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (currentIndex < totalItems - 1) {
                currentIndex++;
                updateSlider();
            }
        });
    } else {
        console.warn("❗ nextBtn 요소를 찾을 수 없습니다.");
    }

    // 🔹 슬라이더 초기화
    if (track) {
        updateSlider();
    } else {
        console.warn("❗ 슬라이더 트랙 요소를 찾을 수 없습니다.");
    }
});

// 창 크기 변경 시 툴팁 위치 조정
window.addEventListener('resize', function() {
    const tooltips = document.querySelectorAll('.tooltip');
    const windowWidth = window.innerWidth;
    
    tooltips.forEach(tooltip => {
        tooltip.classList.remove('left', 'right');
        const rect = tooltip.getBoundingClientRect();
        
        if (rect.left < 300) {
            tooltip.classList.add('left');
        } else if (windowWidth - rect.right < 300) {
            tooltip.classList.add('right');
        }
    });
});

// 백스페이스 키 네비게이션
document.addEventListener('keydown', function(event) {
    if (event.key === 'Backspace' && !['INPUT', 'TEXTAREA'].includes(event.target.tagName)) {
        event.preventDefault();
        history.back();
    }
});

// 📌 프롬프트 내용 토글 함수
function togglePrompt(element) {
    // prompt-item 다음 요소 (prompt-content)를 찾아서 보이게/숨기게 변경
    let content = element.nextElementSibling;

    if (content && content.classList.contains('prompt-content')) {
        content.style.display = (content.style.display === 'none' || content.style.display === '') ? 'block' : 'none';
    }
}

// 프롬프트 복사 함수
function copyPrompt(elementId) {
    const text = document.getElementById(elementId).textContent;
    navigator.clipboard.writeText(text)
        .then(() => {
            alert('프롬프트가 복사되었습니다!');
        })
        .catch(err => {
            console.error('복사 중 오류가 발생했습니다:', err);
        });
}

// 프롬프트 검색 함수
function searchPrompts() {
    const searchBox = document.getElementById("search-box");
    const query = searchBox.value.trim().toLowerCase();
    const prompts = document.querySelectorAll(".prompt-item");
    const searchCount = document.getElementById("search-count");
    const noResults = document.getElementById("no-results");

    let visibleCount = 0;

    prompts.forEach(prompt => {
        const text = prompt.textContent.toLowerCase();
        if (text.includes(query)) {
            prompt.style.display = "block";
            visibleCount++;
        } else {
            prompt.style.display = "none";
        }
    });

    if (visibleCount === 0) {
        searchCount.innerHTML = `<span style="color: red;">❌ "<strong>${query}</strong>" 검색 결과 없음</span>`;
    } else {
        searchCount.innerHTML = `<span style="color: blue;">🔍 "<strong>${query}</strong>" 검색 결과 : 총 ${visibleCount}개</span>`;
    }
    
}


// 🔹 디바운싱 최적화 (300ms 대기 후 실행)
let debounceTimer;
// 🔹 검색 로직 구현
// 파일 열기 기능 디버깅을 위한 코드
function openFile(filepath) {
    console.log('🔍 파일 열기 시도:', filepath);
    
    // 디버깅을 위한 상세 정보 표시
    const debugInfo = document.getElementById('debug-info');
    if (debugInfo) {
        document.getElementById('clicked-url').textContent = filepath;
        document.getElementById('file-exists').textContent = '확인 중...';
    }

    fetch(`http://192.168.1.26:5000/open-file?path=${encodeURIComponent(filepath)}`)
        .then(response => {
            console.log('✅ 서버 응답:', response);
            if (!response.ok) throw new Error('서버 응답 실패');
            // 파일 열기 성공 시 실제로 파일을 여는 코드 추가
            window.location.href = filepath;
            
            if (debugInfo) {
                document.getElementById('file-exists').textContent = '파일 존재함';
                document.getElementById('script-status').textContent = '성공';
            }
        })
        .catch(error => {
            console.error('❌ 파일 열기 실패:', error);
            if (debugInfo) {
                document.getElementById('file-exists').textContent = '파일을 찾을 수 없음';
                document.getElementById('script-status').textContent = '에러: ' + error.message;
                // 클립보드에 파일 경로 복사 시도
                navigator.clipboard.writeText(filepath).then(() => {
                    console.log('✅ 파일 경로가 클립보드에 복사됨:', filepath);
                }).catch(err => {
                    // 클립보드 복사 실패시 에러 로깅
                    console.error('❌ 클립보드 복사 실패:', err);
                });
            }
        });
}
function searchFiles() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
        let query = document.getElementById("search-box").value.trim();
        let resultsContainer = document.getElementById("search-results");
        let searchCount = document.getElementById("search-count");

        if (!searchCount) {
            console.error("🚨 오류: 검색 개수를 표시할 요소(id=search-count)를 찾을 수 없습니다.");
            return;
        }

        console.log("🔍 검색어 입력됨:", query);
        console.log("🔍 검색 개수 표시 요소 찾음:", searchCount);

        // 🔸 검색어가 2자 미만이면 요청하지 않음
        if (query.length < 2) {
            resultsContainer.innerHTML = "";
            searchCount.innerHTML = "🔹 검색어를 2자 이상 입력하세요.";
            return;
        }

        try {
            let response = await fetch(`http://192.168.1.26:5000/search?query=${query}`);
            let data = await response.json();

            resultsContainer.innerHTML = "";

            // 🔸 검색 결과 없음 처리
            if (!data.results || data.results.length === 0) {
                resultsContainer.innerHTML = `<li class="no-results">❌ 검색 결과가 없습니다.</li>`;
                searchCount.innerHTML = `❌ "<span class="search-keyword">${query}</span>" 검색 결과 : 총 0개`;
                resultsContainer.classList.remove("has-results");
                return;
            }

            // ✅ 검색 결과 표시
            resultsContainer.classList.add("has-results");
            console.log("✅ 검색된 결과 개수:", data.results.length);
            searchCount.innerHTML = `🔍 "<span class="search-keyword">${query}</span>" 검색 결과 : 총 ${data.results.length}개`;

            // 🔹 검색 결과 목록 생성 - 파일 열기 방식 수정
            data.results.forEach(file => {
                let li = document.createElement("li");
                // 파일 경로를 서버 엔드포인트로 전달하여 파일 열기 요청
                li.innerHTML = `
                    ✅ <strong>${file.filename.replace(new RegExp(query, "gi"), match => `<span class="search-keyword">${match}</span>`)}</strong>  
                    <a href="http://192.168.1.26:5000/open-file?path=${encodeURIComponent(file.filepath)}" 
                       onclick="openFile('${file.filepath}'); return false;" 
                       style="margin-left: 10px; font-size: 14px; color: blue; text-decoration: underline;">[파일 열기]</a>  
                    <br>📁 <span class="copy-path" style="color: gray; cursor: pointer;" onclick="copyToClipboard(event, '${file.filepath}')">${file.filepath}</span>  
                    <span style="font-size: 12px; color: green; display: none;" class="copy-success">✔️ 복사됨!</span>`;
                resultsContainer.appendChild(li);
            });

        } catch (error) {
            // 🔸 에러 처리
            resultsContainer.innerHTML = "<li>🚨 서버 오류 발생</li>";
            searchCount.innerHTML = "🚨 서버 오류로 검색이 실패했습니다.";
            console.error("검색 오류:", error);
        }
    }, 300); // 🔹 300ms 디바운싱 적용
}

// ✅ 검색 결과가 없을 때 ul#search-results 숨기기
async function searchFiles() {
    let query = document.getElementById("search-box").value.trim();
    let resultsContainer = document.getElementById("search-results");
    let searchCount = document.getElementById("search-count");

    if (!searchCount) {
        console.error("🚨 오류: 검색 개수를 표시할 요소(id=search-count)를 찾을 수 없습니다.");
        return;
    }

    console.log("🔍 검색어 입력됨:", query);
    console.log("🔍 검색 개수 표시 요소 찾음:", searchCount);

    if (query.length < 2) {
        resultsContainer.innerHTML = "";
        resultsContainer.style.display = "none";  // ✅ 검색 결과 숨기기
        searchCount.innerHTML = "🔹 검색어를 2자 이상 입력하세요.";
        return;
    }

    try {
        let response = await fetch(`http://192.168.1.26:5000/search?query=${query}`);
        let data = await response.json();

        resultsContainer.innerHTML = "";

        if (!data.results || data.results.length === 0) {
            resultsContainer.innerHTML = `<li class="no-results">❌ 검색 결과가 없습니다.</li>`;
            resultsContainer.style.display = "none";  // ✅ 결과 없으면 숨김
            searchCount.innerHTML = `❌ "<span class="search-keyword">${query}</span>" 검색 결과 : 총 0개`;
            return;
        }

        console.log("✅ 검색된 결과 개수:", data.results.length);
        searchCount.innerHTML = `🔍 "<span class="search-keyword">${query}</span>" 검색 결과 : 총 ${data.results.length}개`;

        // ✅ 검색 결과가 있으면 표시
        resultsContainer.style.display = "block";  

        data.results.forEach(file => {
            let li = document.createElement("li");
            li.innerHTML = `
                ✅ <strong>${file.filename.replace(new RegExp(query, "gi"), match => `<span class="search-keyword">${match}</span>`)}</strong>  
                <a href="file:///${file.filepath.replace(/\\/g, '/')}" target="_blank" style="margin-left: 10px; font-size: 14px; color: blue; text-decoration: underline;">[파일 열기]</a>  
                <br>📁 <span class="copy-path" style="color: gray; cursor: pointer;" onclick="copyToClipboard(event, '${file.filepath}')">${file.filepath}</span>  
                <span style="font-size: 12px; color: green; display: none;" class="copy-success">✔️ 복사됨!</span>`;
            resultsContainer.appendChild(li);
        });

    } catch (error) {
        resultsContainer.innerHTML = "<li>🚨 서버 오류 발생</li>";
        resultsContainer.style.display = "block";  // 오류 발생 시에도 표시
        searchCount.innerHTML = "🚨 서버 오류로 검색이 실패했습니다.";
        console.error("검색 오류:", error);
    }
}


// 📌 **경로를 클릭하면 클립보드에 복사되는 함수**
function copyToClipboard(event, text) {
    // 📌 **파일 경로에서 마지막 파일명 제거 (디렉토리 경로 유지)**
    let directoryPath = text.replace(/\\[^\\]+$/, ''); // 마지막 `\파일명` 제거

    // 📌 **드라이브 문자 뒤에 강제 `\` 추가 (`E:\OneDrive\HTML\main` 형식 유지)**
    directoryPath = directoryPath.replace(/^([A-Za-z]):(?!\\)/, '$1:\\');

    navigator.clipboard.writeText(directoryPath).then(() => {
        console.log("임시 복사된 디렉토리 경로:", directoryPath); // ✅ 디버깅 로그 확인

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


