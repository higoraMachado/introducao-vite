import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import logoHope from '../../assets/logo-hope.png';

const API_URL = 'http://localhost:3333';

/* =========================================================
   PROMOÇÕES
   Continua fixo por enquanto, pois ainda não temos
   uma integração específica de promoções.
========================================================= */

const promocoes = [
  {
    id: 1,
    titulo: 'Corte + Barba',
    descricao:
      'Aproveite o combo completo por um preço especial.',
    preco: 'R$ 45,00',
    anterior: 'R$ 50,00',
  },
  {
    id: 2,
    titulo: 'Indique um amigo',
    descricao:
      'Indique um amigo e ganhe desconto no próximo corte.',
    preco: '10% OFF',
    anterior: '',
  },
];

/* =========================================================
   COMPONENTE
========================================================= */

function Dashboard() {
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState(null);

  const [agendamento, setAgendamento] = useState(null);

  const [historico, setHistorico] = useState([]);

  const [carregando, setCarregando] = useState(true);

  const [erro, setErro] = useState('');

  /* =======================================================
     PEGAR TOKEN
  ======================================================= */

  function pegarToken() {
    return localStorage.getItem('token');
  }

  /* =======================================================
     PEGAR USUÁRIO SALVO
  ======================================================= */

  function pegarUsuarioSalvo() {
    try {
      const usuarioSalvo =
        localStorage.getItem('usuario');

      if (!usuarioSalvo) {
        return null;
      }

      return JSON.parse(usuarioSalvo);
    } catch (error) {
      console.error(
        'Erro ao ler usuário do localStorage:',
        error
      );

      return null;
    }
  }

  /* =======================================================
     REQUISIÇÃO API
  ======================================================= */

  async function requisicaoAPI(
    caminho,
    opcoes = {}
  ) {
    const token = pegarToken();

    if (!token) {
      navigate('/login', {
        replace: true,
      });

      throw new Error(
        'Usuário não autenticado.'
      );
    }

    const resposta = await fetch(
      `${API_URL}${caminho}`,
      {
        ...opcoes,

        headers: {
          'Content-Type':
            'application/json',

          Authorization:
            `Bearer ${token}`,

          ...(opcoes.headers || {}),
        },
      }
    );

    let dados = null;

    try {
      dados = await resposta.json();
    } catch {
      dados = null;
    }

    if (
      resposta.status === 401 ||
      resposta.status === 403
    ) {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');

      navigate('/login', {
        replace: true,
      });

      throw new Error(
        'Sua sessão expirou.'
      );
    }

    if (!resposta.ok) {
      throw new Error(
        dados?.mensagem ||
          dados?.message ||
          dados?.erro ||
          'Erro ao comunicar com a API.'
      );
    }

    return dados;
  }

  /* =======================================================
     FORMATAR DATA
  ======================================================= */

  function formatarData(data) {
    if (!data) {
      return '';
    }

    const texto = String(data);

    const somenteData =
      texto.includes('T')
        ? texto.split('T')[0]
        : texto.includes(' ')
          ? texto.split(' ')[0]
          : texto.substring(0, 10);

    const partes =
      somenteData.split('-');

    if (partes.length !== 3) {
      return somenteData;
    }

    const [ano, mes, dia] = partes;

    return `${dia}/${mes}/${ano}`;
  }

  /* =======================================================
     EXTRAIR HORÁRIO
  ======================================================= */

  function extrairHorario(dataHora) {
    if (!dataHora) {
      return '';
    }

    const texto = String(dataHora);

    if (texto.includes('T')) {
      return texto
        .split('T')[1]
        .substring(0, 5);
    }

    if (texto.includes(' ')) {
      return texto
        .split(' ')[1]
        .substring(0, 5);
    }

    return '';
  }

  /* =======================================================
     FORMATAR VALOR
  ======================================================= */

  function formatarValor(valor) {
    const numero = Number(valor) || 0;

    return numero.toLocaleString(
      'pt-BR',
      {
        style: 'currency',
        currency: 'BRL',
      }
    );
  }

  /* =======================================================
     PEGAR DATA DO AGENDAMENTO
  ======================================================= */

  function pegarDataAgendamento(item) {
    return (
      item.agendamento_dt_hr_inicio ||
      item.data ||
      ''
    );
  }

  /* =======================================================
     PEGAR ID DO CLIENTE
  ======================================================= */

  function pegarUsuarioId(usuarioAtual) {
    return Number(
      usuarioAtual?.usuario_id ||
        usuarioAtual?.id ||
        0
    );
  }

  /* =======================================================
     PEGAR NOME DO SERVIÇO
  ======================================================= */

  function pegarNomeServico(item) {
    return (
      item.servico_nome ||
      item.nome_servico ||
      item.servico ||
      'Serviço'
    );
  }

  /* =======================================================
     PEGAR NOME DO BARBEIRO
  ======================================================= */

  function pegarNomeBarbeiro(item) {
    return (
      item.barbeiro_nome ||
      item.usuario_nome_barbeiro ||
      item.nome_barbeiro ||
      item.barbeiro ||
      'Barbeiro'
    );
  }

  /* =======================================================
     PEGAR VALOR
  ======================================================= */

  function pegarValor(item) {
    return Number(
      item.servico_preco ||
        item.valor ||
        item.preco ||
        0
    );
  }

  /* =======================================================
     IDENTIFICAR AGENDAMENTO DO CLIENTE
  ======================================================= */

  function pertenceAoCliente(
    item,
    usuarioId
  ) {
    const idCliente =
      Number(
        item.usuario_id ||
          item.cliente_id ||
          item.usuario_cliente_id ||
          0
      );

    return idCliente === usuarioId;
  }

  /* =======================================================
     IDENTIFICAR CANCELADO
  ======================================================= */

  function estaCancelado(item) {
    const status = String(
      item.agendamento_status ||
        item.status ||
        ''
    ).toLowerCase();

    return status === 'cancelado';
  }

  /* =======================================================
     IDENTIFICAR CONCLUÍDO
  ======================================================= */

  function estaConcluido(item) {
    const status = String(
      item.agendamento_status ||
        item.status ||
        ''
    ).toLowerCase();

    if (
      status === 'concluido' ||
      status === 'concluído' ||
      status === 'finalizado'
    ) {
      return true;
    }

    const data =
      pegarDataAgendamento(item);

    if (!data) {
      return false;
    }

    const dataAgendamento =
      new Date(data);

    if (
      Number.isNaN(
        dataAgendamento.getTime()
      )
    ) {
      return false;
    }

    return (
      dataAgendamento < new Date()
    );
  }

  /* =======================================================
     FORMATAR ITEM PARA A TELA
  ======================================================= */

  function formatarAgendamento(item) {
    const dataHora =
      pegarDataAgendamento(item);

    return {
      id:
        item.agendamento_id ||
        item.id,

      data:
        formatarData(dataHora),

      dataOriginal:
        dataHora,

      horario:
        extrairHorario(dataHora),

      servico:
        pegarNomeServico(item),

      barbeiro:
        pegarNomeBarbeiro(item),

      valor:
        pegarValor(item),

      status:
        item.agendamento_status ||
        item.status ||
        'Agendado',

      original:
        item,
    };
  }

  /* =======================================================
     CARREGAR PERFIL
  ======================================================= */

  async function carregarPerfil() {
    const usuarioLocal =
      pegarUsuarioSalvo();

    if (usuarioLocal) {
      setUsuario(usuarioLocal);
    }

    try {
      const resposta =
        await requisicaoAPI(
          '/usuarios/perfil'
        );

      if (resposta?.dados) {
        const usuarioAPI =
          resposta.dados;

        setUsuario(usuarioAPI);

        localStorage.setItem(
          'usuario',
          JSON.stringify({
            ...(usuarioLocal || {}),
            ...usuarioAPI,
          })
        );

        return usuarioAPI;
      }
    } catch (error) {
      console.error(
        'Erro ao carregar perfil:',
        error
      );

      /*
       * Se já temos os dados salvos pelo login,
       * o dashboard ainda pode mostrar o nome.
       */
      if (usuarioLocal) {
        return usuarioLocal;
      }

      throw error;
    }

    return usuarioLocal;
  }

  /* =======================================================
     CARREGAR AGENDAMENTOS
  ======================================================= */

  async function carregarAgendamentos(
    usuarioAtual
  ) {
    const usuarioId =
      pegarUsuarioId(usuarioAtual);

    if (!usuarioId) {
      setAgendamento(null);
      setHistorico([]);
      return;
    }

    const resposta =
      await requisicaoAPI(
        '/agendamentos'
      );

    const lista =
      Array.isArray(resposta?.dados)
        ? resposta.dados
        : [];

    /*
     * A rota pode retornar os agendamentos
     * gerais. Por isso filtramos pelo cliente
     * que está logado.
     */
    const meusAgendamentos =
      lista.filter((item) =>
        pertenceAoCliente(
          item,
          usuarioId
        )
      );

    /* =====================================================
       PRÓXIMO AGENDAMENTO
    ===================================================== */

    const agora = new Date();

    const futuros =
      meusAgendamentos
        .filter(
          (item) =>
            !estaCancelado(item)
        )
        .filter((item) => {
          const data =
            new Date(
              pegarDataAgendamento(
                item
              )
            );

          if (
            Number.isNaN(
              data.getTime()
            )
          ) {
            return false;
          }

          return data >= agora;
        })
        .sort((a, b) => {
          return (
            new Date(
              pegarDataAgendamento(a)
            ) -
            new Date(
              pegarDataAgendamento(b)
            )
          );
        });

    if (futuros.length > 0) {
      setAgendamento(
        formatarAgendamento(
          futuros[0]
        )
      );
    } else {
      setAgendamento(null);
    }

    /* =====================================================
       HISTÓRICO
    ===================================================== */

    const anteriores =
      meusAgendamentos
        .filter(
          (item) =>
            !estaCancelado(item)
        )
        .filter((item) =>
          estaConcluido(item)
        )
        .sort((a, b) => {
          return (
            new Date(
              pegarDataAgendamento(b)
            ) -
            new Date(
              pegarDataAgendamento(a)
            )
          );
        })
        .map(
          formatarAgendamento
        );

    setHistorico(anteriores);
  }

  /* =======================================================
     CARREGAR DASHBOARD
  ======================================================= */

  async function carregarDashboard() {
    try {
      setCarregando(true);
      setErro('');

      const token =
        pegarToken();

      if (!token) {
        navigate('/login', {
          replace: true,
        });

        return;
      }

      const usuarioAtual =
        await carregarPerfil();

      if (!usuarioAtual) {
        throw new Error(
          'Não foi possível identificar o usuário.'
        );
      }

      await carregarAgendamentos(
        usuarioAtual
      );
    } catch (error) {
      console.error(
        'Erro ao carregar dashboard:',
        error
      );

      setErro(
        error?.message ||
          'Erro ao carregar o dashboard.'
      );
    } finally {
      setCarregando(false);
    }
  }

  /* =======================================================
     INICIALIZAÇÃO
  ======================================================= */

  useEffect(() => {
    carregarDashboard();
  }, []);

  /* =======================================================
     IR PARA AGENDAMENTO
  ======================================================= */

  function irParaAgendamento() {
    navigate('/agendamento');
  }

  /* =======================================================
     IR PARA PERFIL
  ======================================================= */

  function irParaPerfil() {
    navigate('/perfil');
  }

  /* =======================================================
     NOME DO USUÁRIO
  ======================================================= */

  const nomeUsuario =
    usuario?.usuario_nome ||
    usuario?.nome ||
    'Cliente';

  /* =======================================================
     TELA
  ======================================================= */

  return (
    <main className="dashboard-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="dashboard-header">

        <div className="dashboard-logo">
          <img
            src={logoHope}
            alt="Hope Barbearia"
          />
        </div>

        <div className="dashboard-title">

          <h1>
            Área do Cliente
          </h1>

          <p>
            Bem-vindo à Hope Barbearia
          </p>

        </div>

        <button
          className="dashboard-user"
          onClick={irParaPerfil}
        >

          <div className="user-avatar">

            {nomeUsuario
              .charAt(0)
              .toUpperCase()}

          </div>

          <div className="user-info">

            <strong>
              {nomeUsuario}
            </strong>

            <span>
              Ver meu perfil
            </span>

          </div>

        </button>

      </header>

      {/* =================================================
          CONTEÚDO
      ================================================= */}

      <section className="dashboard-content">

        {/* ===============================================
            SAUDAÇÃO
        =============================================== */}

        <div className="dashboard-heading">

          <div>

            <span className="heading-label">
              ÁREA DO CLIENTE
            </span>

            <h2>
              Olá, {nomeUsuario}!
            </h2>

            <p>
              Confira seus próximos
              atendimentos e o histórico
              da sua conta.
            </p>

          </div>

          <button
            className="btn-agendar"
            onClick={
              irParaAgendamento
            }
          >
            + Agendar Horário
          </button>

        </div>

        {/* ===============================================
            ERRO
        =============================================== */}

        {erro && (

          <section className="dashboard-card">

            <div className="no-appointment">

              <span>
                ⚠
              </span>

              <div>

                <strong>
                  Não foi possível carregar
                  todos os dados
                </strong>

                <p>
                  {erro}
                </p>

              </div>

              <button
                className="btn-small"
                onClick={
                  carregarDashboard
                }
              >
                Tentar novamente
              </button>

            </div>

          </section>

        )}

        {/* ===============================================
            PRÓXIMO AGENDAMENTO
        =============================================== */}

        <section className="dashboard-card next-card">

          <div className="card-header">

            <div>

              <span className="card-label">
                PRÓXIMO AGENDAMENTO
              </span>

              <h3>
                Seu próximo corte
              </h3>

            </div>

            <div className="card-icon">
              ✓
            </div>

          </div>

          {carregando ? (

            <div className="no-appointment">

              <span>
                ⏳
              </span>

              <div>

                <strong>
                  Carregando...
                </strong>

                <p>
                  Buscando seus
                  agendamentos.
                </p>

              </div>

            </div>

          ) : agendamento ? (

            <div className="next-content">

              <div className="appointment-date">

                <div className="date-icon">
                  📅
                </div>

                <div>

                  <small>
                    Data e horário
                  </small>

                  <strong>
                    {agendamento.data}
                  </strong>

                  <span>
                    às{' '}
                    {agendamento.horario}
                  </span>

                </div>

              </div>

              <div className="appointment-info">

                <div>

                  <small>
                    Serviço
                  </small>

                  <strong>
                    {agendamento.servico}
                  </strong>

                </div>

                <div>

                  <small>
                    Barbeiro
                  </small>

                  <strong>
                    {agendamento.barbeiro}
                  </strong>

                </div>

                <div>

                  <small>
                    Valor
                  </small>

                  <strong>
                    {formatarValor(
                      agendamento.valor
                    )}
                  </strong>

                </div>

              </div>

            </div>

          ) : (

            <div className="no-appointment">

              <span>
                ✂
              </span>

              <div>

                <strong>
                  Nenhum agendamento encontrado
                </strong>

                <p>
                  Agende seu próximo
                  corte e mantenha seu
                  visual em dia.
                </p>

              </div>

              <button
                className="btn-small"
                onClick={
                  irParaAgendamento
                }
              >
                Agendar agora
              </button>

            </div>

          )}

        </section>

        {/* ===============================================
            GRID
        =============================================== */}

        <div className="dashboard-grid">

          {/* =============================================
              HISTÓRICO
          ============================================= */}

          <section className="dashboard-card history-card">

            <div className="section-header">

              <div>

                <span className="card-label">
                  HISTÓRICO
                </span>

                <h3>
                  Histórico de cortes
                </h3>

              </div>

              <button
                className="view-all"
                type="button"
              >
                {historico.length}{' '}
                {historico.length === 1
                  ? 'corte'
                  : 'cortes'}
              </button>

            </div>

            <div className="history-list">

              {carregando ? (

                <div className="no-appointment">

                  <span>
                    ⏳
                  </span>

                  <div>

                    <strong>
                      Carregando histórico...
                    </strong>

                  </div>

                </div>

              ) : historico.length ===
                0 ? (

                <div className="no-appointment">

                  <span>
                    ✂
                  </span>

                  <div>

                    <strong>
                      Nenhum corte no histórico
                    </strong>

                    <p>
                      Seus atendimentos
                      realizados aparecerão
                      aqui.
                    </p>

                  </div>

                </div>

              ) : (

                historico
                  .slice(0, 5)
                  .map((corte) => (

                    <div
                      className="history-item"
                      key={corte.id}
                    >

                      <div className="history-icon">
                        ✂
                      </div>

                      <div className="history-main">

                        <strong>
                          {corte.servico}
                        </strong>

                        <span>
                          {corte.data}
                          {' · '}
                          {corte.barbeiro}
                        </span>

                      </div>

                      <strong className="history-price">

                        {formatarValor(
                          corte.valor
                        )}

                      </strong>

                    </div>

                  ))

              )}

            </div>

          </section>

          {/* =============================================
              PROMOÇÕES
          ============================================= */}

          <section className="dashboard-card promotions-card">

            <div className="section-header">

              <div>

                <span className="card-label">
                  OFERTAS
                </span>

                <h3>
                  Promoções
                </h3>

              </div>

            </div>

            <div className="promotion-list">

              {promocoes.map(
                (promocao) => (

                  <div
                    className="promotion-item"
                    key={promocao.id}
                  >

                    <div className="promotion-content">

                      <span className="promotion-tag">
                        OFERTA
                      </span>

                      <h4>
                        {promocao.titulo}
                      </h4>

                      <p>
                        {promocao.descricao}
                      </p>

                    </div>

                    <div className="promotion-price">

                      <strong>
                        {promocao.preco}
                      </strong>

                      {promocao.anterior && (

                        <span>
                          {promocao.anterior}
                        </span>

                      )}

                    </div>

                  </div>

                )
              )}

            </div>

          </section>

        </div>

        {/* ===============================================
            ACESSO RÁPIDO
        =============================================== */}

        <section className="quick-actions">

          <button
            onClick={
              irParaAgendamento
            }
          >

            <span>
              📅
            </span>

            <div>

              <strong>
                Agendar horário
              </strong>

              <small>
                Escolha seu próximo
                atendimento
              </small>

            </div>

            <b>
              ›
            </b>

          </button>

          <button
            type="button"
            onClick={() => {
              const elemento =
                document.querySelector(
                  '.history-card'
                );

              elemento?.scrollIntoView({
                behavior: 'smooth',
              });
            }}
          >

            <span>
              ✂
            </span>

            <div>

              <strong>
                Meus cortes
              </strong>

              <small>
                Confira seu histórico
              </small>

            </div>

            <b>
              ›
            </b>

          </button>

          <button
            type="button"
            onClick={() => {
              const elemento =
                document.querySelector(
                  '.promotions-card'
                );

              elemento?.scrollIntoView({
                behavior: 'smooth',
              });
            }}
          >

            <span>
              🎁
            </span>

            <div>

              <strong>
                Promoções
              </strong>

              <small>
                Veja ofertas disponíveis
              </small>

            </div>

            <b>
              ›
            </b>

          </button>

        </section>

      </section>

    </main>
  );
}

export default Dashboard;