// ══════════════════════════════════════════
// app.js  ─  모자분리 공사요청 시스템
// ══════════════════════════════════════════

// ── 상태 ──────────────────────────────────
let currentUser = null;
let allData = [];
let allUsers = [];
let currentPage = 1;
const PAGE_SIZE = 20;

// ── 초기화 ────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  initStorage();
  const saved = localStorage.getItem('mj_user');
  if (saved) {
    currentUser = JSON.parse(saved);
    enterApp();
  } else {
    showScreen('screen-login');
  }
  buildRequestForm();
  document.getElementById('reg-role').addEventListener('change', function () {
    document.getElementById('reg-team-wrap').style.display =
      this.value === 'SKB담당자' ? 'block' : 'none';
  });
  setInterval(syncFromStorage, 5000);
});

// ── 로컬 스토리지 초기화 (샘플 데이터) ──
function initStorage() {
  if (!localStorage.getItem('mj_records')) {
    const sample = [
      makeRecord({
        건물명:'가나다라아파트', 건물주소:'경기 화성시 오산동 977-3', 건물코드:'T50130320836437',
        운용팀:'강남', 건물유형:'아파트', 청구유형:'정액제', 요청자소속:'HNS',
        요청자이름:'홍길동', 요청자연락처:'010-1111-2222', 민원인이름:'관리소장',
        민원인연락처:'02-123-4567', 민원인Email:'xxxx@naver.com',
        차단기위치:'1층 관리소내 MDF', 계량기위치:'1층 관리소내 MDF',
        요청구분:'아파트요청', 우선순위:'긴급', 특이사항:'진짜 큰일났음 빨리해달라함',
        SKB담당자:'강남담당', 진행상태:'접수', 국사코드:'W20029',
        국사명:'용인_영덕경기행복주택(GPON)_TYPEB', 동세대수:'3동/1500세대',
      }),
      makeRecord({
        건물명:'라마바사아파트', 건물주소:'경기 수원시 영통구 123-4', 건물코드:'T50130320999999',
        운용팀:'수원', 건물유형:'아파트', 청구유형:'종량제', 요청자소속:'SKB',
        요청자이름:'김철수', 요청자연락처:'010-2222-3333', 민원인이름:'홍관리자',
        민원인연락처:'031-555-1234', 민원인Email:'mgr@naver.com',
        차단기위치:'B1 전기실', 계량기위치:'B1 전기실',
        요청구분:'신규(운용팀)', 우선순위:'보통', 특이사항:'',
        SKB담당자:'수원담당', 진행상태:'SKB검토승인', 처리메모:'서류검토 완료',
      }),
      makeRecord({
        건물명:'하나빌라', 건물주소:'서울 동작구 사당동 456-7', 건물코드:'T50130320111111',
        운용팀:'동작', 건물유형:'빌라', 청구유형:'해지', 요청자소속:'기타',
        요청자이름:'이영희', 요청자연락처:'010-3333-4444', 민원인이름:'세입자',
        민원인연락처:'010-9999-8888', 민원인Email:'',
        차단기위치:'옥상 단자함', 계량기위치:'옥상 단자함',
        요청구분:'변경/해지', 우선순위:'보통', 특이사항:'',
        SKB담당자:'동작담당', 진행상태:'협력사진행중', 처리메모:'현장 방문 예정',
      }),
    ];
    localStorage.setItem('mj_records', JSON.stringify(sample));
  }

  if (!localStorage.getItem('mj_users')) {
    const users = [
      { id:'u1', name:'관리자', email:'admin@pcnieng.com', phone:'010-0000-0000', role:'관리자', team:'전체', pw:'admin1234', status:'approved' },
      { id:'u2', name:'강남담당', email:'gangnam@skb.com', phone:'010-1234-5678', role:'SKB담당자', team:'강남', pw:'skb1234', status:'approved' },
      { id:'u3', name:'동작담당', email:'dongjak@skb.com', phone:'010-2345-6789', role:'SKB담당자', team:'동작', pw:'skb1234', status:'approved' },
      { id:'u4', name:'수원담당', email:'suwon@skb.com', phone:'010-3456-7890', role:'SKB담당자', team:'수원', pw:'skb1234', status:'approved' },
      { id:'u5', name:'이지전기통신', email:'eji@partner.com', phone:'010-5555-6666', role:'협력사', team:'전체', pw:'eji1234', status:'approved' },
    ];
    localStorage.setItem('mj_users', JSON.stringify(users));
  }
}

function syncFromStorage() {
  allData = JSON.parse(localStorage.getItem('mj_records') || '[]');
  allUsers = JSON.parse(localStorage.getItem('mj_users') || '[]');
}

// ── 접수 번호 생성 ──
function generateNo() {
  const records = JSON.parse(localStorage.getItem('mj_records') || '[]');
  const year = new Date().getFullYear();
  const count = records.filter(r => r.접수NO && r.접수NO.startsWith(`MJ-${year}-`)).length;
  return `MJ-${year}-${String(count + 1).padStart(3, '0')}`;
}

function makeRecord(data) {
  const year = new Date().getFullYear();
  const records = JSON.parse(localStorage.getItem('mj_records') || '[]');
  const count = records.filter(r => r.접수NO && r.접수NO.startsWith(`MJ-${year}-`)).length;
  return {
    접수NO: `MJ-${year}-${String(count + records.length + 1).padStart(3, '0')}`,
    접수일시: new Date().toISOString().slice(0, 16).replace('T', ' '),
    본부: '수남',
    진행상태: '접수',
    완료서류링크: '',
    처리메모: '',
    최종수정일: new Date().toISOString().slice(0, 10),
    ...data
  };
}

// ── 화면 전환 ──────────────────────────────
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = document.getElementById(id);
  el.classList.add('active');
  if (id === 'screen-app') el.style.display = 'flex';
}

function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n => {
    n.classList.toggle('active', n.dataset.page === id);
  });
  if (id === 'page-dashboard') renderDashboard();
  if (id === 'page-list') renderList();
  if (id === 'page-new-request') buildNewRequestForm();
  if (id === 'page-users') renderUserList();
}

// ── 로그인 / 로그아웃 ──────────────────────
function doLogin() {
  const email = document.getElementById('login-email').value.trim();
  const pw = document.getElementById('login-pw').value;
  const users = JSON.parse(localStorage.getItem('mj_users') || '[]');
  const user = users.find(u => u.email === email && u.pw === pw);
  const errEl = document.getElementById('login-error');
  if (!user) { errEl.textContent = '이메일 또는 비밀번호가 올바르지 않습니다.'; errEl.style.display = 'block'; return; }
  if (user.status === 'pending') { errEl.textContent = '관리자 승인 대기 중입니다.'; errEl.style.display = 'block'; return; }
  errEl.style.display = 'none';
  currentUser = user;
  localStorage.setItem('mj_user', JSON.stringify(user));
  enterApp();
}

function doLogout() {
  currentUser = null;
  localStorage.removeItem('mj_user');
  showScreen('screen-login');
}

function enterApp() {
  syncFromStorage();
  buildSidebar();
  showScreen('screen-app');
  showPage('page-dashboard');
}

// ── 회원가입 ──────────────────────────────
function doRegister() {
  const name = document.getElementById('reg-name').value.trim();
  const phone = document.getElementById('reg-phone').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const role = document.getElementById('reg-role').value;
  const team = document.getElementById('reg-team').value;
  const pw = document.getElementById('reg-pw').value;
  const pw2 = document.getElementById('reg-pw2').value;
  const errEl = document.getElementById('reg-error');
  const okEl = document.getElementById('reg-success');

  if (!name || !phone || !email || !role || !pw) { errEl.textContent = '모든 항목을 입력해주세요.'; errEl.style.display = 'block'; return; }
  if (pw !== pw2) { errEl.textContent = '비밀번호가 일치하지 않습니다.'; errEl.style.display = 'block'; return; }

  const users = JSON.parse(localStorage.getItem('mj_users') || '[]');
  if (users.find(u => u.email === email)) { errEl.textContent = '이미 등록된 이메일입니다.'; errEl.style.display = 'block'; return; }

  const newUser = { id: 'u' + Date.now(), name, phone, email, role, team, pw, status: 'pending' };
  users.push(newUser);
  localStorage.setItem('mj_users', JSON.stringify(users));
  errEl.style.display = 'none';
  okEl.textContent = '가입 신청이 완료되었습니다. 관리자 승인 후 로그인 가능합니다.';
  okEl.style.display = 'block';
}

// ── 사이드바 ──────────────────────────────
function buildSidebar() {
  const menus = CONFIG.MENUS[currentUser.role] || CONFIG.MENUS['요청자'];
  const nav = document.getElementById('sidebar-nav');
  nav.innerHTML = menus.map(m => `
    <button class="nav-item" data-page="${m.id}" onclick="showPage('${m.id}')">
      <span>${m.icon}</span><span>${m.label}</span>
    </button>
  `).join('');
  document.getElementById('sidebar-user-info').textContent = `${currentUser.name} · ${currentUser.role}`;
}

// ── 대시보드 ──────────────────────────────
function renderDashboard() {
  syncFromStorage();
  const data = getVisibleData();
  const now = new Date();
  document.getElementById('dash-date').textContent =
    `${now.getFullYear()}년 ${now.getMonth()+1}월 ${now.getDate()}일`;

  const total = data.length;
  const 접수 = data.filter(r => r.진행상태 === '접수').length;
  const 진행 = data.filter(r => r.진행상태 === '협력사진행중').length;
  const 완료 = data.filter(r => r.진행상태 === '완료후서류등록').length;

  document.getElementById('stat-cards').innerHTML = `
    <div class="stat-card total"><div class="stat-label">전체 접수</div><div class="stat-value">${total}</div><div class="stat-sub">건</div></div>
    <div class="stat-card pending"><div class="stat-label">검토 대기</div><div class="stat-value">${접수}</div><div class="stat-sub">건</div></div>
    <div class="stat-card progress"><div class="stat-label">진행 중</div><div class="stat-value">${진행}</div><div class="stat-sub">건</div></div>
    <div class="stat-card done"><div class="stat-label">완료</div><div class="stat-value">${완료}</div><div class="stat-sub">건</div></div>
  `;

  // 팀별 현황
  const teams = ['강남', '동작', '수원'];
  document.getElementById('team-stats').innerHTML = `
    <table class="team-table">
      <thead><tr><th>팀</th><th>전체</th><th>접수</th><th>검토승인</th><th>진행중</th><th>완료</th></tr></thead>
      <tbody>${teams.map(t => {
        const td = data.filter(r => r.운용팀 === t);
        return `<tr>
          <td>${t}</td>
          <td>${td.length}</td>
          <td>${td.filter(r=>r.진행상태==='접수').length}</td>
          <td>${td.filter(r=>r.진행상태==='SKB검토승인').length}</td>
          <td>${td.filter(r=>r.진행상태==='협력사진행중').length}</td>
          <td>${td.filter(r=>r.진행상태==='완료후서류등록').length}</td>
        </tr>`;
      }).join('')}</tbody>
    </table>`;

  // 긴급 목록
  const urgent = data.filter(r => r.우선순위 === '긴급' && r.진행상태 !== '완료후서류등록');
  document.getElementById('urgent-list').innerHTML = urgent.length === 0
    ? '<div class="empty-state"><div class="empty-icon">✅</div><p>긴급 건 없음</p></div>'
    : urgent.map(r => `
      <div class="urgent-item" onclick="openDetail('${r.접수NO}')">
        <div>
          <div class="urgent-no">${r.접수NO}</div>
          <div class="urgent-name">${r.건물명}</div>
          <div class="urgent-team">${r.운용팀} · ${r.진행상태}</div>
        </div>
      </div>`).join('');

  // 최근 목록 (5건)
  const recent = [...data].sort((a,b) => b.접수일시?.localeCompare(a.접수일시)).slice(0, 5);
  document.getElementById('recent-list').innerHTML = `
    <table class="data-table">
      <thead><tr><th>접수NO</th><th>건물명</th><th>운용팀</th><th>진행상태</th><th>우선순위</th><th>접수일시</th></tr></thead>
      <tbody>${recent.map(r => `
        <tr onclick="openDetail('${r.접수NO}')">
          <td><code>${r.접수NO}</code></td>
          <td>${r.건물명||''}</td>
          <td>${r.운용팀||''}</td>
          <td>${statusBadge(r.진행상태)}</td>
          <td>${priorityBadge(r.우선순위)}</td>
          <td>${r.접수일시||''}</td>
        </tr>`).join('')}</tbody>
    </table>`;
}

// ── 목록 ──────────────────────────────────
function renderList() {
  syncFromStorage();
  let data = getVisibleData();

  const status = document.getElementById('filter-status')?.value;
  const team = document.getElementById('filter-team')?.value;
  const priority = document.getElementById('filter-priority')?.value;
  const search = document.getElementById('filter-search')?.value?.toLowerCase();

  if (status) data = data.filter(r => r.진행상태 === status);
  if (team) data = data.filter(r => r.운용팀 === team);
  if (priority) data = data.filter(r => r.우선순위 === priority);
  if (search) data = data.filter(r =>
    (r.접수NO||'').toLowerCase().includes(search) ||
    (r.건물명||'').toLowerCase().includes(search) ||
    (r.건물주소||'').toLowerCase().includes(search)
  );

  data.sort((a,b) => (b.접수일시||'').localeCompare(a.접수일시||''));

  const total = data.length;
  const start = (currentPage - 1) * PAGE_SIZE;
  const paged = data.slice(start, start + PAGE_SIZE);

  document.getElementById('table-head').innerHTML = `
    <th>접수NO</th><th>건물명</th><th>주소</th><th>운용팀</th>
    <th>진행상태</th><th>우선순위</th><th>요청자</th><th>접수일시</th><th>담당자</th>`;

  document.getElementById('table-body').innerHTML = paged.length === 0
    ? '<tr><td colspan="9" style="text-align:center;padding:40px;color:#aaa">데이터가 없습니다</td></tr>'
    : paged.map(r => `
      <tr onclick="openDetail('${r.접수NO}')">
        <td><code style="font-family:monospace;font-size:12px">${r.접수NO}</code></td>
        <td><strong>${r.건물명||''}</strong></td>
        <td style="font-size:12px;color:#666">${(r.건물주소||'').slice(0,20)}${(r.건물주소||'').length>20?'...':''}</td>
        <td>${r.운용팀||''}</td>
        <td>${statusBadge(r.진행상태)}</td>
        <td>${priorityBadge(r.우선순위)}</td>
        <td>${r.요청자이름||''}</td>
        <td style="font-size:12px">${r.접수일시||''}</td>
        <td style="font-size:12px">${r.SKB담당자||''}</td>
      </tr>`).join('');

  // 페이지네이션
  const pages = Math.ceil(total / PAGE_SIZE);
  document.getElementById('pagination').innerHTML = Array.from({length: pages}, (_, i) =>
    `<button class="page-btn ${i+1===currentPage?'active':''}" onclick="goPage(${i+1})">${i+1}</button>`
  ).join('');
}

function goPage(n) { currentPage = n; renderList(); }

function getVisibleData() {
  if (!currentUser) return [];
  if (currentUser.role === '관리자') return allData;
  if (currentUser.role === 'SKB담당자') return allData.filter(r => r.운용팀 === currentUser.team || r.SKB담당자 === currentUser.name);
  if (currentUser.role === '협력사') return allData.filter(r => ['협력사진행중','완료후서류등록'].includes(r.진행상태));
  return allData.filter(r => r.요청자이름 === currentUser.name);
}

// ── 상세보기 ──────────────────────────────
function openDetail(no) {
  syncFromStorage();
  const r = allData.find(d => d.접수NO === no);
  if (!r) return;

  const canEdit = ['관리자','SKB담당자'].includes(currentUser?.role);
  const isPartner = currentUser?.role === '협력사';

  document.getElementById('detail-content').innerHTML = `
    <div class="detail-card">
      <div class="detail-header">
        <div>
          <div class="detail-no">${r.접수NO}</div>
          <div style="margin-top:6px">${statusBadge(r.진행상태)} ${priorityBadge(r.우선순위)}</div>
        </div>
        <div class="detail-actions">
          ${canEdit ? `
            <select id="d-status" onchange="updateStatus('${no}',this.value)" style="padding:8px 12px;border:2px solid #d1dce8;border-radius:8px;font-family:inherit">
              ${CONFIG.OPTIONS.진행상태.map(s=>`<option ${r.진행상태===s?'selected':''}>${s}</option>`).join('')}
            </select>
            <button class="btn-outline btn-sm" onclick="showMemoModal('${no}')">📝 메모</button>
          ` : ''}
          ${isPartner ? `
            <select id="d-status" onchange="updateStatus('${no}',this.value)" style="padding:8px 12px;border:2px solid #d1dce8;border-radius:8px;font-family:inherit">
              <option ${r.진행상태==='협력사진행중'?'selected':''}>협력사진행중</option>
              <option ${r.진행상태==='완료후서류등록'?'selected':''}>완료후서류등록</option>
            </select>
            <button class="btn-outline btn-sm" onclick="showMemoModal('${no}')">📎 서류 등록</button>
          ` : ''}
        </div>
      </div>
      <div class="detail-grid">
        ${detailField('건물명', r.건물명)}
        ${detailField('건물주소', r.건물주소)}
        ${detailField('건물코드', r.건물코드)}
        ${detailField('운용팀', r.운용팀)}
        ${detailField('건물유형', r.건물유형)}
        ${detailField('청구유형', r.청구유형)}
        ${detailField('장비설치일', r.장비설치일)}
        ${detailField('동/세대수', r.동세대수)}
        ${detailField('국사코드', r.국사코드)}
        ${detailField('국사명', r.국사명)}
        ${detailField('청구유형', r.청구유형)}
        ${detailField('지급내역', r.지급내역)}
        ${detailField('민원인이름', r.민원인이름)}
        ${detailField('민원인연락처', r.민원인연락처)}
        ${detailField('민원인Email', r.민원인Email)}
        ${detailField('요청자소속', r.요청자소속)}
        ${detailField('요청자이름', r.요청자이름)}
        ${detailField('요청자연락처', r.요청자연락처)}
        ${detailField('차단기위치', r.차단기위치)}
        ${detailField('계량기위치', r.계량기위치)}
        ${detailField('요청구분', r.요청구분)}
        ${detailField('SKB담당자', r.SKB담당자)}
        ${detailField('접수일시', r.접수일시)}
        ${detailField('최종수정일', r.최종수정일)}
      </div>
      ${r.특이사항 ? `<div style="margin-top:16px;padding:12px;background:#fef3c7;border-radius:8px;border-left:3px solid #f59e0b"><strong>⚠️ 특이사항:</strong> ${r.특이사항}</div>` : ''}
      ${r.처리메모 ? `<div style="margin-top:10px;padding:12px;background:#f0f9ff;border-radius:8px;border-left:3px solid #0ea5e9"><strong>📝 처리메모:</strong> ${r.처리메모}</div>` : ''}
      ${r.완료서류링크 ? `<div style="margin-top:10px;padding:12px;background:#f0fdf4;border-radius:8px"><strong>📎 완료서류:</strong> <a href="${r.완료서류링크}" target="_blank">${r.완료서류링크}</a></div>` : ''}
    </div>`;

  showPage('page-detail');
}

function detailField(label, value) {
  return `<div class="detail-item"><div class="detail-label">${label}</div><div class="detail-value">${value||'-'}</div></div>`;
}

function updateStatus(no, status) {
  const records = JSON.parse(localStorage.getItem('mj_records') || '[]');
  const idx = records.findIndex(r => r.접수NO === no);
  if (idx > -1) {
    records[idx].진행상태 = status;
    records[idx].최종수정일 = new Date().toISOString().slice(0, 10);
    localStorage.setItem('mj_records', JSON.stringify(records));
    syncFromStorage();
    openDetail(no);
  }
}

function showMemoModal(no) {
  const r = allData.find(d => d.접수NO === no);
  document.getElementById('modal-content').innerHTML = `
    <h3 style="margin-bottom:16px;color:var(--primary)">📝 처리 메모 / 서류 링크</h3>
    <div class="form-group" style="margin-bottom:12px">
      <label>처리 메모</label>
      <textarea id="m-memo" rows="4" style="width:100%;padding:10px;border:2px solid #d1dce8;border-radius:8px;font-family:inherit">${r?.처리메모||''}</textarea>
    </div>
    <div class="form-group" style="margin-bottom:16px">
      <label>완료 서류 링크 (Google Drive 공유 URL)</label>
      <input id="m-link" type="text" value="${r?.완료서류링크||''}" placeholder="https://drive.google.com/..." style="width:100%;padding:10px;border:2px solid #d1dce8;border-radius:8px;font-family:inherit">
    </div>
    <div style="display:flex;gap:10px;justify-content:flex-end">
      <button class="btn-ghost" onclick="closeModal()">취소</button>
      <button class="btn-primary" onclick="saveMemo('${no}')">저장</button>
    </div>`;
  openModal();
}

function saveMemo(no) {
  const records = JSON.parse(localStorage.getItem('mj_records') || '[]');
  const idx = records.findIndex(r => r.접수NO === no);
  if (idx > -1) {
    records[idx].처리메모 = document.getElementById('m-memo').value;
    records[idx].완료서류링크 = document.getElementById('m-link').value;
    records[idx].최종수정일 = new Date().toISOString().slice(0, 10);
    localStorage.setItem('mj_records', JSON.stringify(records));
    syncFromStorage();
  }
  closeModal();
  openDetail(no);
}

// ── 접수 폼 ──────────────────────────────
function buildRequestForm() {
  const html = requestFormHTML();
  document.getElementById('request-form-content').innerHTML = html;
}

function buildNewRequestForm() {
  document.getElementById('new-request-form').innerHTML = `
    <h2 class="card-title">✏️ 새 공사 요청 접수</h2>
    <p class="card-desc">아래 항목을 모두 입력해주세요</p>
    ${requestFormHTML('new')}`;
}

function requestFormHTML(prefix = 'pub') {
  const O = CONFIG.OPTIONS;
  const dd = (id, opts, label, required=false) => `
    <div class="form-group">
      <label>${label}${required?' *':''}</label>
      <select id="${prefix}-${id}">
        <option value="">선택</option>
        ${opts.map(o=>`<option>${o}</option>`).join('')}
      </select>
    </div>`;
  const tf = (id, label, ph='', required=false, type='text') => `
    <div class="form-group">
      <label>${label}${required?' *':''}</label>
      <input type="${type}" id="${prefix}-${id}" placeholder="${ph}">
    </div>`;

  return `
    <div class="form-section">
      <div class="form-section-title">📌 기본 정보</div>
      <div class="form-grid">
        ${dd('운용팀', O.운용팀, '운용팀', true)}
        ${tf('정보센터', '정보센터', '예: 강남정보센터')}
        ${dd('우선순위', O.우선순위, '우선순위', true)}
      </div>
    </div>
    <div class="form-section">
      <div class="form-section-title">🏢 건물 정보</div>
      <div class="form-grid">
        ${tf('건물명', '건물명', '가나다라아파트', true)}
        ${tf('건물주소', '건물주소', '경기 화성시 오산동 977-3', true)}
        ${tf('건물코드', '건물코드 (15자리)', 'T50130320836437')}
        ${tf('장비설치일', '장비설치일 (가용일)', '', false, 'date')}
        ${tf('동세대수', '동/세대수', '3동/1500세대')}
        ${dd('건물유형', O.건물유형, '건물유형')}
        ${tf('국사코드', '국사코드', 'W20029')}
        ${tf('국사명', '국사명', '용인_영덕경기행복주택(GPON)_TYPEB')}
        ${dd('청구유형', O.청구유형, '청구유형')}
        ${tf('지급내역', '지급내역', '')}
        ${tf('차단기위치', '차단기위치', '1층 관리소내 MDF')}
        ${tf('계량기위치', '계량기위치', '1층 관리소내 MDF')}
      </div>
    </div>
    <div class="form-section">
      <div class="form-section-title">👤 민원인 정보</div>
      <div class="form-grid">
        ${tf('민원인이름', '민원인 이름', '관리소장')}
        ${tf('민원인연락처', '민원인 연락처', '02-123-4567')}
        ${tf('민원인Email', '민원인 이메일', 'example@naver.com', false, 'email')}
      </div>
    </div>
    <div class="form-section">
      <div class="form-section-title">📋 요청 정보</div>
      <div class="form-grid">
        ${dd('요청자소속', O.요청자소속, '요청자 소속', true)}
        ${tf('요청자이름', '요청자 이름', '홍길동', true)}
        ${tf('요청자연락처', '요청자 연락처', '010-0000-0000', true)}
        ${dd('요청구분', O.요청구분, '요청구분', true)}
        ${tf('설치장비List', '설치장비 List', '파일명 또는 내용 기재')}
      </div>
      <div class="form-grid col1" style="margin-top:12px">
        <div class="form-group">
          <label>특이사항</label>
          <textarea id="${prefix}-특이사항" placeholder="특이사항이 있으면 입력해주세요"></textarea>
        </div>
      </div>
    </div>
    <div id="${prefix}-error" class="error-msg" style="display:none;margin-bottom:12px"></div>
    <button class="btn-primary" onclick="submitRequest('${prefix}')">📤 접수 신청</button>
  `;
}

function submitRequest(prefix) {
  const g = id => document.getElementById(`${prefix}-${id}`)?.value?.trim() || '';
  const errEl = document.getElementById(`${prefix}-error`);

  if (!g('운용팀') || !g('건물명') || !g('건물주소') || !g('요청자이름') || !g('요청자연락처') || !g('요청구분')) {
    errEl.textContent = '필수 항목(*)을 모두 입력해주세요.';
    errEl.style.display = 'block';
    return;
  }
  errEl.style.display = 'none';

  const no = generateNo();
  const record = {
    접수NO: no,
    접수일시: new Date().toISOString().slice(0, 16).replace('T', ' '),
    본부: '수남',
    진행상태: '접수',
    운용팀: g('운용팀'), 정보센터: g('정보센터'), 우선순위: g('우선순위'),
    건물명: g('건물명'), 건물주소: g('건물주소'), 건물코드: g('건물코드'),
    장비설치일: g('장비설치일'), 동세대수: g('동세대수'), 건물유형: g('건물유형'),
    국사코드: g('국사코드'), 국사명: g('국사명'), 청구유형: g('청구유형'),
    지급내역: g('지급내역'), 차단기위치: g('차단기위치'), 계량기위치: g('계량기위치'),
    민원인이름: g('민원인이름'), 민원인연락처: g('민원인연락처'), 민원인Email: g('민원인Email'),
    요청자소속: g('요청자소속'), 요청자이름: g('요청자이름'), 요청자연락처: g('요청자연락처'),
    요청구분: g('요청구분'), 설치장비List: g('설치장비List'), 특이사항: g('특이사항'),
    SKB담당자: '', 처리메모: '', 완료서류링크: '',
    최종수정일: new Date().toISOString().slice(0, 10),
  };

  const records = JSON.parse(localStorage.getItem('mj_records') || '[]');
  records.push(record);
  localStorage.setItem('mj_records', JSON.stringify(records));
  syncFromStorage();

  if (prefix === 'pub') {
    document.getElementById('request-form-content').style.display = 'none';
    document.getElementById('result-no').textContent = no;
    document.getElementById('request-success').style.display = 'block';
  } else {
    showPage('page-list');
  }
}

function resetRequestForm() {
  document.getElementById('request-form-content').style.display = 'block';
  document.getElementById('request-success').style.display = 'none';
  buildRequestForm();
}

// ── 사용자 관리 (관리자) ──────────────────
function renderUserList() {
  syncFromStorage();
  const pending = allUsers.filter(u => u.status === 'pending');
  const approved = allUsers.filter(u => u.status === 'approved');

  document.getElementById('user-list-content').innerHTML = `
    <div class="dash-panel" style="margin-bottom:16px">
      <h3>⏳ 승인 대기 (${pending.length}명)</h3>
      ${pending.length === 0
        ? '<div class="empty-state"><div class="empty-icon">✅</div><p>대기 중인 가입 신청이 없습니다</p></div>'
        : pending.map(u => `
          <div class="user-card">
            <div class="user-info">
              <div class="user-name">${u.name}</div>
              <div class="user-meta">${u.email} · ${u.phone} · ${u.role}${u.team?' · '+u.team:''}</div>
            </div>
            <div class="user-actions">
              <button class="btn-success btn-sm" onclick="approveUser('${u.id}')">✅ 승인</button>
              <button class="btn-danger btn-sm" onclick="rejectUser('${u.id}')">❌ 거절</button>
            </div>
          </div>`).join('')}
    </div>
    <div class="dash-panel">
      <h3>✅ 승인된 사용자 (${approved.length}명)</h3>
      ${approved.map(u => `
        <div class="user-card">
          <div class="user-info">
            <div class="user-name">${u.name} <span class="status-badge badge-approved">${u.role}</span></div>
            <div class="user-meta">${u.email} · ${u.phone}${u.team?' · '+u.team:''}</div>
          </div>
          <button class="btn-danger btn-sm" onclick="removeUser('${u.id}')">삭제</button>
        </div>`).join('')}
    </div>`;
}

function approveUser(id) {
  const users = JSON.parse(localStorage.getItem('mj_users') || '[]');
  const idx = users.findIndex(u => u.id === id);
  if (idx > -1) { users[idx].status = 'approved'; localStorage.setItem('mj_users', JSON.stringify(users)); syncFromStorage(); renderUserList(); }
}
function rejectUser(id) {
  if (!confirm('가입 신청을 거절하시겠습니까?')) return;
  const users = JSON.parse(localStorage.getItem('mj_users') || '[]').filter(u => u.id !== id);
  localStorage.setItem('mj_users', JSON.stringify(users)); syncFromStorage(); renderUserList();
}
function removeUser(id) {
  if (!confirm('사용자를 삭제하시겠습니까?')) return;
  const users = JSON.parse(localStorage.getItem('mj_users') || '[]').filter(u => u.id !== id);
  localStorage.setItem('mj_users', JSON.stringify(users)); syncFromStorage(); renderUserList();
}

// ── 엑셀 다운로드 (CSV) ──────────────────
function exportExcel() {
  const data = getVisibleData();
  const headers = ['접수NO','접수일시','진행상태','우선순위','본부','운용팀','건물명','건물주소','건물코드','건물유형','청구유형','요청자이름','요청자연락처','SKB담당자','처리메모','최종수정일'];
  const rows = [headers, ...data.map(r => headers.map(h => r[h] || ''))];
  const csv = '\uFEFF' + rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], {type:'text/csv;charset=utf-8'}));
  a.download = `모자분리접수대장_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
}

// ── 유틸 ──────────────────────────────────
function statusBadge(s) {
  const map = {'접수':'badge-접수','SKB검토승인':'badge-SKB검토승인','협력사진행중':'badge-협력사진행중','완료후서류등록':'badge-완료후서류등록'};
  return `<span class="status-badge ${map[s]||''}">${s||'-'}</span>`;
}
function priorityBadge(p) {
  return `<span class="status-badge ${p==='긴급'?'badge-긴급':'badge-보통'}">${p||'-'}</span>`;
}
function openModal() { document.getElementById('modal-overlay').classList.add('open'); }
function closeModal() { document.getElementById('modal-overlay').classList.remove('open'); }
