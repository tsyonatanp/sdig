// המרת תאריך לעברית
export const getHebrewDate = (date) => {
  const hebrewMonths = [
    'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
    'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
  ];

  const hebrewDays = [
    'ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'
  ];

  const day = hebrewDays[date.getDay()];
  const dayOfMonth = date.getDate();
  const month = hebrewMonths[date.getMonth()];
  const year = date.getFullYear();

  return `${day} ${dayOfMonth} ב${month} ${year}`;
};

// המרת זמן לעברית
export const getHebrewTime = (date) => {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  
  return `${hours}:${minutes}:${seconds}`;
}; 