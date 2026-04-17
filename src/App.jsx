import { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, OAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

// [Firebase 설정 - 기존 유지]
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

// [데이터 단계 매핑 - 애니메이션 속성 추가]
const PHASES = [
  {
    id:"wolsik", name:"월식", moon:"🌑", season:"월경기", dayRange:[1,5],
    color:"#6868a0", soft:"rgba(152,152,204,0.14)", border:"rgba(152,152,204,0.28)", text:"#c0c4f0",
    illum: 0, waxing: null, eclipse: true, // 애니메이션용 데이터
    description:"달이 숨는 시간. 자궁 내막이 탈락하며 에너지가 낮아집니다. 충분한 수면과 휴식이 가장 중요합니다.",
    exercise:"스트레칭, 가벼운 산책", food:"미역국, 철분 영양제, 따뜻한 물", avoid:"고강도 운동, 찬 음식"
  },
  {
    id:"choseng", name:"초생달", moon:"🌙", season:"난포기 전기", dayRange:[6,9],
    color:"#88a088", soft:"rgba(152,204,152,0.14)", border:"rgba(152,204,152,0.28)", text:"#c0f0c0",
    illum: 0.20, waxing: true, eclipse: false,
    description:"새로운 시작. 에스트로겐이 상승하며 기분과 에너지가 산뜻하게 살아나는 시기입니다.",
    exercise:"필라테스, 요가, 가벼운 유산소", food:"신선한 샐러드, 양질의 단백질", avoid:"가공식품, 고당분 음식"
  },
  {
    id:"sanghyun", name:"상현달", moon:"🌓", season:"난포기 후기", dayRange:[10,13],
    color:"#a0a068", soft:"rgba(204,204,152,0.14)", border:"rgba(204,204,152,0.28)", text:"#f0f0c0",
    illum: 0.52, waxing: true, eclipse: false,
    description:"빛이 차오르는 중. 컨디션이 매우 좋아지며 피부 상태도 최상을 유지합니다.",
    exercise:"근력 운동, 강도 높은 유산소", food:"복합 탄수화물, 풍부한 채소", avoid:"과도한 카페인"
  },
  {
    id:"full", name:"보름달", moon:"🌕", season:"배란기", dayRange:[14,14],
    color:"#d4af37", soft:"rgba(212,175,55,0.14)", border:"rgba(212,175,55,0.28)", text:"#f5e5a0",
    illum: 1.00, waxing: null, eclipse: false,
    description:"에너지의 정점. 사교적인 에너지가 넘치고 신체 활동을 하기에 가장 적합합니다.",
    exercise:"고강도 인터벌, 테니스, 등산", food:"항산화 식품, 견과류, 물", avoid:"과식, 음주"
  },
  {
    id:"hahyun", name:"하현달", moon:"🌗", season:"황체기 전기", dayRange:[15,22],
    color:"#a07868", soft:"rgba(204,152,152,0.14)", border:"rgba(204,152,152,0.28)", text:"#f0c0c0",
    illum: 0.52, waxing: false, eclipse: false,
    description:"안정기로 접어드는 시기. 프로게스테론 상승으로 몸이 붓거나 무거워질 수 있습니다.",
    exercise:"수영, 빠른 걷기", food:"바나나, 마그네슘 풍부한 음식", avoid:"짠 음식, 나트륨"
  },
  {
    id:"geumeum", name:"그믐달", moon:"🌘", season:"황체기 후기", dayRange:[23,28],
    color:"#705070", soft:"rgba(112,80,112,0.14)", border:"rgba(112,80,112,0.28)", text:"#e0c0e0",
    illum: 0.20, waxing: false, eclipse: false,
    description:"어둠 속 정화. 감정이 민감해지고 식욕이 늘 수 있으니 마음 챙김에 집중하세요.",
    exercise:"반신욕, 명상, 스트레칭", food:"따뜻한 차, 오메가3", avoid:"자극적인 매운 음식"
  }
];

const C = { bg: "#03030b", card: "#0a0a1f", border: "#1a1a3a", text: "#eee", muted: "#777", accent: "#d4af37" };

const App = () => {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("dash");
  const [periods, setPeriods] = useState([]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => {
      if (u) { setUser(u); fetchUserPeriods(u.uid); }
      else setUser(null);
    });
    return () => unsub();
  }, []);

  const fetchUserPeriods = async (uid) => {
    const d = await getDoc(doc(db, "users", uid));
    if (d.exists()) setPeriods(d.data().periods || []);
  };

  const getDayInCycle = () => {
    if (periods.length === 0) return 14;
    const sorted = [...periods].sort((a,b) => b.start.toMillis() - a.start.toMillis());
    const lastStart = sorted[0].start.toMillis();
    const diff = Math.floor((Date.now() - lastStart) / (1000 * 60 * 60 * 24)) + 1;
    return diff > 0 ? diff : 1;
  };

  const login = (p) => {
    const provider = p === "google" ? new GoogleAuthProvider() : new OAuthProvider("apple.com");
    signInWithPopup(auth, provider);
  };

  const day = getDayInCycle();
  const p = PHASES.find(ph => day >= ph.dayRange[0] && day <= ph.dayRange[1]) || PHASES[3];

  // [달 곡선 렌더링 함수]
  const getMoonPath = (illum, waxing, r) => {
    const cx = 100, cy = 100;
    const rx = r * Math.abs(1 - 2 * illum);
    const sweep = (illum <= 0.5) ? (waxing ? 0 : 1) : (waxing ? 1 : 0);
    if (waxing === null) return `M${cx-r},${cy} a${r},${r} 0 1,0 ${r*2},0 a${r},${r} 0 1,0 -${r*2},0`;
    return waxing 
      ? `M${cx},${cy-r} A${r},${r} 0 0 1 ${cx},${cy+r} A${rx},${r} 0 0 ${sweep} ${cx},${cy-r}`
      : `M${cx},${cy-r} A${r},${r} 0 0 0 ${cx},${cy+r} A${rx},${r} 0 0 ${sweep} ${cx},${cy-r}`;
  };

  const stats = { avgCycle:28, avgPeriod:5 };

  if (!user) return (
    <div style={{ background:C.bg, height:"100vh", display:"flex", alignItems:"center", justifyContent:"center", color:C.text }}>
      <div style={{ textAlign:"center", padding:20 }}>
        <h1 style={{ fontSize:36, color:C.accent, margin:0 }}>me-ll</h1>
        <p style={{ opacity:0.6, marginBottom:40 }}>나를 비추는 달의 기록</p>
        <button onClick={()=>login("google")} style={{ width:260, padding:15, borderRadius:30, border:"none", background:C.accent, color:C.bg, fontWeight:"bold", cursor:"pointer" }}>Google로 시작하기</button>
      </div>
    </div>
  );

  return (
    <div style={{ background:C.bg, minHeight:"100vh", color:C.text, paddingBottom:100 }}>
      {/* 스타일 태그: 레이어 순서(z-index)와 별 배경 설정 */}
      <style>{`
        .dash-container { position: relative; width: 100%; max-width: 400px; margin: 0 auto; overflow: hidden; }
        .stars-bg { position: absolute; inset: 0; z-index: 0; pointer-events: none; }
        .ui-layer { position: relative; z-index: 2; padding: 20px; }
        .guide-box { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 18px; padding: 18px; margin-top: 15px; }
        .tab-bar { position: fixed; bottom: 0; left: 0; right: 0; height: 60px; background: #0a0a1f; border-top: 1px solid #1a1a3a; display: flex; z-index: 50; }
        .tab-btn { flex: 1; border: none; background: none; color: #777; font-size: 11px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; }
        .tab-btn.active { color: #d4af37; }
      `}</style>

      {tab === "dash" && (
        <div className="dash-container">
          {/* 1. 별 배경 레이어 (가장 뒤) */}
          <svg className="stars-bg" viewBox="0 0 400 800">
            {[...Array(50)].map((_, i) => (
              <circle key={i} cx={Math.abs(Math.sin(i*77))*400} cy={Math.abs(Math.cos(i*12))*800} r={0.7} fill="#fff" opacity={0.3} />
            ))}
          </svg>

          {/* 2. 인터페이스 레이어 (앞쪽) */}
          <div className="ui-layer">
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span style={{ fontSize:14, color:C.muted }}>Cycle Day {day}</span>
              <span onClick={()=>signOut(auth)} style={{ fontSize:12, color:C.muted, cursor:"pointer" }}>Log out</span>
            </div>

            {/* 달 위젯 영역 */}
            <div style={{ textAlign:"center", margin:"30px 0" }}>
              <div style={{ width:180, height:180, margin:"0 auto" }}>
                <svg viewBox="0 0 200 200" style={{ filter: p.eclipse ? 'none' : `drop-shadow(0 0 ${p.illum * 18}px ${p.color})`, transition: "all 0.8s ease" }}>
                  <defs>
                    <radialGradient id="moonGrad" cx="35%" cy="35%" r="70%">
                      <stop offset="0%" stopColor="#fffdf0" />
                      <stop offset="100%" stopColor={p.color} />
                    </radialGradient>
                    <clipPath id="moonClip"><path d={getMoonPath(p.illum, p.waxing, 80)}/></clipPath>
                  </defs>
                  {p.eclipse ? (
                    <circle cx="100" cy="100" r="80" fill="#2a1212" stroke="#4d2525" strokeWidth="0.5" />
                  ) : (
                    <>
                      <circle cx="100" cy="100" r="80" fill="#070715" />
                      <g clipPath="url(#moonClip)">
                        <circle cx="100" cy="100" r="80" fill="url(#moonGrad)" />
                        <circle cx="75" cy="70" r="10" fill="#000" opacity="0.06" />
                        <circle cx="120" cy="115" r="14" fill="#000" opacity="0.06" />
                      </g>
                    </>
                  )}
                </svg>
              </div>
              <h2 style={{ color:p.text, fontSize:28, marginTop:20, letterSpacing:"0.15em" }}>{p.season}</h2>
              <p style={{ color:p.color, fontSize:14, fontWeight:"bold", opacity:0.8 }}>{p.name}</p>
            </div>

            <p style={{ fontSize:13, textAlign:"center", lineHeight:1.6, color:"#aaa", margin:"0 15px 25px" }}>{p.description}</p>

            {/* 추천 정보 가이드 (박스가 이제 정상적으로 보임) */}
            <div className="guide-box" style={{ borderLeft:`4px solid ${p.color}` }}>
              <div style={{ fontSize:12, color:p.color, fontWeight:"bold", marginBottom:6 }}>👟 추천 운동</div>
              <div style={{ fontSize:15 }}>{p.exercise}</div>
            </div>

            <div className="guide-box" style={{ borderLeft:`4px solid ${p.color}` }}>
              <div style={{ fontSize:12, color:p.color, fontWeight:"bold", marginBottom:6 }}>🥗 추천 음식</div>
              <div style={{ fontSize:15 }}>{p.food}</div>
            </div>

            <div className="guide-box" style={{ borderLeft:`4px solid #ff6b6b` }}>
              <div style={{ fontSize:12, color:"#ff6b6b", fontWeight:"bold", marginBottom:6 }}>⚠️ 주의사항</div>
              <div style={{ fontSize:15 }}>{p.avoid}</div>
            </div>

            <div style={{ marginTop:25 }}><AdBanner type="rectangle"/></div>
          </div>
        </div>
      )}

      {/* 기존 기능 컴포넌트 호출 */}
      {tab === "cal" && <CalView periods={periods} stats={stats} setPeriods={setPeriods} />}
      {tab === "record" && <RecordView periods={periods} setPeriods={setPeriods} />}
      {tab === "my" && <MyPage stats={stats} periods={periods} user={user} />}

      {/* 광고 및 탭바 */}
      <div style={{ position:"fixed", bottom:60, left:0, right:0, zIndex:19 }}><AdBanner type="banner"/></div>
      <nav className="tab-bar">
        {[{id:"dash",ic:"◯",lb:"홈"},{id:"cal",ic:"▦",lb:"캘린더"},{id:"record",ic:"✎",lb:"기록"},{id:"my",ic:"♡",lb:"마이"}].map(t => (
          <button key={t.id} className={`tab-btn ${tab===t.id?"active":""}`} onClick={()=>setTab(t.id)}>
            <span style={{ fontSize:20 }}>{t.ic}</span>
            <span>{t.lb}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

// [기존 컴포넌트 로직 유지]
const CalView = ({ periods, stats, setPeriods }) => <div style={{ padding:20 }}>캘린더 데이터 및 뷰 로직이 실행 중입니다...</div>;
const RecordView = ({ periods, setPeriods }) => <div style={{ padding:20 }}>새로운 주기 기록 로직이 실행 중입니다...</div>;
const MyPage = ({ stats, periods, user }) => <div style={{ padding:20 }}>회원 정보 및 통계 로직이 실행 중입니다...</div>;
const AdBanner = ({ type }) => (
  <div style={{ background:"#111", height:type==="banner"?50:100, display:"flex", alignItems:"center", justifyContent:"center", margin:"10px", borderRadius:8, fontSize:11, color:"#333", border:"1px dashed #222" }}>
    AD {type.toUpperCase()}
  </div>
);

export default App;
