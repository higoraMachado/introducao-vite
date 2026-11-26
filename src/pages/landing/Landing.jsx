
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo-hope.png";
import heroImage from "../../assets/hero-barbershop.jpg";
import fotoLanding from "../../assets/foto-landing.jpg";
import "./landing.css";

const API_URL = "http://localhost:3333";

function Landing() {
  const navigate = useNavigate();

  const [menuAberto, setMenuAberto] = useState(false);

  const [servicos, setServicos] = useState([]);
  const [barbeiros, setBarbeiros] = useState([]);

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const aboutTitleRef = useRef(null);
  const aboutText1Ref = useRef(null);
  const aboutText2Ref = useRef(null);

  const [visibleElements, setVisibleElements] = useState({
    title: false,
    text1: false,
    text2: false,
  });

  // =====================================================
  // CARREGAR SERVIÇOS E BARBEIROS DA API
  // =====================================================

  async function carregarCatalogo() {
    try {
      setCarregando(true);
      setErro("");

      const resposta = await fetch(
        `${API_URL}/publico/catalogo`
      );

      const resultado = await resposta.json();

      if (!resposta.ok || !resultado.sucesso) {
        throw new Error(
          resultado.message ||
          resultado.mensagem ||
          "Não foi possível carregar o catálogo."
        );
      }

      const dados = resultado.dados;

      if (
        !dados ||
        !Array.isArray(dados.servicos) ||
        !Array.isArray(dados.barbeiros)
      ) {
        throw new Error("Catálogo retornado em formato inválido.");
      }

      setServicos(dados.servicos);
      setBarbeiros(dados.barbeiros);

    } catch (error) {
      console.error(
        "Erro ao carregar catálogo:",
        error
      );

      setServicos([]);
      setBarbeiros([]);

      setErro(
        "Não foi possível carregar as informações. Tente novamente."
      );

    } finally {
      setCarregando(false);
    }
  }

  // =====================================================
  // CARREGAR AO ABRIR A PÁGINA
  // =====================================================

  useEffect(() => {
    carregarCatalogo();
  }, []);

  // =====================================================
  // NAVEGAÇÃO
  // =====================================================

  const irParaLoginAgendamento = () => {
    navigate("/login");
  };

  // =====================================================
  // FORMATAR PREÇO
  // =====================================================

  function formatarPreco(valor) {
    if (
      valor === null ||
      valor === undefined ||
      valor === ""
    ) {
      return "Preço não informado";
    }

    const numero = Number(valor);

    if (!Number.isFinite(numero)) {
      return "Preço não informado";
    }

    return numero.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  // =====================================================
  // IDENTIFICAR IMAGEM DE FUNDO DO SERVIÇO
  // =====================================================

  function identificarEstilo(nomeServico) {
    const nome = String(nomeServico || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    if (
      nome.includes("combo") ||
      (
        nome.includes("corte") &&
        nome.includes("barba")
      )
    ) {
      return "service-combo";
    }

    if (nome.includes("barba")) {
      return "service-barba";
    }

    if (
      nome.includes("tattoo") ||
      nome.includes("freestyle") ||
      nome.includes("desenho") ||
      nome.includes("risco") ||
      nome.includes("tratamento")
    ) {
      return "service-tratamentos";
    }

    if (
      nome.includes("corte") ||
      nome.includes("degrade") ||
      nome.includes("cabelo")
    ) {
      return "service-corte";
    }

    return "service-tratamentos";
  }

  // =====================================================
  // IDENTIFICAR ÍCONE DO SERVIÇO
  // =====================================================

  function identificarIcone(nomeServico) {
    const estilo = identificarEstilo(nomeServico);

    if (estilo === "service-barba") {
      return "◈";
    }

    if (estilo === "service-tratamentos") {
      return "◆";
    }

    return "✂";
  }

  // =====================================================
  // INICIAL DO BARBEIRO
  // =====================================================

  function pegarInicial(nome) {
    return String(nome || "")
      .trim()
      .charAt(0)
      .toUpperCase() || "B";
  }

  // =====================================================
  // ANIMAÇÕES DA SEÇÃO SOBRE NÓS
  // =====================================================

  useEffect(() => {
    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.target === aboutTitleRef.current) {
          setVisibleElements((prev) => ({
            ...prev,
            title: entry.isIntersecting,
          }));
        }

        if (entry.target === aboutText1Ref.current) {
          setVisibleElements((prev) => ({
            ...prev,
            text1: entry.isIntersecting,
          }));
        }

        if (entry.target === aboutText2Ref.current) {
          setVisibleElements((prev) => ({
            ...prev,
            text2: entry.isIntersecting,
          }));
        }
      });
    };

    const observerOptions = {
      root: null,
      rootMargin: "0px 0px -50px 0px",
      threshold: 0.15,
    };

    const observer = new IntersectionObserver(
      observerCallback,
      observerOptions
    );

    if (aboutTitleRef.current) {
      observer.observe(aboutTitleRef.current);
    }

    if (aboutText1Ref.current) {
      observer.observe(aboutText1Ref.current);
    }

    if (aboutText2Ref.current) {
      observer.observe(aboutText2Ref.current);
    }

    return () => observer.disconnect();
  }, []);

  // =====================================================
  // INTERFACE
  // =====================================================

  return (
    <div className="landing-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="landing-header">

        <div className="header-logo">
          <img
            src={logo}
            alt="Hope Barbearia"
          />
        </div>

        <nav
          className={`landing-nav ${
            menuAberto ? "menu-aberto" : ""
          }`}
        >

          <a
            href="#inicio"
            onClick={() => setMenuAberto(false)}
          >
            Início
          </a>

          <a
            href="#servicos"
            onClick={() => setMenuAberto(false)}
          >
            Serviços
          </a>

          <a
            href="#sobre"
            onClick={() => setMenuAberto(false)}
          >
            Sobre nós
          </a>

          <a
            href="#equipe"
            onClick={() => setMenuAberto(false)}
          >
            Equipe
          </a>

          <a
            href="#contato"
            onClick={() => setMenuAberto(false)}
          >
            Agendamento
          </a>

        </nav>

        <button
          className="btn-login"
          onClick={() => navigate("/login")}
        >
          Entrar
        </button>

        <button
          className={`menu-mobile ${
            menuAberto ? "ativo" : ""
          }`}
          onClick={() => setMenuAberto(!menuAberto)}
          aria-label="Abrir menu"
          aria-expanded={menuAberto}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

      </header>

      {/* =================================================
          HERO
      ================================================= */}

      <section
        className="hero"
        id="inicio"
        style={{
          backgroundImage: `url(${heroImage})`,
        }}
      >

        <div className="hero-overlay"></div>

        <div className="hero-content">

          <span className="hero-subtitle">
            HOPE BARBEARIA
          </span>

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

            <button
              className="btn-primary"
              onClick={irParaLoginAgendamento}
            >
              Agendar horário
            </button>

            <a
              href="#servicos"
              className="btn-secondary"
            >
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

      {/* =================================================
          SERVIÇOS - DADOS DA API
      ================================================= */}

      <section
        className="services-section"
        id="servicos"
      >

        <div className="section-header">

          <span className="section-label">
            O QUE FAZEMOS
          </span>

          <h2>
            NOSSOS <span>SERVIÇOS</span>
          </h2>

          <p>
            Tudo o que você precisa para manter
            seu estilo sempre em dia.
          </p>

        </div>

        {/* CARREGAMENTO */}

        {carregando && (
          <div className="section-header">
            <p>Carregando serviços...</p>
          </div>
        )}

        {/* ERRO */}

        {!carregando && erro && (
          <div className="section-header">

            <p>{erro}</p>

            <button
              className="btn-primary"
              onClick={carregarCatalogo}
            >
              Tentar novamente
            </button>

          </div>
        )}

        {/* NENHUM SERVIÇO */}

        {!carregando &&
          !erro &&
          servicos.length === 0 && (
            <div className="section-header">
              <p>
                Nenhum serviço disponível no momento.
              </p>
            </div>
          )}

        {/* LISTAGEM DOS SERVIÇOS */}

        <div className="services-grid">

          {servicos.map((servico) => (

            <article
              key={servico.servico_id}
              className={`service-card ${
                identificarEstilo(servico.servico_nome)
              }`}
            >

              <div className="service-overlay"></div>

              <div className="service-content">

                <div className="service-icon">
                  {identificarIcone(servico.servico_nome)}
                </div>

                <h3>
                  {servico.servico_nome}
                </h3>

                <div className="service-details">

                  {servico.servico_descricao && (
                    <p>
                      {servico.servico_descricao}
                    </p>
                  )}

                  <span className="service-more-text">

                    {formatarPreco(
                      servico.servico_preco
                    )}

                  </span>

                </div>

                <div className="service-more">

                  <span className="service-more-icon">
                    +
                  </span>

                  <span className="service-more-text">
                    SAIBA MAIS
                  </span>

                </div>

              </div>

            </article>

          ))}

        </div>

      </section>

      {/* =================================================
          SOBRE NÓS
      ================================================= */}

      <section
        className="about-section"
        id="sobre"
        style={{
          backgroundImage: `url(${fotoLanding})`,
        }}
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
            className={`reveal-fade-up ${
              visibleElements.title ? "visible" : ""
            }`}
          >

            <span className="section-label">
              SOBRE NÓS
            </span>

            <h2>
              MAIS QUE UMA
              <span>BARBEARIA.</span>
            </h2>

          </div>

          <div
            ref={aboutText1Ref}
            className={`reveal-fade-up delay-1 ${
              visibleElements.text1 ? "visible" : ""
            }`}
          >

            <p>
              Na Hope Barbearia, acreditamos que cuidar
              do visual é também cuidar da autoestima.
            </p>

          </div>

          <div
            ref={aboutText2Ref}
            className={`reveal-fade-up delay-2 ${
              visibleElements.text2 ? "visible" : ""
            }`}
          >

            <p>
              Nosso objetivo é proporcionar um ambiente
              moderno, confortável e profissional, onde
              cada cliente possa encontrar seu próprio estilo.
            </p>

            <button
              className="btn-primary"
              onClick={irParaLoginAgendamento}
            >
              Agendar horário
            </button>

          </div>

        </div>

      </section>

      {/* =================================================
          EQUIPE - DADOS DA API
      ================================================= */}

      <section
        className="team-section"
        id="equipe"
      >

        <div className="section-header">

          <span className="section-label">
            PROFISSIONAIS
          </span>

          <h2>
            NOSSA <span>EQUIPE</span>
          </h2>

          <p>
            Profissionais preparados para cuidar
            do seu estilo.
          </p>

        </div>

        {/* CARREGAMENTO */}

        {carregando && (
          <div className="section-header">
            <p>Carregando equipe...</p>
          </div>
        )}

        {/* ERRO */}

        {!carregando && erro && (
          <div className="section-header">

            <p>{erro}</p>

            <button
              className="btn-primary"
              onClick={carregarCatalogo}
            >
              Tentar novamente
            </button>

          </div>
        )}

        {/* NENHUM BARBEIRO */}

        {!carregando &&
          !erro &&
          barbeiros.length === 0 && (
            <div className="section-header">
              <p>
                Nenhum profissional disponível no momento.
              </p>
            </div>
          )}

        {/* LISTAGEM DOS BARBEIROS */}

        <div className="team-grid">

          {barbeiros.map((barbeiro) => (

            <div
              className="team-card"
              key={barbeiro.usuario_id}
            >

              <div className="team-photo">

                <span>
                  {pegarInicial(barbeiro.usuario_nome)}
                </span>

              </div>

              <div className="team-info">

                <h3>
                  {barbeiro.usuario_nome}
                </h3>

                <p>
                  {barbeiro.barbeiro_especialidade ||
                    "Barbeiro"}
                </p>

              </div>

            </div>

          ))}

        </div>

      </section>

      {/* =================================================
          CHAMADA PARA AGENDAMENTO
      ================================================= */}

      <section className="cta-section">

        <div className="cta-content">

          <span className="section-label">
            SEU PRÓXIMO VISUAL
          </span>

          <h2>
            PRONTO PARA
            <br />
            <span>MUDAR O VISUAL?</span>
          </h2>

          <p>
            Escolha o horário que funciona para você
            e deixe o resto com a gente.
          </p>

          <button
            className="btn-primary"
            onClick={irParaLoginAgendamento}
          >
            Agendar agora
          </button>

        </div>

      </section>

      {/* =================================================
          FOOTER
      ================================================= */}

      <footer
        className="landing-footer"
        id="contato"
      >

        <div className="footer-content">

          <div className="footer-brand">

            <img
              src={logo}
              alt="Hope Barbearia"
            />

            <p>
              Estilo, precisão e tradição.
            </p>

          </div>

          <div className="footer-column">

            <h3>Navegação</h3>

            <a href="#inicio">
              Início
            </a>

            <a href="#servicos">
              Serviços
            </a>

            <a href="#sobre">
              Sobre nós
            </a>

            <a href="#equipe">
              Equipe
            </a>

          </div>

          <div className="footer-column">

            <h3>Agendamento</h3>

            <button
              className="btn-primary"
              onClick={irParaLoginAgendamento}
            >
              Agendar horário
            </button>

          </div>

        </div>

        <div className="footer-bottom">

          <p>
            © {new Date().getFullYear()} Hope Barbearia.
            Todos os direitos reservados.
          </p>

        </div>

      </footer>

    </div>
  );
}

export default Landing;
