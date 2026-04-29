# AI Review - 决策记录

---

## Session 1 — 2026-04-29

### 背景
项目首次启动，从零搭建个人网站。已有完整需求分析文档（keyfield/2026-04-29_个人网站.md），需要初始化项目并搭建基础布局。

### 推理过程

1. **Astro 版本选择**：需求文档指定 5.x，但 `pnpm create astro@5` 实际安装了 6.x。在 package.json 中锁定 `astro@^5.18.0` 后重新安装，得到 5.18.1。
2. **Tailwind 4.x 集成方式**：不使用旧的 `@astrojs/tailwind`（适配 Tailwind 3），改用 `@tailwindcss/vite` 作为 Vite 插件。所有主题配置在 CSS 的 `@theme` 块中，不创建 `tailwind.config.js`。
3. **暗色模式实现**：在 `<head>` 中用 `is:inline` 脚本读取 localStorage + 系统偏好，在 CSS 加载前设置 `dark` 类，防止闪烁（FOUC）。
4. **移动端导航**：使用 Astro 的 `<script>` 标签（非 React），简单 toggle 即可，不需要为此引入客户端框架。

### 关键决策

| 决策 | 理由 |
|------|------|
| Astro 5.x（非 6.x） | 稳定成熟，与 Tailwind 4 集成文档完善 |
| Tailwind via @tailwindcss/vite | Tailwind 4.x 官方推荐方式，CSS-first 配置 |
| 暗色模式用 is:inline 脚本 | 防止 FOUC，必须在 CSS 加载前执行 |
| 汉堡菜单用 Astro script | 简单交互不需要 React，减少客户端 JS |

### 修改的文件

| 文件 | 操作 |
|------|------|
| `package.json` | 新建（Astro 5 + React + Tailwind 4 依赖） |
| `astro.config.mjs` | 新建（React 集成 + Tailwind Vite 插件） |
| `tsconfig.json` | 修改（添加 React JSX 配置） |
| `src/styles/global.css` | 新建（Tailwind 4 @theme + 主题色 + 排版） |
| `src/layouts/BaseLayout.astro` | 新建 |
| `src/components/Header.astro` | 新建 |
| `src/components/Footer.astro` | 新建 |
| `src/pages/index.astro` | 替换（脚手架默认 → 自定义首页） |
| `CLAUDE.md` | 新建 |
| `.gitignore` | 来自脚手架 |

### 经验总结

- `pnpm create astro` 在非空目录中无法创建，需先在临时目录创建再复制文件
- Tailwind 4.x 完全不使用 JS 配置文件，`@theme` 块中用 `--color-*` 命名空间定义颜色，自动生成工具类
- Astro 5 的 Content Collections 自动扫描 `src/content/` 下的目录并生成类型，空目录会产生警告但不影响构建

---

## Session 2 — 2026-04-29

### 背景
P1 已完成（项目初始化 + 基础布局），继续 P2：定义 Content Collections 并创建示例内容。

### 推理过程

1. **Content Collections 配置**：Astro 5 使用 `src/content.config.ts`（非旧的 `src/content/config.ts`）。使用 `glob` loader 从 Markdown 加载，`z` (zod) 定义 schema。`z.coerce.date()` 自动将 frontmatter 字符串转为 Date 对象。

### 关键决策

| 决策 | 理由 |
|------|------|
| glob loader（非 file loader） | Markdown 文件直接放在 src/content/ 下，glob 模式匹配更灵活 |
| z.coerce.date() | frontmatter 中的日期是字符串，coerce 自动转换避免手动解析 |
| draft 字段默认 false | 大部分文章是发布状态，草稿是例外 |

### 修改的文件

| 文件 | 操作 |
|------|------|
| `src/content.config.ts` | 新建（三个集合定义） |
| `src/content/blog/build-personal-website.md` | 新建 |
| `src/content/blog/typescript-tips.md` | 新建 |
| `src/content/blog/tailwind4-css-first.md` | 新建 |
| `src/content/blog/git-workflow.md` | 新建（draft: true） |
| `src/content/life/spring-hangzhou.md` | 新建 |
| `src/content/life/reading-habit.md` | 新建 |
| `src/content/life/home-cafe.md` | 新建 |
| `src/content/bookshelf/pragmatic-programmer.md` | 新建 |
| `src/content/bookshelf/warp-terminal.md` | 新建 |
| `src/content/bookshelf/astro-docs.md` | 新建 |
| `keyfield/项目进度总结.md` | 更新 |
| `keyfield/脚本开发进度.md` | 更新 |
| `keyfield/AI_review.md` | 更新 |

### 经验总结

- Astro 5 Content Collections 的 glob loader base 路径相对于项目根目录（`./src/content/blog`）
- `pnpm build` 时会自动 sync content 并生成类型定义
- 10 篇内容（4 博文 + 3 生活 + 3 书架），构建正常，无报错

---

## Session 3 — 2026-04-29

### 背景
P2 初始示例内容完成后，用户提供了自己的真实内容素材（data/ 目录），需要清空示例并用真实内容替换。

### 推理过程

1. **内容来源**：用户在 `data/` 目录下提供了学习内容（4 篇）、生活素材（1 篇原始自述）、书架内容（1 篇 AI 共创小说 GitHub 链接）
2. **内容处理策略**：
   - 学习内容 → 博文（category: 学习），需提炼润色，不是直接搬运
   - 生活素材 → 生活随笔（type: essay），用户原文比较随意，需要修饰优化叙事
   - 书架内容 → 书架纪要（type: resource），只写摘要不搬全文，链接 GitHub

### 关键决策

| 决策 | 理由 |
|------|------|
| 博文内容提炼而非搬运 | 原文是参考文档风格，博客需要更精炼、带个人视角 |
| 生活内容润色叙事 | 用户明确说"可以优化"，整理为有起承转合的短文 |
| 书架只写纪要 | 用户明确要求"不用全搬，写个大概纪要就行" |

### 修改的文件

| 文件 | 操作 |
|------|------|
| `src/content/blog/server-domain-basics.md` | 新建（从 data/学习内容 提炼润色） |
| `src/content/blog/server-deployment.md` | 新建（从 data/学习内容 提炼润色） |
| `src/content/blog/ai-collab-methodology.md` | 新建（从 data/学习内容 提炼润色） |
| `src/content/blog/ai-project-prompt-template.md` | 新建（从 data/学习内容 提炼润色） |
| `src/content/life/moving-to-shenzhen.md` | 新建（从 data/生活内容素材 润色） |
| `src/content/bookshelf/ai-novel.md` | 新建（纪要 + GitHub 链接） |
| `keyfield/项目进度总结.md` | 更新 |
| `keyfield/脚本开发进度.md` | 更新 |
| `keyfield/AI_review.md` | 更新 |

### 经验总结

- 用户内容素材放在 `data/` 目录，与 `src/content/`（构建用）分离，这个结构很好
- 内容创作需要区分"参考文档"和"博客文章"的风格差异——前者全面详尽，后者精炼有观点
- 用户的 `data/书架内容/` 文件夹后续可能有更多内容，目前只有 1 篇

---

## Session 4 — 2026-04-29

### 背景
P1-P2 已完成，继续 P3-P5 的开发。项目已从纯骨架升级为功能完整的静态站点。

### 推理过程

1. **Header 导航高亮**：当前用 `===` 精确匹配路径，详情页（如 `/blog/server-domain-basics`）不会高亮"博文"。改为首页精确匹配、其余用 `startsWith`。
2. **Pagefind 集成**：作为 devDependency 安装，build 脚本追加 `npx pagefind --site dist`。Vite 构建时会把 `/pagefind/pagefind.js` 的 import 当作模块解析导致失败，需在 `rollupOptions.external` 中排除。
3. **SearchBar 用 React**：搜索是纯客户端交互（加载 pagefind.js、监听输入、展示结果），必须用 React 的 `client:load`。采用弹窗式 UI + ⌘K 快捷键，避免页面跳转。
4. **标签系统跨集合聚合**：标签页 `/tags/[tag]` 需要从 blog/life/bookshelf 三个集合同时检索，在 `getStaticPaths` 中统一收集。
5. **Giscus 评论配置**：需要用户在 GitHub 开启 Discussions 并安装 giscus app，通过 https://giscus.app 获取 repoId/categoryId。

### 关键决策

| 决策 | 理由 |
|------|------|
| Header 高亮用 startsWith | 嵌套路由（详情页）需高亮父菜单 |
| Pagefind external 化 | 运行时资源，Vite 不应打包 |
| 搜索用弹窗而非独立页面 | 用户体验好，不离开当前页 |
| 标签跨集合聚合 | 一个标签可能同时出现在博文和生活内容中 |
| 分类筛选用 URL 参数 | 简单实现，静态页面 + 客户端过滤 |
| Giscus repoId 为空时显示提示 | 不影响构建，配置好再生效 |

### 修改的文件

| 文件 | 操作 |
|------|------|
| `src/components/Header.astro` | 修改（导航高亮 + 集成 SearchBar + ThemeToggle） |
| `src/components/PostCard.astro` | 新建 + 修改（标签改为链接） |
| `src/components/SearchBar.tsx` | 新建 |
| `src/components/ThemeToggle.tsx` | 新建 |
| `src/components/Comment.tsx` | 新建 |
| `src/layouts/PostLayout.astro` | 新建 + 修改（data-pagefind-body + 标签链接 + 评论区 + Giscus 配置） |
| `src/pages/about.astro` | 新建 |
| `src/pages/blog/index.astro` | 新建 + 修改（分类筛选） |
| `src/pages/blog/[...slug].astro` | 新建 |
| `src/pages/life/index.astro` | 新建 |
| `src/pages/life/[...slug].astro` | 新建 |
| `src/pages/bookshelf/index.astro` | 新建 |
| `src/pages/bookshelf/[...slug].astro` | 新建 |
| `src/pages/tags/index.astro` | 新建 |
| `src/pages/tags/[tag].astro` | 新建 |
| `astro.config.mjs` | 修改（pagefind external） |
| `package.json` | 修改（pagefind 依赖 + build 脚本） |
| `keyfield/项目进度总结.md` | 更新 |
| `keyfield/脚本开发进度.md` | 更新 |
| `keyfield/AI_review.md` | 更新 |

### 经验总结

- Pagefind 是构建后工具，索引 HTML 中的 `data-pagefind-body` 标记内容，不能和 Vite 打包流程混在一起
- Astro 的 `getStaticPaths` 可以在任意深度的动态路由中使用，`params` 的 key 与文件名中的方括号对应
- Giscus 配置需要：公开仓库 + Discussions 开启 + 安装 giscus GitHub App + 创建 Discussion 分类

---

## Session 5 — 2026-04-29

### 背景
P1-P5 已完成，继续 P6：集成 Umami 自建访问统计。

### 推理过程

1. **Umami 架构理解**：Umami 分服务端（需部署）和客户端（嵌入跟踪脚本）。服务端是 Node.js + 数据库，用 Docker 部署最方便。
2. **Docker 镜像源问题**：Umami 官方镜像托管在 ghcr.io（GitHub Container Registry），国内服务器下载极慢。配置了腾讯云镜像加速后发现对 ghcr.io 无效，改用 Docker Hub 上的 `umamisoftware/umami` 镜像解决。
3. **跟踪代码集成**：只需在 BaseLayout.astro 的 `<head>` 中加一行 `<script>` 标签，所有页面自动加载。
4. **HTTP vs HTTPS**：当前 Umami 服务端只有 HTTP + IP，暂不影响功能。等 P8 配好域名 + Nginx 反向代理 + SSL 后再改为 HTTPS 地址。

### 关键决策

| 决策 | 理由 |
|------|------|
| Docker Compose 部署 Umami | 一键启动（Umami + PostgreSQL），官方推荐方式 |
| 使用 Docker Hub 镜像而非 ghcr.io | 国内服务器访问 ghcr.io 极慢，Docker Hub 有国内镜像加速 |
| 跟踪代码放在 BaseLayout.astro | 所有页面共用此布局，一行代码覆盖全站 |
| 暂用 HTTP 地址 | 功能正常，等 P8 统一配 HTTPS |

### 修改的文件

| 文件 | 操作 |
|------|------|
| `src/layouts/BaseLayout.astro` | 修改（添加 Umami 跟踪脚本） |
| `keyfield/项目进度总结.md` | 更新（P6 完成） |
| `keyfield/脚本开发进度.md` | 更新（P6 完成） |
| `keyfield/AI_review.md` | 更新（Session 5） |

### 服务器端操作（非代码）

| 操作 | 说明 |
|------|------|
| `~/umami/docker-compose.yml` | 创建 Umami + PostgreSQL 容器配置 |
| `/etc/docker/daemon.json` | 配置 Docker 镜像加速 |
| 腾讯云防火墙 | 放行 TCP 3000 端口 |
| Umami 后台 | 改密码 + 添加网站（website-id: ec385802-...） |

### 经验总结

- 用户对服务器操作不太熟悉，需要把每一步拆成单条命令逐步引导
- `cat > file << 'EOF'` 在用户终端容易出问题（粘贴时提前触发），`nano` 编辑器更可靠
- ghcr.io 在国内服务器基本不可用，部署第三方服务时要优先考虑 Docker Hub 镜像

---

## Session 6 — 2026-04-29

### 背景
P1-P6 已完成，继续 P7：视觉打磨 + 响应式。站点功能完整但视觉粗糙——无响应式网格、无卡片动效、移动菜单无动画。

### 推理过程

1. **全局动画基础设施**：在 global.css 的 @theme 块定义动画 token（--animate-float 等），外部定义 @keyframes。body 加 transition 实现暗色模式切换平滑过渡。
2. **卡片悬浮效果**：用 Tailwind 工具类（hover:-translate-y-1 hover:shadow-md transition-all duration-300）而非 CSS keyframes，更简洁且 GPU 加速。
3. **响应式网格**：所有列表页从 `grid gap-4` 改为 `grid gap-6 sm:grid-cols-2`，移动端单列、640px+ 双列。
4. **移动菜单动画**：从 `hidden` toggle 改为 `max-height` + `opacity` + `transition-all duration-300`，实现平滑展开收起。
5. **阅读时间**：通过 `Astro.slots.render('default')` 获取文章 HTML，去除标签后按中文 400 字/分钟计算。
6. **返回顶部按钮**：用 Astro `<script>` 实现而非 React 组件，避免 hydration 开销。
7. **标签云分层**：按 tag 数量分 3 级尺寸（≥5 大、≥3 中、<3 小），增加视觉趣味。

### 关键决策

| 决策 | 理由 |
|------|------|
| Tailwind 工具类做 hover 动画 | 比 @keyframes 更简洁，GPU 加速 |
| sm:grid-cols-2 双列 | 参考站 jiangmiemie.com 也用简单双列，不过度设计 |
| Astro script 做返回顶部 | 简单交互不需要 React，减少客户端 JS |
| max-height 动画替代 hidden toggle | 更流畅的用户体验 |

### 修改的文件

| 文件 | 操作 |
|------|------|
| `src/styles/global.css` | 修改（@keyframes + 动画 token + 暗色过渡 + ::selection + scroll） |
| `src/components/PostCard.astro` | 修改（hover 动效 + 8px 圆角 + coverImage 条件渲染） |
| `src/components/Header.astro` | 修改（移动菜单 max-height 动画 + 汉堡按钮 hover） |
| `src/components/Footer.astro` | 修改（增加间距 + GitHub 链接修正） |
| `src/pages/index.astro` | 修改（装饰线 + 按钮 shadow） |
| `src/pages/about.astro` | 修改（装饰线 + 联系方式卡片） |
| `src/pages/blog/index.astro` | 修改（响应式网格 + 空状态图标） |
| `src/pages/life/index.astro` | 修改（响应式网格 + 空状态图标） |
| `src/pages/bookshelf/index.astro` | 修改（响应式网格 + 空状态图标） |
| `src/pages/tags/index.astro` | 修改（标签大小分层 + 空状态图标） |
| `src/pages/tags/[tag].astro` | 修改（响应式网格） |
| `src/layouts/PostLayout.astro` | 修改（阅读时间 + blockquote 左边框 + 链接下划线） |
| `src/layouts/BaseLayout.astro` | 修改（返回顶部按钮 + theme-color meta） |
| `public/favicon.svg` | 替换（墨绿色圆角 J 图标） |
| `keyfield/项目进度总结.md` | 更新（P7 完成） |
| `keyfield/AI_review.md` | 更新（Session 6） |

### 经验总结

- PostCard 新增 coverImage 模板变量时，必须同时在 Props 解构中添加，否则构建报 `xxx is not defined`
- Tailwind 4.x 的 prose modifier 语法：`prose-blockquote:border-l-primary-600` 可以直接在 class 中使用
- `Astro.slots.render('default')` 返回 HTML 字符串，需要 `.replace(/<[^>]*>/g, '')` 去除标签后才能计算纯文本长度

---

## Session 7 — 2026-04-29

### 背景
P7 已完成，继续 P8：VPS 部署 + HTTPS + 域名。

### 推理过程

1. **域名选择**：用户注册了 `blog.gjinggg.art` 作为子域名，主域名 `gjinggg.art` 需要备案。
2. **部署方式选择**：比较了 rsync 直推和 GitHub Actions 两种方案。先用 rsync 快速部署，后续可加 GitHub Actions 自动化。
3. **端口冲突**：用户 VPS 跑了多个项目，不能直接用 80 端口。备案前临时用 8080 端口访问。
4. **Nginx 软链接问题**：`ln -sf` 创建软链接时因权限问题未生效，手动重新创建后解决。
5. **备案要求**：国内服务器（腾讯云大陆节点）绑定域名需先完成 ICP 备案，主域名备案一次所有子域名生效。

### 关键决策

| 决策 | 理由 |
|------|------|
| rsync 直推部署 | 简单快速，后续可加 GitHub Actions |
| 临时 8080 端口 | 备案前域名不可用，需用端口区分多项目 |
| Nginx 配置 gzip + 缓存 | 静态资源 30 天缓存，HTML 不缓存 |
| 先部署后备案 | 备案期间用 IP:8080 访问，不影响开发和验证 |

### 修改的文件

| 文件 | 操作 |
|------|------|
| `astro.config.mjs` | 修改（添加 site: 'https://blog.gjinggg.art'） |
| `src/pages/rss.xml.ts` | 新建（RSS 订阅） |
| `src/layouts/BaseLayout.astro` | 修改（RSS 自动发现 link） |
| `deploy/nginx.conf` | 新建（Nginx 配置模板） |
| `deploy/deploy.sh` | 新建（rsync 部署脚本，ubuntu 用户 + 临时目录中转） |
| `keyfield/备案通过后操作.md` | 新建（备案后操作指南） |
| `keyfield/项目进度总结.md` | 更新（P8 进行中） |
| `keyfield/AI_review.md` | 更新（Session 7） |

### 服务器端操作

| 操作 | 说明 |
|------|------|
| DNS 解析 | A 记录：blog → 106.52.244.190 |
| Nginx 配置 | /etc/nginx/sites-available/blog-jing，listen 8080 |
| 防火墙 | 腾讯云放行 TCP 8080 |
| 首次部署 | deploy.sh 执行成功，http://106.52.244.190:8080 可访问 |

### 经验总结

- 多项目共享 VPS 时，备案前用非标准端口区分站点
- `sudo ln -sf` 创建软链接需确认 sites-enabled 目录实际生效，`ls -la` 检查
- rsync 用非 root 用户时，先传到 /tmp 再 `sudo cp` 到目标目录，避免权限问题
- 国内域名备案需 1-2 周，备案通过后才能配 SSL + 域名访问
