document.addEventListener('DOMContentLoaded', function () {
    console.log("✅ DOM이 로드되었습니다.");

    const searchInput = document.getElementById('searchEmoji');
    const clearButton = document.getElementById('clearSearch');
    const searchResultCount = document.getElementById('searchResultCount');
    const categorySections = document.querySelectorAll('.category-section');
    const emojiItems = document.querySelectorAll('.emoji-item');

    if (!searchInput || !searchResultCount) {
        console.error("❌ 검색 입력창 또는 결과 표시 요소를 찾을 수 없습니다.");
        return;
    }

    console.log("✅ 검색 입력창을 찾았습니다.");

    // 🔹 검색 실행 시 필터링 적용
    searchInput.addEventListener('input', function (e) {
        const searchTerm = e.target.value.toLowerCase().trim();
        console.log("🔍 검색어 입력됨:", searchTerm);

        let matchCount = 0;

        categorySections.forEach(section => {
            let sectionVisible = false;
            let emojisInSection = section.querySelectorAll('.emoji-item');

            emojisInSection.forEach(item => {
                const emojiText = item.querySelector('.emoji').textContent.toLowerCase();
                const emojiName = item.querySelector('.emoji-name').textContent.toLowerCase();

                if (emojiText.includes(searchTerm) || emojiName.includes(searchTerm)) {
                    item.style.display = 'flex';
                    sectionVisible = true;
                    matchCount++;
                } else {
                    item.style.display = 'none';
                }
            });

            section.style.display = sectionVisible ? 'block' : 'none';
        });

        console.log("📌 검색 후 남은 이모지 개수:", matchCount);

        if (searchResultCount) {
            if (searchTerm === '') {
                searchResultCount.textContent = '🔎 검색어를 입력하세요.';
            } else if (matchCount === 0) {
                searchResultCount.textContent = '😕 검색 결과가 없습니다.';
            } else {
                searchResultCount.textContent = `🔍 ${matchCount}개의 결과가 있습니다.`;
            }
        }
    });

    // 🔹 이모지 클릭 이벤트 (검색 후에도 유지)
    document.addEventListener('click', function (event) {
        let target = event.target.closest('.emoji-item');
        if (target) {
            let emojiElement = target.querySelector('.emoji');
            if (emojiElement) {
                let emoji = emojiElement.textContent.trim();
                console.log(`🔍 클릭한 이모지: ${emoji}`);
                copyEmoji(emoji);
            } else {
                console.warn("⚠ 클릭한 요소에서 이모지를 찾지 못함!");
            }
        }
    });

    // X 버튼 클릭 시 검색창 초기화 및 모든 이모지 표시
    clearButton.addEventListener('click', () => {
        searchInput.value = '';
        searchInput.focus();
        updateSearch('');
    });

    // 검색 기능
    function updateSearch(searchText) {
        let count = 0;
        const searchTerm = searchText.toLowerCase();

        emojiItems.forEach(item => {
            const emojiName = item.querySelector('.emoji-name').textContent.toLowerCase();
            const emoji = item.querySelector('.emoji').textContent;
            
            if (emojiName.includes(searchTerm) || emoji.includes(searchTerm)) {
                item.style.display = 'block';
                count++;
            } else {
                item.style.display = 'none';
            }
        });

        // 검색 결과 메시지 업데이트
        if (searchTerm === '') {
            searchResultCount.textContent = '🔍 검색어를 입력하세요.';
        } else {
            searchResultCount.textContent = `✨ ${count}개의 검색결과를 찾았습니다.`;
        }
    }

    // 검색어 입력 시 실시간 검색
    searchInput.addEventListener('input', (e) => {
        updateSearch(e.target.value);
    });

    // 페이지 로드 시 이모지 총 개수 표시
    const totalEmojis = document.querySelectorAll('.emoji-item').length;
    const emojiCount = document.querySelector('.emoji-count');
    emojiCount.textContent = `(총 ${totalEmojis}개)`;
});

// ✅ 안전한 복사 함수
function copyEmoji(emoji) {
    if (!emoji) {
        console.error("❌ 복사할 이모지가 없습니다! emoji 값이 undefined입니다.");
        return;
    }

    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
        navigator.clipboard.writeText(emoji).then(() => {
            console.log(`✅ 클립보드 복사 성공: ${emoji}`);
            showPopupMessage(emoji);
        }).catch(err => {
            console.error("❌ 클립보드 복사 실패, execCommand 방식으로 시도:", err);
            fallbackCopy(emoji);
        });
    } else {
        console.warn("⚠ navigator.clipboard가 지원되지 않음. execCommand 방식 사용.");
        fallbackCopy(emoji);
    }
}

// ✅ execCommand("copy")를 이용한 복사 (HTTP에서도 동작)
function fallbackCopy(emoji) {
    let tempInput = document.createElement("textarea");
    tempInput.value = emoji;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand("copy");
    document.body.removeChild(tempInput);

    console.log(`✅ execCommand로 복사 성공: ${emoji}`);
    showPopupMessage(emoji);
}

// ✅ 복사 성공 메시지 표시
function showPopupMessage(emoji) {
    let popup = document.getElementById("popupMessage");
    if (!popup) return;

    popup.innerHTML = `【${emoji}】가 복사되었습니다~~💌`;
    popup.style.display = "block";
    setTimeout(() => {
        popup.style.opacity = "1";
    }, 50);

    setTimeout(() => {
        popup.style.opacity = "0";
        setTimeout(() => {
            popup.style.display = "none";
        }, 500);
    }, 2000);
}
