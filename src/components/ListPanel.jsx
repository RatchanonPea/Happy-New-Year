import { useState } from 'react';

export default function ListPanel({ hidden = false, entries, history, onImport, onAdd, onUpdate, onSwap, onRenumber, onRemove, onClear }) {
  const [text, setText] = useState('');
  const [replace, setReplace] = useState(false);
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const done = new Set(history.map((h) => h.id));
  const [importOpen, setImportOpen] = useState(false); // ใช้พับเก็บเฉพาะบนมือถือ
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editNumber, setEditNumber] = useState('');
  const [dragId, setDragId] = useState(null);
  const [overId, setOverId] = useState(null);

  function startEdit(e) {
    setEditId(e.id); setEditName(e.name); setEditNumber(e.number);
  }
  function saveEdit(ev) {
    ev.preventDefault();
    if (onUpdate(editId, editName, editNumber)) setEditId(null);
  }
  function onDragStart(ev, e) {
    setEditId(null);
    setDragId(e.id);
    if (ev.dataTransfer) {
      ev.dataTransfer.effectAllowed = 'move';
      ev.dataTransfer.setData('text/plain', e.id);
      const row = ev.currentTarget.closest('li');
      if (row && ev.dataTransfer.setDragImage) ev.dataTransfer.setDragImage(row, 24, 22);
    }
  }
  function endDrag() { setDragId(null); setOverId(null); }
  function onRowDragOver(ev, e) {
    if (!dragId || dragId === e.id) return;
    ev.preventDefault();
    if (ev.dataTransfer) ev.dataTransfer.dropEffect = 'move';
    if (overId !== e.id) setOverId(e.id);
  }
  function onRowDrop(ev, e) {
    ev.preventDefault();
    if (dragId && dragId !== e.id) onSwap(dragId, e.id);
    endDrag();
  }

  async function onFile(ev) {
    const f = ev.target.files[0];
    ev.target.value = '';
    if (!f) return;
    try {
      onImport(await f.text(), replace);
    } catch {
      onImport(null, replace, 'อ่านไฟล์ไม่ได้ ลองบันทึกเป็น .csv หรือ .txt (UTF-8)');
    }
  }

  function submitImport() {
    if (onImport(text, replace)) setText('');
  }

  function submitAdd(ev) {
    ev.preventDefault();
    if (onAdd(name, number)) { setName(''); setNumber(''); }
  }

  return (
    <section className={`panel list-panel${hidden ? ' tab-hidden' : ''}`} aria-labelledby="listTitle">
      <h2 id="listTitle">รายชื่อและเลข</h2>

      <form className="row add-form" autoComplete="off" onSubmit={submitAdd}>
        <input type="text" placeholder="ชื่อ" aria-label="ชื่อ" value={name} onChange={(e) => setName(e.target.value)} />
        <input type="text" inputMode="numeric" placeholder="เลข" title="เว้นว่างไว้ ระบบรันเลขให้" aria-label="เลข" value={number} onChange={(e) => setNumber(e.target.value)} />
        <button type="submit" className="btn btn-ghost add-btn">เพิ่ม</button>
      </form>
      <p className="hint">เว้นเลขว่างไว้ ระบบจะรันเลขต่อให้อัตโนมัติ</p>

      <div className="list-head">
        <span className="muted">{entries.length ? `${entries.length} รายการ` : ''}</span>
        {entries.length > 0 && (
          <span className="list-tools">
            <button type="button" className="link" onClick={onRenumber}>รันเลขใหม่ 1–{entries.length}</button>
            <button type="button" className="link" onClick={onClear}>ลบทั้งหมด</button>
          </span>
        )}
      </div>

      {entries.length === 0 ? (
        <p className="empty">ยังไม่มีรายชื่อ เพิ่มชื่อด้านบน หรือนำเข้าหลายรายชื่อด้านล่าง</p>
      ) : (
        <ul className="list" aria-label="รายชื่อที่นำเข้า">
          {entries.map((e) => {
            const who = e.name || e.number;
            if (editId === e.id) {
              return (
                <li key={e.id} className="editing">
                  <form className="edit-row" onSubmit={saveEdit} onKeyDown={(ev) => { if (ev.key === 'Escape') setEditId(null); }}>
                    <input type="text" aria-label="แก้ชื่อ" value={editName} onChange={(ev) => setEditName(ev.target.value)} autoFocus />
                    <input type="text" inputMode="numeric" aria-label="แก้เลข" value={editNumber} onChange={(ev) => setEditNumber(ev.target.value)} />
                    <button type="submit" className="btn btn-mint">บันทึก</button>
                    <button type="button" className="btn btn-ghost" onClick={() => setEditId(null)}>ยกเลิก</button>
                  </form>
                </li>
              );
            }
            const cls = `${done.has(e.id) ? 'done' : ''}${dragId === e.id ? ' dragging' : ''}${overId === e.id ? ' drag-over' : ''}`.trim();
            return (
              <li key={e.id} className={cls || undefined} onDragOver={(ev) => onRowDragOver(ev, e)} onDragLeave={() => { if (overId === e.id) setOverId(null); }} onDrop={(ev) => onRowDrop(ev, e)}>
                <button type="button" className="grip" draggable aria-label={`ลากเพื่อสลับเลข ${who}`} title="ลากไปวางบนอีกแถวเพื่อสลับเลข" onDragStart={(ev) => onDragStart(ev, e)} onDragEnd={endDrag}>⋮⋮</button>
                <span className="nm">
                  {e.name || '(ไม่มีชื่อ)'}
                  {done.has(e.id) && <span className="tag">จับแล้ว</span>}
                </span>
                <span className="no">{e.number}</span>
                <button type="button" className="icon" aria-label={`แก้ไข ${who}`} onClick={() => startEdit(e)}>✎</button>
                <button type="button" className="del" aria-label={`ลบ ${who}`} onClick={() => onRemove(e.id)}>✕</button>
              </li>
            );
          })}
        </ul>
      )}
      <div className={`import-box${importOpen ? ' open' : ''}`}>
        <button type="button" className="import-toggle" aria-expanded={importOpen} onClick={() => setImportOpen((v) => !v)}>
          <span>นำเข้าหลายรายชื่อ</span><span className="chev" aria-hidden="true">▾</span>
        </button>
        <div className="import-body">
      <label htmlFor="importText" className="field-label">วางรายชื่อ หนึ่งบรรทัดต่อหนึ่งคน (ชื่อ, เลข)</label>
      <textarea
        id="importText" rows={5} value={text} onChange={(e) => setText(e.target.value)}
        placeholder={'สมชาย ใจดี, 12\nสมหญิง รักสุข, 7\nมานะ, 25'}
      />
      <div className="row">
        <button type="button" className="btn btn-mint" onClick={submitImport}>นำเข้า</button>
        <label className="check">
          <input type="checkbox" checked={replace} onChange={(e) => setReplace(e.target.checked)} /> แทนที่รายการเดิม
        </label>
        <label className="btn btn-ghost file">
          เลือกไฟล์ .csv / .txt
          <input type="file" accept=".csv,.txt,text/csv,text/plain" hidden onChange={onFile} />
        </label>
      </div>

        </div>
      </div>
    </section>
  );
}
