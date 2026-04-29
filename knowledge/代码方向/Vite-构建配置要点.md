# Vite 构建配置要点（Astro 项目中）

## 配置文件位置

Astro 项目的 Vite 配置在 `astro.config.mjs` 的 `vite` 字段中：

```js
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: { /* dev 时依赖预构建 */ },
    build: {
      rollupOptions: { /* 生产构建 */ },
    },
  },
});
```

## 排除运行时资源（Pagefind 等）

Pagefind 是构建后工具，索引文件在 `pnpm build` 后才生成。需要在两个层面排除：

```js
vite: {
  // dev 模式：防止 Vite 尝试预构建
  optimizeDeps: {
    exclude: ['/pagefind/pagefind.js'],
  },
  // build 模式：防止 Rollup 打包
  build: {
    rollupOptions: {
      external: ['/pagefind/pagefind.js'],
    },
  },
}
```

**只配 `rollupOptions.external` 不够**，dev 模式下 Vite 仍会尝试解析。

## 动态 import 绕过 Vite 静态分析

Vite 会在编译阶段分析所有 `import()` 表达式。以下方式**无法**绕过：

- `try/catch` — 只能捕获运行时错误，编译阶段报错拦不住
- `@vite-ignore` 注释 — 某些场景无效

可靠方式：`new Function`

```ts
// ✅ 可靠：Vite 无法静态分析 new Function 内部
const mod = await new Function('return import("/pagefind/pagefind.js")')();

// ❌ 不可靠：Vite 会静态分析并报错
try {
  await import('/pagefind/pagefind.js');
} catch {}

// ❌ 不一定有效
// @vite-ignore
await import('/pagefind/pagefind.js');
```

## 构建脚本

Pagefind 需要在 Astro 构建之后运行：

```json
{
  "scripts": {
    "build": "astro build && npx pagefind --site dist"
  }
}
```

Astro 输出到 `dist/`，Pagefind 扫描 `dist/` 中的 HTML 生成搜索索引到 `dist/pagefind/`。
