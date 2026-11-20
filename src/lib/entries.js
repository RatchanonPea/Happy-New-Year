/* ตรรกะล้วน (ไม่แตะ DOM) */

const DELIM = /[\t,;|]/;
const THAI_DIGITS = '๐๑๒๓๔๕๖๗๘๙';
const isNum = (s) => /^\d+$/.test(s);
const HEAD_NAME = /^(ชื่อ|รายชื่อ|name)$/i;
const HEAD_NUM = /^(เลข|หมายเลข|number|no\.?)$/i;
let counter = 0;

export function makeId() {
  counter += 1;
  return `${Date.now().toString(36)}-${counter}-${Math.random().toString(36).slice(2, 6)}`;
}

const toAsciiDigits = (s) => s.replace(/[๐-๙]/g, (d) => String(THAI_DIGITS.indexOf(d)));

/**
 * แปลงข้อความหลายบรรทัดเป็นรายการ {id,name,number}
 * รองรับ "ชื่อ, เลข" / แท็บ / ; / | / "ชื่อ 12" / "12 ชื่อ" / ชื่อเดี่ยว / เลขเดี่ยว / เลขไทย
 * ไม่รองรับ CSV ที่มีเครื่องหมายคำพูดคร่อมตัวคั่น
 */
export function parseEntries(text) {
  const entries = [];
  let skipped = 0;
  let first = true;
  const lines = toAsciiDigits(String(text ?? '')).replace(/^﻿/, '').split(/\r?\n/);

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    let name = '';
    let number = '';

    if (DELIM.test(line)) {
      const parts = line.split(DELIM).map((s) => s.trim());
      name = parts[0] || '';
      number = parts[1] || '';
      if (first && HEAD_NAME.test(name) && HEAD_NUM.test(number)) { first = false; continue; }
      if (isNum(name) && number && !isNum(number)) [name, number] = [number, name];
    } else if (isNum(line)) {
      number = line;
    } else {
      const m = line.match(/^(.*\S)\s+(\d+)$/);
      const m2 = line.match(/^(\d+)\s+(.+)$/);
      if (m) [, name, number] = m;
      else if (m2) [, number, name] = m2;
      else name = line;
    }
    first = false;

    if (!name && !number) { skipped += 1; continue; }
    entries.push({ id: makeId(), name, number });
  }
  return { entries, skipped };
}

/** สุ่มจำนวนเต็ม 0..max-1 แบบไม่เอนเอียง (crypto ถ้ามี) */
export function randomInt(max, rng) {
  if (!(max > 0)) throw new RangeError('max must be > 0');
  if (typeof rng === 'function') return Math.min(max - 1, Math.floor(rng() * max));
  const c = globalThis.crypto;
  if (c?.getRandomValues) {
    const limit = Math.floor(0x100000000 / max) * max;
    const buf = new Uint32Array(1);
    do { c.getRandomValues(buf); } while (buf[0] >= limit);
    return buf[0] % max;
  }
  return Math.floor(Math.random() * max);
}

export function pickRandom(pool, rng) {
  if (!pool || !pool.length) return null;
  return pool[randomInt(pool.length, rng)];
}

/** รายการที่ยังจับได้ */
export function availablePool(entries, drawnIds, noRepeat) {
  return noRepeat ? entries.filter((e) => !drawnIds.has(e.id)) : entries.slice();
}

export function remainText(entries, history, noRepeat) {
  if (!entries.length) return 'ยังไม่มีรายชื่อ';
  if (!noRepeat) return `ทั้งหมด ${entries.length} รายการ (จับซ้ำได้)`;
  const ids = new Set(history.map((h) => h.id));
  return `เหลือ ${availablePool(entries, ids, true).length} จาก ${entries.length} รายการ`;
}

/* ---------- การรันเลข / แก้ไข / สลับ ---------- */

/** เลขมากสุดที่เป็นตัวเลขล้วนในรายการ (ไม่มี = 0) */
export function maxNumber(entries) {
  return entries.reduce((m, e) => (isNum(e.number) ? Math.max(m, Number(e.number)) : m), 0);
}

/** เติมเลขให้รายการที่ยังไม่มีเลข โดยรันต่อจากเลขมากสุดของรายการเดิมและรายการใหม่ */
export function assignNumbers(newEntries, existing = []) {
  let n = Math.max(maxNumber(existing), maxNumber(newEntries));
  return newEntries.map((e) => (e.number ? e : { ...e, number: String((n += 1)) }));
}

/** สลับเลขของสองรายการ (ไม่แตะรายการอื่น) */
export function swapNumbers(entries, idA, idB) {
  const a = entries.find((e) => e.id === idA);
  const b = entries.find((e) => e.id === idB);
  if (!a || !b || a === b) return entries;
  return entries.map((e) => (e === a ? { ...e, number: b.number } : e === b ? { ...e, number: a.number } : e));
}

/** รันเลขใหม่ 1..n ตามลำดับในรายการ */
export function renumber(entries) {
  return entries.map((e, i) => ({ ...e, number: String(i + 1) }));
}

/** อัปเดตชื่อ/เลขที่บันทึกไว้ในประวัติให้ตรงกับรายการปัจจุบัน */
export function syncHistory(history, entries) {
  const byId = new Map(entries.map((e) => [e.id, e]));
  return history.map((h) => {
    const e = byId.get(h.id);
    return e ? { ...h, name: e.name, number: e.number } : h;
  });
}

/** เรียงตามเลขจากน้อยไปมาก (เลขที่ไม่ใช่ตัวเลขล้วนหรือว่างไปอยู่ท้าย คงลำดับเดิมในกลุ่มเดียวกัน) */
export function sortByNumber(entries) {
  const key = (e) => (isNum(e.number) ? Number(e.number) : Infinity);
  return entries
    .map((e, i) => [e, i])
    .sort((a, b) => key(a[0]) - key(b[0]) || a[1] - b[1])
    .map(([e]) => e);
}
