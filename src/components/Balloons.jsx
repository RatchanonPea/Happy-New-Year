import { useEffect, useRef, useState } from 'react';
import { COLORS, burst, rand } from '../lib/confetti.js';

export function makeBalloons(n = 18) {
  return Array.from({ length: n }, (_, i) => ({
    id: `${Date.now()}-${i}`,
    color: COLORS[i % COLORS.length],
    x: rand(-46, 46).toFixed(1),
    dur: rand(4.5, 7),
    delay: rand(0, 1),
    size: Math.round(rand(56, 96))
  }));
}

function Balloon({ b, onGone }) {
  const [popped, setPopped] = useState(false);
  const goneRef = useRef(onGone);
  goneRef.current = onGone;

  useEffect(() => {
    const t = setTimeout(() => goneRef.current(), (b.dur + b.delay) * 1000 + 300);
    return () => clearTimeout(t);
  }, [b]);

  function pop(ev) {
    if (popped) return;
    const r = ev.currentTarget.getBoundingClientRect();
    burst(r.left + r.width / 2, r.top + r.height / 2, 14);
    setPopped(true);
    setTimeout(() => goneRef.current(), 260);
  }

  const style = {
    '--c': b.color, '--x': `${b.x}vw`, '--d': `${b.dur.toFixed(2)}s`,
    '--delay': `${b.delay.toFixed(2)}s`, '--s': `${b.size}px`
  };
  return (
    <div className={`balloon${popped ? ' pop' : ''}`} style={style} onClick={pop}>
      <i />
    </div>
  );
}

/** ลูกโป่งลอยทับทุกหน้า คลิกเพื่อทำให้แตกได้ */
export default function Balloons({ items, onRemove }) {
  return (
    <div id="balloons" aria-hidden="true">
      {items.map((b) => <Balloon key={b.id} b={b} onGone={() => onRemove(b.id)} />)}
    </div>
  );
}
