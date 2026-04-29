export function stripWpBlocks(html) {
  if (!html) return '';
  return html
    .replace(/<!-- \/?wp:[^>]* -->/g, '')
    .replace(/<\/?figure[^>]*>/g, '')
    // Make all internal cmcenters.org links root-relative so they work on any environment
    .replace(/https?:\/\/(?:www\.)?cmcenters\.org/g, '')
    // Demote h1 → h2: every page already has its own <h1> in the page header (WCAG 1.3.1)
    .replace(/<h1(\s[^>]*)?>/gi, '<h2$1>')
    .replace(/<\/h1>/gi, '</h2>')
    // Add alt="" to any <img> missing an alt attribute (WCAG 1.1.1)
    .replace(/<img\b([^>]*)>/gi, (match, attrs) =>
      /\balt=/i.test(attrs) ? match : `<img${attrs} alt="">`)
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
