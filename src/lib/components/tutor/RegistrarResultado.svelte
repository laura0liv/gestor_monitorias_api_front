<script>
  import { onMount } from "svelte";

  let { idTutor } = $props();

  const API = "http://127.0.0.1:8000";
  let sesiones  = $state([]);
  let cargando  = $state(false);
  let guardando = $state(false);
  let error     = $state("");
  let success   = $state("");

  // Sesión seleccionada
  let sesionId   = $state("");
  let resultado  = $state({
    temas_vistos:   "",
    observaciones:  "",
    asistio:        true,
    calificacion:   ""
  });

  onMount(async () => {
    cargando = true;
    try {
      // Solo sesiones confirmadas sin resultado todavía
      const res = await fetch(`${API}/sesion/get_sesiones_tutor/${idTutor}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const todas = await res.json();
      sesiones = todas.filter(s => s.estado === "confirmada");
    } catch (e) { error = e.message; }
    finally { cargando = false; }
  });

  async function enviar(e) {
    e.preventDefault();
    if (!sesionId) { error = "Selecciona una sesión"; return; }
    guardando = true; error = "";
    try {
      const res = await fetch(`${API}/sesion/registrar_resultado/${sesionId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...resultado, id_monitor: idTutor })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      success = "Resultado registrado correctamente";
      setTimeout(() => success = "", 3000);
      // Quitar sesión de la lista
      sesiones = sesiones.filter(s => s.id_sesion !== Number(sesionId));
      sesionId = "";
      resultado = { temas_vistos:"", observaciones:"", asistio:true, calificacion:"" };
    } catch (e) { error = e.message; }
    finally { guardando = false; }
  }

  let sesionActual = $derived(sesiones.find(s => String(s.id_sesion) === String(sesionId)));
</script>

<div class="page">

  <div class="page-header">
    <div>
      <h2 class="section-title">Registrar resultado de sesión</h2>
      <p class="section-sub">Completa el resultado de tus monitorías confirmadas</p>
    </div>
    <span class="badge-pill">{sesiones.length} pendientes por registrar</span>
  </div>

  {#if error}
    <div class="alert alert-danger">{error}<button class="alert-close" onclick={() => error=""}>✕</button></div>
  {/if}
  {#if success}
    <div class="alert alert-success">{success}</div>
  {/if}

  <div class="two-col">

    <!-- SELECTOR DE SESIÓN -->
    <div class="card">
      <div class="card-header-inner">Seleccionar sesión</div>
      {#if cargando}
        <div class="loading">Cargando...</div>
      {:else if sesiones.length === 0}
        <div class="empty-small">No hay sesiones confirmadas pendientes</div>
      {:else}
        <div class="sesion-list">
          {#each sesiones as s}
            <button
              class="sesion-item"
              class:active={String(sesionId) === String(s.id_sesion)}
              onclick={() => sesionId = String(s.id_sesion)}
            >
              <div class="sesion-materia">{s.nombre_materia ?? "—"}</div>
              <div class="sesion-meta">
                {s.nombre_estudiante ?? "—"} · {s.fecha ?? "—"} {s.hora_inicio ?? ""}
              </div>
            </button>
          {/each}
        </div>
      {/if}
    </div>

    <!-- FORMULARIO RESULTADO -->
    <div class="card">
      <div class="card-header-inner">Datos del resultado</div>

      {#if !sesionId}
        <div class="empty-small">Selecciona una sesión para continuar</div>
      {:else}
        <!-- Info de la sesión seleccionada -->
        {#if sesionActual}
          <div class="sesion-preview">
            <div class="sp-row"><span>Materia</span><strong>{sesionActual.nombre_materia}</strong></div>
            <div class="sp-row"><span>Estudiante</span><strong>{sesionActual.nombre_estudiante}</strong></div>
            <div class="sp-row"><span>Fecha</span><strong>{sesionActual.fecha} {sesionActual.hora_inicio}</strong></div>
          </div>
        {/if}

        <form onsubmit={enviar} class="result-form">
          <div class="field">
            <label>Temas vistos</label>
            <textarea bind:value={resultado.temas_vistos} rows="3" placeholder="Describe los temas tratados en la sesión..." required></textarea>
          </div>
          <div class="field">
            <label>Observaciones</label>
            <textarea bind:value={resultado.observaciones} rows="2" placeholder="Notas adicionales (opcional)..."></textarea>
          </div>
          <div class="field-row">
            <div class="field">
              <label>Calificación (0–5)</label>
              <input type="number" min="0" max="5" step="0.1" bind:value={resultado.calificacion} placeholder="Ej: 4.5" />
            </div>
            <div class="field">
              <label>Asistencia</label>
              <select bind:value={resultado.asistio}>
                <option value={true}>Asistió</option>
                <option value={false}>No asistió</option>
              </select>
            </div>
          </div>
          <button type="submit" class="btn btn-primary" disabled={guardando}>
            {guardando ? "Guardando..." : "Registrar resultado"}
          </button>
        </form>
      {/if}
    </div>

  </div>
</div>

<style>
  .page { display:flex; flex-direction:column; gap:1.25rem; }
  .page-header { display:flex; align-items:flex-start; justify-content:space-between; }
  .section-title { font-size:16px; font-weight:500; margin:0 0 3px; }
  .section-sub { font-size:13px; color:#888; margin:0; }
  .badge-pill { background:#FAEEDA; color:#633806; font-size:11px; font-weight:500; padding:4px 12px; border-radius:20px; white-space:nowrap; }

  .alert { display:flex; align-items:center; justify-content:space-between; padding:10px 14px; border-radius:8px; font-size:13px; }
  .alert-danger  { background:#FCEBEB; color:#A32D2D; border:0.5px solid #F09595; }
  .alert-success { background:#E1F5EE; color:#085041; border:0.5px solid #5DCAA5; }
  .alert-close   { background:none; border:none; cursor:pointer; font-size:14px; color:inherit; }

  .two-col { display:grid; grid-template-columns:1fr 1.6fr; gap:1rem; }
  .card { background:#fff; border:0.5px solid rgba(0,0,0,0.08); border-radius:12px; overflow:hidden; }
  .card-header-inner { font-size:11px; font-weight:500; color:#888; text-transform:uppercase; letter-spacing:.04em; padding:.75rem 1.25rem; background:#fafafa; border-bottom:0.5px solid rgba(0,0,0,0.08); }

  .loading { padding:2rem; text-align:center; color:#aaa; font-size:13px; }
  .empty-small { padding:1.5rem 1.25rem; color:#aaa; font-size:13px; }

  .sesion-list { display:flex; flex-direction:column; }
  .sesion-item {
    display:flex; flex-direction:column; align-items:flex-start;
    padding:.75rem 1.25rem; border:none; background:transparent; cursor:pointer; text-align:left;
    border-bottom:0.5px solid rgba(0,0,0,0.06); transition:background .12s;
  }
  .sesion-item:last-child { border-bottom:none; }
  .sesion-item:hover { background:#fafafa; }
  .sesion-item.active { background:#E1F5EE; }
  .sesion-materia { font-size:13px; font-weight:500; color:#111; }
  .sesion-meta    { font-size:11px; color:#888; margin-top:2px; }

  .sesion-preview { padding:.75rem 1.25rem; border-bottom:0.5px solid rgba(0,0,0,0.08); display:flex; flex-direction:column; gap:5px; }
  .sp-row { display:flex; gap:8px; font-size:12px; }
  .sp-row span { color:#888; min-width:72px; }

  .result-form { padding:1rem 1.25rem; display:flex; flex-direction:column; gap:12px; }
  .field { display:flex; flex-direction:column; gap:4px; }
  .field label { font-size:11px; font-weight:500; color:#666; }
  .field input, .field select, .field textarea {
    padding:7px 10px; border:0.5px solid rgba(0,0,0,0.15); border-radius:7px;
    font-size:13px; font-family:inherit; background:#fff; color:inherit; resize:vertical;
  }
  .field input:focus, .field select:focus, .field textarea:focus {
    outline:none; border-color:#010A55; box-shadow:0 0 0 2px rgba(1,10,85,.08);
  }
  .field-row { display:grid; grid-template-columns:1fr 1fr; gap:8px; }

  .btn { height:34px; padding:0 16px; border-radius:8px; font-size:13px; font-weight:500; cursor:pointer; border:none; }
  .btn-primary { background:#010A55; color:#fff; }
  .btn-primary:hover { background:#020d6e; }
  .btn:disabled { opacity:.6; cursor:not-allowed; }
</style>