/** A looping marquee whose letters ride a travelling wave. */
export function Marquee({ text }: { text: string }) {
  const chars = [...`${text}  ✺  `];
  const run = (k: number) => (
    <span className="mq-run" aria-hidden={k > 0 ? 'true' : undefined} key={k}>
      {chars.map((c, i) => (
        <span className="mq-ch" key={i} style={{ ['--i' as string]: i }}>
          {c === ' ' ? ' ' : c}
        </span>
      ))}
    </span>
  );
  return (
    <div className="marquee" role="presentation">
      <div className="mq-track">{[0, 1, 2].map(run)}</div>
    </div>
  );
}
