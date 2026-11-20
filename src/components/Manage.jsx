import { useState } from 'react';
import WishCard from './WishCard.jsx';
import { getGreetingYear } from '../lib/year.js';
import ListPanel from './ListPanel.jsx';
import { remainText } from '../lib/entries.js';

export default function Manage({ state, draw, list, actions, onOpenDisplay }) {
  const { entries, history, noRepeat } = state;
  const [tab, setTab] = useState('draw'); // ใช้เฉพาะบนมือถือ (จอกว้างแสดงทั้งสองแผง)

  return (
    <section id="manage" className="view is-active fade-in" aria-label="จัดการและจับฉลาก">
      <header className="top">
        <div className="brand">
          <span className="spark sp1" aria-hidden="true">✦</span>
          <span className="spark sp2" aria-hidden="true">✧</span>
          <span className="spark sp3" aria-hidden="true">✦</span>
          <h1>
            <span className="th">Happy New Year</span>
            <span className="year">{getGreetingYear().ce}</span>
            <span className="th-sub">สุขสันต์ปีใหม่ {getGreetingYear().be}</span>
          </h1>
        </div>
        <button type="button" className="btn btn-gold fs" onClick={onOpenDisplay}>
          <span aria-hidden="true">⛶</span> <span className="fs-label">เปิดจอแสดงผลเต็มจอ</span>
        </button>
      </header>

      <div className="layout">
        <section className={`panel draw-panel${tab === 'draw' ? '' : ' tab-hidden'}`} aria-labelledby="drawTitle">
          <h2 id="drawTitle">จับฉลาก</h2>
          <WishCard card={draw.card} phase={draw.phase} seq={draw.seq} cardRef={draw.cardRef} wheelItems={draw.wheelItems} winnerIndex={draw.winnerIndex} />
          <div className="draw-actions">
            <button type="button" className="btn btn-red btn-big" disabled={draw.drawing} onClick={draw.draw}>
              จับฉลาก
            </button>
            {history.length > 0 && (
              <button type="button" className="btn btn-ghost" disabled={draw.drawing} onClick={actions.resetHistory}>รีเซ็ตผลการจับ</button>
            )}
          </div>
          <div className="draw-meta">
            <label className="check">
              <input type="checkbox" checked={noRepeat} onChange={(e) => actions.setNoRepeat(e.target.checked)} /> ไม่จับซ้ำคนเดิม
            </label>
            <p className="muted" aria-live="polite">{remainText(entries, history, noRepeat)}</p>
          </div>

          <div className="history-head">
            <h3>ผลที่จับได้</h3>
          </div>
          <ol className="history" aria-label="ผลที่จับได้">
            {history.map((h, i) => (
              <li key={`${h.id}-${h.at}-${i}`}>
                <b>{h.name || h.number}</b>
                {h.name && h.number && <span className="hn">{h.number}</span>}
              </li>
            ))}
          </ol>
        </section>

        <ListPanel entries={entries} history={history} hidden={tab !== 'list'} {...list} />
      </div>

      <nav className="tabbar" role="tablist" aria-label="เมนู">
        <button type="button" role="tab" aria-selected={tab === 'draw'} className={tab === 'draw' ? 'on' : ''} onClick={() => setTab('draw')}>
          <span aria-hidden="true">🎡</span> จับฉลาก
        </button>
        <button type="button" role="tab" aria-selected={tab === 'list'} className={tab === 'list' ? 'on' : ''} onClick={() => setTab('list')}>
          <span aria-hidden="true">📝</span> รายชื่อ{entries.length ? ` (${entries.length})` : ''}
        </button>
      </nav>
    </section>
  );
}
