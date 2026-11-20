export const COLORS = ['#f0405f', '#ffc857', '#6fe3c1', '#7aa7ff', '#ff8fb8', '#b49bff', '#ff9a4d'];

let canvas = null;
let ctx = null;
let parts = [];
let raf = 0;

export const prefersReduced = () =>
  typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
export const rand = (a, b) => a + Math.random() * (b - a);

function fit() {
  if (!canvas || !ctx) return;
  const dpr = window.devicePixelRatio || 1;
  canvas.width = innerWidth * dpr;
  canvas.height = innerHeight * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

/** ผูก canvas แล้วคืนฟังก์ชันล้างค่า */
export function initConfetti(el) {
  canvas = el;
  ctx = el ? el.getContext('2d') : null;
  fit();
  window.addEventListener('resize', fit);
  return () => {
    window.removeEventListener('resize', fit);
    cancelAnimationFrame(raf);
    raf = 0; parts = []; canvas = null; ctx = null;
  };
}

export function burst(x, y, n) {
  if (!ctx || prefersReduced()) return;
  for (let i = 0; i < n; i++) {
    const a = rand(0, Math.PI * 2);
    const v = rand(3, 11);
    parts.push({
      x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 4, w: rand(5, 10), h: rand(3, 7),
      r: rand(0, 6), vr: rand(-0.3, 0.3), c: COLORS[i % COLORS.length], life: rand(70, 120)
    });
  }
  if (!raf) raf = requestAnimationFrame(tick);
}

function tick() {
  if (!ctx) { raf = 0; return; }
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  parts = parts.filter((p) => p.life > 0 && p.y < innerHeight + 20);
  for (const p of parts) {
    p.vy += 0.28; p.vx *= 0.985; p.x += p.vx; p.y += p.vy; p.r += p.vr; p.life -= 1;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.r);
    ctx.globalAlpha = Math.min(1, p.life / 30);
    ctx.fillStyle = p.c;
    ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
    ctx.restore();
  }
  raf = parts.length ? requestAnimationFrame(tick) : 0;
  if (!raf) ctx.clearRect(0, 0, innerWidth, innerHeight);
}
