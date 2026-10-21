# Mora English

YouTube의 탐색 패턴을 참고한 영어 학습 앱. `org-mora-go-lab/web-notepad`의 Next.js 16, React 19, TypeScript, SCSS와 번호 계층 구조를 참고했습니다.

## 실행

```bash
npm ci
npm run dev
```

http://localhost:3200 에서 실행합니다. 환경 변수와 API 키는 필요하지 않습니다.

## 구조

`app/`은 라우팅, `src/1-page/`는 페이지 구성, `2-widget/`은 화면, `3-feature/`는 연습 기능, `4-entity/`는 레슨 도메인, `5-shared/`는 공통 스타일입니다. 요구사항은 `PRD.md`, 상세 요구사항은 `tests-prd/`, 대응 E2E는 `tests/`에 관리합니다.

## 기능

사이드는 홈, 둘러보기, 저장한 레슨, 최근 학습, 완료한 레슨의 5개 탭으로 구성합니다. 8개 자체 문장 레슨, 검색과 주제 필터, 저장 목록, 최근 학습, 학습 완료, 음성 듣기와 한국어 해석을 제공합니다. 기록은 브라우저 localStorage에 저장합니다. 계정 동기화와 동영상 스트리밍은 포함하지 않습니다. 음성은 Web Speech API와 기기에 설치된 영어 음성을 사용합니다.

## 검증

```bash
npm run lint
npm run test:e2e:structure
npm run build
npx playwright install chromium
npm run test:e2e
```

## 버전 및 배포

기본 및 운영 브랜치는 `main`입니다. 매번 `1.0.0`, `1.0.1` 형식의 새로운 버전 브랜치를 생성하고 PR을 통해 main으로 병합합니다. 기존 버전 브랜치를 재사용하지 않습니다. `package.json` 버전과 `versions/<version>.md`, 요구사항 및 테스트를 함께 갱신합니다.

GitHub Actions에서 PR과 main을 검증합니다. Vercel의 Production Branch는 `main`이며 병합 후 자동 배포합니다. 다른 브랜치와 PR은 Preview 배포 대상입니다.
