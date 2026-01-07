# GitHub Pages Deployment Guide

این پروژه برای GitHub Pages آماده شده است.

## تنظیمات

### 1. Repository Name
در `next.config.ts` نام repository را تنظیم کنید:
```typescript
const repoName = "iranchange-demo1"; // نام repository خود را اینجا قرار دهید
```

### 2. Build برای GitHub Pages
```bash
npm run build:static
# یا
npm run export
```

این دستور:
- فایل‌های static را در پوشه `out/` می‌سازد
- `basePath` و `assetPrefix` را برای GitHub Pages تنظیم می‌کند
- همه صفحات را به صورت static export می‌کند

### 3. Deploy به GitHub Pages

#### روش 1: GitHub Actions (توصیه می‌شود)
1. یک فایل `.github/workflows/deploy.yml` بسازید:
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build:static
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./out
```

#### روش 2: Manual Deploy
1. `npm run build:static` را اجرا کنید
2. محتوای پوشه `out/` را به branch `gh-pages` push کنید:
```bash
git subtree push --prefix out origin gh-pages
```

یا:
```bash
cd out
git init
git add .
git commit -m "Deploy to GitHub Pages"
git branch -M gh-pages
git remote add origin https://github.com/YOUR_USERNAME/iranchange-demo1.git
git push -u origin gh-pages --force
```

### 4. تنظیمات GitHub Repository
1. به Settings > Pages بروید
2. Source را روی `gh-pages` branch تنظیم کنید
3. Root directory را `/ (root)` قرار دهید

## تغییرات اعمال شده برای Static Export

### ✅ انجام شده:
- `output: "export"` در next.config.ts
- `images: { unoptimized: true }` برای static export
- `basePath` و `assetPrefix` برای GitHub Pages
- API routes به `app/api/_disabled/` منتقل شدند
- Middleware غیرفعال شد (برای static export کار نمی‌کند)
- `generateStaticParams` برای `/gift-cards/[brand]` اضافه شد

### ⚠️ محدودیت‌ها:
- API routes کار نمی‌کنند (server-side نیست)
- Middleware کار نمی‌کند
- Server-side rendering (SSR) در دسترس نیست
- همه چیز client-side است

## نکات مهم

1. **نام Repository**: اگر نام repository شما متفاوت است، حتماً در `next.config.ts` تغییر دهید
2. **Base Path**: همه لینک‌ها باید با base path کار کنند
3. **Images**: تصاویر بهینه نمی‌شوند (unoptimized)
4. **API Calls**: اگر API calls دارید، باید از external API استفاده کنید

## تست محلی

برای تست محلی با base path:
```bash
npm run build:static
npx serve out
```

سپس به `http://localhost:3000/iranchange-demo1` بروید.

