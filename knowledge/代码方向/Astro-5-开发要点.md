# Astro 5.x 开发要点

## 项目初始化

- `pnpm create astro@5` 可能实际安装 6.x，需在 package.json 中锁定版本如 `astro@^5.18.0` 后重新安装
- 在非空目录中无法用 `create astro`，需先在临时目录创建再复制文件
- minimal 模板最干净，适合自定义项目

## Content Collections（内容集合）

- Astro 5 的配置文件位置：`src/content.config.ts`（注意不是旧的 `src/content/config.ts`）
- 使用 `glob` loader 从 Markdown 加载，`z`（zod）定义 schema
- glob loader base 路径相对于项目根目录：`./src/content/blog`
- `z.coerce.date()` 自动将 frontmatter 字符串转为 Date 对象
- `pnpm build` 时自动 sync content 并生成类型定义
- 空目录会产生警告但不影响构建

```ts
// src/content.config.ts 示例
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    tags: z.array(z.string()).optional(),
    category: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});
```

## 页面路由

- 动态路由文件名用方括号：`[...slug].astro`（catch-all）、`[tag].astro`（单参数）
- `getStaticPaths` 必须返回 `{ params, props }` 数组，params 的 key 与文件名中的方括号对应
- 可以在任意深度的动态路由中使用

## 布局与组件

- `.astro` 文件是服务端组件，不发送 JS 到客户端
- `<script is:inline>` 中的代码原样输出到 HTML，不经过 Vite 处理
- `<script>` 标签（不带 is:inline）会被 Astro 处理和打包
- Props 接口用 TypeScript 定义在 frontmatter 区域
- 组件文件用 PascalCase（Header.astro），页面文件用小写（index.astro）

## 暗色模式防闪烁（FOUC）

- 在 `<head>` 中用 `is:inline` 脚本读取 localStorage + 系统偏好
- 必须在 CSS 加载前设置 `dark` 类，否则页面会先闪白再变暗

```html
<script is:inline>
  const theme = localStorage.getItem('theme');
  if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
  }
</script>
```

## 简单交互用 Astro script

- 汉堡菜单 toggle、返回顶部按钮等简单交互不需要 React
- 用 Astro `<script>` 标签即可，减少客户端 JS 体积

## 文章阅读时间计算

- 通过 `Astro.slots.render('default')` 获取文章 HTML
- 用 `.replace(/<[^>]*>/g, '')` 去除标签后计算纯文本长度
- 中文按 400 字/分钟估算

## RSS 订阅

- 使用 `@astrojs/rss` 包
- 需要在 `astro.config.mjs` 中配置 `site` 字段
- 在 `<head>` 中添加 `<link rel="alternate">` 实现自动发现

```ts
// src/pages/rss.xml.ts
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context: { site: URL }) {
  const posts = await getCollection('blog');
  return rss({
    title: 'Jing 的博客',
    description: '记录学习、工作与生活',
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      link: `/blog/${post.id}`,
    })),
  });
}
```
