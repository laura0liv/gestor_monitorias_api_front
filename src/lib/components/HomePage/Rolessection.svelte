<!-- RolesSection -->
<script>
  const roles = [
    {
      tag: 'Para estudiantes',
      tagClass: 'student',
      title: 'Solicita tu tutoría',
      desc: 'Busca tutores disponibles según la asignatura que necesitas, agenda la sesión y lleva el control de tus avances académicos.',
      img: 'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=500&q=75',
      imgAlt: 'Estudiante',
      href: '/Estudiante',
      linkLabel: 'Ingresar como estudiante',
    },
    {
      tag: 'Para tutores',
      tagClass: 'tutor',
      title: 'Gestiona tus sesiones',
      desc: 'Define tu disponibilidad, acepta solicitudes, registra los avances de cada estudiante y genera informes de acompañamiento.',
      img: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=500&q=75',
      imgAlt: 'Tutor',
      href: '/Tutor',
      linkLabel: 'Ingresar como tutor',
    },
    {
      tag: 'Para coordinadores',
      tagClass: 'admin',
      title: 'Supervisión integral',
      desc: 'Monitorea todo el programa de tutorías, gestiona usuarios, asigna tutores y analiza el rendimiento del programa.',
      img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=500&q=75',
      imgAlt: 'Coordinador',
      href: '/Admin',
      linkLabel: 'Ingresar como administrador',
    },
  ];
</script>

<div class="roles-wrapper">
  <div class="section">
    <div class="section-header">
      <div class="section-tag">Acceso por perfil</div>
      <div class="section-title centered">¿Cómo puedo usar la plataforma?</div>
    </div>

    <div class="roles-grid">
      {#each roles as role}
        <div class="role-card">
          <img class="role-card-img" src={role.img} alt={role.imgAlt} loading="lazy" />
          <div class="role-card-body">
            <span class="role-tag {role.tagClass}">{role.tag}</span>
            <h3>{role.title}</h3>
            <p>{role.desc}</p>
            <a href={role.href} class="role-link">{role.linkLabel}</a>
          </div>
        </div>
      {/each}
    </div>
  </div>
</div>

<style>
  .roles-wrapper {
    position: relative;
    overflow: hidden;
    background:
      radial-gradient(circle at top left, rgba(59,130,246,.08), transparent 30%),
      radial-gradient(circle at bottom right, rgba(14,165,233,.08), transparent 35%),
      linear-gradient(to bottom, #f8fbff 0%, #eef5ff 100%);
    padding: 5rem 0;
  }

  .section-header {
    text-align: center;
    margin-bottom: 4rem;
    position: relative;
    z-index: 2;
  }

  .section-tag {
    display: inline-block;
    background: rgba(37,99,235,.08);
    color: #2563eb;
    border: 1px solid rgba(37,99,235,.12);
    padding: 0.55rem 1rem;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 1px;
    margin-bottom: 1rem;
    backdrop-filter: blur(10px);
  }

  .section-title.centered {
    margin: 0 auto;
    text-align: center;
    max-width: 580px;
    font-size: clamp(2rem,4vw,3rem);
    font-family: 'Playfair Display', serif;
    color: #021b79;
    line-height: 1.2;
  }

  .roles-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.8rem;
    position: relative;
    z-index: 2;
  }

  .role-card {
    position: relative;
    overflow: hidden;
    border-radius: 24px;
    background: rgba(255,255,255,.72);
    backdrop-filter: blur(18px);
    border: 1px solid rgba(255,255,255,.45);
    box-shadow:
      0 10px 30px rgba(2,27,121,.08),
      0 2px 10px rgba(0,0,0,.03);
    transition:
      transform .35s ease,
      box-shadow .35s ease,
      border-color .35s ease;
  }

  .role-card::before {
    content: "";
    position: absolute;
    inset: 0;
    background:
      linear-gradient(
        135deg,
        rgba(255,255,255,.22),
        transparent 55%
      );
    pointer-events: none;
  }

  .role-card:hover {
    transform: translateY(-10px);
    box-shadow:
      0 20px 50px rgba(5,117,230,.18),
      0 10px 20px rgba(0,0,0,.06);
    border-color: rgba(96,165,250,.4);
  }

  .role-card-img {
    width: 100%;
    height: 210px;
    object-fit: cover;
    display: block;
    transition: transform .45s ease;
    filter: saturate(1.05);
  }

  .role-card:hover .role-card-img {
    transform: scale(1.05);
  }

  .role-card-body {
    padding: 1.7rem;
  }

  .role-tag {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    font-weight: 700;
    margin-bottom: 1rem;
    padding: 0.45rem 0.8rem;
    border-radius: 999px;
  }

  .role-tag::before {
    content: "";
    width: 7px;
    height: 7px;
    border-radius: 50%;
  }

  .role-tag.student {
    background: rgba(14,165,233,.12);
    color: #0284c7;
  }

  .role-tag.student::before {
    background: #38bdf8;
    box-shadow: 0 0 10px #38bdf8;
  }

  .role-tag.tutor {
    background: rgba(59,130,246,.12);
    color: #2563eb;
  }

  .role-tag.tutor::before {
    background: #3b82f6;
    box-shadow: 0 0 10px #3b82f6;
  }

  .role-tag.admin {
    background: rgba(99,102,241,.12);
    color: #4f46e5;
  }

  .role-tag.admin::before {
    background: #6366f1;
    box-shadow: 0 0 10px #6366f1;
  }

  .role-card h3 {
    font-family: 'Playfair Display', serif;
    font-size: 1.5rem;
    font-weight: 700;
    color: #021b79;
    margin-bottom: 0.8rem;
    line-height: 1.3;
  }

  .role-card p {
    font-size: 14px;
    color: #5b6475;
    line-height: 1.75;
    margin-bottom: 1.5rem;
  }

  .role-link {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    text-decoration: none;
    color: #2563eb;
    font-size: 14px;
    font-weight: 700;
    transition: .25s ease;
  }

  .role-link::after {
    content: '→';
    transition: transform .25s ease;
  }

  .role-link:hover {
    color: #021b79;
  }

  .role-link:hover::after {
    transform: translateX(4px);
  }

  /* Glow decorativo */
  .roles-wrapper::before {
    content: "";
    position: absolute;
    width: 380px;
    height: 380px;
    background: rgba(56,189,248,.15);
    border-radius: 50%;
    top: -120px;
    left: -120px;
    filter: blur(80px);
  }

  .roles-wrapper::after {
    content: "";
    position: absolute;
    width: 320px;
    height: 320px;
    background: rgba(99,102,241,.12);
    border-radius: 50%;
    bottom: -120px;
    right: -120px;
    filter: blur(90px);
  }

  /* ───────── Tablet ───────── */
  @media (max-width: 860px) {
    .roles-grid {
      grid-template-columns: 1fr 1fr;
    }

    .role-card:last-child {
      grid-column: span 2;
      display: grid;
      grid-template-columns: 280px 1fr;
    }

    .role-card:last-child .role-card-img {
      height: 100%;
    }
  }

  /* ───────── Mobile ───────── */
  @media (max-width: 560px) {
    .roles-wrapper {
      padding: 4rem 0;
    }

    .roles-grid {
      grid-template-columns: 1fr;
      gap: 1.25rem;
    }

    .role-card:last-child {
      grid-column: span 1;
      display: block;
    }

    .role-card-img {
      height: 190px;
    }

    .role-card-body {
      padding: 1.4rem;
    }

    .section-header {
      margin-bottom: 2.5rem;
    }

    .section-title.centered {
      font-size: 2rem;
    }
  }
</style>