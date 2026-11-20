import { useCallback, useEffect, useRef, useState } from 'react';
import GiftScene from './components/GiftScene.jsx';
import Balloons, { makeBalloons } from './components/Balloons.jsx';
import Manage from './components/Manage.jsx';
import Display from './components/Display.jsx';
import Backdrop from './components/Backdrop.jsx';
import ConfirmDialog from './components/ConfirmDialog.jsx';
import { useAppState, useToast } from './hooks/useAppState.js';
import { useDraw } from './hooks/useDraw.js';
import { initConfetti } from './lib/confetti.js';
import { assignNumbers, makeId, parseEntries, renumber, sortByNumber, swapNumbers, syncHistory } from './lib/entries.js';
import { getGreetingYear } from './lib/year.js';

export default function App({ initialView = 'gift' }) {
  const [view, setView] = useState(initialView);
  const [state, setState] = useAppState();
  const [toastMsg, toast] = useToast();
  const [balloons, setBalloons] = useState([]);
  const [dialog, setDialog] = useState(null);
  const canvasRef = useRef(null);
  const cardRef = useRef(null);

  useEffect(() => initConfetti(canvasRef.current), []);
  useEffect(() => { document.title = `การ์ดอวยพรปีใหม่ ${getGreetingYear().be}`; }, []);

  const onWin = useCallback((h) => setState((s) => ({ ...s, history: [h, ...s.history] })), [setState]);
  const draw = useDraw({
    entries: state.entries, history: state.history, noRepeat: state.noRepeat,
    onWin, onMessage: toast, anchorRef: cardRef
  });
  const drawBundle = { ...draw, cardRef };

  // บอกเอฟเฟกต์ฉากหลัง (พลุถี่ขึ้น สปอตไลต์) ว่ากำลังลุ้นอยู่
  useEffect(() => {
    document.body.classList.toggle('is-spinning', draw.drawing);
    return () => document.body.classList.remove('is-spinning');
  }, [draw.drawing]);

  /* ----- actions ----- */
  const importText = (text, replace, errorMsg) => {
    if (text == null) { toast(errorMsg); return false; }
    const r = parseEntries(text);
    if (!r.entries.length) { toast('ไม่พบรายการที่นำเข้าได้ ใช้รูปแบบ ชื่อ, เลข หนึ่งบรรทัดต่อหนึ่งคน'); return false; }
    setState((s) => ({
      ...s,
      entries: replace ? assignNumbers(r.entries) : [...s.entries, ...assignNumbers(r.entries, s.entries)],
      history: replace ? [] : s.history
    }));
    if (replace) draw.reset();
    toast(`นำเข้า ${r.entries.length} รายการ${r.skipped ? ` (ข้าม ${r.skipped} บรรทัดที่ว่าง)` : ''}`);
    return true;
  };
  const addEntry = (name, number) => {
    const n = name.trim(), no = number.trim();
    if (!n && !no) { toast('กรอกชื่อหรือเลขอย่างน้อยหนึ่งอย่าง'); return false; }
    const clash = no && state.entries.find((e) => e.number === no);
    if (clash) { toast(`เลข ${no} ถูกใช้โดย ${clash.name || 'อีกรายการ'} แล้ว ลองเว้นว่างให้ระบบรันเลขให้`); return false; }
    setState((s) => ({
      ...s,
      entries: [...s.entries, ...assignNumbers([{ id: makeId(), name: n, number: no }], s.entries)]
    }));
    return true;
  };
  /** แก้ชื่อ/เลข: ถ้าเลขซ้ำกับรายการอื่น จะสลับเลขกันให้อัตโนมัติ */
  const updateEntry = (id, name, number) => {
    const n = name.trim(), no = number.trim();
    if (!n && !no) { toast('กรอกชื่อหรือเลขอย่างน้อยหนึ่งอย่าง'); return false; }
    const me = state.entries.find((e) => e.id === id);
    if (!me) return false;
    const other = no ? state.entries.find((e) => e.id !== id && e.number === no) : null;
    setState((s) => {
      const entries = sortByNumber(s.entries.map((e) => {
        if (e.id === id) return { ...e, name: n, number: no };
        if (other && e.id === other.id) return { ...e, number: me.number };
        return e;
      }));
      return { ...s, entries, history: syncHistory(s.history, entries) };
    });
    if (other) toast(`สลับเลขกับ ${other.name || 'อีกรายการ'} แล้ว (เลข ${no} เดิมเป็นของเขา)`);
    return true;
  };
  const swapEntries = (a, b) => {
    setState((s) => {
      const entries = sortByNumber(swapNumbers(s.entries, a, b));
      return { ...s, entries, history: syncHistory(s.history, entries) };
    });
    toast('สลับเลขแล้ว');
  };
  const renumberAll = () => {
    setState((s) => {
      const entries = renumber(s.entries);
      return { ...s, entries, history: syncHistory(s.history, entries) };
    });
    toast('รันเลขใหม่ตั้งแต่ 1 ตามลำดับในรายการแล้ว');
  };
  const removeEntry = (id) => setState((s) => ({ ...s, entries: s.entries.filter((e) => e.id !== id) }));
  const clearAll = () => {
    setDialog({
      title: 'ลบรายชื่อทั้งหมด?',
      message: `รายชื่อ ${state.entries.length} รายการและผลการจับจะถูกลบ ย้อนกลับไม่ได้นะ`,
      confirmLabel: 'ลบเลย',
      onConfirm: () => {
        setState((s) => ({ ...s, entries: [], history: [] }));
        draw.reset();
        setDialog(null);
      }
    });
  };
  const actions = {
    setNoRepeat: (v) => setState((s) => ({ ...s, noRepeat: v })),
    resetHistory: () => { setState((s) => ({ ...s, history: [] })); draw.reset(); toast('รีเซ็ตผลการจับแล้ว'); }
  };

  /* ----- views ----- */
  const openDisplay = () => {
    setView('display');
    Promise.resolve(document.documentElement.requestFullscreen?.()).catch(() => { /* ใช้โหมดหน้าต่างแทน */ });
  };
  const exitDisplay = useCallback(() => setView('manage'), []);

  return (
    <>
      <Backdrop />
      <Balloons items={balloons} onRemove={(id) => setBalloons((l) => l.filter((b) => b.id !== id))} />
      <canvas id="confetti" ref={canvasRef} aria-hidden="true" />

      {view === 'gift' && (
        <GiftScene onOpen={() => setBalloons(makeBalloons())} onDone={() => setView('manage')} />
      )}
      {view === 'manage' && (
        <Manage
          state={state} draw={drawBundle} actions={actions} onOpenDisplay={openDisplay}
          list={{ onImport: importText, onAdd: addEntry, onUpdate: updateEntry, onSwap: swapEntries, onRenumber: renumberAll, onRemove: removeEntry, onClear: clearAll }}
        />
      )}
      {view === 'display' && <Display state={state} draw={drawBundle} onExit={exitDisplay} />}

      {dialog && <ConfirmDialog {...dialog} onCancel={() => setDialog(null)} />}

      <div className={`toast${toastMsg ? ' show' : ''}`} role="status" aria-live="polite">{toastMsg}</div>
    </>
  );
}
