import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { availablePool, pickRandom } from '../lib/entries.js';
import { burst, prefersReduced } from '../lib/confetti.js';
import { MAX_WHEEL, SPIN_MS } from '../lib/wheel.js';

export const WISHES = [
  'ขอให้ปีใหม่นี้เต็มไปด้วยรอยยิ้มและสุขภาพแข็งแรง',
  'ขอให้โชคดี การงานก้าวหน้า เงินทองไหลมาเทมา',
  'ขอให้สมหวังในทุกสิ่งที่ตั้งใจไว้',
  'ขอให้มีความสุขทุกวัน และอบอุ่นใจกับคนที่รัก',
  'ขอให้ปีนี้เป็นปีที่ดีที่สุดของคุณ',
  'ขอให้เจอแต่เรื่องดี ๆ ตลอดปี'
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const label = (e) => e.name || e.number;
const toCard = (e, wish = '') => ({ who: label(e), num: e.name ? e.number : '', wish });

/**
 * จับฉลาก: สุ่มผู้ชนะก่อน แล้วค่อยแสดงภาพหมุน
 * - วงล้อมีเฉพาะคนที่ยังจับได้ (โหมดไม่ซ้ำ: คนที่ถูกเลือกแล้วถูกตัดออกจากวง) ใช้เมื่อเหลือ 1..MAX_WHEEL คน
 *   และมีรายชื่อรวมอย่างน้อย 2 คน หมุนช้าตอนรอ แล้วหมุนไปหยุดที่ผู้ชนะ
 * - เหลือมากกว่า MAX_WHEEL: การ์ดวนชื่อเร็ว→ช้า
 * phase: idle | spinning (วงล้อ) | rolling (การ์ดวนชื่อ) | landed
 */
export function useDraw({ entries, history, noRepeat, onWin, onMessage, anchorRef }) {
  const [card, setCard] = useState(null);
  const [phase, setPhase] = useState('idle');
  const [winnerIndex, setWinnerIndex] = useState(0);
  const [seq, setSeq] = useState(0);
  const busy = useRef(false);
  const alive = useRef(true);
  const gen = useRef(0); // เพิ่มทุกครั้งที่ reset เพื่อยกเลิกรอบที่กำลังหมุนอยู่
  const entriesRef = useRef(entries);
  entriesRef.current = entries;

  useEffect(() => {
    alive.current = true;
    return () => { alive.current = false; };
  }, []);

  const wheelItems = useMemo(() => {
    if (entries.length < 2) return null;
    const ids = new Set(history.map((h) => h.id));
    const pool = availablePool(entries, ids, noRepeat);
    if (!pool.length || pool.length > MAX_WHEEL) return null;
    return pool.map((e) => ({ id: e.id, label: label(e) }));
  }, [entries, history, noRepeat]);

  const draw = useCallback(async () => {
    if (busy.current) return;
    const ids = new Set(history.map((h) => h.id));
    const pool = availablePool(entries, ids, noRepeat);
    if (!pool.length) {
      onMessage(entries.length
        ? 'จับครบทุกคนแล้ว กด “รีเซ็ตผลการจับ” เพื่อเริ่มใหม่'
        : 'ยังไม่มีรายชื่อ นำเข้ารายชื่อก่อนจับฉลาก');
      return;
    }
    const winner = pickRandom(pool);
    const myGen = gen.current;
    const cancelled = () => !alive.current || gen.current !== myGen;
    busy.current = true;
    try {
      if (!prefersReduced()) {
        if (wheelItems) {
          setWinnerIndex(wheelItems.findIndex((it) => it.id === winner.id));
          setPhase('spinning');
          await sleep(SPIN_MS + 700); // เว้นจังหวะให้เห็นผลบนวงล้อก่อนขึ้นการ์ด
        } else if (pool.length > 1) {
          setPhase('rolling');
          const steps = 26;
          for (let i = 0; i < steps; i++) {
            if (cancelled()) return;
            setCard(toCard(pickRandom(pool)));
            await sleep(45 + ((i / steps) ** 3) * 340);
          }
        }
      }
      if (cancelled()) return;
      // ผู้ชนะถูกลบระหว่างหมุน: ไม่บันทึกผล
      if (!entriesRef.current.some((e) => e.id === winner.id)) { setPhase('idle'); return; }
      setCard(toCard(winner, WISHES[Math.floor(Math.random() * WISHES.length)]));
      setSeq((n) => n + 1);
      setPhase('landed');
      onWin({ id: winner.id, name: winner.name, number: winner.number, at: Date.now() });
    } finally {
      busy.current = false;
    }
    // รอ DOM ของการ์ดใหม่ก่อนวัดตำแหน่งยิงพลุ (ไม่บล็อกการจับครั้งถัดไป)
    await sleep(60);
    const r = alive.current ? anchorRef?.current?.getBoundingClientRect() : null;
    if (r && r.width) burst(r.left + r.width / 2, r.top + r.height / 2, 110);
  }, [entries, history, noRepeat, wheelItems, onWin, onMessage, anchorRef]);

  const reset = useCallback(() => { gen.current += 1; setCard(null); setPhase('idle'); }, []);
  const drawing = phase === 'spinning' || phase === 'rolling';

  return { card, phase, wheelItems, winnerIndex, seq, drawing, draw, reset };
}
