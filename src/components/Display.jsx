import { useEffect, useRef, useState } from 'react';
import WishCard from './WishCard.jsx';
import { remainText } from '../lib/entries.js';

/** จอแสดงผลเต็มจอ: คลิก / Space / Enter = จับ, F = สลับเต็มจอ, Esc = ออก */
export default function Display({ state, draw, onExit }) {
  const [idle, setIdle] = useState(false);
  const timer = useRef(0);
  const toggling = useRef(false);
  const drawRef = useRef(draw.draw);
  drawRef.current = draw.draw;

  function wake() {
    setIdle(false);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setIdle(true), 3000);
  }

  useEffect(() => {
    wake();
    const onFs = () => {
      if (toggling.current) { toggling.current = false; return; }
      if (!document.fullscreenElement) onExit();
    };
    const onKey = (ev) => {
      wake();
      if (ev.key === 'Escape') onExit();
      else if ((ev.key === ' ' || ev.key === 'Enter') && ev.target === document.body) {
        ev.preventDefault();
        drawRef.current();
      } else if (ev.key === 'f' || ev.key === 'F') {
        toggling.current = true; // สลับเต็มจอด้วย F ไม่ต้องออกจากหน้าจอแสดงผล
        setTimeout(() => { toggling.current = false; }, 600);
        if (document.fullscreenElement) document.exitFullscreen?.();
        else Promise.resolve(document.documentElement.requestFullscreen?.()).catch(() => {});
      }
    };
    document.addEventListener('fullscreenchange', onFs);
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointermove', wake);
    return () => {
      document.removeEventListener('fullscreenchange', onFs);
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointermove', wake);
      clearTimeout(timer.current);
      if (document.fullscreenElement) Promise.resolve(document.exitFullscreen?.()).catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onExit]);

  return (
    <section
      id="display"
      className={`view is-active fade-in${idle ? ' idle' : ''}`}
      aria-label="จอแสดงผล"
      onClick={(ev) => { if (!ev.target.closest('button')) drawRef.current(); }}
    >
      <button type="button" className="btn btn-ghost exit" onClick={onExit}>
        <span className="exit-long">ออกจากจอแสดงผล (Esc)</span>
        <span className="exit-short" aria-hidden="true">✕ ออก</span>
      </button>
      <WishCard card={draw.card} phase={draw.phase} seq={draw.seq} cardRef={draw.cardRef} wheelItems={draw.wheelItems} winnerIndex={draw.winnerIndex} xl />
      <div className="display-bar">
        <button type="button" className="btn btn-red btn-big" disabled={draw.drawing} onClick={draw.draw}>
          จับฉลาก
        </button>
        <p className="muted" aria-live="polite">{remainText(state.entries, state.history, state.noRepeat)}</p>
      </div>
    </section>
  );
}
