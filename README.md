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

이미지는 Vercel **비공개** Blob 저장소에 업로드하며 5MB 이하의 PNG/JPEG/WebP만 허용합니다. 공개 글에서 쓰는 이미지만 비회원에게 서버 경유로 제공됩니다.

## AI 영어 도우미

`/ai`에서 로그인한 보호자가 영어 놀이 아이디어를 묻거나 영어 대화를 연습할 수 있습니다. 화면에서 GPT-6 Luna, GPT-6 Sol, GPT-6 Astra 중 운영자가 허용한 모델을 선택합니다. 기본 모델은 GPT-6 Luna이며 선택만 브라우저에 기억합니다. 완료된 질문과 답변은 계정별 Turso DB에 저장하고 최근 대화를 자동으로 불러옵니다. 내 대화 내역에서 이전 대화를 선택하거나 삭제할 수 있습니다. 새 대화 또는 모드 변경은 기존 기록을 보존하고 별도 대화를 시작합니다. 대화당 100회 왕복, 목록은 최신 100개를 제공하며 최근 18개 메시지와 10,000자 내의 문맥을 AI에 전달합니다. 아이의 프로필과 놀이 기록을 자동으로 보내지 않습니다. 사용자가 입력한 대화는 답변 생성을 위해 OpenAI에 전송됩니다.

비회원에게는 로그인 안내만 표시하며 모델 목록과 대화 API 모두 회원 인증을 요구합니다. 로그인하면 `/ai`로 복귀합니다. 빈 메시지 입력창에서 Tab을 누르면 현재 모드의 추천 질문이 채워집니다. 입력이 있거나 Shift+Tab을 누르면 일반적인 초점 이동을 유지합니다.

운영 연결 방법:

1. [OpenAI Platform](https://platform.openai.com/api-keys)에서 이 앱용 API 키를 만듭니다. Responses API를 호출할 수 있는 권한이 필요합니다. 키는 채팅, 소스 코드, 브라우저 저장소에 붙여 넣지 마세요.
2. Vercel 프로젝트의 Settings → Environment Variables에서 **Production**의 `OPENAI_API_KEY`에 키를 저장합니다. 로컬 개발은 Git에서 제외된 `.env.local`에만 저장합니다. `NEXT_PUBLIC_` 접두사를 사용하지 않습니다.
3. 선택적으로 `OPENAI_ALLOWED_MODELS=gpt-6-luna,gpt-6-sol,gpt-6-astra`를 설정합니다. 처음에는 `gpt-6-luna` 하나만 허용해도 됩니다. 계정에서 해당 모델을 사용할 수 있어야 합니다.
4. 환경 변수를 저장한 뒤 Production을 다시 배포하고 `/ai`에서 로그인하여 확인합니다. 키가 없으면 안내 화면이 표시되며 외부 API를 호출하지 않습니다.

서버는 [Responses API](https://developers.openai.com/api/docs/guides/text)를 사용합니다. API 키를 클라이언트에 전달하지 않고 로그인·요청 출처·허용 모델·입력 길이를 검사합니다. 계정별 분당 5회/일 30회와 전체 일 100회 제한을 DB에 저장합니다. 전체 일 제한은 `OPENAI_GLOBAL_DAILY_LIMIT`으로 1~1000 범위에서 조정할 수 있습니다. 제한은 요청 횟수이며 금액 한도가 아닙니다. 답변은 최대 1200 출력 토큰, 요청 시간은 45초로 제한하며 서버가 자동으로 재시도하지 않습니다. 클라이언트 중지는 이미 처리된 요청의 비용을 취소하지 않습니다.

고급 음성 시작을 누르고 마이크를 허용하면 OpenAI GPT Realtime 2.1과 WebRTC로 직접 대화합니다. Marin/Cedar 목소리를 선택하고 의미 기반 발화 감지와 끼어들기를 사용합니다. 브라우저 SpeechRecognition·SpeechSynthesis는 사용하지 않습니다. 서버의 `englishVoiceAgent`가 성인 보호자를 위한 영어 코치 지침과 저장된 최근 문맥을 설정하므로 별도 Agent Builder 리소스나 외부 도구 권한은 필요하지 않습니다. 텍스트 모델 선택은 텍스트 대화에 적용되고 고급 음성은 전용 Realtime 모델을 사용합니다.

API 키는 서버에만 보관하고 SDP 교환을 중계합니다. 서버가 OpenAI sideband WebSocket에서 직접 받은 전사문·완료된 답변만 계정에 저장합니다. 취소된 답변은 저장하지 않습니다. 연결당 최대 3분·완료된 답변 10회, 계정당 동시 연결 1개입니다. 세션 생성은 기존 계정별·전체 요청 한도에 포함됩니다. 시작 전에 API 키에 Realtime 사용 권한과 모델 이용 권한이 있어야 합니다. 종료·화면 숨김·이탈·연결 오류 때 오디오 트랙과 peer connection을 닫고 서버에서 call hangup을 요청합니다. 요청 횟수와 시간 제한은 금액 한도가 아니므로 OpenAI 프로젝트 예산도 별도로 설정하세요.

오디오는 OpenAI로 직접 전송되고 앱 DB에는 음성 파일을 저장하지 않습니다. AI 생성 음성임을 화면에 안내합니다. WebRTC·마이크를 사용할 수 없는 브라우저는 텍스트 대화를 제공하고, 자동 재연결이나 무단 마이크 시작은 하지 않습니다. 자동화 테스트는 합성 장치·모의 연결로 흐름을 검증하며 실제 음질은 네트워크·장치·환경에 따라 다릅니다. [Realtime 연결](https://developers.openai.com/api/docs/guides/voice-webrtc?api=realtime), [서버 제어](https://developers.openai.com/api/docs/guides/voice-server-controls?api=realtime), [모델](https://developers.openai.com/api/docs/models/gpt-realtime-2.1)을 참고하세요. Vercel의 음성 요청은 `maxDuration=240`을 사용하므로 해당 실행 시간을 지원하는 Fluid compute 환경이 필요합니다.

OpenAI API는 무료 도구가 아니며 계정의 크레딧과 사용량 요금이 적용됩니다. 키 생성과 앱 연결은 크레딧 구매를 수행하지 않습니다. OpenAI 프로젝트의 사용 한도와 [API 요금](https://openai.com/api/pricing/)을 별도로 확인하세요. 요청에는 `store: false`를 사용하지만, 이는 OpenAI의 모든 데이터 보관을 해제한다는 뜻은 아닙니다. 테스트는 로컬 DB와 모의 응답을 사용하며 실제 유료 API를 호출하지 않습니다.

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

E2E 실행은 테스트 전용 로컬 DB를 마이그레이션하고 해당 환경으로 앱을 빌드한 뒤 운영 서버를 시작합니다. 테스트 중에는 운영 DB와 OpenAI API 키를 사용하지 않습니다.

## 버전 및 배포

기본 및 운영 브랜치는 `main`입니다. 매번 `1.0.0`, `1.0.1` 형식의 새로운 버전 브랜치를 생성하고 PR을 통해 main으로 병합합니다. 기존 버전 브랜치를 재사용하지 않습니다. `package.json` 버전과 `versions/<version>.md`, 요구사항 및 테스트를 함께 갱신합니다.

GitHub Actions에서 PR과 main을 검증합니다. Vercel의 Production Branch는 `main`이며 병합 후 자동 배포합니다. 다른 브랜치와 PR은 Preview 배포 대상입니다.

## 부모용 영어 놀이 허브

첫 화면 `/`은 16~17개월 준비와 18~36개월 3개월 단위 커리큘럼을 보여주는 부모용 허브입니다. 각 단계마다 일상, 장난감, 그림책, 노래·몸짓, 산책의 다섯 주제로 8개 놀이씩 총 64개를 제공합니다. 부모가 활동 카드의 영어 한마디와 방법을 20초 내 확인하고 아이와는 화면 밖에서 놀이합니다. 카카오 또는 이메일로 로그인한 부모는 아이 개월수, 놀이 반응, 한 줄 메모를 Turso에 저장하고 기기 간 확인할 수 있습니다. 기록은 로그인 계정별로 분리되며 계정 탈퇴 시 함께 삭제됩니다. 기존 영상 레슨은 `/library`에서 볼 수 있습니다.

개월수별 놀이는 발달 평가 기준이 아닙니다. 그림책 보기, 실물 놀이, 몸짓, 역할놀이의 구성에는 [CDC 18개월 놀이 안내](https://www.cdc.gov/act-early/milestones-in-action/18-months.html), [CDC 30개월 놀이 안내](https://www.cdc.gov/act-early/milestones/30-months.html), [CDC 3세 놀이 안내](https://www.cdc.gov/act-early/milestones/3-years.html)를 참고했습니다. 작은 소품을 피하는 안전 안내에는 [미국소아과학회 질식 예방 지침](https://www.healthychildren.org/English/health-issues/injuries-emergencies/Pages/Choking-Prevention.aspx/)을 참고했습니다.
