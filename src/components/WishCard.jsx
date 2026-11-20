import Wheel from './Wheel.jsx';
import { getGreetingYear } from '../lib/year.js';

/**
 * พื้นที่แสดงผลการจับฉลาก
 * - ระหว่างรอ (idle) และระหว่างหมุน (spinning): วงล้อ (ถ้ามี 2–24 ช่อง)
 * - ประกาศผล (landed) หรือรายชื่อน้อย/มากเกินไป: การ์ดอวยพร
 */
export default function WishCard({ card, phase, seq, xl = false, cardRef, wheelItems, winnerIndex }) {
  const spinning = phase === 'spinning';
  if (wheelItems && (spinning || phase === 'idle')) {
    return <Wheel items={wheelItems} winnerIndex={winnerIndex} mode={spinning ? 'spin' : 'idle'} xl={xl} />;
  }
  // หลังประกาศผล: วงล้อยังอยู่ แต่ตัดผู้ชนะออกจากวงแล้ว (wheelItems คิดจากรายชื่อที่เหลือ)
  const showWheelBelow = wheelItems && phase === 'landed';

  const who = card ? card.who : 'พร้อมจับฉลาก';
  const num = card ? card.num : '';
  const wish = card ? card.wish : 'กดปุ่ม “จับฉลาก” เพื่อเริ่ม';
  const cls = ['card', phase === 'rolling' && 'rolling', phase === 'landed' && 'landed'].filter(Boolean).join(' ');

  const cardEl = (
    <div className={`card-slot${xl ? ' card-xl' : ''}`}>
      <article key={phase === 'landed' ? seq : 'x'} ref={cardRef} className={cls}>
        <p className="greet">สุขสันต์วันปีใหม่ {getGreetingYear().be}</p>
        <div className="mid">
          <div className="who">{who}</div>
          <div className="num">{num}</div>
        </div>
        <p className="wish">{wish}</p>
        <span className="sr-only" role="status">
          {phase === 'landed' && card ? `ผลการจับ ${card.who}${card.num ? ` เลข ${card.num}` : ''}` : ''}
        </span>
      </article>
    </div>
  );
  if (!showWheelBelow) return cardEl;
  return (
    <>
      {cardEl}
      <Wheel items={wheelItems} winnerIndex={0} mode="idle" xl={xl} compact />
    </>
  );
}
