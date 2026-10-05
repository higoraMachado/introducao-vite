import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Perfil.css";
import logo from "../../assets/logo-hope.png";

function Perfil() {
  const navigate = useNavigate();

  const [editando, setEditando] = useState(false);
  const [modalSenha, setModalSenha] = useState(false);
  const [usuario, setUsuario] = useState(null);
  const [dadosEditados, setDadosEditados] = useState(null);

  const historico = [
    {
      id: 1,
      data: "20 AGO 2026",
      servico: "Corte de cabelo",
      barbeiro: "João",
      horario: "14:00",
      status: "Concluído",
    },
    {
      id: 2,
      data: "15 AGO 2026",
      servico: "Barba",
      barbeiro: "Carlos",
      horario: "10:30",
      status: "Concluído",
    },
    {
      id: 3,
      data: "02 AGO 2026",
      servico: "Corte + Barba",
      barbeiro: "João",
      horario: "16:00",
      status: "Concluído",
    },
  ];

  // =====================================================
  // VOLTAR PARA O DASHBOARD
  // =====================================================

  function voltarDashboard() {
    navigate("/dashboardBarbeiro");
  }

  // =====================================================
  // CARREGAR PERFIL
  // =====================================================

  useEffect(() => {
    async function carregarPerfil() {
      const token = localStorage.getItem("token");
      const usuarioSalvo = localStorage.getItem("usuario");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const resposta = await fetch(
          "http://localhost:3333/usuarios/perfil",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const dados = await resposta.json();

        if (!resposta.ok) {
          throw new Error(
            dados.mensagem ||
              dados.message ||
              "Erro ao carregar perfil"
          );
        }

        const usuarioAPI = dados.dados;

        const usuarioFormatado = {
          id: usuarioAPI.usuario_id,
          nome: usuarioAPI.usuario_nome || "",
          telefone: usuarioAPI.usuario_telefone || "",
          email: usuarioAPI.usuario_email || "",
          nascimento: usuarioAPI.usuario_dt_nascimento
            ? String(usuarioAPI.usuario_dt_nascimento).substring(0, 10)
            : "",
          tipo:
            Number(usuarioAPI.usuario_tipo) === 1
              ? "Administrador"
              : Number(usuarioAPI.usuario_tipo) === 2
                ? "Barbeiro"
                : "Cliente",
          ativo:
            Number(usuarioAPI.usuario_ativo) === 1,
        };

        setUsuario(usuarioFormatado);
        setDadosEditados(usuarioFormatado);

        // Mantém o localStorage atualizado
        if (usuarioSalvo) {
          const usuarioAtual = JSON.parse(usuarioSalvo);

          localStorage.setItem(
            "usuario",
            JSON.stringify({
              ...usuarioAtual,
              ...usuarioAPI,
            })
          );
        }
      } catch (error) {
        console.error(
          "Erro ao carregar perfil:",
          error
        );

        // Se a API falhar, tenta usar os dados do login
        if (usuarioSalvo) {
          try {
            const usuarioLocal =
              JSON.parse(usuarioSalvo);

            const usuarioFormatado = {
              id: usuarioLocal.usuario_id,
              nome:
                usuarioLocal.usuario_nome || "",
              telefone:
                usuarioLocal.usuario_telefone || "",
              email:
                usuarioLocal.usuario_email || "",
              nascimento:
                usuarioLocal.usuario_dt_nascimento
                  ? String(
                      usuarioLocal.usuario_dt_nascimento
                    ).substring(0, 10)
                  : "",
              tipo:
                Number(usuarioLocal.usuario_tipo) === 1
                  ? "Administrador"
                  : Number(
                        usuarioLocal.usuario_tipo
                      ) === 2
                    ? "Barbeiro"
                    : "Cliente",
              ativo:
                Number(
                  usuarioLocal.usuario_ativo
                ) === 1,
            };

            setUsuario(usuarioFormatado);
            setDadosEditados(usuarioFormatado);
          } catch (erroLocal) {
            console.error(
              "Erro ao recuperar usuário do localStorage:",
              erroLocal
            );
          }
        }
      }
    }

    carregarPerfil();
  }, [navigate]);

  // =====================================================
  // ALTERAR CAMPO
  // =====================================================

  function alterarCampo(event) {
    const { name, value } = event.target;

    setDadosEditados((dadosAntigos) => ({
      ...dadosAntigos,
      [name]: value,
    }));
  }

  // =====================================================
  // SALVAR ALTERACOES
  // =====================================================

  async function salvarAlteracoes() {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const resposta = await fetch(
        `http://localhost:3333/usuarios/${usuario.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            usuario_nome: dadosEditados.nome,
            usuario_email: dadosEditados.email,
            usuario_telefone:
              dadosEditados.telefone.replace(/\D/g, ""),
            usuario_dt_nascimento:
              dadosEditados.nascimento,
          }),
        }
      );

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(
          dados.mensagem ||
            dados.message ||
            "Erro ao atualizar os dados"
        );
      }

      // Atualiza os dados exibidos
      setUsuario(dadosEditados);

      // Atualiza o localStorage
      const usuarioAtual =
        JSON.parse(
          localStorage.getItem("usuario")
        ) || {};

      localStorage.setItem(
        "usuario",
        JSON.stringify({
          ...usuarioAtual,
          usuario_nome:
            dadosEditados.nome,
          usuario_email:
            dadosEditados.email,
          usuario_telefone:
            dadosEditados.telefone,
          usuario_dt_nascimento:
            dadosEditados.nascimento,
        })
      );

      setEditando(false);

      alert(
        "Dados atualizados com sucesso!"
      );
    } catch (error) {
      console.error(
        "Erro ao atualizar perfil:",
        error
      );

      alert(
        error.message ||
          "Erro ao atualizar perfil."
      );
    }
  }

  // =====================================================
  // CANCELAR EDICAO
  // =====================================================

  function cancelarEdicao() {
    setDadosEditados(usuario);
    setEditando(false);
  }

  // =====================================================
  // CARREGANDO
  // =====================================================

  if (!usuario || !dadosEditados) {
    return (
      <main className="perfil-page">
        <div className="perfil-loading">
          <div className="perfil-loading-card">
            <span>HOPE BARBEARIA</span>
            <strong>
              Carregando perfil...
            </strong>
          </div>
        </div>
      </main>
    );
  }

  // =====================================================
  // TELA
  // =====================================================

  return (
    <main className="perfil-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="dashboard-header">

        <div className="dashboard-left">

          <button
            type="button"
            className="dashboard-logo-button"
            onClick={voltarDashboard}
            title="Voltar para o Dashboard"
          >
            <img
              src={logo}
              alt="Hope Barbearia"
              className="dashboard-logo"
            />
          </button>

        </div>

        <div className="dashboard-center">

          <h1>Meu perfil</h1>

          <p>
            Dados da minha conta
          </p>

        </div>

        <div className="dashboard-right">

          <div className="dashboard-avatar">

            {usuario.nome
              .charAt(0)
              .toUpperCase()}

          </div>

          <div className="dashboard-user-info">

            <strong>
              {usuario.nome}
            </strong>

            <span>
              {usuario.tipo}
            </span>

          </div>

        </div>

      </header>


      {/* =================================================
          CONTEUDO
      ================================================= */}

      <section className="perfil-content">

        {/* =================================================
            CABECALHO DA PAGINA
        ================================================= */}

        <section className="perfil-topo">

          <div>

            <span className="heading-label">
              PERFIL DO BARBEIRO
            </span>

            <h2>
              Minha conta
            </h2>

          </div>

          <p>
            Gerencie suas informações pessoais,
            fotos e dados da sua conta.
          </p>

        </section>


        {/* =================================================
            CARD PRINCIPAL
        ================================================= */}

        <section className="profile-hero-card">

          <div className="profile-photo-section">

            <div className="profile-photo">

              {usuario.nome
                .charAt(0)
                .toUpperCase()}

            </div>

            <button
              type="button"
              className="btn-photo"
            >
              Alterar foto
            </button>

          </div>


          <div className="profile-main-info">

            <span className="heading-label">
              USUÁRIO
            </span>

            <h2>
              {usuario.nome}
            </h2>

            <div className="user-type-badge">

              {usuario.tipo === "Barbeiro"
                ? "💈 BARBEIRO"
                : usuario.tipo ===
                    "Administrador"
                  ? "⚙️ ADMINISTRADOR"
                  : "👤 CLIENTE"}

            </div>

            <p>
              Conta cadastrada na plataforma
              Hope Barbearia.
            </p>

          </div>

        </section>


        {/* =================================================
            GRID
        ================================================= */}

        <div className="perfil-grid">

          {/* =================================================
              INFORMACOES PESSOAIS
          ================================================= */}

          <section className="card profile-info-card">

            <div className="card-title">

              <div className="card-icon">
                👤
              </div>

              <div>

                <h3>
                  Informações pessoais
                </h3>

                <p>
                  Mantenha seus dados atualizados.
                </p>

              </div>

            </div>


            <div className="profile-form">

              {/* NOME */}

              <div className="form-group">

                <label>
                  Nome
                </label>

                <input
                  type="text"
                  name="nome"
                  value={
                    editando
                      ? dadosEditados.nome
                      : usuario.nome
                  }
                  onChange={alterarCampo}
                  disabled={!editando}
                />

              </div>


              {/* TELEFONE */}

              <div className="form-group">

                <label>
                  Telefone
                </label>

                <input
                  type="text"
                  name="telefone"
                  value={
                    editando
                      ? dadosEditados.telefone
                      : usuario.telefone
                  }
                  onChange={alterarCampo}
                  disabled={!editando}
                />

              </div>


              {/* EMAIL */}

              <div className="form-group">

                <label>
                  E-mail
                </label>

                <input
                  type="email"
                  name="email"
                  value={
                    editando
                      ? dadosEditados.email
                      : usuario.email
                  }
                  onChange={alterarCampo}
                  disabled={!editando}
                />

              </div>


              {/* NASCIMENTO */}

              <div className="form-group">

                <label>
                  Data de nascimento
                </label>

                <input
                  type="date"
                  name="nascimento"
                  value={
                    editando
                      ? dadosEditados.nascimento
                      : usuario.nascimento
                  }
                  onChange={alterarCampo}
                  disabled={!editando}
                />

              </div>


              {/* TIPO */}

              <div className="form-group">

                <label>
                  Tipo de usuário
                </label>

                <input
                  type="text"
                  value={usuario.tipo}
                  disabled
                />

              </div>


              {/* STATUS */}

              <div className="form-group">

                <label>
                  Status
                </label>

                <input
                  type="text"
                  value={
                    usuario.ativo
                      ? "Ativo"
                      : "Inativo"
                  }
                  disabled
                />

              </div>


              {/* BOTOES */}

              <div className="profile-actions">

                {!editando ? (

                  <button
                    type="button"
                    className="btn-confirmar"
                    onClick={() =>
                      setEditando(true)
                    }
                  >
                    Editar informações
                  </button>

                ) : (

                  <>

                    <button
                      type="button"
                      className="btn-cancelar"
                      onClick={
                        cancelarEdicao
                      }
                    >
                      Cancelar
                    </button>

                    <button
                      type="button"
                      className="btn-confirmar"
                      onClick={
                        salvarAlteracoes
                      }
                    >
                      Salvar alterações
                    </button>

                  </>

                )}

              </div>

            </div>

          </section>


          {/* =================================================
              SIDEBAR
          ================================================= */}

          <aside className="perfil-sidebar">

            {/* SEGURANCA */}

            <section className="security-card">

              <div className="security-icon">
                🔒
              </div>

              <span className="heading-label security-label">
                SEGURANÇA
              </span>

              <h3>
                Alterar senha
              </h3>

              <p>
                Atualize sua senha para manter
                sua conta protegida.
              </p>

              <button
                type="button"
                className="btn-security"
                onClick={() =>
                  setModalSenha(true)
                }
              >
                Alterar senha
              </button>

            </section>


            {/* RESUMO */}

            <section className="profile-summary">

              <span className="heading-label">
                RESUMO DA CONTA
              </span>

              <div className="profile-summary-item">

                <span>
                  Tipo de usuário
                </span>

                <strong>
                  {usuario.tipo}
                </strong>

              </div>


              <div className="profile-summary-item">

                <span>
                  Usuário
                </span>

                <strong>
                  # {usuario.id}
                </strong>

              </div>


              <div className="profile-summary-item">

                <span>
                  Agendamentos
                </span>

                <strong>
                  {historico.length}
                </strong>

              </div>


              <div className="profile-summary-item">

                <span>
                  Status
                </span>

                <strong
                  className={
                    usuario.ativo
                      ? "status-ativo"
                      : "status-inativo"
                  }
                >
                  {usuario.ativo
                    ? "Ativo"
                    : "Inativo"}
                </strong>

              </div>

            </section>

          </aside>

        </div>


        {/* =================================================
            HISTORICO
        ================================================= */}

        <section className="card history-card">

          <div className="card-title">

            <div className="card-icon">
              📅
            </div>

            <div>

              <h3>
                Histórico de agendamentos
              </h3>

              <p>
                Consulte seus agendamentos realizados.
              </p>

            </div>

          </div>


          <div className="history-list">

            {historico.map(
              (agendamento) => (

                <div
                  className="history-item"
                  key={agendamento.id}
                >

                  <div className="history-date">

                    <span>
                      DATA
                    </span>

                    <strong>
                      {agendamento.data}
                    </strong>

                  </div>


                  <div className="history-info">

                    <strong>
                      {agendamento.servico}
                    </strong>

                    <span>
                      Barbeiro:{" "}
                      {agendamento.barbeiro}
                    </span>

                  </div>


                  <div className="history-time">

                    <span>
                      HORÁRIO
                    </span>

                    <strong>
                      {agendamento.horario}
                    </strong>

                  </div>


                  <div className="history-status">
                    {agendamento.status}
                  </div>

                </div>

              )
            )}

          </div>

        </section>

      </section>


      {/* =================================================
          MODAL ALTERAR SENHA
      ================================================= */}

      {modalSenha && (

        <div className="modal-overlay">

          <div className="modal">

            <button
              type="button"
              className="modal-close"
              onClick={() =>
                setModalSenha(false)
              }
            >
              ×
            </button>


            <div className="modal-icon">
              🔒
            </div>


            <h3>
              Alterar senha
            </h3>

            <p>
              Informe sua senha atual e escolha
              uma nova senha.
            </p>


            <div className="password-form">

              <div className="form-group">

                <label>
                  Senha atual
                </label>

                <input
                  type="password"
                  placeholder="Digite sua senha atual"
                />

              </div>


              <div className="form-group">

                <label>
                  Nova senha
                </label>

                <input
                  type="password"
                  placeholder="Digite sua nova senha"
                />

              </div>


              <div className="form-group">

                <label>
                  Confirmar nova senha
                </label>

                <input
                  type="password"
                  placeholder="Confirme sua nova senha"
                />

              </div>

            </div>


            <div className="modal-actions">

              <button
                type="button"
                className="modal-secondary"
                onClick={() =>
                  setModalSenha(false)
                }
              >
                Cancelar
              </button>


              <button
                type="button"
                className="modal-primary"
                onClick={() =>
                  setModalSenha(false)
                }
              >
                Salvar senha
              </button>

            </div>

          </div>

        </div>

      )}

    </main>
  );
}

export default Perfil;