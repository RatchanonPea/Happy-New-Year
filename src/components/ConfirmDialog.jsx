import { useEffect, useRef } from 'react';
import { COLORS } from '../lib/confetti.js';

const BULBS = Array.from({ length: 12 }, (_, i) => COLORS[i % COLORS.length]);

/** กล่องยืนยันของเราเอง (แทน window.confirm): กวางเรนเดียร์ + สายไฟประดับ */
export default function ConfirmDialog({ title, message, confirmLabel = 'ตกลง', cancelLabel = 'ยกเลิก', onConfirm, onCancel }) {
  const cancelRef = useRef(null);

  useEffect(() => {
    const prev = document.activeElement;
    cancelRef.current?.focus();
    const onKey = (ev) => {
      if (ev.key === 'Escape') { ev.stopPropagation(); onCancel(); }
    };
    document.addEventListener('keydown', onKey, true);
    return () => {
      document.removeEventListener('keydown', onKey, true);
      if (prev && prev.focus) prev.focus();
    };
  }, [onCancel]);

  return (
    <div className="dlg-scrim" onClick={(ev) => { if (ev.target === ev.currentTarget) onCancel(); }}>
      <div className="dlg" role="alertdialog" aria-modal="true" aria-labelledby="dlgTitle" aria-describedby="dlgMsg">
        <div className="dlg-lights" aria-hidden="true">
          {BULBS.map((c, i) => <b key={i} style={{ '--c': c, animationDelay: `${(i % 6) * 0.25}s` }} />)}
        </div>
        <svg className="dlg-deer" viewBox="0 0 120 110" aria-hidden="true">
          <g fill="none" stroke="#c9985a" strokeWidth="5" strokeLinecap="round">
            <path d="M40 34L30 12M30 12L18 16M30 12L28 2M80 34L90 12M90 12L102 16M90 12L92 2" />
          </g>
          <ellipse cx="30" cy="40" rx="11" ry="7" fill="#a8703c" transform="rotate(-25 30 40)" />
          <ellipse cx="90" cy="40" rx="11" ry="7" fill="#a8703c" transform="rotate(25 90 40)" />
          <ellipse cx="60" cy="62" rx="36" ry="38" fill="#c98c52" />
          <ellipse cx="60" cy="78" rx="22" ry="17" fill="#f1d3a8" />
          <circle cx="45" cy="56" r="5" fill="#2a1b4d" /><circle cx="75" cy="56" r="5" fill="#2a1b4d" />
          <circle cx="46.8" cy="54" r="1.7" fill="#fff" /><circle cx="76.8" cy="54" r="1.7" fill="#fff" />
          <circle cx="36" cy="68" r="6" fill="#ff8fa8" opacity=".6" /><circle cx="84" cy="68" r="6" fill="#ff8fa8" opacity=".6" />
          <circle cx="60" cy="74" r="8" fill="#f0405f" /><circle cx="57.5" cy="71.5" r="2.4" fill="#ffd0d8" />
          <path d="M52 86q8 6 16 0" stroke="#7a4420" strokeWidth="2.6" fill="none" strokeLinecap="round" />
        </svg>
        <h2 id="dlgTitle">{title}</h2>
        <p id="dlgMsg">{message}</p>
        <div className="dlg-actions">
          <button type="button" ref={cancelRef} className="btn btn-ghost" onClick={onCancel}>{cancelLabel}</button>
          <button type="button" className="btn btn-red" onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
