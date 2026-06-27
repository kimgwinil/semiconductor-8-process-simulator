import {
  Activity,
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  Download,
  Gauge,
  Layers3,
  Play,
  RotateCcw,
  Save,
  Thermometer,
  Timer,
  Wrench
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

type ChapterKey =
  | "oxidation"
  | "photo"
  | "etch"
  | "diffusion"
  | "implant"
  | "deposition"
  | "metal"
  | "cmp"
  | "integrated"
  | "master";

type Field = {
  key: string;
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
};

type IdealRange = {
  min: number;
  max: number;
  label: string;
  reason: string;
};

type Chapter = {
  key: ChapterKey;
  index: number;
  label: string;
  english: string;
  stepTitle: string;
  objective: string;
  theory: string[];
  defects: { name: string; cause: string; countermeasure: string }[];
  fields: Field[];
  modes: string[];
};

type Result = {
  primary: number;
  primaryLabel: string;
  primaryUnit: string;
  secondary: number;
  secondaryLabel: string;
  secondaryUnit: string;
  rate: number;
  rateLabel: string;
  rateUnit: string;
  uniformity: number;
  quality: number;
  risk: number;
  verdict: "PASS" | "RISK" | "FAIL";
  note: string;
  defects: { pinhole: number; particle: number; scratch: number; interfaceTrap: number };
  profile: number[];
};

type ProcessGuide = {
  resultName: string;
  visualLabel: string;
  basic: string[];
  deep: string[];
  stages: { name: string; detail: string; signal: string }[];
  internals: string[];
};

const chapters: Chapter[] = [
  {
    key: "oxidation",
    index: 1,
    label: "산화",
    english: "Oxidation",
    stepTitle: "STEP 3 / 6",
    objective: "SiO2 절연막을 성장시키고 Deal-Grove 모델로 막 두께와 Si 소비량을 예측합니다.",
    theory: [
      "Dry 산화는 품질이 높지만 성장 속도가 느리고, Wet 산화는 빠른 성장에 유리합니다.",
      "Deal-Grove 모델은 초기 표면 반응 지배와 두꺼운 막의 확산 지배를 함께 설명합니다.",
      "산화막 두께의 약 45% 수준이 Si 기판 소비 두께로 환산됩니다."
    ],
    defects: [
      { name: "핀홀", cause: "표면 오염, 과속 성장", countermeasure: "RCA 세정, 성장 속도 완화" },
      { name: "두께 불균일", cause: "온도 분포, 가스 유동 불균일", countermeasure: "로 온도 매핑, 유량 균일화" },
      { name: "계면 결함", cause: "급격한 온도 변화", countermeasure: "램프율 제어, 후열처리" }
    ],
    fields: [
      { key: "temperature", label: "온도", unit: "°C", min: 800, max: 1100, step: 5 },
      { key: "time", label: "시간", unit: "분", min: 10, max: 300, step: 5 },
      { key: "gasFlow", label: "가스 유량", unit: "slm", min: 1, max: 20, step: 0.5 },
      { key: "pressure", label: "압력", unit: "Torr", min: 0.1, max: 10, step: 0.1 },
      { key: "initial", label: "초기 산화막", unit: "Å", min: 0, max: 100, step: 1 }
    ],
    modes: ["Dry", "Wet"]
  },
  {
    key: "photo",
    index: 2,
    label: "포토리소그래피",
    english: "Photolithography",
    stepTitle: "STEP 3 / 6",
    objective: "광원, NA, 노광량으로 해상도, 초점심도, CD 변화를 예측합니다.",
    theory: [
      "해상도 R = k1 x 파장 / NA이며 NA 증가는 해상도를 높이지만 DOF를 줄입니다.",
      "노광 부족은 오픈, 과노광은 브리징과 CD 축소를 유발할 수 있습니다.",
      "PR 두께와 베이크 조건은 현상 균일도와 패턴 프로파일에 직접 영향을 줍니다."
    ],
    defects: [
      { name: "CD 불균일", cause: "노광량 변동, 베이크 온도 편차", countermeasure: "Dose map 보정, hot plate 검교정" },
      { name: "브리징", cause: "과노광 또는 현상 부족", countermeasure: "Dose 감소, 현상 시간 최적화" },
      { name: "오버레이", cause: "정렬 오차", countermeasure: "Alignment mark 검사, overlay APC" }
    ],
    fields: [
      { key: "wavelength", label: "파장", unit: "nm", min: 13.5, max: 436, step: 1 },
      { key: "na", label: "NA", unit: "", min: 0.4, max: 1.35, step: 0.01 },
      { key: "dose", label: "노광량", unit: "mJ/cm²", min: 10, max: 100, step: 1 },
      { key: "resist", label: "PR 두께", unit: "Å", min: 500, max: 5000, step: 50 },
      { key: "develop", label: "현상 시간", unit: "초", min: 30, max: 120, step: 1 }
    ],
    modes: ["i-line", "KrF", "ArF", "EUV"]
  },
  {
    key: "etch",
    index: 3,
    label: "식각",
    english: "Etching",
    stepTitle: "STEP 3 / 6",
    objective: "플라즈마 조건으로 식각 깊이, 선택비, 이방성을 계산합니다.",
    theory: [
      "건식 식각은 플라즈마 화학 반응과 이온 충돌의 균형으로 패턴을 전사합니다.",
      "RF power 증가는 식각률과 손상을 함께 키울 수 있습니다.",
      "선택비와 이방성은 마스크 손실과 CD 유지에 핵심입니다."
    ],
    defects: [
      { name: "언더컷", cause: "등방성 성분 과다", countermeasure: "Bias power 최적화, inhibitor 가스 조정" },
      { name: "잔류물", cause: "폴리머 과다, endpoint 지연", countermeasure: "O2 clean, endpoint 감도 개선" },
      { name: "마이크로트렌칭", cause: "과도한 이온 충돌", countermeasure: "Bias 감소, 압력 조정" }
    ],
    fields: [
      { key: "rfPower", label: "RF 파워", unit: "W", min: 50, max: 900, step: 10 },
      { key: "pressure", label: "압력", unit: "mTorr", min: 5, max: 200, step: 1 },
      { key: "time", label: "시간", unit: "초", min: 10, max: 240, step: 5 },
      { key: "gasFlow", label: "가스 유량", unit: "sccm", min: 10, max: 150, step: 5 },
      { key: "selectivity", label: "선택비 목표", unit: ":1", min: 2, max: 30, step: 1 }
    ],
    modes: ["RIE", "ICP", "ALE"]
  },
  {
    key: "diffusion",
    index: 4,
    label: "확산",
    english: "Diffusion",
    stepTitle: "STEP 3 / 6",
    objective: "온도와 시간에 따른 접합 깊이와 표면 농도 변화를 계산합니다.",
    theory: [
      "확산은 농도 구배에 의해 도펀트가 이동하는 열공정입니다.",
      "확산계수는 온도에 대해 Arrhenius 관계를 따르므로 온도 민감도가 큽니다.",
      "접합 깊이는 대략 sqrt(Dt)에 비례합니다."
    ],
    defects: [
      { name: "과확산", cause: "고온 또는 장시간 공정", countermeasure: "thermal budget 축소" },
      { name: "농도 불균일", cause: "소스 공급 불안정", countermeasure: "가스 공급 안정화" },
      { name: "표면 결함", cause: "오염, 산화막 결함", countermeasure: "전처리 세정 강화" }
    ],
    fields: [
      { key: "temperature", label: "온도", unit: "°C", min: 850, max: 1200, step: 5 },
      { key: "time", label: "시간", unit: "분", min: 5, max: 240, step: 5 },
      { key: "dose", label: "표면 농도", unit: "1e20/cm³", min: 0.2, max: 5, step: 0.1 },
      { key: "pressure", label: "압력", unit: "Torr", min: 0.5, max: 760, step: 5 }
    ],
    modes: ["Boron", "Phosphorus", "Arsenic"]
  },
  {
    key: "implant",
    index: 5,
    label: "이온 주입",
    english: "Ion Implantation",
    stepTitle: "STEP 3 / 6",
    objective: "주입 에너지와 도즈로 투영 범위, 손상, 활성화 리스크를 예측합니다.",
    theory: [
      "이온 주입은 가속된 이온으로 도펀트를 원하는 깊이에 넣는 공정입니다.",
      "에너지가 높을수록 projected range가 증가하고, dose가 높을수록 결정 손상이 증가합니다.",
      "후속 anneal은 격자 손상 회복과 전기적 활성화에 필수입니다."
    ],
    defects: [
      { name: "채널링", cause: "결정 방향 정렬", countermeasure: "tilt/rotation 적용" },
      { name: "격자 손상", cause: "고도즈 주입", countermeasure: "RTA anneal 최적화" },
      { name: "도즈 오차", cause: "beam current drift", countermeasure: "beam calibration" }
    ],
    fields: [
      { key: "energy", label: "에너지", unit: "keV", min: 5, max: 300, step: 5 },
      { key: "dose", label: "도즈", unit: "1e15/cm²", min: 0.1, max: 10, step: 0.1 },
      { key: "tilt", label: "틸트", unit: "°", min: 0, max: 15, step: 0.5 },
      { key: "anneal", label: "어닐 온도", unit: "°C", min: 700, max: 1100, step: 10 }
    ],
    modes: ["B+", "P+", "As+"]
  },
  {
    key: "deposition",
    index: 6,
    label: "증착",
    english: "Deposition",
    stepTitle: "STEP 3 / 6",
    objective: "CVD/PVD/ALD 조건으로 박막 두께, step coverage, 막질을 예측합니다.",
    theory: [
      "증착은 웨이퍼 위에 절연막, 도전막, 배리어막 등을 형성하는 공정입니다.",
      "ALD는 원자층 수준의 두께 제어가 가능하지만 처리량은 낮습니다.",
      "온도, 압력, 전구체 유량은 성장률과 막질을 결정합니다."
    ],
    defects: [
      { name: "파티클", cause: "챔버 오염, 박리", countermeasure: "PM 주기 조정, seasoning" },
      { name: "poor coverage", cause: "고종횡비 구조", countermeasure: "ALD 또는 압력 조정" },
      { name: "막 응력", cause: "온도/플라즈마 조건", countermeasure: "응력 보상 조건 적용" }
    ],
    fields: [
      { key: "temperature", label: "온도", unit: "°C", min: 150, max: 800, step: 5 },
      { key: "time", label: "시간", unit: "분", min: 1, max: 120, step: 1 },
      { key: "pressure", label: "압력", unit: "Torr", min: 0.1, max: 20, step: 0.1 },
      { key: "gasFlow", label: "전구체 유량", unit: "sccm", min: 5, max: 200, step: 5 },
      { key: "aspect", label: "패턴 종횡비", unit: ":1", min: 1, max: 12, step: 0.5 }
    ],
    modes: ["CVD", "PVD", "ALD"]
  },
  {
    key: "metal",
    index: 7,
    label: "금속 배선",
    english: "Metallization",
    stepTitle: "STEP 3 / 6",
    objective: "배선 두께, 선폭, 길이 조건으로 저항과 전류밀도 리스크를 계산합니다.",
    theory: [
      "금속 배선은 소자 간 전기 신호를 연결하며 저항과 electromigration이 핵심 관리 대상입니다.",
      "선폭 축소와 길이 증가는 RC delay를 증가시킵니다.",
      "배리어/라이너와 구리 충전 품질은 신뢰성에 직접 영향을 줍니다."
    ],
    defects: [
      { name: "보이드", cause: "충전 불량", countermeasure: "seed/plate 조건 최적화" },
      { name: "EM 리스크", cause: "높은 전류밀도", countermeasure: "선폭 확대, cap layer 개선" },
      { name: "오픈/쇼트", cause: "패턴 결함, 잔류 금속", countermeasure: "검사와 CMP 조건 개선" }
    ],
    fields: [
      { key: "thickness", label: "배선 두께", unit: "nm", min: 50, max: 1000, step: 10 },
      { key: "width", label: "선폭", unit: "nm", min: 20, max: 500, step: 5 },
      { key: "length", label: "길이", unit: "µm", min: 1, max: 200, step: 1 },
      { key: "current", label: "전류", unit: "mA", min: 0.1, max: 30, step: 0.1 }
    ],
    modes: ["Cu Dual Damascene", "Al", "W Plug"]
  },
  {
    key: "cmp",
    index: 8,
    label: "CMP",
    english: "Chemical Mechanical Planarization",
    stepTitle: "STEP 3 / 6",
    objective: "압력, 속도, 슬러리 조건으로 제거율, dishing, 균일도를 예측합니다.",
    theory: [
      "CMP는 화학 반응과 기계적 연마를 결합해 웨이퍼 표면을 평탄화합니다.",
      "Preston 식은 제거율이 압력과 상대 속도에 비례함을 설명합니다.",
      "과도한 압력과 패턴 밀도 차이는 dishing/erosion을 유발합니다."
    ],
    defects: [
      { name: "Dishing", cause: "금속 영역 과연마", countermeasure: "압력 감소, endpoint 개선" },
      { name: "Erosion", cause: "패턴 밀도 차", countermeasure: "dummy fill 적용" },
      { name: "스크래치", cause: "슬러리 입자, 패드 상태", countermeasure: "필터링, pad conditioning" }
    ],
    fields: [
      { key: "downforce", label: "다운포스", unit: "psi", min: 1, max: 8, step: 0.1 },
      { key: "platen", label: "플래튼 속도", unit: "rpm", min: 20, max: 160, step: 5 },
      { key: "time", label: "연마 시간", unit: "초", min: 10, max: 240, step: 5 },
      { key: "slurry", label: "슬러리 농도", unit: "%", min: 1, max: 20, step: 0.5 },
      { key: "density", label: "패턴 밀도", unit: "%", min: 5, max: 95, step: 1 }
    ],
    modes: ["Oxide CMP", "Cu CMP", "STI CMP"]
  },
  {
    key: "integrated",
    index: 9,
    label: "통합 시뮬",
    english: "Integrated Flow",
    stepTitle: "FAB FLOW",
    objective: "8대 공정의 누적 리스크와 예상 수율을 통합 관점에서 추적합니다.",
    theory: [
      "전공정은 단일 공정의 PASS보다 누적 변동 관리가 더 중요합니다.",
      "초기 산화/포토/CD 편차는 후속 식각과 배선 신뢰성까지 전달됩니다.",
      "통합 시뮬레이션은 병목 공정과 수율 손실 원인을 우선순위화합니다."
    ],
    defects: [
      { name: "누적 CD shift", cause: "포토와 식각 오차 전파", countermeasure: "APC feedback" },
      { name: "전기적 fail", cause: "도핑/배선 변동 누적", countermeasure: "inline metrology 강화" },
      { name: "수율 손실", cause: "파티클과 공정 window 이탈", countermeasure: "공정별 guard band 설정" }
    ],
    fields: [
      { key: "temperature", label: "열공정 안정도", unit: "%", min: 70, max: 100, step: 1 },
      { key: "dose", label: "패턴/CD 안정도", unit: "%", min: 70, max: 100, step: 1 },
      { key: "gasFlow", label: "박막/식각 안정도", unit: "%", min: 70, max: 100, step: 1 },
      { key: "pressure", label: "검사 커버리지", unit: "%", min: 50, max: 100, step: 1 }
    ],
    modes: ["Logic", "Memory", "Power"]
  },
  {
    key: "master",
    index: 10,
    label: "종합 평가",
    english: "Master Test",
    stepTitle: "EXAM",
    objective: "8대 공정의 핵심 원리, 변수, 불량 대응을 종합 평가합니다.",
    theory: [
      "마스터 평가는 이론, 모델, 불량 대응, 통합 흐름 이해를 함께 확인합니다.",
      "70점 이상이면 통과이며, 오답은 해당 챕터의 이론과 불량 분석으로 복귀합니다.",
      "실무에서는 정답보다 공정 변수와 결과 사이의 인과관계를 설명하는 능력이 중요합니다."
    ],
    defects: [
      { name: "학습 공백", cause: "모델과 변수 연결 부족", countermeasure: "챕터별 STEP 2 복습" },
      { name: "불량 대응 미흡", cause: "원인-대책 매칭 부족", countermeasure: "불량 분석 표 반복 학습" },
      { name: "통합 관점 부족", cause: "공정 간 영향 미고려", countermeasure: "챕터 9 재시뮬레이션" }
    ],
    fields: [
      { key: "temperature", label: "열공정 이해도", unit: "%", min: 0, max: 100, step: 1 },
      { key: "dose", label: "패턴/도핑 이해도", unit: "%", min: 0, max: 100, step: 1 },
      { key: "gasFlow", label: "박막/식각 이해도", unit: "%", min: 0, max: 100, step: 1 },
      { key: "pressure", label: "불량 분석 이해도", unit: "%", min: 0, max: 100, step: 1 }
    ],
    modes: ["Practice", "Exam"]
  }
];

const defaults: Record<string, number> = {
  temperature: 1000,
  time: 60,
  gasFlow: 5,
  pressure: 1,
  initial: 20,
  wavelength: 193,
  na: 0.93,
  dose: 2.5,
  resist: 1800,
  develop: 60,
  rfPower: 450,
  selectivity: 12,
  energy: 80,
  tilt: 7,
  anneal: 950,
  aspect: 4,
  thickness: 240,
  width: 90,
  length: 40,
  current: 4,
  downforce: 3.5,
  platen: 90,
  slurry: 8,
  density: 42
};

const idealRanges: Partial<Record<ChapterKey, Record<string, IdealRange>>> = {
  oxidation: {
    temperature: { min: 925, max: 1050, label: "권장 925-1050°C", reason: "산화 속도와 계면 품질의 균형 구간" },
    time: { min: 45, max: 110, label: "권장 45-110분", reason: "게이트/절연 산화막 두께 제어가 쉬운 구간" },
    gasFlow: { min: 6, max: 10, label: "권장 6-10 slm", reason: "로 내부 가스 치환과 균일도 확보" },
    pressure: { min: 0.8, max: 2.2, label: "권장 0.8-2.2 Torr", reason: "표면 반응과 확산 지배 균형" },
    initial: { min: 10, max: 35, label: "권장 10-35 Å", reason: "초기 산화막 보정이 안정적인 범위" }
  },
  photo: {
    wavelength: { min: 13.5, max: 248, label: "권장 EUV-ArF", reason: "미세 패턴 해상도 확보" },
    na: { min: 0.85, max: 1.35, label: "권장 NA 0.85-1.35", reason: "해상도 개선에 유리" },
    dose: { min: 32, max: 44, label: "권장 32-44 mJ/cm²", reason: "오픈/브리징을 줄이는 dose window" },
    resist: { min: 1200, max: 2400, label: "권장 1200-2400 Å", reason: "해상도와 식각 내성 균형" },
    develop: { min: 50, max: 75, label: "권장 50-75초", reason: "잔막과 과현상 리스크 완화" }
  },
  etch: {
    rfPower: { min: 260, max: 620, label: "권장 260-620 W", reason: "식각률과 손상 사이 균형" },
    pressure: { min: 25, max: 75, label: "권장 25-75 mTorr", reason: "이방성과 균일도 확보" },
    time: { min: 45, max: 145, label: "권장 45-145초", reason: "목표 깊이 도달과 over-etch 억제" },
    gasFlow: { min: 45, max: 90, label: "권장 45-90 sccm", reason: "라디칼 공급 안정 구간" },
    selectivity: { min: 8, max: 20, label: "권장 8-20:1", reason: "마스크 손실 억제" }
  },
  diffusion: {
    temperature: { min: 930, max: 1080, label: "권장 930-1080°C", reason: "접합 깊이 제어와 thermal budget 균형" },
    time: { min: 25, max: 120, label: "권장 25-120분", reason: "과확산 방지" },
    dose: { min: 1, max: 3.5, label: "권장 1.0-3.5", reason: "표면 농도 포화와 균일도 균형" },
    pressure: { min: 80, max: 350, label: "권장 80-350 Torr", reason: "소스 공급 안정 구간" }
  },
  implant: {
    energy: { min: 35, max: 130, label: "권장 35-130 keV", reason: "얕은 접합과 손상 억제 균형" },
    dose: { min: 0.8, max: 4, label: "권장 0.8-4.0", reason: "전기적 활성화와 결정 손상 균형" },
    tilt: { min: 5, max: 9, label: "권장 5-9°", reason: "채널링 억제" },
    anneal: { min: 900, max: 1030, label: "권장 900-1030°C", reason: "손상 회복과 도펀트 활성화" }
  },
  deposition: {
    temperature: { min: 280, max: 520, label: "권장 280-520°C", reason: "막질과 열 budget 균형" },
    time: { min: 8, max: 60, label: "권장 8-60분", reason: "목표 박막 두께 관리" },
    pressure: { min: 1, max: 6, label: "권장 1-6 Torr", reason: "전구체 확산과 반응 균일도 확보" },
    gasFlow: { min: 45, max: 110, label: "권장 45-110 sccm", reason: "전구체 공급 안정 구간" },
    aspect: { min: 1, max: 6, label: "권장 1-6:1", reason: "coverage 저하가 급격히 커지기 전 구간" }
  },
  metal: {
    thickness: { min: 180, max: 520, label: "권장 180-520 nm", reason: "저항과 공정 난이도 균형" },
    width: { min: 70, max: 220, label: "권장 70-220 nm", reason: "전류밀도와 RC delay 관리" },
    length: { min: 10, max: 90, label: "권장 10-90 µm", reason: "배선 저항 상승 완화" },
    current: { min: 0.5, max: 8, label: "권장 0.5-8 mA", reason: "electromigration 리스크 억제" }
  },
  cmp: {
    downforce: { min: 2.5, max: 4.2, label: "권장 2.5-4.2 psi", reason: "제거율과 scratch/dishing 균형" },
    platen: { min: 65, max: 110, label: "권장 65-110 rpm", reason: "상대 속도 안정 구간" },
    time: { min: 45, max: 130, label: "권장 45-130초", reason: "endpoint 접근과 over-polish 억제" },
    slurry: { min: 5, max: 12, label: "권장 5-12%", reason: "화학 반응성과 입자 결함 균형" },
    density: { min: 35, max: 65, label: "권장 35-65%", reason: "dishing/erosion 저감" }
  }
};

const processGuides: Partial<Record<ChapterKey, ProcessGuide>> = {
  oxidation: {
    resultName: "열산화막 / SiO2 단면",
    visualLabel: "산화로 내부에서 O2/H2O가 Si 표면으로 확산되어 SiO2 계면을 성장시킵니다.",
    basic: [
      "산화 공정은 Si 표면에 SiO2 절연막을 만드는 열공정입니다.",
      "Dry는 얇고 품질이 높은 막, Wet은 두꺼운 막을 빠르게 만들 때 유리합니다.",
      "온도와 시간이 올라가면 산화막이 두꺼워지고, 가스/압력 조건이 나쁘면 균일도가 떨어집니다."
    ],
    deep: [
      "Deal-Grove 모델은 표면 반응 지배 구간과 산화막 내부 확산 지배 구간을 함께 계산합니다.",
      "막이 두꺼워질수록 산화제가 기존 SiO2를 통과해야 하므로 성장 속도는 점점 둔화됩니다.",
      "급격한 열 변화와 오염은 계면 trap, pinhole, 박리 리스크를 키웁니다."
    ],
    stages: [
      { name: "가열", detail: "웨이퍼 온도를 목표로 올림", signal: "온도" },
      { name: "산화제 유입", detail: "Dry O2 또는 Wet H2O 공급", signal: "가스" },
      { name: "계면 반응", detail: "Si + O2/H2O -> SiO2 성장", signal: "막 성장" },
      { name: "확산 지배", detail: "두꺼운 막에서 성장 속도 둔화", signal: "성장률" }
    ],
    internals: ["산화제 분자가 SiO2 막을 통과", "Si/SiO2 계면에서 화학 반응", "Si 기판 일부가 소비됨", "온도 편차가 두께 맵으로 나타남"]
  },
  photo: {
    resultName: "PR 패턴 / CD 결과",
    visualLabel: "노광 에너지가 PR 내부 PAC 농도를 바꾸고 현상 후 패턴 CD가 결정됩니다.",
    basic: [
      "포토 공정은 마스크 패턴을 감광막(PR)에 전사하는 공정입니다.",
      "짧은 파장과 높은 NA는 더 작은 패턴을 만들 수 있지만 초점심도는 줄어듭니다.",
      "노광량과 현상 시간이 맞지 않으면 오픈, 브리징, CD 불균일이 생깁니다."
    ],
    deep: [
      "Rayleigh 식 R = k1 x λ / NA로 이론 해상도를 예측합니다.",
      "Dill/Mack 모델은 노광에 따른 PR 반응과 현상 속도 차이를 설명합니다.",
      "베이크 온도, PR 두께, 반사광은 standing wave와 CD shift를 유발합니다."
    ],
    stages: [
      { name: "PR 코팅", detail: "웨이퍼 위 감광막 형성", signal: "PR 두께" },
      { name: "정렬/노광", detail: "마스크 패턴을 빛으로 전달", signal: "파장/NA" },
      { name: "PEB", detail: "산 확산과 반응 안정화", signal: "dose" },
      { name: "현상", detail: "노광 영역 선택 제거", signal: "CD" }
    ],
    internals: ["광자가 PR 내부 화학 상태를 변화", "초점 오차가 패턴 edge를 흐림", "현상액이 반응된 영역을 제거", "과노광은 브리징/언더컷을 유발"]
  },
  etch: {
    resultName: "식각 프로파일 / 트렌치 단면",
    visualLabel: "플라즈마 라디칼과 이온 충돌이 막을 제거하며 수직 프로파일을 형성합니다.",
    basic: [
      "식각은 필요 없는 막을 제거해 패턴을 전사하는 공정입니다.",
      "건식 식각은 플라즈마를 이용해 미세 패턴의 수직성을 확보합니다.",
      "RF 파워가 너무 높으면 빠르지만 손상과 마이크로트렌칭이 증가합니다."
    ],
    deep: [
      "RIE/ICP는 화학 반응과 이온 bombardment의 복합 작용으로 식각합니다.",
      "압력은 평균 자유 행로를 바꿔 방향성과 균일도에 영향을 줍니다.",
      "선택비가 낮으면 마스크가 먼저 닳아 CD 손실이 커집니다."
    ],
    stages: [
      { name: "플라즈마 점화", detail: "가스가 라디칼/이온으로 분해", signal: "RF" },
      { name: "표면 반응", detail: "라디칼이 막과 반응", signal: "가스" },
      { name: "이온 충돌", detail: "수직 방향 제거 강화", signal: "bias" },
      { name: "부산물 배출", detail: "휘발성 부산물 제거", signal: "압력" }
    ],
    internals: ["플라즈마 sheath가 이온 방향을 정렬", "라디칼 농도가 식각률을 결정", "마스크도 동시에 소모됨", "압력 과다 시 언더컷 증가"]
  },
  diffusion: {
    resultName: "도펀트 농도 프로파일",
    visualLabel: "고온에서 도펀트가 농도 구배를 따라 Si 내부로 확산됩니다.",
    basic: ["확산은 열로 도펀트를 Si 내부에 이동시키는 공정입니다.", "온도가 조금만 올라가도 확산 깊이가 크게 증가합니다.", "시간이 길수록 접합은 깊어지고 얕은 접합 제어가 어려워집니다."],
    deep: ["확산계수 D는 Arrhenius 관계를 따라 온도 민감도가 큽니다.", "constant source와 limited source 조건에 따라 농도 프로파일이 달라집니다.", "thermal budget은 이후 소자 특성까지 누적 영향을 줍니다."],
    stages: [{ name: "소스 공급", detail: "도펀트 표면 농도 형성", signal: "농도" }, { name: "고온 확산", detail: "Si 격자 내 이동", signal: "온도" }, { name: "접합 형성", detail: "목표 깊이에 pn 접합 형성", signal: "깊이" }, { name: "냉각", detail: "확산 정지", signal: "시간" }],
    internals: ["도펀트 원자가 vacancy/interstitial 경로로 이동", "깊이 방향 농도 구배 형성", "고온 시간이 접합 깊이를 좌우", "과확산 시 short channel 리스크 증가"]
  },
  implant: {
    resultName: "이온 주입 범위 / 손상 지도",
    visualLabel: "가속된 이온이 Si 격자에 충돌하며 특정 깊이에 도펀트 피크를 만듭니다.",
    basic: ["이온 주입은 도펀트를 원하는 깊이에 직접 넣는 공정입니다.", "에너지는 깊이, 도즈는 농도와 손상을 결정합니다.", "틸트는 결정 채널을 타고 깊게 들어가는 channeling을 줄입니다."],
    deep: ["Projected range와 straggle은 이온 질량, 에너지, 기판 조성에 따라 달라집니다.", "고도즈 주입은 amorphization과 end-of-range defect를 만들 수 있습니다.", "Anneal은 손상 회복과 전기적 활성화를 동시에 수행합니다."],
    stages: [{ name: "이온 생성", detail: "도펀트 이온 빔 생성", signal: "종류" }, { name: "가속", detail: "전기장으로 에너지 부여", signal: "keV" }, { name: "주입", detail: "Si 내부 충돌/정지", signal: "range" }, { name: "어닐", detail: "손상 회복과 활성화", signal: "온도" }],
    internals: ["이온이 격자 원자와 충돌하며 에너지를 잃음", "도펀트 분포는 Gaussian 형태로 형성", "결정 손상 영역이 생김", "어닐 후 활성 도펀트 비율 증가"]
  },
  deposition: {
    resultName: "박막 증착 / Step coverage",
    visualLabel: "전구체가 표면에 흡착·반응해 패턴 위에 박막을 쌓습니다.",
    basic: ["증착은 웨이퍼 위에 절연막/도전막/배리어막을 형성합니다.", "CVD는 반응성, PVD는 방향성, ALD는 원자층 제어가 특징입니다.", "고종횡비 구조에서는 step coverage가 핵심입니다."],
    deep: ["표면 반응 지배와 mass transport 지배 구간에 따라 성장률이 달라집니다.", "ALD는 self-limiting 반응으로 두께 균일성이 높습니다.", "플라즈마와 온도 조건은 막 밀도, 응력, 결함 밀도에 영향을 줍니다."],
    stages: [{ name: "전구체 공급", detail: "반응 가스 유입", signal: "유량" }, { name: "흡착", detail: "표면에 분자 흡착", signal: "압력" }, { name: "반응/성장", detail: "박막 형성", signal: "온도" }, { name: "퍼지", detail: "부산물 제거", signal: "coverage" }],
    internals: ["전구체 분자가 패턴 바닥까지 확산", "표면 반응으로 박막 원자가 결합", "종횡비가 높으면 입구 부근이 먼저 막힘", "파티클은 국부 결함으로 남음"]
  },
  metal: {
    resultName: "금속 배선 / 전류밀도 지도",
    visualLabel: "금속 라인이 전류를 운반하며 선폭과 두께가 저항·EM 리스크를 결정합니다.",
    basic: ["금속 배선은 소자 사이를 전기적으로 연결합니다.", "선폭이 좁고 전류가 높으면 전류밀도가 올라갑니다.", "전류밀도 증가는 electromigration과 오픈 불량으로 이어질 수 있습니다."],
    deep: ["저항은 비저항 x 길이 / 단면적으로 계산됩니다.", "Cu damascene은 barrier/seed, plating, CMP 품질이 모두 중요합니다.", "RC delay와 EM lifetime은 공정 스케일링의 핵심 제약입니다."],
    stages: [{ name: "배리어 형성", detail: "Cu 확산 차단", signal: "liner" }, { name: "Seed/충전", detail: "금속 라인 채움", signal: "void" }, { name: "전류 흐름", detail: "저항/발열 발생", signal: "J" }, { name: "신뢰성", detail: "EM 수명 평가", signal: "margin" }],
    internals: ["전자 흐름이 금속 원자 이동을 유발", "좁은 neck에서 전류밀도 집중", "void가 있으면 국부 발열 증가", "barrier 손상은 누설과 신뢰성 저하로 연결"]
  },
  cmp: {
    resultName: "평탄화 결과 / Dishing 지도",
    visualLabel: "패드 압력과 슬러리 화학 반응이 표면을 제거해 평탄도를 만듭니다.",
    basic: ["CMP는 화학 반응과 기계 연마로 표면을 평탄화합니다.", "압력과 속도가 높으면 제거율은 올라가지만 scratch/dishing 위험도 커집니다.", "패턴 밀도 차이는 영역별 제거량 차이를 만듭니다."],
    deep: ["Preston 식은 제거율이 압력과 상대속도에 비례함을 나타냅니다.", "슬러리 입자, pH, 산화제 농도는 화학 제거 성분을 바꿉니다.", "Endpoint 제어가 늦으면 over-polish와 erosion이 발생합니다."],
    stages: [{ name: "패드 접촉", detail: "웨이퍼와 패드 압착", signal: "압력" }, { name: "화학 반응", detail: "표면 산화/연화", signal: "슬러리" }, { name: "기계 제거", detail: "입자와 패드로 제거", signal: "rpm" }, { name: "평탄화", detail: "높은 영역 우선 제거", signal: "dishing" }],
    internals: ["슬러리가 표면을 화학적으로 약화", "패드 asperity가 돌출부를 먼저 제거", "패턴 밀도 차이가 제거율 차이를 만듦", "입자 응집은 scratch 결함으로 보임"]
  }
};

const quizBank = [
  { type: "choice", q: "Deal-Grove 모델이 설명하는 공정은?", a: "산화막 성장", choices: ["금속 배선 저항", "산화막 성장", "CMP 제거율", "이온 주입 범위"], exp: "Deal-Grove 모델은 Si 산화막 성장의 선형-포물선 거동을 설명합니다." },
  { type: "choice", q: "포토리소그래피 해상도 개선에 직접 유리한 조건은?", a: "짧은 파장과 높은 NA", choices: ["긴 파장과 낮은 NA", "짧은 파장과 높은 NA", "두꺼운 PR과 낮은 dose", "높은 압력과 긴 현상"], exp: "R = k1 x 파장 / NA이므로 파장이 짧고 NA가 높을수록 해상도는 좋아집니다." },
  { type: "choice", q: "식각 선택비의 의미는?", a: "목적막 식각률 / 마스크 식각률", choices: ["압력 / 전력", "목적막 식각률 / 마스크 식각률", "노광량 / 현상시간", "전류 / 선폭"], exp: "선택비가 높을수록 마스크 손실을 줄이고 원하는 막을 더 잘 제거할 수 있습니다." },
  { type: "choice", q: "이온 주입 후 anneal의 주요 목적은?", a: "격자 손상 회복과 도펀트 활성화", choices: ["PR 제거", "격자 손상 회복과 도펀트 활성화", "금속 저항 증가", "웨이퍼 세정 생략"], exp: "주입으로 생긴 결정 손상을 회복하고 도펀트를 전기적으로 활성화합니다." },
  { type: "choice", q: "CMP의 Preston 식에서 제거율과 직접 관련된 변수는?", a: "압력과 상대 속도", choices: ["파장과 NA", "압력과 상대 속도", "주입 에너지와 틸트", "초기 산화막과 산화제"], exp: "CMP 제거율은 압력과 상대 속도에 비례하는 경향을 가집니다." },
  { type: "choice", q: "CVD/PVD/ALD가 속하는 공정은?", a: "증착", choices: ["증착", "확산", "CMP", "포토리소그래피"], exp: "세 방법은 모두 박막을 형성하는 증착 계열 공정입니다." },
  { type: "choice", q: "금속 배선에서 EM 리스크를 키우는 주된 요인은?", a: "높은 전류밀도", choices: ["낮은 전류밀도", "높은 전류밀도", "짧은 산화 시간", "낮은 NA"], exp: "electromigration은 전류밀도가 높을수록 심해집니다." },
  { type: "short", q: "Dry 산화와 Wet 산화 중 성장 속도가 빠른 방식은?", a: "Wet", exp: "Wet 산화는 수증기를 사용해 Dry 산화보다 빠르게 성장합니다." },
  { type: "short", q: "포토 공정에서 R = k1 x λ / NA 식의 R은 무엇을 뜻합니까?", a: "해상도", exp: "R은 분해 가능한 최소 패턴 크기, 즉 해상도를 뜻합니다." },
  { type: "short", q: "공정 평가 합격 기준 점수는 몇 점 이상입니까?", a: "70", exp: "첨부 지시문 기준 합격 기준은 70점 이상입니다." }
];

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function normalized(value: number, min: number, max: number) {
  return clamp((value - min) / (max - min), 0, 1);
}

function makeProfile(seed: number, center: number, variation: number) {
  return Array.from({ length: 33 }, (_, index) => {
    const x = index / 32;
    const ripple = Math.sin((x + seed) * Math.PI * 4) * variation * 0.45;
    const edge = Math.abs(x - 0.5) * variation * 0.7;
    return center + ripple - edge;
  });
}

function getIdeal(chapter: Chapter, field: Field): IdealRange {
  const chapterRange = idealRanges[chapter.key]?.[field.key];
  if (chapterRange) return chapterRange;
  const width = field.max - field.min;
  return {
    min: field.min + width * 0.3,
    max: field.min + width * 0.7,
    label: `권장 ${fmt(field.min + width * 0.3, field.step < 1 ? 1 : 0)}-${fmt(field.min + width * 0.7, field.step < 1 ? 1 : 0)} ${field.unit}`,
    reason: "공정 안정성이 높은 중앙 운전 구간"
  };
}

function getFieldState(value: number, ideal: IdealRange) {
  if (value >= ideal.min && value <= ideal.max) return { label: "권장", className: "ok" };
  const margin = Math.max((ideal.max - ideal.min) * 0.55, 0.001);
  if (value >= ideal.min - margin && value <= ideal.max + margin) return { label: "주의", className: "warn" };
  return { label: "이탈", className: "bad" };
}

function getGuide(chapter: Chapter): ProcessGuide {
  return processGuides[chapter.key] || {
    resultName: chapter.label,
    visualLabel: chapter.objective,
    basic: chapter.theory,
    deep: chapter.theory,
    stages: [
      { name: "입력", detail: "조건 입력", signal: "조건" },
      { name: "계산", detail: "공정 모델 계산", signal: "모델" },
      { name: "판정", detail: "결과 판정", signal: "결과" },
      { name: "복습", detail: "해설 확인", signal: "학습" }
    ],
    internals: chapter.theory
  };
}

function processIntensity(chapter: Chapter, values: Record<string, number>, result: Result) {
  const drivers = chapter.fields.map((field) => normalized(values[field.key] ?? field.min, field.min, field.max));
  const avg = drivers.reduce((sum, value) => sum + value, 0) / Math.max(drivers.length, 1);
  return {
    avg,
    thermal: normalized(values.temperature ?? values.anneal ?? values.downforce ?? 0, 0, Math.max(values.temperature ?? 1100, values.anneal ?? 1100, values.downforce ?? 8)),
    energy: normalized(values.rfPower ?? values.energy ?? values.dose ?? values.current ?? values.platen ?? result.rate, 0, Math.max(values.rfPower ?? 900, values.energy ?? 300, values.dose ?? 100, values.current ?? 30, values.platen ?? 160, result.rate || 1)),
    growth: normalized(result.primary, 0, Math.max(result.primary * 1.15, chapter.key === "oxidation" ? 180 : 400)),
    risk: normalized(result.risk, 0, 100),
    quality: normalized(result.quality, 0, 100)
  };
}

function calculate(chapter: Chapter, values: Record<string, number>, mode: string): Result {
  const t = values.time || 60;
  const temp = values.temperature || 900;
  let primary = 100;
  let secondary = 40;
  let rate = 1;
  let uniformity = 1.5;
  let quality = 88;
  let risk = 18;
  let primaryLabel = "막 두께";
  let primaryUnit = "nm";
  let secondaryLabel = "보조 지표";
  let secondaryUnit = "nm";
  let rateLabel = "공정 속도";
  let rateUnit = "nm/min";
  let note = "목표 공정 window 안에 있습니다.";

  if (chapter.key === "oxidation") {
    const minutes = t;
    const tempFactor = Math.exp((temp - 900) / 145);
    const wetFactor = mode === "Wet" ? 4.8 : 1;
    const b = 0.0026 * tempFactor * wetFactor;
    const ba = 0.0117 * tempFactor * wetFactor;
    const a = b / ba;
    const hours = minutes / 60;
    const initialUm = (values.initial || 0) / 10000;
    const grownUm = (-a + Math.sqrt(a * a + 4 * (b * hours + initialUm * initialUm + a * initialUm))) / 2;
    primary = grownUm * 1000;
    secondary = primary / 2.2;
    rate = primary / minutes;
    uniformity = 1.1 + Math.abs((values.gasFlow || 5) - 8) * 0.18 + Math.abs((values.pressure || 1) - 1.5) * 0.2;
    quality = 96 - uniformity * 3 - (mode === "Wet" ? 3 : 0);
    risk = uniformity * 6 + (rate > 4 ? 15 : 2);
    note = mode === "Dry" ? "Dry 조건은 게이트 산화막 품질에 유리합니다." : "Wet 조건은 두꺼운 산화막 성장에 유리합니다.";
    secondaryLabel = "Si 소비 두께";
  } else if (chapter.key === "photo") {
    const wavelength = values.wavelength || 193;
    const na = values.na || 0.93;
    const dose = values.dose || 35;
    primary = 0.38 * wavelength / na;
    secondary = 0.5 * wavelength / (na * na) / 1000;
    rate = 100 - Math.abs(dose - 38) * 1.2;
    uniformity = Math.abs((values.resist || 1800) - 1800) / 900 + Math.abs((values.develop || 60) - 60) / 25;
    quality = clamp(100 - primary / 8 - uniformity * 5, 40, 98);
    risk = clamp((primary - 70) / 2 + uniformity * 8, 4, 90);
    primaryLabel = "이론 해상도";
    secondaryLabel = "초점심도";
    secondaryUnit = "µm";
    rateLabel = "노광 margin";
    rateUnit = "%";
    note = "짧은 파장과 높은 NA일수록 해상도는 좋아지지만 DOF가 줄어듭니다.";
  } else if (chapter.key === "etch") {
    const rf = values.rfPower || 450;
    const pressure = values.pressure || 50;
    rate = (rf / 450) * (80 / Math.sqrt(pressure + 20)) * (mode === "ICP" ? 2.1 : mode === "ALE" ? 0.2 : 1.1);
    primary = rate * (t / 60);
    secondary = values.selectivity || 12;
    uniformity = Math.abs(pressure - 45) / 28 + Math.abs((values.gasFlow || 60) - 65) / 80;
    quality = clamp(92 - uniformity * 7 - (rf > 720 ? 12 : 0), 45, 98);
    risk = clamp(uniformity * 10 + (rf > 700 ? 20 : 4), 4, 92);
    primaryLabel = "식각 깊이";
    secondaryLabel = "선택비";
    secondaryUnit = ":1";
    rateLabel = "식각률";
    rateUnit = "nm/min";
    note = mode === "ALE" ? "ALE는 원자층 제어에 유리하지만 처리량은 낮습니다." : "플라즈마 조건은 식각률과 손상 사이의 균형이 중요합니다.";
  } else if (chapter.key === "diffusion") {
    const d = Math.exp((temp - 950) / 85) * 0.00022;
    primary = Math.sqrt(d * t) * 1000;
    secondary = values.dose || 2.5;
    rate = primary / t;
    uniformity = Math.abs((values.pressure || 760) - 200) / 250;
    quality = clamp(94 - Math.abs(primary - 320) / 16 - uniformity * 3, 40, 97);
    risk = clamp(Math.abs(primary - 320) / 8 + uniformity * 4, 4, 90);
    primaryLabel = "접합 깊이";
    secondaryLabel = "표면 농도";
    secondaryUnit = "1e20/cm³";
    rateLabel = "확산 진행률";
    note = "확산 깊이는 온도에 매우 민감하므로 thermal budget 관리가 핵심입니다.";
  } else if (chapter.key === "implant") {
    const energy = values.energy || 80;
    const dose = values.dose || 2.5;
    primary = energy * (mode === "As+" ? 0.85 : mode === "P+" ? 1.15 : 1.35);
    secondary = dose;
    rate = clamp((values.anneal || 950) / 10 - dose * 4, 20, 100);
    uniformity = Math.abs((values.tilt || 7) - 7) * 0.8 + dose / 12;
    quality = clamp(95 - uniformity * 5 - (dose > 7 ? 12 : 0), 35, 98);
    risk = clamp(dose * 6 + Math.max(0, 4 - (values.tilt || 7)) * 7, 5, 95);
    primaryLabel = "투영 범위";
    secondaryLabel = "주입 도즈";
    secondaryUnit = "1e15/cm²";
    rateLabel = "활성화 예상";
    rateUnit = "%";
    note = "틸트가 낮으면 channeling 리스크가 커지고, 고도즈는 격자 손상을 증가시킵니다.";
  } else if (chapter.key === "deposition") {
    const methodFactor = mode === "ALD" ? 0.12 : mode === "PVD" ? 4.4 : 2.8;
    rate = methodFactor * Math.exp(((values.temperature || 350) - 350) / 420) * Math.sqrt(values.gasFlow || 50) / 7;
    primary = rate * t;
    secondary = clamp(100 - (values.aspect || 4) * (mode === "PVD" ? 6.5 : mode === "CVD" ? 3.2 : 1.2), 35, 99);
    uniformity = Math.abs((values.pressure || 2) - 3) * 0.8 + Math.abs((values.gasFlow || 50) - 70) / 80;
    quality = clamp(secondary - uniformity * 4, 35, 98);
    risk = clamp(100 - secondary + uniformity * 5, 4, 90);
    primaryLabel = "증착 두께";
    secondaryLabel = "Step coverage";
    secondaryUnit = "%";
    rateLabel = "증착률";
    note = "고종횡비 구조에서는 ALD가 coverage 측면에서 가장 안정적입니다.";
  } else if (chapter.key === "metal") {
    const rho = mode.includes("Cu") ? 1.7e-8 : mode === "Al" ? 2.8e-8 : 5.6e-8;
    const area = (values.thickness || 240) * 1e-9 * (values.width || 90) * 1e-9;
    const length = (values.length || 40) * 1e-6;
    primary = rho * length / area;
    secondary = ((values.current || 4) * 1e-3) / area / 1e10;
    rate = clamp(100 - secondary * 7, 5, 100);
    uniformity = Math.abs((values.width || 90) - 120) / 80;
    quality = clamp(96 - primary / 2 - secondary * 5, 30, 98);
    risk = clamp(secondary * 9 + primary, 4, 98);
    primaryLabel = "배선 저항";
    primaryUnit = "Ω";
    secondaryLabel = "전류밀도";
    secondaryUnit = "MA/cm²";
    rateLabel = "신뢰성 margin";
    rateUnit = "%";
    note = "전류밀도가 높으면 electromigration 리스크가 증가합니다.";
  } else if (chapter.key === "cmp") {
    rate = (values.downforce || 3.5) * (values.platen || 90) * 0.42 * (1 + (values.slurry || 8) / 35);
    primary = rate * ((values.time || 80) / 60);
    secondary = Math.abs((values.density || 42) - 50) * (values.downforce || 3.5) * 0.08;
    uniformity = Math.abs((values.downforce || 3.5) - 3.2) * 1.4 + Math.abs((values.platen || 90) - 85) / 60;
    quality = clamp(95 - secondary * 2.2 - uniformity * 5, 35, 98);
    risk = clamp(secondary * 4 + uniformity * 10, 4, 96);
    primaryLabel = "제거 두께";
    secondaryLabel = "Dishing";
    secondaryUnit = "nm";
    rateLabel = "제거율";
    note = "압력과 속도는 제거율을 키우지만 dishing과 scratch 리스크도 함께 커질 수 있습니다.";
  } else {
    const scores = [values.temperature, values.dose, values.gasFlow, values.pressure].filter(Boolean);
    primary = scores.reduce((sum, value) => sum + value, 0) / scores.length;
    secondary = Math.pow(primary / 100, 8) * 100;
    rate = primary;
    uniformity = (100 - primary) / 8;
    quality = primary;
    risk = 100 - secondary;
    primaryLabel = chapter.key === "master" ? "학습 완성도" : "공정 안정도";
    primaryUnit = "%";
    secondaryLabel = chapter.key === "master" ? "예상 합격률" : "예상 수율";
    secondaryUnit = "%";
    rateLabel = "운영 margin";
    rateUnit = "%";
    note = chapter.key === "master" ? "평가를 제출하면 문항별 해설이 열립니다." : "누적 변동은 후속 공정까지 전파됩니다.";
  }

  const verdict = quality >= 78 && risk < 45 ? "PASS" : quality >= 62 && risk < 70 ? "RISK" : "FAIL";
  const defects = {
    pinhole: clamp(risk * 0.006 + uniformity * 0.02, 0.01, 0.9),
    particle: clamp((100 - quality) * 0.008 + risk * 0.002, 0.02, 0.85),
    scratch: clamp(chapter.key === "cmp" ? risk * 0.012 : risk * 0.003, 0.01, 0.8),
    interfaceTrap: clamp((100 - quality) * 0.006, 0.01, 0.7)
  };

  return {
    primary,
    primaryLabel,
    primaryUnit,
    secondary,
    secondaryLabel,
    secondaryUnit,
    rate,
    rateLabel,
    rateUnit,
    uniformity,
    quality,
    risk,
    verdict,
    note,
    defects,
    profile: makeProfile(chapter.index / 10, primary, Math.max(primary * uniformity * 0.01, 1.2))
  };
}

function fmt(value: number, digits = 1) {
  if (!Number.isFinite(value)) return "-";
  return value.toLocaleString("ko-KR", { maximumFractionDigits: digits, minimumFractionDigits: digits });
}

function useCanvas(
  draw: (ctx: CanvasRenderingContext2D, width: number, height: number) => void,
  deps: unknown[]
) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ratio = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(ratio, ratio);
    draw(ctx, rect.width, rect.height);
  }, deps);
  return ref;
}

function WaferMap({ result, chapter }: { result: Result; chapter: Chapter }) {
  const ref = useCanvas((ctx, width, height) => {
    ctx.clearRect(0, 0, width, height);
    const cx = width / 2;
    const cy = height / 2;
    const r = Math.min(width, height) * 0.42;
    const grd = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.25, r * 0.1, cx, cy, r);
    const heat = normalized(result.risk, 0, 100);
    grd.addColorStop(0, chapter.key === "photo" ? "#f1d5ff" : "#d7f4d0");
    grd.addColorStop(0.28, chapter.key === "metal" ? "#d9a25f" : "#28b4a2");
    grd.addColorStop(0.58, heat > 0.45 ? "#f49f42" : "#f3c960");
    grd.addColorStop(1, result.verdict === "PASS" ? "#246eb9" : "#c45f4b");
    ctx.fillStyle = "#e8edf0";
    ctx.beginPath();
    ctx.arc(cx, cy, r + 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(12, 22, 30, .72)";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r - 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.strokeStyle = "rgba(255,255,255,.3)";
    ctx.lineWidth = 1;
    for (let x = cx - r; x <= cx + r; x += r / 7) {
      ctx.beginPath();
      ctx.moveTo(x, cy - r);
      ctx.lineTo(x, cy + r);
      ctx.stroke();
    }
    for (let y = cy - r; y <= cy + r; y += r / 7) {
      ctx.beginPath();
      ctx.moveTo(cx - r, y);
      ctx.lineTo(cx + r, y);
      ctx.stroke();
    }
    const defectCount = 45 + Math.round(result.risk * 1.8);
    for (let i = 0; i < defectCount; i += 1) {
      const angle = i * 2.399 + result.risk * 0.08 + result.primary * 0.01;
      const dist = Math.sqrt((i * 37) % 100) / 10 * r;
      const size = 1 + ((i * 11) % 4) + (result.risk > 55 && i % 9 === 0 ? 3 : 0);
      ctx.fillStyle = i % 7 === 0 ? "rgba(191, 49, 43, .82)" : "rgba(255,255,255,.45)";
      ctx.fillRect(cx + Math.cos(angle) * dist, cy + Math.sin(angle) * dist, size, size);
    }
    ctx.restore();
    ctx.fillStyle = "rgba(255,255,255,.9)";
    ctx.font = "600 13px Inter, sans-serif";
    ctx.fillText(`${fmt(result.primary)} ${result.primaryUnit}`, cx - 38, cy + 5);
  }, [result, chapter]);
  return <canvas className="visual-canvas wafer-canvas" ref={ref} />;
}

function CrossSection({ result, chapter }: { result: Result; chapter: Chapter }) {
  const ref = useCanvas((ctx, width, height) => {
    ctx.clearRect(0, 0, width, height);
    const layerScale = chapter.key === "photo" ? 160 : chapter.key === "metal" ? 8 : chapter.key === "etch" ? 6 : chapter.key === "implant" ? 2.2 : 3.6;
    const layerHeight = clamp(18 + result.primary / layerScale + result.risk * 0.32, 18, 128);
    const top = height * 0.28;
    const substrateTop = top + layerHeight;
    const bg = ctx.createLinearGradient(0, 0, 0, height);
    bg.addColorStop(0, "#1f2a2e");
    bg.addColorStop(1, "#11181b");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);
    const filmColor = chapter.key === "metal" ? "#c58a4a" : chapter.key === "photo" ? "#8b55ae" : chapter.key === "implant" ? "#6ac5ce" : chapter.key === "cmp" ? "#b7c4c8" : "#b9c5c8";
    ctx.fillStyle = filmColor;
    if (chapter.key === "etch") {
      ctx.fillRect(0, top, width, layerHeight);
      ctx.fillStyle = "#182127";
      const trenchCount = 5;
      for (let i = 0; i < trenchCount; i += 1) {
        const tw = width * (0.065 + result.risk / 1900);
        const tx = width * 0.16 + i * width * 0.16;
        const depth = clamp(layerHeight + result.primary * 0.22, layerHeight + 12, height * 0.58);
        ctx.fillRect(tx, top - 1, tw, depth);
        ctx.strokeStyle = result.risk > 55 ? "#e86b55" : "#8be0d8";
        ctx.strokeRect(tx, top - 1, tw, depth);
      }
    } else if (chapter.key === "photo") {
      ctx.fillRect(0, top, width, layerHeight);
      ctx.fillStyle = "#1d2428";
      const cd = clamp(result.primary / 220, 0.18, 0.52);
      for (let i = 0; i < 6; i += 1) {
        ctx.fillRect(width * 0.08 + i * width * 0.16, top, width * cd * 0.18, layerHeight + 4);
      }
    } else if (chapter.key === "metal") {
      ctx.fillStyle = "#343b3f";
      ctx.fillRect(0, top, width, layerHeight + 20);
      ctx.fillStyle = filmColor;
      for (let i = 0; i < 5; i += 1) {
        const lineW = clamp(width * 0.055 + result.secondary * 0.008, width * 0.045, width * 0.14);
        ctx.fillRect(width * 0.1 + i * width * 0.17, top + 4, lineW, layerHeight + 36);
      }
    } else if (chapter.key === "cmp") {
      ctx.beginPath();
      ctx.moveTo(0, top + layerHeight * 0.48);
      for (let x = 0; x <= width; x += 16) {
        ctx.lineTo(x, top + layerHeight * 0.48 + Math.sin(x / 22) * result.secondary * 1.2);
      }
      ctx.lineTo(width, top + layerHeight);
      ctx.lineTo(0, top + layerHeight);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.fillRect(0, top, width, layerHeight);
    }
    ctx.fillStyle = chapter.key === "metal" ? "#31383c" : chapter.key === "photo" ? "#4c3a59" : "#3f474b";
    ctx.fillRect(0, substrateTop, width, height - substrateTop);
    ctx.strokeStyle = "rgba(255,255,255,.35)";
    ctx.lineWidth = 1;
    for (let i = 0; i < 38; i += 1) {
      const y = substrateTop + ((i * 19) % Math.max(height - substrateTop, 1));
      ctx.beginPath();
      ctx.moveTo(0, y + Math.sin(i) * 4);
      ctx.lineTo(width, y + Math.cos(i) * 4);
      ctx.stroke();
    }
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(width * 0.72, top);
    ctx.lineTo(width * 0.72, substrateTop);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(width * 0.7, top + 8);
    ctx.lineTo(width * 0.72, top);
    ctx.lineTo(width * 0.74, top + 8);
    ctx.moveTo(width * 0.7, substrateTop - 8);
    ctx.lineTo(width * 0.72, substrateTop);
    ctx.lineTo(width * 0.74, substrateTop - 8);
    ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,.94)";
    ctx.font = "600 18px Inter, sans-serif";
    ctx.fillText(`${fmt(result.primary)} ${result.primaryUnit}`, width * 0.76, top + layerHeight / 2 + 6);
    ctx.font = "600 16px Inter, sans-serif";
    ctx.fillText(chapter.key === "oxidation" ? "SiO2" : chapter.key === "photo" ? "PR" : chapter.key === "metal" ? "Cu" : chapter.label, width * 0.1, top + layerHeight / 2 + 6);
    ctx.fillText("Si", width * 0.12, substrateTop + 58);
    ctx.fillStyle = "rgba(255,255,255,.82)";
    ctx.font = "12px Inter, sans-serif";
    ctx.fillText("200 nm", width - 78, height - 24);
    ctx.fillRect(width - 112, height - 20, 64, 3);
  }, [result, chapter]);
  return <canvas className="visual-canvas cross-canvas" ref={ref} />;
}

function ProfileChart({ result }: { result: Result }) {
  const ref = useCanvas((ctx, width, height) => {
    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = "#d9e1e4";
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i += 1) {
      const y = 20 + (height - 42) * (i / 4);
      ctx.beginPath();
      ctx.moveTo(34, y);
      ctx.lineTo(width - 14, y);
      ctx.stroke();
    }
    const max = Math.max(...result.profile) * 1.03;
    const min = Math.min(...result.profile) * 0.97;
    ctx.strokeStyle = "#0d8f88";
    ctx.lineWidth = 3;
    ctx.beginPath();
    result.profile.forEach((value, index) => {
      const x = 34 + (width - 54) * (index / (result.profile.length - 1));
      const y = 20 + (height - 42) * (1 - (value - min) / (max - min || 1));
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.setLineDash([5, 4]);
    ctx.strokeStyle = "#7d8a91";
    const avgY = 20 + (height - 42) * 0.5;
    ctx.beginPath();
    ctx.moveTo(34, avgY);
    ctx.lineTo(width - 14, avgY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "#56636a";
    ctx.font = "12px Inter, sans-serif";
    ctx.fillText("-100", 34, height - 7);
    ctx.fillText("0", width / 2 - 4, height - 7);
    ctx.fillText("100 mm", width - 68, height - 7);
  }, [result]);
  return <canvas className="visual-canvas profile-canvas" ref={ref} />;
}

function DefectScan({ result }: { result: Result }) {
  const ref = useCanvas((ctx, width, height) => {
    ctx.fillStyle = "#2b3033";
    ctx.fillRect(0, 0, width, height);
    for (let i = 0; i < 280; i += 1) {
      const x = (i * 47) % width;
      const y = (i * 83) % height;
      const tone = 90 + ((i * 13) % 120);
      ctx.fillStyle = `rgba(${tone}, ${tone}, ${tone}, ${0.12 + (i % 9) / 40})`;
      ctx.fillRect(x, y, 1 + (i % 3), 1 + (i % 2));
    }
    const count = Math.round(result.risk / 8) + 3;
    ctx.strokeStyle = "#e25d4f";
    ctx.lineWidth = 2;
    for (let i = 0; i < count; i += 1) {
      const x = 18 + ((i * 53) % Math.max(width - 44, 1));
      const y = 16 + ((i * 31) % Math.max(height - 40, 1));
      ctx.strokeRect(x, y, 18, 18);
    }
  }, [result]);
  return <canvas className="defect-canvas" ref={ref} />;
}

function ProcessViewport({ chapter, result, values, mode }: { chapter: Chapter; result: Result; values: Record<string, number>; mode: string }) {
  const ref = useCanvas((ctx, width, height) => {
    ctx.clearRect(0, 0, width, height);
    const intensity = processIntensity(chapter, values, result);
    const bg = ctx.createLinearGradient(0, 0, 0, height);
    bg.addColorStop(0, "#18262b");
    bg.addColorStop(1, "#0f171a");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = "rgba(255,255,255,.08)";
    ctx.fillRect(0, height * 0.58, width, height * 0.28);
    ctx.fillStyle = "#748187";
    ctx.fillRect(width * 0.08, height * 0.72, width * 0.84, 16);
    ctx.fillStyle = chapter.key === "metal" ? "#c78b49" : chapter.key === "photo" ? "#8d57b6" : chapter.key === "cmp" ? "#c8d2d6" : "#b9c7ca";
    const film = 8 + intensity.growth * 46;
    ctx.fillRect(width * 0.08, height * 0.72 - film, width * 0.84, film);

    const particleCount = 12 + Math.round(intensity.risk * 52);
    for (let i = 0; i < particleCount; i += 1) {
      const x = width * 0.12 + ((i * 73) % Math.max(width * 0.76, 1));
      const y = height * 0.12 + ((i * 41) % Math.max(height * 0.52, 1));
      const size = 2 + (i % 5) + intensity.energy * 3;
      ctx.fillStyle = i % 5 === 0 ? "rgba(233,95,76,.9)" : "rgba(117,225,216,.62)";
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }

    if (chapter.key === "oxidation") {
      ctx.strokeStyle = "rgba(128,233,224,.7)";
      ctx.lineWidth = 2;
      for (let i = 0; i < 11; i += 1) {
        const x = width * 0.13 + i * width * 0.075;
        ctx.beginPath();
        ctx.moveTo(x, height * 0.15);
        ctx.bezierCurveTo(x + 18, height * 0.33, x - 8, height * 0.48, x + 6, height * 0.67 - film * 0.25);
        ctx.stroke();
      }
      ctx.fillStyle = "#d7f4f0";
      ctx.font = "700 14px Inter, sans-serif";
      ctx.fillText(mode === "Wet" ? "H2O diffusion" : "O2 diffusion", width * 0.08, height * 0.12);
    } else if (chapter.key === "photo") {
      ctx.strokeStyle = "rgba(245,217,93,.9)";
      ctx.lineWidth = 3;
      for (let i = 0; i < 8; i += 1) {
        const x = width * 0.16 + i * width * 0.09;
        ctx.beginPath();
        ctx.moveTo(x, height * 0.08);
        ctx.lineTo(x + (intensity.risk - 0.3) * 42, height * 0.68);
        ctx.stroke();
      }
      ctx.fillStyle = "rgba(255,255,255,.85)";
      ctx.fillRect(width * 0.2, height * 0.22, width * 0.6, 18);
      ctx.fillStyle = "#0f171a";
      for (let i = 0; i < 7; i += 1) ctx.fillRect(width * 0.22 + i * width * 0.08, height * 0.22, width * 0.032, 18);
    } else if (chapter.key === "etch") {
      ctx.strokeStyle = "rgba(116,225,216,.8)";
      ctx.lineWidth = 2;
      for (let i = 0; i < 18; i += 1) {
        const x = width * 0.08 + i * width * 0.05;
        ctx.beginPath();
        ctx.moveTo(x, height * 0.1);
        ctx.lineTo(x + Math.sin(i) * 20, height * 0.67);
        ctx.stroke();
      }
      ctx.fillStyle = "#11181b";
      for (let i = 0; i < 6; i += 1) ctx.fillRect(width * 0.12 + i * width * 0.13, height * 0.55, 22 + intensity.risk * 18, height * 0.28);
    } else if (chapter.key === "implant") {
      ctx.strokeStyle = "rgba(94,194,255,.9)";
      ctx.lineWidth = 2;
      const tilt = ((values.tilt || 0) - 7) * 2.2;
      for (let i = 0; i < 14; i += 1) {
        const x = width * 0.08 + i * width * 0.06;
        ctx.beginPath();
        ctx.moveTo(x, height * 0.05);
        ctx.lineTo(x + tilt + 30 * intensity.energy, height * 0.78);
        ctx.stroke();
      }
      ctx.fillStyle = "rgba(232,95,76,.35)";
      ctx.fillRect(width * 0.1, height * 0.76, width * 0.8, 12 + intensity.risk * 35);
    } else if (chapter.key === "deposition") {
      ctx.strokeStyle = "rgba(161,239,188,.8)";
      ctx.lineWidth = 2;
      for (let i = 0; i < 12; i += 1) {
        const x = width * 0.1 + i * width * 0.07;
        ctx.beginPath();
        ctx.moveTo(x, height * 0.12);
        ctx.lineTo(x, height * 0.65);
        ctx.stroke();
      }
      for (let i = 0; i < 5; i += 1) {
        ctx.fillStyle = `rgba(185,199,202,${0.24 + i * 0.12})`;
        ctx.fillRect(width * 0.08, height * 0.72 - film - i * 7, width * 0.84, 5);
      }
    } else if (chapter.key === "metal") {
      ctx.strokeStyle = "rgba(255,198,107,.95)";
      ctx.lineWidth = 3 + intensity.energy * 5;
      for (let i = 0; i < 4; i += 1) {
        const y = height * 0.27 + i * height * 0.09;
        ctx.beginPath();
        ctx.moveTo(width * 0.08, y);
        ctx.lineTo(width * 0.9, y + Math.sin(i + result.secondary) * 10);
        ctx.stroke();
      }
      ctx.fillStyle = "rgba(230,91,76,.45)";
      ctx.fillRect(width * 0.6, height * 0.24, 18 + intensity.risk * 45, height * 0.36);
    } else if (chapter.key === "cmp") {
      ctx.fillStyle = "#4e5a60";
      ctx.fillRect(width * 0.06, height * 0.14, width * 0.88, 44);
      ctx.fillStyle = "rgba(255,255,255,.14)";
      for (let i = 0; i < 22; i += 1) ctx.fillRect(width * 0.08 + i * width * 0.038, height * 0.18, 18, 8);
      ctx.fillStyle = "rgba(120,225,216,.58)";
      for (let i = 0; i < 18; i += 1) {
        ctx.beginPath();
        ctx.arc(width * 0.1 + i * width * 0.045, height * 0.37 + Math.sin(i) * 18, 4 + intensity.risk * 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.fillStyle = "rgba(255,255,255,.92)";
    ctx.font = "700 15px Inter, sans-serif";
    ctx.fillText(getGuide(chapter).resultName, 16, height - 18);
  }, [chapter, result, values, mode]);
  return <canvas className="visual-canvas process-canvas" ref={ref} />;
}

export default function App() {
  const [chapterKey, setChapterKey] = useState<ChapterKey>("oxidation");
  const [modeByChapter, setModeByChapter] = useState<Record<string, string>>({});
  const [values, setValues] = useState<Record<string, number>>(defaults);
  const [activeView, setActiveView] = useState("웨이퍼 뷰");
  const [theoryLevel, setTheoryLevel] = useState<"basic" | "deep">("basic");
  const [logs, setLogs] = useState<string[]>(["조건 설정 완료", "공정 모델 대기 중"]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const chapter = chapters.find((item) => item.key === chapterKey) || chapters[0];
  const mode = modeByChapter[chapter.key] || chapter.modes[0];
  const result = useMemo(() => calculate(chapter, values, mode), [chapter, values, mode]);
  const guide = getGuide(chapter);
  const theoryItems = theoryLevel === "basic" ? guide.basic : guide.deep;
  const progress = chapter.key === "master" ? 100 : chapter.key === "integrated" ? 92 : Math.round((chapter.index / 10) * 72 + 12);
  const quizScore = useMemo(() => {
    return quizBank.reduce((score, item, index) => {
      const answer = (answers[index] || "").trim().toLowerCase();
      return answer.includes(item.a.toLowerCase()) || item.a.toLowerCase().includes(answer) && answer.length > 1 ? score + 10 : score;
    }, 0);
  }, [answers]);

  function updateValue(key: string, next: number) {
    setValues((current) => ({ ...current, [key]: next }));
  }

  function runSimulation() {
    const now = new Date().toLocaleTimeString("ko-KR", { hour12: false });
    setLogs((current) => [
      `${now} ${chapter.label} 계산 완료: ${result.verdict}`,
      `${now} ${result.primaryLabel} ${fmt(result.primary)} ${result.primaryUnit}`,
      ...current
    ].slice(0, 6));
  }

  function resetQuiz() {
    setAnswers({});
    setSubmitted(false);
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <Layers3 size={24} />
          <div>
            <strong>반도체 8대공정 시뮬레이터</strong>
            <span>Digital Twin Fab Training</span>
          </div>
        </div>
        <div className="status-strip">
          <div>
            <span>현재 챕터</span>
            <strong>{chapter.index}. {chapter.label} 공정</strong>
          </div>
          <div>
            <span>진행 단계</span>
            <strong>{chapter.stepTitle}</strong>
          </div>
          <div className="progress-block">
            <span>전체 진행률</span>
            <div className="progress-row">
              <i style={{ width: `${progress}%` }} />
              <strong>{progress}%</strong>
            </div>
          </div>
        </div>
        <nav className="header-actions">
          <button type="button"><Save size={16} /> 조건 저장</button>
          <button type="button"><Download size={16} /> 리포트</button>
          <button type="button"><Wrench size={16} /> 설정</button>
        </nav>
      </header>

      <section className="chapter-tabs" aria-label="공정 챕터">
        {chapters.map((item) => (
          <button
            type="button"
            key={item.key}
            className={item.key === chapter.key ? "active" : ""}
            onClick={() => {
              setChapterKey(item.key);
              setSubmitted(false);
              setAnswers({});
            }}
          >
            <span>{item.index}</span>
            {item.label}
          </button>
        ))}
      </section>

      <section className="workspace">
        <aside className="control-panel">
          <div className="panel-heading">
            <h2>장비 조건</h2>
            <span>{chapter.english}</span>
          </div>
          <div className="segmented">
            {chapter.modes.map((item) => (
              <button
                type="button"
                key={item}
                className={item === mode ? "selected" : ""}
                onClick={() => setModeByChapter((current) => ({ ...current, [chapter.key]: item }))}
              >
                {item}
              </button>
            ))}
          </div>
          <div className="field-stack">
            {chapter.fields.map((field) => (
              <RangeControl
                key={`${chapter.key}-${field.key}`}
                chapter={chapter}
                field={field}
                value={values[field.key] ?? field.min}
                onChange={(next) => updateValue(field.key, next)}
              />
            ))}
          </div>
          <button className="run-button" type="button" onClick={runSimulation}>
            <Play size={18} />
            시뮬레이션 실행
          </button>
          <div className="asset-card">
            <div className="mini-process">
              <ProcessViewport chapter={chapter} result={result} values={values} mode={mode} />
            </div>
            <div>
              <strong>{guide.resultName}</strong>
              <span>{guide.visualLabel}</span>
            </div>
          </div>
          <div className="log-box">
            <h3>시뮬레이션 로그</h3>
            {logs.map((log, index) => <p key={`${log}-${index}`}>{log}</p>)}
          </div>
        </aside>

        <section className="main-stage">
          <div className="stage-header">
            <div>
              <h1>실물 유사 공정 결과</h1>
              <p>{guide.visualLabel}</p>
            </div>
            <div className="stage-tools">
              <div className="stage-actions">
                <button type="button"><Save size={14} /> 이미지 저장</button>
                <button type="button"><Download size={14} /> 데이터 내보내기</button>
              </div>
              <div className="view-tabs">
                {["웨이퍼 뷰", "단면 뷰", "내부 공정", "불량 검사"].map((item) => (
                  <button key={item} type="button" className={activeView === item ? "active" : ""} onClick={() => setActiveView(item)}>
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="visual-grid">
            <div className="visual-box large">
              <div className="visual-title">
                <strong>{activeView}</strong>
                <span>{result.verdict === "PASS" ? "공정 조건 정상" : result.verdict === "RISK" ? "관리 필요" : "조건 이탈"}</span>
              </div>
              {activeView === "웨이퍼 뷰" && <WaferMap result={result} chapter={chapter} />}
              {activeView === "단면 뷰" && <CrossSection result={result} chapter={chapter} />}
              {activeView === "내부 공정" && <ProcessViewport chapter={chapter} result={result} values={values} mode={mode} />}
              {activeView === "불량 검사" && (
                <div className="defect-grid">
                  <DefectScan result={result} />
                  <DefectScan result={{ ...result, risk: result.risk + 10 }} />
                  <DefectScan result={{ ...result, risk: result.risk + 18 }} />
                  <DefectScan result={{ ...result, risk: result.risk + 4 }} />
                </div>
              )}
            </div>
            <div className="visual-box">
              <div className="visual-title">
                <strong>단면 계측</strong>
                <span>{result.primaryLabel}</span>
              </div>
              <CrossSection result={result} chapter={chapter} />
            </div>
          </div>

          <div className="analysis-grid">
            <div className="analysis-panel">
              <h3>두께/프로파일 분석</h3>
              <ProfileChart result={result} />
            </div>
            <div className="analysis-panel compact-table">
              <h3>계측 수치</h3>
              <dl>
                <div><dt>평균</dt><dd>{fmt(result.primary)} {result.primaryUnit}</dd></div>
                <div><dt>균일도</dt><dd>±{fmt(result.uniformity)}%</dd></div>
                <div><dt>품질지수</dt><dd>{fmt(result.quality, 0)} / 100</dd></div>
                <div><dt>리스크</dt><dd>{fmt(result.risk, 0)} / 100</dd></div>
              </dl>
            </div>
            <div className="analysis-panel">
              <div className="theory-header">
                <h3>공정 이론</h3>
                <div>
                  <button type="button" className={theoryLevel === "basic" ? "active" : ""} onClick={() => setTheoryLevel("basic")}>기초</button>
                  <button type="button" className={theoryLevel === "deep" ? "active" : ""} onClick={() => setTheoryLevel("deep")}>심화</button>
                </div>
              </div>
              <ul className="theory-list">
                {theoryItems.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
          </div>
          <div className="process-flow">
            {guide.stages.map((stage, index) => (
              <div key={stage.name}>
                <span>{index + 1}</span>
                <strong>{stage.name}</strong>
                <p>{stage.detail}</p>
                <em>{stage.signal}</em>
              </div>
            ))}
          </div>
          <div className="fab-summary-grid">
            <section className="fab-summary wide">
              <h3>공정 결과 종합</h3>
              <div className="summary-cards">
                <ResultCard label={result.primaryLabel} value={`${fmt(result.primary)} ${result.primaryUnit}`} target={chapter.key === "oxidation" ? "목표: 20-120 nm" : "목표 범위 내"} pass={result.verdict !== "FAIL"} />
                <ResultCard label="균일도" value={`±${fmt(result.uniformity)}%`} target="목표: ≤ 3.0%" pass={result.uniformity <= 3} />
                <ResultCard label="막질 / 품질" value={result.quality >= 82 ? "우수" : result.quality >= 65 ? "관리" : "불량"} target="목표: 우수 이상" pass={result.quality >= 78} />
                <ResultCard label={result.secondaryLabel} value={`${fmt(result.secondary)} ${result.secondaryUnit}`} target="참조 window 비교" pass={result.risk < 65} />
              </div>
            </section>
            <section className="fab-summary state">
              <h3>공정 상태</h3>
              <div className={`status-ring ${result.verdict.toLowerCase()}`}>{result.verdict}</div>
              <p>{result.verdict === "PASS" ? "공정 조건이 사양 내에 있습니다." : result.verdict === "RISK" ? "일부 장비 조건이 권장 구간을 벗어났습니다." : "공정 조건 재설정이 필요합니다."}</p>
            </section>
            <section className="fab-summary note">
              <h3>공정 노트</h3>
              <p>{result.note}</p>
              <p>{guide.internals.slice(0, 2).join(" · ")}</p>
            </section>
          </div>
        </section>

        <aside className="result-panel">
          <section className={`verdict-card ${result.verdict.toLowerCase()}`}>
            <span>공정 적합성</span>
            <strong>{result.verdict}</strong>
            <p>{result.note}</p>
          </section>
          <section className="metric-list">
            <h2>결과 요약</h2>
            <Metric icon={<Gauge size={18} />} label={result.primaryLabel} value={`${fmt(result.primary)} ${result.primaryUnit}`} />
            <Metric icon={<Layers3 size={18} />} label={result.secondaryLabel} value={`${fmt(result.secondary)} ${result.secondaryUnit}`} />
            <Metric icon={<Activity size={18} />} label={result.rateLabel} value={`${fmt(result.rate)} ${result.rateUnit}`} />
            <Metric icon={<Thermometer size={18} />} label="균일도" value={`±${fmt(result.uniformity)} %`} />
          </section>
          <section className="defect-panel">
            <h2>불량 모드</h2>
            {chapter.defects.map((item, index) => (
              <details key={item.name} open={index === 0}>
                <summary>{item.name}</summary>
                <p><b>원인</b> {item.cause}</p>
                <p><b>대책</b> {item.countermeasure}</p>
              </details>
            ))}
          </section>
          <section className="defect-panel">
            <h2>결함 검사</h2>
            <div className="inspection-row"><span>핀홀</span><b>{fmt(result.defects.pinhole)} #/cm²</b><em>양호</em></div>
            <div className="inspection-row"><span>입자</span><b>{fmt(result.defects.particle)} #/cm²</b><em>관리</em></div>
            <div className="inspection-row"><span>스크래치</span><b>{fmt(result.defects.scratch)} #/cm²</b><em>양호</em></div>
            <div className="inspection-row"><span>계면 결함</span><b>{fmt(result.defects.interfaceTrap)} #/cm²</b><em>양호</em></div>
          </section>
        </aside>
      </section>

      <section className="learning-section">
        <div className="learning-card">
          <div className="card-title">
            <BookOpen size={18} />
            <h2>평가</h2>
            {submitted && <strong className={quizScore >= 70 ? "score-pass" : "score-fail"}>{quizScore}점</strong>}
          </div>
          <div className="quiz-grid">
            {quizBank.map((item, index) => (
              <div className="quiz-item" key={item.q}>
                <p><b>{index + 1}.</b> {item.q}</p>
                {item.type === "choice" && item.choices ? (
                  <div className="choice-row">
                    {item.choices.map((choice) => (
                      <button
                        type="button"
                        className={answers[index] === choice ? "picked" : ""}
                        key={choice}
                        onClick={() => setAnswers((current) => ({ ...current, [index]: choice }))}
                      >
                        {choice}
                      </button>
                    ))}
                  </div>
                ) : (
                  <input
                    type="text"
                    placeholder="답 입력"
                    value={answers[index] || ""}
                    onChange={(event) => setAnswers((current) => ({ ...current, [index]: event.target.value }))}
                  />
                )}
                {submitted && (
                  <div className="answer-line">
                    {(answers[index] || "").toLowerCase().includes(item.a.toLowerCase()) ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                    <span>정답: {item.a}. {item.exp}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="quiz-actions">
            <button type="button" onClick={() => setSubmitted(true)}><CheckCircle2 size={16} /> 채점 및 해설 보기</button>
            <button type="button" onClick={resetQuiz}><RotateCcw size={16} /> 다시 풀기</button>
          </div>
        </div>
        <div className="learning-card narrow">
          <div className="card-title">
            <Timer size={18} />
            <h2>학습 흐름</h2>
          </div>
          {["기초 이론", "심화 이론", "시뮬레이션", "불량 분석", "평가", "해설"].map((item, index) => (
            <div className={`step-row ${index <= 2 ? "done" : ""}`} key={item}>
              <span>{index + 1}</span>
              <strong>{item}</strong>
            </div>
          ))}
          <p className="flow-note">평가 해설은 채점 후에만 노출되도록 구성했습니다. 70점 미만이면 오답 항목과 관련된 이론 STEP으로 복귀해 복습합니다.</p>
        </div>
      </section>
    </main>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="metric-row">
      <span>{icon}</span>
      <p>{label}</p>
      <strong>{value}</strong>
    </div>
  );
}

function ResultCard({ label, value, target, pass }: { label: string; value: string; target: string; pass: boolean }) {
  return (
    <div className="result-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <p>{target}</p>
      <em className={pass ? "pass" : "fail"}>{pass ? "PASS" : "CHECK"}</em>
    </div>
  );
}

function RangeControl({
  chapter,
  field,
  value,
  onChange
}: {
  chapter: Chapter;
  field: Field;
  value: number;
  onChange: (value: number) => void;
}) {
  const ideal = getIdeal(chapter, field);
  const state = getFieldState(value, ideal);
  const idealLeft = normalized(ideal.min, field.min, field.max) * 100;
  const idealWidth = Math.max(3, (normalized(ideal.max, field.min, field.max) - normalized(ideal.min, field.min, field.max)) * 100);
  const valueLeft = normalized(value, field.min, field.max) * 100;
  return (
    <label className={`range-field ${state.className}`}>
      <span>
        {field.label}
        <b>{fmt(value, field.step < 1 ? 1 : 0)} {field.unit}</b>
      </span>
      <div className="range-shell">
        <input
          type="range"
          min={field.min}
          max={field.max}
          step={field.step}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
        />
        <i className="ideal-band" style={{ left: `${idealLeft}%`, width: `${idealWidth}%` }} />
        <i className="value-pin" style={{ left: `${valueLeft}%` }} />
      </div>
      <div className="range-meta">
        <small>{fmt(field.min, field.step < 1 ? 1 : 0)} {field.unit}</small>
        <strong>{ideal.label}</strong>
        <small>{fmt(field.max, field.step < 1 ? 1 : 0)} {field.unit}</small>
      </div>
      <div className="range-explain">
        <em>{state.label}</em>
        <p>{ideal.reason}</p>
      </div>
    </label>
  );
}
