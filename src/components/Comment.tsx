import { useEffect, useRef } from 'react';

interface Props {
  // Giscus 配置，从 https://giscus.app 获取
  repo: string;
  repoId: string;
  category: string;
  categoryId: string;
  mapping?: string;
  theme?: string;
}

export default function Comment({
  repo,
  repoId,
  category,
  categoryId,
  mapping = 'pathname',
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.setAttribute('data-repo', repo);
    script.setAttribute('data-repo-id', repoId);
    script.setAttribute('data-category', category);
    script.setAttribute('data-category-id', categoryId);
    script.setAttribute('data-mapping', mapping);
    script.setAttribute('data-strict', '0');
    script.setAttribute('data-reactions-enabled', '1');
    script.setAttribute('data-emit-metadata', '0');
    script.setAttribute('data-input-position', 'top');
    script.setAttribute('data-lang', 'zh-CN');
    script.setAttribute('data-loading', 'lazy');
    script.setAttribute('data-theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
    script.crossOrigin = 'anonymous';
    script.async = true;

    ref.current.innerHTML = '';
    ref.current.appendChild(script);
  }, [repo, repoId, category, categoryId, mapping]);

  return <div ref={ref} />;
}
