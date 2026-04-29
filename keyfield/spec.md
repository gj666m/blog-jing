# 技术规范文档（spec）

> 最后更新：2026-04-29
> 需求来源：keyfield/2026-04-29_个人网站.md

---

## 1. 项目概述

### 目标
搭建综合型个人网站，以 Markdown 文件驱动内容，记录学习历程、工作经历与生活内容。

### 核心逻辑
```
用户编写 Markdown → 推送到 Git 仓库 → Astro 构建静态页面 → 部署到 VPS → 访客浏览
```

### 数据流
```
Markdown 文件（src/content/）
  → Astro Content Collections 解析
  → 按模块/标签/分类生成静态页面
  → Pagefind 构建搜索索引
  → 构建产物输出到 dist/
  → 部署到 VPS Nginx
```

---

## 2. 技术栈选型

| 决策点 | 选择 | 理由 |
|--------|------|------|
| 框架 | Astro 5.x | 静态站点生成，性能优秀，Markdown 原生支持，岛屿架构 |
| 交互组件 | React 19 | Astro 支持多框架，React 生态丰富，用于暗色模式/评论等交互 |
| 样式 | Tailwind CSS 4.x | CSS-first 配置，原子化，响应式方便，墨绿主题 |
| 搜索 | Pagefind | 构建时生成索引，无需外部服务 |
| 评论 | Giscus | 基于 GitHub Discussions，免费无广告 |
| 统计 | Umami（自建） | 开源、隐私友好、轻量 |
| 部署 | VPS + Nginx + Let's Encrypt | 用户自有 VPS（腾讯云） |
| 包管理 | pnpm | 速度快、磁盘占用小 |

---

## 3. 目录结构

```
blog-jing/
├── astro.config.mjs          # Astro 配置（React 集成 + Tailwind Vite 插件）
├── tsconfig.json              # TypeScript strict + React JSX
├── package.json
├── CLAUDE.md                  # 项目常驻指令
├── public/                    # 静态资源（直接复制到 dist/）
│   ├── fonts/
│   └── images/
├── src/
│   ├── components/            # 可复用组件（.astro / .tsx）
│   ├── layouts/               # 页面布局
│   ├── pages/                 # 路由（文件即路由）
│   │   ├── index.astro        # 首页
│   │   ├── about.astro        # 关于
│   │   ├── blog/              # 博文列表 + 详情
│   │   ├── life/              # 生活列表 + 详情
│   │   └── bookshelf/         # 书架列表 + 详情
│   ├── content/               # Markdown 内容
│   │   ├── content.config.ts  # Content Collections 定义
│   │   ├── blog/
│   │   ├── life/
│   │   └── bookshelf/
│   └── styles/
│       └── global.css         # Tailwind 4 @theme + 全局排版
└── keyfield/                  # 项目文档体系
```

---

## 4. 配置文件规范

### astro.config.mjs
- React 通过 `@astrojs/react` 集成（integrations 数组）
- Tailwind 通过 `@tailwindcss/vite` 作为 Vite 插件（vite.plugins 数组）
- **不要**使用 `@astrojs/tailwind`（仅适配 Tailwind 3.x）

### Tailwind CSS 4.x
- **不创建** `tailwind.config.js`
- 所有主题配置在 `src/styles/global.css` 的 `@theme` 块中
- 颜色用 `--color-*` 命名空间，自动生成 `bg-*`、`text-*`、`border-*` 等工具类
- 插件通过 `@plugin` 指令加载（如 `@plugin "@tailwindcss/typography"`）

### Content Collections（P2）
- 配置文件位置：`src/content.config.ts`（Astro 5.x 新位置，不是旧的 `src/content/config.ts`）
- 三个集合：blog、life、bookshelf
- 使用 `glob()` loader 从 Markdown 文件加载

---

## 5. 模块设计

### 5.1 布局模块

| 组件 | 职责 | 关键特性 |
|------|------|---------|
| BaseLayout.astro | 基础 HTML 骨架 | `<html lang="zh-CN">`、暗色模式防闪烁脚本、flex 布局、引入 Header/Footer |
| Header.astro | 顶部导航 | 粘性定位、桌面水平导航 + 移动端汉堡菜单、当前页高亮 |
| Footer.astro | 页脚 | 版权信息、GitHub 链接、响应式 |

### 5.2 页面模块

| 路由 | 页面文件 | 说明 |
|------|---------|------|
| `/` | `pages/index.astro` | 首页：个人介绍 + 最近更新 |
| `/blog` | `pages/blog/index.astro` | 博文列表（P3） |
| `/blog/:slug` | `pages/blog/[...slug].astro` | 博文详情（P3） |
| `/life` | `pages/life/index.astro` | 生活列表（P3） |
| `/life/:slug` | `pages/life/[...slug].astro` | 生活详情（P3） |
| `/bookshelf` | `pages/bookshelf/index.astro` | 书架列表（P3） |
| `/bookshelf/:slug` | `pages/bookshelf/[...slug].astro` | 书架详情（P3） |
| `/about` | `pages/about.astro` | 关于页（P3） |

### 5.3 内容模型（Content Collections）

```typescript
// 博文
interface BlogPost {
  title: string;
  description: string;
  pubDate: Date;
  updatedDate?: Date;
  tags: string[];
  category: string;       // 技术/学习/工作
  coverImage?: string;
  draft?: boolean;
}

// 生活
interface LifePost {
  title: string;
  description: string;
  pubDate: Date;
  tags: string[];          // 旅行/日常/感悟
  type: 'essay' | 'photo' | 'travel';
  images?: string[];
  location?: string;
}

// 书架
interface BookshelfItem {
  title: string;
  description: string;
  pubDate: Date;
  tags: string[];          // 编程/设计/随笔
  type: 'book' | 'tool' | 'resource';
  rating?: number;         // 1-5
  link?: string;
}
```

### 5.4 交互组件（React，P5）

| 组件 | 职责 |
|------|------|
| ThemeToggle.tsx | 暗色模式切换（localStorage 持久化 + 系统偏好跟随） |
| Comment.tsx | Giscus 评论（基于 GitHub Discussions） |

---

## 6. 视觉设计规范

| 属性 | 值 |
|------|---|
| 主题色 | 墨绿色 #059669（`--color-primary-600`） |
| 暗色背景 | #1a1a2e（`--color-dark-bg`） |
| 页面最大宽度 | 1200px（`--width-page`） |
| 内容最大宽度 | 800px（`--width-content`） |
| 正文字号 | 16px |
| 行高 | 1.75 |
| 字体栈 | -apple-system, "Noto Sans SC", sans-serif |
| 圆角 | 8px |
| 响应式断点 | sm: 640px（导航折叠） |

---

## 7. Phase 实施计划

| Phase | 目标 | 验证方式 | 依赖 |
|-------|------|---------|------|
| P1 | 初始化 + 基础布局 | ✅ `pnpm dev` 看到带导航的基础页面 | 无 |
| P2 | Content Collections | 测试 Markdown 被正确解析渲染 | P1 |
| P3 | 页面路由 | 各路由可访问，详情页正确渲染 | P2 |
| P4 | 搜索 + 标签分类 | Pagefind 搜索可用，标签过滤正常 | P3 |
| P5 | 交互功能 | 暗色模式切换、评论加载正常 | P3 |
| P6 | Umami 统计 | 后台能看到访问数据 | P1 |
| P7 | 视觉打磨 | 移动端/桌面端显示正常，Lighthouse > 90 | P3-P5 |
| P8 | VPS 部署 | HTTPS 域名访问正常 | P7 |

---

## 8. 已知限制与后续优化

- RSS 功能待实现（Astro 官方支持 `@astrojs/rss`）
- 图片优化待配置（Astro 内置 `<Image>` 组件，P7 处理）
- CI/CD 自动部署待配置（P8 可考虑 GitHub Actions + rsync）
