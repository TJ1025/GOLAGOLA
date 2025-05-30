function handleLogin() {
    const id = document.getElementById('loginId').value;
    const password = document.getElementById('loginPassword').value;
    if (!id || !password) {
        alert('아이디와 비밀번호를 입력해주세요!');
        return;
    }
    const user = JSON.parse(localStorage.getItem('user_' + id));
    if (user && user.password === password) {
        localStorage.setItem('loggedInUser', id);
        alert('로그인 성공!');
        const urlParams = new URLSearchParams(window.location.search);
        const redirect = urlParams.get('redirect') || 'index.html';
        const options = urlParams.get('options');
        window.location.href = options ? `${redirect}?options=${encodeURIComponent(options)}` : redirect;
    } else {
        alert('아이디 또는 비밀번호가 잘못되었습니다.');
    }
}
