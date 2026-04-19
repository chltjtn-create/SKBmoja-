// ══════════════════════════════════════════
// app.js - 모자분리 공사요청 시스템
// ══════════════════════════════════════════

let CU = null;
let allData = [];
let allUsers = [];
let curPage = 1;
const PER_PAGE = 20;
let sortCol = '';
let sortDir = 'asc';

// ── 초기화 ───────────────────────────────
window.addEventListener('DOMContentLoaded', async () => {
  initLocalData();
  await syncData();

  // Firebase Auth 상태 감지
  auth.onAuthStateChanged(async (fbUser) => {
    if (fbUser) {
      // 이미 로그인된 경우
      const saved = sessionStorage.getItem('mj_user');
      if (saved) {
        CU = JSON.parse(saved);
        enterApp();
        return;
      }
      // 세션이 없으면 Sheets에서 사용자 정보 조회
      await syncData();
      const userInfo = allUsers.find(u => u.이메일 === fbUser.email);
      if (userInfo && userInfo.상태 === 'approved') {
        CU = userInfo;
        sessionStorage.setItem('mj_user', JSON.stringify(userInfo));
        enterApp();
      } else {
        showScreen('screen-login');
      }
    } else {
      // 로그아웃 상태
      sessionStorage.removeItem('mj_user');
      CU = null;
      showScreen('screen-login');
    }
  });

  buildPubForm();
  setInterval(syncData, 30000);
});

// ── API 호출 ─────────────────────────────
async function api(action, data = null) {
  if (!CONFIG.API_URL) return null;
  try {
    let url;
    if (data) {
      // CORS 우회: POST 데이터를 GET 파라미터로 전송
      const payload = encodeURIComponent(JSON.stringify({ action, ...data }));
      url = `${CONFIG.API_URL}?method=POST&payload=${payload}`;
    } else {
      url = `${CONFIG.API_URL}?action=${action}`;
    }
    const res = await fetch(url, { redirect: 'follow' });
    const text = await res.text();
    return JSON.parse(text);
  } catch(e) { console.warn('API오류, 로컬사용:', e.message); return null; }
}

// ── 데이터 동기화 ─────────────────────────
async function syncData() {
  if (CONFIG.API_URL) {
    const [rRes, uRes] = await Promise.all([api('getRecords'), api('getUsers')]);
    if (rRes?.records) { allData = rRes.records; localStorage.setItem('mj_records', JSON.stringify(allData)); }
    else allData = JSON.parse(localStorage.getItem('mj_records') || '[]');
    if (uRes?.users)   { allUsers = uRes.users;   localStorage.setItem('mj_users',   JSON.stringify(allUsers)); }
    else allUsers = JSON.parse(localStorage.getItem('mj_users') || '[]');
  } else {
    allData  = JSON.parse(localStorage.getItem('mj_records') || '[]');
    allUsers = JSON.parse(localStorage.getItem('mj_users')   || '[]');
  }
}

// ── 로컬 초기 데이터 ─────────────────────
function initLocalData() {
  if (!localStorage.getItem('mj_records')) {
    const yr = new Date().getFullYear();
    localStorage.setItem('mj_records', JSON.stringify([
      { KeyNO:`MJ-${yr}-001`, 접수일시:`${yr}-12-01 09:00`, 진행상태:'접수', 우선순위:'긴급', 본부:'수남', 운용팀:'강남', 정보센터:'강남', 건물명:'가나다라아파트', 건물주소:'경기 화성시 오산동 977-3', 건물코드:'T50130320836437', 장비설치일:`${yr}-12-01`, 동수:'3동', 세대수:'1500세대', 건물유형:'아파트', 국사코드:'W20029', 국사명:'용인_영덕경기행복주택(GPON)_TYPEB', 청구유형:'정액제', 민원인이름:'관리소장', 민원인연락처:'02-123-4567', 민원인Email:'xxxx@naver.com', 요청자소속:'HNS', 요청자이름:'홍길동', 요청자연락처:'010-1111-2222', 차단기위치:'1층 관리소내 MDF', 계량기위치:'1층 관리소내 MDF', 요청구분:'아파트요청', 특이사항:'빨리해달라함', 처리메모:'', 최종수정일:`${yr}-12-01`, 설치장비List:'', 기타첨부서류:'', 사진링크:'' },
      { KeyNO:`MJ-${yr}-002`, 접수일시:`${yr}-12-02 10:30`, 진행상태:'SKB검토', 우선순위:'보통', 본부:'수남', 운용팀:'수원', 정보센터:'수원', 건물명:'라마바사아파트', 건물주소:'경기 수원시 영통구 123-4', 건물코드:'T50130320999999', 장비설치일:'', 동수:'5동', 세대수:'800세대', 건물유형:'아파트', 국사코드:'W20030', 국사명:'수원_광교아파트_TYPEA', 청구유형:'종량제', 민원인이름:'홍관리자', 민원인연락처:'031-555-1234', 민원인Email:'mgr@naver.com', 요청자소속:'SKB', 요청자이름:'김철수', 요청자연락처:'010-2222-3333', 차단기위치:'B1 전기실', 계량기위치:'B1 전기실', 요청구분:'신규(운용팀)', 특이사항:'', 처리메모:'서류검토완료', 최종수정일:`${yr}-12-02`, 설치장비List:'', 기타첨부서류:'', 사진링크:'' },
      { KeyNO:`MJ-${yr}-003`, 접수일시:`${yr}-12-03 14:00`, 진행상태:'협력사접수', 우선순위:'보통', 본부:'수남', 운용팀:'동작', 정보센터:'동작', 건물명:'하나빌라', 건물주소:'서울 동작구 사당동 456-7', 건물코드:'T50130320111111', 장비설치일:'', 동수:'1동', 세대수:'50세대', 건물유형:'빌라', 국사코드:'W20031', 국사명:'동작_사당빌라_GPON', 청구유형:'해지', 민원인이름:'세입자', 민원인연락처:'010-9999-8888', 민원인Email:'', 요청자소속:'기타(민원인)', 요청자이름:'이영희', 요청자연락처:'010-3333-4444', 차단기위치:'옥상 단자함', 계량기위치:'옥상 단자함', 요청구분:'변경/해지', 특이사항:'', 처리메모:'현장방문예정', 최종수정일:`${yr}-12-03`, 설치장비List:'', 기타첨부서류:'', 사진링크:'' },
    ]));
  }
  if (!localStorage.getItem('mj_users')) {
    localStorage.setItem('mj_users', JSON.stringify([
      { id:'u1', 이름:'관리자', 이메일:'fiberworkman@gmail.com', 연락처:'010-0000-0000', 소속:'PCNI Engineering', 역할:'관리자', 담당팀:'전체', 비밀번호:'admin1234', 상태:'approved', 등록일:'2025-01-01' },
      { id:'u2', 이름:'강남담당', 이메일:'gangnam@skb.com', 연락처:'010-1234-5678', 소속:'SKB', 역할:'SKB담당자', 담당팀:'강남', 비밀번호:'skb1234', 상태:'approved', 등록일:'2025-01-01' },
      { id:'u3', 이름:'동작담당', 이메일:'dongjak@skb.com', 연락처:'010-2345-6789', 소속:'SKB', 역할:'SKB담당자', 담당팀:'동작', 비밀번호:'skb1234', 상태:'approved', 등록일:'2025-01-01' },
      { id:'u4', 이름:'수원담당', 이메일:'suwon@skb.com', 연락처:'010-3456-7890', 소속:'SKB', 역할:'SKB담당자', 담당팀:'수원', 비밀번호:'skb1234', 상태:'approved', 등록일:'2025-01-01' },
      { id:'u5', 이름:'이지전기통신', 이메일:'eji@partner.com', 연락처:'010-5555-6666', 소속:'이지전기통신', 역할:'협력사', 담당팀:'전체', 비밀번호:'eji1234', 상태:'approved', 등록일:'2025-01-01' },
    ]));
  }
}

// ── 화면 전환 ─────────────────────────────
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => { s.classList.remove('active'); s.style.display = ''; });
  const el = document.getElementById(id);
  el.classList.add('active');
  if (id === 'screen-app') el.style.display = 'flex';
}

function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.page === id));
  if (id === 'page-dashboard')   renderDashboard();
  if (id === 'page-list')        { curPage = 1; renderList(); }
  if (id === 'page-new-request') buildNewReqForm();
  if (id === 'page-users')       renderUsers();
}

// ── 로그인 ───────────────────────────────
async function doLogin() {
  const email = document.getElementById('login-email').value.trim();
  const pw    = document.getElementById('login-pw').value;
  const errEl = document.getElementById('login-error');
  errEl.style.display = 'none';

  try {
    // Firebase Auth 로그인
    const cred = await auth.signInWithEmailAndPassword(email, pw);
    const fbUser = cred.user;

    // Sheets에서 사용자 상세 정보 조회
    await syncData();
    let userInfo = allUsers.find(u => u.이메일 === email);

    if (!userInfo) {
      // 관리자 기본값
      userInfo = {
        id: fbUser.uid,
        이름: '관리자',
        이메일: email,
        연락처: '',
        소속: 'PCNI Engineering',
        역할: '관리자',
        담당팀: '전체',
        상태: 'approved'
      };
    }

    if (userInfo.상태 === 'pending')  { errEl.textContent = '관리자 승인 대기 중입니다.'; errEl.style.display = 'block'; await auth.signOut(); return; }
    if (userInfo.상태 === 'rejected') { errEl.textContent = '가입이 거절되었습니다.'; errEl.style.display = 'block'; await auth.signOut(); return; }

    CU = userInfo;
    sessionStorage.setItem('mj_user', JSON.stringify(userInfo));
    enterApp();

  } catch(err) {
    let msg = '이메일 또는 비밀번호가 올바르지 않습니다.';
    if (err.code === 'auth/user-not-found')    msg = '등록되지 않은 이메일입니다.';
    if (err.code === 'auth/wrong-password')    msg = '비밀번호가 올바르지 않습니다.';
    if (err.code === 'auth/invalid-email')     msg = '이메일 형식이 올바르지 않습니다.';
    if (err.code === 'auth/invalid-credential') msg = '이메일 또는 비밀번호가 올바르지 않습니다.';
    if (err.code === 'auth/too-many-requests') msg = '로그인 시도가 너무 많습니다. 잠시 후 다시 시도해주세요.';
    errEl.textContent = msg;
    errEl.style.display = 'block';
  }
}

async function doLogout() {
  try { await auth.signOut(); } catch(e) {}
  CU = null;
  sessionStorage.removeItem('mj_user');
  showScreen('screen-login');
}

// 비밀번호 재설정
async function showForgotPassword() {
  const email = prompt('가입한 이메일을 입력하세요:');
  if (!email) return;
  try {
    await auth.sendPasswordResetEmail(email);
    alert('비밀번호 재설정 링크를 이메일로 발송했습니다.\n메일함을 확인하세요.');
  } catch(err) {
    alert('오류: ' + err.message);
  }
}

function enterApp() { buildSidebar(); showScreen('screen-app'); showPage('page-dashboard'); }

// ── 회원가입 ─────────────────────────────
async function doRegister() {
  const name  = document.getElementById('reg-name').value.trim();
  const phone = document.getElementById('reg-phone').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const org   = document.getElementById('reg-org').value.trim();
  const team  = document.getElementById('reg-team').value;
  const pw    = document.getElementById('reg-pw').value;
  const pw2   = document.getElementById('reg-pw2').value;
  const errEl = document.getElementById('reg-error');
  const okEl  = document.getElementById('reg-ok');
  errEl.style.display = 'none'; okEl.style.display = 'none';

  if (!name||!phone||!email||!org||!pw) { errEl.textContent='필수 항목을 모두 입력해주세요.'; errEl.style.display='block'; return; }
  if (pw.length < 6) { errEl.textContent='비밀번호는 6자 이상이어야 합니다.'; errEl.style.display='block'; return; }
  if (pw !== pw2) { errEl.textContent='비밀번호가 일치하지 않습니다.'; errEl.style.display='block'; return; }

  try {
    // 1. Firebase Auth에 사용자 생성
    const cred = await auth.createUserWithEmailAndPassword(email, pw);
    const uid = cred.user.uid;

    // 2. Sheets에 사용자 메타 정보 저장 (비밀번호 제외!)
    const userData = {
      id: uid,
      이름: name,
      이메일: email,
      연락처: phone,
      소속: org,
      역할: '',
      담당팀: team,
      상태: 'pending'
    };

    if (CONFIG.API_URL) {
      await api('addUser', { data: userData });
    } else {
      const users = JSON.parse(localStorage.getItem('mj_users')||'[]');
      users.push({ ...userData, 등록일: new Date().toISOString().slice(0,10) });
      localStorage.setItem('mj_users', JSON.stringify(users));
    }

    // 3. 로그아웃 (승인 대기)
    await auth.signOut();

    okEl.textContent = '가입 신청 완료! 관리자 승인 후 로그인 가능합니다.';
    okEl.style.display = 'block';
  } catch(err) {
    let msg = err.message;
    if (err.code === 'auth/email-already-in-use') msg = '이미 등록된 이메일입니다.';
    if (err.code === 'auth/invalid-email')        msg = '이메일 형식이 올바르지 않습니다.';
    if (err.code === 'auth/weak-password')        msg = '비밀번호는 6자 이상이어야 합니다.';
    errEl.textContent = msg;
    errEl.style.display = 'block';
  }
}

// ── 사이드바 ─────────────────────────────
function buildSidebar() {
  const menus = CONFIG.MENUS[CU.역할] || CONFIG.MENUS['요청자'];
  document.getElementById('sidebar-nav').innerHTML = menus.map(m =>
    `<button class="nav-item" data-page="${m.id}" onclick="showPage('${m.id}')">${m.icon} ${m.label}</button>`
  ).join('');
  document.getElementById('sidebar-user').textContent = `${CU.이름} · ${CU.역할}`;
}

// ── 대시보드 ─────────────────────────────
function renderDashboard() {
  const data = visibleData();
  const now = new Date();
  document.getElementById('dash-date').textContent = `${now.getFullYear()}년 ${now.getMonth()+1}월 ${now.getDate()}일`;
  const cnt = s => data.filter(r => r.진행상태 === s).length;
  document.getElementById('stat-cards').innerHTML = `
    <div class="stat-card total" onclick="filterByStatus('')"><div class="stat-label">전체</div><div class="stat-value">${data.length}</div><div class="stat-sub">건</div></div>
    <div class="stat-card s1" onclick="filterByStatus('접수')"><div class="stat-label">접수</div><div class="stat-value">${cnt('접수')}</div><div class="stat-sub">건</div></div>
    <div class="stat-card s2" onclick="filterByStatus('SKB검토')"><div class="stat-label">SKB검토</div><div class="stat-value">${cnt('SKB검토')}</div><div class="stat-sub">건</div></div>
    <div class="stat-card s3" onclick="filterByStatus('협력사접수')"><div class="stat-label">협력사접수</div><div class="stat-value">${cnt('협력사접수')}</div><div class="stat-sub">건</div></div>
    <div class="stat-card s3b" onclick="filterByStatus('한전접수')"><div class="stat-label">한전접수</div><div class="stat-value">${cnt('한전접수')}</div><div class="stat-sub">건</div></div>
    <div class="stat-card s4" onclick="filterByStatus('처리완료')"><div class="stat-label">처리완료</div><div class="stat-value">${cnt('처리완료')}</div><div class="stat-sub">건</div></div>`;

  const teams = ['강남','동작','수원'];
  document.getElementById('team-stats').innerHTML = `
    <table class="team-table">
      <thead><tr><th>팀</th><th>전체</th><th>접수</th><th>SKB검토</th><th>협력사</th><th>한전</th><th>완료</th></tr></thead>
      <tbody>${teams.map(t => {
        const td = data.filter(r => r.운용팀 === t);
        return `<tr><td>${t}</td><td>${td.length}</td><td>${td.filter(r=>r.진행상태==='접수').length}</td><td>${td.filter(r=>r.진행상태==='SKB검토').length}</td><td>${td.filter(r=>r.진행상태==='협력사접수').length}</td><td>${td.filter(r=>r.진행상태==='한전접수').length}</td><td>${td.filter(r=>r.진행상태==='처리완료').length}</td></tr>`;
      }).join('')}</tbody>
    </table>`;

  const urgent = data.filter(r => r.우선순위==='긴급' && r.진행상태!=='처리완료');
  document.getElementById('urgent-list').innerHTML = urgent.length === 0
    ? '<div class="empty-state"><div class="empty-icon">✅</div><p>긴급 건 없음</p></div>'
    : urgent.map(r=>`<div class="urgent-item" onclick="openDetail('${r.KeyNO}')"><div><div style="font-size:11px;font-weight:700;color:#dc2626;font-family:monospace">${r.KeyNO}</div><div style="font-weight:700">${r.건물명}</div><div style="font-size:12px;color:#888">${r.운용팀} · ${sBadge(r.진행상태)}</div></div></div>`).join('');

  const recent = [...data].sort((a,b)=>(b.접수일시||'').localeCompare(a.접수일시||'')).slice(0,5);
  document.getElementById('recent-list').innerHTML = `
    <table class="data-table">
      <thead><tr><th>진행상태</th><th>접수NO</th><th>운용팀</th><th>건물명</th><th>우선순위</th><th>접수일시</th></tr></thead>
      <tbody>${recent.map(r=>`<tr onclick="openDetail('${r.KeyNO}')"><td>${sBadge(r.진행상태)}</td><td><code style="font-size:12px">${r.KeyNO}</code></td><td>${r.운용팀||''}</td><td><strong>${r.건물명||''}</strong></td><td>${pBadge(r.우선순위)}</td><td style="font-size:12px">${r.접수일시||''}</td></tr>`).join('')}</tbody>
    </table>`;
}

function filterByStatus(status) {
  showPage('page-list');
  setTimeout(() => {
    document.getElementById('f-status').value = status;
    renderList();
  }, 100);
}

// ── 접수 목록 ────────────────────────────
function renderList() {
  let data = visibleData();
  const fs = document.getElementById('f-status')?.value;
  const ft = document.getElementById('f-team')?.value;
  const fp = document.getElementById('f-priority')?.value;
  const fq = document.getElementById('f-search')?.value?.toLowerCase();
  if (fs) data = data.filter(r => r.진행상태 === fs);
  if (ft) data = data.filter(r => r.운용팀 === ft);
  if (fp) data = data.filter(r => r.우선순위 === fp);
  if (fq) data = data.filter(r => (r.KeyNO||'').toLowerCase().includes(fq)||(r.건물명||'').toLowerCase().includes(fq)||(r.건물주소||'').toLowerCase().includes(fq));

  // 정렬
  if (sortCol) {
    data.sort((a,b) => {
      const av = a[sortCol]||'', bv = b[sortCol]||'';
      return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    });
  } else {
    data.sort((a,b)=>(b.접수일시||'').localeCompare(a.접수일시||''));
  }

  const total = data.length;
  const paged = data.slice((curPage-1)*PER_PAGE, curPage*PER_PAGE);
  const cols = CONFIG.LIST_COLS;
  const labels = { 진행상태:'진행상태', KeyNO:'접수NO', 운용팀:'운용팀', 건물명:'건물명', 건물주소:'주소', 요청자이름:'요청자', 접수일시:'접수일시', 우선순위:'우선순위' };

  document.getElementById('t-head').innerHTML = cols.map(c =>
    `<th onclick="sortBy('${c}')" class="${sortCol===c?(sortDir==='asc'?'sort-asc':'sort-desc'):''}">${labels[c]||c}</th>`
  ).join('') + '<th></th>';

  document.getElementById('t-body').innerHTML = paged.length === 0
    ? '<tr><td colspan="9" style="text-align:center;padding:40px;color:#aaa">데이터가 없습니다</td></tr>'
    : paged.map(r=>`
      <tr ondblclick="openDetail('${r.KeyNO}')" onclick="openDetail('${r.KeyNO}')">
        ${cols.map(c=>{
          if(c==='진행상태') return `<td>${sBadge(r[c])}</td>`;
          if(c==='KeyNO')    return `<td><code style="font-size:12px">${r[c]||''}</code></td>`;
          if(c==='건물주소') return `<td style="font-size:12px;color:#666">${(r[c]||'').slice(0,16)}${(r[c]||'').length>16?'...':''}</td>`;
          if(c==='우선순위') return `<td>${pBadge(r[c])}</td>`;
          return `<td>${r[c]||''}</td>`;
        }).join('')}
        <td onclick="event.stopPropagation()">${actionBtns(r)}</td>
      </tr>`).join('');

  const pages = Math.ceil(total/PER_PAGE);
  document.getElementById('pagination').innerHTML = Array.from({length:pages},(_,i)=>
    `<button class="page-btn ${i+1===curPage?'active':''}" onclick="goPage(${i+1})">${i+1}</button>`).join('');
}

function sortBy(col) {
  if (sortCol === col) sortDir = sortDir === 'asc' ? 'desc' : 'asc';
  else { sortCol = col; sortDir = 'asc'; }
  renderList();
}

function goPage(n) { curPage = n; renderList(); }

function actionBtns(r) {
  if (CU?.역할 === 'SKB담당자' && r.진행상태 === '접수')
    return `<button class="btn-success btn-sm" onclick="quickStatus('${r.KeyNO}','SKB검토')">✅ SKB검토</button>`;
  if (CU?.역할 === '협력사' && r.진행상태 === 'SKB검토')
    return `<button class="btn-warning btn-sm" onclick="quickStatus('${r.KeyNO}','협력사접수')">📋 접수</button>`;
  if (CU?.역할 === '협력사' && r.진행상태 === '협력사접수')
    return `<button class="btn-warning btn-sm" onclick="quickStatus('${r.KeyNO}','한전접수')">⚡ 한전접수</button>`;
  if ((CU?.역할 === '협력사'||CU?.역할==='관리자') && r.진행상태 === '한전접수')
    return `<button class="btn-primary btn-sm" onclick="quickComplete('${r.KeyNO}')">🏁 완료</button>`;
  return '';
}

async function quickStatus(no, status) {
  const btn = event?.target;
  if (btn) { btn.disabled = true; btn.textContent = '처리중...'; }
  await updateStatus(no, status);
  toast(status + ' 처리 완료', 'success');
  renderList();
}

async function quickComplete(no) {
  const btn = event?.target;
  if (btn) { btn.disabled = true; btn.textContent = '처리중...'; }
  await updateStatus(no, '처리완료');
  if (CONFIG.API_URL) await api('sendComplete', { no });
  toast('처리완료 및 메일 발송', 'success');
  renderList();
}

function visibleData() {
  if (!CU) return [];
  if (CU.역할 === '관리자') return allData;
  if (CU.역할 === 'SKB담당자') return allData.filter(r => r.운용팀 === CU.담당팀);
  if (CU.역할 === '협력사') return allData.filter(r => ['SKB검토','협력사접수','한전접수','처리완료'].includes(r.진행상태));
  return allData.filter(r => r.요청자이메일 === CU.이메일 || r.요청자이름 === CU.이름);
}

// ── 상세보기 ─────────────────────────────
function openDetail(no) {
  const r = allData.find(d => d.KeyNO === no);
  if (!r) return;
  const isAdmin = CU?.역할 === '관리자';
  const isSKB   = CU?.역할 === 'SKB담당자';
  const isPart  = CU?.역할 === '협력사';

  document.getElementById('detail-content').innerHTML = `
    <div class="detail-card">
      <div class="detail-header">
        <div><div class="detail-no">${r.KeyNO}</div><div style="margin-top:6px">${sBadge(r.진행상태)} ${pBadge(r.우선순위)}</div></div>
        <div class="detail-actions">
          ${isAdmin?`
            <select onchange="updateStatusUI('${no}',this.value)" style="padding:8px 12px;border:2px solid #d1dce8;border-radius:8px;font-family:inherit">
              ${CONFIG.OPTIONS.진행상태.map(s=>`<option ${r.진행상태===s?'selected':''}>${s}</option>`).join('')}
            </select>
            <button class="btn-outline btn-sm" onclick="showEditModal('${no}')">✏️ 수정</button>
            <button class="btn-outline btn-sm" onclick="showMemoModal('${no}')">📝 메모</button>
          `:''}
          ${isSKB&&r.진행상태==='접수'?`<button class="btn-success" onclick="quickStatus('${no}','SKB검토');showPage('page-list')">✅ SKB검토 처리</button>`:''}
          ${isPart?`<button class="btn-outline btn-sm" onclick="showMemoModal('${no}')">📝 처리메모</button>`:''}
          ${isPart&&r.진행상태==='한전접수'?`<button class="btn-primary" onclick="quickComplete('${no}');showPage('page-list')">🏁 처리완료</button>`:''}
        </div>
      </div>
      <div class="detail-grid">
        ${df('건물명',r.건물명)}${df('건물주소',r.건물주소)}${df('건물코드',r.건물코드)}
        ${df('운용팀',r.운용팀)}${df('정보센터',r.정보센터)}${df('건물유형',r.건물유형)}
        ${df('장비설치일',r.장비설치일)}${df('동수',r.동수)}${df('세대수',r.세대수)}
        ${df('국사코드',r.국사코드)}${df('국사명',r.국사명)}${df('청구유형',r.청구유형)}
        ${df('민원인이름',r.민원인이름)}${df('민원인연락처',r.민원인연락처)}${df('민원인Email',r.민원인Email)}
        ${df('요청자소속',r.요청자소속)}${df('요청자이름',r.요청자이름)}${df('요청자연락처',r.요청자연락처)}
        ${df('차단기위치',r.차단기위치)}${df('계량기위치',r.계량기위치)}${df('요청구분',r.요청구분)}
        ${df('접수일시',r.접수일시)}${df('최종수정일',r.최종수정일)}
      </div>
      ${r.특이사항?`<div style="margin-top:14px;padding:12px;background:#fef3c7;border-radius:8px;border-left:3px solid #f59e0b"><strong>⚠️ 특이사항:</strong> <span></span></div>`:''}
      ${r.처리메모?`<div style="margin-top:8px;padding:12px;background:#f0f9ff;border-radius:8px;border-left:3px solid #0ea5e9"><strong>📝 처리메모:</strong> <span></span></div>`:''}
      ${r.사진링크?`<div style="margin-top:8px;padding:12px;background:#f0fdf4;border-radius:8px;border-left:3px solid var(--success)"><strong>📷 첨부사진/파일</strong><div style="margin-top:8px;display:flex;flex-wrap:wrap;gap:8px">${r.사진링크.split('\n').filter(u=>u.trim()).map((u,i)=>`<a href="${u.trim()}" target="_blank" style="display:inline-flex;align-items:center;gap:4px;padding:5px 12px;background:#fff;border:1px solid var(--border);border-radius:6px;font-size:12px;color:var(--accent);text-decoration:none">📎 파일 ${i+1}</a>`).join('')}</div></div>`:''}
    </div>`;
  showPage('page-detail');
  // XSS 방지: 사용자 입력값은 textContent로 삽입
  const spans = document.getElementById('detail-content').querySelectorAll('span');
  if (r.특이사항 && spans[0]) spans[0].textContent = r.특이사항;
  if (r.처리메모 && spans[1]) spans[1].textContent = r.처리메모;
}

function df(label, value) {
  return `<div class="detail-item"><div class="detail-label">${label}</div><div class="detail-value">${escHtml(value||'-')}</div></div>`;
}

function escHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

async function updateStatusUI(no, status) {
  await updateStatus(no, status);
  if (status === '처리완료' && CONFIG.API_URL) await api('sendComplete', { no });
  openDetail(no);
  toast('상태 변경 완료', 'success');
}

async function updateStatus(no, status) {
  const today = new Date().toISOString().slice(0,10);
  if (CONFIG.API_URL) {
    await api('updateRecord', { no, data: { 진행상태:status, 최종수정일:today } });
    await syncData();
  } else {
    const records = JSON.parse(localStorage.getItem('mj_records')||'[]');
    const idx = records.findIndex(r => r.KeyNO === no);
    if (idx > -1) { records[idx].진행상태 = status; records[idx].최종수정일 = today; localStorage.setItem('mj_records', JSON.stringify(records)); }
    await syncData();
  }
}

// 전체 수정 모달 (관리자)
function showEditModal(no) {
  const r = allData.find(d => d.KeyNO === no);
  if (!r) return;
  const O = CONFIG.OPTIONS;
  const dd = (k,opts,lbl) => `<div class="form-group"><label>${lbl}</label><select id="e-${k}">${opts.map(o=>`<option ${r[k]===o?'selected':''}>${o}</option>`).join('')}</select></div>`;
  const tf = (k,lbl,type='text') => `<div class="form-group"><label>${lbl}</label><input type="${type}" id="e-${k}" value="${r[k]||''}"></div>`;
  document.getElementById('modal-body').innerHTML = `
    <h3 style="margin-bottom:14px;color:var(--primary)">✏️ 수정 - ${no}</h3>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;max-height:55vh;overflow-y:auto;padding-right:4px">
      ${dd('운용팀',O.운용팀,'운용팀')}${dd('우선순위',O.우선순위,'우선순위')}
      ${dd('진행상태',O.진행상태,'진행상태')}${dd('정보센터',O.정보센터,'정보센터')}
      ${tf('건물명','건물명')}${tf('건물주소','건물주소')}
      ${tf('건물코드','건물코드')}${tf('장비설치일','장비설치일','date')}
      ${tf('동수','동수')}${tf('세대수','세대수')}
      ${dd('건물유형',O.건물유형,'건물유형')}${dd('청구유형',O.청구유형,'청구유형')}
      ${tf('국사코드','국사코드')}${tf('국사명','국사명')}
      ${tf('민원인이름','민원인이름')}${tf('민원인연락처','민원인연락처')}
      ${tf('민원인Email','민원인Email','email')}${dd('요청자소속',O.요청자소속,'요청자소속')}
      ${tf('요청자이름','요청자이름')}${tf('요청자연락처','요청자연락처')}
      ${tf('차단기위치','차단기위치')}${tf('계량기위치','계량기위치')}
      ${dd('요청구분',O.요청구분,'요청구분')}
    </div>
    <div class="form-group" style="margin-top:10px"><label>특이사항</label><textarea id="e-특이사항">${r.특이사항||''}</textarea></div>
    <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:12px">
      <button class="btn-ghost" onclick="closeModal()">취소</button>
      <button class="btn-primary" onclick="saveEdit('${no}')">저장</button>
    </div>`;
  openModal();
}

async function saveEdit(no) {
  const keys = ['운용팀','우선순위','진행상태','정보센터','건물명','건물주소','건물코드','장비설치일','동수','세대수','건물유형','청구유형','국사코드','국사명','민원인이름','민원인연락처','민원인Email','요청자소속','요청자이름','요청자연락처','차단기위치','계량기위치','요청구분','특이사항'];
  const data = {};
  keys.forEach(k => { const el = document.getElementById('e-'+k); if(el) data[k] = el.value; });
  if (CONFIG.API_URL) { await api('updateRecord', { no, data }); await syncData(); }
  else {
    const records = JSON.parse(localStorage.getItem('mj_records')||'[]');
    const idx = records.findIndex(r => r.KeyNO === no);
    if (idx > -1) { Object.assign(records[idx], data); records[idx].최종수정일 = new Date().toISOString().slice(0,10); localStorage.setItem('mj_records', JSON.stringify(records)); }
    await syncData();
  }
  if (data.진행상태 === '처리완료' && CONFIG.API_URL) await api('sendComplete', { no });
  closeModal(); openDetail(no); toast('수정 완료', 'success');
}

function showMemoModal(no) {
  const r = allData.find(d => d.KeyNO === no);
  document.getElementById('modal-body').innerHTML = `
    <h3 style="margin-bottom:14px;color:var(--primary)">📝 처리 메모</h3>
    <div class="form-group" style="margin-bottom:12px"><label>처리 메모</label><textarea id="m-memo" rows="4" style="width:100%">${r?.처리메모||''}</textarea></div>
    <div style="display:flex;gap:8px;justify-content:flex-end">
      <button class="btn-ghost" onclick="closeModal()">취소</button>
      <button class="btn-primary" onclick="saveMemo('${no}')">저장</button>
    </div>`;
  openModal();
}

async function saveMemo(no) {
  const memo = document.getElementById('m-memo').value;
  if (CONFIG.API_URL) { await api('updateRecord', { no, data: { 처리메모:memo } }); await syncData(); }
  else {
    const records = JSON.parse(localStorage.getItem('mj_records')||'[]');
    const idx = records.findIndex(r => r.KeyNO === no);
    if (idx > -1) { records[idx].처리메모 = memo; records[idx].최종수정일 = new Date().toISOString().slice(0,10); localStorage.setItem('mj_records', JSON.stringify(records)); }
    await syncData();
  }
  closeModal(); openDetail(no); toast('저장 완료', 'success');
}

// ── 접수 폼 ──────────────────────────────
function reqFormHTML(prefix, autoFill = false) {
  const O = CONFIG.OPTIONS;
  const u = autoFill && CU ? CU : null;
  const dd = (k,opts,lbl,req=false) => `<div class="form-group"><label>${lbl}${req?' *':''}</label><select id="${prefix}-${k}"><option value="">선택</option>${opts.map(o=>`<option>${o}</option>`).join('')}</select></div>`;
  const tf = (k,lbl,ph='',req=false,type='text',val='') => `<div class="form-group"><label>${lbl}${req?' *':''}</label><input type="${type}" id="${prefix}-${k}" placeholder="${ph}" value="${val}"></div>`;
  return `
    <div class="form-section"><div class="form-section-title">📌 기본 정보</div>
      <div class="form-grid">${dd('운용팀',O.운용팀,'운용팀',true)}${dd('정보센터',O.정보센터,'정보센터')}${dd('우선순위',O.우선순위,'우선순위',true)}</div>
    </div>
    <div class="form-section"><div class="form-section-title">🏢 건물 정보</div>
      <div class="form-grid">
        ${tf('건물명','건물명','가나다라아파트',true)}
        ${tf('건물주소','건물주소','경기 화성시 오산동 977-3',true)}
        ${tf('건물코드','건물코드(15자리)','T50130320836437')}
        ${tf('장비설치일','장비설치일','',false,'date')}
        ${tf('동수','동수','3동')}
        ${tf('세대수','세대수','1500세대')}
        ${dd('건물유형',O.건물유형,'건물유형')}
        ${tf('국사코드','국사코드','W20029')}
        ${tf('국사명','국사명','용인_영덕경기행복주택')}
        ${dd('청구유형',O.청구유형,'청구유형')}
        ${tf('차단기위치','차단기위치','1층 관리소내 MDF')}
        ${tf('계량기위치','계량기위치','1층 관리소내 MDF')}
      </div>
    </div>
    <div class="form-section"><div class="form-section-title">👤 민원인 정보</div>
      <div class="form-grid col2">
        ${tf('민원인이름','민원인이름','관리소장')}
        ${tf('민원인연락처','민원인연락처','02-123-4567')}
        ${tf('민원인Email','민원인이메일','xxxx@naver.com',false,'email')}
      </div>
    </div>
    <div class="form-section"><div class="form-section-title">📋 요청자 정보</div>
      <div class="form-grid">
        ${dd('요청자소속',O.요청자소속,'요청자소속',true)}
        ${tf('요청자이름','요청자이름','홍길동',true,'text', u?.이름||'')}
        ${tf('요청자연락처','요청자연락처','010-0000-0000',true,'text', u?.연락처||'')}
        ${dd('요청구분',O.요청구분,'요청구분',true)}
      </div>
    </div>
    <div class="form-section"><div class="form-section-title">📷 첨부파일</div>
      <div class="form-group">
        <label>현장 사진 (구글 드라이브 자동 저장)</label>
        <div class="photo-upload-area" onclick="document.getElementById('${prefix}-photo').click()">
          📷 사진을 클릭하거나 드래그해서 업로드
          <input type="file" id="${prefix}-photo" accept="image/*" multiple style="display:none" onchange="previewPhotos('${prefix}')">
        </div>
        <div class="photo-preview" id="${prefix}-preview"></div>
      </div>
    </div>
    <div class="form-group"><label>특이사항</label><textarea id="${prefix}-특이사항" placeholder="특이사항 입력"></textarea></div>
    <div id="${prefix}-error" class="error-msg" style="display:none;margin:10px 0"></div>
    <button class="btn-primary" style="margin-top:12px" onclick="submitReq('${prefix}')">📤 신청 접수</button>`;
}

function previewPhotos(prefix) {
  const input = document.getElementById(`${prefix}-photo`);
  const preview = document.getElementById(`${prefix}-preview`);
  preview.innerHTML = '';
  Array.from(input.files).forEach(file => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = document.createElement('img');
      img.src = e.target.result;
      preview.appendChild(img);
    };
    reader.readAsDataURL(file);
  });
}

function buildPubForm()    { document.getElementById('pub-form-area').innerHTML = reqFormHTML('pub', false); }
function buildNewReqForm() { document.getElementById('new-req-wrap').innerHTML = `<h2 class="card-title">✏️ 모자분리 신규신청</h2><p class="card-desc">필수 항목(*)을 모두 입력해주세요</p>${reqFormHTML('new', true)}`; }
function showPublicForm()  { buildPubForm(); showScreen('screen-public'); }
function resetPubForm()    { document.getElementById('pub-form-area').style.display='block'; document.getElementById('pub-success').style.display='none'; buildPubForm(); }

async function submitReq(prefix) {
  const g  = id => document.getElementById(`${prefix}-${id}`)?.value?.trim()||'';
  const errEl = document.getElementById(`${prefix}-error`);
  if (!g('운용팀')||!g('건물명')||!g('건물주소')||!g('요청자이름')||!g('요청자연락처')||!g('요청구분')) {
    errEl.textContent='필수 항목(*)을 모두 입력해주세요.'; errEl.style.display='block'; return;
  }
  errEl.style.display='none';
  const data = {
    본부:'수남', 진행상태:'접수',
    운용팀:g('운용팀'), 정보센터:g('정보센터'), 우선순위:g('우선순위')||'보통',
    건물명:g('건물명'), 건물주소:g('건물주소'), 건물코드:g('건물코드'),
    장비설치일:g('장비설치일'), 동수:g('동수'), 세대수:g('세대수'), 건물유형:g('건물유형'),
    국사코드:g('국사코드'), 국사명:g('국사명'), 청구유형:g('청구유형'),
    차단기위치:g('차단기위치'), 계량기위치:g('계량기위치'),
    민원인이름:g('민원인이름'), 민원인연락처:g('민원인연락처'), 민원인Email:g('민원인Email'),
    요청자소속:g('요청자소속'), 요청자이름:g('요청자이름'), 요청자연락처:g('요청자연락처'),
    요청구분:g('요청구분'), 특이사항:g('특이사항'),
    처리메모:'', 설치장비List:'', 기타첨부서류:'', 사진링크:'',
  };

  let no;
  if (CONFIG.API_URL) {
    const res = await api('addRecord', { data });
    if (res?.error) { errEl.textContent=res.error; errEl.style.display='block'; return; }
    no = res.no;
    await syncData();
  } else {
    no = genLocalNo();
    const today = new Date().toISOString();
    const records = JSON.parse(localStorage.getItem('mj_records')||'[]');
    records.push({ KeyNO:no, 접수일시:today.slice(0,16).replace('T',' '), 최종수정일:today.slice(0,10), ...data });
    localStorage.setItem('mj_records', JSON.stringify(records));
    await syncData();
  }

  // 사진 업로드
  const photoInput = document.getElementById(`${prefix}-photo`);
  if (photoInput?.files?.length > 0 && CONFIG.API_URL) {
    const dateStr = new Date().toISOString().slice(0,10).replace(/-/g,'');
    for (const file of photoInput.files) {
      const b64 = await toBase64(file);
      await api('uploadPhoto', { no, buildingName: data.건물명, date: dateStr, fileName: file.name, fileData: b64, mimeType: file.type });
    }
    await syncData();
  }

  if (prefix === 'pub') {
    document.getElementById('pub-form-area').style.display = 'none';
    document.getElementById('pub-result-no').textContent = no;
    document.getElementById('pub-success').style.display = 'block';
  } else {
    toast('신청 완료: ' + no, 'success');
    showPage('page-list');
  }
}

function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function genLocalNo() {
  const yr = new Date().getFullYear();
  const records = JSON.parse(localStorage.getItem('mj_records')||'[]');
  const max = records.filter(r=>(r.KeyNO||'').startsWith(`MJ-${yr}-`))
    .reduce((m,r)=>Math.max(m,parseInt((r.KeyNO||'').split('-')[2]||0)),0);
  return `MJ-${yr}-${String(max+1).padStart(3,'0')}`;
}

// ── CSV 내보내기 ──────────────────────────
function exportCSV() {
  const data = visibleData();
  const cols = CONFIG.EXPORT_COLS;
  const rows = [cols, ...data.map(r => cols.map(c => r[c]||''))];
  const csv  = '\uFEFF' + rows.map(r => r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));
  a.download = `모자분리신청목록_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
}

// ── 사용자 관리 ───────────────────────────
function renderUsers() {
  const pending  = allUsers.filter(u => u.상태 === 'pending');
  const approved = allUsers.filter(u => u.상태 === 'approved');
  document.getElementById('user-content').innerHTML = `
    <div class="dash-panel" style="margin-bottom:14px">
      <h3>⏳ 승인 대기 (${pending.length}명)</h3>
      ${pending.length===0
        ? '<div class="empty-state"><div class="empty-icon">✅</div><p>대기 없음</p></div>'
        : pending.map(u=>`
          <div class="user-card">
            <div class="user-info">
              <div class="user-name">${u.이름}</div>
              <div class="user-meta">${u.이메일} · ${u.연락처} · ${u.소속}${u.담당팀?' · '+u.담당팀:''}</div>
            </div>
            <div class="user-actions">
              <select id="role-${u.id}" style="padding:6px 10px;border:2px solid #d1dce8;border-radius:8px;font-family:inherit;font-size:12px">
                <option value="">역할선택</option>${CONFIG.OPTIONS.역할.map(r=>`<option>${r}</option>`).join('')}
              </select>
              <select id="team-${u.id}" style="padding:6px 10px;border:2px solid #d1dce8;border-radius:8px;font-family:inherit;font-size:12px">
                <option value="">팀선택</option>${CONFIG.OPTIONS.운용팀.map(t=>`<option>${t}</option>`).join('')}<option value="전체">전체</option>
              </select>
              <button class="btn-success btn-sm" onclick="approveUser('${u.id}')">✅ 승인</button>
              <button class="btn-danger btn-sm" onclick="rejectUser('${u.id}')">❌ 거절</button>
            </div>
          </div>`).join('')}
    </div>
    <div class="dash-panel">
      <h3>✅ 승인된 사용자 (${approved.length}명)</h3>
      ${approved.map(u=>`
        <div class="user-card">
          <div class="user-info">
            <div class="user-name">${u.이름} <span class="status-badge badge-approved">${u.역할||'미지정'}</span></div>
            <div class="user-meta">${u.이메일} · ${u.연락처} · ${u.소속}${u.담당팀?' · '+u.담당팀:''}</div>
          </div>
          <div class="user-actions">
            <button class="btn-outline btn-sm" onclick="showEditUserModal('${u.id}')">✏️ 수정</button>
            <button class="btn-outline btn-sm" onclick="showChangeRoleModal('${u.id}')">역할변경</button>
            <button class="btn-danger btn-sm" onclick="removeUser('${u.id}')">삭제</button>
          </div>
        </div>`).join('')}
    </div>`;
}

// 사용자 정보 전체 수정
function showEditUserModal(id) {
  const u = allUsers.find(x => x.id === id);
  if (!u) return;
  document.getElementById('modal-body').innerHTML = `
    <h3 style="margin-bottom:14px;color:var(--primary)">✏️ 사용자 정보 수정</h3>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
      <div class="form-group"><label>이름 *</label><input type="text" id="eu-name" value="${u.이름||''}"></div>
      <div class="form-group"><label>연락처</label><input type="text" id="eu-phone" value="${u.연락처||''}"></div>
      <div class="form-group"><label>이메일</label><input type="email" id="eu-email" value="${u.이메일||''}"></div>
      <div class="form-group"><label>소속</label><input type="text" id="eu-org" value="${u.소속||''}"></div>
      <div class="form-group"><label>역할</label><select id="eu-role">${CONFIG.OPTIONS.역할.map(r=>`<option ${u.역할===r?'selected':''}>${r}</option>`).join('')}</select></div>
      <div class="form-group"><label>담당팀</label><select id="eu-team"><option value="">없음</option>${CONFIG.OPTIONS.운용팀.map(t=>`<option ${u.담당팀===t?'selected':''}>${t}</option>`).join('')}<option ${u.담당팀==='전체'?'selected':''} value="전체">전체</option></select></div>
      <div class="form-group span2"><label>비밀번호 변경 (비워두면 유지)</label><input type="password" id="eu-pw" placeholder="새 비밀번호"></div>
    </div>
    <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:14px">
      <button class="btn-ghost" onclick="closeModal()">취소</button>
      <button class="btn-primary" onclick="saveEditUser('${id}')">저장</button>
    </div>`;
  openModal();
}

async function saveEditUser(id) {
  const data = {
    이름:  document.getElementById('eu-name').value.trim(),
    연락처:document.getElementById('eu-phone').value.trim(),
    이메일:document.getElementById('eu-email').value.trim(),
    소속:  document.getElementById('eu-org').value.trim(),
    역할:  document.getElementById('eu-role').value,
    담당팀:document.getElementById('eu-team').value,
  };
  const pw = document.getElementById('eu-pw').value;
  if (pw) {
    alert('비밀번호 변경은 Firebase Console → Authentication에서 직접 수정해주세요.\n또는 해당 사용자가 로그인 화면에서 "비밀번호를 잊으셨나요?"를 사용하세요.');
  }
  if (CONFIG.API_URL) { await api('updateUser', { id, data }); }
  else {
    const users = JSON.parse(localStorage.getItem('mj_users')||'[]');
    const idx = users.findIndex(u => u.id === id);
    if (idx > -1) { Object.assign(users[idx], data); localStorage.setItem('mj_users', JSON.stringify(users)); }
  }
  await syncData();
  closeModal(); renderUsers(); toast('사용자 정보 수정 완료', 'success');
}

async function approveUser(id) {
  const role = document.getElementById('role-'+id)?.value;
  const team = document.getElementById('team-'+id)?.value;
  if (!role) { toast('역할을 선택해주세요', 'error'); return; }
  const data = { 상태:'approved', 역할:role, 담당팀:team||'' };
  if (CONFIG.API_URL) { await api('updateUser', { id, data }); }
  else {
    const users = JSON.parse(localStorage.getItem('mj_users')||'[]');
    const idx = users.findIndex(u => u.id === id);
    if (idx > -1) { Object.assign(users[idx], data); localStorage.setItem('mj_users', JSON.stringify(users)); }
  }
  await syncData(); renderUsers(); toast('승인 완료', 'success');
}

async function rejectUser(id) {
  if (!confirm('거절하시겠습니까?')) return;
  if (CONFIG.API_URL) { await api('updateUser', { id, data:{ 상태:'rejected' } }); }
  else {
    const users = JSON.parse(localStorage.getItem('mj_users')||'[]');
    const idx = users.findIndex(u => u.id === id);
    if (idx > -1) { users[idx].상태 = 'rejected'; localStorage.setItem('mj_users', JSON.stringify(users)); }
  }
  await syncData(); renderUsers();
}

async function removeUser(id) {
  if (!confirm('삭제하시겠습니까?')) return;
  if (CONFIG.API_URL) { await api('deleteUser', { id }); }
  else {
    const users = JSON.parse(localStorage.getItem('mj_users')||'[]').filter(u => u.id !== id);
    localStorage.setItem('mj_users', JSON.stringify(users));
  }
  await syncData(); renderUsers(); toast('삭제 완료', 'success');
}

function showChangeRoleModal(id) {
  const u = allUsers.find(x => x.id === id);
  document.getElementById('modal-body').innerHTML = `
    <h3 style="margin-bottom:14px;color:var(--primary)">역할 / 담당팀 변경</h3>
    <div class="form-group" style="margin-bottom:10px"><label>역할</label><select id="cr-role">${CONFIG.OPTIONS.역할.map(r=>`<option ${u.역할===r?'selected':''}>${r}</option>`).join('')}</select></div>
    <div class="form-group" style="margin-bottom:14px"><label>담당팀</label><select id="cr-team"><option value="">없음</option>${CONFIG.OPTIONS.운용팀.map(t=>`<option ${u.담당팀===t?'selected':''}>${t}</option>`).join('')}<option ${u.담당팀==='전체'?'selected':''} value="전체">전체</option></select></div>
    <div style="display:flex;gap:8px;justify-content:flex-end">
      <button class="btn-ghost" onclick="closeModal()">취소</button>
      <button class="btn-primary" onclick="saveRole('${id}')">저장</button>
    </div>`;
  openModal();
}

async function saveRole(id) {
  const data = { 역할:document.getElementById('cr-role').value, 담당팀:document.getElementById('cr-team').value };
  if (CONFIG.API_URL) { await api('updateUser', { id, data }); }
  else {
    const users = JSON.parse(localStorage.getItem('mj_users')||'[]');
    const idx = users.findIndex(u => u.id === id);
    if (idx > -1) { Object.assign(users[idx], data); localStorage.setItem('mj_users', JSON.stringify(users)); }
  }
  await syncData(); closeModal(); renderUsers(); toast('변경 완료', 'success');
}

function showAddUserModal() {
  document.getElementById('modal-body').innerHTML = `
    <h3 style="margin-bottom:14px;color:var(--primary)">👤 사용자 직접 추가</h3>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
      <div class="form-group"><label>이름 *</label><input type="text" id="au-name" placeholder="홍길동"></div>
      <div class="form-group"><label>연락처 *</label><input type="text" id="au-phone" placeholder="010-0000-0000"></div>
      <div class="form-group"><label>이메일 *</label><input type="email" id="au-email"></div>
      <div class="form-group"><label>소속 *</label><input type="text" id="au-org"></div>
      <div class="form-group"><label>역할 *</label><select id="au-role"><option value="">선택</option>${CONFIG.OPTIONS.역할.map(r=>`<option>${r}</option>`).join('')}</select></div>
      <div class="form-group"><label>담당팀</label><select id="au-team"><option value="">없음</option>${CONFIG.OPTIONS.운용팀.map(t=>`<option>${t}</option>`).join('')}<option value="전체">전체</option></select></div>
      <div class="form-group"><label>비밀번호 *</label><input type="password" id="au-pw"></div>
    </div>
    <div id="au-error" class="error-msg" style="display:none;margin-top:10px"></div>
    <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:14px">
      <button class="btn-ghost" onclick="closeModal()">취소</button>
      <button class="btn-primary" onclick="addUserDirect()">추가</button>
    </div>`;
  openModal();
}

async function addUserDirect() {
  const name=document.getElementById('au-name').value.trim(),phone=document.getElementById('au-phone').value.trim(),
    email=document.getElementById('au-email').value.trim(),org=document.getElementById('au-org').value.trim(),
    role=document.getElementById('au-role').value,team=document.getElementById('au-team').value,
    pw=document.getElementById('au-pw').value;
  const errEl=document.getElementById('au-error');
  if (!name||!phone||!email||!org||!role||!pw){errEl.textContent='필수 항목을 모두 입력해주세요.';errEl.style.display='block';return;}
  if (pw.length < 6) { errEl.textContent='비밀번호는 6자 이상이어야 합니다.';errEl.style.display='block';return; }

  // 관리자가 추가하는 경우: Firebase에 계정 생성 안내
  alert('Firebase Console에서 사용자를 직접 추가해주세요:\n\nFirebase Console → Authentication → 사용자 → 사용자 추가\n이메일: ' + email + '\n비밀번호: ' + pw + '\n\n그 다음 Sheets에 정보가 저장됩니다.');

  const data={id:'u'+Date.now(),이름:name,이메일:email,연락처:phone,소속:org,역할:role,담당팀:team,상태:'approved'};
  if (CONFIG.API_URL){const res=await api('addUser',{data});if(res?.error){errEl.textContent=res.error;errEl.style.display='block';return;}}
  else{
    const users=JSON.parse(localStorage.getItem('mj_users')||'[]');
    if(users.find(u=>u.이메일===email)){errEl.textContent='이미 등록된 이메일입니다.';errEl.style.display='block';return;}
    users.push({...data,등록일:new Date().toISOString().slice(0,10)});
    localStorage.setItem('mj_users',JSON.stringify(users));
  }
  await syncData();closeModal();renderUsers();toast('사용자 추가 완료','success');
}

// ── 유틸 ──────────────────────────────────
function sBadge(s){const m={'접수':'badge-접수','SKB검토':'badge-SKB검토','협력사접수':'badge-협력사접수','한전접수':'badge-한전접수','처리완료':'badge-처리완료'};return`<span class="status-badge ${m[s]||''}">${s||'-'}</span>`;}
function pBadge(p){return`<span class="status-badge ${p==='긴급'?'badge-긴급':'badge-보통'}">${p||'-'}</span>`;}
function openModal(){document.getElementById('modal-overlay').classList.add('open');}
function closeModal(){document.getElementById('modal-overlay').classList.remove('open');}
function toast(msg,type='success'){const el=document.createElement('div');el.className=`toast ${type}`;el.textContent=msg;document.body.appendChild(el);setTimeout(()=>el.remove(),3000);}
