import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./recuperacao.css";

import logoHope from "../../assets/logo_login.png";
import fotoLogin from "../../assets/foto-login.jpg";

function Recuperacao() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function solicitarRecuperacao(event) {
    event.preventDefault();

    setMensagem("");
    setErro("");

    if (!email) {
      setErro("Digite seu e-mail.");
      return;
    }

    try {
      setCarregando(true);

      const resposta = await fetch(
        "http://localhost:3333/usuarios/solicitar-recuperacao-senha",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
          }),
        }
      );

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(
          dados.mensagem ||
          dados.message ||
          dados.erro ||
          "Não foi possível solicitar a recuperação da senha."
        );
      }

      setMensagem(
        dados.mensagem ||
        dados.message ||
        "Se o e-mail estiver cadastrado, você receberá as instruções para redefinir sua senha."
      );

      setEmail("");

    } catch (error) {
      console.error("Erro ao solicitar recuperação:", error);

      setErro(
        error.message ||
        "Erro ao solicitar recuperação de senha."
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="recuperacao-page">
      {/* FUNDO (foto da barbearia) */}

      <div
        className="recuperacao-bg"
        style={{ backgroundImage: `url(${fotoLogin})` }}
        aria-hidden="true"
      />

      {/* LADO ESQUERDO — MARCA */}

      <section className="recuperacao-brand">
        <div className="recuperacao-logo">
          <img src={logoHope} alt="Hope Barbearia" />
        </div>

        <p className="recuperacao-slogan">
          <span>Mais que um corte,</span>
          <strong>é estilo de vida.</strong>
        </p>
      </section>

      {/* LADO DIREITO — CARD */}

      <div className="recuperacao-container">
        <div className="recuperacao-card">
          <h1>Recuperar senha</h1>

          <p className="recuperacao-descricao">
            Digite o e-mail cadastrado na sua conta.
            Enviaremos as instruções para redefinir sua senha.
          </p>

          <form onSubmit={solicitarRecuperacao}>
            <div className="form-group">
              <label htmlFor="email" className="sr-only">
                E-mail
              </label>

              <div className="campo">
                <span className="campo-icone">
                  <svg
                    width="21"
                    height="21"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <path d="M3 7l9 6 9-6" />
                  </svg>
                </span>

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="E-mail"
                  disabled={carregando}
                  required
                />
              </div>
            </div>

            {erro && (
              <p className="mensagem-erro" role="alert">
                {erro}
              </p>
            )}

            {mensagem && (
              <p className="mensagem-sucesso" role="status">
                {mensagem}
              </p>
            )}

            <button
              type="submit"
              className="btn-recuperar"
              disabled={carregando}
            >
              {carregando
                ? "Enviando..."
                : "Enviar link de recuperação"}
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

          <button
            type="button"
            className="recuperacao-voltar"
            onClick={() => navigate("/login")}
            disabled={carregando}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M19 12H5" />
              <path d="M11 6l-6 6 6 6" />
            </svg>
            Voltar para o login
          </button>
        </div>
      </div>
    </div>
  );
}

export default Recuperacao;