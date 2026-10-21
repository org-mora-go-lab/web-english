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

사이드는 홈, 둘러보기, 저장한 레슨, 최근 학습, 완료한 레슨의 5개 탭으로 구성합니다. 텍스트 브랜드를 사용하며 레슨 카드는 영상 대신 학습 자료로 열립니다.

5개 주제별 3개씩 총 15개 예시 레슨에 핵심 문장 75개, 어휘 45개, 대화 60문장과 이해도 문제 15개를 제공합니다. 레슨마다 상황·목표·활용 팁이 있습니다. 검색·주제·난이도 필터, 정렬, 저장, 최근 학습, 완료·취소를 사용할 수 있습니다.

기록은 브라우저 localStorage에 저장하며 같은 브라우저의 여러 창에서 동기화됩니다. 계정 동기화와 외부 동영상 스트리밍은 포함하지 않습니다. 레슨의 문장 듣기는 Web Speech API와 기기에 설치된 영어 음성을 사용하고 속도 선택·중지·오류·미지원 상태를 처리합니다. 문장 음성 E2E는 엔진 모의 구현으로 명령·속도·종료·실패 처리를 검증합니다.

첫 화면에는 Momo가 영어로 인사하는 약 20초 오리지널 애니메이션을 제공합니다. 실제 영어 음성·자막이 포함된 MP4를 무음 자동 반복 재생하며 목소리 듣기 버튼으로 소리를 켤 수 있습니다. 레슨과 달리 이 영상은 기기의 음성 합성 기능이 필요하지 않습니다. 모바일에서도 처음 화면에 노출되며 기본 재생 제어와 영어·한국어 자막, 대본 및 해석을 제공합니다. 레슨을 열면 영상이 중지됩니다. 미디어와 생성 소스는 `public/media/README.md`를 참고하세요.

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
