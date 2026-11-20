/**
 * ปีที่ใช้ในคำอวยพร คำนวณจากวันที่ของเครื่อง (ไม่มีฐานข้อมูล จึงไม่ฟิกปีไว้ในโค้ด)
 * พ.ย.–ธ.ค. = กำลังจะข้ามไปปีหน้า → ใช้ปีถัดไป, ม.ค.–ต.ค. → ใช้ปีปัจจุบัน
 * คืน { ce: ค.ศ., be: พ.ศ. }
 */
export function getGreetingYear(now = new Date()) {
  const ce = now.getFullYear() + (now.getMonth() >= 10 ? 1 : 0);
  return { ce, be: ce + 543 };
}
