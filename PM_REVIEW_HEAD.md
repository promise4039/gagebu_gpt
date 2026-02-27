# PM/리뷰 매니저 점검 (HEAD 기준)

## 1) 변경 요약(파일별 1줄)
- `vite.config.ts`: Vite base를 `'/gagebu_gpt/'`로 지정해 정적 자산/라우팅 기준 경로를 저장소명 기준 서브패스로 고정.

## 2) SSOT 적합성/리스크
- SSOT 문서(`docs/banksalad_plan_master_v3.md`, `docs/backlog.md`)가 현재 저장소에서 확인되지 않아 직접 대조는 불가.
- 라우팅/네비: `'/gagebu_gpt/'` 기준으로 배포되지 않으면 딥링크/새로고침 시 404 가능.
- 데이터: 상대경로 fetch(`./data.json`)는 안전한 편이나, 절대경로(`/api`, `/assets`) 사용부는 프록시/호스팅 규칙 점검 필요.
- 보안: 직접적인 취약점 증가는 낮음. 단, 잘못된 rewrite 설정 시 의도치 않은 엔드포인트 노출 여부 확인 필요.
- 성능: base 변경으로 자산 URL이 바뀌어 첫 배포 시 캐시 미스 증가 가능.

## 3) 머지 전 QA 체크리스트
1. `npm run build` 결과에서 번들 자산 경로가 `/gagebu_gpt/` 프리픽스로 생성되는지 확인.
2. `/gagebu_gpt/` 경로에서 SPA 진입/새로고침/딥링크(2~3개 라우트) 동작 확인.
3. 루트(`/`) 접근 시 기대 동작(리다이렉트 또는 404 정책)이 운영 정책과 일치하는지 확인.
4. JS/CSS/이미지/폰트 로딩 실패(404)가 없는지 네트워크 탭 점검.
5. React Router 이동(뒤로가기/앞으로가기 포함)에서 깨진 링크가 없는지 확인.
6. 정적 호스팅(GitHub Pages/CloudFront 등) rewrite와 base path 설정 일치 여부 확인.
7. 서비스워커/manifest 사용 시 `scope`/`start_url`이 `/gagebu_gpt/`와 일치하는지 확인.
8. 첫 배포 직후 캐시 워밍 전후 로딩 속도 스팟 체크(Lighthouse/Web Vitals).

## 4) Next PR 제안(스코프/DoD/파일)
- 제안 PR: **SmartFilterBar v1** (최소 단위)
- 스코프: 거래/내역 리스트 상단에 기간·카테고리·금액 필터 UI + 로컬 상태 필터링.
- DoD:
  - 필터 변경 즉시 리스트 반영
  - 기본값 초기화 동작(새로고침 시)
  - 모바일/데스크톱 UI 깨짐 없음
  - 빈 결과/로딩/에러 상태와 충돌 없음
- 변경 파일 후보:
  - `src/components/SmartFilterBar.tsx` (신규)
  - `src/pages/*` 리스트 페이지
  - `src/domain/*` 필터 타입/모델

## 5) 즉시 실행 권고
- 머지 전 최소 검증 게이트: `npm run build` + `/gagebu_gpt/` 실서버(또는 preview 프록시) 딥링크 3케이스 확인.
- 배포 파이프라인에서 base path 환경값을 별도 주입 중이면 충돌 여부를 우선 점검.
