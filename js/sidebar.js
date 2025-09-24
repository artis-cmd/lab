document.addEventListener("DOMContentLoaded", function () {
    const sidebar = document.getElementById("left-frame");
    const mainFrame = document.getElementById("main-frame");
    const toggleBtn = document.getElementById("toggle-sidebar");

    // 초기 아이콘 설정
    toggleBtn.innerHTML = "✖"; // 기본값을 닫기 버튼으로 설정

    // 사이드바 열기/닫기
    toggleBtn.addEventListener("click", function () {
        if (sidebar.classList.contains("closed")) {
            sidebar.classList.remove("closed");
            mainFrame.classList.remove("expanded");
            toggleBtn.innerHTML = "✖"; // 사이드바 열릴 때 X 아이콘
        } else {
            sidebar.classList.add("closed");
            mainFrame.classList.add("expanded");
            toggleBtn.innerHTML = "☰"; // 사이드바 닫힐 때 3선 아이콘
        }
    });
});
