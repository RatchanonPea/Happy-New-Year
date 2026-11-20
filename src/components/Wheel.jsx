import { useEffect, useRef } from 'react';
import { prefersReduced } from '../lib/confetti.js';
import {
  IDLE_DEG_PER_MS, SPIN_MS, landingAngle, segmentColor, segmentPath, truncate
} from '../lib/wheel.js';

/**
 * วงล้อ: mode 'idle' = หมุนช้า ๆ ระหว่างรอ, 'spin' = เร่งจากมุมปัจจุบันแล้วชะลอไปหยุดที่ winnerIndex
 * ควบคุมมุมด้วยโค้ดโดยตรง (ไม่ใช้ CSS animation) เพื่อให้เริ่มหมุนต่อเนื่องและไม่ข้ามจังหวะ transition
 */
export default function Wheel({ items, winnerIndex, mode, xl = false, compact = false }) {
  const n = items.length;
  const disc = useRef(null);
  const pointer = useRef(null);
  const bulbs = useRef(null);
  const wheelEl = useRef(null);
  const angle = useRef(0);

  useEffect(() => {
    const el = disc.current;
    if (!el) return undefined;

    if (mode === 'spin') {
      const cur = angle.current;
      el.style.transition = 'none';
      el.style.transform = `rotate(${cur}deg)`;
      void el.offsetWidth; // บังคับให้เบราว์เซอร์ commit มุมเริ่มต้นก่อน ไม่งั้น transition จะไม่เล่น
      const total = landingAngle(n, winnerIndex, Math.random() - 0.5, cur);
      el.style.transition = `transform ${SPIN_MS}ms cubic-bezier(.4, 0, .05, 1)`;
      el.style.transform = `rotate(${total}deg)`;

      // ติ๊กทุกครั้งที่ช่องผ่านเข็ม: อ่านมุมจริงจาก computed style เข็มจึงสะบัดเร็วตอนต้นและช้าลงตอนใกล้หยุด
      const seg = 360 / n;
      let raf = 0;
      let lastIdx = -1;
      let prevDeg = null;
      let prevT = 0;
      let speed = 0;   // องศา/วินาที (กรองให้นิ่ง)
      let phase = 0;   // ตำแหน่งไฟวิ่ง 0..1 รอบวง
      const kids = bulbs.current ? [...bulbs.current.children] : [];
      const tick = (t) => {
        const m = new DOMMatrixReadOnly(getComputedStyle(el).transform);
        const deg = (Math.atan2(m.b, m.a) * 180) / Math.PI;
        const idx = Math.floor((((-deg % 360) + 360) % 360) / seg);
        if (lastIdx !== -1 && idx !== lastIdx && pointer.current?.animate) {
          pointer.current.animate(
            [{ rotate: '0deg' }, { rotate: '-24deg' }, { rotate: '0deg' }],
            { duration: 140, easing: 'ease-out' }
          );
        }
        lastIdx = idx;

        // ไฟวิ่งตามความเร็วจริงของวงล้อ: วงล้อช้าลง ไฟก็ช้าลงตาม
        if (prevDeg !== null) {
          const dt = Math.max(1, t - prevT);
          const d = ((deg - prevDeg + 540) % 360) - 180;
          speed += ((Math.abs(d) / dt) * 1000 - speed) * 0.15;
          phase = (phase + (speed / 360) * 0.7 * (dt / 1000)) % 1;
          const level = Math.min(1, speed / 700);
          wheelEl.current?.style.setProperty('--spd', level.toFixed(3));
          kids.forEach((k, i) => {
            const ph = ((i / kids.length - phase) % 1 + 1) % 1;
            k.style.setProperty('--lit', (ph < 0.3 ? 1 - ph / 0.3 : 0).toFixed(2));
          });
        }
        prevDeg = deg;
        prevT = t;
        raf = requestAnimationFrame(tick);
      };
      if (!prefersReduced() && typeof DOMMatrixReadOnly !== 'undefined') raf = requestAnimationFrame(tick);
      return () => {
        cancelAnimationFrame(raf);
        wheelEl.current?.style.removeProperty('--spd');
        kids.forEach((k) => k.style.removeProperty('--lit'));
      };
    }

    el.style.transition = 'none';
    el.style.transform = `rotate(${angle.current}deg)`;
    if (prefersReduced()) return undefined;
    let raf = 0;
    let last = performance.now();
    const loop = (t) => {
      angle.current = (angle.current + (t - last) * IDLE_DEG_PER_MS) % 360;
      last = t;
      el.style.transform = `rotate(${angle.current.toFixed(2)}deg)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [mode, n, winnerIndex]);

  const fontSize = n <= 6 ? 24 : n <= 12 ? 19 : n <= 18 ? 15 : 12;
  const maxChars = n <= 8 ? 12 : n <= 16 ? 10 : 8;

  return (
    <div className={`card-slot wheel-slot${xl ? ' card-xl' : ''}${compact ? ' compact' : ''}${mode === 'spin' ? ' is-spin' : ''}`}>
      <div className="wheel" ref={wheelEl} role="img" aria-label={`วงล้อ ${n} ช่อง${mode === 'spin' ? ' กำลังหมุน' : ''}`}>
        <span className="wheel-shadow" />
        <div className="wheel-bulbs" ref={bulbs} aria-hidden="true">
          {Array.from({ length: 24 }, (_, i) => <i key={i} style={{ '--a': `${i * 15}deg`, '--d': `${-i * 0.05}s` }} />)}
        </div>
        <span className="wheel-pointer" ref={pointer} />
        <div className="wheel-disc" ref={disc}>
          <svg viewBox="-200 -200 400 400" aria-hidden="true">
            {items.map((it, i) => {
              const c = segmentColor(i, n);
              const center = (i + 0.5) * (360 / n);
              return (
                <g key={it.id}>
                  <path d={segmentPath(i, n)} fill={c.bg} stroke="#fffbf2" strokeWidth="2" />
                  <text
                    transform={`rotate(${center}) translate(0 -168) rotate(-90)`}
                    textAnchor="end" dy=".35em" fill={c.fg} fontSize={fontSize}
                    fontFamily="Mitr, Sarabun, sans-serif" fontWeight="500"
                  >
                    {truncate(it.label, maxChars)}
                  </text>
                </g>
              );
            })}
            <circle r="196" fill="none" stroke="#ffc857" strokeWidth="8" />
            <circle r="26" fill="#fffbf2" stroke="#ffc857" strokeWidth="6" />
          </svg>
        </div>
      </div>
    </div>
  );
}
