/** ตัวช่วยเปิดม่าน: กวางเรนเดียร์ (ซ้าย) กับเอลฟ์ (ขวา) */
export function Reindeer() {
  return (
    <svg viewBox="0 0 120 120" aria-hidden="true">
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
  );
}

export function Elf() {
  return (
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <path d="M30 56L8 44l10 24z" fill="#ffd9b8" /><path d="M90 56l22-12-10 24z" fill="#ffd9b8" />
      <circle cx="60" cy="68" r="32" fill="#ffd9b8" />
      <path d="M24 56C26 28 44 10 74 6c-6 10-4 20 2 28C58 30 40 38 36 56z" fill="#2fae7f" />
      <path d="M28 52c10-8 56-8 64 0v8c-10-8-54-8-64 0z" fill="#f0405f" />
      <circle cx="78" cy="8" r="7" fill="#ffc857" />
      <circle cx="48" cy="70" r="4" fill="#2a1b4d" /><circle cx="72" cy="70" r="4" fill="#2a1b4d" />
      <circle cx="49.4" cy="68.6" r="1.3" fill="#fff" /><circle cx="73.4" cy="68.6" r="1.3" fill="#fff" />
      <circle cx="40" cy="80" r="5.5" fill="#ff8fa8" opacity=".65" /><circle cx="80" cy="80" r="5.5" fill="#ff8fa8" opacity=".65" />
      <path d="M52 86q8 7 16 0" stroke="#c42246" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  );
}
