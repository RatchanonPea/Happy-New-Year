import { describe, it, expect, vi } from 'vitest';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App.jsx';
import { getGreetingYear } from './lib/year.js';
import { SPIN_MS } from './lib/wheel.js';

const setup = async (initialView = 'manage') => {
  const user = userEvent.setup();
  render(<App initialView={initialView} />);
  return user;
};

async function importNames(user, text) {
  await user.type(screen.getByLabelText(/วางรายชื่อ/), text);
  await user.click(screen.getByRole('button', { name: 'นำเข้า' }));
}

describe('กล่องของขวัญ', () => {
  it('คลิกกล่องแล้วขึ้น “สวัสดีปีใหม่” ก่อนเข้าหน้าจัดการ', async () => {
    const user = await setup('gift');
    await user.click(screen.getByRole('button', { name: 'เปิดกล่องของขวัญ' }));
    expect(await screen.findByText('สวัสดีปีใหม่')).toBeInTheDocument();
    expect(screen.getByText(`Happy New Year ${getGreetingYear().ce}`)).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: /สุขสันต์ปีใหม่/ }, { timeout: 3000 })).toBeInTheDocument();
  });
});

describe('นำเข้ารายชื่อ', () => {
  it('นำเข้าจากข้อความและแสดงในรายการ', async () => {
    const user = await setup();
    await importNames(user, 'สมชาย, 12{Enter}สมหญิง, 7');
    const list = screen.getByRole('list', { name: 'รายชื่อที่นำเข้า' });
    expect(within(list).getAllByRole('listitem')).toHaveLength(2);
    expect(within(list).getByText('สมชาย')).toBeInTheDocument();
    expect(screen.getByText(/นำเข้า 2 รายการ/)).toBeInTheDocument();
  });

  it('แจ้งเตือนเมื่อไม่มีรายการที่ใช้ได้ และไม่ล้างช่องข้อความ', async () => {
    const user = await setup();
    await importNames(user, ',');
    expect(screen.getByText(/ไม่พบรายการที่นำเข้าได้/)).toBeInTheDocument();
    expect(screen.getByLabelText(/วางรายชื่อ/)).toHaveValue(',');
  });

  it('เพิ่มทีละคน, ลบทีละคน, และไม่รับค่าว่าง', async () => {
    const user = await setup();
    await user.click(screen.getByRole('button', { name: 'เพิ่ม' }));
    expect(screen.getByText(/กรอกชื่อหรือเลข/)).toBeInTheDocument();
    await user.type(screen.getByLabelText('ชื่อ'), 'มานะ');
    await user.type(screen.getByLabelText('เลข'), '5');
    await user.click(screen.getByRole('button', { name: 'เพิ่ม' }));
    expect(screen.getByText('มานะ')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'ลบ มานะ' }));
    expect(screen.queryByText('มานะ')).not.toBeInTheDocument();
  });
});

describe('รันเลข แก้ไข และสลับ', () => {
  const rows = () => within(screen.getByRole('list', { name: 'รายชื่อที่นำเข้า' })).getAllByRole('listitem')
    .map((li) => `${li.querySelector('.nm')?.textContent ?? ''}${li.querySelector('.no')?.textContent ?? ''}`);

  it('ชื่อที่ไม่มีเลขจะถูกรันเลขต่อให้ ทั้งตอนนำเข้าและเพิ่มทีละคน', async () => {
    const user = await setup();
    await importNames(user, 'ก, 7{Enter}ข{Enter}ค');
    expect(rows()).toEqual(['ก7', 'ข8', 'ค9']);
    await user.type(screen.getByLabelText('ชื่อ'), 'ง');
    await user.click(screen.getByRole('button', { name: 'เพิ่ม' }));
    expect(rows()).toEqual(['ก7', 'ข8', 'ค9', 'ง10']);
  });

  it('แก้ชื่อและเลขได้ และเลขที่ซ้ำจะสลับกับอีกคนให้', async () => {
    const user = await setup();
    await importNames(user, 'ก, 1{Enter}ข, 2');
    await user.click(screen.getByRole('button', { name: 'แก้ไข ก' }));
    await user.clear(screen.getByLabelText('แก้ชื่อ'));
    await user.type(screen.getByLabelText('แก้ชื่อ'), 'กอ');
    await user.clear(screen.getByLabelText('แก้เลข'));
    await user.type(screen.getByLabelText('แก้เลข'), '2');
    await user.click(screen.getByRole('button', { name: 'บันทึก' }));
    expect(rows()).toEqual(['ข1', 'กอ2']); // เรียงตามเลขใหม่อัตโนมัติ
  });

  it('ลากที่จับหน้าแถวไปวางบนอีกแถวเพื่อสลับเลข', async () => {
    const user = await setup();
    await importNames(user, 'ก, 5{Enter}ข, 9{Enter}ค, 3');
    const dt = { setData() {}, setDragImage() {}, effectAllowed: '', dropEffect: '' };
    const handle = screen.getByRole('button', { name: 'ลากเพื่อสลับเลข ก' });
    const target = within(screen.getByRole('list', { name: 'รายชื่อที่นำเข้า' })).getAllByRole('listitem')[2];
    fireEvent.dragStart(handle, { dataTransfer: dt });
    fireEvent.dragOver(target, { dataTransfer: dt });
    fireEvent.drop(target, { dataTransfer: dt });
    expect(rows()).toEqual(['ก3', 'ค5', 'ข9']);
  });

  it('รันเลขใหม่ตามลำดับในรายการ', async () => {
    const user = await setup();
    await importNames(user, 'ก, 5{Enter}ข, 9{Enter}ค, 3');
    await user.click(screen.getByRole('button', { name: /รันเลขใหม่/ }));
    expect(rows()).toEqual(['ก1', 'ข2', 'ค3']);
  });
});

describe('จับฉลาก', () => {
  it('ไม่มีรายชื่อ: แจ้งให้นำเข้าก่อน', async () => {
    const user = await setup();
    await user.click(screen.getByRole('button', { name: 'จับฉลาก' }));
    expect(screen.getByText(/ยังไม่มีรายชื่อ นำเข้ารายชื่อก่อน/)).toBeInTheDocument();
  });

  it('โหมดไม่ซ้ำ: จับครบทุกคนโดยไม่ซ้ำ แล้วแจ้งว่าครบ', async () => {
    const user = await setup();
    await importNames(user, 'ก, 1{Enter}ข, 2');
    const btn = screen.getByRole('button', { name: 'จับฉลาก' });
    await user.click(btn);
    await user.click(btn);
    const history = screen.getByRole('list', { name: 'ผลที่จับได้' });
    const names = within(history).getAllByRole('listitem').map((li) => li.querySelector('b').textContent);
    expect(names.sort()).toEqual(['ก', 'ข']);
    expect(screen.getByText('เหลือ 0 จาก 2 รายการ')).toBeInTheDocument();
    await user.click(btn);
    expect(screen.getByText(/จับครบทุกคนแล้ว/)).toBeInTheDocument();
    expect(within(history).getAllByRole('listitem')).toHaveLength(2);
  });

  it('รีเซ็ตผลการจับแล้วจับใหม่ได้', async () => {
    const user = await setup();
    await importNames(user, 'ก, 1');
    await user.click(screen.getByRole('button', { name: 'จับฉลาก' }));
    expect(screen.getByText('จับแล้ว')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'รีเซ็ตผลการจับ' }));
    expect(screen.queryByText('จับแล้ว')).not.toBeInTheDocument();
    expect(screen.getByText('เหลือ 1 จาก 1 รายการ')).toBeInTheDocument();
  });

  it('ปิด “ไม่จับซ้ำ” แล้วจับคนเดิมซ้ำได้', async () => {
    const user = await setup();
    await importNames(user, 'ก, 1');
    await user.click(screen.getByRole('checkbox', { name: /ไม่จับซ้ำ/ }));
    const btn = screen.getByRole('button', { name: 'จับฉลาก' });
    await user.click(btn);
    await user.click(btn);
    const history = screen.getByRole('list', { name: 'ผลที่จับได้' });
    expect(within(history).getAllByRole('listitem')).toHaveLength(2);
  });

  it('ข้อมูลคงอยู่หลังโหลดใหม่ (localStorage)', async () => {
    const user = await setup();
    await importNames(user, 'สมชาย, 12');
    document.body.innerHTML = '';
    const again = await setup();
    expect(again).toBeTruthy();
    expect(screen.getByText('สมชาย')).toBeInTheDocument();
  });
});

describe('วงล้อ', () => {
  const motionOn = () => {
    window.matchMedia = vi.fn().mockImplementation(() => ({ matches: false, addEventListener() {}, removeEventListener() {} }));
  };

  it('ระหว่างรอมีวงล้อแสดงทุกคน (ยังไม่หมุนเร็ว) และปีใน UI มาจากวันที่เครื่อง', async () => {
    motionOn();
    const user = await setup();
    await importNames(user, 'ก, 1{Enter}ข, 2{Enter}ค, 3');
    expect(screen.getByRole('img', { name: 'วงล้อ 3 ช่อง' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(String(getGreetingYear().be));
  });

  it('กดจับแล้วหมุน และปุ่มถูกล็อกจนกว่าจะเสร็จ', async () => {
    motionOn();
    const user = await setup();
    await importNames(user, 'ก, 1{Enter}ข, 2{Enter}ค, 3');
    await user.click(screen.getByRole('button', { name: 'จับฉลาก' }));
    expect(screen.getByRole('img', { name: /กำลังหมุน/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'จับฉลาก' })).toBeDisabled();
  });

  it('คนที่ถูกเลือกถูกตัดออกจากวงล้อ รอบที่ 2 เหลือคนเดียวก็ยังหมุน และจับครบโดยไม่ซ้ำ', async () => {
    motionOn();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<App initialView="manage" />);
      await importNames(user, 'ก, 1{Enter}ข, 2');
      const history = screen.getByRole('list', { name: 'ผลที่จับได้' });
      let firstWinner = null;
      for (const round of [1, 2]) {
        await user.click(screen.getByRole('button', { name: 'จับฉลาก' }));
        // คนที่ถูกเลือกแล้วต้องถูกตัดออกจากวงล้อ: รอบ 1 มี 2 ช่อง รอบ 2 เหลือ 1 ช่อง
        const wheel = screen.getByRole('img', { name: `วงล้อ ${3 - round} ช่อง กำลังหมุน` });
        if (firstWinner) expect(wheel).not.toHaveTextContent(firstWinner);
        await act(async () => { await vi.advanceTimersByTimeAsync(SPIN_MS + 1200); });
        expect(within(history).getAllByRole('listitem')).toHaveLength(round);
        expect(screen.getByRole('button', { name: 'จับฉลาก' })).toBeEnabled();
        firstWinner ??= within(history).getAllByRole('listitem')[0].querySelector('b').textContent;
      }
      const names = within(history).getAllByRole('listitem').map((li) => li.querySelector('b').textContent);
      expect(names.sort()).toEqual(['ก', 'ข']);
    } finally {
      vi.useRealTimers();
    }
  });
});

describe('ยกเลิกระหว่างหมุน', () => {
  it('ลบทั้งหมดระหว่างวงล้อหมุน ผลต้องไม่ถูกบันทึกเป็นคนที่ถูกลบแล้ว', async () => {
    window.matchMedia = vi.fn().mockImplementation(() => ({ matches: false, addEventListener() {}, removeEventListener() {} }));
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<App initialView="manage" />);
      await importNames(user, 'ก, 1{Enter}ข, 2');
      await user.click(screen.getByRole('button', { name: 'จับฉลาก' }));
      await user.click(screen.getByRole('button', { name: 'ลบทั้งหมด' }));
      await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'ลบเลย' }));
      await act(async () => { await vi.advanceTimersByTimeAsync(SPIN_MS + 1500); });
      expect(screen.queryByRole('list', { name: 'ผลที่จับได้' })?.children.length ?? 0).toBe(0);
      expect(screen.getByRole('button', { name: 'จับฉลาก' })).toBeEnabled();
    } finally {
      vi.useRealTimers();
    }
  });
});

describe('จอแสดงผล', () => {
  it('เปิดจอแสดงผล จับด้วยคีย์ Space และออกด้วย Esc', async () => {
    const user = await setup();
    await importNames(user, 'สมชาย, 12');
    await user.click(screen.getByRole('button', { name: 'เปิดจอแสดงผลเต็มจอ' }));
    expect(screen.getByRole('region', { name: 'จอแสดงผล' })).toBeInTheDocument();
    await user.keyboard(' ');
    expect(await screen.findByText('สมชาย', { selector: '.who' })).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.getByRole('region', { name: 'จัดการและจับฉลาก' })).toBeInTheDocument();
    // ผลที่จับยังอยู่ในประวัติหลังกลับมา
    expect(within(screen.getByRole('list', { name: 'ผลที่จับได้' })).getAllByRole('listitem')).toHaveLength(1);
  });
});
