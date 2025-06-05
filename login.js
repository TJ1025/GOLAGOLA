function handleLogin(event) {
    event.preventDefault();

    const userId = document.getElementById('loginId').value;
    const password = document.getElementById('loginPassword').value;

    const users = JSON.parse(localStorage.getItem("users")) || [];

    const user = users.find(u => u.userId === userId && u.password === password);

    if (user) {
        alert(`${user.name}님 환영합니다!`);
        localStorage.setItem("loggedInUser", JSON.stringify(user));
        window.location.href = "index.html"; // 로그인 후 이동할 페이지
    } else {
        alert("아이디 또는 비밀번호가 틀렸습니다.");
    }
}
