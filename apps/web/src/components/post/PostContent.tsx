'use client';
import { useMemo } from 'react';
import { marked } from 'marked';

interface Props {
  content: string;
}

export default function PostContent({ content }: Props) {
  const html = useMemo(() => {
    const raw = marked.parse(content, { breaks: true }) as string;
    // Basic XSS sanitization - strip script tags and event handlers
    return raw
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/\son\w+="[^"]*"/gi, '')
      .replace(/\son\w+='[^']*'/gi, '');
  }, [content]);

  return (
    <div
      className="prose-forum text-sm leading-relaxed"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
