<script>
  import { onMount } from "svelte";
  import { API } from '$lib/services/api';

  let { idTutor } = $props();

  let materias   = $state([]);
  let pendientes = $state([]);
  let cargando   = $state(false);
  let error      = $state("");

  // Por monitoría: estado de aceptación en curso
  let aceptando  = $state({});   // { [id_monitoria]: true | false }
  let feedbacks  = $state({});   // { [id_monitoria]: { ok: bool, msg: string } }

  onMount(async () => {
    cargando = true;
    error    = "";

    try {
      const [resMat, resPend] = await Promise.all([
        fetch(`${API}/monitor_materia/get_materias_by_monitor/${idTutor}`),
        fetch(`${API}/monitorias/tutor/${idTutor}/pendientes`)
      ]);

      if (!resMat.ok)  throw new Error(`HTTP ${resMat.status} al cargar materias`);
      if (!resPend.ok) throw new Error(`HTTP ${resPend.status} al cargar pendientes`);

      const dataMat  = await resMat.json();
      const dataPend = await resPend.json();

      materias   = dataMat.materias ?? [];
      pendientes = dataPend ?? [];

    } catch (e) {
      error = e.message;
    } finally {
      cargando = false;
    }
  });

  // ── Aceptar monitoría ─────────────────────────────────────────────────────
  async function aceptar(idMonitoria) {
    aceptando  = { ...aceptando,  [idMonitoria]: true  };
    feedbacks  = { ...feedbacks,  [idMonitoria]: null  };

    try {
      const res = await fetch(
        `${API}/monitorias/${idMonitoria}/responder/tutor/${idTutor}`,
        {
          method:  "PATCH",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ accion: "Programada", observaciones: null })  // ✓ valor correcto del enum
        }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail ?? `HTTP ${res.status}`);
      }

      // Quitar de la lista de pendientes
      pendientes = pendientes.filter(p => p.id_monitoria !== idMonitoria);
      feedbacks  = { ...feedbacks, [idMonitoria]: { ok: true, msg: "¡Monitoría aceptada!" } };

    } catch (e) {
      feedbacks = { ...feedbacks, [idMonitoria]: { ok: false, msg: e.message } };
    } finally {
      aceptando = { ...aceptando, [idMonitoria]: false };
    }
  }

  // ── Rechazar monitoría ────────────────────────────────────────────────────
  async function rechazar(idMonitoria) {
    aceptando = { ...aceptando, [idMonitoria]: true };
    feedbacks = { ...feedbacks, [idMonitoria]: null };

    try {
      const res = await fetch(
        `${API}/monitorias/${idMonitoria}/responder/tutor/${idTutor}`,
        {
          method:  "PATCH",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ accion: "Rechazada", observaciones: null })
        }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail ?? `HTTP ${res.status}`);
      }

      pendientes = pendientes.filter(p => p.id_monitoria !== idMonitoria);

    } catch (e) {
      feedbacks = { ...feedbacks, [idMonitoria]: { ok: false, msg: e.message } };
    } finally {
      aceptando = { ...aceptando, [idMonitoria]: false };
    }
  }

  function hhmm(t) { return (t ?? "").slice(0, 5); }

  function formatFecha(f) {
    if (!f) return "—";
    return new Date(f).toLocaleDateString("es-CO", {
      weekday: "short", day: "2-digit", month: "short"
    });
  }
</script>

<div class="page">

  <!-- HEADER -->
  <div class="page-header">
    <div>
      <h2 class="section-title">Mis materias asignadas</h2>
      <p class="section-sub">Materias que puedes tutorizar este período</p>
    </div>
    <span class="badge-pill">{materias.length} materias</span>
  </div>

  <!-- ERROR -->
  {#if error}
    <div class="alert alert-danger">{error}</div>
  {/if}

  <!-- LOADING -->
  {#if cargando}
    <div class="loading-wrap">
      <div class="spinner"></div>
      <span>Cargando...</span>
    </div>

  {:else}

    <!-- ── SOLICITUDES PENDIENTES ── -->
    {#if pendientes.length > 0}
      <div class="section-block">
        <div class="section-block-header">
          <div class="section-block-title">
            <i class="bi bi-hourglass-split"></i>
            Solicitudes pendientes
          </div>
          <span class="badge-pendiente">{pendientes.length}</span>
        </div>

        <div class="pendientes-list">
          {#each pendientes as p}
            <div class="pendiente-card">

              <!-- Info del estudiante y sesión -->
              <div class="pendiente-info">
                <div class="avatar">
                  {(p.nombre_estudiante ?? p.estudiante ?? "?")[0].toUpperCase()}
                </div>
                <div class="pendiente-detalle">
                  <span class="pendiente-nombre">
                    {p.nombre_estudiante ?? p.estudiante ?? "Estudiante"}
                    {p.apellido_estudiante ?? ""}
                  </span>
                  <span class="pendiente-materia">{p.nombre_materia ?? "Sin materia"}</span>
                  <div class="pendiente-meta">
                    <span><i class="bi bi-calendar3"></i> {formatFecha(p.fecha)}</span>
                    <span><i class="bi bi-clock"></i> {hhmm(p.hora_inicio)} - {hhmm(p.hora_fin)}</span>
                    <span><i class="bi bi-geo-alt"></i> {p.modalidad ?? "Presencial"}</span>
                  </div>
                </div>
              </div>

              <!-- Acciones -->
              <div class="pendiente-actions">
                {#if feedbacks[p.id_monitoria]}
                  <span
                    class="feedback-msg"
                    class:ok={feedbacks[p.id_monitoria].ok}
                    class:err={!feedbacks[p.id_monitoria].ok}
                  >
                    {feedbacks[p.id_monitoria].msg}
                  </span>
                {:else}
                  <button
                    class="btn btn-rechazar"
                    onclick={() => rechazar(p.id_monitoria)}
                    disabled={aceptando[p.id_monitoria]}
                  >
                    <i class="bi bi-x-lg"></i>
                    Rechazar
                  </button>
                  <button
                    class="btn btn-aceptar"
                    onclick={() => aceptar(p.id_monitoria)}
                    disabled={aceptando[p.id_monitoria]}
                  >
                    {#if aceptando[p.id_monitoria]}
                      <div class="spinner-sm"></div>
                      Procesando...
                    {:else}
                      <i class="bi bi-check-lg"></i>
                      Aceptar
                    {/if}
                  </button>
                {/if}
              </div>

            </div>
          {/each}
        </div>
      </div>
    {/if}

    <!-- ── MATERIAS ── -->
    {#if materias.length === 0}
      <div class="empty-state">
        <div class="empty-icon">📚</div>
        <div class="empty-title">Sin materias asignadas</div>
        <div class="empty-sub">Contacta al administrador para que te asigne materias</div>
      </div>

    {:else}
      <div class="materias-grid">
        {#each materias as m, i}
          <div class="materia-card">
            <div class="materia-index">{i + 1}</div>
            <div class="materia-icon">
              {m.nombre_materia[0].toUpperCase()}
            </div>
            <div>
              <div class="materia-nombre">{m.nombre_materia}</div>
              {#if m.codigo_materia}
                <div class="materia-codigo">{m.codigo_materia}</div>
              {/if}
              {#if m.creditos}
                <div class="materia-creditos">{m.creditos} créditos</div>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    {/if}

  {/if}
</div>

<style>
  .page { display:flex; flex-direction:column; gap:1.25rem; }

  .page-header { display:flex; align-items:flex-start; justify-content:space-between; flex-wrap:wrap; gap:.5rem; }
  .section-title { font-size:16px; font-weight:500; margin:0 0 3px; }
  .section-sub   { font-size:13px; color:#888; margin:0; }

  .badge-pill     { background:#E1F5EE; color:#085041; font-size:11px; font-weight:500; padding:4px 12px; border-radius:20px; white-space:nowrap; }
  .badge-pendiente{ background:#FFF3CD; color:#7D5A00; font-size:11px; font-weight:600; padding:2px 10px; border-radius:20px; }

  .alert { padding:10px 14px; border-radius:8px; font-size:13px; }
  .alert-danger { background:#FCEBEB; color:#A32D2D; border:.5px solid #F09595; }

  .loading-wrap { display:flex; align-items:center; justify-content:center; gap:10px; padding:3rem; color:#aaa; font-size:13px; }
  .spinner      { width:20px; height:20px; border-radius:50%; border:2px solid #e0e0e0; border-top-color:#1D9E75; animation:spin .7s linear infinite; }
  .spinner-sm   { width:13px; height:13px; border-radius:50%; border:2px solid rgba(255,255,255,.3); border-top-color:#fff; animation:spin .7s linear infinite; }
  @keyframes spin { to { transform:rotate(360deg); } }

  /* ── BLOQUE PENDIENTES ── */
  .section-block {
    background:#fff; border:.5px solid rgba(0,0,0,.08);
    border-radius:12px; overflow:hidden;
  }
  .section-block-header {
    display:flex; align-items:center; justify-content:space-between;
    padding:.875rem 1.25rem; border-bottom:.5px solid rgba(0,0,0,.06);
    background:#FFFBF0;
  }
  .section-block-title {
    display:flex; align-items:center; gap:8px;
    font-size:13px; font-weight:600; color:#7D5A00;
  }

  .pendientes-list { display:flex; flex-direction:column; }

  .pendiente-card {
    display:flex; align-items:center; justify-content:space-between;
    gap:12px; padding:1rem 1.25rem;
    border-bottom:.5px solid rgba(0,0,0,.05);
    flex-wrap:wrap;
  }
  .pendiente-card:last-child { border-bottom:none; }

  .pendiente-info    { display:flex; align-items:flex-start; gap:10px; flex:1; min-width:0; }
  .avatar {
    width:36px; height:36px; border-radius:50%;
    background:#EEF0FF; color:#010A55;
    display:flex; align-items:center; justify-content:center;
    font-size:13px; font-weight:600; flex-shrink:0;
  }
  .pendiente-detalle { display:flex; flex-direction:column; gap:2px; min-width:0; }
  .pendiente-nombre  { font-size:13px; font-weight:600; }
  .pendiente-materia { font-size:11px; color:#1D9E75; font-weight:500; }
  .pendiente-meta    { display:flex; gap:10px; flex-wrap:wrap; margin-top:4px; }
  .pendiente-meta span { display:flex; align-items:center; gap:4px; font-size:11px; color:#888; }

  .pendiente-actions { display:flex; align-items:center; gap:6px; flex-shrink:0; }

  /* ── BOTONES ── */
  .btn {
    display:inline-flex; align-items:center; gap:5px;
    height:32px; padding:0 12px; border-radius:8px;
    font-size:12px; font-weight:600; border:none; cursor:pointer;
    transition:.15s;
  }
  .btn:disabled { opacity:.55; cursor:not-allowed; }

  .btn-aceptar  { background:#1D9E75; color:#fff; }
  .btn-aceptar:hover:not(:disabled)  { background:#158f68; }

  .btn-rechazar { background:#FCEBEB; color:#A32D2D; }
  .btn-rechazar:hover:not(:disabled) { background:#f5d5d5; }

  /* ── FEEDBACK ── */
  .feedback-msg { font-size:12px; font-weight:500; padding:4px 10px; border-radius:8px; }
  .feedback-msg.ok  { background:#E1F5EE; color:#085041; }
  .feedback-msg.err { background:#FCEBEB; color:#A32D2D; }

  /* ── MATERIAS ── */
  .empty-state {
    background:#fff; border:.5px solid rgba(0,0,0,.08); border-radius:12px;
    padding:3rem; text-align:center;
  }
  .empty-icon  { font-size:36px; margin-bottom:.75rem; }
  .empty-title { font-size:15px; font-weight:500; margin-bottom:6px; }
  .empty-sub   { font-size:13px; color:#888; }

  .materias-grid {
    display:grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap:12px;
  }
  .materia-card {
    background:#fff; border:.5px solid rgba(0,0,0,.08); border-radius:12px;
    padding:1.25rem; display:flex; align-items:flex-start; gap:12px;
    position:relative; transition:border-color .15s;
  }
  .materia-card:hover { border-color:rgba(29,158,117,.4); }

  .materia-index { position:absolute; top:10px; right:12px; font-size:11px; color:#ccc; }

  .materia-icon {
    width:40px; height:40px; border-radius:10px;
    background:#E1F5EE; display:flex; align-items:center; justify-content:center;
    font-size:18px; font-weight:600; color:#085041; flex-shrink:0;
  }
  .materia-nombre   { font-size:14px; font-weight:500; margin-bottom:3px; }
  .materia-codigo   { font-size:12px; color:#0C447C; background:#E6F1FB; display:inline-block; padding:1px 8px; border-radius:20px; margin-bottom:3px; }
  .materia-creditos { font-size:11px; color:#888; }

  /* ── RESPONSIVE ── */
  @media (max-width: 640px) {
    .pendiente-card    { flex-direction:column; align-items:stretch; }
    .pendiente-actions { justify-content:flex-end; }
    .materias-grid     { grid-template-columns: 1fr; }
  }
</style>