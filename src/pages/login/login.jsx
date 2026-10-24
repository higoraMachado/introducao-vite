import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import "./login.css";

import logoHope from "../../assets/logo_login.png";
import fotoLogin from "../../assets/foto-login.jpg";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  // =====================================================
  // ROTA DE ORIGEM
  // =====================================================

  const destino = location.state?.from || null;

  // =====================================================
  // ESTADOS
  // =====================================================

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [lembrar, setLembrar] = useState(false);
  const [mostrarOpcoesCadastro, setMostrarOpcoesCadastro] = useState(false);

  // =====================================================
  // LOGIN
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !senha) {
      alert("Preencha o e-mail e a senha.");
      return;
    }

    try {
      const resposta = await fetch("http://localhost:3333/login", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          email: email,
          senha: senha,
        }),
      });

      const dados = await resposta.json();

      // =================================================
      // ERRO NO LOGIN
      // =================================================

      if (!resposta.ok) {
        alert(dados.erro || dados.message || "E-mail ou senha inválidos.");

        return;
      }

      // =================================================
      // SALVA TOKEN
      // =================================================

      localStorage.setItem("token", dados.dados.token);

      // =================================================
      // SALVA USUARIO
      // =================================================

      localStorage.setItem("usuario", JSON.stringify(dados.dados.usuario));

      console.log("Login realizado:", dados.dados);

      // =================================================
      // IDENTIFICA TIPO DO USUARIO
      // =================================================

      const tipoUsuario = Number(dados.dados.usuario?.usuario_tipo);

      // =================================================
      // CLIENTE
      // =================================================

      if (tipoUsuario === 3) {
        /*
         * Se o cliente tentou acessar uma página
         * protegida antes de fazer login,
         * voltamos para aquela página.
         *
         * Exemplo:
         *
         * Landing
         * ↓
         * Agendar horário
         * ↓
         * Login
         * ↓
         * Agendamento
         */

        if (destino) {
          navigate(destino, {
            replace: true,
          });

          return;
        }

        // Caso tenha entrado normalmente
        navigate("/dashboardCliente", {
          replace: true,
        });

        return;
      }

      // =================================================
      // BARBEIRO
      // =================================================

      if (tipoUsuario === 2) {
        navigate("/dashboardBarbeiro", {
          replace: true,
        });

        return;
      }

      // =================================================
      // ADMINISTRADOR
      // =================================================

      if (tipoUsuario === 1) {
        navigate("/dashboardAdministrador", {
          replace: true,
        });

        return;
      }

      // =================================================
      // TIPO DESCONHECIDO
      // =================================================

      alert("Tipo de usuário não reconhecido.");
    } catch (error) {
      console.error("Erro ao conectar com o servidor:", error);

      alert(
        "Não foi possível conectar ao servidor. " +
          "Verifique se o backend está rodando.",
      );
    }
  };

  // =====================================================
  // RECUPERAR SENHA
  // =====================================================

  function recuperarSenha() {
    navigate("/recuperacaoSenha");
  }

  // =====================================================
  // CRIAR CONTA
  // =====================================================

  function criarConta() {
    setMostrarOpcoesCadastro(true);
  }
  // =====================================================
  // TELA
  // =====================================================

  return (
    <main className="login-page">
      {/* =================================================
          FUNDO (foto da barbearia)
      ================================================= */}

      <div
        className="login-bg"
        style={{ backgroundImage: `url(${fotoLogin})` }}
        aria-hidden="true"
      />

      {/* =================================================
          LADO ESQUERDO — MARCA
      ================================================= */}

      <section className="login-brand">
        <div className="brand-content">
          <div className="brand-logo">
            <img src={logoHope} alt="Hope Barbearia" />
          </div>

          <p className="brand-slogan">
            <span>Mais que um corte,</span>
            <strong>é estilo de vida.</strong>
          </p>
        </div>
      </section>

      {/* =================================================
          LADO DIREITO — CARD DE LOGIN
      ================================================= */}

      <section className="login-container">
        <div className="login-card">
          <h2>Bem-vindo</h2>

          <p className="login-description">Acesso ao sistema</p>

          {/* =================================================
              FORMULÁRIO
          ================================================= */}

          <form onSubmit={handleSubmit}>
            {/* =================================================
                E-MAIL
            ================================================= */}

            <div className="form-group">
              <label htmlFor="email" className="sr-only">E-mail</label>

              <div className="input-container">
                <input
                  id="email"
                  type="email"
                  placeholder="E-mail"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />

                {(
                  <span className="email-icon">
                    <svg
                      width="21"
                      height="21"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="8" r="4" />

                      <path d="M4 21c0-4 3.5-7 8-7s8 3 8 7" />
                    </svg>
                  </span>
                )}
              </div>
            </div>

            {/* =================================================
                SENHA
            ================================================= */}

            <div className="form-group">
              <label htmlFor="senha" className="sr-only">Senha</label>

              <div className="input-wrapper">
                {(
                  <span className="input-icon">
                    <svg
                      width="21"
                      height="21"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect x="5" y="10" width="14" height="11" rx="2" />

                      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                    </svg>
                  </span>
                )}

                <input
                  id="senha"
                  type={mostrarSenha ? "text" : "password"}
                  placeholder="Senha"
                  value={senha}
                  onChange={(event) => setSenha(event.target.value)}
                  required
                />

                {/* =================================================
                    MOSTRAR / OCULTAR SENHA
                ================================================= */}

                <button
                  type="button"
                  className="password-button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                >
                  {mostrarSenha ? (
                    <svg
                      width="21"
                      height="21"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 3l18 18" />

                      <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />

                      <path d="M9.9 4.2A10.8 10.8 0 0 1 12 4c5 0 9 4 10 8-0.4 1.4-1.2 2.6-2.2 3.7" />

                      <path d="M6.6 6.6C4.7 7.8 3.4 9.5 2 12c1 4 5 8 10 8 1.4 0 2.7-.3 3.9-.9" />
                    </svg>
                  ) : (
                    <svg
                      width="21"
                      height="21"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />

                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* =================================================
                OPÇÕES
            ================================================= */}

            <div className="login-options">
              {/* LEMBRAR */}

              <label className="remember">
                <input
                  type="checkbox"
                  checked={lembrar}
                  onChange={(event) => setLembrar(event.target.checked)}
                />

                <span className="custom-checkbox"></span>

                <span>Lembrar de mim</span>
              </label>

              {/* ESQUECI SENHA */}

              <button
                type="button"
                className="forgot-password"
                onClick={recuperarSenha}
              >
                Esqueceu sua senha?
              </button>
            </div>

            {/* =================================================
                ENTRAR
            ================================================= */}

            <button type="submit" className="login-button">
              Entrar
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M5 12h14" />
                <path d="M13 6l6 6-6 6" />
              </svg>
            </button>
          </form>

          {/* =================================================
              DIVISOR
          ================================================= */}

          <div className="divider">
            <span></span>

            <p>OU</p>

            <span></span>
          </div>

          {/* =================================================
              CRIAR CONTA
          ================================================= */}

          <button type="button" className="create-account" onClick={criarConta}>
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <circle cx="9" cy="8" r="4" />

              <path d="M3 21c0-4 2.5-7 6-7s6 3 6 7" />

              <path d="M19 8v6" />

              <path d="M16 11h6" />
            </svg>
            Criar nova conta
          </button>
          {mostrarOpcoesCadastro && (
            <div className="cadastro-modal-overlay">
              <div
                className="cadastro-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="titulo-cadastro"
              >
                <button
                  type="button"
                  className="cadastro-modal-fechar"
                  onClick={() => setMostrarOpcoesCadastro(false)}
                  aria-label="Fechar janela"
                >
                  ×
                </button>

                <div className="cadastro-modal-icone">✂</div>

                <h2 id="titulo-cadastro">Criar nova conta</h2>

                <p>Como você deseja se cadastrar?</p>

                <button
                  type="button"
                  className="cadastro-opcao"
                  onClick={() => navigate("/CriarConta")}
                >
                  <span className="cadastro-opcao-icone">👤</span>
                  <span>
                    <strong>Sou Cliente</strong>
                    <small>Quero agendar meus horários</small>
                  </span>
                  <span className="cadastro-seta">›</span>
                </button>

                <button
                  type="button"
                  className="cadastro-opcao"
                  onClick={() => navigate("/cadastroBarbeiro")}
                >
                  <span className="cadastro-opcao-icone">💈</span>
                  <span>
                    <strong>Sou Barbeiro</strong>
                    <small>Quero fazer parte da Hope Barbearia</small>
                  </span>
                  <span className="cadastro-seta">›</span>
                </button>
              </div>
            </div>
          )}

          {/* =================================================
              RODAPÉ
          ================================================= */}

          <footer>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <rect x="5" y="10" width="14" height="11" rx="2" />
              <path d="M8 10V7a4 4 0 0 1 8 0v3" />
            </svg>
            <span>Acesso restrito para usuários autorizados</span>
          </footer>
        </div>
      </section>
    </main>
  );
}

export default Login;