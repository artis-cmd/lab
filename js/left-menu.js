document.addEventListener("DOMContentLoaded", function () {
    // 초기 상태에서 모든 서브메뉴를 닫힌 상태로 설정
    const allSubmenus = document.querySelectorAll(".submenu");
    allSubmenus.forEach(submenu => {
        submenu.style.display = "none";
    });

    // 1단계 메뉴 토글
    const menuToggles = document.querySelectorAll(".menu-toggle");
    menuToggles.forEach(toggle => {
        toggle.addEventListener("click", function () {
            const submenu = this.nextElementSibling;
            if (submenu.style.display === "block") {
                submenu.style.display = "none";
            } else {
                submenu.style.display = "block";
            }
        });
    });

    // 2단계 메뉴(submenu-group) 토글
    const submenuGroups = document.querySelectorAll(".submenu-group");
    submenuGroups.forEach(group => {
        // 초기 상태에서 모든 2단계 메뉴 항목을 닫힌 상태로 설정
        let nextElement = group.nextElementSibling;
        while (nextElement && !nextElement.classList.contains("submenu-group")) {
            nextElement.style.display = "none";
            nextElement = nextElement.nextElementSibling;
        }

        group.addEventListener("click", function(e) {
            e.stopPropagation(); // 상위 메뉴 토글 방지
            
            // 현재 그룹 다음에 오는 모든 li 요소들을 찾아서 토글
            let nextElement = this.nextElementSibling;
            while (nextElement && !nextElement.classList.contains("submenu-group")) {
                if (nextElement.style.display === "block") {
                    nextElement.style.display = "none";
                } else {
                    nextElement.style.display = "block";
                }
                nextElement = nextElement.nextElementSibling;
            }
        });
    });
});

// 언어 전환 상태를 저장할 변수
let isKorean = false;

// 언어 전환 함수
function toggleLanguage() {
    isKorean = !isKorean;
    const button = document.getElementById('langToggle');
    button.style.background = isKorean ? '#4CAF50' : '#1a73e8';
    
    // 모든 메뉴 항목 전환
    document.querySelectorAll('[data-kr]').forEach(element => {
        // 이모지 추출
        const emoji = element.textContent.match(/^[^\s]*/)?.[0] || '';
        
        if (isKorean) {
            // 한글로 전환
            const koreanText = element.getAttribute('data-kr');
            if (emoji && koreanText) {
                element.textContent = `${emoji} ${koreanText}`;
            } else if (koreanText) {
                element.textContent = koreanText;
            }
        } else {
            // 영어로 전환
            const originalText = element.getAttribute('data-original') || element.textContent;
            if (!element.getAttribute('data-original')) {
                element.setAttribute('data-original', originalText);
            }
            element.textContent = originalText;
        }
    });
}

// 테마 토글 함수
function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // 모든 iframe에도 테마 적용
    const iframes = parent.document.querySelectorAll('iframe');
    iframes.forEach(iframe => {
        try {
            iframe.contentDocument.documentElement.setAttribute('data-theme', newTheme);
        } catch (e) {
            console.log('Cannot access iframe');
        }
    });
}

// 저장된 테마 불러오기
document.addEventListener('DOMContentLoaded', function() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
});
