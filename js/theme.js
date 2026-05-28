// 라이트/다크 테마 관리.
// data-theme 속성은 <html>에 설정한다. <head>의 인라인 스크립트가 최초 페인트
// 전에 먼저 적용해 깜빡임(FOUC)을 막고, 여기서는 토글과 상태 유지를 담당한다.

const STORAGE_KEY = 'theme';

function getStored() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function store(theme) {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* 저장 불가(시크릿 모드 등)여도 동작은 계속한다. */
  }
}

export function getTheme() {
  return document.documentElement.getAttribute('data-theme') || 'dark';
}

function apply(theme) {
  document.documentElement.setAttribute('data-theme', theme);
}

// 네온 테마가 기본. 저장된 선택이 있으면 그것을 따른다.
export function initTheme() {
  const theme = getStored() || 'dark';
  apply(theme);
  return theme;
}

export function toggleTheme() {
  const next = getTheme() === 'dark' ? 'light' : 'dark';
  apply(next);
  store(next);
  return next;
}
