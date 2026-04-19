const CONFIG = {
  SHEET_ID: '13XKPItnk9MaRAS_14-DqMCEHMRh24n6ISjuLtHmCzM8',
  API_URL: 'https://script.google.com/macros/s/AKfycbxgCsfz2YPmkkwwMmGJZlKYmTJwoYcRfx4suhcMzdhjfwa2d4SpL_Sc1XthS9vai-r5/exec',
  APP_NAME: '모자분리 공사요청 시스템',
  COMPANY: 'SK Broadband 수남구축팀',
  OPTIONS: {
    운용팀: ['강남', '동작', '수원'],
    정보센터: ['강남', '동작', '안양', '수원', '성남', '분당'],
    건물유형: ['아파트', '빌라', '상가', '오피스텔', '업무시설', '기타'],
    청구유형: ['정액제', '종량제', '해지', '변경'],
    요청자소속: ['SKB', 'HNS', 'PTCE', '기타(민원인)'],
    요청구분: ['아파트요청', '신규(운용팀)', '변경/해지'],
    우선순위: ['긴급', '보통'],
    진행상태: ['접수', 'SKB검토', '협력사접수', '한전접수', '처리완료'],
    역할: ['관리자', 'SKB담당자', '협력사', '요청자'],
  },
  LIST_COLS: ['진행상태','KeyNO','운용팀','건물명','건물주소','요청자이름','접수일시','우선순위'],
  EXPORT_COLS: [
    'KeyNO','접수일시','진행상태','우선순위','본부','운용팀','정보센터',
    '건물명','건물주소','건물코드','장비설치일','동수','세대수','건물유형',
    '국사코드','국사명','청구유형',
    '민원인이름','민원인연락처','민원인Email',
    '요청자소속','요청자이름','요청자연락처',
    '차단기위치','계량기위치','요청구분','특이사항',
    '처리메모','최종수정일','설치장비List','기타첨부서류','사진링크'
  ],
  MENUS: {
    관리자:   [
      { id:'page-dashboard',   icon:'📊', label:'모자분리 진행현황' },
      { id:'page-list',        icon:'📋', label:'모자분리 신청목록' },
      { id:'page-new-request', icon:'✏️', label:'모자분리 신규신청' },
      { id:'page-users',       icon:'👥', label:'사용자 관리' },
    ],
    SKB담당자:[
      { id:'page-dashboard',   icon:'📊', label:'모자분리 진행현황' },
      { id:'page-list',        icon:'📋', label:'모자분리 신청목록' },
      { id:'page-new-request', icon:'✏️', label:'모자분리 신규신청' },
    ],
    협력사:   [
      { id:'page-dashboard', icon:'📊', label:'모자분리 진행현황' },
      { id:'page-list',      icon:'📋', label:'모자분리 신청목록' },
    ],
    요청자:   [
      { id:'page-list',        icon:'📋', label:'내 신청목록' },
      { id:'page-new-request', icon:'✏️', label:'모자분리 신규신청' },
    ],
  },
};
