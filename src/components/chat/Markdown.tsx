'use client';

import dynamic from 'next/dynamic';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { sanitizeUrl } from '@/lib/markdown/sanitize';
import type { BundledLanguage } from 'shiki';
import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockHeader,
  CodeBlockTitle,
  CodeBlockFilename,
} from '@/components/ai-elements/code-block';

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

    if (!lang) {
      return <code className="rounded px-1 py-0.5 bg-muted font-mono text-[0.85em]" {...rest}>{children}</code>;
    }

    if (lang === 'mermaid') {
      return <MermaidDiagram source={String(children).trim()} />;
    }

    const code = String(children).replace(/\n$/, '');

    return (
      <CodeBlock code={code} language={lang as BundledLanguage} className="my-1">
        <CodeBlockHeader>
          <CodeBlockTitle>
            <CodeBlockFilename>{lang}</CodeBlockFilename>
          </CodeBlockTitle>
          <CodeBlockActions>
            <CodeBlockCopyButton className="h-6 w-6" />
          </CodeBlockActions>
        </CodeBlockHeader>
      </CodeBlock>
    );
  },
};

export function Markdown({ source }: { source: string }) {
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        skipHtml
        components={components}
      >
        {source}
      </ReactMarkdown>
    </div>
  );
}
