import type { ElementType } from 'react';

/** Giant display word split into letters; each letter rolls over on hover. */
export function SpacedTitle({ text, as: Tag = 'h1', className = '' }: { text: string; as?: ElementType; className?: string }) {
  return (
    <Tag className={`spaced ${className}`} aria-label={text}>
      {[...text].map((ch, i) => (
        <span className="ch" key={i} aria-hidden="true" data-ch={ch}>
          <span className="ch-in">{ch === ' ' ? ' ' : ch}</span>
        </span>
      ))}
    </Tag>
  );
}
