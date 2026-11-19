import { copyFile, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const output = join(root, "_site");
const ownerUrl = "https://github.com/Dot7dot";
const pagesUrl = "https://dot7dot.github.io/";
const siteUrl = `${pagesUrl}Repo-Guide-for-Dotdot/`;
const siteTitle = "Dotdot 專案索引";
const siteDescription = "Dotdot 自 2026 年 10 月起的公開 GitHub 專案。探索作品用途、使用技術、架構與原始碼。";

const categories = {
  creative: "創作工具",
  play: "遊戲",
  health: "生活健康",
  learn: "學習與筆記",
  tools: "實用工具",
};

const sections = [
  ["overview", "專案簡介"],
  ["stack", "使用技術"],
  ["architecture", "架構概覽"],
  ["implementation", "詳細架構"],
  ["ideas", "未來擴充構想"],
];

const projects = JSON.parse(await readFile(join(root, "data/projects.json"), "utf8"));
projects.sort((a, b) => b.created.localeCompare(a.created));
const projectsBySlug = new Map(projects.map(project => [project.slug, project]));

if (projectsBySlug.size !== projects.length) {
  throw new Error("專案 slug 必須唯一。");
}
for (const project of projects) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(project.slug) || !Object.hasOwn(categories, project.category)) {
    throw new Error(`專案 slug 或類別無效：${project.slug}`);
  }
  for (const slug of project.related ?? []) {
    if (slug === project.slug || !projectsBySlug.has(slug)) {
      throw new Error(`${project.slug} 的相關專案無效：${slug}`);
    }
  }
}

const entities = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
const esc = value => String(value).replace(/[&<>"']/g, character => entities[character]);
const repoLink = project => `${ownerUrl}/${encodeURIComponent(project.repo)}`;
const projectPath = project => `projects/${project.slug}/`;
const dateMarkup = date => `<time datetime="${esc(date)}">${esc(date.replaceAll("-", "."))}</time>`;
const mark = '<span class="brand-mark" aria-hidden="true"><i></i><i></i><i></i><i></i></span>';
const arrow = direction => `<span class="arrow" aria-hidden="true">${direction}</span>`;

function layout({ title, description, path = "", base = "./", script = false, content }) {
  return `<!doctype html>
<html lang="zh-Hant-TW">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#f7f5ef">
  <meta name="description" content="${esc(description)}">
  <title>${esc(title)}</title>
  <link rel="canonical" href="${siteUrl}${path}">
  <link rel="icon" href="${base}icon.png" type="image/png">
  <link rel="stylesheet" href="${base}styles.css">
  ${script ? `<script src="${base}catalog.js" defer></script>` : ""}
</head>
<body id="top">
  <a class="skip-link" href="#main">跳到主要內容</a>
  <header class="site-header">
    <div class="shell header-inner">
      <a class="brand" href="${base}" aria-label="Dotdot 專案索引首頁">${mark}<span>Dotdot<span class="brand-period">.</span></span></a>
      <nav aria-label="主導覽">
        <a class="header-index" href="${base}#projects">專案索引</a>
        <a class="button button--outline" href="${ownerUrl}">GitHub ${arrow("↗")}</a>
      </nav>
    </div>
  </header>
  ${content}
  <footer class="site-footer">
    <div class="shell footer-inner">
      <span>Dotdot · 公開 GitHub 專案</span>
      <a href="#top">回到頂端 ${arrow("↑")}</a>
    </div>
  </footer>
</body>
</html>
`;
}

function projectCard(project) {
  const category = categories[project.category];
  const searchText = [
    project.title, project.repo, category, project.summary, project.intro,
    ...(project.aliases ?? []), ...project.stack.map(([name]) => name),
  ].join(" ");
  return `
      <li class="project-item" data-category="${project.category}" data-search="${esc(searchText)}">
        <a class="project-card tone-${project.category}" href="./${projectPath(project)}" aria-labelledby="title-${project.slug}">
          <div class="card-meta">
            <span class="card-category"><span class="category-mark" aria-hidden="true"></span>${category}</span>
            ${dateMarkup(project.created)}
          </div>
          <div class="card-copy">
            <h3 id="title-${project.slug}">${esc(project.title)}</h3>
            <p>${esc(project.summary)}</p>
          </div>
          <div class="card-footer">
            <ul class="tags" aria-label="主要技術">
              ${project.stack.slice(0, 2).map(([name]) => `<li>${esc(name)}</li>`).join("")}
            </ul>
            <span class="card-arrow" aria-hidden="true">→</span>
          </div>
        </a>
      </li>`;
}

function renderHome() {
  const content = `<main class="shell" id="main" tabindex="-1">
    <section class="hero" aria-labelledby="site-title">
      <div class="hero-copy">
        <p class="hero-date"><span aria-hidden="true"></span>2026 年 10 月起</p>
        <h1 id="site-title"><span class="hero-name">Dotdot<span class="hero-period">.</span></span>專案索引</h1>
        <p class="hero-description">從創作工具到遊戲與日常實驗，翻開每個專案的技術與架構。</p>
        <a class="button button--hero" href="#projects">瀏覽 ${projects.length} 個專案 ${arrow("↓")}</a>
      </div>
      <div class="hero-art" aria-hidden="true">
        <div class="mosaic">
          <div class="tile tile--arc"></div>
          <div class="tile tile--stairs"></div>
          <div class="tile tile--dots"></div>
          <div class="tile tile--ring"></div>
        </div>
      </div>
    </section>
    <section id="projects" class="catalog" aria-labelledby="catalog-title">
      <div class="catalog-heading">
        <h2 id="catalog-title">專案一覽</h2>
        <form class="search" role="search" hidden>
          <label class="visually-hidden" for="project-search">搜尋專案、技術或關鍵字</label>
          <span class="search-icon" aria-hidden="true"></span>
          <input id="project-search" name="q" type="search" placeholder="搜尋專案、技術或關鍵字" autocomplete="off">
        </form>
      </div>
      <div class="catalog-controls">
        <div class="filters" role="group" aria-label="依類別篩選" hidden>
          <button type="button" data-filter="all" aria-pressed="true">全部</button>
          ${Object.entries(categories).map(([id, name]) => `<button type="button" class="tone-${id}" data-filter="${id}" aria-pressed="false"><span aria-hidden="true"></span>${name}</button>`).join("\n          ")}
        </div>
        <p class="result-count" id="result-count" role="status">${projects.length} 個專案</p>
      </div>
      <ul class="project-grid" role="list" aria-label="專案列表">${projects.map(projectCard).join("")}
      </ul>
      <div class="empty-state" id="empty-state" hidden>
        <p>沒有符合的專案。試試其他關鍵字或類別。</p>
        <button class="button button--outline" id="reset-filters" type="button">清除篩選</button>
      </div>
    </section>
  </main>`;
  return layout({ title: siteTitle, description: siteDescription, script: true, content });
}

function fileLink(project, file) {
  const path = file.split("/").map(encodeURIComponent).join("/");
  return `<li><a href="${repoLink(project)}/blob/main/${path}"><code>${esc(file)}</code>${arrow("↗")}</a></li>`;
}

function renderDetail(project) {
  const path = projectPath(project);
  const demo = project.demo ? `<a class="button button--dark" href="${pagesUrl}${encodeURIComponent(project.repo)}/">開啟作品 ${arrow("↗")}</a>` : "";
  const related = project.related?.length ? `
          <div class="related">
            <span>相關專案</span>
            ${project.related.map(slug => `<a href="../${slug}/">${esc(projectsBySlug.get(slug).title)} ${arrow("→")}</a>`).join("")}
          </div>` : "";

  const content = `<main class="shell detail" id="main" tabindex="-1">
    <a class="back-link" href="../../#projects">${arrow("←")} 回到專案一覽</a>
    <header class="detail-hero tone-${project.category}">
      <div class="detail-meta">
        <span class="card-category"><span class="category-mark" aria-hidden="true"></span>${categories[project.category]}</span>
        <span class="detail-date">建立於 ${dateMarkup(project.created)}</span>
      </div>
      <h1>${esc(project.title)}</h1>
      <p>${esc(project.summary)}</p>
      <div class="detail-actions">
        ${demo}
        <a class="button button--outline" href="${repoLink(project)}">GitHub 原始碼 ${arrow("↗")}</a>
      </div>
    </header>
    <div class="detail-body">
      <nav class="section-nav" aria-label="詳情目錄">
        <ul>${sections.map(([id, label]) => `<li><a href="#${id}">${label}</a></li>`).join("")}</ul>
      </nav>
      <div class="detail-content">
        <section id="overview" class="detail-section">
          <h2>專案簡介</h2>
          <p>${esc(project.intro)}</p>
        </section>
        <section id="stack" class="detail-section">
          <h2>使用技術</h2>
          <dl class="stack-list">
            ${project.stack.map(([name, use]) => `<div><dt>${esc(name)}</dt><dd>${esc(use)}</dd></div>`).join("\n            ")}
          </dl>
        </section>
        <section id="architecture" class="detail-section">
          <h2>架構概覽</h2>
          <p>${esc(project.architecture)}</p>
          <ol class="flow tone-${project.category}" role="list" aria-label="資料流程">
            ${project.flow.map(step => `<li>${esc(step)}</li>`).join("")}
          </ol>${related}
        </section>
        <section id="implementation" class="detail-section">
          <h2>詳細架構</h2>
          <ul class="module-list">
            ${project.modules.map(module => `
            <li>
              <h3>${esc(module.title)}</h3>
              <p>${esc(module.description)}</p>
              <ul class="file-links" aria-label="對應原始碼">${module.files.map(file => fileLink(project, file)).join("")}</ul>
            </li>`).join("")}
          </ul>
        </section>
        <section id="ideas" class="detail-section ideas tone-${project.category}">
          <h2>未來擴充構想</h2>
          <ul>${project.ideas.map(([name, description]) => `
            <li><h3>${esc(name)}</h3><p>${esc(description)}</p></li>`).join("")}
          </ul>
        </section>
      </div>
    </div>
  </main>`;
  return layout({
    title: `${project.title} | ${siteTitle}`,
    description: project.summary,
    path,
    base: "../../",
    content,
  });
}

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await Promise.all([
  ...["styles.css", "catalog.js", "icon.png"].map(name => copyFile(join(root, "public", name), join(output, name))),
  writeFile(join(output, "index.html"), renderHome()),
  ...projects.map(async project => {
    const directory = join(output, projectPath(project));
    await mkdir(directory, { recursive: true });
    await writeFile(join(directory, "index.html"), renderDetail(project));
  }),
]);

console.log(`已產生首頁與 ${projects.length} 個專案詳情頁。`);
