import { describe, it, expect } from 'vitest';
import { sortByNumber, assignNumbers, maxNumber, renumber, swapNumbers, syncHistory, parseEntries, randomInt, pickRandom, availablePool, remainText } from './entries.js';

const pairs = (r) => r.entries.map((e) => [e.name, e.number]);

describe('parseEntries', () => {
  it('รองรับตัวคั่น , แท็บ ; |', () => {
    const r = parseEntries('สมชาย, 12\nสมหญิง\t7\nมานะ;99\nมาลี|5');
    expect(pairs(r)).toEqual([['สมชาย', '12'], ['สมหญิง', '7'], ['มานะ', '99'], ['มาลี', '5']]);
  });
  it('ข้ามหัวตาราง บรรทัดว่าง BOM และ CRLF', () => {
    expect(pairs(parseEntries('﻿ชื่อ,เลข\r\n\r\nก,1\r\nข,2\r\n'))).toEqual([['ก', '1'], ['ข', '2']]);
  });
  it('สลับเมื่อเลขมาก่อนชื่อ', () => {
    expect(pairs(parseEntries('15,สมศรี'))).toEqual([['สมศรี', '15']]);
    expect(pairs(parseEntries('15 สมศรี'))).toEqual([['สมศรี', '15']]);
    expect(pairs(parseEntries('สมศรี 15'))).toEqual([['สมศรี', '15']]);
  });
  it('ชื่อเดี่ยว เลขเดี่ยว และข้ามบรรทัดที่ไม่มีข้อมูล', () => {
    const r = parseEntries('สมชาย\n42\n,\n');
    expect(pairs(r)).toEqual([['สมชาย', ''], ['', '42']]);
    expect(r.skipped).toBe(1);
  });
  it('แปลงเลขไทยเป็นเลขอารบิก', () => {
    expect(pairs(parseEntries('สมชาย, ๑๒'))).toEqual([['สมชาย', '12']]);
    expect(pairs(parseEntries('๗'))).toEqual([['', '7']]);
  });
  it('id ไม่ซ้ำ และรับ input แปลก ๆ ได้', () => {
    expect(new Set(parseEntries('a\na\na').entries.map((e) => e.id)).size).toBe(3);
    expect(parseEntries(null).entries).toEqual([]);
    expect(parseEntries(undefined).entries).toEqual([]);
  });
});

describe('random', () => {
  it('randomInt อยู่ในช่วง ใช้ rng ที่ส่งมา และโยน error เมื่อ max<=0', () => {
    expect(randomInt(10, () => 0)).toBe(0);
    expect(randomInt(10, () => 0.9999)).toBe(9);
    expect(randomInt(10, () => 1)).toBe(9);
    for (let i = 0; i < 500; i++) { const n = randomInt(7); expect(n >= 0 && n < 7).toBe(true); }
    expect(() => randomInt(0)).toThrow();
    expect(() => randomInt(NaN)).toThrow();
  });
  it('กระจายครบทุกค่า', () => {
    const seen = new Set();
    for (let i = 0; i < 500; i++) seen.add(randomInt(5));
    expect(seen.size).toBe(5);
  });
  it('pickRandom / availablePool', () => {
    const es = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
    expect(pickRandom([])).toBeNull();
    expect(pickRandom(es, () => 0).id).toBe('a');
    expect(availablePool(es, new Set(['b']), true).map((e) => e.id)).toEqual(['a', 'c']);
    expect(availablePool(es, new Set(['b']), false)).toHaveLength(3);
    expect(availablePool(es, new Set(['a', 'b', 'c']), true)).toHaveLength(0);
  });
  it('remainText', () => {
    const es = [{ id: 'a' }, { id: 'b' }];
    expect(remainText([], [], true)).toBe('ยังไม่มีรายชื่อ');
    expect(remainText(es, [{ id: 'a' }], true)).toBe('เหลือ 1 จาก 2 รายการ');
    expect(remainText(es, [], false)).toContain('จับซ้ำได้');
  });
});

describe('รันเลข / สลับ', () => {
  const E = (id, name, number) => ({ id, name, number });
  it('assignNumbers รันต่อจากเลขมากสุด และไม่แตะรายการที่มีเลข', () => {
    const out = assignNumbers([E('a', 'ก', ''), E('b', 'ข', '10'), E('c', 'ค', '')], [E('x', 'ง', '4')]);
    expect(out.map((e) => e.number)).toEqual(['11', '10', '12']);
    expect(maxNumber([E('x', 'ง', 'abc')])).toBe(0);
  });
  it('swapNumbers สลับเฉพาะสองรายการ', () => {
    const out = swapNumbers([E('a', 'ก', '1'), E('b', 'ข', '2'), E('c', 'ค', '3')], 'a', 'c');
    expect(out.map((e) => e.number)).toEqual(['3', '2', '1']);
  });
  it('renumber และ syncHistory', () => {
    const list = renumber([E('a', 'ก', '9'), E('b', 'ข', '')]);
    expect(list.map((e) => e.number)).toEqual(['1', '2']);
    expect(syncHistory([{ id: 'b', name: 'old', number: '' }, { id: 'zz', name: 'gone', number: '5' }], list))
      .toEqual([{ id: 'b', name: 'ข', number: '2' }, { id: 'zz', name: 'gone', number: '5' }]);
  });
});

describe('sortByNumber', () => {
  it('เรียงตามเลข เลขว่างไว้ท้าย และคงลำดับเดิมเมื่อเลขเท่ากัน', () => {
    const E = (id, number) => ({ id, name: id, number });
    expect(sortByNumber([E('a', '10'), E('b', ''), E('c', '2'), E('d', 'x'), E('e', '2')]).map((e) => e.id))
      .toEqual(['c', 'e', 'a', 'b', 'd']);
  });
});
