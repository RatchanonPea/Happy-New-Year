import { useEffect, useRef, useState } from 'react';
import { burst, prefersReduced } from '../lib/confetti.js';
import { getGreetingYear } from '../lib/year.js';
import { Elf, Reindeer } from './CurtainHelpers.jsx';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** กล่องของขวัญ: คลิก → สั่น → ฝาเปิด → ลูกโป่งลอย → เข้าหน้าจัดการ */
export default function GiftScene({ onOpen, onDone }) {
  const [phase, setPhase] = useState('idle'); // idle | shake | open | leaving
  const started = useRef(false);
  const alive = useRef(true);
  const boxRef = useRef(null);
  const [curtain, setCurtain] = useState(false);
  const curtainsRef = useRef(null);

  useEffect(() => {
    alive.current = true;
    return () => { alive.current = false; };
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setCurtain(true), 500);
    return () => clearTimeout(t);
  }, []);

  /* ม่านพลิ้วตามเมาส์ เหมือนจับผ้าม่าน: ส่วนบนแขวนอยู่กับราวไม่ขยับ ยิ่งลงล่างยิ่งตามมือ
     แต่ละแถบตามช้ากว่าแถบบนเล็กน้อย (สปริงทีละแถบ) ได้เส้นโค้งพลิ้วแทนการเอียงทั้งผืน */
  useEffect(() => {
    const root = curtainsRef.current;
    if (!root || prefersReduced()) return undefined;
    const curtains = [...root.querySelectorAll('.curtain')].map((el) => ({
      el, strips: [...el.querySelectorAll('.strip')], st: [...el.querySelectorAll('.strip')].map(() => ({ x: 0, v: 0 }))
    }));
    const mouse = { x: 0, y: 0.5 };
    const onMove = (e) => { mouse.x = (e.clientX / innerWidth) * 2 - 1; mouse.y = e.clientY / innerHeight; };
    window.addEventListener('pointermove', onMove);
    let raf = 0;
    // ลมพัด: หลายคลื่นซ้อนกัน คลื่นไล่ลงจากบนลงล่างด้วยการหน่วงเวลาทีละแถบ
    const gust = (t) => Math.sin(t / 1900) * 0.55 + Math.sin(t / 760 + 1.3) * 0.3 + Math.sin(t / 3300 + 0.4) * 0.45;
    const loop = (t) => {
      const windAmp = Math.min(34, innerWidth * 0.024);
      curtains.forEach((c, ci) => {
        const n = c.strips.length;
        const near = ci === 0 ? (1 - mouse.x) / 2 : (1 + mouse.x) / 2; // ข้างที่ใกล้เมาส์ถูกดึงมากกว่า
        const pull = mouse.x * Math.min(110, innerWidth * 0.07) * (0.35 + near * 0.9) * (0.4 + 0.6 * mouse.y);
        const h = c.strips[0].offsetHeight || 1;
        c.strips.forEach((strip, i) => {
          const w = (i / n) ** 1.7;                      // แถบบนสุด = 0 (นิ่ง) แถบล่างสุด = เต็ม
          const wind = gust(t - i * 38 + ci * 420) * windAmp; // ลมถึงแถบล่างช้ากว่าแถบบน
          const s = c.st[i];
          const k = 0.05 - (i / n) * 0.03;               // แถบล่างตามช้ากว่า
          s.v += ((pull + wind) * w - s.x) * k;
          s.v *= 0.88;
          s.x += s.v;
          const next = i + 1 < n ? c.st[i + 1].x : s.x;
          const skew = Math.atan((next - s.x) / h) * (180 / Math.PI);
          strip.style.transform = `translateX(${s.x.toFixed(2)}px) skewX(${skew.toFixed(3)}deg)`;
        });
      });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => { window.removeEventListener('pointermove', onMove); cancelAnimationFrame(raf); };
  }, []);

  async function open() {
    if (started.current) return;
    started.current = true;
    const reduced = prefersReduced();
    if (!reduced) { setPhase('shake'); await sleep(700); }
    if (!alive.current) return;
    setPhase('open');
    const r = boxRef.current?.getBoundingClientRect();
    if (r) burst(r.left + r.width / 2, r.top + 80, 70);
    onOpen();
    await sleep(reduced ? 600 : 2200);
    if (!alive.current) return;
    setPhase('leaving');
    await sleep(reduced ? 0 : 500);
    if (alive.current) onDone();
  }

  function skip() {
    started.current = true;
    alive.current = false;
    onDone();
  }

  return (
    <section id="gift" className={`view is-active${phase === 'leaving' ? ' leaving' : ''}`} aria-label="กล่องของขวัญ">
      <div ref={curtainsRef} className={`curtains${curtain ? ' drawn' : ''}`} aria-hidden="true">
        <div className="curtain curtain-l">{Array.from({ length: 48 }, (_, i) => <div key={i} className="strip" />)}</div>
        <div className="curtain curtain-r">{Array.from({ length: 48 }, (_, i) => <div key={i} className="strip" />)}</div>
        <div className="valance" />
        <div className="puller puller-l"><Reindeer /></div>
        <div className="puller puller-r"><Elf /></div>
      </div>
      <p className={`gift-lead${phase !== 'idle' ? ' gone' : ''}`}>มีของขวัญปีใหม่รอคุณอยู่ 🎁</p>
      <div className="gift-stage">
        <span className="gift-glow" aria-hidden="true" />
        <svg className="cast santa" viewBox="0 0 120 140" aria-hidden="true">
          <path d="M18 128c0-26 18-40 42-40s42 14 42 40z" fill="#e0385a" />
          <rect x="22" y="114" width="76" height="13" rx="6.5" fill="#fffbf2" />
          <circle cx="60" cy="62" r="34" fill="#ffd9b8" />
          <path d="M22 66c-2 30 16 50 38 50s40-20 38-50c-10 14-24 18-38 18s-28-4-38-18z" fill="#fffbf2" />
          <path d="M40 80c8 8 32 8 40 0 0 12-10 18-20 18s-20-6-20-18z" fill="#fffbf2" />
          <path d="M28 50C28 26 46 8 70 8C88 8 100 20 106 38C99 33 92 31 85 33C90 40 93 45 94 50z" fill="#e0385a" />
          <path d="M70 8C88 8 100 20 106 38C99 33 92 31 85 33C80 20 76 12 70 8z" fill="#000" opacity=".1" />
          <rect x="21" y="44" width="78" height="17" rx="8.5" fill="#fffbf2" />
          <circle cx="106" cy="38" r="9.5" fill="#fffbf2" />
          <circle cx="48" cy="66" r="3.2" fill="#2a1b4d" /><circle cx="72" cy="66" r="3.2" fill="#2a1b4d" />
          <circle cx="40" cy="74" r="5" fill="#ff8fa8" opacity=".7" /><circle cx="80" cy="74" r="5" fill="#ff8fa8" opacity=".7" />
          <circle cx="60" cy="72" r="5" fill="#f4a58a" />
          <path d="M52 84q8 7 16 0" stroke="#c42246" strokeWidth="3" fill="none" strokeLinecap="round" />
        </svg>
        <svg className="cast tree" viewBox="0 0 100 130" aria-hidden="true">
          <rect x="43" y="100" width="14" height="22" rx="3" fill="#8a4b1e" />
          <path d="M50 8L16 52h18L10 88h30L18 108h64L60 88h30L66 52h18z" fill="#2fae7f" />
          <path d="M50 8L84 52H66l24 36H60l22 20H50z" fill="#000" opacity=".1" />
          <polygon points="50,-1 54,7 62,8 56,14 58,22 50,18 42,22 44,14 38,8 46,7" fill="#ffc857" />
          <circle cx="40" cy="60" r="4" fill="#f0405f" /><circle cx="62" cy="74" r="4" fill="#ffc857" /><circle cx="34" cy="92" r="4" fill="#7aa7ff" /><circle cx="68" cy="98" r="4" fill="#f0405f" />
        </svg>
        <span className="cast mini m1">🎁</span>
        <span className="cast mini m2">🎁</span>
        <span className="cast mini m3">🎁</span>
        <span className="gift-spark s1" aria-hidden="true">✦</span>
        <span className="gift-spark s2" aria-hidden="true">✦</span>
        <span className="gift-spark s3" aria-hidden="true">✧</span>
        <span className="gift-spark s4" aria-hidden="true">✧</span>
      <button
        ref={boxRef}
        type="button"
        className={`gift${phase === 'shake' ? ' shake' : ''}${phase === 'open' || phase === 'leaving' ? ' open' : ''}`}
        aria-label="เปิดกล่องของขวัญ"
        onClick={open}
      >
<svg className="gift-svg" viewBox="0 0 280 300" aria-hidden="true">
          <defs>
            <linearGradient id="gx-ray" gradientUnits="userSpaceOnUse" x1="0" y1="124" x2="0" y2="-170">
              <stop offset="0" stopColor="#fff4c8" stopOpacity=".95" />
              <stop offset=".45" stopColor="#ffd86e" stopOpacity=".38" />
              <stop offset="1" stopColor="#ff9ad0" stopOpacity="0" />
            </linearGradient>
            <radialGradient id="gx-in" cx=".5" cy=".5" r=".6">
              <stop offset="0" stopColor="#ffffff" />
              <stop offset=".45" stopColor="#ffe9a0" />
              <stop offset="1" stopColor="#ffb347" />
            </radialGradient>
            <radialGradient id="gx-shadow" cx=".5" cy=".5" r=".5">
              <stop offset="0" stopColor="#000" stopOpacity=".5" /><stop offset="1" stopColor="#000" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="gx-body" x1="0" x2="1"><stop offset="0" stopColor="#e23556" /><stop offset=".5" stopColor="#f0405f" /><stop offset="1" stopColor="#d2304f" /></linearGradient>
            <filter id="gx-soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" /></filter>
          </defs>
          <ellipse cx="140" cy="282" rx="104" ry="11" fill="url(#gx-shadow)" />
          <path d="M44 132h192v132a10 10 0 0 1-10 10H54a10 10 0 0 1-10-10z" fill="url(#gx-body)" />
                              <rect x="118" y="132" width="44" height="142" fill="#ffc857" />
          <path d="M48 131L62 114H218L232 131z" fill="#a81c3c" stroke="#a81c3c" strokeWidth="6" strokeLinejoin="round" />
          <path className="gift-inner" d="M48 131L62 114H218L232 131z" fill="url(#gx-in)" stroke="#ffe9a0" strokeWidth="6" strokeLinejoin="round" />
          <path d="M120 131L124 114H156L160 131z" fill="#ffc857" opacity=".95" />
          <g className="gift-rays" filter="url(#gx-soft)" fill="url(#gx-ray)">
            <polygon points="128,124 152,124 146,-170 134,-170" transform="rotate(-62 140 124)" opacity="0.5" /><polygon points="128,124 152,124 146,-170 134,-170" transform="rotate(-42 140 124)" opacity="0.7" /><polygon points="128,124 152,124 146,-170 134,-170" transform="rotate(-22 140 124)" opacity="0.85" /><polygon points="128,124 152,124 146,-170 134,-170" transform="rotate(0 140 124)" opacity="1" /><polygon points="128,124 152,124 146,-170 134,-170" transform="rotate(22 140 124)" opacity="0.85" /><polygon points="128,124 152,124 146,-170 134,-170" transform="rotate(42 140 124)" opacity="0.7" /><polygon points="128,124 152,124 146,-170 134,-170" transform="rotate(62 140 124)" opacity="0.5" />
          </g>
          <g className="gift-sparks">
            <circle cx="96" cy="100" r="3" /><circle cx="184" cy="92" r="2.4" /><circle cx="140" cy="70" r="3.4" />
            <circle cx="118" cy="48" r="2" /><circle cx="168" cy="40" r="2.8" /><circle cx="76" cy="62" r="2.2" /><circle cx="204" cy="66" r="2" />
          </g>
          <g className="gift-lid">
            <rect x="34" y="96" width="212" height="38" rx="9" fill="#d9334f" />
            <path d="M38 95L50 74H230L242 95z" fill="#ec4a64" stroke="#ec4a64" strokeWidth="6" strokeLinejoin="round" />
            <rect x="118" y="96" width="44" height="38" fill="#ffc857" />
            <path d="M118 95L123 74H157L162 95z" fill="#ffc857" />
            <path d="M34 124h212v10H34z" fill="#000" opacity=".1" />
            <path d="M137 72L113 110L127 103L131 114L147 78z" fill="#ffd978" stroke="#d99a1a" strokeWidth="1.6" strokeLinejoin="round" />
            <path d="M143 72L167 110L153 103L149 114L133 78z" fill="#ffd978" stroke="#d99a1a" strokeWidth="1.6" strokeLinejoin="round" />
            <ellipse cx="111" cy="55" rx="29" ry="17" transform="rotate(-22 111 55)" fill="none" stroke="#ffc857" strokeWidth="11" />
            <ellipse cx="169" cy="55" rx="29" ry="17" transform="rotate(22 169 55)" fill="none" stroke="#ffc857" strokeWidth="11" />
            <rect x="127" y="52" width="26" height="24" rx="8" fill="#ffd978" stroke="#d99a1a" strokeWidth="1.6" />
          </g>
        </svg>
      </button>
      </div>
      <p className={`gift-hint${phase !== 'idle' ? ' gone' : ''}`}>✨ แตะกล่องเพื่อเปิดของขวัญ ✨</p>
      <button type="button" className="gift-skip" onClick={skip}>ข้าม ›</button>
      {(phase === 'open' || phase === 'leaving') && (
        <div className="hello" role="status">
          <span className="hello-th">สวัสดีปีใหม่</span>
          <span className="hello-en">Happy New Year {getGreetingYear().ce}</span>
        </div>
      )}
    </section>
  );
}
