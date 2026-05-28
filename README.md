# My Blog

마크다운 파일을 읽어 정적 블로그 웹사이트로 보여주는 프로젝트입니다.
프레임워크 없이 **순수 HTML, CSS, JavaScript(ES 모듈)** 로 구현했고, 다크 모드와 모바일 반응형을 지원합니다.

## 로컬에서 실행

`fetch` 가 `file://` 에서 동작하지 않으므로 로컬 HTTP 서버로 실행해야 합니다.

```sh
python -m http.server 8000
# 또는
npx serve
```

브라우저에서 `http://localhost:8000` 을 엽니다.

## 글 추가

1. `posts/` 폴더에 `슬러그.md` 파일을 추가합니다 (상단에 `title`, `date` frontmatter).
2. `posts/index.json` 배열 맨 앞에 `{ "slug", "title", "date", "summary" }` 항목을 추가합니다.

## 구조

- `index.html` — 글 목록
- `post.html` — 개별 글 페이지 (`?slug=...`)
- `css/style.css` — 테마 변수, 반응형 레이아웃
- `js/markdown.js` — 자체 구현 마크다운 파서
- `js/theme.js` — 다크/라이트 토글 (localStorage 유지)
- `js/app.js` — 진입점, 목록/글 렌더링
- `posts/` — 글 본문(`.md`)과 메타데이터(`index.json`)
- `CLAUDE.md` — Claude Code 작업 가이드
