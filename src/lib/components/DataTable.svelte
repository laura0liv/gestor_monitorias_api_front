<script>
  /**
   * DataTable.svelte — Componente genérico de tabla CRUD
   *
   * Props:
   *   data        {Array}   - Array de objetos a mostrar
   *   columns     {Array}   - [{ key, label, render? }]
   *   porPagina   {number}  - Filas por página (default 8)
   *   searchKeys  {Array}   - Claves del objeto por las que filtrar
   *   exportName  {string}  - Nombre base del archivo al exportar
   *   cargando    {boolean} - Muestra estado de carga
   *   emptyText   {string}  - Texto cuando no hay resultados
   *
   * Slots:
   *   acciones    - Recibe {row} para renderizar botones por fila
   *   toolbar     - Contenido extra en la barra (ej: botón "Asignar")
   */
  import { exportCSV, exportJSON, exportPDF } from '$lib/utils/dataTableUtils.js';

  let {
    data          = [],
    columns       = [],
    porPagina     = 8,
    searchKeys    = [],
    exportName    = 'datos',
    cargando      = false,
    emptyText     = 'No hay registros',
    exportHeaders = null,
    // Snippets — deben declararse aquí para que Svelte 5 los reconozca
    acciones      = null,
    toolbar       = null,
  } = $props();

  let searchQuery  = $state('');
  let paginaActual = $state(1);

  // Filtrado reactivo
  let filtrados = $derived(
    data.filter(row =>
      searchKeys.length === 0
        ? true
        : searchKeys.some(key =>
            String(row[key] ?? '')
              .toLowerCase()
              .includes(searchQuery.toLowerCase())
          )
    )
  );

  let totalPaginas = $derived(Math.max(1, Math.ceil(filtrados.length / porPagina)));

  let pagina = $derived(
    filtrados.slice((paginaActual - 1) * porPagina, paginaActual * porPagina)
  );

  // Resetear página al buscar
  $effect(() => {
    searchQuery;
    paginaActual = 1;
  });

  // Helpers paginación
  function ir(p) { paginaActual = Math.max(1, Math.min(p, totalPaginas)); }

  // Helpers exportación
  const getHeaders = () =>
    exportHeaders ?? columns.map(c => c.label);

  const getRows = () =>
    filtrados.map(row =>
      columns.map(col =>
        col.exportRender
          ? col.exportRender(row)
          : row[col.key] ?? ''
      )
    );

  function onCSV()  { exportCSV(getHeaders(), getRows(), exportName); }
  function onJSON() { exportJSON(filtrados, exportName); }
  function onPDF()  { exportPDF(getHeaders(), getRows(), exportName, filtrados.length); }
</script>

<div class="dt-wrap">

  <!-- Toolbar: búsqueda + exportar + slot extra -->
  <div class="dt-toolbar">
    <div class="dt-search-wrap">
      <i class="ti ti-search dt-search-icon" aria-hidden="true"></i>
      <input
        class="dt-search"
        placeholder="Buscar…"
        bind:value={searchQuery}
        aria-label="Buscar en la tabla"
      />
    </div>

    <span class="dt-count">
      {filtrados.length} resultado{filtrados.length !== 1 ? 's' : ''}
    </span>

    <div class="dt-export-group">
      <button class="dt-btn-export csv" type="button" onclick={onCSV}
        title="Exportar CSV">
        <i class="ti ti-file-type-csv" aria-hidden="true"></i> CSV
      </button>
      <button class="dt-btn-export json" type="button" onclick={onJSON}
        title="Exportar JSON">
        <i class="ti ti-braces" aria-hidden="true"></i> JSON
      </button>
      <button class="dt-btn-export pdf" type="button" onclick={onPDF}
        title="Imprimir / PDF">
        <i class="ti ti-printer" aria-hidden="true"></i> PDF
      </button>
    </div>

    <!-- Slot para acciones extra en la toolbar (ej: botón "Asignar") -->
    {@render toolbar?.()}
  </div>

  <!-- Tabla -->
  {#if cargando}
    <div class="dt-state">
      <i class="ti ti-loader-2" aria-hidden="true"></i> Cargando…
    </div>

  {:else if filtrados.length === 0}
    <div class="dt-state">
      {searchQuery ? `Sin resultados para "${searchQuery}"` : emptyText}
    </div>

  {:else}
    <div class="dt-table-wrap">
      <table class="dt-table">
        <thead>
          <tr>
            <th>#</th>
            {#each columns as col}
              <th>{col.label}</th>
            {/each}
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {#each pagina as row, i}
            <tr>
              <td class="dt-muted">
                {(paginaActual - 1) * porPagina + i + 1}
              </td>

              {#each columns as col}
                <td>
                  {#if col.render}
                    {@html col.render(row)}
                  {:else}
                    {row[col.key] ?? '—'}
                  {/if}
                </td>
              {/each}

              <td class="dt-actions-cell">
                {@render acciones?.({ row })}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    <!-- Paginación -->
    {#if totalPaginas > 1}
      <div class="dt-pagination">
        <span class="dt-pagination-info">
          {(paginaActual - 1) * porPagina + 1}–{Math.min(paginaActual * porPagina, filtrados.length)}
          de {filtrados.length}
        </span>

        <div class="dt-pagination-controls">
          <button class="dt-page-btn" onclick={() => ir(1)}
            disabled={paginaActual === 1} aria-label="Primera página">«</button>
          <button class="dt-page-btn" onclick={() => ir(paginaActual - 1)}
            disabled={paginaActual === 1} aria-label="Página anterior">‹</button>

          {#each Array.from({ length: totalPaginas }, (_, i) => i + 1) as p}
            {#if p === 1 || p === totalPaginas || (p >= paginaActual - 1 && p <= paginaActual + 1)}
              <button
                class="dt-page-btn"
                class:active={p === paginaActual}
                onclick={() => ir(p)}
                aria-label="Página {p}"
                aria-current={p === paginaActual ? 'page' : undefined}
              >{p}</button>
            {:else if p === paginaActual - 2 || p === paginaActual + 2}
              <span class="dt-dots">…</span>
            {/if}
          {/each}

          <button class="dt-page-btn" onclick={() => ir(paginaActual + 1)}
            disabled={paginaActual === totalPaginas} aria-label="Página siguiente">›</button>
          <button class="dt-page-btn" onclick={() => ir(totalPaginas)}
            disabled={paginaActual === totalPaginas} aria-label="Última página">»</button>
        </div>
      </div>
    {/if}
  {/if}

</div>