<script>
  import { onMount } from "svelte";
  import { API } from '$lib/services/api';

  let { idTutor } = $props();

  const DIAS  = ["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];
  const HORAS = ["07:00","08:00","09:00","10:00","11:00","12:00",
                 "13:00","14:00","15:00","16:00","17:00","18:00","19:00"];

  // Inicializa la grilla en false — se sobreescribe tras la carga
  function grillaNueva() {
    return Object.fromEntries(
      DIAS.map(d => [d, Object.fromEntries(HORAS.map(h => [h, false]))])
    );
  }

  let grilla    = $state(grillaNueva());
  let guardando = $state(false);
  let cargando  = $state(true);
  let success   = $state("");
  let error     = $state("");

  // ─── Carga la disponibilidad guardada y pinta la grilla ───────────────────
  async function cargarDisponibilidad() {
    cargando = true;
    error    = "";

    // Resetear completamente antes de pintar — evita slots fantasma
    grilla = grillaNueva();

    try {
      const res = await fetch(`${API}/horario_monitor/get_horarios_monitor/${idTutor}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();

      data.forEach(d => {
        const horaKey = (d.hora_inicio ?? "").slice(0, 5); // "07:00:00" → "07:00"
        if (grilla[d.dia_semana] && grilla[d.dia_semana][horaKey] !== undefined) {
          grilla[d.dia_semana][horaKey] = true;
        }
      });

    } catch (e) {
      console.error("Error cargando disponibilidad:", e);
      // No mostramos error aquí: si no hay horarios es un array vacío, no un fallo
    } finally {
      cargando = false;
    }
  }

  onMount(cargarDisponibilidad);

  function toggle(dia, hora) {
    grilla[dia][hora] = !grilla[dia][hora];
  }

  async function guardar() {
    guardando = true;
    error     = "";
    success   = "";

    try {
      // 1. Borrar todos los slots actuales
      const delRes = await fetch(
        `${API}/horario_monitor/delete_horarios_monitor/${idTutor}`,
        { method: "DELETE" }
      );
      if (!delRes.ok && delRes.status !== 404) {
        throw new Error(`Error al limpiar disponibilidad: HTTP ${delRes.status}`);
      }

      // 2. Construir slots seleccionados
      const slots = [];
      DIAS.forEach(dia => {
        HORAS.forEach(hora => {
          if (grilla[dia][hora]) {
            const idx     = HORAS.indexOf(hora);
            const horaFin = idx !== -1 && idx < HORAS.length - 1
              ? `${HORAS[idx + 1]}:00`
              : "20:00:00";

            slots.push({
              id_monitor:  idTutor,
              dia_semana:  dia,
              hora_inicio: `${hora}:00`,
              hora_fin:    horaFin,
              active:      true
            });
          }
        });
      });

      if (slots.length === 0) {
        success = "Disponibilidad guardada (sin bloques seleccionados)";
        setTimeout(() => success = "", 3000);
        return;
      }

      // 3. Crear cada slot
      await Promise.all(
        slots.map(slot =>
          fetch(`${API}/horario_monitor/create_horario_monitor/`, {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify(slot)
          }).then(r => {
            if (!r.ok) throw new Error(`HTTP ${r.status} — ${slot.dia_semana} ${slot.hora_inicio}`);
            return r.json();
          })
        )
      );

      // 4. Recargar desde el servidor para confirmar estado real
      await cargarDisponibilidad();

      success = `Disponibilidad guardada correctamente (${slots.length} bloques)`;
      setTimeout(() => success = "", 3000);

    } catch (e) {
      error = e.message;
    } finally {
      guardando = false;
    }
  }

  let totalSlots = $derived(
    DIAS.reduce((acc, dia) => acc + HORAS.filter(h => grilla[dia][h]).length, 0)
  );
</script>

<div class="page">

  <!-- HEADER -->
  <div class="page-header">
    <div>
      <h2 class="section-title">Configura tu disponibilidad</h2>
      <p class="section-sub">Selecciona los bloques horarios en que puedes atender monitorías</p>
    </div>
    <div class="header-actions">
      <span class="badge-pill">{totalSlots} bloques seleccionados</span>
      <button class="btn btn-primary" onclick={guardar} disabled={guardando || cargando}>
        {guardando ? "Guardando..." : "Guardar disponibilidad"}
      </button>
    </div>
  </div>

  <!-- ALERTAS -->
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
    {#if cargando}
      <div class="loading-wrap">
        <div class="spinner"></div>
        <span>Cargando disponibilidad...</span>
      </div>
    {:else}

      <!-- Tabla (desktop) -->
      <div class="table-wrap">
        <table class="horario-table">
          <thead>
            <tr>
              <th class="hora-col">Hora</th>
              {#each DIAS as dia}
                <th>{dia}</th>
              {/each}
            </tr>
          </thead>
          <tbody>
            {#each HORAS as hora}
              <tr>
                <td class="hora-cell">{hora}</td>
                {#each DIAS as dia}
                  <td class="slot-cell">
                    <button
                      class="slot"
                      class:active={grilla[dia][hora]}
                      onclick={() => toggle(dia, hora)}
                      title="{dia} {hora}"
                    ></button>
                  </td>
                {/each}
              </tr>
            {/each}
          </tbody>
        </table>
      </div>

      <!-- Grid compacto (móvil) -->
      <div class="mobile-grid">
        {#each DIAS as dia}
          <div class="mobile-dia">
            <div class="mobile-dia-label">{dia.slice(0, 3)}</div>
            <div class="mobile-slots">
              {#each HORAS as hora}
                <button
                  class="mobile-slot"
                  class:active={grilla[dia][hora]}
                  onclick={() => toggle(dia, hora)}
                  title="{dia} {hora}"
                >
                  {hora.slice(0, 2)}
                </button>
              {/each}
            </div>
          </div>
        {/each}
      </div>

      <div class="legend">
        <div class="legend-item"><div class="legend-dot active"></div><span>Disponible</span></div>
        <div class="legend-item"><div class="legend-dot"></div><span>No disponible</span></div>
      </div>

    {/if}
  </div>
</div>

<style>
  .page { display:flex; flex-direction:column; gap:1.25rem; }

  .page-header {
    display:flex; align-items:flex-start;
    justify-content:space-between; flex-wrap:wrap; gap:.75rem;
  }
  .section-title { font-size:16px; font-weight:500; margin:0 0 3px; }
  .section-sub   { font-size:13px; color:#888; margin:0; }

  .header-actions { display:flex; align-items:center; gap:10px; flex-wrap:wrap; }

  .badge-pill { background:#E1F5EE; color:#085041; font-size:11px; font-weight:500; padding:4px 12px; border-radius:20px; }

  .alert { display:flex; align-items:center; justify-content:space-between; padding:10px 14px; border-radius:8px; font-size:13px; }
  .alert-danger  { background:#FCEBEB; color:#A32D2D; border:.5px solid #F09595; }
  .alert-success { background:#E1F5EE; color:#085041; border:.5px solid #5DCAA5; }
  .alert-close   { background:none; border:none; cursor:pointer; font-size:14px; color:inherit; }

  .card { background:#fff; border:.5px solid rgba(0,0,0,.08); border-radius:12px; overflow:hidden; }

  /* ── TABLA desktop ── */
  .table-wrap { overflow-x:auto; -webkit-overflow-scrolling:touch; }

  .horario-table { width:100%; border-collapse:collapse; min-width:520px; }
  .horario-table thead th {
    font-size:11px; font-weight:500; color:#888;
    padding:8px 6px; text-align:center;
    background:#fafafa; border-bottom:.5px solid rgba(0,0,0,.08);
  }
  .hora-col   { width:64px; text-align:left !important; padding-left:1.25rem !important; }
  .hora-cell  { font-size:12px; color:#aaa; padding:4px 6px 4px 1.25rem; border-bottom:.5px solid rgba(0,0,0,.05); white-space:nowrap; }
  .slot-cell  { padding:4px 6px; text-align:center; border-bottom:.5px solid rgba(0,0,0,.05); }

  .slot {
    width:100%; height:28px; border-radius:5px;
    border:.5px solid rgba(0,0,0,.1); background:#f5f5f3;
    cursor:pointer; transition:background .12s, border-color .12s; min-width:60px;
  }
  .slot:hover  { background:#C0DD97; border-color:#639922; }
  .slot.active { background:#1D9E75; border-color:#0F6E56; }

  /* ── GRID móvil ── */
  .mobile-grid { display:none; flex-direction:column; gap:10px; padding:1rem; }

  .mobile-dia       { display:flex; align-items:flex-start; gap:8px; }
  .mobile-dia-label { width:32px; font-size:11px; font-weight:600; color:#888; padding-top:6px; flex-shrink:0; text-transform:uppercase; }
  .mobile-slots     { display:flex; flex-wrap:wrap; gap:5px; flex:1; }

  .mobile-slot {
    width:38px; height:32px; border-radius:6px;
    border:.5px solid rgba(0,0,0,.1); background:#f5f5f3;
    font-size:11px; font-weight:500; color:#888;
    cursor:pointer; transition:background .12s;
  }
  .mobile-slot:hover  { background:#C0DD97; color:#333; border-color:#639922; }
  .mobile-slot.active { background:#1D9E75; border-color:#0F6E56; color:#fff; }

  /* ── LEGEND ── */
  .legend      { display:flex; gap:1.5rem; padding:.75rem 1.25rem; border-top:.5px solid rgba(0,0,0,.08); background:#fafafa; }
  .legend-item { display:flex; align-items:center; gap:6px; font-size:12px; color:#666; }
  .legend-dot  { width:14px; height:14px; border-radius:3px; background:#f5f5f3; border:.5px solid rgba(0,0,0,.1); }
  .legend-dot.active { background:#1D9E75; border-color:#0F6E56; }

  /* ── LOADING ── */
  .loading-wrap { display:flex; align-items:center; justify-content:center; gap:10px; padding:3rem; color:#888; font-size:13px; }
  .spinner      { width:18px; height:18px; border-radius:50%; border:2px solid #e0e0e0; border-top-color:#1D9E75; animation:spin .7s linear infinite; }
  @keyframes spin { to { transform:rotate(360deg); } }

  /* ── BOTÓN ── */
  .btn          { height:34px; padding:0 16px; border-radius:8px; font-size:13px; font-weight:500; cursor:pointer; border:none; }
  .btn-primary  { background:#010A55; color:#fff; }
  .btn-primary:hover:not(:disabled) { background:#020d6e; }
  .btn:disabled { opacity:.6; cursor:not-allowed; }

  /* ── RESPONSIVE ── */
  @media (max-width: 640px) {
    .table-wrap  { display:none; }
    .mobile-grid { display:flex; }

    .page-header      { gap:.5rem; }
    .header-actions   { width:100%; justify-content:space-between; }
    .btn              { flex:1; justify-content:center; display:flex; align-items:center; }
  }
</style>