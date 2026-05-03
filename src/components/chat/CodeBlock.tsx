'use client';

import { useState, type ComponentProps } from 'react';
import { Check, Copy } from 'lucide-react';

type Props = ComponentProps<'code'>;

export function CodeBlock({ className, children, ...rest }: Props) {
  const [copied, setCopied] = useState(false);
  const isBlock = (className ?? '').startsWith('language-');

  if (!isBlock) {
    return <code className={className} {...rest}>{children}</code>;
  }

  const text = String(children);
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* clipboard denied — silent */ }
  };

  return (
    <div className="relative group">
      <pre className="overflow-x-auto rounded-md border bg-muted p-3 text-sm">
        <code className={className} {...rest}>{children}</code>
      </pre>
      <button
        type="button"
        onClick={onCopy}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity rounded-md border bg-background p-1.5 text-xs"
        aria-label="Copy code"
      >
        {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      </button>
    </div>
  );
}
