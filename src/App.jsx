import { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, OAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

// ── Firebase 설정 ──
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

const PHASES = [
  {
    id:"menstruation", name:"생리기", season:"겨울", dayRange:[1,5],
    color:"#7B7FC4", soft:"#E8E9F7", border:"#C5C8E8", text:"#4A4D8A",
    description:"자궁이 리셋되는 내향의 시간. 몸이 무겁고 에너지가 낮아지는 시기예요.", keyword:"휴식과 내려놓기",
    foods:{
      eat:["시금치·소고기·굴 — 빠져나간 철분 보충에 필수","미역국·된장국 — 미네랄·전해질 보충, 자궁 회복","생강차·쑥차·계피차 — 혈액순환 도와 생리통 완화","다크 초콜릿 (카카오 70%+) — 마그네슘으로 경련 완화","두부·검은콩·렌틸콩 — 식물성 철분 + 단백질","연근·우엉 — 혈액 정화, 몸을 따뜻하게","호두·아몬드 — 오메가3로 염증 억제"],
      avoid:["커피·녹차 — 카페인이 철분 흡수 방해, 경련 악화","라면·소금 많은 음식 — 부종·복부 팽만 심해짐","알코올 — 프로스타글란딘 증가로 생리통 악화","아이스크림·냉음료 — 자궁 수축 유발, 복통 심해짐","날생선·회 — 면역 저하 시기, 식중독 위험"],
    },
    exercise:["음인 요가 (Child's Pose, 비틀기) — 골반 이완, 생리통 완화","복식호흡 명상 10–15분 — 통증 인식 낮추고 이완 유도","가벼운 스트레칭 — 허리·허벅지 안쪽 위주로","느린 산책 20–30분 — 기분 전환, 무리하지 않게"],
    tips:["온찜질(핫팩)을 아랫배에 15–20분 — 혈관 확장으로 경련 완화","수면 7–9시간 우선 확보, 낮잠도 괜찮아요","고강도 운동은 이 시기엔 쉬어가도 돼요","몸이 보내는 신호를 일기에 기록해두면 다음 달 대비 가능"],
    festivals:["아로마·향기 테라피 체험 클래스","독립서점 북페어·책 전시","온천·스파 힐링 데이","ASMR 사운드 배스 명상 이벤트","핸드 드립 커피·티 블렌딩 원데이 클래스"],
  },
  {
    id:"follicular", name:"난포기", season:"봄", dayRange:[6,13],
    color:"#5A9E78", soft:"#E4F3EB", border:"#B8DEC9", text:"#2E6B4A",
    description:"에스트로겐이 오르며 에너지가 회복되는 시기. 새로운 시작에 최적!", keyword:"성장과 새로운 시작",
    foods:{
      eat:["김치·요거트·된장 — 프로바이오틱스로 에스트로겐 대사 지원","연어·고등어·참치 — 오메가3로 호르몬 생성 원료 공급","아보카도·올리브오일 — 건강한 지방, 호르몬 균형","귀리·퀴노아·현미 — 복합탄수화물로 에너지 안정적 공급","브로콜리 새싹·케일 — DIM 성분이 에스트로겐 대사 도움","달걀 — 콜린·단백질로 뇌 기능과 근육 회복","딸기·블루베리 — 항산화로 세포 재생 지원"],
      avoid:["액상과당 음료·사탕 — 인슐린 급등으로 호르몬 교란","초가공식품·패스트푸드 — 트랜스지방이 호르몬 합성 방해","과음 — 간의 에스트로겐 분해 기능 저하"],
    },
    exercise:["달리기·조깅 30–45분 — 에너지 넘치는 이 시기 유산소 최적","근력 운동 (스쿼트·데드리프트) — 에스트로겐 덕에 근육 합성 효율 최고","수영·사이클링 — 전신 유산소, 지구력 향상","댄스·줌바 — 사교적 에너지 발산에 딱","HIIT 20–30분 — 짧고 강하게, 대사 촉진"],
    tips:["새 프로젝트·목표 설정하기 가장 좋은 시기","사교 모임·네트워킹에 에너지 적극 활용","창의적인 작업, 브레인스토밍에 집중","이 시기 운동 기록이 가장 좋게 나와요"],
    festivals:["러닝크루·5K 달리기 대회 참가","플리마켓·봄 가드닝 워크숍","새 댄스 클래스·발레핏 체험","요리 클래스·새 취미 원데이 클래스","여성 창업·커리어 네트워킹 이벤트"],
  },
  {
    id:"ovulation", name:"배란기", season:"여름", dayRange:[14,16],
    color:"#C8913A", soft:"#FBF0E0", border:"#EDD4A3", text:"#8A5E1A",
    description:"에너지와 자신감이 최고조! 가장 활발하고 빛나는 시기예요.", keyword:"표현과 연결",
    foods:{
      eat:["블루베리·라즈베리·석류 — 항산화로 난자 산화 스트레스 방어","브로콜리·콜리플라워·케일 — 과잉 에스트로겐 배출 도움","아스파라거스·시금치 — 엽산으로 세포 건강 유지","닭가슴살·두부·달걀 — 고단백으로 에너지 유지","아연 풍부 식품 (호박씨·굴) — 배란 기능 직접 지원","물 2L+ — 자궁경부 점액 분비 돕고 체온 조절"],
      avoid:["커피 3잔 이상 — 카페인 과잉이 배란 타이밍 교란 가능","알코올 — 에스트로겐 과잉 유발, 배란 억제 가능","튀긴 음식·마가린 — 트랜스지방이 배란 방해"],
    },
    exercise:["HIIT 30–40분 — 호르몬 최고조, 강도 높여도 회복 빠름","그룹 스포츠 (테니스·배구·농구) — 사교 에너지 폭발하는 시기","사이클링·달리기 인터벌 — 심폐 기능 강화","새 운동 클래스 도전 — 학습 능력도 피크, 동작 습득 빠름"],
    tips:["중요한 발표·협상·면접을 이 시기로 잡으면 유리해요","언어 능력·공감 능력 최고조, 소통이 필요한 일에 집중","자신감 있게 의사 표현하기 좋은 때","에너지 발산 위한 사회 활동 적극 계획"],
    festivals:["선셋 아웃도어 요가·명상 클래스","그룹 댄스 파티·줌바 이벤트","여성 소셜 러닝 모임","팝업 포토 스튜디오·셀프 뷰티 촬영","오픈 마이크·퍼포먼스 참여"],
  },
  {
    id:"luteal", name:"황체기", season:"가을", dayRange:[17,28],
    color:"#B5634A", soft:"#F8EDE9", border:"#E0B8AE", text:"#7A3520",
    description:"프로게스테론이 높아지며 내향적이 되는 시기. 자기 자신과 대화할 때.", keyword:"정리와 내면 탐색",
    foods:{
      eat:["다크 초콜릿·바나나·아몬드 — 마그네슘으로 PMS 경련·불안 완화","고구마·단호박·현미 — 복합탄수화물이 세로토닌 생성 촉진","닭고기·감자·피스타치오 — 비타민B6로 기분 조절 호르몬 합성","우유·치즈·두부 — 칼슘이 PMS 복부 팽만·기분 변화 완화","연어·호두·치아씨드 — 오메가3로 염증·우울감 완화","캐모마일·라벤더차 — 불안·수면 장애 완화"],
      avoid:["흰빵·과자·단 음식 — 혈당 급등 후 폭락으로 기분 급변","짠 음식·가공육 — 부종·복부 팽만 악화","커피·에너지음료 — 불안·수면 방해, PMS 증상 심화","알코올 — 세로토닌 감소로 우울감·예민함 악화"],
    },
    exercise:["필라테스 40–50분 — 코어 강화, 복부 팽만 완화, 호흡 집중","음인 요가·회복 요가 — 부교감신경 활성화, 불안 완화","가벼운 유산소 (빠른 걷기·가벼운 자전거) — 엔도르핀으로 기분 전환","자연 속 산책 30–40분 — 코르티솔 낮추고 마음 안정","스트레칭·폼롤링 — 몸이 무거울 때 긴장 해소"],
    tips:["PMS는 자연스러운 신호, 몸을 탓하지 말고 돌봐주세요","감정 일기 쓰기 — 내면 탐색의 좋은 기회","혼자만의 시간·창의적 작업에 에너지 집중","취침 1시간 전 화면 끄고 수면의 질 챙기기"],
    festivals:["캔들·소이왁스 만들기 워크숍","수채화·드로잉 원데이 클래스","명상·마음챙김 리트릿 프로그램","저널링·글쓰기 워크숍","도예·클레이 핸즈온 클래스"],
  },
];

// 난포기를 12시(0°)에서 시작
// 난포기(8일) → 배란기(3일) → 황체기(12일) → 생리기(5일)
const PA = [
  { id:"follicular",   s:0,             e:(8/28)*360  },
  { id:"ovulation",    s:(8/28)*360,    e:(11/28)*360 },
  { id:"luteal",       s:(11/28)*360,   e:(23/28)*360 },
  { id:"menstruation", s:(23/28)*360,   e:360         },
];

// ── Real-world seasonal data (Korean calendar) ──
const SEASONS = {
  spring: {
    name:"봄", emoji:"🌸", months:[3,4,5],
    color:"#5A9E78", soft:"#E4F3EB", border:"#B8DEC9",
    seasonalFoods:[
      "달래·냉이·쑥 — 봄나물은 비타민·미네랄 풍부, 입맛 돋워줘요",
      "딸기 — 비타민C 풍부, 면역력·피부 탄력",
      "두릅·아스파라거스 — 봄 새순, 항산화·해독 효과",
      "봄동·쑥갓 — 엽산·철분 풍부, 생리 후 회복에 좋아요",
      "참나물·미나리 — 혈액 정화, 간 기능 지원",
    ],
    exerciseTip:"봄은 야외 활동 시작하기 딱 좋은 계절이에요. 꽃가루 알레르기가 있다면 마스크 착용을 권해요.",
    exerciseBonus:[
      "공원 달리기·조깅 — 일교차 있으니 얇은 겉옷 챙기기",
      "자전거 라이딩 — 벚꽃 시즌엔 기분까지 좋아져요",
      "등산 — 봄 산행은 진달래·철쭉 감상하며 유산소",
      "야외 요가·스트레칭 — 잔디밭에서 몸풀기",
    ],
    wellnessFestivals:[
      "봄 힐링 요가 페스티벌 — 한강·공원 야외 요가 클래스",
      "벚꽃 러닝 대회 — 전국 벚꽃 마라톤·워킹 이벤트 (3–4월)",
      "서울 웰니스 위크 — 뷰티·헬스·마인드풀니스 복합 행사",
      "필라테스·요가 스튜디오 봄 오픈 클래스 — 각 스튜디오 무료 체험",
    ],
    festivals:[
      "벚꽃 축제 — 여의도·경주·진해, 피크닉 무드 최고",
      "봄 야외 플리마켓 — 성수·망원·한남 감성 쇼핑",
      "가든 파티 & 피크닉 팝업 — SNS 핫스팟 봄 팝업들",
      "미술관·갤러리 봄 전시 — 감성 충전하기 좋은 문화 시즌",
      "봄 와인·브런치 페스티벌 — 루프탑 팝업 레스토랑",
    ],
  },
  summer_early: { // 6-7월 장마
    name:"장마철", emoji:"🌧️", months:[6,7],
    color:"#5B7FA6", soft:"#E3EBF5", border:"#B8CCE0",
    seasonalFoods:[
      "수박·참외 — 수분 보충, 체온 조절, 이뇨 작용",
      "오이·토마토 — 수분 92%+, 열 내리고 붓기 완화",
      "삼계탕·보양식 — 복날 전후 기력 회복",
      "콩국수·냉국 — 단백질+수분 동시에",
      "매실청 음료 — 더위 먹은 데 효과적, 소화 도움",
    ],
    exerciseTip:"장마철엔 야외 운동이 어렵고 습도가 높아 컨디션 관리가 중요해요. 실내 운동으로 루틴을 유지하세요.",
    exerciseBonus:[
      "실내 수영 — 습도·더위 상관없이 전신 유산소",
      "헬스장 HIIT — 에어컨 아래서 강도 높게",
      "홈트레이닝 (유튜브 연동) — 비 오는 날 집에서",
      "실내 클라이밍 — 비 오는 날 대안 운동",
      "필라테스·요가 스튜디오 — 비 맞지 않고 운동 가능",
    ],
    wellnessFestivals:[
      "실내 명상·마인드풀니스 워크숍 — 장마철 스트레스 해소",
      "스파·찜질방 웰니스 패키지 — 습한 날씨에 몸 풀기",
      "홈 웰니스 온라인 클래스 — 유명 요가·필라테스 강사 라이브",
      "뷰티 & 셀프케어 팝업 — 여름 스킨케어 루틴 체험",
    ],
    festivals:[
      "워터 파크 & 물놀이 — 에버랜드 캐리비안베이, 오션월드",
      "인디 뮤직 페스티벌 — 비 와도 낭만있는 여름 공연",
      "여름 독서 캠프 & 북페어 — 실내에서 즐기는 문화생활",
      "카페·디저트 팝업 투어 — 장마철 실내 성지순례",
      "수제맥주 페스티벌 — 장마철 분위기 전환",
    ],
  },
  summer_late: { // 8월 폭염
    name:"한여름", emoji:"☀️", months:[8],
    color:"#C8913A", soft:"#FBF0E0", border:"#EDD4A3",
    seasonalFoods:[
      "수박·복숭아·포도 — 한여름 제철 과일, 수분+당분 보충",
      "냉면·콩국수 — 더위에 식욕 없을 때 단백질 섭취",
      "오이냉국·가스파초 — 체온 낮추고 수분 보충",
      "민어·전복 — 여름 보양 해산물, 스태미나 보충",
      "토마토 — 라이코펜이 자외선 피부 손상 방어",
    ],
    exerciseTip:"폭염 시 낮 12–4시 야외 운동은 피하세요. 이른 아침(6–8시)이나 저녁(7–9시)을 활용하거나 실내로 이동하세요.",
    exerciseBonus:[
      "이른 아침 달리기 — 해뜨기 전후 30분이 베스트",
      "수영 — 폭염에도 체온 조절하며 전신 운동",
      "야간 자전거 — 더위 식은 저녁 활용",
      "실내 볼링·배드민턴 — 가볍게 즐기는 실내 스포츠",
    ],
    wellnessFestivals:[
      "해변 요가 & 서핑 캠프 — 제주·부산·강릉 여름 웰니스",
      "야외 선셋 요가 — 한강·바닷가 저녁 요가 클래스",
      "서울 비건 페스티벌 — 여름 건강식·플랜트베이스 체험",
      "스킨케어 & 선케어 팝업 — 여름 피부 관리 루틴",
    ],
    festivals:[
      "보령 머드 축제 — 7월 말, 국내 대표 여름 축제",
      "지산·인천 뮤직 페스티벌 — 여름 야외 음악 축제",
      "해수욕장 야간 개장 & 불꽃 축제",
      "루프탑 시네마 — 야외 영화 관람 (서울 곳곳)",
      "야시장 & 푸드트럭 페스티벌 — 여름 밤 나들이",
    ],
  },
  autumn: {
    name:"가을", emoji:"🍂", months:[9,10,11],
    color:"#B5634A", soft:"#F8EDE9", border:"#E0B8AE",
    seasonalFoods:[
      "사과·배·감 — 가을 제철 과일, 식이섬유·비타민 풍부",
      "전어·꽁치·고등어 — 가을 제철 생선, 오메가3 최고치",
      "버섯 (송이·표고·새송이) — 면역력, 비타민D",
      "고구마·단호박 — 복합탄수화물+식이섬유, PMS에 좋아요",
      "밤·호두·잣 — 가을 견과류, 불포화지방산 보충",
    ],
    exerciseTip:"가을은 야외 운동 최적의 계절이에요. 일교차가 크니 워밍업을 충분히 하고, 오후 3–5시가 운동하기 가장 좋아요.",
    exerciseBonus:[
      "등산·트레킹 — 단풍 시즌, 전신 유산소+하체 강화",
      "마라톤·10km 대회 — 가을 레이스 시즌 도전해보세요",
      "야외 사이클링 — 선선한 바람에 라이딩",
      "테니스·배드민턴 — 야외 코트에서 즐기기",
    ],
    wellnessFestivals:[
      "서울 마라톤·국제 하프마라톤 — 가을 레이스 시즌 (10월)",
      "가을 힐링 트레킹 페스티벌 — 설악산·지리산 트레킹 투어",
      "한국 웰니스 엑스포 — 건강·뷰티·마인드 복합 전시",
      "야외 명상 리트릿 — 단풍 속 마음챙김 프로그램",
    ],
    festivals:[
      "단풍 명소 여행 — 내장산·설악산·남이섬 시즌",
      "와인 & 푸드 페스티벌 — 가을 수확 테마 (그랜드하얏트 등)",
      "서울 빛초롱·일루미네이션 축제 — 10–11월",
      "책 & 문화 페스티벌 — 서울국제도서전·북마켓",
      "가을 플리마켓 & 핸드메이드 페어 — 성수·한남",
    ],
  },
  winter: {
    name:"겨울", emoji:"❄️", months:[12,1,2],
    color:"#7B7FC4", soft:"#E8E9F7", border:"#C5C8E8",
    seasonalFoods:[
      "귤·한라봉 — 겨울 비타민C 대표, 면역력 강화",
      "굴·홍합 — 겨울 제철, 철분·아연·타우린 풍부",
      "시금치·배추 — 겨울 제철 채소, 엽산·철분",
      "유자차·생강차 — 몸 덥히고 감기 예방",
      "호박죽·팥죽 — 따뜻하게 속 달래는 겨울 음식",
    ],
    exerciseTip:"겨울엔 근육이 굳기 쉬워 부상 위험이 높아요. 준비운동을 평소보다 2배 길게 하고, 실내 운동 비중을 늘리세요.",
    exerciseBonus:[
      "실내 수영·아쿠아로빅 — 추위 상관없이 전신 운동",
      "헬스장 웨이트 — 추운 날 실내에서 근력 집중",
      "스키·스노보드 — 겨울 시즌 스포츠 도전",
      "핫요가 — 따뜻하게 몸 풀면서 유연성 향상",
      "실내 클라이밍·탁구 — 겨울 실내 스포츠",
    ],
    wellnessFestivals:[
      "핫요가 & 사우나 웰니스 패키지 — 겨울 몸 풀기 루틴",
      "연말 명상·마인드풀니스 리트릿 — 한 해 마무리 힐링",
      "스키장 요가·스트레칭 클래스 — 하이원·비발디파크",
      "겨울 온천·스파 페스티벌 — 이천·아산 온천 지역",
    ],
    festivals:[
      "크리스마스 마켓 — 여의도·코엑스·롯데월드 일루미네이션",
      "눈꽃 축제 — 태백산·대관령 눈축제 (1–2월)",
      "연말 카운트다운 이벤트 — 보신각·한강 불꽃",
      "겨울 팝업 카페 & 글루바인 마켓 — 크리스마스 분위기",
      "연초 새해 해맞이 — 정동진·간절곶·해운대",
    ],
  },
};

function getActualSeason() {
  const m = new Date().getMonth() + 1;
  if (m >= 3 && m <= 5) return SEASONS.spring;
  if (m === 6 || m === 7) return SEASONS.summer_early;
  if (m === 8) return SEASONS.summer_late;
  if (m >= 9 && m <= 11) return SEASONS.autumn;
  return SEASONS.winter;
}

// ── utils ──
function polar(cx, cy, r, deg) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}
function arcPath(cx, cy, R, r, s, e) {
  const o1=polar(cx,cy,R,s), o2=polar(cx,cy,R,e);
  const i1=polar(cx,cy,r,s), i2=polar(cx,cy,r,e);
  const lg = e - s > 180 ? 1 : 0;
  return `M${i1.x} ${i1.y} L${o1.x} ${o1.y} A${R} ${R} 0 ${lg} 1 ${o2.x} ${o2.y} L${i2.x} ${i2.y} A${r} ${r} 0 ${lg} 0 ${i1.x} ${i1.y}Z`;
}
function toDate(str) {
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
}
function toStr(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
function todayStr() { return toStr(new Date()); }
function daysBetween(a, b) { return Math.round((toDate(b) - toDate(a)) / 86400000); }
function shiftDays(str, n) { const d = toDate(str); d.setDate(d.getDate() + n); return toStr(d); }
function fmtKo(str) { const d = toDate(str); return `${d.getMonth()+1}월 ${d.getDate()}일`; }

function computeStats(periods) {
  if (!periods || periods.length === 0) return null;
  try {
    const sorted = [...periods]
      .filter(p => p && p.start)
      .sort((a, b) => toDate(b.start) - toDate(a.start));
    if (!sorted.length) return null;

    const today = todayStr();
    const diff = daysBetween(sorted[0].start, today);
    // 미래 날짜가 가장 최근 기록이면 → 그 다음 기록 기준으로
    const recentPast = sorted.find(p => daysBetween(p.start, today) >= 0);
    if (!recentPast) return null;

    const daysSince = daysBetween(recentPast.start, today) + 1;

    let avgCycle = 28;
    if (sorted.length >= 2) {
      const gaps = [];
      for (let i = 0; i < sorted.length - 1; i++) {
        const g = daysBetween(sorted[i + 1].start, sorted[i].start);
        if (g >= 21 && g <= 45) gaps.push(g);
      }
      if (gaps.length) avgCycle = Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length);
    }

    const durs = sorted.filter(p => p.end).map(p => daysBetween(p.start, p.end) + 1);
    const avgDuration = durs.length ? Math.round(durs.reduce((a, b) => a + b, 0) / durs.length) : 5;

    const cycleDay = ((daysSince - 1) % avgCycle) + 1;
    const CLOCK_OFFSET = (5 / 28) * 360;
    const angle = (((cycleDay - 1) / avgCycle) * 360 - CLOCK_OFFSET + 360) % 360;
    const phase = cycleDay <= 5 ? PHASES[0] : cycleDay <= 13 ? PHASES[1] : cycleDay <= 16 ? PHASES[2] : PHASES[3];

    const elapsed = Math.ceil(daysSince / avgCycle);
    const nextPeriod = shiftDays(recentPast.start, avgCycle * elapsed);
    const dToNext = daysBetween(today, nextPeriod);

    const ovulation = shiftDays(nextPeriod, -14);
    const fertileStart = shiftDays(ovulation, -5);
    const fertileEnd = shiftDays(ovulation, 1);
    const dToFertile = daysBetween(today, fertileStart);
    const inFertile = today >= fertileStart && today <= fertileEnd;

    let pPct = 3, pLabel = "매우 낮음";
    if (cycleDay >= 10 && cycleDay <= 11) { pPct = 12; pLabel = "낮음"; }
    else if (cycleDay >= 12 && cycleDay <= 13) { pPct = 20; pLabel = "보통"; }
    else if (cycleDay === 14) { pPct = 33; pLabel = "높음"; }
    else if (cycleDay >= 15 && cycleDay <= 17) { pPct = 25; pLabel = "높음"; }
    else if (cycleDay >= 18 && cycleDay <= 21) { pPct = 10; pLabel = "낮음"; }

    return {
      cycleDay, angle, phase, avgCycle, avgDuration,
      dIn: Math.max(1, cycleDay - phase.dayRange[0] + 1),
      dTotal: phase.dayRange[1] - phase.dayRange[0] + 1,
      dLeft: Math.max(0, phase.dayRange[1] - cycleDay + 1),
      nextPeriod, dToNext,
      fertileStart, fertileEnd, ovulation, dToFertile, inFertile,
      pPct, pLabel,
    };
  } catch (e) {
    console.error("computeStats error:", e);
    return null;
  }
}

const C = { bg:"#FAF8F4", card:"white", text:"#2C2420", muted:"#8A847C", border:"#E8E3DC" };

// ── Seasonal info (Korean seasons by month) ──

// ── Clock — refined arc ring + curved text labels ──
function Clock({ angle, selId, todayId, onSelect, ready, cycleDay, totalDays }) {
  const cx = 160, cy = 160;
  const R       = 97;
  const W_TRACK = 28;
  const W_ARC   = 18;
  const W_SEL   = 26;
  const ri      = 60;
  const R_LBL   = 128;
  const GAP     = 2.5; // clean gap between arcs

  const selPhase   = PHASES.find(p => p.id === selId) || PHASES.find(p => p.id === todayId);
  const todayPhase = PHASES.find(p => p.id === todayId);

  function donutArc(s, e, gap = GAP) {
    const s2 = s + gap, e2 = e - gap;
    if (e2 - s2 < 1) return "";
    const p1 = polar(cx, cy, R, s2);
    const p2 = polar(cx, cy, R, e2);
    const large = (e2 - s2) > 180 ? 1 : 0;
    return `M${p1.x} ${p1.y} A${R} ${R} 0 ${large} 1 ${p2.x} ${p2.y}`;
  }

  function textArcPath(s, e) {
    const mid = (s + e) / 2;
    const isBottom = mid > 90 && mid < 270;
    const pad = 3;
    if (!isBottom) {
      const p1 = polar(cx, cy, R_LBL, s + pad);
      const p2 = polar(cx, cy, R_LBL, e - pad);
      const large = (e - s - pad * 2) > 180 ? 1 : 0;
      return `M${p1.x} ${p1.y} A${R_LBL} ${R_LBL} 0 ${large} 1 ${p2.x} ${p2.y}`;
    } else {
      const p1 = polar(cx, cy, R_LBL, e - pad);
      const p2 = polar(cx, cy, R_LBL, s + pad);
      const large = (e - s - pad * 2) > 180 ? 1 : 0;
      return `M${p1.x} ${p1.y} A${R_LBL} ${R_LBL} 0 ${large} 0 ${p2.x} ${p2.y}`;
    }
  }

  const todayDot = angle !== null ? polar(cx, cy, R, angle) : null;

  return (
    <svg viewBox="0 0 320 320" style={{ width:"100%", display:"block" }}>
      <defs>
        {/* ① Extended filter bounds — prevents rectangular shadow clipping */}
        <filter id="clk-shadow" x="-25%" y="-25%" width="150%" height="150%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="10" result="blur"/>
          <feOffset dx="0" dy="4" result="offset"/>
          <feFlood floodColor="rgba(0,0,0,0.09)" result="color"/>
          <feComposite in="color" in2="offset" operator="in" result="shadow"/>
          <feMerge><feMergeNode in="shadow"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="arc-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="4" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="dot-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.5" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>

        {/* Text arc paths */}
        {PA.map(pa => (
          <path key={pa.id} id={`tp-${pa.id}`} d={textArcPath(pa.s, pa.e)} fill="none"/>
        ))}
      </defs>

      {/* Layer 1: Background */}
      <circle cx={cx} cy={cy} r={152} fill="white" filter="url(#clk-shadow)"/>
      <circle cx={cx} cy={cy} r={151} fill="#FAFAF8" stroke="#EEEBE4" strokeWidth="1"/>

      {/* Layer 2: Track ring */}
      <circle cx={cx} cy={cy} r={R} fill="none" stroke="#EDE9E3" strokeWidth={W_TRACK}/>

      {/* Layer 3: Phase arcs */}
      {PA.map(pa => {
        const ph    = PHASES.find(p => p.id === pa.id);
        const isSel = pa.id === selId;
        const isTod = pa.id === todayId;
        const w  = isSel ? W_SEL : W_ARC;
        const op = isSel ? 1 : isTod ? 0.88 : 0.5;
        return (
          <g key={pa.id}>
            {isSel && (
              <path d={donutArc(pa.s, pa.e)} fill="none"
                stroke={ph.color} strokeWidth={W_SEL + 8} strokeLinecap="round"
                opacity="0.14" filter="url(#arc-glow)"/>
            )}
            <path d={donutArc(pa.s, pa.e)} fill="none"
              stroke={ph.color} strokeWidth={w} strokeLinecap="round"
              opacity={op} style={{ transition:"all 0.35s", cursor:"pointer" }}
              onClick={() => onSelect(pa.id)}/>
            <path d={donutArc(pa.s, pa.e, 0)} fill="none"
              stroke="transparent" strokeWidth={W_TRACK + 16}
              style={{ cursor:"pointer" }} onClick={() => onSelect(pa.id)}/>
          </g>
        );
      })}

      {/* Layer 4: Ticks */}
      {[0, 7, 14, 21].map(day => {
        const deg = (day / 28) * 360;
        const a = polar(cx, cy, R + W_TRACK/2 + 4, deg);
        const b = polar(cx, cy, R + W_TRACK/2 + 11, deg);
        return <line key={day} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
          stroke="#B8B2AA" strokeWidth="1.5" strokeLinecap="round"/>;
      })}
      {Array.from({length:28}).map((_,i) => {
        if (i % 7 === 0) return null;
        const deg = (i / 28) * 360;
        const p = polar(cx, cy, R + W_TRACK/2 + 7, deg);
        return <circle key={i} cx={p.x} cy={p.y} r={1.2} fill="#CEC9C1"/>;
      })}

      {/* Layer 5: Today dot */}
      {todayDot && (
        <g filter="url(#dot-glow)">
          <circle cx={todayDot.x} cy={todayDot.y} r={10} fill="white"/>
          <circle cx={todayDot.x} cy={todayDot.y} r={7}
            fill={todayPhase?.color || "#999"} opacity="0.92"/>
          <circle cx={todayDot.x} cy={todayDot.y} r={3.2} fill="white"/>
        </g>
      )}

      {/* Layer 5.5: Needle — center circle covers its base */}
      {angle !== null && (
        <g style={{
          transform:`rotate(${angle}deg)`,
          transformOrigin:`${cx}px ${cy}px`,
          transition: ready ? "transform 1.5s cubic-bezier(0.34,1.56,0.64,1)" : "none",
        }}>
          {/* Needle shaft — tip stops just inside arc inner edge */}
          <line x1={cx} y1={cy} x2={cx} y2={cy - (R - 8)}
            stroke={selPhase?.color || "#B0AA9E"}
            strokeWidth="2.2" strokeLinecap="round" opacity="0.35"/>
          {/* Thin white highlight */}
          <line x1={cx} y1={cy} x2={cx} y2={cy - (R - 8)}
            stroke="white" strokeWidth="0.7" strokeLinecap="round" opacity="0.15"/>
        </g>
      )}

      {/* Layer 6: Curved text labels */}
      {PA.map(pa => {
        const ph    = PHASES.find(p => p.id === pa.id);
        const isSel = pa.id === selId;
        const isTod = pa.id === todayId;
        const op    = isSel ? 1 : isTod ? 0.88 : 0.42;
        const col   = isSel || isTod ? ph.text : C.muted;
        const fs    = pa.id === "ovulation" ? "9.5" : "11";
        return (
          <text key={pa.id} fontFamily="DM Sans,sans-serif" fontSize={fs}
            fontWeight="700" fill={col} opacity={op}
            style={{ cursor:"pointer", transition:"opacity 0.35s" }}
            onClick={() => onSelect(pa.id)}>
            <textPath href={`#tp-${pa.id}`} startOffset="50%" textAnchor="middle">
              {`${ph.name}(${ph.season})`}
            </textPath>
          </text>
        );
      })}

      {/* Layer 7 (TOP): Center text — no background circle */}
      {cycleDay != null ? (
        <>
          <text x={cx} y={cy - 15} textAnchor="middle"
            fontSize="8.5" fontWeight="600" fill={C.muted}
            fontFamily="DM Sans,sans-serif" letterSpacing="0.1em">CYCLE DAY</text>
          <text x={cx} y={cy + 17} textAnchor="middle"
            fontSize="36" fontWeight="700" fill={selPhase?.text || C.text}
            fontFamily="DM Serif Display,serif">{cycleDay}</text>
          <text x={cx} y={cy + 32} textAnchor="middle"
            fontSize="9" fill={C.muted} fontFamily="DM Sans,sans-serif">
            / {totalDays}일
          </text>
          <text x={cx} y={cy + 47} textAnchor="middle"
            fontSize="9" fill={C.muted} fontFamily="DM Sans,sans-serif" opacity="0.75">
            {new Date().toLocaleDateString("ko-KR", { month:"numeric", day:"numeric", weekday:"short" })}
          </text>
        </>
      ) : null}
    </svg>
  );
}
function MiniStat({ label, value, sub, soft, textColor }) {
  return (
    <div style={{ background:soft, borderRadius:11, padding:"11px 6px", textAlign:"center" }}>
      <div style={{ fontSize:11, color:textColor, opacity:0.65, marginBottom:4, fontWeight:500 }}>{label}</div>
      <div style={{ fontSize:22, fontWeight:700, color:textColor }}>{value}</div>
      <div style={{ fontSize:11, color:textColor, opacity:0.5 }}>{sub}</div>
    </div>
  );
}

// ── D-day row ──
function DdayRow({ stats }) {
  const pColor = stats.pPct >= 20 ? PHASES[2].color : stats.pPct >= 12 ? PHASES[1].color : PHASES[0].color;
  return (
    <div style={{ marginBottom:14 }}>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:8 }}>
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:"12px 8px", textAlign:"center", boxShadow:"0 1px 5px rgba(0,0,0,0.04)" }}>
          <div style={{ fontSize:11, color:C.muted, fontWeight:600, marginBottom:5, lineHeight:1.4 }}>다음<br/>생리까지</div>
          <div style={{ fontSize:stats.dToNext === 0 ? 14 : 24, fontWeight:700, color:C.text }}>
            {stats.dToNext === 0 ? "오늘" : `D-${stats.dToNext}`}
          </div>
          <div style={{ fontSize:11, color:C.muted, marginTop:3 }}>{fmtKo(stats.nextPeriod)}</div>
        </div>
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:"12px 8px", textAlign:"center", boxShadow:"0 1px 5px rgba(0,0,0,0.04)" }}>
          <div style={{ fontSize:11, color:C.muted, fontWeight:600, marginBottom:5, lineHeight:1.4 }}>다음<br/>가임기까지</div>
          {stats.inFertile ? (
            <div style={{ fontSize:14, fontWeight:700, color:PHASES[2].color, lineHeight:1.3 }}>가임기<br/>진행 중</div>
          ) : (
            <>
              <div style={{ fontSize:24, fontWeight:700, color:C.text }}>
                {stats.dToFertile <= 0 ? "종료" : `D-${stats.dToFertile}`}
              </div>
              <div style={{ fontSize:11, color:C.muted, marginTop:3 }}>{fmtKo(stats.fertileStart)}~</div>
            </>
          )}
        </div>
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:"12px 8px", textAlign:"center", boxShadow:"0 1px 5px rgba(0,0,0,0.04)" }}>
          <div style={{ fontSize:11, color:C.muted, fontWeight:600, marginBottom:5, lineHeight:1.4 }}>현재<br/>임신확률</div>
          <div style={{ fontSize:24, fontWeight:700, color:pColor }}>{stats.pPct}%</div>
          <div style={{ fontSize:11, marginTop:2, fontWeight:600, color:pColor }}>{stats.pLabel}</div>
          <div style={{ background:"#F0EDE8", borderRadius:3, height:3, marginTop:5, overflow:"hidden" }}>
            <div style={{ width:`${(stats.pPct / 33) * 100}%`, height:"100%", background:pColor, borderRadius:3, transition:"width 0.6s" }} />
          </div>
        </div>
      </div>
      {/* 임신 확률 면책 문구 */}
      <div style={{ display:"flex", alignItems:"flex-start", gap:6, padding:"8px 12px", background:"#F7F5F0", borderRadius:10, border:`1px solid ${C.border}` }}>
        <span style={{ fontSize:11, color:C.muted, flexShrink:0, marginTop:1 }}>⚠️</span>
        <p style={{ margin:0, fontSize:10.5, color:C.muted, lineHeight:1.65 }}>
          임신 확률 및 가임기 정보는 <strong style={{ color:C.text }}>통계적 추정치</strong>로, 개인차가 있으며 의학적 진단을 대체하지 않습니다. 임신 계획 또는 피임 목적으로 사용 시 전문 의료인과 반드시 상담하세요.
        </p>
      </div>
    </div>
  );
}

// ── Calendar view ──
function CalView({ periods, stats, setPeriods }) {
  const [calMonth, setCalMonth] = useState(new Date());
  const [modal, setModal]       = useState(null); // { ds, mode } mode: 'start'|'end'|'menu'
  const yr = calMonth.getFullYear(), mo = calMonth.getMonth();
  const firstDay = new Date(yr, mo, 1).getDay();
  const daysInMonth = new Date(yr, mo + 1, 0).getDate();
  const today = todayStr();
  const avgCycle = stats?.avgCycle || 28;

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const ms = String(mo + 1).padStart(2, "0"), ds = String(d).padStart(2, "0");
    cells.push(`${yr}-${ms}-${ds}`);
  }

  function getDayPhase(ds) {
    if (!periods.length) return null;
    const sorted = [...periods].sort((a, b) => toDate(b.start) - toDate(a.start));
    // 해당 날짜보다 이전이거나 같은 날 시작한 기록 중 가장 최근 것 기준으로 계산
    const ref = sorted.find(p => p.start <= ds);
    if (!ref) return null;
    const diff = daysBetween(ref.start, ds);
    const day = (diff % avgCycle) + 1;
    return day <= 5 ? PHASES[0] : day <= 13 ? PHASES[1] : day <= 16 ? PHASES[2] : PHASES[3];
  }
  function getPeriodForDay(ds) {
    return periods.find(p => {
      const end = p.end || shiftDays(p.start, 4);
      return ds >= p.start && ds <= end;
    });
  }
  function isInPeriod(ds) { return !!getPeriodForDay(ds); }

  // 종료일 기준 7일 이내인 기록 찾기 (종료일 수정용)
  function findNearbyPeriod(ds) {
    return periods.find(p => {
      const endDate = p.end || shiftDays(p.start, 4);
      const distEnd = Math.abs(daysBetween(endDate, ds));
      return distEnd <= 7 && ds > p.start; // 시작일 이후이고 종료일 근처
    });
  }

  function handleDayTap(ds) {
    const period = getPeriodForDay(ds);
    if (period) {
      setModal({ ds, mode: "menu", period });
      return;
    }
    const nearby = findNearbyPeriod(ds);
    if (nearby) {
      // 인근 기록 있음 → 수정 제안
      setModal({ ds, mode: "edit", period: nearby });
    } else {
      setModal({ ds, mode: "action" });
    }
  }

  // 생리 시작일로 기록
  function addStart(ds) {
    setPeriods(prev => [...prev, { id: Date.now(), start: ds, end: null }]);
    setModal(null);
  }
  // 종료일로 기록 — 가장 최근 종료일 없는 기록에 붙이기
  function addEnd(ds) {
    setPeriods(prev => {
      const open = [...prev].sort((a,b) => toDate(b.start)-toDate(a.start))
        .find(p => !p.end && p.start <= ds);
      if (!open) return [...prev, { id: Date.now(), start: ds, end: null }];
      return prev.map(p => p.id === open.id ? { ...p, end: ds } : p);
    });
    setModal(null);
  }
  // 시작일 수정
  function editStart(id, ds) {
    setPeriods(prev => prev.map(p => p.id === id ? { ...p, start: ds } : p));
    setModal(null);
  }
  // 종료일 수정
  function editEnd(id, ds) {
    setPeriods(prev => prev.map(p => p.id === id ? { ...p, end: ds } : p));
    setModal(null);
  }
  // 기록 삭제
  function deletePeriod(id) {
    setPeriods(prev => prev.filter(p => p.id !== id));
    setModal(null);
  }

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
        <button onClick={() => setCalMonth(new Date(yr, mo - 1, 1))} style={{ background:"none", border:"none", fontSize:20, color:C.muted, padding:"4px 12px" }}>‹</button>
        <div style={{ fontSize:15, fontWeight:700, color:C.text }}>{yr}년 {mo+1}월</div>
        <button onClick={() => setCalMonth(new Date(yr, mo + 1, 1))} style={{ background:"none", border:"none", fontSize:20, color:C.muted, padding:"4px 12px" }}>›</button>
      </div>

      {/* 안내 문구 */}
      <div style={{ fontSize:11, color:C.muted, marginBottom:12, textAlign:"center", background:PHASES[0].soft, borderRadius:10, padding:"7px 12px", border:`1px solid ${PHASES[0].border}` }}>
        날짜를 탭하면 생리 기록을 추가할 수 있어요
      </div>

      {/* Legend */}
      <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:14 }}>
        {PHASES.map(p => (
          <div key={p.id} style={{ display:"flex", alignItems:"center", gap:4 }}>
            <div style={{ width:12, height:12, borderRadius:3, background:p.soft, border:`1.5px solid ${p.color}` }} />
            <span style={{ fontSize:10, color:C.muted }}>{p.name}</span>
          </div>
        ))}
        <div style={{ display:"flex", alignItems:"center", gap:4 }}>
          <div style={{ width:12, height:12, borderRadius:3, background:"transparent",
            border:`1.5px dashed ${PHASES[2].color}`,
            position:"relative", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <div style={{ width:4, height:4, borderRadius:"50%", background:PHASES[2].color }} />
          </div>
          <span style={{ fontSize:10, color:C.muted }}>가임기</span>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", marginBottom:4 }}>
        {["일","월","화","수","목","금","토"].map(d => (
          <div key={d} style={{ textAlign:"center", fontSize:10, fontWeight:700, color:C.muted, padding:"4px 0" }}>{d}</div>
        ))}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:3 }}>
        {cells.map((ds, i) => {
          if (!ds) return <div key={i} />;
          const isToday = ds === today;
          const inPeriod = isInPeriod(ds);
          const ph = getDayPhase(ds);
          const inFertile = stats && ds >= stats.fertileStart && ds <= stats.fertileEnd;
          const isOvulation = stats && ds === stats.ovulation;

          let bg, borderStyle, col, extra = null;
          if (inPeriod) {
            bg = PHASES[0].soft; borderStyle = `1.5px solid ${PHASES[0].border}`; col = PHASES[0].text;
          } else if (isOvulation) {
            bg = PHASES[2].soft; borderStyle = `2px solid ${PHASES[2].color}`; col = PHASES[2].text;
            extra = <div style={{ position:"absolute", top:2, right:3, fontSize:8, color:PHASES[2].color, fontWeight:700 }}>●</div>;
          } else if (inFertile) {
            bg = "transparent"; borderStyle = `1.5px dashed ${PHASES[2].color}`; col = PHASES[2].text;
            extra = <div style={{ width:3.5, height:3.5, borderRadius:"50%", background:PHASES[2].color, position:"absolute", bottom:2 }} />;
          } else if (ph) {
            bg = ph.soft; borderStyle = `1px solid transparent`; col = ph.text;
          } else {
            bg = "transparent"; borderStyle = "1px solid transparent"; col = C.text;
          }
          if (isToday) borderStyle = `2px solid ${C.text}`;

          return (
            <div key={i}
              onClick={() => handleDayTap(ds)}
              style={{ aspectRatio:"1", display:"flex", alignItems:"center", justifyContent:"center",
                flexDirection:"column", borderRadius:7, background:bg, border:borderStyle,
                position:"relative", cursor:"pointer", WebkitTapHighlightColor:"transparent" }}>
              <span style={{ fontSize:11, fontWeight:isToday ? 700 : 400, color:col }}>
                {parseInt(ds.split("-")[2])}
              </span>
              {extra}
            </div>
          );
        })}
      </div>

      {stats && (
        <div style={{ marginTop:14, background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:"13px 15px" }}>
          <div style={{ fontWeight:700, color:C.text, marginBottom:8, fontSize:13 }}>이번 달 예측</div>
          <div style={{ display:"grid", gap:6 }}>
            {[
              { label:"다음 생리", date:stats.nextPeriod, color:PHASES[0].text, bg:PHASES[0].soft, border:PHASES[0].border, emoji:"🩸" },
              { label:"배란 예정", date:stats.ovulation, color:PHASES[2].text, bg:PHASES[2].soft, border:PHASES[2].border, emoji:"✨" },
              { label:"가임기 시작", date:stats.fertileStart, color:PHASES[2].text, bg:PHASES[2].soft, border:PHASES[2].border, emoji:"🌿" },
            ].map(s => (
              <div key={s.label} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"8px 12px", background:s.bg, borderRadius:10, border:`1px solid ${s.border}` }}>
                <span style={{ fontSize:12, color:s.color, fontWeight:600 }}>{s.emoji} {s.label}</span>
                <span style={{ fontSize:12, color:s.color, fontWeight:700 }}>{fmtKo(s.date)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* ── 날짜 탭 모달 ── */}
      {modal && (
        <div onClick={() => setModal(null)} style={{
          position:"fixed", inset:0, background:"rgba(0,0,0,0.35)",
          display:"flex", alignItems:"flex-end", zIndex:100,
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            width:"100%", background:"white", borderRadius:"20px 20px 0 0",
            padding:"20px 20px 36px", boxShadow:"0 -4px 24px rgba(0,0,0,0.12)",
          }}>
            {/* 날짜 표시 */}
            <div style={{ textAlign:"center", marginBottom:16 }}>
              <div style={{ fontSize:13, fontWeight:700, color:C.text }}>
                {fmtKo(modal.ds)} {modal.ds === today ? "· 오늘" : ""}
              </div>
            </div>

            {modal.mode === "action" && (
              <div style={{ display:"grid", gap:10 }}>
                <button onClick={() => addStart(modal.ds)} style={{
                  padding:"15px", background:PHASES[0].soft,
                  border:`1.5px solid ${PHASES[0].border}`, borderRadius:14,
                  fontSize:14, fontWeight:700, color:PHASES[0].text, cursor:"pointer",
                }}>
                  🩸 생리 시작일로 기록
                </button>
                <button onClick={() => addEnd(modal.ds)} style={{
                  padding:"15px", background:C.card,
                  border:`1.5px solid ${C.border}`, borderRadius:14,
                  fontSize:14, fontWeight:600, color:C.text, cursor:"pointer",
                }}>
                  ✓ 생리 종료일로 기록
                </button>
                <button onClick={() => setModal(null)} style={{
                  padding:"12px", background:"transparent", border:"none",
                  fontSize:13, color:C.muted, cursor:"pointer",
                }}>
                  취소
                </button>
              </div>
            )}

            {modal.mode === "edit" && modal.period && (
              <div style={{ display:"grid", gap:10 }}>
                <div style={{ padding:"12px 14px", background:"#FFF8E8", borderRadius:12, fontSize:12, color:"#8A5E1A", lineHeight:1.6 }}>
                  <strong>종료일 근처 기록이 있어요</strong><br/>
                  {fmtKo(modal.period.start)}{modal.period.end ? ` ~ ${fmtKo(modal.period.end)}` : " (종료일 미입력)"}
                </div>
                <button onClick={() => editEnd(modal.period.id, modal.ds)} style={{
                  padding:"14px", background:PHASES[0].soft,
                  border:`1.5px solid ${PHASES[0].border}`, borderRadius:14,
                  fontSize:14, fontWeight:700, color:PHASES[0].text, cursor:"pointer",
                }}>
                  ✓ 종료일을 {fmtKo(modal.ds)}로 수정
                </button>
                <button onClick={() => setModal({ ...modal, mode:"action" })} style={{
                  padding:"14px", background:C.card,
                  border:`1.5px solid ${C.border}`, borderRadius:14,
                  fontSize:13, fontWeight:600, color:C.muted, cursor:"pointer",
                }}>
                  + 새 기록으로 추가
                </button>
                <button onClick={() => setModal(null)} style={{
                  padding:"12px", background:"transparent", border:"none",
                  fontSize:13, color:C.muted, cursor:"pointer",
                }}>
                  취소
                </button>
              </div>
            )}

            {modal.mode === "menu" && modal.period && (
              <div style={{ display:"grid", gap:10 }}>
                <div style={{ padding:"12px 14px", background:PHASES[0].soft, borderRadius:12, fontSize:12, color:PHASES[0].text }}>
                  기록된 생리: {fmtKo(modal.period.start)}{modal.period.end ? ` ~ ${fmtKo(modal.period.end)}` : " (종료일 없음)"}
                </div>
                {!modal.period.end && (
                  <button onClick={() => addEnd(modal.ds)} style={{
                    padding:"14px", background:C.card,
                    border:`1.5px solid ${C.border}`, borderRadius:14,
                    fontSize:14, fontWeight:600, color:C.text, cursor:"pointer",
                  }}>
                    ✓ 이 날을 종료일로 기록
                  </button>
                )}
                <button onClick={() => deletePeriod(modal.period.id)} style={{
                  padding:"14px", background:"#FEF2F2",
                  border:"1.5px solid #FECACA", borderRadius:14,
                  fontSize:14, fontWeight:600, color:"#EF4444", cursor:"pointer",
                }}>
                  🗑 이 기록 삭제
                </button>
                <button onClick={() => setModal(null)} style={{
                  padding:"12px", background:"transparent", border:"none",
                  fontSize:13, color:C.muted, cursor:"pointer",
                }}>
                  취소
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Date Selector (overflow-safe 3-select) ──
function DateSelect({ label, value, onChange }) {
  const now = new Date();
  const [y, m, d] = value ? value.split("-").map(Number) : [now.getFullYear(), now.getMonth()+1, now.getDate()];

  const years  = Array.from({length:5}, (_,i) => now.getFullYear()-2+i);
  const months = Array.from({length:12}, (_,i) => i+1);
  const daysInMonth = new Date(y||now.getFullYear(), (m||1), 0).getDate();
  const days = Array.from({length: daysInMonth}, (_,i) => i+1);

  const selSt = {
    flex:1, minWidth:0, background:C.card,
    border:`1px solid ${C.border}`, borderRadius:8,
    color:C.text, padding:"9px 6px", fontSize:13,
    outline:"none", fontFamily:"DM Sans,sans-serif",
    appearance:"none", textAlign:"center",
  };

  function update(ny, nm, nd) {
    const yy = String(ny).padStart(4,"0");
    const mm = String(nm).padStart(2,"0");
    const dd = String(nd).padStart(2,"0");
    onChange(`${yy}-${mm}-${dd}`);
  }

  return (
    <div>
      <div style={{fontSize:11,color:C.muted,marginBottom:5,fontWeight:500}}>{label}</div>
      <div style={{display:"flex",gap:5}}>
        <select value={y||now.getFullYear()} onChange={e=>update(+e.target.value,m||1,d||1)} style={selSt}>
          {years.map(yr=><option key={yr} value={yr}>{yr}년</option>)}
        </select>
        <select value={m||1} onChange={e=>update(y||now.getFullYear(),+e.target.value,d||1)} style={selSt}>
          {months.map(mo=><option key={mo} value={mo}>{mo}월</option>)}
        </select>
        <select value={d||1} onChange={e=>update(y||now.getFullYear(),m||1,+e.target.value)} style={selSt}>
          {days.map(dy=><option key={dy} value={dy}>{dy}일</option>)}
        </select>
      </div>
    </div>
  );
}

// ── Record view ──
function RecordView({ periods, setPeriods }) {
  const [ns, setNs] = useState("");
  const [ne, setNe] = useState("");

  const now = new Date();
  const todayVal = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`;

  function doAdd() {
    if (!ns) return;
    setPeriods(prev => [...prev, { id: Date.now(), start: ns, end: ne || null }]);
    setNs(""); setNe("");
  }

  const sorted = [...periods].sort((a, b) => toDate(b.start) - toDate(a.start));

  return (
    <div>
      <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:20, padding:"18px", marginBottom:20, boxShadow:"0 1px 8px rgba(0,0,0,0.04)" }}>
        <div style={{ fontSize:14, fontWeight:700, marginBottom:13, color:C.text }}>생리 기록 추가</div>
        <div style={{ display:"grid", gap:12 }}>
          <DateSelect label="시작일 *" value={ns || todayVal} onChange={setNs} />
          <DateSelect label="종료일 (선택)" value={ne || todayVal} onChange={setNe} />
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={doAdd} style={{ flex:1, padding:"12px", background:C.text, border:"none", borderRadius:12, color:"white", fontSize:13, fontWeight:700 }}>
              기록 추가하기
            </button>
            {ne && (
              <button onClick={() => setNe("")} style={{ padding:"12px 14px", background:"transparent", border:`1px solid ${C.border}`, borderRadius:12, color:C.muted, fontSize:12 }}>
                종료일 없음
              </button>
            )}
          </div>
        </div>
      </div>

      {sorted.length > 0 && (
        <>
          <div style={{ fontSize:10, color:C.muted, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:9, fontWeight:600 }}>
            기록 내역 ({sorted.length}건)
          </div>
          <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, overflow:"hidden", boxShadow:"0 1px 6px rgba(0,0,0,0.04)" }}>
            <div style={{ display:"grid", gridTemplateColumns:"2fr 2fr 1fr 1fr 28px", padding:"9px 14px", borderBottom:`1px solid ${C.border}`, background:"#FAFAF8" }}>
              {["시작일","종료일","기간","주기",""].map((h, i) => (
                <div key={i} style={{ fontSize:10, fontWeight:700, color:C.muted }}>{h}</div>
              ))}
            </div>
            {sorted.map((p, i) => {
              const prev = sorted[i + 1];
              const dur = p.end ? daysBetween(p.start, p.end) + 1 : null;
              const cyc = prev ? daysBetween(prev.start, p.start) : null;
              return (
                <div key={p.id} style={{ display:"grid", gridTemplateColumns:"2fr 2fr 1fr 1fr 28px", alignItems:"center", padding:"10px 14px", borderBottom: i < sorted.length - 1 ? `1px solid ${C.border}` : "none", background: i === 0 ? "#FEFDF9" : "white" }}>
                  <div style={{ fontSize:12, fontWeight: i === 0 ? 700 : 400, color:C.text }}>{fmtKo(p.start)}</div>
                  <div style={{ fontSize:12, color:C.text }}>{p.end ? fmtKo(p.end) : "-"}</div>
                  <div style={{ fontSize:12, color:C.text }}>{dur ? `${dur}일` : "-"}</div>
                  <div style={{ fontSize:12, color: cyc ? C.text : C.muted }}>{cyc ? `${cyc}일` : "-"}</div>
                  <button onClick={() => setPeriods(prev => prev.filter(x => x.id !== p.id))} style={{ background:"#FEF2F2", border:"1px solid #FECACA", borderRadius:6, color:"#EF4444", padding:"3px 5px", fontSize:11, lineHeight:1 }}>✕</button>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// 광고 컴포넌트
//
// 웹 (GitHub Pages):
//   1. Kakao AdFit — https://adfit.kakao.com
//      AD_UNIT_ID 를 AdFit에서 발급받은 단위 ID로 교체
//   2. Google AdSense — AD_CLIENT / AD_SLOT 교체
//
// 앱 (Capacitor):
//   npm i @capacitor-community/admob
//   admob.showBanner({ adId: "ca-app-pub-xxx/xxx" })
//   아래 AdBanner 컴포넌트를 AdMob 호출로 교체
// ─────────────────────────────────────────────────────────────────

// ▼ 발급받은 값으로 교체하세요
const AD_PROVIDER  = "kakao";          // "kakao" | "adsense" | "admob" | "none"
const KAKAO_AD_ID  = "";               // Kakao AdFit 광고 단위 ID
const ADSENSE_CLIENT = "";             // "ca-pub-XXXXXXXXXXXXXXXX"
const ADSENSE_SLOT   = "";             // "XXXXXXXXXX"

function AdBanner({ type = "banner" }) {
  const isConfigured = (AD_PROVIDER === "kakao" && KAKAO_AD_ID) ||
                       (AD_PROVIDER === "adsense" && ADSENSE_CLIENT && ADSENSE_SLOT);

  useEffect(() => {
    if (!isConfigured) return;
    if (AD_PROVIDER === "adsense") {
      try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch(e) {}
    }
    if (AD_PROVIDER === "kakao" && window.kakaoAdfit) {
      window.kakaoAdfit.load();
    }
  }, []);

  // ── 실제 광고 (배포 후) ──────────────────────────────
  if (isConfigured && AD_PROVIDER === "adsense") {
    return (
      <ins className="adsbygoogle"
        style={{ display:"block", height: type==="banner" ? 50 : 250 }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={ADSENSE_SLOT}
        data-ad-format={type === "banner" ? "auto" : "rectangle"}
        data-full-width-responsive="true"/>
    );
  }
  if (isConfigured && AD_PROVIDER === "kakao") {
    return (
      <ins className="kakao_ad_area"
        style={{ display:"block" }}
        data-ad-unit={KAKAO_AD_ID}
        data-ad-width={type === "banner" ? "320" : "300"}
        data-ad-height={type === "banner" ? "50" : "250"}/>
    );
  }

  // ── 프리뷰 플레이스홀더 ──────────────────────────────
  const h = type === "banner" ? 50 : 250;
  const label = type === "banner"
    ? "배너 광고 (320×50)"
    : "직사각형 광고 (300×250)";

  return (
    <div style={{
      height: h,
      background:"#F7F5F0",
      border:"1.5px dashed #D4CFC6",
      borderRadius: type === "banner" ? 0 : 14,
      display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center", gap:4,
    }}>
      <div style={{ fontSize:10, color:"#B0AA9E", fontWeight:600, letterSpacing:"0.05em" }}>
        AD
      </div>
      <div style={{ fontSize:10, color:"#C4BFB8" }}>{label}</div>
      <div style={{ fontSize:9, color:"#D4CFC6" }}>
        Kakao AdFit · AdSense · AdMob
      </div>
    </div>
  );
}

// ── Login Screen ──
function LoginScreen({ onLogin }) {
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState(null);

  async function handleGoogle() {
    setLoading(true); setError(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (e) {
      setError("로그인에 실패했어요. 다시 시도해주세요.");
      setLoading(false);
    }
  }

  async function handleApple() {
    setLoading(true); setError(null);
    try {
      const provider = new OAuthProvider("apple.com");
      provider.addScope("email");
      provider.addScope("name");
      provider.setCustomParameters({ locale: "ko_KR" });
      await signInWithPopup(auth, provider);
    } catch (e) {
      setError("Apple 로그인에 실패했어요. 다시 시도해주세요.");
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight:"100vh", background:C.bg, fontFamily:"DM Sans,sans-serif",
      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
      padding:"32px 28px" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap');*{box-sizing:border-box;margin:0;padding:0}`}</style>

      {/* Logo */}
      <div style={{ textAlign:"center", marginBottom:48 }}>
        <div style={{ fontSize:11, color:C.muted, letterSpacing:"0.16em", textTransform:"uppercase", fontWeight:600, marginBottom:8 }}>
          나에게로 돌아오는 시간
        </div>
        <div style={{ fontSize:42, fontFamily:"DM Serif Display,serif", color:C.text, lineHeight:1 }}>Me:ll</div>
        <div style={{ width:32, height:2, background:PHASES[1].color, borderRadius:2, margin:"16px auto 0" }}/>
      </div>

      {/* Description */}
      <div style={{ textAlign:"center", marginBottom:40, maxWidth:280 }}>
        <p style={{ fontSize:14, color:C.muted, lineHeight:1.8 }}>
          나의 사이클 데이터를 안전하게 보관하고<br/>
          어느 기기에서든 이어서 사용할 수 있어요.
        </p>
      </div>

      {/* Google Login */}
      <button onClick={handleGoogle} disabled={loading} style={{
        width:"100%", maxWidth:320, padding:"15px 20px",
        background:"white", border:`1.5px solid ${C.border}`,
        borderRadius:14, cursor:loading ? "default" : "pointer",
        display:"flex", alignItems:"center", justifyContent:"center", gap:12,
        boxShadow:"0 2px 12px rgba(0,0,0,0.07)", transition:"all 0.2s",
        opacity: loading ? 0.7 : 1,
      }}>
        <svg width="20" height="20" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        <span style={{ fontSize:15, fontWeight:600, color:C.text }}>
          {loading ? "로그인 중..." : "Google로 시작하기"}
        </span>
      </button>

      {/* Apple Login */}
      <button onClick={handleApple} disabled={loading} style={{
        width:"100%", maxWidth:320, padding:"15px 20px", marginTop:10,
        background:"black", border:"1.5px solid black",
        borderRadius:14, cursor:loading ? "default" : "pointer",
        display:"flex", alignItems:"center", justifyContent:"center", gap:12,
        boxShadow:"0 2px 12px rgba(0,0,0,0.15)", transition:"all 0.2s",
        opacity: loading ? 0.7 : 1,
      }}>
        {/* Apple icon */}
        <svg width="18" height="20" viewBox="0 0 814 1000" fill="white">
          <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-37.5-155.5-127.4C46 790.7 0 663.2 0 541.8c0-207.3 135.3-316.9 268.9-316.9 71 0 130.3 46.6 174.7 46.6 42.8 0 109.3-49.4 188.3-49.4 30.3 0 130.3 2.6 198.3 99.2zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z"/>
        </svg>
        <span style={{ fontSize:15, fontWeight:600, color:"white" }}>
          {loading ? "로그인 중..." : "Apple로 시작하기"}
        </span>
      </button>

      {error && (
        <p style={{ marginTop:14, fontSize:12, color:"#EF4444", textAlign:"center" }}>{error}</p>
      )}

      <p style={{ marginTop:28, fontSize:11, color:C.muted, textAlign:"center", lineHeight:1.7, maxWidth:280 }}>
        로그인하면 생리 기록이 안전하게 클라우드에 저장돼요.<br/>
        이름·이메일 외 개인정보는 수집하지 않아요.
      </p>
    </div>
  );
}

// ── Toggle Switch ──
function Toggle({ on, onChange }) {
  return (
    <div onClick={() => onChange(!on)} style={{
      width:44, height:24, borderRadius:12, flexShrink:0, cursor:"pointer",
      background: on ? PHASES[1].color : "#D4CFC6",
      position:"relative", transition:"background 0.2s",
    }}>
      <div style={{
        position:"absolute", top:3, left: on ? 22 : 3,
        width:18, height:18, borderRadius:"50%", background:"white",
        boxShadow:"0 1px 4px rgba(0,0,0,0.15)",
        transition:"left 0.2s",
      }}/>
    </div>
  );
}

// ── Notification logic ──
const NOTIF_KEY = "cycle-notif-prefs-v1";

function loadNotifPrefs() {
  try {
    const raw = localStorage.getItem(NOTIF_KEY);
    return raw ? JSON.parse(raw) : {
      period3: true, period1: true,
      fertile: true, ovulation: true,
      phaseChange: true, dailyTip: false,
      hour: 8,
    };
  } catch { return { period3:true, period1:true, fertile:true, ovulation:true, phaseChange:false, dailyTip:false, hour:8 }; }
}

function buildSchedule(stats, prefs) {
  if (!stats) return [];
  const items = [];
  const today = todayStr();

  if (prefs.period3 && stats.dToNext === 3)
    items.push({ label:"생리 예정 3일 전", desc:`${fmtKo(stats.nextPeriod)} 생리 시작 예정이에요`, urgent:false });
  if (prefs.period1 && stats.dToNext === 1)
    items.push({ label:"생리 예정 내일!", desc:"내일 생리가 시작될 예정이에요", urgent:true });
  if (prefs.fertile && stats.dToFertile === 0 && !stats.inFertile)
    items.push({ label:"가임기 시작", desc:"오늘부터 가임기가 시작돼요", urgent:false });
  if (prefs.ovulation && today === stats.ovulation)
    items.push({ label:"배란 예정일", desc:"오늘이 배란 예정일이에요", urgent:false });
  if (prefs.phaseChange && stats.dIn === 1)
    items.push({ label:`${stats.phase.name} 시작`, desc:`오늘부터 ${stats.phase.name}이에요 — ${stats.phase.keyword}`, urgent:false });
  if (prefs.dailyTip && stats.phase)
    items.push({ label:"오늘의 팁", desc:stats.phase.tips[0], urgent:false });

  return items;
}

async function requestAndNotify(title, body) {
  if (!("Notification" in window)) {
    alert("이 브라우저는 알림을 지원하지 않아요");
    return;
  }
  let perm = Notification.permission;
  if (perm === "default") perm = await Notification.requestPermission();
  if (perm === "granted") {
    new Notification(title, { body, icon: "/favicon.ico" });
  } else {
    alert("알림 권한이 거부됐어요. 브라우저 설정에서 허용해주세요.");
  }
}

// ── My page ──
function MyPage({ stats, periods, user }) {
  const [prefs, setPrefs] = useState(loadNotifPrefs);
  const [notifPerm, setNotifPerm] = useState(
    typeof Notification !== "undefined" ? Notification.permission : "unsupported"
  );

  useEffect(() => {
    try { localStorage.setItem(NOTIF_KEY, JSON.stringify(prefs)); } catch {}
  }, [prefs]);

  function set(key, val) { setPrefs(p => ({ ...p, [key]: val })); }

  const schedule = buildSchedule(stats, prefs);

  const NOTIF_ITEMS = [
    { key:"period3",    label:"생리 예정 D-3",     desc:"생리 3일 전 미리 알림" },
    { key:"period1",    label:"생리 예정 D-1",     desc:"생리 하루 전 알림" },
    { key:"fertile",    label:"가임기 시작",         desc:"가임기 첫날 알림" },
    { key:"ovulation",  label:"배란 예정일",         desc:"배란 예상 당일 알림" },
    { key:"phaseChange",label:"시기 변경",           desc:"새 시기 시작일 알림" },
    { key:"dailyTip",   label:"오늘의 팁",           desc:"현재 시기 맞춤 조언" },
  ];

  return (
    <div>

      {/* 계정 정보 */}
      {user && (
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:"14px 16px", marginBottom:20, display:"flex", alignItems:"center", justifyContent:"space-between", boxShadow:"0 1px 5px rgba(0,0,0,0.04)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            {user.photoURL && (
              <img src={user.photoURL} alt="" style={{ width:38, height:38, borderRadius:"50%", border:`1.5px solid ${C.border}` }}/>
            )}
            <div>
              <div style={{ fontSize:13, fontWeight:700, color:C.text }}>{user.displayName || "사용자"}</div>
              <div style={{ fontSize:11, color:C.muted }}>{user.email}</div>
            </div>
          </div>
          <button onClick={() => signOut(auth)} style={{
            padding:"7px 14px", background:"transparent",
            border:`1px solid ${C.border}`, borderRadius:100,
            fontSize:12, color:C.muted, cursor:"pointer",
          }}>로그아웃</button>
        </div>
      )}

      {/* Stats */}
      <div style={{ fontSize:14, fontWeight:700, marginBottom:12, color:C.text }}>나의 통계</div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:22 }}>
        {[
          { l:"평균 생리 주기", v: stats ? `${stats.avgCycle}일` : "-", sub:"기록 기반", ph:PHASES[1] },
          { l:"평균 생리 기간", v: stats ? `${stats.avgDuration}일` : "-", sub:"종료일 기반", ph:PHASES[0] },
          { l:"총 기록 횟수",   v:`${periods.length}회`,                   sub:"누적",       ph:PHASES[3] },
          { l:"이번 사이클",   v: stats ? `${stats.cycleDay}일차` : "-", sub:`/ ${stats?.avgCycle||28}일`, ph:PHASES[2] },
        ].map(s => (
          <div key={s.l} style={{ background:s.ph.soft, borderRadius:16, padding:"15px 13px", border:`1px solid ${s.ph.border}` }}>
            <div style={{ fontSize:10, color:C.muted, marginBottom:7 }}>{s.l}</div>
            <div style={{ fontSize:26, fontWeight:700, color:s.ph.color, lineHeight:1 }}>{s.v}</div>
            <div style={{ fontSize:10, color:C.muted, marginTop:5 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Notification Settings */}
      <div style={{ fontSize:14, fontWeight:700, marginBottom:12, color:C.text }}>알림 설정</div>
      <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, overflow:"hidden", marginBottom:12, boxShadow:"0 1px 6px rgba(0,0,0,0.04)" }}>

        {/* Permission banner */}
        {notifPerm !== "granted" && (
          <div style={{ padding:"13px 16px", background: notifPerm==="denied"?"#FEF2F2":PHASES[1].soft, borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"space-between", gap:10 }}>
            <div style={{ fontSize:12, color: notifPerm==="denied"?"#EF4444":PHASES[1].text, lineHeight:1.5 }}>
              {notifPerm==="denied"
                ? "알림이 차단됐어요. 브라우저 설정에서 허용해주세요."
                : "알림을 받으려면 권한이 필요해요"}
            </div>
            {notifPerm !== "denied" && (
              <button onClick={async () => {
                const p = await Notification.requestPermission();
                setNotifPerm(p);
              }} style={{ flexShrink:0, padding:"6px 14px", background:PHASES[1].color, border:"none", borderRadius:100, color:"white", fontSize:12, fontWeight:700 }}>
                허용하기
              </button>
            )}
          </div>
        )}

        {/* Time setting */}
        <div style={{ padding:"14px 16px", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <div style={{ fontSize:13, fontWeight:600, color:C.text, marginBottom:2 }}>알림 시간</div>
            <div style={{ fontSize:11, color:C.muted }}>매일 이 시간에 알림을 보내요</div>
          </div>
          <select value={prefs.hour} onChange={e => set("hour", +e.target.value)} style={{
            background:C.bg, border:`1px solid ${C.border}`, borderRadius:8,
            color:C.text, padding:"7px 10px", fontSize:13, outline:"none",
            fontFamily:"DM Sans,sans-serif",
          }}>
            {[6,7,8,9,10,11,12,13,18,19,20,21,22].map(h => (
              <option key={h} value={h}>{h < 12 ? `오전 ${h}시` : h === 12 ? "오후 12시" : `오후 ${h-12}시`}</option>
            ))}
          </select>
        </div>

        {/* Toggle list */}
        {NOTIF_ITEMS.map((item, i) => (
          <div key={item.key} style={{ padding:"13px 16px", borderBottom: i < NOTIF_ITEMS.length-1 ? `1px solid ${C.border}` : "none", display:"flex", alignItems:"center", justifyContent:"space-between", gap:12 }}>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13, fontWeight:600, color:C.text, marginBottom:1 }}>{item.label}</div>
              <div style={{ fontSize:11, color:C.muted }}>{item.desc}</div>
            </div>
            <Toggle on={prefs[item.key]} onChange={v => set(item.key, v)} />
          </div>
        ))}
      </div>

      {/* Today's scheduled notifications */}
      {schedule.length > 0 && (
        <div style={{ background:PHASES[1].soft, border:`1px solid ${PHASES[1].border}`, borderRadius:14, padding:"14px 16px", marginBottom:14 }}>
          <div style={{ fontSize:12, fontWeight:700, color:PHASES[1].text, marginBottom:8 }}>오늘 예정된 알림</div>
          {schedule.map((s, i) => (
            <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:8, marginBottom: i < schedule.length-1 ? 8 : 0 }}>
              <div style={{ width:6, height:6, borderRadius:"50%", background:PHASES[1].color, marginTop:5, flexShrink:0 }} />
              <div>
                <div style={{ fontSize:12, fontWeight:600, color:PHASES[1].text }}>{s.label}</div>
                <div style={{ fontSize:11, color:C.muted }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Test button */}
      <button onClick={() => requestAndNotify("🌸 Me:ll", stats ? `오늘은 ${stats.phase.name} ${stats.cycleDay}일차예요 — ${stats.phase.keyword}` : "생리 기록을 추가해보세요!")} style={{
        width:"100%", padding:"13px", marginBottom:20,
        background:"white", border:`1.5px solid ${C.border}`,
        borderRadius:14, color:C.text, fontSize:13, fontWeight:600,
        boxShadow:"0 1px 4px rgba(0,0,0,0.05)",
      }}>
        테스트 알림 보내기
      </button>

      {/* Capacitor note */}
      <div style={{ background:"#F0F4FF", border:"1px solid #C5CEF0", borderRadius:14, padding:"14px 16px", marginBottom:20 }}>
        <div style={{ fontSize:12, fontWeight:700, color:"#4A5DB5", marginBottom:5 }}>앱 버전 알림</div>
        <div style={{ fontSize:11.5, color:"#6674C0", lineHeight:1.7 }}>
          Capacitor 앱으로 출시하면 <strong>Local Notifications</strong>으로 전환돼요. 서버·Firebase 없이 기기에서 직접 스케줄링되고, 앱이 꺼져 있어도 알림이 와요.
        </div>
      </div>

      {/* Phase reference */}
      <div style={{ fontSize:13, fontWeight:700, marginBottom:10, color:C.text }}>시기별 특징</div>
      <div style={{ display:"grid", gap:8 }}>
        {PHASES.map(p => (
          <div key={p.id} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:"13px 15px", boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
            <div style={{ display:"flex", alignItems:"center", gap:9, marginBottom:5 }}>
              <div style={{ width:32, height:32, borderRadius:"50%", background:p.soft, border:`2px solid ${p.border}`, flexShrink:0 }} />
              <div>
                <span style={{ fontSize:13, fontWeight:700, color:p.text }}>{p.name}</span>
                <span style={{ fontSize:11, color:C.muted, marginLeft:6 }}>· {p.season} · Day {p.dayRange[0]}–{p.dayRange[1]}</span>
              </div>
            </div>
            <div style={{ fontSize:12, color:C.muted, lineHeight:1.7 }}>{p.description}</div>
          </div>
        ))}
      </div>

      {/* 정보 출처 */}
      <div style={{ marginTop:24, background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:"16px 18px", boxShadow:"0 1px 5px rgba(0,0,0,0.04)" }}>
        <div style={{ fontSize:12, fontWeight:700, color:C.text, marginBottom:12 }}>정보 출처</div>
        <div style={{ display:"grid", gap:10 }}>
          {[
            { label:"사이클 4계절 개념", src:"Alissa Vitti의 연구(WomanCode · In the FLO)에서 영감을 받아 독자적으로 재구성" },
            { label:"호르몬·시기별 특성", src:"대한산부인과학회 생리주기 가이드라인" },
            { label:"영양 & 운동 권고", src:"한국영양학회 · ACSM 운동 가이드라인" },
            { label:"임신 확률 추정", src:"Wilcox et al. (2000), NEJM — 배란 주기 기반 통계" },
          ].map((s, i) => (
            <div key={i} style={{ display:"flex", gap:8 }}>
              <div style={{ width:3, height:3, borderRadius:"50%", background:C.muted, flexShrink:0, marginTop:6 }}/>
              <div>
                <div style={{ fontSize:11.5, fontWeight:600, color:C.text }}>{s.label}</div>
                <div style={{ fontSize:10.5, color:C.muted, lineHeight:1.55 }}>{s.src}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 종합 면책 고지 */}
      <div style={{ marginTop:12, marginBottom:8, padding:"14px 16px", background:"#F7F5F0", borderRadius:14, border:`1px solid ${C.border}` }}>
        <div style={{ fontSize:11, fontWeight:700, color:C.text, marginBottom:7 }}>⚠️ 이용 안내 및 면책 고지</div>
        <p style={{ margin:0, fontSize:10.5, color:C.muted, lineHeight:1.75 }}>
          본 앱이 제공하는 생리 예측, 가임기, 임신 확률 및 건강 정보는 <strong style={{ color:C.text }}>일반적인 통계와 참고 자료</strong>에 기반하며, 개인의 건강 상태·체질·호르몬 수치에 따라 실제와 다를 수 있습니다.{"\n\n"}
          본 정보는 <strong style={{ color:C.text }}>의학적 진단, 치료 또는 처방을 대체하지 않습니다.</strong> 임신 계획, 피임, 건강 이상 증상 등에 대해서는 반드시 산부인과 전문의와 상담하시기 바랍니다.{"\n\n"}
          앱 개발자는 본 정보의 사용으로 인한 결과에 대해 법적 책임을 지지 않습니다.
        </p>
      </div>

      {/* 앱 버전 */}
      <div style={{ textAlign:"center", padding:"12px 0 4px" }}>
        <div style={{ fontSize:10, color:"#C4BFB8" }}>v1.0.0 · Me:ll</div>
        <div style={{ fontSize:9.5, color:"#D4CFC6", marginTop:2 }}>© 2026 hhappyfamilydais · All rights reserved</div>
      </div>
    </div>
  );
}
export default function App() {
  const [user, setUser]       = useState(undefined); // undefined=loading, null=로그아웃
  const [periods, setPeriods] = useState([]);
  const [loaded, setLoaded]   = useState(false);
  const [tab, setTab]         = useState("dash");
  const [sec, setSec]         = useState("tips");
  const [selId, setSelId]     = useState(null);
  const [ready, setReady]     = useState(false);

  // Embed mode
  const isEmbed = typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("embed") === "true";
  const APP_URL = typeof window !== "undefined"
    ? window.location.href.replace(/[?#].*$/, "")
    : "";

  // ── Auth 상태 감지 ──
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => setUser(u ?? null));
    return unsub;
  }, []);

  // ── 로그인 후 Firestore에서 데이터 불러오기 ──
  useEffect(() => {
    if (!user) { setLoaded(false); setPeriods([]); return; }
    (async () => {
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
          const data = snap.data().periods;
          if (Array.isArray(data)) setPeriods(data);
        }
      } catch (e) { console.error(e); }
      setLoaded(true);
      setTimeout(() => setReady(true), 400);
    })();
  }, [user]);

  // ── 데이터 변경 시 Firestore에 저장 ──
  useEffect(() => {
    if (!user || !loaded) return;
    setDoc(doc(db, "users", user.uid), { periods }, { merge: true })
      .catch(e => console.error(e));
  }, [periods, loaded, user]);

  const stats = computeStats(periods);
  const isToday = selId === null;
  const dp = isToday ? stats?.phase : PHASES.find(p => p.id === selId);

  function togglePhase(id) { setSelId(prev => prev === id ? null : id); setSec("tips"); }
  function backToday() { setSelId(null); setSec("tips"); }

  const seasonInfo = getActualSeason();

  const SECS = {
    tips:     { l1:"유의",  l2:"사항",   data: dp?.tips },
    eat:      { l1:"먹어야",l2:"할 것",  data: dp?.foods?.eat },
    avoid:    { l1:"피해야",l2:"할 것",  data: dp?.foods?.avoid },
    exercise: { l1:"추천",  l2:"운동",   data: dp?.exercise },
  };

  const todayFmt = new Date().toLocaleDateString("ko-KR", { year:"numeric", month:"long", day:"numeric", weekday:"long" });

  // ── 인증 로딩 중 ──
  if (user === undefined) {
    return (
      <div style={{ minHeight:"100vh", background:C.bg, display:"flex", alignItems:"center", justifyContent:"center" }}>
        <div style={{ fontSize:13, color:C.muted }}>불러오는 중...</div>
      </div>
    );
  }

  // ── 로그인 필요 (임베드 모드 제외) ──
  if (!user && !isEmbed) return <LoginScreen />;

  // ── EMBED MODE ──────────────────────────────────────────────
  if (isEmbed) {
    const dp = stats?.phase;
    return (
      <div
        onClick={() => window.open(APP_URL, "_blank")}
        style={{
          background: C.bg, fontFamily:"DM Sans,sans-serif",
          cursor:"pointer", userSelect:"none",
          minHeight:"100vh", padding:"0 0 16px",
          position:"relative",
        }}
      >
        <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap');*{box-sizing:border-box;margin:0;padding:0}`}</style>

        {/* Mini header */}
        <div style={{ background:"white", borderBottom:`1px solid ${C.border}`, padding:"14px 18px 10px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <div style={{ fontSize:9, color:C.muted, letterSpacing:"0.12em", textTransform:"uppercase", fontWeight:600 }}>나에게로 돌아오는 시간</div>
            <div style={{ fontSize:17, fontFamily:"DM Serif Display,serif", color:C.text, lineHeight:1.2 }}>Me:ll</div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:5, background:C.bg, border:`1px solid ${C.border}`, borderRadius:100, padding:"5px 11px" }}>
            <span style={{ fontSize:10, fontWeight:700, color:C.muted }}>앱 열기</span>
            <span style={{ fontSize:11, color:C.muted }}>↗</span>
          </div>
        </div>

        <div style={{ padding:"12px 18px 0" }}>
          {!loaded || !stats ? (
            <div style={{ textAlign:"center", padding:"40px 0", color:C.muted, fontSize:13 }}>
              {loaded ? "Me:ll 앱에서 생리 기록을 추가하세요" : "불러오는 중..."}
            </div>
          ) : (
            <>
              {/* Clock */}
              <Clock
                angle={stats.angle} selId={dp?.id} todayId={dp?.id}
                onSelect={() => {}} ready={ready}
                cycleDay={stats.cycleDay} totalDays={stats.avgCycle}
              />

              {/* Phase badge */}
              {dp && (
                <div style={{ background:dp.soft, border:`1px solid ${dp.border}`, borderRadius:16, padding:"13px 16px", margin:"10px 0 10px" }}>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                    <div>
                      <div style={{ fontSize:9.5, color:dp.text, background:"rgba(255,255,255,0.6)", display:"inline-block", padding:"2px 8px", borderRadius:100, fontWeight:600, marginBottom:5 }}>현재 시기</div>
                      <div style={{ fontSize:20, fontFamily:"DM Serif Display,serif", color:dp.text }}>{dp.name}</div>
                      <div style={{ fontSize:11, color:dp.color, fontWeight:600 }}>{dp.season} · {dp.keyword}</div>
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <div style={{ fontSize:10, color:dp.text, opacity:0.6, marginBottom:2 }}>사이클</div>
                      <div style={{ fontSize:22, fontWeight:700, color:dp.text, lineHeight:1 }}>{stats.cycleDay}일차</div>
                      <div style={{ fontSize:10, color:dp.text, opacity:0.5 }}>/ {stats.avgCycle}일</div>
                    </div>
                  </div>
                  <div style={{ fontSize:11.5, color:dp.text, opacity:0.75, marginTop:8, lineHeight:1.6 }}>{dp.description}</div>
                </div>
              )}

              {/* D-day row (mini) */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:7, marginBottom:14 }}>
                {[
                  { l:"다음 생리", v: stats.dToNext === 0 ? "오늘" : `D-${stats.dToNext}`, s: fmtKo(stats.nextPeriod) },
                  { l:"가임기", v: stats.inFertile ? "진행 중" : (stats.dToFertile <= 0 ? "종료" : `D-${stats.dToFertile}`), s: stats.inFertile ? "지금" : fmtKo(stats.fertileStart) },
                  { l:"임신 확률", v:`${stats.pPct}%`, s: stats.pLabel },
                ].map(s => (
                  <div key={s.l} style={{ background:"white", border:`1px solid ${C.border}`, borderRadius:12, padding:"10px 6px", textAlign:"center" }}>
                    <div style={{ fontSize:9.5, color:C.muted, fontWeight:600, marginBottom:3 }}>{s.l}</div>
                    <div style={{ fontSize:18, fontWeight:700, color:dp?.text || C.text }}>{s.v}</div>
                    <div style={{ fontSize:9.5, color:C.muted, marginTop:1 }}>{s.s}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Tap hint */}
        <div style={{ textAlign:"center", paddingBottom:6 }}>
          <span style={{ fontSize:10, color:C.border, letterSpacing:"0.06em" }}>탭하면 Me:ll 앱이 열려요</span>
        </div>
      </div>
    );
  }
  // ────────────────────────────────────────────────────────────

  return (
    <div style={{ minHeight:"100vh", background:C.bg, color:C.text, fontFamily:"DM Sans,sans-serif", paddingBottom:120 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        button{cursor:pointer;font-family:inherit}
        input[type=date]::-webkit-calendar-picker-indicator{opacity:0.4;cursor:pointer}
      `}</style>

      {/* Header */}
      <div style={{ padding:"16px 20px 13px", borderBottom:`1px solid ${C.border}`, background:"white", position:"sticky", top:0, zIndex:10, textAlign:"center" }}>
        <div style={{ fontSize:9.5, color:C.muted, letterSpacing:"0.14em", textTransform:"uppercase", fontWeight:600, marginBottom:2 }}>나에게로 돌아오는 시간</div>
        <div style={{ fontSize:22, fontFamily:"DM Serif Display,serif", color:C.text, lineHeight:1.2 }}>Me:ll</div>
      </div>

      <div style={{ padding:"16px 18px 0", maxWidth:460, margin:"0 auto" }}>

        {/* DASHBOARD */}
        {tab === "dash" && (
          !loaded ? (
            <div style={{ textAlign:"center", padding:"60px 0", color:C.muted, fontSize:13 }}>불러오는 중...</div>
          ) : !stats && !selId ? (
            <div style={{ textAlign:"center", padding:"70px 20px" }}>
              <div style={{ width:68, height:68, borderRadius:"50%", background:"#F0EDE8", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 18px", fontSize:28 }}>🌙</div>
              <div style={{ color:C.muted, fontSize:14, lineHeight:1.9 }}>생리 시작일을 기록하면<br />오늘이 어느 시기인지 알 수 있어요</div>
              <button onClick={() => setTab("record")} style={{ marginTop:22, padding:"11px 28px", background:C.text, border:"none", borderRadius:100, color:"white", fontSize:13, fontWeight:600 }}>
                기록 추가하기 →
              </button>
            </div>
          ) : (
            <>
              <div style={{ margin:"4px 0 8px", position:"relative" }}>
                <Clock angle={stats?.angle ?? 0} selId={dp?.id} todayId={stats?.phase?.id} onSelect={togglePhase} ready={ready} cycleDay={isToday ? stats?.cycleDay : null} totalDays={stats?.avgCycle} />
                {!isToday && (
                  <div style={{ textAlign:"center", marginTop:6 }}>
                    <button onClick={backToday} style={{ padding:"5px 14px", background:"white", border:`1px solid ${C.border}`, borderRadius:100, color:C.muted, fontSize:11, fontWeight:600 }}>
                      오늘로 돌아가기
                    </button>
                  </div>
                )}
              </div>

              {dp && (
                <div style={{ background:C.card, border:`1px solid ${dp.border}`, borderRadius:20, padding:"16px 18px", marginBottom:12, boxShadow:"0 2px 14px rgba(0,0,0,0.05)", transition:"border-color 0.3s" }}>
                  <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:8 }}>
                    <div>
                      <div style={{ fontSize:11, color:dp.text, background:dp.soft, display:"inline-block", padding:"3px 10px", borderRadius:100, fontWeight:600, letterSpacing:"0.07em", marginBottom:7 }}>
                        {isToday ? "현재 시기" : "선택한 시기"}
                      </div>
                      <div style={{ fontSize:28, fontFamily:"DM Serif Display,serif", color:dp.text }}>{dp.name}</div>
                      <div style={{ fontSize:13, color:dp.color, fontWeight:600, marginTop:3 }}>{dp.season} · {dp.keyword}</div>
                    </div>
                    <div style={{ width:38, height:38, borderRadius:"50%", background:dp.soft, border:`2px solid ${dp.border}`, flexShrink:0 }} />
                  </div>
                  <div style={{ fontSize:14, color:C.muted, lineHeight:1.75 }}>{dp.description}</div>
                  {isToday && stats && (
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:7, marginTop:12 }}>
                      <MiniStat label="사이클" value={`${stats.cycleDay}일차`} sub={`/${stats.avgCycle}일`} soft={dp.soft} textColor={dp.text} />
                      <MiniStat label="이 시기" value={`${stats.dIn}일째`} sub={`/${stats.dTotal}일`} soft={dp.soft} textColor={dp.text} />
                      <MiniStat label="다음 시기" value={`${stats.dLeft}일`} sub="후" soft={dp.soft} textColor={dp.text} />
                    </div>
                  )}
                </div>
              )}

              {isToday && stats && <DdayRow stats={stats} />}

              {dp && (
                <div style={{ marginBottom:16 }}>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", borderBottom:`1.5px solid ${dp.border}` }}>
                    {Object.entries(SECS).map(([k, v]) => {
                      const on = sec === k;
                      return (
                        <button key={k} onClick={() => setSec(k)} style={{ padding:"8px 4px 9px", border:"none", borderRadius:"8px 8px 0 0", borderTop: on ? `1.5px solid ${dp.border}` : "1.5px solid transparent", borderLeft: on ? `1.5px solid ${dp.border}` : "1.5px solid transparent", borderRight: on ? `1.5px solid ${dp.border}` : "1.5px solid transparent", background: on ? C.card : "transparent", textAlign:"center", position:"relative", bottom: on ? "-1.5px" : "0", transition:"all 0.15s" }}>
                          <div style={{ fontSize:13, fontWeight:700, lineHeight:1.4, color: on ? dp.text : C.muted }}>{v.l1}</div>
                          <div style={{ fontSize:13, fontWeight:700, lineHeight:1.4, color: on ? dp.text : C.muted }}>{v.l2}</div>
                        </button>
                      );
                    })}
                  </div>
                  <div style={{ background:C.card, border:`1.5px solid ${dp.border}`, borderTop:"none", borderRadius:"0 0 16px 16px", padding:"14px 18px" }}>
                    {/* Phase-based list */}
                    <ul style={{ paddingLeft:0, listStyle:"none", margin:0 }}>
                      {(SECS[sec]?.data || []).map((t, i) => {
                        const parts = t.split(" — ");
                        const main = parts[0];
                        const sub  = parts[1] || null;
                        return (
                          <li key={i} style={{ display:"flex", alignItems:"flex-start", gap:10, padding:"7px 0", borderBottom: i < (SECS[sec]?.data?.length - 1) ? `1px solid ${dp.border}33` : "none" }}>
                            <span style={{ width:6, height:6, borderRadius:"50%", background:dp.color, flexShrink:0, marginTop:6 }}/>
                            <div>
                              <div style={{ fontSize:14, fontWeight:600, color:C.text, lineHeight:1.4 }}>{main}</div>
                              {sub && <div style={{ fontSize:12, color:C.muted, marginTop:2, lineHeight:1.5 }}>{sub}</div>}
                            </div>
                          </li>
                        );
                      })}
                    </ul>

                    {/* Seasonal bonus section */}
                    {(sec === "eat" || sec === "exercise") && (
                      <div style={{ marginTop:14, paddingTop:12, borderTop:`1px dashed ${seasonInfo.border}` }}>
                        <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:8 }}>
                          <span style={{ fontSize:13 }}>{seasonInfo.emoji}</span>
                          <span style={{ fontSize:11, fontWeight:700, color:seasonInfo.color }}>
                            {seasonInfo.name} {sec === "eat" ? "제철 음식" : "날씨별 운동 팁"}
                          </span>
                        </div>

                        {sec === "eat" && (
                          <ul style={{ paddingLeft:0, listStyle:"none", margin:0 }}>
                            {seasonInfo.seasonalFoods.map((f, i) => {
                              const parts = f.split(" — ");
                              return (
                                <li key={i} style={{ display:"flex", alignItems:"flex-start", gap:10, padding:"6px 0", borderBottom: i < seasonInfo.seasonalFoods.length-1 ? `1px solid ${seasonInfo.border}44` : "none" }}>
                                  <span style={{ width:5, height:5, borderRadius:"50%", background:seasonInfo.color, flexShrink:0, marginTop:6, opacity:0.7 }}/>
                                  <div>
                                    <div style={{ fontSize:13, fontWeight:600, color:C.text, lineHeight:1.4 }}>{parts[0]}</div>
                                    {parts[1] && <div style={{ fontSize:11.5, color:C.muted, marginTop:1, lineHeight:1.5 }}>{parts[1]}</div>}
                                  </div>
                                </li>
                              );
                            })}
                          </ul>
                        )}

                        {sec === "exercise" && (
                          <>
                            <div style={{ fontSize:13, color:C.muted, lineHeight:1.7, marginBottom:8, padding:"10px 12px", background:seasonInfo.soft, borderRadius:10, borderLeft:`3px solid ${seasonInfo.color}` }}>
                              {seasonInfo.exerciseTip}
                            </div>
                            <ul style={{ paddingLeft:0, listStyle:"none", margin:0 }}>
                              {seasonInfo.exerciseBonus.map((e, i) => {
                                const parts = e.split(" — ");
                                return (
                                  <li key={i} style={{ display:"flex", alignItems:"flex-start", gap:10, padding:"6px 0", borderBottom: i < seasonInfo.exerciseBonus.length-1 ? `1px solid ${seasonInfo.border}44` : "none" }}>
                                    <span style={{ width:5, height:5, borderRadius:"50%", background:seasonInfo.color, flexShrink:0, marginTop:6, opacity:0.7 }}/>
                                    <div>
                                      <div style={{ fontSize:13, fontWeight:600, color:C.text, lineHeight:1.4 }}>{parts[0]}</div>
                                      {parts[1] && <div style={{ fontSize:11.5, color:C.muted, marginTop:1, lineHeight:1.5 }}>{parts[1]}</div>}
                                    </div>
                                  </li>
                                );
                              })}
                            </ul>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div style={{ fontSize:10, color:C.muted, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:9, fontWeight:600 }}>시즌 탐색</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                {PHASES.map(p => {
                  const on = p.id === dp?.id;
                  const tod = p.id === stats?.phase?.id;
                  return (
                    <button key={p.id} onClick={() => togglePhase(p.id)} style={{ background: on ? p.soft : C.card, border:`1.5px solid ${on ? p.border : C.border}`, borderRadius:14, padding:"12px 13px", textAlign:"left", color:C.text, boxShadow: on ? "0 2px 12px rgba(0,0,0,0.07)" : "0 1px 4px rgba(0,0,0,0.03)", transition:"all 0.22s" }}>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                        <span style={{ fontSize:14, color: on ? p.text : C.text, fontWeight:700 }}>{p.name}</span>
                        {tod && <span style={{ fontSize:9, background:p.soft, color:p.text, padding:"2px 7px", borderRadius:100, fontWeight:600 }}>오늘</span>}
                        {on && !tod && <span style={{ fontSize:9, background:p.soft, color:p.text, padding:"2px 7px", borderRadius:100, fontWeight:600 }}>선택됨</span>}
                      </div>
                      <div style={{ fontSize:12, color:C.muted }}>Day {p.dayRange[0]}–{p.dayRange[1]} · {p.season}</div>
                      <div style={{ marginTop:7, height:2.5, borderRadius:2, background: on ? p.color : p.border, transition:"all 0.3s" }} />
                    </button>
                  );
                })}
              </div>

              {/* ── In-feed Ad ── */}
              <div style={{ marginTop:20 }}>
                <AdBanner type="rectangle"/>
              </div>

              {/* ── Festival Card ── */}
              <div style={{ marginTop:20, marginBottom:8 }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
                  <div style={{ fontSize:10, color:C.muted, letterSpacing:"0.1em", textTransform:"uppercase", fontWeight:600 }}>
                    이달의 추천
                  </div>
                  <div style={{ fontSize:11, color:seasonInfo.color, fontWeight:700 }}>
                    {seasonInfo.emoji} {seasonInfo.name}
                  </div>
                </div>

                {/* Wellness festivals */}
                <div style={{ background:seasonInfo.soft, border:`1px solid ${seasonInfo.border}`, borderRadius:16, padding:"16px 18px", marginBottom:10 }}>
                  <div style={{ fontSize:12, fontWeight:700, color:seasonInfo.color, marginBottom:10 }}>
                    웰니스 & 운동 이벤트
                  </div>
                  <div style={{ display:"grid", gap:8 }}>
                    {seasonInfo.wellnessFestivals.map((f, i) => (
                      <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:8 }}>
                        <div style={{ width:6, height:6, borderRadius:"50%", background:seasonInfo.color, flexShrink:0, marginTop:5 }} />
                        <div style={{ fontSize:12.5, color:C.text, lineHeight:1.6 }}>{f}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mood-up festivals */}
                <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:"16px 18px", boxShadow:"0 1px 6px rgba(0,0,0,0.04)" }}>
                  <div style={{ fontSize:12, fontWeight:700, color:C.text, marginBottom:10 }}>
                    ✨ 무드 업 페스티벌
                  </div>
                  <div style={{ display:"grid", gap:8 }}>
                    {seasonInfo.festivals.map((f, i) => (
                      <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:8 }}>
                        <div style={{ width:6, height:6, borderRadius:"50%", background:"#C4BFB8", flexShrink:0, marginTop:5 }} />
                        <div style={{ fontSize:12.5, color:C.muted, lineHeight:1.6 }}>{f}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )
        )}

        {tab === "cal" && <CalView periods={periods} stats={stats} setPeriods={setPeriods} />}
        {tab === "record" && <RecordView periods={periods} setPeriods={setPeriods} />}
        {tab === "my" && <MyPage stats={stats} periods={periods} user={user} />}

      </div>

      {/* Fixed Ad Banner — above bottom nav */}
      <div style={{ position:"fixed", bottom:52, left:0, right:0, zIndex:19 }}>
        <AdBanner type="banner"/>
      </div>

      {/* Bottom nav */}
      <div style={{ position:"fixed", bottom:0, left:0, right:0, background:"white", borderTop:`1px solid ${C.border}`, display:"flex", zIndex:20 }}>
        {[
          { id:"dash",   ic:"◯", lb:"대시보드" },
          { id:"cal",    ic:"▦", lb:"캘린더" },
          { id:"record", ic:"✎", lb:"기록" },
          { id:"my",     ic:"♡", lb:"마이페이지" },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ flex:1, padding:"9px 0 11px", border:"none", background:"transparent", color: tab === t.id ? C.text : C.muted, display:"flex", flexDirection:"column", alignItems:"center", gap:2, borderTop: tab === t.id ? `2px solid ${C.text}` : "2px solid transparent", transition:"all 0.15s" }}>
            <span style={{ fontSize:15, lineHeight:1 }}>{t.ic}</span>
            <span style={{ fontSize:9.5, fontWeight: tab === t.id ? 700 : 500 }}>{t.lb}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
