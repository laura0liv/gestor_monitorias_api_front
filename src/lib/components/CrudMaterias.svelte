<script>
  import { onMount } from "svelte";

  let materias = $state([]);
  let cargando = $state(false);
  let error    = $state("");
  let success  = $state("");
  let editando = $state(false);

  let materia = $state({
    id_materia: null, nombre_materia: "",
    codigo_materia: "", creditos: "", id_programa: ""
  });

  const API = "http://127.0.0.1:8000";

  async function cargarMaterias() {
    cargando = true; error = "";
    try {
      const res = await fetch(`${API}/materia/get_all_materia/`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      materias = await res.json();
    } catch (e) { error = e.message; }
    finally { cargando = false; }
  }

  onMount(cargarMaterias);

  async function crearMateria() {
    try {
      const res = await fetch(`${API}/materia/create_materia/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(materia)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const nueva = await res.json();
      materias = [...materias, nueva];
      limpiar(); flash("Materia creada correctamente");
    } catch (e) { error = e.message; }
  }

  function editarMateria(m) { materia = { ...m }; editando = true; }

  async function actualizarMateria() {
    try {
      const res = await fetch(`${API}/materia/update_materia/${materia.id_materia}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(materia)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const act = await res.json();
      materias = materias.map(m => m.id_materia === act.id_materia ? act : m);
      limpiar(); flash("Materia actualizada");
    } catch (e) { error = e.message; }
  }

  async function eliminarMateria(id) {
    if (!confirm("¿Eliminar esta materia?")) return;
    try {
      await fetch(`${API}/materia/delete_materia/${id}`, { method: "DELETE" });
      materias = materias.filter(m => m.id_materia !== id);
      flash("Materia eliminada");
    } catch (e) { error = e.message; }
  }

  function limpiar() {
    materia = { id_materia: null, nombre_materia: "", codigo_materia: "", creditos: "", id_programa: "" };
    editando = false;
  }

  function flash(msg) { success = msg; setTimeout(() => success = "", 3000); }
  function enviar(e) { e.preventDefault(); editando ? actualizarMateria() : crearMateria(); }

  let totalCreditos = $derived(materias.reduce((s, m) => s + Number(m.creditos || 0), 0));
</script>

<div class="page">

  <div class="page-header">
    <div>
      <h1 class="page-title">Gestión de materias</h1>
      <p class="page-sub">Crea y administra el catálogo de materias</p>
    </div>
    <span class="badge-pill">{materias.length} materias</span>
  </div>

  <div class="stats-grid">
    <div class="stat"><div class="stat-label">Total materias</div><div class="stat-val">{materias.length}</div></div>
    <div class="stat"><div class="stat-label">Total créditos</div><div class="stat-val">{totalCreditos}</div></div>
  </div>

  {#if error}
    <div class="alert alert-danger">
      {error}
      <button class="alert-close" onclick={() => error = ""}>✕</button>
    </div>
  {/if}
  {#if success}
    <div class="alert alert-success">{success}</div>
  {/if}

  <div class="card">
    <div class="form-panel">
      <div class="panel-label">{editando ? "Editar materia" : "Agregar nueva materia"}</div>
      <form onsubmit={enviar}>
        <div class="form-row">
          <div class="field">
            <label>Nombre materia</label>
            <input bind:value={materia.nombre_materia} required />
          </div>
          <div class="field">
            <label>Código</label>
            <input bind:value={materia.codigo_materia} required />
          </div>
          <div class="field">
            <label>Créditos</label>
            <input type="number" bind:value={materia.creditos} required />
          </div>
          <div class="field">
            <label>ID Programa</label>
            <input type="number" bind:value={materia.id_programa} required />
          </div>
          <div class="field field-actions">
            <label>&nbsp;</label>
            <div style="display:flex;gap:6px">
              <button type="submit" class="btn btn-success">
                {editando ? "Guardar" : "Crear"}
              </button>
              {#if editando}
                <button type="button" class="btn btn-ghost" onclick={limpiar}>Cancelar</button>
              {/if}
            </div>
          </div>
        </div>
      </form>
    </div>

    {#if cargando}
      <div class="loading">Cargando materias...</div>
    {:else if materias.length === 0}
      <div class="empty">No hay materias registradas</div>
    {:else}
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Materia</th>
            <th>Código</th>
            <th>Créditos</th>
            <th>Programa</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {#each materias as m, i}
            <tr>
              <td class="muted">{i + 1}</td>
              <td class="fw">{m.nombre_materia}</td>
              <td><span class="code-badge">{m.codigo_materia}</span></td>
              <td>{m.creditos}</td>
              <td>{m.id_programa}</td>
              <td>
                <button class="act-btn warn" onclick={() => editarMateria(m)}>Editar</button>
                <button class="act-btn danger" onclick={() => eliminarMateria(m.id_materia)}>Eliminar</button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    {/if}
  </div>
</div>

<style>
  .page { padding: 1.5rem; background: var(--color-background-tertiary, #f5f5f3); min-height: 100vh; }
  .page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 1.25rem; }
  .page-title { font-size: 18px; font-weight: 500; margin: 0 0 3px; }
  .page-sub { font-size: 13px; color: #888; margin: 0; }
  .badge-pill { background: #E1F5EE; color: #085041; font-size: 11px; font-weight: 500; padding: 4px 12px; border-radius: 20px; }

  .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 1.25rem; }
  .stat { background: #fff; border: 0.5px solid rgba(0,0,0,0.08); border-radius: 10px; padding: .75rem 1rem; }
  .stat-label { font-size: 11px; color: #888; margin-bottom: 4px; }
  .stat-val { font-size: 22px; font-weight: 500; }

  .alert { display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; border-radius: 8px; font-size: 13px; margin-bottom: 1rem; }
  .alert-danger { background: #FCEBEB; color: #A32D2D; border: 0.5px solid #F09595; }
  .alert-success { background: #E1F5EE; color: #085041; border: 0.5px solid #5DCAA5; }
  .alert-close { background: none; border: none; cursor: pointer; font-size: 14px; color: inherit; }

  .card { background: #fff; border: 0.5px solid rgba(0,0,0,0.08); border-radius: 12px; overflow: hidden; }
  .form-panel { padding: 1rem 1.25rem; background: #fafafa; border-bottom: 0.5px solid rgba(0,0,0,0.08); }
  .panel-label { font-size: 11px; font-weight: 500; color: #888; margin-bottom: 10px; text-transform: uppercase; letter-spacing: .04em; }

  .form-row { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr auto; gap: 8px; align-items: end; }
  .field { display: flex; flex-direction: column; gap: 4px; }
  .field label { font-size: 11px; color: #666; font-weight: 500; }
  .field input { height: 32px; padding: 0 10px; border: 0.5px solid rgba(0,0,0,0.15); border-radius: 7px; font-size: 13px; background: #fff; font-family: inherit; width: 100%; }
  .field input:focus { outline: none; border-color: #1D9E75; box-shadow: 0 0 0 2px rgba(29,158,117,0.1); }

  .btn { height: 32px; padding: 0 14px; border-radius: 7px; font-size: 13px; font-weight: 500; cursor: pointer; border: none; }
  .btn-success { background: #1D9E75; color: #fff; }
  .btn-success:hover { background: #0F6E56; }
  .btn-ghost { background: #f0f0f0; color: #555; }

  table { width: 100%; border-collapse: collapse; }
  thead th { font-size: 11px; font-weight: 500; color: #888; padding: 9px 1.25rem; text-align: left; border-bottom: 0.5px solid rgba(0,0,0,0.08); background: #fafafa; }
  tbody tr { border-bottom: 0.5px solid rgba(0,0,0,0.06); }
  tbody tr:last-child { border-bottom: none; }
  tbody tr:hover { background: #fafafa; }
  td { padding: 10px 1.25rem; font-size: 13px; vertical-align: middle; }
  .muted { color: #aaa; font-size: 12px; }
  .fw { font-weight: 500; }

  .code-badge { background: #E6F1FB; color: #0C447C; font-size: 11px; padding: 2px 9px; border-radius: 20px; font-weight: 500; }

  .act-btn { background: none; border: none; cursor: pointer; font-size: 12px; font-weight: 500; padding: 4px 8px; border-radius: 5px; }
  .act-btn.warn { color: #854F0B; }
  .act-btn.warn:hover { background: #FAEEDA; }
  .act-btn.danger { color: #A32D2D; }
  .act-btn.danger:hover { background: #FCEBEB; }

  .loading, .empty { padding: 2.5rem; text-align: center; color: #aaa; font-size: 13px; }
</style>