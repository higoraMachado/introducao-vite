import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./adm.css";
import logo from "../../assets/logo-hope.png";

function Administrador() {
  const navigate = useNavigate();

  const [paginaAtiva, setPaginaAtiva] = useState("Dashboard");

  // =========================
  // MENU DO ADMINISTRADOR
  // =========================

  const menu = [
    {
      nome: "Dashboard",
      icone: "▦",
      rota: "/PainelAdministracao",
    },
    {
      nome: "Agendamentos",
      icone: "▣",
      rota: "/agendamento",
    },
    {
      nome: "Clientes",
      icone: "♙",
      rota: "/GerenciamentoCliente",
    },
    {
      nome: "Barbeiros",
      icone: "♟",
      rota: "/barbeiros",
    },
    {
      nome: "Serviços",
      icone: "✂",
      rota: "/Servicos",
    },
    {
      nome: "Estoque",
      icone: "▣",
      rota: "/Estoque",
    },
    {
      nome: "Financeiro",
      icone: "R$",
      rota: null,
    },
    {
      nome: "Relatórios",
      icone: "▤",
      rota: null,
    },
    {
      nome: "Configurações",
      icone: "⚙",
      rota: null,
    },
  ];

  // =========================
  // FUNÇÃO PARA NAVEGAR
  // =========================

  function navegar(item) {
    setPaginaAtiva(item.nome);

    if (item.rota) {
      navigate(item.rota);
    }
  }

  // =========================
  // LOGOUT
  // =========================

  function sair() {
    navigate("/login");
  }

  return (
    <div className="admin-page">

      {/* ================= HEADER ================= */}

      <header className="admin-header">

        <div className="admin-header-logo">
          <img src={logo} alt="Hope Barbearia" />
        </div>

        <div className="admin-header-title">
          <h1>Painel Administrativo</h1>
          <p>Gerencie a Hope Barbearia</p>
        </div>

        <div className="admin-header-user">

          <div className="admin-avatar">
            A
          </div>

          <div className="admin-user-info">
            <strong>Administrador</strong>
            <span>Minha conta</span>
          </div>

        </div>

      </header>


      {/* ================= ESTRUTURA ================= */}

      <div className="admin-layout">

        {/* ================= MENU LATERAL ================= */}

        <aside className="admin-sidebar">

          <div className="sidebar-title">
            <span>ADMINISTRADOR</span>
          </div>

          <nav className="sidebar-menu">

            {menu.map((item) => (

              <button
                key={item.nome}
                className={
                  paginaAtiva === item.nome
                    ? "sidebar-item active"
                    : "sidebar-item"
                }
                onClick={() => navegar(item)}
              >

                <span className="sidebar-icon">
                  {item.icone}
                </span>

                <span>
                  {item.nome}
                </span>

              </button>

            ))}

          </nav>

          {/* ================= SAIR ================= */}

          <div className="sidebar-footer">

            <button
              className="logout-button"
              onClick={sair}
            >
              <span>↪</span>
              Sair
            </button>

          </div>

        </aside>


        {/* ================= CONTEÚDO ================= */}

        <main className="admin-content">

          <div className="admin-page-heading">

            <div>

              <span className="admin-label">
                {paginaAtiva.toUpperCase()}
              </span>

              <h2>
                {paginaAtiva === "Dashboard"
                  ? "Visão geral"
                  : paginaAtiva}
              </h2>

              <p>
                Acompanhe e gerencie as informações da Hope Barbearia.
              </p>

            </div>

          </div>


          {/* ================= CARDS ================= */}

          <section className="admin-stats">

            <div className="admin-stat-card">

              <div className="stat-icon">
                📅
              </div>

              <div className="stat-info">
                <span>Agendamentos hoje</span>
                <strong>18</strong>
              </div>

              <small>+12% este mês</small>

            </div>


            <div className="admin-stat-card">

              <div className="stat-icon">
                👤
              </div>

              <div className="stat-info">
                <span>Clientes cadastrados</span>
                <strong>126</strong>
              </div>

              <small>Clientes ativos</small>

            </div>


            <div className="admin-stat-card">

              <div className="stat-icon">
                ✂
              </div>

              <div className="stat-info">
                <span>Barbeiros</span>
                <strong>6</strong>
              </div>

              <small>Profissionais ativos</small>

            </div>


            <div className="admin-stat-card">

              <div className="stat-icon">
                R$
              </div>

              <div className="stat-info">
                <span>Faturamento do mês</span>
                <strong>R$ 8.450</strong>
              </div>

              <small>Valor aproximado</small>

            </div>

          </section>


          {/* ================= GRID ================= */}

          <section className="admin-dashboard-grid">

            {/* ================= AGENDAMENTOS ================= */}

            <div className="admin-card">

              <div className="admin-card-header">

                <div>

                  <span className="admin-card-label">
                    AGENDA
                  </span>

                  <h3>Próximos agendamentos</h3>

                </div>

                <button
                  className="admin-link"
                  onClick={() => navigate("/agendamento")}
                >
                  Ver todos
                </button>

              </div>


              <div className="appointment-list">

                <div className="appointment-item">

                  <div className="appointment-time">
                    <strong>09:00</strong>
                    <span>Hoje</span>
                  </div>

                  <div className="appointment-client">
                    <strong>Lucas Almeida</strong>
                    <span>Corte de cabelo • João</span>
                  </div>

                  <span className="status confirmed">
                    Confirmado
                  </span>

                </div>


                <div className="appointment-item">

                  <div className="appointment-time">
                    <strong>10:30</strong>
                    <span>Hoje</span>
                  </div>

                  <div className="appointment-client">
                    <strong>Marcos Silva</strong>
                    <span>Barba • Carlos</span>
                  </div>

                  <span className="status confirmed">
                    Confirmado
                  </span>

                </div>


                <div className="appointment-item">

                  <div className="appointment-time">
                    <strong>14:00</strong>
                    <span>Hoje</span>
                  </div>

                  <div className="appointment-client">
                    <strong>Pedro Santos</strong>
                    <span>Corte + Barba • João</span>
                  </div>

                  <span className="status pending">
                    Pendente
                  </span>

                </div>


                <div className="appointment-item">

                  <div className="appointment-time">
                    <strong>16:30</strong>
                    <span>Hoje</span>
                  </div>

                  <div className="appointment-client">
                    <strong>Gabriel Costa</strong>
                    <span>Corte de cabelo • Rafael</span>
                  </div>

                  <span className="status confirmed">
                    Confirmado
                  </span>

                </div>

              </div>

            </div>


            {/* ================= RESUMO ================= */}

            <div className="admin-card">

              <div className="admin-card-header">

                <div>

                  <span className="admin-card-label">
                    RESUMO
                  </span>

                  <h3>Informações da barbearia</h3>

                </div>

              </div>


              <div className="summary-list">

                <div className="summary-item">
                  <span>Agendamentos hoje</span>
                  <strong>18</strong>
                </div>

                <div className="summary-item">
                  <span>Agendamentos concluídos</span>
                  <strong>12</strong>
                </div>

                <div className="summary-item">
                  <span>Agendamentos pendentes</span>
                  <strong>4</strong>
                </div>

                <div className="summary-item">
                  <span>Cancelamentos</span>
                  <strong>2</strong>
                </div>

              </div>

            </div>

          </section>


          {/* ================= ACESSOS RÁPIDOS ================= */}

          <section className="admin-card quick-access">

            <div className="admin-card-header">

              <div>

                <span className="admin-card-label">
                  ACESSO RÁPIDO
                </span>

                <h3>Gerenciamento</h3>

              </div>

            </div>


            <div className="quick-grid">

              {/* AGENDAMENTOS */}

              <button
                onClick={() => {
                  setPaginaAtiva("Agendamentos");
                  navigate("/agendamento");
                }}
              >
                <span>📅</span>
                <strong>Agendamentos</strong>
                <small>Gerenciar horários</small>
              </button>


              {/* CLIENTES */}

              <button
                onClick={() => {
                  setPaginaAtiva("Clientes");
                  navigate("/GerenciamentoCliente");
                }}
              >
                <span>👤</span>
                <strong>Clientes</strong>
                <small>Consultar clientes</small>
              </button>


              {/* BARBEIROS */}

              <button
                onClick={() => {
                  setPaginaAtiva("Barbeiros");
                  navigate("/barbeiros");
                }}
              >
                <span>✂</span>
                <strong>Barbeiros</strong>
                <small>Gerenciar profissionais</small>
              </button>


              {/* SERVIÇOS */}

              <button
                onClick={() => {
                  setPaginaAtiva("Serviços");
                  navigate("/Servicos");
                }}
              >
                <span>🧴</span>
                <strong>Serviços</strong>
                <small>Gerenciar serviços</small>
              </button>


              {/* ESTOQUE */}

              <button
                onClick={() => {
                  setPaginaAtiva("Estoque");
                  navigate("/Estoque");
                }}
              >
                <span>📦</span>
                <strong>Estoque</strong>
                <small>Gerenciar produtos</small>
              </button>


              {/* FINANCEIRO */}

              <button
                disabled
                title="Rota ainda não cadastrada"
              >
                <span>R$</span>
                <strong>Financeiro</strong>
                <small>Em desenvolvimento</small>
              </button>


              {/* RELATÓRIOS */}

              <button
                disabled
                title="Rota ainda não cadastrada"
              >
                <span>▤</span>
                <strong>Relatórios</strong>
                <small>Em desenvolvimento</small>
              </button>


              {/* CONFIGURAÇÕES */}

              <button
                disabled
                title="Rota ainda não cadastrada"
              >
                <span>⚙</span>
                <strong>Configurações</strong>
                <small>Em desenvolvimento</small>
              </button>

            </div>

          </section>

        </main>

      </div>

    </div>
  );
}

export default Administrador;