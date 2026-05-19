<script>
  import { onMount } from "svelte";
  import { API } from '$lib/services/api';

  let { idTutor } = $props();

  let materias  = $state([]);
  let cargando  = $state(false);
  let error     = $state("");

onMount(async () => {
  cargando = true;

  try {
    const res = await fetch(
      `${API}/monitor_materia/get_materias_by_monitor/${idTutor}`
    );

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();

    materias = data.materias ?? [];

  } catch (e) {
    error = e.message;
  } finally {
    cargando = false;
  }
});
</script>

<div class="page">

  <div class="page-header">
    <div>
      <h2 class="section-title">Mis materias asignadas</h2>
      <p class="section-sub">Materias que puedes tutorizar este período</p>
    </div>
    <span class="badge-pill">{materias.length} materias</span>
  </div>

  {#if error}
    <div class="alert alert-danger">{error}</div>
  {/if}

  {#if cargando}
    <div class="loading">Cargando materias...</div>

  {:else if materias.length === 0}
    <div class="empty-state">
      <div class="empty-icon"></div>
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

</div>

<style>
  .page { display:flex; flex-direction:column; gap:1.25rem; }
  .page-header { display:flex; align-items:flex-start; justify-content:space-between; }
  .section-title { font-size:16px; font-weight:500; margin:0 0 3px; }
  .section-sub { font-size:13px; color:#888; margin:0; }
  .badge-pill { background:#E1F5EE; color:#085041; font-size:11px; font-weight:500; padding:4px 12px; border-radius:20px; white-space:nowrap; }

  .alert { padding:10px 14px; border-radius:8px; font-size:13px; }
  .alert-danger { background:#FCEBEB; color:#A32D2D; border:0.5px solid #F09595; }

  .loading { text-align:center; padding:3rem; color:#aaa; font-size:13px; }

  .empty-state {
    background:#fff; border:0.5px solid rgba(0,0,0,0.08); border-radius:12px;
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
    background:#fff;
    border:0.5px solid rgba(0,0,0,0.08);
    border-radius:12px;
    padding:1.25rem;
    display:flex;
    align-items:flex-start;
    gap:12px;
    position:relative;
    transition: border-color .15s;
  }
  .materia-card:hover { border-color:rgba(29,158,117,0.4); }

  .materia-index {
    position:absolute; top:10px; right:12px;
    font-size:11px; color:#ccc;
  }

  .materia-icon {
    width:40px; height:40px; border-radius:10px;
    background:#E1F5EE; display:flex; align-items:center; justify-content:center;
    font-size:18px; font-weight:600; color:#085041; flex-shrink:0;
  }

  .materia-nombre  { font-size:14px; font-weight:500; margin-bottom:3px; }
  .materia-codigo  { font-size:12px; color:#0C447C; background:#E6F1FB; display:inline-block; padding:1px 8px; border-radius:20px; margin-bottom:3px; }
  .materia-creditos{ font-size:11px; color:#888; }
</style>