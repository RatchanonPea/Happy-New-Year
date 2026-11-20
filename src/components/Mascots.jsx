import { useMemo } from 'react';

/** มาสคอตน่ารักที่โผล่มาเกาะริบบิ้นเหนือชื่อผู้ชนะ (หัว + อุ้งมือจับขอบ) */
const Paws = ({ color }) => (
  <g fill={color}>
    <ellipse cx="34" cy="108" rx="14" ry="9" />
    <ellipse cx="86" cy="108" rx="14" ry="9" />
  </g>
);

const Eyes = ({ y = 64 }) => (
  <g>
    <circle cx="47" cy={y} r="4.6" fill="#2a1b4d" /><circle cx="73" cy={y} r="4.6" fill="#2a1b4d" />
    <circle cx="48.6" cy={y - 1.6} r="1.5" fill="#fff" /><circle cx="74.6" cy={y - 1.6} r="1.5" fill="#fff" />
  </g>
);

const Cheeks = ({ y = 76 }) => (
  <g fill="#ff8fa8" opacity=".6"><circle cx="37" cy={y} r="5.5" /><circle cx="83" cy={y} r="5.5" /></g>
);

const KINDS = [
  function Reindeer() {
    return (
      <>
        <g fill="none" stroke="#c9985a" strokeWidth="5" strokeLinecap="round">
          <path d="M42 30L32 10M32 10L20 14M32 10L30 1M78 30L88 10M88 10L100 14M88 10L90 1" />
        </g>
        <ellipse cx="30" cy="38" rx="11" ry="7" fill="#a8703c" transform="rotate(-25 30 38)" />
        <ellipse cx="90" cy="38" rx="11" ry="7" fill="#a8703c" transform="rotate(25 90 38)" />
        <ellipse cx="60" cy="62" rx="35" ry="36" fill="#c98c52" />
        <ellipse cx="60" cy="78" rx="21" ry="16" fill="#f1d3a8" />
        <Eyes y={58} /><Cheeks y={70} />
        <circle cx="60" cy="74" r="8" fill="#f0405f" /><circle cx="57.5" cy="71.5" r="2.4" fill="#ffd0d8" />
        <path d="M52 86q8 6 16 0" stroke="#7a4420" strokeWidth="2.6" fill="none" strokeLinecap="round" />
        <Paws color="#a8703c" />
      </>
    );
  },
  function Elf() {
    return (
      <>
        <path d="M30 60L8 48l10 24z" fill="#ffd9b8" /><path d="M90 60l22-12-10 24z" fill="#ffd9b8" />
        <circle cx="60" cy="70" r="32" fill="#ffd9b8" />
        <path d="M26 58C28 30 46 12 76 8c-6 10-4 20 2 28C60 32 42 40 38 58z" fill="#2fae7f" />
        <path d="M30 54c10-8 54-8 62 0v8c-10-8-52-8-62 0z" fill="#f0405f" />
        <circle cx="80" cy="10" r="7" fill="#ffc857" />
        <Eyes y={72} /><Cheeks y={82} />
        <path d="M52 88q8 7 16 0" stroke="#c42246" strokeWidth="3" fill="none" strokeLinecap="round" />
        <Paws color="#2fae7f" />
      </>
    );
  },
  function Santa() {
    return (
      <>
        <circle cx="60" cy="68" r="31" fill="#ffd9b8" />
        <path d="M29 68c0 22 14 36 31 36s31-14 31-36c-8 10-19 14-31 14s-23-4-31-14z" fill="#fffbf2" />
        <path d="M44 80c8 8 24 8 32 0 0 10-8 14-16 14s-16-4-16-14z" fill="#fffbf2" />
        <Eyes y={66} /><Cheeks y={76} />
        <circle cx="60" cy="73" r="5.5" fill="#f4a58a" />
        <path d="M27 48C27 24 45 6 69 6C87 6 99 18 105 36C98 31 91 29 84 31C89 38 92 43 93 48z" fill="#e0385a" />
        <rect x="21" y="42" width="78" height="17" rx="8.5" fill="#fffbf2" />
        <circle cx="105" cy="36" r="9.5" fill="#fffbf2" />
        <Paws color="#e0385a" />
      </>
    );
  },
  function Snowman() {
    return (
      <>
        <circle cx="60" cy="68" r="34" fill="#fff" /><path d="M60 34a34 34 0 0 1 0 68a40 34 0 0 0 0-68z" fill="#d9e6ff" opacity=".7" />
        <rect x="36" y="12" width="48" height="30" rx="4" fill="#2a1b4d" /><rect x="36" y="32" width="48" height="6" fill="#f0405f" />
        <rect x="26" y="40" width="68" height="8" rx="4" fill="#2a1b4d" />
        <circle cx="47" cy="64" r="4" fill="#2a1b4d" /><circle cx="73" cy="64" r="4" fill="#2a1b4d" />
        <path d="M58 70L84 74L58 80z" fill="#ff9a4d" />
        <g fill="#2a1b4d"><circle cx="44" cy="84" r="2" /><circle cx="52" cy="88" r="2" /><circle cx="64" cy="89" r="2" /><circle cx="73" cy="85" r="2" /></g>
        <Cheeks y={76} />
        <path d="M28 92q32 14 64 0v10q-32 14-64 0z" fill="#f0405f" />
        <Paws color="#2a1b4d" />
      </>
    );
  },
  function Penguin() {
    return (
      <>
        <circle cx="60" cy="68" r="34" fill="#2e2a68" />
        <ellipse cx="60" cy="76" rx="24" ry="22" fill="#fffbf2" />
        <Eyes y={66} /><Cheeks y={78} />
        <path d="M51 72L69 72L60 84z" fill="#ff9a4d" />
        <path d="M30 44C32 22 48 8 66 10C80 12 90 24 92 44z" fill="#e0385a" />
        <rect x="26" y="40" width="68" height="13" rx="6.5" fill="#fffbf2" />
        <circle cx="68" cy="10" r="8" fill="#fffbf2" />
        <Paws color="#2e2a68" />
      </>
    );
  }
];

/** สุ่มมาสคอตหนึ่งตัวต่อการประกาศผลหนึ่งครั้ง (เปลี่ยนเมื่อ key เปลี่ยน) */
export function useMascotIndex(key) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => Math.floor(Math.random() * KINDS.length), [key]);
}

export default function Mascot({ index }) {
  const Kind = KINDS[index % KINDS.length];
  return (
    <svg className="mascot" viewBox="0 0 120 116" aria-hidden="true"><Kind /></svg>
  );
}
