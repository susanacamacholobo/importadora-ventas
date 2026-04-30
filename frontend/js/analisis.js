// ── ANÁLISIS ──
export async function cargarAnalisis(API_URL) {
  try {
    const [resCats, resProv, resCrit] = await Promise.all([
      fetch(`${API_URL}/analisis/por-categoria`),
      fetch(`${API_URL}/analisis/por-proveedor`),
      fetch(`${API_URL}/analisis/stock-critico`)
    ]);

    const cats  = await resCats.json();
    const provs = await resProv.json();
    const crits = await resCrit.json();

    // Métricas resumen
    const valorTotal    = cats.reduce((s, c) => s + (c.valor_total || 0), 0);
    const unidadesTotal = cats.reduce((s, c) => s + (c.stock_total || 0), 0);
    const topCat        = cats.filter(c => c.categoria !== 'Varios')[0];

    document.getElementById('val-total').textContent    = 'Bs. ' + Math.round(valorTotal).toLocaleString();
    document.getElementById('val-cats').textContent     = cats.length;
    document.getElementById('val-top-cat').textContent  = topCat ? topCat.categoria : '—';
    document.getElementById('val-unidades').textContent = Math.round(unidadesTotal).toLocaleString();

    // Gráfica categorías — barras horizontales
    const topCats = cats.filter(c => c.categoria && c.valor_total > 0 && c.categoria !== 'Varios')
                    .slice(0, 8);
    const maxVal  = Math.max(...topCats.map(c => c.valor_total));

    document.getElementById('chart-categorias').innerHTML = topCats.map(c => `
      <div class="bar-wrap">
        <span class="bar-label" style="font-size:11px">${c.categoria.replace(' y ', ' & ')}</span>
        <div class="bar-bg">
          <div class="bar-fill" style="width:${Math.round(c.valor_total/maxVal*100)}%;background:#7C3AED"></div>
        </div>
        <span style="font-size:11px;min-width:60px;text-align:right">Bs.${Math.round(c.valor_total).toLocaleString()}</span>
      </div>
    `).join('');

    // Gráfica proveedores
    const topProvs = provs.filter(p => p.num_productos > 0).slice(0, 8);
    const maxProv  = Math.max(...topProvs.map(p => p.valor_total));
    const colores  = ['#4C1D95','#6D28D9','#7C3AED','#9333EA','#A855F7','#C084FC','#DDD6FE','#EDE9FE'];

    document.getElementById('chart-proveedores').innerHTML = topProvs.map((p, i) => `
      <div class="bar-wrap">
        <span class="bar-label" style="font-size:11px">${p.proveedor}</span>
        <div class="bar-bg">
          <div class="bar-fill" style="width:${Math.round(p.valor_total/maxProv*100)}%;background:${colores[i]}"></div>
        </div>
        <span style="font-size:11px;min-width:60px;text-align:right">${p.num_productos} prods</span>
      </div>
    `).join('');

    // Tabla stock crítico
    document.getElementById('tabla-criticos').innerHTML = crits.length === 0
      ? '<p style="font-size:13px;color:var(--text2);padding:8px 0">No hay productos en stock crítico.</p>'
      : crits.map(p => `
          <div class="order-row" style="grid-template-columns:2fr 1fr 1fr 0.5fr">
            <span style="font-size:12px">${p.nombre.substring(0,40)}${p.nombre.length > 40 ? '...' : ''}</span>
            <span style="font-size:12px">${p.categoria || 'Sin cat.'}</span>
            <span style="font-size:12px">${p.proveedor || '—'}</span>
            <span class="status ${p.stock_total === 0 ? 's-pendiente' : 's-enviado'}">${p.stock_total} u.</span>
          </div>
        `).join('');

    // Recomendación IA basada en datos reales
    const sinStock   = crits.filter(p => p.stock_total === 0).length;
    const bajoProv   = topProvs[0];
    document.getElementById('ai-recomendacion').innerHTML = `
      Se detectan <b>${crits.length} productos con stock crítico</b> (≤5 unidades), 
      de los cuales <b>${sinStock} están completamente agotados</b>.<br><br>
      El proveedor con mayor valor en inventario es <b>${bajoProv?.proveedor || '—'}</b> 
      con Bs. ${Math.round(bajoProv?.valor_total || 0).toLocaleString()} en stock.<br><br>
      Recomendación: priorizar reposición de productos en categorías 
      <b>${topCats[0]?.categoria || '—'}</b> y <b>${topCats[1]?.categoria || '—'}</b> 
      que representan el mayor valor del inventario.
    `;

  } catch(err) {
    console.error('Error cargando análisis:', err);
  }
}