/**
 * 체크리스트 관리 스크립트
 * 로컬 스토리지를 이용한 체크리스트 데이터 관리 및 Google Sheets 연동 기능
 */

// 페이지 로드 시 초기화 함수
document.addEventListener('DOMContentLoaded', function () {
    // 초기 셋업 실행
    setupChecklist('form1', 'input1', 'list1', 'checklist1');
    setupChecklist('form2', 'input2', 'list2', 'checklist2');
    setupChecklist('form3', 'input3', 'list3', 'checklist3');
    loadMovedItems();

    // 체크리스트 폭 조절 기능
    const widthSelect = document.getElementById("widthSelect");
    if (widthSelect) {
        widthSelect.addEventListener("change", function () {
            const selectedWidth = this.value;
            document.querySelectorAll(".checklist-box").forEach(box => {
                box.style.width = selectedWidth;
                box.style.maxWidth = "none";
            });
        });
        
        // 페이지 로드 시 현재 선택된 너비 적용
        const currentWidth = widthSelect.value;
        document.querySelectorAll(".checklist-box").forEach(box => {
            box.style.width = currentWidth;
            box.style.maxWidth = "none";
        });
    }

    // 배경색 변경 기능
    const bgColorSelect = document.getElementById("bgColorSelect");
    if (bgColorSelect) {
        bgColorSelect.addEventListener("change", function () {
            const selectedColor = this.value;
            document.body.style.backgroundColor = selectedColor;
        });
    }

    // 초기화 버튼 이벤트 리스너
    const resetButton = document.getElementById("resetButton");
    if (resetButton) {
        resetButton.addEventListener("click", function () {
            if (typeof resetChecklist === 'function') {
                resetChecklist();
            } else {
                const confirmReset = confirm("정말 모든 데이터를 초기화하시겠습니까?");
                
                if (confirmReset) {
                    localStorage.removeItem("checklist1");
                    localStorage.removeItem("checklist2");
                    localStorage.removeItem("checklist3");
                    localStorage.removeItem("movedStorage");
                    
                    location.reload();
                }
            }
        });
    }
    
    // 하단 여백 추가
    if (!document.querySelector('.footer-space')) {
        const footerSpace = document.createElement('div');
        footerSpace.className = 'footer-space';
        document.body.appendChild(footerSpace);
    }
});

/**
 * 체크리스트 유형 반환 함수
 * @param {string} storageKey - 로컬 스토리지 키 값
 * @returns {string} 체크리스트 유형
 */
function getChecklistType(storageKey) {
    switch(storageKey) {
        case 'checklist1': return 'Strategy';
        case 'checklist2': return 'Risk';
        case 'checklist3': return 'Mental';
        default: return 'Unknown';
    }
}

/**
 * 체크리스트 초기 설정 함수
 * @param {string} formId - 폼 요소 ID
 * @param {string} inputId - 입력 요소 ID
 * @param {string} listId - 리스트 요소 ID
 * @param {string} storageKey - 로컬 스토리지 키
 */
function setupChecklist(formId, inputId, listId, storageKey) {
    const form = document.getElementById(formId);
    const input = document.getElementById(inputId);
    const list = document.getElementById(listId);
    
    if (!form || !input || !list) {
        console.error(`setupChecklist: 필요한 요소를 찾을 수 없습니다 (${formId}, ${inputId}, ${listId})`);
        return;
    }

    // 저장된 항목 불러오기
    loadItems();

    // 폼 제출 이벤트 리스너 - 새 항목 추가
    form.addEventListener('submit', function (event) {
        event.preventDefault();
        const newItem = input.value.trim();
        if (!newItem) return;

        // 로컬 스토리지에 항목 추가
        let items = JSON.parse(localStorage.getItem(storageKey)) || [];
        items.push(newItem);
        localStorage.setItem(storageKey, JSON.stringify(items));
        
        // DOM에 추가
        addItemToDOM(newItem, items.length - 1, listId, storageKey);
        
        // Google Sheets에 저장
        const type = getChecklistType(storageKey);
        
        const data = {
            type: type,
            item: newItem,
            action: '추가됨'
        };
        
        if (typeof saveChecklistItem === 'function') {
            saveChecklistItem(data)
                .then(() => console.log('새 항목 추가 기록 성공'))
                .catch(error => console.error('새 항목 추가 기록 실패:', error));
        }
        
        input.value = '';
    });

    /**
     * 로컬 스토리지에서 항목 불러와 화면에 표시
     */
    function loadItems() {
        const items = JSON.parse(localStorage.getItem(storageKey)) || [];
        list.innerHTML = '';
        items.forEach((item, index) => addItemToDOM(item, index, listId, storageKey));
    }
}

/**
 * 체크리스트 렌더링 함수 - 통합된 버전
 * @param {Array} items - 체크리스트 항목 배열
 */
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
            if (typeof saveCheckedItem === 'function') {
                saveCheckedItem(item.id, item.text);
                // 체크 후 UI 업데이트 (옵션)
                listItem.classList.add("checked");
                setTimeout(() => {
                    listItem.remove();
                }, 500);
            }
        };

        listItem.appendChild(itemText);
        listItem.appendChild(checkButton);
        checklistContainer.appendChild(listItem);
    });
}

/**
 * DOM에 항목 추가하는 함수
 * @param {string} item - 추가할 항목 텍스트
 * @param {number} index - 항목 인덱스
 * @param {string} listId - 리스트 요소 ID
 * @param {string} storageKey - 로컬 스토리지 키
 */
function addItemToDOM(item, index, listId, storageKey) {
    const list = document.getElementById(listId);
    if (!list) {
        console.error(`addItemToDOM: 리스트 요소를 찾을 수 없습니다 (${listId})`);
        return;
    }
    
    const li = document.createElement('li');
    const span = document.createElement('span');
    span.textContent = item;

    const buttonsDiv = document.createElement('div');
    buttonsDiv.classList.add('buttons');

    // Edit 버튼
    const editButton = document.createElement('button');
    editButton.innerHTML = '✏️<span>Edit</span>';
    editButton.className = 'edit-button';
    editButton.onclick = function () {
        editItem(index, listId, storageKey, span);
    };

    // Check 버튼
    const moveButton = document.createElement('button');
    moveButton.innerHTML = '✓<span>Check</span>';
    moveButton.className = 'check-button';
    moveButton.onclick = function () {
        moveItem(index, storageKey);
    };

    buttonsDiv.appendChild(editButton);
    buttonsDiv.appendChild(moveButton);

    li.appendChild(span);
    li.appendChild(buttonsDiv);

    list.appendChild(li);
}

/**
 * 항목 수정 함수
 * @param {number} index - 수정할 항목 인덱스
 * @param {string} listId - 리스트 요소 ID
 * @param {string} storageKey - 로컬 스토리지 키
 * @param {HTMLElement} span - 항목 텍스트 요소
 */
function editItem(index, listId, storageKey, span) {
    let items = JSON.parse(localStorage.getItem(storageKey)) || [];
    
    if (index < 0 || index >= items.length) {
        console.error(`editItem: 유효하지 않은 인덱스 (${index})`);
        return;
    }
    
    const oldText = items[index];
    const newText = prompt('수정할 내용을 입력하세요:', oldText);
    
    if (newText && newText !== oldText) {
        // 로컬 스토리지 업데이트
        items[index] = newText;
        localStorage.setItem(storageKey, JSON.stringify(items));
        span.textContent = newText;

        // Google Sheets에 수정사항 저장
        const type = getChecklistType(storageKey);
        
        const data = {
            type: type,
            item: newText,
            action: '수정됨',
            note: `이전 항목: ${oldText}`
        };

        if (typeof saveChecklistItem === 'function') {
            saveChecklistItem(data)
                .then(() => console.log('수정 작업 기록 성공'))
                .catch(error => console.error('수정 작업 기록 실패:', error));
        }
    }
}

/**
 * 항목 이동 함수 (Check 버튼)
 * @param {number} index - 이동할 항목 인덱스
 * @param {string} storageKey - 로컬 스토리지 키
 */
function moveItem(index, storageKey) {
    let items = JSON.parse(localStorage.getItem(storageKey)) || [];
    
    if (index < 0 || index >= items.length) {
        console.error(`moveItem: 유효하지 않은 인덱스 (${index})`);
        return;
    }
    
    let movedItem = items[index];

    if (movedItem) {
        // 이동된 항목 목록으로 이동
        moveToMovedList(movedItem, storageKey);
        
        // Google Sheets에 체크 상태 저장
        const type = getChecklistType(storageKey);
        
        const data = {
            type: type,
            item: movedItem,
            action: '체크됨'
        };
        
        if (typeof saveChecklistItem === 'function') {
            saveChecklistItem(data)
                .then(() => console.log('체크 작업 기록 성공'))
                .catch(error => console.error('체크 작업 기록 실패:', error));
        }
    }

    // 원래 리스트에서 제거
    items.splice(index, 1);
    localStorage.setItem(storageKey, JSON.stringify(items));
    
    // 해당 리스트 다시 로드
    const listId = getListIdFromStorageKey(storageKey);
    const list = document.getElementById(listId);
    if (list) {
        list.innerHTML = '';
        items.forEach((item, idx) => addItemToDOM(item, idx, listId, storageKey));
    }
}

/**
 * 스토리지키로부터 리스트 ID 추출
 * @param {string} storageKey - 로컬 스토리지 키
 * @returns {string} 리스트 요소 ID
 */
function getListIdFromStorageKey(storageKey) {
    switch(storageKey) {
        case 'checklist1': return 'list1';
        case 'checklist2': return 'list2';
        case 'checklist3': return 'list3';
        default: return null;
    }
}

/**
 * 이동된 항목 리스트에 추가하는 함수
 * @param {string} item - 이동할 항목 텍스트
 * @param {string} originalStorageKey - 원래 속했던 스토리지 키
 */
function moveToMovedList(item, originalStorageKey) {
    let movedItems = JSON.parse(localStorage.getItem("movedStorage")) || [];
    movedItems.push({ text: item, originalStorageKey });
    localStorage.setItem("movedStorage", JSON.stringify(movedItems));

    loadMovedItems();
}

/**
 * 이동된 항목 UI 업데이트 함수
 */
function loadMovedItems() {
    // 각 카테고리별 체크 목록 요소
    const checkedList1 = document.getElementById('checkedList1');
    const checkedList2 = document.getElementById('checkedList2');
    const checkedList3 = document.getElementById('checkedList3');
    
    // 요소 존재 여부 확인
    if (!checkedList1 && !checkedList2 && !checkedList3) {
        console.error("loadMovedItems: 체크된 목록 요소를 찾을 수 없습니다.");
        return;
    }
    
    // 목록 초기화
    if (checkedList1) checkedList1.innerHTML = "";
    if (checkedList2) checkedList2.innerHTML = "";
    if (checkedList3) checkedList3.innerHTML = "";

    let movedItems = JSON.parse(localStorage.getItem("movedStorage")) || [];

    movedItems.forEach((item, index) => {
        if (!item || !item.text || !item.originalStorageKey) {
            console.warn("불완전한 이동 항목 스킵:", item);
            return;
        }
        
        const li = document.createElement('li');
        
        // 텍스트를 위한 span 생성
        const span = document.createElement('span');
        span.textContent = item.text;
        
        // 버튼을 담을 div 생성
        const buttonsDiv = document.createElement('div');
        buttonsDiv.classList.add('buttons');
        
        // Restore 버튼
        const restoreButton = document.createElement('button');
        restoreButton.innerHTML = '↩️<span>Restore</span>';
        restoreButton.className = 'restore-button';
        restoreButton.onclick = function () {
            restoreItem(index);
        };

        // Delete 버튼
        const deleteButton = document.createElement('button');
        deleteButton.innerHTML = '🗑️<span>Delete</span>';
        deleteButton.className = 'delete-button';
        deleteButton.onclick = function () {
            deleteMovedItem(index);
        };

        buttonsDiv.appendChild(restoreButton);
        buttonsDiv.appendChild(deleteButton);
        
        li.appendChild(span);
        li.appendChild(buttonsDiv);
        
        // 원래 속했던 카테고리에 따라 다른 목록에 추가
        if (item.originalStorageKey === 'checklist1' && checkedList1) {
            checkedList1.appendChild(li);
        } else if (item.originalStorageKey === 'checklist2' && checkedList2) {
            checkedList2.appendChild(li);
        } else if (item.originalStorageKey === 'checklist3' && checkedList3) {
            checkedList3.appendChild(li);
        }
    });
}

/**
 * 항목 복원 함수
 * @param {number} index - 복원할 항목 인덱스
 */
function restoreItem(index) {
    let movedItems = JSON.parse(localStorage.getItem("movedStorage")) || [];
    
    if (index < 0 || index >= movedItems.length) {
        console.error(`restoreItem: 유효하지 않은 인덱스 (${index})`);
        return;
    }
    
    let restoredItem = movedItems[index];

    if (!restoredItem || !restoredItem.originalStorageKey) {
        console.error("복구할 항목의 원래 위치를 찾을 수 없음:", restoredItem);
        return;
    }

    // 원래 리스트로 복원
    let originalItems = JSON.parse(localStorage.getItem(restoredItem.originalStorageKey)) || [];
    originalItems.push(restoredItem.text);
    localStorage.setItem(restoredItem.originalStorageKey, JSON.stringify(originalItems));

    // Google Sheets에 복원 상태 저장
    const type = getChecklistType(restoredItem.originalStorageKey);
    
    const data = {
        type: type,
        item: restoredItem.text,
        action: '복원됨',
        note: '체크된 항목에서 복원'
    };
    
    if (typeof saveChecklistItem === 'function') {
        saveChecklistItem(data)
            .then(() => console.log('복원 작업 기록 성공'))
            .catch(error => console.error('복원 작업 기록 실패:', error));
    }

    // 이동된 항목 목록에서 제거
    movedItems.splice(index, 1);
    localStorage.setItem("movedStorage", JSON.stringify(movedItems));

    // UI 업데이트
    loadMovedItems();
    
    // 원래 리스트 업데이트
    const listId = getListIdFromStorageKey(restoredItem.originalStorageKey);
    if (listId) {
        const list = document.getElementById(listId);
        if (list) {
            list.innerHTML = '';
            originalItems.forEach((item, idx) => addItemToDOM(item, idx, listId, restoredItem.originalStorageKey));
        }
    }
}

/**
 * 이동된 항목 삭제 함수
 * @param {number} index - 삭제할 항목 인덱스
 */
function deleteMovedItem(index) {
    let movedItems = JSON.parse(localStorage.getItem("movedStorage")) || [];
    
    if (index < 0 || index >= movedItems.length) {
        console.error(`deleteMovedItem: 유효하지 않은 인덱스 (${index})`);
        return;
    }
    
    const deletedItem = movedItems[index];
    
    // Google Sheets에 삭제 상태 저장
    if (deletedItem && deletedItem.originalStorageKey) {
        const type = getChecklistType(deletedItem.originalStorageKey);
        
        const data = {
            type: type,
            item: deletedItem.text,
            action: '삭제됨',
            note: '체크된 항목에서 완전 삭제'
        };
        
        if (typeof saveChecklistItem === 'function') {
            saveChecklistItem(data)
                .then(() => console.log('삭제 작업 기록 성공'))
                .catch(error => console.error('삭제 작업 기록 실패:', error));
        }
    }
    
    // 이동된 항목 목록에서 제거
    movedItems.splice(index, 1);
    localStorage.setItem("movedStorage", JSON.stringify(movedItems));

    loadMovedItems();
}

// 전역 함수 노출
window.editItem = editItem;
window.moveItem = moveItem;
window.restoreItem = restoreItem;
window.deleteMovedItem = deleteMovedItem;
window.addItemToDOM = addItemToDOM;
window.getChecklistType = getChecklistType;
window.getListIdFromStorageKey = getListIdFromStorageKey;
