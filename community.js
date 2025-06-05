// 로그인 상태 확인
function checkLoginStatus() {
    const loggedInUser = localStorage.getItem('loggedInUser');
    const authSection = document.getElementById('authSection');
    const postForm = document.getElementById('postForm');
    if (loggedInUser) {
        const user = JSON.parse(localStorage.getItem('user_' + loggedInUser));
        authSection.innerHTML = `
            <span class="text-pink-500">${user.name}님</span>
            <span class="mx-2 text-gray-500">|</span>
            <button onclick="logout()" class="text-gray-700 hover:text-pink-500 transition">로그아웃</button>
        `;
        document.getElementById('postUser').textContent = user.name;
    } else {
        postForm.innerHTML = `
            <p class="text-center text-gray-800">커뮤니티에 참여하려면 로그인이 필요합니다!</p>
            <a href="login.html?redirect=community.html" class="block text-center bg-pink-500 text-white px-6 py-3 rounded-lg font-semibold btn-hover mt-4">로그인</a>
        `;
    }
}

function logout() {
    localStorage.removeItem('loggedInUser');
    alert('로그아웃되었습니다!');
    window.location.href = 'index.html';
}

function submitPost() {
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (!loggedInUser) {
        alert('로그인이 필요합니다!');
        window.location.href = 'login.html?redirect=community.html';
        return;
    }
    const title = document.getElementById('postTitle').value;
    const description = document.getElementById('postDescription').value;
    const option1 = document.getElementById('option1').value;
    const option2 = document.getElementById('option2').value;
    const option3 = document.getElementById('option3').value;
    if (!title || !description || !option1 || !option2) {
        alert('제목, 설명, 최소 2개의 옵션을 입력해주세요!');
        return;
    }
    alert('고민이 공유되었습니다!');
    // 실제로는 백엔드로 데이터 전송
}

// 페이지 로드 시 로그인 상태 확인
window.onload = checkLoginStatus;
