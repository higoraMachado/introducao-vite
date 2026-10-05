import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './dashboardBarbeiro.css';
import logoHope from '../../assets/logo-hope.png';

const API_URL = 'http://localhost:3333';

function hojeISO() {
  const data = new Date();
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

function criarData(data, hora = '00:00') {
  if (!data) return null;

  const valor = String(data).trim();

  if (valor.includes('T')) {
    const dataObj = new Date(valor);
    return Number.isNaN(dataObj.getTime()) ? null : dataObj;
  }

  if (valor.includes(' ')) {
    const dataObj = new Date(valor.replace(' ', 'T'));
    return Number.isNaN(dataObj.getTime()) ? null : dataObj;
  }

  const dataObj = new Date(`${valor}T${hora}`);
  return Number.isNaN(dataObj.getTime()) ? null : dataObj;
}

function formatarHora(data) {
  const dataObj = criarData(data);

  if (!dataObj) return '--:--';

  return dataObj.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatarData(data) {
  const dataObj = criarData(data);

  if (!dataObj) return '';

  return dataObj.toLocaleDateString('pt-BR');
}

function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function normalizarStatus(status) {
  return String(status || '')
    .trim()
    .toUpperCase();
}

function minutosDuracao(duracao) {
  if (duracao === undefined || duracao === null) {
    return 30;
  }

  const valor = String(duracao);

  if (valor.includes(':')) {
    const partes = valor.split(':').map(Number);
    const horas = Number(partes[0] || 0);
    const minutos = Number(partes[1] || 0);
    const segundos = Number(partes[2] || 0);

    return horas * 60 + minutos + (segundos > 0 ? 1 : 0);
  }

  const numero = Number(duracao);
  return Number.isFinite(numero) && numero > 0 ? numero : 30;
}

function adicionarMinutos(hora, minutos) {
  const [horas, mins] = String(hora)
    .split(':')
    .map(Number);

  const total = horas * 60 + mins + minutos;
  const horaFinal = Math.floor(total / 60) % 24;
  const minutoFinal = total % 60;

  return `${String(horaFinal).padStart(2, '0')}:${String(
    minutoFinal
  ).padStart(2, '0')}:00`;
}

function DashboardBarbeiro() {
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState(null);
  const [agendamentos, setAgendamentos] = useState([]);
  const [pagamentos, setPagamentos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [servicosBarbeiro, setServicosBarbeiro] = useState([]);

  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [modalAgendamento, setModalAgendamento] = useState(false);

  const [formulario, setFormulario] = useState({
    clienteId: '',
    barbeiroServicoId: '',
    data: hojeISO(),
    hora: '09:00',
    observacoes: '',
  });

  async function requisicaoAPI(endpoint, options = {}) {
    const token = localStorage.getItem('token');

    if (!token) {
      navigate('/login');
      throw new Error('Sessão expirada. Faça login novamente.');
    }

    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    };

    const resposta = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    let dados = {};

    try {
      dados = await resposta.json();
    } catch {
      dados = {};
    }

    if (!resposta.ok) {
      throw new Error(
        dados?.message ||
          dados?.mensagem ||
          dados?.erro ||
          'Erro na comunicação com a API.'
      );
    }

    return dados;
  }

  async function carregarDashboard(mostrarCarregamento = false) {
    try {
      if (mostrarCarregamento) {
        setAtualizando(true);
      }

      const [perfilResposta, agendamentosResposta, pagamentosResposta, clientesResposta, servicosResposta] =
        await Promise.all([
          requisicaoAPI('/usuarios/perfil'),
          requisicaoAPI('/agendamentos'),
          requisicaoAPI('/pagamentos'),
          requisicaoAPI('/clientes'),
          requisicaoAPI('/barbeiros_servicos'),
        ]);

      const perfil = perfilResposta?.dados || null;
      const listaAgendamentos = Array.isArray(
        agendamentosResposta?.dados
      )
        ? agendamentosResposta.dados
        : [];
      const listaPagamentos = Array.isArray(
        pagamentosResposta?.dados
      )
        ? pagamentosResposta.dados
        : [];
      const listaClientes = Array.isArray(
        clientesResposta?.dados
      )
        ? clientesResposta.dados
        : [];
      const listaServicos = Array.isArray(
        servicosResposta?.dados
      )
        ? servicosResposta.dados
        : [];

      setUsuario(perfil);

      const barbeiroId = Number(perfil?.usuario_id);

      const agendamentosDoBarbeiro = listaAgendamentos.filter(
        (item) => Number(item?.barbeiro_id) === barbeiroId
      );

      const servicosDoBarbeiro = listaServicos.filter(
        (item) => Number(item?.usuario_id) === barbeiroId
      );

      setAgendamentos(agendamentosDoBarbeiro);
      setPagamentos(listaPagamentos);
      setClientes(
        listaClientes.filter(
          (item) => Number(item?.usuario_ativo) === 1
        )
      );
      setServicosBarbeiro(servicosDoBarbeiro);

    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);

      alert(
        error?.message ||
          'Erro ao carregar os dados do dashboard.'
      );
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  }

  useEffect(() => {
    carregarDashboard();
  }, []);

  const hoje = hojeISO();

  const agendamentosOrdenados = useMemo(() => {
    return [...agendamentos].sort((a, b) => {
      const dataA = criarData(a?.agendamento_dt_hr_inicio)?.getTime() || 0;
      const dataB = criarData(b?.agendamento_dt_hr_inicio)?.getTime() || 0;
      return dataA - dataB;
    });
  }, [agendamentos]);

  const agendamentosHoje = useMemo(() => {
    return agendamentosOrdenados.filter((item) => {
      const data = criarData(item?.agendamento_dt_hr_inicio);
      if (!data) return false;

      const ano = data.getFullYear();
      const mes = String(data.getMonth() + 1).padStart(2, '0');
      const dia = String(data.getDate()).padStart(2, '0');

      return `${ano}-${mes}-${dia}` === hoje;
    });
  }, [agendamentosOrdenados, hoje]);

  const proximosAgendamentos = useMemo(() => {
    const agora = new Date();

    return agendamentosOrdenados
      .filter((item) => {
        const status = normalizarStatus(item?.agendamento_status);
        const data = criarData(item?.agendamento_dt_hr_inicio);

        return (
          data &&
          data >= agora &&
          status !== 'CANCELADO' &&
          status !== 'CONCLUIDO'
        );
      })
      .slice(0, 5);
  }, [agendamentosOrdenados]);

  const atendimentosConcluidosHoje = useMemo(() => {
    return agendamentosHoje.filter(
      (item) =>
        normalizarStatus(item?.agendamento_status) ===
        'CONCLUIDO'
    ).length;
  }, [agendamentosHoje]);

  const pendentesHoje = useMemo(() => {
    return agendamentosHoje.filter((item) => {
      const status = normalizarStatus(item?.agendamento_status);

      return (
        status !== 'CONCLUIDO' &&
        status !== 'CANCELADO'
      );
    }).length;
  }, [agendamentosHoje]);

  const faturamentoHoje = useMemo(() => {
    const idsHoje = new Set(
      agendamentosHoje.map((item) =>
        Number(item?.agendamento_id)
      )
    );

    return pagamentos.reduce((total, pagamento) => {
      if (!idsHoje.has(Number(pagamento?.agendamento_id))) {
        return total;
      }

      return (
        total +
        Number(
          pagamento?.pagamento_vl_pago ??
            pagamento?.pagamento_valor ??
            0
        )
      );
    }, 0);
  }, [agendamentosHoje, pagamentos]);

  const faturamentoTotal = useMemo(() => {
    const idsBarbeiro = new Set(
      agendamentos.map((item) =>
        Number(item?.agendamento_id)
      )
    );

    return pagamentos.reduce((total, pagamento) => {
      if (
        !idsBarbeiro.has(
          Number(pagamento?.agendamento_id)
        )
      ) {
        return total;
      }

      return (
        total +
        Number(
          pagamento?.pagamento_vl_pago ??
            pagamento?.pagamento_valor ??
            0
        )
      );
    }, 0);
  }, [agendamentos, pagamentos]);

  function abrirModalAgendamento() {
    setFormulario({
      clienteId: '',
      barbeiroServicoId:
        servicosBarbeiro[0]?.barbeiro_servico_id
          ? String(servicosBarbeiro[0].barbeiro_servico_id)
          : '',
      data: hojeISO(),
      hora: '09:00',
      observacoes: '',
    });

    setModalAgendamento(true);
  }

  function fecharModalAgendamento() {
    setModalAgendamento(false);
  }

  function alterarFormulario(event) {
    const { name, value } = event.target;

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  }

  async function salvarAgendamento(event) {
    event.preventDefault();

    if (!formulario.clienteId) {
      alert('Selecione o cliente.');
      return;
    }

    if (!formulario.barbeiroServicoId) {
      alert('O barbeiro ainda não possui serviços associados.');
      return;
    }

    if (!formulario.data || !formulario.hora) {
      alert('Informe a data e o horário.');
      return;
    }

    const servico = servicosBarbeiro.find(
      (item) =>
        Number(item?.barbeiro_servico_id) ===
        Number(formulario.barbeiroServicoId)
    );

    if (!servico) {
      alert('Serviço selecionado não encontrado.');
      return;
    }

    try {
      const fim = adicionarMinutos(
        formulario.hora,
        minutosDuracao(servico.servico_duracao)
      );

      await requisicaoAPI('/agendamentos', {
        method: 'POST',
        body: JSON.stringify({
          agendamento_dt_hr_inicio: `${formulario.data} ${formulario.hora}:00`,
          agendamento_dt_hr_fim: `${formulario.data} ${fim}`,
          agendamento_status: 'agendado',
          agendamento_observacoes:
            formulario.observacoes || null,
          agendamento_forma_pagamento: null,
          barbeiro_servico_id:
            Number(formulario.barbeiroServicoId),
          usuario_id: Number(formulario.clienteId),
        }),
      });

      alert('Agendamento cadastrado com sucesso!');
      fecharModalAgendamento();
      await carregarDashboard(true);
    } catch (error) {
      console.error('Erro ao cadastrar agendamento:', error);
      alert(
        error?.message ||
          'Erro ao cadastrar agendamento.'
      );
    }
  }

  async function removerAgendamento(agendamento) {
    const confirmou = window.confirm(
      `Deseja remover o agendamento de ${
        agendamento?.usuario_nome || 'este cliente'
      } às ${formatarHora(
        agendamento?.agendamento_dt_hr_inicio
      )}?`
    );

    if (!confirmou) return;

    try {
      await requisicaoAPI(
        `/agendamentos/${agendamento.agendamento_id}`,
        { method: 'DELETE' }
      );

      alert('Agendamento removido com sucesso.');
      await carregarDashboard(true);
    } catch (error) {
      console.error('Erro ao remover agendamento:', error);
      alert(
        error?.message ||
          'Erro ao remover agendamento.'
      );
    }
  }

  function irParaPerfil() {
    navigate('/perfil');
  }

  function irParaAgenda() {
    const elemento = document.getElementById(
      'agenda-barbeiro'
    );

    if (elemento) {
      elemento.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }

  const fotoUsuario =
    localStorage.getItem('hope-foto-usuario');

  if (carregando) {
    return (
      <main className="barbeiro-dashboard-page">
        <div className="dashboard-loading">
          <div className="loading-card">
            <span>HOPE BARBEARIA</span>
            <strong>Carregando painel...</strong>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="barbeiro-dashboard-page">
      <header className="barbeiro-dashboard-header">
        <div className="barbeiro-dashboard-logo">
          <img
            src={logoHope}
            alt="Hope Barbearia"
          />
        </div>

        <div className="barbeiro-dashboard-title">
          <h1>Painel</h1>
          <p>Painel do barbeiro</p>
        </div>

        <button
          type="button"
          className="barbeiro-dashboard-user"
          onClick={irParaPerfil}
          title="Abrir meu perfil"
        >
          <div className="user-avatar">
            {fotoUsuario ? (
              <img
                src={fotoUsuario}
                alt={usuario?.usuario_nome || 'Usuário'}
              />
            ) : (
              String(
                usuario?.usuario_nome || 'B'
              )
                .charAt(0)
                .toUpperCase()
            )}
          </div>

          <div className="user-info">
            <strong>
              {usuario?.usuario_nome || 'Barbeiro'}
            </strong>
            <span>Minha conta</span>
          </div>
        </button>
      </header>

      <section className="barbeiro-dashboard-content">
        <div className="dashboard-heading">
          <div>
            <span className="heading-label">
              ÁREA DO BARBEIRO
            </span>

            <h2>
              Olá, {usuario?.usuario_nome || 'Barbeiro'}
            </h2>

            <p>
              Acompanhe seus agendamentos e as movimentações da barbearia.
            </p>
          </div>

          <div className="dashboard-heading-actions">
            <button
              type="button"
              className="btn-atualizar"
              onClick={() => carregarDashboard(true)}
              disabled={atualizando}
            >
              {atualizando ? 'Atualizando...' : 'Atualizar'}
            </button>

            <button
              type="button"
              className="btn-ver-agenda"
              onClick={irParaAgenda}
            >
              Ver agenda
            </button>

            <button
              type="button"
              className="btn-novo-agendamento"
              onClick={abrirModalAgendamento}
            >
              + Novo agendamento
            </button>
          </div>
        </div>

        <section className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-icon">▣</div>
            <div className="stat-info">
              <span>Agendamentos hoje</span>
              <strong>{agendamentosHoje.length}</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">✓</div>
            <div className="stat-info">
              <span>Atendimentos concluídos</span>
              <strong>{atendimentosConcluidosHoje}</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">◷</div>
            <div className="stat-info">
              <span>Pendentes</span>
              <strong>{pendentesHoje}</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">R$</div>
            <div className="stat-info">
              <span>Faturamento hoje</span>
              <strong>{formatarMoeda(faturamentoHoje)}</strong>
            </div>
          </div>
        </section>

        <section className="dashboard-grid">
          <section
            id="agenda-barbeiro"
            className="dashboard-card agenda-card"
          >
            <div className="card-header">
              <div>
                <span className="card-label">AGENDA</span>
                <h3>Agendamentos de hoje</h3>
              </div>

              <button
                type="button"
                className="card-link"
                onClick={irParaAgenda}
              >
                Ver todos
              </button>
            </div>

            <div className="agenda-list">
              {agendamentosHoje.length > 0 ? (
                agendamentosHoje.map((agendamento) => {
                  const status = normalizarStatus(
                    agendamento.agendamento_status
                  );

                  return (
                    <div
                      className="agenda-item"
                      key={agendamento.agendamento_id}
                    >
                      <div className="agenda-hora">
                        <strong>
                          {formatarHora(
                            agendamento.agendamento_dt_hr_inicio
                          )}
                        </strong>
                        <span>
                          {formatarData(
                            agendamento.agendamento_dt_hr_inicio
                          )}
                        </span>
                      </div>

                      <div className="agenda-cliente">
                        <strong>
                          {agendamento.usuario_nome ||
                            'Cliente'}
                        </strong>
                        <span>
                          {agendamento.servico_nome ||
                            'Serviço'}
                        </span>
                      </div>

                      <span
                        className={`agenda-status status-${status.toLowerCase()}`}
                      >
                        {status === 'CONCLUIDO'
                          ? 'Concluído'
                          : status === 'CANCELADO'
                            ? 'Cancelado'
                            : status === 'CONFIRMADO'
                              ? 'Confirmado'
                              : 'Agendado'}
                      </span>

                      {status !== 'CONCLUIDO' &&
                        status !== 'CANCELADO' && (
                          <button
                            type="button"
                            className="btn-remover-agendamento"
                            onClick={() =>
                              removerAgendamento(
                                agendamento
                              )
                            }
                          >
                            Remover
                          </button>
                        )}
                    </div>
                  );
                })
              ) : (
                <div className="empty-agenda">
                  <div className="empty-icon">▣</div>
                  <strong>
                    Nenhum agendamento hoje
                  </strong>
                  <p>
                    Sua agenda está livre por enquanto.
                  </p>

                  <button
                    type="button"
                    className="btn-small-dark"
                    onClick={abrirModalAgendamento}
                  >
                    + Adicionar agendamento
                  </button>
                </div>
              )}
            </div>
          </section>

          <section className="dashboard-card resumo-card">
            <div className="card-header">
              <div>
                <span className="card-label">RESUMO</span>
                <h3>Meu desempenho</h3>
              </div>
            </div>

            <div className="resumo-list">
              <div className="resumo-item">
                <span>Agendamentos hoje</span>
                <strong>{agendamentosHoje.length}</strong>
              </div>

              <div className="resumo-item">
                <span>Próximos agendamentos</span>
                <strong>{proximosAgendamentos.length}</strong>
              </div>

              <div className="resumo-item">
                <span>Atendimentos concluídos</span>
                <strong>{atendimentosConcluidosHoje}</strong>
              </div>

              <div className="resumo-item">
                <span>Faturamento hoje</span>
                <strong>
                  {formatarMoeda(faturamentoHoje)}
                </strong>
              </div>

              <div className="resumo-item">
                <span>Faturamento total</span>
                <strong>
                  {formatarMoeda(faturamentoTotal)}
                </strong>
              </div>
            </div>
          </section>
        </section>

        <section className="dashboard-card proximos-card">
          <div className="card-header">
            <div>
              <span className="card-label">PRÓXIMOS</span>
              <h3>Próximos agendamentos</h3>
            </div>

            <button
              type="button"
              className="card-link"
              onClick={irParaAgenda}
            >
              Agenda
            </button>
          </div>

          <div className="proximos-list">
            {proximosAgendamentos.length > 0 ? (
              proximosAgendamentos.map((agendamento) => (
                <div
                  className="proximo-item"
                  key={agendamento.agendamento_id}
                >
                  <div className="proximo-data">
                    <strong>
                      {formatarHora(
                        agendamento.agendamento_dt_hr_inicio
                      )}
                    </strong>
                    <span>
                      {formatarData(
                        agendamento.agendamento_dt_hr_inicio
                      )}
                    </span>
                  </div>

                  <div className="proximo-info">
                    <strong>
                      {agendamento.usuario_nome ||
                        'Cliente'}
                    </strong>
                    <span>
                      {agendamento.servico_nome ||
                        'Serviço'}
                    </span>
                  </div>

                  <strong className="proximo-valor">
                    {formatarMoeda(
                      agendamento.servico_preco
                    )}
                  </strong>
                </div>
              ))
            ) : (
              <div className="empty-proximos">
                Nenhum próximo agendamento encontrado.
              </div>
            )}
          </div>
        </section>
      </section>

      {modalAgendamento && (
        <div
          className="modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              fecharModalAgendamento();
            }
          }}
        >
          <div className="modal-agendamento">
            <div className="modal-header">
              <div>
                <span className="card-label">
                  AGENDA
                </span>
                <h3>Novo agendamento</h3>
              </div>

              <button
                type="button"
                className="modal-fechar"
                onClick={fecharModalAgendamento}
              >
                ×
              </button>
            </div>

            <form
              className="agendamento-form"
              onSubmit={salvarAgendamento}
            >
              <div className="form-group">
                <label>Cliente *</label>
                <select
                  name="clienteId"
                  value={formulario.clienteId}
                  onChange={alterarFormulario}
                  required
                >
                  <option value="">
                    Selecione o cliente
                  </option>

                  {clientes.map((cliente) => (
                    <option
                      key={cliente.usuario_id}
                      value={cliente.usuario_id}
                    >
                      {cliente.usuario_nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Serviço *</label>
                <select
                  name="barbeiroServicoId"
                  value={formulario.barbeiroServicoId}
                  onChange={alterarFormulario}
                  required
                >
                  <option value="">
                    Selecione o serviço
                  </option>

                  {servicosBarbeiro.map((servico) => (
                    <option
                      key={servico.barbeiro_servico_id}
                      value={servico.barbeiro_servico_id}
                    >
                      {servico.servico_nome} —{' '}
                      {formatarMoeda(
                        servico.servico_preco
                      )}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Data *</label>
                  <input
                    type="date"
                    name="data"
                    value={formulario.data}
                    onChange={alterarFormulario}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Horário *</label>
                  <input
                    type="time"
                    name="hora"
                    value={formulario.hora}
                    onChange={alterarFormulario}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Observações</label>
                <textarea
                  name="observacoes"
                  value={formulario.observacoes}
                  onChange={alterarFormulario}
                  placeholder="Observações do atendimento"
                  rows="4"
                />
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-cancelar"
                  onClick={fecharModalAgendamento}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="btn-salvar"
                >
                  Salvar agendamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

export default DashboardBarbeiro;
