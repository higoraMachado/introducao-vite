import { useState } from "react";
import "./Perfil.css";
import logo from "../../assets/logo-hope.png";

function Perfil() {
  const [editando, setEditando] = useState(false);
  const [modalSenha, setModalSenha] = useState(false);

  const [usuario, setUsuario] = useState({
    nome: "Bruno",
    telefone: "(18) 99999-9999",
    email: "bruno@email.com",
    nascimento: "2000-01-01",
    tipo: "Cliente",
  });

  const [dadosEditados, setDadosEditados] = useState(usuario);

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

  function alterarCampo(event) {
    const { name, value } = event.target;

    setDadosEditados((dadosAntigos) => ({
      ...dadosAntigos,
      [name]: value,
    }));
  }

  function salvarAlteracoes() {
    setUsuario(dadosEditados);
    setEditando(false);
  }

  function cancelarEdicao() {
    setDadosEditados(usuario);
    setEditando(false);
  }

  return (
    <div className="perfil-page">

      {/* ================= HEADER ================= */}

      <header className="dashboard-header">

        <div className="dashboard-left">
          <img
            src={logo}
            alt="Hope Barbearia"
            className="dashboard-logo"
          />
        </div>

        <div className="dashboard-center">
          <h1>Meu Perfil</h1>
          <p>Bem-vindo à Hope Barbearia</p>
        </div>

        <div className="dashboard-right">

          <div className="dashboard-avatar">
            {usuario.nome.charAt(0).toUpperCase()}
          </div>

          <div className="dashboard-user-info">
            <strong>{usuario.nome}</strong>
            <span>Minha conta</span>
          </div>

        </div>

      </header>


      {/* ================= CONTEÚDO ================= */}

      <main className="perfil-content">

        <section className="perfil-topo">

          <span className="heading-label">
            PERFIL
          </span>

          <h2>Meu Perfil</h2>

          <p>
            Gerencie suas informações pessoais e configurações da sua conta.
          </p>

        </section>


        {/* ================= CARD PRINCIPAL ================= */}

        <section className="profile-hero-card">

          <div className="profile-photo-section">

            <div className="profile-photo">
              {usuario.nome.charAt(0).toUpperCase()}
            </div>

            <button className="btn-photo">
              Alterar foto
            </button>

          </div>


          <div className="profile-main-info">

            <span className="heading-label">
              USUÁRIO
            </span>

            <h2>{usuario.nome}</h2>

            <div className="user-type-badge">
              {usuario.tipo === "Barbeiro"
                ? "💈 BARBEIRO"
                : "👤 CLIENTE"}
            </div>

            <p>
              Conta cadastrada na plataforma Hope Barbearia.
            </p>

          </div>

        </section>


        {/* ================= GRID ================= */}

        <div className="perfil-grid">


          {/* INFORMAÇÕES */}

          <section className="card profile-info-card">

            <div className="card-title">

              <div className="card-icon">
                👤
              </div>

              <div>
                <h3>Informações pessoais</h3>

                <p>
                  Mantenha seus dados atualizados.
                </p>
              </div>

            </div>


            <div className="profile-form">


              <div className="form-group">

                <label>Nome</label>

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


              <div className="form-group">

                <label>Telefone</label>

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


              <div className="form-group">

                <label>E-mail</label>

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


              <div className="form-group">

                <label>Data de nascimento</label>

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


              <div className="form-group">

                <label>Tipo de usuário</label>

                <select
                  name="tipo"
                  value={
                    editando
                      ? dadosEditados.tipo
                      : usuario.tipo
                  }
                  onChange={alterarCampo}
                  disabled={!editando}
                >
                  <option value="Cliente">
                    Cliente
                  </option>

                  <option value="Barbeiro">
                    Barbeiro
                  </option>

                </select>

              </div>


              <div className="profile-actions">

                {!editando ? (

                  <button
                    className="btn-confirmar"
                    onClick={() => setEditando(true)}
                  >
                    Editar informações
                  </button>

                ) : (

                  <>
                    <button
                      className="btn-cancelar"
                      onClick={cancelarEdicao}
                    >
                      Cancelar
                    </button>

                    <button
                      className="btn-confirmar"
                      onClick={salvarAlteracoes}
                    >
                      Salvar alterações
                    </button>
                  </>

                )}

              </div>

            </div>

          </section>


          {/* SIDEBAR */}

          <aside className="perfil-sidebar">


            {/* SEGURANÇA */}

            <section className="security-card">

              <div className="security-icon">
                🔒
              </div>

              <span className="heading-label security-label">
                SEGURANÇA
              </span>

              <h3>Alterar senha</h3>

              <p>
                Atualize sua senha para manter sua conta protegida.
              </p>

              <button
                className="btn-security"
                onClick={() => setModalSenha(true)}
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

                <span>Tipo de usuário</span>

                <strong>{usuario.tipo}</strong>

              </div>


              <div className="profile-summary-item">

                <span>Agendamentos</span>

                <strong>{historico.length}</strong>

              </div>


              <div className="profile-summary-item">

                <span>Status</span>

                <strong>Ativo</strong>

              </div>

            </section>

          </aside>

        </div>


        {/* ================= HISTÓRICO ================= */}

        <section className="card history-card">

          <div className="card-title">

            <div className="card-icon">
              📅
            </div>

            <div>

              <h3>Histórico de agendamentos</h3>

              <p>
                Consulte seus agendamentos realizados.
              </p>

            </div>

          </div>


          <div className="history-list">

            {historico.map((agendamento) => (

              <div
                className="history-item"
                key={agendamento.id}
              >

                <div className="history-date">

                  <span>DATA</span>

                  <strong>
                    {agendamento.data}
                  </strong>

                </div>


                <div className="history-info">

                  <strong>
                    {agendamento.servico}
                  </strong>

                  <span>
                    Barbeiro: {agendamento.barbeiro}
                  </span>

                </div>


                <div className="history-time">

                  <span>HORÁRIO</span>

                  <strong>
                    {agendamento.horario}
                  </strong>

                </div>


                <div className="history-status">
                  {agendamento.status}
                </div>

              </div>

            ))}

          </div>

        </section>

      </main>


      {/* ================= MODAL SENHA ================= */}

      {modalSenha && (

        <div className="modal-overlay">

          <div className="modal">

            <button
              className="modal-close"
              onClick={() => setModalSenha(false)}
            >
              ×
            </button>

            <div className="modal-icon">
              🔒
            </div>

            <h3>Alterar senha</h3>

            <p>
              Informe sua senha atual e escolha uma nova senha.
            </p>


            <div className="password-form">

              <div className="form-group">

                <label>Senha atual</label>

                <input
                  type="password"
                  placeholder="Digite sua senha atual"
                />

              </div>


              <div className="form-group">

                <label>Nova senha</label>

                <input
                  type="password"
                  placeholder="Digite sua nova senha"
                />

              </div>


              <div className="form-group">

                <label>Confirmar nova senha</label>

                <input
                  type="password"
                  placeholder="Confirme sua nova senha"
                />

              </div>

            </div>


            <div className="modal-actions">

              <button
                className="modal-secondary"
                onClick={() => setModalSenha(false)}
              >
                Cancelar
              </button>


              <button
                className="modal-primary"
                onClick={() => setModalSenha(false)}
              >
                Salvar senha
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default Perfil;