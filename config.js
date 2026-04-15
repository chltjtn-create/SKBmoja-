const CONFIG = {
  SHEET_ID: '1AzSxrkw3qNSFbAkjBAF_EDygdq0-8pon-Oa_g9P19AU',
  API_URL: 'https://script.google.com/macros/s/AKfycbwcqSzNl4LobQcxlUHpME4zGdXL0k8y9VLqokl6nQ5hSuvUd2zXIi5dXouLOL_YOekfKg/exec', // ← Apps Script 배포 후 여기에 URL 입력
  APP_NAME: '모자분리 공사요청 시스템',
  COMPANY: 'SK Broadband 수남구축팀',
  OPTIONS: {
    운용팀: ['강남', '동작', '수원'],
    건물유형: ['아파트', '빌라', '상가', '오피스텔', '업무시설', '기타'],
    청구유형: ['정액제', '종량제', '해지', '변경'],
    요청자소속: ['HNS', 'SKB', '기타'],
    요청구분: ['아파트요청', '신규(운용팀)', '변경/해지'],
    우선순위: ['긴급', '보통'],
    진행상태: ['접수', 'SKB승인', '진행중', '완료'],
    역할: ['관리자', 'SKB담당자', '협력사', '요청자'],
  },
  MENUS: {
    관리자:   [
      { id:'page-dashboard',   icon:'📊', label:'대시보드' },
      { id:'page-list',        icon:'📋', label:'접수 목록' },
      { id:'page-new-request', icon:'✏️', label:'새 접수' },
      { id:'page-users',       icon:'👥', label:'사용자 관리' },
    ],
    SKB담당자:[
      { id:'page-dashboard',   icon:'📊', label:'대시보드' },
      { id:'page-list',        icon:'📋', label:'접수 목록' },
      { id:'page-new-request', icon:'✏️', label:'새 접수' },
    ],
    협력사:   [
      { id:'page-dashboard', icon:'📊', label:'대시보드' },
      { id:'page-list',      icon:'📋', label:'담당 목록' },
    ],
    요청자:   [
      { id:'page-list',        icon:'📋', label:'내 접수 목록' },
      { id:'page-new-request', icon:'✏️', label:'공사 요청하기' },
    ],
  },
  LIST_COLS: ['진행상태','접수NO','운용팀','건물명','건물주소','요청자이름','접수일시','SKB담당자'],
  EXPORT_COLS: [
    '접수NO','접수일시','진행상태','우선순위','본부','운용팀','정보센터',
    '건물명','건물주소','건물코드','장비설치일','동세대수','건물유형',
    '국사코드','국사명','청구유형','지급내역','설치장비List',
    '민원인이름','민원인연락처','민원인Email',
    '요청자소속','요청자이름','요청자연락처',
    '차단기위치','계량기위치','요청구분','특이사항',
    'SKB담당자','처리메모','완료서류링크','최종수정일'
  ],
};
