/**
 * dataTableUtils.js
 * Funciones puras de exportación para DataTable.svelte.
 * No dependen de Svelte — se pueden usar en cualquier vista.
 *
 * @param {string[]} headers  - Cabeceras de columna
 * @param {any[][]}  rows     - Filas como arrays de valores
 * @param {string}   name     - Nombre base del archivo
 */

// ─── CSV ─────────────────────────────────────────────────────────────────────

export function exportCSV(headers, rows, name = 'datos') {
  const escape = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const csv = [headers, ...rows]
    .map(row => row.map(escape).join(','))
    .join('\n');
  descargar(csv, `${name}.csv`, 'text/csv;charset=utf-8;');
}

// ─── JSON ─────────────────────────────────────────────────────────────────────

export function exportJSON(data, name = 'datos') {
  descargar(JSON.stringify(data, null, 2), `${name}.json`, 'application/json');
}

// ─── PDF (ventana de impresión) ───────────────────────────────────────────────

export function exportPDF(headers, rows, name = 'datos', total = rows.length) {
  const filas = rows
    .map(
      (row, i) => `<tr>${[i + 1, ...row]
        .map(v => `<td>${v ?? ''}</td>`)
        .join('')}</tr>`
    )
    .join('');

  const fecha = new Date().toLocaleDateString('es-CO');

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>${name}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 32px; color: #1a1a2e; }
    h1   { font-size: 20px; margin: 0 0 4px; }
    p    { font-size: 12px; color: #666; margin: 0 0 18px; }
    table{ width: 100%; border-collapse: collapse; font-size: 13px; }
    th   { background: #1a1a2e; color: #fff; padding: 9px 12px; text-align: left; }
    td   { padding: 8px 12px; border-bottom: 1px solid #e5e7eb; }
    tr:nth-child(even) td { background: #f8fafc; }
    .foot{ margin-top: 16px; font-size: 11px; color: #aaa; }
  </style>
</head>
<body>
  <h1>${name}</h1>
  <p>${total} registros · ${fecha}</p>
  <table>
    <thead><tr><th>#</th>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
    <tbody>${filas}</tbody>
  </table>
  <div class="foot">Sistema de Monitorías</div>
</body>
</html>`;

  const win = window.open('', '_blank');
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.print();
}

// ─── Descarga genérica ────────────────────────────────────────────────────────

function descargar(contenido, nombre, tipo) {
  const blob = new Blob([contenido], { type: tipo });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = nombre;
  a.click();
  URL.revokeObjectURL(url);
}