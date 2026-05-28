// 진입점. 같은 스크립트가 홈(글 목록)과 글 페이지 양쪽에서 동작하며,
// 페이지에 어떤 컨테이너가 있는지로 무엇을 렌더링할지 판단한다.

import { parseMarkdown } from './markdown.js';
import { initTheme, toggleTheme, getTheme } from './theme.js';

function setupThemeToggle() {
  const btn = document.querySelector('[data-theme-toggle]');
  if (!btn) return;

  const sync = () => {
    const dark = getTheme() === 'dark';
    btn.textContent = dark ? '☀' : '☾';
    btn.setAttribute('aria-label', dark ? '라이트 모드로 전환' : '다크 모드로 전환');
  };

  sync();
  btn.addEventListener('click', () => {
    toggleTheme();
    sync();
  });
}

// 사용자 문자열을 텍스트 노드로만 다뤄 안전하게 이스케이프한다.
function escapeText(value) {
  const el = document.createElement('div');
  el.textContent = value;
  return el.innerHTML;
}

async function renderList(container) {
  try {
    const res = await fetch('posts/index.json');
    if (!res.ok) throw new Error('글 목록을 불러오지 못했습니다.');

    const posts = await res.json();
    posts.sort((a, b) => (a.date < b.date ? 1 : -1)); // 최신순

    if (posts.length === 0) {
      container.innerHTML = '<p class="empty">아직 글이 없습니다.</p>';
      return;
    }

    container.innerHTML = posts
      .map((post) => {
        const slug = encodeURIComponent(post.slug);
        return `
          <article class="post-card">
            <a class="post-card__link" href="post.html?slug=${slug}">
              <h2 class="post-card__title">${escapeText(post.title)}</h2>
              <time class="post-card__date">${escapeText(post.date || '')}</time>
              <p class="post-card__summary">${escapeText(post.summary || '')}</p>
            </a>
          </article>`;
      })
      .join('');
  } catch (err) {
    container.innerHTML = `<p class="error">${escapeText(err.message)}</p>`;
  }
}

async function renderPost(container) {
  const slug = new URLSearchParams(location.search).get('slug');

  // slug는 파일 경로가 되므로 안전한 문자만 허용한다.
  if (!slug || !/^[\w-]+$/.test(slug)) {
    container.innerHTML = '<p class="error">잘못된 글 주소입니다.</p>';
    return;
  }

  try {
    const res = await fetch(`posts/${slug}.md`);
    if (!res.ok) throw new Error('글을 찾을 수 없습니다.');

    const text = await res.text();
    const { meta, html } = parseMarkdown(text);
    const title = meta.title || slug;
    document.title = `${title} — My Blog`;

    const dateHtml = meta.date
      ? `<time class="post-header__date">${escapeText(meta.date)}</time>`
      : '';

    container.innerHTML = `
      <header class="post-header">
        <h1 class="post-header__title">${escapeText(title)}</h1>
        ${dateHtml}
      </header>
      <div class="post-body">${html}</div>`;
  } catch (err) {
    container.innerHTML = `<p class="error">${escapeText(err.message)}</p>`;
  }
}

function main() {
  initTheme();
  setupThemeToggle();

  const list = document.querySelector('[data-post-list]');
  if (list) renderList(list);

  const post = document.querySelector('[data-post]');
  if (post) renderPost(post);
}

main();
