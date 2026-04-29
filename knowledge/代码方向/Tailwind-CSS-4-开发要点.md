# Tailwind CSS 4.x 开发要点

## 核心变化（对比 3.x）

- **无 `tailwind.config.js`**：所有配置在 CSS 文件的 `@theme` 块中
- **集成方式不同**：用 `@tailwindcss/vite` 作为 Vite 插件，不用旧的 `@astrojs/tailwind`
- **导入方式**：CSS 文件顶部 `@import "tailwindcss"`
- **插件系统**：用 `@plugin` 指令加载插件，如 `@plugin "@tailwindcss/typography"`

## 主题配置（@theme 块）

- 颜色用 `--color-*` 命名空间定义，自动生成工具类
- 例如 `--color-primary-600: #059669` 会生成 `bg-primary-600`、`text-primary-600` 等
- oklch 色彩空间可以和十六进制混用

```css
@import "tailwindcss";
@plugin "@tailwindcss/typography";

@theme {
  /* 颜色 */
  --color-primary-600: #059669;
  --color-dark-bg: #1a1a2e;

  /* 布局宽度 */
  --width-content: 800px;
  --width-page: 1200px;

  /* 动画 */
  --animate-float: hover-float 0.3s ease-out;
}
```

## 暗色模式（重要！）

**Tailwind 4 默认用 `prefers-color-scheme: dark` 媒体查询，不是 `.dark` 类！**

如果要用 class-based 暗色模式（手动切换），必须添加：

```css
@custom-variant dark (&:where(.dark, .dark *));
```

不加这行，所有 `dark:` 前缀的工具类都不会响应 `.dark` 类切换。

## 常用工具类模式

### 卡片 hover 效果
```html
<div class="shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
```

### 响应式网格
```html
<!-- 移动端单列，640px+ 双列 -->
<div class="grid gap-6 sm:grid-cols-2">
```

### 暗色模式平滑过渡
```css
body {
  transition: background-color 0.2s, color 0.2s;
}
```

### prose 排版修饰符
```html
<!-- Tailwind 4 中 prose 的修饰符语法 -->
<div class="prose prose-blockquote:border-l-primary-600">
```

### 标签/徽章样式
```html
<span class="text-xs px-2 py-0.5 rounded-md bg-gray-50 dark:bg-dark-border
  text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-gray-600">
  #标签
</span>
```

### 选中文本颜色
```css
::selection {
  background-color: var(--color-primary-100);
  color: var(--color-primary-600);
}
```
