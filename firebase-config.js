// ══════════════════════════════════════════
// firebase-config.js - Firebase 설정
// ══════════════════════════════════════════

const firebaseConfig = {
  apiKey: "AIzaSyDyAmMnVvuGz4IXbtzT-bQk3z70GRoKKJs",
  authDomain: "mojabunri-01.firebaseapp.com",
  projectId: "mojabunri-01",
  storageBucket: "mojabunri-01.firebasestorage.app",
  messagingSenderId: "926655221621",
  appId: "1:926655221621:web:fc9e830dc65187b08fcd3c"
};

// Firebase 초기화
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// 한국어 설정
auth.languageCode = 'ko';
