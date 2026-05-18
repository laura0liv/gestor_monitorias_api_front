<script>
  const navColumns = [
    {
      title: 'Plataforma',
      links: [
        { label: 'Inicio', href: '/' },
        { label: 'Iniciar sesión', href: '/login' },
      ],
    },
    {
      title: 'Acceso rápido',
      links: [
        { label: 'Tutorías', href: '/login' },
        { label: 'Panel académico', href: '/login' },
      ],
    },
  ];

  const year = new Date().getFullYear();
</script>

<footer>
  <div class="footer-inner">
    <div class="footer-top">
      <div class="footer-brand">
        <div class="footer-logo">
          <div class="footer-logo-icon">C</div>

          <div>
            <h4>Corporación Universitaria Latinoamericana</h4>
            <span>Sistema de Gestión de Tutorías</span>
          </div>
        </div>

        <p>
          Plataforma académica diseñada para facilitar el acompañamiento
          estudiantil, la gestión de tutorías y el seguimiento del progreso
          académico.
        </p>
      </div>

      {#each navColumns as col}
        <div class="footer-col">
          <h5>{col.title}</h5>

          {#each col.links as link}
            <a href={link.href}>{link.label}</a>
          {/each}
        </div>
      {/each}
    </div>

    <div class="footer-bottom">
      <p>
        © {year} Corporación Universitaria Latinoamericana
      </p>

      <p class="rights">
        Sistema de Gestión de Tutorías
      </p>
    </div>
  </div>
</footer>

<style>
  footer {
    position: relative;
    overflow: hidden;
    background:
      radial-gradient(circle at top left, rgba(59,130,246,0.12), transparent 30%),
      radial-gradient(circle at bottom right, rgba(96,165,250,0.1), transparent 30%),
      linear-gradient(135deg, #050b18 0%, #0a1730 45%, #10244d 100%);
    padding: 4rem 3rem 2.5rem;
  }

  footer::before {
    content: '';
    position: absolute;
    top: -120px;
    right: -120px;
    width: 280px;
    height: 280px;
    background: rgba(96,165,250,0.08);
    border-radius: 50%;
    filter: blur(80px);
  }

  .footer-inner {
    max-width: 1200px;
    margin: 0 auto;
    position: relative;
    z-index: 2;
  }

  .footer-top {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr;
    gap: 3rem;
    padding-bottom: 3rem;
    border-bottom: 1px solid rgba(255,255,255,0.08);
    margin-bottom: 2rem;
  }

  /* ── Marca ── */
  .footer-logo {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .footer-logo-icon {
    width: 52px;
    height: 52px;
    border-radius: 14px;
    background: linear-gradient(135deg, #2563eb, #60a5fa);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 22px;
    font-weight: 700;
    box-shadow: 0 10px 25px rgba(37,99,235,0.35);
    flex-shrink: 0;
  }

  .footer-brand h4 {
    font-family: 'Playfair Display', serif;
    font-size: 20px;
    color: #ffffff;
    margin: 0;
    line-height: 1.2;
  }

  .footer-brand span {
    font-size: 12px;
    color: rgba(255,255,255,0.55);
    letter-spacing: 1px;
    text-transform: uppercase;
  }

  .footer-brand p {
    font-size: 14px;
    color: rgba(255,255,255,0.6);
    line-height: 1.8;
    max-width: 380px;
    margin: 0;
  }

  /* ── Columnas ── */
  .footer-col h5 {
    font-size: 11px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: #93c5fd;
    margin-bottom: 1.25rem;
    font-weight: 700;
  }

  .footer-col a {
    display: block;
    font-size: 14px;
    color: rgba(255,255,255,0.65);
    text-decoration: none;
    margin-bottom: 0.85rem;
    transition:
      color 0.2s ease,
      transform 0.2s ease;
  }

  .footer-col a:hover {
    color: #ffffff;
    transform: translateX(4px);
  }

  /* ── Bottom ── */
  .footer-bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .footer-bottom p {
    font-size: 13px;
    color: rgba(255,255,255,0.45);
    margin: 0;
  }

  .rights {
    color: rgba(255,255,255,0.3) !important;
  }

  /* ── Tablet ── */
  @media (max-width: 860px) {
    footer {
      padding: 3rem 2rem 2rem;
    }

    .footer-top {
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
    }

    .footer-brand {
      grid-column: span 2;
    }

    .footer-brand p {
      max-width: 100%;
    }
  }

  /* ── Móvil ── */
  @media (max-width: 520px) {
    footer {
      padding: 2.5rem 1.25rem 2rem;
    }

    .footer-top {
      grid-template-columns: 1fr;
      gap: 2rem;
    }

    .footer-brand {
      grid-column: span 1;
    }

    .footer-bottom {
      flex-direction: column;
      align-items: flex-start;
    }

    .footer-brand h4 {
      font-size: 17px;
    }

    .footer-col a {
      font-size: 13px;
    }
  }
</style>