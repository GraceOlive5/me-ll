<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Moon Rotation - Debugged Edition</title>
  <style>
    :root {
      --bg-dark: #03030b;
      --moon-ivory: #fffdf0;
      --moon-gold: #e2c07d;
      --moon-deep: #7a5a20;
    }

    body {
      margin: 0;
      font-family: 'Inter', sans-serif;
      background: var(--bg-dark);
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      color: #fff;
      overflow: hidden;
    }

    .space-bg {
      background: radial-gradient(circle at center, #0a0a25 0%, #03030b 100%);
      border-radius: 28px;
      padding: 3rem 2rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.5rem;
      width: 340px;
      border: 1px solid rgba(255,255,255,0.03);
      box-shadow: 0 30px 60px rgba(0,0,0,0.7);
      /* [디버깅 포인트 1] 부모 컨테이너에 relative 설정 */
      position: relative; 
      overflow: hidden;
    }

    /* [디버깅 포인트 2] 별 레이어는 가장 뒤로 보냄 */
    .stars-layer {
      position: absolute;
      inset: 0;
      pointer-events: none;
      z-index: 0; 
    }

    /* [디버깅 포인트 3] 모든 콘텐츠 레이어를 별보다 위로(z-index: 1 이상) 설정 */
    .moon-wrap, .phase-name, .dot-nav, .btn-row {
      position: relative;
      z-index: 2;
    }

    .moon-wrap { 
      width: 200px; 
      height: 200px; 
      filter: drop-shadow(0 0 15px rgba(255, 253, 240, 0.12)); 
    }
    
    .moon-svg { width: 100%; height: 100%; transition: all 0.8s ease-in-out; }

    .phase-name {
      font-size: 21px;
      font-weight: 300;
      letter-spacing: 0.2em;
      color: #eee;
      margin: 10px 0;
      transition: opacity 0.3s;
      /* 텍스트 박스가 안 보였다면 배경색이나 보더를 추가할 수 있습니다 */
      padding: 5px 15px;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.05); /* 은은한 박스 배경 추가 */
    }
    .phase-name.fade { opacity: 0; }

    .dot-nav { display: flex; gap: 12px; }
    .dot { width: 6px; height: 6px; border-radius: 50%; background: #1a1a2e; cursor: pointer; transition: 0.4s; }
    .dot.active { background: #d4af37; transform: scale(1.6); box-shadow: 0 0 8px rgba(212,175,55,0.4); }

    .btn-row { display: flex; gap: 20px; align-items: center; margin-top: 10px; }
    .nav-btn {
      padding: 8px 16px; 
      border-radius: 20px; 
      border: 1px solid rgba(255,255,255,0.15); /* 보더 강조 */
      background: rgba(255,255,255,0.05); 
      color: #aaa; 
      font-size: 11px; 
      cursor: pointer; 
      transition: 0.3s;
      z-index: 3; /* 버튼이 확실히 눌리도록 높임 */
    }
    .nav-btn:hover { background: rgba(255,255,255,0.12); color: #fff; border-color: rgba(255,255,255,0.4); }
  </style>
</head>
<body>

<div class="space-bg">
  <svg class="stars-layer" id="starfield" viewBox="0 0 340 500" xmlns="http://www.w3.org/2000/svg"></svg>
  
  <div class="moon-wrap">
    <svg id="moon-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"></svg>
  </div>
  
  <div class="phase-name" id="pname">초생달</div>
  
  <div class="dot-nav" id="dots"></div>
  
  <div class="btn-row">
    <button class="nav-btn" onclick="move(-1)">PREV</button>
    <button class="nav-btn" onclick="move(1)">NEXT</button>
  </div>
</div>

<script>
  // (스크립트 부분은 기존과 동일하므로 생략하거나 그대로 유지하시면 됩니다)
  const phases = [
    { name: "초생달", illum: 0.20, waxing: true,  eclipse: false },
    { name: "상현달", illum: 0.52, waxing: true,  eclipse: false },
    { name: "보름달", illum: 1.00, waxing: null,  eclipse: false },
    { name: "하현달", illum: 0.52, waxing: false, eclipse: false },
    { name: "그믐달", illum: 0.20, waxing: false, eclipse: false },
    { name: "월식",   illum: 0,    waxing: null,  eclipse: true  }
  ];
  let current = 0;

  function drawStars() {
    const svg = document.getElementById('starfield');
    let h = '';
    for (let i = 0; i < 80; i++) {
      h += `<circle cx="${Math.random()*340}" cy="${Math.random()*500}" r="${Math.random()*0.7+0.1}" fill="#fff" opacity="${Math.random()*0.5+0.1}"/>`;
    }
    svg.innerHTML = h;
  }

  function getPath(illum, waxing, r) {
    const cx = 100, cy = 100;
    const rx = r * Math.abs(1 - 2 * illum);
    const sweep = (illum <= 0.5) ? (waxing ? 0 : 1) : (waxing ? 1 : 0);
    if (waxing === null) return `M${cx-r},${cy} a${r},${r} 0 1,0 ${r*2},0 a${r},${r} 0 1,0 -${r*2},0`;
    return waxing 
      ? `M${cx},${cy-r} A${r},${r} 0 0 1 ${cx},${cy+r} A${rx},${r} 0 0 ${sweep} ${cx},${cy-r}`
      : `M${cx},${cy-r} A${r},${r} 0 0 0 ${cx},${cy+r} A${rx},${r} 0 0 ${sweep} ${cx},${cy-r}`;
  }

  function render() {
    const p = phases[current];
    const pname = document.getElementById('pname');
    pname.classList.add('fade');
    setTimeout(() => { pname.textContent = p.name; pname.classList.remove('fade'); }, 200);

    let html = `<defs>
      <radialGradient id="mG" cx="35%" cy="35%" r="70%">
        <stop offset="0%" stop-color="var(--moon-ivory)" />
        <stop offset="60%" stop-color="var(--moon-gold)" />
        <stop offset="100%" stop-color="var(--moon-deep)" />
      </radialGradient>
      <clipPath id="cp"><path d="${getPath(p.illum, p.waxing, 80)}"/></clipPath>
    </defs>`;

    if (p.eclipse) {
      html += `<circle cx="100" cy="100" r="80" fill="#150808"/>`;
      html += `<radialGradient id="eG" cx="50%" cy="50%" r="50%">
                <stop offset="40%" stop-color="#3d1818" />
                <stop offset="100%" stop-color="#1a0a0a" />
              </radialGradient>`;
      html += `<circle cx="100" cy="100" r="80" fill="url(#eG)" stroke="#4d2525" stroke-width="0.5"/>`;
    } else {
      html += `<circle cx="100" cy="100" r="80" fill="#070715"/>`;
      html += `<g clip-path="url(#cp)">
                <circle cx="100" cy="100" r="80" fill="url(#mG)"/>
                <circle cx="75" cy="70" r="10" fill="#403010" opacity="0.06"/>
                <circle cx="120" cy="110" r="14" fill="#403010" opacity="0.06"/>
               </g>`;
    }
    
    const svg = document.getElementById('moon-svg');
    svg.innerHTML = html;
    svg.style.filter = p.eclipse ? 'none' : `drop-shadow(0 0 ${p.illum * 15}px rgba(226, 192, 125, 0.18))`;
    document.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('active', i === current));
  }

  function move(dir) { current = (current + dir + 6) % 6; render(); }

  const nav = document.getElementById('dots');
  phases.forEach((_, i) => {
    const d = document.createElement('div');
    d.className = 'dot';
    d.onclick = () => { current = i; render(); };
    nav.appendChild(d);
  });

  drawStars();
  render();
</script>
</body>
</html>
