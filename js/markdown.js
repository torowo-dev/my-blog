// 외부 라이브러리 없이 동작하는 경량 마크다운 파서.
// parseMarkdown(text) -> { meta, html }
//
// 지원: frontmatter, 제목(#~######), 굵게/기울임, 인라인 코드, 코드블록(```),
//       링크, 이미지, 순서/비순서 목록, 인용(>), 수평선(---), 문단.
// 모든 텍스트는 먼저 이스케이프하므로 마크다운 본문으로 인한 XSS는 발생하지 않는다.

export function parseMarkdown(text) {
  const { meta, body } = extractFrontmatter(text);
  return { meta, html: renderBlocks(body) };
}

function extractFrontmatter(text) {
  text = String(text).replace(/^﻿/, '').replace(/\r\n/g, '\n');
  const match = text.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!match) return { meta: {}, body: text };

  const meta = {};
  for (const line of match[1].split('\n')) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
    if (key) meta[key] = value;
  }
  return { meta, body: text.slice(match[0].length) };
}

function renderBlocks(src) {
  const lines = src.replace(/\r\n/g, '\n').split('\n');
  const out = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // 코드 블록 (```lang ... ```)
    const fence = line.match(/^```(\w*)\s*$/);
    if (fence) {
      const buf = [];
      i++;
      while (i < lines.length && !/^```\s*$/.test(lines[i])) buf.push(lines[i++]);
      i++; // 닫는 펜스 건너뛰기
      const lang = fence[1] ? ` class="language-${fence[1]}"` : '';
      out.push(`<pre><code${lang}>${escapeHtml(buf.join('\n'))}</code></pre>`);
      continue;
    }

    // 빈 줄
    if (/^\s*$/.test(line)) { i++; continue; }

    // 제목
    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      const level = heading[1].length;
      out.push(`<h${level}>${inline(heading[2].trim())}</h${level}>`);
      i++;
      continue;
    }

    // 수평선
    if (/^([-*_])\1{2,}\s*$/.test(line)) {
      out.push('<hr>');
      i++;
      continue;
    }

    // 인용 (중첩 블록 허용)
    if (/^>\s?/.test(line)) {
      const buf = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) buf.push(lines[i++].replace(/^>\s?/, ''));
      out.push(`<blockquote>${renderBlocks(buf.join('\n'))}</blockquote>`);
      continue;
    }

    // 비순서 목록
    if (/^\s*[-*+]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*[-*+]\s+/.test(lines[i])) {
        items.push(inline(lines[i++].replace(/^\s*[-*+]\s+/, '')));
      }
      out.push(`<ul>${items.map((t) => `<li>${t}</li>`).join('')}</ul>`);
      continue;
    }

    // 순서 목록
    if (/^\s*\d+\.\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(inline(lines[i++].replace(/^\s*\d+\.\s+/, '')));
      }
      out.push(`<ol>${items.map((t) => `<li>${t}</li>`).join('')}</ol>`);
      continue;
    }

    // 문단 (다음 블록이 시작되거나 빈 줄이 나올 때까지 모음)
    const buf = [];
    while (i < lines.length && !/^\s*$/.test(lines[i]) && !isBlockStart(lines[i])) {
      buf.push(lines[i++]);
    }
    out.push(`<p>${inline(buf.join(' '))}</p>`);
  }

  return out.join('\n');
}

function isBlockStart(line) {
  return (
    /^```/.test(line) ||
    /^#{1,6}\s/.test(line) ||
    /^([-*_])\1{2,}\s*$/.test(line) ||
    /^>\s?/.test(line) ||
    /^\s*[-*+]\s+/.test(line) ||
    /^\s*\d+\.\s+/.test(line)
  );
}

function inline(text) {
  text = escapeHtml(text);

  // 인라인 코드는 다른 규칙의 영향을 받지 않도록 토큰으로 떼어 둔다.
  const codes = [];
  text = text.replace(/`([^`]+)`/g, (_, code) => {
    codes.push(`<code>${code}</code>`);
    return `@@CODE${codes.length - 1}@@`;
  });

  // 이미지 -> 링크 순서 (이미지의 ! 가 링크 규칙에 먼저 잡히지 않도록)
  text = text.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (_, alt, url) => `<img src="${url}" alt="${alt}">`);
  text = text.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, url) => {
    const external = /^https?:\/\//.test(url);
    const attrs = external ? ' target="_blank" rel="noopener noreferrer"' : '';
    return `<a href="${url}"${attrs}>${label}</a>`;
  });

  text = text
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/__([^_]+)__/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/_([^_]+)_/g, '<em>$1</em>');

  // 떼어 둔 인라인 코드 복원
  return text.replace(/@@CODE(\d+)@@/g, (_, idx) => codes[Number(idx)]);
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
