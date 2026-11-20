/** ตรรกะเรขาคณิตของวงล้อ (ไม่แตะ DOM) */
export const MAX_WHEEL = 24; // เกินนี้ช่องเล็กเกินอ่าน → ใช้การ์ดวนชื่อแทน
export const SPIN_MS = 5200;
export const SEGMENT_COLORS = [
  { bg: '#f0405f', fg: '#ffffff' },
  { bg: '#ffc857', fg: '#3a2600' },
  { bg: '#6fe3c1', fg: '#08372b' },
  { bg: '#8b6cf0', fg: '#ffffff' }
];

/** จุดบนวงกลม มุมวัดตามเข็มนาฬิกาจากด้านบน */
export function polar(r, deg) {
  const a = (deg * Math.PI) / 180;
  return [r * Math.sin(a), -r * Math.cos(a)];
}

export function segmentPath(i, n, r = 190) {
  if (n === 1) return `M0 ${-r} A${r} ${r} 0 1 1 0 ${r} A${r} ${r} 0 1 1 0 ${-r} Z`;
  const seg = 360 / n;
  const [x1, y1] = polar(r, i * seg);
  const [x2, y2] = polar(r, (i + 1) * seg);
  return `M0 0 L${x1.toFixed(2)} ${y1.toFixed(2)} A${r} ${r} 0 ${seg > 180 ? 1 : 0} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`;
}

/** สีช่อง: ไม่ให้ช่องแรกกับช่องสุดท้ายสีซ้ำกัน */
export function segmentColor(i, n) {
  let k = i % SEGMENT_COLORS.length;
  if (i === n - 1 && n > 1 && k === 0) k = 2;
  return SEGMENT_COLORS[k];
}

/**
 * มุมหมุน (องศา ตามเข็ม) ที่ทำให้ช่อง winnerIndex หยุดตรงเข็มด้านบน
 * jitter -0.5..0.5 = เยื้องจากกลางช่องเล็กน้อยให้ดูเป็นธรรมชาติ แต่ยังอยู่ในช่องเสมอ
 */
export function finalRotation(n, winnerIndex, jitter = 0, turns = 6) {
  const seg = 360 / n;
  const center = (winnerIndex + 0.5) * seg;
  return turns * 360 - center + jitter * seg * 0.8;
}

export function truncate(s, max = 10) {
  const chars = [...String(s)];
  return chars.length > max ? `${chars.slice(0, max - 1).join('')}…` : String(s);
}

export const IDLE_DEG_PER_MS = 0.008; // ~8°/วินาที ตอนรอ

const mod360 = (a) => ((a % 360) + 360) % 360;

/** มุมหมุนสุดท้ายที่เริ่มจากมุมปัจจุบัน cur: หมุนต่อไปข้างหน้าอย่างน้อย turns รอบ แล้วหยุดที่ช่องผู้ชนะ */
export function landingAngle(n, winnerIndex, jitter, cur, turns = 5) {
  const target = mod360(finalRotation(n, winnerIndex, jitter, 0));
  return cur + turns * 360 + mod360(target - cur);
}
