import source from '../wordpress.md?raw';
import './style.css';

function parseMeta(src) {
  const header = src.match(/^<!--\s*([\s\S]*?)-->/);
  const block = header?.[1] ?? '';
  const title = block.match(/Title:\s*(.+)/)?.[1]?.trim() ?? 'Still';
  const subtitle = block.match(/Subtitle:\s*(.+)/)?.[1]?.trim() ?? '';
  const tags = (block.match(/Tags:\s*(.+)/)?.[1] ?? '')
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
  return { title, subtitle, tags };
}

function gutenbergToHtml(src) {
  let html = src.replace(/^<!--[\s\S]*?-->\s*/, '');
  html = html.replace(/<!--\s*\/?wp:[^>]*-->/g, '');
  html = html.replace(
    /<!--\s*\[(VIDEO|IMAGE)[^\]]*:\s*([^\]]*)\]\s*-->/gi,
    (_, kind, label) =>
      `<div class="media-slot media-slot--${kind.toLowerCase()}"><span>${kind}</span>${label.trim()}</div>`,
  );
  html = html.replace(
    /<pre class="wp-block-code"><code>/g,
    '<pre class="wp-block-prismatic-blocks"><code class="language-javascript">',
  );
  return html;
}

function pullDemoLinks(html) {
  const demo = html.match(/href="([^"]+)"[^>]*>Live Demo<\/a>/i);
  const code = html.match(/href="([^"]+)"[^>]*>Source Code<\/a>/i);
  const cleaned = html
    .replace(/<p>\s*<a href="[^"]+">Live Demo<\/a>\s*<\/p>/i, '')
    .replace(/<p>\s*<a href="[^"]+">Source Code<\/a>\s*<\/p>/i, '');
  return {
    html: cleaned,
    demoHref: demo?.[1] ?? 'DEMO_URL',
    codeHref: code?.[1] ?? 'https://github.com/momentchan/r3f-akira',
  };
}

function render(src) {
  const { title, subtitle, tags } = parseMeta(src);
  document.title = `${title} | Codrops`;
  const pulled = pullDemoLinks(gutenbergToHtml(src));
  const tagHtml = tags
    .map((tag) => `<a href="#">${tag}</a>`)
    .join(' ');

  document.getElementById('post').innerHTML = `
    <header>
      <div class="ct-kicker entry-meta">
        <div class="ct-kicker__author">
          <span class="byline author vcard">
            By <a href="https://tympanus.net/codrops/author/mingjyunhung/">Ming Jyun Hung</a>
          </span>
          in
          <a href="https://tympanus.net/codrops/category/articles/">Articles</a> on
          <time class="ct-kicker__date">Preview</time>
        </div>
      </div>
      <h1>${title}</h1>
      ${subtitle ? `<div class="ct-lead"><p>${subtitle}</p></div>` : ''}
      <p class="ct-post-tags">${tagHtml}</p>
    </header>
    <div class="ct-post-content">
      <div class="ct-demo-buttons">
        <a class="ct-demo-button ct-demo-button--demo" target="_blank" href="${pulled.demoHref}">Demo</a>
        <a class="ct-demo-button ct-demo-button--github" target="_blank" href="${pulled.codeHref}">Code</a>
      </div>
      ${pulled.html}
    </div>
  `;
}

render(source);

if (import.meta.hot) {
  import.meta.hot.accept('../wordpress.md?raw', (mod) => {
    if (mod?.default) render(mod.default);
  });
}
