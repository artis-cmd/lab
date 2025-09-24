document.addEventListener('DOMContentLoaded', function() {
    const content = document.getElementById('content');
    const quickNote = document.getElementById('quick-note');
    const saveNoteBtn = document.getElementById('save-note');

    // 메뉴 항목 클릭 이벤트
    document.querySelectorAll('.left-column a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            loadContent(this.id);
        });
    });

    // 빠른 메모 저장
    saveNoteBtn.addEventListener('click', function() {
        const note = quickNote.value;
        if (note) {
            localStorage.setItem('quickNote', note);
            alert('메모가 저장되었습니다!');
        }
    });

    // 저장된 메모 불러오기
    const savedNote = localStorage.getItem('quickNote');
    if (savedNote) {
        quickNote.value = savedNote;
    }

    // 콘텐츠 로드 함수
    function loadContent(contentId) {
        let contentHTML = '';
        switch(contentId) {
            case 'market-analysis':
                contentHTML = `<h2>시장 분석</h2>
                               <p>1. 기술적 분석: 차트 패턴, 지표 등을 활용한 분석</p>
                               <p>2. 기본적 분석: 경제 지표, 기업 실적 등을 고려한 분석</p>
                               <p>3. 시장 심리 분석: 투자자 심리와 시장 분위기 파악</p>`;
                break;
            case 'trading-strategies':
                contentHTML = `<h2>트레이딩 전략</h2>
                               <p>1. 추세 추종 전략: 장기적인 시장 방향성에 베팅</p>
                               <p>2. 반전 거래 전략: 단기적인 가격 반등에 베팅</p>
                               <p>3. 브레이크아웃 전략: 주요 지지/저항선 돌파 시 진입</p>`;
                break;
            case 'risk-management':
                contentHTML = `<h2>리스크 관리</h2>
                               <p>1. 포지션 사이징: 적절한 거래 규모 설정</p>
                               <p>2. 손절매: 손실 제한을 위한 전략</p>
                               <p>3. 분산 투자: 리스크 분산을 위한 포트폴리오 구성</p>`;
                break;
        }
        content.innerHTML = contentHTML;
    }

    // 초기 콘텐츠 로드
    loadContent('market-analysis');
});
