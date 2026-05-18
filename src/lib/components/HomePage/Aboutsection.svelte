<script>
  // Reemplaza las URLs por imágenes propias de tu universidad si lo deseas
  const images = [
    {
      src: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=75',
      alt: 'Campus universitario',
      wide: true,
    },
    {
      src: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=400&q=75',
      alt: 'Estudiantes en biblioteca',
      wide: false,
    },
    {
      src: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&q=75',
      alt: 'Tutoría grupal',
      wide: false,
    },
  ];
</script>

<div class="about-section">
  <div class="about-inner">

    <!-- Collage de fotos -->
    <div class="photo-grid">
      {#each images as img}
        <img
          src={img.src}
          alt={img.alt}
          class:wide={img.wide}
          loading="lazy"
        />
      {/each}
      <div class="photo-badge">
        <div class="photo-badge-num">15+</div>
        <div class="photo-badge-label">Años de trayectoria</div>
      </div>
    </div>

    <!-- Texto -->
    <div class="about-text">
      <div class="section-tag-light">Nuestra universidad</div>
      <div class="about-title">Comprometidos con la excelencia educativa</div>
      <p>
        La Universidad Central es una institución de educación superior con más de 15 años
        formando profesionales íntegros. Nuestro programa de tutorías es parte fundamental
        del modelo pedagógico, asegurando acompañamiento personalizado en cada etapa del
        proceso formativo.
      </p>
      <p>
        Con sedes en el corazón de la ciudad, contamos con modernos espacios académicos,
        laboratorios de última generación y un cuerpo docente altamente cualificado.
      </p>
      <a href="/universidad" class="btn-primary">Conoce más sobre nosotros</a>
    </div>

  </div>
</div>

<style>
  .about-section {
    background: var(--navy);
    overflow: hidden;
  }

  .about-inner {
    max-width: 1200px;
    margin: 0 auto;
    padding: 6rem 3rem;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 5rem;
    align-items: center;
  }

  /* ── Collage ── */
  .photo-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    position: relative;
  }

  .photo-grid img {
    width: 100%;
    aspect-ratio: 4 / 3;
    object-fit: cover;
    border-radius: 10px;
    filter: saturate(0.85);
    display: block;
  }

  .photo-grid img.wide {
    grid-column: span 2;
    aspect-ratio: 16 / 7;
  }

  .photo-badge {
    position: absolute;
    bottom: -16px;
    right: -16px;
    background: var(--gold);
    border-radius: 12px;
    padding: 1.25rem 1.5rem;
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
  }

  .photo-badge-num {
    font-family: 'Playfair Display', serif;
    font-size: 2rem;
    font-weight: 700;
    color: var(--navy);
  }

  .photo-badge-label {
    font-size: 12px;
    color: rgba(13, 43, 78, 0.7);
    font-weight: 500;
    margin-top: 2px;
  }

  /* ── Texto ── */
  .section-tag-light {
    display: inline-block;
    font-size: 11px;
    letter-spacing: 2px;
    text-transform: uppercase;
    font-weight: 600;
    margin-bottom: 1rem;
    color: var(--gold-light);
  }

  .about-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(1.8rem, 3vw, 2.4rem);
    font-weight: 700;
    color: var(--white);
    line-height: 1.2;
    margin-bottom: 1.5rem;
  }

  .about-text p {
    font-size: 15px;
    color: rgba(255, 255, 255, 0.6);
    line-height: 1.75;
    margin-bottom: 1rem;
  }

  .about-text p:last-of-type {
    margin-bottom: 2rem;
  }

  .about-text a {
    text-decoration: none;
    display: inline-block;
  }

  /* ── Tablet ── */
  @media (max-width: 900px) {
    .about-inner {
      grid-template-columns: 1fr;
      gap: 3.5rem;
      padding: 4rem 2rem;
    }

    .photo-badge {
      bottom: -12px;
      right: -8px;
      padding: 1rem 1.25rem;
    }

    .photo-badge-num {
      font-size: 1.6rem;
    }
  }

  /* ── Móvil ── */
  @media (max-width: 480px) {
    .about-inner {
      padding: 3.5rem 1.25rem;
      gap: 2.5rem;
    }

    .photo-grid {
      gap: 8px;
    }

    .photo-badge {
      bottom: -10px;
      right: -4px;
      padding: 0.75rem 1rem;
    }

    .photo-badge-num {
      font-size: 1.4rem;
    }

    .photo-badge-label {
      font-size: 11px;
    }

    .about-text p {
      font-size: 14px;
    }
  }
</style>