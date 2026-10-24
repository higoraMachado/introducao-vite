import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./redefinirSenha.css";

import logoHope from "../../assets/logo_login.png";
import fotoLogin from "../../assets/foto-login.jpg";

function RedefinirSenha() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Pega os dados enviados no link do e-mail
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function redefinirSenha(event) {
    event.preventDefault();

    setMensagem("");
    setErro("");

    // Verifica se o token existe
    if (!token) {
      setErro(
        "Token de recuperação não encontrado. Solicite uma nova recuperação de senha."
      );
      return;
    }

    // Verifica se o e-mail existe
    if (!email) {
      setErro(
        "E-mail de recuperação não encontrado. Solicite uma nova recuperação de senha."
      );
      return;
    }

    // Verifica a senha
    if (!novaSenha) {
      setErro("Digite uma nova senha.");
      return;
    }

    // Senha mínima
    if (novaSenha.length < 6) {
      setErro("A senha deve possuir pelo menos 6 caracteres.");
      return;
    }

    // Confirmação da senha
    if (novaSenha !== confirmarSenha) {
      setErro("As senhas não são iguais.");
      return;
    }

    try {
      setCarregando(true);

      const resposta = await fetch(
        "http://localhost:3333/usuarios/redefinir-senha",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email: email,
            token: token,
            novaSenha: novaSenha,
          }),
        }
      );

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(
          dados.mensagem ||
            dados.message ||
            dados.erro ||
            "Não foi possível redefinir sua senha."
        );
      }

      setMensagem(
        dados.mensagem ||
          dados.message ||
          "Senha redefinida com sucesso!"
      );

      setNovaSenha("");
      setConfirmarSenha("");

      // Depois de 2 segundos volta para o login
      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (error) {
      console.error("Erro ao redefinir senha:", error);

      setErro(
        error.message ||
          "Erro ao redefinir senha."
      );

    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="redefinir-senha-page">
      {/* FUNDO (foto da barbearia) */}

      <div
        className="redefinir-bg"
        style={{ backgroundImage: `url(${fotoLogin})` }}
        aria-hidden="true"
      />

      {/* LADO ESQUERDO — MARCA */}

      <section className="redefinir-brand">
        <div className="redefinir-logo">
          <img src={logoHope} alt="Hope Barbearia" />
        </div>

        <p className="redefinir-slogan">
          <span>Mais que um corte,</span>
          <strong>é estilo de vida.</strong>
        </p>
      </section>

      {/* LADO DIREITO — CARD */}

      <div className="redefinir-senha-container">
        <div className="redefinir-senha-card">
          <h1>Redefinir senha</h1>

          <p className="redefinir-descricao">
            Digite sua nova senha e confirme para concluir
            a recuperação da sua conta.
          </p>

          <form onSubmit={redefinirSenha}>
            <div className="form-group">
              <label htmlFor="novaSenha" className="sr-only">
                Nova senha
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
                    aria-hidden="true"
                  >
                    <rect x="5" y="10" width="14" height="11" rx="2" />
                    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                  </svg>
                </span>

                <input
                  id="novaSenha"
                  type="password"
                  value={novaSenha}
                  onChange={(event) =>
                    setNovaSenha(event.target.value)
                  }
                  placeholder="Nova senha (mínimo 6 caracteres)"
                  disabled={carregando}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmarSenha" className="sr-only">
                Confirmar nova senha
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
                    aria-hidden="true"
                  >
                    <rect x="5" y="10" width="14" height="11" rx="2" />
                    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                  </svg>
                </span>

                <input
                  id="confirmarSenha"
                  type="password"
                  value={confirmarSenha}
                  onChange={(event) =>
                    setConfirmarSenha(event.target.value)
                  }
                  placeholder="Confirmar nova senha"
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
              className="btn-redefinir"
              disabled={carregando}
            >
              {carregando
                ? "Redefinindo..."
                : "Redefinir senha"}
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
            className="redefinir-voltar"
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

export default RedefinirSenha;