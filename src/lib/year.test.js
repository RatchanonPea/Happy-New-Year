import { describe, it, expect } from 'vitest';
import { getGreetingYear } from './year.js';

describe('getGreetingYear', () => {
  it('ม.ค.–ต.ค. ใช้ปีปัจจุบัน', () => {
    expect(getGreetingYear(new Date(2027, 0, 1))).toEqual({ ce: 2027, be: 2570 });
    expect(getGreetingYear(new Date(2026, 9, 31))).toEqual({ ce: 2026, be: 2569 });
  });
  it('พ.ย.–ธ.ค. ใช้ปีถัดไป (รวมคืนส่งท้ายปี)', () => {
    expect(getGreetingYear(new Date(2026, 10, 20))).toEqual({ ce: 2027, be: 2570 });
    expect(getGreetingYear(new Date(2026, 11, 31, 23, 59))).toEqual({ ce: 2027, be: 2570 });
  });
  it('ไม่ส่งค่า: ใช้วันที่ปัจจุบันของเครื่อง', () => {
    const y = getGreetingYear();
    expect(y.be - y.ce).toBe(543);
  });
});
