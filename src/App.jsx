import { useState, useEffect, useRef } from "react";
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
    color:"#9898cc", soft:"rgba(152,152,204,0.14)", border:"rgba(152,152,204,0.28)", text:"#c0c4f0",
    description:"달이 숨는 시간. 자궁이 리셋되며 철분이 빠져나가는 시기예요. 몸이 보내는 신호에 귀 기울여요.",
    keyword:"휴식과 내려놓기",
    nutrients:["철분","마그네슘","오메가3","비타민C"],
    foods:{
      eat:["시금치·소고기·굴 — 철분 보충 (출혈로 손실된 철분 회복에 필수)","미역국·된장국 — 미네랄·전해질 보충, 자궁 회복 지원","생강차·쑥차·계피차 — 혈액순환 도와 생리통 완화, 자궁 따뜻하게","다크 초콜릿 (카카오 70%+) — 마그네슘으로 자궁 경련·두통 완화","연어·고등어·호두 — 오메가3로 프로스타글란딘 억제, 염증 완화","딸기·귤·브로콜리 — 비타민C로 철분 흡수 2-3배 향상","두부·렌틸콩·검은콩 — 식물성 철분 + 단백질"],
      avoid:["커피·녹차 — 카페인이 철분 흡수 방해, 경련 악화","라면·가공식품 — 나트륨 과다로 부종·복부 팽만 심해짐","알코올 — 프로스타글란딘 증가로 생리통 악화","냉음료·아이스크림 — 자궁 수축 유발, 복통 심해짐","날생선·회 — 면역 저하 시기, 식중독 위험 증가"]
    },
    exercise:["음인 요가 (Child's Pose, 비틀기) — 골반 이완, 생리통 완화","복식호흡 명상 10-15분 — 통증 인식 낮추고 이완 유도","가벼운 스트레칭 — 허리·허벅지 안쪽 위주로","느린 산책 20-30분 — 기분 전환, 무리하지 않게"],
    tips:["온찜질을 아랫배에 15-20분 — 혈관 확장으로 경련 완화","수면 7-9시간 우선 확보, 낮잠도 괜찮아요","고강도 운동은 이 시기엔 쉬어가도 돼요","몸이 보내는 신호를 일기에 기록해두면 다음 달 대비 가능"],
  },
  {
    id:"choseung", name:"초생", moon:"🌒", season:"회복기", dayRange:[6,9],
    color:"#5bbaa0", soft:"rgba(91,186,160,0.14)", border:"rgba(91,186,160,0.28)", text:"#7dd4bc",
    description:"달이 서서히 차오르는 시간. 에너지가 회복되며 몸이 깨어나기 시작해요.",
    keyword:"회복과 새로운 출발",
    nutrients:["단백질","아연","비타민B군","프로바이오틱스"],
    foods:{
      eat:["김치·요거트·된장 — 프로바이오틱스로 장 건강 회복, 에스트로겐 대사 지원","달걀·닭가슴살·두부 — 단백질로 에너지 회복, 아연 공급","블루베리·딸기 — 항산화로 세포 재생, 비타민C","귀리·현미·퀴노아 — 복합탄수화물로 에너지 안정적 공급","아몬드·호두·해바라기씨 — 아연·마그네슘으로 호르몬 회복 지원","연어·고등어 — 오메가3로 에스트로겐 생성 원료 공급"],
      avoid:["액상과당 음료·사탕 — 인슐린 급등으로 호르몬 교란","초가공식품·패스트푸드 — 트랜스지방이 호르몬 합성 방해","과음 — 간의 에스트로겐 분해 기능 저하"]
    },
    exercise:["가벼운 조깅·빠른 걷기 30분 — 에너지 회복에 맞춰 점진적으로","가벼운 근력 운동 — 에스트로겐 상승 시작, 근합성 효율 올라가는 시기","수영·자전거 — 전신 유산소, 부담 없이","필라테스 — 코어 강화, 몸의 균형 회복"],
    tips:["새 프로젝트·목표를 구상하기 시작하세요","수면이 아직 중요해요, 7-8시간 확보","몸이 서서히 깨어나는 중, 무리하지 않게","가벼운 사교 활동부터 시작하기 좋아요"],
  },
  {
    id:"sanghyun", name:"상현", moon:"🌓", season:"활력기", dayRange:[10,13],
    color:"#4a9e68", soft:"rgba(74,158,104,0.14)", border:"rgba(74,158,104,0.28)", text:"#6abf88",
    description:"달이 반쯤 차오른 활기찬 시간. 에스트로겐이 높아져 에너지와 집중력이 피크에 가까워요.",
    keyword:"성장과 창의적 도전",
    nutrients:["식이섬유","비타민D","오메가3","인돌-3-카비놀"],
    foods:{
      eat:["브로콜리·케일·양배추 — 인돌-3-카비놀로 에스트로겐 대사·해독 지원","연어·고등어·참치 — 오메가3로 호르몬 생성 원료, 뇌 기능 향상","아보카도·올리브오일 — 건강한 지방으로 호르몬 균형 유지","렌틸콩·병아리콩 — 식물성 단백질+식이섬유로 에스트로겐 대사 지원","버섯류 (표고·느타리) — 비타민D 공급, 배란 전 면역력 지원","달걀 — 콜린·단백질로 뇌 기능과 근육 합성 지원"],
      avoid:["흰빵·정제 탄수화물 — 에스트로겐 불균형 유발 가능","초가공식품 — 트랜스지방이 호르몬 합성 방해","과도한 알코올 — 간의 에스트로겐 대사 방해"]
    },
    exercise:["달리기·수영 30-45분 — 에스트로겐 최고조, 유산소 최적 시기","근력 운동 (스쿼트·데드리프트) — 에스트로겐 덕에 근육 합성 효율 최고","HIIT 20-30분 — 짧고 강하게, 대사 촉진","댄스·줌바 — 사교적 에너지와 운동 효과 동시에"],
    tips:["중요한 프로젝트·발표를 이 시기로 잡으면 유리해요","창의적 작업, 브레인스토밍에 에너지 집중","이 시기 운동 기록이 가장 좋게 나와요","새 기술·학습 시작하기 딱 좋은 때"],
  },
  {
    id:"boreum", name:"보름", moon:"🌕", season:"배란기", dayRange:[14,16],
    color:"#d4a050", soft:"rgba(212,160,80,0.14)", border:"rgba(212,160,80,0.28)", text:"#e8c870",
    description:"달이 가장 환하게 빛나는 시간. 에너지와 자신감이 최고조예요. 세상을 향해 빛나는 시기.",
    keyword:"표현과 빛남",
    nutrients:["아연","비타민B6","항산화(C·E)","수분"],
    foods:{
      eat:["굴·호박씨·새우 — 아연이 배란 기능 직접 지원 (MDPI 2024)","블루베리·라즈베리·석류 — 항산화로 난자 산화 스트레스 방어","브로콜리·콜리플라워 — 과잉 에스트로겐 배출 도움","달걀·닭가슴살 — 비타민B6로 LH 호르몬 합성 지원","아스파라거스·시금치 — 엽산으로 세포 건강 유지","물 2L+ — 자궁경부 점액 분비 돕고 체온 조절"],
      avoid:["커피 3잔 이상 — 카페인 과잉이 배란 타이밍 교란 가능","알코올 — 에스트로겐 과잉 유발, 배란 억제 가능","튀긴 음식·마가린 — 트랜스지방이 배란 방해","과식 — 소화 부담으로 에너지 저하"]
    },
    exercise:["HIIT 30-40분 — 호르몬 최고조, 강도 높여도 회복 빠름","그룹 스포츠 (테니스·배구·농구) — 사교 에너지 폭발하는 시기","사이클링·달리기 인터벌 — 심폐 기능 강화","새 운동 클래스 도전 — 학습 능력도 피크, 동작 습득 빠름"],
    tips:["중요한 발표·협상·면접을 이 시기로 잡으면 유리해요","언어 능력·공감 능력 최고조, 소통이 필요한 일에 집중","자신감 있게 의사 표현하기 좋은 때","에너지 발산 위한 사회 활동 적극 계획"],
  },
  {
    id:"hahyun", name:"하현", moon:"🌖", season:"안정기", dayRange:[17,23],
    color:"#c08060", soft:"rgba(192,128,96,0.14)", border:"rgba(192,128,96,0.28)", text:"#d8a080",
    description:"달이 포근하게 기울기 시작하는 시간. 나에게로 돌아오는 시간. 안정적이고 내향적인 에너지예요.",
    keyword:"돌봄과 정리",
    nutrients:["복합탄수화물","칼슘","마그네슘","트립토판"],
    foods:{
      eat:["고구마·단호박·현미 — 복합탄수화물이 세로토닌 생성 촉진, 혈당 안정","닭고기·달걀·피스타치오 — 비타민B6로 세로토닌·멜라토닌 합성 지원","우유·치즈·두부·브로콜리 — 칼슘이 PMS 전조 증상 완화","바나나·아몬드·시금치 — 마그네슘으로 근육 이완, 수면 개선","캐모마일·라벤더차 — 불안 완화, 수면의 질 향상","연어·호두·치아씨드 — 오메가3로 염증 예방"],
      avoid:["카페인 음료 — 수면 방해, 불안감 증폭","알코올 — 프로게스테론 대사 방해, 수면의 질 저하","정제 탄수화물·흰빵 — 혈당 스파이크 후 기분 급변","짠 음식·가공육 — 부종 악화, PMS 전조"]
    },
    exercise:["요가·필라테스 40-50분 — 코어 강화, 복부 팽만 완화","가벼운 유산소 (빠른 걷기·자전거) — 엔도르핀으로 기분 전환","자연 속 산책 30-40분 — 코르티솔 낮추고 마음 안정","스트레칭·폼롤링 — 긴장된 몸 풀어주기"],
    tips:["정리·마무리 작업에 집중하기 좋은 때","혼자만의 창의적 작업, 독서에 에너지 집중","취침 1시간 전 화면 끄고 수면의 질 챙기기","감정 일기 쓰기 — 내면 탐색의 좋은 기회"],
  },
  {
    id:"geumeum", name:"그믐", moon:"🌘", season:"PMS", dayRange:[24,28],
    color:"#b07060", soft:"rgba(176,112,96,0.14)", border:"rgba(176,112,96,0.28)", text:"#d09080",
    description:"달이 고요히 사라지기 직전. PMS 증상이 나타날 수 있어요. 몸이 보내는 신호에 귀를 기울이는 시간.",
    keyword:"내면과 고요",
    nutrients:["마그네슘","칼슘","비타민B6","오메가3","칼륨"],
    foods:{
      eat:["다크 초콜릿·시금치·아몬드 — 마그네슘으로 PMS 경련·불안·두통 완화 (ACOG 2023)","우유·두부·케일 — 칼슘이 PMS 신체 증상 완화 (Cambridge 메타분석 2023)","닭고기·바나나·피스타치오 — 비타민B6로 기분 조절 호르몬 합성 지원","연어·호두·치아씨드 — 오메가3로 염증·우울감 완화","고구마·바나나·토마토 — 칼륨으로 붓기·수분 저류 감소","생강·강황차 — 항염증, 경련 완화, 소화 지원"],
      avoid:["짠 음식·가공육·라면 — 붓기·수분 저류 악화","커피·에너지음료 — 불안·수면 방해, PMS 증상 심화","알코올 — 세로토닌 감소로 우울감·예민함 악화","설탕·흰빵·과자 — 혈당 급등 후 폭락으로 기분 급변"]
    },
    exercise:["스트레칭·음인 요가 — 몸이 무거울 때 무리 없이 이완","가벼운 산책 20-30분 — 엔도르핀 소량 분비로 기분 전환","명상·호흡 운동 — 예민한 신경계 안정","따뜻한 목욕 후 스트레칭 — 근육 이완, 수면 개선"],
    tips:["PMS는 자연스러운 신호예요, 몸을 탓하지 말고 돌봐주세요","중요한 결정과 감정적인 대화는 가능하면 미루세요","충분한 수면과 혼자만의 시간을 확보하세요","증상이 심하면 산부인과 상담을 권해요"],
  },
];

const PHASE_SEASON_FOODS = {
  wolsik:{spring:["달래·냉이 — 철분+비타민C","바지락·주꾸미 — 타우린+철분 보충","딸기 — 비타민C로 철분 흡수 향상","봄동 — 엽산+칼슘, 자궁 회복 지원"],summer:["깻잎·낙지 — 철분+타우린","전복 — 아연+철분, 스태미나 보충","토마토·딸기 — 비타민C로 철분 흡수 향상","수박 — 수분+칼륨, 붓기 완화"],autumn:["연근·우엉 — 철분+식이섬유","갈치·꽁치 — 오메가3 (염증 완화)","사과·배 — 비타민C+식이섬유","버섯류 — 비타민D+셀레늄"],winter:["시금치 — 철분+마그네슘 (겨울 최고 철분원)","굴 — 아연+철분+타우린","귤·한라봉 — 비타민C로 철분 흡수 향상","꼬막 — 철분+단백질"]},
  choseung:{spring:["봄동·유채나물 — 엽산+비타민 (에너지 회복)","도다리·도미 — 단백질 (세포 회복 지원)","딸기 — 비타민C+항산화","달래 — 아연+알리신 (면역 회복)"],summer:["오이·애호박 — 수분+비타민 (장 환경 개선)","재첩·바지락 — 아연+타우린","자두·복숭아 — 항산화+비타민C","장어 — 단백질+비타민B군"],autumn:["사과·배 — 식이섬유+비타민C","전어 — 단백질+오메가3","고구마 — 비타민B+복합탄수화물","포도 — 레스베라트롤+항산화"],winter:["봄동·유채나물 — 엽산+칼슘","도미·꼬막 — 단백질+아연","한라봉·귤 — 비타민C","김·파래 — 아이오딘+식이섬유"]},
  sanghyun:{spring:["두릅·미나리 — 인돌+식이섬유","꽃게 — 비타민D+아연","딸기 — 항산화","쑥갓 — 엽산+비타민K"],summer:["브로콜리·애호박 — 인돌-3-카비놀","참치·장어 — 오메가3+비타민D","복숭아 — 항산화+수분","가지 — 안토시아닌+항산화"],autumn:["브로콜리·무 — 인돌+식이섬유","꽃게·대하 — 비타민D+아연","배·포도 — 항산화","버섯류 — 비타민D+셀레늄"],winter:["김·파래 — 아이오딘+식이섬유","굴 — 아연+비타민D","귤 — 비타민C","시금치 — 엽산+철분"]},
  boreum:{spring:["멍게·키조개 — 아연 (배란 직접 지원)","딸기·상추 — 비타민C+수분","바지락 — 아연+철분","아스파라거스 — 엽산+항산화"],summer:["전복 — 아연 (배란 기능 최적 지원)","수박·오이·토마토 — 수분+항산화","가지 — 항산화+수분","오이 — 수분 보충, 체온 조절"],autumn:["대하·꽃게 — 아연+셀레늄","포도·무화과 — 항산화","버섯류 — 셀레늄+비타민D","사과 — 비타민C+항산화"],winter:["굴·꼬막 — 아연+셀레늄 (배란 지원)","귤 — 비타민C","파래·김 — 아이오딘","시금치 — 엽산+비타민K"]},
  hahyun:{spring:["완두콩·재첩 — 트립토판+칼슘","부추 — 비타민B6+칼슘","매실 — 해독+소화 지원","쑥갓 — 칼슘+마그네슘"],summer:["옥수수·깻잎 — 복합탄수화물+칼슘","낙지 — 타우린+마그네슘","복숭아 — 수분+칼륨","애호박 — 식이섬유+비타민B"],autumn:["고구마·단호박 — 복합탄수화물+베타카로틴","밤 — 칼슘+복합탄수화물","전어 — 오메가3+단백질","감 — 비타민C+탄닌"],winter:["우엉·연근 — 식이섬유+마그네슘","굴 — 칼슘+아연","귤 — 비타민C+항산화","고구마 — 복합탄수화물+칼륨"]},
  geumeum:{spring:["시금치·달래 — 마그네슘+칼륨 (PMS 완화)","딸기 — 비타민C+항산화","두릅·미나리 — 비타민B+해독","바나나 — 칼륨+트립토판 (붓기 완화)"],summer:["깻잎·수박 — 마그네슘+칼륨 (붓기 완화)","옥수수 — 복합탄수화물+칼륨","낙지 — 마그네슘+타우린","복숭아 — 칼륨+수분"],autumn:["고구마·감 — 칼륨 (붓기·수분 저류 완화)","굴 — 마그네슘+칼슘+아연 (PMS 3중 지원)","사과 — 비타민C+항산화","단호박 — 베타카로틴+칼슘"],winter:["시금치·우엉 — 마그네슘+철분","굴 — 칼슘+마그네슘+아연 (PMS 3중 지원)","귤·한라봉 — 비타민C","고구마 — 칼륨+복합탄수화물"]},
};

function getPhaseSeasonalFoods(phaseId) {
  const m = new Date().getMonth() + 1;
  const sk = m>=3&&m<=5?"spring":m>=6&&m<=8?"summer":m>=9&&m<=11?"autumn":"winter";
  return PHASE_SEASON_FOODS[phaseId]?.[sk] || [];
}

const SEASONS = {
  spring:      { name:"봄",    emoji:"🌸", color:"#4a9e68", soft:"rgba(74,158,104,0.12)",  border:"rgba(74,158,104,0.25)",  exerciseTip:"봄은 야외 활동 시작하기 딱 좋은 계절이에요. 꽃가루 알레르기가 있다면 마스크 착용을 권해요.", exerciseBonus:["공원 달리기·조깅 — 일교차 있으니 얇은 겉옷 챙기기","자전거 라이딩 — 벚꽃 시즌엔 기분까지 좋아져요","등산 — 봄 산행은 진달래·철쭉 감상하며 유산소","야외 요가·스트레칭 — 잔디밭에서 몸풀기"] },
  summer_early:{ name:"장마철", emoji:"🌧️", color:"#5b7fa6", soft:"rgba(91,127,166,0.12)", border:"rgba(91,127,166,0.25)", exerciseTip:"장마철엔 야외 운동이 어렵고 습도가 높아 컨디션 관리가 중요해요. 실내 운동으로 루틴을 유지하세요.", exerciseBonus:["실내 수영 — 습도·더위 상관없이 전신 유산소","헬스장 HIIT — 에어컨 아래서 강도 높게","홈트레이닝 — 비 오는 날 집에서","필라테스·요가 스튜디오 — 비 맞지 않고 운동 가능"] },
  summer_late: { name:"한여름", emoji:"☀️", color:"#d4a050", soft:"rgba(212,160,80,0.12)",  border:"rgba(212,160,80,0.25)", exerciseTip:"폭염 시 낮 12-4시 야외 운동은 피하세요. 이른 아침(6-8시)이나 저녁(7-9시)을 활용하거나 실내로 이동하세요.", exerciseBonus:["이른 아침 달리기 — 해뜨기 전후 30분이 베스트","수영 — 폭염에도 체온 조절하며 전신 운동","야간 자전거 — 더위 식은 저녁 활용","실내 볼링·배드민턴 — 가볍게 즐기는 실내 스포츠"] },
  autumn:      { name:"가을",  emoji:"🍂", color:"#c08060", soft:"rgba(192,128,96,0.12)",  border:"rgba(192,128,96,0.25)", exerciseTip:"가을은 야외 운동 최적의 계절이에요. 일교차가 크니 워밍업을 충분히 하고, 오후 3-5시가 운동하기 가장 좋아요.", exerciseBonus:["등산·트레킹 — 단풍 시즌, 전신 유산소+하체 강화","마라톤·10km 대회 — 가을 레이스 시즌 도전해보세요","야외 사이클링 — 선선한 바람에 라이딩","테니스·배드민턴 — 야외 코트에서 즐기기"] },
  winter:      { name:"겨울",  emoji:"❄️", color:"#9898cc", soft:"rgba(152,152,204,0.12)", border:"rgba(152,152,204,0.25)", exerciseTip:"겨울엔 근육이 굳기 쉬워 부상 위험이 높아요. 준비운동을 평소보다 2배 길게 하고, 실내 운동 비중을 늘리세요.", exerciseBonus:["실내 수영·아쿠아로빅 — 추위 상관없이 전신 운동","헬스장 웨이트 — 추운 날 실내에서 근력 집중","스키·스노보드 — 겨울 시즌 스포츠 도전","핫요가 — 따뜻하게 몸 풀면서 유연성 향상"] },
};

function getActualSeason() {
  const m = new Date().getMonth() + 1;
  if (m>=3&&m<=5) return SEASONS.spring;
  if (m===6||m===7) return SEASONS.summer_early;
  if (m===8) return SEASONS.summer_late;
  if (m>=9&&m<=11) return SEASONS.autumn;
  return SEASONS.winter;
}

const PA = [
  { id:"choseung", s:0,            e:(4/28)*360  },
  { id:"sanghyun", s:(4/28)*360,   e:(8/28)*360  },
  { id:"boreum",   s:(8/28)*360,   e:(11/28)*360 },
  { id:"hahyun",   s:(11/28)*360,  e:(18/28)*360 },
  { id:"geumeum",  s:(18/28)*360,  e:(23/28)*360 },
  { id:"wolsik",   s:(23/28)*360,  e:360         },
];

function polar(cx,cy,r,deg){const rad=((deg-90)*Math.PI)/180;return{x:cx+r*Math.cos(rad),y:cy+r*Math.sin(rad)};}
function toDate(str){const[y,m,d]=str.split("-").map(Number);return new Date(y,m-1,d);}
function toStr(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;}
function todayStr(){return toStr(new Date());}
function daysBetween(a,b){return Math.round((toDate(b)-toDate(a))/86400000);}
function shiftDays(str,n){const d=toDate(str);d.setDate(d.getDate()+n);return toStr(d);}
function fmtKo(str){const d=toDate(str);return `${d.getMonth()+1}월 ${d.getDate()}일`;}

function phaseFromDay(day){
  if(day<=5) return PHASES[0];
  if(day<=9) return PHASES[1];
  if(day<=13) return PHASES[2];
  if(day<=16) return PHASES[3];
  if(day<=23) return PHASES[4];
  return PHASES[5];
}

function computeStats(periods){
  if(!periods||periods.length===0) return null;
  try{
    const sorted=[...periods].filter(p=>p&&p.start).sort((a,b)=>toDate(b.start)-toDate(a.start));
    if(!sorted.length) return null;
    const today=todayStr();
    const recentPast=sorted.find(p=>daysBetween(p.start,today)>=0);
    if(!recentPast) return null;
    const daysSince=daysBetween(recentPast.start,today)+1;
    let avgCycle=28;
    if(sorted.length>=2){
      const gaps=[];
      for(let i=0;i<sorted.length-1;i++){const g=daysBetween(sorted[i+1].start,sorted[i].start);if(g>=21&&g<=45)gaps.push(g);}
      if(gaps.length) avgCycle=Math.round(gaps.reduce((a,b)=>a+b,0)/gaps.length);
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
    if(cycleDay>=10&&cycleDay<=11){pPct=12;pLabel="낮음";}
    else if(cycleDay>=12&&cycleDay<=13){pPct=20;pLabel="보통";}
    else if(cycleDay===14){pPct=33;pLabel="높음";}
    else if(cycleDay>=15&&cycleDay<=17){pPct=25;pLabel="높음";}
    else if(cycleDay>=18&&cycleDay<=21){pPct=10;pLabel="낮음";}
    return{cycleDay,angle,phase,avgCycle,avgDuration,dIn:Math.max(1,cycleDay-phase.dayRange[0]+1),dTotal:phase.dayRange[1]-phase.dayRange[0]+1,dLeft:Math.max(0,phase.dayRange[1]-cycleDay+1),nextPeriod,dToNext,fertileStart,fertileEnd,ovulation,dToFertile,inFertile,pPct,pLabel};
  }catch(e){console.error("computeStats error:",e);return null;}
}

const STAR_DATA=(()=>{const arr=[];let v=9301;const rng=()=>{v=(v*49297+233453)%233280;return v/233280;};for(let i=0;i<140;i++)arr.push([rng()*1000,rng()*2200,rng()*0.9+0.2,rng()*0.45+0.1]);return arr;})();

function StarField(){
  return(
    <div style={{position:"fixed",inset:0,zIndex:0,pointerEvents:"none",overflow:"hidden",background:"radial-gradient(ellipse at 50% 20%, #0e0e2c 0%, #06061a 70%)"}}>
      <svg width="100%" height="100%" viewBox="0 0 1000 2200" preserveAspectRatio="xMidYMid slice" style={{position:"absolute",inset:0}}>
        {STAR_DATA.map(([x,y,r,op],i)=><circle key={i} cx={x} cy={y} r={r} fill="white" opacity={op}/>)}
      </svg>
    </div>
  );
}

const C={bg:"#07071e",card:"rgba(255,255,255,0.05)",text:"#ede8f5",muted:"#a8a8d0",border:"rgba(255,255,255,0.12)"};

function Clock({angle,selId,todayId,onSelect,ready,cycleDay,totalDays}){
  const cx=160,cy=160,R=110;
  const displayId=selId||todayId;
  const displayPhase=PHASES.find(p=>p.id===displayId);
  const MOON_CFG={wolsik:{il:0,wx:null},choseung:{il:0.2,wx:true},sanghyun:{il:0.5,wx:true},boreum:{il:1.0,wx:null},hahyun:{il:0.5,wx:false},geumeum:{il:0.2,wx:false}};
  const mc=MOON_CFG[displayId]||MOON_CFG.wolsik;
  function getMoonPath(il,wx,r){
    if(wx===null){
  if(il===0) return `M0,0 L0,0`; // 월식: 완전 어둠
  return `M${cx-r},${cy} a${r},${r} 0 1,0 ${r*2},0 a${r},${r} 0 1,0 -${r*2},0`;
}

    const rx=r*Math.abs(1-2*il);
    const sw=il<=0.5?(wx?0:1):(wx?1:0);
    return wx?`M${cx},${cy-r} A${r},${r} 0 0 1 ${cx},${cy+r} A${rx},${r} 0 0 ${sw} ${cx},${cy-r}`
             :`M${cx},${cy-r} A${r},${r} 0 0 0 ${cx},${cy+r} A${rx},${r} 0 0 ${sw} ${cx},${cy-r}`;
  }

  function textArcPath(s,e){
    const mid=(s+e)/2,isBottom=mid>90&&mid<260,pad=3,Rl=R+26;
    if(!isBottom){const p1=polar(cx,cy,Rl,s+pad),p2=polar(cx,cy,Rl,e-pad);return `M${p1.x} ${p1.y} A${Rl} ${Rl} 0 ${(e-s-pad*2)>180?1:0} 1 ${p2.x} ${p2.y}`;}
    else{const p1=polar(cx,cy,Rl,e-pad),p2=polar(cx,cy,Rl,s+pad);return `M${p1.x} ${p1.y} A${Rl} ${Rl} 0 ${(e-s-pad*2)>180?1:0} 0 ${p2.x} ${p2.y}`;}
  }
  return(
    <div style={{position:"relative",width:320,height:320,margin:"0 auto"}}>
      <div style={{position:"absolute",inset:10,borderRadius:"50%",background:"rgba(15,15,50,0.6)",border:"1px solid rgba(255,255,255,0.08)",zIndex:0}}/>
      <svg viewBox="0 0 320 320" style={{width:"100%",height:"100%",overflow:"visible",position:"relative",zIndex:1}}>
        <defs>
          {PA.map(pa=><path key={pa.id} id={`tp-${pa.id}`} d={textArcPath(pa.s,pa.e)} fill="none"/>)}
          <clipPath id="mcp"><path d={getMoonPath(mc.il,mc.wx,40)}/></clipPath>
        </defs>
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="22"/>
        {PA.map(pa=>{
          const ph=PHASES.find(p=>p.id===pa.id);
          const isSel=pa.id===selId,isTod=pa.id===todayId,span=pa.e-pa.s;
          const p1=polar(cx,cy,R,pa.s+1.5),p2=polar(cx,cy,R,pa.e-1.5),large=(span-3)>180?1:0;
          return(
            <g key={pa.id}>
              <path d={`M${p1.x} ${p1.y} A${R} ${R} 0 ${large} 1 ${p2.x} ${p2.y}`} fill="none" stroke={ph.color} strokeWidth={isSel?22:16} strokeLinecap="round" opacity={isSel?0.9:isTod?0.7:0.35} style={{transition:"all 0.4s",cursor:"pointer",filter:isSel?`drop-shadow(0 0 8px ${ph.color})`:"none"}} onClick={()=>onSelect(pa.id)}/>
              <path d={`M${p1.x} ${p1.y} A${R} ${R} 0 ${large} 1 ${p2.x} ${p2.y}`} fill="none" stroke="transparent" strokeWidth="36" style={{cursor:"pointer"}} onClick={()=>onSelect(pa.id)}/>
            </g>
          );
        })}
        {angle!==null&&(
          <g style={{transform:`rotate(${angle}deg)`,transformOrigin:`${cx}px ${cy}px`,transition:ready?"transform 1.5s cubic-bezier(0.34,1.56,0.64,1)":"none"}}>
            <line x1={cx} y1={cy} x2={cx} y2={cy-(R-10)} stroke={displayPhase?.color||"#aaa"} strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
            <line x1={cx} y1={cy} x2={cx} y2={cy-(R-10)} stroke="white" strokeWidth="0.6" strokeLinecap="round" opacity="0.2"/>
          </g>
        )}
        {PA.map(pa=>{
          const ph=PHASES.find(p=>p.id===pa.id);
          const isSel=pa.id===selId,isTod=pa.id===todayId,span=pa.e-pa.s;
          const fs=span<42?"8.5":span<55?"9.5":"10.5";
          return(
            <text key={pa.id} fontFamily="system-ui,sans-serif" fontSize={fs} fontWeight="600" fill={isSel||isTod?ph.color:"rgba(255,255,255,0.4)"} style={{cursor:"pointer",transition:"fill 0.3s"}} onClick={()=>onSelect(pa.id)}>
              <textPath href={`#tp-${pa.id}`} startOffset="50%" textAnchor="middle">{ph.moon} {ph.name}</textPath>
            </text>
          );
        })}
        <circle cx={cx} cy={cy} r="40" fill="rgba(255,255,255,0.02)"/>
        <circle cx={cx} cy={cy} r="40" fill="#E2C07D" clipPath="url(#mcp)" style={{transition:"all 1s ease",filter:"drop-shadow(0 0 12px rgba(226,192,125,0.6))"}}/>

        {cycleDay!=null&&(
          <>
            <text x={cx} y={cy+22} textAnchor="middle" fontSize="32" fontWeight="300" fill={displayPhase?.color||"#fff"} fontFamily="system-ui,sans-serif" opacity="0.9">{cycleDay}</text>
            <text x={cx} y={cy+36} textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.4)" fontFamily="system-ui,sans-serif">/ {totalDays}일</text>
            <text x={cx} y={cy+50} textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.3)" fontFamily="system-ui,sans-serif">{new Date().toLocaleDateString("ko-KR",{month:"numeric",day:"numeric",weekday:"short"})}</text>
          </>
        )}
      </svg>
    </div>
  );
}

function MiniStat({label,value,sub,color}){
  return(
    <div style={{background:"rgba(255,255,255,0.05)",borderRadius:11,padding:"11px 6px",textAlign:"center",border:"1px solid rgba(255,255,255,0.08)"}}>
      <div style={{fontSize:11,color:C.muted,opacity:0.8,marginBottom:4,fontWeight:500}}>{label}</div>
      <div style={{fontSize:20,fontWeight:700,color:color||C.text}}>{value}</div>
      <div style={{fontSize:10,color:C.muted,opacity:0.6}}>{sub}</div>
    </div>
  );
}

function DdayRow({stats}){
  const pColor=stats.pPct>=20?PHASES[3].color:stats.pPct>=12?PHASES[2].color:PHASES[0].color;
  return(
    <div style={{marginBottom:14}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:8}}>
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:"12px 8px",textAlign:"center"}}>
          <div style={{fontSize:11,color:C.muted,fontWeight:600,marginBottom:5,lineHeight:1.4}}>다음<br/>생리까지</div>
          <div style={{fontSize:stats.dToNext===0?14:22,fontWeight:700,color:C.text}}>{stats.dToNext===0?"오늘":`D-${stats.dToNext}`}</div>
          <div style={{fontSize:11,color:C.muted,marginTop:3}}>{fmtKo(stats.nextPeriod)}</div>
        </div>
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:"12px 8px",textAlign:"center"}}>
          <div style={{fontSize:11,color:C.muted,fontWeight:600,marginBottom:5,lineHeight:1.4}}>다음<br/>가임기까지</div>
          {stats.inFertile?(
            <div style={{fontSize:13,fontWeight:700,color:PHASES[3].color,lineHeight:1.3}}>가임기<br/>진행 중</div>
          ):(
            <>
              <div style={{fontSize:22,fontWeight:700,color:C.text}}>{stats.dToFertile<=0?"종료":`D-${stats.dToFertile}`}</div>
              <div style={{fontSize:11,color:C.muted,marginTop:3}}>{fmtKo(stats.fertileStart)}~</div>
            </>
          )}
        </div>
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:"12px 8px",textAlign:"center"}}>
          <div style={{fontSize:11,color:C.muted,fontWeight:600,marginBottom:5,lineHeight:1.4}}>현재<br/>임신확률</div>
          <div style={{fontSize:22,fontWeight:700,color:pColor}}>{stats.pPct}%</div>
          <div style={{fontSize:11,marginTop:2,fontWeight:600,color:pColor}}>{stats.pLabel}</div>
          <div style={{background:"rgba(255,255,255,0.08)",borderRadius:3,height:3,marginTop:5,overflow:"hidden"}}>
            <div style={{width:`${(stats.pPct/33)*100}%`,height:"100%",background:pColor,borderRadius:3,transition:"width 0.6s"}}/>
          </div>
        </div>
      </div>
      <div style={{display:"flex",alignItems:"flex-start",gap:6,padding:"8px 12px",background:"rgba(152,152,204,0.08)",borderRadius:10,border:`1px solid ${C.border}`}}>
        <span style={{fontSize:11,color:C.muted,flexShrink:0,marginTop:1}}>⚠️</span>
        <p style={{margin:0,fontSize:10.5,color:C.muted,lineHeight:1.65}}>임신 확률 및 가임기 정보는 <strong style={{color:C.text}}>통계적 추정치</strong>로, 개인차가 있으며 의학적 진단을 대체하지 않습니다. 임신 계획 또는 피임 목적으로 사용 시 전문 의료인과 반드시 상담하세요.</p>
      </div>
    </div>
  );
}

function CalView({periods,stats,setPeriods}){
  const[calMonth,setCalMonth]=useState(new Date());
  const[modal,setModal]=useState(null);
  const yr=calMonth.getFullYear(),mo=calMonth.getMonth();
  const firstDay=new Date(yr,mo,1).getDay(),daysInMonth=new Date(yr,mo+1,0).getDate();
  const today=todayStr(),avgCycle=stats?.avgCycle||28;
  const avgDuration=stats?.avgDuration||(periods.filter(p=>p.end).length>0?Math.round(periods.filter(p=>p.end).reduce((a,p)=>a+daysBetween(p.start,p.end)+1,0)/periods.filter(p=>p.end).length):5);
  const cells=[];
  for(let i=0;i<firstDay;i++)cells.push(null);
  for(let d=1;d<=daysInMonth;d++)cells.push(`${yr}-${String(mo+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`);
  function getDayPhase(ds){if(!periods.length)return null;const sorted=[...periods].sort((a,b)=>toDate(b.start)-toDate(a.start));const ref=sorted.find(p=>p.start<=ds);if(!ref)return null;return phaseFromDay((daysBetween(ref.start,ds)%avgCycle)+1);}
  function getPeriodForDay(ds){return periods.find(p=>{const end=p.end||shiftDays(p.start,4);return ds>=p.start&&ds<=end;});}
  function findNearbyPeriod(ds){return periods.find(p=>{const end=p.end||shiftDays(p.start,4);return Math.abs(daysBetween(end,ds))<=7&&ds>p.start;});}
  function handleDayTap(ds){const period=getPeriodForDay(ds);if(period){setModal({ds,mode:"menu",period});return;}const nearby=findNearbyPeriod(ds);setModal(nearby?{ds,mode:"edit",period:nearby}:{ds,mode:"action"});}
  function addStart(ds){setPeriods(prev=>[...prev,{id:Date.now(),start:ds,end:shiftDays(ds,avgDuration-1)}]);setModal(null);}
  function addEnd(ds){setPeriods(prev=>{const open=[...prev].sort((a,b)=>toDate(b.start)-toDate(a.start)).find(p=>!p.end&&p.start<=ds);if(!open)return[...prev,{id:Date.now(),start:ds,end:null}];return prev.map(p=>p.id===open.id?{...p,end:ds}:p);});setModal(null);}
  function editEnd(id,ds){setPeriods(prev=>prev.map(p=>p.id===id?{...p,end:ds}:p));setModal(null);}
  function deletePeriod(id){setPeriods(prev=>prev.filter(p=>p.id!==id));setModal(null);}
  return(
    <div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
        <button onClick={()=>setCalMonth(new Date(yr,mo-1,1))} style={{background:"none",border:"none",fontSize:20,color:C.muted,padding:"4px 12px"}}>&#8249;</button>
        <div style={{fontSize:15,fontWeight:700,color:C.text}}>{yr}년 {mo+1}월</div>
        <button onClick={()=>setCalMonth(new Date(yr,mo+1,1))} style={{background:"none",border:"none",fontSize:20,color:C.muted,padding:"4px 12px"}}>&#8250;</button>
      </div>
      <div style={{fontSize:11,color:C.muted,marginBottom:12,textAlign:"center",background:PHASES[0].soft,borderRadius:10,padding:"7px 12px",border:`1px solid ${PHASES[0].border}`}}>날짜를 탭하면 생리 기록을 추가할 수 있어요</div>
      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
        {PHASES.map(p=>(
          <div key={p.id} style={{display:"flex",alignItems:"center",gap:3}}>
            <div style={{width:10,height:10,borderRadius:2,background:p.soft,border:`1.5px solid ${p.color}`}}/>
            <span style={{fontSize:9.5,color:C.muted}}>{p.moon}{p.name}</span>
          </div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",marginBottom:4}}>
        {["일","월","화","수","목","금","토"].map(d=><div key={d} style={{textAlign:"center",fontSize:10,fontWeight:700,color:C.muted,padding:"4px 0"}}>{d}</div>)}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3}}>
        {cells.map((ds,i)=>{
          if(!ds)return <div key={i}/>;
          const isToday=ds===today,ph=getDayPhase(ds),inPeriod=!!getPeriodForDay(ds);
          const inFertile=stats&&ds>=stats.fertileStart&&ds<=stats.fertileEnd,isOvu=stats&&ds===stats.ovulation;
          let bg="transparent",bdr="1px solid transparent",col=C.text;
          if(inPeriod){bg=PHASES[0].soft;bdr=`1.5px solid ${PHASES[0].border}`;col=PHASES[0].text;}
          else if(isOvu){bg=PHASES[3].soft;bdr=`2px solid ${PHASES[3].color}`;col=PHASES[3].text;}
          else if(inFertile){bg="transparent";bdr=`1.5px dashed ${PHASES[3].color}`;col=PHASES[3].text;}
          else if(ph){bg=ph.soft;col=ph.text;}
          if(isToday)bdr="2px solid rgba(255,255,255,0.6)";
          return(
            <div key={i} onClick={()=>handleDayTap(ds)} style={{aspectRatio:"1",display:"flex",alignItems:"center",justifyContent:"center",borderRadius:7,background:bg,border:bdr,cursor:"pointer",WebkitTapHighlightColor:"transparent"}}>
              <span style={{fontSize:11,fontWeight:isToday?700:400,color:col}}>{parseInt(ds.split("-")[2])}</span>
            </div>
          );
        })}
      </div>
      {stats&&(
        <div style={{marginTop:14,background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:"13px 15px"}}>
          <div style={{fontWeight:700,color:C.text,marginBottom:8,fontSize:13}}>이번 달 예측</div>
          {[{label:"다음 생리",date:stats.nextPeriod,ph:PHASES[0],emoji:"🌑"},{label:"배란 예정",date:stats.ovulation,ph:PHASES[3],emoji:"🌕"},{label:"가임기 시작",date:stats.fertileStart,ph:PHASES[3],emoji:"🌿"}].map(s=>(
            <div key={s.label} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 12px",background:s.ph.soft,borderRadius:10,border:`1px solid ${s.ph.border}`,marginBottom:6}}>
              <span style={{fontSize:12,color:s.ph.text,fontWeight:600}}>{s.emoji} {s.label}</span>
              <span style={{fontSize:12,color:s.ph.text,fontWeight:700}}>{fmtKo(s.date)}</span>
            </div>
          ))}
        </div>
      )}
      {modal&&(
        <div onClick={()=>setModal(null)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",display:"flex",alignItems:"flex-end",zIndex:100}}>
          <div onClick={e=>e.stopPropagation()} style={{width:"100%",background:"#14143a",borderRadius:"20px 20px 0 0",padding:"20px 20px 36px",boxShadow:"0 -4px 24px rgba(0,0,0,0.4)"}}>
            <div style={{textAlign:"center",marginBottom:16}}><div style={{fontSize:13,fontWeight:700,color:C.text}}>{fmtKo(modal.ds)} {modal.ds===today?"· 오늘":""}</div></div>
            {modal.mode==="action"&&(<div style={{display:"grid",gap:10}}><button onClick={()=>addStart(modal.ds)} style={{padding:"15px",background:PHASES[0].soft,border:`1.5px solid ${PHASES[0].border}`,borderRadius:14,fontSize:14,fontWeight:700,color:PHASES[0].text,cursor:"pointer"}}>🌑 생리 시작일로 기록</button><button onClick={()=>addEnd(modal.ds)} style={{padding:"15px",background:C.card,border:`1.5px solid ${C.border}`,borderRadius:14,fontSize:14,fontWeight:600,color:C.text,cursor:"pointer"}}>✓ 생리 종료일로 기록</button><button onClick={()=>setModal(null)} style={{padding:"12px",background:"transparent",border:"none",fontSize:13,color:C.muted,cursor:"pointer"}}>취소</button></div>)}
            {modal.mode==="edit"&&(<div style={{display:"grid",gap:10}}><div style={{padding:"12px 14px",background:"rgba(212,160,80,0.1)",borderRadius:12,fontSize:12,color:PHASES[3].text,lineHeight:1.6}}><strong>종료일 근처 기록이 있어요</strong><br/>{fmtKo(modal.period.start)}{modal.period.end?` ~ ${fmtKo(modal.period.end)}`:" (종료일 미입력)"}</div><button onClick={()=>editEnd(modal.period.id,modal.ds)} style={{padding:"14px",background:PHASES[0].soft,border:`1.5px solid ${PHASES[0].border}`,borderRadius:14,fontSize:14,fontWeight:700,color:PHASES[0].text,cursor:"pointer"}}>✓ 종료일을 {fmtKo(modal.ds)}로 수정</button><button onClick={()=>setModal({...modal,mode:"action"})} style={{padding:"14px",background:C.card,border:`1.5px solid ${C.border}`,borderRadius:14,fontSize:13,fontWeight:600,color:C.muted,cursor:"pointer"}}>+ 새 기록으로 추가</button><button onClick={()=>setModal(null)} style={{padding:"12px",background:"transparent",border:"none",fontSize:13,color:C.muted,cursor:"pointer"}}>취소</button></div>)}
            {modal.mode==="menu"&&(<div style={{display:"grid",gap:10}}><div style={{padding:"12px 14px",background:PHASES[0].soft,borderRadius:12,fontSize:12,color:PHASES[0].text}}>기록된 생리: {fmtKo(modal.period.start)}{modal.period.end?` ~ ${fmtKo(modal.period.end)}`:" (종료일 없음)"}</div><button onClick={()=>editEnd(modal.period.id,modal.ds)} style={{padding:"14px",background:C.card,border:`1.5px solid ${C.border}`,borderRadius:14,fontSize:14,fontWeight:600,color:C.text,cursor:"pointer"}}>✓ 종료일을 {fmtKo(modal.ds)}로 변경</button><button onClick={()=>deletePeriod(modal.period.id)} style={{padding:"14px",background:"rgba(239,68,68,0.1)",border:"1.5px solid rgba(239,68,68,0.3)",borderRadius:14,fontSize:14,fontWeight:600,color:"#f87171",cursor:"pointer"}}>🗑 이 기록 삭제</button><button onClick={()=>setModal(null)} style={{padding:"12px",background:"transparent",border:"none",fontSize:13,color:C.muted,cursor:"pointer"}}>취소</button></div>)}
          </div>
        </div>
      )}
    </div>
  );
}

function DateSelect({label,value,onChange}){
  const now=new Date();
  const[y,m,d]=value?value.split("-").map(Number):[now.getFullYear(),now.getMonth()+1,now.getDate()];
  const years=Array.from({length:5},(_,i)=>now.getFullYear()-2+i);
  const months=Array.from({length:12},(_,i)=>i+1);
  const days=Array.from({length:new Date(y||now.getFullYear(),(m||1),0).getDate()},(_,i)=>i+1);
  const ss={flex:1,minWidth:0,background:"rgba(255,255,255,0.06)",border:`1px solid ${C.border}`,borderRadius:8,color:C.text,padding:"9px 6px",fontSize:13,outline:"none",fontFamily:"system-ui,sans-serif",appearance:"none",textAlign:"center"};
  function update(ny,nm,nd){onChange(`${String(ny).padStart(4,"0")}-${String(nm).padStart(2,"0")}-${String(nd).padStart(2,"0")}`);}
  return(
    <div>
      <div style={{fontSize:11,color:C.muted,marginBottom:5,fontWeight:500}}>{label}</div>
      <div style={{display:"flex",gap:5}}>
        <select value={y||now.getFullYear()} onChange={e=>update(+e.target.value,m||1,d||1)} style={ss}>{years.map(yr=><option key={yr} value={yr}>{yr}년</option>)}</select>
        <select value={m||1} onChange={e=>update(y||now.getFullYear(),+e.target.value,d||1)} style={ss}>{months.map(mo=><option key={mo} value={mo}>{mo}월</option>)}</select>
        <select value={d||1} onChange={e=>update(y||now.getFullYear(),m||1,+e.target.value)} style={ss}>{days.map(dy=><option key={dy} value={dy}>{dy}일</option>)}</select>
      </div>
    </div>
  );
}

function RecordView({periods,setPeriods}){
  const[ns,setNs]=useState("");const[ne,setNe]=useState("");
  const now=new Date(),todayVal=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`;
  function doAdd(){if(!ns)return;setPeriods(prev=>[...prev,{id:Date.now(),start:ns,end:ne||null}]);setNs("");setNe("");}
  const sorted=[...periods].sort((a,b)=>toDate(b.start)-toDate(a.start));
  const avgDur=sorted.filter(x=>x.end).length>0?Math.round(sorted.filter(x=>x.end).reduce((a,x)=>a+daysBetween(x.start,x.end)+1,0)/sorted.filter(x=>x.end).length):5;
  return(
    <div>
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:20,padding:"18px",marginBottom:20}}>
        <div style={{fontSize:14,fontWeight:700,marginBottom:13,color:C.text}}>생리 기록 추가</div>
        <div style={{display:"grid",gap:12}}>
          <DateSelect label="시작일 *" value={ns||todayVal} onChange={setNs}/>
          <DateSelect label="종료일 (선택)" value={ne||todayVal} onChange={setNe}/>
          <div style={{display:"flex",gap:8}}>
            <button onClick={doAdd} style={{flex:1,padding:"12px",background:"rgba(152,152,204,0.2)",border:`1px solid ${PHASES[0].border}`,borderRadius:12,color:C.text,fontSize:13,fontWeight:700}}>기록 추가하기</button>
            {ne&&<button onClick={()=>setNe("")} style={{padding:"12px 14px",background:"transparent",border:`1px solid ${C.border}`,borderRadius:12,color:C.muted,fontSize:12}}>종료일 없음</button>}
          </div>
        </div>
      </div>
      {sorted.length>0&&(
        <>
          <div style={{fontSize:10,color:C.muted,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:9,fontWeight:600}}>기록 내역 ({sorted.length}건)</div>
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:16,overflow:"hidden"}}>
            <div style={{display:"grid",gridTemplateColumns:"2fr 2fr 1fr 1fr 28px",padding:"9px 14px",borderBottom:`1px solid ${C.border}`,background:"rgba(255,255,255,0.03)"}}>
              {["시작일","종료일","기간","주기",""].map((h,i)=><div key={i} style={{fontSize:10,fontWeight:700,color:C.muted}}>{h}</div>)}
            </div>
            {sorted.map((p,i)=>{
              const prev=sorted[i+1],dur=p.end?daysBetween(p.start,p.end)+1:null,cyc=prev?daysBetween(prev.start,p.start):null,estEnd=!p.end?shiftDays(p.start,avgDur-1):null;
              return(
                <div key={p.id} style={{display:"grid",gridTemplateColumns:"2fr 2fr 1fr 1fr 28px",alignItems:"center",padding:"10px 14px",borderBottom:i<sorted.length-1?`1px solid ${C.border}`:"none"}}>
                  <div style={{fontSize:12,fontWeight:i===0?700:400,color:C.text}}>{fmtKo(p.start)}</div>
                  <div style={{fontSize:12,color:p.end?C.text:C.muted}}>{p.end?fmtKo(p.end):<span>{fmtKo(estEnd)} <span style={{fontSize:10,color:"rgba(255,255,255,0.2)"}}>(예상)</span></span>}</div>
                  <div style={{fontSize:12,color:C.text}}>{dur?`${dur}일`:<span style={{fontSize:11,color:C.muted}}>{avgDur}일</span>}</div>
                  <div style={{fontSize:12,color:C.muted}}>{cyc?`${cyc}일`:"-"}</div>
                  <button onClick={()=>setPeriods(prev=>prev.filter(x=>x.id!==p.id))} style={{background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.2)",borderRadius:6,color:"#f87171",padding:"3px 5px",fontSize:11,lineHeight:1}}>x</button>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

const NOTIF_KEY="cycle-notif-prefs-v1";
function loadNotifPrefs(){try{const r=localStorage.getItem(NOTIF_KEY);return r?JSON.parse(r):{period3:true,period1:true,fertile:true,ovulation:true,phaseChange:false,dailyTip:false,hour:8};}catch{return{period3:true,period1:true,fertile:true,ovulation:true,phaseChange:false,dailyTip:false,hour:8};}}
async function requestAndNotify(title,body){if(!("Notification" in window)){alert("이 브라우저는 알림을 지원하지 않아요");return;}let perm=Notification.permission;if(perm==="default")perm=await Notification.requestPermission();if(perm==="granted")new Notification(title,{body,icon:"/favicon.ico"});else alert("알림 권한이 거부됐어요.");}
function Toggle({on,onChange}){return(<div onClick={()=>onChange(!on)} style={{width:44,height:24,borderRadius:12,flexShrink:0,cursor:"pointer",background:on?PHASES[1].color:"rgba(255,255,255,0.15)",position:"relative",transition:"background 0.2s"}}><div style={{position:"absolute",top:3,left:on?22:3,width:18,height:18,borderRadius:"50%",background:"white",boxShadow:"0 1px 4px rgba(0,0,0,0.3)",transition:"left 0.2s"}}/></div>);}

 function PhaseBar({dp, stats, togglePhase}) {
  const selIdx = PHASES.findIndex(p => p.id === dp?.id);
  const [scale, setScale] = useState(1);
  const prevIdx = useRef(-1);

  useEffect(() => {
    if (prevIdx.current !== selIdx && selIdx >= 0) {
      setScale(1.08);
      const t = setTimeout(() => setScale(1), 350);
      prevIdx.current = selIdx;
      return () => clearTimeout(t);
    }
  }, [selIdx]);

  const W = 100 / PHASES.length;
  const sel = selIdx >= 0 ? PHASES[selIdx] : null;

  return (
    <div style={{marginBottom:20}}>
      <div style={{fontSize:10,color:C.muted,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:9,fontWeight:600}}>달 위상 탐색</div>
      <div style={{position:"relative",borderRadius:18,background:"rgba(255,255,255,0.03)",border:`1px solid ${C.border}`,overflow:"hidden"}}>

        {/* 슬라이딩 유리 인디케이터 */}
        {sel && (
          <>
            {/* 메인 필 */}
            <div style={{
              position:"absolute", top:4, bottom:4,
              left:`calc(${selIdx} * ${W}% + 3px)`,
              width:`calc(${W}% - 6px)`,
              borderRadius:12,
              background:sel.soft,
              border:`1.5px solid ${sel.border}`,
              backdropFilter:"blur(12px)",
              boxShadow:`0 0 16px ${sel.color}50, inset 0 1px 0 rgba(255,255,255,0.18), inset 0 -1px 0 rgba(0,0,0,0.25)`,
              transform:`scaleY(${scale}) scaleX(${0.96 + scale * 0.04})`,
              transformOrigin:"center",
              transition:"left 0.55s cubic-bezier(0.34,1.56,0.64,1), border-color 0.3s, box-shadow 0.3s, transform 0.35s cubic-bezier(0.34,1.56,0.64,1)",
              pointerEvents:"none", zIndex:1,
            }}/>
            {/* 유리 렌즈 하이라이트 */}
            <div style={{
              position:"absolute", top:4, bottom:4,
              left:`calc(${selIdx} * ${W}% + 3px)`,
              width:`calc(${W}% - 6px)`,
              borderRadius:12,
              background:"radial-gradient(ellipse at 35% 25%, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.04) 55%, transparent 100%)",
              transform:`scaleY(${scale}) scaleX(${0.96 + scale * 0.04})`,
              transformOrigin:"center",
              transition:"left 0.55s cubic-bezier(0.34,1.56,0.64,1), transform 0.35s cubic-bezier(0.34,1.56,0.64,1)",
              pointerEvents:"none", zIndex:2,
            }}/>
            {/* 좌우 엣지 왜곡 글로우 */}
            <div style={{
              position:"absolute", top:0, bottom:0,
              left:`calc(${selIdx} * ${W}% - 2px)`,
              width:`calc(${W}% + 4px)`,
              background:`radial-gradient(ellipse at left, ${sel.color}18 0%, transparent 40%) left / 50% 100% no-repeat, radial-gradient(ellipse at right, ${sel.color}18 0%, transparent 40%) right / 50% 100% no-repeat`,
              transform:`scaleY(${scale})`,
              transformOrigin:"center",
              transition:"left 0.55s cubic-bezier(0.34,1.56,0.64,1), transform 0.35s cubic-bezier(0.34,1.56,0.64,1)",
              pointerEvents:"none", zIndex:1,
            }}/>
          </>
        )}

        {/* 위상 아이템들 */}
        <div style={{display:"flex",position:"relative",zIndex:3}}>
          {PHASES.map((p,i) => {
            const isSel = p.id === dp?.id;
            const isToday = p.id === stats?.phase?.id;
            return (
              <button key={p.id} onClick={()=>togglePhase(p.id)} style={{
                flex:1, padding:"11px 2px 9px", border:"none", background:"transparent",
                display:"flex", flexDirection:"column", alignItems:"center", gap:3, cursor:"pointer",
              }}>
                <span style={{
                  fontSize:17, lineHeight:1,
                  filter:isSel?`drop-shadow(0 0 7px ${p.color})`:"none",
                  transform:isSel?`scale(${scale})`:"scale(1)",
                  transition:"filter 0.3s, transform 0.35s cubic-bezier(0.34,1.56,0.64,1)",
                  display:"block",
                }}>{p.moon}</span>
                <span style={{
                  fontSize:8.5, fontWeight:700, lineHeight:1.3, textAlign:"center",
                  color:isSel?p.text:C.muted,
                  transition:"color 0.3s",
                }}>{p.name}</span>
                {isToday && <div style={{width:3,height:3,borderRadius:"50%",background:p.color,marginTop:1}}/>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

 
function MyPage({stats,periods,user}){
  const[prefs,setPrefs]=useState(loadNotifPrefs);
  const[notifPerm,setNotifPerm]=useState(typeof Notification!=="undefined"?Notification.permission:"unsupported");
  useEffect(()=>{try{localStorage.setItem(NOTIF_KEY,JSON.stringify(prefs));}catch{}},[prefs]);
  function set(key,val){setPrefs(p=>({...p,[key]:val}));}
  const NOTIF_ITEMS=[{key:"period3",label:"생리 예정 D-3",desc:"생리 3일 전 미리 알림"},{key:"period1",label:"생리 예정 D-1",desc:"생리 하루 전 알림"},{key:"fertile",label:"가임기 시작",desc:"가임기 첫날 알림"},{key:"ovulation",label:"배란 예정일",desc:"배란 예상 당일 알림"},{key:"phaseChange",label:"위상 변경",desc:"새 달 위상 시작일 알림"},{key:"dailyTip",label:"오늘의 팁",desc:"현재 위상 맞춤 조언"}];
  return(
    <div>
      {user&&(
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:"14px 16px",marginBottom:20,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            {user.photoURL&&<img src={user.photoURL} alt="" style={{width:38,height:38,borderRadius:"50%",border:`1.5px solid ${C.border}`}}/>}
            <div><div style={{fontSize:13,fontWeight:700,color:C.text}}>{user.displayName||"사용자"}</div><div style={{fontSize:11,color:C.muted}}>{user.email}</div></div>
          </div>
          <button onClick={()=>signOut(auth)} style={{padding:"7px 14px",background:"transparent",border:`1px solid ${C.border}`,borderRadius:100,fontSize:12,color:C.muted,cursor:"pointer"}}>로그아웃</button>
        </div>
      )}
      <div style={{fontSize:14,fontWeight:700,marginBottom:12,color:C.text}}>나의 통계</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:22}}>
        {[{l:"평균 생리 주기",v:stats?`${stats.avgCycle}일`:"-",sub:"기록 기반",ph:PHASES[1]},{l:"평균 생리 기간",v:stats?`${stats.avgDuration}일`:"-",sub:"종료일 기반",ph:PHASES[0]},{l:"총 기록 횟수",v:`${periods.length}회`,sub:"누적",ph:PHASES[3]},{l:"이번 사이클",v:stats?`${stats.cycleDay}일차`:"-",sub:`/ ${stats?.avgCycle||28}일`,ph:PHASES[2]}].map(s=>(
          <div key={s.l} style={{background:s.ph.soft,borderRadius:16,padding:"15px 13px",border:`1px solid ${s.ph.border}`}}>
            <div style={{fontSize:10,color:C.muted,marginBottom:7}}>{s.l}</div>
            <div style={{fontSize:24,fontWeight:700,color:s.ph.color,lineHeight:1}}>{s.v}</div>
            <div style={{fontSize:10,color:C.muted,marginTop:5}}>{s.sub}</div>
          </div>
        ))}
      </div>
      <div style={{fontSize:14,fontWeight:700,marginBottom:12,color:C.text}}>알림 설정</div>
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:16,overflow:"hidden",marginBottom:12}}>
        {notifPerm!=="granted"&&(
          <div style={{padding:"13px 16px",background:notifPerm==="denied"?"rgba(239,68,68,0.1)":PHASES[1].soft,borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",gap:10}}>
            <div style={{fontSize:12,color:notifPerm==="denied"?"#f87171":PHASES[1].text,lineHeight:1.5}}>{notifPerm==="denied"?"알림이 차단됐어요. 브라우저 설정에서 허용해주세요.":"알림을 받으려면 권한이 필요해요"}</div>
            {notifPerm!=="denied"&&<button onClick={async()=>{const p=await Notification.requestPermission();setNotifPerm(p);}} style={{flexShrink:0,padding:"6px 14px",background:PHASES[1].color,border:"none",borderRadius:100,color:"white",fontSize:12,fontWeight:700}}>허용하기</button>}
          </div>
        )}
        <div style={{padding:"14px 16px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div><div style={{fontSize:13,fontWeight:600,color:C.text,marginBottom:2}}>알림 시간</div><div style={{fontSize:11,color:C.muted}}>매일 이 시간에 알림을 보내요</div></div>
          <select value={prefs.hour} onChange={e=>set("hour",+e.target.value)} style={{background:"rgba(255,255,255,0.06)",border:`1px solid ${C.border}`,borderRadius:8,color:C.text,padding:"7px 10px",fontSize:13,outline:"none"}}>
            {[6,7,8,9,10,11,12,13,18,19,20,21,22].map(h=><option key={h} value={h}>{h<12?`오전 ${h}시`:h===12?"오후 12시":`오후 ${h-12}시`}</option>)}
          </select>
        </div>
        {NOTIF_ITEMS.map((item,i)=>(
          <div key={item.key} style={{padding:"13px 16px",borderBottom:i<NOTIF_ITEMS.length-1?`1px solid ${C.border}`:"none",display:"flex",alignItems:"center",justifyContent:"space-between",gap:12}}>
            <div style={{flex:1}}><div style={{fontSize:13,fontWeight:600,color:C.text,marginBottom:1}}>{item.label}</div><div style={{fontSize:11,color:C.muted}}>{item.desc}</div></div>
            <Toggle on={prefs[item.key]} onChange={v=>set(item.key,v)}/>
          </div>
        ))}
      </div>
      <button onClick={()=>requestAndNotify("🌙 Me:ll",stats?`오늘은 ${stats.phase.moon} ${stats.phase.name} ${stats.cycleDay}일차예요 — ${stats.phase.keyword}`:"생리 기록을 추가해보세요!")} style={{width:"100%",padding:"13px",marginBottom:20,background:C.card,border:`1.5px solid ${C.border}`,borderRadius:14,color:C.text,fontSize:13,fontWeight:600}}>테스트 알림 보내기</button>
      <div style={{fontSize:13,fontWeight:700,marginBottom:10,color:C.text}}>달 위상별 특징</div>
      <div style={{display:"grid",gap:8}}>
        {PHASES.map(p=>(
          <div key={p.id} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:"13px 15px"}}>
            <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:5}}>
              <div style={{width:32,height:32,borderRadius:"50%",background:p.soft,border:`2px solid ${p.border}`,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>{p.moon}</div>
              <div><span style={{fontSize:13,fontWeight:700,color:p.text}}>{p.name}</span><span style={{fontSize:11,color:C.muted,marginLeft:6}}>· Day {p.dayRange[0]}-{p.dayRange[1]}</span></div>
            </div>
            <div style={{fontSize:12,color:C.muted,lineHeight:1.7}}>{p.description}</div>
            <div style={{marginTop:6,fontSize:11,color:p.text,background:p.soft,display:"inline-block",padding:"2px 8px",borderRadius:100}}>{p.nutrients.join(" · ")}</div>
          </div>
        ))}
      </div>
      <div style={{marginTop:24,background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:"16px 18px"}}>
        <div style={{fontSize:12,fontWeight:700,color:C.text,marginBottom:12}}>정보 출처</div>
        {[{label:"달 위상 사이클 개념",src:"월경의 月(달)에서 착안한 독자적 위상 프레임워크 (hhappyfamilydais, 2026)"},{label:"PMS 기간 근거",src:"ACOG Clinical Practice Guideline 2023"},{label:"영양소 권고",src:"PMC (2024) Minerals and Menstrual Cycle · Cambridge Nutrition Research Reviews (2023)"},{label:"임신 확률 추정",src:"Wilcox et al. (2000), NEJM — 배란 주기 기반 통계"}].map((s,i)=>(
          <div key={i} style={{display:"flex",gap:8,marginBottom:8}}>
            <div style={{width:3,height:3,borderRadius:"50%",background:C.muted,flexShrink:0,marginTop:6}}/>
            <div><div style={{fontSize:11.5,fontWeight:600,color:C.text}}>{s.label}</div><div style={{fontSize:10.5,color:C.muted,lineHeight:1.55}}>{s.src}</div></div>
          </div>
        ))}
      </div>
      <div style={{marginTop:12,padding:"14px 16px",background:"rgba(152,152,204,0.06)",borderRadius:14,border:`1px solid ${C.border}`}}>
        <div style={{fontSize:11,fontWeight:700,color:C.text,marginBottom:7}}>⚠️ 이용 안내 및 면책 고지</div>
        <p style={{margin:0,fontSize:10.5,color:C.muted,lineHeight:1.75}}>본 앱이 제공하는 정보는 <strong style={{color:C.text}}>일반적인 통계와 참고 자료</strong>에 기반하며, 의학적 진단·치료를 대체하지 않습니다.</p>
      </div>
      <div style={{textAlign:"center",padding:"16px 0 4px"}}><div style={{fontSize:10,color:"rgba(255,255,255,0.2)"}}>v1.1.0 · Me:ll</div><div style={{fontSize:9.5,color:"rgba(255,255,255,0.15)",marginTop:2}}>© 2026 hhappyfamilydais · All rights reserved</div></div>
    </div>
  );
}

function LoginScreen(){
  const[loading,setLoading]=useState(false);
  const[error,setError]=useState(null);
  async function handleGoogle(){setLoading(true);setError(null);try{await signInWithPopup(auth,new GoogleAuthProvider());}catch{setError("로그인에 실패했어요. 다시 시도해주세요.");setLoading(false);}}
  async function handleApple(){setLoading(true);setError(null);try{const p=new OAuthProvider("apple.com");p.addScope("email");p.addScope("name");p.setCustomParameters({locale:"ko_KR"});await signInWithPopup(auth,p);}catch{setError("Apple 로그인에 실패했어요.");setLoading(false);}}
  return(
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"32px 28px",position:"relative",zIndex:1}}>
      <div style={{textAlign:"center",marginBottom:48}}>
        <div style={{fontSize:11,color:C.muted,letterSpacing:"0.16em",textTransform:"uppercase",fontWeight:600,marginBottom:8}}>나에게로 돌아오는 시간</div>
        <div style={{fontSize:42,color:C.text,lineHeight:1,fontWeight:200,letterSpacing:"0.05em"}}>Me:ll</div>
        <div style={{fontSize:24,marginTop:8}}>🌙</div>
      </div>
      <p style={{fontSize:14,color:C.muted,lineHeight:1.8,textAlign:"center",marginBottom:40,maxWidth:280}}>나의 사이클 데이터를 안전하게 보관하고<br/>어느 기기에서든 이어서 사용할 수 있어요.</p>
      <button onClick={handleGoogle} disabled={loading} style={{width:"100%",maxWidth:320,padding:"15px 20px",background:"rgba(255,255,255,0.08)",border:`1px solid ${C.border}`,borderRadius:14,cursor:loading?"default":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:12,marginBottom:10}}>
        <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
        <span style={{fontSize:15,fontWeight:600,color:C.text}}>{loading?"로그인 중...":"Google로 시작하기"}</span>
      </button>
      <button onClick={handleApple} disabled={loading} style={{width:"100%",maxWidth:320,padding:"15px 20px",background:"rgba(255,255,255,0.95)",border:"none",borderRadius:14,cursor:loading?"default":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:12}}>
        <svg width="18" height="20" viewBox="0 0 814 1000" fill="black"><path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-37.5-155.5-127.4C46 790.7 0 663.2 0 541.8c0-207.3 135.3-316.9 268.9-316.9 71 0 130.3 46.6 174.7 46.6 42.8 0 109.3-49.4 188.3-49.4 30.3 0 130.3 2.6 198.3 99.2zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z"/></svg>
        <span style={{fontSize:15,fontWeight:600,color:"black"}}>{loading?"로그인 중...":"Apple로 시작하기"}</span>
      </button>
      {error&&<p style={{marginTop:14,fontSize:12,color:"#f87171",textAlign:"center"}}>{error}</p>}
    </div>
  );
}

export default function App(){
  const[user,setUser]=useState(undefined);
  const[periods,setPeriods]=useState([]);
  const[loaded,setLoaded]=useState(false);
  const[tab,setTab]=useState("dash");
  const[sec,setSec]=useState("tips");
  const[selId,setSelId]=useState(null);
  const[ready,setReady]=useState(false);

  useEffect(()=>{const unsub=onAuthStateChanged(auth,u=>setUser(u??null));return unsub;},[]);

  useEffect(()=>{
    if(!user){setLoaded(false);setPeriods([]);return;}
    (async()=>{
      try{const snap=await getDoc(doc(db,"users",user.uid));if(snap.exists()){const d=snap.data().periods;if(Array.isArray(d))setPeriods(d);}}catch(e){console.error(e);}
      setLoaded(true);setTimeout(()=>setReady(true),400);
    })();
  },[user]);

  useEffect(()=>{if(!user||!loaded)return;setDoc(doc(db,"users",user.uid),{periods},{merge:true}).catch(console.error);},[periods,loaded,user]);

  const stats=computeStats(periods);
  const isToday=selId===null;
  const dp=isToday?stats?.phase:PHASES.find(p=>p.id===selId);
  const seasonInfo=getActualSeason();

  function togglePhase(id){setSelId(prev=>prev===id?null:id);setSec("tips");}
  function backToday(){setSelId(null);setSec("tips");}

  const SECS={tips:{l1:"유의",l2:"사항",data:dp?.tips},eat:{l1:"먹어야",l2:"할 것",data:dp?.foods?.eat},avoid:{l1:"피해야",l2:"할 것",data:dp?.foods?.avoid},exercise:{l1:"추천",l2:"운동",data:dp?.exercise}};

  if(user===undefined){
    return(<div style={{minHeight:"100vh",background:"#07071e",display:"flex",alignItems:"center",justifyContent:"center"}}><StarField/><div style={{fontSize:13,color:"rgba(255,255,255,0.4)",position:"relative",zIndex:1}}>불러오는 중...</div></div>);
  }
  if(!user){
    return(<div style={{minHeight:"100vh",background:"#07071e",fontFamily:"system-ui,sans-serif"}}><StarField/><LoginScreen/></div>);
  }

  return(
    <div style={{minHeight:"100vh",color:C.text,fontFamily:"system-ui,sans-serif",paddingBottom:120,position:"relative"}}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0}button{cursor:pointer;font-family:inherit}select option{background:#14143a;color:#ede8f5}`}</style>
      <StarField/>
      <div style={{padding:"16px 20px 13px",borderBottom:`1px solid ${C.border}`,background:"rgba(7,7,30,0.85)",backdropFilter:"blur(12px)",position:"sticky",top:0,zIndex:10,textAlign:"center"}}>
        <div style={{fontSize:9.5,color:C.muted,letterSpacing:"0.14em",textTransform:"uppercase",fontWeight:600,marginBottom:2}}>나에게로 돌아오는 시간</div>
        <div style={{fontSize:22,color:C.text,lineHeight:1.2,fontWeight:200,letterSpacing:"0.05em"}}>Me:ll 🌙</div>
      </div>
      <div style={{padding:"16px 18px 0",maxWidth:460,margin:"0 auto",position:"relative",zIndex:1}}>
        {tab==="dash"&&(
          !loaded?(
            <div style={{textAlign:"center",padding:"60px 0",color:C.muted,fontSize:13}}>불러오는 중...</div>
          ):!stats&&!selId?(
            <div style={{textAlign:"center",padding:"70px 20px"}}>
              <div style={{fontSize:48,marginBottom:18}}>🌑</div>
              <div style={{color:C.muted,fontSize:14,lineHeight:1.9}}>생리 시작일을 기록하면<br/>오늘이 어느 달 위상인지 알 수 있어요</div>
              <button onClick={()=>setTab("record")} style={{marginTop:22,padding:"11px 28px",background:"rgba(152,152,204,0.2)",border:`1px solid ${PHASES[0].border}`,borderRadius:100,color:C.text,fontSize:13,fontWeight:600}}>기록 추가하기 →</button>
            </div>
          ):(
            <>
              <div style={{margin:"4px 0 8px",position:"relative"}}>
                <Clock angle={stats?.angle??0} selId={dp?.id} todayId={stats?.phase?.id} onSelect={togglePhase} ready={ready} cycleDay={isToday?stats?.cycleDay:null} totalDays={stats?.avgCycle}/>
                {!isToday&&<div style={{textAlign:"center",marginTop:6}}><button onClick={backToday} style={{padding:"5px 14px",background:C.card,border:`1px solid ${C.border}`,borderRadius:100,color:C.muted,fontSize:11,fontWeight:600}}>오늘로 돌아가기</button></div>}
              </div>
              {dp&&(
                <div style={{background:C.card,border:`1px solid ${dp.border}`,borderRadius:20,padding:"16px 18px",marginBottom:12,backdropFilter:"blur(8px)"}}>
                  <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:8}}>
                    <div>
                      <div style={{fontSize:11,color:dp.text,background:dp.soft,display:"inline-block",padding:"3px 10px",borderRadius:100,fontWeight:600,letterSpacing:"0.07em",marginBottom:7}}>{isToday?"현재 위상":"선택한 위상"}</div>
                      <div style={{fontSize:26,color:dp.text,fontWeight:300,letterSpacing:"0.03em"}}>{dp.moon} {dp.name}</div>
                      <div style={{fontSize:13,color:dp.color,fontWeight:600,marginTop:3}}>{dp.season} · {dp.keyword}</div>
                    </div>
                    <div style={{width:38,height:38,borderRadius:"50%",background:dp.soft,border:`2px solid ${dp.border}`,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>{dp.moon}</div>
                  </div>
                  <div style={{fontSize:13.5,color:C.muted,lineHeight:1.75}}>{dp.description}</div>
                  {isToday&&stats&&(
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:7,marginTop:12}}>
                      <MiniStat label="사이클" value={`${stats.cycleDay}일차`} sub={`/${stats.avgCycle}일`} color={dp.color}/>
                      <MiniStat label="이 위상" value={`${stats.dIn}일째`} sub={`/${stats.dTotal}일`} color={dp.color}/>
                      <MiniStat label="다음 위상" value={`${stats.dLeft}일`} sub="후" color={dp.color}/>
                    </div>
                  )}
                </div>
              )}
              {isToday&&stats&&<DdayRow stats={stats}/>}
              {dp&&(
                <div style={{marginBottom:16}}>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",borderBottom:`1.5px solid ${dp.border}`}}>
                    {Object.entries(SECS).map(([k,v])=>{
                      const on=sec===k;
                      return(<button key={k} onClick={()=>setSec(k)} style={{padding:"8px 4px 9px",border:"none",borderRadius:"8px 8px 0 0",borderTop:on?`1.5px solid ${dp.border}`:"1.5px solid transparent",borderLeft:on?`1.5px solid ${dp.border}`:"1.5px solid transparent",borderRight:on?`1.5px solid ${dp.border}`:"1.5px solid transparent",background:on?"rgba(255,255,255,0.06)":"transparent",textAlign:"center",position:"relative",bottom:on?"-1.5px":"0",transition:"all 0.15s"}}>
                        <div style={{fontSize:12,fontWeight:700,lineHeight:1.4,color:on?dp.text:C.muted}}>{v.l1}</div>
                        <div style={{fontSize:12,fontWeight:700,lineHeight:1.4,color:on?dp.text:C.muted}}>{v.l2}</div>
                      </button>);
                    })}
                  </div>
                  <div style={{background:"rgba(255,255,255,0.04)",border:`1.5px solid ${dp.border}`,borderTop:"none",borderRadius:"0 0 16px 16px",padding:"14px 18px"}}>
                    <ul style={{paddingLeft:0,listStyle:"none",margin:0}}>
                      {(SECS[sec]?.data||[]).map((t,i)=>{
                        const parts=t.split(" — ");
                        return(<li key={i} style={{display:"flex",alignItems:"flex-start",gap:10,padding:"7px 0",borderBottom:i<(SECS[sec]?.data?.length-1)?`1px solid ${dp.border}33`:"none"}}>
                          <span style={{width:5,height:5,borderRadius:"50%",background:dp.color,flexShrink:0,marginTop:7}}/>
                          <div><div style={{fontSize:13.5,fontWeight:600,color:C.text,lineHeight:1.4}}>{parts[0]}</div>{parts[1]&&<div style={{fontSize:12,color:C.muted,marginTop:2,lineHeight:1.5}}>{parts[1]}</div>}</div>
                        </li>);
                      })}
                    </ul>
                    {(sec==="eat"||sec==="exercise")&&(
                      <div style={{marginTop:14,paddingTop:12,borderTop:`1px dashed ${seasonInfo.border}`}}>
                        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8,gap:8}}>
                          <div style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:13}}>{seasonInfo.emoji}</span><span style={{fontSize:11,fontWeight:700,color:seasonInfo.color}}>{seasonInfo.name} {sec==="eat"?"제철 식재료":"날씨별 운동 팁"}</span></div>
                          {sec==="eat"&&dp?.nutrients&&<div style={{fontSize:9.5,color:dp.text,background:dp.soft,padding:"2px 7px",borderRadius:100,flexShrink:0,fontWeight:600}}>{dp.nutrients.slice(0,2).join(" · ")}</div>}
                        </div>
                        {sec==="eat"&&(
                          <ul style={{paddingLeft:0,listStyle:"none",margin:0}}>
                            {getPhaseSeasonalFoods(dp.id).map((f,i)=>{
                              const parts=f.split(" — ");
                              return(<li key={i} style={{display:"flex",alignItems:"flex-start",gap:10,padding:"6px 0",borderBottom:i<getPhaseSeasonalFoods(dp.id).length-1?`1px solid ${seasonInfo.border}`:"none"}}>
                                <span style={{width:4,height:4,borderRadius:"50%",background:seasonInfo.color,flexShrink:0,marginTop:7,opacity:0.7}}/>
                                <div><div style={{fontSize:13,fontWeight:600,color:C.text,lineHeight:1.4}}>{parts[0]}</div>{parts[1]&&<div style={{fontSize:11.5,color:C.muted,marginTop:1,lineHeight:1.5}}>{parts[1]}</div>}</div>
                              </li>);
                            })}
                          </ul>
                        )}
                        {sec==="exercise"&&(
                          <>
                            <div style={{fontSize:13,color:C.muted,lineHeight:1.7,marginBottom:8,padding:"10px 12px",background:seasonInfo.soft,borderRadius:10,borderLeft:`3px solid ${seasonInfo.color}`}}>{seasonInfo.exerciseTip}</div>
                            <ul style={{paddingLeft:0,listStyle:"none",margin:0}}>
                              {seasonInfo.exerciseBonus.map((e,i)=>{
                                const parts=e.split(" — ");
                                return(<li key={i} style={{display:"flex",alignItems:"flex-start",gap:10,padding:"6px 0",borderBottom:i<seasonInfo.exerciseBonus.length-1?`1px solid ${seasonInfo.border}`:"none"}}>
                                  <span style={{width:4,height:4,borderRadius:"50%",background:seasonInfo.color,flexShrink:0,marginTop:7,opacity:0.7}}/>
                                  <div><div style={{fontSize:13,fontWeight:600,color:C.text,lineHeight:1.4}}>{parts[0]}</div>{parts[1]&&<div style={{fontSize:11.5,color:C.muted,marginTop:1,lineHeight:1.5}}>{parts[1]}</div>}</div>
                                </li>);
                              })}
                            </ul>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
              <PhaseBar dp={dp} stats={stats} togglePhase={togglePhase}/>

            </>
          )
        )}
        {tab==="cal"&&<CalView periods={periods} stats={stats} setPeriods={setPeriods}/>}
        {tab==="record"&&<RecordView periods={periods} setPeriods={setPeriods}/>}
        {tab==="my"&&<MyPage stats={stats} periods={periods} user={user}/>}
      </div>
      <div style={{position:"fixed",bottom:0,left:0,right:0,background:"rgba(7,7,30,0.92)",backdropFilter:"blur(12px)",borderTop:`1px solid ${C.border}`,display:"flex",zIndex:20}}>
        {[{id:"dash",ic:"◯",lb:"대시보드"},{id:"cal",ic:"▦",lb:"캘린더"},{id:"record",ic:"✎",lb:"기록"},{id:"my",ic:"♡",lb:"마이페이지"}].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,padding:"9px 0 11px",border:"none",background:"transparent",color:tab===t.id?"white":C.muted,display:"flex",flexDirection:"column",alignItems:"center",gap:2,borderTop:tab===t.id?"2px solid rgba(255,255,255,0.6)":"2px solid transparent",transition:"all 0.15s"}}>
            <span style={{fontSize:15,lineHeight:1}}>{t.ic}</span>
            <span style={{fontSize:9.5,fontWeight:tab===t.id?700:500}}>{t.lb}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
