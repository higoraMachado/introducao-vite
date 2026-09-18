import { useState } from "react";
import "./adm.css";
import logo from "../../assets/logo-hope.png";

function Administrador() {
  const [paginaAtiva, setPaginaAtiva] = useState("Dashboard");

  const menu = [
    { nome: "Dashboard", icone: "▦" },
    { nome: "Agendamentos", icone: "▣" },
    { nome: "Clientes", icone: "♙" },
    { nome: "Barbeiros", icone: "♟" },
    { nome: "Serviços", icone: "✂" },
    { nome: "Financeiro", icone: "R$" },
    { nome: "Relatórios", icone: "▤" },
    { nome: "Configurações", icone: "⚙" },
  ];

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
                onClick={() => setPaginaAtiva(item.nome)}
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

          <div className="sidebar-footer">

            <button className="logout-button">
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


            {/* AGENDAMENTOS */}

            <div className="admin-card">

              <div className="admin-card-header">

                <div>
                  <span className="admin-card-label">
                    AGENDA
                  </span>

                  <h3>Próximos agendamentos</h3>
                </div>

                <button className="admin-link">
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


            {/* RESUMO */}

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

              <button
                onClick={() => setPaginaAtiva("Agendamentos")}
              >
                <span>📅</span>
                <strong>Agendamentos</strong>
                <small>Gerenciar horários</small>
              </button>


              <button
                onClick={() => setPaginaAtiva("Clientes")}
              >
                <span>👤</span>
                <strong>Clientes</strong>
                <small>Consultar clientes</small>
              </button>


              <button
                onClick={() => setPaginaAtiva("Barbeiros")}
              >
                <span>✂</span>
                <strong>Barbeiros</strong>
                <small>Gerenciar profissionais</small>
              </button>


              <button
                onClick={() => setPaginaAtiva("Serviços")}
              >
                <span>🧴</span>
                <strong>Serviços</strong>
                <small>Gerenciar serviços</small>
              </button>


              <button
                onClick={() => setPaginaAtiva("Financeiro")}
              >
                <span>R$</span>
                <strong>Financeiro</strong>
                <small>Acompanhar valores</small>
              </button>


              <button
                onClick={() => setPaginaAtiva("Relatórios")}
              >
                <span>▤</span>
                <strong>Relatórios</strong>
                <small>Consultar dados</small>
              </button>

            </div>

          </section>

        </main>

      </div>

    </div>
  );
}

export default Administrador;