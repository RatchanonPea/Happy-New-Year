import { useEffect, useMemo, useRef } from 'react';
import { COLORS, prefersReduced, rand } from '../lib/confetti.js';
import { getGreetingYear } from '../lib/year.js';

/** พลุที่ยิงเองเบื้องหลัง: อนุภาคพุ่งออกเป็นวงแล้วร่วงช้า ๆ */
function useFireworks(ref) {
  useEffect(() => {
    const el = ref.current;
    const ctx = el?.getContext?.('2d');
    if (!ctx || prefersReduced()) return undefined;
    let parts = [];
    let raf = 0;
    let timer = 0;
    const fit = () => {
      const dpr = window.devicePixelRatio || 1;
      el.width = innerWidth * dpr; el.height = innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const launch = () => {
      const x = rand(innerWidth * 0.1, innerWidth * 0.9);
      const y = rand(innerHeight * 0.1, innerHeight * 0.45);
      const c = COLORS[Math.floor(rand(0, COLORS.length))];
      const n = 46;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        const v = rand(2.2, 4.4);
        parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: rand(60, 95), c });
      }
      if (!raf) raf = requestAnimationFrame(tick);
      timer = setTimeout(launch, document.body.classList.contains('is-spinning') ? rand(350, 800) : rand(1800, 3600));
    };
    function tick() {
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      parts = parts.filter((p) => p.life > 0);
      for (const p of parts) {
        p.vx *= 0.975; p.vy = p.vy * 0.975 + 0.04; p.x += p.vx; p.y += p.vy; p.life -= 1;
        ctx.globalAlpha = Math.max(0, Math.min(1, p.life / 40)) * 0.8;
        ctx.fillStyle = p.c;
        ctx.beginPath(); ctx.arc(p.x, p.y, 2.2, 0, Math.PI * 2); ctx.fill();
      }
      raf = parts.length ? requestAnimationFrame(tick) : 0;
      if (!raf) ctx.clearRect(0, 0, innerWidth, innerHeight);
    }
    fit();
    window.addEventListener('resize', fit);
    timer = setTimeout(launch, 900);
    return () => {
      window.removeEventListener('resize', fit);
      clearTimeout(timer); cancelAnimationFrame(raf);
    };
  }, [ref]);
}

/** ฉากหลังงานปีใหม่: ดาว ดวงจันทร์ ปีตัวใหญ่ โคมลอย สายไฟประดับ และพลุ */
export default function Backdrop() {
  const canvas = useRef(null);
  useFireworks(canvas);

  const stars = useMemo(() => Array.from({ length: 70 }, () => ({
    x: rand(0, 100), y: rand(0, 100), s: rand(2, 4.5), d: rand(0, 4), t: rand(2, 4.5)
  })), []);
  const lanterns = useMemo(() => Array.from({ length: 7 }, (_, i) => ({
    x: 6 + i * 14 + rand(-3, 3), s: rand(26, 44), d: rand(0, 14), t: rand(18, 30)
  })), []);
  const bulbs = useMemo(() => Array.from({ length: 28 }, (_, i) => COLORS[i % COLORS.length]), []);

  return (
    <div className="backdrop" aria-hidden="true">
      <div className="bd-year">{getGreetingYear().be}</div>
      <div className="bd-moon" />
      {stars.map((s, i) => (
        <i key={i} className="bd-star" style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.s, height: s.s, animationDelay: `${s.d}s`, animationDuration: `${s.t}s` }} />
      ))}
      {lanterns.map((l, i) => (
        <span key={i} className="bd-lantern" style={{ left: `${l.x}%`, width: l.s, height: l.s * 1.25, animationDelay: `-${l.d}s`, animationDuration: `${l.t}s` }} />
      ))}
      <canvas ref={canvas} className="bd-fireworks" />
      <div className="bd-lights">
        {bulbs.map((c, i) => <b key={i} style={{ '--c': c, animationDelay: `${(i % 7) * 0.3}s` }} />)}
      </div>
    </div>
  );
}
