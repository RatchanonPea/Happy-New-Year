import { useEffect, useState } from 'react';

const KEY = 'hny2570';
const fresh = () => ({ entries: [], history: [], noRepeat: true });

const clean = (list) =>
  list
    .filter((x) => x && typeof x === 'object' && typeof x.id === 'string')
    .map((x) => ({ ...x, name: String(x.name ?? ''), number: String(x.number ?? '') }));

export function loadState() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (!s || !Array.isArray(s.entries)) return fresh();
    return {
      entries: clean(s.entries),
      history: Array.isArray(s.history) ? clean(s.history) : [],
      noRepeat: s.noRepeat !== false
    };
  } catch {
    return fresh();
  }
}

/** state หลักของแอป เก็บใน localStorage (ไม่มีหลังบ้าน) */
export function useAppState() {
  const [state, setState] = useState(loadState);
  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* โหมดส่วนตัว */ }
  }, [state]);
  return [state, setState];
}

export function useToast() {
  const [msg, setMsg] = useState('');
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!msg) return undefined;
    const t = setTimeout(() => setMsg(''), 3200);
    return () => clearTimeout(t);
  }, [msg, tick]);
  const show = (m) => { setMsg(m); setTick((n) => n + 1); };
  return [msg, show];
}
