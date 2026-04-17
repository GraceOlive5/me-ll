import { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, OAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

// [1] Firebase 설정 유지
const firebaseConfig = {
  apiKey: "AIzaSyAD36kEdHqfs7rpzZPKPMD0so2SZ1Ys1k4",
  authDomain: "me-ll-b517c.firebaseapp.com",
  projectId: "me-ll-b517c",
  storageBucket: "me-ll-b517c.firebasestorage.app",
  messagingSenderId: "1049600796280",
  appId: "1:1049600796280:web:dfa735423e53197d16af8d"
};
const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db   = getFirestore(firebaseApp);

// [2] PHASES 데이터 (애니메이션 속성 포함)
const PHASES = [
  { id:"wolsik", name:"월식", moon:"🌑", season:"월경기", dayRange:[1,5], color:"#6868a0", soft:"rgba(152,152,204,0.14)", border:"rgba(152,152,204,0.28)", text:"#c0c4f0", illum: 0, waxing: null, eclipse: true, description:"달이 숨는 시간. 자궁 내막이 탈락하며 에너지가 낮아집니다.", exercise:"스트레칭, 가벼운 산책", food:"미역국, 철분 영양제", avoid:"격한 운동, 찬 음식" },
  { id:"choseng", name:"초생달", moon:"🌙", season:"난포기 전기", dayRange:[6,9], color:"#88a088", soft:"rgba(152,204,152,0.14)", border:"rgba(152,204,152,0.28)", text:"#c0f0c0", illum: 0.2, waxing: true, eclipse: false, description:"새로운 시작. 에스트로겐이 상승하며 기분이 산뜻해집니다.", exercise:"필라테스, 요가", food:"신선한 샐러드, 단백질", avoid:"가공식품" },
  { id:"sanghyun", name:"상현달", moon:"🌓", season:"난포기 후기", dayRange:[10,13], color:"#a0a068", soft:"rgba(204,204,152,0.14)", border:"rgba(204,204,152,0.28)", text:"#f0f0c0", illum: 0.52, waxing: true, eclipse: false, description:"빛이 차오르는 중. 컨디션과 피부 상태가 최상입니다.", exercise:"근력 운동, 고강도 유산소", food:"복합 탄수화물", avoid:"고지방 음식" },
  { id:"full", name:"보름달", moon:"🌕", season:"배란기", dayRange:[14,14], color:"#d4af37", soft:"rgba(212,175,55,0.14)", border:"rgba(212,175,55,0.28)", text:"#f5e5a0", illum: 1.0, waxing: null, eclipse: false, description:"에너지의 정점. 사교적이고 신체 활동에 적합한 시기입니다.", exercise:"고강도 트레이닝, 등산", food:"견과류, 항산화 식품", avoid:"과식, 음주" },
  { id:"hahyun", name:"하현달", moon:"🌗", season:"황체기 전기", dayRange:[15,22], color:"#a07868", soft:"rgba(204,152,152,0.14)", border:"rgba(204,152,152,0.28)", text:"#f0c0c0", illum: 0.52, waxing: false, eclipse: false, description:"안정기. 프로게스테론 상승으로 몸이 무거워질 수 있습니다.", exercise:"수영, 빠른 걷기", food:"바나나, 마그네슘", avoid:"짠 음식(부종 주의)" },
  { id:"geumeum", name:"그믐달", moon:"🌘", season:"황체기 후기", dayRange:[23,35], color:"#705070", soft:"rgba(112,80,112,0.14)", border:"rgba(112,80,112,0.28)", text:"#e0c0e0", illum: 0.2, waxing: false, eclipse: false, description:"어둠 속 정화. 감정이 민감해지니 마음 챙김에 집중하세요.", exercise:"반신욕, 명상", food:"따뜻한 차, 오메가3", avoid:"자극적인 음식" }
];

const C = { bg: "#03030b", card: "#0a0a1f", border: "#1a1a3a", text: "#eee", muted: "#777", accent: "#d4af37" };

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // 로딩 상태 추가 (튕김 방지)
  const [tab, setTab] = useState("dash");
  const [periods, setPeriods] = useState([]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => {
      setUser(u);
      if (u) fetchUserPeriods(u.uid);
      else setLoading(false);
    });
    return () => unsub();
  }, []);

  const fetchUserPeriods = async (uid) => {
    try {
      const d = await getDoc(doc(db, "users", uid));
      if (d.exists()) setPeriods(d.data().periods || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const getDayInCycle = () => {
    if (!periods || periods.length === 0) return 14; // 데이터 없을 때 보름달 기본값
    const sorted = [...periods].sort((a,b) => b.start.toMillis() - a.start.toMillis());
    const lastStart = sorted[0].start.toMillis();
    const diff = Math.floor((Date.now() - lastStart) / (1000 * 60 * 60 * 24)) + 1;
    return diff > 0 ? diff : 1;
  };

  const getMoonPath = (illum, waxing, r) => {
    const cx = 100, cy = 100;
    const rx = r * Math.abs(1 - 2 * illum);
    const sweep = (illum <= 0.5) ? (waxing ? 0 : 1) : (waxing ? 1 : 0);
    if (waxing === null) return `M${cx-r},${cy} a${r},${r} 0 1,0 ${r*2},0 a${r},${r} 0 1,0 -${r*2},0`;
    return waxing 
      ? `M${cx},${cy-r} A${r},${r} 0 0 1 ${cx},${cy+r} A${rx},${r} 0 0 ${sweep} ${cx},${cy-r}`
      : `M${cx},${cy-r} A${r},${r} 0 0 0 ${cx},${cy+r} A${rx},${r} 0 0 ${sweep} ${cx},${cy-r}`;
  };

  const login = (p) => {
    const provider = p === "google" ? new GoogleAuthProvider() : new OAuthProvider("apple.com");
    signInWithPopup(auth, provider).catch(e => console.error(e));
  };

  const day = getDayInCycle();
  // find 결과가 없을 경우를 대비한 널 체크 강화
  const p = PHASES.find(ph => day >= ph.dayRange[0] && day <= ph.dayRange[1]) || PHASES[0];

  if (loading) return <div style={{background:C.bg, height:"100vh", display:"flex", alignItems:"center", justifyContent:"center", color:C.text}}>Loading...</div>;

  if (!user) return (
    <div style={{ background:C.bg, height:"100vh", display:"flex", alignItems:"center", justifyContent:"center", color:C.text }}>
      <div style={{ textAlign:"center", padding:20 }}>
        <h1 style={{ fontSize:36, color:C.accent, margin:0, letterSpacing:"-0.05em" }}>me-ll</h1>
        <p style={{ opacity:0.6, marginBottom:40, fontSize:14 }}>나를 비추는 달의 기록</p>
        <button onClick={()=>login("google")} style={{ width:260, padding:15, borderRadius:30, border:"none", background:C.accent, color:C.bg, fontWeight:"bold", cursor:"pointer" }}>Google로 시작하기</button>
      </div>
    </div>
  );

  return (
    <div style={{ background:C.bg, minHeight:"100vh", color:C.text, paddingBottom:100 }}>
      <style>{`
        .dash-container { position: relative; width: 100%; max-width: 420px; margin: 0 auto; min-height: 100vh; }
        .stars-bg { position: absolute; inset: 0; z-index: 0; pointer-events: none; }
        .ui-layer { position: relative; z-index: 2; padding: 20px; }
        .guide-box { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 18px; padding: 18px; margin-top: 15px; }
        .tab-bar { position: fixed; bottom: 0; left: 0; right: 0; height: 64px; background: #0a0a1f; border-top: 1px solid #1a1a3a; display: flex; z-index: 50; }
        .tab-btn { flex: 1; border: none; background: none; color: #555; font-size: 11px; display: flex; flex-direction: column; align-items: center; justify-content: center; }
        .tab-btn.active { color: #d4af37; }
      `}</style>

      {tab === "dash" && (
        <div className="dash-container">
          <svg className="stars-bg" viewBox="0 0 400 800">
            {[...Array(40)].map((_, i) => (
              <circle key={i} cx={Math.abs(Math.sin(i*77))*400} cy={Math.abs(Math.cos(i*12))*800} r={0.8} fill="#fff" opacity={0.2} />
            ))}
          </svg>

          <div className="ui-layer">
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline" }}>
              <span style={{ fontSize:16, fontWeight:600, color:C.accent }}>Day {day}</span>
              <span onClick={()=>signOut(auth)} style={{ fontSize:11, color:C.muted, cursor:"pointer" }}>Logout</span>
            </div>

            <div style={{ textAlign:"center", margin:"40px 0" }}>
              <div style={{ width:180, height:180, margin:"0 auto" }}>
                <svg viewBox="0 0 200 200" style={{ filter: p.eclipse ? 'none' : `drop-shadow(0 0 ${p.illum * 15}px ${p.color})`, transition: "all 0.6s ease" }}>
                  <defs>
                    <radialGradient id="mG" cx="35%" cy="35%" r="70%">
                      <stop offset="0%" stopColor="#fffdf0" />
                      <stop offset="100%" stopColor={p.color} />
                    </radialGradient>
                    <clipPath id="mC"><path d={getMoonPath(p.illum, p.waxing, 80)}/></clipPath>
                  </defs>
                  {p.eclipse ? (
                    <circle cx="100" cy="100" r="80" fill="#2a1212" stroke="#4d2525" />
                  ) : (
                    <>
                      <circle cx="100" cy="100" r="80" fill="#070715" />
                      <g clipPath="url(#mC)">
                        <circle cx="100" cy="100" r="80" fill="url(#mG)" />
                        <circle cx="75" cy="70" r="10" fill="#000" opacity="0.05" />
                        <circle cx="120" cy="110" r="15" fill="#000" opacity="0.05" />
                      </g>
                    </>
                  )}
                </svg>
              </div>
              <h2 style={{ color:p.text, fontSize:26, marginTop:24, letterSpacing:"0.1em" }}>{p.season}</h2>
              <p style={{ color:p.color, fontSize:14, fontWeight:500 }}>{p.name}</p>
            </div>

            <p style={{ fontSize:13, textAlign:"center", lineHeight:1.7, color:"#999", margin:"0 10px 30px" }}>{p.description}</p>

            <div className="guide-box" style={{ borderLeft:`4px solid ${p.color}` }}>
              <div style={{ fontSize:11, color:p.color, fontWeight:"bold", marginBottom:4 }}>RECOMMENDED EXERCISE</div>
              <div style={{ fontSize:15, color:"#eee" }}>{p.exercise}</div>
            </div>

            <div className="guide-box" style={{ borderLeft:`4px solid ${p.color}` }}>
              <div style={{ fontSize:11, color:p.color, fontWeight:"bold", marginBottom:4 }}>POWER FOOD</div>
              <div style={{ fontSize:15, color:"#eee" }}>{p.food}</div>
            </div>

            <div className="guide-box" style={{ borderLeft:`4px solid #ff6b6b` }}>
              <div style={{ fontSize:11, color:"#ff6b6b", fontWeight:"bold", marginBottom:4 }}>AVOID</div>
              <div style={{ fontSize:15, color:"#eee" }}>{p.avoid}</div>
            </div>
          </div>
        </div>
      )}

      {/* 기타 탭 (기존 700줄 로직 연결 부분) */}
      {tab === "cal" && <div style={{padding:40, textAlign:"center"}}>Calendar View (기존 CalView 컴포넌트 삽입)</div>}
      {tab === "record" && <div style={{padding:40, textAlign:"center"}}>Record View (기존 RecordView 컴포넌트 삽입)</div>}
      {tab === "my" && <div style={{padding:40, textAlign:"center"}}>My Page (기존 MyPage 컴포넌트 삽입)</div>}

      <nav className="tab-bar">
        {[{id:"dash",lb:"홈"},{id:"cal",lb:"캘린더"},{id:"record",lb:"기록"},{id:"my",lb:"마이"}].map(t => (
          <button key={t.id} className={`tab-btn ${tab===t.id?"active":""}`} onClick={()=>setTab(t.id)}>
            <div style={{ fontSize:18, marginBottom:2 }}>{t.id==="dash"?"◯":t.id==="cal"?"▦":t.id==="record"?"✎":"♡"}</div>
            <span>{t.lb}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default App;
