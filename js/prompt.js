// 프롬프트 토글 함수
function togglePrompt(element) {
    const content = element.nextElementSibling;
    if (content.style.display === "none" || !content.style.display) {
        content.style.display = "block";
    } else {
        content.style.display = "none";
    }
}

// 프롬프트 복사 함수
function copyPrompt(promptId) {
    const promptText = document.getElementById(promptId).textContent;
    
    // 임시 textarea 생성
    const textarea = document.createElement('textarea');
    textarea.value = promptText;
    document.body.appendChild(textarea);
    
    try {
        // 텍스트 선택 및 복사
        textarea.select();
        document.execCommand('copy');
        
        // 복사 성공 표시
        const button = event.target;
        const originalText = button.textContent;
        button.textContent = "복사 완료!";
        setTimeout(() => {
            button.textContent = originalText;
        }, 2000);
    } catch (err) {
        console.error('복사 실패:', err);
        alert('복사에 실패했습니다. 다시 시도해주세요.');
    } finally {
        // 임시 textarea 제거
        document.body.removeChild(textarea);
    }
}

// 프롬프트 검색 함수
function searchPrompts() {
    const searchText = document.getElementById('search-box').value.toLowerCase();
    const promptItems = document.querySelectorAll('.prompt-item');
    const noResults = document.getElementById('no-results');
    let foundCount = 0;

    promptItems.forEach(item => {
        const promptText = item.textContent.toLowerCase();
        const promptContent = item.nextElementSibling;
        
        if (promptText.includes(searchText)) {
            item.style.display = 'flex';
            foundCount++;
        } else {
            item.style.display = 'none';
            if (promptContent) {
                promptContent.style.display = 'none';
            }
        }
    });

    // 검색 결과 카운트 업데이트
    const searchCount = document.getElementById('search-count');
    if (foundCount > 0) {
        searchCount.textContent = `🔎 ${foundCount}개의 프롬프트를 찾았습니다.`;
        noResults.style.display = 'none';
    } else {
        searchCount.textContent = '';
        noResults.style.display = 'block';
    }
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    // 검색창 포커스
    const searchBox = document.getElementById('search-box');
    if (searchBox) {
        searchBox.focus();
    }
}); 