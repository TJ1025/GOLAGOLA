// 로그인 상태 확인
function checkLoginStatus() {
    const loggedInUser = localStorage.getItem('loggedInUser');
    const authSection = document.getElementById('authSection');
    if (loggedInUser) {
        const user = JSON.parse(localStorage.getItem('user_' + loggedInUser));
        authSection.innerHTML = `
            <span class="text-pink-600">${user.name}님</span>
            <span class="mx-2 text-gray-400">|</span>
            <button onclick="logout()" class="text-gray-600 hover:text-pink-600 transition">로그아웃</button>
        `;
    }
}

function logout() {
    localStorage.removeItem('loggedInUser');
    if (window.Android) {
        window.Android.showToast('로그아웃되었습니다!');
    } else {
        alert('로그아웃되었습니다!');
    }
    window.location.href = 'index.html';
}

// 룰렛
function drawRoulette(options = ['옵션1', '옵션2', '옵션3']) {
    const canvas = document.getElementById('rouletteCanvas');
    const ctx = canvas.getContext('2d');
    const colors = ['#A7F3D0', '#FECACA', '#BAE6FD', '#FBCFE8', '#E5E7EB'];
    const arc = Math.PI * 2 / options.length;
    let startAngle = 0;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < options.length; i++) {
        ctx.beginPath();
        ctx.fillStyle = colors[i % colors.length];
        ctx.moveTo(150, 150);
        ctx.arc(150, 150, 150, startAngle, startAngle + arc);
        ctx.fill();
        ctx.fillStyle = '#1F2937';
        ctx.font = '16px Pretendard-Regular';
        ctx.save();
        ctx.translate(150, 150);
        ctx.rotate(startAngle + arc / 2);
        ctx.fillText(options[i], 80, 10);
        ctx.restore();
        startAngle += arc;
    }
}

function spinRoulette() {
    const canvas = document.getElementById('rouletteCanvas');
    const optionsInput = document.getElementById('rouletteOptions').value;
    const options = optionsInput.split(',').map(opt => opt.trim()).filter(opt => opt);

    if (options.length < 2) {
        if (window.Android) {
            window.Android.showToast('최소 2개의 옵션을 입력해주세요!');
        } else {
            alert('최소 2개의 옵션을 입력해주세요!');
        }
        return;
    }

    drawRoulette(options);

    let rotation = 0;
    const spinTime = 5000;
    const start = Date.now();
    const totalRotations = 5 + Math.random() * 5;
    const spin = setInterval(() => {
        const elapsed = Date.now() - start;
        const progress = elapsed / spinTime;
        const easeOut = 1 - Math.pow(1 - progress, 3);
        rotation = totalRotations * 2 * Math.PI * easeOut;
        canvas.style.transform = `rotate(${rotation}rad)`;

        if (elapsed > spinTime) {
            clearInterval(spin);
            const arc = Math.PI * 2 / options.length;
            const finalAngle = (rotation % (2 * Math.PI)) + 2 * Math.PI;
            const selectedIndex = Math.floor(((2 * Math.PI - (finalAngle % (2 * Math.PI))) % (2 * Math.PI)) / arc);
            if (window.Android) {
                window.Android.showToast(`선택된 결과: ${options[selectedIndex]}`);
            } else {
                alert(`선택된 결과: ${options[selectedIndex]}`);
            }
            canvas.style.transform = `rotate(${rotation - (rotation % (2 * Math.PI)) + (selectedIndex * arc)}rad)`;
        }
    }, 16);
}

// 사다리타기
let ladderLines = [];

function addLadderLine() {
    const canvas = document.getElementById('ladderCanvas');
    const participantsInput = document.getElementById('ladderParticipants').value;
    const participants = participantsInput.split(',').map(p => p.trim()).filter(p => p);

    if (participants.length < 2) {
        if (window.Android) {
            window.Android.showToast('최소 2명의 참가자를 입력해주세요!');
        } else {
            alert('최소 2명의 참가자를 입력해주세요!');
        }
        return;
    }

    canvas.addEventListener('click', function handler(e) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const step = 300 / (participants.length + 1);
        const col = Math.round(x / step);
        if (col >= 1 && col < participants.length && y > 50 && y < 250) {
            const lineY = Math.round((y - 50) / 50) * 50 + 50;
            ladderLines.push({ col, y: lineY });
            drawLadderCanvas(participants);
        }
    }, { once: true });
}

function drawLadderCanvas(participants, results = []) {
    const canvas = document.getElementById('ladderCanvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const step = 300 / (participants.length + 1);
    for (let i = 1; i <= participants.length; i++) {
        ctx.beginPath();
        ctx.moveTo(i * step, 50);
        ctx.lineTo(i * step, 250);
        ctx.strokeStyle = '#1F2937';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = '#1F2937';
        ctx.font = '14px Pretendard-Regular';
        ctx.fillText(participants[i - 1], i * step - 20, 40);
        if (results.length > 0) {
            ctx.fillText(results[i - 1], i * step - 20, 270);
        }
    }

    ladderLines.forEach(line => {
        ctx.beginPath();
        ctx.moveTo(line.col * step, line.y);
        ctx.lineTo((line.col + 1) * step, line.y);
        ctx.strokeStyle = '#EF4444';
        ctx.lineWidth = 2;
        ctx.stroke();
    });
}

function drawLadder() {
    const participantsInput = document.getElementById('ladderParticipants').value;
    const resultsInput = document.getElementById('ladderResults').value;
    const participants = participantsInput.split(',').map(p => p.trim()).filter(p => p);
    const results = resultsInput.split(',').map(r => r.trim()).filter(r => r);

    if (participants.length < 2 || results.length !== participants.length) {
        if (window.Android) {
            window.Android.showToast('참가자와 결과는 같은 수로 입력해주세요!');
        } else {
            alert('참가자와 결과는 같은 수로 입력해주세요!');
        }
        return;
    }

    drawLadderCanvas(participants, results);

    const paths = Array.from({ length: participants.length }, (_, i) => i + 1);
    ladderLines.forEach(line => {
        const col = line.col;
        const idx1 = paths.findIndex(p => p === col);
        const idx2 = paths.findIndex(p => p === col + 1);
        if (idx1 !== -1 && idx2 !== -1) {
            [paths[idx1], paths[idx2]] = [paths[idx2], paths[idx1]];
        }
    });

    const finalResults = paths.map((end, i) => ({
        participant: participants[i],
        result: results[end - 1]
    }));

    if (window.Android) {
        window.Android.showToast(`결과:\n${finalResults.map(r => `${r.participant} → ${r.result}`).join('\n')}`);
    } else {
        alert(`결과:\n${finalResults.map(r => `${r.participant} → ${r.result}`).join('\n')}`);
    }
    ladderLines = [];
}

// 레이스
function startRace() {
    const raceTrack = document.getElementById('raceTrack');
    const optionsInput = document.getElementById('raceOptions').value;
    const options = optionsInput.split(',').map(opt => opt.trim()).filter(opt => opt);

    if (options.length < 2) {
        if (window.Android) {
            window.Android.showToast('최소 2개의 옵션을 입력해주세요!');
        } else {
            alert('최소 2개의 옵션을 입력해주세요!');
        }
        return;
    }

    raceTrack.innerHTML = '';
    options.forEach((option, index) => {
        const track = document.createElement('div');
        track.className = 'relative h-10 bg-gray-200 rounded-lg overflow-hidden';
        const runner = document.createElement('div');
        runner.className = 'absolute h-full bg-pink-600 text-white text-sm flex items-center px-2 transition-all duration-2000';
        runner.style.width = '0%';
        runner.textContent = option;
        track.appendChild(runner);
        raceTrack.appendChild(track);
    });

    setTimeout(() => {
        const runners = raceTrack.querySelectorAll('.bg-pink-600');
        const winnerIndex = Math.floor(Math.random() * options.length);
        runners.forEach((runner, index) => {
            runner.style.width = index === winnerIndex ? '100%' : `${Math.random() * 80 + 10}%`;
        });
        setTimeout(() => {
            if (window.Android) {
                window.Android.showToast(`우승: ${options[winnerIndex]}`);
            } else {
                alert(`우승: ${options[winnerIndex]}`);
            }
        }, 2100);
    }, 100);
}

// 줄서기
function startQueue() {
    const queueResult = document.getElementById('queueResult');
    const optionsInput = document.getElementById('queueOptions').value;
    const options = optionsInput.split(',').map(opt => opt.trim()).filter(opt => opt);

    if (options.length < 2) {
        if (window.Android) {
            window.Android.showToast('최소 2개의 옵션을 입력해주세요!');
        } else {
            alert('최소 2개의 옵션을 입력해주세요!');
        }
        return;
    }

    const shuffled = options.sort(() => Math.random() - 0.5);
    queueResult.innerHTML = shuffled.map((opt, index) => `
        <div class="flex items-center space-x-2">
            <span class="text-pink-600 font-semibold">${index + 1}등</span>
            <span>${opt}</span>
        </div>
    `).join('');
    localStorage.setItem('queueResult', JSON.stringify(shuffled));
}

function shareQueue() {
    const queueResult = JSON.parse(localStorage.getItem('queueResult') || '[]');
    if (queueResult.length === 0) {
        if (window.Android) {
            window.Android.showToast('먼저 줄서기를 실행해주세요!');
        } else {
            alert('먼저 줄서기를 실행해주세요!');
        }
        return;
    }
    const text = `줄서기 결과:\n${queueResult.map((opt, i) => `${i + 1}. ${opt}`).join('\n')}`;
    if (window.Android) {
        window.Android.shareText(text);
    } else {
        navigator.clipboard.writeText(text).then(() => {
            alert('결과가 클립보드에 복사되었습니다!');
        });
    }
}

// 뽑기
function startDraw() {
    const drawResult = document.getElementById('drawResult');
    const optionsInput = document.getElementById('drawOptions').value;
    const options = optionsInput.split(',').map(opt => opt.trim()).filter(opt => opt);

    if (options.length < 1) {
        if (window.Android) {
            window.Android.showToast('최소 1개의 옵션을 입력해주세요!');
        } else {
            alert('최소 1개의 옵션을 입력해주세요!');
        }
        return;
    }

    drawResult.textContent = '뽑는 중...';
    setTimeout(() => {
        const selected = options[Math.floor(Math.random() * options.length)];
        drawResult.textContent = `뽑힌 결과: ${selected}`;
        if (window.Android) {
            window.Android.showToast(`뽑힌 결과: ${selected}`);
        }
    }, 1000);
}

// 복불복
function startLuck() {
    const luckResult = document.getElementById('luckResult');
    const optionsInput = document.getElementById('luckOptions').value;
    const options = optionsInput.split(',').map(opt => opt.trim()).filter(opt => opt);

    if (options.length < 1) {
        if (window.Android) {
            window.Android.showToast('최소 1개의 옵션을 입력해주세요!');
        } else {
            alert('최소 1개의 옵션을 입력해주세요!');
        }
        return;
    }

    luckResult.textContent = '복불복 진행 중...';
    setTimeout(() => {
        const isLucky = Math.random() > 0.3;
        const selected = isLucky ? options[Math.floor(Math.random() * options.length)] : '꽝!';
        luckResult.textContent = `결과: ${selected}`;
        if (window.Android) {
            window.Android.showToast(`결과: ${selected}`);
        }
    }, 1000);
}

// 페이지 로드 시 초기화
window.onload = function() {
    checkLoginStatus();
    const urlParams = new URLSearchParams(window.location.search);
    const options = urlParams.get('options');
    if (options) {
        document.getElementById('rouletteOptions').value = decodeURIComponent(options);
        drawRoulette(options.split(',').map(opt => opt.trim()).filter(opt => opt));
    } else {
        drawRoulette();
    }
};
