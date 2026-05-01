export const exportToCsv = ({ filename, rows }) => {
  const safe = (value) => {
    const s = String(value ?? '');
    if (s.includes('"') || s.includes(',') || s.includes('\n')) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  const normalizedRows = Array.isArray(rows) ? rows : [];
  const headers = normalizedRows.length ? Object.keys(normalizedRows[0]) : [];
  const lines = [
    headers.map(safe).join(','),
    ...normalizedRows.map((row) => headers.map((h) => safe(row[h])).join(',')),
  ];

  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || 'report.csv';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

export const exportHtmlToPdfViaPrint = ({ title, html }) => {
  const w = window.open('', '_blank', 'noopener,noreferrer');
  if (!w) return;
  w.document.open();
  w.document.write(`<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${String(title || 'Report')}</title>
    <style>
      body { font-family: ui-sans-serif, system-ui, -apple-system; padding: 24px; color: #111827; }
      h1 { margin: 0 0 12px 0; font-size: 18px; }
      table { width: 100%; border-collapse: collapse; margin-top: 12px; }
      th, td { border: 1px solid #e5e7eb; padding: 8px; font-size: 12px; text-align: left; }
      th { background: #f3f4f6; }
      .meta { color: #6b7280; font-size: 12px; margin-bottom: 12px; }
    </style>
  </head>
  <body>
    ${html || ''}
  </body>
</html>`);
  w.document.close();
  w.focus();
  w.print();
};

