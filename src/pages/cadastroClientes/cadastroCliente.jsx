
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CadastroCliente.css";
import logoHope from "../../assets/logo_login.png";

function CadastroCliente({ modoPublico = false }) {
  const navigate = useNavigate();

  const API_URL = "http://localhost:3333";

  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);

  const [formulario, setFormulario] = useState({
    nome: "",
    email: "",
    senha: "",
    telefone: "",
    dataNascimento: "",
  });

  // =====================================================
  // USUÁRIO AUTENTICADO
  // =====================================================

  function pegarUsuarioLogado() {
    try {
      const usuarioSalvo = localStorage.getItem("usuario");

      return usuarioSalvo
        ? JSON.parse(usuarioSalvo)
        : null;
    } catch {
      return null;
    }
  }

  const usuario = pegarUsuarioLogado();

  const nomeUsuario =
    usuario?.usuario_nome ||
    usuario?.nome ||
    "Administrador";

  const inicialUsuario = nomeUsuario
    .trim()
    .charAt(0)
    .toUpperCase();

  // =====================================================
  // ALTERAR FORMULÁRIO
  // =====================================================

  function alterarFormulario(event) {
    const { name, value } = event.target;

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  }

  // =====================================================
  // CADASTRAR CLIENTE
  // =====================================================

  async function cadastrarCliente(event) {
    event.preventDefault();

    if (carregando) {
      return;
    }

    if (
      !formulario.nome.trim() ||
      !formulario.email.trim() ||
      !formulario.senha ||
      !formulario.telefone ||
      !formulario.dataNascimento
    ) {
      alert("Preencha todos os campos obrigatórios.");
      return;
    }

    const telefone = formulario.telefone.replace(/\D/g, "");

    if (telefone.length < 10 || telefone.length > 11) {
      alert("Digite um telefone válido.");
      return;
    }

    if (formulario.senha.length < 8) {
      alert("A senha deve possuir pelo menos 8 caracteres.");
      return;
    }

    // O cadastro público não precisa de token.

    const token = localStorage.getItem("token");

    if (!modoPublico && !token) {
      alert("Sessão expirada. Faça login novamente.");
      navigate("/login");
      return;
    }

    setCarregando(true);

    try {
      // Selecionar a rota de acordo com o tipo de cadastro.

      const rota = modoPublico
        ? "/cadastro/cliente"
        : "/clientes";

      const headers = {
        "Content-Type": "application/json",
      };

      // Enviar token somente no cadastro administrativo.

      if (!modoPublico && token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const resposta = await fetch(`${API_URL}${rota}`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          usuario_nome: formulario.nome.trim(),
          usuario_email: formulario.email.trim(),
          usuario_senha: formulario.senha,
          usuario_telefone: telefone,
          usuario_dt_nascimento: formulario.dataNascimento,
        }),
      });

      const textoResposta = await resposta.text();

      let dados;

      try {
        dados = JSON.parse(textoResposta);
      } catch {
        throw new Error(
          `A API retornou uma resposta inválida. Status: ${resposta.status}`
        );
      }

      if (!resposta.ok || !dados.sucesso) {
        throw new Error(
          dados.message ||
            dados.mensagem ||
            dados.erro ||
            "Não foi possível cadastrar o cliente."
        );
      }

      // Mensagem de sucesso.

      if (modoPublico) {
        alert(
          "Conta criada com sucesso! Faça login para acessar o sistema."
        );
      } else {
        alert("Cliente cadastrado com sucesso!");
      }

      // Limpar formulário.

      setFormulario({
        nome: "",
        email: "",
        senha: "",
        telefone: "",
        dataNascimento: "",
      });

      // Redirecionamento de acordo com o tipo de cadastro.

      if (modoPublico) {
        navigate("/login", { replace: true });
      } else {
        navigate("/GerenciamentoCliente");
      }
    } catch (error) {
      console.error("Erro ao cadastrar cliente:", error);

      alert(
        error.message ||
          "Erro ao cadastrar cliente. Verifique se a API está funcionando."
      );
    } finally {
      setCarregando(false);
    }
  }

  // =====================================================
  // CANCELAR CADASTRO
  // =====================================================

  function cancelarCadastro() {
    if (modoPublico) {
      navigate("/login");
    } else {
      navigate("/GerenciamentoCliente");
    }
  }

  // =====================================================
  // INTERFACE
  // =====================================================

  return (
    <main className="cadastro-cliente-page">

      {/* HEADER */}

      <header className="cadastro-cliente-header">
        <div className="cadastro-cliente-header-left">
          <div className="cadastro-cliente-logo-area">
            <img
              src={logoHope}
              alt="Hope Barbearia"
              className="cadastro-cliente-logo"
            />
          </div>

          <div className="cadastro-cliente-titulo-area">
            <h1>
              {modoPublico
                ? "Criar conta"
                : "Cadastro de cliente"}
            </h1>

            <p>
              {modoPublico
                ? "Hope Barbearia"
                : "Gerenciamento de clientes"}
            </p>
          </div>
        </div>

        {/* Mostrar administrador somente no modo administrativo */}

        {!modoPublico && (
          <div className="cadastro-cliente-usuario">
            <div className="cadastro-cliente-avatar">
              {inicialUsuario}
            </div>

            <div className="cadastro-cliente-usuario-info">
              <strong>{nomeUsuario}</strong>
              <span>Administrador</span>
            </div>
          </div>
        )}
      </header>

      {/* CONTEÚDO */}

      <section className="cadastro-cliente-content">
        <div className="cadastro-cliente-heading">
          <span>
            {modoPublico
              ? "ÁREA DO CLIENTE"
              : "GERENCIAMENTO DE CLIENTES"}
          </span>

          <h2>
            {modoPublico
              ? "Crie sua conta"
              : "Cadastrar cliente"}
          </h2>

          <p>
            {modoPublico
              ? "Preencha seus dados para criar sua conta na Hope Barbearia."
              : "Preencha os dados abaixo para cadastrar um novo cliente."}
          </p>
        </div>

        {/* CARD */}

        <div className="cadastro-cliente-card">
          <div className="cadastro-cliente-card-header">
            <div>
              <h3>
                {modoPublico
                  ? "NOVA CONTA"
                  : "NOVO CLIENTE"}
              </h3>

              <p>
                {modoPublico
                  ? "Seus dados"
                  : "Dados do cliente"}
              </p>
            </div>
          </div>

          <form
            className="cadastro-cliente-form"
            onSubmit={cadastrarCliente}
          >

            {/* NOME */}

            <div className="cadastro-cliente-form-group">
              <label htmlFor="nome">
                Nome completo
              </label>

              <input
                id="nome"
                name="nome"
                type="text"
                placeholder="Digite o nome completo"
                value={formulario.nome}
                onChange={alterarFormulario}
                autoComplete="name"
                required
              />
            </div>

            {/* EMAIL */}

            <div className="cadastro-cliente-form-group">
              <label htmlFor="email">
                E-mail
              </label>

              <input
                id="email"
                name="email"
                type="email"
                placeholder="Digite o e-mail"
                value={formulario.email}
                onChange={alterarFormulario}
                autoComplete="email"
                required
              />
            </div>

            {/* SENHA */}

            <div className="cadastro-cliente-form-group">
              <label htmlFor="senha">
                Senha
              </label>

              <div className="campo-senha-input">
                <input
                  type={mostrarSenha ? "text" : "password"}
                  id="senha"
                  name="senha"
                  value={formulario.senha}
                  onChange={alterarFormulario}
                  placeholder="Digite sua senha"
                  autoComplete="new-password"
                  minLength={8}
                  required
                />

                <button
                  type="button"
                  className="botao-olho"
                  onClick={() =>
                    setMostrarSenha((anterior) => !anterior)
                  }
                  aria-label={
                    mostrarSenha
                      ? "Ocultar senha"
                      : "Mostrar senha"
                  }
                  title={
                    mostrarSenha
                      ? "Ocultar senha"
                      : "Mostrar senha"
                  }
                >
                  {mostrarSenha ? "🙈" : "👁️"}
                </button>
              </div>

              <small>
                A senha deve possuir pelo menos 8 caracteres.
              </small>
            </div>

            {/* TELEFONE */}

            <div className="cadastro-cliente-form-group">
              <label htmlFor="telefone">
                Telefone
              </label>

              <input
                id="telefone"
                name="telefone"
                type="tel"
                placeholder="Digite o telefone"
                value={formulario.telefone}
                onChange={alterarFormulario}
                maxLength="15"
                autoComplete="tel"
                required
              />
            </div>

            {/* DATA DE NASCIMENTO */}

            <div className="cadastro-cliente-form-group">
              <label htmlFor="dataNascimento">
                Data de nascimento
              </label>

              <input
                id="dataNascimento"
                name="dataNascimento"
                type="date"
                value={formulario.dataNascimento}
                onChange={alterarFormulario}
                required
              />
            </div>

            {/* INFORMAÇÃO */}

            <div className="cadastro-cliente-info">
              <div className="cadastro-cliente-info-icon">
                i
              </div>

              <div>
                <strong>
                  {modoPublico
                    ? "Criação de conta"
                    : "Cadastro de cliente"}
                </strong>

                <p>
                  {modoPublico
                    ? "Após criar sua conta, você poderá acessar o sistema e realizar seus agendamentos."
                    : "Ao cadastrar, o cliente será registrado automaticamente no sistema da Hope Barbearia."}
                </p>
              </div>
            </div>

            {/* FOOTER */}

            <div className="cadastro-cliente-form-footer">
              <button
                type="button"
                className="cadastro-cliente-btn cadastro-cliente-btn-cancelar"
                onClick={cancelarCadastro}
                disabled={carregando}
              >
                {modoPublico
                  ? "Voltar ao login"
                  : "Cancelar"}
              </button>

              <button
                type="submit"
                className="cadastro-cliente-btn cadastro-cliente-btn-cadastrar"
                disabled={carregando}
              >
                {carregando
                  ? "Cadastrando..."
                  : modoPublico
                    ? "Criar conta"
                    : "Cadastrar cliente"}
              </button>
            </div>

          </form>
        </div>
      </section>
    </main>
  );
}

export default CadastroCliente;
