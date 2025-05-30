function requestVerification() {
    alert('인증 코드가 발송되었습니다! (예: 123456)');
    document.getElementById('verifyCode').disabled = false;
}

async function handleSignup() {
    const name = document.getElementById('name').value;
    const userId = document.getElementById('id').value;
    const gender = document.getElementById('gender').value;
    const birthdate = document.getElementById('birthdate').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const verifyCode = document.getElementById('verifyCode').value;

    if (!name || !userId || !gender || !birthdate || !password || !confirmPassword || !verifyCode) {
        alert('모든 필드를 입력해주세요!');
        return;
    }

    if (password !== confirmPassword) {
        alert('비밀번호가 일치하지 않습니다!');
        return;
    }

    if (verifyCode !== '123456') {
        alert('인증 코드가 올바르지 않습니다!');
        return;
    }

    try {
        const response = await apiCall('/auth/signup', 'POST', {
            name,
            userId,
            gender,
            birthdate,
            password,
            verifyCode
        });

        if (response.message === '회원가입 성공!') {
            alert('회원가입 성공! 로그인 페이지로 이동합니다.');
            window.location.href = 'login.html';
        } else {
            alert(response.message);
        }
    } catch (err) {
        alert('회원가입 중 오류가 발생했습니다.');
    }
}
