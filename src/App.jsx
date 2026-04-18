function Clock({ angle, selId, todayId, onSelect }) {
  const cx = 160, cy = 160, R = 110;
  const displayId = selId || todayId || "wolsik";
  
  // 1. 각 페이즈별 중앙 각도와 너비 계산 (궤도 이탈 방지)
  const activeArc = PA.find(pa => pa.id === displayId);
  const midAngle = activeArc ? (activeArc.s + activeArc.e) / 2 : 0;
  const arcSweep = activeArc ? (activeArc.e - activeArc.s) : 30;

  // 2. 달 모양 데이터
  const displayPhase = PHASES.find(p => p.id === displayId);
  const MOON_CFG = {
    wolsik: { il: 0, wx: null }, choseung: { il: 0.2, wx: true },
    sanghyun: { il: 0.5, wx: true }, boreum: { il: 1.0, wx: null },
    hahyun: { il: 0.5, wx: false }, geumeum: { il: 0.2, wx: false },
  };
  const mc = MOON_CFG[displayId] || MOON_CFG.wolsik;

  const getMoonPath = (il, wx, r) => {
    const rx = r * Math.abs(1 - 2 * il);
    const sw = il <= 0.5 ? (wx ? 0 : 1) : (wx ? 1 : 0);
    if (wx === null) return `M${100-r},100 a${r},${r} 0 1,0 ${r*2},0 a${r},${r} 0 1,0 -${r*2},0`;
    return wx ? `M100,${100-r} A${r},${r} 0 0 1 100,${100+r} A${rx},${r} 0 0 ${sw} 100,${100-r}`
              : `M100,${100-r} A${r},${r} 0 0 0 100,${100+r} A${rx},${r} 0 0 ${sw} 100,${100-r}`;
  };

  const todayPos = angle !== null ? polar(cx, cy, R, angle) : null;

  return (
    <div style={{ position: "relative", width: 320, height: 320, margin: "0 auto" }}>
      {/* 배경 글래스 효과 */}
      <div style={{
        position: "absolute", inset: 10, borderRadius: "50%",
        background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.08), rgba(255,255,255,0.01))",
        backdropFilter: "blur(15px)", border: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "0 25px 50px rgba(0,0,0,0.4)"
      }} />

      <svg viewBox="0 0 320 320" style={{ width: "100%", height: "100%", overflow: "visible" }}>
        <defs>
          {/* 아이폰 느낌의 미세한 외곽 광택과 굴절을 위한 필터 */}
          <filter id="lens">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* 1. 기본 고정 궤도 (바탕) */}
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />

        {/* 2. 미끄러지는 선택 바 (아이폰 메뉴 효과) */}
        <circle
          cx={cx} cy={cy} r={R}
          fill="none"
          stroke="rgba(255,255,255,0.3)" 
          strokeWidth="14"
          strokeDasharray={`${(arcSweep / 360) * (2 * Math.PI * R)} ${(2 * Math.PI * R)}`}
          strokeLinecap="round"
          style={{
            transformOrigin: "center",
            transform: `rotate(${midAngle - 90}deg)`, // 궤도 중심에 맞춰 회전
            transition: "all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1.1)", // 탄성 있는 미끄러짐
            filter: "drop-shadow(0 0 12px rgba(255,255,255,0.2))",
            opacity: selId ? 0.6 : 0.3 // 움직일 때 더 투명해지는 느낌 구현
          }}
        />

        {/* 오늘 위치 표시 (작은 도트) */}
        {todayPos && (
          <circle cx={todayPos.x} cy={todayPos.y} r={3} fill="#fff" opacity="0.8" />
        )}

        {/* 3. 중앙 달 이미지와 굴절 텍스트 */}
        <g transform={`translate(${cx-100}, ${cy-100})`}>
          <g transform="scale(0.8) translate(25, 25)">
            <defs>
              <clipPath id="mcp"><path d={getMoonPath(mc.il, mc.wx, 60)} /></clipPath>
            </defs>
            <circle cx="100" cy="100" r="60" fill="rgba(255,255,255,0.03)" />
            <circle cx="100" cy="100" r="60" fill="#E2C07D" clipPath="url(#mcp)" 
                    style={{ transition: "all 1s ease", filter: "drop-shadow(0 0 15px #E2C07D)" }} />
          </g>
          <text x="100" y="110" textAnchor="middle" fill="#fff" 
                style={{ fontSize: 18, fontWeight: 300, letterSpacing: "0.2em", opacity: 0.9 }}>
            {displayPhase?.name}
          </text>
        </g>

        {/* 클릭 감지 영역 (보이지 않는 투명 패드) */}
        {PA.map(pa => (
          <path
            key={pa.id}
            d={getArcPath(pa.s, pa.e, R, 20)} 
            fill="transparent"
            onClick={() => onSelect(pa.id)}
            style={{ cursor: "pointer" }}
          />
        ))}
      </svg>
    </div>
  );
}
