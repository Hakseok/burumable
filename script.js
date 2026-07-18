let players = JSON.parse(localStorage.getItem('players')) || [];
let current = null;
let inputValue = "";
let isNegative = false;

// 플레이어 렌더링
function renderPlayers() {
  const container = document.getElementById('players');
  container.innerHTML = '';
  players.forEach((p, i) => {
    const div = document.createElement('div');
    div.className = 'player' + (current === i ? ' active' : '');
    div.innerHTML = `
      <h3>${p.name}</h3>
      <p>₩${p.balance.toLocaleString()}</p>
      <p>무인도: ${p.prison}</p>
      <button onclick="removePlayer(${i})">삭제</button>
    `;
    div.onclick = () => {
      current = i;
      renderPlayers();
      document.getElementById('currentPlayer').innerText = '현재 차례: ' + p.name;
    };
    container.appendChild(div);
  });

  // 통행료 콤보박스 갱신
  const select = document.getElementById('tollTarget');
  if (select) {
    select.innerHTML = '';
    players.forEach((p,i) => {
      if (i !== current) {
        const opt = document.createElement('option');
        opt.value = i;
        opt.text = p.name;
        select.appendChild(opt);
      }
    });
  }

  localStorage.setItem('players', JSON.stringify(players));
}

// 플레이어 추가
document.getElementById('addBtn').onclick = () => {
  const name = prompt("플레이어 이름 입력:");
  if (!name) return;
  players.push({ name, balance: 1500000, prison: 0 });
  renderPlayers();
};

// 플레이어 삭제
function removePlayer(i) {
  players.splice(i,1);
  if (current === i) current = null;
  renderPlayers();
}

// 턴 진행
function nextTurn() {
  if (players.length === 0) return;
  current = (current === null) ? 0 : (current+1) % players.length;
  document.getElementById('currentPlayer').innerText = '현재 차례: ' + players[current].name;
  renderPlayers();
}

// 숫자패드 생성
function createKeypad() {
  const keys = ['1','2','3','4','5','6','7','8','9','0','00','삭제','+','-'];
  const keypad = document.getElementById('keypad');
  keys.forEach(k => {
    const btn = document.createElement('button');
    btn.innerText = k;
    btn.onclick = () => handleKey(k);
    keypad.appendChild(btn);
  });
}
createKeypad();

// 숫자패드 입력 처리
function handleKey(k) {
  if (k === '삭제') inputValue = inputValue.slice(0,-1);
  else if (k === '+') isNegative = false;
  else if (k === '-') isNegative = true;
  else inputValue += k;
  updateDisplay();
}

function updateDisplay() {
  const amount = parseInt(inputValue || "0",10);
  document.getElementById('display').innerText = 
    `현재 입력 금액: ₩${amount.toLocaleString()} (${isNegative ? '-' : '+'})`;
}

// 액션 처리
function applyAction(type) {
  if (current === null) return alert('플레이어를 선택하세요!');
  let amount = parseInt(inputValue,10) || 0;
  if (type === 'salary') amount = 200000;
  if (amount === 0 && type !== 'salary') return alert('금액을 입력하세요!');

  const actor = players[current];

  if (type === 'toll') {
    const targetIndex = document.getElementById('tollTarget').value;
    const receiver = players[targetIndex];
    if (receiver) {
      receiver.balance += amount;
      actor.balance -= amount;
      logAction("통행료", `-${amount} → ${receiver.name}`);
    }
  } else {
    actor.balance += isNegative ? -amount : amount;
    logAction(type, `${isNegative ? '-' : '+'}${amount}`);
  }

  inputValue = "";
  isNegative = false;
  updateDisplay();
  renderPlayers();
}

// 로그 기록
function logAction(action, detail) {
  const log = document.getElementById('log');
  const entry = document.createElement('div');
  entry.className = 'log-entry';
  entry.innerText = `${players[current].name}: ${action} (${detail})`;
  log.prepend(entry);
}

// 초기화
document.getElementById('resetBtn').onclick = () => {
  if (confirm("정말 초기화하시겠습니까?")) {
    players = [];
    current = null;
    inputValue = "";
    isNegative = false;
    document.getElementById('players').innerHTML = '';
    document.getElementById('log').innerHTML = '';
    document.getElementById('currentPlayer').innerText = '현재 차례: 없음';
    updateDisplay();
    localStorage.removeItem('players');
  }
};

// 초기 렌더링
renderPlayers();
updateDisplay();
