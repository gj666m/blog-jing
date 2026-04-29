# React 在 Astro 中的使用

## 何时用 React

Astro 默认不发送 JS 到客户端（零 JS）。只在需要客户端交互时引入 React：

| 交互类型 | 方案 |
|----------|------|
| 搜索框（动态加载、实时过滤） | React `client:load` |
| 暗色模式切换（状态管理） | React `client:load` |
| 评论系统（加载第三方脚本） | React `client:load` |
| 汉堡菜单 toggle | Astro `<script>` |
| 返回顶部按钮 | Astro `<script>` |
| 移动菜单动画 | CSS + Astro `<script>` |

原则：**能用 Astro script 解决的，不引入 React。**

## 客户端指令

```astro
<!-- 页面加载时立即 hydrate -->
<SearchBar client:load />

<!-- 仅在进入视口时 hydrate（节省带宽） -->
<HeavyComponent client:visible />

<!-- 仅在空闲时 hydrate -->
<Analytics client:idle />
```

搜索和主题切换这类用户可能立即使用的组件，用 `client:load`。

## 暗色模式切换组件

关键点：
- 初始状态从 `document.documentElement.classList.contains('dark')` 读取（与 BaseLayout 的 `is:inline` 脚本一致）
- 切换时同步更新 DOM 类名 + localStorage
- 用 `useEffect` 读取初始状态（服务端渲染时 `document` 不存在）

```tsx
const [isDark, setIsDark] = useState(false);

useEffect(() => {
  setIsDark(document.documentElement.classList.contains('dark'));
}, []);

const toggle = () => {
  const next = !isDark;
  setIsDark(next);
  document.documentElement.classList.toggle('dark', next);
  localStorage.setItem('theme', next ? 'dark' : 'light');
};
```

## Giscus 评论组件

- 动态创建 `<script>` 标签加载 Giscus
- 通过 `<giscus-widget>` 自定义元素渲染
- 前置条件：公开仓库 + 开启 Discussions + 安装 giscus GitHub App + 创建 Discussion 分类

## 注意事项

- React 组件中不能用 Astro 的 `Astro.props` 等服务端 API
- Props 通过 Astro 模板传入，类型需在两端保持一致
- 组件文件用 PascalCase：`SearchBar.tsx`、`ThemeToggle.tsx`
