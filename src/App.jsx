import React, { useState } from 'react';

const App = () => {
  const [current, setCurrent] = useState(0);
  const [fade, setFade] = useState(false);

  const phases = [
    { name: "초생달", illum: 0.20, waxing: true,  eclipse: false },
    { name: "상현달", illum: 0.52, waxing: true,  eclipse: false },
    { name: "보름달", illum: 1.00, waxing: null,  eclipse: false },
    { name: "하현달", illum: 0.52, waxing: false, eclipse: false },
    { name: "그믐달", illum: 0.20, waxing: false, eclipse: false },
    { name: "월식",   illum: 0,    waxing: null,  eclipse: true  }
  ];

  const getPath = (illum, waxing, r) => {
    const cx = 100, cy = 100;
    const rx = r * Math.abs(1 - 2 * illum);
    const sweep = (illum <= 0.5) ? (waxing ? 0 : 1) : (waxing ? 1 : 0);
    if (waxing === null) return `M${cx-r},${cy} a${r},${r} 0 1,0 ${r*2},0 a${r},${r} 0 1,0 -${r*2},0`;
    return waxing 
      ? `M${cx},${cy-r} A${r},${r} 0 0 1 ${cx},${cy+r} A${rx},${r} 0 0 ${sweep} ${cx},${cy-r}`
      : `M${cx},${cy-r} A${r},${r} 0 0 0 ${cx},${cy+r} A${rx},${r} 0 0 ${sweep} ${cx},${cy-r}`;
  };

  const move = (dir) => {
    setFade(true);
    setTimeout(() => {
      setCurrent((prev) => (prev + dir + 6) % 6);
      setFade(false);
    }, 200);
  };

  const p = phases[current];

  return (
    <>
      {/* 1. 스타일을 별도의 CSS 파일 대신 여기에 직접 정의합니다. */}
      <style>{`
        .space-bg {
          background: radial-gradient(circle at center, #0a0a25 0%, #03030b 100%);
          border-radius: 28px;
          padding: 3rem 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
          width: 340px;
          position: relative;
          overflow: hidden;
          margin: 40px auto;
          border: 1px solid rgba(255,255,255,0.03);
          box-shadow: 0 30px 60px rgba(0,0,0,0.7);
        }
        .stars-layer {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 0;
        }
        .moon-wrap, .phase-name, .dot-nav, .btn-row {
          position: relative;
          z-index: 2;
        }
        .phase-name {
          font-size: 21px;
          font-weight: 300;
          letter-spacing: 0.2em;
          color: #eee;
          margin: 10px 0;
          transition: opacity 0.3s;
          padding: 5px 15px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.05);
        }
        .dot-nav { display: flex; gap: 12px; }
        .dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #1a1a2e;
          cursor: pointer;
          transition: 0.4s;
        }
        .dot.active {
          background: #d4af37;
          transform: scale(1.6);
          box-shadow: 0 0 8px rgba(212,175,55,0.4);
        }
        .btn-row { display: flex; gap: 20px; align-items: center; margin-top: 10px; }
        .nav-btn {
          padding: 8px 16px;
          border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.15);
          background: rgba(255,255,255,0.05);
          color: #aaa;
          font-size: 11px;
          cursor: pointer;
          transition: 0.3s;
        }
        .nav-btn:hover { background: rgba(255, 255, 255, 0.12); color: #fff; border-color: rgba(255, 255, 255, 0.4); }
      `}</style>

      {/* 2. JSX 구조 */}
      <div className="space-bg">
        <svg className="stars-layer" viewBox="0 0 340 500">
          {[...Array(60)].map((_, i) => (
            <circle 
              key={i}
              cx={Math.abs(Math.sin(i)) * 340} 
              cy={Math.abs(Math.cos(i)) * 500} 
              r={0.5} 
              fill="#fff" 
              opacity={0.3} 
            />
          ))}
        </svg>

        <div className="moon-wrap" style={{ width: '200px', height: '200px' }}>
          <svg viewBox="0 0 200 200" style={{ 
            width: '100%', height: '100%', transition: 'all 0.8s ease-in-out',
            filter: p.eclipse ? 'none' : `drop-shadow(0 0 ${p.illum * 15}px rgba(226, 192, 125, 0.18))` 
          }}>
            <defs>
              <radialGradient id="mG" cx="35%" cy="35%" r="70%">
                <stop offset="0%" stopColor="#fffdf0" />
                <stop offset="60%" stopColor="#e2c07d" />
                <stop offset="100%" stopColor="#7a5a20" />
              </radialGradient>
              <clipPath id="cp"><path d={getPath(p.illum, p.waxing, 80)}/></clipPath>
            </defs>
            {p.eclipse ? (
              <>
                <circle cx="100" cy="100" r="80" fill="#150808"/>
                <radialGradient id="eG" cx="50%" cy="50%" r="50%">
                  <stop offset="40%" stopColor="#3d1818" />
                  <stop offset="100%" stopColor="#1a0a0a" />
                </radialGradient>
                <circle cx="100" cy="100" r="80" fill="url(#eG)" stroke="#4d2525" strokeWidth="0.5"/>
              </>
            ) : (
              <>
                <circle cx="100" cy="100" r="80" fill="#070715"/>
                <g clipPath="url(#cp)">
                  <circle cx="100" cy="100" r="80" fill="url(#mG)"/>
                  <circle cx="75" cy="70" r="10" fill="#403010" opacity="0.06"/>
                  <circle cx="120" cy="110" r="14" fill="#403010" opacity="0.06"/>
                </g>
              </>
            )}
          </svg>
        </div>

        <div className="phase-name" style={{ opacity: fade ? 0 : 1 }}>{p.name}</div>

        <div className="dot-nav">
          {phases.map((_, i) => (
            <div 
              key={i} 
              className={`dot ${current === i ? 'active' : ''}`} 
              onClick={() => setCurrent(i)}
            />
          ))}
        </div>

        <div className="btn-row">
          <button className="nav-btn" onClick={() => move(-1)}>PREV</button>
          <button className="nav-btn" onClick={() => move(1)}>NEXT</button>
        </div>
      </div>
    </>
  );
};

export default App;
