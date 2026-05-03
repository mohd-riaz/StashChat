'use client';

import dynamic from 'next/dynamic';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { sanitizeUrl } from '@/lib/markdown/sanitize';
import { CodeBlock } from './CodeBlock';

const MermaidDiagram = dynamic(() => import('./MermaidDiagram'), {
  ssr: false,
  loading: () => <div className="text-xs text-muted-foreground">Loading diagram…</div>,
});

const SanitizedAnchor: NonNullable<Components['a']> = ({ href, children, ...rest }) => {
  const safe = sanitizeUrl(href);
  if (safe === '#') {
    return <a {...rest} aria-disabled href="#">{children}</a>;
  }
  return (
    <a {...rest} href={safe} target="_blank" rel="noopener noreferrer">{children}</a>
  );
};

const components: Components = {
  a: SanitizedAnchor,
  code({ className, children, ...rest }) {
    const lang = /language-(\w+)/.exec(className ?? '')?.[1];
    if (lang === 'mermaid') return <MermaidDiagram source={String(children).trim()} />;
    return <CodeBlock className={className} {...rest}>{children}</CodeBlock>;
  },
};

export function Markdown({ source }: { source: string }) {
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        skipHtml
        components={components}
      >
        {source}
      </ReactMarkdown>
    </div>
  );
}
