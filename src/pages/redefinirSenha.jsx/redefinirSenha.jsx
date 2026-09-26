
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./redefinirSenha.css";

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

      <div className="redefinir-senha-container">

        <div className="redefinir-senha-card">

          <h1>Redefinir senha</h1>

          <p>
            Digite sua nova senha e confirme para concluir
            a recuperação da sua conta.
          </p>

          <form onSubmit={redefinirSenha}>

            <div className="form-group">

              <label htmlFor="novaSenha">
                Nova senha
              </label>

              <input
                id="novaSenha"
                type="password"
                value={novaSenha}
                onChange={(event) =>
                  setNovaSenha(event.target.value)
                }
                placeholder="Digite sua nova senha"
                disabled={carregando}
                required
              />

            </div>

            <div className="form-group">

              <label htmlFor="confirmarSenha">
                Confirmar nova senha
              </label>

              <input
                id="confirmarSenha"
                type="password"
                value={confirmarSenha}
                onChange={(event) =>
                  setConfirmarSenha(event.target.value)
                }
                placeholder="Confirme sua nova senha"
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
                ? "Redefinindo..."
                : "Redefinir senha"}
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

export default RedefinirSenha;
