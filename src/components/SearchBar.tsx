import { useState, useEffect, useRef } from 'react';

interface SearchResult {
  url: string;
  title: string;
  excerpt: string;
  meta?: {
    description?: string;
  };
}

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 动态加载 pagefind（仅 build 后可用，dev 模式跳过）
  useEffect(() => {
    const loadPagefind = async () => {
      try {
        // new Function 绕过 Vite 静态分析，dev 模式下 pagefind 不存在会走 catch
        // @ts-expect-error pagefind 运行时加载
        window.pagefind = await new Function('return import("/pagefind/pagefind.js")')();
      } catch {
        // dev 模式下 pagefind 索引不存在，静默跳过
      }
    };
    loadPagefind();
  }, []);

  // 搜索逻辑
  useEffect(() => {
    const search = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }

      // @ts-expect-error pagefind 运行时加载
      const pf = window.pagefind;
      if (!pf) return;

      setIsLoading(true);
      try {
        const searchResult = await pf.search(query);
        const data = await Promise.all(
          searchResult.results.slice(0, 8).map((r: { data: () => Promise<SearchResult> }) => r.data())
        );
        setResults(data);
      } catch {
        setResults([]);
      }
      setIsLoading(false);
    };

    const debounce = setTimeout(search, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Ctrl/Cmd + K 快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
        inputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      {/* 搜索按钮 */}
      <button
        onClick={() => { setIsOpen(true); setTimeout(() => inputRef.current?.focus(), 0); }}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-dark-border rounded-lg hover:border-primary-600 dark:hover:border-primary-400 transition-colors"
        aria-label="搜索"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span className="hidden sm:inline">搜索</span>
        <kbd className="hidden sm:inline text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-dark-surface px-1.5 py-0.5 rounded">
          ⌘K
        </kbd>
      </button>

      {/* 搜索弹窗 */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
          {/* 遮罩 */}
          <div className="absolute inset-0 bg-black/30 dark:bg-black/50" onClick={() => setIsOpen(false)} />

          {/* 搜索面板 */}
          <div className="relative w-full max-w-lg mx-4 bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border shadow-2xl overflow-hidden">
            <div className="flex items-center gap-3 px-4 border-b border-gray-200 dark:border-dark-border">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="搜索文章..."
                className="flex-1 py-3 bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 outline-none text-sm"
              />
              {isLoading && (
                <div className="h-4 w-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
              )}
            </div>

            {/* 搜索结果 */}
            {results.length > 0 && (
              <ul className="max-h-80 overflow-y-auto py-2">
                {results.map((result) => (
                  <li key={result.url}>
                    <a
                      href={result.url}
                      className="block px-4 py-3 hover:bg-gray-50 dark:hover:bg-dark-bg/50 transition-colors"
                    >
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {result.title}
                      </div>
                      <div
                        className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2"
                        dangerouslySetInnerHTML={{ __html: result.excerpt }}
                      />
                    </a>
                  </li>
                ))}
              </ul>
            )}

            {query.trim() && results.length === 0 && !isLoading && (
              <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                未找到相关结果
              </div>
            )}

            {!query.trim() && (
              <div className="px-4 py-8 text-center text-sm text-gray-400 dark:text-gray-500">
                输入关键词开始搜索
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
