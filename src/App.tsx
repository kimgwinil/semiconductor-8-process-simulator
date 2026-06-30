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
import depositionImage from "./assets/process/deposition.png";
import edsImage from "./assets/process/eds.png";
import etchingImage from "./assets/process/etching.png";
import metallizationImage from "./assets/process/metallization.png";
import oxidationImage from "./assets/process/oxidation.png";
import packagingImage from "./assets/process/packaging.png";
import photoImage from "./assets/process/photolithography.png";
import waferImage from "./assets/process/wafer.png";

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

type TheoryLevel = "beginner" | "intermediate" | "advanced" | "field";

type ModalView = "report" | "settings" | null;

type SimulatorSettings = {
  autoSwitchToWafer: boolean;
  showDefectOverlay: boolean;
  reportIncludesTheory: boolean;
};

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

type StageDetail = {
  purpose: string;
  equipment: string;
  controls: string[];
  watch: string[];
  risks: string[];
};

type LearningModule = {
  prerequisite: string;
  principles: string[];
  observation: string[];
  practice: string[];
};

type TheoryFoundation = {
  definition: string;
  purpose: string;
  principle: string;
  materials: string[];
  equipment: string[];
  outputs: string[];
  metrology: string[];
};

const chapters: Chapter[] = [
  {
    key: "diffusion",
    index: 1,
    label: "웨이퍼",
    english: "Wafer",
    stepTitle: "",
    objective: "고순도 poly-Si에서 단결정 ingot을 성장시키고 wire-saw slicing, lapping, polishing, 세정/검사를 거쳐 Si wafer 품질을 확보합니다.",
    theory: [
      "웨이퍼 공정은 고순도 poly-Si를 단결정 ingot으로 성장시키고 wire-saw로 얇게 절단해 기판을 준비하는 단계입니다.",
      "결정 방향, 두께 균일도, 표면 거칠기, 파티클은 이후 산화와 포토 공정 품질의 출발점입니다.",
      "교육 실습에서는 결정 품질과 표면 결함이 후속 공정 수율에 어떻게 전파되는지 확인합니다."
    ],
    defects: [
      { name: "결정 결함", cause: "단결정 성장 조건 불안정", countermeasure: "pull rate와 온도 구배 관리" },
      { name: "두께/평탄도 불량", cause: "절단, 래핑, 연마 조건 편차", countermeasure: "TTV, bow, warp 계측" },
      { name: "표면 오염", cause: "연마 잔사와 세정 부족", countermeasure: "RCA 세정과 파티클 검사" }
    ],
    fields: [
      { key: "temperature", label: "CZ 인상 속도", unit: "mm/min", min: 0.4, max: 2.2, step: 0.1 },
      { key: "pressure", label: "Wire 장력", unit: "N", min: 10, max: 40, step: 1 },
      { key: "dose", label: "Coolant/슬러리 유량", unit: "%", min: 60, max: 100, step: 1 },
      { key: "time", label: "슬라이싱 시간", unit: "분", min: 20, max: 120, step: 5 },
      { key: "gasFlow", label: "Polishing 시간", unit: "분", min: 10, max: 80, step: 1 }
    ],
    modes: ["CZ Si", "FZ Si", "Epi-ready"]
  },
  {
    key: "oxidation",
    index: 2,
    label: "산화",
    english: "Oxidation",
    stepTitle: "",
    objective: "Si 표면에 SiO2 절연막을 성장시키고 산화막 두께와 Si 소비량을 예측합니다.",
    theory: [
      "Dry 산화는 품질이 높지만 성장 속도가 느리고, Wet 산화는 빠른 성장에 유리합니다.",
      "Deal-Grove 모델은 초기 표면 반응 지배와 두꺼운 막의 확산 지배를 함께 설명합니다.",
      "산화막 두께의 약 44% 수준이 Si 기판 소비 두께로 환산됩니다."
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
    index: 3,
    label: "포토",
    english: "Photolithography",
    stepTitle: "",
    objective: "마스크 패턴을 PR에 전사하고 해상도, 초점심도, CD 변화를 예측합니다.",
    theory: [
      "포토는 감광막 도포, 정렬, 노광, 현상을 통해 회로 패턴을 웨이퍼 위에 정의합니다.",
      "해상도 R = k1 x 파장 / NA이며 NA 증가는 해상도를 높이지만 DOF를 줄입니다.",
      "노광 부족은 오픈, 과노광은 브리징과 CD 축소를 유발할 수 있습니다."
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
    index: 4,
    label: "식각",
    english: "Etching",
    stepTitle: "",
    objective: "포토 패턴을 하부막에 전사하며 식각 깊이, 선택비, 이방성을 계산합니다.",
    theory: [
      "식각은 PR 또는 하드마스크로 보호되지 않은 막을 제거해 회로 구조를 만드는 단계입니다.",
      "건식 식각은 플라즈마 화학 반응과 이온 충돌의 균형으로 패턴을 전사합니다.",
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
    key: "deposition",
    index: 5,
    label: "증착/이온주입",
    english: "Deposition / Ion Implantation",
    stepTitle: "",
    objective: "박막을 형성하고 도펀트를 주입해 절연, 도전, 소자 특성을 만드는 조건을 실습합니다.",
    theory: [
      "증착은 CVD/PVD/ALD로 절연막, 도전막, 배리어막을 쌓는 공정입니다.",
      "이온주입은 가속 이온으로 도펀트를 원하는 깊이에 넣고 후속 anneal로 활성화합니다.",
      "두 공정은 막 두께, step coverage, 도즈, 손상, 열 budget을 함께 고려해야 합니다."
    ],
    defects: [
      { name: "파티클/막 결함", cause: "챔버 오염, 박리", countermeasure: "PM 주기 조정, seasoning" },
      { name: "poor coverage", cause: "고종횡비 구조", countermeasure: "ALD 또는 압력 조정" },
      { name: "주입 손상", cause: "고도즈 또는 channeling", countermeasure: "tilt/anneal 최적화" }
    ],
    fields: [
      { key: "temperature", label: "증착 온도", unit: "°C", min: 150, max: 800, step: 5 },
      { key: "time", label: "증착 시간", unit: "분", min: 1, max: 120, step: 1 },
      { key: "pressure", label: "챔버 압력", unit: "Torr", min: 0.1, max: 20, step: 0.1 },
      { key: "gasFlow", label: "전구체 유량", unit: "sccm", min: 5, max: 200, step: 5 },
      { key: "energy", label: "주입 에너지", unit: "keV", min: 5, max: 300, step: 5 },
      { key: "dose", label: "주입 도즈", unit: "1e15/cm²", min: 0.1, max: 10, step: 0.1 }
    ],
    modes: ["CVD + Implant", "ALD + Implant", "PVD + Implant"]
  },
  {
    key: "metal",
    index: 6,
    label: "금속배선",
    english: "Metallization",
    stepTitle: "",
    objective: "금속 라인과 via를 형성하고 저항, 전류밀도, electromigration 리스크를 계산합니다.",
    theory: [
      "금속배선은 소자 간 전기 신호를 연결하며 저항과 electromigration이 핵심 관리 대상입니다.",
      "선폭 축소와 길이 증가는 RC delay를 증가시킵니다.",
      "배리어/라이너와 구리 충전 품질은 신뢰성에 직접 영향을 줍니다."
    ],
    defects: [
      { name: "보이드", cause: "충전 불량", countermeasure: "seed/plate 조건 최적화" },
      { name: "EM 리스크", cause: "높은 전류밀도", countermeasure: "선폭 확대, cap layer 개선" },
      { name: "오픈/쇼트", cause: "패턴 결함, 잔류 금속", countermeasure: "검사와 평탄화 조건 개선" }
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
    key: "implant",
    index: 7,
    label: "EDS",
    english: "Electrical Die Sorting",
    stepTitle: "",
    objective: "웨이퍼 상태에서 die별 전기 특성을 검사하고 양품/불량 die를 분류합니다.",
    theory: [
      "EDS는 패키징 전에 probe card로 wafer die를 전기 검사해 불량 die를 걸러내는 단계입니다.",
      "검사 커버리지, probe 접촉 안정성, 테스트 시간은 수율 판정과 비용에 영향을 줍니다.",
      "Wafer map은 die 위치별 불량 패턴을 보여주며 공정 원인 분석의 중요한 자료가 됩니다."
    ],
    defects: [
      { name: "접촉 불량", cause: "probe needle 오염 또는 압력 부족", countermeasure: "probe clean과 overdrive 보정" },
      { name: "오검출", cause: "테스트 한계값 또는 온도 조건 부적합", countermeasure: "guard band와 retest 조건 검증" },
      { name: "수율 저하 패턴", cause: "공정 편차의 wafer map 반영", countermeasure: "공정별 inline data와 상관 분석" }
    ],
    fields: [
      { key: "dose", label: "테스트 커버리지", unit: "%", min: 70, max: 100, step: 1 },
      { key: "pressure", label: "Probe 접촉 안정도", unit: "%", min: 70, max: 100, step: 1 },
      { key: "time", label: "Die당 테스트 시간", unit: "ms", min: 5, max: 80, step: 1 },
      { key: "temperature", label: "검사 온도 안정도", unit: "%", min: 70, max: 100, step: 1 }
    ],
    modes: ["Wafer Probe", "Parametric", "Functional"]
  },
  {
    key: "cmp",
    index: 8,
    label: "패키징",
    english: "Packaging",
    stepTitle: "",
    objective: "양품 die를 절단, 접합, 배선, 몰딩, 최종검사하여 사용 가능한 반도체 패키지로 완성합니다.",
    theory: [
      "패키징은 wafer saw, die attach, wire bonding 또는 flip-chip, molding, final test로 이어지는 후공정입니다.",
      "패키지는 칩을 외부 환경에서 보호하고 전기적/열적 연결을 제공합니다.",
      "접합 강도, 열저항, void, wire sweep, final test yield가 핵심 실습 지표입니다."
    ],
    defects: [
      { name: "Die attach void", cause: "접착재 도포 또는 경화 조건 불량", countermeasure: "dispense와 cure profile 최적화" },
      { name: "Wire/bumps 불량", cause: "bond force, 온도, 오염 문제", countermeasure: "bond pull/shear 검사" },
      { name: "몰딩/패키지 균열", cause: "응력, 수분, 열팽창 불일치", countermeasure: "재료와 reflow 조건 관리" }
    ],
    fields: [
      { key: "downforce", label: "Bond force", unit: "gf", min: 10, max: 80, step: 1 },
      { key: "platen", label: "Bond 온도", unit: "°C", min: 120, max: 280, step: 5 },
      { key: "time", label: "Cure 시간", unit: "분", min: 10, max: 180, step: 5 },
      { key: "slurry", label: "Mold 압력", unit: "bar", min: 20, max: 110, step: 1 },
      { key: "density", label: "Final test 커버리지", unit: "%", min: 70, max: 100, step: 1 }
    ],
    modes: ["Wire Bond", "Flip Chip", "Fan-out"]
  }
];

const processImages: Partial<Record<ChapterKey, string>> = {
  diffusion: waferImage,
  oxidation: oxidationImage,
  photo: photoImage,
  etch: etchingImage,
  deposition: depositionImage,
  metal: metallizationImage,
  implant: edsImage,
  cmp: packagingImage,
  integrated: oxidationImage,
  master: photoImage
};

const imageAuditNotes: Partial<Record<ChapterKey, string>> = {
  diffusion: "이미지 검토: SK실트론/SUMCO의 웨이퍼 제조 흐름을 기준으로 ingot block, multi-wire saw, coolant/slurry가 한 장에서 명확히 보이도록 교체했고, 실사 위 시연 오버레이는 제거했습니다.",
  oxidation: "이미지 검토: quartz furnace tube와 wafer hot zone이 보여 열산화 설명과 일치합니다.",
  photo: "이미지 검토: mask aligner/노광 계열 장면과 PR 패턴 설명이 연결됩니다.",
  etch: "이미지 검토: plasma chamber와 식각 반응 표현이 건식 식각 설명에 적합합니다.",
  deposition: "이미지 검토: 증착 장비 이미지를 사용하므로 증착 설명과는 일치하며, 이온주입은 실습 변수와 내부 뷰에서 보완했습니다.",
  metal: "이미지 검토: Cu dual damascene 기준에 맞춰 금속배선 wafer, metallization 장비, Cu-filled trench/via 단면 inset이 보이도록 교체했습니다.",
  implant: "이미지 검토: probe needle, wafer chuck, wafer map 맥락이 보여 EDS/wafer probing 설명과 일치합니다.",
  cmp: "이미지 검토: die attach, bonding, package tray 맥락이 보여 패키징 후공정 설명과 일치합니다."
};

const viewRealityNotes: Partial<Record<ChapterKey, Record<string, string>>> = {
  diffusion: {
    "웨이퍼 뷰": "실제 기준: ingot/block, multi-wire saw, coolant/slurry가 명확히 보여야 하며 시연 도식은 겹치지 않습니다.",
    "단면 뷰": "실제 기준: polished Si 표면, saw damage layer, TTV/bow, scratch/haze 가능성을 확인합니다.",
    "내부 공정": "실제 기준: wire web 장력, ingot feed, coolant 유량, slicing 후 wafer stack이 관찰 대상입니다.",
    "불량 검사": "실제 기준: particle, haze, scratch, edge chip, TTV/bow map을 구분합니다."
  },
  oxidation: {
    "웨이퍼 뷰": "실제 기준: quartz furnace tube, wafer boat, hot zone, O2/H2O 분위기가 핵심 장면입니다.",
    "단면 뷰": "실제 기준: SiO2 성장층과 Si 소비, 계면 위치, 산화막 두께 균일도를 봅니다.",
    "내부 공정": "실제 기준: 산화제가 SiO2를 통과해 Si 계면에서 반응하는 확산/반응 과정을 봅니다.",
    "불량 검사": "실제 기준: pinhole, thickness non-uniformity, interface trap, particle 기점 결함을 확인합니다."
  },
  photo: {
    "웨이퍼 뷰": "실제 기준: scanner/stepper, mask/reticle, wafer stage, resist-coated wafer가 보여야 합니다.",
    "단면 뷰": "실제 기준: PR 패턴, CD, 잔막 scum, focus/dose에 따른 sidewall 변화를 봅니다.",
    "내부 공정": "실제 기준: mask alignment, exposure, PEB, develop 후 패턴 전사를 구분합니다.",
    "불량 검사": "실제 기준: bridge, open, collapse, overlay error, particle defect를 구분합니다."
  },
  etch: {
    "웨이퍼 뷰": "실제 기준: plasma chamber, ESC/chuck, RF plasma, etched pattern wafer가 핵심 장면입니다.",
    "단면 뷰": "실제 기준: trench depth, sidewall angle, footing, bowing, residue를 확인합니다.",
    "내부 공정": "실제 기준: ion directionality, radical reaction, passivation, byproduct removal을 봅니다.",
    "불량 검사": "실제 기준: residue, micro-trenching, undercut, mask erosion, plasma damage를 구분합니다."
  },
  deposition: {
    "웨이퍼 뷰": "실제 기준: CVD/ALD/PVD chamber, showerhead 또는 source, wafer stage가 보여야 합니다.",
    "단면 뷰": "실제 기준: film thickness, sidewall/bottom coverage, seam void, implant range를 확인합니다.",
    "내부 공정": "실제 기준: precursor flow, surface reaction, layer growth, ion implant damage를 함께 봅니다.",
    "불량 검사": "실제 기준: pinhole, particle, poor coverage, void, implant damage를 구분합니다."
  },
  metal: {
    "웨이퍼 뷰": "실제 기준: BEOL 배선 wafer, metallization 장비, Cu interconnect 패턴, damascene 단면 맥락이 보여야 합니다.",
    "단면 뷰": "실제 기준: dielectric trench/via, barrier/seed liner, Cu fill, CMP 후 표면, void/open/short 가능성을 봅니다.",
    "내부 공정": "실제 기준: dielectric trench/via 형성 → barrier/seed → Cu electroplating/fill → CMP → 전기 검사가 이어집니다.",
    "불량 검사": "실제 기준: via void, line bridge, open, corrosion, EM void, high resistance 위치를 확인합니다."
  },
  implant: {
    "웨이퍼 뷰": "실제 기준: wafer prober, probe card, chuck, microscope/test head, wafer map이 보여야 합니다.",
    "단면 뷰": "실제 기준: 제조 단면보다 probe needle contact, pad mark, die grid 판정 구조가 중요합니다.",
    "내부 공정": "실제 기준: probe contact, electrical test, binning, retest, wafer map update 순서를 봅니다.",
    "불량 검사": "실제 기준: contact fail, false fail/pass, edge fail, cluster fail, probe mark abnormal을 구분합니다."
  },
  cmp: {
    "웨이퍼 뷰": "실제 기준: 패키징은 wafer 표면이 아니라 die attach, wire bonding, package tray가 중심입니다.",
    "단면 뷰": "실제 기준: die, substrate/leadframe, bond wire 또는 bump, mold compound, void/crack을 봅니다.",
    "내부 공정": "실제 기준: dicing, die attach, bonding, molding, marking, final test 흐름이 보여야 합니다.",
    "불량 검사": "실제 기준: X-ray void, SAM delamination, bond lift, wire sweep, die crack, package crack을 구분합니다."
  }
};

const samsungEightProcessVideo = {
  label: "Samsung Semiconductor Newsroom - 반도체 8대공정",
  url: "https://www.youtube.com/watch?v=M2b2kpJRHmM"
};

const basicSemiconductorPrinciplesVideo = {
  label: "bRd 3D - 반도체 기본원리와 8대 공정",
  url: "https://www.youtube.com/watch?v=bAXxxmXCk1o"
};

const imageSourceLinks: Partial<Record<ChapterKey, { label: string; url: string }[]>> = {
  diffusion: [
    {
      label: "SK siltron - Silicon wafer process video",
      url: "https://www.youtube.com/watch?v=ad-fZDchlo0"
    },
    samsungEightProcessVideo,
    basicSemiconductorPrinciplesVideo,
    {
      label: "Samsung Semiconductor - Wafer process",
      url: "https://semiconductor.samsung.com/support/tools-resources/fabrication-process/eight-essential-semiconductor-fabrication-processes-part-1-what-is-a-wafer/"
    },
    {
      label: "PV-Manufacturing - Wafering / wire saw slicing",
      url: "https://pv-manufacturing.org/silicon-production/wafering/"
    }
  ],
  oxidation: [samsungEightProcessVideo, basicSemiconductorPrinciplesVideo],
  photo: [samsungEightProcessVideo, basicSemiconductorPrinciplesVideo],
  etch: [samsungEightProcessVideo, basicSemiconductorPrinciplesVideo],
  deposition: [samsungEightProcessVideo, basicSemiconductorPrinciplesVideo],
  metal: [samsungEightProcessVideo, basicSemiconductorPrinciplesVideo],
  implant: [samsungEightProcessVideo, basicSemiconductorPrinciplesVideo],
  cmp: [samsungEightProcessVideo, basicSemiconductorPrinciplesVideo]
};

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
    temperature: { min: 0.8, max: 1.4, label: "권장 0.8-1.4 mm/min", reason: "단결정 결함과 생산성의 균형" },
    pressure: { min: 18, max: 30, label: "권장 18-30 N", reason: "wire 흔들림과 kerf loss 억제" },
    dose: { min: 82, max: 96, label: "권장 82-96%", reason: "절단 열과 silicon debris 배출 안정화" },
    time: { min: 45, max: 90, label: "권장 45-90분", reason: "saw mark와 처리량 균형" },
    gasFlow: { min: 28, max: 55, label: "권장 28-55분", reason: "표면 roughness와 polishing damage 균형" }
  },
  implant: {
    dose: { min: 92, max: 100, label: "권장 92-100%", reason: "중요 전기 항목 검사 커버리지" },
    pressure: { min: 88, max: 98, label: "권장 88-98%", reason: "probe 접촉 안정 구간" },
    time: { min: 12, max: 45, label: "권장 12-45 ms", reason: "검사 신뢰도와 처리량 균형" },
    temperature: { min: 88, max: 98, label: "권장 88-98%", reason: "온도 민감 항목 오판 방지" }
  },
  deposition: {
    temperature: { min: 280, max: 520, label: "권장 280-520°C", reason: "막질과 열 budget 균형" },
    time: { min: 8, max: 60, label: "권장 8-60분", reason: "목표 박막 두께 관리" },
    pressure: { min: 1, max: 6, label: "권장 1-6 Torr", reason: "전구체 확산과 반응 균일도 확보" },
    gasFlow: { min: 45, max: 110, label: "권장 45-110 sccm", reason: "전구체 공급 안정 구간" },
    energy: { min: 35, max: 130, label: "권장 35-130 keV", reason: "얕은 접합과 손상 억제 균형" },
    dose: { min: 0.8, max: 4, label: "권장 0.8-4.0", reason: "전기적 활성화와 결정 손상 균형" }
  },
  metal: {
    thickness: { min: 180, max: 520, label: "권장 180-520 nm", reason: "저항과 공정 난이도 균형" },
    width: { min: 70, max: 220, label: "권장 70-220 nm", reason: "전류밀도와 RC delay 관리" },
    length: { min: 10, max: 90, label: "권장 10-90 µm", reason: "배선 저항 상승 완화" },
    current: { min: 0.5, max: 8, label: "권장 0.5-8 mA", reason: "electromigration 리스크 억제" }
  },
  cmp: {
    downforce: { min: 25, max: 55, label: "권장 25-55 gf", reason: "bond 강도와 die 손상 균형" },
    platen: { min: 160, max: 240, label: "권장 160-240°C", reason: "접합/경화 안정 구간" },
    time: { min: 45, max: 130, label: "권장 45-130분", reason: "접착재 cure와 처리량 균형" },
    slurry: { min: 45, max: 85, label: "권장 45-85 bar", reason: "mold 충전과 wire sweep 억제" },
    density: { min: 90, max: 100, label: "권장 90-100%", reason: "final test 누락 방지" }
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
    resultName: "Si 웨이퍼 / 표면 품질 지도",
    visualLabel: "단결정 Si ingot을 절단·연마·세정해 산화와 포토가 가능한 기판 상태를 만듭니다.",
    basic: ["웨이퍼는 모든 회로가 형성되는 출발 기판입니다.", "결정 방향, 두께 균일도, 표면 거칠기와 청정도가 후속 공정 수율을 좌우합니다.", "연마와 세정 조건이 나쁘면 산화막 결함과 포토 CD 불량으로 이어질 수 있습니다."],
    deep: ["CZ/FZ 성장법은 산소 농도, 결함 밀도, 저항률 균일도에 차이를 만듭니다.", "TTV, bow, warp는 포토 초점 여유도와 overlay 안정성에 직접 영향을 줍니다.", "Epi-ready wafer는 표면 결함과 금속 오염 관리가 특히 중요합니다."],
    stages: [{ name: "단결정 성장", detail: "Si ingot 형성", signal: "결정성" }, { name: "절단", detail: "wafer 두께로 slicing", signal: "TTV" }, { name: "연마", detail: "표면 평탄화", signal: "roughness" }, { name: "세정/검사", detail: "파티클과 금속 오염 제거", signal: "청정도" }],
    internals: ["결정 결함이 후속 소자 불량 원인이 됨", "표면 거칠기는 산화막 균일도에 영향", "평탄도는 포토 focus margin을 결정", "청정도는 파티클/핀홀 발생률을 낮춤"]
  },
  implant: {
    resultName: "EDS / Wafer probe map",
    visualLabel: "Probe card가 die pad에 접촉해 전기 특성을 측정하고 양품/불량 die를 분류합니다.",
    basic: ["EDS는 패키징 전에 웨이퍼 상태에서 칩의 전기적 동작을 확인하는 검사입니다.", "Probe needle 접촉, 테스트 커버리지, 한계값 설정이 오판과 수율에 영향을 줍니다.", "Wafer map은 불량 위치 패턴을 보여주어 공정 원인 추적에 사용됩니다."],
    deep: ["Parametric test는 전압/전류/저항 같은 소자 특성을 보고, functional test는 회로 동작을 확인합니다.", "Retest와 guard band는 false fail/false pass를 줄이지만 테스트 시간과 비용을 증가시킵니다.", "Edge die fail, ring pattern, cluster fail은 서로 다른 공정 원인을 암시합니다."],
    stages: [{ name: "Wafer 로딩", detail: "Chuck에 wafer 고정", signal: "alignment" }, { name: "Probe 접촉", detail: "needle과 pad 접촉", signal: "contact" }, { name: "전기 검사", detail: "parametric/functional 측정", signal: "coverage" }, { name: "Die 분류", detail: "wafer map 생성", signal: "yield" }],
    internals: ["접촉 저항이 높으면 false fail 증가", "검사 온도는 누설/속도 특성에 영향", "wafer map 패턴은 공정 이상 추적 단서", "불량 die는 패키징 투입에서 제외"]
  },
  deposition: {
    resultName: "박막/도핑 프로파일",
    visualLabel: "박막 증착과 이온주입 조건이 막 두께, coverage, 도펀트 손상 리스크를 함께 결정합니다.",
    basic: ["증착은 절연막/도전막/배리어막을 쌓고, 이온주입은 도펀트로 전기 특성을 만듭니다.", "CVD/PVD/ALD는 막 형성 방식이 다르고, ion energy/dose는 주입 깊이와 손상을 바꿉니다.", "후속 anneal과 thermal budget까지 고려해야 최종 소자 특성을 예측할 수 있습니다."],
    deep: ["증착은 표면 반응과 mass transport 지배 구간에 따라 성장률이 달라집니다.", "이온주입은 projected range, straggle, channeling, activation을 함께 봐야 합니다.", "막 응력과 주입 손상은 누설, 접합 깊이, 신뢰성 평가로 이어집니다."],
    stages: [{ name: "전구체/빔 준비", detail: "가스 또는 이온 조건 설정", signal: "source" }, { name: "막 성장", detail: "표면 흡착/반응", signal: "thickness" }, { name: "이온 주입", detail: "도펀트 깊이 형성", signal: "dose" }, { name: "활성화", detail: "손상 회복과 전기적 활성화", signal: "anneal" }],
    internals: ["전구체 확산이 coverage를 결정", "이온 충돌은 격자 손상을 만듦", "고도즈는 활성화와 결함 사이 균형 필요", "막질과 도핑은 후속 전기 특성을 결정"]
  },
  metal: {
    resultName: "금속 배선 / 전류밀도 지도",
    visualLabel: "금속 라인이 전류를 운반하며 선폭과 두께가 저항·EM 리스크를 결정합니다.",
    basic: ["금속 배선은 소자 사이를 전기적으로 연결합니다.", "선폭이 좁고 전류가 높으면 전류밀도가 올라갑니다.", "전류밀도 증가는 electromigration과 오픈 불량으로 이어질 수 있습니다."],
    deep: ["저항은 비저항 x 길이 / 단면적으로 계산됩니다.", "Cu damascene은 barrier/seed, plating, 평탄화 품질이 모두 중요합니다.", "RC delay와 EM lifetime은 공정 스케일링의 핵심 제약입니다."],
    stages: [{ name: "Trench/Via", detail: "절연막에 배선 홈과 via를 형성", signal: "CD/depth" }, { name: "Barrier/Seed", detail: "Cu 확산 차단막과 도금 시작층 형성", signal: "liner" }, { name: "Cu Fill", detail: "전해도금 등으로 trench와 via를 Cu로 충전", signal: "void" }, { name: "CMP/Test", detail: "과잉 Cu 제거 후 저항과 EM margin 평가", signal: "R/J" }],
    internals: ["전자 흐름이 금속 원자 이동을 유발", "좁은 neck에서 전류밀도 집중", "void가 있으면 국부 발열 증가", "barrier 손상은 누설과 신뢰성 저하로 연결"]
  },
  cmp: {
    resultName: "패키지 조립 / Final test",
    visualLabel: "양품 die를 절단·접합·배선·몰딩하고 최종검사로 출하 가능한 package를 완성합니다.",
    basic: ["패키징은 칩을 보호하고 외부 회로와 연결하기 위한 후공정입니다.", "die attach, wire bonding 또는 flip-chip, molding, final test가 핵심 흐름입니다.", "접합 강도와 열저항, void, final test yield가 주요 품질 지표입니다."],
    deep: ["Flip-chip은 bump와 substrate 접합 품질이 중요하고, wire bond는 bond force와 loop 형상이 중요합니다.", "몰딩 응력과 수분은 균열, delamination, reflow 불량을 만들 수 있습니다.", "Final test는 EDS에서 놓친 패키지 조립 후 결함과 시스템 동작을 확인합니다."],
    stages: [{ name: "Dicing", detail: "wafer를 die로 절단", signal: "chipping" }, { name: "Die attach", detail: "substrate에 die 접합", signal: "void" }, { name: "Interconnect", detail: "wire/bump 연결", signal: "bond" }, { name: "Mold/Test", detail: "보호와 최종검사", signal: "yield" }],
    internals: ["접합 void는 열저항 증가", "bond force 과다는 die damage 위험", "몰딩 압력은 wire sweep에 영향", "final test는 출하 전 마지막 판정"]
  }
};

const theoryLevelLabels: Record<TheoryLevel, string> = {
  beginner: "초급",
  intermediate: "중급",
  advanced: "고급",
  field: "실무"
};

const theoryCurriculum: Partial<Record<ChapterKey, Record<TheoryLevel, string[]>>> = {
  oxidation: {
    beginner: [
      "산화는 실리콘 표면을 산소 또는 수증기와 반응시켜 SiO2 절연막을 성장시키는 열공정입니다.",
      "Dry 산화는 성장 속도는 느리지만 계면 품질이 좋아 얇은 산화막과 게이트 산화막 이해에 중요합니다.",
      "Wet 산화는 수증기 반응성이 커서 두꺼운 field oxide를 빠르게 만들 때 유리합니다.",
      "산화막이 자라면 산소가 붙는 것만이 아니라 Si 기판 일부가 SiO2로 변환되어 소비됩니다.",
      "온도, 시간, 산화제, 압력, 초기 산화막 두께가 최종 막 두께와 균일도를 결정합니다."
    ],
    intermediate: [
      "Deal-Grove 모델은 얇은 막의 표면 반응 지배와 두꺼운 막의 확산 지배를 선형-포물선 관계로 설명합니다.",
      "초기에는 산화제가 Si 표면에 빨리 도달하므로 성장률이 높고, 막이 두꺼워지면 산화제가 SiO2를 통과해야 해서 성장률이 낮아집니다.",
      "산화막 두께의 약 44% 정도는 기존 Si가 소비된 두께로 이해할 수 있어 접합 깊이와 표면 높이 계산에 영향을 줍니다.",
      "온도가 높을수록 산화제 확산계수와 계면 반응속도가 증가하지만 열 budget과 응력 리스크도 증가합니다.",
      "두께 균일도는 furnace zone 온도 분포, 가스 유동, wafer loading, boat 위치에 의해 달라집니다."
    ],
    advanced: [
      "초박막 산화에서는 Deal-Grove만으로 설명하기 어려운 초기 rapid growth, 계면 roughness, 전하 trap 영향이 나타납니다.",
      "Si에서 SiO2로 변환될 때 부피가 증가하므로 계면 응력과 wafer bow가 생길 수 있고, 막질과 신뢰성에 영향을 줍니다.",
      "염소계 첨가 또는 후속 anneal은 금속 오염과 계면 trap을 줄여 산화막 신뢰성을 개선하는 데 사용될 수 있습니다.",
      "계면 trap, fixed charge, mobile ion은 C-V 특성, threshold voltage, 누설 전류를 변화시킵니다.",
      "얇은 gate oxide에서는 pinhole, breakdown field, TDDB 같은 전기적 신뢰성 지표가 핵심 평가 항목입니다."
    ],
    field: [
      "실무에서는 RCA 또는 HF-last 세정 상태가 산화막 품질을 좌우하므로 산화 전 표면 준비 이력을 반드시 확인합니다.",
      "레시피 검증은 ramp-up, soak, 산화제 전환, purge, ramp-down 구간을 분리해 두께와 결함 영향을 봅니다.",
      "계측은 ellipsometry map, oxide thickness uniformity, 파티클 검사, 필요 시 C-V/I-V 신뢰성 평가로 연결됩니다.",
      "두께가 목표보다 낮으면 온도 zone, 산화제 공급, 실제 soak time을 확인하고, 높으면 over-oxidation과 Si 소비를 같이 검토합니다.",
      "생산 조건에서는 dummy wafer와 boat loading 패턴까지 포함해 첫 장, 중앙, 마지막 장의 wafer 간 편차를 관리합니다."
    ]
  },
  photo: {
    beginner: [
      "포토리소그래피는 회로 패턴을 마스크에서 감광막(PR)으로 옮기는 공정입니다.",
      "기본 흐름은 HMDS 처리, PR 코팅, soft bake, 정렬, 노광, PEB, 현상, 검사 순서로 이해할 수 있습니다.",
      "노광량이 부족하면 패턴이 덜 열리고, 과하면 선폭이 줄거나 서로 붙는 문제가 생길 수 있습니다.",
      "파장이 짧고 NA가 높을수록 작은 패턴을 만들기 쉽지만 초점 관리가 더 어려워집니다.",
      "최종적으로 확인하는 대표 지표는 CD, overlay, 잔막, 브리징, 패턴 붕괴입니다."
    ],
    intermediate: [
      "Rayleigh 식 R = k1 x lambda / NA는 해상도 한계를, DOF는 초점 허용 범위를 설명합니다.",
      "Dose-focus matrix는 노광량과 초점 변화에 따른 CD window를 찾아 공정 여유도를 확인하는 기본 실험입니다.",
      "Positive PR은 노광된 영역이 제거되고, negative PR은 노광된 영역이 남는 방식으로 패턴 극성이 다릅니다.",
      "PR 두께와 bake 온도는 흡광, 용매 제거, 현상 속도, sidewall profile에 영향을 줍니다.",
      "Overlay 오차는 이전 layer와 현재 layer의 정렬 오차이며, 누적되면 접촉 불량과 short/open으로 이어집니다."
    ],
    advanced: [
      "Dill parameter와 Mack model은 PR 내부 광흡수, 산 생성, 현상 속도 차이를 정량적으로 다루는 모델입니다.",
      "Standing wave와 swing curve는 기판 반사광 때문에 PR 내부 노광 에너지가 깊이 방향으로 흔들리는 현상입니다.",
      "PEB의 산 확산은 line edge roughness와 CD bias를 줄일 수 있지만 과하면 패턴 경계가 흐려집니다.",
      "OPC, phase shift mask, off-axis illumination은 광학 한계를 보정해 실제 웨이퍼 CD를 마스크 의도에 맞춥니다.",
      "EUV에서는 photon shot noise와 resist stochastic defect가 미세 패턴의 open/bridge 확률을 키우는 고급 이슈입니다."
    ],
    field: [
      "실무 조건 설정은 track recipe와 scanner recipe를 분리해 PR dispense, spin, bake, expose, develop을 각각 관리합니다.",
      "CD-SEM, overlay metrology, defect inspection 결과를 함께 보고 dose/focus 보정 또는 rework 여부를 결정합니다.",
      "초점 이상은 wafer topography, chuck 평탄도, resist thickness map, leveling sensor 상태를 같이 확인해야 합니다.",
      "현상 후 잔막이나 scum이 보이면 현상 시간, puddle 상태, PR aging, bake 온도 이력을 점검합니다.",
      "재작업은 PR strip이 가능해도 하부막 손상, CD 변동, 오염 리스크를 평가한 뒤 제한적으로 적용합니다."
    ]
  },
  etch: {
    beginner: [
      "식각은 포토 공정으로 만든 PR 또는 하드마스크 패턴을 이용해 아래 막을 제거하는 공정입니다.",
      "Wet etch는 액체 화학반응을 이용하고, dry etch는 플라즈마를 이용해 미세 패턴에 적합합니다.",
      "식각에서 중요한 값은 식각 깊이, 식각률, 선택비, 균일도, profile angle입니다.",
      "수직에 가까운 패턴을 만들려면 이온 방향성과 라디칼 반응성을 균형 있게 맞춰야 합니다.",
      "과식각은 목표막 아래층 손상과 CD 손실을 만들고, 부족 식각은 잔막을 남깁니다."
    ],
    intermediate: [
      "RIE와 ICP 식각은 라디칼의 화학 반응과 bias 이온 충돌의 물리적 제거가 함께 작용합니다.",
      "압력이 낮으면 평균 자유 행로가 길어져 방향성이 좋아지고, 압력이 높으면 충돌 증가로 등방성이 커질 수 있습니다.",
      "RF power와 bias는 이온 에너지와 식각률을 올리지만 damage, micro-trenching, mask erosion도 키웁니다.",
      "선택비는 목적막 식각률을 마스크 또는 정지막 식각률로 나눈 값이며, 낮으면 패턴 fidelity가 나빠집니다.",
      "Endpoint는 OES, interferometry, time-based control 등으로 판단하며 over-etch margin을 포함합니다."
    ],
    advanced: [
      "Plasma sheath는 웨이퍼 표면 근처 전기장 영역으로, 이온이 수직 방향으로 가속되는 원인을 제공합니다.",
      "ARDE와 RIE lag는 좁고 깊은 패턴에서 라디칼 공급과 부산물 배출이 어려워 식각률이 낮아지는 현상입니다.",
      "Microloading은 패턴 밀도 차이에 따라 국부 식각률이 달라지는 효과이며 CD와 깊이 편차를 만듭니다.",
      "Polymer passivation은 sidewall 보호에는 필요하지만 과하면 식각 정지 또는 잔사 결함을 만들 수 있습니다.",
      "Charging damage는 절연막 위 플라즈마 전하 축적으로 gate oxide 손상과 device leakage를 유발할 수 있습니다."
    ],
    field: [
      "실무에서는 chamber seasoning, wall condition, ESC 온도, backside He leak이 recipe 재현성에 큰 영향을 줍니다.",
      "식각 결과가 흔들리면 endpoint trace, RF reflected power, pressure stability, MFC flow, chamber clean 이력을 먼저 확인합니다.",
      "Profile 문제는 cross-section SEM으로 확인하고, bowing, footing, taper, residue를 구분해 원인을 좁힙니다.",
      "Post-etch clean은 polymer residue와 금속 오염 제거를 담당하므로 식각 자체만큼 중요합니다.",
      "양산 판단은 CD loss, depth, selectivity, defect density, chamber matching 데이터를 함께 보고 결정합니다."
    ]
  },
  diffusion: {
    beginner: [
      "웨이퍼는 반도체 회로를 만들기 위한 기본 기판이며, 대부분 고순도 단결정 Si로 시작합니다.",
      "공정 흐름은 poly-Si 준비, 단결정 ingot 성장, cropping/grinding, wire-saw slicing, lapping/etching, polishing, cleaning, inspection으로 볼 수 있습니다.",
      "표면이 평탄하고 깨끗해야 산화막이 균일하게 자라고 포토 공정 초점도 안정됩니다.",
      "초보자는 웨이퍼 품질이 후속 산화/포토/식각 수율의 출발점이라는 점을 먼저 이해해야 합니다.",
      "시뮬레이터 이미지는 ingot/block이 multi-wire saw 장비를 통과하며 절단되는 현장 장면을 중심으로 구성했습니다."
    ],
    intermediate: [
      "CZ 방식은 대구경 wafer 생산에 널리 쓰이고, FZ 방식은 산소/금속 오염이 낮은 고저항 wafer에 유리합니다.",
      "CZ 인상 속도는 결정 결함과 생산성을 함께 바꾸며, 너무 빠르면 품질 리스크가 커질 수 있습니다.",
      "결정 방향 <100>, <111>은 산화, 식각, 소자 특성에 영향을 주므로 wafer spec에 명확히 관리됩니다.",
      "Wire-saw slicing에서는 wire 장력, wire 속도, coolant/slurry 공급이 saw mark, kerf loss, TTV에 영향을 줍니다.",
      "표면 roughness와 micro scratch는 산화막 pinhole, PR 코팅 불균일, 파티클 기점이 될 수 있습니다.",
      "Lapping, etching, polishing은 slicing damage를 제거하고 mirror wafer 표면을 만드는 핵심 후처리입니다."
    ],
    advanced: [
      "단결정 성장 중 point defect, oxygen precipitate, dislocation은 후속 소자 leakage와 신뢰성에 영향을 줄 수 있습니다.",
      "Epitaxial wafer는 기판 위에 결함과 도핑이 제어된 얇은 Si 층을 성장시켜 고성능 소자에 활용됩니다.",
      "Wafer notch/flat은 결정 방향과 장비 정렬 기준이며, 잘못된 방향 관리는 overlay와 식각 방향성 문제로 이어질 수 있습니다.",
      "금속 오염은 minority carrier lifetime과 junction leakage를 악화시키므로 ppb 이하 수준의 청정 관리가 중요합니다.",
      "웨이퍼 품질은 공정 중 수정하기 어렵기 때문에 incoming inspection과 supplier spec 관리가 핵심입니다."
    ],
    field: [
      "실무에서는 incoming wafer에서 particle, haze, scratch, TTV, bow, resistivity map을 확인합니다.",
      "Wire-saw 장비에서는 wire web 정렬, coolant/slurry 유량, ingot block feed 안정성을 함께 확인합니다.",
      "세정 후 water mark나 organic residue가 남으면 산화막 결함과 PR coating 불량으로 이어집니다.",
      "웨이퍼 이미지에는 회로 패턴이 없어야 하며, ingot slicing 장비와 mirror wafer 검사 흐름이 보이는 것이 교육 목적에 맞습니다.",
      "이 단계 실습은 인상 속도, wire 장력, coolant/slurry, polishing 시간이 표면 품질과 후속 공정 리스크에 미치는 영향을 확인하는 데 목적이 있습니다."
    ]
  },
  implant: {
    beginner: [
      "EDS는 Electrical Die Sorting의 약자로, 웨이퍼 상태에서 각 die의 전기적 동작을 검사합니다.",
      "패키징 전에 불량 die를 걸러내면 불량 칩에 비싼 패키징 비용을 쓰지 않아도 됩니다.",
      "Probe card의 바늘이 die pad에 접촉하고 tester가 전압/전류/기능 동작을 측정합니다.",
      "검사 결과는 wafer map으로 표시되어 양품 die와 불량 die 위치를 구분합니다.",
      "초보자는 EDS가 제조 공정이 아니라 품질 판정과 수율 분석 단계라는 점을 구분해야 합니다.",
      "EDS 장비는 prober, probe card, tester, chuck, 온도 제어부, wafer map 소프트웨어가 함께 동작합니다.",
      "검사 결과는 패키징 투입 여부를 결정하므로 후공정 비용과 최종 수율에 직접 연결됩니다."
    ],
    intermediate: [
      "Parametric test는 threshold, leakage, resistance 같은 소자 특성을 측정하고 functional test는 회로 동작을 확인합니다.",
      "Probe overdrive가 부족하면 접촉 저항이 커지고, 과하면 pad damage나 needle mark 문제가 생깁니다.",
      "Test coverage가 높을수록 불량 검출력은 좋아지지만 die당 test time과 장비 병목이 증가합니다.",
      "False fail은 양품을 불량으로 버리는 문제이고, false pass는 불량을 패키징으로 넘기는 문제입니다.",
      "Wafer map의 edge fail, cluster fail, ring pattern은 각각 장비/공정 원인 추적의 단서가 됩니다.",
      "Probe card는 미세한 needle 또는 MEMS contact 구조로 die pad에 접촉하며 contact resistance 관리가 중요합니다.",
      "Hot/cold test는 온도 조건에 따라 드러나는 marginal die를 분류하는 데 사용됩니다."
    ],
    advanced: [
      "Guard band는 온도, 전압, 공정 편차를 고려해 pass/fail limit에 여유를 두는 방법입니다.",
      "Retest 전략은 contact 불량으로 인한 false fail을 줄이지만 실제 불량을 통과시키지 않도록 설계해야 합니다.",
      "Adaptive test는 이전 측정 결과나 wafer 위치 정보를 이용해 테스트 항목과 시간을 최적화하는 방식입니다.",
      "EDS 데이터는 inline metrology, 공정 장비 로그, lot 이력과 연결해야 원인 분석 가치가 커집니다.",
      "Probe card wear와 needle contamination은 장기적으로 yield trend를 왜곡할 수 있어 별도 관리 지표가 필요합니다.",
      "Test limit은 datasheet spec, 공정 분포, 고객 품질 요구를 동시에 반영해 설정해야 합니다.",
      "Bin split은 단순 양불 외에도 속도, 전력, 누설, 기능 등급을 나누는 수율 경영 지표가 됩니다."
    ],
    field: [
      "실무에서는 probe mark inspection, contact resistance trend, tester correlation, handler/chuck 온도 안정성을 같이 봅니다.",
      "EDS 이미지는 probe needle, wafer chuck, test head, wafer map이 보여야 하며 포토 노광 장면과 혼동되면 안 됩니다.",
      "Yield가 갑자기 낮아지면 공정 불량인지 probe 접촉 문제인지 retest와 golden wafer로 분리합니다.",
      "EDS 결과는 패키징 투입 die를 결정하므로 binning rule과 고객 spec을 정확히 반영해야 합니다.",
      "시뮬레이터에서는 커버리지와 접촉 안정도를 낮추면 오검출과 수율 리스크가 커지도록 구성했습니다.",
      "실제 현장에서는 retest pass율, probe mark 위치, contact resistance, tester correlation을 함께 봐야 합니다.",
      "EDS 화면은 probe needle 접촉, die grid, pass/fail bin map이 보이는 것이 실제 공정에 맞습니다."
    ]
  },
  deposition: {
    beginner: [
      "증착/이온주입은 박막을 쌓고 도펀트를 넣어 소자의 절연, 도전, 전기 특성을 만드는 단계입니다.",
      "증착은 CVD/PVD/ALD로 막을 형성하고, 이온주입은 B/P/As 같은 도펀트를 원하는 깊이에 넣습니다.",
      "증착에서는 두께와 step coverage, 이온주입에서는 energy와 dose가 핵심 조건입니다.",
      "두 공정 모두 후속 열처리와 연결되므로 thermal budget을 함께 이해해야 합니다.",
      "초보자는 막 형성과 도핑이 서로 다른 목적이지만 소자 형성에서 연속적으로 쓰인다는 점을 익힙니다."
    ],
    intermediate: [
      "CVD는 표면 반응과 mass transport 균형, ALD는 self-limiting 반응, PVD는 방향성 증착이 특징입니다.",
      "이온주입의 projected range는 energy에, 농도와 손상은 dose에 크게 좌우됩니다.",
      "고종횡비 구조에서는 증착 coverage가 부족하면 빈틈이나 seam이 생길 수 있습니다.",
      "주입 직후 결정 손상은 anneal로 회복되고 도펀트가 전기적으로 활성화됩니다.",
      "막 응력과 주입 손상은 누설 전류, 접합 깊이, 신뢰성 문제로 연결됩니다."
    ],
    advanced: [
      "High aspect ratio 구조에서는 precursor depletion과 Knudsen diffusion이 bottom coverage를 제한합니다.",
      "Nucleation delay는 초기 막 성장 지연을 만들고 얇은 막에서 두께 오차를 크게 보이게 합니다.",
      "Channeling tail은 결정축 방향으로 일부 이온이 깊게 들어가 얕은 접합 제어를 어렵게 합니다.",
      "고도즈 주입은 amorphization과 end-of-range defect를 만들 수 있어 activation 조건 최적화가 필요합니다.",
      "막 밀도, 조성, 도펀트 활성화는 전기적 특성으로 확인해야 최종 품질을 판단할 수 있습니다."
    ],
    field: [
      "실무에서는 증착 chamber clean/seasoning과 implant beam calibration을 별도 관리합니다.",
      "막 두께는 ellipsometry/XRR/four-point probe로, 도핑 프로파일은 SIMS와 Rs map으로 확인합니다.",
      "증착 이미지는 박막 chamber와 wafer 표면 반응이 보여야 하고, 이온주입은 별도 빔라인 장면과 구분됩니다.",
      "이 챕터에서는 교육 흐름상 두 공정을 묶었지만, 실제 fab에서는 장비와 위험요소가 명확히 다릅니다.",
      "조건을 바꾸면 막 두께, coverage, 주입 손상 리스크가 동시에 변하는지 관찰하는 것이 실습 목적입니다."
    ]
  },
  metal: {
    beginner: [
      "금속 배선은 트랜지스터와 회로 블록을 전기적으로 연결하는 공정입니다.",
      "Al, Cu, W 같은 금속이 쓰이며 공정 세대와 위치에 따라 적용 방식이 다릅니다.",
      "배선 저항은 길이가 길수록 커지고, 두께와 폭이 작을수록 커집니다.",
      "전류가 좁은 배선에 많이 흐르면 전류밀도가 올라가 electromigration 위험이 증가합니다.",
      "배선 공정의 주요 결함은 void, open, short, high resistance, barrier failure입니다.",
      "현대 Cu 배선은 금속을 먼저 깎는 방식보다 절연막에 trench/via를 만들고 Cu를 채운 뒤 CMP로 제거하는 damascene 방식이 대표적입니다.",
      "금속배선은 FEOL 소자 형성 이후 BEOL 영역에서 여러 층으로 반복 형성됩니다."
    ],
    intermediate: [
      "Cu damascene은 절연막 trench 형성, barrier/seed 증착, Cu plating, 평탄화 순서로 진행됩니다.",
      "Barrier는 Cu가 절연막과 Si로 확산되는 것을 막고, seed는 전해도금 시작층 역할을 합니다.",
      "RC delay는 배선 저항과 주변 capacitance가 만드는 신호 지연이며 미세화에서 중요한 한계입니다.",
      "Contact/via resistance는 상하층 연결 품질을 나타내며 void나 오염에 민감합니다.",
      "Line width, thickness, grain structure, surface roughness가 저항과 신뢰성에 모두 영향을 줍니다.",
      "Dual damascene은 via와 line trench를 한 구조로 형성한 뒤 barrier/seed와 Cu fill을 진행하는 방식입니다.",
      "CMP dishing과 erosion은 금속 두께와 저항을 바꾸므로 금속배선 결과 판정에 포함되어야 합니다."
    ],
    advanced: [
      "Electromigration은 전자 흐름의 momentum transfer가 금속 원자 이동을 유발해 void와 hillock을 만드는 현상입니다.",
      "Black equation은 전류밀도와 온도에 따른 EM lifetime 예측에 사용되는 대표 경험식입니다.",
      "Cu 확산은 절연막 누설과 device contamination을 유발하므로 barrier integrity가 핵심입니다.",
      "Scaling이 진행될수록 liner/barrier가 차지하는 비율이 커져 유효 Cu 단면적과 저항이 악화됩니다.",
      "Joule heating과 thermal gradient는 stress migration, via failure, time-dependent resistance shift를 키울 수 있습니다.",
      "Low-k 절연막은 capacitance를 낮추지만 plasma damage, moisture uptake, mechanical weakness 관리가 필요합니다.",
      "Via chain, Kelvin structure, comb-serpentine pattern은 금속배선 전기 검사의 대표 test structure입니다."
    ],
    field: [
      "실무에서는 plating bath 농도, additive balance, seed coverage, pre-clean 상태가 Cu fill 품질을 좌우합니다.",
      "Void 문제는 FIB/SEM 단면, X-ray inspection, resistance map으로 확인하며 위치별 원인을 분리합니다.",
      "배선 저항 이상은 line CD, thickness, grain, via chain, contact contamination을 함께 점검해야 합니다.",
      "EM qualification은 고온 고전류 스트레스에서 resistance shift와 failure time을 추적해 판단합니다.",
      "금속 공정은 평탄화 품질과 강하게 연결되므로 dishing/erosion이 저항과 신뢰성까지 이어지는지 확인해야 합니다.",
      "실제 내부 공정 뷰는 barrier/seed 증착, Cu fill, CMP, 전기 검사 흐름이 보여야 금속배선 공정과 일치합니다.",
      "불량 검사는 SEM/FIB 단면의 void, via open, line bridge, corrosion, EM void를 구분하는 방향이 적합합니다."
    ]
  },
  cmp: {
    beginner: [
      "패키징은 EDS에서 양품으로 분류된 die를 실제 사용 가능한 반도체 제품으로 완성하는 후공정입니다.",
      "기본 흐름은 dicing, die attach, wire bonding 또는 flip-chip, molding, marking, final test입니다.",
      "패키지는 칩을 외부 충격과 습기로부터 보호하고 전기적 연결과 열 방출 경로를 제공합니다.",
      "패키징 품질이 나쁘면 칩 자체가 정상이어도 open, short, 열화, 신뢰성 불량이 발생할 수 있습니다.",
      "시뮬레이터 이미지는 절단 die, 접합 장비, 패키지 tray가 보이는 후공정 조립 장면으로 구성했습니다.",
      "패키징은 wafer 상태가 아니라 die와 substrate 또는 leadframe을 다루는 단계라는 점을 먼저 구분해야 합니다.",
      "패키지 형태는 QFN, BGA, WLCSP, flip-chip, fan-out 등 제품 요구에 따라 달라집니다."
    ],
    intermediate: [
      "Wire bonding은 금속 wire로 die pad와 leadframe/substrate를 연결하고, flip-chip은 bump로 직접 접합합니다.",
      "Die attach는 접착재 두께, void, cure 조건이 열저항과 기계적 강도에 영향을 줍니다.",
      "Molding은 보호에는 필요하지만 압력과 유동이 나쁘면 wire sweep, delamination, crack이 생깁니다.",
      "Final test는 패키징 이후 전기적 동작과 조립 결함을 최종 확인하는 단계입니다.",
      "패키지 선택은 성능, 전력, 열, 크기, 비용, 신뢰성 요구 조건에 따라 달라집니다.",
      "Wire bonding에서는 capillary, ultrasonic power, bond force, bond temperature가 접합 품질을 좌우합니다.",
      "Flip-chip에서는 bump height, underfill flow, reflow profile, substrate warpage가 핵심 변수입니다."
    ],
    advanced: [
      "Thermo-mechanical stress는 die, substrate, mold compound의 열팽창계수 차이에서 발생합니다.",
      "Flip-chip underfill은 bump 접합부 응력을 분산하지만 void와 cure 조건이 신뢰성에 영향을 줍니다.",
      "Package warpage는 reflow, board assembly, 장기 신뢰성 시험에서 중요한 불량 원인이 됩니다.",
      "Moisture sensitivity와 popcorn crack은 흡습된 패키지가 reflow 중 급격히 팽창하면서 발생합니다.",
      "고성능 패키징에서는 SI/PI, 열저항, chiplet/interposer 연결까지 함께 고려해야 합니다.",
      "열저항 Rth, junction temperature, package warpage는 고전력 제품의 설계와 신뢰성 판정에 중요합니다.",
      "Advanced packaging에서는 redistribution layer, micro-bump, interposer, TSV 같은 연결 기술이 추가됩니다."
    ],
    field: [
      "실무에서는 die shear, wire pull, X-ray void, SAM delamination, final test yield를 함께 봅니다.",
      "Bond force가 너무 낮으면 open, 너무 높으면 pad crater나 die crack 위험이 커집니다.",
      "Mold 압력과 cure 조건은 void, wire sweep, package crack, delamination에 직접 연결됩니다.",
      "패키징 이미지는 wafer probe 장면이 아니라 die attach/bonding/molding/package tray가 보여야 교육적으로 맞습니다.",
      "이 단계 실습은 bond force, 온도, cure 시간, final test 커버리지가 패키지 수율에 미치는 영향을 확인하는 데 목적이 있습니다.",
      "실제 불량 검사는 X-ray void, SAM delamination, wire sweep, bond lift, die crack, package crack을 분리해 봅니다.",
      "패키징 화면은 probe card가 아니라 die attach head, wire bonding capillary, mold/trim/form, package tray가 보이는 것이 맞습니다."
    ]
  }
};

const quizBank = [
  { type: "choice", q: "Deal-Grove 모델이 설명하는 공정은?", a: "산화막 성장", choices: ["금속 배선 저항", "산화막 성장", "패키징 몰딩 압력", "이온 주입 범위"], exp: "Deal-Grove 모델은 Si 산화막 성장의 선형-포물선 거동을 설명합니다." },
  { type: "choice", q: "포토리소그래피 해상도 개선에 직접 유리한 조건은?", a: "짧은 파장과 높은 NA", choices: ["긴 파장과 낮은 NA", "짧은 파장과 높은 NA", "두꺼운 PR과 낮은 dose", "높은 압력과 긴 현상"], exp: "R = k1 x 파장 / NA이므로 파장이 짧고 NA가 높을수록 해상도는 좋아집니다." },
  { type: "choice", q: "식각 선택비의 의미는?", a: "목적막 식각률 / 마스크 식각률", choices: ["압력 / 전력", "목적막 식각률 / 마스크 식각률", "노광량 / 현상시간", "전류 / 선폭"], exp: "선택비가 높을수록 마스크 손실을 줄이고 원하는 막을 더 잘 제거할 수 있습니다." },
  { type: "choice", q: "웨이퍼 공정에서 후속 포토 초점 안정성에 직접 영향을 주는 항목은?", a: "TTV와 bow/warp", choices: ["TTV와 bow/warp", "패키지 몰드 색상", "리포트 파일명", "마스크 보관함 위치"], exp: "웨이퍼 두께 편차와 휨은 포토 focus margin과 overlay 안정성에 영향을 줍니다." },
  { type: "choice", q: "증착/이온주입 공정에서 energy와 dose가 직접 좌우하는 것은?", a: "주입 깊이와 도펀트 농도", choices: ["주입 깊이와 도펀트 농도", "최종 포장 박스 크기", "웨이퍼 notch 방향만", "EDS bin 이름"], exp: "이온주입 energy는 깊이, dose는 도펀트 양과 손상에 큰 영향을 줍니다." },
  { type: "choice", q: "EDS의 주된 목적은?", a: "패키징 전 die 전기 검사와 양불 분류", choices: ["패키징 전 die 전기 검사와 양불 분류", "산화막 성장", "PR 현상", "금속막 연마"], exp: "EDS는 wafer probe로 die별 전기 특성을 검사해 양품과 불량을 분류합니다." },
  { type: "choice", q: "금속 배선에서 EM 리스크를 키우는 주된 요인은?", a: "높은 전류밀도", choices: ["낮은 전류밀도", "높은 전류밀도", "짧은 산화 시간", "낮은 NA"], exp: "electromigration은 전류밀도가 높을수록 심해집니다." },
  { type: "short", q: "Dry 산화와 Wet 산화 중 성장 속도가 빠른 방식은?", a: "Wet", exp: "Wet 산화는 수증기를 사용해 Dry 산화보다 빠르게 성장합니다." },
  { type: "short", q: "패키징에서 die를 외부 회로와 연결하는 대표 방식 중 하나는?", a: "wire bonding", exp: "대표 방식은 wire bonding 또는 flip-chip bonding입니다." },
  { type: "short", q: "표준 흐름의 마지막 공정은 무엇입니까?", a: "패키징", exp: "이 앱의 교육 흐름은 웨이퍼 → 산화 → 포토 → 식각 → 증착/이온주입 → 금속배선 → EDS → 패키징입니다." }
];

const learningModules: Partial<Record<ChapterKey, LearningModule>> = {
  diffusion: {
    prerequisite: "웨이퍼 단계는 소자를 만들기 전 기판 품질을 확정하는 출발점입니다. 단결정 성장, slicing damage, TTV, bow, 표면 거칠기, 오염이 뒤 공정 전체의 공정창을 좁히거나 넓힙니다.",
    principles: ["CZ/FZ 성장 방식과 결정 방향", "multi-wire saw 절단과 kerf loss", "lapping/etching/polishing으로 손상층 제거", "particle, haze, scratch, TTV, bow 검사"],
    observation: ["wire 장력이 높으면 절단 안정성은 좋아지지만 micro scratch와 파손 리스크가 커질 수 있습니다.", "coolant/slurry가 부족하면 열과 particle이 증가해 표면 결함이 늘어납니다.", "polishing 시간이 부족하면 산화막과 PR 코팅 균일도가 나빠집니다."],
    practice: ["조건 변경 후 단면 뷰에서 표면 손상층과 웨이퍼 휨을 확인합니다.", "불량 검사에서 scratch, particle, edge chip이 어떤 패턴으로 증가하는지 확인합니다.", "품질지수와 리스크가 후속 산화/포토 공정에 미칠 영향을 설명할 수 있어야 합니다."]
  },
  oxidation: {
    prerequisite: "산화는 Si 표면을 SiO2 절연막으로 바꾸는 열공정입니다. 단순 코팅이 아니라 Si가 소비되고 산화제가 막을 통과하며 계면에서 반응합니다.",
    principles: ["Dry/Wet 산화 차이", "Deal-Grove 선형-포물선 성장", "Si 소비와 계면 이동", "두께 균일도와 전기적 신뢰성"],
    observation: ["온도와 시간이 커지면 산화막 두께가 증가하지만 열 budget과 응력이 증가합니다.", "Wet 조건은 성장 속도가 빠르지만 초박막 계면 품질 관점에서는 Dry와 구분해야 합니다.", "조건 이탈 시 pinhole, 두께 불균일, 계면 trap 리스크가 증가합니다."],
    practice: ["단면 뷰에서 SiO2와 Si 경계가 어떻게 이동하는지 확인합니다.", "내부 공정 뷰에서 산화제 확산선이 막을 통과하는 모습을 관찰합니다.", "목표 두께와 균일도 조건을 동시에 만족하는 범위를 찾습니다."]
  },
  photo: {
    prerequisite: "포토는 회로 패턴을 PR에 전사하는 공정입니다. 노광량, 초점, PR 두께, 현상 조건은 CD와 overlay를 동시에 흔듭니다.",
    principles: ["spin coating과 soft bake", "mask alignment와 exposure", "dose-focus matrix", "CD, overlay, bridge, scum 검사"],
    observation: ["dose가 낮으면 open/under develop, 높으면 CD shrink와 bridge가 발생할 수 있습니다.", "focus margin이 좁으면 wafer 높이 편차에 민감해집니다.", "PR 두께와 bake 조건은 standing wave와 현상 profile에 영향을 줍니다."],
    practice: ["단면 뷰에서 PR 패턴 폭과 잔막을 확인합니다.", "내부 공정 뷰에서 광선과 마스크 패턴 전사를 비교합니다.", "불량 검사에서 bridge, scum, collapse를 구분합니다."]
  },
  etch: {
    prerequisite: "식각은 마스크 패턴을 아래 막으로 옮기는 제거 공정입니다. 플라즈마 라디칼과 이온 방향성이 균형을 이루어야 수직 profile을 만들 수 있습니다.",
    principles: ["RIE/ICP의 화학 반응과 물리 충돌", "선택비와 over-etch", "ARDE/RIE lag", "sidewall passivation과 residue"],
    observation: ["RF power가 높으면 식각률은 증가하지만 damage와 mask erosion이 커집니다.", "압력 변화는 방향성과 등방성의 균형을 바꿉니다.", "가스 조성이 맞지 않으면 residue, footing, bowing이 생깁니다."],
    practice: ["단면 뷰에서 trench 깊이와 sidewall angle을 확인합니다.", "내부 공정 뷰에서 이온 방향성과 라디칼 반응 영역을 관찰합니다.", "불량 검사에서 잔사, micro-trench, undercut을 구분합니다."]
  },
  deposition: {
    prerequisite: "증착/이온주입은 막을 쌓고 도펀트를 넣어 전기적 특성을 설계하는 단계입니다. 한 챕터에 묶었지만 실제 장비와 위험요소는 서로 다릅니다.",
    principles: ["CVD/PVD/ALD 막 성장 방식", "step coverage와 void", "implant energy/dose와 projected range", "anneal과 dopant activation"],
    observation: ["증착 조건이 강하면 막 두께는 증가하지만 응력과 particle 리스크가 커질 수 있습니다.", "이온주입 energy는 깊이, dose는 농도와 손상에 영향을 줍니다.", "고종횡비 구조에서는 바닥 coverage와 sidewall coverage가 핵심입니다."],
    practice: ["단면 뷰에서 박막 coverage와 주입 영역을 함께 확인합니다.", "내부 공정 뷰에서 precursor 흐름 또는 ion beam이 표면에 도달하는 방식을 봅니다.", "불량 검사에서 pinhole, seam void, implant damage를 분리합니다."]
  },
  metal: {
    prerequisite: "금속배선은 소자를 회로로 연결합니다. 금속 선폭, 두께, barrier, via 접속 품질이 저항과 신뢰성을 결정합니다.",
    principles: ["Cu damascene과 barrier/seed", "via/contact resistance", "RC delay", "electromigration과 void"],
    observation: ["전류밀도가 높으면 EM 리스크가 증가합니다.", "barrier 또는 seed coverage가 나쁘면 void와 Cu 확산 문제가 생깁니다.", "배선 두께와 폭 변화는 저항과 발열을 바꿉니다."],
    practice: ["단면 뷰에서 금속 line과 via fill 상태를 확인합니다.", "내부 공정 뷰에서 plating/fill 또는 전류 흐름을 관찰합니다.", "불량 검사에서 open, short, void, hillock을 구분합니다."]
  },
  implant: {
    prerequisite: "EDS는 웨이퍼 상태에서 die별 전기 특성을 검사해 양품과 불량을 분류하는 단계입니다. 제조보다 판정과 원인분석의 성격이 강합니다.",
    principles: ["probe card 접촉", "parametric/functional test", "wafer map과 binning", "false fail/false pass 관리"],
    observation: ["probe overdrive가 낮으면 접촉 불량, 높으면 pad damage가 증가합니다.", "test coverage가 높으면 검출력은 좋아지지만 throughput은 낮아집니다.", "cluster fail과 edge fail은 공정/장비 원인 추적의 단서입니다."],
    practice: ["웨이퍼 맵에서 불량 die 분포를 읽습니다.", "불량 검사에서 probe mark, contact fail, cluster fail을 구분합니다.", "수율 하락이 실제 공정 불량인지 검사 접촉 문제인지 설명합니다."]
  },
  cmp: {
    prerequisite: "패키징은 양품 die를 실제 제품으로 완성하는 후공정입니다. 전기 연결, 기계 보호, 열 방출, 최종검사가 모두 포함됩니다.",
    principles: ["dicing과 die attach", "wire bonding/flip-chip", "molding과 delamination", "final test와 신뢰성"],
    observation: ["bond force가 부족하면 open, 과하면 pad crater와 die crack 위험이 커집니다.", "mold 압력과 cure 조건은 void, wire sweep, delamination을 좌우합니다.", "final test coverage는 출하 품질과 검사 시간을 동시에 바꿉니다."],
    practice: ["단면 뷰에서 die, substrate, bond wire, mold 구조를 확인합니다.", "내부 공정 뷰에서 조립과 몰딩 흐름을 관찰합니다.", "불량 검사에서 void, crack, wire sweep, delamination을 구분합니다."]
  }
};

const theoryFoundations: Partial<Record<ChapterKey, TheoryFoundation>> = {
  diffusion: {
    definition: "웨이퍼 공정은 고순도 실리콘을 단결정 ingot으로 성장시키고 얇은 원판 형태의 Si wafer로 가공해 반도체 소자를 만들 수 있는 기판을 준비하는 전단계입니다.",
    purpose: "후속 산화, 포토, 식각, 증착 공정이 안정적으로 진행되도록 결정 품질, 두께 균일도, 표면 평탄도, 청정도를 확보하는 것이 목적입니다.",
    principle: "CZ 또는 FZ 방식으로 단결정을 성장시킨 뒤 multi-wire saw로 절단하고, lapping/etching/polishing으로 절단 손상층과 표면 거칠기를 제거합니다. 마지막으로 세정과 검사로 particle, metal contamination, TTV, bow/warp를 관리합니다.",
    materials: ["고순도 poly-Si", "단결정 Si ingot", "slurry/coolant", "polishing pad/slurry", "초순수/세정액"],
    equipment: ["CZ crystal puller", "multi-wire saw", "edge grinder", "lapping/polishing tool", "cleaning/inspection tool"],
    outputs: ["mirror polished Si wafer", "관리된 TTV/bow/warp", "낮은 particle/haze/scratch", "후속 공정 투입 가능한 wafer lot"],
    metrology: ["TTV/bow/warp map", "particle counter", "surface roughness", "resistivity map", "visual/edge inspection"]
  },
  oxidation: {
    definition: "산화 공정은 실리콘 표면을 산소 또는 수증기와 반응시켜 SiO2 절연막을 성장시키는 열공정입니다.",
    purpose: "절연막, 보호막, gate oxide, field oxide 등 소자 구조에 필요한 산화막을 목표 두께와 품질로 형성합니다.",
    principle: "산화제가 SiO2 막을 통과해 Si 계면까지 확산하고, 계면에서 Si와 반응해 새로운 SiO2를 만듭니다. 산화막이 두꺼워질수록 확산 거리가 길어져 성장률이 낮아지며, Deal-Grove 모델로 선형-포물선 성장을 설명합니다.",
    materials: ["Si wafer", "O2", "H2O vapor", "N2 purge", "pre-clean chemical"],
    equipment: ["horizontal/vertical furnace", "RTP/RTO", "gas delivery system", "ellipsometer"],
    outputs: ["SiO2 film", "Si/SiO2 interface", "목표 산화막 두께", "절연 특성"],
    metrology: ["ellipsometry thickness map", "oxide uniformity", "C-V/I-V", "breakdown test", "particle inspection"]
  },
  photo: {
    definition: "포토리소그래피는 마스크의 회로 패턴을 감광막(PR)에 전사해 이후 식각이나 이온주입의 위치를 정하는 패턴 형성 공정입니다.",
    purpose: "웨이퍼 위에서 회로 형상이 만들어질 위치와 선폭을 정의하고, 여러 layer가 서로 정확히 맞도록 overlay를 관리합니다.",
    principle: "PR을 균일하게 코팅한 뒤 mask/reticle을 통해 빛을 조사하면 PR의 용해도가 바뀝니다. 현상 공정에서 노광된 영역 또는 비노광 영역이 제거되어 패턴이 남고, dose/focus/NA/파장이 CD와 resolution을 결정합니다.",
    materials: ["photoresist", "HMDS", "developer", "reticle/mask", "BARC/ARC"],
    equipment: ["track coater/developer", "stepper/scanner", "bake plate", "CD-SEM", "overlay metrology"],
    outputs: ["patterned PR", "target CD", "overlay alignment", "etch/implant mask"],
    metrology: ["CD-SEM", "overlay error", "focus-exposure matrix", "defect inspection", "PR thickness map"]
  },
  etch: {
    definition: "식각은 포토 공정으로 정의한 패턴을 이용해 원하는 막을 선택적으로 제거하여 구조를 형성하는 공정입니다.",
    purpose: "산화막, 질화막, 금속막, Si 등을 목표 깊이와 profile로 제거해 trench, via, contact, gate pattern 등 실제 구조를 만듭니다.",
    principle: "건식 식각은 플라즈마에서 생성된 라디칼의 화학 반응과 bias 전압으로 가속된 이온의 물리적 충돌이 함께 작용합니다. 압력, RF power, 가스 조성, time, selectivity가 식각률과 profile을 결정합니다.",
    materials: ["etch target film", "photoresist/hard mask", "CFx/Cl2/HBr/O2 등 process gas", "post-etch clean chemical"],
    equipment: ["RIE/ICP etcher", "ESC/chuck", "RF generator", "OES endpoint monitor", "SEM"],
    outputs: ["etched trench/contact/via", "controlled sidewall profile", "target depth", "residue-free surface"],
    metrology: ["cross-section SEM", "etch depth", "CD loss", "endpoint trace", "residue/defect inspection"]
  },
  deposition: {
    definition: "증착/이온주입 단계는 박막을 형성하고 도펀트를 주입해 소자의 절연, 도전, barrier, 전기적 특성을 만드는 공정 묶음입니다.",
    purpose: "필요한 위치에 절연막/도전막/배리어막을 쌓고, B/P/As 같은 도펀트를 원하는 깊이와 농도로 넣어 트랜지스터 특성을 형성합니다.",
    principle: "증착은 CVD/PVD/ALD처럼 표면 반응, 물리적 증착, self-limiting 반응을 이용해 막을 형성합니다. 이온주입은 전기장으로 가속한 이온을 wafer에 충돌시켜 깊이와 농도를 만들고, 후속 anneal로 결정 손상 회복과 전기적 활성화를 진행합니다.",
    materials: ["precursor gas", "target material", "dopant ion species", "carrier gas", "anneal ambient"],
    equipment: ["CVD/PVD/ALD chamber", "ion implanter", "anneal furnace/RTP", "ellipsometer", "SIMS/Rs mapper"],
    outputs: ["thin film", "step coverage", "dopant profile", "activated junction", "film stress/quality"],
    metrology: ["film thickness", "sheet resistance", "SIMS profile", "XRR/ellipsometry", "defect/particle map"]
  },
  metal: {
    definition: "금속배선은 FEOL에서 만들어진 소자들을 BEOL 영역에서 금속 line과 via로 연결해 실제 회로 신호와 전력을 전달하는 공정입니다.",
    purpose: "트랜지스터와 회로 블록 사이를 낮은 저항과 높은 신뢰성으로 연결하고, RC delay와 electromigration 리스크를 관리합니다.",
    principle: "대표적인 Cu dual damascene은 절연막에 trench/via를 먼저 만들고 barrier/seed를 형성한 뒤 Cu를 충전합니다. 이후 CMP로 과잉 Cu를 제거해 평탄한 금속 배선을 만들고, 저항·전류밀도·EM margin을 검사합니다.",
    materials: ["low-k dielectric", "Ta/TaN 또는 barrier liner", "Cu seed", "Cu plating chemistry", "CMP slurry/pad"],
    equipment: ["lithography/etch tool", "PVD barrier/seed", "Cu electroplating tool", "CMP polisher", "electrical test/metrology"],
    outputs: ["Cu line/via", "interconnect stack", "via/contact resistance", "planarized surface", "BEOL metal layer"],
    metrology: ["line/via resistance", "sheet resistance", "via chain/Kelvin", "FIB/SEM void inspection", "EM reliability test"]
  },
  implant: {
    definition: "EDS는 Electrical Die Sorting 또는 wafer sort로, 패키징 전에 wafer 상태에서 각 die의 전기적 특성을 검사해 양품과 불량을 분류하는 검사 단계입니다.",
    purpose: "불량 die를 패키징 전에 제거해 후공정 비용을 줄이고, wafer map을 통해 공정 이상과 수율 패턴을 분석합니다.",
    principle: "Probe card의 needle 또는 MEMS contact가 die pad에 접촉하고 tester가 전압/전류/기능 신호를 인가해 parametric/functional 결과를 얻습니다. 검사 결과는 bin code와 wafer map으로 저장됩니다.",
    materials: ["wafer", "probe card", "test program", "temperature-controlled chuck", "golden/reference wafer"],
    equipment: ["wafer prober", "probe card", "ATE tester", "microscope/alignment system", "wafer map software"],
    outputs: ["pass/fail bin", "wafer map", "yield result", "retest data", "packaging input die list"],
    metrology: ["contact resistance", "probe mark inspection", "bin yield", "edge/cluster fail pattern", "tester correlation"]
  },
  cmp: {
    definition: "패키징은 EDS에서 양품으로 확인된 die를 외부 회로와 연결하고 보호 구조를 만들어 실제 제품 형태로 완성하는 후공정입니다.",
    purpose: "칩을 기계적 충격, 습기, 오염으로부터 보호하고, 전기적 연결과 열 방출 경로를 제공하며 최종 출하 품질을 검증합니다.",
    principle: "wafer를 die로 절단한 뒤 substrate/leadframe에 접착하고 wire bonding 또는 flip-chip으로 연결합니다. 이후 molding, cure, marking, final test를 거쳐 제품 단위의 전기적·기계적 신뢰성을 확인합니다.",
    materials: ["singulated die", "substrate/leadframe", "die attach epoxy/solder", "bond wire/bump", "mold compound"],
    equipment: ["dicing saw/laser", "die bonder", "wire bonder/flip-chip bonder", "molding press", "final tester/handler"],
    outputs: ["assembled package", "bonded interconnect", "molded chip", "final test bin", "shipment-ready device"],
    metrology: ["X-ray void", "wire pull/shear", "SAM delamination", "package warpage", "final test yield"]
  }
};

const stageDetailLibrary: Partial<Record<ChapterKey, Record<string, StageDetail>>> = {
  metal: {
    "Trench/Via": {
      purpose: "절연막에 금속이 들어갈 line trench와 상하층을 연결할 via hole을 먼저 형성하는 단계입니다.",
      equipment: "Lithography, dry etch, post-etch clean, CD-SEM 또는 profile SEM",
      controls: ["trench CD/depth", "via depth", "etch selectivity", "sidewall profile", "post-etch residue"],
      watch: ["단면 뷰에서 dielectric 안의 trench/via 형상", "내부 공정 뷰의 첫 번째 구조", "profile angle과 잔사 여부"],
      risks: ["via open", "line CD loss", "residue", "low-k damage", "후속 Cu fill void"]
    },
    "Barrier/Seed": {
      purpose: "Cu가 절연막으로 확산되는 것을 막는 barrier liner와 전해도금을 시작할 seed layer를 형성합니다.",
      equipment: "PVD/TaN-Ta 또는 Ru/Co liner, Cu seed PVD, thickness/metrology tool",
      controls: ["liner continuity", "seed coverage", "sidewall/bottom coverage", "pre-clean", "interface contamination"],
      watch: ["단면 뷰의 얇은 liner 색상", "trench 바닥과 sidewall의 연속성", "조건 이탈 시 void risk 증가"],
      risks: ["Cu diffusion", "seed discontinuity", "poor adhesion", "via resistance 증가", "reliability fail"]
    },
    "Cu Fill": {
      purpose: "전해도금 또는 유사 Cu fill 공정으로 trench와 via 내부를 구리로 채워 낮은 저항의 배선을 만듭니다.",
      equipment: "Cu electrochemical deposition, plating bath, additive control, current source",
      controls: ["current density", "plating time", "bath chemistry", "additive balance", "wafer edge uniformity"],
      watch: ["Cu가 trench/via를 완전히 채우는지", "void 또는 seam 형성 여부", "전류밀도 그래프와 리스크 추세"],
      risks: ["center void", "seam void", "overburden non-uniformity", "high resistance", "EM 취약점"]
    },
    "CMP/Test": {
      purpose: "과잉 Cu를 CMP로 제거해 절연막 위 표면을 평탄화하고, 저항·via chain·EM margin을 검사합니다.",
      equipment: "CMP polisher, slurry/pad, four-point probe, via chain, Kelvin, EM reliability test",
      controls: ["polish endpoint", "downforce", "slurry selectivity", "dishing/erosion", "sheet resistance"],
      watch: ["단면 뷰의 CMP surface", "계측 수치의 배선 저항과 전류밀도", "불량 검사에서 open/short/void"],
      risks: ["Cu dishing", "dielectric erosion", "line bridge", "via open", "electromigration lifetime 저하"]
    }
  },
  cmp: {
    Dicing: {
      purpose: "EDS에서 양품으로 분류된 wafer를 개별 die로 절단합니다.",
      equipment: "Dicing saw 또는 laser dicing, wafer tape, vision alignment",
      controls: ["blade condition", "feed speed", "cut depth", "cooling water", "die chipping"],
      watch: ["edge chipping", "die crack", "절단 후 die handling"],
      risks: ["chipping", "micro crack", "particle contamination", "die loss"]
    },
    "Die attach": {
      purpose: "개별 die를 substrate 또는 leadframe에 접착해 열과 기계적 지지 경로를 만듭니다.",
      equipment: "Die bonder, epoxy/solder attach, dispense unit, cure oven",
      controls: ["attach material volume", "bond force", "placement accuracy", "cure profile", "void ratio"],
      watch: ["X-ray void", "die tilt", "bond line thickness"],
      risks: ["die attach void", "thermal resistance 증가", "die shift", "delamination"]
    },
    Interconnect: {
      purpose: "wire bonding 또는 flip-chip bump로 die pad와 외부 substrate를 전기적으로 연결합니다.",
      equipment: "Wire bonder, flip-chip bonder, capillary, ultrasonic generator, reflow tool",
      controls: ["bond force", "ultrasonic power", "bond temperature", "loop height", "bump alignment"],
      watch: ["bond pull/shear", "wire loop shape", "pad damage"],
      risks: ["bond lift", "wire sweep", "pad crater", "open/short"]
    },
    "Mold/Test": {
      purpose: "mold compound로 die와 wire를 보호하고 최종 전기검사로 출하 가능 여부를 판정합니다.",
      equipment: "Molding press, cure oven, trim/form, final tester, handler",
      controls: ["mold pressure", "compound flow", "cure time", "test coverage", "temperature condition"],
      watch: ["SAM delamination", "package crack", "final yield"],
      risks: ["void", "delamination", "popcorn crack", "false pass/fail"]
    }
  },
  implant: {
    "Probe 접촉": {
      purpose: "Probe needle이 die pad에 안정적으로 접촉해 전기 측정을 위한 낮은 contact resistance를 확보합니다.",
      equipment: "Wafer prober, probe card, chuck, microscope alignment",
      controls: ["overdrive", "probe mark position", "needle clean", "chuck planarity", "contact resistance"],
      watch: ["probe mark", "contact fail bin", "retest pass rate"],
      risks: ["false fail", "pad damage", "needle contamination", "yield trend distortion"]
    }
  }
};

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

function getTheoryItems(chapter: Chapter, guide: ProcessGuide, level: TheoryLevel) {
  const curriculum = theoryCurriculum[chapter.key];
  if (curriculum?.[level]) return curriculum[level];
  if (level === "beginner") return guide.basic;
  if (level === "advanced" || level === "field") return guide.deep;
  return [...guide.basic, ...guide.deep].slice(0, 5);
}

function getStageDetail(chapter: Chapter, guide: ProcessGuide, stage: ProcessGuide["stages"][number]): StageDetail {
  const detail = stageDetailLibrary[chapter.key]?.[stage.name];
  if (detail) return detail;
  return {
    purpose: stage.detail,
    equipment: `${chapter.label} 공정 장비와 inline metrology`,
    controls: chapter.fields.slice(0, 4).map((field) => `${field.label} (${field.unit})`),
    watch: [stage.signal, ...guide.internals].slice(0, 4),
    risks: chapter.defects.slice(0, 3).map((defect) => `${defect.name}: ${defect.cause}`)
  };
}

function getTheoryFoundation(chapter: Chapter, guide: ProcessGuide): TheoryFoundation {
  return theoryFoundations[chapter.key] || {
    definition: guide.basic[0] || chapter.objective,
    purpose: chapter.objective,
    principle: guide.deep[0] || guide.basic[0] || chapter.objective,
    materials: chapter.modes,
    equipment: [`${chapter.label} 공정 장비`, "inline metrology"],
    outputs: [guide.resultName, resultLabelFallback(chapter)],
    metrology: chapter.defects.map((defect) => defect.name)
  };
}

function resultLabelFallback(chapter: Chapter) {
  return `${chapter.label} 공정 결과`;
}

function getLearningModule(chapter: Chapter, guide: ProcessGuide): LearningModule {
  return learningModules[chapter.key] || {
    prerequisite: guide.visualLabel,
    principles: guide.basic.slice(0, 4),
    observation: guide.internals.slice(0, 4),
    practice: chapter.defects.slice(0, 3).map((defect) => `${defect.name}: ${defect.cause}를 조건 변화와 연결해 확인합니다.`)
  };
}

function getViewRealityNote(chapter: Chapter, activeView: string) {
  return viewRealityNotes[chapter.key]?.[activeView] || "현재 뷰는 공정 결과와 주요 장비 반응을 교육용으로 시각화한 화면입니다.";
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
    const pullRate = values.temperature || 1.1;
    const wireTension = values.pressure || 24;
    const coolant = values.dose || 90;
    const slicingTime = values.time || 65;
    const polishing = values.gasFlow || 40;
    const pullPenalty = Math.abs(pullRate - 1.1) * 18;
    const wirePenalty = Math.abs(wireTension - 24) * 0.9;
    const coolantPenalty = Math.max(0, 84 - coolant) * 0.8 + Math.max(0, coolant - 98) * 0.4;
    const slicingPenalty = Math.abs(slicingTime - 68) * 0.18;
    const polishPenalty = Math.abs(polishing - 40) * 0.22;
    primary = clamp(98 - pullPenalty - wirePenalty - coolantPenalty - slicingPenalty - polishPenalty, 35, 99);
    secondary = clamp(wirePenalty * 0.8 + slicingPenalty * 1.6 + Math.max(0, 82 - coolant) * 0.35, 0.2, 18);
    rate = coolant;
    uniformity = clamp(0.6 + secondary * 0.22 + Math.abs(polishing - 40) * 0.04, 0.4, 7);
    quality = clamp(primary - uniformity * 1.6, 35, 99);
    risk = clamp((100 - primary) * 1.4 + secondary * 3.2, 4, 95);
    primaryLabel = "웨이퍼 품질";
    primaryUnit = "%";
    secondaryLabel = "TTV/Bow 리스크";
    secondaryUnit = "index";
    rateLabel = "Coolant/슬러리 안정도";
    rateUnit = "%";
    note = "wire-saw 장력, coolant/slurry 유량, polishing 조건이 TTV, saw mark, 표면 roughness를 좌우합니다.";
  } else if (chapter.key === "implant") {
    const coverage = values.dose || 94;
    const contact = values.pressure || 92;
    const testTime = values.time || 30;
    const tempStable = values.temperature || 92;
    primary = clamp((coverage * 0.35 + contact * 0.35 + tempStable * 0.2 + Math.min(testTime, 45) * 0.1), 0, 100);
    secondary = clamp(98 - Math.abs(testTime - 28) * 0.35 - (100 - contact) * 0.18, 35, 99);
    rate = clamp(120 - testTime, 20, 100);
    uniformity = clamp((100 - contact) * 0.06 + Math.abs(tempStable - 93) * 0.05, 0.3, 6);
    quality = clamp(primary - uniformity * 2, 35, 99);
    risk = clamp((100 - coverage) * 1.4 + (100 - contact) * 1.1 + Math.max(0, 12 - testTime) * 1.8, 4, 95);
    primaryLabel = "검사 신뢰도";
    primaryUnit = "%";
    secondaryLabel = "예상 양품 판정률";
    secondaryUnit = "%";
    rateLabel = "처리량 margin";
    rateUnit = "%";
    note = "EDS는 probe 접촉 안정도와 검사 커버리지가 낮으면 false fail/false pass 리스크가 증가합니다.";
  } else if (chapter.key === "deposition") {
    const methodFactor = mode.includes("ALD") ? 0.12 : mode.includes("PVD") ? 4.4 : 2.8;
    rate = methodFactor * Math.exp(((values.temperature || 350) - 350) / 420) * Math.sqrt(values.gasFlow || 50) / 7;
    primary = rate * t;
    const implantDamage = (values.dose || 2.5) * 5 + Math.max(0, (values.energy || 80) - 130) * 0.08;
    secondary = clamp(100 - implantDamage - (mode.includes("PVD") ? 9 : 3), 35, 99);
    uniformity = Math.abs((values.pressure || 2) - 3) * 0.8 + Math.abs((values.gasFlow || 50) - 70) / 80 + implantDamage / 50;
    quality = clamp(secondary - uniformity * 4, 35, 98);
    risk = clamp(100 - secondary + uniformity * 5, 4, 90);
    primaryLabel = "증착 두께";
    secondaryLabel = "도핑/막질 margin";
    secondaryUnit = "%";
    rateLabel = "증착률";
    note = "증착 조건은 막질을, 주입 energy/dose는 손상과 활성화 리스크를 함께 바꿉니다.";
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
    const bondForce = values.downforce || 40;
    const bondTemp = values.platen || 200;
    const cure = values.time || 80;
    const mold = values.slurry || 65;
    const finalCoverage = values.density || 94;
    primary = clamp(96 - Math.abs(bondForce - 40) * 0.35 - Math.abs(bondTemp - 200) * 0.08 - Math.abs(cure - 85) * 0.05, 35, 99);
    secondary = clamp(Math.abs(mold - 65) * 0.25 + Math.max(0, 90 - finalCoverage) * 0.8, 0.2, 25);
    rate = finalCoverage;
    uniformity = clamp(Math.abs(bondForce - 40) * 0.04 + Math.abs(mold - 65) * 0.03, 0.4, 6);
    quality = clamp(primary - secondary * 1.2 - uniformity * 2, 35, 99);
    risk = clamp(100 - quality + secondary * 2 + Math.max(0, 90 - finalCoverage) * 1.5, 4, 96);
    primaryLabel = "패키지 조립 품질";
    primaryUnit = "%";
    secondaryLabel = "Void/Crack 리스크";
    secondaryUnit = "index";
    rateLabel = "Final test 커버리지";
    rateUnit = "%";
    note = "패키징은 bond force, 온도, mold 압력, final test 커버리지가 최종 출하 품질을 결정합니다.";
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

function makeReport(chapter: Chapter, result: Result, mode: string, values: Record<string, number>, theoryItems: string[], settings: SimulatorSettings) {
  const conditionLines = chapter.fields.map((field) => {
    const ideal = getIdeal(chapter, field);
    const value = values[field.key] ?? field.min;
    const state = getFieldState(value, ideal);
    return `- ${field.label}: ${fmt(value, field.step < 1 ? 1 : 0)} ${field.unit} (${state.label}, ${ideal.label})`;
  });
  const defectLines = chapter.defects.map((defect) => `- ${defect.name}: ${defect.cause} / 대책: ${defect.countermeasure}`);
  const theoryLines = settings.reportIncludesTheory ? theoryItems.map((item) => `- ${item}`) : ["- 설정에서 이론 포함이 꺼져 있습니다."];

  return [
    "반도체 8대공정 시뮬레이션 리포트",
    `생성 시각: ${new Date().toLocaleString("ko-KR", { hour12: false })}`,
    `공정: ${chapter.index}. ${chapter.label} (${chapter.english})`,
    `공정 방식: ${mode}`,
    "",
    "[결과 요약]",
    `- 판정: ${result.verdict}`,
    `- ${result.primaryLabel}: ${fmt(result.primary)} ${result.primaryUnit}`,
    `- ${result.secondaryLabel}: ${fmt(result.secondary)} ${result.secondaryUnit}`,
    `- ${result.rateLabel}: ${fmt(result.rate)} ${result.rateUnit}`,
    `- 균일도: ±${fmt(result.uniformity)}%`,
    `- 품질지수: ${fmt(result.quality, 0)} / 100`,
    `- 리스크: ${fmt(result.risk, 0)} / 100`,
    `- 공정 노트: ${result.note}`,
    "",
    "[장비 조건]",
    ...conditionLines,
    "",
    "[불량 모드]",
    ...defectLines,
    "",
    "[공정 이론]",
    ...theoryLines
  ].join("\n");
}

function downloadText(filename: string, text: string) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function downloadUrl(filename: string, url: string) {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

function makeSafeFilename(value: string) {
  return value.replace(/[^\w가-힣.-]+/g, "-").replace(/-+/g, "-");
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

function FoundationTheoryPanel({ foundation }: { foundation: TheoryFoundation }) {
  return (
    <div className="foundation-panel">
      <div className="foundation-main">
        <div>
          <span>정의</span>
          <p>{foundation.definition}</p>
        </div>
        <div>
          <span>목적</span>
          <p>{foundation.purpose}</p>
        </div>
        <div className="wide">
          <span>진행 원리</span>
          <p>{foundation.principle}</p>
        </div>
      </div>
      <div className="foundation-detail-grid">
        <div>
          <strong>재료/입력</strong>
          <ul>{foundation.materials.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
        <div>
          <strong>장비</strong>
          <ul>{foundation.equipment.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
        <div>
          <strong>결과물</strong>
          <ul>{foundation.outputs.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
        <div>
          <strong>계측/판정</strong>
          <ul>{foundation.metrology.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
      </div>
    </div>
  );
}

function PreSimulationLearningPanel({ chapter, guide, module }: { chapter: Chapter; guide: ProcessGuide; module: LearningModule }) {
  const [activeStage, setActiveStage] = useState<string | null>(null);
  const selectedStage = guide.stages.find((stage) => stage.name === activeStage);
  const selectedStageDetail = selectedStage ? getStageDetail(chapter, guide, selectedStage) : null;
  const foundation = getTheoryFoundation(chapter, guide);
  return (
    <div className="pre-learning-panel">
      <div className="pre-learning-intro">
        <span>실습 전 이론 학습</span>
        <h3>{chapter.label} 공정 이해 목표</h3>
        <p>{module.prerequisite}</p>
      </div>
      <FoundationTheoryPanel foundation={foundation} />
      <div className="pre-learning-grid">
        <div>
          <strong>핵심 개념</strong>
          <ul>
            {module.principles.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
        <div>
          <strong>시뮬레이션 관찰</strong>
          <ul>
            {module.observation.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
        <div>
          <strong>실습 판정 기준</strong>
          <ul>
            {module.practice.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
      </div>
      <div className="pre-learning-flow">
        {guide.stages.map((stage) => (
          <button key={stage.name} type="button" onClick={() => setActiveStage((current) => current === stage.name ? null : stage.name)}>
            {stage.name}
          </button>
        ))}
      </div>
      {selectedStage && selectedStageDetail && (
        <div className="stage-popover" role="status">
          <strong>{selectedStage.name}</strong>
          <p>{selectedStageDetail.purpose}</p>
          <div className="stage-detail-grid">
            <div>
              <span>장비/조건</span>
              <p>{selectedStageDetail.equipment}</p>
              <ul>
                {selectedStageDetail.controls.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
            <div>
              <span>관찰 지표</span>
              <ul>
                {selectedStageDetail.watch.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
            <div>
              <span>불량 리스크</span>
              <ul>
                {selectedStageDetail.risks.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
          </div>
          <em>핵심 관찰 신호: {selectedStage.signal}</em>
        </div>
      )}
    </div>
  );
}

function CrossSection({ result, chapter, simulating = false, runId = 0 }: { result: Result; chapter: Chapter; simulating?: boolean; runId?: number }) {
  const ref = useCanvas((ctx, width, height) => {
    ctx.clearRect(0, 0, width, height);
    const bg = ctx.createLinearGradient(0, 0, 0, height);
    bg.addColorStop(0, "#202b2f");
    bg.addColorStop(1, "#101719");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    const top = height * 0.22;
    const baseY = height * 0.68;
    const layerScale = chapter.key === "photo" ? 170 : chapter.key === "metal" ? 7 : chapter.key === "etch" ? 6 : chapter.key === "implant" ? 2.4 : 3.8;
    const layerHeight = clamp(18 + result.primary / layerScale + result.risk * 0.26, 18, 122);
    const substrateTop = top + layerHeight;

    function label(text: string, x: number, y: number, color = "rgba(255,255,255,.92)") {
      ctx.fillStyle = color;
      ctx.font = "700 13px Inter, sans-serif";
      ctx.fillText(text, x, y);
    }

    function drawSilicon(y: number, h: number) {
      ctx.fillStyle = "#3f474b";
      ctx.fillRect(0, y, width, h);
      ctx.strokeStyle = "rgba(255,255,255,.24)";
      ctx.lineWidth = 1;
      for (let i = 0; i < 34; i += 1) {
        const yy = y + ((i * 17) % Math.max(h, 1));
        ctx.beginPath();
        ctx.moveTo(0, yy + Math.sin(i) * 4);
        ctx.lineTo(width, yy + Math.cos(i) * 4);
        ctx.stroke();
      }
    }

    if (chapter.key === "diffusion") {
      const bow = clamp(result.risk / 8, 1, 12);
      ctx.fillStyle = "#dce4e7";
      ctx.beginPath();
      ctx.moveTo(0, top + 26);
      for (let x = 0; x <= width; x += 14) ctx.lineTo(x, top + 26 + Math.sin(x / 38) * bow);
      ctx.lineTo(width, baseY);
      ctx.lineTo(0, baseY);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "rgba(88,98,104,.72)";
      ctx.fillRect(0, baseY, width, height - baseY);
      ctx.strokeStyle = result.risk > 55 ? "#e86b55" : "rgba(255,255,255,.5)";
      for (let i = 0; i < 14 + result.risk / 8; i += 1) {
        const x = 18 + ((i * 47) % Math.max(width - 48, 1));
        ctx.beginPath();
        ctx.moveTo(x, top + 34 + (i % 5) * 4);
        ctx.lineTo(x + 24 + (i % 3) * 8, top + 37 + (i % 7) * 3);
        ctx.stroke();
      }
      label("Polished Si wafer", width * 0.08, top + 18);
      label("saw damage / haze risk", width * 0.08, baseY + 32, "rgba(255,220,190,.9)");
    } else if (chapter.key === "photo") {
      drawSilicon(substrateTop, height - substrateTop);
      ctx.fillStyle = "#2e3840";
      ctx.fillRect(0, substrateTop - 12, width, 12);
      ctx.fillStyle = "#8b55ae";
      ctx.fillRect(0, top, width, layerHeight);
      ctx.fillStyle = "#151b1f";
      const cd = clamp(result.primary / 220, 0.18, 0.52);
      for (let i = 0; i < 6; i += 1) ctx.fillRect(width * 0.08 + i * width * 0.16, top - 1, width * cd * 0.2, layerHeight + 16);
      label("Patterned PR", width * 0.1, top + layerHeight / 2 + 5);
      label("ARC / target film", width * 0.1, substrateTop - 18);
    } else if (chapter.key === "etch") {
      drawSilicon(substrateTop + 34, height - substrateTop - 34);
      ctx.fillStyle = "#b8c6ca";
      ctx.fillRect(0, top, width, layerHeight + 34);
      ctx.fillStyle = "#172024";
      const trenchCount = 6;
      for (let i = 0; i < trenchCount; i += 1) {
        const tw = width * (0.055 + result.risk / 2200);
        const tx = width * 0.1 + i * width * 0.145;
        const depth = clamp(layerHeight + result.primary * 0.2, layerHeight + 24, height * 0.58);
        ctx.beginPath();
        ctx.moveTo(tx, top);
        ctx.lineTo(tx + tw, top);
        ctx.lineTo(tx + tw * (result.risk > 55 ? 1.3 : 1.05), top + depth);
        ctx.lineTo(tx - tw * (result.risk > 55 ? 0.28 : 0.05), top + depth);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = result.risk > 55 ? "#e86b55" : "#8be0d8";
        ctx.stroke();
      }
      label("etched trench profile", width * 0.08, top + 20);
    } else if (chapter.key === "deposition") {
      drawSilicon(substrateTop + 38, height - substrateTop - 38);
      ctx.fillStyle = "#384147";
      ctx.fillRect(0, substrateTop + 12, width, 26);
      ctx.fillStyle = "#b9c5c8";
      ctx.fillRect(0, top, width, layerHeight);
      ctx.fillStyle = "rgba(106,197,206,.72)";
      for (let i = 0; i < 7; i += 1) {
        const x = width * 0.1 + i * width * 0.12;
        ctx.fillRect(x, top + layerHeight - 2, width * 0.05, 42 + result.risk * 0.12);
      }
      ctx.fillStyle = "rgba(99,190,245,.28)";
      ctx.fillRect(0, substrateTop + 38, width, 22 + result.secondary * 0.04);
      label("thin film coverage", width * 0.08, top + layerHeight / 2);
      label("implant range", width * 0.08, substrateTop + 56, "rgba(188,230,255,.92)");
    } else if (chapter.key === "metal") {
      drawSilicon(baseY, height - baseY);
      ctx.fillStyle = "#343b3f";
      ctx.fillRect(0, top + 22, width, baseY - top - 22);
      ctx.fillStyle = "rgba(85,99,104,.92)";
      ctx.fillRect(0, top + 38, width, 14);
      for (let i = 0; i < 5; i += 1) {
        const lineW = clamp(width * 0.05 + result.secondary * 0.006, width * 0.04, width * 0.12);
        const x = width * 0.1 + i * width * 0.17;
        ctx.fillStyle = "rgba(116,226,217,.34)";
        ctx.fillRect(x - 3, top + 52, lineW + 6, 50);
        ctx.fillRect(x + lineW * 0.28 - 3, top + 100, lineW * 0.42 + 6, baseY - top - 100);
        ctx.fillStyle = "#c58a4a";
        ctx.fillRect(x, top + 55, lineW, 44);
        ctx.fillRect(x + lineW * 0.28, top + 99, lineW * 0.42, baseY - top - 99);
        if (result.risk > 42 && i % 2 === 0) {
          ctx.fillStyle = "rgba(30,34,36,.82)";
          ctx.beginPath();
          ctx.ellipse(x + lineW * 0.58, top + 74, lineW * 0.18, 7, 0, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      label("CMP surface", width * 0.1, top + 28, "rgba(220,245,242,.9)");
      label("Cu line / via fill", width * 0.1, top + 82);
      label("barrier/seed liner", width * 0.1, top + 118, "rgba(190,245,240,.9)");
    } else if (chapter.key === "implant") {
      drawSilicon(baseY, height - baseY);
      ctx.fillStyle = "#2f3a40";
      ctx.fillRect(0, top + 62, width, baseY - top - 62);
      ctx.strokeStyle = "rgba(255,255,255,.32)";
      for (let x = 0; x < width; x += width / 9) {
        ctx.beginPath();
        ctx.moveTo(x, top + 62);
        ctx.lineTo(x, baseY);
        ctx.stroke();
      }
      for (let y = top + 62; y < baseY; y += 22) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      ctx.strokeStyle = "#e7eef1";
      ctx.lineWidth = 2;
      for (let i = 0; i < 7; i += 1) {
        const x = width * 0.16 + i * width * 0.1;
        ctx.beginPath();
        ctx.moveTo(x, top + 8);
        ctx.lineTo(x - 8, top + 62);
        ctx.stroke();
      }
      label("probe needle contact", width * 0.08, top + 26);
      label("die electrical test map", width * 0.08, baseY - 12);
    } else if (chapter.key === "cmp") {
      ctx.fillStyle = "#5a6469";
      ctx.fillRect(width * 0.12, baseY - 18, width * 0.76, 36);
      ctx.fillStyle = "#1f2a2e";
      ctx.fillRect(width * 0.24, top + 54, width * 0.52, 72);
      ctx.fillStyle = "#b7c4c8";
      ctx.fillRect(width * 0.16, top + 30, width * 0.68, baseY - top - 30);
      ctx.strokeStyle = "#d7c286";
      ctx.lineWidth = 2;
      for (let i = 0; i < 9; i += 1) {
        const x = width * 0.25 + i * width * 0.055;
        ctx.beginPath();
        ctx.moveTo(x, top + 64);
        ctx.bezierCurveTo(x - 22, top + 28, width * 0.14 + i * width * 0.085, baseY - 24, width * 0.14 + i * width * 0.085, baseY - 8);
        ctx.stroke();
      }
      label("mold compound", width * 0.18, top + 50);
      label("die / substrate / bond wire", width * 0.18, baseY + 42);
    } else {
      ctx.fillStyle = "#b9c5c8";
      ctx.fillRect(0, top, width, layerHeight);
      drawSilicon(substrateTop, height - substrateTop);
      label(chapter.key === "oxidation" ? "SiO2" : chapter.label, width * 0.1, top + layerHeight / 2 + 5);
      label("Si", width * 0.12, substrateTop + 58);
    }

    ctx.strokeStyle = "rgba(255,255,255,.35)";
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(width * 0.72, top);
    ctx.lineTo(width * 0.72, top + layerHeight);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(width * 0.7, top + 8);
    ctx.lineTo(width * 0.72, top);
    ctx.lineTo(width * 0.74, top + 8);
    ctx.moveTo(width * 0.7, top + layerHeight - 8);
    ctx.lineTo(width * 0.72, top + layerHeight);
    ctx.lineTo(width * 0.74, top + layerHeight - 8);
    ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,.94)";
    ctx.font = "600 18px Inter, sans-serif";
    ctx.fillText(`${fmt(result.primary)} ${result.primaryUnit}`, width * 0.76, top + layerHeight / 2 + 6);
    ctx.fillStyle = "rgba(255,255,255,.82)";
    ctx.font = "12px Inter, sans-serif";
    ctx.fillText("200 nm", width - 78, height - 24);
    ctx.fillRect(width - 112, height - 20, 64, 3);

    if (simulating) {
      const scanX = width * (0.18 + ((runId % 5) * 0.14));
      ctx.fillStyle = "rgba(123,231,222,.16)";
      ctx.fillRect(scanX, 0, 18, height);
      ctx.strokeStyle = "rgba(123,231,222,.9)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(scanX + 9, 18);
      ctx.lineTo(scanX + 9, height - 18);
      ctx.stroke();
      label("live cross-section update", 16, height - 42, "rgba(123,231,222,.95)");
    }
  }, [result, chapter, simulating, runId]);
  return <canvas className={`visual-canvas cross-canvas ${simulating ? "simulating-canvas" : ""}`} ref={ref} />;
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

function MetricTrendChart({ result, chapter, values }: { result: Result; chapter: Chapter; values: Record<string, number> }) {
  const ref = useCanvas((ctx, width, height) => {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#f7fbfb";
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = "#d9e3e5";
    ctx.lineWidth = 1;
    for (let i = 0; i < 4; i += 1) {
      const y = 22 + i * ((height - 42) / 3);
      ctx.beginPath();
      ctx.moveTo(32, y);
      ctx.lineTo(width - 12, y);
      ctx.stroke();
    }
    const labels = chapter.key === "metal"
      ? ["R", "J", "EM"]
      : chapter.key === "implant"
        ? ["Coverage", "Contact", "False fail"]
        : chapter.key === "cmp"
          ? ["Bond", "Void", "Final"]
          : ["Mean", "Uniform", "Risk"];
    const series = [
      clamp(result.primary / Math.max(result.primary * 1.2, 1), 0.08, 0.92),
      clamp(result.secondary / Math.max(result.secondary * 1.4, 1), 0.08, 0.92),
      clamp(result.risk / 100, 0.05, 0.95)
    ];
    series.forEach((value, index) => {
      const x = 42 + index * ((width - 76) / 2);
      const barH = (height - 54) * value;
      ctx.fillStyle = index === 2 && result.risk > 55 ? "#df5d4c" : index === 1 ? "#c78b49" : "#0d8f88";
      ctx.fillRect(x - 14, height - 26 - barH, 28, barH);
      ctx.fillStyle = "#58666c";
      ctx.font = "700 10px Inter, sans-serif";
      ctx.fillText(labels[index], x - 18, height - 8);
    });
    ctx.fillStyle = "#203039";
    ctx.font = "800 12px Inter, sans-serif";
    ctx.fillText(chapter.key === "metal" ? "BEOL electrical monitor" : chapter.key === "implant" ? "EDS test monitor" : chapter.key === "cmp" ? "Package assembly monitor" : "Process monitor", 10, 14);
  }, [result, chapter, values]);
  return <canvas className="mini-chart" ref={ref} />;
}

function RiskTimelineChart({ result, chapter, values }: { result: Result; chapter: Chapter; values: Record<string, number> }) {
  const ref = useCanvas((ctx, width, height) => {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#f7fbfb";
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = "#d9e3e5";
    ctx.lineWidth = 1;
    for (let i = 0; i < 4; i += 1) {
      const y = 22 + i * ((height - 44) / 3);
      ctx.beginPath();
      ctx.moveTo(28, y);
      ctx.lineTo(width - 10, y);
      ctx.stroke();
    }
    const fieldPressure = chapter.fields.reduce((sum, field, index) => {
      const ideal = getIdeal(chapter, field);
      const value = values[field.key] ?? field.min;
      const center = (ideal.min + ideal.max) / 2;
      const span = Math.max(ideal.max - ideal.min, 1);
      return sum + Math.abs(value - center) / span * (index + 1);
    }, 0);
    ctx.strokeStyle = result.verdict === "FAIL" ? "#df5d4c" : "#0d8f88";
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let i = 0; i < 24; i += 1) {
      const x = 28 + i * ((width - 46) / 23);
      const risk = clamp(result.risk * (0.78 + i / 72) + Math.sin(i * 0.75 + fieldPressure) * 7, 0, 100);
      const y = 20 + (height - 44) * (1 - risk / 100);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = "#e29f42";
    const limitY = 20 + (height - 44) * 0.35;
    ctx.beginPath();
    ctx.moveTo(28, limitY);
    ctx.lineTo(width - 10, limitY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "#203039";
    ctx.font = "800 12px Inter, sans-serif";
    ctx.fillText("Risk / endpoint trend", 10, 14);
  }, [result, chapter, values]);
  return <canvas className="mini-chart" ref={ref} />;
}

function DefectParetoChart({ result, chapter }: { result: Result; chapter: Chapter }) {
  const ref = useCanvas((ctx, width, height) => {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#f7fbfb";
    ctx.fillRect(0, 0, width, height);
    const names = chapter.defects.map((defect) => defect.name.slice(0, 8));
    const values = [result.defects.particle, result.defects.pinhole, result.defects.scratch].map((v, index) => clamp(v * 120 + result.risk * (0.15 + index * 0.05), 3, 95));
    values.forEach((value, index) => {
      const y = 30 + index * 31;
      ctx.fillStyle = "#e7eff0";
      ctx.fillRect(72, y, width - 92, 13);
      ctx.fillStyle = index === 0 ? "#0d8f88" : index === 1 ? "#c78b49" : "#df5d4c";
      ctx.fillRect(72, y, (width - 92) * (value / 100), 13);
      ctx.fillStyle = "#4f5e64";
      ctx.font = "700 10px Inter, sans-serif";
      ctx.fillText(names[index] || `D${index + 1}`, 10, y + 10);
    });
    ctx.fillStyle = "#203039";
    ctx.font = "800 12px Inter, sans-serif";
    ctx.fillText("Defect pareto", 10, 14);
  }, [result, chapter]);
  return <canvas className="mini-chart" ref={ref} />;
}

function ProcessAnalytics({ result, chapter, values }: { result: Result; chapter: Chapter; values: Record<string, number> }) {
  return (
    <div className="process-analytics">
      <div><ProfileChart result={result} /></div>
      <div><MetricTrendChart result={result} chapter={chapter} values={values} /></div>
      <div><RiskTimelineChart result={result} chapter={chapter} values={values} /></div>
      <div><DefectParetoChart result={result} chapter={chapter} /></div>
    </div>
  );
}

function DefectScan({ result, chapter, variant = 0, simulating = false, runId = 0 }: { result: Result; chapter: Chapter; variant?: number; simulating?: boolean; runId?: number }) {
  const ref = useCanvas((ctx, width, height) => {
    ctx.fillStyle = "#242b2e";
    ctx.fillRect(0, 0, width, height);
    for (let i = 0; i < 220; i += 1) {
      const x = (i * 47) % width;
      const y = (i * 83) % height;
      const tone = 90 + ((i * 13) % 120);
      ctx.fillStyle = `rgba(${tone}, ${tone}, ${tone}, ${0.12 + (i % 9) / 40})`;
      ctx.fillRect(x, y, 1 + (i % 3), 1 + (i % 2));
    }

    const count = Math.round(result.risk / 9) + 4 + variant;
    const label = chapter.defects[variant % chapter.defects.length]?.name || "검출 결함";
    ctx.font = "700 12px Inter, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,.88)";
    ctx.fillText(label, 10, 18);

    if (chapter.key === "implant") {
      const cols = 9;
      const rows = 6;
      const cellW = (width - 26) / cols;
      const cellH = (height - 34) / rows;
      for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < cols; col += 1) {
          const fail = (row * 17 + col * 11 + variant * 13 + Math.round(result.risk)) % 23 < result.risk / 10 + 2;
          ctx.fillStyle = fail ? "rgba(231,89,71,.86)" : "rgba(31,146,128,.72)";
          ctx.fillRect(13 + col * cellW, 28 + row * cellH, cellW - 2, cellH - 2);
        }
      }
      ctx.strokeStyle = "rgba(255,255,255,.62)";
      for (let i = 0; i < 5; i += 1) {
        const x = 20 + ((i * 31 + variant * 17) % Math.max(width - 40, 1));
        ctx.beginPath();
        ctx.moveTo(x, 24);
        ctx.lineTo(x - 5, 44);
        ctx.stroke();
      }
      if (simulating) {
        ctx.strokeStyle = "rgba(123,231,222,.95)";
        ctx.strokeRect(12 + ((runId + variant) % 4) * 24, 28, width * 0.38, height * 0.48);
      }
      return;
    }

    if (chapter.key === "cmp") {
      ctx.fillStyle = "rgba(185,196,200,.62)";
      ctx.fillRect(width * 0.12, height * 0.24, width * 0.76, height * 0.5);
      ctx.fillStyle = "rgba(22,28,31,.78)";
      ctx.fillRect(width * 0.28, height * 0.36, width * 0.44, height * 0.24);
      ctx.strokeStyle = "#d2b56f";
      for (let i = 0; i < 8; i += 1) {
        ctx.beginPath();
        ctx.moveTo(width * 0.32 + i * width * 0.055, height * 0.42);
        ctx.bezierCurveTo(width * 0.22, height * 0.1 + i * 3, width * 0.18 + i * width * 0.08, height * 0.76, width * 0.18 + i * width * 0.08, height * 0.72);
        ctx.stroke();
      }
      ctx.strokeStyle = "#e25d4f";
      ctx.lineWidth = 2;
      for (let i = 0; i < count; i += 1) {
        const x = 22 + ((i * 43 + variant * 29) % Math.max(width - 50, 1));
        const y = 30 + ((i * 19 + variant * 37) % Math.max(height - 58, 1));
        if (i % 2 === 0) ctx.strokeRect(x, y, 20, 14);
        else {
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + 26, y + 12);
          ctx.lineTo(x + 10, y + 28);
          ctx.stroke();
        }
      }
      if (simulating) {
        ctx.strokeStyle = "rgba(123,231,222,.95)";
        ctx.strokeRect(18 + ((runId + variant) % 4) * 22, 26, width * 0.38, height * 0.5);
      }
      return;
    }

    if (chapter.key === "photo") {
      ctx.fillStyle = "rgba(139,85,174,.72)";
      for (let i = 0; i < 8; i += 1) ctx.fillRect(14 + i * width * 0.12, 30, width * 0.055, height - 48);
      ctx.strokeStyle = "#e25d4f";
      ctx.lineWidth = 2;
      for (let i = 0; i < count; i += 1) {
        const x = 18 + ((i * 41 + variant * 23) % Math.max(width - 44, 1));
        const y = 28 + ((i * 29 + variant * 31) % Math.max(height - 52, 1));
        i % 2 === 0 ? ctx.strokeRect(x, y, 24, 18) : ctx.strokeRect(x, y, 10, 34);
      }
      if (simulating) {
        ctx.strokeStyle = "rgba(123,231,222,.95)";
        ctx.strokeRect(16 + ((runId + variant) % 4) * 24, 26, width * 0.36, height * 0.55);
      }
      return;
    }

    if (chapter.key === "etch") {
      ctx.fillStyle = "rgba(185,197,200,.7)";
      for (let i = 0; i < 7; i += 1) {
        const x = 14 + i * width * 0.13;
        ctx.fillRect(x, 28, width * 0.06, height - 46);
        ctx.fillStyle = "rgba(15,23,26,.92)";
        ctx.fillRect(x + width * 0.018, 28, width * 0.028 + result.risk * 0.05, height - 50);
        ctx.fillStyle = "rgba(185,197,200,.7)";
      }
    } else if (chapter.key === "metal") {
      ctx.fillStyle = "rgba(197,138,74,.78)";
      for (let i = 0; i < 6; i += 1) ctx.fillRect(12 + i * width * 0.16, 34, width * 0.08, height - 58);
    } else if (chapter.key === "oxidation") {
      ctx.fillStyle = "rgba(185,197,200,.72)";
      ctx.fillRect(0, height * 0.28, width, height * 0.3);
      ctx.fillStyle = "rgba(63,71,75,.86)";
      ctx.fillRect(0, height * 0.58, width, height * 0.42);
    } else if (chapter.key === "deposition") {
      ctx.fillStyle = "rgba(185,197,200,.72)";
      ctx.fillRect(0, height * 0.25, width, height * 0.2);
      ctx.fillStyle = "rgba(63,71,75,.86)";
      for (let i = 0; i < 7; i += 1) ctx.fillRect(20 + i * width * 0.12, height * 0.45, width * 0.04, height * 0.34);
    }

    ctx.strokeStyle = "#e25d4f";
    ctx.lineWidth = 2;
    for (let i = 0; i < count; i += 1) {
      const x = 18 + ((i * 53 + variant * 19) % Math.max(width - 44, 1));
      const y = 26 + ((i * 31 + variant * 27) % Math.max(height - 52, 1));
      if (chapter.key === "diffusion") {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + 30 + (i % 3) * 8, y + 4 + (i % 5));
        ctx.stroke();
      } else if (chapter.key === "oxidation" || chapter.key === "deposition") {
        ctx.beginPath();
        ctx.arc(x, y, 5 + (i % 4), 0, Math.PI * 2);
        ctx.stroke();
      } else if (chapter.key === "metal") {
        i % 2 === 0 ? ctx.strokeRect(x, y, 20, 18) : ctx.strokeRect(x, y + 18, 34, 8);
      } else {
        ctx.strokeRect(x, y, 18, 18);
      }
    }

    if (simulating) {
      ctx.strokeStyle = "rgba(123,231,222,.95)";
      ctx.lineWidth = 2;
      ctx.strokeRect(14 + ((runId + variant) % 5) * 18, 24, width * 0.36, height * 0.52);
    }
  }, [result, chapter, variant, simulating, runId]);
  return <canvas className={`defect-canvas ${simulating ? "simulating-canvas" : ""}`} ref={ref} />;
}

function RealProcessImage({
  chapter,
  result,
  values,
  simulating,
  runId,
  showDefectOverlay
}: {
  chapter: Chapter;
  result: Result;
  values: Record<string, number>;
  simulating: boolean;
  runId: number;
  showDefectOverlay: boolean;
}) {
  const image = processImages[chapter.key] || oxidationImage;
  const guide = getGuide(chapter);
  const intensity = processIntensity(chapter, values, result);
  const isWaferProcess = chapter.key === "diffusion";
  const overlayStyle = {
    opacity: 0.12 + intensity.risk * 0.34,
    background: result.verdict === "PASS"
      ? "radial-gradient(circle at 45% 42%, rgba(18, 185, 159, .58), transparent 34%), radial-gradient(circle at 72% 28%, rgba(244, 202, 95, .42), transparent 22%)"
      : "radial-gradient(circle at 45% 42%, rgba(227, 87, 66, .62), transparent 38%), radial-gradient(circle at 70% 32%, rgba(248, 178, 70, .52), transparent 24%)"
  };
  const defectDots = Array.from({ length: 14 + Math.round(result.risk / 5) }, (_, index) => ({
    left: `${8 + ((index * 23 + result.risk) % 84)}%`,
    top: `${12 + ((index * 37 + result.primary) % 70)}%`,
    size: 4 + (index % 3) + Math.round(intensity.risk * 5)
  }));

  return (
    <div className={`real-process-frame ${simulating ? "simulating" : ""}`} data-run={runId}>
      <img src={image} alt={`${chapter.label} 공정 실물 유사 이미지`} />
      {!isWaferProcess && <i className="process-heat" style={overlayStyle} />}
      {!isWaferProcess && <i className="process-scan-beam" />}
      {!isWaferProcess && <i className="reaction-wave" />}
      {!isWaferProcess && <div className="scan-grid" />}
      {!isWaferProcess && showDefectOverlay && defectDots.map((dot, index) => (
        <span
          key={`${dot.left}-${dot.top}-${index}`}
          className={index % 5 === 0 ? "defect-dot hot" : "defect-dot"}
          style={{ left: dot.left, top: dot.top, width: dot.size, height: dot.size }}
        />
      ))}
      <div className="metrology-overlay top-left">
        <strong>{guide.resultName}</strong>
        <span>{chapter.english}</span>
      </div>
      <div className="metrology-overlay bottom-right">
        <p>{result.primaryLabel}</p>
        <strong>{fmt(result.primary)} {result.primaryUnit}</strong>
        <span>Risk {fmt(result.risk, 0)} / Quality {fmt(result.quality, 0)}</span>
      </div>
      <div className={`live-badge ${result.verdict.toLowerCase()}`}>{result.verdict}</div>
    </div>
  );
}

function WaferSlicingOverlay({ result, values }: { result: Result; values: Record<string, number> }) {
  const wireTension = values.pressure || 24;
  const pullRate = values.temperature || 1.1;
  const wireCount = clamp(Math.round(12 + wireTension / 2), 14, 28);
  const sliceCount = Math.max(5, Math.round((values.time || 65) / 9));
  const coolantDensity = clamp((values.dose || 90) / 100, 0.62, 1);
  const feedSeconds = clamp(4.8 - pullRate, 2.4, 4.6);
  const steps = ["Poly-Si", "CZ Ingot", "Wire saw", "Lap/Etch", "Polish", "Clean"];
  return (
    <div className="wire-saw-simulation" style={{ ["--coolant-density" as string]: coolantDensity, ["--feed-seconds" as string]: `${feedSeconds}s` }}>
      <div className="saw-roller top" />
      <div className="saw-roller bottom" />
      <div className="wafer-step-strip">
        {steps.map((step, index) => <span key={step} className={index === 2 ? "active" : ""}>{step}</span>)}
      </div>
      <div className="wire-web" aria-hidden="true">
        {Array.from({ length: wireCount }, (_, index) => <span key={index} style={{ left: `${8 + index * (84 / Math.max(wireCount - 1, 1))}%` }} />)}
      </div>
      <div className="ingot-carriage">
        <i />
        <span />
      </div>
      <div className="coolant-spray" aria-hidden="true">
        {Array.from({ length: 18 }, (_, index) => <i key={index} style={{ left: `${8 + index * 4.8}%`, animationDelay: `${index * 90}ms` }} />)}
      </div>
      <div className="sliced-wafer-stack" aria-hidden="true">
        {Array.from({ length: sliceCount }, (_, index) => <span key={index} style={{ transform: `translateX(${index * 5}px) rotate(${index * 0.8 - 2}deg)`, opacity: 0.46 + Math.min(result.quality, 100) / 220 }} />)}
      </div>
      <div className="saw-readout">
        <span>Wire {fmt(wireTension, 0)} N</span>
        <span>Coolant {fmt(values.dose || 90, 0)}%</span>
      </div>
    </div>
  );
}

function SimulationReactionPanel({
  chapter,
  result,
  guide,
  simulating,
  runId
}: {
  chapter: Chapter;
  result: Result;
  guide: ProcessGuide;
  simulating: boolean;
  runId: number;
}) {
  const bars = Array.from({ length: 24 }, (_, index) => {
    const wave = 35 + Math.sin(index * 0.9 + result.primary * 0.04) * 24;
    const ramp = simulating ? index * 1.8 : 0;
    return clamp(wave + ramp + result.risk * 0.35, 10, 92);
  });
  return (
    <section className={`reaction-panel ${simulating ? "active" : ""}`} key={runId}>
      <div className="reaction-head">
        <div>
          <h3>실시간 공정 반응</h3>
          <p>{simulating ? `${chapter.label} 공정이 진행 중입니다.` : "시뮬레이션 실행 시 내부 반응이 단계별로 표시됩니다."}</p>
        </div>
        <strong>{simulating ? "RUNNING" : result.verdict}</strong>
      </div>
      <div className="reaction-progress">
        <i />
      </div>
      <div className="reaction-grid">
        <div className="reaction-bars">
          {bars.map((height, index) => (
            <span key={index} style={{ height: `${height}%`, animationDelay: `${index * 55}ms` }} />
          ))}
        </div>
        <div className="reaction-stages">
          {guide.stages.map((stage, index) => (
            <div key={stage.name} className={simulating ? "lit" : ""} style={{ animationDelay: `${index * 520}ms` }}>
              <span>{index + 1}</span>
              <strong>{stage.name}</strong>
              <p>{stage.signal}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProcessViewport({ chapter, result, values, mode, simulating = false, runId = 0 }: { chapter: Chapter; result: Result; values: Record<string, number>; mode: string; simulating?: boolean; runId?: number }) {
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
    } else if (chapter.key === "diffusion") {
      const wireTension = values.pressure || 24;
      const coolant = values.dose || 90;
      const wireLines = clamp(Math.round(14 + wireTension / 1.7), 18, 34);
      const feed = simulating ? (runId % 36) / 36 : 0.35;
      const ingotX = width * (0.18 + feed * 0.08);
      const ingotY = height * 0.46;
      const ingotW = width * 0.54;
      const ingotH = height * 0.22;
      ctx.fillStyle = "rgba(232,239,241,.12)";
      ctx.fillRect(width * 0.06, height * 0.16, width * 0.88, height * 0.64);
      ctx.fillStyle = "rgba(40,48,52,.96)";
      ctx.fillRect(width * 0.08, height * 0.16, width * 0.84, 22);
      ctx.fillStyle = "rgba(84,94,99,.92)";
      ctx.fillRect(width * 0.09, height * 0.72, width * 0.82, 18);
      ctx.fillStyle = `rgba(216,226,222,${0.2 + coolant / 210})`;
      ctx.fillRect(width * 0.08, height * 0.74, width * 0.84, height * 0.07);

      ctx.fillStyle = "rgba(95,104,108,.86)";
      ctx.fillRect(ingotX + ingotH * 0.42, ingotY - ingotH * 0.5, ingotW - ingotH * 0.42, ingotH);
      const ingotGrad = ctx.createLinearGradient(ingotX, ingotY - ingotH * 0.5, ingotX, ingotY + ingotH * 0.5);
      ingotGrad.addColorStop(0, "rgba(224,232,235,.88)");
      ingotGrad.addColorStop(0.48, "rgba(105,116,121,.86)");
      ingotGrad.addColorStop(1, "rgba(42,50,54,.92)");
      ctx.fillStyle = ingotGrad;
      ctx.beginPath();
      ctx.ellipse(ingotX + ingotH * 0.42, ingotY, ingotH * 0.48, ingotH * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,.42)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      const sliceStart = ingotX + ingotW * 0.62;
      ctx.strokeStyle = "rgba(22,27,30,.82)";
      ctx.lineWidth = 2;
      for (let i = 0; i < 16; i += 1) {
        const x = sliceStart + i * (ingotW * 0.018);
        ctx.beginPath();
        ctx.moveTo(x, ingotY - ingotH * 0.48);
        ctx.lineTo(x + 4, ingotY + ingotH * 0.48);
        ctx.stroke();
      }

      ctx.strokeStyle = "rgba(238,244,245,.86)";
      ctx.lineWidth = 1;
      for (let i = 0; i < wireLines; i += 1) {
        const x = width * 0.13 + i * (width * 0.72 / Math.max(wireLines - 1, 1));
        const sway = simulating ? Math.sin((runId + i) * 0.45) * (1.2 + wireTension / 40) : 0;
        ctx.beginPath();
        ctx.moveTo(x + sway, height * 0.18);
        ctx.lineTo(x - sway * 0.4, height * 0.77);
        ctx.stroke();
      }

      ctx.fillStyle = `rgba(220,228,224,${0.18 + coolant / 190})`;
      for (let i = 0; i < wireLines; i += 2) {
        const x = width * 0.13 + i * (width * 0.72 / Math.max(wireLines - 1, 1));
        ctx.beginPath();
        ctx.moveTo(x - 2, height * 0.19);
        ctx.quadraticCurveTo(x + 6, height * 0.46, x - 4, height * 0.74);
        ctx.strokeStyle = `rgba(232,238,234,${0.2 + coolant / 220})`;
        ctx.stroke();
      }

      ctx.strokeStyle = "rgba(255,255,255,.58)";
      ctx.lineWidth = 1.2;
      for (let i = 0; i < 8; i += 1) {
        ctx.beginPath();
        ctx.ellipse(ingotX + ingotW * 0.73 + i * 8, ingotY + ingotH * 0.08 + i * 1.4, ingotH * 0.34, ingotH * 0.12, -0.08, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.fillStyle = "rgba(255,255,255,.86)";
      ctx.font = "700 14px Inter, sans-serif";
      ctx.fillText("Real layout: horizontal ingot + vertical multi-wire saw + slurry flow", width * 0.08, height * 0.12);
    } else if (chapter.key === "implant") {
      ctx.fillStyle = "rgba(28,37,42,.96)";
      ctx.fillRect(width * 0.18, height * 0.17, width * 0.64, height * 0.16);
      ctx.strokeStyle = "rgba(245,211,120,.95)";
      ctx.lineWidth = 1.4;
      const needles = clamp(Math.round((values.pressure || 90) / 4), 18, 30);
      for (let i = 0; i < needles; i += 1) {
        const x = width * 0.21 + i * (width * 0.58 / Math.max(needles - 1, 1));
        ctx.beginPath();
        ctx.moveTo(x, height * 0.33);
        ctx.lineTo(x - 6 + (i % 3) * 3, height * 0.53);
        ctx.stroke();
      }
      const cols = 10;
      const rows = 5;
      for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < cols; col += 1) {
          const fail = (row * 19 + col * 11 + Math.round(result.risk)) % 31 < 4 + result.risk / 14;
          ctx.fillStyle = fail ? "rgba(230,91,76,.78)" : "rgba(122,225,216,.34)";
          ctx.fillRect(width * 0.12 + col * width * 0.075, height * 0.56 + row * 17, 18, 12);
        }
      }
      ctx.fillStyle = "rgba(94,194,255,.28)";
      ctx.fillRect(width * 0.72, height * 0.18, width * 0.18, height * 0.3);
      ctx.fillStyle = "rgba(255,255,255,.86)";
      ctx.font = "700 14px Inter, sans-serif";
      ctx.fillText("Probe card contact -> electrical test -> wafer map binning", width * 0.08, height * 0.12);
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
      const steps = [
        { label: "Trench/Via", x: width * 0.09 },
        { label: "Barrier/Seed", x: width * 0.31 },
        { label: "Cu Fill", x: width * 0.53 },
        { label: "CMP/Test", x: width * 0.75 }
      ];
      steps.forEach((step, index) => {
        const active = !simulating || index <= (runId % 24) / 6;
        ctx.fillStyle = active ? "rgba(48,58,64,.96)" : "rgba(48,58,64,.42)";
        ctx.fillRect(step.x, height * 0.32, width * 0.16, height * 0.34);
        ctx.fillStyle = "rgba(30,38,42,.95)";
        ctx.fillRect(step.x + width * 0.025, height * 0.4, width * 0.04, height * 0.18);
        ctx.fillRect(step.x + width * 0.075, height * 0.4, width * 0.04, height * 0.18);
        if (index >= 1) {
          ctx.strokeStyle = "rgba(123,225,216,.82)";
          ctx.lineWidth = 3;
          ctx.strokeRect(step.x + width * 0.025, height * 0.4, width * 0.04, height * 0.18);
          ctx.strokeRect(step.x + width * 0.075, height * 0.4, width * 0.04, height * 0.18);
        }
        if (index >= 2) {
          ctx.fillStyle = "rgba(199,139,73,.95)";
          ctx.fillRect(step.x + width * 0.028, height * 0.405, width * 0.034, height * 0.17);
          ctx.fillRect(step.x + width * 0.078, height * 0.405, width * 0.034, height * 0.17);
          ctx.fillRect(step.x + width * 0.025, height * 0.36, width * 0.09, height * 0.04);
        }
        if (index === 3) {
          ctx.fillStyle = "rgba(232,239,241,.86)";
          ctx.fillRect(step.x + width * 0.01, height * 0.35, width * 0.14, 6);
          if (result.risk > 45) {
            ctx.fillStyle = "rgba(230,91,76,.62)";
            ctx.beginPath();
            ctx.arc(step.x + width * 0.087, height * 0.49, 8 + intensity.risk * 7, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        ctx.fillStyle = "rgba(255,255,255,.86)";
        ctx.font = "700 11px Inter, sans-serif";
        ctx.fillText(step.label, step.x, height * 0.72);
      });
      ctx.strokeStyle = "rgba(255,255,255,.34)";
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 3; i += 1) {
        const x = width * (0.26 + i * 0.22);
        ctx.beginPath();
        ctx.moveTo(x, height * 0.49);
        ctx.lineTo(x + width * 0.035, height * 0.49);
        ctx.stroke();
      }
      ctx.fillStyle = "rgba(255,255,255,.86)";
      ctx.font = "700 14px Inter, sans-serif";
      ctx.fillText("Dual damascene: trench/via -> barrier/seed -> Cu fill -> CMP/test", width * 0.08, height * 0.12);
    } else if (chapter.key === "cmp") {
      ctx.fillStyle = "rgba(82,91,96,.92)";
      ctx.fillRect(width * 0.08, height * 0.65, width * 0.84, 18);
      ctx.fillStyle = "rgba(205,148,78,.92)";
      for (let i = 0; i < 5; i += 1) ctx.fillRect(width * 0.12 + i * width * 0.15, height * 0.38, 54, 34);
      ctx.strokeStyle = "rgba(255,230,160,.95)";
      ctx.lineWidth = 2.4;
      for (let i = 0; i < 12; i += 1) {
        const x = width * 0.16 + (i % 6) * width * 0.11;
        ctx.beginPath();
        ctx.moveTo(x, height * 0.38);
        ctx.quadraticCurveTo(x + 10, height * 0.18, x + 28, height * 0.38);
        ctx.stroke();
      }
      ctx.fillStyle = "rgba(185,197,200,.86)";
      ctx.fillRect(width * 0.62, height * 0.28, width * 0.2, height * 0.25);
      ctx.fillStyle = "rgba(230,91,76,.46)";
      for (let i = 0; i < 5 + intensity.risk * 6; i += 1) {
        ctx.beginPath();
        ctx.arc(width * 0.65 + ((i * 23) % 90), height * 0.33 + ((i * 17) % 58), 4 + (i % 3), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = "rgba(255,255,255,.86)";
      ctx.font = "700 14px Inter, sans-serif";
      ctx.fillText("Dicing -> die attach -> wire bond -> molding -> final test", width * 0.08, height * 0.12);
    }

    if (simulating) {
      const phase = (runId % 6) / 6;
      ctx.fillStyle = "rgba(123,231,222,.18)";
      ctx.fillRect(width * (0.12 + phase * 0.64), height * 0.08, 22, height * 0.78);
      ctx.fillStyle = "rgba(123,231,222,.95)";
      ctx.font = "800 12px Inter, sans-serif";
      ctx.fillText("RUN", width * (0.12 + phase * 0.64), height * 0.08);
    }

    ctx.fillStyle = "rgba(255,255,255,.92)";
    ctx.font = "700 15px Inter, sans-serif";
    ctx.fillText(getGuide(chapter).resultName, 16, height - 18);
  }, [chapter, result, values, mode, simulating, runId]);
  return <canvas className={`visual-canvas process-canvas ${simulating ? "simulating-canvas" : ""}`} ref={ref} />;
}

export default function App() {
  const [chapterKey, setChapterKey] = useState<ChapterKey>("diffusion");
  const [modeByChapter, setModeByChapter] = useState<Record<string, string>>({});
  const [values, setValues] = useState<Record<string, number>>(defaults);
  const [activeView, setActiveView] = useState("웨이퍼 뷰");
  const [theoryLevel, setTheoryLevel] = useState<TheoryLevel>("beginner");
  const [logs, setLogs] = useState<string[]>(["조건 설정 완료", "공정 모델 대기 중"]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simRunId, setSimRunId] = useState(0);
  const [simFrame, setSimFrame] = useState(0);
  const [modalView, setModalView] = useState<ModalView>(null);
  const [toast, setToast] = useState("");
  const [settings, setSettings] = useState<SimulatorSettings>(() => {
    try {
      const saved = window.localStorage.getItem("fab-simulator-settings");
      if (saved) return { autoSwitchToWafer: true, showDefectOverlay: true, reportIncludesTheory: true, ...JSON.parse(saved) };
    } catch {
      // Storage can be unavailable in restricted browser contexts.
    }
    return { autoSwitchToWafer: true, showDefectOverlay: true, reportIncludesTheory: true };
  });

  const chapter = chapters.find((item) => item.key === chapterKey) || chapters[0];
  const mode = modeByChapter[chapter.key] || chapter.modes[0];
  const result = useMemo(() => calculate(chapter, values, mode), [chapter, values, mode]);
  const guide = getGuide(chapter);
  const learningModule = getLearningModule(chapter, guide);
  const theoryItems = getTheoryItems(chapter, guide, theoryLevel);
  const activeViewRealityNote = getViewRealityNote(chapter, activeView);
  const reportText = useMemo(() => makeReport(chapter, result, mode, values, theoryItems, settings), [chapter, result, mode, values, theoryItems, settings]);
  const progress = Math.round((chapter.index / chapters.length) * 100);
  const simPhase = simRunId * 1000 + simFrame;
  const quizScore = useMemo(() => {
    return quizBank.reduce((score, item, index) => {
      const answer = (answers[index] || "").trim().toLowerCase();
      return answer.includes(item.a.toLowerCase()) || item.a.toLowerCase().includes(answer) && answer.length > 1 ? score + 10 : score;
    }, 0);
  }, [answers]);

  useEffect(() => {
    if (!isSimulating) return;
    const timer = window.setInterval(() => setSimFrame((current) => current + 1), 120);
    return () => window.clearInterval(timer);
  }, [isSimulating]);

  useEffect(() => {
    try {
      window.localStorage.setItem("fab-simulator-settings", JSON.stringify(settings));
    } catch {
      // Settings remain active for the current session even if persistence fails.
    }
  }, [settings]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    setValues((current) => {
      let changed = false;
      const next = { ...current };
      chapter.fields.forEach((field) => {
        const currentValue = current[field.key];
        if (currentValue === undefined || currentValue < field.min || currentValue > field.max) {
          const ideal = getIdeal(chapter, field);
          next[field.key] = Number(((ideal.min + ideal.max) / 2).toFixed(field.step < 1 ? 1 : 0));
          changed = true;
        }
      });
      return changed ? next : current;
    });
  }, [chapter]);

  function updateValue(key: string, next: number) {
    setValues((current) => ({ ...current, [key]: next }));
  }

  function runSimulation() {
    const now = new Date().toLocaleTimeString("ko-KR", { hour12: false });
    if (isSimulating) {
      setIsSimulating(false);
      setLogs((current) => [`${now} ${chapter.label} 시뮬레이션 정지`, ...current].slice(0, 6));
      return;
    }
    setSimFrame(0);
    setSimRunId((current) => current + 1);
    setIsSimulating(true);
    setLogs((current) => [
      `${now} ${guide.stages.map((stage) => stage.name).join(" → ")}`,
      `${now} ${chapter.label} 계산 완료: ${result.verdict}`,
      `${now} ${result.primaryLabel} ${fmt(result.primary)} ${result.primaryUnit}`,
      ...current
    ].slice(0, 6));
  }

  function resetQuiz() {
    setAnswers({});
    setSubmitted(false);
  }

  function saveConditions() {
    const now = new Date().toLocaleString("ko-KR", { hour12: false });
    const payload = {
      savedAt: now,
      chapterKey: chapter.key,
      mode,
      values: Object.fromEntries(chapter.fields.map((field) => [field.key, values[field.key] ?? field.min])),
      theoryLevel
    };
    try {
      window.localStorage.setItem(`fab-simulator-conditions-${chapter.key}`, JSON.stringify(payload));
      window.localStorage.setItem("fab-simulator-last-conditions", JSON.stringify(payload));
      setToast(`${chapter.label} 조건이 저장되었습니다.`);
      setLogs((current) => [`${now} ${chapter.label} 조건 저장 완료`, ...current].slice(0, 6));
    } catch {
      setToast("브라우저 저장소를 사용할 수 없어 저장하지 못했습니다.");
    }
  }

  function exportReport() {
    const filename = `fab-report-${chapter.key}-${new Date().toISOString().slice(0, 10)}.txt`;
    downloadText(filename, reportText);
    setToast("리포트 파일을 내보냈습니다.");
  }

  function saveActiveImage() {
    const date = new Date().toISOString().slice(0, 10);
    const filename = makeSafeFilename(`fab-${chapter.index}-${chapter.label}-${activeView}-${date}.png`);
    const activeBox = document.querySelector(".visual-box.large");
    const canvas = activeBox?.querySelector("canvas") as HTMLCanvasElement | null;
    if (canvas) {
      downloadUrl(filename, canvas.toDataURL("image/png"));
      setToast(`${activeView} 이미지를 저장했습니다.`);
      return;
    }
    const image = activeBox?.querySelector("img") as HTMLImageElement | null;
    if (image?.src) {
      downloadUrl(filename, image.src);
      setToast(`${activeView} 이미지를 저장했습니다.`);
      return;
    }
    setToast("저장할 시각화 이미지를 찾지 못했습니다.");
  }

  function exportSimulationData() {
    const now = new Date().toISOString();
    const conditions = chapter.fields.map((field) => {
      const value = values[field.key] ?? field.min;
      const ideal = getIdeal(chapter, field);
      const state = getFieldState(value, ideal);
      return {
        key: field.key,
        label: field.label,
        value,
        unit: field.unit,
        idealMin: ideal.min,
        idealMax: ideal.max,
        state: state.label,
        reason: ideal.reason
      };
    });
    const payload = {
      exportedAt: now,
      process: {
        index: chapter.index,
        label: chapter.label,
        english: chapter.english,
        mode,
        activeView
      },
      conditions,
      result,
      defects: chapter.defects,
      profile: result.profile.map((value, index) => ({ point: index, value })),
      learning: {
        level: theoryLevel,
        items: theoryItems,
        prerequisite: learningModule.prerequisite,
        principles: learningModule.principles,
        observation: learningModule.observation,
        practice: learningModule.practice
      },
      imageAudit: imageAuditNotes[chapter.key] || ""
    };
    const filename = makeSafeFilename(`fab-data-${chapter.index}-${chapter.label}-${new Date().toISOString().slice(0, 10)}.json`);
    downloadText(filename, JSON.stringify(payload, null, 2));
    setToast(`${chapter.label} 시뮬레이션 데이터를 내보냈습니다.`);
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
          <div className="progress-block">
            <span>전체 진행률</span>
            <div className="progress-row">
              <i style={{ width: `${progress}%` }} />
              <strong>{progress}%</strong>
            </div>
          </div>
        </div>
        <nav className="header-actions">
          <button type="button" onClick={saveConditions}><Save size={16} /> 조건 저장</button>
          <button type="button" onClick={() => setModalView("report")}><Download size={16} /> 리포트</button>
          <button type="button" onClick={() => setModalView("settings")}><Wrench size={16} /> 설정</button>
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
            {isSimulating ? "시뮬레이션 정지" : "시뮬레이션 실행"}
          </button>
          <div className="asset-card">
            <div className="mini-process photo">
              <img src={processImages[chapter.key] || oxidationImage} alt={`${chapter.label} 공정 미리보기`} />
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
                <button type="button" onClick={saveActiveImage}><Save size={14} /> 이미지 저장</button>
                <button type="button" onClick={exportSimulationData}><Download size={14} /> 데이터 내보내기</button>
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

          <PreSimulationLearningPanel chapter={chapter} guide={guide} module={learningModule} />

          <div className="visual-grid">
            <div className="visual-box large">
              <div className="visual-title">
                <strong>{activeView}</strong>
                <span>{result.verdict === "PASS" ? "공정 조건 정상" : result.verdict === "RISK" ? "관리 필요" : "조건 이탈"}</span>
              </div>
              <p className="view-reality-note">{activeViewRealityNote}</p>
              {activeView === "웨이퍼 뷰" && <RealProcessImage chapter={chapter} result={result} values={values} simulating={isSimulating} runId={simPhase} showDefectOverlay={settings.showDefectOverlay} />}
              {activeView === "단면 뷰" && <CrossSection result={result} chapter={chapter} simulating={isSimulating} runId={simPhase} />}
              {activeView === "내부 공정" && <ProcessViewport chapter={chapter} result={result} values={values} mode={mode} simulating={isSimulating} runId={simPhase} />}
              {activeView === "불량 검사" && (
                <div className="defect-grid">
                  <DefectScan result={result} chapter={chapter} variant={0} simulating={isSimulating} runId={simPhase} />
                  <DefectScan result={{ ...result, risk: result.risk + 10 }} chapter={chapter} variant={1} simulating={isSimulating} runId={simPhase} />
                  <DefectScan result={{ ...result, risk: result.risk + 18 }} chapter={chapter} variant={2} simulating={isSimulating} runId={simPhase} />
                  <DefectScan result={{ ...result, risk: result.risk + 4 }} chapter={chapter} variant={3} simulating={isSimulating} runId={simPhase} />
                </div>
              )}
            </div>
            <div className="visual-box">
              <div className="visual-title">
                <strong>단면 계측</strong>
                <span>{result.primaryLabel}</span>
              </div>
              <CrossSection result={result} chapter={chapter} simulating={isSimulating} runId={simPhase} />
            </div>
          </div>

          <div className="analysis-grid">
            <div className="analysis-panel">
              <h3>공정 분석 그래프</h3>
              <ProcessAnalytics result={result} chapter={chapter} values={values} />
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
                  {(Object.keys(theoryLevelLabels) as TheoryLevel[]).map((level) => (
                    <button
                      key={level}
                      type="button"
                      className={theoryLevel === level ? "active" : ""}
                      onClick={() => setTheoryLevel(level)}
                    >
                      {theoryLevelLabels[level]}
                    </button>
                  ))}
                </div>
              </div>
              <ul className="theory-list">
                {theoryItems.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
          </div>
          <SimulationReactionPanel chapter={chapter} result={result} guide={guide} simulating={isSimulating} runId={simRunId} />
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
              <p>{imageAuditNotes[chapter.key]}</p>
              {imageSourceLinks[chapter.key] && (
                <div className="source-links">
                  <strong>실사 참고</strong>
                  {imageSourceLinks[chapter.key]?.map((source) => (
                    <a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.label}</a>
                  ))}
                </div>
              )}
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
          {["이론 학습", "조건 실습", "시뮬레이션", "결과 분석", "평가", "보완 학습"].map((item, index) => (
            <div className={`step-row ${index <= 2 ? "done" : ""}`} key={item}>
              <span>{index + 1}</span>
              <strong>{item}</strong>
            </div>
          ))}
          <p className="flow-note">각 공정은 먼저 이론을 단계별로 학습하고, 같은 개념을 장비 조건 실습과 결과 분석으로 확인하도록 구성했습니다.</p>
        </div>
      </section>

      {modalView === "report" && (
        <div className="modal-backdrop" role="presentation" onClick={() => setModalView(null)}>
          <section className="app-modal report-modal" role="dialog" aria-modal="true" aria-label="시뮬레이션 리포트" onClick={(event) => event.stopPropagation()}>
            <div className="modal-head">
              <div>
                <h2>리포트</h2>
                <p>{chapter.label} 공정의 현재 조건과 결과 요약입니다.</p>
              </div>
              <button type="button" onClick={() => setModalView(null)}>닫기</button>
            </div>
            <div className="report-summary">
              <ResultCard label="판정" value={result.verdict} target={result.note} pass={result.verdict !== "FAIL"} />
              <ResultCard label={result.primaryLabel} value={`${fmt(result.primary)} ${result.primaryUnit}`} target="현재 조건 계산값" pass={result.verdict !== "FAIL"} />
              <ResultCard label="품질지수" value={`${fmt(result.quality, 0)} / 100`} target="공정 window 기준" pass={result.quality >= 78} />
            </div>
            <textarea readOnly value={reportText} aria-label="리포트 내용" />
            <div className="modal-actions">
              <button type="button" onClick={exportReport}><Download size={16} /> TXT 내보내기</button>
            </div>
          </section>
        </div>
      )}

      {modalView === "settings" && (
        <div className="modal-backdrop" role="presentation" onClick={() => setModalView(null)}>
          <section className="app-modal settings-modal" role="dialog" aria-modal="true" aria-label="시뮬레이터 설정" onClick={(event) => event.stopPropagation()}>
            <div className="modal-head">
              <div>
                <h2>설정</h2>
                <p>시뮬레이션 실행과 결과 표시 방식을 조정합니다.</p>
              </div>
              <button type="button" onClick={() => setModalView(null)}>닫기</button>
            </div>
            <label className="setting-row">
              <input
                type="checkbox"
                checked={settings.autoSwitchToWafer}
                onChange={(event) => setSettings((current) => ({ ...current, autoSwitchToWafer: event.target.checked }))}
              />
              <span>
                <strong>현재 탭에서 실행 시각화 표시</strong>
                <em>웨이퍼/단면/내부/불량검사 탭을 유지한 채 실행 반응을 표시합니다.</em>
              </span>
            </label>
            <label className="setting-row">
              <input
                type="checkbox"
                checked={settings.showDefectOverlay}
                onChange={(event) => setSettings((current) => ({ ...current, showDefectOverlay: event.target.checked }))}
              />
              <span>
                <strong>실물 이미지 결함 오버레이 표시</strong>
                <em>공정 리스크에 따라 점 결함과 hot spot을 시각화합니다.</em>
              </span>
            </label>
            <label className="setting-row">
              <input
                type="checkbox"
                checked={settings.reportIncludesTheory}
                onChange={(event) => setSettings((current) => ({ ...current, reportIncludesTheory: event.target.checked }))}
              />
              <span>
                <strong>리포트에 현재 이론 단계 포함</strong>
                <em>선택한 초급/중급/고급/실무 이론 항목을 리포트에 포함합니다.</em>
              </span>
            </label>
          </section>
        </div>
      )}

      {toast && <div className="app-toast" role="status">{toast}</div>}
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
