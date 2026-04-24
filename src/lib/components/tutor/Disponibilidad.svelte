<script>
  import { onMount } from "svelte";

  let { idTutor } = $props();

  const API = "http://127.0.0.1:8000";

  const DIAS   = ["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];
  const HORAS  = ["07:00","08:00","09:00","10:00","11:00","12:00",
                  "13:00","14:00","15:00","16:00","17:00","18:00","19:00"];

  // grilla[dia][hora] = true/false
  let grilla    = $state(Object.fromEntries(DIAS.map(d => [d, Object.fromEntries(HORAS.map(h => [h, false]))])));
  let guardando = $state(false);
  let success   = $state("");
  let error     = $state("");

  // Carga disponibilidad existente
  onMount(async () => {
    try {
      const res = await fetch(`${API}/disponibilidad/get_disponibilidad/${idTutor}`);
      if (!res.ok) return;
      const data = await res.json();
      // Espera: [{dia, hora_inicio}]
      data.forEach(d => {
        if (grilla[d.dia] && grilla[d.dia][d.hora_inicio] !== undefined) {
          grilla[d.dia][d.hora_inicio] = true;
        }
      });
    } catch (_) {}
  });

  function toggle(dia, hora) {
    grilla[dia][hora] = !grilla[dia][hora];
  }

  async function guardar() {
    guardando = true; error = "";
    const slots = [];
    DIAS.forEach(dia => {
      HORAS.forEach(hora => {
        if (grilla[dia][hora]) slots.push({ id_monitor: idTutor, dia, hora_inicio: hora });
      });
    });
    try {
      const res = await fetch(`${API}/disponibilidad/set_disponibilidad`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(slots)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      success = "Disponibilidad guardada correctamente";
      setTimeout(() => success = "", 3000);
    } catch (e) { error = e.message; }
    finally { guardando = false; }
  }

  let totalSlots = $derived(
    DIAS.reduce((acc, dia) =>
      acc + HORAS.filter(h => grilla[dia][h]).length, 0)
  );
</script>

<div class="page">

  <div class="page-header">
    <div>
      <h2 class="section-title">Configura tu disponibilidad</h2>
      <p class="section-sub">Selecciona los bloques horarios en que puedes atender monitorías</p>
    </div>
    <div style="display:flex;align-items:center;gap:10px">
      <span class="badge-pill">{totalSlots} bloques seleccionados</span>
      <button class="btn btn-primary" onclick={guardar} disabled={guardando}>
        {guardando ? "Guardando..." : "Guardar disponibilidad"}
      </button>
    </div>
  </div>

  {#if error}
    <div class="alert alert-danger">{error}<button class="alert-close" onclick={() => error=""}>✕</button></div>
  {/if}
  {#if success}
    <div class="alert alert-success">{success}</div>
  {/if}

  <div class="card">
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

    <div class="legend">
      <div class="legend-item">
        <div class="legend-dot active"></div>
        <span>Disponible</span>
      </div>
      <div class="legend-item">
        <div class="legend-dot"></div>
        <span>No disponible</span>
      </div>
    </div>
  </div>
</div>

<style>
  .page { display:flex; flex-direction:column; gap:1.25rem; }
  .page-header { display:flex; align-items:flex-start; justify-content:space-between; }
  .section-title { font-size:16px; font-weight:500; margin:0 0 3px; }
  .section-sub { font-size:13px; color:#888; margin:0; }
  .badge-pill { background:#E1F5EE; color:#085041; font-size:11px; font-weight:500; padding:4px 12px; border-radius:20px; }

  .alert { display:flex; align-items:center; justify-content:space-between; padding:10px 14px; border-radius:8px; font-size:13px; }
  .alert-danger  { background:#FCEBEB; color:#A32D2D; border:0.5px solid #F09595; }
  .alert-success { background:#E1F5EE; color:#085041; border:0.5px solid #5DCAA5; }
  .alert-close   { background:none; border:none; cursor:pointer; font-size:14px; color:inherit; }

  .card { background:#fff; border:0.5px solid rgba(0,0,0,0.08); border-radius:12px; overflow:hidden; }
  .table-wrap { overflow-x:auto; }

  .horario-table { width:100%; border-collapse:collapse; min-width:520px; }
  .horario-table thead th {
    font-size:11px; font-weight:500; color:#888;
    padding:8px 6px; text-align:center;
    background:#fafafa; border-bottom:0.5px solid rgba(0,0,0,0.08);
  }
  .hora-col { width:64px; text-align:left !important; padding-left:1.25rem !important; }
  .hora-cell {
    font-size:12px; color:#aaa; padding:4px 6px 4px 1.25rem;
    border-bottom:0.5px solid rgba(0,0,0,0.05);
    white-space:nowrap;
  }
  .slot-cell {
    padding:4px 6px;
    text-align:center;
    border-bottom:0.5px solid rgba(0,0,0,0.05);
  }

  .slot {
    width:100%; height:28px;
    border-radius:5px;
    border:0.5px solid rgba(0,0,0,0.1);
    background:#f5f5f3;
    cursor:pointer;
    transition:background .12s, border-color .12s;
    min-width:60px;
  }
  .slot:hover  { background:#C0DD97; border-color:#639922; }
  .slot.active { background:#1D9E75; border-color:#0F6E56; }

  .legend { display:flex; gap:1.5rem; padding:.75rem 1.25rem; border-top:0.5px solid rgba(0,0,0,0.08); background:#fafafa; }
  .legend-item { display:flex; align-items:center; gap:6px; font-size:12px; color:#666; }
  .legend-dot  { width:14px; height:14px; border-radius:3px; background:#f5f5f3; border:0.5px solid rgba(0,0,0,0.1); }
  .legend-dot.active { background:#1D9E75; border-color:#0F6E56; }

  .btn { height:34px; padding:0 16px; border-radius:8px; font-size:13px; font-weight:500; cursor:pointer; border:none; }
  .btn-primary { background:#010A55; color:#fff; }
  .btn-primary:hover { background:#020d6e; }
  .btn:disabled { opacity:.6; cursor:not-allowed; }
</style>