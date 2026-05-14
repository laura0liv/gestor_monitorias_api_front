<script>
  import { onMount } from 'svelte';
  import { API } from '$lib/services/api';
  import DataTable from '$lib/components/DataTable.svelte';
  import '$lib/styles/data-table.css';
  import '$lib/styles/crud-tutores.css';

  // ─── Estado ───────────────────────────────────────────────────────────────
  let tutores              = $state([]);
  let materias             = $state([]);
  let cargando             = $state(false);
  let cargandoAsignacion   = $state(false);
  let error                = $state('');
  let successMsg           = $state('');
  let monitorSeleccionado  = $state('');
  let materiaSeleccionada  = $state('');

  // ─── Columnas ─────────────────────────────────────────────────────────────
  // La columna "materias" usa {@html} en DataTable, por eso devuelve HTML.
  // Los botones ✕ usan data-attributes; el click se captura por delegación
  // en el contenedor padre (onclick={onTableClick}).
  const columns = [
    {
      key:   'nombre',
      label: 'Tutor',
      render: row => `
        <div class="tutor-info">
          <div class="avatar">${row.nombre[0]}${row.apellido[0]}</div>
          <span class="tutor-name">${row.nombre} ${row.apellido}</span>
        </div>`,
      exportRender: row => `${row.nombre} ${row.apellido}`,
    },
    {
      key:   'materias',
      label: 'Materias asignadas',
      render: row => {
        if (!row.materias?.length) {
          return '<span class="empty-text">Sin materias</span>';
        }
        return row.materias.map(m => `
          <span class="materia-badge">
            ${m.nombre_materia}
            <button
              class="badge-close"
              type="button"
              title="Quitar materia"
              aria-label="Quitar materia"
              data-monitor="${row.id_usuario}"
              data-materia="${m.id_materia}"
            >✕</button>
          </span>`).join('');
      },
      exportRender: row =>
        (row.materias ?? []).map(m => m.nombre_materia).join(', '),
    },
  ];

  // El buscador del DataTable filtra por estas claves del objeto tutor.
  // Como "materias" es un array anidado, añadimos una clave auxiliar
  // "materias_texto" que construimos al cargar.
  const searchKeys = ['nombre', 'apellido', 'materias_texto'];

  // ─── Delegación de eventos para los botones ✕ dentro del {@html} ──────────
  function onTableClick(e) {
    const btn = e.target.closest('.badge-close');
    if (!btn) return;
    eliminarAsignacion(Number(btn.dataset.monitor), Number(btn.dataset.materia));
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────
  // Añade "materias_texto" a cada tutor para que el buscador encuentre
  // materias por nombre sin lógica extra en DataTable.
  function normalizarTutores(lista) {
    return lista.map(t => ({
      ...t,
      materias_texto: (t.materias ?? []).map(m => m.nombre_materia).join(' '),
    }));
  }

  function flash(msg) {
    successMsg = msg;
    setTimeout(() => { successMsg = ''; }, 3000);
  }

  // ─── API ──────────────────────────────────────────────────────────────────
  async function cargarTutores() {
    cargando = true; error = '';
    try {
      const res = await fetch(`${API}/monitor_materia/get_monitors_and_subjects/`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      tutores = normalizarTutores(await res.json());
    } catch (e) { error = e.message; }
    finally { cargando = false; }
  }

  async function cargarMaterias() {
    try {
      const res = await fetch(`${API}/materia/get_all_materia/`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      materias = await res.json();
    } catch (e) { error = e.message; }
  }

  async function asignarMateria() {
    if (!monitorSeleccionado || !materiaSeleccionada) {
      error = 'Selecciona tutor y materia'; return;
    }
    cargandoAsignacion = true; error = '';
    try {
      const res = await fetch(`${API}/monitor_materia/create_monitor_materia`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_monitor: Number(monitorSeleccionado),
          id_materia: Number(materiaSeleccionada),
        }),
      });
      const data = await res.json();
      if (data.message && !data.id_monitor) {
        error = data.message;
      } else {
        flash('Materia asignada correctamente');
      }
      await cargarTutores();
      monitorSeleccionado = ''; materiaSeleccionada = '';
    } catch (e) { error = e.message; }
    finally { cargandoAsignacion = false; }
  }

  async function eliminarAsignacion(id_monitor, id_materia) {
    if (!confirm('¿Quitar esta materia del tutor?')) return;
    try {
      const res = await fetch(
        `${API}/monitor_materia/delete_monitor_materia?id_monitor=${id_monitor}&id_materia=${id_materia}`,
        { method: 'DELETE' }
      );
      if (!res.ok) throw new Error('Error al eliminar');
      flash('Materia eliminada');
      await cargarTutores();
    } catch (e) { error = e.message; }
  }

  onMount(() => { cargarTutores(); cargarMaterias(); });
</script>

<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
<div class="crud-page" onclick={onTableClick}>

  <!-- ── Encabezado ── -->
  <div class="crud-header">
    <div>
      <h1 class="crud-title">Gestión de tutorías</h1>
      <p class="crud-subtitle">Asigna materias a los tutores</p>
    </div>
    <span class="crud-badge">{tutores.length} tutores</span>
  </div>

  <!-- ── Alertas ── -->
  {#if error}
    <div class="alert alert-danger">
      <span>{error}</span>
      <button class="alert-close" type="button" aria-label="Cerrar alerta"
        onclick={() => error = ''}>✕</button>
    </div>
  {/if}
  {#if successMsg}
    <div class="alert alert-success">{successMsg}</div>
  {/if}

  <!--
    DataTable con slot "toolbar" para el formulario de asignación.
    La tabla no tiene columna de acciones por fila (los ✕ van dentro
    del render de la columna "materias"), así que el slot acciones
    se omite — DataTable igual renderiza la celda pero vacía.
  -->
  <DataTable
    data={tutores}
    {columns}
    {searchKeys}
    {cargando}
    exportName="tutores"
    emptyText="No hay tutores registrados"
  >
    <!-- Slot toolbar: formulario de asignación dentro de la barra de la tabla -->
    {#snippet toolbar()}
      <div class="asignar-inline">

        <select bind:value={monitorSeleccionado} class="asignar-select">
          <option value="">Seleccionar tutor…</option>
          {#each tutores as t}
            <option value={t.id_usuario}>{t.nombre} {t.apellido}</option>
          {/each}
        </select>

        <select bind:value={materiaSeleccionada} class="asignar-select">
          <option value="">Seleccionar materia…</option>
          {#each materias as m}
            <option value={m.id_materia}>{m.nombre_materia}</option>
          {/each}
        </select>

        <button
          class="btn btn-success"
          type="button"
          onclick={asignarMateria}
          disabled={cargandoAsignacion}
        >
          {cargandoAsignacion ? 'Asignando…' : 'Asignar'}
        </button>

      </div>
    {/snippet}
  </DataTable>

</div>
