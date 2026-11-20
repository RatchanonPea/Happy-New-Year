import { describe, it, expect } from 'vitest';
import { finalRotation, landingAngle, segmentPath, segmentColor, truncate, polar } from './wheel.js';

const mod = (a) => ((a % 360) + 360) % 360;

describe('finalRotation', () => {
  it('ช่องผู้ชนะหยุดตรงเข็มด้านบนทุกขนาดวงล้อและทุกค่า jitter', () => {
    for (let n = 2; n <= 24; n++) {
      const seg = 360 / n;
      for (let w = 0; w < n; w++) {
        for (const j of [-0.5, -0.2, 0, 0.3, 0.5]) {
          const R = finalRotation(n, w, j);
          // ตำแหน่งของช่องหลังหมุน: เริ่ม w*seg..(w+1)*seg ต้องคร่อมมุม 0 (เข็ม)
          const start = mod(w * seg + R);
          const end = start + seg;
          const covers = start < 1e-6 || start > 360 - seg + 1e-6 || (start <= 360 && end >= 360 - 1e-6);
          expect(covers, `n=${n} w=${w} j=${j}`).toBe(true);
        }
      }
    }
  });
  it('หมุนหลายรอบและหมุนตามเข็ม (มุมเป็นบวก)', () => {
    expect(finalRotation(8, 3, 0)).toBeGreaterThan(360 * 5);
  });
});

describe('geometry', () => {
  it('polar: 0° อยู่บนสุด 90° อยู่ขวา', () => {
    const [x0, y0] = polar(100, 0);
    const [x1, y1] = polar(100, 90);
    expect(x0).toBeCloseTo(0, 6);
    expect(y0).toBeCloseTo(-100, 6);
    expect(x1).toBeCloseTo(100, 6);
    expect(y1).toBeCloseTo(0, 6);
  });
  it('segmentPath: ปิดรูปและมี large-arc เมื่อช่องเกินครึ่งวง', () => {
    expect(segmentPath(0, 4)).toMatch(/^M0 0 L.* A190 190 0 0 1 .* Z$/);
    expect(segmentPath(0, 1)).toContain('1 1');
  });
  it('segmentColor: ช่องแรกกับช่องสุดท้ายไม่สีซ้ำ', () => {
    for (let n = 2; n <= 24; n++) expect(segmentColor(0, n).bg).not.toBe(segmentColor(n - 1, n).bg);
  });
  it('truncate: ตัดชื่อยาวและไม่ตัดตัวอักษรไทยกลางคัน', () => {
    expect(truncate('สมชาย', 10)).toBe('สมชาย');
    expect(truncate('ก'.repeat(12), 10)).toBe(`${'ก'.repeat(9)}…`);
  });
});

describe('landingAngle', () => {
  it('เริ่มจากมุมใดก็ได้: หมุนไปข้างหน้า >= 5 รอบ และไปหยุดที่ช่องเดียวกับ finalRotation', () => {
    for (const n of [2, 5, 24]) {
      for (const cur of [0, 37.5, 200, 359.9]) {
        for (let w = 0; w < n; w++) {
          const total = landingAngle(n, w, 0.2, cur);
          expect(total - cur).toBeGreaterThanOrEqual(5 * 360);
          const want = mod(finalRotation(n, w, 0.2, 0));
          expect(Math.abs(mod(total) - want) < 1e-6 || Math.abs(Math.abs(mod(total) - want) - 360) < 1e-6).toBe(true);
        }
      }
    }
  });
});
