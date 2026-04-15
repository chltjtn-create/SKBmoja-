// ══════════════════════════════════════════
// config.js  ─  Google Sheets 연동 설정
// ══════════════════════════════════════════

const CONFIG = {
  // ▼ 여기에 본인 Google Sheets ID 입력
  // URL: https://docs.google.com/spreadsheets/d/[이 부분]/edit
  SHEET_ID: '1AzSxrkw3qNSFbAkjBAF_EDygdq0-8pon-Oa_g9P19AU',

  // ▼ Google Apps Script 웹앱 URL (배포 후 입력)
  // 처음엔 빈값 → 로컬 스토리지 모드로 동작
  API_URL: '',

  // 앱 설정
  APP_NAME: '모자분리 공사요청 시스템',
  COMPANY: 'SK Broadband 수남구축팀',

  // 접수번호 형식: MJ-년도-순번
  NO_PREFIX: 'MJ',

  // 드롭다운 옵션
  OPTIONS: {
    운용팀: ['강남', '동작', '수원'],
    건물유형: ['아파트', '빌라', '상가', '오피스텔', '업무시설', '기타'],
    청구유형: ['정액제', '종량제', '해지', '변경'],
    요청자소속: ['HNS', 'SKB', '기타'],
    요청구분: ['아파트요청', '신규(운용팀)', '변경/해지'],
    우선순위: ['긴급', '보통'],
    진행상태: ['접수', 'SKB검토승인', '협력사진행중', '완료후서류등록'],
    SKB담당자: ['강남담당', '동작담당', '수원담당'],
  },

  // 역할별 메뉴
  MENUS: {
    관리자: [
      { id: 'page-dashboard', icon: '📊', label: '대시보드' },
      { id: 'page-list',      icon: '📋', label: '접수 목록' },
      { id: 'page-new-request', icon: '✏️', label: '새 접수' },
      { id: 'page-users',    icon: '👥', label: '사용자 관리' },
    ],
    'SKB담당자': [
      { id: 'page-dashboard', icon: '📊', label: '대시보드' },
      { id: 'page-list',      icon: '📋', label: '접수 목록' },
      { id: 'page-new-request', icon: '✏️', label: '새 접수' },
    ],
    협력사: [
      { id: 'page-dashboard', icon: '📊', label: '대시보드' },
      { id: 'page-list',      icon: '📋', label: '담당 접수 목록' },
    ],
    요청자: [
      { id: 'page-list',        icon: '📋', label: '내 접수 목록' },
      { id: 'page-new-request', icon: '✏️', label: '공사 요청하기' },
    ],
  }
};
