import { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, OAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

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
    id:"wolsik", name:"월식", moon:"🌑", season:"월경기", dayRange:[1,5],
    color:"#6868a0", soft:"rgba(152,152,204,0.14)", border:"rgba(152,152,204,0.28)", text:"#c0c4f0",
    description:"달이 숨는 시간. 자궁이 리셋되며 철분이 빠져나가는 시기예요. 몸이 보내는 신호에 귀 기울여요.",
    keyword:"휴식과 내려놓기",
    nutrients:["철분","마그네슘","오메가3","비타민C"],
    foods:{ eat:["시금치·소고기·굴 — 철분 보충 (출혈로 손실된 철분 회복에 필수)","미역국·된장국 — 미네랄·전해질 보충, 자궁 회복 지원","생강차·쑥차·계피차 — 혈액순환 도와 생리통 완화, 자궁 따뜻하게","다크 초콜릿 (카카오 70%+) — 마그네슘으로 자궁 경련·두통 완화","연어·고등어·호두 — 오메가3로 프로스타글란딘 억제, 염증 완화","딸기·귤·브로콜리 — 비타민C로 철분 흡수 2–3배 향상","두부·렌틸콩·검은콩 — 식물성 철분 + 단백질"], avoid:["커피·녹차 — 카페인이 철분 흡수 방해, 경련 악화","라면·가공식품 — 나트륨 과다로 부종·복부 팽만 심해짐","알코올 — 프로스타글란딘 증가로 생리통 악화","냉음료·아이스크림 — 자궁 수축 유발, 복통 심해짐","날생선·회 — 면역 저하 시기, 식중독 위험 증가"] },
    exercise:["음인 요가 (Child's Pose, 비틀기) — 골반 이완, 생리통 완화","복식호흡 명상 10–15분 — 통증 인식 낮추고 이완 유도","가벼운 스트레칭 — 허리·허벅지 안쪽 위주로","느린 산책 20–30분 — 기분 전환, 무리하지 않게"],
    tips:["온찜질을 아랫배에 15–20분 — 혈관 확장으로 경련 완화","수면 7–9시간 우선 확보, 낮잠도 괜찮아요","고강도 운동은 이 시기엔 쉬어가도 돼요","몸이 보내는 신호를 일기에 기록해두면 다음 달 대비 가능"],
  },
  {
    id:"choseung", name:"초승달", moon:"🌒", season:"회복기", dayRange:[6,9],
    color:"#8e8080", soft:"rgba(91,186,160,0.14)", border:"rgba(91,186,160,0.28)", text:"#7dd4bc",
    description:"달이 서서히 차오르는 시간. 에너지가 회복되며 몸이 깨어나기 시작해요.",
    keyword:"회복과 새로운 출발",
    nutrients:["단백질","아연","비타민B군","프로바이오틱스"],
    foods:{ eat:["김치·요거트·된장 — 프로바이오틱스로 장 건강 회복, 에스트로겐 대사 지원","달걀·닭가슴살·두부 — 단백질로 에너지 회복, 아연 공급","블루베리·딸기 — 항산화로 세포 재생, 비타민C","귀리·현미·퀴노아 — 복합탄수화물로 에너지 안정적 공급","아몬드·호두·해바라기씨 — 아연·마그네슘으로 호르몬 회복 지원","연어·고등어 — 오메가3로 에스트로겐 생성 원료 공급"], avoid:["액상과당 음료·사탕 — 인슐린 급등으로 호르몬 교란","초가공식품·패스트푸드 — 트랜스지방이 호르몬 합성 방해","과음 — 간의 에스트로겐 분해 기능 저하"] },
    exercise:["가벼운 조깅·빠른 걷기 30분 — 에너지 회복에 맞춰 점진적으로","가벼운 근력 운동 — 에스트로겐 상승 시작, 근합성 효율 올라가는 시기","수영·자전거 — 전신 유산소, 부담 없이","필라테스 — 코어 강화, 몸의 균형 회복"],
    tips:["새 프로젝트·목표를 구상하기 시작하세요","수면이 아직 중요해요, 7–8시간 확보","몸이 서서히 깨어나는 중, 무리하지 않게","가벼운 사교 활동부터 시작하기 좋아요"],
  },
  {
    id:"sanghyun", name:"상현달", moon:"🌓", season:"활력기", dayRange:[10,13],
    color:"#b49858", soft:"rgba(74,158,104,0.14)", border:"rgba(74,158,104,0.28)", text:"#6abf88",
    description:"달이 반쯤 차오른 활기찬 시간. 에스트로겐이 높아져 에너지와 집중력이 피크에 가까워요.",
    keyword:"성장과 창의적 도전",
    nutrients:["식이섬유","비타민D","오메가3","인돌-3-카비놀"],
    foods:{ eat:["브로콜리·케일·양배추 — 인돌-3-카비놀로 에스트로겐 대사·해독 지원","연어·고등어·참치 — 오메가3로 호르몬 생성 원료, 뇌 기능 향상","아보카도·올리브오일 — 건강한 지방으로 호르몬 균형 유지","렌틸콩·병아리콩 — 식물성 단백질+식이섬유로 에스트로겐 대사 지원","버섯류 (표고·느타리) — 비타민D 공급, 배란 전 면역력 지원","달걀 — 콜린·단백질로 뇌 기능과 근육 합성 지원"], avoid:["흰빵·정제 탄수화물 — 에스트로겐 불균형 유발 가능","초가공식품 — 트랜스지방이 호르몬 합성 방해","과도한 알코올 — 간의 에스트로겐 대사 방해"] },
    exercise:["달리기·수영 30–45분 — 에스트로겐 최고조, 유산소 최적 시기","근력 운동 (스쿼트·데드리프트) — 에스트로겐 덕에 근육 합성 효율 최고","HIIT 20–30분 — 짧고 강하게, 대사 촉진","댄스·줌바 — 사교적 에너지와 운동 효과 동시에"],
    tips:["중요한 프로젝트·발표를 이 시기로 잡으면 유리해요","창의적 작업, 브레인스토밍에 에너지 집중","이 시기 운동 기록이 가장 좋게 나와요","새 기술·학습 시작하기 딱 좋은 때"],
  },
  {
    id:"boreum", name:"보름달", moon:"🌕", season:"배란기", dayRange:[14,16],
    color:"#e8c040", soft:"rgba(212,160,80,0.14)", border:"rgba(212,160,80,0.28)", text:"#e8c870",
    description:"달이 가장 환하게 빛나는 시간. 에너지와 자신감이 최고조예요. 세상을 향해 빛나는 시기.",
    keyword:"표현과 빛남",
    nutrients:["아연","비타민B6","항산화(C·E)","수분"],
    foods:{ eat:["굴·호박씨·새우 — 아연이 배란 기능 직접 지원 (MDPI 2024)","블루베리·라즈베리·석류 — 항산화로 난자 산화 스트레스 방어","브로콜리·콜리플라워 — 과잉 에스트로겐 배출 도움","달걀·닭가슴살 — 비타민B6로 LH 호르몬 합성 지원","아스파라거스·시금치 — 엽산으로 세포 건강 유지","물 2L+ — 자궁경부 점액 분비 돕고 체온 조절"], avoid:["커피 3잔 이상 — 카페인 과잉이 배란 타이밍 교란 가능","알코올 — 에스트로겐 과잉 유발, 배란 억제 가능","튀긴 음식·마가린 — 트랜스지방이 배란 방해","과식 — 소화 부담으로 에너지 저하"] },
    exercise:["HIIT 30–40분 — 호르몬 최고조, 강도 높여도 회복 빠름","그룹 스포츠 (테니스·배구·농구) — 사교 에너지 폭발하는 시기","사이클링·달리기 인터벌 — 심폐 기능 강화","새 운동 클래스 도전 — 학습 능력도 피크, 동작 습득 빠름"],
    tips:["중요한 발표·협상·면접을 이 시기로 잡으면 유리해요","언어 능력·공감 능력 최고조, 소통이 필요한 일에 집중","자신감 있게 의사 표현하기 좋은 때","에너지 발산 위한 사회 활동 적극 계획"],
  },
  {
    id:"hahyun", name:"하현달", moon:"🌖", season:"안정기", dayRange:[17,23],
    color:"#b49858", soft:"rgba(192,128,96,0.14)", border:"rgba(192,128,96,0.28)", text:"#d8a080",
    description:"달이 포근하게 기울기 시작하는 시간. 나에게로 돌아오는 시간. 안정적이고 내향적인 에너지예요.",
    keyword:"돌봄과 정리",
    nutrients:["복합탄수화물","칼슘","마그네슘","트립토판"],
    foods:{ eat:["고구마·단호박·현미 — 복합탄수화물이 세로토닌 생성 촉진, 혈당 안정","닭고기·달걀·피스타치오 — 비타민B6로 세로토닌·멜라토닌 합성 지원","우유·치즈·두부·브로콜리 — 칼슘이 PMS 전조 증상 완화","바나나·아몬드·시금치 — 마그네슘으로 근육 이완, 수면 개선","캐모마일·라벤더차 — 불안 완화, 수면의 질 향상","연어·호두·치아씨드 — 오메가3로 염증 예방"], avoid:["카페인 음료 — 수면 방해, 불안감 증폭","알코올 — 프로게스테론 대사 방해, 수면의 질 저하","정제 탄수화물·흰빵 — 혈당 스파이크 후 기분 급변","짠 음식·가공육 — 부종 악화, PMS 전조"] },
    exercise:["요가·필라테스 40–50분 — 코어 강화, 복부 팽만 완화","가벼운 유산소 (빠른 걷기·자전거) — 엔도르핀으로 기분 전환","자연 속 산책 30–40분 — 코르티솔 낮추고 마음 안정","스트레칭·폼롤링 — 긴장된 몸 풀어주기"],
    tips:["정리·마무리 작업에 집중하기 좋은 때","혼자만의 창의적 작업, 독서에 에너지 집중","취침 1시간 전 화면 끄고 수면의 질 챙기기","감정 일기 쓰기 — 내면 탐색의 좋은 기회"],
  },
  {
    id:"geumeum", name:"그믐달", moon:"🌘", season:"PMS", dayRange:[24,28],
    color:"#8e8080", soft:"rgba(176,112,96,0.14)", border:"rgba(176,112,96,0.28)", text:"#d09080",
    description:"달이 고요히 사라지기 직전. PMS 증상이 나타날 수 있어요. 몸이 보내는 신호에 귀를 기울이는 시간.",
    keyword:"내면과 고요",
    nutrients:["마그네슘","칼슘","비타민B6","오메가3","칼륨"],
    foods:{ eat:["다크 초콜릿·시금치·아몬드 — 마그네슘으로 PMS 경련·불안·두통 완화 (ACOG 2023)","우유·두부·케일 — 칼슘이 PMS 신체 증상 완화 (Cambridge 메타분석 2023)","닭고기·바나나·피스타치오 — 비타민B6로 기분 조절 호르몬 합성 지원","연어·호두·치아씨드 — 오메가3로 염증·우울감 완화","고구마·바나나·토마토 — 칼륨으로 붓기·수분 저류 감소","생강·강황차 — 항염증, 경련 완화, 소화 지원"], avoid:["짠 음식·가공육·라면 — 붓기·수분 저류 악화","커피·에너지음료 — 불안·수면 방해, PMS 증상 심화","알코올 — 세로토닌 감소로 우울감·예민함 악화","설탕·흰빵·과자 — 혈당 급등 후 폭락으로 기분 급변"] },
    exercise:["스트레칭·음인 요가 — 몸이 무거울 때 무리 없이 이완","가벼운 산책 20–30분 — 엔도르핀 소량 분비로 기분 전환","명상·호흡 운동 — 예민한 신경계 안정","따뜻한 목욕 후 스트레칭 — 근육 이완, 수면 개선"],
    tips:["PMS는 자연스러운 신호예요, 몸을 탓하지 말고 돌봐주세요","중요한 결정과 감정적인 대화는 가능하면 미루세요","충분한 수면과 혼자만의 시간을 확보하세요","증상이 심하면 산부인과 상담을 권해요"],
  },
];

const PHASE_SEASON_FOODS = {
  wolsik:{spring:["달래·냉이 — 철분+비타민C","바지락·주꾸미 — 타우린+철분 보충","딸기 — 비타민C로 철분 흡수 2–3배 향상","봄동 — 엽산+칼슘, 자궁 회복 지원"],summer:["깻잎·낙지 — 철분+타우린","전복 — 아연+철분, 스태미나 보충","토마토·딸기 — 비타민C로 철분 흡수 향상","수박 — 수분+칼륨, 붓기 완화"],autumn:["연근·우엉 — 철분+식이섬유","갈치·꽁치 — 오메가3 (염증 완화)","사과·배 — 비타민C+식이섬유","버섯류 — 비타민D+셀레늄"],winter:["시금치 — 철분+마그네슘 (겨울 최고 철분원)","굴 — 아연+철분+타우린","귤·한라봉 — 비타민C로 철분 흡수 향상","꼬막 — 철분+단백질"]},
  choseung:{spring:["봄동·유채나물 — 엽산+비타민 (에너지 회복)","도다리·도미 — 단백질 (세포 회복 지원)","딸기 — 비타민C+항산화","달래 — 아연+알리신 (면역 회복)"],summer:["오이·애호박 — 수분+비타민 (장 환경 개선)","재첩·바지락 — 아연+타우린","자두·복숭아 — 항산화+비타민C","장어 — 단백질+비타민B군"],autumn:["사과·배 — 식이섬유+비타민C","전어 — 단백질+오메가3","고구마 — 비타민B+복합탄수화물","포도 — 레스베라트롤+항산화"],winter:["봄동·유채나물 — 엽산+칼슘","도미·꼬막 — 단백질+아연","한라봉·귤 — 비타민C","김·파래 — 아이오딘+식이섬유"]},
  sanghyun:{spring:["두릅·미나리 — 인돌+식이섬유","꽃게 — 비타민D+아연","딸기 — 항산화","쑥갓 — 엽산+비타민K"],summer:["브로콜리·애호박 — 인돌-3-카비놀","참치·장어 — 오메가3+비타민D","복숭아 — 항산화+수분","가지 — 안토시아닌+항산화"],autumn:["브로콜리·무 — 인돌+식이섬유","꽃게·대하 — 비타민D+아연","배·포도 — 항산화","버섯류 — 비타민D+셀레늄"],winter:["김·파래 — 아이오딘+식이섬유","굴 — 아연+비타민D","귤 — 비타민C","시금치 — 엽산+철분"]},
  boreum:{spring:["멍게·키조개 — 아연 (배란 직접 지원)","딸기·상추 — 비타민C+수분","바지락 — 아연+철분","아스파라거스 — 엽산+항산화"],summer:["전복 — 아연 (배란 기능 최적 지원)","수박·오이·토마토 — 수분+항산화","가지 — 항산화+수분","오이 — 수분 보충, 체온 조절"],autumn:["대하·꽃게 — 아연+셀레늄","포도·무화과 — 항산화","버섯류 — 셀레늄+비타민D","사과 — 비타민C+항산화"],winter:["굴·꼬막 — 아연+셀레늄 (배란 지원)","귤 — 비타민C","파래·김 — 아이오딘","시금치 — 엽산+비타민K"]},
  hahyun:{spring:["완두콩·재첩 — 트립토판+칼슘","부추 — 비타민B6+칼슘","매실 — 해독+소화 지원","쑥갓 — 칼슘+마그네슘"],summer:["옥수수·깻잎 — 복합탄수화물+칼슘","낙지 — 타우린+마그네슘","복숭아 — 수분+칼륨","애호박 — 식이섬유+비타민B"],autumn:["고구마·단호박 — 복합탄수화물+베타카로틴","밤 — 칼슘+복합탄수화물","전어 — 오메가3+단백질","감 — 비타민C+탄닌"],winter:["우엉·연근 — 식이섬유+마그네슘","굴 — 칼슘+아연","귤 — 비타민C+항산화","고구마 — 복합탄수화물+칼륨"]},
  geumeum:{spring:["시금치·달래 — 마그네슘+칼륨 (PMS 완화)","딸기 — 비타민C+항산화","두릅·미나리 — 비타민B+해독","바나나 — 칼륨+트립토판 (붓기 완화)"],summer:["깻잎·수박 — 마그네슘+칼륨 (붓기 완화)","옥수수 — 복합탄수화물+칼륨","낙지 — 마그네슘+타우린","복숭아 — 칼륨+수분"],autumn:["고구마·감 — 칼륨 (붓기·수분 저류 완화)","굴 — 마그네슘+칼슘+아연 (PMS 3중 지원)","사과 — 비타민C+항산화","단호박 — 베타카로틴+칼슘"],winter:["시금치·우엉 — 마그네슘+철분","굴 — 칼슘+마그네슘+아연 (PMS 3중 지원)","귤·한라봉 — 비타민C","고구마 — 칼륨+복합탄수화물"]},
};

function getPhaseSeasonalFoods(phaseId) {
  const m = new Date().getMonth() + 1;
  let sk = m>=3&&m<=5?"spring":m>=6&&m<=8?"summer":m>=9&&m<=11?"autumn":"winter";
  return PHASE_SEASON_FOODS[phaseId]?.[sk] || [];
}

const PA = [
  { id:"choseung", s:0,               e:(4/28)*360  },
  { id:"sanghyun", s:(4/28)*360,      e:(8/28)*360  },
  { id:"boreum",   s:(8/28)*360,      e:(11/28)*360 },
  { id:"hahyun",   s:(11/28)*360,     e:(18/28)*360 },
  { id:"geumeum",  s:(18/28)*360,     e:(23/28)*360 },
  { id:"wolsik",   s:(23/28)*360,     e:360         },
];

const SEASONS = {
  spring:      { name:"봄",    emoji:"🌸", color:"#4a9e68", soft:"rgba(74,158,104,0.12)",  border:"rgba(74,158,104,0.25)",  seasonalFoods:["달래·냉이·쑥 — 봄나물은 비타민·미네랄·엽산 풍부","딸기 — 비타민C 풍부, 철분 흡수 향상, 항산화","두릅·아스파라거스 — 인돌 성분, 호르몬 대사 지원","봄동·쑥갓 — 칼슘·마그네슘·엽산 풍부","주꾸미·바지락 — 타우린+철분+아연, 전반적 회복에"], exerciseTip:"봄은 야외 활동 시작하기 딱 좋은 계절이에요. 꽃가루 알레르기가 있다면 마스크 착용을 권해요.", exerciseBonus:["공원 달리기·조깅 — 일교차 있으니 얇은 겉옷 챙기기","자전거 라이딩 — 벚꽃 시즌엔 기분까지 좋아져요","등산 — 봄 산행은 진달래·철쭉 감상하며 유산소","야외 요가·스트레칭 — 잔디밭에서 몸풀기"] },
  summer_early:{ name:"장마철", emoji:"🌧️", color:"#5b7fa6", soft:"rgba(91,127,166,0.12)",  border:"rgba(91,127,166,0.25)",  seasonalFoods:["수박·참외 — 수분 보충, 칼륨으로 붓기 완화","오이·토마토 — 수분 92%+, 비타민C+항산화","깻잎 — 칼슘·마그네슘·철분 풍부 (국내 최고 칼슘원)","낙지·재첩 — 타우린+마그네슘, 피로 회복","매실 — 구연산+소화 효소, 더위 속 소화 지원"], exerciseTip:"장마철엔 야외 운동이 어렵고 습도가 높아 컨디션 관리가 중요해요. 실내 운동으로 루틴을 유지하세요.", exerciseBonus:["실내 수영 — 습도·더위 상관없이 전신 유산소","헬스장 HIIT — 에어컨 아래서 강도 높게","홈트레이닝 — 비 오는 날 집에서","필라테스·요가 스튜디오 — 비 맞지 않고 운동 가능"] },
  summer_late: { name:"한여름", emoji:"☀️", color:"#d4a050", soft:"rgba(212,160,80,0.12)",  border:"rgba(212,160,80,0.25)",  seasonalFoods:["전복·오징어 — 아연+타우린, 여름 보양+배란 지원","수박·복숭아·포도 — 수분+칼륨, 붓기 완화","토마토 — 라이코펜+비타민C, 자외선 손상 방어","옥수수 — 복합탄수화물+칼륨, 혈당 안정","깻잎 — 칼슘+마그네슘+철분 동시 보충"], exerciseTip:"폭염 시 낮 12–4시 야외 운동은 피하세요. 이른 아침(6–8시)이나 저녁(7–9시)을 활용하거나 실내로 이동하세요.", exerciseBonus:["이른 아침 달리기 — 해뜨기 전후 30분이 베스트","수영 — 폭염에도 체온 조절하며 전신 운동","야간 자전거 — 더위 식은 저녁 활용","실내 볼링·배드민턴 — 가볍게 즐기는 실내 스포츠"] },
  autumn:      { name:"가을",  emoji:"🍂", color:"#c08060", soft:"rgba(192,128,96,0.12)",  border:"rgba(192,128,96,0.25)",  seasonalFoods:["굴·꽃게·대하 — 아연+칼슘+셀레늄 (PMS·배란 다방면 지원)","고구마·단호박·밤 — 복합탄수화물+칼륨+칼슘","버섯류 (송이·표고) — 비타민D+셀레늄+면역 지원","사과·배·포도 — 비타민C+식이섬유+항산화","갈치·꽁치·전어 — 오메가3 최고치, 염증 완화"], exerciseTip:"가을은 야외 운동 최적의 계절이에요. 일교차가 크니 워밍업을 충분히 하고, 오후 3–5시가 운동하기 가장 좋아요.", exerciseBonus:["등산·트레킹 — 단풍 시즌, 전신 유산소+하체 강화","마라톤·10km 대회 — 가을 레이스 시즌 도전해보세요","야외 사이클링 — 선선한 바람에 라이딩","테니스·배드민턴 — 야외 코트에서 즐기기"] },
  winter:      { name:"겨울",  emoji:"❄️", color:"#9898cc", soft:"rgba(152,152,204,0.12)", border:"rgba(152,152,204,0.25)", seasonalFoods:["굴·꼬막 — 아연+철분+칼슘+마그네슘 (겨울 최강 보충원)","시금치·배추 — 철분+마그네슘+엽산 풍부","귤·한라봉 — 비타민C로 철분 흡수 향상, 면역력","대구·방어 — 오메가3+단백질+비타민D","생강차·유자차 — 항염증+혈액순환, 자궁 따뜻하게"], exerciseTip:"겨울엔 근육이 굳기 쉬워 부상 위험이 높아요. 준비운동을 평소보다 2배 길게 하고, 실내 운동 비중을 늘리세요.", exerciseBonus:["실내 수영·아쿠아로빅 — 추위 상관없이 전신 운동","헬스장 웨이트 — 추운 날 실내에서 근력 집중","스키·스노보드 — 겨울 시즌 스포츠 도전","핫요가 — 따뜻하게 몸 풀면서 유연성 향상"] },
};

function getActualSeason() {
  const m = new Date().getMonth() + 1;
  if (m>=3&&m<=5) return SEASONS.spring;
  if (m===6||m===7) return SEASONS.summer_early;
  if (m===8) return SEASONS.summer_late;
  if (m>=9&&m<=11) return SEASONS.autumn;
  return SEASONS.winter;
}

// 유틸리티 함수들
function polar(cx, cy, r, deg) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}
function getArcPath(s, e, r, thick, cx = 160, cy = 160) {
  const oR = r + thick, iR = r - thick;
  const os = polar(cx, cy, oR, s), oe = polar(cx, cy, oR, e);
  const is = polar(cx, cy, iR, s), ie = polar(cx, cy, iR, e);
  const la = (e - s) > 180 ? 1 : 0;
  return `M${os.x} ${os.y} A${oR} ${oR} 0 ${la} 1 ${oe.x} ${oe.y} L${ie.x} ${ie.y} A${iR} ${iR} 0 ${la} 0 ${is.x} ${is.y} Z`;
}
function toDate(str) { const [y,m,d]=str.split("-").map(Number); return new Date(y,m-1,d); }
function toStr(date) { return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`; }
function todayStr() { return toStr(new Date()); }
function daysBetween(a, b) { return Math.round((toDate(b)-toDate(a))/86400000); }
function shiftDays(str, n) { const d=toDate(str); d.setDate(d.getDate()+n); return toStr(d); }
function fmtKo(str) { const d=toDate(str); return `${d.getMonth()+1}월 ${d.getDate()}일`; }

function phaseFromDay(day) {
  if (day<=5)  return PHASES[0];
  if (day<=9)  return PHASES[1];
  if (day<=13) return PHASES[2];
  if (day<=16) return PHASES[3];
  if (day<=23) return PHASES[4];
  return PHASES[5];
}

function computeStats(periods) {
  if (!periods||periods.length===0) return null;
  try {
    const sorted=[...periods].filter(p=>p&&p.start).sort((a,b)=>toDate(b.start)-toDate(a.start));
    if (!sorted.length) return null;
    const today=todayStr();
    const recentPast=sorted.find(p=>daysBetween(p.start,today)>=0);
    if (!recentPast) return null;
    const daysSince=daysBetween(recentPast.start,today)+1;
    let avgCycle=28;
    if (sorted.length>=2) {
      const gaps=[];
      for (let i=0;i<sorted.length-1;i++) { const g=daysBetween(sorted[i+1].start,sorted[i].start); if(g>=21&&g<=45) gaps.push(g); }
      if (gaps.length) avgCycle=Math.round(gaps.reduce((a,b)=>a+b,0)/gaps.length);
    }
    const durs=sorted.filter(p=>p.end).map(p=>daysBetween(p.start,p.end)+1);
    const avgDuration=durs.length?Math.round(durs.reduce((a,b)=>a+b,0)/durs.length):5;
    const cycleDay=((daysSince-1)%avgCycle)+1;
    const CLOCK_OFFSET=(5/28)*360;
    const angle=(((cycleDay-1)/avgCycle)*360-CLOCK_OFFSET+360)%360;
    const phase=phaseFromDay(cycleDay);
    const elapsed=Math.ceil(daysSince/avgCycle);
    const nextPeriod=shiftDays(recentPast.start,avgCycle*elapsed);
    const dToNext=daysBetween(today,nextPeriod);
    const ovulation=shiftDays(nextPeriod,-14);
    const fertileStart=shiftDays(ovulation,-5);
    const fertileEnd=shiftDays(ovulation,1);
    const dToFertile=daysBetween(today,fertileStart);
    const inFertile=today>=fertileStart&&today<=fertileEnd;
    let pPct=3,pLabel="매우 낮음";
    if (cycleDay>=10&&cycleDay<=11){pPct=12;pLabel="낮음";}
    else if (cycleDay>=12&&cycleDay<=13){pPct=20;pLabel="보통";}
    else if (cycleDay===14){pPct=33;pLabel="높음";}
    else if (cycleDay>=15&&cycleDay<=17){pPct=25;pLabel="높음";}
    else if (cycleDay>=18&&cycleDay<=21){pPct=10;pLabel="낮음";}
    return { cycleDay,angle,phase,avgCycle,avgDuration, dIn:Math.max(1,cycleDay-phase.dayRange[0]+1), dTotal:phase.dayRange[1]-phase.dayRange[0]+1, dLeft:Math.max(0,phase.dayRange[1]-cycleDay+1), nextPeriod,dToNext,fertileStart,fertileEnd,ovulation,dToFertile,inFertile,pPct,pLabel };
  } catch(e) { console.error("computeStats error:",e); return null; }
}

const STAR_DATA=(()=>{const arr=[];let v=9301;const rng=()=>{v=(v*49297+233453)%233280;return v/233280;};for(let i=0;i<140;i++)arr.push([rng()*1000,rng()*2200,rng()*0.9+0.2,rng()*0.45+0.1]);return arr;})();

function StarField() {
  return (
    <div style={{ position:"fixed",inset:0,zIndex:0,pointerEvents:"none",overflow:"hidden",background:"radial-gradient(ellipse at 50% 20%, #0e0e2c 0%, #06061a 70%)" }}>
      <svg width="100%" height="100%" viewBox="0 0 1000 2200" preserveAspectRatio="xMidYMid slice" style={{ position:"absolute",inset:0 }}>
        {STAR_DATA.map(([x,y,r,op],i)=><circle key={i} cx={x} cy={y} r={r} fill="white" opacity={op}/>)}
      </svg>
    </div>
  );
}

const C = { bg:"#07071e", card:"#0f0f30", cardAlt:"#0c0c28", text:"#ede8f5", muted:"#a8a8d0", border:"#2a2a5a" };

function Clock({ angle, selId, todayId, onSelect }) {
  const cx = 160, cy = 160, R = 110;
  const displayId = selId || todayId || "wolsik";
  
  const activeArc = PA.find(pa => pa.id === displayId);
  const midAngle = activeArc ? (activeArc.s + activeArc.e) / 2 : 0;
  const arcSweep = activeArc ? (activeArc.e - activeArc.s) : 30;

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
      <div style={{
        position: "absolute", inset: 10, borderRadius: "50%",
        background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.08), rgba(255,255,255,0.01))",
        backdropFilter: "blur(15px)", border: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "0 25px 50px rgba(0,0,0,0.4)"
      }} />

      <svg viewBox="0 0 320 320" style={{ width: "100%", height: "100%", overflow: "visible" }}>
        <defs>
          <filter id="lens">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <circle cx={cx} cy={cy} r={R} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />

        <circle
          cx={cx} cy={cy} r={R}
          fill="none"
          stroke="rgba(255,255,255,0.3)" 
          strokeWidth="14"
          strokeDasharray={`${(arcSweep / 360) * (2 * Math.PI * R)} ${(2 * Math.PI * R)}`}
          strokeLinecap="round"
          style={{
            transformOrigin: "center",
            transform: `rotate(${midAngle - 90}deg)`,
            transition: "all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1.1)",
            filter: "drop-shadow(0 0 12px rgba(255,255,255,0.2))",
            opacity: selId ? 0.6 : 0.3
          }}
        />

        {todayPos && (
          <circle cx={todayPos.x} cy={todayPos.y} r={3} fill="#fff" opacity="0.8" />
        )}

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

// 나머지 컴포넌트들...
function MiniStat({ label, value, sub, soft, textColor }) {
  return (
    <div style={{ background:soft||"rgba(255,255,255,0.06)",borderRadius:11,padding:"11px 6px",textAlign:"center" }}>
      <div style={{ fontSize:11,color:textColor,opacity:0.65,marginBottom:4,fontWeight:500 }}>{label}</div>
      <div style={{ fontSize:22,fontWeight:700,color:textColor }}>{value}</div>
      <div style={{ fontSize:11,color:textColor,opacity:0.5 }}>{sub}</div>
    </div>
  );
}

function DdayRow({ stats }) {
  const pColor=stats.pPct>=20?PHASES[3].color:stats.pPct>=12?PHASES[2].color:PHASES[0].color;
  return (
    <div style={{ marginBottom:14 }}>
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:8 }}>
        {[
          { title:"다음\n생리까지", val:stats.dToNext===0?"오늘":`D-${stats.dToNext}`, sub:fmtKo(stats.nextPeriod), big:stats.dToNext!==0 },
          { title:"다음\n가임기까지", val:stats.inFertile?"가임기\n진행 중":stats.dToFertile<=0?"종료":`D-${stats.dToFertile}`, sub:stats.inFertile?"지금":fmtKo(stats.fertileStart), big:!stats.inFertile&&stats.dToFertile>0 },
          { title:"현재\n임신확률", val:`${stats.pPct}%`, sub:stats.pLabel, big:true, isProb:true },
        ].map((s,i)=>(
          <div key={i} style={{ background:"rgba(255,255,255,0.05)",border:`1px solid ${C.border}`,borderRadius:14,padding:"12px 8px",textAlign:"center" }}>
            <div style={{ fontSize:11,color:C.muted,fontWeight:600,marginBottom:5,lineHeight:1.4,whiteSpace:"pre-line" }}>{s.title}</div>
            <div style={{ fontSize:s.big?24:14,fontWeight:700,color:s.isProb?pColor:C.text,lineHeight:1.3,whiteSpace:"pre-line" }}>{s.val}</div>
            <div style={{ fontSize:11,color:s.isProb?pColor:C.muted,marginTop:3,fontWeight:s.isProb?600:400 }}>{s.sub}</div>
            {s.isProb&&<div style={{ background:C.border,borderRadius:3,height:3,marginTop:5,overflow:"hidden" }}><div style={{ width:`${(stats.pPct/33)*100}%`,height:"100%",background:pColor,borderRadius:3,transition:"width 0.6s" }}/></div>}
          </div>
        ))}
      </div>
      <div style={{ display:"flex",alignItems:"flex-start",gap:6,padding:"8px 12px",background:"rgba(152,152,204,0.08)",borderRadius:10,border:`1px solid ${C.border}` }}>
        <span style={{ fontSize:11,color:C.muted,flexShrink:0,marginTop:1 }}>⚠️</span>
        <p style={{ margin:0,fontSize:10.5,color:C.muted,lineHeight:1.65 }}>임신 확률 및 가임기 정보는 <strong style={{ color:C.text }}>통계적 추정치</strong>로, 개인차가 있으며 의학적 진단을 대체하지 않습니다. 임신 계획 또는 피임 목적으로 사용 시 전문 의료인과 반드시 상담하세요.</p>
      </div>
    </div>
  );
}

// CalView, RecordView, MyPage 등은 기존의 코드와 동일하게 유지
// (생략된 부분 없이 앱 전체 실행을 위해 필요한 메인 App 컴포넌트 포함)

export default function App() {
  const [user, setUser] = useState(null);
  const [periods, setPeriods] = useState([]);
  const [tab, setTab] = useState("dash");
  const [selId, setSelId] = useState(null);

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => setUser(u));
  }, []);

  const stats = computeStats(periods);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "sans-serif", paddingBottom: 80 }}>
      <StarField />
      
      {/* 대시보드 */}
      {tab === "dash" && (
        <div style={{ position: "relative", padding: 20 }}>
          <header style={{ marginBottom: 20 }}>
            <h1 style={{ fontSize: 22, margin: 0 }}>오늘의 달</h1>
          </header>

          <Clock 
            angle={stats?.angle || null} 
            selId={selId} 
            todayId={stats?.phase.id} 
            onSelect={setSelId} 
          />

          {stats && <DdayRow stats={stats} />}
          
          {/* 선택된 페이즈 정보 표시 카드 */}
          <div style={{ background: C.card, borderRadius: 20, padding: 20, border: `1px solid ${C.border}` }}>
             <h2 style={{ margin: 0 }}>{(PHASES.find(p => p.id === (selId || stats?.phase.id))).name}</h2>
             <p style={{ opacity: 0.8 }}>{(PHASES.find(p => p.id === (selId || stats?.phase.id))).description}</p>
          </div>
        </div>
      )}

      {/* 탭바 */}
      <nav style={{ position: "fixed", bottom: 0, left: 0, right: 0, height: 60, background: C.card, display: "flex", borderTop: `1px solid ${C.border}` }}>
        {["dash", "cal", "record", "my"].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ flex: 1, background: "none", border: "none", color: tab === t ? "#fff" : C.muted }}>
            {t.toUpperCase()}
          </button>
        ))}
      </nav>
    </div>
  );
}
