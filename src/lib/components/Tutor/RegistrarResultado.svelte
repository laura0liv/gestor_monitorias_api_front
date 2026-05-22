<script>
  import { onMount } from "svelte";
  import { API } from '$lib/services/api';

  let { idTutor } = $props();

  let sesiones  = $state([]);
  let cargando  = $state(false);
  let guardando = $state(false);
  let error     = $state("");
  let success   = $state("");

  let sesionId     = $state("");
  let asistencia   = $state(true);
  let observaciones = $state("");

  onMount(async () => {
    cargando = true;
    error    = "";
    try {
      // Trae todas las monitorías del tutor y filtra las Programadas
      const res = await fetch(`${API}/monitorias/tutor/${idTutor}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      sesiones = data.filter(m => (m.estado ?? "").toLowerCase() === "programada");
    } catch (e) {
      error = e.message;
    } finally {
      cargando = false;
    }
  });

  let sesionActual = $derived(
    sesiones.find(s => String(s.id_monitoria) === String(sesionId)) ?? null
  );

  function hhmm(t) { return (t ?? "").slice(0, 5); }

  function formatFecha(f) {
    if (!f) return "—";
    return new Date(f).toLocaleDateString("es-CO", {
      weekday: "short", day: "2-digit", month: "short", year: "numeric"
    });
  }

  function resetForm() {
    sesionId      = "";
    asistencia    = true;
    observaciones = "";
  }

  async function enviar() {
    if (!sesionId) { error = "Selecciona una sesión"; return; }

    guardando = true;
    error     = "";
    success   = "";

    try {
      const res = await fetch(
        `${API}/monitorias/${sesionId}/asistencia/tutor/${idTutor}`,
        {
          method:  "PATCH",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({
            asistencia,
            observaciones: observaciones.trim() || null
          })
        }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail ?? `HTTP ${res.status}`);
      }

      // Quitar de la lista y resetear
      sesiones = sesiones.filter(s => String(s.id_monitoria) !== String(sesionId));
      resetForm();

      success = asistencia
        ? "Resultado registrado. La monitoría quedó como Completada."
        : "Inasistencia registrada. La monitoría quedó como Cancelada.";
      setTimeout(() => success = "", 4000);

    } catch (e) {
      error = e.message;
    } finally {
      guardando = false;
    }
  }
</script>

<div class="page">

  <!-- HEADER -->
  <div class="page-header">
    <div>
      <h2 class="section-title">Registrar resultado de sesión</h2>
      <p class="section-sub">Completa la asistencia de tus monitorías programadas</p>
    </div>
    <span class="badge-pill">
      {sesiones.length} {sesiones.length === 1 ? "sesión pendiente" : "sesiones pendientes"}
    </span>
  </div>

  <!-- ALERTAS -->
  {#if error}
    <div class="alert alert-danger">
      {error}
      <button class="alert-close" onclick={() => error = ""}>✕</button>
    </div>
  {/if}
  {#if success}
    <div class="alert alert-success">
      <i class="bi bi-check-circle"></i>
      {success}
    </div>
  {/if}

  {#if cargando}
    <div class="loading-wrap">
      <div class="spinner"></div>
      <span>Cargando sesiones programadas...</span>
    </div>

  {:else if sesiones.length === 0}
    <div class="empty-state">
      <i class="bi bi-calendar-check empty-icon"></i>
      <div class="empty-title">Sin sesiones programadas</div>
      <div class="empty-sub">Las monitorías aceptadas que debas completar aparecerán aquí</div>
    </div>

  {:else}
    <div class="two-col">

      <!-- ── LISTA DE SESIONES ── -->
      <div class="card">
        <div class="card-header-inner">
          <i class="bi bi-list-ul"></i>
          Sesiones programadas
        </div>
        <div class="sesion-list">
          {#each sesiones as s}
            <button
              class="sesion-item"
              class:active={String(sesionId) === String(s.id_monitoria)}
              onclick={() => { sesionId = String(s.id_monitoria); error = ""; }}
            >
              <div class="sesion-top">
                <span class="sesion-materia">{s.nombre_materia ?? "—"}</span>
                <span class="sesion-modalidad">{s.modalidad ?? ""}</span>
              </div>
              <div class="sesion-meta">
                <span><i class="bi bi-person"></i> {s.estudiante ?? "—"}</span>
                <span><i class="bi bi-calendar3"></i> {formatFecha(s.fecha)}</span>
                <span><i class="bi bi-clock"></i> {hhmm(s.hora_inicio)} - {hhmm(s.hora_fin)}</span>
              </div>
            </button>
          {/each}
        </div>
      </div>

      <!-- ── FORMULARIO ── -->
      <div class="card">
        <div class="card-header-inner">
          <i class="bi bi-pencil-square"></i>
          Datos del resultado
        </div>

        {#if !sesionId}
          <div class="empty-small">
            <i class="bi bi-arrow-left-circle" style="font-size:1.5rem;color:#ccc"></i>
            <span>Selecciona una sesión para continuar</span>
          </div>

        {:else}

          <!-- Preview de la sesión seleccionada -->
          {#if sesionActual}
            <div class="sesion-preview">
              <div class="sp-row">
                <div class="avatar">
                  {(sesionActual.estudiante ?? "?")[0].toUpperCase()}
                </div>
                <div class="sp-info">
                  <span class="sp-nombre">{sesionActual.estudiante ?? "—"}</span>
                  <span class="sp-materia">{sesionActual.nombre_materia ?? "—"}</span>
                </div>
              </div>
              <div class="sp-meta">
                <span><i class="bi bi-calendar3"></i> {formatFecha(sesionActual.fecha)}</span>
                <span><i class="bi bi-clock"></i> {hhmm(sesionActual.hora_inicio)} - {hhmm(sesionActual.hora_fin)}</span>
                <span><i class="bi bi-geo-alt"></i> {sesionActual.modalidad ?? "—"}</span>
                {#if sesionActual.nombre_aula}
                  <span><i class="bi bi-building"></i> {sesionActual.nombre_aula}</span>
                {/if}
              </div>
            </div>
          {/if}

          <!-- Formulario -->
          <div class="result-form">

            <!-- Asistencia -->
            <div class="field">
              <label>¿El estudiante asistió?</label>
              <div class="asistencia-toggle">
                <button
                  class="toggle-btn"
                  class:selected={asistencia === true}
                  onclick={() => asistencia = true}
                  type="button"
                >
                  <i class="bi bi-check-circle-fill"></i>
                  Sí asistió
                </button>
                <button
                  class="toggle-btn toggle-no"
                  class:selected={asistencia === false}
                  onclick={() => asistencia = false}
                  type="button"
                >
                  <i class="bi bi-x-circle-fill"></i>
                  No asistió
                </button>
              </div>
            </div>

            <!-- Observaciones -->
            <div class="field">
              <label>
                Observaciones
                <span class="label-opt">opcional</span>
              </label>
              <textarea
                bind:value={observaciones}
                rows="4"
                placeholder={asistencia
                  ? "Describe los temas tratados, el desempeño del estudiante, próximos pasos..."
                  : "Indica el motivo de la inasistencia u otras observaciones..."}
              ></textarea>
            </div>

            <!-- Botón -->
            <button
              class="btn btn-primary"
              onclick={enviar}
              disabled={guardando}
            >
              {#if guardando}
                <div class="spinner-sm"></div>
                Guardando...
              {:else}
                <i class="bi bi-check-lg"></i>
                Registrar resultado
              {/if}
            </button>

          </div>
        {/if}
      </div>

    </div>
  {/if}

</div>

<style>
  .page { display:flex; flex-direction:column; gap:1.25rem; }

  .page-header {
    display:flex; align-items:flex-start;
    justify-content:space-between; flex-wrap:wrap; gap:.5rem;
  }
  .section-title { font-size:16px; font-weight:500; margin:0 0 3px; }
  .section-sub   { font-size:13px; color:#888; margin:0; }
  .badge-pill    { background:#FAEEDA; color:#633806; font-size:11px; font-weight:500; padding:4px 12px; border-radius:20px; white-space:nowrap; }

  /* ── ALERTAS ── */
  .alert {
    display:flex; align-items:center; gap:8px;
    justify-content:space-between; padding:10px 14px;
    border-radius:8px; font-size:13px;
  }
  .alert-danger  { background:#FCEBEB; color:#A32D2D; border:.5px solid #F09595; }
  .alert-success { background:#E1F5EE; color:#085041; border:.5px solid #5DCAA5; }
  .alert-close   { background:none; border:none; cursor:pointer; font-size:14px; color:inherit; margin-left:auto; }

  /* ── LOADING / EMPTY ── */
  .loading-wrap {
    display:flex; align-items:center; justify-content:center;
    gap:10px; padding:3rem; color:#aaa; font-size:13px;
  }
  .spinner {
    width:20px; height:20px; border-radius:50%;
    border:2px solid #e0e0e0; border-top-color:#1D9E75;
    animation:spin .7s linear infinite;
  }
  .spinner-sm {
    width:13px; height:13px; border-radius:50%;
    border:2px solid rgba(255,255,255,.3); border-top-color:#fff;
    animation:spin .7s linear infinite;
  }
  @keyframes spin { to { transform:rotate(360deg); } }

  .empty-state {
    background:#fff; border:.5px solid rgba(0,0,0,.08); border-radius:12px;
    padding:3rem; text-align:center; color:#aaa;
  }
  .empty-icon  { font-size:2.5rem; margin-bottom:.75rem; display:block; }
  .empty-title { font-size:14px; font-weight:500; color:#666; margin-bottom:4px; }
  .empty-sub   { font-size:12px; }

  /* ── LAYOUT ── */
  .two-col { display:grid; grid-template-columns:1fr 1.5fr; gap:1rem; align-items:start; }

  /* ── CARD ── */
  .card { background:#fff; border:.5px solid rgba(0,0,0,.08); border-radius:12px; overflow:hidden; }
  .card-header-inner {
    display:flex; align-items:center; gap:6px;
    font-size:11px; font-weight:500; color:#888; text-transform:uppercase; letter-spacing:.04em;
    padding:.75rem 1.25rem; background:#fafafa; border-bottom:.5px solid rgba(0,0,0,.08);
  }

  /* ── LISTA SESIONES ── */
  .sesion-list { display:flex; flex-direction:column; max-height:420px; overflow-y:auto; }

  .sesion-item {
    display:flex; flex-direction:column; gap:6px;
    padding:.875rem 1.25rem; border:none; background:transparent;
    cursor:pointer; text-align:left;
    border-bottom:.5px solid rgba(0,0,0,.06); transition:background .12s;
  }
  .sesion-item:last-child { border-bottom:none; }
  .sesion-item:hover  { background:#fafafa; }
  .sesion-item.active { background:#E1F5EE; border-left:3px solid #1D9E75; }

  .sesion-top { display:flex; align-items:center; justify-content:space-between; gap:8px; }
  .sesion-materia   { font-size:13px; font-weight:600; color:#111; }
  .sesion-modalidad { font-size:10px; background:#EEF0FF; color:#010A55; padding:2px 8px; border-radius:20px; }
  .sesion-meta      { display:flex; flex-direction:column; gap:3px; }
  .sesion-meta span { font-size:11px; color:#888; display:flex; align-items:center; gap:4px; }

  /* ── EMPTY SMALL ── */
  .empty-small {
    display:flex; flex-direction:column; align-items:center; justify-content:center;
    gap:10px; padding:3rem 1.25rem; color:#aaa; font-size:13px; text-align:center;
  }

  /* ── PREVIEW SESIÓN ── */
  .sesion-preview {
    padding:1rem 1.25rem; border-bottom:.5px solid rgba(0,0,0,.08);
    display:flex; flex-direction:column; gap:10px; background:#fafafa;
  }
  .sp-row   { display:flex; align-items:center; gap:10px; }
  .sp-info  { display:flex; flex-direction:column; gap:2px; }
  .sp-nombre  { font-size:13px; font-weight:600; }
  .sp-materia { font-size:12px; color:#1D9E75; font-weight:500; }
  .sp-meta    { display:flex; flex-wrap:wrap; gap:10px; }
  .sp-meta span { display:flex; align-items:center; gap:4px; font-size:12px; color:#666; }

  .avatar {
    width:36px; height:36px; border-radius:50%;
    background:#EEF0FF; color:#010A55;
    display:flex; align-items:center; justify-content:center;
    font-size:14px; font-weight:600; flex-shrink:0;
  }

  /* ── FORMULARIO ── */
  .result-form { padding:1rem 1.25rem; display:flex; flex-direction:column; gap:14px; }

  .field { display:flex; flex-direction:column; gap:5px; }
  .field label {
    font-size:11px; font-weight:600; color:#666; text-transform:uppercase;
    letter-spacing:.03em; display:flex; align-items:center; gap:6px;
  }
  .label-opt { font-weight:400; text-transform:none; color:#aaa; font-size:10px; letter-spacing:0; }

  .field textarea {
    padding:8px 10px; border:.5px solid rgba(0,0,0,.15); border-radius:7px;
    font-size:13px; font-family:inherit; background:#fff; color:inherit;
    resize:vertical; min-height:80px; line-height:1.5;
  }
  .field textarea:focus { outline:none; border-color:#010A55; box-shadow:0 0 0 2px rgba(1,10,85,.06); }

  /* ── TOGGLE ASISTENCIA ── */
  .asistencia-toggle { display:grid; grid-template-columns:1fr 1fr; gap:6px; }

  .toggle-btn {
    display:flex; align-items:center; justify-content:center; gap:6px;
    padding:10px; border-radius:8px; border:.5px solid rgba(0,0,0,.12);
    background:#f5f5f3; font-size:13px; font-weight:500; color:#666;
    cursor:pointer; transition:.15s;
  }
  .toggle-btn:hover { background:#E1F5EE; color:#085041; border-color:#5DCAA5; }
  .toggle-btn.selected { background:#E1F5EE; color:#085041; border-color:#1D9E75; }

  .toggle-no:hover   { background:#FCEBEB; color:#A32D2D; border-color:#F09595; }
  .toggle-no.selected { background:#FCEBEB; color:#A32D2D; border-color:#F09595; }

  /* ── BOTÓN ── */
  .btn {
    display:flex; align-items:center; justify-content:center; gap:6px;
    height:38px; padding:0 16px; border-radius:8px;
    font-size:13px; font-weight:600; border:none; cursor:pointer; transition:.15s;
  }
  .btn-primary  { background:#010A55; color:#fff; }
  .btn-primary:hover:not(:disabled) { background:#020d6e; }
  .btn:disabled { opacity:.6; cursor:not-allowed; }

  /* ── RESPONSIVE ── */
  @media (max-width: 640px) {
    .two-col { grid-template-columns:1fr; }
    .sesion-list { max-height:260px; }
  }
</style>