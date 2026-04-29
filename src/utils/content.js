export function stripWpBlocks(html) {
  if (!html) return '';
  return html
    .replace(/<!-- \/?wp:[^>]* -->/g, '')
    .replace(/<\/?figure[^>]*>/g, '')
    // Make all internal cmcenters.org links root-relative so they work on any environment
    .replace(/https?:\/\/(?:www\.)?cmcenters\.org/g, '')
    .trim();
}

export function formatPhone(phone) {
  if (!phone) return '';
  const digits = phone.replace(/[^\d]/g, '');
  if (digits.length === 10) return `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`;
  return phone;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export function getHours(meta) {
  const rows = [];
  for (let i = 1; i <= 7; i++) {
    const enabled = meta[`enableday${i}`];
    if (enabled === '1' || enabled === 1) {
      rows.push({
        day: DAYS[i - 1],
        open: meta[`open${i}`] || '',
        close: meta[`close${i}`] || '',
      });
    }
  }
  return rows;
}

export function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}
