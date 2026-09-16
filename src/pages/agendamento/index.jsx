import { useEffect, useMemo, useState } from 'react';
import './Agendamento.css';
import logoHope from '../../assets/logo-hope.png';

const barbeiros = [
  {
    id: 1,
    nome: 'João',
    especialidade: 'Cortes clássicos',
  },
  {
    id: 2,
    nome: 'Carlos',
    especialidade: 'Degradê e estilos modernos',
  },
  {
    id: 3,
    nome: 'Marcos',
    especialidade: 'Barba e acabamento',
  },
];

const servicos = [
  {
    id: 1,
    nome: 'Corte Masculino',
    duracao: 45,
    preco: 35,
  },
  {
    id: 2,
    nome: 'Barba',
    duracao: 30,
    preco: 25,
  },
  {
    id: 3,
    nome: 'Corte + Barba',
    duracao: 60,
    preco: 50,
  },
  {
    id: 4,
    nome: 'Degradê',
    duracao: 50,
    preco: 40,
  },
  {
    id: 5,
    nome: 'Sobrancelha',
    duracao: 15,
    preco: 15,
  },
];

const horariosBase = [
  '09:00',
  '09:30',
  '10:00',
  '10:30',
  '11:00',
  '11:30',
  '13:00',
  '13:30',
  '14:00',
  '14:30',
  '15:00',
  '15:30',
  '16:00',
  '16:30',
  '17:00',
  '17:30',
  '18:00',
  '18:30',
];

const STORAGE_KEY = 'hope-barbearia-agendamento';

function formatarData(data) {
  if (!data) return '';

  const [ano, mes, dia] = data.split('-');

  return `${dia}/${mes}/${ano}`;
}

function criarDataLocal(data) {
  const [ano, mes, dia] = data.split('-').map(Number);

  return new Date(ano, mes - 1, dia);
}

function dataParaString(data) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');

  return `${ano}-${mes}-${dia}`;
}

function gerarCalendario(mesAtual) {
  const ano = mesAtual.getFullYear();
  const mes = mesAtual.getMonth();

  const primeiroDia = new Date(ano, mes, 1);
  const ultimoDia = new Date(ano, mes + 1, 0);

  const diasNoMes = ultimoDia.getDate();

  // Converte domingo = 0 para segunda = 0
  const primeiroDiaSemana = (primeiroDia.getDay() + 6) % 7;

  const dias = [];

  for (let i = 0; i < primeiroDiaSemana; i++) {
    dias.push(null);
  }

  for (let dia = 1; dia <= diasNoMes; dia++) {
    dias.push(new Date(ano, mes, dia));
  }

  return dias;
}

function AppAgendamento() {
  const hoje = new Date();

  const [mesAtual, setMesAtual] = useState(
    new Date(hoje.getFullYear(), hoje.getMonth(), 1)
  );

  const [dataSelecionada, setDataSelecionada] = useState(
    dataParaString(hoje)
  );

  const [barbeiroSelecionado, setBarbeiroSelecionado] = useState(null);
  const [servicoSelecionado, setServicoSelecionado] = useState(null);
  const [horarioSelecionado, setHorarioSelecionado] = useState(null);

  const [fotoUsuario, setFotoUsuario] = useState(
    localStorage.getItem('hope-foto-usuario') || null
  );

  const [menuUsuario, setMenuUsuario] = useState(false);

  const [agendamento, setAgendamento] = useState(null);

  const [modalConfirmacao, setModalConfirmacao] = useState(false);
  const [modalCancelamento, setModalCancelamento] = useState(false);

  const [modoReagendamento, setModoReagendamento] = useState(false);

  const diasCalendario = useMemo(
    () => gerarCalendario(mesAtual),
    [mesAtual]
  );

  const nomeMes = mesAtual.toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  });

  const servicoAtual = servicos.find(
    (servico) => servico.id === servicoSelecionado
  );

  const barbeiroAtual = barbeiros.find(
    (barbeiro) => barbeiro.id === barbeiroSelecionado
  );

  /*
   * Carrega o último agendamento salvo.
   */
  useEffect(() => {
    const agendamentoSalvo = localStorage.getItem(STORAGE_KEY);

    if (agendamentoSalvo) {
      try {
        setAgendamento(JSON.parse(agendamentoSalvo));
      } catch (error) {
        console.error('Erro ao carregar agendamento:', error);
      }
    }
  }, []);

  /*
   * Simula horários ocupados.
   *
   * Quando existir backend, esta parte poderá ser substituída
   * por uma consulta ao banco de dados.
   */
  const horariosOcupados = useMemo(() => {
    if (!dataSelecionada || !barbeiroSelecionado) {
      return [];
    }

    const dia = criarDataLocal(dataSelecionada).getDate();

    const ocupados = [];

    if (barbeiroSelecionado === 1) {
      if (dia % 2 === 0) {
        ocupados.push('10:00', '14:00', '17:00');
      } else {
        ocupados.push('09:30', '15:30');
      }
    }

    if (barbeiroSelecionado === 2) {
      if (dia % 2 === 0) {
        ocupados.push('09:00', '11:30', '16:00');
      } else {
        ocupados.push('10:30', '14:30', '18:00');
      }
    }

    if (barbeiroSelecionado === 3) {
      if (dia % 2 === 0) {
        ocupados.push('09:30', '13:30', '17:30');
      } else {
        ocupados.push('11:00', '15:00');
      }
    }

    /*
     * Se o horário pertence ao agendamento salvo,
     * ele continua disponível durante o reagendamento.
     */
    if (
      agendamento &&
      agendamento.data === dataSelecionada &&
      agendamento.barbeiroId === barbeiroSelecionado
    ) {
      const index = ocupados.indexOf(agendamento.horario);

      if (index !== -1) {
        ocupados.splice(index, 1);
      }
    }

    return ocupados;
  }, [
    dataSelecionada,
    barbeiroSelecionado,
    agendamento,
  ]);

  function selecionarFotoUsuario(event) {
  const arquivo = event.target.files[0];

  if (!arquivo) return;

  // Verifica se é realmente uma imagem
  if (!arquivo.type.startsWith('image/')) {
    alert('Escolha uma imagem válida.');
    return;
  }

  const leitor = new FileReader();

  leitor.onload = () => {
    const imagem = leitor.result;

    setFotoUsuario(imagem);
    localStorage.setItem('hope-foto-usuario', imagem);
  };

  leitor.readAsDataURL(arquivo);
}

  function selecionarData(data) {
    const dataString = dataParaString(data);

    setDataSelecionada(dataString);
    setHorarioSelecionado(null);
  }

  function mesAnterior() {
    setMesAtual(
      new Date(
        mesAtual.getFullYear(),
        mesAtual.getMonth() - 1,
        1
      )
    );
  }

  function proximoMes() {
    setMesAtual(
      new Date(
        mesAtual.getFullYear(),
        mesAtual.getMonth() + 1,
        1
      )
    );
  }

  function selecionarBarbeiro(id) {
    setBarbeiroSelecionado(id);
    setHorarioSelecionado(null);
  }

  function selecionarServico(id) {
    setServicoSelecionado(id);
    setHorarioSelecionado(null);
  }

  function selecionarHorario(horario) {
    if (horariosOcupados.includes(horario)) {
      return;
    }

    setHorarioSelecionado(horario);
  }

  function abrirConfirmacao() {
    if (
      !dataSelecionada ||
      !barbeiroSelecionado ||
      !servicoSelecionado ||
      !horarioSelecionado
    ) {
      return;
    }

    setModalConfirmacao(true);
  }

  function confirmarAgendamento() {
    const novoAgendamento = {
      id: Date.now(),
      data: dataSelecionada,
      horario: horarioSelecionado,
      barbeiroId: barbeiroAtual.id,
      barbeiroNome: barbeiroAtual.nome,
      servicoId: servicoAtual.id,
      servicoNome: servicoAtual.nome,
      preco: servicoAtual.preco,
      duracao: servicoAtual.duracao,
    };

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(novoAgendamento)
    );

    setAgendamento(novoAgendamento);

    setModalConfirmacao(false);

    setModoReagendamento(false);

    limparFormulario();

    alert(
      modoReagendamento
        ? 'Agendamento reagendado com sucesso!'
        : 'Agendamento confirmado com sucesso!'
    );
  }

  function iniciarReagendamento() {
    if (!agendamento) return;

    setModoReagendamento(true);

    setDataSelecionada(agendamento.data);
    setBarbeiroSelecionado(agendamento.barbeiroId);
    setServicoSelecionado(agendamento.servicoId);
    setHorarioSelecionado(agendamento.horario);

    const data = criarDataLocal(agendamento.data);

    setMesAtual(
      new Date(
        data.getFullYear(),
        data.getMonth(),
        1
      )
    );

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }

  function abrirCancelamento() {
    setModalCancelamento(true);
  }

  function confirmarCancelamento() {
    localStorage.removeItem(STORAGE_KEY);

    setAgendamento(null);

    setModalCancelamento(false);

    limparFormulario();

    alert('Agendamento cancelado com sucesso!');
  }

  function limparFormulario() {
    setDataSelecionada(dataParaString(hoje));
    setBarbeiroSelecionado(null);
    setServicoSelecionado(null);
    setHorarioSelecionado(null);
    setModoReagendamento(false);

    setMesAtual(
      new Date(
        hoje.getFullYear(),
        hoje.getMonth(),
        1
      )
    );
  }

  const formularioCompleto =
    dataSelecionada &&
    barbeiroSelecionado &&
    servicoSelecionado &&
    horarioSelecionado;

  return (
    <main className="agendamento-page">
      {/* HEADER */}
      <header className="agendamento-header">
        <div className="header-logo">
          <img src={logoHope}
               alt="Hope Barbearia"
          />
        </div>

        <div className="header-title">
          <h1>Agendamento</h1>
          <p>
            {modoReagendamento
              ? 'Reagende seu atendimento'
              : 'Agende seu próximo atendimento'}
          </p>
        </div>

        <div className="header-user">

  {/* Input da foto */}
  <input
    type="file"
    id="fotoUsuario"
    accept="image/*"
    onChange={selecionarFotoUsuario}
    className="input-foto"
  />

  {/* Área clicável do usuário */}
  <button
    className="user-button"
    onClick={() => setMenuUsuario(!menuUsuario)}
  >
    <label
      htmlFor="fotoUsuario"
      className="user-avatar"
      onClick={(event) => event.stopPropagation()}
      title="Alterar foto"
    >
      {fotoUsuario ? (
        <img
          src={fotoUsuario}
          alt="Foto do usuário"
        />
      ) : (
        <span>B</span>
      )}
    </label>

    <div className="user-info">
      <strong>Barbeiro</strong>
      <span>Minha conta</span>
    </div>

    <span className="user-arrow">
      {menuUsuario ? '⌃' : '⌄'}
    </span>
  </button>

  {/* MENU */}
  {menuUsuario && (
    <div className="user-menu">

      <label
        htmlFor="fotoUsuario"
        className="menu-item"
        onClick={() => setMenuUsuario(false)}
      >
        📷
        <span>Alterar foto</span>
      </label>

      <button
        className="menu-item"
        onClick={() => {
          setMenuUsuario(false);
          alert('Área de perfil em desenvolvimento.');
        }}
      >
        👤
        <span>Meu perfil</span>
      </button>

      <div className="menu-divider"></div>

      <button
        className="menu-item menu-sair"
        onClick={() => {
          setMenuUsuario(false);
          alert('Saindo da conta...');
        }}
      >
        🚪
        <span>Sair</span>
      </button>

    </div>
  )}

</div>
      </header>

      {/* CONTEÚDO */}
      <section className="agendamento-content">
        <div className="page-heading">
          <div>
            <span className="heading-label">
              {modoReagendamento
                ? 'REAGENDAMENTO'
                : 'NOVO AGENDAMENTO'}
            </span>

            <h2>
              {modoReagendamento
                ? 'Escolha uma nova data e horário'
                : 'Agende seu atendimento'}
            </h2>

            <p>
              Escolha o dia, barbeiro, serviço e horário
              que deseja.
            </p>
          </div>

          {modoReagendamento && (
            <button
              className="btn-cancelar-modo"
              onClick={limparFormulario}
            >
              Cancelar reagendamento
            </button>
          )}
        </div>

        <div className="agendamento-grid">
          {/* COLUNA PRINCIPAL */}
          <div className="agendamento-main">
            {/* CALENDÁRIO */}
            <section className="card">
              <div className="card-title">
                <div className="step-number">1</div>

                <div>
                  <h3>Escolha a data</h3>
                  <p>Selecione o melhor dia para você.</p>
                </div>
              </div>

              <div className="calendar">
                <div className="calendar-header">
                  <button
                    className="month-button"
                    onClick={mesAnterior}
                    aria-label="Mês anterior"
                  >
                    ‹
                  </button>

                  <h4>
                    {nomeMes.charAt(0).toUpperCase() +
                      nomeMes.slice(1)}
                  </h4>

                  <button
                    className="month-button"
                    onClick={proximoMes}
                    aria-label="Próximo mês"
                  >
                    ›
                  </button>
                </div>

                <div className="week-days">
                  <span>SEG</span>
                  <span>TER</span>
                  <span>QUA</span>
                  <span>QUI</span>
                  <span>SEX</span>
                  <span>SÁB</span>
                  <span>DOM</span>
                </div>

                <div className="calendar-days">
                  {diasCalendario.map((dia, index) => {
                    if (!dia) {
                      return (
                        <div
                          key={`vazio-${index}`}
                          className="calendar-empty"
                        />
                      );
                    }

                    const dataString =
                      dataParaString(dia);

                    const selecionado =
                      dataSelecionada === dataString;

                    const hojeString =
                      dataParaString(hoje);

                    const passado =
                      dataString < hojeString;

                    const domingo =
                      dia.getDay() === 0;

                    const desabilitado =
                      passado || domingo;

                    return (
                      <button
                        key={dataString}
                        className={`calendar-day ${
                          selecionado ? 'selected' : ''
                        } ${
                          desabilitado
                            ? 'disabled'
                            : ''
                        }`}
                        disabled={desabilitado}
                        onClick={() =>
                          selecionarData(dia)
                        }
                      >
                        {dia.getDate()}
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* BARBEIROS */}
            <section className="card">
              <div className="card-title">
                <div className="step-number">2</div>

                <div>
                  <h3>Escolha o barbeiro</h3>
                  <p>Selecione seu profissional.</p>
                </div>
              </div>

              <div className="barbeiros-grid">
                {barbeiros.map((barbeiro) => (
                  <button
                    key={barbeiro.id}
                    className={`barbeiro-card ${
                      barbeiroSelecionado ===
                      barbeiro.id
                        ? 'selected'
                        : ''
                    }`}
                    onClick={() =>
                      selecionarBarbeiro(
                        barbeiro.id
                      )
                    }
                  >
                    <div className="barbeiro-avatar">
                      {barbeiro.nome.charAt(0)}
                    </div>

                    <div className="barbeiro-info">
                      <strong>{barbeiro.nome}</strong>
                      <span>
                        {barbeiro.especialidade}
                      </span>
                    </div>

                    {barbeiroSelecionado ===
                      barbeiro.id && (
                      <div className="check">
                        ✓
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </section>

            {/* SERVIÇOS */}
            <section className="card">
              <div className="card-title">
                <div className="step-number">3</div>

                <div>
                  <h3>Escolha o serviço</h3>
                  <p>Selecione o serviço desejado.</p>
                </div>
              </div>

              <div className="servicos-grid">
                {servicos.map((servico) => (
                  <button
                    key={servico.id}
                    className={`servico-card ${
                      servicoSelecionado ===
                      servico.id
                        ? 'selected'
                        : ''
                    }`}
                    onClick={() =>
                      selecionarServico(
                        servico.id
                      )
                    }
                  >
                    <div className="servico-top">
                      <strong>{servico.nome}</strong>

                      {servicoSelecionado ===
                        servico.id && (
                        <span className="check">
                          ✓
                        </span>
                      )}
                    </div>

                    <div className="servico-bottom">
                      <span>
                        {servico.duracao} min
                      </span>

                      <strong>
                        R${' '}
                        {servico.preco.toFixed(2)}
                      </strong>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {/* HORÁRIOS */}
            <section className="card">
              <div className="card-title">
                <div className="step-number">4</div>

                <div>
                  <h3>Horários disponíveis</h3>
                  <p>
                    {barbeiroSelecionado
                      ? 'Selecione um horário disponível.'
                      : 'Primeiro escolha um barbeiro.'}
                  </p>
                </div>
              </div>

              {!barbeiroSelecionado ? (
                <div className="empty-message">
                  <span>💈</span>
                  <p>
                    Escolha um barbeiro para visualizar
                    os horários.
                  </p>
                </div>
              ) : (
                <>
                  <div className="horarios-grid">
                    {horariosBase.map((horario) => {
                      const ocupado =
                        horariosOcupados.includes(
                          horario
                        );

                      return (
                        <button
                          key={horario}
                          disabled={ocupado}
                          className={`horario-button ${
                            horarioSelecionado ===
                            horario
                              ? 'selected'
                              : ''
                          } ${
                            ocupado ? 'occupied' : ''
                          }`}
                          onClick={() =>
                            selecionarHorario(
                              horario
                            )
                          }
                        >
                          {horario}

                          {ocupado && (
                            <small>
                              Ocupado
                            </small>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="horario-legenda">
                    <span>
                      <i className="legend available" />
                      Disponível
                    </span>

                    <span>
                      <i className="legend selected" />
                      Selecionado
                    </span>

                    <span>
                      <i className="legend occupied" />
                      Ocupado
                    </span>
                  </div>
                </>
              )}
            </section>
          </div>

          {/* SIDEBAR */}
          <aside className="agendamento-sidebar">
            <section className="summary-card">
              <div className="summary-header">
                <div>
                  <span>RESUMO</span>
                  <h3>Seu agendamento</h3>
                </div>

                <div className="summary-icon">
                  ✓
                </div>
              </div>

              <div className="summary-content">
                <div className="summary-item">
                  <span className="summary-icon-small">
                    📅
                  </span>

                  <div>
                    <small>Data</small>
                    <strong>
                      {dataSelecionada
                        ? formatarData(
                            dataSelecionada
                          )
                        : 'Não selecionada'}
                    </strong>
                  </div>
                </div>

                <div className="summary-item">
                  <span className="summary-icon-small">
                    💈
                  </span>

                  <div>
                    <small>Barbeiro</small>
                    <strong>
                      {barbeiroAtual
                        ? barbeiroAtual.nome
                        : 'Não selecionado'}
                    </strong>
                  </div>
                </div>

                <div className="summary-item">
                  <span className="summary-icon-small">
                    ✂
                  </span>

                  <div>
                    <small>Serviço</small>
                    <strong>
                      {servicoAtual
                        ? servicoAtual.nome
                        : 'Não selecionado'}
                    </strong>
                  </div>
                </div>

                <div className="summary-item">
                  <span className="summary-icon-small">
                    🕐
                  </span>

                  <div>
                    <small>Horário</small>
                    <strong>
                      {horarioSelecionado ||
                        'Não selecionado'}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="summary-price">
                <span>Total</span>

                <strong>
                  R${' '}
                  {servicoAtual
                    ? servicoAtual.preco.toFixed(2)
                    : '0,00'}
                </strong>
              </div>

              <button
                className="btn-confirmar"
                disabled={!formularioCompleto}
                onClick={abrirConfirmacao}
              >
                {modoReagendamento
                  ? 'Reagendar atendimento'
                  : 'Confirmar agendamento'}
              </button>

              {!formularioCompleto && (
                <p className="summary-warning">
                  Complete todas as etapas para
                  continuar.
                </p>
              )}
            </section>

            {/* PRÓXIMO AGENDAMENTO */}
            {agendamento && (
              <section className="next-appointment">
                <div className="next-header">
                  <div>
                    <span>PRÓXIMO ATENDIMENTO</span>
                    <h3>Agendamento confirmado</h3>
                  </div>

                  <div className="confirmed-badge">
                    ✓
                  </div>
                </div>

                <div className="appointment-date">
                  <strong>
                    {formatarData(
                      agendamento.data
                    )}
                  </strong>

                  <span>
                    às {agendamento.horario}
                  </span>
                </div>

                <div className="appointment-details">
                  <div>
                    <span>Barbeiro</span>
                    <strong>
                      {agendamento.barbeiroNome}
                    </strong>
                  </div>

                  <div>
                    <span>Serviço</span>
                    <strong>
                      {agendamento.servicoNome}
                    </strong>
                  </div>

                  <div>
                    <span>Valor</span>
                    <strong>
                      R${' '}
                      {agendamento.preco.toFixed(
                        2
                      )}
                    </strong>
                  </div>
                </div>

                <div className="appointment-actions">
                  <button
                    className="btn-reagendar"
                    onClick={iniciarReagendamento}
                  >
                    ↻ Reagendar
                  </button>

                  <button
                    className="btn-cancelar"
                    onClick={abrirCancelamento}
                  >
                    Cancelar
                  </button>
                </div>
              </section>
            )}
          </aside>
        </div>
      </section>

      {/* MODAL DE CONFIRMAÇÃO */}
      {modalConfirmacao && (
        <div
          className="modal-overlay"
          onClick={() =>
            setModalConfirmacao(false)
          }
        >
          <div
            className="modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <button
              className="modal-close"
              onClick={() =>
                setModalConfirmacao(false)
              }
            >
              ×
            </button>

            <div className="modal-icon success">
              ✓
            </div>

            <h3>
              {modoReagendamento
                ? 'Confirmar reagendamento?'
                : 'Confirmar agendamento?'}
            </h3>

            <p>
              Confira os detalhes antes de confirmar.
            </p>

            <div className="modal-details">
              <div>
                <span>Data</span>
                <strong>
                  {formatarData(
                    dataSelecionada
                  )}
                </strong>
              </div>

              <div>
                <span>Horário</span>
                <strong>
                  {horarioSelecionado}
                </strong>
              </div>

              <div>
                <span>Barbeiro</span>
                <strong>
                  {barbeiroAtual?.nome}
                </strong>
              </div>

              <div>
                <span>Serviço</span>
                <strong>
                  {servicoAtual?.nome}
                </strong>
              </div>

              <div>
                <span>Valor</span>
                <strong>
                  R${' '}
                  {servicoAtual?.preco.toFixed(
                    2
                  )}
                </strong>
              </div>
            </div>

            <div className="modal-actions">
              <button
                className="modal-secondary"
                onClick={() =>
                  setModalConfirmacao(false)
                }
              >
                Voltar
              </button>

              <button
                className="modal-primary"
                onClick={confirmarAgendamento}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CANCELAMENTO */}
      {modalCancelamento && (
        <div
          className="modal-overlay"
          onClick={() =>
            setModalCancelamento(false)
          }
        >
          <div
            className="modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <button
              className="modal-close"
              onClick={() =>
                setModalCancelamento(false)
              }
            >
              ×
            </button>

            <div className="modal-icon danger">
              !
            </div>

            <h3>Cancelar agendamento?</h3>

            <p>
              Tem certeza que deseja cancelar este
              atendimento?
            </p>

            {agendamento && (
              <div className="cancel-info">
                <strong>
                  {formatarData(
                    agendamento.data
                  )}{' '}
                  às {agendamento.horario}
                </strong>

                <span>
                  {agendamento.servicoNome} com{' '}
                  {agendamento.barbeiroNome}
                </span>
              </div>
            )}

            <div className="modal-actions">
              <button
                className="modal-secondary"
                onClick={() =>
                  setModalCancelamento(false)
                }
              >
                Voltar
              </button>

              <button
                className="modal-danger"
                onClick={confirmarCancelamento}
              >
                Sim, cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default AppAgendamento;