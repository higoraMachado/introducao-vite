import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./recuperacao.css";

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

      <div className="recuperacao-container">

        <div className="recuperacao-card">

          <h1>Recuperar senha</h1>

          <p>
            Digite o e-mail cadastrado na sua conta.
            Enviaremos as instruções para redefinir sua senha.
          </p>

          <form onSubmit={solicitarRecuperacao}>

            <div className="form-group">

              <label htmlFor="email">
                E-mail
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Digite seu e-mail"
                disabled={carregando}
                required
              />

            </div>

            {erro && (
              <p className="mensagem-erro">
                {erro}
              </p>
            )}

            {mensagem && (
              <p className="mensagem-sucesso">
                {mensagem}
              </p>
            )}

            <button
              type="submit"
              disabled={carregando}
            >
              {carregando
                ? "Enviando..."
                : "Enviar link de recuperação"}
            </button>

          </form>

          <button
            type="button"
            className="btn-voltar"
            onClick={() => navigate("/login")}
            disabled={carregando}
          >
            Voltar para o login
          </button>

        </div>

      </div>

    </div>
  );
}

export default Recuperacao;