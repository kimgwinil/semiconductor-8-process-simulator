# 반도체 8대공정 교육 시뮬레이터

실제 장비 없이 반도체 8대 공정의 이론, 파라미터 기반 시뮬레이션, 불량 분석, 평가를 학습할 수 있는 웹 시뮬레이터입니다.

## 포함 기능

- 산화, 포토리소그래피, 식각, 확산, 이온 주입, 증착, 금속 배선, CMP 챕터
- 챕터별 공정 변수 입력과 계산 결과
- 웨이퍼 균일도, 공정 단면, 불량 검사 시각화
- 챕터별 이론, 불량 모드, 평가 및 해설
- GitHub Pages 배포 워크플로

## 로컬 실행

```bash
npm install
npm run dev
```

## 빌드

```bash
npm run build
```

## GitHub Pages 배포

1. GitHub에 새 저장소를 만들고 이 프로젝트를 push합니다.
2. 저장소 Settings → Pages에서 GitHub Actions를 선택합니다.
3. `main` 브랜치에 push하면 `.github/workflows/deploy-pages.yml`이 자동 배포합니다.
