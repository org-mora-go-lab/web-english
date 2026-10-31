# Mora Little English

16~36개월 아이와 부모를 위한 영어 놀이 허브입니다. 3개월 단위 커리큘럼, 부모 가이드, 아이의 놀이 기록을 제공하며, 기존 영상 레슨과 블로그형 CMS도 유지합니다. [구현 계획](docs/implementation-plan.md)을 참고하세요.

## 실행

```bash
npm ci
cp .env.example .env.local
npm run db:migrate
npm run dev
```

http://localhost:3200 에서 실행합니다. `.env.local`의 `AUTH_SECRET`을 새 난수로 바꾸세요. 로컬 개발은 파일 DB를 사용합니다. 실제 기기 간 동기화는 Turso URL과 토큰을 지정해야 합니다.

## 구조

`app/`은 라우팅, `src/1-page/`는 페이지 구성, `2-widget/`은 화면, `3-feature/`는 연습 기능, `4-entity/`는 레슨 도메인, `5-shared/`는 공통 스타일입니다. 요구사항은 `PRD.md`, 상세 요구사항은 `tests-prd/`, 대응 E2E는 `tests/`에 관리합니다.

## 기능

영상 라이브러리 `/library`에는 2세 아이와 보호자가 함께 즐기는 **동물 동요 10편**을 먼저 보여줍니다. 곰 Momo, 토끼 Bibi, 오리 Dodo, 여우 Fifi, 코끼리 Ellie, 사자 Leo, 판다 Poco, 거북이 Toto, 강아지 Pip, 고양이 Kiki가 서로 다른 노래와 놀이를 진행합니다. 인사·동작·동물 소리·색깔·숫자·몸·반대말·잘 자요 주제를 짧은 가사와 반복으로 구성합니다.

새 동요는 1080p/30fps 영상, 개별 프리뷰, 실제 음성·노래·반주, 노래/따라 하기/반복 챕터, 영어·한국어 선택 자막, 가사 구간 재생과 보호자 안내를 제공합니다. 유료 외부 제작 API 없이 기본 이미지 생성 기능과 무료 로컬 Kokoro/WORLD/FFmpeg 도구로 제작했습니다. 합성 음성 기반 노래이며 실제 가수의 녹음이나 완전한 3D 골격 애니메이션은 사용하지 않습니다. 제작 기록은 `public/media/singalong/README.md`에 있습니다.


영상 라이브러리의 사이드는 홈, 둘러보기, 저장한 레슨, 최근 학습, 완료한 레슨의 5개 탭으로 구성합니다. 텍스트 브랜드를 사용하며 모든 레슨은 영상 프리뷰 이미지와 재생 시간을 표시합니다. 카드를 누르면 `/watch/[id]` 별도 시청 페이지로 이동하고 뒤로가기로 탐색 상태와 스크롤을 복원합니다.

5개 주제별 3개씩 총 15개 예시 레슨에 핵심 문장 75개, 어휘 45개, 대화 60문장과 이해도 문제 15개를 제공합니다. 레슨마다 상황·목표·활용 팁이 있습니다. 검색·주제·난이도 필터, 정렬, 저장, 최근 학습, 완료·취소를 사용할 수 있습니다.

동요 10개와 기존 회화 레슨 15개를 합쳐 전체 25개 콘텐츠의 저장·최근 학습·완료를 관리합니다. 자막 끄기·언어 선택은 localStorage에 저장해 영상 이동·새로고침·새 탭과 홈 인사 영상에서도 유지합니다.

비회원 기록은 브라우저 localStorage에 저장하며 같은 브라우저의 여러 창에서 동기화됩니다. 회원 기록과 새 글 학습 진도는 Turso에 저장되어 같은 계정의 기기 간 동기화됩니다. 탐색 상태는 sessionStorage와 메모리에서 유지합니다.

## 계정과 글

`/signup`에서 이메일과 비밀번호로 가입하면 바로 로그인합니다. `AUTH_KAKAO_ID`와 `AUTH_KAKAO_SECRET`을 설정하면 `/login`과 `/signup`에 카카오 로그인 버튼이 나타납니다. 카카오 계정은 카카오 ID로 식별하고 프로필 이름·사진을 표시합니다. 카카오 이메일이 기존 이메일 계정과 같아도 자동 연결하지 않으므로 기존 글·학습 기록은 별도 계정에 남습니다. 메일 발송과 비밀번호 찾기는 제공하지 않으므로 이메일 계정 비밀번호를 안전하게 보관해야 합니다. `/settings/account`에서 이메일 계정은 닉네임·로그인 이메일·비밀번호를 변경할 수 있고, 카카오 계정은 카카오 프로필에서 이름·사진을 변경할 수 있습니다. 카카오 계정 탈퇴는 다시 로그인한 뒤 10분 안에 가능합니다. `/studio`에서 Tiptap으로 글을 작성하고, 자동 저장·미리보기·발행·비공개 설정·버전 기록을 사용합니다. `/studio/import`는 Paul 또는 외부 Markdown/JSON을 비공개 임시 글로 가져옵니다. `/posts/[slug]/context`에서 Paul에게 붙여 넣을 학습 컨텍스트와 공유 URL을 복사할 수 있습니다.

이미지는 Vercel **비공개** Blob 저장소에 업로드하며 5MB 이하의 PNG/JPEG/WebP만 허용합니다. 공개 글에서 쓰는 이미지만 비회원에게 서버 경유로 제공됩니다. 별도 OpenAI GPT API는 사용하지 않습니다.

## 운영 환경과 배포

Vercel Production Branch는 `main`입니다. 개발/운영 Turso 데이터베이스를 따로 만들고 각각의 `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`을 설정하세요. Vercel에는 `AUTH_SECRET`, `AUTH_URL`(운영 HTTPS 주소), 비공개 Vercel Blob 스토어의 `BLOB_READ_WRITE_TOKEN`을 서버 전용 환경 변수로 설정합니다. 카카오 로그인을 쓰려면 Kakao Developers에서 웹 플랫폼 도메인과 `https://web-english-pi.vercel.app/api/auth/callback/kakao` 리디렉션 URI를 등록하고 Vercel Production에 `AUTH_KAKAO_ID`(REST API 키), `AUTH_KAKAO_SECRET`(카카오 로그인 Client Secret)을 추가해야 합니다. 로컬 개발에서는 `http://localhost:3200/api/auth/callback/kakao`도 등록합니다. Vercel Production 빌드는 Drizzle 마이그레이션을 먼저 적용하고 Next.js를 빌드합니다. Preview는 운영 DB를 변경하지 않습니다.

관리자 계정은 일반 회원가입으로 만들 수 없습니다. 운영 계정의 `users.role`을 Turso 관리 콘솔에서 `admin`으로 설정한 뒤 다시 로그인하세요. 회원 탈퇴는 소유 글·학습 기록과 Blob 파일을 삭제합니다. 기존 브라우저의 비회원 기록은 로그인 시 자동으로 계정에 합치지 않습니다.

Turso 무료 요금 범위는 [Turso 요금 페이지](https://turso.tech/pricing)에서 확인하세요. Vercel Blob의 저장·전송 비용은 [Vercel Blob 요금 문서](https://vercel.com/docs/vercel-blob/usage-and-pricing)를 확인하세요.

Dot Paul의 외부 POST API 직접 호출은 이 프로젝트에서 구성하지 않았습니다. 현재 기본 경로는 Markdown/JSON 가져오기입니다. 향후 Paul이 공식 플러그인으로 이 사이트에 쓰려면 계정별 인증·권한 승인과 공개된 도구 인터페이스를 별도 설계해야 합니다.

15개 레슨 모두 Momo가 영어를 말하는 오리지널 MP4로 제공합니다. 영상마다 어휘 3개, 핵심 문장 5개, 대화 4문장과 복습을 담습니다. 영어 음성은 파일에 포함되어 브라우저 음성 합성 기능 없이 재생됩니다. 재생·일시 정지·탐색·속도·영어/한국어 자막·챕터·문장별 구간 이동을 지원합니다. 시청 페이지에는 대본, 해석, 퀴즈와 관련 영상이 있습니다.

첫 화면에는 동물 친구 10종이 등장하는 약 20초 인사 영상을 무음 자동 반복 재생하며 목소리 듣기로 소리를 켭니다. 시청 페이지로 전환하면 인사 영상 플레이어를 해제합니다. 미디어와 재현 방법은 `public/media/README.md`를 참고하세요.

## 검증

```bash
npm run lint
npm run test:e2e:structure
npm run build
npx playwright install chromium webkit
npm run test:e2e
```

## 버전 및 배포

기본 및 운영 브랜치는 `main`입니다. 매번 `1.0.0`, `1.0.1` 형식의 새로운 버전 브랜치를 생성하고 PR을 통해 main으로 병합합니다. 기존 버전 브랜치를 재사용하지 않습니다. `package.json` 버전과 `versions/<version>.md`, 요구사항 및 테스트를 함께 갱신합니다.

GitHub Actions에서 PR과 main을 검증합니다. Vercel의 Production Branch는 `main`이며 병합 후 자동 배포합니다. 다른 브랜치와 PR은 Preview 배포 대상입니다.

## 부모용 영어 놀이 허브

첫 화면 `/`은 16~17개월 준비와 18~36개월 3개월 단위 커리큘럼을 보여주는 부모용 허브입니다. 각 단계마다 일상, 장난감, 그림책, 노래·몸짓, 산책의 다섯 주제로 8개 놀이씩 총 64개를 제공합니다. 부모가 활동 카드의 영어 한마디와 방법을 20초 내 확인하고 아이와는 화면 밖에서 놀이합니다. 카카오 또는 이메일로 로그인한 부모는 아이 개월수, 놀이 반응, 한 줄 메모를 Turso에 저장하고 기기 간 확인할 수 있습니다. 기록은 로그인 계정별로 분리되며 계정 탈퇴 시 함께 삭제됩니다. 기존 영상 레슨은 `/library`에서 볼 수 있습니다.

개월수별 놀이는 발달 평가 기준이 아닙니다. 그림책 보기, 실물 놀이, 몸짓, 역할놀이의 구성에는 [CDC 18개월 놀이 안내](https://www.cdc.gov/act-early/milestones-in-action/18-months.html), [CDC 30개월 놀이 안내](https://www.cdc.gov/act-early/milestones/30-months.html), [CDC 3세 놀이 안내](https://www.cdc.gov/act-early/milestones/3-years.html)를 참고했습니다. 작은 소품을 피하는 안전 안내에는 [미국소아과학회 질식 예방 지침](https://www.healthychildren.org/English/health-issues/injuries-emergencies/Pages/Choking-Prevention.aspx/)을 참고했습니다.
