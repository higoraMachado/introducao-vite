
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./dashboardAdministrador.css";
import logo from "../../assets/logo-hope.png";

const API_URL = "http://localhost:3333";

const menu = [
  { nome: "Dashboard", icone: "▦", rota: "/dashboardAdministrador" },
  { nome: "Agendamentos", icone: "▣", rota: "/gerenciamentoAgendamentos" },
  { nome: "Clientes", icone: "♙", rota: "/GerenciamentoCliente" },
  { nome: "Barbeiros", icone: "♟", rota: "/barbeiros" },
  { nome: "Serviços", icone: "✂", rota: "/Servicos" },
  { nome: "Estoque", icone: "📦", rota: "/Estoque" },
  {
    nome: "Movimentação de Estoque",
    icone: "🔄",
    rota: "/MovimentacaoEstoque",
  },
  { nome: "Financeiro", icone: "R$", rota: "/ControleFinanceiro" },
  {
    nome: "Registrar Pagamentos",
    icone: "💳",
    rota: "/RegistrarPagamentos",
  },
  { nome: "Despesas", icone: "📋", rota: "/Despesas" },
  { nome: "Relatórios", icone: "▤", rota: null },
  { nome: "Configurações", icone: "⚙", rota: null },
  { nome: "Minha Conta", icone: "👤", rota: "/perfil" },
];

const dadosIniciais = {
  agendamentosHoje: 0,
  totalClientes: 0,
  totalBarbeiros: 0,
  faturamentoMes: 0,
  agendamentosConcluidosHoje: 0,
  agendamentosPendentesHoje: 0,
  agendamentosCanceladosHoje: 0,
  proximosAgendamentos: [],
};

function formatarMoeda(valor) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(valor) || 0);
}

function formatarDia(data) {
  if (!data) return "";

  const hoje = new Date();

  const dataHoje = [
    hoje.getFullYear(),
    String(hoje.getMonth() + 1).padStart(2, "0"),
    String(hoje.getDate()).padStart(2, "0"),
  ].join("-");

  const dataAgendamento = String(data).slice(0, 10);

  if (dataAgendamento === dataHoje) {
    return "Hoje";
  }

  const [ano, mes, dia] = dataAgendamento.split("-");

  if (!ano || !mes || !dia) {
    return dataAgendamento;
  }

  return `${dia}/${mes}`;
}

function classeStatus(status) {
  const valor = String(status || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  if (
    ["confirmado", "confirmada", "concluido", "concluida"].includes(valor)
  ) {
    return "confirmed";
  }

  return "pending";
}

function DashboardAdministrador() {
  const navigate = useNavigate();

  const [dados, setDados] = useState(dadosIniciais);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [nomeAdministrador, setNomeAdministrador] =
    useState("Administrador");

  useEffect(() => {
    try {
      const usuario = JSON.parse(
        localStorage.getItem("usuario") || "{}"
      );

      setNomeAdministrador(
        usuario.usuario_nome || usuario.nome || "Administrador"
      );
    } catch {
      setNomeAdministrador("Administrador");
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function carregarDashboard() {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      try {
        setErro("");

        const resposta = await fetch(`${API_URL}/dashboard`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        });

        const resultado = await resposta.json();

        if (!resposta.ok || resultado.sucesso === false) {
          throw new Error(
            resultado.mensagem ||
              resultado.message ||
              "Erro ao carregar o dashboard."
          );
        }

        setDados({
          ...dadosIniciais,
          ...(resultado.dados || {}),
          proximosAgendamentos: Array.isArray(
            resultado.dados?.proximosAgendamentos
          )
            ? resultado.dados.proximosAgendamentos
            : [],
        });
      } catch (error) {
        if (error.name === "AbortError") return;

        console.error("Erro ao carregar dashboard:", error);
        setErro(error.message);
      } finally {
        if (!controller.signal.aborted) {
          setCarregando(false);
        }
      }
    }

    carregarDashboard();

    return () => controller.abort();
  }, [navigate]);

  function sair() {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    navigate("/login", { replace: true });
  }

  const estatisticas = [
    {
      titulo: "Agendamentos hoje",
      icone: "📅",
      valor: Number(dados.agendamentosHoje) || 0,
      descricao: "Agendamentos do dia",
    },
    {
      titulo: "Clientes cadastrados",
      icone: "👤",
      valor: Number(dados.totalClientes) || 0,
      descricao: "Clientes ativos",
    },
    {
      titulo: "Barbeiros",
      icone: "✂",
      valor: Number(dados.totalBarbeiros) || 0,
      descricao: "Profissionais ativos",
    },
    {
      titulo: "Faturamento do mês",
      icone: "R$",
      valor: formatarMoeda(dados.faturamentoMes),
      descricao: "Total de vendas no mês",
    },
  ];

  const resumo = [
    {
      titulo: "Agendamentos hoje",
      valor: dados.agendamentosHoje,
    },
    {
      titulo: "Agendamentos concluídos",
      valor: dados.agendamentosConcluidosHoje,
    },
    {
      titulo: "Agendamentos pendentes",
      valor: dados.agendamentosPendentesHoje,
    },
    {
      titulo: "Cancelamentos",
      valor: dados.agendamentosCanceladosHoje,
    },
  ];

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div className="admin-header-logo">
          <img src={logo} alt="Hope Barbearia" />
        </div>

        <div className="admin-header-title">
          <h1>Painel Administrativo</h1>
          <span>Gerencie sua barbearia com eficiência</span>
        </div>

        <div
          className="admin-header-user"
          onClick={() => navigate("/perfil")}
          style={{ cursor: "pointer" }}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              navigate("/perfil");
            }
          }}
        >
          <div className="admin-avatar">
            {nomeAdministrador.charAt(0).toUpperCase()}
          </div>

          <div className="admin-user-info">
            <strong>{nomeAdministrador}</strong>
            <span>Minha conta</span>
          </div>
        </div>
      </header>

      <div className="admin-layout">
        <aside className="admin-sidebar">
          <div className="sidebar-title">
            <span>ADMINISTRADOR</span>
          </div>

          <nav className="sidebar-menu">
            {menu.map((item) => (
              <button
                type="button"
                key={item.nome}
                className={
                  item.nome === "Dashboard"
                    ? "sidebar-item active"
                    : "sidebar-item"
                }
                onClick={() => item.rota && navigate(item.rota)}
                disabled={!item.rota}
                title={
                  !item.rota
                    ? "Esta tela ainda está em desenvolvimento"
                    : ""
                }
              >
                <span className="sidebar-icon">
                  {item.icone}
                </span>

                <span>{item.nome}</span>
              </button>
            ))}
          </nav>

          <div className="sidebar-footer">
            <button
              type="button"
              className="logout-button"
              onClick={sair}
            >
              <span>↪</span>
              Sair
            </button>
          </div>
        </aside>

        <main className="admin-content">
          <div className="admin-page-heading">
            <div>
              <span className="admin-label">
                DASHBOARD
              </span>

              <h2>Visão geral</h2>

              <p>
                Acompanhe e gerencie as informações da Hope Barbearia.
              </p>
            </div>
          </div>

          {erro && (
            <div
              role="alert"
              style={{
                padding: "14px",
                marginBottom: "20px",
                border: "1px solid currentColor",
                borderRadius: "8px",
              }}
            >
              Não foi possível carregar os dados: {erro}
            </div>
          )}

          <section className="admin-stats">
            {estatisticas.map((item) => (
              <div className="admin-stat-card" key={item.titulo}>
                <div className="stat-icon">
                  {item.icone}
                </div>

                <div className="stat-info">
                  <span>{item.titulo}</span>

                  <strong>
                    {carregando ? "..." : item.valor}
                  </strong>
                </div>

                <small>{item.descricao}</small>
              </div>
            ))}
          </section>

          <section className="admin-dashboard-grid">
            <div className="admin-card">
              <div className="admin-card-header">
                <div>
                  <span className="admin-card-label">
                    AGENDA
                  </span>

                  <h3>Próximos agendamentos</h3>
                </div>

                <button
                  type="button"
                  className="admin-link"
                  onClick={() =>
                    navigate("/gerenciamentoAgendamentos")
                  }
                >
                  Ver todos
                </button>
              </div>

              <div className="appointment-list">
                {carregando ? (
                  <p>Carregando agendamentos...</p>
                ) : dados.proximosAgendamentos.length === 0 ? (
                  <p>Nenhum próximo agendamento encontrado.</p>
                ) : (
                  dados.proximosAgendamentos.map((agendamento) => (
                    <div
                      className="appointment-item"
                      key={agendamento.id}
                    >
                      <div className="appointment-time">
                        <strong>
                          {agendamento.hora || "--:--"}
                        </strong>

                        <span>
                          {formatarDia(agendamento.data)}
                        </span>
                      </div>

                      <div className="appointment-client">
                        <strong>
                          {agendamento.cliente}
                        </strong>

                        <span>
                          {agendamento.servico}
                          {" • "}
                          {agendamento.barbeiro}
                        </span>
                      </div>

                      <span
                        className={`status ${classeStatus(
                          agendamento.status
                        )}`}
                      >
                        {agendamento.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

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
                {resumo.map((item) => (
                  <div
                    className="summary-item"
                    key={item.titulo}
                  >
                    <span>{item.titulo}</span>

                    <strong>
                      {carregando
                        ? "..."
                        : Number(item.valor) || 0}
                    </strong>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default DashboardAdministrador;
