// ai-docs.js

// GitHub Pages의 baseURL을 감지하는 함수
function getBaseUrl() {
    const isGitHubPages = window.location.hostname.includes('github.io');
    return isGitHubPages ? '/HTML' : '';
}

document.addEventListener('DOMContentLoaded', function() {
    const baseUrl = getBaseUrl();
    const links = document.querySelectorAll('.sidebar a');
    const sections = document.querySelectorAll('.step');
    
    // Smooth scrolling for navigation links
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
    
    // Highlight current section in navigation
    function highlightCurrentSection() {
        let currentSection = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.offsetHeight;
            const scrollPosition = window.scrollY;
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                currentSection = section.getAttribute('id');
            }
        });
        
        links.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
            }
        });
    }
    
    // Update navigation position on scroll
    function updateNavPosition() {
        const sidebar = document.querySelector('.sidebar');
        const scrollPosition = window.scrollY;
        const windowHeight = window.innerHeight;
        const sidebarHeight = sidebar.offsetHeight;
        
        // Calculate the maximum top position to keep the sidebar visible
        const maxTop = windowHeight - sidebarHeight - 20;
        
        // Update the top position based on scroll
        if (scrollPosition > 100) {
            sidebar.style.top = Math.min(scrollPosition - 100, maxTop) + 'px';
        } else {
            sidebar.style.top = '20px';
        }
        
        // Highlight the current section
        highlightCurrentSection();
    }
    
    // Add scroll event listener
    window.addEventListener('scroll', updateNavPosition);
    
    // Initial call to set the correct position and highlight
    updateNavPosition();

    // 모든 이미지에 클릭 이벤트 추가
    const images = document.querySelectorAll('.step-image img');
    images.forEach(img => {
        // GitHub Pages 환경에서 이미지 경로 수정
        if (baseUrl) {
            const currentSrc = img.getAttribute('src');
            if (currentSrc.startsWith('../../../')) {
                img.src = baseUrl + currentSrc.substring(8);
            }
        }
        
        img.style.cursor = 'pointer';
        img.addEventListener('click', function() {
            openImageInNewWindow(this.src);
        });
    });

    // 1단계 드롭다운 토글
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const content = this.nextElementSibling;
            content.classList.toggle('show');
        });
    });

    // 2단계 메뉴 토글
    const level2Toggles = document.querySelectorAll('.level-2');
    level2Toggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const content = this.nextElementSibling;
            if (content && content.classList.contains('level-2-content')) {
                content.classList.toggle('show');
            }
        });
    });
});

// 이미지를 새 창에서 크게 보기
function openImageInNewWindow(src) {
    const width = window.screen.width * 0.8;
    const height = window.screen.height * 0.8;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;
    
    const newWindow = window.open('', '_blank', 
        `width=${width},height=${height},left=${left},top=${top}`);
    
    newWindow.document.write(`
        <html>
        <head>
            <title>이미지 보기</title>
            <style>
                body { 
                    margin: 0; 
                    padding: 0; 
                    display: flex; 
                    justify-content: center; 
                    align-items: center; 
                    min-height: 100vh; 
                    background-color: rgba(0, 0, 0, 0.9);
                }
                img { 
                    max-width: 100%; 
                    max-height: 100vh; 
                    object-fit: contain;
                }
            </style>
        </head>
        <body>
            <img src="${src}" alt="확대된 이미지">
        </body>
        </html>
    `);
}

// 네비게이션 스크롤 기능
document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.sidebar a');
    const sections = document.querySelectorAll('.step');
    
    // 네비게이션 링크 클릭 시 부드러운 스크롤
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
    
    // 스크롤 시 현재 섹션 하이라이트
    function highlightCurrentSection() {
        const scrollPosition = window.scrollY;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionBottom = sectionTop + section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }
    
    // 스크롤 이벤트 리스너
    window.addEventListener('scroll', highlightCurrentSection);
    
    // 초기 로드 시 현재 섹션 하이라이트
    highlightCurrentSection();
}); 