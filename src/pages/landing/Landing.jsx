import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo-hope.png";
import heroImage from "../../assets/hero-barbershop.jpg";
import fotoLanding from "../../assets/foto-landing.jpg";
import "./landing.css";

function Landing() {
  const navigate = useNavigate();
  const [menuAberto, setMenuAberto] = useState(false);
  
  const aboutTitleRef = useRef(null);
  const aboutText1Ref = useRef(null);
  const aboutText2Ref = useRef(null);

  const [visibleElements, setVisibleElements] = useState({
    title: false,
    text1: false,
    text2: false,
  });

  const irParaLoginAgendamento = () => {
    navigate("/login");
  };

  // Observer contínuo para descer e subir a página
  useEffect(() => {
    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.target === aboutTitleRef.current) {
          setVisibleElements((prev) => ({ ...prev, title: entry.isIntersecting }));
        }
        if (entry.target === aboutText1Ref.current) {
          setVisibleElements((prev) => ({ ...prev, text1: entry.isIntersecting }));
        }
        if (entry.target === aboutText2Ref.current) {
          setVisibleElements((prev) => ({ ...prev, text2: entry.isIntersecting }));
        }
      });
    };

    const observerOptions = {
      root: null,
      rootMargin: "0px 0px -50px 0px",
      threshold: 0.15,
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    if (aboutTitleRef.current) observer.observe(aboutTitleRef.current);
    if (aboutText1Ref.current) observer.observe(aboutText1Ref.current);
    if (aboutText2Ref.current) observer.observe(aboutText2Ref.current);

    return () => observer.disconnect();
  }, []);

  return (
    <div className="landing-page">

      {/* HEADER */}
      <header className="landing-header">
        <div className="header-logo">
          <img src={logo} alt="Hope Barbearia" />
        </div>

        <nav className={`landing-nav ${menuAberto ? "menu-aberto" : ""}`}>
          <a href="#inicio" onClick={() => setMenuAberto(false)}>Início</a>
          <a href="#servicos" onClick={() => setMenuAberto(false)}>Serviços</a>
          <a href="#sobre" onClick={() => setMenuAberto(false)}>Sobre nós</a>
          <a href="#equipe" onClick={() => setMenuAberto(false)}>Equipe</a>
          <a href="#contato" onClick={() => setMenuAberto(false)}>Contato</a>
        </nav>

        <button className="btn-login" onClick={() => navigate("/login")}>
          Entrar
        </button>

        <button
          className={`menu-mobile ${menuAberto ? "ativo" : ""}`}
          onClick={() => setMenuAberto(!menuAberto)}
          aria-label="Abrir menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </header>

      {/* HERO */}
      <section
        className="hero"
        id="inicio"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <span className="hero-subtitle">HOPE BARBEARIA</span>
          <h1>
            ESTILO QUE
            <br />
            <span>MARCA PRESENÇA.</span>
          </h1>
          <p>
            Seu estilo merece cuidado, precisão e personalidade.
            Viva uma experiência diferenciada na Hope Barbearia.
          </p>
          <div className="hero-buttons">
            <button className="btn-primary" onClick={irParaLoginAgendamento}>
              Agendar horário
            </button>
            <a href="#servicos" className="btn-secondary">
              Conhecer serviços
            </a>
          </div>
        </div>
        <div className="hero-decoration">
          <span>ESTILO</span>
          <span>PRECISÃO</span>
          <span>TRADIÇÃO</span>
        </div>
      </section>

      {/* SERVIÇOS */}
      <section className="services-section" id="servicos">
        <div className="section-header">
          <span className="section-label">O QUE FAZEMOS</span>
          <h2>NOSSOS <span>SERVIÇOS</span></h2>
          <p>Tudo o que você precisa para manter seu estilo sempre em dia.</p>
        </div>

        <div className="services-grid">
          <article className="service-card service-corte">
            <div className="service-overlay"></div>
            <div className="service-content">
              <div className="service-icon">✂</div>
              <h3>Corte Masculino</h3>
              <div className="service-details">
                <p>Cortes clássicos, degradê, social e estilos modernos, com acabamento personalizado.</p>
                <span className="service-more-text">PRECISÃO • ESTILO • QUALIDADE</span>
              </div>
              <div className="service-more">
                <span className="service-more-icon">+</span>
                <span className="service-more-text">SAIBA MAIS</span>
              </div>
            </div>
          </article>

          <article className="service-card service-barba">
            <div className="service-overlay"></div>
            <div className="service-content">
              <div className="service-icon">◈</div>
              <h3>Barba</h3>
              <div className="service-details">
                <p>Modelagem, alinhamento dos contornos e acabamento preciso.</p>
                <span className="service-more-text">CUIDADO • CONTORNO • ELEGÂNCIA</span>
              </div>
              <div className="service-more">
                <span className="service-more-icon">+</span>
                <span className="service-more-text">SAIBA MAIS</span>
              </div>
            </div>
          </article>

          <article className="service-card service-combo">
            <div className="service-overlay"></div>
            <div className="service-content">
              <div className="service-icon">✂</div>
              <h3>Corte + Barba</h3>
              <div className="service-details">
                <p>Combinação de corte personalizado e barba modelada.</p>
                <span className="service-more-text">EXPERIÊNCIA • ESTILO • RENOVAÇÃO</span>
              </div>
              <div className="service-more">
                <span className="service-more-icon">+</span>
                <span className="service-more-text">SAIBA MAIS</span>
              </div>
            </div>
          </article>

          <article className="service-card service-tratamentos">
            <div className="service-overlay"></div>
            <div className="service-content">
              <div className="service-icon">◆</div>
              <h3>Hair Tattoo & Freestyle</h3>
              <div className="service-details">
                <p>Desenhos personalizados e riscos criativos.</p>
                <span className="service-more-text">CUIDADO • HIDRATAÇÃO • BEM-ESTAR</span>
              </div>
              <div className="service-more">
                <span className="service-more-icon">+</span>
                <span className="service-more-text">SAIBA MAIS</span>
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* SOBRE NÓS (Com efeito contínuo ao subir e descer) */}
      <section
        className="about-section"
        id="sobre"
        style={{ backgroundImage: `url(${fotoLanding})` }}
      >
        <div className="about-image">
          <div className="about-image-content">
            <span>HOPE</span>
            <strong>BARBEARIA</strong>
          </div>
        </div>

        <div className="about-content">
          
          <div
            ref={aboutTitleRef}
            className={`reveal-fade-up ${visibleElements.title ? "visible" : ""}`}
          >
            <span className="section-label">SOBRE NÓS</span>
            <h2>
              MAIS QUE UMA
              <span>BARBEARIA.</span>
            </h2>
          </div>

          <div
            ref={aboutText1Ref}
            className={`reveal-fade-up delay-1 ${visibleElements.text1 ? "visible" : ""}`}
          >
            <p>
              Na Hope Barbearia, acreditamos que cuidar do visual é também cuidar da autoestima.
            </p>
          </div>

          <div
            ref={aboutText2Ref}
            className={`reveal-fade-up delay-2 ${visibleElements.text2 ? "visible" : ""}`}
          >
            <p>
              Nosso objetivo é proporcionar um ambiente moderno, confortável e profissional, onde cada cliente possa encontrar seu próprio estilo.
            </p>
            <button className="btn-primary" onClick={irParaLoginAgendamento}>
              Agendar horário
            </button>
          </div>

        </div>
      </section>

      {/* EQUIPE */}
      <section className="team-section" id="equipe">
        <div className="section-header">
          <span className="section-label">PROFISSIONAIS</span>
          <h2>NOSSA <span>EQUIPE</span></h2>
          <p>Profissionais preparados para cuidar do seu estilo.</p>
        </div>

        <div className="team-grid">
          <div className="team-card">
            <div className="team-photo"><span>BARBEIRO</span></div>
            <div className="team-info">
              <h3>Nosso Barbeiro</h3>
              <p>Especialista em cortes</p>
            </div>
          </div>
          <div className="team-card">
            <div className="team-photo"><span>BARBEIRO</span></div>
            <div className="team-info">
              <h3>Nosso Barbeiro</h3>
              <p>Especialista em barba</p>
            </div>
          </div>
          <div className="team-card">
            <div className="team-photo"><span>BARBEIRO</span></div>
            <div className="team-info">
              <h3>Nosso Barbeiro</h3>
              <p>Especialista em estilo</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-content">
          <span className="section-label">SEU PRÓXIMO VISUAL</span>
          <h2>PRONTO PARA<br /><span>MUDAR O VISUAL?</span></h2>
          <p>Escolha o horário que funciona para você e deixe o resto com a gente.</p>
          <button className="btn-primary" onClick={irParaLoginAgendamento}>
            Agendar agora
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="landing-footer" id="contato">
        <div className="footer-content">
          <div className="footer-brand">
            <img src={logo} alt="Hope Barbearia" />
            <p>Estilo, precisão e tradição.</p>
          </div>

          <div className="footer-column">
            <h3>Navegação</h3>
            <a href="#inicio">Início</a>
            <a href="#servicos">Serviços</a>
            <a href="#sobre">Sobre nós</a>
            <a href="#equipe">Equipe</a>
          </div>

          <div className="footer-column">
            <h3>Contato</h3>
            <span>📍 Nossa localização</span>
            <span>📞 (00) 00000-0000</span>
            <span>✉ contato@hopebarbearia.com</span>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 Hope Barbearia. Todos os direitos reservados.</p>
        </div>
      </footer>

    </div>
  );
}

export default Landing;