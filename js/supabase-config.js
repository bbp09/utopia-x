// js/supabase-config.js
// 1. Supabase 프로젝트 정보 설정
const SUPABASE_URL = 'https://idfpmynjfkvtcsqcjgnm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlkZnBteW5qZmt2dGNzcWNqZ25tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2NzQ2NTgsImV4cCI6MjA4NTI1MDY1OH0.KFmClnG-XuW818uUIMlPW0yQ7UswXvIWh-ipv6z5p4I';

// 2. Supabase 클라이언트 생성 및 전역 변수(window)에 등록
if (typeof supa !== 'undefined') {
    window.supabase = supa.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log("✅ Supabase Connected Successfully!");
    console.log("📡 URL:", SUPABASE_URL);
} else {
    console.error("❌ Critical Error: Supabase library (supa) not loaded via CDN.");
}
