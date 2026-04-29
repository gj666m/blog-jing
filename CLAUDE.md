# 项目：blog-jing（个人网站）

## 项目概述
综合型个人网站：博客 + 生活 + 书架 + 关于。Markdown 文件驱动内容，Astro 静态站点，部署在 VPS。

## 技术栈
- Astro 5.x（静态站点生成，岛屿架构）
- React 19.x（局部交互组件：暗色模式、评论）
- Tailwind CSS 4.x（CSS-first 配置，无 JS config 文件）
- Pagefind（全文搜索）
- Giscus（评论系统）
- Umami（访问统计，自建）

## 编码规范
- 中文注释，变量名英文
- TypeScript strict 模式
- 组件文件用 PascalCase（Header.astro, ThemeToggle.tsx）
- 页面文件用小写（index.astro, about.astro）
- Tailwind CSS 4.x：所有主题配置在 src/styles/global.css 的 @theme 块中
- React 组件仅用于需要客户端交互的部分，其余用 Astro 组件

## 常用命令
- 开发：`pnpm dev`
- 构建：`pnpm build`
- 预览：`pnpm preview`
- 包管理：`pnpm add <pkg>`

## 文档体系
- 需求分析：keyfield/2026-04-29_个人网站.md
- 方法论参考：keyfield/Claude_Code开发方法论.md
- 编码准则：keyfield/Karpathy_LLM编码准则.md
- 恢复上下文：读 keyfield/项目进度总结.md + keyfield/AI_review.md（最后3个Session）

## 关键设计决策
- 主题色：墨绿色 #059669（--color-primary-600）
- 暗色背景：#1a1a2e（--color-dark-bg）
- 页面最大宽度：1200px（--width-page）
- 内容最大宽度：800px（--width-content）
- Astro Content Collections：blog/、life/、bookshelf/ 三个集合
- 内容配置文件：src/content.config.ts（Astro 5.x 新位置）

## 工作习惯
- 大改动（3+文件）先讨论方案再动手
- 每个 Phase 完成后立即验证
- Session 结束时更新项目文档
