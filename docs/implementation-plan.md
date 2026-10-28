# Dot Paul + Mora English 구현 계획

## 기존 구조와 재사용 범위

기존 `main`은 Next.js App Router 16.3.8, React 19, TypeScript, SCSS, Zustand, Playwright로 구성되어 있습니다. Auth.js, 서버 DB, 회원 기능은 없었고 기존 25개 영상 레슨의 라이브러리는 브라우저 localStorage에 저장되었습니다. 영상·검색·학습 화면과 번호 계층 구조는 유지했습니다. 새 계정 화면과 CMS 화면에는 Tailwind CSS를 추가하고 보안 수정 버전인 Next.js 16.4.3으로 갱신했습니다.

## 단계별 구현

1. **인증과 데이터베이스:** Turso/libSQL + Drizzle 스키마와 마이그레이션, Auth.js Credentials, Argon2id, 이메일 인증, 비밀번호 재설정, 계정 설정, 로그인 제한과 권한 검사.
2. **CMS:** Tiptap 에디터, 글 CRUD, 자동 저장, 발행, 공개 범위, 버전 기록, 카테고리·태그, 비공개 Blob 이미지.
3. **Paul 연결:** 학습 컨텍스트 복사·URL 공유, Markdown/JSON 가져오기와 미리보기 후 발행. Dot Paul의 외부 POST는 사용자 계정과 공식 플러그인 기능이 확인될 때 별도 통합합니다.
4. **학습:** 글 학습·퀴즈·진도, 기존 영상 레슨 라이브러리의 계정별 Turso 동기화.
5. **운영:** PRD/E2E 동기화, Playwright, 빌드·린트, Vercel 환경 변수와 Turso 개발/운영 DB 분리.

## 운영 결정

- Auth.js는 Credentials와 암호화된 JWT 쿠키를 사용합니다. `auth_sessions` 테이블은 필요하지 않습니다. 비밀번호 변경·재설정·이메일 변경 시 `session_version`을 올려 기존 세션의 서버 접근을 차단합니다.
- 회원 탈퇴 시 DB의 글·버전·미디어 메타데이터·학습 진도를 외래 키 cascade로 삭제합니다. 비공개 Blob 원본은 삭제 후 계정 행을 삭제합니다.
- 직접 OpenAI API를 호출하지 않습니다. Paul의 공식 플러그인 연결 및 계정별 승인 방식은 운영 환경에서 검증되지 않아 직접 POST는 제공하지 않습니다.
- 실제 Turso, Resend, Vercel Blob 자격 증명이 제공되지 않은 환경에서는 로컬 libSQL과 개발용 메일 캡처로 E2E를 검증합니다. 운영 연결은 배포 담당자가 키를 설정한 뒤 확인해야 합니다.
