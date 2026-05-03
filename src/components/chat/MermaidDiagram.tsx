'use client';

import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({ startOnLoad: false, securityLevel: 'strict', theme: 'default' });

export default function MermaidDiagram({ source }: { source: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const id = `mermaid-${Math.random().toString(36).slice(2, 9)}`;
    mermaid.render(id, source)
      .then(({ svg }) => {
        if (cancelled || !ref.current) return;
        // eslint-disable-next-line react/no-danger -- audited: mermaid securityLevel='strict' sanitizes output
        ref.current.innerHTML = svg;
      })
      .catch((e) => !cancelled && setError(e?.message ?? 'Failed to render diagram'));
    return () => { cancelled = true; };
  }, [source]);

  if (error) {
    return (
      <pre className="text-xs text-destructive overflow-x-auto p-2 border rounded">
        Mermaid error: {error}
        {'\n\n'}
        {source}
      </pre>
    );
  }
  return <div ref={ref} className="my-2 overflow-x-auto" />;
}
