import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// jsdom ไม่มี canvas / matchMedia จริง: ใช้ reduced-motion เพื่อข้ามแอนิเมชันในเทสต์
beforeEach(() => {
  localStorage.clear();
  window.matchMedia = vi.fn().mockImplementation((q) => ({
    matches: q.includes('reduce'), media: q, addEventListener() {}, removeEventListener() {}
  }));
  HTMLCanvasElement.prototype.getContext = () => null;
});

afterEach(() => cleanup());
