// ══════════════════════════════════════════════════════
// Code.gs - 모자분리 공사요청 시스템 백엔드
// ══════════════════════════════════════════════════════

const SHEET_ID = '13XKPItnk9MaRAS_14-DqMCEHMRh24n6ISjuLtHmCzM8';
const DRIVE_FOLDER_NAME = '모자분리_첨부파일';
const ADMIN_EMAIL = 'fiberworkman@gmail.com';

const RECORD_COLS = [
  'KeyNO','접수일시','진행상태','우선순위','본부','운용팀','정보센터',
  '건물명','건물주소','건물코드','장비설치일','동수','세대수','건물유형',
  '국사코드','국사명','청구유형',
  '민원인이름','민원인연락처','민원인Email',
  '요청자소속','요청자이름','요청자연락처',
  '차단기위치','계량기위치','요청구분','특이사항',
  '처리메모','최종수정일','설치장비List','기타첨부서류','사진링크'
];
const USER_COLS = ['id','이름','이메일','연락처','소속','역할','담당팀','비밀번호','상태','등록일'];

function makeResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  if (e.parameter.method === 'POST' && e.parameter.payload) {
    try {
      const body = JSON.parse(decodeURIComponent(e.parameter.payload));
      return handleAction(body);
    } catch(err) {
      return makeResponse({ error: err.message });
    }
  }
  const action = e.parameter.action;
  let result;
  try {
    if      (action === 'getRecords') result = getRecords();
    else if (action === 'getUsers')   result = getUsers();
    else if (action === 'ping')       result = { ok: true };
    else result = { error: '알 수 없는 action: ' + action };
  } catch(err) { result = { error: err.message }; }
  return makeResponse(result);
}

function doPost(e) {
  let body;
  try { body = JSON.parse(e.postData.contents); } catch(err) { body = {}; }
  return handleAction(body);
}

function handleAction(body) {
  const action = body.action;
  let result;
  try {
    if      (action === 'addRecord')    result = addRecord(body.data);
    else if (action === 'updateRecord') result = updateRecord(body.no, body.data);
    else if (action === 'addUser')      result = addUser(body.data);
    else if (action === 'updateUser')   result = updateUser(body.id, body.data);
    else if (action === 'deleteUser')   result = deleteUser(body.id);
    else if (action === 'login')        result = login(body.email, body.pw);
    else if (action === 'uploadPhoto')  result = uploadPhoto(body.no, body.buildingName, body.date, body.fileName, body.fileData, body.mimeType);
    else if (action === 'sendComplete') result = sendCompleteMail(body.no);
    else result = { error: '알 수 없는 action: ' + action };
  } catch(err) { result = { error: err.message }; }
  return makeResponse(result);
}

function getSS() { return SpreadsheetApp.openById(SHEET_ID); }

function getRecords() {
  const sh = ensureSheet('접수대장', RECORD_COLS);
  const rows = sh.getDataRange().getValues();
  if (rows.length <= 1) return { records: [] };
  const headers = rows[0];
  const records = rows.slice(1).map(row => {
    const obj = {};
    headers.forEach((h,i) => obj[h] = row[i]!==undefined ? String(row[i]) : '');
    return obj;
  }).filter(r => r['KeyNO']);
  return { records };
}

function addRecord(data) {
  const sh = ensureSheet('접수대장', RECORD_COLS);
  const no = generateNo();
  const now = Utilities.formatDate(new Date(),'Asia/Seoul','yyyy-MM-dd HH:mm');
  const today = Utilities.formatDate(new Date(),'Asia/Seoul','yyyy-MM-dd');
  const row = RECORD_COLS.map(col => {
    if (col==='KeyNO')      return no;
    if (col==='접수일시')   return now;
    if (col==='본부')       return '수남';
    if (col==='진행상태')   return data['진행상태']||'접수';
    if (col==='최종수정일') return today;
    return data[col]!==undefined ? data[col] : '';
  });
  sh.appendRow(row);
  return { ok:true, no };
}

function updateRecord(no, data) {
  const sh = ensureSheet('접수대장', RECORD_COLS);
  const rows = sh.getDataRange().getValues();
  const headers = rows[0];
  const noIdx = headers.indexOf('KeyNO');
  for (let i=1; i<rows.length; i++) {
    if (String(rows[i][noIdx])===String(no)) {
      Object.keys(data).forEach(key => {
        const ci = headers.indexOf(key);
        if (ci>-1) sh.getRange(i+1,ci+1).setValue(data[key]);
      });
      const modIdx = headers.indexOf('최종수정일');
      if (modIdx>-1) sh.getRange(i+1,modIdx+1).setValue(
        Utilities.formatDate(new Date(),'Asia/Seoul','yyyy-MM-dd')
      );
      return { ok:true };
    }
  }
  return { error:'접수번호를 찾을 수 없습니다: '+no };
}

function generateNo() {
  const sh = ensureSheet('접수대장', RECORD_COLS);
  const rows = sh.getDataRange().getValues();
  const year = new Date().getFullYear();
  const prefix = 'MJ-'+year+'-';
  let max = 0;
  rows.slice(1).forEach(row => {
    const no = String(row[0]);
    if (no.startsWith(prefix)) {
      const n = parseInt(no.replace(prefix,''),10);
      if (!isNaN(n) && n>max) max=n;
    }
  });
  return prefix+String(max+1).padStart(3,'0');
}

function uploadPhoto(no, buildingName, date, fileName, fileData, mimeType) {
  try {
    const folders = DriveApp.getFoldersByName(DRIVE_FOLDER_NAME);
    const rootFolder = folders.hasNext() ? folders.next() : DriveApp.createFolder(DRIVE_FOLDER_NAME);

    const dateStr = date || Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyyMMdd');
    // 폴더명: KeyNO_접수일_건물명
    const subFolderName = no + '_' + dateStr + '_' + (buildingName || no);
    const subFolders = rootFolder.getFoldersByName(subFolderName);
    const subFolder = subFolders.hasNext() ? subFolders.next() : rootFolder.createFolder(subFolderName);

    const blob = Utilities.newBlob(Utilities.base64Decode(fileData), mimeType || 'image/jpeg', fileName);
    const file = subFolder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    const fileUrl = file.getUrl();

    // 기존 사진링크에 누적 저장 (덮어쓰기 아닌 append)
    const sh = ensureSheet('접수대장', RECORD_COLS);
    const rows = sh.getDataRange().getValues();
    const headers = rows[0];
    const noIdx = headers.indexOf('KeyNO');
    const linkIdx = headers.indexOf('사진링크');
    for (let i = 1; i < rows.length; i++) {
      if (String(rows[i][noIdx]) === String(no)) {
        const existing = String(rows[i][linkIdx] || '').trim();
        const combined = existing ? existing + '\n' + fileUrl : fileUrl;
        sh.getRange(i + 1, linkIdx + 1).setValue(combined);
        break;
      }
    }

    return { ok: true, url: fileUrl };
  } catch(err) { return { error: err.message }; }
}

function getUsers() {
  const sh = ensureSheet('사용자관리', USER_COLS);
  const rows = sh.getDataRange().getValues();
  if (rows.length<=1) return { users:[] };
  const headers = rows[0];
  const users = rows.slice(1).map(row => {
    const obj={};
    headers.forEach((h,i) => obj[h]=row[i]!==undefined?String(row[i]):'');
    return obj;
  }).filter(u=>u['id']);
  users.forEach(u=>delete u['비밀번호']);
  return { users };
}

function getUsersWithPw() {
  const sh = ensureSheet('사용자관리', USER_COLS);
  const rows = sh.getDataRange().getValues();
  if (rows.length<=1) return [];
  const headers = rows[0];
  return rows.slice(1).map(row => {
    const obj={};
    headers.forEach((h,i) => obj[h]=row[i]!==undefined?String(row[i]):'');
    return obj;
  }).filter(u=>u['id']);
}

function addUser(data) {
  const sh = ensureSheet('사용자관리', USER_COLS);
  const users = getUsersWithPw();
  if (users.find(u=>u['이메일']===data['이메일'])) return { error:'이미 등록된 이메일입니다.' };
  const id = 'u'+new Date().getTime();
  const today = Utilities.formatDate(new Date(),'Asia/Seoul','yyyy-MM-dd');
  const row = USER_COLS.map(col => {
    if (col==='id')     return id;
    if (col==='상태')   return data['상태']||'pending';
    if (col==='등록일') return today;
    return data[col]!==undefined ? data[col] : '';
  });
  sh.appendRow(row);
  return { ok:true, id };
}

function updateUser(id, data) {
  const sh = ensureSheet('사용자관리', USER_COLS);
  const rows = sh.getDataRange().getValues();
  const headers = rows[0];
  const idIdx = headers.indexOf('id');
  for (let i=1; i<rows.length; i++) {
    if (rows[i][idIdx]===id) {
      Object.keys(data).forEach(key => {
        const ci=headers.indexOf(key);
        if (ci>-1) sh.getRange(i+1,ci+1).setValue(data[key]);
      });
      return { ok:true };
    }
  }
  return { error:'사용자를 찾을 수 없습니다.' };
}

function deleteUser(id) {
  const sh = ensureSheet('사용자관리', USER_COLS);
  const rows = sh.getDataRange().getValues();
  const idIdx = rows[0].indexOf('id');
  for (let i=1; i<rows.length; i++) {
    if (rows[i][idIdx]===id) { sh.deleteRow(i+1); return { ok:true }; }
  }
  return { error:'사용자를 찾을 수 없습니다.' };
}

function login(email, pw) {
  const users = getUsersWithPw();
  const user = users.find(u=>u['이메일']===email && u['비밀번호']===pw);
  if (!user) return { error:'이메일 또는 비밀번호가 올바르지 않습니다.' };
  if (user['상태']==='pending')  return { error:'관리자 승인 대기 중입니다.' };
  if (user['상태']==='rejected') return { error:'가입이 거절되었습니다.' };
  const safe={...user}; delete safe['비밀번호'];
  return { ok:true, user:safe };
}

function sendCompleteMail(no) {
  const sh = ensureSheet('접수대장', RECORD_COLS);
  const rows = sh.getDataRange().getValues();
  const headers = rows[0];
  const noIdx = headers.indexOf('KeyNO');
  let record=null;
  for (let i=1; i<rows.length; i++) {
    if (String(rows[i][noIdx])===String(no)) {
      record={};
      headers.forEach((h,ci)=>record[h]=rows[i][ci]);
      break;
    }
  }
  if (!record) return { error:'접수번호를 찾을 수 없습니다.' };
  const users = getUsersWithPw();
  const recipients = new Set();
  recipients.add(ADMIN_EMAIL);
  if (record['민원인Email']) recipients.add(record['민원인Email']);
  const teamUser = users.find(u=>u['담당팀']===record['운용팀']&&u['역할']==='SKB담당자');
  if (teamUser&&teamUser['이메일']) recipients.add(teamUser['이메일']);
  const subject = `[모자분리] 처리완료 - ${record['KeyNO']} ${record['건물명']}`;
  const body = `모자분리 공사요청이 처리완료 되었습니다.\n\n접수번호: ${record['KeyNO']}\n건물명: ${record['건물명']}\n건물주소: ${record['건물주소']}\n운용팀: ${record['운용팀']}\n처리완료일: ${record['최종수정일']}\n처리메모: ${record['처리메모']||'없음'}\n\nSK Broadband 수남구축팀`;
  const sent=[];
  recipients.forEach(email=>{
    if (email&&email.includes('@')) {
      try { MailApp.sendEmail({to:email,subject,body}); sent.push(email); }
      catch(e) { Logger.log('메일실패: '+email); }
    }
  });
  return { ok:true, sent };
}

function ensureSheet(name, cols) {
  const ss=getSS();
  let sh=ss.getSheetByName(name);
  if (!sh) {
    sh=ss.insertSheet(name);
    sh.appendRow(cols);
    sh.getRange(1,1,1,cols.length)
      .setBackground('#1F4E79').setFontColor('#FFFFFF').setFontWeight('bold');
    sh.setFrozenRows(1);
  }
  return sh;
}

function initAdminUser() {
  const users=getUsersWithPw();
  if (users.find(u=>u['역할']==='관리자')) { Logger.log('이미 존재'); return; }
  addUser({
    이름:'관리자', 이메일:ADMIN_EMAIL, 연락처:'010-0000-0000',
    소속:'PCNI Engineering', 역할:'관리자', 담당팀:'전체',
    비밀번호:'admin1234', 상태:'approved',
  });
  Logger.log('생성완료: '+ADMIN_EMAIL+' / admin1234');
}
