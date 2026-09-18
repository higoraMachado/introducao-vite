import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './login.css';

import logoHope from '../../assets/logo-hope.png';
import barbearia from '../../assets/barbearia.jpg';

function Login() {
  const navigate = useNavigate();

  // ========================================
  // ESTADOS
  // ========================================

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [lembrar, setLembrar] = useState(false);

  // ========================================
  // LOGIN
  // ========================================

  function handleSubmit(event) {
    event.preventDefault();

    console.log('Login enviado');
    console.log('E-mail:', email);
    console.log('Senha:', senha);
  }

  // ========================================
  // IR PARA RECUPERAÇÃO DE SENHA
  // ========================================

  function recuperarSenha() {
    navigate('/recuperacaoSenha');
  }

  // ========================================
  // IR PARA CADASTRO
  // ========================================

  function criarConta() {
    navigate('/cadastro');
  }

  return (
    <main className="login-page">

      {/* ========================================
          LADO ESQUERDO
      ======================================== */}

      <section
        className="login-brand"
        style={{
          backgroundImage: `
            linear-gradient(
              rgba(10, 10, 10, 0.68),
              rgba(10, 10, 10, 0.82)
            ),
            url(${barbearia})
          `
        }}
      >

        <div className="brand-content">

          {/* LOGO */}

          <div className="brand-logo">

            <img
              src={logoHope}
              alt="Hope Barbearia"
            />

          </div>


          {/* TEXTO */}

          <h1>
            Sistema de Agendamento
            <br />
            e Controle Financeiro
          </h1>

          <p>
            Gestão completa da sua barbearia
            <br />
            em um só lugar.
          </p>

        </div>

      </section>


      {/* ========================================
          LADO DIREITO
      ======================================== */}

      <section className="login-container">

        <div className="login-card">

          {/* ========================================
              ÍCONE
          ======================================== */}

          <div className="barber-icon">
            <span>✂</span>
          </div>


          {/* ========================================
              TÍTULO
          ======================================== */}

          <h2>
            Login do Barbeiro
          </h2>

          <p className="login-description">
            Acesse sua conta para continuar
          </p>


          {/* ========================================
              FORMULÁRIO
          ======================================== */}

          <form onSubmit={handleSubmit}>

            {/* ========================================
                E-MAIL
            ======================================== */}

            <div className="form-group">

              <label htmlFor="email">
                E-mail
              </label>

              <div className="input-container">

                <input
                  id="email"
                  type="email"
                  placeholder="Digite seu e-mail"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />

                {/* ÍCONE DE USUÁRIO
                    APARECE SOMENTE QUANDO VAZIO */}

                {!email && (
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

                      <circle
                        cx="12"
                        cy="8"
                        r="4"
                      />

                      <path
                        d="M4 21c0-4 3.5-7 8-7s8 3 8 7"
                      />

                    </svg>

                  </span>
                )}

              </div>

            </div>


            {/* ========================================
                SENHA
            ======================================== */}

            <div className="form-group">

              <label htmlFor="senha">
                Senha
              </label>

              <div className="input-wrapper">

                {/* ÍCONE DE CADEADO
                    APARECE SOMENTE QUANDO VAZIO */}

                {!senha && (
                  <span className="input-icon">

                    <svg
                      width="21"
                      height="21"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >

                      <rect
                        x="5"
                        y="10"
                        width="14"
                        height="11"
                        rx="2"
                      />

                      <path
                        d="M8 10V7a4 4 0 0 1 8 0v3"
                      />

                    </svg>

                  </span>
                )}


                <input
                  id="senha"
                  type={
                    mostrarSenha
                      ? 'text'
                      : 'password'
                  }
                  placeholder="Digite sua senha"
                  value={senha}
                  onChange={(event) =>
                    setSenha(event.target.value)
                  }
                  required
                />


                {/* ========================================
                    BOTÃO MOSTRAR / OCULTAR SENHA
                ======================================== */}

                <button
                  type="button"
                  className="password-button"
                  onClick={() =>
                    setMostrarSenha(!mostrarSenha)
                  }
                  aria-label={
                    mostrarSenha
                      ? 'Ocultar senha'
                      : 'Mostrar senha'
                  }
                >

                  {mostrarSenha ? (

                    // OLHO FECHADO

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

                    // OLHO ABERTO

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

                      <circle
                        cx="12"
                        cy="12"
                        r="3"
                      />

                    </svg>

                  )}

                </button>

              </div>

            </div>


            {/* ========================================
                OPÇÕES
            ======================================== */}

            <div className="login-options">

              {/* LEMBRAR-ME */}

              <label className="remember">

                <input
                  type="checkbox"
                  checked={lembrar}
                  onChange={(event) =>
                    setLembrar(event.target.checked)
                  }
                />

                <span className="custom-checkbox"></span>

                <span>
                  Lembrar-me
                </span>

              </label>


              {/* ========================================
                  ESQUECI MINHA SENHA
              ======================================== */}

              <button
                type="button"
                className="forgot-password"
                onClick={recuperarSenha}
              >
                Esqueci minha senha
              </button>

            </div>


            {/* ========================================
                ENTRAR
            ======================================== */}

            <button
              type="submit"
              className="login-button"
            >
              Entrar
            </button>

          </form>


          {/* ========================================
              DIVISOR
          ======================================== */}

          <div className="divider">

            <span></span>

            <p>OU</p>

            <span></span>

          </div>


          {/* ========================================
              CRIAR CONTA
          ======================================== */}

          <button
            type="button"
            className="create-account"
            onClick={criarConta}
          >

            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >

              <circle
                cx="9"
                cy="8"
                r="4"
              />

              <path
                d="M3 21c0-4 2.5-7 6-7s6 3 6 7"
              />

              <path
                d="M19 8v6"
              />

              <path
                d="M16 11h6"
              />

            </svg>

            Criar nova conta

          </button>


          {/* ========================================
              RODAPÉ
          ======================================== */}

          <footer>
            © 2024 Hope Barbearia.
            Todos os direitos reservados.
          </footer>

        </div>

      </section>

    </main>
  );
}

export default Login;