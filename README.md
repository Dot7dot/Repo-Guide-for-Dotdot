# Repo-Guide-for-Dotdot

Dotdot 自 2026 年 10 月起建立的公開 GitHub 專案索引。每個專案有簡介、技術用途、資料流程、模組原始碼和未來擴充構想。

[瀏覽 GitHub Pages](https://dot7dot.github.io/Repo-Guide-for-Dotdot/)

## 本機預覽

使用 Node.js 20 以上版本。建置不需要安裝套件。

```sh
node scripts/build.mjs
python3 -m http.server 8000 --directory _site
```

在瀏覽器開啟 <http://localhost:8000/>。

## 更新專案

在 `data/projects.json` 新增或編輯項目。建立日期採 GitHub repo 的 `created_at`（UTC），首頁依日期新到舊排列。沿用既有的 `slug` 可保留詳情網址。模組的 `files` 欄位填寫原始 repo 的 `main` 分支路徑。確認該 repo 的 GitHub Pages 可開啟後，可設定 `"demo": true` 顯示作品按鈕。

`scripts/build.mjs` 將資料和 `public/` 資產輸出到 `_site/`。在 GitHub 的 **Settings → Pages** 使用 **GitHub Actions** 作為來源。推送至 `main` 後，`.github/workflows/pages.yml` 會建置並發布網站。
