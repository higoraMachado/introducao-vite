import { useEffect, useState } from 'react';
import './Dashboard.css';
import logoHope from '../../assets/logo-hope.png';

const historico = [
  {
    id: 1,
    data: '28/08/2026',
    servico: 'Corte Masculino',
    barbeiro: 'João Tangerina',
    valor: 35,
  },
  {
    id: 2,
    data: '14/08/2026',
    servico: 'Corte + Barba',
    barbeiro: 'Carlitos 014 Menor do Ódio',
    valor: 50,
  },
  {
    id: 3,
    data: '31/07/2026',
    servico: 'Degradê',
    barbeiro: 'João',
    valor: 40,
  },
];

const promocoes = [
  {
    id: 1,
    titulo: 'Corte + Barba',
    descricao: 'Aproveite o combo completo por um preço especial.',
    preco: 'R$ 45,00',
    anterior: 'R$ 50,00',
  },
  {
    id: 2,
    titulo: 'Indique um amigo',
    descricao: 'Indique um amigo e ganhe desconto no próximo corte.',
    preco: '10% OFF',
    anterior: '',
  },
];

function Dashboard() {
  const [agendamento, setAgendamento] = useState(null);

  useEffect(() => {
    const agendamentoSalvo = localStorage.getItem(
      'hope-barbearia-agendamento'
    );

    if (agendamentoSalvo) {
      try {
        setAgendamento(JSON.parse(agendamentoSalvo));
      } catch (error) {
        console.error('Erro ao carregar agendamento:', error);
      }
    }
  }, []);

  function formatarData(data) {
    if (!data) return '';

    const [ano, mes, dia] = data.split('-');

    return `${dia}/${mes}/${ano}`;
  }

  function irParaAgendamento() {
    window.location.href = '/agendamento';
  }

  return (
    <main className="dashboard-page">
      {/* HEADER */}
      <header className="dashboard-header">
        <div className="dashboard-logo">
          <img src={logoHope} alt="Hope Barbearia" />
        </div>

        <div className="dashboard-title">
          <h1>Dashboard</h1>
          <p>Bem-vindo à Hope Barbearia</p>
        </div>

        <div className="dashboard-user">
          <div className="user-avatar">B</div>

          <div className="user-info">
            <strong>Bruno</strong>
            <span>Minha conta</span>
          </div>
        </div>
      </header>

      {/* CONTEÚDO */}
      <section className="dashboard-content">

        {/* SAUDAÇÃO */}
        <div className="dashboard-heading">
          <div>
            <span className="heading-label">ÁREA DO CLIENTE</span>

            <h2>Olá, Bruno!</h2>

            <p>
              Confira seus próximos atendimentos e o histórico da sua conta.
            </p>
          </div>

          <button
            className="btn-agendar"
            onClick={irParaAgendamento}
          >
            + Agendar Horário
          </button>
        </div>

        {/* PRÓXIMO AGENDAMENTO */}
        <section className="dashboard-card next-card">
          <div className="card-header">
            <div>
              <span className="card-label">PRÓXIMO AGENDAMENTO</span>
              <h3>Seu próximo corte</h3>
            </div>

            <div className="card-icon">
              ✓
            </div>
          </div>

          {agendamento ? (
            <div className="next-content">

              <div className="appointment-date">
                <div className="date-icon">📅</div>

                <div>
                  <small>Data e horário</small>

                  <strong>
                    {formatarData(agendamento.data)}
                  </strong>

                  <span>
                    às {agendamento.horario}
                  </span>
                </div>
              </div>

              <div className="appointment-info">

                <div>
                  <small>Serviço</small>
                  <strong>{agendamento.servicoNome}</strong>
                </div>

                <div>
                  <small>Barbeiro</small>
                  <strong>{agendamento.barbeiroNome}</strong>
                </div>

                <div>
                  <small>Valor</small>
                  <strong>
                    R$ {agendamento.preco.toFixed(2)}
                  </strong>
                </div>

              </div>
            </div>
          ) : (
            <div className="no-appointment">
              <span>✂</span>

              <div>
                <strong>Nenhum agendamento encontrado</strong>

                <p>
                  Agende seu próximo corte e mantenha seu visual em dia.
                </p>
              </div>

              <button
                className="btn-small"
                onClick={irParaAgendamento}
              >
                Agendar agora
              </button>
            </div>
          )}
        </section>

        {/* GRID */}
        <div className="dashboard-grid">

          {/* HISTÓRICO */}
          <section className="dashboard-card history-card">

            <div className="section-header">
              <div>
                <span className="card-label">HISTÓRICO</span>
                <h3>Histórico de cortes</h3>
              </div>

              <button className="view-all">
                Ver todos
              </button>
            </div>

            <div className="history-list">

              {historico.map((corte) => (
                <div
                  className="history-item"
                  key={corte.id}
                >
                  <div className="history-icon">
                    ✂
                  </div>

                  <div className="history-main">
                    <strong>{corte.servico}</strong>

                    <span>
                      {corte.data} · {corte.barbeiro}
                    </span>
                  </div>

                  <strong className="history-price">
                    R$ {corte.valor.toFixed(2)}
                  </strong>
                </div>
              ))}

            </div>
          </section>

          {/* PROMOÇÕES */}
          <section className="dashboard-card promotions-card">

            <div className="section-header">
              <div>
                <span className="card-label">OFERTAS</span>
                <h3>Promoções</h3>
              </div>
            </div>

            <div className="promotion-list">

              {promocoes.map((promocao) => (
                <div
                  className="promotion-item"
                  key={promocao.id}
                >
                  <div className="promotion-content">
                    <span className="promotion-tag">
                      OFERTA
                    </span>

                    <h4>{promocao.titulo}</h4>

                    <p>{promocao.descricao}</p>
                  </div>

                  <div className="promotion-price">
                    <strong>{promocao.preco}</strong>

                    {promocao.anterior && (
                      <span>{promocao.anterior}</span>
                    )}
                  </div>
                </div>
              ))}

            </div>
          </section>

        </div>

        {/* ACESSO RÁPIDO */}
        <section className="quick-actions">

          <button onClick={irParaAgendamento}>
            <span>📅</span>

            <div>
              <strong>Agendar horário</strong>
              <small>Escolha seu próximo atendimento</small>
            </div>

            <b>›</b>
          </button>

          <button>
            <span>✂</span>

            <div>
              <strong>Meus cortes</strong>
              <small>Confira seu histórico</small>
            </div>

            <b>›</b>
          </button>

          <button>
            <span>🎁</span>

            <div>
              <strong>Promoções</strong>
              <small>Veja ofertas disponíveis</small>
            </div>

            <b>›</b>
          </button>

        </section>

      </section>
    </main>
  );
}

export default Dashboard;