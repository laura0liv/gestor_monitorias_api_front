<script>
  import { onMount } from "svelte";
  import { API } from "$lib/services/api";

  let {
    idEstudiante,
    materiaInicial = null,
    onExito
  } = $props();

  let paso = $state(materiaInicial ? 2 : 1);

  let materiaSeleccionada = $state(materiaInicial);
  let monitorSeleccionado = $state(null);
  let slotSeleccionado    = $state(null);

  let materias         = $state([]);
  let monitores        = $state([]);
  let slots            = $state([]);
  let idPeriodoActivo  = $state(null);

  let cargando = $state(false);
  let error    = $state("");
  let enviando = $state(false);

  // ─── utilidades ───────────────────────────────────────────────────────────
  const hhmm = (t) => (t ?? "").slice(0, 5);

  const DIAS_DOW = {
    Domingo:    0,
    Lunes:      1,
    Martes:     2,
    "Miércoles": 3,
    Jueves:     4,
    Viernes:    5,
    Sábado:     6
  };

  function proximaFecha(diaSemana) {
    const hoy  = new Date();
    const dow  = DIAS_DOW[diaSemana] ?? 1;
    const diff = (dow - hoy.getDay() + 7) % 7 || 7;
    const d    = new Date(hoy);
    d.setDate(hoy.getDate() + diff);
    return d.toISOString().slice(0, 10);
  }

  const DIAS_ORDEN = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

  let slotsPorDia = $derived(
    DIAS_ORDEN.reduce((acc, dia) => {
      const diaSlots = slots.filter((s) => s.dia === dia);
      if (diaSlots.length) acc[dia] = diaSlots;
      return acc;
    }, {})
  );

  const pasos = [
    { n: 1, label: "Materia"  },
    { n: 2, label: "Monitor"  },
    { n: 3, label: "Horario"  }
  ];

  // ─── carga inicial ────────────────────────────────────────────────────────
  onMount(async () => {
    try {
      cargando = true;

      const [resMat, resDisp, resPeriodo] = await Promise.all([
        fetch(`${API}/estudiante_materia/materias/${idEstudiante}`),
        fetch(`${API}/materia/disponibles`),
        fetch(`${API}/periodo_academico/activo`)
      ]);

      if (!resMat.ok)     throw new Error("No se pudieron cargar las materias");
      if (!resDisp.ok)    throw new Error("No se pudieron cargar las materias disponibles");
      if (!resPeriodo.ok) throw new Error("No hay un periodo académico activo");

      const todasLasMias = await resMat.json();
      const conMonitor   = await resDisp.json();
      const periodo      = await resPeriodo.json();

      idPeriodoActivo = periodo.id_periodo;

      // Solo muestro materias del estudiante que además tienen monitor activo
      const idsConMonitor = new Set(conMonitor.map((m) => m.id_materia));
      materias = todasLasMias.filter((m) => idsConMonitor.has(m.id_materia));

      if (materiaInicial) {
        await cargarMonitores(materiaInicial);
      }

    } catch (e) {
      error = e.message ?? "No fue posible cargar la información.";
      console.error(e);
    } finally {
      cargando = false;
    }
  });

  // ─── cargar monitores de una materia ─────────────────────────────────────
  async function cargarMonitores(m) {
    monitores          = [];
    slots              = [];
    monitorSeleccionado = null;
    slotSeleccionado   = null;
    error              = "";

    try {
      cargando = true;

      const res = await fetch(`${API}/monitores/por_materia/${m.id_materia}`);

      if (res.status === 404) { monitores = []; return; }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      monitores = data.sort(
        (a, b) => (b.promedio_calificacion || 0) - (a.promedio_calificacion || 0)
      );

    } catch (e) {
      error = "No fue posible cargar los monitores.";
      console.error(e);
    } finally {
      cargando = false;
    }
  }

  // ─── paso 1 → 2 ──────────────────────────────────────────────────────────
  async function seleccionarMateria(m) {
    materiaSeleccionada = m;
    await cargarMonitores(m);
    paso = 2;
  }

  // ─── paso 2 → 3 ──────────────────────────────────────────────────────────
  async function seleccionarMonitor(mon) {
    monitorSeleccionado = mon;
    slotSeleccionado    = null;
    slots               = [];

    try {
      cargando = true;

      const res = await fetch(
        `${API}/disponibilidad/get_disponibilidad/${mon.id_usuario}`
      );

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const raw = await res.json();
      slots = raw.map((s) => ({
        dia:        s.dia_semana,
        hora_inicio: hhmm(s.hora_inicio),
        hora_fin:    hhmm(s.hora_fin)
      }));

      paso = 3;

    } catch (e) {
      error = "No fue posible cargar la disponibilidad.";
      console.error(e);
    } finally {
      cargando = false;
    }
  }

  // ─── confirmar solicitud ──────────────────────────────────────────────────
  async function enviarSolicitud() {
    if (!slotSeleccionado) return;

    enviando = true;
    error    = "";

    try {
      const body = {
        id_monitor:    monitorSeleccionado.id_usuario,
        id_estudiante: idEstudiante,
        id_materia:    materiaSeleccionada.id_materia,
        id_aula:       null,
        fecha:         proximaFecha(slotSeleccionado.dia),
        hora_inicio:   slotSeleccionado.hora_inicio,
        hora_fin:      slotSeleccionado.hora_fin,
        modalidad:     "Presencial",
        id_periodo:    idPeriodoActivo,          // ← periodo activo real
        observaciones: null
      };

      const res = await fetch(`${API}/monitorias/solicitar`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(body)
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail ?? `HTTP ${res.status}`);
      }

      // Resetear flujo
      paso                = 1;
      materiaSeleccionada = null;
      monitorSeleccionado = null;
      slotSeleccionado    = null;
      monitores           = [];
      slots               = [];

      onExito?.();

    } catch (e) {
      error = e.message;
    } finally {
      enviando = false;
    }
  }
</script>

<div class="page">

  <!-- HEADER -->
  <div class="page-header">
    <div>
      <h2 class="section-title">Solicitar monitoría</h2>
      <p class="section-sub">Completa los pasos para agendar tu sesión</p>
    </div>
  </div>

  <!-- ERROR -->
  {#if error}
    <div class="alert alert-danger">
      <span>{error}</span>
      <button class="alert-close" onclick={() => error = ""}>✕</button>
    </div>
  {/if}

  <!-- STEPPER -->
  <div class="stepper">
    {#each pasos as p}
      <div class="step" class:done={paso > p.n} class:active={paso === p.n}>
        <div class="step-circle">
          {#if paso > p.n}
            <i class="bi bi-check-lg"></i>
          {:else}
            {p.n}
          {/if}
        </div>
        <span class="step-label">{p.label}</span>
      </div>
      {#if p.n < pasos.length}
        <div class="step-line" class:done={paso > p.n}></div>
      {/if}
    {/each}
  </div>

  <!-- PASO 1 — elegir materia -->
  {#if paso === 1}
    <div class="panel">
      <div class="panel-header">
        <h3 class="panel-title">Selecciona una materia</h3>
      </div>

      {#if cargando}
        <div class="skeleton-list">
          {#each Array(4) as _}
            <div class="skeleton-card"></div>
          {/each}
        </div>

      {:else if materias.length === 0}
        <div class="empty-state">
          <i class="bi bi-inbox empty-icon"></i>
          <p>No tienes materias con monitores disponibles.</p>
        </div>

      {:else}
        <ul class="lista">
          {#each materias as m}
            <li>
              <button
                class="lista-item"
                class:selected={materiaSeleccionada?.id_materia === m.id_materia}
                onclick={() => seleccionarMateria(m)}
              >
                <div class="lista-icon">
                  <i class="bi bi-book-half"></i>
                </div>
                <div class="lista-info">
                  <span class="lista-nombre">{m.nombre_materia}</span>
                </div>
                <i class="bi bi-chevron-right lista-arrow"></i>
              </button>
            </li>
          {/each}
        </ul>
      {/if}
    </div>
  {/if}

  <!-- PASO 2 — elegir monitor -->
  {#if paso === 2}
    <div class="panel">
      <div class="panel-header">
        <button class="btn-back" onclick={() => { paso = 1; monitorSeleccionado = null; }}>
          <i class="bi bi-arrow-left"></i>
          {materiaSeleccionada?.nombre_materia}
        </button>
        <h3 class="panel-title">Selecciona un monitor</h3>
      </div>

      {#if cargando}
        <div class="skeleton-list">
          {#each Array(3) as _}
            <div class="skeleton-card"></div>
          {/each}
        </div>

      {:else if monitores.length === 0}
        <div class="empty-state">
          <i class="bi bi-person-x empty-icon"></i>
          <p>No hay monitores disponibles para esta materia.</p>
        </div>

      {:else}
        <div class="monitor-grid">
          {#each monitores as mon}
            {@const topMonitor =
              mon.promedio_calificacion ===
              Math.max(...monitores.map((m) => m.promedio_calificacion || 0))
            }
            <button
              class="monitor-card"
              class:selected={monitorSeleccionado?.id_usuario === mon.id_usuario}
              onclick={() => seleccionarMonitor(mon)}
            >
              <div class="avatar">{mon.nombre[0]}{mon.apellido[0]}</div>

              <div class="monitor-content">
                <div class="monitor-top">
                  <span class="lista-nombre">{mon.nombre} {mon.apellido}</span>
                  {#if topMonitor && mon.promedio_calificacion}
                    <span class="badge-top">
                      <i class="bi bi-trophy-fill"></i>
                      Mejor calificado
                    </span>
                  {/if}
                </div>

                <div class="rating-wrap">
                  <div class="stars">
                    {#each Array(5) as _, i}
                      <i
                        class="bi"
                        class:bi-star-fill={i < Math.round(mon.promedio_calificacion || 0)}
                        class:bi-star={i >= Math.round(mon.promedio_calificacion || 0)}
                      ></i>
                    {/each}
                  </div>
                  <span class="rating-number">
                    {mon.promedio_calificacion
                      ? Number(mon.promedio_calificacion).toFixed(1)
                      : "Nuevo"}
                  </span>
                </div>
              </div>

              <i class="bi bi-chevron-right lista-arrow"></i>
            </button>
          {/each}
        </div>
      {/if}
    </div>
  {/if}

  <!-- PASO 3 — elegir horario -->
  {#if paso === 3}
    <div class="panel">
      <div class="panel-header">
        <button class="btn-back" onclick={() => { paso = 2; slotSeleccionado = null; }}>
          <i class="bi bi-arrow-left"></i>
          {monitorSeleccionado?.nombre} {monitorSeleccionado?.apellido}
        </button>
        <h3 class="panel-title">Selecciona un horario</h3>
      </div>

      {#if cargando}
        <div class="empty-state">
          <div class="spinner"></div>
        </div>

      {:else if slots.length === 0}
        <div class="empty-state">
          <i class="bi bi-calendar-x empty-icon"></i>
          <p>Este monitor no tiene horarios disponibles.</p>
        </div>

      {:else}
        <div class="horario-grid">
          {#each Object.entries(slotsPorDia) as [dia, diaSlots]}
            <div class="dia-col">
              <div class="dia-header">{dia}</div>
              {#each diaSlots as s}
                {@const activo =
                  slotSeleccionado?.dia === s.dia &&
                  slotSeleccionado?.hora_inicio === s.hora_inicio
                }
                <button
                  class="slot"
                  class:active={activo}
                  onclick={() => slotSeleccionado = s}
                >
                  {s.hora_inicio}
                </button>
              {/each}
            </div>
          {/each}
        </div>

        <div class="confirm-bar">
          {#if slotSeleccionado}
            <div class="confirm-info">
              <i class="bi bi-calendar-check"></i>
              <span>
                {slotSeleccionado.dia} · {slotSeleccionado.hora_inicio} - {slotSeleccionado.hora_fin}
              </span>
            </div>
          {:else}
            <span class="confirm-placeholder">Selecciona un horario</span>
          {/if}

          <button
            class="btn btn-primary"
            onclick={enviarSolicitud}
            disabled={!slotSeleccionado || enviando}
          >
            {#if enviando}
              <div class="spinner-sm"></div>
              Enviando...
            {:else}
              <i class="bi bi-send"></i>
              Confirmar solicitud
            {/if}
          </button>
        </div>
      {/if}
    </div>
  {/if}

</div>

<style>
  .page{display:flex;flex-direction:column;gap:1.25rem}
  .page-header{display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:10px}
  .section-title{margin:0;font-size:18px;font-weight:600}
  .section-sub{margin-top:4px;font-size:13px;color:#888}

  .alert{display:flex;justify-content:space-between;align-items:center;padding:12px 14px;border-radius:10px;font-size:13px}
  .alert-danger{background:#FDECEC;color:#B42318}
  .alert-close{border:none;background:none;cursor:pointer}

  .stepper{display:flex;align-items:center;background:#fff;border-radius:12px;padding:1rem 1.25rem;border:1px solid rgba(0,0,0,.06)}
  .step{display:flex;align-items:center;gap:8px}
  .step-circle{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600;background:#ececec;color:#999}
  .step.active .step-circle{background:#010A55;color:#fff}
  .step.done .step-circle{background:#1D9E75;color:#fff}
  .step-label{font-size:12px;color:#999}
  .step-line{flex:1;height:1px;background:#ddd;margin:0 8px}
  .step-line.done{background:#1D9E75}

  .panel{background:#fff;border-radius:14px;border:1px solid rgba(0,0,0,.06);overflow:hidden}
  .panel-header{padding:1rem 1.25rem;border-bottom:1px solid rgba(0,0,0,.05)}
  .panel-title{margin:4px 0 0;font-size:14px;font-weight:600}
  .btn-back{border:none;background:none;cursor:pointer;font-size:12px;color:#777;padding:0}

  .lista{list-style:none;margin:0;padding:.5rem 0}
  .lista-item{width:100%;display:flex;align-items:center;gap:12px;border:none;background:none;padding:12px 1.25rem;cursor:pointer;text-align:left}
  .lista-item:hover{background:#f8f8f8}
  .lista-item.selected{background:#EEF0FF}
  .lista-icon{width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;background:#EEF0FF;color:#010A55}
  .lista-info{flex:1;display:flex;flex-direction:column}
  .lista-nombre{font-size:13px;font-weight:600}

  .monitor-grid{display:flex;flex-direction:column;gap:10px;padding:1rem}
  .monitor-card{display:flex;align-items:center;gap:14px;width:100%;padding:14px;border-radius:14px;border:1px solid #ECECEC;background:#fff;cursor:pointer;transition:.18s ease}
  .monitor-card:hover{transform:translateY(-1px);border-color:#cfd6ff;background:#fafbff}
  .monitor-card.selected{background:#EEF0FF;border-color:#010A55}
  .monitor-content{flex:1}
  .monitor-top{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
  .avatar{width:44px;height:44px;border-radius:50%;background:#1D9E75;color:#fff;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700}
  .badge-top{display:inline-flex;align-items:center;gap:4px;background:#FFF4D6;color:#B7791F;border:1px solid #F6D58A;border-radius:999px;padding:2px 8px;font-size:10px;font-weight:600}
  .rating-wrap{display:flex;align-items:center;gap:6px;margin-top:4px}
  .stars{display:flex;gap:2px;color:#E6A700;font-size:11px}
  .rating-number{font-size:11px;color:#777}

  .horario-grid{display:flex;gap:10px;flex-wrap:wrap;padding:1rem}
  .dia-col{min-width:80px;display:flex;flex-direction:column;gap:6px}
  .dia-header{text-align:center;font-size:11px;font-weight:700;color:#999;text-transform:uppercase}
  .slot{border:none;border-radius:8px;padding:8px;background:#f3f3f3;cursor:pointer;font-size:12px;font-weight:500}
  .slot:hover{background:#CFE9B4}
  .slot.active{background:#010A55;color:#fff}

  .confirm-bar{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:1rem 1.25rem;border-top:1px solid rgba(0,0,0,.05);background:#fafafa}
  .confirm-info{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:500;color:#010A55}
  .confirm-placeholder{font-size:13px;color:#999}

  .btn{border:none;border-radius:10px;height:38px;padding:0 16px;cursor:pointer;display:inline-flex;align-items:center;gap:6px;font-size:13px;font-weight:600}
  .btn-primary{background:#010A55;color:#fff}
  .btn-primary:hover{background:#06127A}
  .btn:disabled{opacity:.5;cursor:not-allowed}

  .empty-state{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;padding:3rem;color:#999;text-align:center}
  .empty-icon{font-size:2rem}

  .spinner{width:28px;height:28px;border:3px solid rgba(1,10,85,.15);border-top-color:#010A55;border-radius:50%;animation:spin .7s linear infinite}
  .spinner-sm{width:14px;height:14px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin .7s linear infinite}

  .skeleton-list{display:flex;flex-direction:column;gap:10px;padding:1rem}
  .skeleton-card{height:74px;border-radius:12px;background:linear-gradient(90deg,#f1f1f1 25%,#f7f7f7 50%,#f1f1f1 75%);background-size:200% 100%;animation:skeleton 1.2s infinite}

  @keyframes skeleton{from{background-position:200% 0}to{background-position:-200% 0}}
  @keyframes spin{to{transform:rotate(360deg)}}

  @media(max-width:640px){
    .confirm-bar{flex-direction:column;align-items:stretch}
    .btn{width:100%;justify-content:center}
  }
</style>

