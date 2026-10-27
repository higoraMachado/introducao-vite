
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Perfil.css";
import logo from "../../assets/logo-hope.png";

const API = "http://localhost:3333";

function formatarUsuario(dados) {
  const tipo = Number(dados.usuario_tipo);

  return {
    id: dados.usuario_id,
    nome: dados.usuario_nome || "",
    email: dados.usuario_email || "",
    telefone: dados.usuario_telefone || "",
    nascimento: dados.usuario_dt_nascimento
      ? String(dados.usuario_dt_nascimento).slice(0, 10)
      : "",
    tipo:
      tipo === 1
        ? "Administrador"
        : tipo === 2
        ? "Barbeiro"
        : "Cliente",
    tipoNumero: tipo,
    ativo: Number(dados.usuario_ativo) === 1,
  };
}

function Perfil() {
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState(null);
  const [dadosEditados, setDadosEditados] = useState(null);

  const [editando, setEditando] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [salvandoPerfil, setSalvandoPerfil] = useState(false);

  const [modalSenha, setModalSenha] = useState(false);
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [salvandoSenha, setSalvandoSenha] = useState(false);

  function obterToken() {
    return localStorage.getItem("token");
  }

  function voltarDashboard() {
    const tipo = usuario?.tipoNumero;

    if (tipo === 1) {
      navigate("/dashboardAdministrador");
    } else if (tipo === 2) {
      navigate("/dashboardBarbeiro");
    } else if (tipo === 3) {
      navigate("/dashboardCliente");
    } else {
      navigate("/login");
    }
  }

  useEffect(() => {
    let ativo = true;

    async function carregarPerfil() {
      const token = obterToken();

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const resposta = await fetch(
          `${API}/usuarios/perfil`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const resultado = await resposta.json();

        if (!resposta.ok || resultado.sucesso === false) {
          throw new Error(
            resultado.message ||
              resultado.mensagem ||
              "Erro ao carregar perfil."
          );
        }

        if (!resultado.dados) {
          throw new Error("Dados do usuário não encontrados.");
        }

        const formatado = formatarUsuario(resultado.dados);

        if (!ativo) return;

        setUsuario(formatado);
        setDadosEditados(formatado);

        let usuarioLocal = {};

        try {
          usuarioLocal = JSON.parse(
            localStorage.getItem("usuario") || "{}"
          );
        } catch {
          usuarioLocal = {};
        }

        localStorage.setItem(
          "usuario",
          JSON.stringify({
            ...usuarioLocal,
            ...resultado.dados,
          })
        );
      } catch (erro) {
        console.error("Erro ao carregar perfil:", erro);

        if (ativo) {
          alert(erro.message);
        }
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    }

    carregarPerfil();

    return () => {
      ativo = false;
    };
  }, [navigate]);

  function alterarCampo(event) {
    const { name, value } = event.target;

    setDadosEditados((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  }

  function cancelarEdicao() {
    setDadosEditados({ ...usuario });
    setEditando(false);
  }

  async function salvarAlteracoes(event) {
    event.preventDefault();

    if (salvandoPerfil || !dadosEditados) return;

    const token = obterToken();

    if (!token) {
      navigate("/login");
      return;
    }

    if (!dadosEditados.nome.trim()) {
      alert("Informe seu nome.");
      return;
    }

    if (!dadosEditados.email.trim()) {
      alert("Informe seu e-mail.");
      return;
    }

    setSalvandoPerfil(true);

    try {
      const resposta = await fetch(
        `${API}/usuarios/meu-perfil`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            usuario_nome: dadosEditados.nome.trim(),
            usuario_email: dadosEditados.email.trim(),
            usuario_telefone: (
              dadosEditados.telefone || ""
            ).replace(/\D/g, ""),
            usuario_dt_nascimento:
              dadosEditados.nascimento || null,
          }),
        }
      );

      const resultado = await resposta.json();

      if (!resposta.ok || resultado.sucesso === false) {
        throw new Error(
          resultado.message ||
            resultado.mensagem ||
            "Erro ao salvar perfil."
        );
      }

      if (!resultado.dados) {
        throw new Error(
          "A API não retornou os dados atualizados."
        );
      }

      const atualizado = formatarUsuario(resultado.dados);

      setUsuario(atualizado);
      setDadosEditados(atualizado);
      setEditando(false);

      let usuarioLocal = {};

      try {
        usuarioLocal = JSON.parse(
          localStorage.getItem("usuario") || "{}"
        );
      } catch {
        usuarioLocal = {};
      }

      localStorage.setItem(
        "usuario",
        JSON.stringify({
          ...usuarioLocal,
          ...resultado.dados,
        })
      );

      alert("Perfil atualizado com sucesso!");
    } catch (erro) {
      console.error("Erro ao salvar perfil:", erro);
      alert(erro.message);
    } finally {
      setSalvandoPerfil(false);
    }
  }

  function abrirModalSenha() {
    setSenhaAtual("");
    setNovaSenha("");
    setConfirmarSenha("");
    setModalSenha(true);
  }

  function fecharModalSenha() {
    if (salvandoSenha) return;

    setModalSenha(false);
    setSenhaAtual("");
    setNovaSenha("");
    setConfirmarSenha("");
  }

  async function salvarNovaSenha(event) {
    event.preventDefault();

    if (salvandoSenha) return;

    if (!senhaAtual || !novaSenha || !confirmarSenha) {
      alert("Preencha todos os campos.");
      return;
    }

    if (novaSenha !== confirmarSenha) {
      alert("As novas senhas não coincidem.");
      return;
    }

    if (novaSenha === senhaAtual) {
      alert("A nova senha deve ser diferente da atual.");
      return;
    }

    const token = obterToken();

    if (!token) {
      navigate("/login");
      return;
    }

    setSalvandoSenha(true);

    try {
      const resposta = await fetch(
        `${API}/usuarios/minha-senha`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            senhaAtual,
            novaSenha,
          }),
        }
      );

      const resultado = await resposta.json();

      if (!resposta.ok || resultado.sucesso === false) {
        throw new Error(
          resultado.message ||
            resultado.mensagem ||
            "Erro ao alterar senha."
        );
      }

      setModalSenha(false);
      setSenhaAtual("");
      setNovaSenha("");
      setConfirmarSenha("");

      alert("Senha alterada com sucesso!");
    } catch (erro) {
      console.error("Erro ao alterar senha:", erro);
      alert(erro.message);
    } finally {
      setSalvandoSenha(false);
    }
  }

  if (carregando) {
    return (
      <main className="perfil-page">
        <div className="perfil-loading">
          <div className="perfil-loading-card">
            <h2>Carregando perfil...</h2>
          </div>
        </div>
      </main>
    );
  }

  if (!usuario || !dadosEditados) {
    return (
      <main className="perfil-page">
        <div className="perfil-loading">
          <div className="perfil-loading-card">
            <h2>Não foi possível carregar seu perfil.</h2>
            <button onClick={() => navigate("/login")}>
              Voltar ao login
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="perfil-page">
  <header className="dashboard-header">
        <div className="dashboard-left">
          <button
            type="button"
            className="dashboard-logo-button"
            onClick={voltarDashboard}
          >
            <img
              src={logo}
              alt="Hope Barbearia"
              className="dashboard-logo"
            />
          </button>
        </div>

        <div className="dashboard-center">
          <div className="dashboard-title-wrapper">
            <span className="dashboard-line"></span>
            <h2>HOPE BARBEARIA</h2>
            <span className="dashboard-line"></span>
          </div>
          <p>MEU PERFIL</p>
        </div>

        <div className="dashboard-right">
          <div className="dashboard-user-info">
            <strong>{usuario.nome}</strong>
            <span>{usuario.tipo}</span>
          </div>

          <div className="dashboard-avatar">
            {usuario.nome.charAt(0).toUpperCase()}
          </div>
        </div>
      </header>


      <div className="perfil-content">
        <div className="perfil-topo">
          <div>
            <span className="heading-label">MINHA CONTA</span>
            <h1>Meu Perfil</h1>
            <p>
              Consulte e atualize suas informações pessoais.
            </p>
          </div>

          <button
            type="button"
            className="btn-cancelar"
            onClick={voltarDashboard}
          >
            Voltar
          </button>
        </div>



          <div className="profile-hero-card">
          <div className="profile-photo-section">
            <div className="profile-photo">
              {usuario.nome.charAt(0).toUpperCase()}
            </div>
          </div>

          <div className="profile-main-info">
            <h2>{usuario.nome}</h2>
            <div className="profile-info-details">
              <p>{usuario.email}</p>
              <span className="user-type-badge">
                {usuario.tipo}
              </span>
            </div>
          </div>
        </div>

        <div className="perfil-grid">
          <div className="perfil-sidebar">
            <section className="card profile-info-card">
              <div className="card-title">
                <span className="card-icon">👤</span>
                <h3>Informações pessoais</h3>
              </div>

              <form
                className="profile-form"
                onSubmit={salvarAlteracoes}
              >
                <div className="form-group">
                  <label htmlFor="perfil-nome">
                    Nome completo
                  </label>
                  <input
                    id="perfil-nome"
                    type="text"
                    name="nome"
                    value={dadosEditados.nome}
                    onChange={alterarCampo}
                    disabled={!editando || salvandoPerfil}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="perfil-email">
                    E-mail
                  </label>
                  <input
                    id="perfil-email"
                    type="email"
                    name="email"
                    value={dadosEditados.email}
                    onChange={alterarCampo}
                    disabled={!editando || salvandoPerfil}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="perfil-telefone">
                    Telefone
                  </label>
                  <input
                    id="perfil-telefone"
                    type="tel"
                    name="telefone"
                    value={dadosEditados.telefone}
                    onChange={alterarCampo}
                    disabled={!editando || salvandoPerfil}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="perfil-nascimento">
                    Data de nascimento
                  </label>
                  <input
                    id="perfil-nascimento"
                    type="date"
                    name="nascimento"
                    value={dadosEditados.nascimento}
                    onChange={alterarCampo}
                    disabled={!editando || salvandoPerfil}
                  />
                </div>

                <div className="profile-actions">
                  {editando ? (
                    <>
                      <button
                        type="button"
                        className="btn-cancelar"
                        onClick={cancelarEdicao}
                        disabled={salvandoPerfil}
                      >
                        Cancelar
                      </button>

                      <button
                        type="submit"
                        className="btn-confirmar"
                        disabled={salvandoPerfil}
                      >
                        {salvandoPerfil
                          ? "Salvando..."
                          : "Salvar alterações"}
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      className="btn-confirmar"
                      onClick={() => setEditando(true)}
                    >
                      Editar perfil
                    </button>
                  )}
                </div>
              </form>
            </section>

            <section className="card security-card">
              <div className="card-title">
                <span className="security-icon">🔒</span>
                <h3>Segurança</h3>
              </div>

              <p>
                Mantenha sua conta protegida atualizando
                sua senha quando necessário.
              </p>

              <button
                type="button"
                className="btn-security"
                onClick={abrirModalSenha}
              >
                Alterar senha
              </button>
            </section>
          </div>

          <section className="card history-card">
            <div className="card-title">
              <span className="card-icon">📋</span>
              <h3>Resumo da conta</h3>
            </div>

            <div className="profile-summary">
              <div className="profile-summary-item">
                <span>Nome</span>
                <strong>{usuario.nome}</strong>
              </div>

              <div className="profile-summary-item">
                <span>E-mail</span>
                <strong>{usuario.email}</strong>
              </div>

              <div className="profile-summary-item">
                <span>Telefone</span>
                <strong>
                  {usuario.telefone || "Não informado"}
                </strong>
              </div>

              <div className="profile-summary-item">
                <span>Tipo de conta</span>
                <strong>{usuario.tipo}</strong>
              </div>

              <div className="profile-summary-item">
                <span>Situação</span>
                <strong>
                  {usuario.ativo ? "Ativo" : "Inativo"}
                </strong>
              </div>
            </div>
          </section>
        </div>
      </div>

      {modalSenha && (
        <div className="modal-overlay">
          <div className="modal">
            <button
              type="button"
              className="modal-close"
              onClick={fecharModalSenha}
              disabled={salvandoSenha}
              aria-label="Fechar"
            >
              ×
            </button>

            <div className="modal-icon">🔒</div>

            <h3>Alterar senha</h3>

            <p>
              Informe sua senha atual e escolha
              uma nova senha.
            </p>

            <form
              className="password-form"
              onSubmit={salvarNovaSenha}
            >
              <div className="form-group">
                <label htmlFor="senha-atual">
                  Senha atual
                </label>
                <input
                  id="senha-atual"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Digite sua senha atual"
                  value={senhaAtual}
                  onChange={(event) =>
                    setSenhaAtual(event.target.value)
                  }
                  disabled={salvandoSenha}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="nova-senha">
                  Nova senha
                </label>
                <input
                  id="nova-senha"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Digite sua nova senha"
                  value={novaSenha}
                  onChange={(event) =>
                    setNovaSenha(event.target.value)
                  }
                  disabled={salvandoSenha}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmar-senha">
                  Confirmar nova senha
                </label>
                <input
                  id="confirmar-senha"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Confirme sua nova senha"
                  value={confirmarSenha}
                  onChange={(event) =>
                    setConfirmarSenha(event.target.value)
                  }
                  disabled={salvandoSenha}
                  required
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="modal-secondary"
                  onClick={fecharModalSenha}
                  disabled={salvandoSenha}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="modal-primary"
                  disabled={salvandoSenha}
                >
                  {salvandoSenha
                    ? "Salvando..."
                    : "Salvar senha"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

export default Perfil;
